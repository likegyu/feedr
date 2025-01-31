"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { useAuthDialog } from "@/components/auth-dialog-provider";

export type MediaFilter = "all" | "image" | "video";

const FeedFilter = () => {
  const { onOpen } = useAuthDialog();
  const [loading, setLoading] = useState(true);
  const [isCafe24TokenValid, setIsCafe24TokenValid] = useState<boolean | null>(
    null
  );
  const [isInstagramConnected, setIsInstagramConnected] = useState<
    boolean | null
  >(null);
  const [selectedFilter, setSelectedFilter] = useState<MediaFilter>("all");
  const [savedFilter, setSavedFilter] = useState<MediaFilter>("all");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Cafe24 토큰 만료 체크
        const tokenResponse = await fetch(
          "/api/auth/cafe24/token-expires-check"
        );
        const tokenData = await tokenResponse.json();
        const isTokenValid =
          tokenData?.data?.cafe24ExpiresAt &&
          new Date(tokenData.data.cafe24ExpiresAt) > new Date();
        setIsCafe24TokenValid(isTokenValid);

        // Instagram 연동 상태 체크
        const instaResponse = await fetch("/api/auth/instagram/status");
        const instaData = await instaResponse.json();
        setIsInstagramConnected(instaData.data.isConnected); // .data 추가

        // 인증이 유효한 경우에만 필터 설정 로드
        if (isTokenValid && instaData.isConnected) {
          const filterResponse = await fetch("/api/feedfilter/get");
          if (!filterResponse.ok) throw new Error("필터 조회 실패");
          const filterData = await filterResponse.json();
          setSelectedFilter(filterData.filter);
          setSavedFilter(filterData.filter);
        }
      } catch (error) {
        console.error("데이터 로드 중 오류:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // 필터 적용
  const handleApplyFilter = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/feedfilter/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filter: selectedFilter }),
      });

      if (!response.ok) throw new Error("필터 저장 실패");
      const data = await response.json();
      setSavedFilter(data.filter);

      // Cafe24 스크립트 업데이트
      const scriptResponse = await fetch("/api/cafe24-script/put", {
        method: "PUT",
      });

      if (!scriptResponse.ok) {
        console.error("Cafe24 스크립트 업데이트 실패");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-screen-2xl mx-auto p-4 space-y-6">
        <h2 className="text-2xl font-bold mb-4">필터 설정</h2>
        <Card>
          <CardContent className="space-y-4 p-6">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isCafe24TokenValid) {
    return (
      <div className="max-w-screen-2xl mx-auto p-4 space-y-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">필터 설정</h2>
        <Alert className="bg-blue-50 border-blue-200">
          <AlertDescription className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-500" />
              <span>
                설정을 사용하기 위해서는 먼저 Cafe24에 로그인해주세요.
              </span>
            </div>
            <Button
              onClick={onOpen}
              variant="default"
              className="bg-blue-500 hover:bg-blue-600 transition-colors "
            >
              로그인
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!isInstagramConnected) {
    return (
      <div className="max-w-screen-2xl mx-auto p-4 space-y-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">필터 설정</h2>
        <Alert className="bg-gradient-to-r from-[#fdf5e6] to-[#fef1f6] border-[#fbcac9]">
          <AlertDescription className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-[#fbcac9]" />
              <span>
                설정을 사용하기 위해서는 먼저 Instagram 계정을 연동해주세요.
              </span>
            </div>
            <Button
              variant="default"
              className="bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCB045] hover:brightness-110 text-white font-bold transition-all"
              asChild
            >
              <a href="/instagram">연동하기</a>
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleFilterChange = (value: string) => {
    setSelectedFilter(value as MediaFilter);
  };

  return (
    <div className="max-w-screen-2xl mx-auto p-4 space-y-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">필터 설정</h2>
      <Card>
        <CardContent className="p-6 sm:p-8 space-y-6">
          <RadioGroup
            value={selectedFilter}
            onValueChange={handleFilterChange}
            className="space-y-4"
          >
            <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <RadioGroupItem value="all" id="all" />
              <Label htmlFor="all" className="text-gray-700 cursor-pointer">
                모든 미디어
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <RadioGroupItem value="image" id="image" />
              <Label htmlFor="image" className="text-gray-700 cursor-pointer">
                사진만
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <RadioGroupItem value="video" id="video" />
              <Label htmlFor="video" className="text-gray-700 cursor-pointer">
                동영상만
              </Label>
            </div>
          </RadioGroup>

          <div className="pt-4 border-t">
            <Button
              onClick={handleApplyFilter}
              className="w-full bg-blue-600 hover:bg-blue-700 transition-colors"
              disabled={loading || selectedFilter === savedFilter}
            >
              {loading ? "저장 중..." : "필터 적용"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeedFilter;
