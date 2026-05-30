import { Pool, PoolClient } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    throw new Error('DATABASE_URL is required in .env. Configure your local Postgres or Supabase database connection string.');
}

const pool = new Pool({
    connectionString: databaseUrl
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
});

export const getClient = async (): Promise<PoolClient> => {
    return pool.connect();
};

export const query = async (text: string, params?: any[]) => {
    return pool.query(text, params);
};

export const testConnection = async () => {
    const client = await pool.connect();

    try {
        await client.query('SELECT 1');
    } finally {
        client.release();
    }
};

export default pool;
