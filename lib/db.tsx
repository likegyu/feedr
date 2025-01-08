import { Pool, QueryResult } from 'pg';

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, 
  },
});

// `db.query` 반환 값에 대해 구체적인 타입 지정
export const db = {
  query: async (text: string, params?: any[]): Promise<QueryResult<any>> => pool.query(text, params),
};
