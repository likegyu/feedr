'use client';

import React from 'react';

interface DashboardProps {
  mallId: string | null;
  storeName: string;
}

const Dashboard: React.FC<DashboardProps> = ({ mallId, storeName }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">📊 대시보드</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-3">매장 정보</h3>
          <div className="space-y-2">
            <p><span className="font-medium">스토어명:</span> {storeName}</p>
            <p><span className="font-medium">Mall ID:</span> {mallId || '미설정'}</p>
          </div>
        </div>
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold">연동된 Instagram 계정</h3>
          {/* 대시보드 내용 */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
