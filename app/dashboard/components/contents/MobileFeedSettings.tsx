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
import { ImageIcon, PlayCircleIcon } from 'lucide-react';

const MobileFeedSettings = () => {
  useEffect(() => {
    document.body.style.userSelect = 'none';
    return () => {
      document.body.style.userSelect = '';
    };
  }, []);

  const [mobileEmblaRef] = useEmblaCarousel({
    align: 'center',
    containScroll: 'keepSnaps',
    dragFree: false,
    loop: true,
    skipSnaps: true,
    direction: 'ltr',
    inViewThreshold: 0.7,
  });

  const [mobileLayoutSettings, setMobileLayoutSettings] = useState({
    layout: 'grid',
    columns: 2, // 모바일에 맞게 기본값 수정
    rows: 3,    // 모바일에 맞게 기본값 수정
    gap: 8,     // 모바일에 맞게 기본값 수정
    borderRadius: 8,
    showMediaType: true, // 미디어 타입 표시 여부 추가
  });

  const handleMobileSettingChange = (key: string, value: string | number | boolean) => {
    setMobileLayoutSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const renderMobilePreview = () => {
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
      <div className="mb-8 bg-gray-50 p-8 rounded-lg">
        <p className="text-sm text-gray-500 mb-4">
          {mobileLayoutSettings.layout === 'carousel' 
            ? '👉 옆으로 스크롤하여 더 많은 이미지를 확인해보세요' 
            : '👉 화면의 가로 길이가 768px 이하가 되면 피드가 모바일 레이아웃으로 보여요'
          }
        </p>
        <div className="flex justify-center">
          <div className="relative w-[320px] h-[640px] bg-black rounded-[3rem] p-4 shadow-xl">
            {/* 노치 디자인 */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-6 bg-black rounded-b-3xl flex items-center justify-center">
              <div className="w-20 h-4 bg-black rounded-lg"></div>
            </div>
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
              <div className="h-[calc(100%-2.5rem)] overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
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
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">📱 모바일 피드 설정</h2>
      {renderMobilePreview()}
      <div className="bg-white p-6 rounded-lg shadow space-y-6">
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
      </div>
    </div>
  );
};

export default MobileFeedSettings;
