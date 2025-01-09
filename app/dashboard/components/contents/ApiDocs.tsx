'use client';

import React from 'react';

const ApiDocs = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">📘 API 문서</h2>
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="space-y-6">
          <section>
            <h3 className="text-xl font-semibold mb-3">API 시작하기</h3>
            <p className="text-gray-600">API 연동을 위한 기본 가이드입니다.</p>
          </section>
          <section>
            <h3 className="text-xl font-semibold mb-3">인증</h3>
            <p className="text-gray-600">API 인증 방식에 대한 설명입니다.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ApiDocs;
