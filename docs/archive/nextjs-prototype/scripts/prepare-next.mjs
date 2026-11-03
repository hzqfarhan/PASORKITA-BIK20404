import { cp, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { deflateSync } from 'node:zlib';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const publicDir = join(root, 'public');
const html = await readFile(join(dist, 'index.html'), 'utf8');
const body = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1];
if (!body || /<script\b/i.test(body)) throw new Error('Expected trusted local HTML body without inline scripts in dist/index.html.');
const cssFiles = [...html.matchAll(/<link\b[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+\.css)["'][^>]*>/gi)].map((match) => match[1].replace(/^\.\//, '').replace(/^\//, ''));
if (!cssFiles.length || cssFiles.some((name) => !/^[a-z0-9-]+\.css$/i.test(name))) throw new Error('The marketplace stylesheet list must contain local CSS filenames only.');
await mkdir(publicDir, { recursive: true });
await mkdir(join(root, 'components'), { recursive: true });
const distFiles = await readdir(dist, { withFileTypes: true });
for (const entry of distFiles) {
  if (entry.isFile() && (entry.name.endsWith('.css') || entry.name === 'app.js')) await cp(join(dist, entry.name), join(publicDir, entry.name));
}
await cp(join(dist, 'assets'), join(publicDir, 'assets'), { recursive: true });
const trustedBody = body.trim().replace(/\b(src|href)=(['"])(assets\/[^'"]+)\2/g, '$1=$2/$3$2');
await writeFile(join(root, 'components', 'marketplace-markup.json'), JSON.stringify({ html: trustedBody, styles: cssFiles.map((name) => `/${name}`) }, null, 2) + '\n');

// Small code-drawn logo PNGs keep this build free of image-processing dependencies.
const crcTable = Array.from({ length: 256 }, (_, value) => {
  let crc = value;
  for (let bit = 0; bit < 8; bit++) crc = crc & 1 ? 0xedb88320 ^ crc >>> 1 : crc >>> 1;
  return crc >>> 0;
});
function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = crcTable[(crc ^ byte) & 0xff] ^ crc >>> 8;
  return (crc ^ 0xffffffff) >>> 0;
}
function pngChunk(type, bytes) {
  const label = Buffer.from(type);
  const buffer = Buffer.alloc(bytes.length + 12);
  buffer.writeUInt32BE(bytes.length, 0); label.copy(buffer, 4); bytes.copy(buffer, 8);
  buffer.writeUInt32BE(crc32(Buffer.concat([label, bytes])), bytes.length + 8);
  return buffer;
}
function logoPixel(x, y, maskable) {
  if (!maskable) {
    const centerX = x < .22 ? .22 : x > .78 ? .78 : x;
    const centerY = y < .22 ? .22 : y > .78 ? .78 : y;
    if ((x - centerX) ** 2 + (y - centerY) ** 2 > .22 ** 2) return [0, 0, 0, 0];
  }
  const blend = Math.max(0, Math.min(1, x * .3 + y * .7));
  const background = [Math.round(153 - blend * 54), Math.round(68 - blend * 34), Math.round(91 - blend * 37), 255];
  const inP = (px, py) => {
    const stem = px > .325 && px < .435 && py > .318 && py < .752;
    const bowl = ((px - .49) / .174) ** 2 + ((py - .426) / .172) ** 2 < 1;
    const hole = ((px - .49) / .073) ** 2 + ((py - .426) / .073) ** 2 < 1;
    return (stem || bowl) && !hole;
  };
  if (inP(x, y)) return [255, Math.round(246 - y * 12), Math.round(224 - y * 16), 255];
  if (inP(x - .012, y - .014)) return [83, 28, 47, 255];
  if ((x - .674) ** 2 + (y - .705) ** 2 < .035 ** 2) return [220, 188, 132, 255];
  return background;
}
function makeLogo(size, maskable = false) {
  const bytes = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const totals = [0, 0, 0, 0];
      for (let sy = 0; sy < 2; sy++) for (let sx = 0; sx < 2; sx++) {
        const sample = logoPixel((x + (sx + .5) / 2) / size, (y + (sy + .5) / 2) / size, maskable);
        sample.forEach((value, channel) => { totals[channel] += value; });
      }
      totals.forEach((value, channel) => { bytes[y * (size * 4 + 1) + 1 + x * 4 + channel] = Math.round(value / 4); });
    }
  }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), pngChunk('IHDR', ihdr), pngChunk('IDAT', deflateSync(bytes)), pngChunk('IEND', Buffer.alloc(0))]);
}
await mkdir(join(publicDir, 'icons'), { recursive: true });
for (const [filename, size, maskable] of [['icon-192.png', 192, false], ['icon-512.png', 512, false], ['icon-maskable-512.png', 512, true], ['apple-touch-icon.png', 180, true]]) await writeFile(join(publicDir, 'icons', filename), makeLogo(size, maskable));

async function publicFiles(directory, prefix = '') {
  const output = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const relative = `${prefix}${entry.name}`;
    if (entry.isDirectory()) output.push(...await publicFiles(join(directory, entry.name), `${relative}/`));
    else if (/\.(?:css|js|jpg|jpeg|png|svg|webp|woff2|webmanifest)$/i.test(entry.name) && entry.name !== 'sw.js') output.push(`/${relative}`);
  }
  return output.sort();
}
const precache = ['/', '/offline.html', ...await publicFiles(publicDir)];
let worker = await readFile(join(publicDir, 'sw.js'), 'utf8');
worker = worker.replace(/const PRECACHE_URLS = \[[\s\S]*?\];/, `const PRECACHE_URLS = ${JSON.stringify(precache, null, 2)};`);
const hash = createHash('sha256').update(trustedBody).update(worker.replace(/const BUILD_VERSION = '[^']+';/, "const BUILD_VERSION = '0';"));
for (const filename of ['app/layout.jsx', 'app/page.jsx', 'components/PwaControls.jsx', 'next.config.mjs']) hash.update(await readFile(join(root, filename)));
for (const url of precache) {
  if (url !== '/') hash.update(url).update(await readFile(join(publicDir, url.slice(1))));
}
const buildVersion = hash.digest('hex').slice(0, 12);
worker = worker.replace(/const BUILD_VERSION = '[^']+';/, `const BUILD_VERSION = '${buildVersion}';`);
await writeFile(join(publicDir, 'sw.js'), worker);
console.log(`Prepared Next.js marketplace: ${cssFiles.length} stylesheets, ${precache.length} offline resources, revision ${buildVersion}.`);
