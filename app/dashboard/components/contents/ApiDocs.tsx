'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

const ApiDocs = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">📘 API 문서</h2>
      <Card>
        <CardContent className="p-6">
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-6">
              <section>
                <CardTitle className="mb-3">API 시작하기</CardTitle>
                <p className="text-muted-foreground">API 연동을 위한 기본 가이드입니다.</p>
              </section>
              <section>
                <CardTitle className="mb-3">인증</CardTitle>
                <p className="text-muted-foreground">API 인증 방식에 대한 설명입니다.</p>
              </section>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiDocs;
