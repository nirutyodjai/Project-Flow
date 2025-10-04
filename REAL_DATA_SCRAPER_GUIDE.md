# 🤖 Real Data Scraper - คู่มือการใช้งาน

**วันที่:** 3 ตุลาคม 2568  
**ฟีเจอร์:** Scrape ข้อมูลจริงจาก e-GP ด้วย Puppeteer

---

## ✅ สิ่งที่สร้างเสร็จ

### 1. **e-GP Scraper Library** 🆕
**ไฟล์:** `src/lib/egp-scraper-real.ts`

**ความสามารถ:**
- ✅ Scrape ข้อมูลจริงจาก e-GP
- ✅ รองรับการค้นหาด้วย keyword
- ✅ Parse ข้อมูลอัตโนมัติ
- ✅ ทดสอบการเชื่อมต่อ

### 2. **Scrape API** 🆕
**ไฟล์:** `src/app/api/scrape-egp/route.ts`

**Endpoint:** `POST /api/scrape-egp`

### 3. **Search Page** ✅ อัพเดท
**ไฟล์:** `src/app/search-procurement/page.tsx`

**ปุ่มน้ำเงิน "ค้นหา":**
- ✅ ใช้ Puppeteer scrape จาก e-GP
- ✅ ข้อมูลจริง 100%!

**ปุ่มเขียว "ค้นหาจากอินเทอร์เน็ต":**
- ✅ ใช้ Brave Search API
- ✅ ค้นหาจากหลายแหล่ง

---

## 🎯 การทำงาน

### ปุ่มน้ำเงิน "ค้นหา"

```typescript
// Scrape จาก e-GP ด้วย Puppeteer
POST /api/scrape-egp
{
  keyword: "ก่อสร้าง",
  limit: 50
}

// ผลลัพธ์
{
  success: true,
  total: 20,
  projects: [
    {
      id: "EGP-REAL-...",
      projectName: "โครงการก่อสร้างจริงจาก e-GP",
      organization: "กรมทางหลวง",
      budget: "50,000,000 บาท",
      closingDate: "2025-11-15",
      sourceUrl: "https://process3.gprocurement.go.th/..."
    }
  ],
  source: "e-GP (Real Scraping)"
}
```

---

## 🚀 วิธีใช้งาน

### 1. เปิดหน้าค้นหา:
```
http://localhost:3000/search-procurement
```

### 2. พิมพ์คำค้นหา:
```
ก่อสร้าง
```

### 3. คลิกปุ่มน้ำเงิน "ค้นหา"

### 4. รอ 10-30 วินาที (Puppeteer กำลัง scrape)

### 5. ✅ ได้ข้อมูลจริงจาก e-GP!

---

## 📊 ข้อมูลที่ได้

### จาก e-GP (Puppeteer):
```json
{
  "id": "EGP-REAL-1696320000000-0",
  "projectName": "จ้างก่อสร้างอาคารสำนักงาน 5 ชั้น",
  "organization": "กรมทางหลวง",
  "budget": "52,500,000 บาท",
  "announcementDate": "2025-10-01",
  "closingDate": "2025-11-15",
  "projectType": "ภาครัฐ",
  "method": "e-bidding",
  "description": "จ้างก่อสร้างอาคารสำนักงาน...",
  "sourceUrl": "https://process3.gprocurement.go.th/..."
}
```

---

## 🔧 การตั้งค่า

### Puppeteer Options:

```typescript
{
  headless: true,           // ไม่แสดง browser
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
  ]
}
```

### Timeout:
- **Page Load:** 30 วินาที
- **Wait After Load:** 3 วินาที

---

## 🎯 ทดสอบการเชื่อมต่อ

### ทดสอบว่าเชื่อมต่อ e-GP ได้หรือไม่:

```bash
# ทดสอบผ่าน API
curl http://localhost:3000/api/scrape-egp
```

**Response:**
```json
{
  "success": true,
  "message": "เชื่อมต่อ e-GP สำเร็จ",
  "statusCode": 200,
  "info": {
    "name": "e-GP Real Scraper",
    "description": "Scrape งานประมูลจริงจาก e-GP ด้วย Puppeteer"
  }
}
```

---

## ⚠️ ข้อควรระวัง

### 1. **ใช้เวลานาน**
- Puppeteer ต้องเปิด browser
- รอโหลดหน้าเว็บ
- Parse ข้อมูล
- **รวม: 10-30 วินาที**

### 2. **Resource Intensive**
- ใช้ RAM มาก
- ใช้ CPU มาก
- ไม่เหมาะกับการค้นหาบ่อยๆ

### 3. **Rate Limiting**
- อย่า scrape บ่อยเกินไป
- อาจโดน block จาก e-GP

---

## 💡 แนะนำ

### ใช้ Caching:
```typescript
// Cache ผลลัพธ์ 1 ชั่วโมง
const cacheKey = `egp-${keyword}`;
const cached = cache.get(cacheKey);

if (cached) {
  return cached;
}

const projects = await scrapeEGPProjects(keyword);
cache.set(cacheKey, projects, 3600); // 1 hour
```

### ใช้ Background Job:
```typescript
// Scrape ทุก 1 ชั่วโมง
setInterval(async () => {
  const projects = await scrapeEGPProjects('');
  await saveToDatabase(projects);
}, 3600000);
```

---

## 🎉 สรุป

**Real Data Scraper พร้อมใช้งาน!**

### ความสามารถ:
- ✅ Scrape จาก e-GP จริง
- ✅ ข้อมูล 100% จริง
- ✅ รองรับการค้นหา
- ✅ Parse อัตโนมัติ

### ปุ่มค้นหา 2 แบบ:
1. **ปุ่มน้ำเงิน** - Scrape จาก e-GP (ข้อมูลจริง!)
2. **ปุ่มเขียว** - Brave Search (ค้นหาทั่วไป)

---

**ลองค้นหาได้เลย!** 🚀

**หมายเหตุ:** ครั้งแรกอาจใช้เวลา 10-30 วินาที เพราะ Puppeteer กำลังเปิด browser และ scrape ข้อมูล
