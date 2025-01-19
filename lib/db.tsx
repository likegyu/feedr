// ~/app/lib/db.tsx
import { Pool, QueryResult } from 'pg';

//토큰 데이터 구조에 맞는 타입 정의
type Token = {
  cafe24_access_token: string;
  cafe24_expires_at: string;  // ISO 8601 문자열로 처리
  cafe24_refresh_token: string;
  cafe24_refresh_token_expires_at: string;  // ISO 8601 문자열로 처리
  cafe24_client_id: string;
  cafe24_mall_id: string;
  cafe24_user_id: string;
  cafe24_scopes: string;  // JSON 문자열로 처리
  cafe24_shop_name: string;  
  cafe24_issued_at: string;  // ISO 8601 문자열로 처리
  instagram_access_token?: string;
  instagram_user_id?: string;
  instagram_expires_in?: number; // UNIX timestamp로 저장
  instagram_username?: string;
  feed_filter?: string;
  pc_feed_settings?: string;    // JSON 문자열로 저장, optional
  mobile_feed_settings?: string; // JSON 문자열로 저장, optional
  instagram_issued_at?: number; // UNIX timestamp로 저장
  script_tag_no?: number;
  insert_type: 'auto' | 'manual';
};

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
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
