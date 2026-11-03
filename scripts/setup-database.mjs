import { readFile } from 'node:fs/promises';
import { getDatabase } from '../server/db.js';
import { seedDatabase } from '../server/seed.js';

let db,client;
try{
  db=getDatabase();
  client=await db.connect();
  await client.query('BEGIN');
  await client.query(await readFile(new URL('../database/schema.sql',import.meta.url),'utf8'));
  await client.query('COMMIT');
  if(process.env.SEED_PASSWORD && process.env.SEED_PASSWORD!=='replace-with-a-strong-demo-password') {
    await client.query('BEGIN');
    await seedDatabase(client,{password:process.env.SEED_PASSWORD,adminEmail:process.env.SEED_ADMIN_EMAIL || 'admin@uthm.edu.my'});
    await client.query('COMMIT');
    console.log('Pasor Kita schema and sample catalogue are ready. Seed credentials stay in your .env file.');
  }else console.log('Pasor Kita schema is ready. Set SEED_PASSWORD and run again to add the sample catalogue and administrator.');
}catch(error){
  if(client)await client.query('ROLLBACK').catch(()=>{});
  console.error(error.code==='DB_NOT_CONFIGURED'?error.message:`Database setup failed (${error.code || error.name}). Check DATABASE_URL, TLS configuration and schema permissions. No credentials are printed.`);
  process.exitCode=1;
}finally{client?.release();await db?.end();}
