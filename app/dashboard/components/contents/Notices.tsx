'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const Notices = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">📢 공지사항</h2>
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <CardTitle className="text-lg">서비스 정기 점검 안내</CardTitle>
              <p className="text-sm text-muted-foreground">2024.01.15</p>
              <p className="mt-2">정기 점검으로 인한 서비스 일시 중단 안내입니다.</p>
            </div>
            <Separator />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Notices;
