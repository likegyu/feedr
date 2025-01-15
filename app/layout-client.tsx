'use client';

import { useEffect } from "react";
import { differenceInSeconds } from 'date-fns';
import { useCafe24Store } from "@/store/cafe24Store";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { AuthDialogProvider } from "@/components/auth-dialog-provider"

function InitializeCafe24() {
  const { initialized, expiresAt, setShopName, setExpiresAt, setIsLoading, setInitialized } = useCafe24Store();


  // 초기 데이터 로드
  useEffect(() => {
    const fetchData = async () => {
      if (initialized) return;

      try {
        setIsLoading(true);
        const [shopNameRes, expiresRes] = await Promise.all([
          fetch("/api/auth/cafe24/shop-name"),
          fetch("/api/auth/cafe24/token-expires-check")
        ]);

        if (shopNameRes.ok) {
          const { data } = await shopNameRes.json();
          setShopName(data.cafe24ShopName);
        }

        if (expiresRes.ok) {
          const { data } = await expiresRes.json();
          setExpiresAt(data.expiresAt);
        }
        
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
        setInitialized(true); // 모든 초기화 작업이 완료된 후 initialized를 true로 설정
      }
    };

    fetchData();
  }, [initialized, setShopName, setExpiresAt, setIsLoading, setInitialized]);

    
  // 토큰 만료 체크
  useEffect(() => {
    const checkExpiration = () => {
      // initialized가 true이고 expiresAt이 있을 때만 체크
      if (initialized && expiresAt) {
        const diffInSeconds = differenceInSeconds(new Date(expiresAt), new Date());
        const isExpired = diffInSeconds <= 0;
        const hasInitialReload = sessionStorage.getItem('tokenExpiredReload');

        // 만료되었고 아직 첫 리로드를 하지 않은 경우에만 리로드
        if (isExpired && !hasInitialReload) {
          sessionStorage.setItem('tokenExpiredReload', 'true');
          window.location.reload();
        }
        
        // 만료 상태가 아닐 때는 리로드 플래그 제거
        if (!isExpired) {
          sessionStorage.removeItem('tokenExpiredReload');
        }
      }
    };

    const interval = setInterval(checkExpiration, 60000); // 1분마다 체크
    checkExpiration(); // 초기 체크
    return () => clearInterval(interval);
  }, [expiresAt, initialized]);


  return null;
}

export function RootLayoutClient({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthDialogProvider>
      <SidebarProvider>
        <InitializeCafe24 />
        <AppSidebar />
        <SidebarInset>
          <main className="m-7">
            <SidebarTrigger />
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </AuthDialogProvider>
  );
}
