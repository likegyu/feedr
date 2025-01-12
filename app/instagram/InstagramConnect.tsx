'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Ban, UserRoundCheck } from "lucide-react"

interface InstagramStatus {
  isConnected: boolean;
  userName?: string;
}

const InstagramConnect = () => {
  const [status, setStatus] = useState<InstagramStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [instagramAuthUrl, setInstagramAuthUrl] = useState<string>('');

  const checkInstagramStatus = useCallback(async () => {
    try {
      const response = await fetch(`/api/auth/instagram/status`);
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Instagram 상태 확인 중 오류:', error);
      setError('Instagram 상태 확인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  const disconnectInstagram = async () => {
    try {
      setError(null);
      setLoading(true);
      const response = await fetch(`/api/auth/instagram/disconnect`, {
        method: 'POST'
      });
      const data = await response.json();
      if (response.ok) {
        await checkInstagramStatus();
      } else {
        setError(data.error || 'Instagram 연동 해제에 실패했습니다.');
        console.error('연동 해제 실패:', data);
      }
    } catch (error) {
      setError('Instagram 연동 해제 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      console.error('Instagram 연동 해제 중 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchAuthUrl = async () => {
      try {
        const response = await fetch('/api/auth/instagram/get-auth-url');
        const data = await response.json();
        setInstagramAuthUrl(data.url);
      } catch (error) {
        console.error('Failed to fetch Instagram auth URL:', error);
        setError('Instagram 인증 URL을 가져오는데 실패했습니다.');
      }
    };

    fetchAuthUrl();
  }, []);

  useEffect(() => {
    checkInstagramStatus();
  }, [checkInstagramStatus]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Instagram 연동</h2>
      <Card>
        <CardContent className="p-6">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription><Ban /> {error}</AlertDescription>
            </Alert>
          )}
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          ) : status?.isConnected ? (
            <div>
              <Alert variant="success" className="mb-4">
                <AlertDescription>
                  <p><UserRoundCheck />Instagram 계정이 연동되었습니다.</p>
                  <p className="text-sm mt-2">
                    연동된 계정 ID:{' '}
                    <a
                      href={`https://instagram.com/${status.userName}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-black hover:text-slate-400"
                    >
                      {status.userName}
                    </a>
                  </p>
                </AlertDescription>
              </Alert>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => checkInstagramStatus()}
                >
                  상태 새로고침
                </Button>
                <Button
                  variant="destructive"
                  onClick={disconnectInstagram}
                >
                  연동 해제
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="mb-4">Instagram 계정을 연동하여 쇼핑몰에 Instagram 피드를 자동으로 게시하세요.</p>
              <Button
                asChild
                variant="default"
              >
                <a href={instagramAuthUrl}>
                  Instagram 계정 연동하기
                </a>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InstagramConnect;
