"use client"

import { useState, useEffect, useCallback } from "react"
import { differenceInSeconds } from 'date-fns'
import {
    User,
    RefreshCcw,
} from "lucide-react"
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuAction,
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"

// 1초마다 실행될 함수를 위한 커스텀 훅
function useInterval(callback: () => void, delay: number) {
  useEffect(() => {
    const id = setInterval(callback, delay);
    return () => clearInterval(id);
  }, [callback, delay]);
}

export function NavUser() {
    const [cafe24ShopName, setCafe24ShopName] = useState<string>(() => 
        localStorage.getItem('cafe24ShopName') || ''
    );
    const [expiresAt, setExpiresAt] = useState<string>(() => 
        localStorage.getItem('cafe24ExpiresAt') || ''
    );
    const [remainingTime, setRemainingTime] = useState<string>('');
    const [isLoading, setIsLoading] = useState(!cafe24ShopName || !expiresAt);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // 남은 시간 계산 함수
    const calculateRemainingTime = useCallback(() => {
        if (!expiresAt) return;

        const diffInSeconds = differenceInSeconds(new Date(expiresAt), new Date());
        
        if (diffInSeconds <= 0) {
            setRemainingTime('만료됨');
            return;
        }

        const hours = Math.floor(diffInSeconds / 3600);
        const minutes = Math.floor((diffInSeconds % 3600) / 60);
        const seconds = diffInSeconds % 60;

        setRemainingTime(
            `${String(hours).padStart(2, '0')}시간 ${String(minutes).padStart(2, '0')}분 ${String(seconds).padStart(2, '0')}초`
        );
    }, [expiresAt]);

    // 1초마다 남은 시간 업데이트
    useInterval(calculateRemainingTime, 1000);

    useEffect(() => {
        const fetchData = async () => {
            // 캐시된 데이터가 있으면 API 호출 스킵
            if (cafe24ShopName && expiresAt) {
                setIsLoading(false);
                return;
            }

            try {
                const [shopNameRes, expiresRes] = await Promise.all([
                    fetch("/api/auth/cafe24/shop-name"),
                    fetch("/api/auth/cafe24/token-expires-check")
                ]);

                if (shopNameRes.ok) {
                    const { data } = await shopNameRes.json();
                    setCafe24ShopName(data.cafe24ShopName);
                    localStorage.setItem('cafe24ShopName', data.cafe24ShopName);
                }

                if (expiresRes.ok) {
                    const { data } = await expiresRes.json();
                    setExpiresAt(data.cafe24ExpiresAt);
                    localStorage.setItem('cafe24ExpiresAt', data.cafe24ExpiresAt);
                }
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [cafe24ShopName, expiresAt]);

    const refreshCafe24Token = async () => {
        setIsRefreshing(true);
        try {
            const res = await fetch("/api/cron/refresh-tokens", {
                method: "POST",
                headers: { "Content-Type": "application/json" }
            });
            if (res.ok) {
                // 토큰 갱신 후 캐시 초기화
                localStorage.removeItem('cafe24ExpiresAt');
                const { data } = await res.json();
                setExpiresAt(data.cafe24ExpiresAt);
                localStorage.setItem('cafe24ExpiresAt', data.cafe24ExpiresAt);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsRefreshing(false);
        }
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <div className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                    <div className="h-8 w-8">
                        <User />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                        {isLoading ? (
                            <>
                                <Skeleton className="h-4 w-[120px]" />
                                <Skeleton className="h-3 w-[140px] mt-1" />
                            </>
                        ) : (
                            <>
                                <span className="truncate font-semibold">{cafe24ShopName}</span>
                                <span className="truncate text-xs">
                                    로그인 만료: {remainingTime || <Skeleton className="h-3 w-[80px] inline-block" />}
                                </span>
                            </>
                        )}
                    </div>
                    <SidebarMenuAction onClick={refreshCafe24Token}>
                        <RefreshCcw className={`ml-auto size-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </SidebarMenuAction>
                </div>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
