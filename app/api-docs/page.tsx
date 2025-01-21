'use client';

import React from 'react';
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Highlight, themes } from 'prism-react-renderer';

const theme = themes.github;
const exampleCode = `// 예시 코드가 들어갈 자리\nconst example = "Hello, World!";\nconsole.log(example);`;
const authCode = `Authorization:\nBearer YOUR_ACCESS_TOKEN`;

const ApiDocs = () => {
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('코드가 클립보드에 복사되었습니다.');
    }).catch(err => {
      console.error('복사 실패:', err);
    });
  };

  const renderCodeBlock = (code: string, language: string) => (
    <Highlight code={code} language={language} theme={theme}>
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre className={`${className} p-4 rounded-lg shadow-lg select-text bg-gray-100 text-gray-800`}>
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line })} className="table-row border-b border-gray-200 leading-7">
              <span className="table-cell text-right text-gray-500 pr-4 select-none">{i + 1}</span>
              <span className="table-cell pl-4">
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </span>
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  );

  return (
    <div className="max-w-screen-xl mx-auto p-4 space-y-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">API 문서</h2>
      <Card>
        <CardContent className="p-6 sm:p-8">
          <div className="space-y-8 w-full">

            <section className="space-y-4">
              <CardTitle className="text-xl text-gray-800">API 시작하기</CardTitle>
              <p className="text-gray-600">
                API 연동을 위한 기본 가이드입니다. 아래 설명을 따라 진행해주세요.
              </p>
              <div className="bg-white p-4 rounded-lg shadow relative">
                <button
                  onClick={() => handleCopy(exampleCode)}
                  className="absolute top-2 right-2 bg-gray-200 p-1 rounded text-xs"
                >
                  복사
                </button>
                {renderCodeBlock(exampleCode, 'javascript')}
              </div>
            </section>

            <Separator className="my-6" />

            <section className="space-y-4">
              <CardTitle className="text-xl text-gray-800">인증</CardTitle>
              <p className="text-gray-600">
                API 인증 방식에 대한 설명입니다. 안전한 API 사용을 위해 반드시 확인해주세요.
              </p>
              <div className="bg-white p-4 rounded-lg shadow relative">
                <button
                  onClick={() => handleCopy(authCode)}
                  className="absolute top-2 right-2 bg-gray-200 p-1 rounded text-xs"
                >
                  복사
                </button>
                <h3 className="text-sm font-medium text-gray-700 mb-2">인증 헤더</h3>
                {renderCodeBlock(authCode, 'bash')}
              </div>
            </section>

            {/* API 문서의 추가 섹션들이 이어집니다 */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiDocs;