'use client';

import React, { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import useEmblaCarousel from 'embla-carousel-react';
import { ImageIcon, PlayCircleIcon, Info } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { FeedSettings } from '@/types/settings';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuthDialog } from "@/components/auth-dialog-provider"

const MobileFeedSettings = () => {
  const { onOpen } = useAuthDialog();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isCafe24TokenValid, setIsCafe24TokenValid] = useState<boolean | null>(null);
  const [isInstagramConnected, setIsInstagramConnected] = useState<boolean | null>(null);
  const [initialSettings, setInitialSettings] = useState<FeedSettings | null>(null);
  const [mobileLayoutSettings, setMobileLayoutSettings] = useState<FeedSettings | null>(null);

  const [mobileEmblaRef] = useEmblaCarousel({
    align: 'center',
    containScroll: 'keepSnaps',
    dragFree: false,
    loop: true,
    skipSnaps: true,
    direction: 'ltr',
    inViewThreshold: 0.7,
  });

  // 인증 상태 확인
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Cafe24 토큰 만료 체크
        const tokenResponse = await fetch('/api/auth/cafe24/token-expires-check');
        const tokenData = await tokenResponse.json();
        const isTokenValid = tokenData?.data?.cafe24ExpiresAt 
          && new Date(tokenData.data.cafe24ExpiresAt) > new Date();
        setIsCafe24TokenValid(isTokenValid);

        // Instagram 연동 상태 체크
        const instaResponse = await fetch('/api/auth/instagram/status');
        const instaData = await instaResponse.json();
        setIsInstagramConnected(instaData.isConnected);
      } catch (error) {
        console.error('인증 상태 확인 중 오류:', error);
        setIsCafe24TokenValid(false);
        setIsInstagramConnected(false);
      }
    };

    checkAuthStatus();
  }, []);

  // 설정 로드 로직 수정
  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/settings/feed');
        if (!response.ok) {
          throw new Error('설정 로드에 실패했습니다');
        }

        const data = await response.json();
        console.log('서버 응답:', data); // 디버깅용

        let settings: FeedSettings;
        if (data.mobile_feed_settings) {
          settings = typeof data.mobile_feed_settings === 'string' 
            ? JSON.parse(data.mobile_feed_settings)
            : data.mobile_feed_settings;
        } else {
          settings = {
            layout: 'grid',
            columns: 2,
            rows: 3,
            gap: 8,
            borderRadius: 8,
            showMediaType: true,
          };
        }
        
        setInitialSettings(settings);
        setMobileLayoutSettings(settings);
      } catch (error) {
        console.error('설정 로드 중 오류:', error);
        toast({
          title: "설정 로드 실패",
          description: error instanceof Error ? error.message : "설정을 불러오는데 실패했습니다.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [toast]);

  const handleMobileSettingChange = (key: string, value: string | number | boolean) => {
    if (!mobileLayoutSettings) return;
    
    setMobileLayoutSettings(prev => ({
      ...prev!,
      [key]: value
    }));
  };

  // 설정 저장 로직 수정
  const handleSaveSettings = async () => {
    try {
      const response = await fetch('/api/settings/feed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'mobile',
          settings: mobileLayoutSettings,
        }),
      });

      if (!response.ok) throw new Error('설정 저장 실패');

      // Cafe24 스크립트 업데이트
      const scriptResponse = await fetch('/api/cafe24-script/put', {
        method: 'PUT',
      });
      
      if (!scriptResponse.ok) {
        console.error('Cafe24 스크립트 업데이트 실패');
      }
      

      toast({
        title: "설정이 저장되었습니다",
        description: "모바일 레이아웃 설정이 성공적으로 저장되었습니다.",
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다';
      console.error('설정 저장 오류:', errorMessage);
      toast({
        title: "오류가 발생했습니다",
        description: "설정 저장 중 문제가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

  // 설정 변경 여부 확인 함수
  const hasSettingsChanged = () => {
    if (!initialSettings || !mobileLayoutSettings) return false;
    return JSON.stringify(initialSettings) !== JSON.stringify(mobileLayoutSettings);
  };

  const renderMobilePreview = () => {
    // mobileLayoutSettings가 null인 경우 처리
    if (!mobileLayoutSettings) return null;

    const itemCount = mobileLayoutSettings.layout === 'carousel' 
      ? 9 
      : mobileLayoutSettings.columns * mobileLayoutSettings.rows;

    const previewItems = Array(itemCount).fill(0).map((_, i) => {
      const isVideo = i % 3 === 0; // 예시로 3번째마다 비디오로 설정

      return (
        <div
          key={i}
          className="relative overflow-hidden"
          style={{
            width: mobileLayoutSettings.layout === 'carousel' 
              ? `${100 / mobileLayoutSettings.columns}%` 
              : '100%',
            aspectRatio: '1 / 1',
            borderRadius: mobileLayoutSettings.borderRadius,
            backgroundColor: '#e5e7eb',
            flexShrink: 0,
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            모바일 예시 {i + 1}
          </div>
          {/* 미디어 타입 아이콘 */}
          {mobileLayoutSettings.showMediaType && (
            <div className="absolute top-2 right-2 rounded-full p-1">
              {isVideo ? (
                <PlayCircleIcon className="w-4 h-4 text-black" />
              ) : (
                <ImageIcon className="w-4 h-4 text-black" />
              )}
            </div>
          )}
        </div>
      );
    });

    const previewContent = mobileLayoutSettings.layout === 'carousel' ? (
      <div className="bg-white mt-10">
        <div 
          className="overflow-hidden will-change-transform" 
          ref={mobileEmblaRef}
          style={{
            WebkitBackfaceVisibility: 'hidden',
            WebkitPerspective: 1000,
            WebkitTransform: 'translate3d(0,0,0)',
          }}
        >
          <div 
            className="flex"
            style={{
              gap: `${mobileLayoutSettings.gap}px`,
              padding: `0 ${mobileLayoutSettings.gap}px`,
              transform: 'translate3d(0,0,0)',
              willChange: 'transform',
            }}
          >
            {previewItems}
          </div>
        </div>
      </div>
    ) : (
      <div
        className="bg-white"  // 스크롤을 위한 최소 높이 설정
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${mobileLayoutSettings.columns}, 1fr)`,
          gap: `${mobileLayoutSettings.gap}px`,
          padding: `${mobileLayoutSettings.gap}px`,
        }}
      >
        {previewItems}
      </div>
    );

    return (
      <div className="mb-8 lg:mb-0 bg-gray-50 p-4 lg:p-8 rounded-lg">
        <p className="text-sm text-gray-500 mb-4">
          {mobileLayoutSettings.layout === 'carousel' 
            ? '👉 옆으로 스크롤하여 더 많은 이미지를 확인해보세요' 
            : '👉 화면의 가로 길이가 768px 이하가 되면 피드가 모바일 레이아웃으로 보여요'
          }
        </p>
        <div className="flex justify-center">
          <div className="relative w-[240px] lg:w-[320px] h-[480px] lg:h-[640px] bg-black rounded-[3rem] p-4 shadow-xl">
            {/* 노치 디자인 */}
            <div className="absolute w-[80px] lg:w-[120px] h-[20px] lg:h-[30px] top-2 left-1/2 transform -translate-x-1/2 bg-black rounded-b-3xl flex items-center justify-center z-20"></div>
            {/* 모바일 스크린 */}
            <div className="w-full h-full bg-white rounded-[2rem] overflow-hidden">
              {/* 상태바 */}
              <div className="h-10 bg-white border-b flex items-center justify-between px-4 sticky top-0 z-10">
                <div className="text-xs text-gray-500">9:41</div>
                <div className="flex items-center space-x-2">
                  <div className="text-xs text-gray-500">모바일 예시</div>
                </div>
              </div>
              {/* 콘텐츠 영역 */}
              <ScrollArea className="h-[calc(100%-2.5rem)] overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
                {/* 배너 영역 */}
                <div className="relative h-32 bg-gradient-to-r from-purple-600 to-blue-600">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <h3 className="text-white text-xl font-bold">Your Mall</h3>
                      <p className="text-white/80 text-sm">모바일 접속 시 예시입니다</p>
                    </div>
                  </div>
                </div>
                {previewContent}
              </ScrollArea>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const PreviewSkeleton = () => (
    <div className="mb-8 lg:mb-0 bg-gray-50 p-4 lg:p-8 rounded-lg">
      <Skeleton className="h-4 w-3/4 mb-4" />
      <div className="flex justify-center">
        <Skeleton className="w-[240px] lg:w-[320px] h-[480px] lg:h-[640px] rounded-[3rem]" />
      </div>
    </div>
  );

  const SettingsSkeleton = () => (
    <div className="bg-white p-6 rounded-lg shadow space-y-6">
      {Array(5).fill(0).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  );

  // Preview 및 설정 UI 렌더링 조건부 처리
  if (isLoading) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-4">모바일 레이아웃 설정</h2>
        <div className="xl:grid xl:grid-cols-2 xl:gap-8">
          <PreviewSkeleton />
          <SettingsSkeleton />
        </div>
      </div>
    );
  }

  if (!isCafe24TokenValid) {
    return (
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">모바일 레이아웃 설정</h2>
        <Card className="shadow-lg">
          <CardContent className="p-6 sm:p-8">
            <Alert className="bg-blue-50 border-blue-200">
              <AlertDescription className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-blue-500" />
                  <span>설정을 사용하기 위해서는 먼저 Cafe24에 로그인해주세요.</span>
                </div>
                <Button 
                  onClick={onOpen}
                  variant="default"
                  className="bg-blue-500 hover:bg-blue-600 transition-colors"
                >
                  로그인
                </Button>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!mobileLayoutSettings) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-4">모바일 레이아웃 설정</h2>
        <Card>
          <CardContent className='p-6 pt-6'>
            <Alert variant="destructive">
              <AlertDescription className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                설정을 불러오는 중에 문제가 발생했습니다. 새로고침 후 다시 시도해주세요.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isInstagramConnected) {
    return (
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">모바일 레이아웃 설정</h2>
        <Card className="shadow-lg">
          <CardContent className="p-6 sm:p-8">
            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertDescription className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-yellow-600" />
                  <span>Instagram 계정 연동이 필요합니다.</span>
                </div>
                <Button
                  variant="default"
                  className="bg-yellow-600 hover:bg-yellow-700 transition-colors"
                  asChild
                >
                  <a href="/instagram">연동하기</a>
                </Button>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">모바일 레이아웃 설정</h2>
      <div className="xl:grid xl:grid-cols-2 xl:gap-8">
        <div className="xl:sticky xl:top-4 space-y-6">
          <Card className="shadow-lg">
            <CardContent className="p-6 sm:p-8">
              {renderMobilePreview()}
            </CardContent>
          </Card>
        </div>
        
        <Card className="shadow-lg mt-6 xl:mt-0">
          <CardContent className="p-6 sm:p-8 space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="mobile-layout">레이아웃 스타일</Label>
                <Select
                  value={mobileLayoutSettings.layout}
                  onValueChange={(value) => handleMobileSettingChange('layout', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="레이아웃 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grid">그리드</SelectItem>
                    <SelectItem value="carousel">캐러셀</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>컬럼 수</Label>
                <Slider
                  value={[mobileLayoutSettings.columns]}
                  min={1}
                  max={4}  // 모바일에 맞게 최대값 수정
                  step={1}
                  onValueChange={([value]) => handleMobileSettingChange('columns', value)}
                />
                <span className="text-sm text-gray-500">
                  {mobileLayoutSettings.columns}개
                </span>
              </div>

              {mobileLayoutSettings.layout === 'grid' && (
                <div>
                  <Label>로우 수</Label>
                  <Slider
                    value={[mobileLayoutSettings.rows]}
                    min={1}
                    max={4}
                    step={1}
                    onValueChange={([value]) => handleMobileSettingChange('rows', value)}
                  />
                  <span className="text-sm text-gray-500">
                    {mobileLayoutSettings.rows}줄
                  </span>
                </div>
              )}

              <div>
                <Label>이미지 간격</Label>
                <Slider
                  value={[mobileLayoutSettings.gap]}
                  min={0}
                  max={24}  // 모바일에 맞게 최대값 수정
                  step={2}
                  onValueChange={([value]) => handleMobileSettingChange('gap', value)}
                />
                <span className="text-sm text-gray-500">
                  {mobileLayoutSettings.gap}px
                </span>
              </div>

              <div>
                <Label>모서리 둥글기</Label>
                <Slider
                  value={[mobileLayoutSettings.borderRadius]}
                  min={0}
                  max={16}  // 모바일에 맞게 최대값 수정
                  step={2}
                  onValueChange={([value]) => handleMobileSettingChange('borderRadius', value)}
                />
                <span className="text-sm text-gray-500">
                  {mobileLayoutSettings.borderRadius}px
                </span>
              </div>

              {/* 미디어 타입 표시 설정 추가 */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>미디어 타입 표시</Label>
                  <div className="text-sm text-gray-500">
                    사진/영상 아이콘을 썸네일에 표시합니다
                  </div>
                </div>
                <Switch
                  checked={mobileLayoutSettings.showMediaType}
                  onCheckedChange={(checked) => 
                    handleMobileSettingChange('showMediaType', checked)
                  }
                />
              </div>
            </div>

            {/* 저장 버튼 수정 */}
            <div className="pt-4 border-t">
              <Button 
                className="w-full"
                onClick={handleSaveSettings}
                disabled={!isInstagramConnected || !hasSettingsChanged()}
              >
                {!isInstagramConnected 
                  ? "인스타그램 연동 필요"
                  : !hasSettingsChanged()
                  ? "변경사항 없음"
                  : "설정 저장하기"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <Toaster />
    </div>
  );
};

export default MobileFeedSettings;
