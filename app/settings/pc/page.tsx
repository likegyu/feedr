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
import { ImageIcon, PlayCircleIcon, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";

const FeedSettings = () => {
  const { toast } = useToast();
  const [isInstagramConnected, setIsInstagramConnected] = useState(false);

  useEffect(() => {
    const checkInstagramStatus = async () => {
      try {
        const response = await fetch('/api/auth/instagram/status');
        const data = await response.json();
        setIsInstagramConnected(data.isConnected);
      } catch (error) {
        console.error('인스타그램 상태 확인 중 오류:', error);
        setIsInstagramConnected(false);
      }
    };

    checkInstagramStatus();
  }, []);

  const [emblaRef] = useEmblaCarousel({
    align: 'center',
    containScroll: 'keepSnaps',
    dragFree: false,           // 스냅 효과를 위해 false로 설정
    loop: true,
    skipSnaps: true,         // 정확한 스냅 위치 유지
    direction: 'ltr',
    inViewThreshold: 0.7,    // 성능 최적화를 위한 임계값
  });

  const [layoutSettings, setLayoutSettings] = useState({
    layout: 'grid',
    columns: 3,
    rows: 2,      // 로우 수 추가
    gap: 16,
    borderRadius: 8,
    showMediaType: true, // 미디어 타입 표시 여부 추가
  });

  const handleSettingChange = (key: string, value: string | number | boolean) => {
    setLayoutSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // 설정 로드
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/settings/feed');
        const data = await response.json();
        if (data.pc_feed_settings) {
          setLayoutSettings(JSON.parse(data.pc_feed_settings));
        }
      } catch (error) {
        console.error('설정 로드 중 오류:', error);
      }
    };

    loadSettings();
  }, []);

  const handleSaveSettings = async () => {
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
    }
  };

  const renderPreview = () => {
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
                <PlayCircleIcon className="w-4 h-4 text-black" />
              ) : (
                <ImageIcon className="w-4 h-4 text-black" />
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

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">PC 레이아웃 설정</h2>
      {!isInstagramConnected && (
        <div className="flex  gap-2 items-center mb-4 p-4 bg-yellow-50 text-yellow-800 rounded-lg">
        <Info className="h-4 w-4"/> 설정을 저장하려면 먼저 인스타그램 계정을 연동해주세요.
      </div>
      )}
      {renderPreview()}
      <div className="bg-white p-6 rounded-lg shadow space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="layout">레이아웃 스타일</Label>
            <Select
              value={layoutSettings.layout}
              onValueChange={(value) => handleSettingChange('layout', value)}
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

          {/* 그리드 레이아웃일 때만 로우 수 설정 표시 */}
          {layoutSettings.layout === 'grid' && (
            <div>
              <Label>로우 수</Label>
              <Slider
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

          <div>
            <Label>이미지 간격</Label>
            <Slider
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

          <div>
            <Label>모서리 둥글기</Label>
            <Slider
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

          {/* 미디어 타입 표시 설정 추가 */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>미디어 타입 표시</Label>
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

          {/* 저장 버튼 추가 */}
          <div className="pt-4 border-t">
            <Button 
              className="w-full"
              onClick={handleSaveSettings}
              disabled={!isInstagramConnected}
            >
              {isInstagramConnected ? "설정 저장하기" : "인스타그램 연동 필요"}
            </Button>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
};

export default FeedSettings;