'use client';

import React, { useState, useEffect } from 'react';

const InstagramConnect = () => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 연동 상태 확인
  useEffect(() => {
    const checkInstagramStatus = async () => {
      try {
        const response = await fetch('/api/instagram/status');
        const data = await response.json();

        if (data.isConnected) {
          setIsConnected(true);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to check Instagram connection status');
      }
    };

    checkInstagramStatus();
  }, []);

  // Instagram 연동 버튼 클릭 핸들러
  const handleInstagramLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID;
    const redirectUri = encodeURIComponent(`${window.location.origin}/api/auth/instagram/callback`);
    const scope = 'user_profile,user_media';
    
    const instagramAuthUrl = `https://api.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;
    
    window.location.href = instagramAuthUrl;
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">📷 Instagram 연동</h2>
      <div className="bg-white p-6 rounded-lg shadow">
        {isConnected ? (
          <p className="text-green-600 font-medium">✅ Instagram이 성공적으로 연동되었습니다!</p>
        ) : (
          <>
            <p className="text-gray-700 mb-4">
              Instagram 계정을 쇼핑몰에 연동하려면 아래 버튼을 클릭하세요.
            </p>
            <button
              onClick={handleInstagramLogin}
              className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition"
            >
              Instagram 연동하기
            </button>
            {error && <p className="text-red-600 mt-4">{error}</p>}
          </>
        )}
      </div>
    </div>
  );
};

export default InstagramConnect;
