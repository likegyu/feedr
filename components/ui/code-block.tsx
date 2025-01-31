"use client";

import React from "react";
import { Highlight, themes } from "prism-react-renderer";
import { Check, Copy } from "lucide-react";

interface CodeBlockProps {
  code: string;
  language: string;
  filePath?: string;
  maxHeight?: string;
  onCopy?: () => void;
}

const CodeBlockHeader = ({
  filePath,
  onCopy,
}: {
  filePath?: string;
  onCopy?: () => void;
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    onCopy?.();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex justify-between items-center px-4 py-2 bg-[#f6f8fa] border-b">
      <div className="flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
          <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
        </div>
        <span className="text-sm text-gray-600 !font-geistMono ml-2">
          {filePath || "예제 코드"}
        </span>
      </div>
      <button
        onClick={handleCopy}
        className="p-2 hover:bg-gray-100 rounded-md transition-colors"
      >
        {copied ? (
          <Check size={16} className="text-green-500" />
        ) : (
          <Copy size={16} className="text-gray-500" />
        )}
      </button>
    </div>
  );
};

export function CodeBlock({
  code,
  language,
  filePath,
  maxHeight = "500px",
  onCopy,
}: CodeBlockProps) {
  const theme = themes.github;
  const handleCopy = () => {
    if (onCopy) {
      onCopy();
    } else {
      navigator.clipboard.writeText(code);
    }
  };

  return (
    <div className="rounded-lg overflow-hidden border shadow-sm mx-auto max-w-60vw">
      <CodeBlockHeader filePath={filePath} onCopy={handleCopy} />
      <div style={{ maxHeight }} className="overflow-auto  bg-[#fbfbfb]">
        <Highlight code={code} language={language} theme={theme}>
          {({ className, tokens, getLineProps, getTokenProps }) => (
            <pre className={`${className} p-4 m-0 !font-geistMono`}>
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line })} className="table-row">
                  <span className="pr-4 text-gray-400 select-none w-[2.5em]">
                    {i + 1}
                  </span>
                  <span className="select-text">
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
    </div>
  );
}
