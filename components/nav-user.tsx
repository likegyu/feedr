"use client"

import { useEffect, useCallback } from "react"
import { differenceInSeconds } from 'date-fns'
import { User, RefreshCcw } from "lucide-react"
import { SidebarMenu, SidebarMenuItem, SidebarMenuAction } from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { useCafe24Store } from "@/store/cafe24Store"

const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(1, '0')}시간 ${String(m).padStart(2, '0')}분 ${String(s).padStart(2, '0')}초`;
};

function useInterval(callback: () => void, delay: number) {
  useEffect(() => {
    const id = setInterval(callback, delay);
    return () => clearInterval(id);
  }, [callback, delay]);
}

export function NavUser() {
    const { cafe24ShopName, expiresAt, remainingTime, isLoading, isRefreshing, setRemainingTime, setIsRefreshing } = useCafe24Store()

    const calculateRemainingTime = useCallback(() => {
        if (!expiresAt) return;
        const diffInSeconds = differenceInSeconds(new Date(expiresAt), new Date());
        setRemainingTime(diffInSeconds <= 0 ? '만료됨' : formatTime(diffInSeconds));
    }, [expiresAt, setRemainingTime]);

    useInterval(calculateRemainingTime, 1000);

    const refreshCafe24Token = async () => {
        setIsRefreshing(true);
        try {
            const res = await fetch("/api/auth/cafe24/refresh-token", { method: "POST" });
            if (!res.ok) throw new Error("토큰 갱신 실패");
        } catch (error) {
            console.error(error);
        } finally {
            setIsRefreshing(false);
        }
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <div className="pl-2 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground flex items-center gap-4 py-3">
                    <User className="size-6 shrink-0" />
                    <div className="grid flex-1 text-left leading-tight">
                        {isLoading ? (
                            <>
                                <Skeleton className="h-4 w-[120px]" />
                                <Skeleton className="h-3 w-[140px] mt-1" />
                            </>
                        ) : (
                            <>
                                <span className="truncate font-semibold text-sm">
                                    {cafe24ShopName || <Skeleton className="h-4 w-[120px] inline-block" />}
                                </span>
                                <span className="truncate text-xs mt-0.5 flex items-center">
                                    로그인 만료: {remainingTime || <Skeleton className="h-3 w-[80px] inline-block" />}
                                </span>
                            </>
                        )}
                    </div>
                    <SidebarMenuAction className="flex" onClick={refreshCafe24Token}>
                        <RefreshCcw className={`size-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </SidebarMenuAction>
                </div>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
