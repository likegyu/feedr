'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Ban, UserRoundCheck, Info, Copy } from "lucide-react"
import { useAuthDialog } from "@/components/auth-dialog-provider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"

interface InstagramStatus {
  isConnected: boolean;
  userName?: string;
  hasScriptTag?: boolean;
  insertType?: 'auto' | 'manual';  // 추가
}

const InstagramConnect = () => {
  const { onOpen } = useAuthDialog();
  const [status, setStatus] = useState<InstagramStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [instagramAuthUrl, setInstagramAuthUrl] = useState<string>('');
  const [showTokenAlert, setShowTokenAlert] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployType, setDeployType] = useState<'auto' | 'manual'>('auto');
  const [copied, setCopied] = useState(false);
  const [isUpdatingType, setIsUpdatingType] = useState(false);
  const [tempDeployType, setTempDeployType] = useState<'auto' | 'manual'>('auto');

  useEffect(() => {
    // 초기 deployType 설정
    setTempDeployType(deployType);
  }, [deployType]);

  useEffect(() => {
    // status가 변경될 때마다 deployType과 tempDeployType을 DB 값과 동기화
    if (status?.insertType) {
      setDeployType(status.insertType);
      setTempDeployType(status.insertType);
    }
  }, [status]);

  const manualCode = `<div id="feedr-instagram-feed"></div>`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(manualCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('복사 실패:', err);
    }
  };

  const checkTokenExpiration = async () => {
    try {
      const response = await fetch('/api/auth/cafe24/token-expires-check');
      const data = await response.json();
      
      if (!data?.data?.cafe24ExpiresAt || new Date(data.data.cafe24ExpiresAt) <= new Date()) {
        setShowTokenAlert(true);
        return false;
      }
      return true;
    } catch (error) {
      console.error('토큰 만료 확인 실패:', error);
      setShowTokenAlert(true);
      return false;
    }
  };

  const checkInstagramStatus = useCallback(async () => {
    const isTokenValid = await checkTokenExpiration();
    if (!isTokenValid) {
      setLoading(false);
      return;
    }

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

  const deployInstagramFeed = async () => {
    try {
      setIsDeploying(true);
      setError(null);
      const response = await fetch('/api/cafe24-script/post', {
        method: 'POST'
      });
      
      if (response.ok) {
        await checkInstagramStatus();
      } else {
        const data = await response.json();
        setError(data.error || '인스타그램 피드 배포에 실패했습니다.');
      }
    } catch (error) {
      setError('인스타그램 피드 배포 중 오류가 발생했습니다.');
      console.error('인스타그램 피드 배포 중 오류:', error);
    } finally {
      setIsDeploying(false);
    }
  };

  // 배포 타입 변경 시 로직 개선
  const updateInsertType = async (newType: 'auto' | 'manual') => {
    try {
      setIsUpdatingType(true);
      setError(null);
      const response = await fetch('/api/cafe24-script/update-type', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ insertType: newType }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        // 자동 -> 수동으로 변경 시: 스크립트 상태 유지
        // 수동 -> 자동으로 변경 시: 스크립트 상태 false로 변경
        setStatus(prev => {
          if (!prev) return null;
          return {
            ...prev,
            insertType: newType,
            hasScriptTag: prev.hasScriptTag
          };
        });
        setDeployType(newType);
        setTempDeployType(newType);
      } else {
        throw new Error(data.error || '배포 방식 변경에 실패했습니다.');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : '배포 방식 변경 중 오류가 발생했습니다.');
      console.error('배포 방식 변경 중 오류:', error);
      setTempDeployType(deployType);
    } finally {
      setIsUpdatingType(false);
    }
  };

  const removeScriptTag = async () => {
    try {
      setIsDeploying(true);
      setError(null);
      const response = await fetch('/api/cafe24-script/remove', {
        method: 'POST'
      });
      
      if (response.ok) {
        await checkInstagramStatus();
      } else {
        const data = await response.json();
        setError(data.error || '스크립트 제거에 실패했습니다.');
      }
    } catch (error) {
      setError('스크립트 제거 중 오류가 발생했습니다.');
      console.error('스크립트 제거 중 오류:', error);
    } finally {
      setIsDeploying(false);
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

// 배포 버튼 활성화 조건 함수
const canDeployFeed = () => {
  if (!status?.isConnected) return false;
  if (isDeploying) return false;
  if (showTokenAlert) return false;
  return true;
};

// 피드 배포 버튼 텍스트
const getDeployButtonText = () => {
  if (isDeploying) return "배포 중...";
  return status?.hasScriptTag ? "다시 배포하기" : "피드 배포하기";
};

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Instagram 연동</h2>
      <Card>
        <CardContent className="p-6">
          {showTokenAlert && (
            <Alert className="mb-4">
              <AlertDescription className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                카페24 로그인이 필요합니다. 다시 로그인해 주세요.
                <Button onClick={onOpen} variant="default" size="sm" className="ml-1 h-7">
                로그인
                </Button>
              </AlertDescription>
            </Alert>
          )}
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
              <Button
                variant="destructive"
                onClick={disconnectInstagram}
              >
                연동 해제
              </Button>
            </div>
          ) : (
            <>
              <p className="mb-4">Instagram 계정을 연동하여 쇼핑몰에 Instagram 피드를 자동으로 게시하세요.</p>
              <Button
                asChild
                variant="default"
                disabled={showTokenAlert}
                className={showTokenAlert ? 'opacity-50 cursor-not-allowed' : ''}
              >
                <a 
                  href={instagramAuthUrl}
                  className={showTokenAlert ? 'pointer-events-none cursor-not-allowed' : ''}
                  onClick={(e) => showTokenAlert && e.preventDefault()}
                >
                  Instagram 계정 연동하기
                </a>
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* 수정된 피드 배포 카드 */}
      {status?.isConnected && (
        <Card className="w-full">
          <CardContent className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4">Instagram 피드 배포</h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium mb-1 sm:mb-2">
                  배포 방식
                </label>
                <Select
                  value={tempDeployType}
                  onValueChange={(value: 'auto' | 'manual') => setTempDeployType(value)}
                  disabled={isUpdatingType}
                >
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="배포 방식 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">자동 배포</SelectItem>
                    <SelectItem value="manual">수동 배포</SelectItem>
                  </SelectContent>
                </Select>
                {tempDeployType !== status.insertType && (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-2">
                    <Button
                      variant="default"
                      size="sm"
                      className="w-full sm:w-auto"
                      onClick={() => updateInsertType(tempDeployType)}
                      disabled={isUpdatingType}
                    >
                      {isUpdatingType ? "변경 중..." : "변경 적용"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto"
                      onClick={() => setTempDeployType(status.insertType || 'auto')}
                      disabled={isUpdatingType}
                    >
                      취소
                    </Button>
                  </div>
                )}
              </div>

              {/* 공통 영역: 스크립트 제거 버튼 */}
              {status.hasScriptTag && (
                <Alert>
                  <AlertDescription className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <span className="text-xs sm:text-sm">현재 배포된 스크립트가 있습니다.</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto"
                      onClick={removeScriptTag}
                      disabled={isDeploying}
                    >
                      {isDeploying ? "제거 중..." : "스크립트 제거"}
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              {/* 배포 버튼 */}
              <Button
                variant={status.hasScriptTag ? "secondary" : "default"}
                onClick={deployInstagramFeed}
                disabled={!canDeployFeed()}
                className="w-full sm:w-auto"
              >
                {getDeployButtonText()}
              </Button>

              {status.insertType === 'auto' ? (
                <p className="text-xs sm:text-sm text-gray-500">
                  자동 배포를 선택하면 쇼핑몰 메인 페이지 하단에 Instagram 피드가 자동으로 삽입됩니다.
                  {status.hasScriptTag && (
                    <span className="text-green-600 ml-2">
                      (현재 배포됨)
                    </span>
                  )}
                </p>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  <p className="text-xs sm:text-sm text-gray-500">
                    수동 배포의 경우 배포 이후 아래 코드를 원하는 위치에 직접 삽입하세요.
                  </p>
                  <div className="relative">
                    <ScrollArea className="h-[100px] w-full rounded-md border p-2 sm:p-4">
                      <pre className="text-xs sm:text-sm whitespace-pre-wrap break-all">
                        <code className="inline-block min-w-0 max-w-full">
                          {manualCode}
                        </code>
                      </pre>
                    </ScrollArea>
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2 z-10"
                      onClick={copyToClipboard}
                    >
                      <Copy className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      {copied ? "복사됨" : "복사"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InstagramConnect;
