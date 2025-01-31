"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const Notices = () => {
  const [cafe24MallId, setCafe24MallId] = useState("");
  const [instagramUserName, setInstagramUserName] = useState("");

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        // 카페24 정보 가져오기
        const shopResponse = await fetch("/api/auth/cafe24/shop-name");
        const shopData = await shopResponse.json();
        if (shopData.data) {
          setCafe24MallId(shopData.data.cafe24MallId);
        }

        // 인스타그램 정보 가져오기
        const instaResponse = await fetch("/api/auth/instagram/status");
        const instaData = await instaResponse.json();
        if (instaData.userName) {
          setInstagramUserName(instaData.userName);
        }
      } catch (error) {
        console.error("Failed to fetch info:", error);
      }
    };

    fetchInfo();
  }, []);

  return (
    <div className="max-w-screen-2xl mx-auto p-4 space-y-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">공지사항</h2>
      <Card>
        <CardContent className="p-6 sm:p-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <CardTitle className="text-xl text-gray-800">
                서비스 초기 설정 안내
              </CardTitle>
              <p className="text-sm text-gray-500">2024.01.15</p>
              <p className="pt-4 text-gray-600">
                카페24를 연동한 후 feedr 웹사이트에서 인스타그램으로 로그인
                하시면{" "}
                <a className="text-blue-600 hover:text-black" href="/instagram">
                  Instagram 연동
                </a>
                에서 배포(자동, 수동)가 가능합니다.
                <br />
                이후{" "}
                <a
                  className="text-blue-600 hover:text-black"
                  href="settings/mobile"
                >
                  피드 설정
                </a>
                에서 다양한 설정을 커스터마이징 하실 수 있습니다. feedr는
                자동으로 인스타그램에 피드를 실시간으로 요청하여 카페24에
                배포합니다.
                <br />
                다만, 서버의 안정을 위해 데이터를 5분간 로컬에 저장하여
                사용하므로 5분 이내에는 변경된 피드가 반영되지 않을 수 있습니다.
                변경된 피드를 즉시 보시길 원하는 경우 캐시를 삭제하시면 됩니다.
                <br />
                <br />
                feedr는 카페24에 배포된 인스타그램 피드가 클릭된 횟수를 수집하여
                통계를 제공합니다.{" "}
                <a className="text-blue-600 hover:text-black" href="/dashboard">
                  대시보드
                </a>
                에서 통계를 간편하게 확인하실 수 있습니다.
                <br />
                <br />
                연동에 필요한 구체적인 설명은
                <a className="text-blue-600 hover:text-black" href="/api-docs">
                  {" "}
                  API 문서
                </a>
                를 참고하여 주시기 바랍니다.
                <br />
                버그 제보나 추가적으로 원하는 기능이 있으시면 {`\n`}
                <a
                  className="text-blue-600 hover:text-black"
                  href={`mailto:admin@dstudio.com?subject=${encodeURIComponent(
                    `${cafe24MallId} | feedr 문의`
                  )}&body=${encodeURIComponent(
                    `카페24 ID: ${cafe24MallId}\n인스타그램 계정: ${instagramUserName}\n문의내용: `
                  )}`}
                >
                  @메일
                </a>
                로 문의부탁드립니다.
              </p>
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
