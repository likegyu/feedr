// ~/dashboard/components/ContentArea.tsx
'use client';

import React from 'react';

interface ContentAreaProps {
  selectedMenu: string;
}

const ContentArea: React.FC<ContentAreaProps> = ({ selectedMenu }) => {
  return (
    <div className="flex-1 p-6">
      {selectedMenu === 'instagram' && <h2>📷 Instagram 연동 페이지</h2>}
      {selectedMenu === 'account' && <h2>⚙️ 계정 설정 페이지</h2>}
      {selectedMenu === '' && <h2>대시보드를 시작하려면 메뉴를 선택하세요.</h2>}
    </div>
  );
};

export default ContentArea;
