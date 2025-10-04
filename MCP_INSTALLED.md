# ✅ MCP Servers ที่ติดตั้งแล้ว

**วันที่:** 3 ตุลาคม 2568  
**สถานะ:** ติดตั้งสำเร็จ

---

## 📦 MCP Servers ทั้งหมด (6 ตัว)

### 1. ✅ **Brave Search MCP** 🔍
ค้นหาข้อมูลจากอินเทอร์เน็ต

**API Key:** ใส่แล้วใน `.env`
```env
BRAVE_API_KEY=BSAhJWXSFfDbyShDNsUYAZzFRkWQi3D
```

**ใช้งาน:**
```typescript
// ค้นหางานประมูล
const results = await braveSearch({
  query: "งานประมูล ก่อสร้าง site:gprocurement.go.th"
});
```

---

### 2. ✅ **Filesystem MCP** 📁
จัดการไฟล์และโฟลเดอร์

**ใช้งาน:**
```typescript
// อ่านไฟล์
const content = await readFile('./documents/TOR.pdf');

// เขียนไฟล์
await writeFile('./results/analysis.json', data);
```

---

### 3. ✅ **GitHub MCP** 🐙
เชื่อมต่อกับ GitHub

**ใช้งาน:**
```typescript
// ค้นหาโค้ด
const code = await searchGitHub({
  query: "procurement bidding system",
  type: "code"
});
```

---

### 4. ✅ **Puppeteer MCP** 🤖 (ใหม่!)
Web Scraping และ Automation

**ใช้งาน:**
```typescript
// Scrape งานประมูลจาก e-GP
const projects = await puppeteer.scrape({
  url: 'https://www.gprocurement.go.th',
  selector: '.project-list .item',
  extract: ['title', 'budget', 'deadline']
});
```

**Use Cases:**
- ✅ Scrape งานประมูลจริงจากเว็บไซต์
- ✅ ดาวน์โหลดเอกสาร TOR อัตโนมัติ
- ✅ ตรวจสอบราคาวัสดุก่อสร้าง
- ✅ Auto-fill forms

---

### 5. ✅ **PostgreSQL MCP** 🗄️ (ใหม่!)
เชื่อมต่อกับฐานข้อมูล PostgreSQL

**ตั้งค่า:**
```env
# เพิ่มใน .env
POSTGRES_URL=postgresql://user:password@localhost:5432/dbname
```

**ใช้งาน:**
```typescript
// Query ข้อมูล
const projects = await postgres.query(`
  SELECT * FROM projects 
  WHERE budget > 1000000 
  AND status = 'open'
  ORDER BY closing_date ASC
`);

// Insert ข้อมูล
await postgres.query(`
  INSERT INTO projects (name, budget, deadline)
  VALUES ($1, $2, $3)
`, [projectName, budget, deadline]);
```

**Use Cases:**
- ✅ เก็บข้อมูลโครงการ
- ✅ บันทึกผลการวิเคราะห์
- ✅ สร้างรายงาน
- ✅ Query ข้อมูลซับซ้อน

---

### 6. ✅ **Slack MCP** 💬 (ใหม่!)
ส่งการแจ้งเตือนและรับข้อมูลจากทีม

**ตั้งค่า:**
```env
# เพิ่มใน .env
SLACK_BOT_TOKEN=xoxb-your-token
SLACK_CHANNEL_ID=C1234567890
```

**ใช้งาน:**
```typescript
// ส่งการแจ้งเตือน
await slack.sendMessage({
  channel: '#procurement',
  text: '🚨 งานประมูลใหม่! งบ 50M ปิดรับ 15 พ.ย. 2568'
});

// ส่งพร้อม attachments
await slack.sendMessage({
  channel: '#procurement',
  text: 'งานประมูลใหม่',
  attachments: [{
    color: 'good',
    title: projectName,
    fields: [
      { title: 'งบประมาณ', value: budget },
      { title: 'ปิดรับ', value: deadline }
    ]
  }]
});
```

**Use Cases:**
- ✅ แจ้งเตือนงานประมูลใหม่
- ✅ แจ้งเตือนใกล้ปิดรับสมัคร
- ✅ รับ feedback จากทีม
- ✅ สร้าง bot ตอบคำถาม

---

## 🚀 Workflow ตัวอย่าง

### Auto Procurement Discovery

