import pg from 'pg';
import session from 'express-session';
import { databaseConfig } from './config.js';

pg.types.setTypeParser(1700, value => Number(value));
const config = databaseConfig();
let database = config ? new pg.Pool(config) : null;
database?.on('error', () => console.error('PostgreSQL pool connection interrupted. Check your database connection.'));
export function useDatabase(adapter) { database = adapter; }
export function getDatabase() {
  if (!database) { const error = new Error('Add your Supabase PostgreSQL connection string to DATABASE_URL in .env, then run npm run db:setup.'); error.status = 503; error.code = 'DB_NOT_CONFIGURED'; throw error; }
  return database;
}
export const rows = async (sql, values = [], executor = getDatabase()) => (await executor.query(sql, values)).rows;
export const one = async (sql, values = [], executor = getDatabase()) => (await rows(sql, values, executor))[0];
export async function transaction(work) {
  const db = getDatabase();
  if (typeof db.transaction === 'function') return db.transaction(work);
  const connection = await db.connect();
  try { await connection.query('BEGIN'); const result = await work(connection); await connection.query('COMMIT'); return result; }
  catch (error) { await connection.query('ROLLBACK'); throw error; }
  finally { connection.release(); }
}
export class PostgreSQLSessionStore extends session.Store {
  get(sid, callback) {
    one('SELECT data FROM pasor_kita.sessions WHERE sid=$1 AND expires>$2', [sid, Date.now()])
      .then(record => callback(null, record ? record.data : null)).catch(callback);
  }
  set(sid, value, callback = () => {}) {
    const expires = value.cookie.expires ? new Date(value.cookie.expires).getTime() : Date.now() + 86400000;
    rows('INSERT INTO pasor_kita.sessions (sid,data,expires) VALUES ($1,$2,$3) ON CONFLICT (sid) DO UPDATE SET data=EXCLUDED.data,expires=EXCLUDED.expires', [sid, JSON.stringify(value), expires]).then(() => callback()).catch(callback);
  }
  destroy(sid, callback = () => {}) { rows('DELETE FROM pasor_kita.sessions WHERE sid=$1', [sid]).then(() => callback()).catch(callback); }
  touch(sid, value, callback = () => {}) { rows('UPDATE pasor_kita.sessions SET expires=$1 WHERE sid=$2', [new Date(value.cookie.expires).getTime(), sid]).then(() => callback()).catch(callback); }
}
