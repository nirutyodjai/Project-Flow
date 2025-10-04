# 🚀 API Routes - PostgreSQL Edition

**วันที่:** 4 ตุลาคม 2568  
**Database:** PostgreSQL with Prisma

---

## 📡 API Endpoints

### 1. Materials API

#### POST `/api/materials/search`
ค้นหาวัสดุ

**Request:**
```json
{
  "searchTerm": "สายไฟ",
  "filters": {
    "category": "electrical",
    "brand": "Thai Yazaki"
  }
}
```

**Response:**
```json
{
  "success": true,
  "total": 5,
  "materials": [...],
  "timestamp": "2025-10-04T03:30:00.000Z"
}
```

#### POST `/api/materials/compare`
เปรียบเทียบราคาวัสดุ

**Request:**
```json
{
  "materialId": "material-123"
}
```

**Response:**
```json
{
  "success": true,
  "comparison": {
    "material": {...},
    "prices": [...],
    "lowestPrice": {...},
    "highestPrice": {...},
    "averagePrice": 150,
    "recommendations": {...}
  }
}
```

---

### 2. Quotations API

#### POST `/api/quotations/create`
สร้างใบเสนอราคา

**Request:**
```json
{
  "userId": "user-123",
  "customer": {
    "name": "บริษัท ABC จำกัด",
    "address": "123 ถนน...",
    "phone": "02-xxx-xxxx",
    "email": "contact@abc.com"
  },
  "items": [
    {
      "description": "งานติดตั้งระบบไฟฟ้า",
      "quantity": 1,
      "unit": "งาน",
      "unitPrice": 50000,
      "amount": 50000
    }
  ],
  "options": {
    "projectId": "project-123",
    "discount": 5000,
    "notes": "หมายเหตุ..."
  }
}
```

**Response:**
```json
{
  "success": true,
  "quotation": {
    "id": "quot-123",
    "quotationNumber": "QT-202510-0001",
    "total": 107000,
    ...
  }
}
```

#### GET `/api/quotations/list?userId=user-123`
ดึงรายการใบเสนอราคา

**Response:**
```json
{
  "success": true,
  "quotations": [...],
  "summary": {
    "totalQuotations": 10,
    "acceptedQuotations": 5,
    "totalValue": 1000000,
    "acceptanceRate": 50
  }
}
```

---

### 3. Notifications API (Existing)

#### POST `/api/notifications/send`
ส่งการแจ้งเตือน

#### GET `/api/notifications/slack`
ทดสอบ Slack integration

---

### 4. Projects API (Existing)

#### POST `/api/scrape-egp`
ค้นหางานประมูลจาก e-GP

**Request:**
```json
{
  "keyword": "ก่อสร้าง",
  "limit": 20
}
```

**Response:**
```json
{
  "success": true,
  "total": 3,
  "projects": [...],
  "source": "e-GP (Mock Data)"
}
```

---

## 🔧 การใช้งาน

### ใน Component:

```typescript
// ค้นหาวัสดุ
const response = await fetch('/api/materials/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ searchTerm: 'สายไฟ' }),
});

// สร้างใบเสนอราคา
const response = await fetch('/api/quotations/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId, customer, items }),
});
```

### ใช้ Hooks:

```typescript
// Materials Hook
import { useMaterials } from '@/hooks/useMaterials';

const { materials, loading, searchMaterials, comparePrices } = useMaterials();
await searchMaterials('สายไฟ');

// Quotations Hook
import { useQuotations } from '@/hooks/useQuotations';

const { quotations, summary, createQuotation } = useQuotations(userId);
await createQuotation(customer, items);
```

---

## 📊 Database Schema

### Tables:
1. materials
2. material_prices
3. quotations
4. quotation_items
5. notifications
6. projects
7. users
8. ai_estimates
9. search_logs

---

## ⚡ Performance Tips

### 1. Caching
```typescript
export const revalidate = 60; // Cache 60 seconds
```

### 2. Pagination
```typescript
const materials = await prisma.material.findMany({
  take: 20,
  skip: page * 20,
});
```

### 3. Indexing
- ใช้ indexes ที่กำหนดไว้ใน schema
- Query เฉพาะ fields ที่ต้องการ

---

## 🔐 Security

### 1. Authentication
- ตรวจสอบ userId
- Validate input data
- Sanitize user input

### 2. Rate Limiting
```typescript
// TODO: เพิ่ม rate limiting
```

### 3. CORS
```typescript
// ตั้งค่าใน next.config.ts
```

---

## 📝 Testing

### ทดสอบด้วย curl:

```bash
# Search materials
curl -X POST http://localhost:3000/api/materials/search \
  -H "Content-Type: application/json" \
  -d '{"searchTerm":"สายไฟ"}'

# Create quotation
curl -X POST http://localhost:3000/api/quotations/create \
  -H "Content-Type: application/json" \
  -d '{"userId":"user-123","customer":{...},"items":[...]}'

# List quotations
curl http://localhost:3000/api/quotations/list?userId=user-123
```

---

**🎉 API Routes พร้อมใช้งาน!** 🚀
