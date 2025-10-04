/**
 * ทดสอบ Multi-Edit API
 * รัน: node test-multi-edit.js
 */

async function testMultiEdit() {
  console.log('🚀 Testing Multi-Edit API...\n');

  // ตัวอย่าง 1: ลบ console.log
  console.log('📝 Test 1: Remove console.log statements');
  const test1 = await fetch('http://localhost:3000/api/multi-edit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filePath: './src/app/search-procurement/page.tsx',
      mode: 'remove',
      edits: [
        { contains: 'console.log', description: 'ลบ console.log' },
        { contains: 'console.error', description: 'ลบ console.error' },
      ],
      options: {
        backup: true,
        dryRun: true, // Preview เท่านั้น
      }
    })
  });

  const result1 = await test1.json();
  console.log('Result:', result1);
  console.log('\n---\n');

  // ตัวอย่าง 2: แทนที่ข้อความ
  console.log('📝 Test 2: Replace text');
  const test2 = await fetch('http://localhost:3000/api/multi-edit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filePath: './src/app/search-procurement/page.tsx',
      mode: 'replace',
      edits: [
        { 
          search: 'ค้นหางานประมูล', 
          replace: 'ค้นหาโครงการประมูล',
          description: 'เปลี่ยนคำว่า งาน เป็น โครงการ'
        },
      ],
      options: {
        backup: true,
        dryRun: true,
      }
    })
  });

  const result2 = await test2.json();
  console.log('Result:', result2);
  console.log('\n---\n');

  // ตัวอย่าง 3: ดูตัวอย่างการใช้งาน
  console.log('📚 Test 3: Get API documentation');
  const test3 = await fetch('http://localhost:3000/api/multi-edit');
  const result3 = await test3.json();
  console.log('API Info:', JSON.stringify(result3, null, 2));
}

// รัน
testMultiEdit().catch(console.error);
