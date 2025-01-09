'use client';

import React, { useEffect, useState } from 'react';

interface InstagramStatus {
  isConnected: boolean;
  userId?: string;
}

const InstagramConnect = () => {
  const [cafe24MallId, setMallId] = useState<string | null>(null);
  const [status, setStatus] = useState<InstagramStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const mallId = urlParams.get('mall_id');
    setMallId(mallId);

    if (mallId) {
      checkInstagramStatus(mallId);
    }
  }, []);

  const checkInstagramStatus = async (mallId: string) => {
    try {
      const response = await fetch(`/api/auth/instagram/status?mall_id=${mallId}`);
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Instagram 상태 확인 중 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const instagramAuthUrl = `https://api.instagram.com/oauth/authorize?client_id=${
    process.env.INSTAGRAM_CLIENT_ID
  }&redirect_uri=${
    process.env.INSTAGRAM_REDIRECT_URI
  }&state=${new URLSearchParams(window.location.search).get('mall_id')}&scope=instagram_business_basic&response_type=code`;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">📷 Instagram 연동</h2>
      <div className="bg-white p-6 rounded-lg shadow">
        {loading ? (
          <p>상태 확인 중...</p>
        ) : status?.isConnected ? (
          <div>
            <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-lg">
              <p>✅ Instagram 계정이 연동되었습니다.</p>
              <p className="text-sm mt-2">연동된 계정 ID: {status.userId}</p>
            </div>
            <button
              onClick={() => checkInstagramStatus(cafe24MallId!)}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              상태 새로고침
            </button>
          </div>
        ) : (
          <>
            <p className="mb-4">Instagram 계정을 연동하여 쇼핑몰에 Instagram 피드를 자동으로 게시하세요.</p>
            <a
              href={instagramAuthUrl}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Instagram 계정 연동하기
            </a>
          </>
        )}
      </div>
    </div>
  );
};

export default InstagramConnect;
