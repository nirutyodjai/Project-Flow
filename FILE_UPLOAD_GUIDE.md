# 📤 File Upload & Analysis System

**วันที่:** 3 ตุลาคม 2568  
**ฟีเจอร์:** อัพโหลดและวิเคราะห์ไฟล์อัตโนมัติ

---

## ✅ ไฟล์ที่รองรับ

### 📄 เอกสาร
- **PDF** (.pdf) - TOR, สัญญา, เอกสารต่างๆ
- **Word** (.docx, .doc) - เอกสาร TOR, รายงาน
- **Text** (.txt) - ข้อความธรรมดา

### 📊 Spreadsheet
- **Excel** (.xlsx, .xls) - BOQ, ใบเสนอราคา, รายการวัสดุ

### 🖼️ รูปภาพ
- **JPEG** (.jpg, .jpeg) - แบบก่อสร้าง, ภาพถ่าย
- **PNG** (.png) - แบบ, diagram
- **GIF** (.gif) - ภาพเคลื่อนไหว

---

## 🎯 การวิเคราะห์อัตโนมัติ

### 1. **TOR (Terms of Reference)**
**ไฟล์:** PDF, Word

**วิเคราะห์:**
- ✅ แยกรายการงาน
- ✅ ประมาณการต้นทุน
- ✅ คำนวณระยะเวลา
- ✅ ประเมินความเสี่ยง

**แนะนำ:**
```
📄 เอกสารนี้เป็น TOR (Terms of Reference)
💡 แนะนำ: ใช้ TOR Analyzer เพื่อวิเคราะห์ขอบเขตงาน
🔍 สามารถแยกรายการงานและประมาณการต้นทุนได้
```

---

### 2. **BOQ (Bill of Quantities)**
**ไฟล์:** Excel

**วิเคราะห์:**
- ✅ ถอดรายการวัสดุ
- ✅ คำนวณจำนวนวัสดุ
- ✅ ถอดรายการแรงงาน (Man-days)
- ✅ ถอดรายการเครื่องมือ
- ✅ คำนวณต้นทุนรวม
- ✅ คำนวณกำไร

**แนะนำ:**
```
📊 เอกสารนี้เป็น BOQ (Bill of Quantities)
💡 แนะนำ: ใช้ BOQ Analyzer เพื่อถอดรายการวัสดุ
📦 สามารถคำนวณต้นทุนวัสดุ-แรงงาน-เครื่องมือได้
```

---

### 3. **ใบเสนอราคา (Quotation)**
**ไฟล์:** PDF, Excel, Word

**วิเคราะห์:**
- ✅ แยกรายการสินค้า/บริการ
- ✅ เปรียบเทียบราคา
- ✅ คำนวณส่วนลด
- ✅ ตรวจสอบเงื่อนไข

**แนะนำ:**
```
💰 เอกสารนี้เป็นใบเสนอราคา
💡 แนะนำ: เปรียบเทียบกับต้นทุนที่คำนวณได้
```

---

### 4. **สัญญา (Contract)**
**ไฟล์:** PDF, Word

**วิเคราะห์:**
- ✅ แยกเงื่อนไขสำคัญ
- ✅ ตรวจสอบข้อกำหนด
- ✅ ระบุความเสี่ยง
- ✅ แจ้งเตือนประเด็นสำคัญ

**แนะนำ:**
```
📋 เอกสารนี้เป็นสัญญา
💡 แนะนำ: ตรวจสอบเงื่อนไขและข้อกำหนดต่างๆ
```

---

## 🚀 วิธีใช้งาน

### 1. เปิดหน้าอัพโหลด:
```
http://localhost:3000/upload-demo
```

### 2. อัพโหลดไฟล์:
**3 วิธี:**
- 🖱️ **คลิก** - เลือกไฟล์จากเครื่อง
- 🎯 **ลาก** - ลากไฟล์มาวาง
- 📋 **หลายไฟล์** - เลือกได้สูงสุด 10 ไฟล์

### 3. ระบบจะ:
1. ✅ อัพโหลดไฟล์
2. ✅ วิเคราะห์ประเภทเอกสาร
3. ✅ แนะนำการดำเนินการ
4. ✅ แสดงผลลัพธ์

