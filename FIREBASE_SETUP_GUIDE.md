# 🔥 คู่มือการตั้งค่า Firebase

## ⚠️ ปัญหาที่พบ

ระบบ **ไม่สามารถเชื่อมต่อ Firebase ได้** เนื่องจาก:
- ❌ ไฟล์ `.env` ไม่มีการตั้งค่า Firebase
- ❌ ขาด Firebase API Keys
- ❌ ขาด Firebase Service Account Key

---

## 📋 ขั้นตอนการแก้ไข

### ขั้นตอนที่ 1: สร้าง Firebase Project

1. ไปที่ [Firebase Console](https://console.firebase.google.com/)
2. คลิก **"Add project"** หรือ **"เพิ่มโปรเจกต์"**
3. ตั้งชื่อโปรเจกต์ เช่น `project-flow`
4. เลือกว่าจะเปิด Google Analytics หรือไม่
5. คลิก **"Create project"**

---

### ขั้นตอนที่ 2: เพิ่ม Web App

1. ในหน้า Project Overview คลิกที่ **"</>"** (Web icon)
2. ตั้งชื่อแอป เช่น `Project Flow Web`
3. ✅ เลือก **"Also set up Firebase Hosting"** (ถ้าต้องการ)
4. คลิก **"Register app"**
5. **คัดลอก Firebase Configuration** ที่แสดงขึ้นมา

จะได้ config แบบนี้:
```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "project-flow-xxxxx.firebaseapp.com",
  projectId: "project-flow-xxxxx",
  storageBucket: "project-flow-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:xxxxx"
};
```

---

### ขั้นตอนที่ 3: เปิดใช้งาน Firestore Database

1. ในเมนูด้านซ้าย คลิก **"Firestore Database"**
2. คลิก **"Create database"**
3. เลือก **"Start in test mode"** (สำหรับการพัฒนา)
4. เลือก Location เช่น `asia-southeast1` (Singapore)
5. คลิก **"Enable"**

---

### ขั้นตอนที่ 4: เปิดใช้งาน Storage

1. ในเมนูด้านซ้าย คลิก **"Storage"**
2. คลิก **"Get started"**
3. เลือก **"Start in test mode"**
4. คลิก **"Next"** และ **"Done"**

---

### ขั้นตอนที่ 5: สร้าง Service Account Key

1. ไปที่ **Project Settings** (ไอคอนเฟือง)
2. เลือกแท็บ **"Service accounts"**
3. คลิก **"Generate new private key"**
4. คลิก **"Generate key"**
5. ไฟล์ JSON จะถูกดาวน์โหลด

---

### ขั้นตอนที่ 6: อัปเดตไฟล์ .env

เปิดไฟล์ `.env` และแทนที่ค่าต่อไปนี้:

```env
# Google AI API Key (มีอยู่แล้ว)
GOOGLE_GENAI_API_KEY=AIzaSyBz8632ktfO_yFkYkpCoBSRsAp6d9rdNOg
GEMINI_API_KEY=AIzaSyBz8632ktfO_yFkYkpCoBSRsAp6d9rdNOg

# Firebase Configuration (จาก Step 2)
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=project-flow-xxxxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=project-flow-xxxxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=project-flow-xxxxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:xxxxx

# Firebase Admin SDK (จาก Step 5)
# วางเนื้อหาไฟล์ JSON ทั้งหมดในบรรทัดเดียว
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"project-flow-xxxxx",...}

# Application Environment
NODE_ENV=development

# Logging Configuration
ENABLE_PRODUCTION_LOGGING=false
LOG_LEVEL=info
```

---

### ขั้นตอนที่ 7: ตั้งค่า Security Rules

#### Firestore Rules
ไปที่ **Firestore Database > Rules** และใช้:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Development mode - อนุญาตทุกอย่าง
    match /{document=**} {
      allow read, write: if true;
    }
    
    // Production mode - ควรใช้แบบนี้
    // match /{document=**} {
    //   allow read, write: if request.auth != null;
    // }
  }
}
```

#### Storage Rules
ไปที่ **Storage > Rules** และใช้:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Development mode
    match /{allPaths=**} {
      allow read, write: if true;
    }
    
    // Production mode
    // match /{allPaths=**} {
    //   allow read, write: if request.auth != null;
    // }
  }
}
```

---

### ขั้นตอนที่ 8: เพิ่มข้อมูลทดสอบ

