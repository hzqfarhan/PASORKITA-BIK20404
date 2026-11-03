import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';

export const root = fileURLToPath(new URL('../', import.meta.url));
export function databaseConfig() {
  const input = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
  if (!input || input.includes('YOUR_ENCODED_PASSWORD') || input.includes('PROJECT_REF')) return null;
  const url = new URL(input);
  if (!['postgres:', 'postgresql:'].includes(url.protocol)) throw new Error('DATABASE_URL must be a PostgreSQL connection string.');
  for (const option of ['sslmode', 'sslcert', 'sslkey', 'sslrootcert']) url.searchParams.delete(option);
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  const ssl = local ? false : { rejectUnauthorized: true,
    ...(process.env.DATABASE_CA_CERT ? { ca: readFileSync(path.resolve(root, process.env.DATABASE_CA_CERT), 'utf8') } : {}),
  };
  return { connectionString: url.toString(), ssl, max: 6, connectionTimeoutMillis: 10000, idleTimeoutMillis: 30000 };
}
export async function sessionSecret() {
  if (process.env.SESSION_SECRET?.length >= 32 && !process.env.SESSION_SECRET.startsWith('replace-with-')) return process.env.SESSION_SECRET;
  if (process.env.NODE_ENV === 'production') throw new Error('Set SESSION_SECRET to at least 32 random characters.');
  const local = path.join(root, '.local');
  await mkdir(local, { recursive: true });
  const filename = path.join(local, 'session-secret');
  try { await writeFile(filename, randomBytes(48).toString('hex'), { flag: 'wx', mode: 0o600 }); }
  catch (error) { if (error.code !== 'EEXIST') throw error; }
  return readFile(filename, 'utf8');
}
