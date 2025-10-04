# 📡 API Documentation - งานประมูลและจัดซื้อจัดจ้าง

## 🎯 API สำหรับดึงข้อมูลงานประมูล

---

## 1. 🔍 ค้นหาโครงการประมูลอัตโนมัติ (AI-Powered)

### `POST /api/automated-discovery`

**คำอธิบาย:** ค้นหาโครงการประมูลที่เหมาะสมด้วย AI พร้อมวิเคราะห์โอกาสชนะและกำไร

**Request:**
```typescript
POST /api/automated-discovery
Content-Type: application/json

{
  "query": "ก่อสร้างอาคาร"
}
```

**Response:**
```typescript
{
  "dataSource": "DATABASE" | "AI_GENERATED",
  "projects": [
    {
      "id": "proj_001",
      "name": "ก่อสร้างอาคารสำนักงาน",
      "organization": "กรมทางหลวง",
      "type": "ภาครัฐ",
      "budget": "50,000,000",
      "address": "กรุงเทพมหานคร",
      "contactPerson": "นายสมชาย ใจดี",
      "phone": "02-123-4567",
      "documentUrl": "https://...",
      "bidSubmissionDeadline": "2025-11-30",
      
      // การวิเคราะห์ AI
      "analysis": "โครงการภาครัฐที่มีโอกาสชนะสูง...",
      "winProbability": 75.5,
      "estimatedProfit": 18.2,
      "reasonForWinning": "มีประสบการณ์สูงกับหน่วยงานรัฐ...",
      "recommendedBidPrice": "47,500,000 บาท",
      
      "historicalAnalysis": {
        "successCount": 3,
        "failureCount": 1,
        "pastWinners": []
      }
    }
  ]
}
```

**ตัวอย่างการใช้งาน:**
```typescript
const response = await fetch('/api/automated-discovery', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: 'ก่อสร้างอาคาร' })
});

const data = await response.json();
console.log(data.projects);
```

---

## 2. 🎯 ที่ปรึกษาการประมูล

### `POST /api/bidding-advisor`

**คำอธิบาย:** รับคำแนะนำกลยุทธ์การประมูลจาก AI

**Request:**
```typescript
POST /api/bidding-advisor
Content-Type: application/json

{
  "projectName": "ก่อสร้างอาคารสำนักงาน",
  "budget": "50000000",
  "organization": "กรมทางหลวง",
  "deadline": "2025-11-30",
  "projectType": "ภาครัฐ"
}
```

**Response:**
```typescript
{
  "advice": {
    "winProbability": 75.5,
    "recommendedStrategy": "...",
    "pricingAdvice": "...",
    "competitionLevel": "ปานกลาง",
    "risks": ["..."],
    "opportunities": ["..."]
  }
}
```

---

## 3. 📄 วิเคราะห์เอกสาร TOR

### `POST /api/analyze-document`

**คำอธิบาย:** วิเคราะห์เอกสาร TOR ด้วย AI

**Request:**
```typescript
POST /api/analyze-document
Content-Type: application/json

{
  "documentText": "เนื้อหาเอกสาร TOR...",
  "documentType": "TOR"
}
```

**Response:**
```typescript
{
  "summary": "สรุปเอกสาร...",
  "materials": [
    {
      "name": "ปูนซีเมนต์",
      "quantity": "100",
      "unit": "ถุง",
      "estimatedPrice": "150"
    }
  ],
  "requirements": ["..."],
  "estimatedBudget": "5000000"
}
```

---

## 4. 📊 จัดการใบเสนอราคา (Quotation)

### `GET /api/procurement/quotation`

**คำอธิบาย:** ดึงรายการใบเสนอราคาทั้งหมด

**Request:**
```typescript
GET /api/procurement/quotation?status=DRAFT&type=MATERIAL_ONLY&limit=10
```

**Query Parameters:**
- `status` - สถานะ (DRAFT, PENDING, APPROVED, REJECTED, CANCELLED)
- `type` - ประเภท (MATERIAL_ONLY, FULL_SERVICE, LABOR_ONLY)
- `customerId` - รหัสลูกค้า
- `startDate` - วันที่เริ่มต้น
- `endDate` - วันที่สิ้นสุด
- `limit` - จำนวนรายการ (default: 50)

