'use client';
import { useState } from 'react';

export default function Home() {
  const [mallId, setMallId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mallId) {
      window.location.href = `/api/auth/cafe24/access?mall_id=${mallId}`;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 items-center">
        <input
          type="text"
          value={mallId}
          onChange={(e) => setMallId(e.target.value)}
          placeholder="Mall ID를 입력하세요"
          className="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#2C2C2C]"
          required
        />
        <button
          type="submit"
          className="px-8 py-3 text-white bg-[#2C2C2C] rounded hover:bg-[#444444] transition-colors"
        >
          카페24 로그인
        </button>
      </form>
    </div>
  );
}
