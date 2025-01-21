'use client';

import React from 'react';
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CodeBlock, dracula } from "react-code-blocks";

const ApiDocs = () => {
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
                <div className="bg-gray-50 p-4 rounded-lg">
                  <CodeBlock
                    text="// 예시 코드가 들어갈 자리"
                    language="javascript"
                    showLineNumbers={false}
                    theme={dracula}
                  />
                </div>
              </section>
              
              <Separator className="my-6" />
              
              <section className="space-y-4">
                <CardTitle className="text-xl text-gray-800">인증</CardTitle>
                <p className="text-gray-600">
                  API 인증 방식에 대한 설명입니다. 안전한 API 사용을 위해 반드시 확인해주세요.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">인증 헤더</h3>
                  <CodeBlock
                    text="Authorization: Bearer YOUR_ACCESS_TOKEN"
                    language="bash"
                    showLineNumbers={false}
                    theme={dracula}
                  />
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
