'use client';
import { useState, useEffect, useRef } from 'react';
import { differenceInSeconds } from 'date-fns';
import { useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function Home() {
  const [mallId, setMallId] = useState<string>('');
  const [showError, setShowError] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    // 에러 파라미터 체크
    const searchParams = new URLSearchParams(window.location.search);
    const error = searchParams.get('error');
    if (error) {
      setShowError(true);
      return;
    }

    // 토큰 만료 시간 체크
    const checkTokenExpiration = async () => {
      try {
        const response = await fetch('/api/auth/cafe24/token-expires-check');
        if (response.ok) {
          const { data } = await response.json();
          const diffInSeconds = differenceInSeconds(
            new Date(data.cafe24ExpiresAt),
            new Date()
          );

          if (diffInSeconds > 0) {
            router.push('/dashboard');
          }
        }
      } catch (error) {
        console.error('Failed to check token expiration:', error);
      }
    };

    checkTokenExpiration();
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mallId) {
      window.location.href = `/api/auth/cafe24/access?mall_id=${mallId}`;
    }
  };

  return (
    <div className="fixed flex flex-col items-center justify-center w-dvw h-dvh gap-12">
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
      <Dialog open={showError} onOpenChange={setShowError}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>로그인 실패</DialogTitle>
            <DialogDescription>
              인증에 실패했습니다. 다시 시도해주세요.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowError(false)}>확인</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
