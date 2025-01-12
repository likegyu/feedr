'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

export type MediaFilter = 'all' | 'image' | 'video';

const FeedFilter = () => {
  const [isInstagramConnected, setIsInstagramConnected] = useState<boolean>(false);
  const [selectedFilter, setSelectedFilter] = useState<MediaFilter>('all');
  const [savedFilter, setSavedFilter] = useState<MediaFilter>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // DB에서 현재 필터 설정 가져오기
  useEffect(() => {
    const checkInstagramStatus = async () => {
      try {
        const response = await fetch('/api/auth/instagram/status');
        const data = await response.json();
        setIsInstagramConnected(data.isConnected);
        
        // Instagram이 연동된 경우에만 필터 설정을 가져옴
        if (data.isConnected) {
          const filterResponse = await fetch('/api/feedfilter/get');
          if (!filterResponse.ok) throw new Error('필터 조회 실패');
          const filterData = await filterResponse.json();
          setSelectedFilter(filterData.filter);
          setSavedFilter(filterData.filter);
        }
      } catch (error) {
        setError('상태 확인에 실패했습니다.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    checkInstagramStatus();
  }, []);

  // 필터 적용
  const handleApplyFilter = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/feedfilter/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filter: selectedFilter }),
      });

      if (!response.ok) throw new Error('필터 저장 실패');
      const data = await response.json();
      setSavedFilter(data.filter);
    } catch (error) {
      setError('필터 적용에 실패했습니다.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>미디어 필터</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!isInstagramConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>미디어 필터</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              필터 설정을 사용하기 위해서는 먼저 Instagram 계정을 연동해주세요.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const handleFilterChange = (value: string) => {
    setSelectedFilter(value as MediaFilter);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>미디어 필터</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={selectedFilter}
          onValueChange={handleFilterChange}
        >
          <div className="flex items-center space-x-2 mb-2">
            <RadioGroupItem value="all" id="all" />
            <Label htmlFor="all">모든 미디어</Label>
          </div>
          <div className="flex items-center space-x-2 mb-2">
            <RadioGroupItem value="image" id="image" />
            <Label htmlFor="image">사진만</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="video" id="video" />
            <Label htmlFor="video">동영상만</Label>
          </div>
        </RadioGroup>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleApplyFilter}
          className="w-full"
          disabled={loading || selectedFilter === savedFilter}
        >
          {loading ? '저장 중...' : '필터 적용'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FeedFilter;
