'use client';

import React, { useEffect, useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

interface DashboardProps {
  mallId: string | null;
  storeName: string;
}

interface InstagramStatus {
  isConnected: boolean;
  userName?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ mallId, storeName }) => {
  const [instagramStatus, setInstagramStatus] = useState<InstagramStatus | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchInstagramStatus = async () => {
      if (!mallId) return;
      
      setLoading(true);
      try {
        const response = await fetch(`/api/auth/instagram/status?state=${mallId}`);
        const data = await response.json();
        setInstagramStatus(data);
      } catch (error) {
        console.error('Instagram 상태 조회 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInstagramStatus();
  }, [mallId]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">📊 대시보드</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>매장 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><span className="font-medium">스토어명:</span> {storeName}</p>
            <p><span className="font-medium">Mall ID:</span> {mallId || '미설정'}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>연동된 Instagram 계정</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-gray-500">로딩 중...</p>
            ) : instagramStatus?.isConnected ? (
              <div className="space-y-1">
                <p className="text-green-600">✓ 연동됨</p>
                <p>
                  <span className="font-medium">계정:</span>{' '}
                  <a 
                    href={`https://instagram.com/${instagramStatus.userName}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-600"
                  >
                    @{instagramStatus.userName}
                  </a>
                </p>
              </div>
            ) : (
              <p className="text-gray-500">연동된 계정이 없습니다</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
