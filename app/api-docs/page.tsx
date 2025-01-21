'use client';

import React from 'react';
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CodeBlock } from "@/components/ui/code-block";

const exampleCode = `// 예시 코드가 들어갈 자리\nconst example = "Hello, World!";\nconsole.log(example);`;
const authCode = `Authorization:\nBearer YOUR_ACCESS_TOKEN`;

const ApiDocs = () => {
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('클립보드에 복사되었습니다.');
    }).catch(err => {
      console.error('복사 실패:', err);
    });
  };

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
              <CodeBlock
                code={exampleCode}
                language="javascript"
                filePath="example.js"
                onCopy={() => handleCopy(exampleCode)}
              />
            </section>

            <Separator className="my-6" />

            <section className="space-y-4">
              <CardTitle className="text-xl text-gray-800">인증</CardTitle>
              <p className="text-gray-600">
                API 인증 방식에 대한 설명입니다. 안전한 API 사용을 위해 반드시 확인해주세요.
              </p>
              <CodeBlock
                code={authCode}
                language="bash"
                filePath="auth-example.sh"
                onCopy={() => handleCopy(authCode)}
              />
            </section>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiDocs;