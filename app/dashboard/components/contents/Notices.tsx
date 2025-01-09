'use client';

import React from 'react';

const Notices = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">📢 공지사항</h2>
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="space-y-4">
          {/* 공지사항 목록을 매핑할 예정 */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold">서비스 정기 점검 안내</h3>
            <p className="text-gray-600 text-sm">2024.01.15</p>
            <p className="mt-2">정기 점검으로 인한 서비스 일시 중단 안내입니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notices;
