import { Pool } from 'pg';
import {
  PG_HOST,
  PG_PORT,
  PG_DATABASE,
  PG_USER,
  PG_PASSWORD,
  NODE_ENV,
} from './secret.js';

let pool = null;

export function getDbPool() {
  if (!pool) {
    pool = new Pool({
      host: PG_HOST,
      port: PG_PORT ? Number(PG_PORT) : 5432,
      database: PG_DATABASE,
      user: PG_USER,
      password: PG_PASSWORD,
      ssl: NODE_ENV === 'production' || process.env.PG_SSL === 'true'
        ? { rejectUnauthorized: false }
        : false,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  }
  return pool;
}

export async function queryDb(text, params = []) {
  const p = getDbPool();
  const start = Date.now();
  try {
    const res = await p.query(text, params);
    const duration = Date.now() - start;
    if (NODE_ENV === 'development') {
      console.log('Executed query', { text: text.slice(0, 80), duration, rows: res.rowCount });
    }
    return res;
  } catch (err) {
    console.error('Database query error:', err);
    throw err;
  }
}
