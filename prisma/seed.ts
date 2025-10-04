/**
 * Prisma Seed Data
 * ข้อมูลทดสอบสำหรับ Development
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // 1. สร้าง User
  const user = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: 'hashed_password_here', // ในการใช้งานจริงต้อง hash
      role: 'admin',
    },
  });
  console.log('✅ Created user:', user.email);

  // 2. สร้างโครงการ
  const projects = await Promise.all([
    prisma.project.create({
      data: {
        projectName: 'โครงการก่อสร้างอาคารสำนักงาน A',
        organization: 'กรมโยธาธิการและผังเมือง',
        budget: '50000000',
        announcementDate: new Date().toISOString(),
        closingDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        projectType: 'ก่อสร้าง',
        method: 'e-bidding',
        description: 'ก่อสร้างอาคารสำนักงาน 5 ชั้น พื้นที่ใช้สอย 2,000 ตารางเมตร',
        sourceUrl: 'https://process3.gprocurement.go.th',
      },
    }),
    prisma.project.create({
      data: {
        projectName: 'โครงการจัดซื้อวัสดุไฟฟ้า',
        organization: 'กรมทางหลวง',
        budget: '30000000',
        announcementDate: new Date().toISOString(),
        closingDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        projectType: 'จัดซื้อ',
        method: 'e-bidding',
        description: 'จัดซื้อวัสดุไฟฟ้าสำหรับติดตั้งระบบไฟฟ้าแสงสว่าง',
        sourceUrl: 'https://process3.gprocurement.go.th',
      },
    }),
    prisma.project.create({
      data: {
        projectName: 'โครงการปรับปรุงระบบประปา',
        organization: 'องค์การบริหารส่วนจังหวัด',
        budget: '15000000',
        announcementDate: new Date().toISOString(),
        closingDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        projectType: 'ปรับปรุง',
        method: 'e-bidding',
        description: 'ปรับปรุงระบบประปาและท่อส่งน้ำ',
        sourceUrl: 'https://process3.gprocurement.go.th',
      },
    }),
  ]);
  console.log(`✅ Created ${projects.length} projects`);

  // 3. สร้าง Notifications
  const notifications = await Promise.all([
    prisma.notification.create({
      data: {
        userId: user.id,
        projectId: projects[0].id,
        projectName: projects[0].projectName,
        title: '🎯 งานใหม่!',
        message: `${projects[0].projectName} - ปิดรับใน 7 วัน`,
        type: 'new-project',
        priority: 'high',
        amount: 50000000,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        actionUrl: `/projects/${projects[0].id}`,
        actionLabel: 'ดูรายละเอียด',
      },
    }),
    prisma.notification.create({
      data: {
        userId: user.id,
        projectId: projects[1].id,
        projectName: projects[1].projectName,
        title: '⚠️ ใกล้ปิดรับ!',
        message: `${projects[1].projectName} - เหลือเวลาอีก 5 วัน`,
        type: 'deadline-warning',
        priority: 'urgent',
        amount: 30000000,
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        actionUrl: `/projects/${projects[1].id}`,
        actionLabel: 'ยื่นข้อเสนอ',
      },
    }),
  ]);
  console.log(`✅ Created ${notifications.length} notifications`);

  // 4. สร้างวัสดุ
  const materials = await Promise.all([
    prisma.material.create({
      data: {
        name: 'สายไฟ THW 2.5 sq.mm',
        category: 'electrical',
        brand: 'Thai Yazaki',
        unit: 'meter',
        description: 'สายไฟ THW ขนาด 2.5 ตารางมิลลิเมตร สำหรับงานไฟฟ้าทั่วไป',
        tags: ['ไฟฟ้า', 'สายไฟ', 'THW'],
      },
    }),
    prisma.material.create({
      data: {
        name: 'ท่อ PVC 4 นิ้ว',
        category: 'plumbing',
        brand: 'SCG',
        unit: 'piece',
        description: 'ท่อ PVC ขนาด 4 นิ้ว สำหรับงานประปา',
        tags: ['ประปา', 'ท่อ', 'PVC'],
      },
    }),
    prisma.material.create({
      data: {
        name: 'ปูนซีเมนต์ปอร์ตแลนด์',
        category: 'cement',
        brand: 'TPI',
        unit: 'bag',
        description: 'ปูนซีเมนต์ปอร์ตแลนด์ ถุง 50 กก.',
        tags: ['ปูนซีเมนต์', 'ก่อสร้าง'],
      },
    }),
  ]);
  console.log(`✅ Created ${materials.length} materials`);

  // 5. สร้างราคาวัสดุ
  const materialPrices = await Promise.all([
    // ราคาสายไฟ
    prisma.materialPrice.create({
      data: {
        materialId: materials[0].id,
        supplierId: 'supplier-1',
        supplierName: 'ร้านไฟฟ้า A',
        price: 11,
        unit: 'meter',
        inStock: true,
        stockQuantity: 1000,
        deliveryTime: 3,
        deliveryFee: 100,
      },
    }),
    prisma.materialPrice.create({
      data: {
        materialId: materials[0].id,
        supplierId: 'supplier-2',
        supplierName: 'ร้านไฟฟ้า B',
        price: 13,
        unit: 'meter',
        inStock: true,
        stockQuantity: 500,
        deliveryTime: 5,
        deliveryFee: 150,
      },
    }),
    // ราคาท่อ PVC
    prisma.materialPrice.create({
      data: {
        materialId: materials[1].id,
        supplierId: 'supplier-3',
        supplierName: 'ร้านวัสดุก่อสร้าง C',
        price: 85,
        unit: 'piece',
        inStock: true,
        stockQuantity: 200,
        deliveryTime: 2,
        deliveryFee: 200,
      },
    }),
    // ราคาปูนซีเมนต์
    prisma.materialPrice.create({
      data: {
        materialId: materials[2].id,
        supplierId: 'supplier-4',
        supplierName: 'ร้านวัสดุก่อสร้าง D',
        price: 145,
        unit: 'bag',
        inStock: true,
        stockQuantity: 500,
        deliveryTime: 1,
        deliveryFee: 0,
        discount: 5,
        discountCondition: 'ซื้อ 100 ถุงขึ้นไป',
      },
    }),
  ]);
  console.log(`✅ Created ${materialPrices.length} material prices`);

  // 6. สร้างใบเสนอราคา
  const quotation = await prisma.quotation.create({
    data: {
      quotationNumber: 'QT-202510-0001',
      userId: user.id,
      date: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      customerName: 'บริษัท ABC จำกัด',
      customerAddress: '123 ถนนสุขุมวิท กรุงเทพฯ 10110',
      customerPhone: '02-123-4567',
      customerEmail: 'contact@abc.com',
      subtotal: 100000,
      vat: 7000,
      vatPercent: 7,
      total: 107000,
      status: 'draft',
      projectId: projects[0].id,
      projectName: projects[0].projectName,
      items: {
        create: [
          {
            no: 1,
            description: 'งานติดตั้งระบบไฟฟ้า',
            quantity: 1,
            unit: 'งาน',
            unitPrice: 50000,
            amount: 50000,
          },
          {
            no: 2,
            description: 'งานติดตั้งระบบประปา',
            quantity: 1,
            unit: 'งาน',
            unitPrice: 50000,
            amount: 50000,
          },
        ],
      },
    },
    include: {
      items: true,
    },
  });
  console.log('✅ Created quotation:', quotation.quotationNumber);

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
