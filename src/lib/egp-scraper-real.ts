/**
 * e-GP Real Scraper - ดึงข้อมูลจริงจาก e-GP
 * ใช้ Puppeteer scrape ข้อมูลจาก https://process3.gprocurement.go.th
 */

import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';

export interface RealProject {
  id: string;
  projectName: string;
  organization: string;
  budget: string;
  announcementDate: string;
  closingDate: string;
  projectType: string;
  method: string;
  description: string;
  sourceUrl: string;
  documentUrl?: string;
}

/**
 * Scrape งานประมูลจาก e-GP
 */
export async function scrapeEGPProjects(
  keyword: string = '',
  options: {
    limit?: number;
    headless?: boolean;
    timeoutMs?: number;
    retries?: number;
  } = {}
): Promise<RealProject[]> {
  const { limit = 20, headless = true, timeoutMs = 60000, retries = 2 } = options;
  
  console.log(`🚀 Starting e-GP scraper for keyword: "${keyword}"`);
  
  let lastError: unknown;
  for (let attempt = 1; attempt <= retries; attempt++) {
    let browser;
    try {
      // เปิด browser
      const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || undefined;
      browser = await puppeteer.launch({
        headless,
        executablePath,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
        ],
      });

      const page = await browser.newPage();
    
    // ตั้งค่า User Agent
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    // ไปที่หน้าค้นหา e-GP
    const searchUrl = keyword
      ? `https://process3.gprocurement.go.th/egp2procmainWeb/jsp/announcement/announcementList.jsp?searchText=${encodeURIComponent(keyword)}`
      : 'https://process3.gprocurement.go.th/egp2procmainWeb/jsp/announcement/announcementList.jsp';

    console.log(`📍 Navigating to: ${searchUrl}`);
    
      await page.goto(searchUrl, {
        waitUntil: 'networkidle2',
        timeout: timeoutMs,
      });

    // รอให้โหลดข้อมูล (sleep 3s)
      await new Promise((r) => setTimeout(r, 3000));

    // ดึง HTML
      const html = await page.content();
      const $ = cheerio.load(html);

      const projects: RealProject[] = [];

    // Parse ข้อมูลจาก HTML (ต้องปรับตาม structure จริงของ e-GP)
    $('.announcement-item, .project-item, tr.data-row').each((index, element) => {
      if (projects.length >= limit) return false;

      try {
        const $el = $(element);
        
        // ดึงข้อมูลจาก element (ต้องปรับตาม HTML จริง)
        const projectName = $el.find('.project-name, .title, td:nth-child(2)').text().trim();
        const organization = $el.find('.organization, .agency, td:nth-child(3)').text().trim();
        const budget = $el.find('.budget, .price, td:nth-child(4)').text().trim();
        const closingDate = $el.find('.closing-date, .deadline, td:nth-child(5)').text().trim();
        const projectUrl = $el.find('a').attr('href') || '';

        if (projectName) {
          projects.push({
            id: `EGP-REAL-${Date.now()}-${index}`,
            projectName,
            organization: organization || 'ไม่ระบุหน่วยงาน',
            budget: budget || 'ไม่ระบุงบประมาณ',
            announcementDate: new Date().toISOString().split('T')[0],
            closingDate: closingDate || 'ไม่ระบุ',
            projectType: 'ภาครัฐ',
            method: 'ดูรายละเอียดในเว็บไซต์',
            description: projectName,
            sourceUrl: projectUrl.startsWith('http') 
              ? projectUrl 
              : `https://process3.gprocurement.go.th${projectUrl}`,
          });
        }
      } catch (error) {
        console.error('Error parsing project:', error);
      }
    });

      console.log(`✅ Found ${projects.length} projects from e-GP`);
      await browser.close();
      return projects;
    } catch (error) {
      lastError = error;
      console.error(`❌ Error scraping e-GP (attempt ${attempt}/${retries}):`, error);
      try {
        if (browser) await browser.close();
      } catch (closeErr) {
        console.warn('puppeteer close error (ignored):', closeErr);
      }
      // หน่วงก่อนลองใหม่เล็กน้อย
      if (attempt < retries) await new Promise((r) => setTimeout(r, 1500));
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Scraping failed');
}

/**
 * Scrape งานประมูลจากหลายแหล่ง
 */
export async function scrapeMultipleSources(
  keyword: string,
  sources: string[] = ['egp']
): Promise<RealProject[]> {
  const allProjects: RealProject[] = [];

  for (const source of sources) {
    try {
      if (source === 'egp') {
        const projects = await scrapeEGPProjects(keyword, { limit: 20 });
        allProjects.push(...projects);
      }
      // เพิ่ม sources อื่นๆ ได้ที่นี่
    } catch (error) {
      console.error(`Error scraping ${source}:`, error);
    }
  }

  return allProjects;
}

/**
 * ทดสอบการเชื่อมต่อ e-GP
 */
export async function testEGPConnection(): Promise<{
  success: boolean;
  message: string;
  statusCode?: number;
}> {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    const response = await page.goto('https://process3.gprocurement.go.th', {
      waitUntil: 'networkidle2',
      timeout: 15000,
    });

    await browser.close();

    return {
      success: response?.ok() || false,
      message: response?.ok() ? 'เชื่อมต่อ e-GP สำเร็จ' : 'ไม่สามารถเชื่อมต่อ e-GP',
      statusCode: response?.status(),
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Connection failed',
    };
  }
}
