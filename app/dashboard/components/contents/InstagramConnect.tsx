'use client';

import React, { useEffect, useState } from 'react';

interface InstagramStatus {
  isConnected: boolean;
  userName?: string;
}

const InstagramConnect = () => {
  const [cafe24MallId, setMallId] = useState<string | null>(null);
  const [status, setStatus] = useState<InstagramStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [instagramAuthUrl, setInstagramAuthUrl] = useState<string>('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const mallId = urlParams.get('state');
    setMallId(mallId);

    if (mallId) {
      checkInstagramStatus(mallId);
      fetchInstagramAuthUrl(mallId);
    }
  }, []);

  const checkInstagramStatus = async (mallId: string) => {
    try {
      const response = await fetch(`/api/auth/instagram/status?state=${mallId}`);
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Instagram 상태 확인 중 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInstagramAuthUrl = async (state: string) => {
    try {
      const response = await fetch(`/api/auth/instagram/get-auth-url?state=${state}`);
      const data = await response.json();
      setInstagramAuthUrl(data.url);
    } catch (error) {
      console.error('Instagram 인증 URL 가져오기 실패:', error);
    }
  };

  const disconnectInstagram = async () => {
    try {
      setError(null);
      setLoading(true); // 로딩 상태 추가
      
      const response = await fetch(`/api/auth/instagram/disconnect?state=${cafe24MallId}`, {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (response.ok) {
        await checkInstagramStatus(cafe24MallId!);
      } else {
        setError(data.error || 'Instagram 연동 해제에 실패했습니다.');
        console.error('연동 해제 실패:', data);
      }
    } catch (error) {
      setError('Instagram 연동 해제 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      console.error('Instagram 연동 해제 중 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">📷 Instagram 연동</h2>
      <div className="bg-white p-6 rounded-lg shadow">
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
            ❌ {error}
          </div>
        )}
        {loading ? (
          <p>상태 확인 중...</p>
        ) : status?.isConnected ? (
          <div>
            <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-lg">
              <p>✅ Instagram 계정이 연동되었습니다.</p>
              <p className="text-sm mt-2">
                연동된 계정 ID:{' '}
                <a
                  href={`https://instagram.com/${status.userName}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black hover:text-slate-400"
                >
                  {status.userName}
                </a>
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => checkInstagramStatus(cafe24MallId!)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                상태 새로고침
              </button>
              <button
                onClick={disconnectInstagram}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                연동 해제
              </button>
            </div>
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
