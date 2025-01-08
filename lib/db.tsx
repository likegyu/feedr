import { Pool, QueryResult } from 'pg';

// 토큰 데이터 구조에 맞는 타입 정의
type Token = {
  access_token: string;
  expires_at: number;
  refresh_token: string;
  refresh_token_expires_at: number;
  client_id: string;
  mall_id: string;
  user_id: string;
  scopes: string;
  issued_at: number;
};

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// `db.query` 반환 값에 대해 구체적인 타입 지정
export const db = {
  query: async (text: string, params?: any[]): Promise<QueryResult<Token>> => pool.query(text, params),
};
