'use client';

import { FeedSettings } from '@/types/settings';
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import useEmblaCarousel from 'embla-carousel-react';

// Settings API
const SettingsAPI = {
  fetchSettings: async () => {
    const response = await fetch('/api/settings/feed');
    if (!response.ok) throw new Error('설정 로드에 실패했습니다');
    return response.json();
  },

  saveSettings: async (settings: FeedSettings) => {
    const response = await fetch('/api/settings/feed', {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'mobile',
        settings
      })
    });

    if (!response.ok) throw new Error('설정 저장에 실패했습니다');
    return response.json();
  },

  checkInstagramStatus: async () => {
    const response = await fetch('/api/auth/instagram/status');
    const data = await response.json();
    return data.isConnected;
  }
};

// Carousel Config
const carouselConfig = {
  align: 'center' as const,
  containScroll: 'keepSnaps' as const,
  dragFree: false,
  loop: true,  
  skipSnaps: true,
  direction: 'ltr' as const,
  inViewThreshold: 0.7
};

// Default Settings
const defaultSettings: FeedSettings = {
  layout: 'grid',
  columns: 2,
  rows: 3,
  gap: 8,
  borderRadius: 8,
  showMediaType: true
};

// Custom Hooks
const useSettings = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isInstagramConnected, setIsInstagramConnected] = useState<boolean | null>(null);
  const [initialSettings, setInitialSettings] = useState<FeedSettings | null>(null); 
  const [mobileLayoutSettings, setMobileLayoutSettings] = useState<FeedSettings | null>(null);
  const [mobileEmblaRef] = useEmblaCarousel(carouselConfig);

  // Load Settings
  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const data = await SettingsAPI.fetchSettings();
      
      let settings: FeedSettings;
      if (data.mobile_feed_settings) {
        settings = typeof data.mobile_feed_settings === 'string' ? 
          JSON.parse(data.mobile_feed_settings) : 
          data.mobile_feed_settings;
      } else {
        settings = defaultSettings;
      }
      
      setInitialSettings(settings);
      setMobileLayoutSettings(settings);

    } catch (error) {
      console.error('설정 로드 중 오류:', error);
      toast({
        title: "설정 로드 실패",
        description: error instanceof Error ? error.message : "설정을 불러오는데 실패했습니다.",
        variant: "destructive"  
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Save Settings
  const saveSettings = async () => {
    if (!mobileLayoutSettings) return;

    try {
      await SettingsAPI.saveSettings(mobileLayoutSettings);
      
      toast({
        title: "설정이 저장되었습니다",
        description: "모바일 레이아웃 설정이 성공적으로 저장되었습니다."
      });

    } catch (err) {
      console.error('설정 저장 오류:', err);
      toast({
        title: "오류가 발생했습니다", 
        description: "설정 저장 중 문제가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive"
      });
    }
  };

  // Check Instagram Status
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const status = await SettingsAPI.checkInstagramStatus();
        setIsInstagramConnected(status);
      } catch (error) {
        console.error('인스타그램 상태 확인 중 오류:', error);
        setIsInstagramConnected(false); 
      }
    };
    checkStatus();
  }, []);

  // Load Initial Settings
  useEffect(() => {
    loadSettings();
  }, []);

  return {
    isLoading,
    isInstagramConnected,
    initialSettings,
    mobileLayoutSettings,
    mobileEmblaRef,
    setMobileLayoutSettings,
    saveSettings
  };
};

export {
  useSettings,
  SettingsAPI,
  carouselConfig,
  defaultSettings
};