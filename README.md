# 🚀 Project Flow - AI-Powered Procurement & Project Management System

**เวอร์ชัน:** 2.0.0  
**อัปเดตล่าสุด:** 4 ตุลาคม 2568

---

## 📖 เกี่ยวกับโปรเจกต์

Project Flow เป็นระบบจัดการโครงการและการจัดซื้อจัดจ้างที่ขับเคลื่อนด้วย AI ออกแบบมาเพื่อช่วยให้ธุรกิจก่อสร้างและการจัดซื้อจัดจ้างภาครัฐสามารถจัดการโครงการ วิเคราะห์เอกสาร และตัดสินใจได้อย่างมีประสิทธิภาพ

### ✨ ฟีเจอร์หลัก

#### 🆕 ฟีเจอร์ใหม่ (v2.0):
- 🔔 **Real-time Notifications** - ระบบแจ้งเตือนแบบ Real-time พร้อม Slack integration
- 📊 **Win Rate Analytics** - วิเคราะห์อัตราการชนะงานและแนวโน้ม
- 🎯 **Smart Bidding AI** - AI แนะนำราคาเสนอที่เหมาะสม
- 🔍 **Material Price Comparison** - เปรียบเทียบราคาวัสดุจากหลายร้าน
- 📄 **Auto Quotation Generator** - สร้างใบเสนอราคาอัตโนมัติ

#### ฟีเจอร์เดิม:
- 🤖 **AI-Powered Analysis** - วิเคราะห์เอกสาร TOR และโครงการด้วย Google Gemini AI
- 📊 **Real-time Dashboard** - Dashboard ที่อัปเดตข้อมูลแบบ Real-time
- 📤 **Advanced File Upload** - อัพโหลดหลายไฟล์พร้อม Preview และ Progress tracking
- ⚡ **Quick Actions** - เข้าถึงฟีเจอร์หลักได้อย่างรวดเร็ว
- 🔍 **Project Discovery** - ค้นหาโครงการประมูลที่เหมาะสมโดยอัตโนมัติ
- 📈 **Trading Game** - ฝึกทักษะการซื้อขายวัสดุก่อสร้าง

---

## 🛠️ เทคโนโลยีที่ใช้

### Frontend
- **Next.js 15** - React Framework
- **TypeScript** - Type Safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI Components
- **Recharts** - Data Visualization

### Backend & Database
- **PostgreSQL** - Primary Database
- **Prisma ORM** - Type-safe Database Access
- **Google Gemini AI** - AI Analysis
- **Genkit** - AI Framework
- **Brave Search API** - Web Search

### Development Tools
- **ESLint** - Code Linting
- **Jest** - Testing
- **TypeScript** - Type Checking

---

## 🚀 การติดตั้งและเริ่มต้นใช้งาน

### ข้อกำหนดเบื้องต้น
- Node.js 18+ 
- npm หรือ yarn
- PostgreSQL 14+
- Google AI API Key (Optional)

### ขั้นตอนการติดตั้ง

1. **Clone โปรเจกต์**
```bash
git clone https://github.com/yourusername/project-flow.git
cd project-flow
```

2. **ติดตั้ง Dependencies**
```bash
npm install
```

3. **ตั้งค่า Environment Variables**

สร้างไฟล์ `.env` และเพิ่มค่าต่อไปนี้:
```env
# Database (Required)
POSTGRES_URL=postgresql://user:password@localhost:5432/dbname

# Google AI (Optional)
GOOGLE_GENAI_API_KEY=your_google_ai_key
GEMINI_API_KEY=your_google_ai_key

# Brave Search (Optional)
BRAVE_API_KEY=your_brave_api_key

# Application
NODE_ENV=development
```

4. **Setup Database**
```bash
# Generate Prisma Client
npm run prisma:generate

# Push schema to database
npm run prisma:push

# Seed sample data
npm run prisma:seed

# Open Prisma Studio (optional)
npm run prisma:studio
```

