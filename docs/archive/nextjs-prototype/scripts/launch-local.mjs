import { spawn } from 'node:child_process';
import { stat, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const origin = 'http://127.0.0.1:4173';
process.chdir(projectRoot);

async function running() {
  try {
    const response = await fetch(origin, { signal: AbortSignal.timeout(1200) });
    const text = await response.text();
    return { ready: response.ok && text.includes('PASOR') && text.includes('/_next/'), occupied: true };
  } catch { return { ready: false, occupied: false }; }
}
async function latestSource(folder) {
  try {
    const entries = await readdir(folder, { withFileTypes: true });
    const dates = await Promise.all(entries.map(async entry => {
      const full = path.join(folder, entry.name);
      return entry.isDirectory() ? latestSource(full) : (await stat(full)).mtimeMs;
    }));
    return Math.max(0, ...dates);
  } catch { return 0; }
}
function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: projectRoot, stdio: 'inherit', windowsHide: true });
    child.on('error', reject);
    child.on('exit', code => code === 0 ? resolve() : reject(new Error(`Preparation exited with code ${code}.`)));
  });
}
try {
  const current = await running();
  if (current.occupied && !current.ready) throw new Error('Another preview is using port 4173. Close the older preview and try again.');
  if (!current.ready) {
    let buildTime = 0;
    try { buildTime = (await stat('.next/BUILD_ID')).mtimeMs; } catch {}
    const sourceTime = Math.max(...await Promise.all(['app','components','dist','scripts'].map(latestSource)));
    if (!buildTime || sourceTime > buildTime) {
      console.log('Preparing your Next.js marketplace. This may take a moment…');
      await run(process.execPath, ['scripts/prepare-next.mjs']);
      await run(process.execPath, ['node_modules/next/dist/bin/next', 'build']);
    }
    const server = spawn(process.execPath, ['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','4173'], { cwd: projectRoot, detached: true, stdio: 'ignore', windowsHide: true });
    server.unref();
    let ready = false;
    for (let attempt = 0; attempt < 80; attempt++) {
      if ((await running()).ready) { ready = true; break; }
      await new Promise(resolve => setTimeout(resolve, 250));
    }
    if (!ready) throw new Error('The local preview could not start. Try npm run start from this folder.');
  }
  console.log(`PASOR is ready at ${origin}`);
  // This launcher is run by the user to open the local application.
  const browser = spawn('powershell.exe', ['-NoProfile','-Command',`Start-Process '${origin}'`], { stdio:'ignore',windowsHide:true });
  browser.unref();
} catch (error) { console.error(error.message); process.exitCode = 1; }
