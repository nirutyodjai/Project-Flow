# 🚀 Multi-Edit File System Guide

**วันที่:** 3 ตุลาคม 2568  
**ฟีเจอร์:** แก้ไขไฟล์หลายจุดพร้อมกัน (10+ edits ในไฟล์เดียว!)

---

## ✨ ความสามารถ

### 1. **Replace Mode** - แทนที่ข้อความ
แทนที่ข้อความหลายจุดพร้อมกัน

### 2. **Regex Mode** - ใช้ Regular Expression
ทรงพลังกว่า! ค้นหาและแทนที่ด้วย pattern

### 3. **Insert Mode** - แทรกโค้ด
แทรกโค้ดในตำแหน่งที่กำหนด

### 4. **Remove Mode** - ลบโค้ด
ลบโค้ดหลายส่วนพร้อมกัน

---

## 🎯 Use Cases

### 1. Refactoring - เปลี่ยนชื่อตัวแปร/ฟังก์ชัน

```typescript
// แก้ไข 10 จุดพร้อมกัน!
const result = await fetch('/api/multi-edit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    filePath: './src/components/Button.tsx',
    mode: 'replace',
    edits: [
      { search: 'oldButtonName', replace: 'newButtonName' },
      { search: 'handleOldClick', replace: 'handleNewClick' },
      { search: 'const oldState', replace: 'const newState' },
      { search: 'interface OldProps', replace: 'interface NewProps' },
      { search: 'type OldType', replace: 'type NewType' },
      { search: 'oldClassName', replace: 'newClassName' },
      { search: 'OLD_CONSTANT', replace: 'NEW_CONSTANT' },
      { search: 'oldFunction()', replace: 'newFunction()' },
      { search: '// Old comment', replace: '// New comment' },
      { search: 'oldImport', replace: 'newImport' },
    ],
    options: {
      backup: true,  // สร้าง backup ก่อนแก้ไข
      dryRun: false, // false = แก้ไขจริง, true = preview
    }
  })
});

console.log(result);
// {
//   success: true,
//   editsApplied: 10,
//   totalEdits: 10,
//   errors: []
// }
```

---

### 2. Clean Up Code - ลบ console.log

```typescript
// ลบ console.log ทั้งหมดด้วย Regex
const result = await fetch('/api/multi-edit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    filePath: './src/app/page.tsx',
    mode: 'regex',
    edits: [
      {
        pattern: 'console\\.log\\([^)]+\\);?',
        flags: 'g',
        replacement: '// removed console.log',
      },
      {
        pattern: 'console\\.error\\([^)]+\\);?',
        flags: 'g',
        replacement: '// removed console.error',
      },
      {
        pattern: 'debugger;?',
        flags: 'g',
        replacement: '// removed debugger',
      },
    ]
  })
});
```

---

### 3. Add Imports - เพิ่ม import หลายอัน

```typescript
// เพิ่ม imports ที่ต้องการ
const result = await fetch('/api/multi-edit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    filePath: './src/components/Dashboard.tsx',
    mode: 'insert',
    edits: [
      {
        after: "'use client';",
        code: "\nimport { useState, useEffect } from 'react';",
      },
      {
        after: "import { useState, useEffect } from 'react';",
        code: "import { useRouter } from 'next/navigation';",
      },
      {
        after: "import { useRouter } from 'next/navigation';",
        code: "import { Button } from '@/components/ui/button';",
      },
      {
        after: "import { Button } from '@/components/ui/button';",
        code: "import { Card } from '@/components/ui/card';",
      },
      {
        after: "import { Card } from '@/components/ui/card';",
        code: "import { toast } from '@/hooks/use-toast';",
      },
    ]
  })
});
```

---

### 4. Remove Comments - ลบ comment

```typescript
// ลบ comment ทั้งหมด
const result = await fetch('/api/multi-edit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    filePath: './src/lib/utils.ts',
    mode: 'remove',
    edits: [
      { startsWith: '//' },      // ลบ single-line comments
      { contains: '/* TODO:' },  // ลบ TODO comments
      { contains: '/* FIXME:' }, // ลบ FIXME comments
      { contains: '/* DEBUG:' }, // ลบ DEBUG comments
    ]
  })
});
```

---

### 5. Batch Replace - แทนที่หลายคำพร้อมกัน

```typescript
// แทนที่คำหลายคำพร้อมกัน
const result = await fetch('/api/multi-edit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    filePath: './src/constants/messages.ts',
    mode: 'replace',
    edits: [
      { search: 'ผิดพลาด', replace: 'เกิดข้อผิดพลาด' },
      { search: 'สำเร็จ', replace: 'ดำเนินการสำเร็จ' },
      { search: 'กำลังโหลด', replace: 'กำลังประมวลผล' },
      { search: 'ยกเลิก', replace: 'ยกเลิกการดำเนินการ' },
      { search: 'ยืนยัน', replace: 'ยืนยันการดำเนินการ' },
      { search: 'ลบ', replace: 'ลบข้อมูล' },
      { search: 'แก้ไข', replace: 'แก้ไขข้อมูล' },
      { search: 'เพิ่ม', replace: 'เพิ่มข้อมูล' },
      { search: 'บันทึก', replace: 'บันทึกข้อมูล' },
      { search: 'ค้นหา', replace: 'ค้นหาข้อมูล' },
    ]
  })
});
```

