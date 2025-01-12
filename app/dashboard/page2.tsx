'use client';

import React, { useEffect, useState } from 'react';
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
    const [instagramStatus, setInstagramStatus] = useState(null);
    const [instagramUserName, setInstagramUserName] = useState('');
    const [loading, setLoading] = useState(true);
    const [cafe24MallId, setCafe24MallId] = useState('');
    const [cafe24ShopName, setCafe24ShopName] = useState('');

    useEffect(() => {
        const fetchCafe24ShopName = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/auth/cafe24/shop-name`);
                const data = await response.json();
                setCafe24ShopName(data.cafe24ShopName);
                setCafe24MallId(data.cafe24MallId);
            } catch (error) {
                console.error('카페24 상태 조회 실패:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCafe24ShopName();
    }, [cafe24MallId]);
    useEffect(() => {
        const fetchInstagramStatus = async () => {
            if (!cafe24MallId) return;
            setLoading(true);
            try {
                const response = await fetch(`/api/auth/instagram/status`);
                const data = await response.json();
                setInstagramStatus(data.isConnected);
                setInstagramUserName(data.userName);
            } catch (error) {
                console.error('Instagram 상태 조회 실패:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchInstagramStatus();
    }, [cafe24MallId]);

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">대시보드</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle>매장 정보</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {cafe24ShopName ? (
                            <p><span className="font-medium">스토어명:</span> {cafe24ShopName}</p>
                        ) : (
                            <Skeleton className="h-6 w-3/4" />
                        )}
                        {cafe24MallId ? (
                            <p><span className="font-medium">Mall ID:</span> {cafe24MallId}</p>
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
                        ) : instagramStatus ? (
                            <div className="space-y-1">
                                <p className="text-green-600">✓ 연동됨</p>
                                <p>
                                    <span className="font-medium">계정:</span>{' '}
                                    <a 
                                        href={instagramUserName ? `https://instagram.com/${instagramUserName}` : '#'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-500 hover:text-blue-600"
                                    >
                                        @{instagramUserName}
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
