import { spawn } from 'node:child_process';
import { access, open, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
process.chdir(projectRoot);
try{process.loadEnvFile?.();}catch(error){if(error.code!=='ENOENT')throw error;}
const port=Number(process.env.PORT || 4173);
if(!Number.isInteger(port)||port<1||port>65535)throw new Error('PORT must be a valid local port.');
const origin = `http://127.0.0.1:${port}`;

async function running() {
  try {
    const response = await fetch(origin+'/health', { signal: AbortSignal.timeout(1200) });
    const body = await response.json().catch(()=>({}));
    return { ready:body.application==='pasor-kita-express',databaseReady:body.status==='ok',occupied:true };
  } catch { return { ready: false, occupied: false }; }
}
try {
  await access(new URL('../node_modules/express/package.json',import.meta.url)).catch(()=>{throw new Error('Run npm install in this project before opening Pasor Kita.');});
  const current = await running();
  if (current.occupied && !current.ready) throw new Error(`Another application is using port ${port}. Close it or change PORT in .env.`);
  if (!current.ready) {
    await mkdir(new URL('../.local/',import.meta.url),{recursive:true});
    const log=await open(new URL('../.local/server.log',import.meta.url),'a');
    const server = spawn(process.execPath, ['--env-file-if-exists=.env','server/index.js'], { cwd: projectRoot, detached: true, stdio: ['ignore',log.fd,log.fd], windowsHide: true });
    server.unref();
    await log.close();
    let ready = false;
    for (let attempt = 0; attempt < 80; attempt++) {
      if ((await running()).ready) { ready = true; break; }
      await new Promise(resolve => setTimeout(resolve, 250));
    }
    if (!ready) throw new Error('Pasor Kita could not start. Run npm start to see the problem.');
  }
  const status=await running();
  console.log(`Pasor Kita is ready at ${origin}`);
  if(!status.databaseReady)console.log('Add DATABASE_URL to .env and run npm run db:setup to connect Supabase.');
  // This launcher is run by the user to open the local application.
  const browser = spawn('powershell.exe', ['-NoProfile','-Command',`Start-Process '${origin}'`], { stdio:'ignore',windowsHide:true });
  browser.unref();
} catch (error) { console.error(error.message); process.exitCode = 1; }
