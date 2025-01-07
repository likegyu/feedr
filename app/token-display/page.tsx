// ~app/token-display/page.tsx
'use client'

import { useEffect, useState } from 'react';

const TokenDisplayPage = () => {
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    // URL에서 액세스 토큰을 추출
    const params = new URLSearchParams(window.location.search);
    const token = params.get('access_token');
    setAccessToken(token);
  }, []);

  return (
    <div>
      {accessToken ? (
        <div>
          <h1>Your Access Token:</h1>
          <pre>{accessToken}</pre>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default TokenDisplayPage;
