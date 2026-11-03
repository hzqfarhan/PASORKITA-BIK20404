import { createApp } from './app.js';
import { getDatabase, rows } from './db.js';

const app = await createApp();
const server=app.listen(Number(process.env.PORT || 4173),process.env.HOST || '127.0.0.1',()=>console.log(`Pasor Kita: http://${process.env.HOST || '127.0.0.1'}:${process.env.PORT || 4173}`));
const sessionCleanup=setInterval(()=>rows('DELETE FROM pasor_kita.sessions WHERE expires<$1',[Date.now()]).catch(()=>{}),6*60*60*1000);
sessionCleanup.unref();
async function shutdown(){clearInterval(sessionCleanup);await new Promise(resolve=>server.close(resolve));try{await getDatabase().end();}catch{}process.exit(0);}
process.on('SIGINT',shutdown);process.on('SIGTERM',shutdown);
