'use client';

import React, { useEffect, useState } from 'react';

const Dashboard = () => {
  const [storeName, setStoreName] = useState<string>('');
  const [mallId, setMallId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // URL 파라미터에서 mall_id 추출
    const urlParams = new URLSearchParams(window.location.search);
    const mallId = urlParams.get('mall_id');

    if (!mallId) {
      setError('Mall ID is missing');
      setLoading(false);
      return;
    }

    setMallId(mallId);

    // DB에서 mall_id에 해당하는 access_token을 가져옴
    fetch(`/api/auth/store-token?mall_id=${mallId}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          setLoading(false);
          return;
        }

        const { access_token } = data;  // 여기서 access_token을 가져옴
        fetchStoreName(access_token, mallId); // access_token을 넘겨서 store 정보 가져오기
      })
      .catch(() => {  // err 변수를 사용하지 않음
        setError('Failed to fetch access token');
        setLoading(false);
      });
  }, []);

  const fetchStoreName = async (accessToken: string, mallId: string) => {
    const url = `https://${mallId}.cafe24api.com/api/v2/admin/store?fields=shop_name&shop_no=1`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,  // 여기서 accessToken을 사용
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        setError('Failed to fetch store name');
        setLoading(false);
        return;
      }

      const data = await response.json();
      setStoreName(data.shop_name);
      setLoading(false);
    } catch (error) {  // err 변수를 사용하지 않음
      setError('Failed to fetch store name');
      setLoading(false);
    }
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