**Response:**
```typescript
{
  "quotations": [
    {
      "id": "Q2025-001",
      "quotationNumber": "Q2025-001",
      "customerId": "CUST001",
      "customerName": "บริษัท ABC จำกัด",
      "type": "MATERIAL_ONLY",
      "status": "APPROVED",
      "items": [...],
      "totalAmount": 150000,
      "createdAt": "2025-10-01T10:00:00Z"
    }
  ],
  "total": 1
}
```

### `POST /api/procurement/quotation`

**คำอธิบาย:** สร้างใบเสนอราคาใหม่

**Request:**
```typescript
POST /api/procurement/quotation
Content-Type: application/json

{
  "customerId": "CUST001",
  "customerName": "บริษัท ABC จำกัด",
  "type": "MATERIAL_ONLY",
  "items": [
    {
      "materialCode": "MAT001",
      "description": "ปูนซีเมนต์",
      "quantity": 100,
      "unit": "ถุง",
      "unitPrice": 150,
      "discount": 0
    }
  ],
  "notes": "หมายเหตุ"
}
```

### `GET /api/procurement/quotation/[id]`

**คำอธิบาย:** ดึงข้อมูลใบเสนอราคาตาม ID

### `PATCH /api/procurement/quotation/[id]`

**คำอธิบาย:** อัปเดตใบเสนอราคา

### `DELETE /api/procurement/quotation/[id]`

**คำอธิบาย:** ลบใบเสนอราคา

---

## 5. 💰 จัดการรายการราคา (Price List)

### `GET /api/procurement/price-list`

**คำอธิบาย:** ดึงรายการสินค้าและราคา

**Request:**
```typescript
GET /api/procurement/price-list?category=ปูน&search=ซีเมนต์
```

**Query Parameters:**
- `materialCode` - รหัสวัสดุ
- `category` - หมวดหมู่
- `search` - คำค้นหา
- `onlyActive` - เฉพาะรายการที่ใช้งาน (default: true)

**Response:**
```typescript
{
  "items": [
    {
      "id": "PL001",
      "materialCode": "MAT001",
      "description": "ปูนซีเมนต์ตราช้าง",
      "category": "ปูน",
      "unit": "ถุง",
      "costPrice": 120,
      "netPrice": 150,
      "upPrice": 20,
      "submitPrice": 170,
      "isActive": true,
      "createdAt": "2025-10-01T10:00:00Z"
    }
  ]
}
```

### `POST /api/procurement/price-list`

**คำอธิบาย:** เพิ่มรายการสินค้าใหม่

### `GET /api/procurement/price-list/categories`

**คำอธิบาย:** ดึงรายการหมวดหมู่ทั้งหมด

---

## 6. 📋 จัดการ BOQ (Bill of Quantities)

### `POST /api/procurement/boq/generate`

**คำอธิบาย:** สร้าง BOQ จากการวิเคราะห์ TOR

**Request:**
```typescript
POST /api/procurement/boq/generate
Content-Type: application/json

{
  "torForBOQId": "TOR001",
  "materialKeywords": ["ปูน", "เหล็ก", "ทราย"]
}
```

### `GET /api/procurement/boq/price-suggestions`

**คำอธิบาย:** ค้นหาราคาที่แนะนำสำหรับรายการ BOQ

**Request:**
```typescript
GET /api/procurement/boq/price-suggestions?description=ปูนซีเมนต์
```

### `POST /api/procurement/boq/save`

**คำอธิบาย:** บันทึก BOQ

---

## 7. 📈 วิเคราะห์ต้นทุนและกำไร

### `POST /api/procurement/cost-profit-analysis`

**คำอธิบาย:** วิเคราะห์ต้นทุนและกำไรจาก BOQ

**Request:**
```typescript
POST /api/procurement/cost-profit-analysis
Content-Type: application/json

{
  "boqItems": [
    {
      "description": "ปูนซีเมนต์",
      "quantity": 100,
      "unit": "ถุง"
    }
  ]
}
```

