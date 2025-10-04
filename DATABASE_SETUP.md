# 🗄️ PostgreSQL Database Setup Guide

**วันที่:** 3 ตุลาคม 2568  
**Database:** PostgreSQL  
**ORM:** Prisma

---

## ✅ สิ่งที่ติดตั้งแล้ว

- ✅ Prisma Client
- ✅ Schema สำหรับโครงการประมูล
- ✅ API Endpoints สำหรับจัดการข้อมูล

---

## 📦 Database Schema

### Tables:

#### 1. **projects** - โครงการประมูล
```sql
- id (String, Primary Key)
- projectName (String)
- organization (String)
- budget (String)
- announcementDate (String)
- closingDate (String)
- projectType (String)
- method (String)
- description (Text)
- documentUrl (String, Optional)
- sourceUrl (String, Optional)
- contactPerson (String, Optional)
- phone (String, Optional)
- address (String, Optional)
- createdAt (DateTime)
- updatedAt (DateTime)
```

#### 2. **ai_estimates** - การประเมินด้วย AI
```sql
- id (String, Primary Key)
- projectId (String, Foreign Key)
- winProbability (Float)
- estimatedProfit (Float)
- recommendedBidPrice (String)
- discountPercent (Float)
- confidence (String)
- recommendation (String)
- reasons (String[])
- risks (String[])
- createdAt (DateTime)
```

#### 3. **users** - ผู้ใช้งาน
```sql
- id (String, Primary Key)
- email (String, Unique)
- name (String, Optional)
- password (String)
- role (String, Default: 'user')
- createdAt (DateTime)
- updatedAt (DateTime)
```

#### 4. **search_logs** - บันทึกการค้นหา
```sql
- id (String, Primary Key)
- keyword (String)
- resultsCount (Int)
- source (String)
- createdAt (DateTime)
```

#### 5. **notifications** - การแจ้งเตือน
```sql
- id (String, Primary Key)
- projectId (String, Optional)
- title (String)
- message (Text)
- type (String)
- isRead (Boolean, Default: false)
- createdAt (DateTime)
```

---

## 🚀 ขั้นตอนการตั้งค่า

### 1. ตรวจสอบ PostgreSQL

#### Windows:
```bash
# ตรวจสอบว่าติดตั้งแล้วหรือยัง
psql --version

# ถ้ายังไม่มี ดาวน์โหลดที่:
# https://www.postgresql.org/download/windows/
```

#### Mac:
```bash
# ติดตั้งด้วย Homebrew
brew install postgresql@15

# เริ่มต้น service
brew services start postgresql@15
```

#### Linux:
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# เริ่มต้น service
sudo systemctl start postgresql
```

---

### 2. สร้าง Database

```bash
# เข้าสู่ PostgreSQL
psql -U postgres

# สร้าง database
CREATE DATABASE dbcomdee;

# สร้าง user (ถ้าต้องการ)
CREATE USER admin WITH PASSWORD 'P@ssw0rdnirut';

# ให้สิทธิ์
GRANT ALL PRIVILEGES ON DATABASE dbcomdee TO admin;

# ออกจาก psql
\q
```

---

### 3. ตรวจสอบ Connection String

ใน `.env`:
```env
POSTGRES_URL=postgresql://admin:P@ssw0rdnirut@localhost:5432/dbcomdee
```

**รูปแบบ:**
```
postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]
```

---

### 4. Push Schema ไปยัง Database

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# ถ้าสำเร็จจะเห็น:
# ✔ Your database is now in sync with your Prisma schema.
```

---

### 5. ดู Database ด้วย Prisma Studio

```bash
npx prisma studio
```

เปิดที่: `http://localhost:5555`

---

## 🎯 API Endpoints

### 1. GET /api/db-projects
ดึงโครงการทั้งหมด

```typescript
// ดึงทั้งหมด
fetch('/api/db-projects')

// ค้นหา
fetch('/api/db-projects?keyword=ก่อสร้าง&limit=20')
```

**Response:**
```json
{
  "success": true,
  "total": 39,
  "projects": [...],
  "source": "PostgreSQL Database"
}
```

---

### 2. POST /api/db-projects
เพิ่มโครงการใหม่

