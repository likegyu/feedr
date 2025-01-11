'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { differenceInSeconds } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"


interface SidebarProps {
  cafe24MallId: string | null;
  cafe24ShopName: string;
  cafe24ExpiresAt: string | null;
  onMenuSelect: (menu: string) => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  description?: string;
  subMenus?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: '대시보드',
    icon: '📊',
    description: '피드 연동 현황 및 통계'
  },
  {
    id: 'instagram',
    label: 'Instagram 연동',
    icon: '📷',
    description: '인스타그램 계정을 연동하여 관리'
  },
  {
    id: 'feed-settings',
    label: '피드 설정',
    icon: '🎯',
    description: '피드 표시 방식 및 스타일 설정',
    subMenus: [
      {
        id: 'mobile-feed-settings',
        label: '모바일 레이아웃',
        icon: '📱',
        description: '모바일 화면 레이아웃 설정'
      },
      {
        id: 'pc-feed-settings',
        label: 'PC 레이아웃',
        icon: '💻',
        description: 'PC 화면 레이아웃 설정'
      },
      {
        id: 'feed-filter',
        label: '필터 설정',
        icon: '🔍',
        description: '게시물 필터링 설정'
      }
    ]
  },
  {
    id: 'notices',
    label: '공지사항',
    icon: '📢',
    description: '서비스 공지 및 업데이트'
  },
  {
    id: 'api-docs',
    label: 'API 문서',
    icon: '📘',
    description: 'API 연동 가이드 및 문서'
  },
];

const Sidebar: React.FC<SidebarProps> = ({ 
  cafe24MallId, 
  cafe24ShopName, 
  cafe24ExpiresAt, 
  onMenuSelect 
}) => {
  const router = useRouter();
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const [expiresIn, setExpiresIn] = useState<string>('');
  const [showExpiredDialog, setShowExpiredDialog] = useState(false);
  const formatTimeLeft = useCallback((seconds: number): string => {
    if (seconds <= 0) return '로그인 토큰이 만료되었습니다';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    const parts = [];
    if (hours > 0) parts.push(`${hours}시간`);
    if (minutes > 0) parts.push(`${minutes}분`);
    parts.push(`${remainingSeconds}초`);

    return `로그인 만료까지: ${parts.join(' ')}`;
  }, []);

  useEffect(() => {
    if (!cafe24ExpiresAt) return;

    const expiresDate = new Date(cafe24ExpiresAt);
    
    const updateTimeLeft = () => {
      const now = new Date();
      const secondsLeft = differenceInSeconds(expiresDate, now);
      setExpiresIn(formatTimeLeft(secondsLeft));
      if (secondsLeft <= 0) {
        setShowExpiredDialog(true);
      }
    };
    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [cafe24ExpiresAt, formatTimeLeft]);

  return (
    <>
      <div className="w-64 bg-gray-900 text-white flex flex-col p-4">
        <div className="mb-6">
          <div className="h-12 flex items-center justify-center mb-4">
            <h1 className="text-xl font-medium">
              Feedr
            </h1>
          </div>
          <div className="px-2 border-gray-700 pt-4">
            <h2 className="text-lg font-bold">{cafe24ShopName || 'Loading...'}</h2>
            <p className="text-sm text-gray-400">{cafe24MallId}</p>
            <p className="text-xs text-gray-400 mt-1">{expiresIn}</p>
          </div>
        </div>
        <nav className="flex-1 flex flex-col gap-2 overflow-y-auto">
          {menuItems.map((item) => (
            <div key={item.id}>
              <button
                onClick={() => {
                  if (item.subMenus) {
                    setExpandedMenu(expandedMenu === item.id ? null : item.id);
                  } else {
                    onMenuSelect(item.id);
                  }
                }}
                className="w-full flex items-center gap-3 hover:bg-gray-700 p-3 rounded transition-colors"
              >
                <span className="text-xl">{item.icon}</span>
                <div className="text-left flex-1">
                  <div className="font-medium">{item.label}</div>
                  {item.description && (
                    <div className="text-xs text-gray-400">{item.description}</div>
                  )}
                </div>
                {item.subMenus && (
                  <span className="text-gray-400">
                    {expandedMenu === item.id ? '▼' : '▶'}
                  </span>
                )}
              </button>
              {item.subMenus && expandedMenu === item.id && (
                <div className="flex flex-col gap-1 bg-gray-800 rounded-md p-2 border border-gray-700 mt-1">
                  {item.subMenus.map((subItem) => (
                    <button
                      key={subItem.id}
                      onClick={() => onMenuSelect(subItem.id)}
                      className="flex items-center gap-3 hover:bg-gray-700 p-2 rounded transition-colors w-full"
                    >
                      <span className="text-sm">{subItem.icon}</span>
                      <div className="text-left">
                        <div className="font-medium text-sm">{subItem.label}</div>
                        {subItem.description && (
                          <div className="text-xs text-gray-400">{subItem.description}</div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      <Dialog open={showExpiredDialog} onOpenChange={setShowExpiredDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>세션 만료</DialogTitle>
            <DialogDescription>
              로그인 세션이 만료되었습니다. 다시 로그인해 주세요.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => router.push('/')} variant="default">
              홈으로 이동
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Sidebar;
