// ~/dashboard/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './components/Sidebar'; // 좌측 사이드바 컴포넌트
import ContentArea from './components/ContentArea'; // 우측 콘텐츠 영역 컴포넌트

// Dashboard 컴포넌트: 쇼핑몰 데이터를 가져와 대시보드를 구성하는 메인 페이지
const Cafe24Dashboard = () => {
  // 상태 변수 정의
  const router = useRouter();
  const [cafe24ShopName, setCafe24ShopName] = useState<string>(''); // 쇼핑몰 이름
  const [cafe24MallId, setCafe24MallId] = useState<string>(''); // 쇼핑몰 ID
  const [cafe24ExpiresAt, setcafe24ExpiresAt] = useState<string>(''); // 토큰 만료 시간
  const [selectedCafe24Menu, setSelectedCafe24Menu] = useState<string>(''); // 선택된 메뉴 (Instagram 연동, 계정 설정 등)


  // 페이지 로드 시 URL에서 mall_id를 가져와 데이터를 요청하는 로직
  useEffect(() => {
    // 쿠키에 저장된 cafe24_mall_id를 가져올 라우터 응답 요청하기
    const fetchCafe24Cookies = async () => {
      try {
        const response = await fetch('api/cookies/cafe24', {
          method: 'GET',
          credentials: 'include', // 쿠키포함
        });
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const { cafe24MallId } = await response.json(); // mallId 가져오기
        // mall_id가 없으면 루트로 리디렉션
        if (!cafe24MallId) {
          console.error('Cafe24 mall ID not found');
          router.push('/'); // window.location.href 대신 Next.js router 사용
          return;
        }

        // mallId 상태에 저장
        setCafe24MallId(cafe24MallId);
        // 스토어 이름 조회
        try {
          const shopResponse = await fetch(`/api/auth/cafe24/shop-name`);
          if (!shopResponse.ok) {
            throw new Error('스토어 이름을 가져오는데 실패했습니다');
          }
          const { data: { cafe24ShopName } } = await shopResponse.json();
          setCafe24ShopName(cafe24ShopName);
        } catch (error) {
          console.error('스토어 이름 조회 오류:', error);
          setCafe24ShopName('스토어 이름을 가져오는데 실패했습니다');
        }

        // 토큰 만료 시간 조회
        try {
          const tokenResponse = await fetch(`/api/auth/cafe24/token-expires-check`);
          if (!tokenResponse.ok) {
            throw new Error('토큰 정보를 가져오는데 실패했습니다');
          }
          const { data: { cafe24ExpiresAt } } = await tokenResponse.json();
          setcafe24ExpiresAt(cafe24ExpiresAt);
        } catch (error) {
          console.error('토큰 만료시간 조회 오류:', error);
          setcafe24ExpiresAt('');
        }
      } catch (error) {
        console.error('Error fetching cookies:', error);
      }
    };

    fetchCafe24Cookies();
  }, [router]);

  // UI 렌더링
  return (
    <div className="flex min-h-screen">
      {/* 좌측 사이드바 */}
      <Sidebar 
        cafe24MallId={cafe24MallId} 
        cafe24ShopName={cafe24ShopName} 
        cafe24ExpiresAt={cafe24ExpiresAt}
        onMenuSelect={setSelectedCafe24Menu} 
      />
      {/* 우측 콘텐츠 영역 */}
      <ContentArea 
        selectedMenu={selectedCafe24Menu} 
        cafe24MallId={cafe24MallId} 
        cafe24ShopName={cafe24ShopName} 
      />
    </div>
  );
};

export default Cafe24Dashboard;