```typescript
fetch('/api/db-projects', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    projectName: "โครงการก่อสร้าง...",
    organization: "กรมทางหลวง",
    budget: "50000000",
    announcementDate: "2025-10-01",
    closingDate: "2025-11-15",
    projectType: "งานก่อสร้าง",
    method: "e-bidding",
    description: "รายละเอียด...",
  })
})
```

---

### 3. POST /api/sync-to-db
ซิงค์ข้อมูลจาก Mock Data

```typescript
fetch('/api/sync-to-db', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ limit: 50 })
})
```

**Response:**
```json
{
  "success": true,
  "created": 39,
  "skipped": 0,
  "total": 39,
  "errors": []
}
```

---

### 4. GET /api/sync-to-db
ตรวจสอบสถานะ Database

```typescript
fetch('/api/sync-to-db')
```

**Response:**
```json
{
  "status": "ready",
  "projectsInDatabase": 39,
  "message": "Database is connected and ready"
}
```

---

### 5. DELETE /api/db-projects
ลบโครงการทั้งหมด (ระวัง!)

```typescript
fetch('/api/db-projects', { method: 'DELETE' })
```

---

## 📊 ตัวอย่างการใช้งาน

### 1. ซิงค์ข้อมูลครั้งแรก

```typescript
// 1. ตรวจสอบสถานะ
const status = await fetch('/api/sync-to-db');
console.log(await status.json());

// 2. ซิงค์ข้อมูล
const sync = await fetch('/api/sync-to-db', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ limit: 50 })
});
console.log(await sync.json());

// 3. ดึงข้อมูล
const projects = await fetch('/api/db-projects');
console.log(await projects.json());
```

---

### 2. ค้นหาโครงการ

```typescript
// ค้นหาโครงการก่อสร้าง
const response = await fetch('/api/db-projects?keyword=ก่อสร้าง&limit=10');
const data = await response.json();

console.log(`พบ ${data.total} โครงการ`);
data.projects.forEach(p => {
  console.log(`- ${p.projectName} (${p.budget} บาท)`);
});
```

---

### 3. เพิ่มโครงการใหม่

```typescript
const newProject = {
  projectName: "โครงการทดสอบ",
  organization: "บริษัททดสอบ",
  budget: "1000000",
  announcementDate: "2025-10-03",
  closingDate: "2025-10-31",
  projectType: "งานทดสอบ",
  method: "เฉพาะเจาะจง",
  description: "นี่คือโครงการทดสอบ",
};

const response = await fetch('/api/db-projects', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(newProject)
});

const result = await response.json();
console.log('สร้างโครงการสำเร็จ:', result.project.id);
```

---

## 🔧 Prisma Commands

### Generate Client:
```bash
npx prisma generate
```

### Push Schema:
```bash
npx prisma db push
```

### Reset Database:
```bash
npx prisma db push --force-reset
```

### Open Studio:
```bash
npx prisma studio
```

### Format Schema:
```bash
npx prisma format
```

---

## 🐛 Troubleshooting

### ปัญหา: Connection refused

**แก้ไข:**
1. ตรวจสอบว่า PostgreSQL ทำงานอยู่
```bash
# Windows
services.msc → PostgreSQL

# Mac
brew services list

# Linux
sudo systemctl status postgresql
```

2. ตรวจสอบ port
```bash
psql -U postgres -h localhost -p 5432
```

---

### ปัญหา: Authentication failed

**แก้ไข:**
1. ตรวจสอบ username/password ใน `.env`
2. ลองเข้าด้วย psql:
```bash
psql -U admin -d dbcomdee
```

---

### ปัญหา: Database does not exist

**แก้ไข:**
```bash
# สร้าง database
createdb -U postgres dbcomdee

# หรือ
psql -U postgres
CREATE DATABASE dbcomdee;
```

---

## 🎉 สรุป

**PostgreSQL Database พร้อมใช้งาน!**

### ติดตั้งแล้ว:
- ✅ Prisma Client
- ✅ Database Schema (5 tables)
- ✅ API Endpoints (5 endpoints)

### ขั้นตอนถัดไป:
1. ✅ ตรวจสอบ PostgreSQL ทำงาน
2. ✅ สร้าง database `dbcomdee`
3. ✅ รัน `npx prisma db push`
4. ✅ ซิงค์ข้อมูล: `POST /api/sync-to-db`
5. ✅ ทดสอบ: `GET /api/db-projects`

---

**Database พร้อมใช้งาน!** 🗄️🚀
