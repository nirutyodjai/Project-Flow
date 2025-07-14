'use server';

import { getDb } from '@/services/firebase';
import { collection, addDoc, serverTimestamp, writeBatch, doc } from 'firebase/firestore';
import { logger } from '@/lib/logger';

// ข้อมูลโครงการสำหรับทดสอบ
const mockProjects = [
  {
    name: "โครงการก่อสร้างอาคารสำนักงาน เฟส 1",
    organization: "บริษัท พัฒนาที่ดินไทย จำกัด",
    type: "เอกชน",
    budget: "15,500,000",
    address: "123 ถนนสาทร แขวงทุ่งมหาเมฆ เขตสาทร กรุงเทพฯ 10120",
    contactPerson: "คุณสมศักดิ์ มั่นคง",
    phone: "081-234-5678",
    documentUrl: "https://example.com/doc1.pdf",
    bidSubmissionDeadline: "2024-07-20T17:00:00.000Z",
  },
  {
    name: "โครงการปรับปรุงระบบไฟฟ้าโรงงาน",
    organization: "การไฟฟ้านครหลวง",
    type: "ภาครัฐ",
    budget: "8,750,000",
    address: "456 ถนนเพลินจิต แขวงลุมพินี เขตปทุมวัน กรุงเทพฯ 10330",
    contactPerson: "คุณวิเชียร เจริญสุข",
    phone: "082-345-6789",
    documentUrl: "https://example.com/doc2.pdf",
    bidSubmissionDeadline: "2024-07-18T16:30:00.000Z",
  },
  {
    name: "โครงการติดตั้งระบบปรับอากาศโรงแรม",
    organization: "โรงแรมแกรนด์ไฮแอท",
    type: "เอกชน",
    budget: "12,200,000",
    address: "789 ถนนสุขุมวิท แขวงคลองตัน เขตวัฒนา กรุงเทพฯ 10110",
    contactPerson: "คุณมาลี สวยงาม",
    phone: "083-456-7890",
    documentUrl: "https://example.com/doc3.pdf",
    bidSubmissionDeadline: "2024-08-15T18:00:00.000Z",
  },
  {
    name: "โครงการก่อสร้างสะพานข้ามแม่น้ำ",
    organization: "กรมทางหลวง",
    type: "ภาครัฐ",
    budget: "85,000,000",
    address: "กรุงเทพฯ - นนทบุรี",
    contactPerson: "คุณประสิทธิ์ ก่อสร้าง",
    phone: "084-567-8901",
    documentUrl: "https://example.com/doc4.pdf",
    bidSubmissionDeadline: "2024-08-01T15:00:00.000Z",
  },
  {
    name: "โครงการปรับปรุงระบบน้ำประปา",
    organization: "การประปานครหลวง",
    type: "ภาครัฐ",
    budget: "25,800,000",
    address: "กรุงเทพฯ และปริมณฑล",
    contactPerson: "คุณสมชาย น้ำใส",
    phone: "085-678-9012",
    documentUrl: "https://example.com/doc5.pdf",
    bidSubmissionDeadline: "2024-07-25T14:00:00.000Z",
  }
];

