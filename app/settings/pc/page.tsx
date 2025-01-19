'use client';

import React, { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import useEmblaCarousel from 'embla-carousel-react';
import { ImageIcon, SquarePlay, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { FeedSettings as FeedSettingsType } from '@/types/settings';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuthDialog } from "@/components/auth-dialog-provider"

const FeedSettings = () => {
  const { onOpen } = useAuthDialog();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isCafe24TokenValid, setIsCafe24TokenValid] = useState<boolean | null>(null);
  const [isInstagramConnected, setIsInstagramConnected] = useState<boolean | null>(null);
  const [initialSettings, setInitialSettings] = useState<FeedSettingsType | null>(null);
  const [layoutSettings, setLayoutSettings] = useState<FeedSettingsType | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [emblaRef] = useEmblaCarousel({
    align: 'center',
    containScroll: 'keepSnaps',
    dragFree: false,           // 스냅 효과를 위해 false로 설정
    loop: true,
    skipSnaps: true,         // 정확한 스냅 위치 유지
    direction: 'ltr',
    inViewThreshold: 0.7,    // 성능 최적화를 위한 임계값
  });

  // Instagram 연동 상태 확인
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

        // 두 인증이 모두 유효한 경우에만 설정 로드
        if (isTokenValid && instaData.isConnected) {
          const response = await fetch('/api/settings/feed');
          if (!response.ok) {
            throw new Error('설정 로드에 실패했습니다');
          }
          
          const data = await response.json();
          let settings: FeedSettingsType;
          if (data.pc_feed_settings) {
            settings = typeof data.pc_feed_settings === 'string' 
              ? JSON.parse(data.pc_feed_settings)
              : data.pc_feed_settings;
          } else {
            settings = {
              layout: 'grid',
              columns: 3,
              rows: 2,
              gap: 16,
              borderRadius: 8,
              showMediaType: true,
            };
          }
          
          setInitialSettings(settings);
          setLayoutSettings(settings);
        }
      } catch (error) {
        console.error('인증 상태 확인 중 오류:', error);
        toast({
          title: "설정 로드 실패",
          description: error instanceof Error ? error.message : "설정을 불러오는데 실패했습니다.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, [toast]);

  // 설정 변경 여부 확인 함수
  const hasSettingsChanged = () => {
    if (!initialSettings || !layoutSettings) return false;
    return JSON.stringify(initialSettings) !== JSON.stringify(layoutSettings);
  };

  const handleSettingChange = (key: string, value: string | number | boolean) => {
    if (!layoutSettings) return;
    
    setLayoutSettings(prev => ({
      ...prev!,
      [key]: value
    }));
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/settings/feed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'pc',
          settings: layoutSettings,
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

      // 저장 성공 시 초기 설정값 업데이트
      if (layoutSettings) {
        setInitialSettings({ ...layoutSettings });
      }

      toast({
        title: "설정이 저장되었습니다",
        description: "PC 레이아웃 설정이 성공적으로 저장되었습니다.",
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다';
      console.error('설정 저장 오류:', errorMessage);
      toast({
        title: "오류가 발생했습니다",
        description: "설정 저장 중 문제가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const renderPreview = () => {
    // layoutSettings가 null인 경우 처리
    if (!layoutSettings) return null;

    // 레이아웃에 따라 아이템 개수 계산
    const itemCount = layoutSettings.layout === 'carousel' 
      ? 9 
      : layoutSettings.columns * layoutSettings.rows;

    const previewItems = Array(itemCount).fill(0).map((_, i) => {
      const isVideo = i % 3 === 0; // 예시로 3번째마다 비디오로 설정

      return (
        <div
          key={i}
          className="relative overflow-hidden"
          style={{
            width: layoutSettings.layout === 'carousel' 
              ? `${100 / layoutSettings.columns}%` 
              : '100%',
            aspectRatio: '1 / 1',
            borderRadius: layoutSettings.borderRadius,
            backgroundColor: '#e5e7eb',
            flexShrink: 0,
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            예시 이미지 {i + 1}
          </div>
          {/* 미디어 타입 아이콘 */}
          {layoutSettings.showMediaType && (
            <div className="absolute top-2 right-2 rounded-full p-1">
              {isVideo ? (
                <SquarePlay className="w-4 h-4 text-white" />
              ) : (
                <ImageIcon className="w-4 h-4 text-white" />
              )}
            </div>
          )}
        </div>
      );
    });

    return (
      <div className="mb-8 bg-gray-50 p-4 rounded-lg">
        <p className="text-sm text-gray-500 mb-4">
          {layoutSettings.layout === 'carousel' 
            ? '👉 옆으로 스크롤하여 더 많은 이미지를 확인해보세요' 
            : '👉 화면의 가로 길이가 768px 이상이 되면 피드가 PC 레이아웃으로 보여요'
          }
        </p>
        {layoutSettings.layout === 'carousel' ? (
          <div className="bg-white rounded-lg p-4">
            <div 
              className="overflow-hidden will-change-transform" 
              ref={emblaRef}
              style={{
                WebkitBackfaceVisibility: 'hidden',
                WebkitPerspective: 1000,
                WebkitTransform: 'translate3d(0,0,0)',
              }}
            >
              <div 
                className="flex"
                style={{
                  gap: `${layoutSettings.gap}px`,
                  padding: `0 ${layoutSettings.gap}px`,
                  transform: 'translate3d(0,0,0)',  // 하드웨어 가속 활성화
                  willChange: 'transform',          // 변형 최적화
                }}
              >
                {previewItems}
              </div>
            </div>
          </div>
        ) : (
          <div
            className="bg-white rounded-lg p-4"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${layoutSettings.columns}, 1fr)`,
              gap: `${layoutSettings.gap}px`,
            }}
          >
            {previewItems}
          </div>
        )}
      </div>
    );
  };

  const PreviewSkeleton = () => (
    <div className="mb-8 bg-gray-50 p-4 rounded-lg">
      <Skeleton className="h-4 w-3/4 mb-4" />
      <div className="bg-white rounded-lg p-4">
        <div className="grid grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
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
        <h2 className="text-2xl font-bold mb-4">PC 레이아웃 설정</h2>
        <PreviewSkeleton />
        <SettingsSkeleton />
      </div>
    );
  }

  if (!isCafe24TokenValid) {
    return (
      <div className="max-w-screen-xl mx-auto p-4 space-y-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">PC 레이아웃 설정</h2>
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

  if (!isInstagramConnected) {
    return (
      <div className="max-w-screen-xl mx-auto p-4 space-y-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">PC 레이아웃 설정</h2>
        <Card className="shadow-lg">
          <CardContent className="p-6 sm:p-8">
            <Alert className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
              <AlertDescription className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-purple-600" />
                  <span className="text-purple-900">설정을 사용하기 위해서는 먼저 Instagram 계정을 연동해주세요.</span>
                </div>
                <Button
                  variant="default"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transition-all"
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

  if (!layoutSettings) {
    return (
      <div className="max-w-screen-xl mx-auto p-4 space-y-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">PC 레이아웃 설정</h2>
        <Card>
          <CardContent className='p-6 pt-6'>
            <Alert variant="destructive">
              <AlertDescription className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                설정을 불러오는데 실패했습니다. 페이지를 새로고침하거나 잠시 후 다시 시도해주세요.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto p-4 space-y-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">PC 레이아웃 설정</h2>
      <Card className="shadow-lg">
        <CardContent className="p-6 sm:p-8">
          {renderPreview()}
        </CardContent>
      </Card>
      <Card className="shadow-lg">
        <CardContent className="p-6 sm:p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <Label className="text-gray-700 mb-2">레이아웃 스타일</Label>
              <Select
                value={layoutSettings.layout}
                onValueChange={(value) => handleSettingChange('layout', value)}
              >
                <SelectTrigger className="w-full bg-white border-gray-200 hover:border-gray-300 transition-colors">
                  <SelectValue placeholder="레이아웃 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">그리드</SelectItem>
                  <SelectItem value="carousel">캐러셀</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-gray-700">컬럼 수</Label>
                <Slider
                  className="py-2"
                  value={[layoutSettings.columns]}
                  min={1}
                  max={6}
                  step={1}
                  onValueChange={([value]) => handleSettingChange('columns', value)}
                />
                <span className="text-sm text-gray-500">
                  {layoutSettings.columns}개
                </span>
              </div>

              {layoutSettings.layout === 'grid' && (
                <div className="space-y-2">
                  <Label className="text-gray-700">로우 수</Label>
                  <Slider
                    className="py-2"
                    value={[layoutSettings.rows]}
                    min={1}
                    max={4}
                    step={1}
                    onValueChange={([value]) => handleSettingChange('rows', value)}
                  />
                  <span className="text-sm text-gray-500">
                    {layoutSettings.rows}줄
                  </span>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-gray-700">이미지 간격</Label>
                <Slider
                  className="py-2"
                  value={[layoutSettings.gap]}
                  min={0}
                  max={40}
                  step={4}
                  onValueChange={([value]) => handleSettingChange('gap', value)}
                />
                <span className="text-sm text-gray-500">
                  {layoutSettings.gap}px
                </span>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700">모서리 둥글기</Label>
                <Slider
                  className="py-2"
                  value={[layoutSettings.borderRadius]}
                  min={0}
                  max={24}
                  step={2}
                  onValueChange={([value]) => handleSettingChange('borderRadius', value)}
                />
                <span className="text-sm text-gray-500">
                  {layoutSettings.borderRadius}px
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-gray-700">미디어 타입 표시</Label>
                  <div className="text-sm text-gray-500">
                    사진/영상 아이콘을 썸네일에 표시합니다
                  </div>
                </div>
                <Switch
                  checked={layoutSettings.showMediaType}
                  onCheckedChange={(checked) => 
                    handleSettingChange('showMediaType', checked)
                  }
                />
              </div>

              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 transition-colors"
                onClick={handleSaveSettings}
                disabled={!isInstagramConnected || !hasSettingsChanged() || isSaving}
              >
                {!isInstagramConnected 
                  ? "인스타그램 연동 필요"
                  : isSaving
                  ? "저장 중..."
                  : !hasSettingsChanged()
                  ? "변경사항 없음"
                  : "설정 저장하기"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <Toaster />
    </div>
  );
};

export default FeedSettings;