# 🔌 MCP Servers แนะนำเพิ่มเติม

**วันที่:** 3 ตุลาคม 2568

---

## 📦 MCP Servers ที่ติดตั้งแล้ว

- ✅ **Brave Search** - ค้นหาข้อมูลจากอินเทอร์เน็ต
- ✅ **Filesystem** - จัดการไฟล์และโฟลเดอร์
- ✅ **GitHub** - เชื่อมต่อกับ GitHub

---

## 🌟 MCP Servers ที่แนะนำเพิ่ม

### 1. **PostgreSQL/MySQL MCP** 🗄️
เชื่อมต่อกับฐานข้อมูล

**ติดตั้ง:**
```bash
npm install -g @modelcontextprotocol/server-postgres
npm install -g @modelcontextprotocol/server-mysql
```

**ใช้งาน:**
- Query ข้อมูลโดยตรง
- สร้าง/แก้ไข tables
- ดู schema
- Export/Import data

**Use Case สำหรับโปรเจกต์:**
```typescript
// Query โครงการจากฐานข้อมูล
const projects = await db.query(`
  SELECT * FROM projects 
  WHERE budget > 1000000 
  AND status = 'open'
  ORDER BY closing_date ASC
`);
```

---

### 2. **Slack MCP** 💬
ส่งการแจ้งเตือนและรับข้อมูลจากทีม

**ติดตั้ง:**
```bash
npm install -g @modelcontextprotocol/server-slack
```

**ใช้งาน:**
- ส่งการแจ้งเตือนเมื่อมีงานประมูลใหม่
- แจ้งเตือนเมื่อใกล้ปิดรับสมัคร
- รับ feedback จากทีม
- สร้าง bot ตอบคำถาม

**Use Case:**
```typescript
// แจ้งเตือนงานประมูลใหม่
await slack.sendMessage({
  channel: '#procurement',
  text: '🚨 งานประมูลใหม่! งบ 50M ปิดรับ 15 พ.ย. 2568'
});
```

---

### 3. **Google Drive MCP** 📁
จัดการไฟล์ใน Google Drive

**ติดตั้ง:**
```bash
npm install -g @modelcontextprotocol/server-gdrive
```

**ใช้งาน:**
- อัพโหลดเอกสาร TOR
- แชร์ไฟล์กับทีม
- ดาวน์โหลดเอกสาร
- สร้างโฟลเดอร์

**Use Case:**
```typescript
// อัพโหลด TOR ไป Drive
await gdrive.uploadFile({
  name: 'TOR_Project_2025.pdf',
  folder: 'Procurement Documents',
  file: torFile
});
```

---

### 4. **Email MCP** 📧
ส่งและอ่านอีเมล

**ติดตั้ง:**
```bash
npm install -g @modelcontextprotocol/server-gmail
```

**ใช้งาน:**
- ส่งอีเมลแจ้งเตือน
- อ่านอีเมลจากหน่วยงาน
- ส่งเอกสารประกอบ
- Auto-reply

**Use Case:**
```typescript
// ส่งอีเมลยื่นข้อเสนอ
await gmail.sendEmail({
  to: 'procurement@example.com',
  subject: 'ยื่นข้อเสนอโครงการ...',
  body: 'เรียน...',
  attachments: ['proposal.pdf', 'quotation.xlsx']
});
```

---

### 5. **Google Sheets MCP** 📊
จัดการ Google Sheets

**ติดตั้ง:**
```bash
npm install -g @modelcontextprotocol/server-gsheets
```

**ใช้งาน:**
- บันทึกข้อมูลโครงการ
- สร้างรายงาน
- แชร์ข้อมูลกับทีม
- วิเคราะห์ข้อมูล

**Use Case:**
```typescript
// บันทึกโครงการใน Sheets
await gsheets.appendRow({
  spreadsheetId: 'xxx',
  range: 'Projects!A:E',
  values: [projectName, budget, organization, deadline, status]
});
```

---

### 6. **Notion MCP** 📝
จัดการ Notion workspace

