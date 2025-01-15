'use client';

import React, { useEffect, useState } from 'react';
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button"
import { useAuthDialog } from "@/components/auth-dialog-provider"

const Dashboard = () => {
    const { onOpen } = useAuthDialog();
    const [instagramStatus, setInstagramStatus] = useState(null);
    const [instagramUserName, setInstagramUserName] = useState('');
    const [loading, setLoading] = useState(true);
    const [cafe24MallId, setCafe24MallId] = useState('');
    const [cafe24ShopName, setCafe24ShopName] = useState('');
    const [showTokenAlert, setShowTokenAlert] = useState(false);

    const checkTokenExpiration = async () => {
        try {
            const response = await fetch('/api/auth/cafe24/token-expires-check');
            const data = await response.json();
            
            if (!data?.data?.cafe24ExpiresAt || new Date(data.data.cafe24ExpiresAt) <= new Date()) {
                setShowTokenAlert(true);
                return false;
            }
            return true;
        } catch (error) {
            console.error('토큰 만료 확인 실패:', error);
            setShowTokenAlert(true);
            return false;
        }
    };

    useEffect(() => {
        const fetchCafe24ShopName = async () => {
            setLoading(true);
            const isTokenValid = await checkTokenExpiration();
            console.log('Token valid:', isTokenValid);
            
            if (!isTokenValid) {
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`/api/auth/cafe24/shop-name`);
                console.log('Cafe24 API Response:', response.status);
                const data = await response.json();
                console.log('Cafe24 API Data:', data);
                setCafe24ShopName(data.cafe24ShopName);
                setCafe24MallId(data.cafe24MallId);
            } catch (error) {
                console.error('카페24 상태 조회 상세 에러:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCafe24ShopName();
    }, []);

    useEffect(() => {
        const fetchInstagramStatus = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/auth/instagram/status`);
                console.log('Instagram API Response:', response.status);
                const data = await response.json();
                console.log('Instagram API Data:', data);
                setInstagramStatus(data.isConnected);
                setInstagramUserName(data.userName);
            } catch (error) {
                console.error('Instagram 상태 조회 상세 에러:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchInstagramStatus();
    }, [cafe24MallId]);

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">대시보드</h2>
            {showTokenAlert && (
                <Alert className="mb-4">
                    <AlertDescription className="flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        카페24 로그인이 필요합니다. 다시 로그인해 주세요.
                        <Button onClick={onOpen} variant="default" size="sm" className="ml-1 h-7">
                        로그인
                        </Button>
                    </AlertDescription>
                </Alert>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle>매장 정보</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {loading ? (
                            <>
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-6 w-1/2" />
                            </>
                        ) : cafe24ShopName ? (
                            <>
                                <p><span className="font-medium">스토어명:</span> {cafe24ShopName}</p>
                                <p><span className="font-medium">Mall ID:</span> {cafe24MallId}</p>
                            </>
                        ) : (
                            <p className="text-gray-500">매장 정보가 없습니다</p>
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