---

## 📊 ตัวอย่างการใช้งาน

### ตัวอย่าง 1: อัพโหลด BOQ Excel

**ขั้นตอน:**
1. เลือกไฟล์ `BOQ_Project.xlsx`
2. คลิก "อัพโหลดทั้งหมด"
3. ระบบวิเคราะห์และแจ้ง:
```
✅ วิเคราะห์ไฟล์: BOQ_Project.xlsx
📊 เอกสารนี้เป็น BOQ (Bill of Quantities)
💡 แนะนำ: ใช้ BOQ Analyzer เพื่อถอดรายการวัสดุ
✅ ไฟล์ Excel สามารถนำเข้า BOQ Analyzer ได้โดยตรง
```

4. คลิก "ดูไฟล์" หรือไปที่ BOQ Analyzer

---

### ตัวอย่าง 2: อัพโหลด TOR PDF

**ขั้นตอน:**
1. เลือกไฟล์ `TOR_Building.pdf`
2. คลิก "อัพโหลดทั้งหมด"
3. ระบบวิเคราะห์และแจ้ง:
```
✅ วิเคราะห์ไฟล์: TOR_Building.pdf
📄 เอกสารนี้เป็น TOR (Terms of Reference)
💡 แนะนำ: ใช้ TOR Analyzer เพื่อวิเคราะห์ขอบเขตงาน
⚠️ ไฟล์ PDF ต้องแปลงเป็น Excel หรือ Text ก่อน
```

---

### ตัวอย่าง 3: อัพโหลดหลายไฟล์

**ขั้นตอน:**
1. เลือกไฟล์:
   - `TOR.pdf`
   - `BOQ.xlsx`
   - `Drawing.jpg`
   - `Quotation.pdf`
2. คลิก "อัพโหลดทั้งหมด"
3. ระบบจะอัพโหลดและวิเคราะห์ทีละไฟล์
4. แสดงผลลัพธ์แต่ละไฟล์

---

## 🎨 UI Features

### 1. **Drag & Drop**
- ลากไฟล์มาวางได้
- รองรับหลายไฟล์พร้อมกัน
- แสดง preview รูปภาพ

### 2. **Progress Bar**
- แสดงความคืบหน้าการอัพโหลด
- แสดงสถานะ (pending, uploading, success, error)

### 3. **File Preview**
- แสดง thumbnail รูปภาพ
- แสดงไอคอนตามประเภทไฟล์
- แสดงขนาดไฟล์

### 4. **Auto Analysis**
- วิเคราะห์ประเภทอัตโนมัติ
- แนะนำการดำเนินการ
- แสดง toast notification

---

## 🔧 API Endpoints

### POST /api/upload-analyze

**Request:**
```typescript
const formData = new FormData();
formData.append('file', file);

const response = await fetch('/api/upload-analyze', {
  method: 'POST',
  body: formData,
});
```

**Response:**
```json
{
  "success": true,
  "file": {
    "name": "BOQ_Project.xlsx",
    "originalName": "BOQ_Project.xlsx",
    "savedName": "1696320000000_BOQ_Project.xlsx",
    "size": 524288,
    "type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "url": "/uploads/1696320000000_BOQ_Project.xlsx",
    "uploadedAt": "2025-10-03T12:00:00.000Z"
  },
  "analysis": {
    "documentType": "boq",
    "confidence": 0.9,
    "fileExtension": "xlsx",
    "suggestions": [
      "📊 เอกสารนี้เป็น BOQ (Bill of Quantities)",
      "💡 แนะนำ: ใช้ BOQ Analyzer เพื่อถอดรายการวัสดุ",
      "📦 สามารถคำนวณต้นทุนวัสดุ-แรงงาน-เครื่องมือได้",
      "✅ ไฟล์ Excel สามารถนำเข้า BOQ Analyzer ได้โดยตรง"
    ],
    "canAutoProcess": true,
    "requiresManualReview": false
  }
}
```

---

## 💡 Workflow ตัวอย่าง

### Workflow 1: วิเคราะห์โครงการใหม่