5. **รันโปรเจกต์**
```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

6. **เปิดเบราว์เซอร์**
```
http://localhost:3000
```

---

## 📚 เอกสารประกอบ

### 🆕 เอกสารใหม่ (v2.0):
- 🎉 [DEVELOPMENT_COMPLETE.md](./DEVELOPMENT_COMPLETE.md) - สรุปการพัฒนาครั้งสุดท้าย
- 📊 [NEW_FEATURES_SUMMARY.md](./NEW_FEATURES_SUMMARY.md) - สรุปฟีเจอร์ใหม่ทั้งหมด
- 🗄️ [DATABASE_SETUP_POSTGRESQL.md](./DATABASE_SETUP_POSTGRESQL.md) - คู่มือ Setup PostgreSQL
- 🔄 [POSTGRESQL_MIGRATION_COMPLETE.md](./POSTGRESQL_MIGRATION_COMPLETE.md) - Migration Guide
- ❌ [FIREBASE_REMOVED.md](./FIREBASE_REMOVED.md) - สรุปการลบ Firebase
- 🚀 [NEW_API_ROUTES.md](./NEW_API_ROUTES.md) - API Documentation

### เอกสารเดิม:
- 📖 [QUICK_START_GUIDE.md](./QUICK_START_GUIDE.md) - คู่มือเริ่มต้นใช้งาน
- 📝 [DEVELOPMENT_UPDATE.md](./DEVELOPMENT_UPDATE.md) - รายละเอียดการพัฒนา
- ✅ [SYSTEM_READY.md](./SYSTEM_READY.md) - สถานะระบบ

---

## 🎯 การใช้งานเบื้องต้น

### 1. Dashboard หลัก
เข้าสู่หน้า Dashboard เพื่อดูภาพรวมของโครงการและสถิติต่างๆ

### 2. Quick Actions
ใช้ Quick Actions บน Dashboard เพื่อเข้าถึงฟีเจอร์หลัก:
- วิเคราะห์เอกสาร
- ค้นหาโครงการ
- ที่ปรึกษาการประมูล
- รายงานขั้นสูง
- เกมเทรดดิ้ง
- คำนวณราคา

### 3. อัพโหลดไฟล์
ใช้ FileUploader เพื่ออัพโหลดเอกสารและไฟล์ต่างๆ:
- รองรับหลายไฟล์พร้อมกัน
- แสดง Preview สำหรับรูปภาพ
- ติดตามความคืบหน้าการอัพโหลด

### 4. การแจ้งเตือน
คลิกที่ไอคอนกระดิ่งเพื่อดูการแจ้งเตือนทั้งหมด

---

## 🧪 การทดสอบ

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Type checking
npm run typecheck
```

---

## 📦 Scripts ที่มีให้ใช้

```bash
npm run dev          # รัน development server
npm run build        # Build สำหรับ production
npm start            # รัน production server
npm run lint         # ตรวจสอบ code quality
npm run typecheck    # ตรวจสอบ TypeScript
npm test             # รัน tests
npm run genkit:dev   # รัน Genkit development
```

---

## 🌟 ฟีเจอร์ที่โดดเด่น

### 1. AI Document Analyzer
วิเคราะห์เอกสาร TOR และสรุปข้อมูลสำคัญด้วย AI

### 2. Automated Project Discovery
ค้นหาและแนะนำโครงการประมูลที่เหมาะสมโดยอัตโนมัติ

### 3. Bidding Strategy Advisor
รับคำแนะนำกลยุทธ์การประมูลจาก AI

### 4. Real-time Dashboard
ติดตามสถานะโครงการและข้อมูลแบบ Real-time

### 5. Trading Game
ฝึกทักษะการซื้อขายวัสดุก่อสร้างในสภาพแวดล้อมที่ปลอดภัย

---

## 🤝 การมีส่วนร่วม

เรายินดีรับ contributions จากทุกคน! 

1. Fork โปรเจกต์
2. สร้าง Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit การเปลี่ยนแปลง (`git commit -m 'Add some AmazingFeature'`)
4. Push ไปยัง Branch (`git push origin feature/AmazingFeature`)
5. เปิด Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details

---

## 👥 ทีมพัฒนา

- **Lead Developer** - ธนพล
- **AI Integration** - Team AI
- **UI/UX Design** - Design Team

---

## 📞 ติดต่อ

- **Email:** support@projectflow.com
- **Website:** https://projectflow.com
- **GitHub:** https://github.com/projectflow

---

## 🙏 ขอบคุณ

ขอบคุณทุกคนที่มีส่วนร่วมในการพัฒนาโปรเจกต์นี้

---

**Made with ❤️ in Thailand**
