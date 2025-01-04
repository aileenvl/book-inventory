import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import dotenv from 'dotenv';

dotenv.config();

export const sql = process.env.POSTGRES_URL ? neon(process.env.POSTGRES_URL) : null;
export const db = sql ? drizzle(sql) : null;