**ติดตั้ง:**
```bash
npm install -g @modelcontextprotocol/server-notion
```

**ใช้งาน:**
- สร้าง database โครงการ
- เขียนบันทึก
- แชร์ความรู้
- สร้าง wiki

**Use Case:**
```typescript
// สร้างหน้าโครงการใน Notion
await notion.createPage({
  parent: { database_id: 'xxx' },
  properties: {
    Name: { title: [{ text: { content: projectName } }] },
    Budget: { number: budget },
    Status: { select: { name: 'In Progress' } }
  }
});
```

---

### 7. **Puppeteer MCP** 🤖
Web Scraping และ Automation

**ติดตั้ง:**
```bash
npm install -g @modelcontextprotocol/server-puppeteer
```

**ใช้งาน:**
- Scrape งานประมูลจากเว็บไซต์
- ดาวน์โหลดเอกสาร TOR
- ตรวจสอบราคาวัสดุ
- Auto-fill forms

**Use Case:**
```typescript
// Scrape งานประมูลจาก e-GP
const projects = await puppeteer.scrape({
  url: 'https://www.gprocurement.go.th',
  selector: '.project-list .item',
  extract: ['title', 'budget', 'deadline']
});
```

---

### 8. **Calendar MCP** 📅
จัดการปฏิทิน (Google Calendar)

**ติดตั้ง:**
```bash
npm install -g @modelcontextprotocol/server-gcal
```

**ใช้งาน:**
- เพิ่มกำหนดการปิดรับสมัคร
- แจ้งเตือนล่วงหน้า
- ดูตารางงาน
- สร้าง meeting

**Use Case:**
```typescript
// เพิ่มวันปิดรับสมัครในปฏิทิน
await gcal.createEvent({
  summary: 'ปิดรับสมัครโครงการ...',
  start: { dateTime: closingDate },
  reminders: { useDefault: false, overrides: [
    { method: 'email', minutes: 24 * 60 }, // 1 วันก่อน
    { method: 'popup', minutes: 60 }       // 1 ชม.ก่อน
  ]}
});
```

---

### 9. **Trello MCP** 📋
จัดการ Trello boards

**ติดตั้ง:**
```bash
npm install -g @modelcontextprotocol/server-trello
```

**ใช้งาน:**
- สร้างการ์ดโครงการ
- ติดตามสถานะ
- มอบหมายงาน
- สร้าง checklist

**Use Case:**
```typescript
// สร้างการ์ดโครงการใหม่
await trello.createCard({
  listId: 'todo-list-id',
  name: projectName,
  desc: `งบประมาณ: ${budget}\nปิดรับ: ${deadline}`,
  labels: ['urgent', 'high-budget']
});
```

---

### 10. **Discord MCP** 🎮
ส่งการแจ้งเตือนผ่าน Discord

**ติดตั้ง:**
```bash
npm install -g @modelcontextprotocol/server-discord
```

**ใช้งาน:**
- แจ้งเตือนทีม
- สร้าง bot
- ส่งรายงาน
- รับคำสั่ง

**Use Case:**
```typescript
// แจ้งเตือนงานประมูลใหม่
await discord.sendMessage({
  channelId: 'xxx',
  content: '🚨 **งานประมูลใหม่!**\n' +
           `📋 ${projectName}\n` +
           `💰 ${budget} บาท\n` +
           `📅 ปิดรับ: ${deadline}`
});
```

---

### 11. **Weather MCP** 🌤️
ดูสภาพอากาศ (สำหรับงานก่อสร้าง)

**ติดตั้ง:**
```bash
npm install -g @modelcontextprotocol/server-weather
```

**ใช้งาน:**
- ตรวจสอบสภาพอากาศ
- วางแผนงานก่อสร้าง
- คาดการณ์ความเสี่ยง

---

### 12. **Translation MCP** 🌐
แปลภาษา

**ติดตั้ง:**
```bash
npm install -g @modelcontextprotocol/server-translate
```

**ใช้งาน:**
- แปลเอกสาร TOR
- แปลข้อความ
- รองรับหลายภาษา

---

