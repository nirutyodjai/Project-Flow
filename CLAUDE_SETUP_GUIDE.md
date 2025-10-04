# 🤖 คู่มือการตั้งค่า Claude Sonnet 4.5

**วันที่:** 3 ตุลาคม 2568  
**Model:** Claude Sonnet 4.5 (claude-sonnet-4-20250514)

---

## 🎯 ภาพรวม

ระบบได้เพิ่ม **Claude Sonnet 4.5** จาก Anthropic เข้ามาแล้ว ทำงานควบคู่กับ **Gemini 2.0 Flash**

### ✨ ข้อดีของ Claude Sonnet 4.5

1. **ความแม่นยำสูง** - วิเคราะห์ได้ละเอียดและแม่นยำมาก
2. **เข้าใจบริบท** - เข้าใจภาษาไทยและบริบทได้ดีเยี่ยม
3. **การให้เหตุผล** - ให้เหตุผลที่ชัดเจนและเป็นขั้นตอน
4. **ความปลอดภัย** - มีมาตรการความปลอดภัยสูง
5. **Context Window** - รองรับข้อความยาวมาก (200K tokens)

---

## 📦 การติดตั้ง

### 1. ติดตั้ง Package

```bash
npm install @anthropic-ai/sdk
```

### 2. ตั้งค่า API Key

#### ขั้นตอนที่ 1: สมัคร Anthropic Account
1. ไปที่ https://console.anthropic.com/
2. สมัครบัญชี (ใช้ Email)
3. ยืนยัน Email

#### ขั้นตอนที่ 2: สร้าง API Key
1. ไปที่ **API Keys** ในเมนู
2. คลิก **Create Key**
3. ตั้งชื่อ Key เช่น "Project Flow"
4. คัดลอก API Key (จะแสดงครั้งเดียว!)

#### ขั้นตอนที่ 3: เพิ่มใน .env
```env
# Anthropic Claude API Key
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxx
CLAUDE_API_KEY=sk-ant-api03-xxxxxxxxxxxxx
```

### 3. รีสตาร์ทเซิร์ฟเวอร์
```bash
# กด Ctrl+C แล้วรันใหม่
npm run dev
```

---

## 🚀 การใช้งาน

### 1. ตรวจสอบสถานะ Claude

```bash
# เรียก API
curl http://localhost:3000/api/claude/analyze
```

**Response:**
```json
{
  "available": true,
  "model": "claude-sonnet-4-20250514",
  "status": "ready"
}
```

---

### 2. วิเคราะห์เอกสารด้วย Claude

#### ผ่าน API:
```typescript
const response = await fetch('/api/claude/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    documentText: 'เนื้อหาเอกสาร TOR...',
    analysisType: 'tor' // หรือ 'contract', 'specification', 'general'
  })
});

const data = await response.json();
console.log(data.analysis);
```

#### ผ่าน Library:
```typescript
import { analyzeDocumentWithClaude } from '@/lib/claude';

const analysis = await analyzeDocumentWithClaude(
  'เนื้อหาเอกสาร...',
  'tor'
);

console.log(analysis);
```

---

### 3. ใช้ Claude สำหรับการวิเคราะห์ขั้นสูง

```typescript
import { advancedAnalysisWithClaude } from '@/lib/claude';

const result = await advancedAnalysisWithClaude({
  projectName: 'ก่อสร้างอาคารสำนักงาน',
  budget: '50,000,000',
  requirements: [
    'ต้องเสร็จภายใน 6 เดือน',
    'ใช้วัสดุคุณภาพสูง',
    'มีประสบการณ์ 5 ปีขึ้นไป'
  ],
  context: 'โครงการภาครัฐ กรมทางหลวง'
});

console.log(result);
```

---

## 📊 Models ที่มีให้ใช้

```typescript
import { CLAUDE_MODELS } from '@/lib/claude';

// Claude Sonnet 4.5 (แนะนำ - สมดุลระหว่างความเร็วและคุณภาพ)
CLAUDE_MODELS.SONNET_4_5

// Claude 3.7 Sonnet
CLAUDE_MODELS.SONNET_3_7

// Claude Opus 4 (ทรงพลังที่สุด แต่ช้าและแพงกว่า)
CLAUDE_MODELS.OPUS_4

// Claude Haiku 3.5 (เร็วที่สุด แต่ความสามารถน้อยกว่า)
CLAUDE_MODELS.HAIKU_3_5
```

---

## 🎯 Use Cases

### 1. วิเคราะห์ TOR
```typescript
const analysis = await analyzeDocumentWithClaude(torText, 'tor');
```

**ผลลัพธ์:**
```json
{
  "summary": "สรุปโครงการ...",
  "keyPoints": ["จุดสำคัญ 1", "จุดสำคัญ 2"],
  "requirements": ["ข้อกำหนด 1", "ข้อกำหนด 2"],
  "recommendations": ["คำแนะนำ 1"],
  "warnings": ["ข้อควรระวัง 1"]
}
```