---

## 🔧 API Endpoints

### POST /api/multi-edit

**Request Body:**
```typescript
{
  filePath: string;           // ไฟล์ที่จะแก้ไข
  mode: 'replace' | 'regex' | 'insert' | 'remove';
  edits: Array<{
    // สำหรับ replace mode
    search?: string;
    replace?: string;
    
    // สำหรับ regex mode
    pattern?: string;
    flags?: string;
    replacement?: string;
    
    // สำหรับ insert mode
    after?: string;
    before?: string;
    atLine?: number;
    code?: string;
    
    // สำหรับ remove mode
    contains?: string;
    startsWith?: string;
    endsWith?: string;
    exactMatch?: string;
    lineNumber?: number;
    
    description?: string;
  }>;
  options?: {
    backup?: boolean;  // สร้าง backup
    dryRun?: boolean;  // preview เท่านั้น
  };
}
```

**Response:**
```typescript
{
  success: boolean;
  filePath: string;
  editsApplied: number;
  totalEdits: number;
  errors: string[];
  preview?: string;  // ถ้า dryRun = true
  timestamp: string;
}
```

---

## 📊 ตัวอย่างการใช้งานจริง

### ตัวอย่าง 1: Rename Component

```typescript
// เปลี่ยนชื่อ component ทั้งไฟล์
await fetch('/api/multi-edit', {
  method: 'POST',
  body: JSON.stringify({
    filePath: './src/components/OldButton.tsx',
    mode: 'replace',
    edits: [
      { search: 'OldButton', replace: 'NewButton' },
      { search: 'oldButton', replace: 'newButton' },
      { search: 'OLD_BUTTON', replace: 'NEW_BUTTON' },
      { search: 'old-button', replace: 'new-button' },
    ],
    options: { backup: true }
  })
});
```

### ตัวอย่าง 2: Add TypeScript Types

```typescript
// เพิ่ม types ให้ฟังก์ชัน
await fetch('/api/multi-edit', {
  method: 'POST',
  body: JSON.stringify({
    filePath: './src/utils/helpers.ts',
    mode: 'regex',
    edits: [
      {
        pattern: 'function (\\w+)\\(([^)]*)\\) \\{',
        flags: 'g',
        replacement: 'function $1($2): void {',
      },
      {
        pattern: 'const (\\w+) = \\(([^)]*)\\) => \\{',
        flags: 'g',
        replacement: 'const $1 = ($2): void => {',
      },
    ]
  })
});
```

### ตัวอย่าง 3: Clean Production Code

```typescript
// ลบโค้ดที่ไม่ต้องการใน production
await fetch('/api/multi-edit', {
  method: 'POST',
  body: JSON.stringify({
    filePath: './src/app/page.tsx',
    mode: 'remove',
    edits: [
      { contains: 'console.' },
      { contains: 'debugger' },
      { contains: '// TODO:' },
      { contains: '// FIXME:' },
      { contains: '// DEBUG:' },
      { contains: '// TEST:' },
    ]
  })
});
```

---

## 🎨 ใช้ใน Component

```typescript
'use client';

import { useState } from 'react';

export default function MultiEditTool() {
  const [result, setResult] = useState<any>(null);

  const refactorFile = async () => {
    const response = await fetch('/api/multi-edit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filePath: './src/components/Button.tsx',
        mode: 'replace',
        edits: [
          { search: 'oldName', replace: 'newName' },
          { search: 'oldFunc', replace: 'newFunc' },
          // ... อีก 8 edits
        ],
        options: { backup: true }
      })
    });

    const data = await response.json();
    setResult(data);
  };

  return (
    <div>
      <button onClick={refactorFile}>
        Refactor File (10 edits)
      </button>
      {result && (
        <pre>{JSON.stringify(result, null, 2)}</pre>
      )}
    </div>
  );
}
```

---

## 🔐 ความปลอดภัย

### Best Practices:
1. **Backup เสมอ** - ใช้ `backup: true`
2. **Preview ก่อน** - ใช้ `dryRun: true` ทดสอบก่อน
3. **Validate Path** - ตรวจสอบ path ให้ถูกต้อง
4. **Error Handling** - จัดการ error ที่อาจเกิด
5. **Version Control** - ใช้ Git commit ก่อนแก้ไข

---

## 🎉 สรุป

**Multi-Edit File System พร้อมใช้งาน!**

### ความสามารถ:
- ✅ แก้ไข 10+ จุดพร้อมกัน
- ✅ Replace, Regex, Insert, Remove
- ✅ Backup อัตโนมัติ
- ✅ Preview ก่อนแก้ไข
- ✅ Error handling ครบถ้วน

### Use Cases:
- ✅ Refactoring
- ✅ Clean up code
- ✅ Add imports
- ✅ Remove comments
- ✅ Batch replace

---

**ลองใช้งานได้เลย!** 🚀
