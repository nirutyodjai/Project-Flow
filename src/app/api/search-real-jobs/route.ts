import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/search-real-jobs
 * ค้นหางานประมูลจริงจากอินเทอร์เน็ตด้วย Brave Search API
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, site = 'gprocurement.go.th' } = body;

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.BRAVE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Brave API Key not configured' },
        { status: 500 }
      );
    }

    // สร้าง search query - ค้นหาทั่วไปก่อน ไม่จำกัด site
    const searchQuery = `${query} งานประมูล ประกาศ`;

    console.log('Searching with Brave API:', searchQuery);

    // เรียก Brave Search API
    const response = await fetch(
      `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(searchQuery)}&count=20&country=TH`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip',
          'X-Subscription-Token': apiKey,
        },
      }
    );

    console.log('Brave API Status:', response.status);

    if (!response.ok) {
      throw new Error(`Brave API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Brave API Response:', JSON.stringify(data, null, 2));

    // แปลงผลลัพธ์เป็นรูปแบบที่ใช้งานง่าย
    const results = (data.web?.results || []).map((result: any) => ({
      title: result.title,
      description: result.description,
      url: result.url,
      age: result.age,
      language: result.language,
    }));

    console.log(`Found ${results.length} results from Brave Search`);

    return NextResponse.json({
      success: true,
      query: searchQuery,
      total: results.length,
      results,
      source: 'Brave Search API',
      rawData: data, // เพิ่ม raw data เพื่อ debug
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in Brave Search:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Search failed',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/search-real-jobs
 * ทดสอบ API
 */
export async function GET() {
  const apiKey = process.env.BRAVE_API_KEY;
  
  return NextResponse.json({
    status: apiKey ? 'ready' : 'not configured',
    message: apiKey 
      ? 'Brave Search API is ready to use' 
      : 'Please set BRAVE_API_KEY in .env file',
  });
}
