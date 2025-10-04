# 🚀 คู่มือการ Deploy ไปยัง Firebase Hosting

## 📋 ข้อมูลโปรเจกต์

- **Site Name:** `projectflow-comdee`
- **Hosting Type:** Firebase Hosting
- **Build Output:** `out` directory (Static Export)

---

## ⚠️ สิ่งที่ต้องเตรียมก่อน Deploy

### 1. ติดตั้ง Firebase CLI
```bash
npm install -g firebase-tools
```

### 2. Login เข้า Firebase
```bash
firebase login
```

### 3. ตรวจสอบว่าเชื่อมต่อ Firebase แล้ว
- ✅ ไฟล์ `.env` มีค่า Firebase config ครบถ้วน
- ✅ ทดสอบระบบใน local ได้แล้ว
- ✅ ไม่มี error ใน console

---

## 🔧 ปรับ Next.js Config สำหรับ Static Export

ต้องแก้ไข `next.config.ts` เพื่อให้ build เป็น static files:

```typescript
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  output: 'export',  // เพิ่มบรรทัดนี้
  distDir: 'out',    // เพิ่มบรรทัดนี้
  trailingSlash: false,
  skipTrailingSlashRedirect: true,
  basePath: '',
  assetPrefix: '',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,  // เพิ่มบรรทัดนี้สำหรับ static export
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
```

---

## 📦 ขั้นตอนการ Deploy

### วิธีที่ 1: Deploy แบบเต็ม (แนะนำ)

```bash
# 1. Build โปรเจกต์
npm run build

# 2. ตรวจสอบว่า build สำเร็จ
# ควรมีโฟลเดอร์ 'out' ถูกสร้างขึ้น

# 3. Deploy ไปยัง Firebase Hosting
firebase deploy --only hosting
```

### วิธีที่ 2: Deploy แบบ One-Command

เพิ่ม script ใน `package.json`:

```json
{
  "scripts": {
    "deploy": "npm run build && firebase deploy --only hosting",
    "deploy:preview": "npm run build && firebase hosting:channel:deploy preview"
  }
}
```

จากนั้นรัน:
```bash
npm run deploy
```

---

## 🎯 ขั้นตอนละเอียด

### Step 1: เตรียมโปรเจกต์

```bash
# ติดตั้ง dependencies ทั้งหมด
npm install

# ตรวจสอบว่าไม่มี error
npm run typecheck
```

### Step 2: ตั้งค่า Firebase Project

```bash
# เชื่อมต่อกับ Firebase project
firebase use --add

# เลือก project ของคุณ
# ตั้งชื่อ alias เป็น 'default'
```

### Step 3: Build โปรเจกต์

```bash
# Build Next.js เป็น static files
npm run build

# ตรวจสอบว่ามีโฟลเดอร์ 'out' ถูกสร้างขึ้น
```

### Step 4: ทดสอบ Local (Optional)

```bash
# ทดสอบ hosting ใน local
firebase serve --only hosting

# เปิดเบราว์เซอร์ที่ http://localhost:5000
```

### Step 5: Deploy

```bash
# Deploy ไปยัง production
firebase deploy --only hosting

# หรือ deploy พร้อม message
firebase deploy --only hosting -m "Deploy version 2.0.0"
```

---

## 🌐 หลัง Deploy เสร็จ

### URL ที่จะได้รับ:
- **Production:** `https://projectflow-comdee.web.app`
- **Alternative:** `https://projectflow-comdee.firebaseapp.com`

### ตรวจสอบการ Deploy:
```bash
# ดูประวัติการ deploy
firebase hosting:channel:list

# ดูข้อมูล site
firebase hosting:sites:list
```

---

## 🔄 การ Deploy แบบ Preview (ทดสอบก่อน)

```bash
# สร้าง preview channel
firebase hosting:channel:deploy preview

# จะได้ URL แบบนี้:
# https://projectflow-comdee--preview-xxxxx.web.app

# ทดสอบให้เรียบร้อยแล้วค่อย deploy จริง
firebase deploy --only hosting
```

---

## ⚙️ การตั้งค่า Custom Domain (Optional)

