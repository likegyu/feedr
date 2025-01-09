'use client';

import React from 'react';

const InstagramConnect = () => {
  const instagramAuthUrl = `https://api.instagram.com/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI}&scope=user_profile,user_media&response_type=code`;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">📷 Instagram 연동</h2>
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="mb-4">Instagram 계정을 연동하여 쇼핑몰에 Instagram 피드를 자동으로 게시하세요.</p>
        <a
          href={instagramAuthUrl}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Instagram 계정 연동하기
        </a>
      </div>
    </div>
  );
};

export default InstagramConnect;
