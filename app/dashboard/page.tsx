'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
  } from '@/components/ui/chart';
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button"
import { useAuthDialog } from "@/components/auth-dialog-provider"
import { Label, Pie, PieChart } from "recharts"
import Image from 'next/image';

// 타입 정의 추가
interface InstagramTrack {
  media_id: string;
  permalink: string;
  display_url: string;
  clicks: number;
  clicked_at: string;
}

interface ChartDataItem {
  id: string;
  clicks: number;
  fill: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

const Dashboard = () => {
    const { onOpen } = useAuthDialog();
    const [instagramStatus, setInstagramStatus] = useState(null);
    const [instagramUserName, setInstagramUserName] = useState('');
    const [loading, setLoading] = useState(true);
    const [cafe24MallId, setCafe24MallId] = useState('');
    const [cafe24ShopName, setCafe24ShopName] = useState('');
    const [showTokenAlert, setShowTokenAlert] = useState(false);
    const [trackData, setTrackData] = useState<InstagramTrack[]>([]);
    const [error, setError] = useState<string | null>(null);

    const totalClicks = useMemo(() => {
        return trackData.reduce((acc, curr) => acc + curr.clicks, 0);
      }, [trackData]);
    
    // 차트 데이터 메모이제이션 최적화
    const chartData = useMemo<ChartDataItem[]>(() => 
        trackData.map(item => ({
          id: item.media_id,
          clicks: item.clicks,
          fill: `hsl(${Math.random() * 360}, 70%, 50%)`,
        }))
      , [trackData]);
    
      const CHART_COLORS = [
        'hsl(var(--chart-1))',
        'hsl(var(--chart-2))',
        'hsl(var(--chart-3))',
        'hsl(var(--chart-4))',
        'hsl(var(--chart-5))'
      ] as const;
      
      const chartConfig = useMemo(() => {
        const config: ChartConfig = {
          clicks: {
            label: '클릭수',
          }
        };
      
        // 트래킹 데이터를 기반으로 설정 추가
        trackData.forEach((item, index) => {
          config[item.media_id] = {
            label: new Date(item.clicked_at).toLocaleDateString(),
            color: CHART_COLORS[index % CHART_COLORS.length]
          };
        });
      
        return config;
      }, [trackData]);
    
      useEffect(() => {
        const fetchTrackData = async () => {
          if (!cafe24MallId) return;
          try {
            const response = await fetch(`/api/analytics`);
            const json = await response.json();
            if (json.success) {
              setTrackData(json.data);
            }
          } catch (error) {
            console.error('클릭 데이터 조회 실패:', error);
          } finally {
            setLoading(false);
          }
        };
    
        fetchTrackData();
      }, [cafe24MallId]);
    
    // 토큰 만료 체크 함수 개선
    const checkTokenExpiration = useCallback(async () => {
        try {
            const response = await fetch('/api/auth/cafe24/token-expires-check');
            const data = await response.json() as ApiResponse<{ cafe24ExpiresAt: string }>;
            
            if (!data.success || !data.data?.cafe24ExpiresAt) {
                throw new Error('토큰 정보를 불러올 수 없습니다.');
            }

            if (new Date(data.data.cafe24ExpiresAt) <= new Date()) {
                setShowTokenAlert(true);
                return false;
            }

            return true;
        } catch (error) {
            console.error('토큰 만료 확인 실패:', error);
            setError(error instanceof Error ? error.message : '토큰 확인 중 오류가 발생했습니다.');
            setShowTokenAlert(true);
            return false;
        }
    }, []);

    // Cafe24 상점 정보 로딩
    const fetchCafe24ShopName = useCallback(async () => {
        setLoading(true);
        try {
            const isTokenValid = await checkTokenExpiration();
            if (!isTokenValid) {
                return;
            }

            const response = await fetch('/api/auth/cafe24/shop-name');
            const { data } = await response.json();
            
            if (!data?.cafe24ShopName || !data?.cafe24MallId) {
                throw new Error('상점 정보를 불러올 수 없습니다.');
            }

            setCafe24ShopName(data.cafe24ShopName);
            setCafe24MallId(data.cafe24MallId);
        } catch (error) {
            console.error('카페24 상태 조회 실패:', error);
            setError(error instanceof Error ? error.message : '상점 정보를 불러오는 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    }, [checkTokenExpiration]);

    useEffect(() => {
        fetchCafe24ShopName();
    }, [fetchCafe24ShopName]);

    // Instagram 상태 체크
    const fetchInstagramStatus = useCallback(async () => {
        if (!cafe24MallId) return;
        
        setLoading(true);
        try {
            const response = await fetch(`/api/auth/instagram/status`);
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'Instagram 상태를 확인할 수 없습니다.');
            }

            setInstagramStatus(data.isConnected);
            setInstagramUserName(data.userName);
        } catch (error) {
            console.error('Instagram 상태 조회 실패:', error);
            setError(error instanceof Error ? error.message : 'Instagram 상태를 확인하는 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    }, [cafe24MallId]);

    useEffect(() => {
        fetchInstagramStatus();
    }, [fetchInstagramStatus]);

    // 에러 표시 컴포넌트 추가
    const ErrorAlert = ({ message }: { message: string }) => (
        <Alert variant="destructive" className='bg-destructive text-destructive-foreground'>
            <AlertDescription>
                {message}
            </AlertDescription>
        </Alert>
    );

    return (
        <div className="max-w-screen-xl mx-auto p-4 space-y-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">대시보드</h2>
            
            {error && <ErrorAlert message={error} />}
            
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
                <Card>
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
                
                <Card>
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
            <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>인스타그램 클릭 분석</CardTitle>
          <CardDescription>최근 30일 클릭 통계</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          {loading ? (
            <Skeleton className="h-[250px] w-full" />
          ) : (
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square max-h-[250px]"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={chartData}
                  dataKey="clicks"
                  nameKey="id"
                  innerRadius={60}
                  strokeWidth={5}
                >
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-foreground text-3xl font-bold"
                            >
                              {totalClicks.toLocaleString()}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 24}
                              className="fill-muted-foreground"
                            >
                              총 클릭수
                            </tspan>
                          </text>
                        )
                      }
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
          )}
        </CardContent>
        <CardFooter className="flex-col gap-2 text-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {trackData.map((item, index) => (
              <div key={item.media_id} className="relative group">
                <Image 
                  src={item.display_url} 
                  alt={`Instagram post ${index + 1}`}
                  className="w-full aspect-square object-cover rounded-lg"
                />
                <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded-full text-sm">
                  {item.clicks}회
                </div>
              </div>
            ))}
          </div>
        </CardFooter>
      </Card>
        </div>
    );
};

export default Dashboard;
