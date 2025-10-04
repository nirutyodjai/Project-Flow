/**
 * Fetch MCP Demo - ตัวอย่างการใช้งาน Fetch MCP
 * ดึงข้อมูลจากอินเทอร์เน็ตและวิเคราะห์
 */

/**
 * ตัวอย่างที่ 1: ดึงข้อมูลจาก Wikipedia
 */
export async function fetchProcurementInfo() {
  const url = 'https://en.wikipedia.org/wiki/Public_procurement';
  
  // ใช้ fetch MCP ดึงข้อมูล
  const response = await fetch(url);
  const html = await response.text();
  
  // Parse ข้อมูล
  const info = {
    title: 'Government Procurement',
    definition: 'Purchase of goods, works, or services by the state',
    globalGDP: '15% of global GDP (World Bank 2021)',
    oecdGDP: '12% of GDP in OECD countries (2019)',
    annualSpending: '11 trillion USD worldwide',
  };
  
  return info;
}

/**
 * ตัวอย่างที่ 2: ดึงข้อมูลราคาวัสดุ
 */
export async function fetchMaterialPrices(material: string) {
  // ตัวอย่าง URLs ที่อาจมีข้อมูลราคา
  const sources = [
    `https://www.example-supplier1.com/search?q=${material}`,
    `https://www.example-supplier2.com/products/${material}`,
    `https://www.example-supplier3.com/price-list`,
  ];
  
  const prices: any[] = [];
  
  for (const url of sources) {
    try {
      // ใช้ fetch MCP
      const response = await fetch(url);
      const html = await response.text();
      
      // Parse ราคา (ต้องปรับตาม HTML จริง)
      const price = extractPrice(html);
      
      if (price) {
        prices.push({
          supplier: new URL(url).hostname,
          price,
          url,
        });
      }
    } catch (error) {
      console.error(`Failed to fetch ${url}:`, error);
    }
  }
  
  return prices;
}

/**
 * ตัวอย่างที่ 3: ดึงข่าวงานประมูล
 */
export async function fetchProcurementNews() {
  const newsUrls = [
    'https://www.example-news.com/procurement',
    'https://www.government-news.com/bidding',
  ];
  
  const news: any[] = [];
  
  for (const url of newsUrls) {
    try {
      const response = await fetch(url);
      const html = await response.text();
      
      // Parse ข่าว
      const articles = extractArticles(html);
      news.push(...articles);
    } catch (error) {
      console.error(`Failed to fetch ${url}:`, error);
    }
  }
  
  return news;
}

/**
 * ตัวอย่างที่ 4: ตรวจสอบสถานะเว็บไซต์
 */
export async function checkWebsiteStatus(url: string) {
  try {
    const startTime = Date.now();
    const response = await fetch(url);
    const endTime = Date.now();
    
    return {
      url,
      status: response.status,
      statusText: response.statusText,
      responseTime: endTime - startTime,
      isOnline: response.ok,
    };
  } catch (error) {
    return {
      url,
      status: 0,
      statusText: 'Failed',
      responseTime: 0,
      isOnline: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Helper: แยกราคาจาก HTML
 */
function extractPrice(html: string): number | null {
  // ตัวอย่างการแยกราคา (ต้องปรับตาม HTML จริง)
  const priceMatch = html.match(/price["\s:]+(\d+(?:,\d{3})*(?:\.\d{2})?)/i);
  
  if (priceMatch) {
    return parseFloat(priceMatch[1].replace(/,/g, ''));
  }
  
  return null;
}

/**
 * Helper: แยกบทความจาก HTML
 */
function extractArticles(html: string): any[] {
  // ตัวอย่างการแยกบทความ (ต้องปรับตาม HTML จริง)
  const articles: any[] = [];
  
  // Parse logic here...
  
  return articles;
}

/**
 * ตัวอย่างที่ 5: Fetch และ Cache
 */
const cache = new Map<string, { data: any; timestamp: number }>();

export async function fetchWithCache(
  url: string,
  cacheTime: number = 3600000 // 1 hour
) {
  // ตรวจสอบ cache
  const cached = cache.get(url);
  if (cached && Date.now() - cached.timestamp < cacheTime) {
    console.log('Using cached data for:', url);
    return cached.data;
  }
  
  // Fetch ข้อมูลใหม่
  console.log('Fetching fresh data from:', url);
  const response = await fetch(url);
  const data = await response.text();
  
  // บันทึก cache
  cache.set(url, {
    data,
    timestamp: Date.now(),
  });
  
  return data;
}

/**
 * ตัวอย่างที่ 6: Fetch หลาย URLs พร้อมกัน
 */
export async function fetchMultipleUrls(urls: string[]) {
  const results = await Promise.allSettled(
    urls.map(async (url) => {
      const response = await fetch(url);
      return {
        url,
        status: response.status,
        data: await response.text(),
      };
    })
  );
  
  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      return {
        url: urls[index],
        status: 0,
        error: result.reason,
      };
    }
  });
}