### 1. เพิ่ม Custom Domain
```bash
firebase hosting:sites:get projectflow-comdee
```

### 2. ไปที่ Firebase Console
- Hosting → Add custom domain
- ใส่ domain ของคุณ เช่น `projectflow.com`
- ทำตาม DNS setup ที่แสดง

### 3. รอ SSL Certificate
- Firebase จะสร้าง SSL certificate ให้อัตโนมัติ
- ใช้เวลาประมาณ 24 ชั่วโมง

---

## 🚨 แก้ปัญหาที่พบบ่อย

### ปัญหา 1: Build ล้มเหลว
```bash
# ลบ cache และ build ใหม่
rm -rf .next out
npm run build
```

### ปัญหา 2: "Firebase project not found"
```bash
# ตรวจสอบ project
firebase projects:list

# เลือก project ใหม่
firebase use your-project-id
```

### ปัญหา 3: "Permission denied"
```bash
# Login ใหม่
firebase logout
firebase login
```

### ปัญหา 4: API Routes ไม่ทำงาน
**สาเหตุ:** Static export ไม่รองรับ API Routes  
**แก้ไข:** ใช้ Firebase Functions แทน หรือใช้ external API

### ปัญหา 5: Images ไม่แสดง
**สาเหตุ:** Next.js Image Optimization ไม่รองรับ static export  
**แก้ไข:** เพิ่ม `unoptimized: true` ใน `next.config.ts`

---

## 📊 Monitoring & Analytics

### ดู Hosting Metrics
```bash
# ดูสถิติการใช้งาน
firebase hosting:channel:list
```

### Firebase Console
- ไปที่ Firebase Console → Hosting
- ดู:
  - Request count
  - Bandwidth usage
  - Deploy history

---

## 🔐 Environment Variables

### สำหรับ Production:
ตรวจสอบว่า `.env` มีค่าที่ถูกต้อง:

```env
# Production Firebase Config
NEXT_PUBLIC_FIREBASE_API_KEY=your_production_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_production_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_production_project
# ... ค่าอื่นๆ
```

**หมายเหตุ:** Environment variables ที่ขึ้นต้นด้วย `NEXT_PUBLIC_` จะถูก embed ใน build

---

## 📝 Checklist ก่อน Deploy

- [ ] แก้ไข `next.config.ts` เพิ่ม `output: 'export'`
- [ ] ตรวจสอบ `.env` มีค่าครบถ้วน
- [ ] รัน `npm run build` สำเร็จ
- [ ] ทดสอบ `firebase serve` ใน local
- [ ] ตรวจสอบไม่มี console errors
- [ ] Login Firebase CLI แล้ว
- [ ] เลือก Firebase project ถูกต้อง
- [ ] พร้อม deploy!

---

## 🎯 คำสั่งที่ใช้บ่อย

```bash
# Build
npm run build

# Deploy
firebase deploy --only hosting

# Deploy with message
firebase deploy --only hosting -m "Update version 2.0.0"

# Preview deploy
firebase hosting:channel:deploy preview

# Serve locally
firebase serve --only hosting

# View deploy history
firebase hosting:channel:list

# Rollback (ถ้าจำเป็น)
firebase hosting:clone SOURCE_SITE_ID:SOURCE_CHANNEL_ID TARGET_SITE_ID:live
```

---

## 🚀 Quick Deploy Script

สร้างไฟล์ `deploy.sh`:

```bash
#!/bin/bash

echo "🚀 Starting deployment..."

# Build
echo "📦 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Deploy
    echo "🌐 Deploying to Firebase Hosting..."
    firebase deploy --only hosting
    
    if [ $? -eq 0 ]; then
        echo "✅ Deployment successful!"
        echo "🌐 Your site is live at: https://projectflow-comdee.web.app"
    else
        echo "❌ Deployment failed!"
        exit 1
    fi
else
    echo "❌ Build failed!"
    exit 1
fi
```

ใช้งาน:
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## 📞 ต้องการความช่วยเหลือ?

- [Firebase Hosting Docs](https://firebase.google.com/docs/hosting)
- [Next.js Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)

---

**พร้อม Deploy แล้ว! 🎉**
