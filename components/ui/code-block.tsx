'use client';

import React from 'react';
import { Highlight, themes } from 'prism-react-renderer';
import { Files } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language: string;
  filePath?: string;
  onCopy?: () => void;
}

const CodeBlockHeader = ({ filePath, onCopy }: { filePath?: string; onCopy?: () => void }) => (
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

export function CodeBlock({ code, language, filePath, onCopy }: CodeBlockProps) {
  const theme = themes.github;
  const handleCopy = () => {
    if (onCopy) {
      onCopy();
    } else {
      navigator.clipboard.writeText(code).then(() => {
        alert('클립보드에 복사되었습니다.');
      }).catch(err => {
        console.error('복사 실패:', err);
      });
    }
  };

  return (
    <div className="rounded-lg overflow-hidden border shadow-sm">
      <CodeBlockHeader filePath={filePath} onCopy={handleCopy} />
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
}