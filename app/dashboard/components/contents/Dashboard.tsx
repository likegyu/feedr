'use client';

import React, { useEffect, useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

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
  const [loading, setLoading] = useState(true);

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
      <h2 className="text-2xl font-bold mb-4">대시보드</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>매장 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {storeName ? (
              <p><span className="font-medium">스토어명:</span> {storeName}</p>
            ) : (
              <Skeleton className="h-6 w-3/4" />
            )}
            {mallId ? (
              <p><span className="font-medium">Mall ID:</span> {mallId}</p>
            ) : (
              <Skeleton className="h-6 w-1/2" />
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>연동된 Instagram 계정</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-48" />
              </div>
            ) : instagramStatus?.isConnected ? (
              <div className="space-y-1">
                <p className="text-green-600">✓ 연동됨</p>
                <p>
                  <span className="font-medium">계정:</span>{' '}
                  <a 
                    href={instagramStatus.userName ? `https://instagram.com/${instagramStatus.userName}` : '#'}
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