// ข้อมูลผู้ติดต่อ/ซัพพลายเออร์
const mockContacts = [
  {
    type: "ลูกค้า",
    name: "บริษัท พัฒนาที่ดินไทย จำกัด",
    email: "contact@thaidev.co.th",
    phone: "02-123-4567",
    address: "123 ถนนสาทร แขวงทุ่งมหาเมฆ เขตสาทร กรุงเทพฯ 10120",
    contactPerson: "คุณสมศักดิ์ มั่นคง"
  },
  {
    type: "ซัพพลายเออร์",
    name: "บริษัท ปูนซีเมนต์ไทย จำกัด (มหาชน)",
    email: "cement@scc.co.th",
    phone: "02-586-3333",
    address: "1 ถนนปูนซิเมนต์ไทย แขวงบางซื่อ เขตบางซื่อ กรุงเทพฯ 10800",
    contactPerson: "ฝ่ายจัดซื้อ"
  },
  {
    type: "ซัพพลายเออร์",
    name: "บริษัท เหล็กไทย จำกัด",
    email: "steel@thaisteel.co.th",
    phone: "02-718-8888",
    address: "789 ถนนเพชรบุรีตัดใหม่ แขวงบางกะปิ เขตห้วยขวาง กรุงเทพฯ 10310",
    contactPerson: "คุณวีระ เหล็กแกร่ง"
  },
  {
    type: "ผู้รับเหมา",
    name: "บริษัท ก่อสร้างไทย จำกัด",
    email: "contact@thaiconstruction.co.th",
    phone: "02-890-1234",
    address: "101 ถนนวิภาวดีรังสิต แขวงจตุจักร เขตจตุจักร กรุงเทพฯ 10900",
    contactPerson: "คุณประเสริฐ ก่อเกียรติ"
  },
  {
    type: "ซัพพลายเออร์",
    name: "บริษัท ระบบไฟฟ้าไทย จำกัด",
    email: "info@thaielectric.co.th",
    phone: "02-456-7890",
    address: "222 ถนนพัฒนาการ แขวงสวนหลวง เขตสวนหลวง กรุงเทพฯ 10250",
    contactPerson: "คุณสมชาย ไฟฟ้า"
  },
  {
    type: "ดีลเลอร์",
    name: "บริษัท โฮม โปรดักส์ เซ็นเตอร์ จำกัด (มหาชน)",
    email: "info@homepro.co.th",
    phone: "02-832-1000",
    address: "96/27 หมู่ที่ 9 ตำบลบางเขน อำเภอเมืองนนทบุรี จังหวัดนนทบุรี 11000",
    contactPerson: "ฝ่ายจัดซื้อโครงการ"
  },
  {
    type: "ซับคอนแทรค",
    name: "บริษัท ไทยแอร์คอนดิชั่น จำกัด",
    email: "service@thaiac.co.th",
    phone: "02-722-9999",
    address: "1234 ถนนสุขุมวิท แขวงพระโขนง เขตคลองเตย กรุงเทพฯ 10110",
    contactPerson: "คุณวิรัช ตั้งใจ"
  },
  {
    type: "ซัพพลายเออร์",
    name: "บริษัท คอนกรีตราคาดี จำกัด",
    email: "sales@concretegood.co.th",
    phone: "02-555-1234",
    address: "123/45 ถนนประชาชื่น แขวงทุ่งสองห้อง เขตหลักสี่ กรุงเทพฯ 10210",
    contactPerson: "คุณสมบัติ ราคาดี"
  },
  {
    type: "ซัพพลายเออร์",
    name: "ห้างหุ้นส่วน เหล็กประหยัด",
    email: "cheap@cheapsteel.co.th",
    phone: "02-333-2222",
    address: "456/12 ถนนกรุงเทพกรีฑา แขวงหัวหมาก เขตบางกะปิ กรุงเทพฯ 10240",
    contactPerson: "คุณประหยัด เหล็กถูก"
  },
  {
    type: "ซัพพลายเออร์",
    name: "บริษัท เหล็กคุณภาพสูง จำกัด",
    email: "premium@premiumsteel.co.th",
    phone: "02-555-7777",
    address: "321 ถนนสุขุมวิท แขวงคลองตัน เขตคลองตัน กรุงเทพฯ 10110",
    contactPerson: "คุณคุณภาพ เหล็กดี"
  }
];

