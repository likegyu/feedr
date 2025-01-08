// ~/app/lib/db.tsx
import { Pool, QueryResult } from 'pg';

// 토큰 데이터 구조에 맞는 타입 정의
type Token = {
  access_token: string;
  expires_at: string;  // ISO 8601 문자열로 처리
  refresh_token: string;
  refresh_token_expires_at: string;  // ISO 8601 문자열로 처리
  client_id: string;
  mall_id: string;
  user_id: string;
  scopes: string;  // JSON 문자열로 처리
  issued_at: string;  // ISO 8601 문자열로 처리
};

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// params를 구체화하고 반환값에 대해 타입을 지정
export const db = {
  query: async (text: string, params?: (string | number | boolean)[]): Promise<QueryResult<Token>> => {
    return pool.query(text, params);
  },
};
