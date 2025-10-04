# 🔌 MCP (Model Context Protocol) Setup Guide

**วันที่:** 3 ตุลาคม 2568  
**สถานะ:** ✅ ติดตั้งสำเร็จ

---

## 📦 MCP Servers ที่ติดตั้งแล้ว

### 1. **Brave Search MCP** 🔍
ค้นหาข้อมูลจากอินเทอร์เน็ตแบบ Real-time

**ความสามารถ:**
- ค้นหาข้อมูลงานประมูลล่าสุด
- ค้นหาราคาวัสดุก่อสร้าง
- ค้นหาข้อมูลบริษัทคู่แข่ง
- ค้นหาข่าวสารภาครัฐ

**การใช้งาน:**
```typescript
// ค้นหาข้อมูลงานประมูล
const results = await braveSearch({
  query: "งานประมูลก่อสร้าง 2568",
  count: 10
});
```

---

### 2. **Filesystem MCP** 📁
จัดการไฟล์และโฟลเดอร์

**ความสามารถ:**
- อ่าน/เขียนไฟล์
- สร้าง/ลบโฟลเดอร์
- ค้นหาไฟล์
- ดูโครงสร้างโปรเจกต์

**การใช้งาน:**
```typescript
// อ่านไฟล์ TOR
const content = await readFile({
  path: "./documents/TOR.pdf"
});

// สร้างโฟลเดอร์
await createDirectory({
  path: "./projects/new-project"
});
```

---

### 3. **GitHub MCP** 🐙
เชื่อมต่อกับ GitHub

**ความสามารถ:**
- ดู repositories
- อ่าน issues และ PRs
- ค้นหาโค้ด
- ดู commits

**การใช้งาน:**
```typescript
// ค้นหาโค้ดตัวอย่าง
const code = await searchGitHub({
  query: "construction bidding system",
  type: "code"
});
```

---

## 🚀 การตั้งค่า

### 1. Brave Search API Key

#### ขั้นตอน:
1. ไปที่ https://brave.com/search/api/
2. สมัครบัญชี (ฟรี 2,000 queries/เดือน)
3. สร้าง API Key
4. เพิ่มใน `.env`:

```env
# Brave Search API
BRAVE_API_KEY=your_brave_api_key_here
```

---

### 2. GitHub Token (Optional)

#### ขั้นตอน:
1. ไปที่ GitHub Settings → Developer settings
2. Personal access tokens → Generate new token
3. เลือก scopes: `repo`, `read:org`
4. เพิ่มใน `.env`:

```env
# GitHub API
GITHUB_TOKEN=ghp_xxxxxxxxxxxxx
```

---

## 💡 Use Cases สำหรับโปรเจกต์

### 1. **ค้นหางานประมูลจริง**
```typescript
// ใช้ Brave Search หางานประมูลล่าสุด
const procurementJobs = await braveSearch({
  query: "e-GP งานประมูล ก่อสร้าง site:gprocurement.go.th",
  freshness: "pd" // Past day
});
```

### 2. **ค้นหาราคาวัสดุ**
```typescript
// ค้นหาราคาวัสดุก่อสร้าง
const prices = await braveSearch({
  query: "ราคาเหล็กเส้น 2568",
  count: 5
});
```

### 3. **วิเคราะห์คู่แข่ง**
```typescript
// ค้นหาข้อมูลบริษัทคู่แข่ง
const competitors = await braveSearch({
  query: "บริษัทรับเหมาก่อสร้าง กรุงเทพ",
  count: 10
});
```

### 4. **จัดการเอกสาร**
```typescript
// อ่านไฟล์ TOR
const torContent = await readFile({
  path: "./uploads/TOR.pdf"
});

// วิเคราะห์ด้วย AI
const analysis = await analyzeDocument(torContent);

// บันทึกผลลัพธ์
await writeFile({
  path: "./results/analysis.json",
  content: JSON.stringify(analysis)
});
```

