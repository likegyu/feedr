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
            
            if (!isTokenValid) {
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`/api/auth/cafe24/shop-name`);
                const { data } = await response.json();
                setCafe24ShopName(data.cafe24ShopName);
                setCafe24MallId(data.cafe24MallId);
            } catch (error) {
                console.error('카페24 상태 조회 실패:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCafe24ShopName();
    }, []);

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
        <div className="max-w-4xl mx-auto p-4 space-y-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">대시보드</h2>
            {showTokenAlert && (
                <Alert className="mb-6 bg-blue-50 border-blue-200">
                    <AlertDescription className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-2">
                            <Info className="h-5 w-5 text-blue-500" />
                            <span>카페24 로그인이 필요합니다. 다시 로그인해 주세요.</span>
                        </div>
                        <Button 
                            onClick={onOpen} 
                            variant="default" 
                            className="bg-blue-500 hover:bg-blue-600 transition-colors"
                        >
                            로그인
                        </Button>
                    </AlertDescription>
                </Alert>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="shadow-lg">
                    <CardHeader className="p-6">
                        <CardTitle className="text-xl text-gray-800">매장 정보</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 pt-0 space-y-4">
                        {loading ? (
                            <>
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-6 w-1/2" />
                            </>
                        ) : cafe24ShopName ? (
                            <>
                                <p className="text-gray-600">
                                    <span className="font-medium text-gray-800">스토어명:</span> {cafe24ShopName}
                                </p>
                                <p className="text-gray-600">
                                    <span className="font-medium text-gray-800">Mall ID:</span> {cafe24MallId}
                                </p>
                            </>
                        ) : (
                            <p className="text-gray-500">매장 정보가 없습니다</p>
                        )}
                    </CardContent>
                </Card>
                
                <Card className="shadow-lg">
                    <CardHeader className="p-6">
                        <CardTitle className="text-xl text-gray-800">연동된 Instagram 계정</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 pt-0">
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
