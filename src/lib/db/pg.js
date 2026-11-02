import { Pool } from 'pg';
import {
  PG_HOST,
  PG_PORT,
  PG_DATABASE,
  PG_USER,
  PG_PASSWORD,
  NODE_ENV,
} from './secret.js';

let pgPoolInstance = null;

export function getDbPool() {
  if (!pgPoolInstance) {
    pgPoolInstance = new Pool({
      host: PG_HOST,
      port: PG_PORT ? Number(PG_PORT) : 5432,
      database: PG_DATABASE,
      user: PG_USER,
      password: PG_PASSWORD,
      ssl:
        NODE_ENV === 'production' ||
        process.env.PG_SSL === 'true' ||
        (typeof PG_HOST === 'string' && PG_HOST.includes('supabase'))
          ? { rejectUnauthorized: false }
          : false,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  }
  return pgPoolInstance;
}

export async function queryDb(text, params = []) {
  const p = getDbPool();
  try {
    const res = await p.query(text, params);
    return res;
  } catch (err) {
    if (err.message && err.message.includes('(ENOTFOUND) tenant/user')) {
      console.error(
        '\n[DATABASE FATAL] Supabase project is paused or inactive in your Supabase dashboard.\n' +
        'Please go to https://supabase.com/dashboard and unpause / restore your database project.\n'
      );
    } else {
      console.error('Database query error:', err.message || err);
    }
    throw err;
  }
}

export const query = queryDb;

export const pool = new Proxy(
  {},
  {
    get(target, prop) {
      const p = getDbPool();
      const val = p[prop];
      return typeof val === 'function' ? val.bind(p) : val;
    },
  }
);

export default pool;