### 5. **ค้นหาโค้ดตัวอย่าง**
```typescript
// ค้นหาโค้ดตัวอย่างจาก GitHub
const examples = await searchGitHub({
  query: "procurement bidding system language:typescript",
  type: "code"
});
```

---

## 🔧 การใช้งานใน API Routes

### ตัวอย่าง: Search API with Brave

```typescript
// src/app/api/search-real-procurement/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { query } = await request.json();
  
  // ใช้ Brave Search
  const response = await fetch('https://api.search.brave.com/res/v1/web/search', {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'X-Subscription-Token': process.env.BRAVE_API_KEY!,
    },
    params: {
      q: `${query} site:gprocurement.go.th`,
      count: 10,
    }
  });
  
  const data = await response.json();
  
  return NextResponse.json({
    success: true,
    results: data.web?.results || [],
  });
}
```

---

## 📊 MCP Servers ที่แนะนำเพิ่มเติม

### 1. **Database MCP** (PostgreSQL/MySQL)
- เชื่อมต่อกับฐานข้อมูล
- Query ข้อมูลโดยตรง

### 2. **Slack MCP**
- ส่งการแจ้งเตือน
- รับข้อมูลจากทีม

### 3. **Google Drive MCP**
- อ่าน/เขียนไฟล์ใน Drive
- แชร์เอกสาร

### 4. **Email MCP**
- ส่งอีเมล
- อ่านอีเมล

---

## 🎯 ติดตั้ง MCP เพิ่มเติม

### Database MCP:
```bash
npm install -g @modelcontextprotocol/server-postgres
```

### Slack MCP:
```bash
npm install -g @modelcontextprotocol/server-slack
```

### Google Drive MCP:
```bash
npm install -g @modelcontextprotocol/server-gdrive
```

---

## 🔐 ความปลอดภัย

### Best Practices:
1. **ไม่ commit API Keys** - ใช้ `.env` เสมอ
2. **จำกัด Permissions** - ให้สิทธิ์แค่ที่จำเป็น
3. **Rate Limiting** - ป้องกันการใช้งานเกิน
4. **Validate Input** - ตรวจสอบข้อมูลก่อนส่ง API
5. **Error Handling** - จัดการ error อย่างเหมาะสม

---

## 📝 ตัวอย่างการใช้งานจริง

### 1. ค้นหางานประมูลอัตโนมัติ

```typescript
// src/lib/auto-search-procurement.ts
import { braveSearch } from '@modelcontextprotocol/server-brave-search';

export async function autoSearchProcurement(keywords: string[]) {
  const results = [];
  
  for (const keyword of keywords) {
    const searchResults = await braveSearch({
      query: `${keyword} งานประมูล site:gprocurement.go.th`,
      freshness: 'pw', // Past week
      count: 10
    });
    
    results.push(...searchResults.web.results);
  }
  
  return results;
}
```

### 2. วิเคราะห์เอกสาร TOR

```typescript
// src/lib/analyze-tor.ts
import { readFile } from '@modelcontextprotocol/server-filesystem';
import { analyzeWithAI } from '@/lib/ai';

export async function analyzeTOR(filePath: string) {
  // อ่านไฟล์
  const content = await readFile({ path: filePath });
  
  // วิเคราะห์ด้วย AI
  const analysis = await analyzeWithAI(content);
  
  // บันทึกผลลัพธ์
  await writeFile({
    path: `./results/${Date.now()}-analysis.json`,
    content: JSON.stringify(analysis, null, 2)
  });
  
  return analysis;
}
```

---

## 🎉 สรุป

**MCP Servers ที่ติดตั้งแล้ว:**
- ✅ Brave Search - ค้นหาข้อมูลจริง
- ✅ Filesystem - จัดการไฟล์
- ✅ GitHub - ค้นหาโค้ด

**ขั้นตอนถัดไป:**
1. สมัคร Brave Search API (ฟรี!)
2. เพิ่ม API Key ใน `.env`
3. ใช้งานได้เลย!

---

**Made with ❤️ - MCP Integration Ready!**