**Response:**
```typescript
{
  "totalCost": 12000,
  "totalRevenue": 17000,
  "profit": 5000,
  "profitMargin": 29.41,
  "itemAnalysis": [...]
}
```

---

## 8. 👥 จัดการผู้ติดต่อ/ลูกค้า

### `GET /api/contacts`

**คำอธิบาย:** ดึงรายการผู้ติดต่อทั้งหมด

### `GET /api/contacts/customers`

**คำอธิบาย:** ดึงรายการลูกค้า

### `POST /api/contacts`

**คำอธิบาย:** เพิ่มผู้ติดต่อใหม่

### `GET /api/contacts/[id]`

**คำอธิบาย:** ดึงข้อมูลผู้ติดต่อตาม ID

---

## 9. 🌐 ค้นหาเว็บไซต์ประมูลใหม่

### `POST /api/ai/website-discovery`

**คำอธิบาย:** ค้นหาเว็บไซต์ประมูลใหม่ๆ ด้วย AI

**Request:**
```typescript
POST /api/ai/website-discovery
Content-Type: application/json

{
  "keywords": ["ประมูล", "จัดซื้อ", "ภาครัฐ"],
  "organizationType": "ภาครัฐ"
}
```

---

## 10. 📊 รายงาน

### `POST /api/reports/generate`

**คำอธิบาย:** สร้างรายงาน

**Request:**
```typescript
POST /api/reports/generate
Content-Type: application/json

{
  "reportType": "QUOTATION_SUMMARY",
  "startDate": "2025-10-01",
  "endDate": "2025-10-31",
  "format": "PDF"
}
```

---

## 🔧 ตัวอย่างการใช้งาน

### 1. ค้นหาโครงการประมูล
```typescript
async function searchProjects(query: string) {
  const response = await fetch('/api/automated-discovery', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  
  const data = await response.json();
  return data.projects;
}

// ใช้งาน
const projects = await searchProjects('ก่อสร้างอาคาร');
console.log(projects);
```

### 2. สร้างใบเสนอราคา
```typescript
async function createQuotation(quotationData) {
  const response = await fetch('/api/procurement/quotation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(quotationData)
  });
  
  return await response.json();
}
```

### 3. ค้นหารายการราคา
```typescript
async function searchPriceList(search: string) {
  const response = await fetch(
    `/api/procurement/price-list?search=${encodeURIComponent(search)}`
  );
  
  const data = await response.json();
  return data.items;
}
```

---

## 🔐 Authentication

**ปัจจุบัน:** ยังไม่มี authentication  
**แนะนำสำหรับ Production:** ใช้ Firebase Authentication

```typescript
// ตัวอย่างการเพิ่ม auth header
const response = await fetch('/api/automated-discovery', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ query })
});
```

---

## ⚠️ Error Handling

**Error Response Format:**
```typescript
{
  "error": "Error message here",
  "code": "ERROR_CODE",
  "details": {...}
}
```

**HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

---

## 📝 หมายเหตุ

1. **Firebase Required:** API บางตัวต้องการ Firebase (ถ้ายังไม่ตั้งค่าจะใช้ Mock Data)
2. **Rate Limiting:** ยังไม่มี (ควรเพิ่มใน Production)
3. **CORS:** ตั้งค่าสำหรับ localhost เท่านั้น
4. **Pagination:** บาง API รองรับ pagination ผ่าน `limit` และ `offset`

---

## 🚀 API ที่พร้อมใช้งาน

✅ **งานประมูล:**
- `/api/automated-discovery` - ค้นหาโครงการ AI
- `/api/bidding-advisor` - ที่ปรึกษาการประมูล

✅ **เอกสาร:**
- `/api/analyze-document` - วิเคราะห์ TOR

✅ **ใบเสนอราคา:**
- `/api/procurement/quotation` - CRUD ใบเสนอราคา

✅ **รายการราคา:**
- `/api/procurement/price-list` - จัดการราคาวัสดุ

✅ **BOQ:**
- `/api/procurement/boq/*` - จัดการ BOQ

✅ **ผู้ติดต่อ:**
- `/api/contacts` - จัดการลูกค้า/ซัพพลายเออร์

---

**อัปเดตล่าสุด:** 3 ตุลาคม 2568