```
1. อัพโหลด TOR.pdf
   ↓
2. ระบบวิเคราะห์ → "นี่คือ TOR"
   ↓
3. ไปที่ TOR Analyzer
   ↓
4. กรอกรายการงานจาก TOR
   ↓
5. คำนวณต้นทุนและกำไร
```

### Workflow 2: ถอด BOQ

```
1. อัพโหลด BOQ.xlsx
   ↓
2. ระบบวิเคราะห์ → "นี่คือ BOQ"
   ↓
3. ไปที่ BOQ Analyzer
   ↓
4. Import ข้อมูลจาก Excel
   ↓
5. ถอดรายการวัสดุ-แรงงาน-เครื่องมือ
   ↓
6. คำนวณต้นทุนและกำไร
```

### Workflow 3: เปรียบเทียบราคา

```
1. อัพโหลด Quotation.pdf
   ↓
2. ระบบวิเคราะห์ → "นี่คือใบเสนอราคา"
   ↓
3. เปรียบเทียบกับต้นทุนที่คำนวณได้
   ↓
4. ตัดสินใจว่าจะรับงานหรือไม่
```

---

## 🔐 ความปลอดภัย

### 1. **File Validation**
- ✅ ตรวจสอบประเภทไฟล์
- ✅ จำกัดขนาดไฟล์ (10 MB)
- ✅ จำกัดจำนวนไฟล์ (10 ไฟล์)

### 2. **Secure Storage**
- ✅ บันทึกใน `/public/uploads`
- ✅ ตั้งชื่อไฟล์ใหม่ (timestamp)
- ✅ ป้องกัน path traversal

### 3. **Error Handling**
- ✅ จัดการ error ครบถ้วน
- ✅ แสดงข้อความ error ที่ชัดเจน
- ✅ ไม่ crash เมื่อเกิด error

---

## 📦 Packages ที่ติดตั้ง

```bash
npm install multer pdf-parse xlsx mammoth sharp
```

### 1. **multer** - จัดการ file upload
### 2. **pdf-parse** - อ่านไฟล์ PDF
### 3. **xlsx** - อ่าน/เขียน Excel
### 4. **mammoth** - อ่านไฟล์ Word
### 5. **sharp** - ประมวลผลรูปภาพ

---

## 🎯 ขั้นตอนถัดไป

### 1. อัพโหลดไฟล์ทดสอบ:
```
http://localhost:3000/upload-demo
```

### 2. ลองอัพโหลด:
- ไฟล์ Excel (BOQ)
- ไฟล์ PDF (TOR)
- รูปภาพ (แบบก่อสร้าง)

### 3. ดูผลการวิเคราะห์:
- ประเภทเอกสาร
- ความมั่นใจ (Confidence)
- คำแนะนำ

---

## 🔥 ฟีเจอร์ขั้นสูง (Coming Soon)

### 1. **OCR (Optical Character Recognition)**
- อ่านข้อความจากรูปภาพ
- อ่าน PDF ที่เป็นรูปภาพ

### 2. **AI Document Analysis**
- วิเคราะห์เนื้อหาด้วย AI
- แยกข้อมูลสำคัญอัตโนมัติ
- สรุปเอกสาร

### 3. **Excel Auto Import**
- นำเข้า BOQ จาก Excel โดยตรง
- แปลงเป็นรายการงานอัตโนมัติ

### 4. **PDF Text Extraction**
- แยกข้อความจาก PDF
- แปลงเป็น structured data

---

## 🎉 สรุป

**File Upload System พร้อมใช้งาน!**

### ความสามารถ:
- ✅ อัพโหลดหลายประเภทไฟล์
- ✅ วิเคราะห์ประเภทอัตโนมัติ
- ✅ แนะนำการดำเนินการ
- ✅ Drag & Drop
- ✅ Progress Bar
- ✅ Preview รูปภาพ

### ไฟล์ที่สร้าง:
1. ✅ `src/lib/file-processor.ts`
2. ✅ `src/app/api/upload-analyze/route.ts`
3. ✅ `src/app/upload-demo/page.tsx`
4. ✅ `src/components/file-uploader.tsx` (อัพเดท)

---

**ลองอัพโหลดไฟล์ได้เลย:** `http://localhost:3000/upload-demo` 📤
