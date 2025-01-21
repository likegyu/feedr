'use client';

import React from 'react';
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Highlight, themes } from 'prism-react-renderer';
import { Files } from 'lucide-react';

const theme = themes.github;
const exampleCode = `// 예시 코드가 들어갈 자리\nconst example = "Hello, World!";\nconsole.log(example);`;
const authCode = `Authorization:\nBearer YOUR_ACCESS_TOKEN`;

interface CodeBlockProps {
  code: string;
  language: string;
  filePath?: string;
  onCopy: () => void;
}

const CodeBlockHeader = ({ filePath, onCopy }: { filePath?: string; onCopy: () => void }) => (
  <div className="flex justify-between items-center px-4 py-2 bg-white border-b rounded-t-lg">
    <div className="text-sm text-gray-600 font-mono">
      {filePath || '예제 코드'}
    </div>
    <button
      onClick={onCopy}
      className="px-3 py-1 text-gray-500 hover:text-black transition-colors"
    >
      <Files size={16}/>
    </button>
  </div>
);

const CodeBlock = ({ code, language, filePath, onCopy }: CodeBlockProps) => (
  <div className="rounded-lg overflow-hidden border shadow-sm">
    <CodeBlockHeader filePath={filePath} onCopy={onCopy} />
    <Highlight code={code} language={language} theme={theme}>
      {({ className, tokens, getLineProps, getTokenProps }) => (
        <pre className={`${className} p-4 m-0 bg-gray-50 overflow-x-auto whitespace-break-spaces break-all`}>
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line })} className="flex gap-3 border-collapse border-b border-b-slate-200 select-text">
              <span className="text-gray-500 pr-4 select-none w-[2.5em] text-right flex-shrink-0 content-center">
                {i + 1}
              </span>
              <span>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </span>
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  </div>
);

const ApiDocs = () => {
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('코드가 클립보드에 복사되었습니다.');
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

            {/* API 문서의 추가 섹션들이 이어집니다 */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiDocs;