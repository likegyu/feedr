// ~/dashboard/components/Sidebar.tsx
'use client';

import React from 'react';

interface SidebarProps {
  mallId: string | null;
  storeName: string;
  onMenuSelect: (menu: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ mallId, storeName, onMenuSelect }) => {
  return (
    <div className="w-64 bg-gray-900 text-white h-screen flex flex-col p-4">
      <div className="mb-8">
        <h2 className="text-lg font-bold">{storeName || 'Loading...'}</h2>
        <p className="text-sm text-gray-400">{mallId}</p>
      </div>
      <nav className="flex flex-col gap-2">
        <button onClick={() => onMenuSelect('instagram')} className="hover:bg-gray-700 p-2 rounded">
          📷 Instagram 연동
        </button>
        <button onClick={() => onMenuSelect('account')} className="hover:bg-gray-700 p-2 rounded">
          ⚙️ 계정 설정
        </button>
      </nav>
    </div>
  );
};

export default Sidebar;
