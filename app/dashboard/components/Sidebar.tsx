// ~/dashboard/components/Sidebar.tsx
'use client';

import React from 'react';

interface SidebarProps {
  cafe24MallId: string | null;
  cafe24StoreName: string;
  onMenuSelect: (menu: string) => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  description?: string;
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
    description: '피드 표시 방식 및 스타일 설정'
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

const Sidebar: React.FC<SidebarProps> = ({ cafe24MallId, cafe24StoreName, onMenuSelect }) => {
  return (
    <div className="w-64 bg-gray-900 text-white h-screen flex flex-col p-4">
      <div className="mb-6">
        <div className="h-12 flex items-center justify-center mb-4">
          <h1 className="text-xl font-medium">
            Feedr
          </h1>
        </div>
        <div className="px-2 border-gray-700 pt-4">
          <h2 className="text-lg font-bold">{cafe24StoreName || 'Loading...'}</h2>
          <p className="text-sm text-gray-400">{cafe24MallId}</p>
        </div>
      </div>
      <nav className="flex flex-col gap-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onMenuSelect(item.id)}
            className="flex items-center gap-3 hover:bg-gray-700 p-3 rounded transition-colors"
          >
            <span className="text-xl">{item.icon}</span>
            <div className="text-left">
              <div className="font-medium">{item.label}</div>
              {item.description && (
                <div className="text-xs text-gray-400">{item.description}</div>
              )}
            </div>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