### 13. **PDF MCP** 📄
จัดการไฟล์ PDF

**ติดตั้ง:**
```bash
npm install -g @modelcontextprotocol/server-pdf
```

**ใช้งาน:**
- อ่านไฟล์ PDF
- แปลง PDF เป็น text
- สร้าง PDF
- รวม PDF

---

### 14. **Excel MCP** 📈
จัดการไฟล์ Excel

**ติดตั้ง:**
```bash
npm install -g @modelcontextprotocol/server-excel
```

**ใช้งาน:**
- อ่าน/เขียน Excel
- สร้างรายงาน
- วิเคราะห์ข้อมูล
- สร้างกราฟ

---

### 15. **Jira MCP** 🎯
จัดการ Jira tickets

**ติดตั้ง:**
```bash
npm install -g @modelcontextprotocol/server-jira
```

**ใช้งาน:**
- สร้าง issues
- ติดตามงาน
- สร้าง sprint
- รายงานความคืบหน้า

---

## 🎯 แนะนำสำหรับโปรเจกต์นี้

### ลำดับความสำคัญ:

#### 🔥 สำคัญมาก (ติดตั้งเลย!)
1. **Puppeteer MCP** - Scrape งานประมูลจริง
2. **PostgreSQL MCP** - เก็บข้อมูลโครงการ
3. **Slack/Discord MCP** - แจ้งเตือนทีม

#### ⭐ สำคัญ (แนะนำ)
4. **Google Drive MCP** - เก็บเอกสาร
5. **Email MCP** - ส่งอีเมล
6. **Google Sheets MCP** - รายงาน

#### 💡 มีประโยชน์ (ถ้ามีเวลา)
7. **Calendar MCP** - จัดการกำหนดการ
8. **Notion MCP** - จัดการความรู้
9. **PDF MCP** - อ่าน TOR

---

## 🚀 ติดตั้งแบบ Batch

### ติดตั้งทีเดียว:
```bash
npm install -g \
  @modelcontextprotocol/server-puppeteer \
  @modelcontextprotocol/server-postgres \
  @modelcontextprotocol/server-slack \
  @modelcontextprotocol/server-gdrive \
  @modelcontextprotocol/server-gmail \
  @modelcontextprotocol/server-gsheets
```

---

## 📝 ตัวอย่างการใช้งานรวม

### Workflow: ค้นหางานประมูลอัตโนมัติ

```typescript
// 1. Scrape งานประมูลจาก e-GP
const projects = await puppeteer.scrape({
  url: 'https://www.gprocurement.go.th',
  selector: '.project-item'
});

// 2. บันทึกลงฐานข้อมูล
for (const project of projects) {
  await postgres.query(`
    INSERT INTO projects (name, budget, deadline)
    VALUES ($1, $2, $3)
  `, [project.name, project.budget, project.deadline]);
}

// 3. แจ้งเตือนทีม
await slack.sendMessage({
  channel: '#procurement',
  text: `พบงานประมูลใหม่ ${projects.length} รายการ!`
});

// 4. เพิ่มในปฏิทิน
for (const project of projects) {
  await gcal.createEvent({
    summary: `ปิดรับ: ${project.name}`,
    start: { dateTime: project.deadline }
  });
}

// 5. บันทึกใน Google Sheets
await gsheets.appendRows({
  spreadsheetId: 'xxx',
  range: 'Projects!A:D',
  values: projects.map(p => [p.name, p.budget, p.deadline, p.status])
});
```

---

## 🎉 สรุป

**MCP Servers ที่แนะนำ:**

### ติดตั้งแล้ว (3):
- ✅ Brave Search
- ✅ Filesystem
- ✅ GitHub

### แนะนำเพิ่ม (15):
1. PostgreSQL/MySQL
2. Slack
3. Google Drive
4. Email (Gmail)
5. Google Sheets
6. Notion
7. Puppeteer
8. Calendar
9. Trello
10. Discord
11. Weather
12. Translation
13. PDF
14. Excel
15. Jira

---

**เลือกติดตั้งตามความต้องการ!** 🚀
