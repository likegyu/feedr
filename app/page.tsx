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
    <div className="flex flex-col items-center justify-center min-h-screen gap-12 bg-[rgb(17,24,39)] text-white">
      <div className="w-96 h-32 rounded-xl mb-8 flex items-center justify-center">
        <h1 className="text-4xl font-medium tracking-normal">
          Feedr
        </h1>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 items-center">
        <input
          type="text"
          value={mallId}
          onChange={(e) => setMallId(e.target.value)}
          placeholder="Mall ID를 입력하세요"
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E60FF] focus:border-[#1E60FF] w-64 shadow-sm bg-gray-800 border-gray-700 text-white placeholder-gray-400"
          required
        />
        <button
          type="submit"
          className="px-8 py-3 text-white bg-[#1E60FF] rounded-lg hover:bg-[#1850D2] transition-colors w-64 font-medium shadow-sm"
        >
          카페24 로그인
        </button>
      </form>
    </div>
  );
}
