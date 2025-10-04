# 🚀 FastAPI Integration Guide

**วันที่:** 3 ตุลาคม 2568  
**ฟีเจอร์:** FastAPI สำหรับ Backend API

---

## ✅ ติดตั้งแล้ว

```bash
pip install fastapi uvicorn
```

**Packages:**
- ✅ **FastAPI** - Web framework
- ✅ **Uvicorn** - ASGI server

---

## 🎯 API Endpoints

### 1. GET /
ข้อมูล API

### 2. GET /api/projects
ดึงรายการโครงการ

**Query Parameters:**
- `keyword` - คำค้นหา
- `limit` - จำนวนสูงสุด (default: 20)

**Response:**
```json
{
  "success": true,
  "total": 20,
  "projects": [...],
  "source": "FastAPI"
}
```

### 3. POST /api/analyze-tor
วิเคราะห์ TOR

**Request:**
```json
{
  "projectName": "โครงการทดสอบ",
  "budget": 10000000,
  "workItems": [
    {
      "materialCost": 5000000,
      "laborCost": 2000000
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "budget": 10000000,
    "totalCost": 7000000,
    "profit": 3000000,
    "profitPercent": 30,
    "recommendation": "✅ แนะนำยื่นข้อเสนอ"
  }
}
```

### 4. POST /api/analyze-boq
วิเคราะห์ BOQ

**Request:**
```json
{
  "projectName": "โครงการทดสอบ",
  "totalBudget": 15000000,
  "items": [
    {
      "no": "1",
      "description": "งานคอนกรีต",
      "unit": "ตร.ม.",
      "quantity": 100,
      "materialCost": 300000,
      "laborCost": 100000
    }
  ]
}
```

### 5. GET /api/health
ตรวจสอบสถานะ

---

## 🚀 วิธีรัน

### 1. รัน FastAPI:
```bash
cd MCPMIX
python fastapi-demo.py
```

หรือ

```bash
uvicorn fastapi-demo:app --reload --port 8000
```

### 2. เปิดเบราว์เซอร์:
```
http://localhost:8000
```

### 3. ดู API Docs:
```
http://localhost:8000/docs
```

---

## 🔗 เชื่อมต่อกับ Next.js

### ใน Next.js (localhost:3000):

```typescript
// เรียก FastAPI
const response = await fetch('http://localhost:8000/api/analyze-tor', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    projectName: 'ทดสอบ',
    budget: 10000000,
    workItems: [...]
  })
});

const data = await response.json();
console.log(data.analysis);
```

---

## 🎯 ข้อดี FastAPI

### 1. **เร็วมาก** ⚡
- Async/Await native
- เร็วกว่า Flask, Django

### 2. **Auto Documentation** 📚
- Swagger UI อัตโนมัติ
- ReDoc อัตโนมัติ

### 3. **Type Safety** 🛡️
- Pydantic validation
- Type hints

### 4. **Modern** 🎨
- Python 3.7+
- Async support

---

## 🎉 สรุป

**FastAPI พร้อมใช้งาน!**

### ไฟล์:
- ✅ `MCPMIX/fastapi-demo.py`
- ✅ `MCPMIX/FASTAPI_GUIDE.md`

### Endpoints:
- ✅ GET /api/projects
- ✅ POST /api/analyze-tor
- ✅ POST /api/analyze-boq
- ✅ GET /api/health

---

**รัน:** `python MCPMIX/fastapi-demo.py` 🚀
