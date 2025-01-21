'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Ban, UserRoundCheck, Info, Loader, CircleAlert } from "lucide-react"
import { useAuthDialog } from "@/components/auth-dialog-provider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CodeBlock } from "@/components/ui/code-block"

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

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('클립보드에 복사되었습니다.');
    }).catch(err => {
      console.error('복사 실패:', err);
    });
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

  return (
    <div className="max-w-screen-xl mx-auto p-4 space-y-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Instagram 연동</h2>
      <Card>
        <CardContent className="p-6 sm:p-8">
          {showTokenAlert && (
            <Alert className="mb-6 bg-blue-50 border-blue-200">
              <AlertDescription className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-blue-500" />
                  <span>카페24 로그인이 필요합니다. 다시 로그인해 주세요.</span>
                </div>
                <Button onClick={onOpen} variant="default" className="bg-blue-500 hover:bg-blue-600">
                  로그인
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription className="flex items-center gap-2">
                <Ban className="h-5 w-5" />
                {error}
              </AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-6 w-[300px]" />
              <Skeleton className="h-6 w-[250px]" />
            </div>
          ) : status?.isConnected ? (
            <div className="space-y-6">
              <Alert variant="success" className="bg-green-50 border-green-200">
                <AlertDescription>
                  <div className="flex items-center gap-2 mb-3">
                    <UserRoundCheck className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-700">Instagram 계정이 연동되었습니다.</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    연동된 계정 ID:{' '}
                    <a
                      href={`https://instagram.com/${status.userName}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      {status.userName}
                    </a>
                  </p>
                </AlertDescription>
              </Alert>
              <Button
                variant="destructive"
                onClick={disconnectInstagram}
                className="w-full sm:w-auto hover:bg-red-600 transition-colors"
              >
                연동 해제
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Alert className="bg-gradient-to-r from-[#fdf5e6] to-[#fef1f6] border-[#fbcac9]">
              <AlertDescription className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                <Info className="h-5 w-5 text-[#fbcac9]" />
                <span>Instagram 계정을 연동하여 쇼핑몰에 피드를 자동으로 게시할 수 있습니다.</span>
                </div>
                <Button
                variant="default"
                asChild
                disabled={showTokenAlert}
                className={`bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCB045] hover:brightness-110 text-white font-bold transition-all ${
                  showTokenAlert ? 'opacity-50' : ''
                }`}
                >
                <a href={instagramAuthUrl} className={showTokenAlert ? 'pointer-events-none' : ''}>
                  Instagram 연동하기
                </a>
                </Button>
              </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>

      {status?.isConnected && (
        <Card>
          <CardContent className="p-6 sm:p-8">
            <h3 className="text-xl font-semibold mb-6 text-gray-800">Instagram 피드 배포</h3>
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  배포 방식
                </label>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Select
                    value={tempDeployType}
                    onValueChange={(value: 'auto' | 'manual') => setTempDeployType(value)}
                    disabled={isUpdatingType}
                  >
                    <SelectTrigger className="w-full sm:w-[350px] bg-white">
                      <SelectValue placeholder="배포 방식 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">자동 배포</SelectItem>
                      <SelectItem value="manual">수동 배포</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {tempDeployType !== status.insertType && (
                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        onClick={() => updateInsertType(tempDeployType)}
                        disabled={isUpdatingType}
                        className="flex-1 bg-green-600 hover:bg-green-700 transition-colors"
                      >
                        {isUpdatingType ? "변경 중..." : "변경 적용"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setTempDeployType(status.insertType || 'auto')}
                        disabled={isUpdatingType}
                        className="flex-1"
                      >
                        취소
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {status.hasScriptTag && (
                <Alert className="bg-yellow-50 border-yellow-200">
                  <AlertDescription className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <span className="text-sm text-yellow-700">현재 배포된 스크립트가 있습니다.</span>
                    <Button
                      variant="outline"
                      className="w-full sm:w-auto border-yellow-200 text-yellow-700 hover:bg-yellow-100"
                      onClick={removeScriptTag}
                      disabled={isDeploying}
                    >
                      {isDeploying ? "제거 중..." : "스크립트 제거"}
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              {!status.hasScriptTag && (
                <Button
                  variant="default"
                  onClick={deployInstagramFeed}
                  disabled={isDeploying || !canDeployFeed()}
                  className={`w-full sm:w-auto bg-blue-600 hover:bg-blue-700 transition-colors ${
                    isDeploying ? 'opacity-50' : ''
                  }`}
                >
                  {isDeploying ? (
                    <div className="flex items-center gap-2">
                      <Loader className="h-4 w-4 animate-spin" />
                      배포 중...
                    </div>
                  ) : (
                    "피드 배포하기"
                  )}
                </Button>
              )}

              {status.insertType === 'auto' ? (
                <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-md">
                  자동 배포를 선택하면 쇼핑몰 메인의 footer 요소 상단에 자동으로 피드가 표시됩니다.
                  {status.hasScriptTag && (
                    <span className="text-green-600 font-medium ml-2">
                      (현재 배포됨)
                    </span>
                  )}
                </p>
              ) : (
                <div className="space-y-4">
                    <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-md">
                    수동 배포의 경우 스크립트 배포 이후 아래 코드를 원하는 위치에 직접 삽입하세요.
                    <strong className="mt-2 text-red-600 block">
                      <CircleAlert className="inline-block"/> 스크립트는 제거하지 마세요. 스크립트를 제거하면 피드가 동작하지 않습니다.
                    </strong>
                    </p>
                    <CodeBlock
                      code={manualCode}
                      language="bash"
                      filePath="auth-example.sh"
                      onCopy={() => handleCopy(manualCode)}
                    />
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
