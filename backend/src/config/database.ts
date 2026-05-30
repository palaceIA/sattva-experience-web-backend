import { Pool, PoolClient } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/sattva_experience'
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

export default pool;
