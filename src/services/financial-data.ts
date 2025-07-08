'use server';
/**
 * @fileOverview A mock service for fetching financial data.
 */

/**
 * Fetches a mock stock price for a given ticker symbol.
 * In a real application, this would call a financial data API.
 * @param {string} ticker The stock ticker symbol.
 * @returns {Promise<number>} A promise that resolves to the mock stock price.
 */
export async function getStockPrice(ticker: string): Promise<number> {
  console.log(`Fetching mock stock price for ${ticker}`);
  // Simulate API call with a random price
  const mockPrice = Math.random() * 200 + 50; // Random price between 50 and 250
  return Promise.resolve(parseFloat(mockPrice.toFixed(2)));
}

/**
 * Fetches mock market news for a given ticker symbol.
 * @param {string} ticker The stock ticker symbol.
 * @returns {Promise<string[]>} A promise that resolves to an array of mock news headlines.
 */
export async function getMarketNews(ticker: string): Promise<string[]> {
    console.log(`Fetching mock market news for ${ticker}`);
    const mockNews = [
        `ข่าวดี! บริษัท ${ticker} ประกาศผลประกอบการไตรมาสล่าสุดดีเกินคาด`,
        `นักวิเคราะห์ปรับเพิ่มเป้าหมายราคาหุ้น ${ticker} หลังเห็นแนวโน้มการเติบโต`,
        `ตลาดกังวลเกี่ยวกับอัตราเงินเฟ้อ อาจส่งผลกระทบต่อหุ้นกลุ่มเทคโนโลยีรวมถึง ${ticker}`,
        `${ticker} เตรียมเปิดตัวผลิตภัณฑ์ใหม่ในเดือนหน้า สร้างความคาดหวังให้นักลงทุน`,
    ];
    // Return a random subset of news
    return Promise.resolve(mockNews.sort(() => 0.5 - Math.random()).slice(0, 2));
}