// ข้อมูลโครงการ Admin
const mockAdminProjects = [
  {
    name: "ระบบ AI Procurement",
    desc: "พัฒนาระบบค้นหาและวิเคราะห์โครงการประมูลด้วย AI",
    status: "กำลังดำเนินการ",
    progress: 75,
    dueDate: "2024-08-30"
  },
  {
    name: "อัพเกรดฐานข้อมูล",
    desc: "ปรับปรุงประสิทธิภาพฐานข้อมูลและเพิ่มฟีเจอร์ใหม่",
    status: "กำลังดำเนินการ",
    progress: 60,
    dueDate: "2024-08-15"
  },
  {
    name: "ระบบ Countdown Timer",
    desc: "เพิ่มระบบนับเวลาถอยหลังสำหรับกำหนดยื่นซอง",
    status: "เสร็จแล้ว",
    progress: 100,
    dueDate: "2024-07-14"
  },
  {
    name: "การวิเคราะห์วัสดุและราคา",
    desc: "ระบบวิเคราะห์ราคาวัสดุ 3 ระดับพร้อมข้อมูลซัพพลายเออร์",
    status: "เสร็จแล้ว",
    progress: 100,
    dueDate: "2024-07-14"
  }
];

// ข้อมูล Tasks
const mockTasks = [
  {
    title: "ทดสอบระบบ AI วิเคราะห์โครงการ",
    priority: "สูง",
    priorityColor: "bg-red-500",
    time: "09:00 AM",
    checked: false
  },
  {
    title: "อัพเดทข้อมูลซัพพลายเออร์",
    priority: "ปานกลาง",
    priorityColor: "bg-yellow-500",
    time: "10:30 AM",
    checked: false
  },
  {
    title: "ตรวจสอบราคาตลาดล่าสุด",
    priority: "ปานกลาง",
    priorityColor: "bg-yellow-500",
    time: "02:00 PM",
    checked: true
  },
  {
    title: "เตรียมข้อมูลสำหรับประชุม",
    priority: "สูง",
    priorityColor: "bg-red-500",
    time: "03:30 PM",
    checked: false
  },
  {
    title: "ทบทวนระบบการค้นหาออนไลน์",
    priority: "ต่ำ",
    priorityColor: "bg-green-500",
    time: "04:00 PM",
    checked: false
  }
];

export async function seedFirebaseData() {
  try {
    const db = getDb();
    if (!db) {
      throw new Error('Firebase not initialized');
    }

    logger.info('Starting Firebase data seeding...', undefined, 'SeedData');

    // ใช้ batch เพื่อเพิ่มข้อมูลพร้อมกันหลายๆ รายการ
    const batch = writeBatch(db);

    // เพิ่มข้อมูลโครงการ
    logger.info('Seeding projects...', undefined, 'SeedData');
    for (const project of mockProjects) {
      const projectRef = doc(collection(db, 'projects'));
      batch.set(projectRef, {
        ...project,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    // เพิ่มข้อมูลผู้ติดต่อ
    logger.info('Seeding contacts...', undefined, 'SeedData');
    for (const contact of mockContacts) {
      const contactRef = doc(collection(db, 'contacts'));
      batch.set(contactRef, {
        ...contact,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    // เพิ่มข้อมูลโครงการ Admin
    logger.info('Seeding admin projects...', undefined, 'SeedData');
    for (const adminProject of mockAdminProjects) {
      const adminProjectRef = doc(collection(db, 'adminProjects'));
      batch.set(adminProjectRef, {
        ...adminProject,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    // เพิ่มข้อมูล Tasks
    logger.info('Seeding tasks...', undefined, 'SeedData');
    for (const task of mockTasks) {
      const taskRef = doc(collection(db, 'tasks'));
      batch.set(taskRef, {
        ...task,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    // Execute batch
    await batch.commit();

    logger.info('Firebase data seeding completed successfully!', {
      projects: mockProjects.length,
      contacts: mockContacts.length,
      adminProjects: mockAdminProjects.length,
      tasks: mockTasks.length
    }, 'SeedData');

    return {
      success: true,
      message: 'ข้อมูลทั้งหมดถูกเพิ่มเข้า Firebase เรียบร้อยแล้ว',
      data: {
        projects: mockProjects.length,
        contacts: mockContacts.length,
        adminProjects: mockAdminProjects.length,
        tasks: mockTasks.length
      }
    };

  } catch (error) {
    logger.error('Error seeding Firebase data:', error, 'SeedData');
    throw new Error(`Failed to seed Firebase data: ${error}`);
  }
}
