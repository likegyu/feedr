import { Pool } from 'pg';

// ✅ Neon Database 연결 설정
const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // SSL 인증서 검증 비활성화
  },
});

// ✅ DB 쿼리 실행 함수
export const db = {
  query: (text: string, params?: any[]) => pool.query(text, params),
};
