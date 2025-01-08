// ~/app/dashboard/page.tsx
'use client';

import React, { useEffect, useState } from 'react';

const Dashboard = () => {
  const [storeName, setStoreName] = useState<string>('');
  const [mallId, setMallId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const mallId = urlParams.get('mall_id');

    if (!mallId) {
      setError('Mall ID is missing');
      setLoading(false);
      return;
    }

    setMallId(mallId);

    fetch(`/api/auth/cafe24/store-token?mall_id=${mallId}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          setLoading(false);
          return;
        }

        const { access_token } = data;
        fetchStoreName(access_token, mallId);
      })
      .catch((error) => {
        setError('Failed to fetch access token');
        setLoading(false);
        console.error('Error fetching access token:', error); // 오류를 콘솔에 출력
      });
  }, []);

  const fetchStoreName = async (accessToken: string, mallId: string) => {
    // store-name API를 호출하여 상점 이름을 가져옵니다.
    fetch(`/api/auth/cafe24/store-name?mall_id=${mallId}&access_token=${accessToken}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          setLoading(false);
          return;
        }

        setStoreName(data.shop_name);
        setLoading(false);
      })
      .catch((error) => {
        setError('Failed to fetch store name');
        setLoading(false);
        console.error('Error fetching store name:', error);
      });
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Mall ID: {mallId}</p>
      <p>Shop Name: {storeName}</p>
    </div>
  );
};

export default Dashboard;
