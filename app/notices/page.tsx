'use client';

import React from 'react';
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const Notices = () => {
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">공지사항</h2>
      <Card className="shadow-lg">
        <CardContent className="p-6 sm:p-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <CardTitle className="text-xl text-gray-800">서비스 정기 점검 안내</CardTitle>
              <p className="text-sm text-gray-500">2024.01.15</p>
              <p className="mt-4 text-gray-600">정기 점검으로 인한 서비스 일시 중단 안내입니다.</p>
            </div>
            <Separator className="my-6" />
            {/* ...other notices... */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Notices;
