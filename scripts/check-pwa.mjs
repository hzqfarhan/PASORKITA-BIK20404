import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Script } from 'node:vm';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = join(root, 'public');
const manifest = JSON.parse(await readFile(join(publicDir, 'manifest.webmanifest'), 'utf8'));
assert.equal(manifest.id, '/'); assert.equal(manifest.start_url, '/'); assert.equal(manifest.scope, '/'); assert.equal(manifest.display, 'standalone');
assert.ok(manifest.icons.some((icon) => icon.sizes === '192x192'));
assert.ok(manifest.icons.some((icon) => icon.sizes === '512x512'));
assert.ok(manifest.icons.some((icon) => icon.purpose === 'maskable'));
for (const icon of manifest.icons) {
  const bytes = await readFile(join(publicDir, icon.src.slice(1)));
  assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  assert.equal(`${bytes.readUInt32BE(16)}x${bytes.readUInt32BE(20)}`, icon.sizes, `PNG dimensions for ${icon.src}`);
}
const worker = await readFile(join(publicDir, 'sw.js'), 'utf8');
new Script(worker, { filename: 'sw.js' });
assert.match(worker, /const BUILD_VERSION = '[a-f0-9]{12}';/);
const precache = JSON.parse(worker.match(/const PRECACHE_URLS = (\[[\s\S]*?\]);/)?.[1] || '[]');
assert.ok(precache.includes('/')); assert.ok(precache.includes('/offline.html')); assert.ok(precache.includes('/app.js'));
for (const url of precache) if (url !== '/') assert.ok((await readFile(join(publicDir, url.slice(1)))).length, `Precache asset ${url}`);
const markup = JSON.parse(await readFile(join(root, 'components', 'marketplace-markup.json'), 'utf8'));
assert.ok(markup.html.includes('id="product-grid"')); assert.ok(!/<script\b|<html\b|<body\b/i.test(markup.html));
for (const href of markup.styles) assert.ok(precache.includes(href), `Stylesheet available offline: ${href}`);
const currentApp = await readFile(join(root, 'dist', 'app.js'));
assert.ok(currentApp.equals(await readFile(join(publicDir, 'app.js'))), 'Next.js public app.js must match the current marketplace source');

if (process.argv[2]) {
  const base = new URL(process.argv[2]);
  assert.ok(['http:', 'https:'].includes(base.protocol));
  for (const pathname of ['/', '/manifest.webmanifest', '/sw.js', '/offline.html', '/app.js', ...markup.styles]) {
    const response = await fetch(new URL(pathname, base));
    assert.equal(response.status, 200, `HTTP ${pathname}`);
    if (pathname === '/sw.js') { assert.match(response.headers.get('content-type'), /javascript/); assert.match(response.headers.get('cache-control'), /no-cache/); }
    if (pathname === '/') assert.match(await response.text(), /\/_next\/static\//, 'Dashboard is served by Next.js');
  }
}
console.log(`PWA checks passed: install manifest, PNG icon dimensions, ${precache.length} offline resources, current marketplace assets${process.argv[2] ? ', and live Next.js HTTP routes' : ''}.`);