```typescript
// 1. Scrape งานประมูลจาก e-GP (Puppeteer)
const projects = await puppeteer.scrape({
  url: 'https://www.gprocurement.go.th',
  selector: '.project-item'
});

// 2. บันทึกลงฐานข้อมูล (PostgreSQL)
for (const project of projects) {
  await postgres.query(`
    INSERT INTO projects (name, budget, deadline, organization)
    VALUES ($1, $2, $3, $4)
  `, [project.name, project.budget, project.deadline, project.org]);
}

// 3. แจ้งเตือนทีม (Slack)
await slack.sendMessage({
  channel: '#procurement',
  text: `🎉 พบงานประมูลใหม่ ${projects.length} รายการ!\n` +
        projects.map(p => `• ${p.name} - ${p.budget} บาท`).join('\n')
});

// 4. ค้นหาข้อมูลเพิ่มเติม (Brave Search)
for (const project of projects) {
  const info = await braveSearch({
    query: `${project.organization} ประวัติโครงการ`
  });
  
  await postgres.query(`
    UPDATE projects 
    SET additional_info = $1 
    WHERE name = $2
  `, [info, project.name]);
}
```

---

## 🔐 การตั้งค่า API Keys

### ต้องเพิ่มใน `.env`:

```env
# Brave Search (มีแล้ว ✅)
BRAVE_API_KEY=BSAhJWXSFfDbyShDNsUYAZzFRkWQi3D

# PostgreSQL (ถ้าใช้)
POSTGRES_URL=postgresql://user:password@localhost:5432/dbname

# Slack (ถ้าใช้)
SLACK_BOT_TOKEN=xoxb-your-token-here
SLACK_CHANNEL_ID=C1234567890

# GitHub (Optional)
GITHUB_TOKEN=ghp_xxxxxxxxxxxxx
```

---

## 📚 เอกสารเพิ่มเติม

### Puppeteer MCP:
- Scraping: https://pptr.dev/
- Selectors: https://pptr.dev/guides/query-selectors

### PostgreSQL MCP:
- Connection: https://node-postgres.com/
- Queries: https://node-postgres.com/features/queries

### Slack MCP:
- Bot Token: https://api.slack.com/authentication/token-types
- Messages: https://api.slack.com/messaging/sending

---

## 🎯 ขั้นตอนถัดไป

### 1. ตั้งค่า PostgreSQL (ถ้าต้องการ)
```bash
# ติดตั้ง PostgreSQL
# Windows: https://www.postgresql.org/download/windows/
# Mac: brew install postgresql

# สร้างฐานข้อมูล
createdb procurement_db

# เพิ่ม URL ใน .env
POSTGRES_URL=postgresql://postgres:password@localhost:5432/procurement_db
```

### 2. ตั้งค่า Slack Bot (ถ้าต้องการ)
```
1. ไปที่ https://api.slack.com/apps
2. Create New App
3. เลือก "From scratch"
4. ตั้งชื่อ "Procurement Bot"
5. เลือก Workspace
6. ไปที่ OAuth & Permissions
7. Add Scopes: chat:write, channels:read
8. Install to Workspace
9. คัดลอก Bot Token
10. เพิ่มใน .env
```

### 3. ทดสอบการใช้งาน
```bash
# รีสตาร์ทเซิร์ฟเวอร์
npm run dev

# ทดสอบ Puppeteer
node test-puppeteer.js

# ทดสอบ PostgreSQL
node test-postgres.js

# ทดสอบ Slack
node test-slack.js
```

---

## 🎉 สรุป

**MCP Servers ที่ติดตั้งแล้ว: 6 ตัว**

### พื้นฐาน (3):
- ✅ Brave Search
- ✅ Filesystem
- ✅ GitHub

### ขั้นสูง (3):
- ✅ Puppeteer - Web Scraping
- ✅ PostgreSQL - Database
- ✅ Slack - Notifications

### ความสามารถ:
- ✅ Scrape งานประมูลจริง
- ✅ เก็บข้อมูลในฐานข้อมูล
- ✅ แจ้งเตือนทีมอัตโนมัติ
- ✅ ค้นหาข้อมูลจากอินเทอร์เน็ต
- ✅ จัดการไฟล์และโฟลเดอร์
- ✅ เชื่อมต่อ GitHub

---

**พร้อมใช้งาน!** 🚀
