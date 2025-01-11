'use client';
import { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [mallId, setMallId] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mallId) {
      window.location.href = `/api/auth/cafe24/access?mall_id=${mallId}`;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-12">
      <div className="w-96 h-32 rounded-xl mb-8 flex items-center justify-center">
        <h1 className="text-4xl font-medium tracking-normal">
          Feedr
        </h1>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 items-center">
        <Input
          ref={inputRef}
          type="text"
          value={mallId}
          onChange={(e) => setMallId(e.target.value)}
          placeholder="카페24 ID를 입력하세요"
          className="w-64"
          required
        />
        <Button
          type="submit"
          className="w-64"
        >
          카페24 로그인
        </Button>
      </form>
    </div>
  );
}
