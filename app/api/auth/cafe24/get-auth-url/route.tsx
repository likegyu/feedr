import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mallId = searchParams.get('mallId');

  if (!mallId) {
    return NextResponse.json({ error: 'Mall ID is required' }, { status: 400 });
  }

  const baseUrl = `https://${mallId}.cafe24api.com`;

  try {
    // 해당 몰의 도메인이 유효한지 확인
    const checkResponse = await fetch(baseUrl);
    if (!checkResponse.ok) {
      return NextResponse.json(
        { error: '유효하지 않은 카페24 mall ID입니다. 다시 확인해주세요.' },
        { status: 400 }
      );
    }

    const authUrl = `${baseUrl}/api/v2/oauth/authorize?response_type=code&client_id=${process.env.CAFE24_CLIENT_ID}&state=${mallId}&redirect_uri=${process.env.CAFE24_REDIRECT_URI}&scope=mall.read_store,mall.read_application,mall.write_application,mall.write_design,mall.read_design`;

    return NextResponse.json({ url: authUrl });
  } catch (err: unknown) {
    console.error('Cafe24 auth error:', err);
    return NextResponse.json(
      { error: '유효하지 않은 카페24 ID 이거나, 카페24 서버에 연결할 수 없습니다.' },
      { status: 500 }
    );
  }
}
