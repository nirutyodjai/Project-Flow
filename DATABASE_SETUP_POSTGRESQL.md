# 🗄️ PostgreSQL Database Setup Guide

**วันที่:** 4 ตุลาคม 2568  
**สถานะ:** พร้อมใช้งาน

---

## 📋 ข้อมูล Database

จากไฟล์ `.env`:
```env
POSTGRES_URL=postgresql://admin:P@ssw0rdnirut@localhost:5432/dbcomdee
```

- **Host:** localhost
- **Port:** 5432
- **Database:** dbcomdee
- **Username:** admin
- **Password:** P@ssw0rdnirut

---

## 🚀 ขั้นตอนการ Setup

### 1. Generate Prisma Client
```bash
npx prisma generate
```

### 2. สร้าง Migration (ครั้งแรก)
```bash
npx prisma migrate dev --name init
```

### 3. Push Schema ไปยัง Database (ถ้าไม่ต้องการ migration history)
```bash
npx prisma db push
```

### 4. เปิด Prisma Studio (ดู/แก้ไขข้อมูล)
```bash
npx prisma studio
```

---

## 📊 Tables ที่จะถูกสร้าง

### 1. **projects** - โครงการประมูล
- id, projectName, organization, budget
- announcementDate, closingDate
- projectType, method, description
- documentUrl, sourceUrl
- contactPerson, phone, address

### 2. **ai_estimates** - การประเมินด้วย AI
- id, projectId
- winProbability, estimatedProfit
- recommendedBidPrice, discountPercent
- confidence, recommendation
- reasons, risks

### 3. **users** - ผู้ใช้งาน
- id, email, name, password
- role (user/admin)

### 4. **search_logs** - บันทึกการค้นหา
- id, keyword, resultsCount
- source (database/brave_search/puppeteer)

### 5. **notifications** - การแจ้งเตือน ✨ NEW
- id, userId, projectId, projectName
- title, message, type, priority
- isRead, amount, deadline
- actionUrl, actionLabel, metadata

### 6. **materials** - วัสดุ ✨ NEW
- id, name, category, brand, model
- specification, unit, description
- imageUrl, tags

### 7. **material_prices** - ราคาวัสดุ ✨ NEW
- id, materialId, supplierId, supplierName
- price, unit, minOrder, maxOrder
- discount, discountCondition
- deliveryFee, deliveryTime
- inStock, stockQuantity, notes

### 8. **quotations** - ใบเสนอราคา ✨ NEW
- id, quotationNumber, userId
- date, validUntil
- customerName, customerAddress, customerPhone
- subtotal, discount, vat, total
- paymentTerms, deliveryTerms, warrantyTerms
- status, projectId, projectName

### 9. **quotation_items** - รายการในใบเสนอราคา ✨ NEW
- id, quotationId, no
- description, quantity, unit
- unitPrice, amount, notes

---

## 🔧 คำสั่งที่มีประโยชน์

### Reset Database (ลบข้อมูลทั้งหมด)
```bash
npx prisma migrate reset
```

### ดูสถานะ Migration
```bash
npx prisma migrate status
```

### Format Schema
```bash
npx prisma format
```

### Seed ข้อมูลทดสอบ (ถ้ามี seed file)
```bash
npx prisma db seed
```

---

## 📝 ตัวอย่างการใช้งาน

### 1. Import Prisma Client
```typescript
import { prisma } from '@/lib/prisma';
```

### 2. สร้างโครงการใหม่
```typescript
const project = await prisma.project.create({
  data: {
    projectName: 'โครงการก่อสร้างอาคาร',
    organization: 'กรมโยธาธิการ',
    budget: '50000000',
    announcementDate: new Date().toISOString(),
    closingDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    projectType: 'ก่อสร้าง',
    method: 'e-bidding',
    description: 'รายละเอียดโครงการ',
  },
});
```

### 3. ดึงโครงการทั้งหมด
```typescript
const projects = await prisma.project.findMany({
  orderBy: { createdAt: 'desc' },
  take: 10,
});
```

### 4. สร้าง Notification
```typescript
const notification = await prisma.notification.create({
  data: {
    userId: 'user123',
    title: 'งานใหม่!',
    message: 'มีโครงการใหม่ที่น่าสนใจ',
    type: 'new-project',
    priority: 'high',
    projectId: project.id,
    projectName: project.projectName,
  },
});
```

### 5. สร้างใบเสนอราคา
```typescript
const quotation = await prisma.quotation.create({
  data: {
    quotationNumber: 'QT-202510-0001',
    userId: 'user123',
    date: new Date(),
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    customerName: 'บริษัท ABC จำกัด',
    subtotal: 100000,
    vat: 7000,
    total: 107000,
    status: 'draft',
    items: {
      create: [
        {
          no: 1,
          description: 'สินค้า A',
          quantity: 10,
          unit: 'ชิ้น',
          unitPrice: 10000,
          amount: 100000,
        },
      ],
    },
  },
  include: {
    items: true,
  },
});
```

---

## ⚠️ หมายเหตุสำคัญ

1. **ต้องมี PostgreSQL ติดตั้งและรันอยู่**
   - ตรวจสอบด้วย: `psql -U admin -d dbcomdee`

2. **ตรวจสอบ Connection String ใน .env**
   - ต้องถูกต้องและเข้าถึงได้

3. **Backup ข้อมูลก่อน migrate**
   - ถ้ามีข้อมูลสำคัญอยู่แล้ว

4. **ใช้ Prisma Studio สำหรับดูข้อมูล**
   - เปิดที่ http://localhost:5555

---

## 🎯 ขั้นตอนถัดไป

1. ✅ รัน `npx prisma generate`
2. ✅ รัน `npx prisma db push` หรือ `npx prisma migrate dev`
3. ✅ ตรวจสอบ tables ด้วย Prisma Studio
4. ✅ อัปเดต Services ให้ใช้ Prisma แทน Firebase
5. ✅ ทดสอบการทำงาน

---

**พร้อม Deploy แล้ว!** 🚀