1. รีสตาร์ทเซิร์ฟเวอร์:
```bash
npm run dev
```

2. เปิดเบราว์เซอร์ที่ `http://localhost:3000`

3. ไปที่หน้า Admin: `http://localhost:3000/admin`

4. คลิก **"จัดการข้อมูล"**

5. คลิก **"เพิ่มข้อมูลทดสอบ"**

6. รอให้ระบบเพิ่มข้อมูล 24 รายการ

---

## ✅ ตรวจสอบการเชื่อมต่อ

### วิธีที่ 1: ตรวจสอบ Console
เปิด Browser DevTools (F12) และดูที่ Console:
- ✅ **ถูกต้อง:** ไม่มี error เกี่ยวกับ Firebase
- ❌ **ผิดพลาด:** มี error "Firebase API Key is not set"

### วิธีที่ 2: ตรวจสอบ Network
ดูที่ Network tab:
- ✅ **ถูกต้อง:** มี request ไปที่ `firestore.googleapis.com`
- ❌ **ผิดพลาด:** ไม่มี request ไปที่ Firebase

### วิธีที่ 3: ตรวจสอบ Firebase Console
ไปที่ Firebase Console > Firestore Database:
- ✅ **ถูกต้อง:** มีข้อมูลใน Collections
- ❌ **ผิดพลาด:** ไม่มีข้อมูลเลย

---

## 🔧 แก้ปัญหาที่พบบ่อย

### ปัญหา 1: "Firebase API Key is not set"
**สาเหตุ:** ไม่มีค่าใน `.env`  
**แก้ไข:** ตรวจสอบว่าไฟล์ `.env` มีค่าครบถ้วน

### ปัญหา 2: "Permission denied"
**สาเหตุ:** Security Rules ไม่อนุญาต  
**แก้ไข:** เปลี่ยน Rules เป็น test mode (ดูขั้นตอนที่ 7)

### ปัญหา 3: "Project not found"
**สาเหตุ:** Project ID ผิด  
**แก้ไข:** ตรวจสอบ `NEXT_PUBLIC_FIREBASE_PROJECT_ID`

### ปัญหา 4: "Invalid API key"
**สาเหตุ:** API Key ผิด  
**แก้ไข:** คัดลอก API Key ใหม่จาก Firebase Console

### ปัญหา 5: Service Account Key ไม่ทำงาน
**สาเหตุ:** JSON format ผิด  
**แก้ไข:** ตรวจสอบว่า JSON ถูกต้องและอยู่ในบรรทัดเดียว

---

## 📝 ตัวอย่าง .env ที่สมบูรณ์

```env
# Google AI API Key
GOOGLE_GENAI_API_KEY=AIzaSyBz8632ktfO_yFkYkpCoBSRsAp6d9rdNOg
GEMINI_API_KEY=AIzaSyBz8632ktfO_yFkYkpCoBSRsAp6d9rdNOg

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC1234567890abcdefghijklmnop
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=project-flow-12345.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=project-flow-12345
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=project-flow-12345.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890

# Firebase Admin SDK
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"project-flow-12345","private_key_id":"abc123","private_key":"-----BEGIN PRIVATE KEY-----\nMIIE...","client_email":"firebase-adminsdk-xxxxx@project-flow-12345.iam.gserviceaccount.com","client_id":"123456789","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40project-flow-12345.iam.gserviceaccount.com"}

# Application Environment
NODE_ENV=development

# Logging
ENABLE_PRODUCTION_LOGGING=false
LOG_LEVEL=info
```

---

## 🎯 หลังจากตั้งค่าเสร็จ

1. ✅ รีสตาร์ทเซิร์ฟเวอร์ (`npm run dev`)
2. ✅ เปิดเบราว์เซอร์ที่ `http://localhost:3000`
3. ✅ ตรวจสอบว่าไม่มี error ใน Console
4. ✅ ไปที่ `/admin` และเพิ่มข้อมูลทดสอบ
5. ✅ ทดสอบฟีเจอร์ต่างๆ

---

## 📞 ต้องการความช่วยเหลือ?

หากยังมีปัญหา:
1. ตรวจสอบ Console logs
2. ดู Network tab ใน DevTools
3. ตรวจสอบ Firebase Console
4. อ่าน [Firebase Documentation](https://firebase.google.com/docs)

---

**สำคัญ:** อย่าลืม commit ไฟล์ `.env` ลงใน `.gitignore` เพื่อความปลอดภัย!
