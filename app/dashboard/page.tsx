// ~/dashboard/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar'; // 좌측 사이드바 컴포넌트
import ContentArea from './components/ContentArea'; // 우측 콘텐츠 영역 컴포넌트

// Dashboard 컴포넌트: 쇼핑몰 데이터를 가져와 대시보드를 구성하는 메인 페이지
const Dashboard = () => {
  // 상태 변수 정의
  const [storeName, setStoreName] = useState<string>(''); // 쇼핑몰 이름
  const [mallId, setMallId] = useState<string | null>(null); // 쇼핑몰 ID
  const [selectedMenu, setSelectedMenu] = useState<string>(''); // 선택된 메뉴 (Instagram 연동, 계정 설정 등)

  // 페이지 로드 시 URL에서 mall_id를 가져와 데이터를 요청하는 로직
  useEffect(() => {
    // 현재 URL의 쿼리 파라미터에서 mall_id 추출
    const urlParams = new URLSearchParams(window.location.search);
    const mallIdParam = urlParams.get('mall_id');

    // mall_id가 없으면 함수 종료
    if (!mallIdParam) return;

    // mallId 상태에 저장
    setMallId(mallIdParam);

    // 기존 API 라우터를 활용하여 store-name 요청
    fetch(`/api/auth/cafe24/store-name?mall_id=${mallIdParam}`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch store name');
        }
        const storeName = await response.json();
        setStoreName(storeName);
      })
      .catch(error => {
        console.error('Error fetching store data:', error);
        setStoreName(''); // 에러 시 빈 문자열로 설정
      });
  }, []);

  // UI 렌더링
  return (
    <div className="flex h-screen">
      {/* 좌측 사이드바 */}
      <Sidebar mallId={mallId} storeName={storeName} onMenuSelect={setSelectedMenu} />
      {/* 우측 콘텐츠 영역 */}
      <ContentArea selectedMenu={selectedMenu} />
    </div>
  );
};

export default Dashboard;