### 2. วิเคราะห์สัญญา
```typescript
const analysis = await analyzeDocumentWithClaude(contractText, 'contract');
```

### 3. วิเคราะห์ Specification
```typescript
const analysis = await analyzeDocumentWithClaude(specText, 'specification');
```

---

## 🔄 เปรียบเทียบ Claude vs Gemini

### Claude Sonnet 4.5
- ✅ ความแม่นยำสูงมาก
- ✅ เข้าใจบริบทดีเยี่ยม
- ✅ ให้เหตุผลชัดเจน
- ⚠️ ช้ากว่า Gemini เล็กน้อย
- ⚠️ ค่าใช้จ่ายสูงกว่า

### Gemini 2.0 Flash
- ✅ เร็วมาก
- ✅ ถูกกว่า
- ✅ Multimodal (รูปภาพ, เสียง)
- ⚠️ ความแม่นยำน้อยกว่า Claude

### แนะนำการใช้งาน:
- **Claude** → การวิเคราะห์ที่ต้องการความแม่นยำสูง (TOR, สัญญา)
- **Gemini** → การวิเคราะห์ทั่วไป, ค้นหาโครงการ, สรุปเอกสาร

---

## 💰 ราคา (ประมาณการ)

### Claude Sonnet 4.5
- **Input:** $3 / 1M tokens
- **Output:** $15 / 1M tokens

### ตัวอย่างการคำนวณ:
- วิเคราะห์เอกสาร 10,000 คำ ≈ 13,000 tokens
- Input: $0.039
- Output (2,000 tokens): $0.03
- **รวม:** ~$0.07 ต่อครั้ง

---

## 🔧 Configuration

### ปรับแต่งพารามิเตอร์:

```typescript
import { sendToClaude, CLAUDE_MODELS } from '@/lib/claude';

const response = await sendToClaude(prompt, {
  model: CLAUDE_MODELS.SONNET_4_5,
  maxTokens: 8000,        // จำนวน tokens สูงสุด
  temperature: 0.2,       // 0-1 (ต่ำ = แม่นยำ, สูง = สร้างสรรค์)
  systemPrompt: 'คำแนะนำสำหรับ AI...'
});
```

---

## 🧪 การทดสอบ

### ทดสอบการเชื่อมต่อ:
```typescript
import { testClaudeConnection } from '@/lib/claude';

const isConnected = await testClaudeConnection();
console.log('Claude connected:', isConnected);
```

### ทดสอบผ่าน Browser:
```javascript
// เปิด Console (F12)
fetch('/api/claude/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    documentText: 'ทดสอบการวิเคราะห์',
    analysisType: 'general'
  })
})
.then(r => r.json())
.then(console.log);
```

---

## 🔐 ความปลอดภัย

### Best Practices:
1. **ไม่ commit API Key** - เพิ่ม `.env` ใน `.gitignore`
2. **ใช้ Environment Variables** - ไม่ hardcode ในโค้ด
3. **จำกัด Rate Limit** - ป้องกันการใช้งานเกิน
4. **Validate Input** - ตรวจสอบข้อมูลก่อนส่งไปยัง API
5. **Error Handling** - จัดการ error อย่างเหมาะสม

---

## 📝 ตัวอย่างการใช้งานจริง

### สร้างหน้าวิเคราะห์ด้วย Claude:

```typescript
// src/app/claude-analysis/page.tsx
'use client';

import { useState } from 'react';

export default function ClaudeAnalysisPage() {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/claude/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentText: text,
          analysisType: 'tor'
        })
      });
      const data = await response.json();
      setResult(data.analysis);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">
        วิเคราะห์เอกสารด้วย Claude Sonnet 4.5
      </h1>
      
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full h-64 p-4 border rounded"
        placeholder="วางเนื้อหาเอกสารที่นี่..."
      />
      
      <button
        onClick={analyze}
        disabled={loading}
        className="mt-4 px-6 py-2 bg-blue-500 text-white rounded"
      >
        {loading ? 'กำลังวิเคราะห์...' : 'วิเคราะห์'}
      </button>
      
      {result && (
        <div className="mt-8 p-4 bg-gray-100 rounded">
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
```

---

## 🎉 สรุป

**Claude Sonnet 4.5 พร้อมใช้งานแล้ว!**

### ไฟล์ที่สร้าง:
1. ✅ `src/lib/claude.ts` - Claude Service
2. ✅ `src/app/api/claude/analyze/route.ts` - API Endpoint
3. ✅ `.env` - เพิ่ม API Key template
4. ✅ `CLAUDE_SETUP_GUIDE.md` - คู่มือนี้

### ขั้นตอนถัดไป:
1. ติดตั้ง package: `npm install @anthropic-ai/sdk`
2. เพิ่ม API Key ใน `.env`
3. รีสตาร์ทเซิร์ฟเวอร์
4. ทดสอบการใช้งาน

---

**Made with ❤️ - Claude Sonnet 4.5 Integration**
