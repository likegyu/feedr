// ~/dashboard/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar'; // 좌측 사이드바 컴포넌트
import ContentArea from './components/ContentArea'; // 우측 콘텐츠 영역 컴포넌트

// Dashboard 컴포넌트: 쇼핑몰 데이터를 가져와 대시보드를 구성하는 메인 페이지
const Cafe24Dashboard = () => {
  // 상태 변수 정의
  const [cafe24StoreName, setCafe24StoreName] = useState<string>(''); // 쇼핑몰 이름
  const [cafe24MallId, setCafe24MallId] = useState<string | null>(null); // 쇼핑몰 ID
  const [selectedCafe24Menu, setSelectedCafe24Menu] = useState<string>(''); // 선택된 메뉴 (Instagram 연동, 계정 설정 등)
  const [tokenExpiresAt, setTokenExpiresAt] = useState<string | null>(null); // 토큰 만료 시간

  // 페이지 로드 시 URL에서 mall_id를 가져와 데이터를 요청하는 로직
  useEffect(() => {
    // 현재 URL의 쿼리 파라미터에서 mall_id 추출
    const urlParams = new URLSearchParams(window.location.search);
    const cafe24MallIdParam = urlParams.get('state');

    // mall_id가 없으면 함수 종료
    if (!cafe24MallIdParam) return;

    // mallId 상태에 저장
    setCafe24MallId(cafe24MallIdParam);

    // 스토어 이름과 토큰 만료 시간을 병렬로 조회
    Promise.all([
      fetch(`/api/auth/cafe24/store-name?state=${cafe24MallIdParam}`),
      fetch(`/api/auth/cafe24/token-expires-check?state=${cafe24MallIdParam}`)
    ])
      .then(async ([storeResponse, tokenResponse]) => {
        if (!storeResponse.ok || !tokenResponse.ok) {
          throw new Error('Failed to fetch data');
        }
        const storeName = await storeResponse.json();
        const tokenData = await tokenResponse.json();
        
        setCafe24StoreName(storeName);
        setTokenExpiresAt(tokenData.expiresAt);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setCafe24StoreName('');
        setTokenExpiresAt(null);
      });
  }, []);

  // UI 렌더링
  return (
    <div className="flex min-h-screen">
      {/* 좌측 사이드바 */}
      <Sidebar 
        cafe24MallId={cafe24MallId} 
        cafe24StoreName={cafe24StoreName} 
        tokenExpiresAt={tokenExpiresAt}
        onMenuSelect={setSelectedCafe24Menu} 
      />
      {/* 우측 콘텐츠 영역 */}
      <ContentArea 
        selectedMenu={selectedCafe24Menu} 
        cafe24MallId={cafe24MallId} 
        cafe24StoreName={cafe24StoreName} 
      />
    </div>
  );
};

export default Cafe24Dashboard;
