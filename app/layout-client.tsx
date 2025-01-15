'use client';

import { useEffect } from "react";
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

  // 토큰 만료 체크
  useEffect(() => {
    const checkExpiration = () => {
      if (expiresAt && new Date(expiresAt) <= new Date()) {
        window.location.reload();
      }
    };

    const interval = setInterval(checkExpiration, 60000); // 1분마다 체크
    checkExpiration(); // 초기 체크
    return () => clearInterval(interval);
  }, [expiresAt]);

  // 초기 데이터 로드
  useEffect(() => {
    const fetchData = async () => {
      if (initialized) return;

      try {
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
          setExpiresAt(data.cafe24ExpiresAt);
        }
        
        setInitialized(true);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [initialized, setShopName, setExpiresAt, setIsLoading, setInitialized]);

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
