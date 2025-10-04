/**
 * e-GP Scraper
 * ดึงข้อมูลงานประมูลจริงจากระบบ e-Government Procurement (e-GP)
 */

export interface EGPProject {
  id: string;
  projectName: string;
  organization: string;
  budget: string;
  announcementDate: string;
  closingDate: string;
  projectType: string;
  method: string; // วิธีการจัดซื้อจัดจ้าง
  description: string;
  documentUrl?: string;
  sourceUrl: string;
}

/**
 * ดึงข้อมูลจาก e-GP (Mock - เนื่องจากต้องใช้ web scraping จริง)
 * ในการใช้งานจริง ควรใช้ Puppeteer หรือ Cheerio
 */
export async function searchEGPProjects(
  keyword: string,
  options: {
    limit?: number;
    budgetMin?: number;
    budgetMax?: number;
    projectType?: string;
  } = {}
): Promise<EGPProject[]> {
  const { limit = 20 } = options;

  // Mock data ที่เหมือนข้อมูลจริง - รวมทั้งภาครัฐและเอกชน
  const mockProjects: EGPProject[] = [
    // ภาครัฐ
    {
      id: 'EGP-2025-001234',
      projectName: 'จ้างก่อสร้างอาคารสำนักงาน 5 ชั้น พร้อมระบบสาธารณูปโภค',
      organization: 'กรมทางหลวง',
      budget: '52,500,000',
      announcementDate: '2025-10-01',
      closingDate: '2025-11-15',
      projectType: 'งานก่อสร้าง',
      method: 'e-bidding',
      description: 'ก่อสร้างอาคารสำนักงาน 5 ชั้น พื้นที่ใช้สอยประมาณ 3,500 ตารางเมตร พร้อมระบบไฟฟ้า ประปา และปรับอากาศ',
      documentUrl: 'https://process3.gprocurement.go.th/egp2procmainWeb/jsp/announcement/announcementDetail.jsp?id=001234',
      sourceUrl: 'https://www.gprocurement.go.th',
    },
    {
      id: 'EGP-2025-001235',
      projectName: 'จ้างปรับปรุงระบบไฟฟ้าและระบบปรับอากาศ อาคารผู้ป่วยนอก',
      organization: 'โรงพยาบาลจุฬาลงกรณ์ สภากาชาดไทย',
      budget: '18,750,000',
      announcementDate: '2025-10-02',
      closingDate: '2025-11-10',
      projectType: 'งานระบบ',
      method: 'e-bidding',
      description: 'ปรับปรุงระบบไฟฟ้าแรงสูง ระบบไฟฟ้าแรงต่ำ และระบบปรับอากาศ รวมถึงระบบควบคุมอัตโนมัติ',
      documentUrl: 'https://process3.gprocurement.go.th/egp2procmainWeb/jsp/announcement/announcementDetail.jsp?id=001235',
      sourceUrl: 'https://www.gprocurement.go.th',
    },
    {
      id: 'EGP-2025-001236',
      projectName: 'จ้างติดตั้งระบบปรับอากาศ อาคารเรียนและห้องปฏิบัติการ',
      organization: 'มหาวิทยาลัยธรรมศาสตร์',
      budget: '12,300,000',
      announcementDate: '2025-10-03',
      closingDate: '2025-11-20',
      projectType: 'งานระบบ',
      method: 'e-bidding',
      description: 'ติดตั้งเครื่องปรับอากาศแบบ VRF จำนวน 45 เครื่อง พร้อมระบบท่อและอุปกรณ์ประกอบ',
      documentUrl: 'https://process3.gprocurement.go.th/egp2procmainWeb/jsp/announcement/announcementDetail.jsp?id=001236',
      sourceUrl: 'https://www.gprocurement.go.th',
    },
    {
      id: 'EGP-2025-001237',
      projectName: 'จ้างก่อสร้างถนนคอนกรีตเสริมเหล็ก สายบ้านหนองบัว-บ้านโนนสวรรค์',
      organization: 'เทศบาลนครนนทบุรี',
      budget: '28,900,000',
      announcementDate: '2025-10-04',
      closingDate: '2025-11-25',
      projectType: 'งานก่อสร้าง',
      method: 'e-bidding',
      description: 'ก่อสร้างถนนคอนกรีตเสริมเหล็ก กว้าง 8 เมตร ยาว 2.5 กิโลเมตร พร้อมไหล่ทางและระบบระบายน้ำ',
      documentUrl: 'https://process3.gprocurement.go.th/egp2procmainWeb/jsp/announcement/announcementDetail.jsp?id=001237',
      sourceUrl: 'https://www.gprocurement.go.th',
    },
    {
      id: 'EGP-2025-001238',
      projectName: 'จ้างปรับปรุงระบบประปาและระบบบำบัดน้ำเสีย',
      organization: 'การประปานครหลวง',
      budget: '15,600,000',
      announcementDate: '2025-10-05',
      closingDate: '2025-11-18',
      projectType: 'งานระบบ',
      method: 'e-bidding',
      description: 'ปรับปรุงระบบท่อประปา ขนาด 200-400 มม. ระยะทาง 3 กิโลเมตร พร้อมระบบบำบัดน้ำเสีย',
      documentUrl: 'https://process3.gprocurement.go.th/egp2procmainWeb/jsp/announcement/announcementDetail.jsp?id=001238',
      sourceUrl: 'https://www.gprocurement.go.th',
    },
    {
      id: 'EGP-2025-001239',
      projectName: 'จ้างก่อสร้างสะพานคอนกรีตเสริมเหล็ค ข้ามคลองสายใหญ่',
      organization: 'กรมชลประทาน',
      budget: '45,800,000',
      announcementDate: '2025-10-06',
      closingDate: '2025-12-01',
      projectType: 'งานก่อสร้าง',
      method: 'e-bidding',
      description: 'ก่อสร้างสะพานคอนกรีตเสริมเหล็ก กว้าง 12 เมตร ยาว 85 เมตร พร้อมทางเข้า-ออก',
      documentUrl: 'https://process3.gprocurement.go.th/egp2procmainWeb/jsp/announcement/announcementDetail.jsp?id=001239',
      sourceUrl: 'https://www.gprocurement.go.th',
    },
    {
      id: 'EGP-2025-001240',
      projectName: 'จ้างปรับปรุงระบบไฟฟ้าแสงสว่างและระบบสัญญาณไฟจราจร',
      organization: 'กรุงเทพมหานคร',
      budget: '22,400,000',
      announcementDate: '2025-10-07',
      closingDate: '2025-11-22',
      projectType: 'งานระบบ',
      method: 'e-bidding',
      description: 'ปรับปรุงระบบไฟฟ้าแสงสว่าง LED จำนวน 350 จุด และระบบสัญญาณไฟจราจร 25 จุด',
      documentUrl: 'https://process3.gprocurement.go.th/egp2procmainWeb/jsp/announcement/announcementDetail.jsp?id=001240',
      sourceUrl: 'https://www.gprocurement.go.th',
    },
    {
      id: 'EGP-2025-001241',
      projectName: 'จ้างก่อสร้างอาคารที่พักอาศัยข้าราชการ 4 ชั้น',
      organization: 'กระทรวงมหาดไทย',
      budget: '38,500,000',
      announcementDate: '2025-10-08',
      closingDate: '2025-11-28',
      projectType: 'งานก่อสร้าง',
      method: 'e-bidding',
      description: 'ก่อสร้างอาคารที่พักอาศัย 4 ชั้น จำนวน 48 ห้อง พร้อมสาธารณูปโภคครบครัน',
      documentUrl: 'https://process3.gprocurement.go.th/egp2procmainWeb/jsp/announcement/announcementDetail.jsp?id=001241',
      sourceUrl: 'https://www.gprocurement.go.th',
    },
    
    // ภาคเอกชน - โรงพยาบาล
    {
      id: 'PVT-2025-001001',
      projectName: 'จ้างก่อสร้างอาคารผู้ป่วยใน 8 ชั้น โรงพยาบาลเอกชน',
      organization: 'โรงพยาบาลบำรุงราษฎร์',
      budget: '185,000,000',
      announcementDate: '2025-10-01',
      closingDate: '2025-11-30',
      projectType: 'งานก่อสร้าง',
      method: 'ประกวดราคา',
      description: 'ก่อสร้างอาคารผู้ป่วยใน 8 ชั้น จำนวน 200 เตียง พร้อมห้องผ่าตัด ICU และระบบทางการแพทย์ครบครัน',
      documentUrl: 'https://www.bumrungrad.com/procurement',
      sourceUrl: 'https://www.bumrungrad.com',
    },
    {
      id: 'PVT-2025-001002',
      projectName: 'ติดตั้งระบบปรับอากาศและระบบระบายอากาศห้องผ่าตัด',
      organization: 'โรงพยาบาลกรุงเทพ',
      budget: '32,500,000',
      announcementDate: '2025-10-03',
      closingDate: '2025-11-20',
      projectType: 'งานระบบ',
      method: 'ประกวดราคา',
      description: 'ติดตั้งระบบปรับอากาศ HVAC และระบบกรองอากาศ HEPA สำหรับห้องผ่าตัด 12 ห้อง',
      documentUrl: 'https://www.bangkokhospital.com/procurement',
      sourceUrl: 'https://www.bangkokhospital.com',
    },
    {
      id: 'PVT-2025-001003',
      projectName: 'จัดหาและติดตั้งอุปกรณ์ทางการแพทย์ ห้องฉุกเฉิน',
      organization: 'โรงพยาบาลสมิติเวช',
      budget: '28,900,000',
      announcementDate: '2025-10-05',
      closingDate: '2025-11-25',
      projectType: 'จัดซื้ออุปกรณ์',
      method: 'ประกวดราคา',
      description: 'จัดหาเครื่องมือแพทย์และอุปกรณ์ห้องฉุกเฉิน รวม 45 รายการ',
      documentUrl: 'https://www.samitivej.co.th/procurement',
      sourceUrl: 'https://www.samitivej.co.th',
    },

    // ภาคเอกชน - มหาวิทยาลัย
    {
      id: 'PVT-2025-001004',
      projectName: 'ก่อสร้างอาคารเรียนและห้องปฏิบัติการ 6 ชั้น',
      organization: 'มหาวิทยาลัยหอการค้าไทย',
      budget: '95,000,000',
      announcementDate: '2025-10-02',
      closingDate: '2025-12-01',
      projectType: 'งานก่อสร้าง',
      method: 'ประกวดราคา',
      description: 'ก่อสร้างอาคารเรียน 6 ชั้น พื้นที่ 8,500 ตร.ม. พร้อมห้องปฏิบัติการคอมพิวเตอร์และห้องสมุด',
      documentUrl: 'https://www.utcc.ac.th/procurement',
      sourceUrl: 'https://www.utcc.ac.th',
    },
    {
      id: 'PVT-2025-001005',
      projectName: 'ปรับปรุงระบบเครือข่ายและ Data Center',
      organization: 'มหาวิทยาลัยอัสสัมชัญ',
      budget: '42,000,000',
      announcementDate: '2025-10-04',
      closingDate: '2025-11-22',
      projectType: 'งานระบบ',
      method: 'ประกวดราคา',
      description: 'ปรับปรุงระบบเครือข่าย Gigabit พร้อม Data Center และระบบ Cloud Computing',
      documentUrl: 'https://www.au.edu/procurement',
      sourceUrl: 'https://www.au.edu',
    },

    // ภาคเอกชน - บริษัท/โรงงาน
    {
      id: 'PVT-2025-001006',
      projectName: 'ก่อสร้างโรงงานผลิตชิ้นส่วนอิเล็กทรอนิกส์',
      organization: 'บริษัท ไทยซัมมิท กรุ๊ป จำกัด',
      budget: '250,000,000',
      announcementDate: '2025-10-01',
      closingDate: '2025-12-15',
      projectType: 'งานก่อสร้าง',
      method: 'ประกวดราคา',
      description: 'ก่อสร้างโรงงาน Clean Room พื้นที่ 15,000 ตร.ม. พร้อมระบบสาธารณูปโภคและระบบควบคุมอุณหภูมิ',
      documentUrl: 'https://www.thaisummit.co.th/procurement',
      sourceUrl: 'https://www.thaisummit.co.th',
    },
    {
      id: 'PVT-2025-001007',
      projectName: 'ติดตั้งระบบโซลาร์เซลล์บนหลังคาโรงงาน',
      organization: 'บริษัท ปูนซีเมนต์ไทย จำกัด (มหาชน)',
      budget: '68,500,000',
      announcementDate: '2025-10-03',
      closingDate: '2025-11-28',
      projectType: 'งานระบบ',
      method: 'ประกวดราคา',
      description: 'ติดตั้งระบบโซลาร์เซลล์ขนาด 5 MW พร้อมระบบ Inverter และ Energy Storage',
      documentUrl: 'https://www.scg.com/procurement',
      sourceUrl: 'https://www.scg.com',
    },
    {
      id: 'PVT-2025-001008',
      projectName: 'ก่อสร้างคลังสินค้าอัตโนมัติ (Automated Warehouse)',
      organization: 'บริษัท เซ็นทรัล รีเทล คอร์ปอเรชั่น จำกัด (มหาชน)',
      budget: '180,000,000',
      announcementDate: '2025-10-05',
      closingDate: '2025-12-10',
      projectType: 'งานก่อสร้าง',
      method: 'ประกวดราคา',
      description: 'ก่อสร้างคลังสินค้าอัตโนมัติ พื้นที่ 25,000 ตร.ม. พร้อมระบบ WMS และ Robotics',
      documentUrl: 'https://www.centralretail.com/procurement',
      sourceUrl: 'https://www.centralretail.com',
    },

    // ภาคเอกชน - โรงแรม/รีสอร์ท
    {
      id: 'PVT-2025-001009',
      projectName: 'ปรับปรุงห้องพักและระบบโรงแรม 5 ดาว',
      organization: 'โรงแรมดุสิตธานี',
      budget: '125,000,000',
      announcementDate: '2025-10-02',
      closingDate: '2025-11-30',
      projectType: 'งานปรับปรุง',
      method: 'ประกวดราคา',
      description: 'ปรับปรุงห้องพัก 350 ห้อง พร้อมระบบ Smart Hotel และระบบประหยัดพลังงาน',
      documentUrl: 'https://www.dusit.com/procurement',
      sourceUrl: 'https://www.dusit.com',
    },
    {
      id: 'PVT-2025-001010',
      projectName: 'ก่อสร้างรีสอร์ทหรู พร้อมสปาและสนามกอล์ฟ',
      organization: 'บริษัท แสนสิริ จำกัด (มหาชน)',
      budget: '450,000,000',
      announcementDate: '2025-10-01',
      closingDate: '2025-12-20',
      projectType: 'งานก่อสร้าง',
      method: 'ประกวดราคา',
      description: 'ก่อสร้างรีสอร์ท 5 ดาว จำนวน 120 วิลล่า พร้อมสปา สนามกอล์ฟ 18 หลุม และสิ่งอำนวยความสะดวก',
      documentUrl: 'https://www.sansiri.com/procurement',
      sourceUrl: 'https://www.sansiri.com',
    },

    // ภาคเอกชน - ห้างสรรพสินค้า/ค้าปลีก
    {
      id: 'PVT-2025-001011',
      projectName: 'ก่อสร้างศูนย์การค้าขนาดใหญ่',
      organization: 'บริษัท เซ็นทรัล พัฒนา จำกัด (มหาชน)',
      budget: '850,000,000',
      announcementDate: '2025-10-03',
      closingDate: '2025-12-30',
      projectType: 'งานก่อสร้าง',
      method: 'ประกวดราคา',
      description: 'ก่อสร้างศูนย์การค้า 8 ชั้น พื้นที่ 120,000 ตร.ม. พร้อมที่จอดรถ 2,500 คัน',
      documentUrl: 'https://www.centralpattana.co.th/procurement',
      sourceUrl: 'https://www.centralpattana.co.th',
    },
    {
      id: 'PVT-2025-001012',
      projectName: 'ปรับปรุงระบบไฟฟ้าและปรับอากาศห้างสรรพสินค้า',
      organization: 'บริษัท เดอะมอลล์ กรุ๊ป จำกัด',
      budget: '95,000,000',
      announcementDate: '2025-10-06',
      closingDate: '2025-11-25',
      projectType: 'งานระบบ',
      method: 'ประกวดราคา',
      description: 'ปรับปรุงระบบไฟฟ้า ระบบปรับอากาศ และระบบ BMS ของห้างสรรพสินค้า',
      documentUrl: 'https://www.themallgroup.com/procurement',
      sourceUrl: 'https://www.themallgroup.com',
    },

    // ภาคเอกชน - อสังหาริมทรัพย์
    {
      id: 'PVT-2025-001013',
      projectName: 'ก่อสร้างคอนโดมิเนียมหรู 45 ชั้น',
      organization: 'บริษัท พฤกษา เรียลเอสเตท จำกัด (มหาชน)',
      budget: '1,200,000,000',
      announcementDate: '2025-10-01',
      closingDate: '2026-01-15',
      projectType: 'งานก่อสร้าง',
      method: 'ประกวดราคา',
      description: 'ก่อสร้างคอนโดมิเนียม 45 ชั้น จำนวน 850 ยูนิต พร้อมสิ่งอำนวยความสะดวกครบครัน',
      documentUrl: 'https://www.pruksa.com/procurement',
      sourceUrl: 'https://www.pruksa.com',
    },
    {
      id: 'PVT-2025-001014',
      projectName: 'ก่อสร้างหมู่บ้านจัดสรร 200 หลัง',
      organization: 'บริษัท แลนด์ แอนด์ เฮ้าส์ จำกัด (มหาชน)',
      budget: '380,000,000',
      announcementDate: '2025-10-04',
      closingDate: '2025-12-05',
      projectType: 'งานก่อสร้าง',
      method: 'ประกวดราคา',
      description: 'ก่อสร้างบ้านเดี่ยว 2 ชั้น จำนวน 200 หลัง พร้อมสาธารณูปโภคและสวนสาธารณะ',
      documentUrl: 'https://www.lh.co.th/procurement',
      sourceUrl: 'https://www.lh.co.th',
    },

    // ภาคเอกชน - โทรคมนาคม/เทคโนโลยี
    {
      id: 'PVT-2025-001015',
      projectName: 'ติดตั้งสถานีฐาน 5G และระบบเครือข่าย',
      organization: 'บริษัท แอดวานซ์ อินโฟร์ เซอร์วิส จำกัด (มหาชน)',
      budget: '320,000,000',
      announcementDate: '2025-10-02',
      closingDate: '2025-12-01',
      projectType: 'งานระบบ',
      method: 'ประกวดราคา',
      description: 'ติดตั้งสถานีฐาน 5G จำนวน 500 สถานี พร้อมระบบ Fiber Optic และ Core Network',
      documentUrl: 'https://www.ais.co.th/procurement',
      sourceUrl: 'https://www.ais.co.th',
    },

    // งานเล็ก - ภาครัฐ
    {
      id: 'SMALL-2025-001',
      projectName: 'จ้างซ่อมแซมเครื่องปรับอากาศ โรงเรียนบ้านหนองบัว',
      organization: 'โรงเรียนบ้านหนองบัว สพป.นครราชสีมา',
      budget: '45,000',
      announcementDate: '2025-10-05',
      closingDate: '2025-10-20',
      projectType: 'งานซ่อมบำรุง',
      method: 'เฉพาะเจาะจง',
      description: 'ซ่อมแซมเครื่องปรับอากาศ 3 เครื่อง พร้อมล้างทำความสะอาด',
      documentUrl: 'https://www.gprocurement.go.th',
      sourceUrl: 'https://www.gprocurement.go.th',
    },
    {
      id: 'SMALL-2025-002',
      projectName: 'จัดซื้อวัสดุสำนักงาน ประจำเดือนตุลาคม',
      organization: 'เทศบาลตำบลบ้านใหม่',
      budget: '28,500',
      announcementDate: '2025-10-03',
      closingDate: '2025-10-15',
      projectType: 'จัดซื้อวัสดุ',
      method: 'เฉพาะเจาะจง',
      description: 'จัดซื้อวัสดุสำนักงาน กระดาษ หมึกพิมพ์ และอุปกรณ์สำนักงาน',
      documentUrl: 'https://www.gprocurement.go.th',
      sourceUrl: 'https://www.gprocurement.go.th',
    },
    {
      id: 'SMALL-2025-003',
      projectName: 'จ้างทำป้ายไวนิลประชาสัมพันธ์',
      organization: 'สำนักงานสาธารณสุขอำเภอ',
      budget: '12,800',
      announcementDate: '2025-10-04',
      closingDate: '2025-10-18',
      projectType: 'งานโฆษณา',
      method: 'เฉพาะเจาะจง',
      description: 'ทำป้ายไวนิลประชาสัมพันธ์ ขนาด 3x6 เมตร จำนวน 5 ป้าย',
      documentUrl: 'https://www.gprocurement.go.th',
      sourceUrl: 'https://www.gprocurement.go.th',
    },
    {
      id: 'SMALL-2025-004',
      projectName: 'จ้างเหมาบริการทำความสะอาดอาคาร',
      organization: 'โรงพยาบาลส่งเสริมสุขภาพตำบล',
      budget: '85,000',
      announcementDate: '2025-10-02',
      closingDate: '2025-10-25',
      projectType: 'จ้างเหมาบริการ',
      method: 'เฉพาะเจาะจง',
      description: 'จ้างเหมาบริการทำความสะอาดอาคาร 3 เดือน (ต.ค.-ธ.ค.)',
      documentUrl: 'https://www.gprocurement.go.th',
      sourceUrl: 'https://www.gprocurement.go.th',
    },
    {
      id: 'SMALL-2025-005',
      projectName: 'จัดซื้อครุภัณฑ์คอมพิวเตอร์',
      organization: 'สำนักงานเขตพื้นที่การศึกษา',
      budget: '156,000',
      announcementDate: '2025-10-01',
      closingDate: '2025-10-22',
      projectType: 'จัดซื้ออุปกรณ์',
      method: 'เฉพาะเจาะจง',
      description: 'จัดซื้อคอมพิวเตอร์ All-in-One จำนวน 4 เครื่อง',
      documentUrl: 'https://www.gprocurement.go.th',
      sourceUrl: 'https://www.gprocurement.go.th',
    },
    {
      id: 'SMALL-2025-006',
      projectName: 'จ้างซ่อมแซมรถยนต์ราชการ',
      organization: 'ที่ว่าการอำเภอ',
      budget: '38,900',
      announcementDate: '2025-10-06',
      closingDate: '2025-10-19',
      projectType: 'งานซ่อมบำรุง',
      method: 'เฉพาะเจาะจง',
      description: 'ซ่อมแซมรถยนต์ราชการ เปลี่ยนยาง เบรก และตรวจเช็คระบบ',
      documentUrl: 'https://www.gprocurement.go.th',
      sourceUrl: 'https://www.gprocurement.go.th',
    },
    {
      id: 'SMALL-2025-007',
      projectName: 'จัดซื้ออาหารกลางวันนักเรียน',
      organization: 'โรงเรียนวัดใหม่',
      budget: '245,000',
      announcementDate: '2025-10-03',
      closingDate: '2025-10-20',
      projectType: 'จัดซื้ออาหาร',
      method: 'เฉพาะเจาะจง',
      description: 'จัดซื้ออาหารกลางวันนักเรียน 1 เดือน (พ.ย. 2568)',
      documentUrl: 'https://www.gprocurement.go.th',
      sourceUrl: 'https://www.gprocurement.go.th',
    },
    {
      id: 'SMALL-2025-008',
      projectName: 'จ้างติดตั้งกล้อง CCTV',
      organization: 'เทศบาลตำบล',
      budget: '189,000',
      announcementDate: '2025-10-04',
      closingDate: '2025-10-28',
      projectType: 'งานติดตั้ง',
      method: 'เฉพาะเจาะจง',
      description: 'ติดตั้งกล้อง CCTV จำนวน 6 จุด พร้อมระบบบันทึก',
      documentUrl: 'https://www.gprocurement.go.th',
      sourceUrl: 'https://www.gprocurement.go.th',
    },

    // งานเล็ก - เอกชน
    {
      id: 'SMALL-PVT-001',
      projectName: 'จ้างทำป้ายร้านค้า',
      organization: 'ร้านกาแฟดอยช้าง',
      budget: '15,500',
      announcementDate: '2025-10-05',
      closingDate: '2025-10-18',
      projectType: 'งานโฆษณา',
      method: 'เจรจาตกลง',
      description: 'ทำป้ายร้านค้า LED ขนาด 2x3 เมตร',
      documentUrl: null,
      sourceUrl: 'https://example.com',
    },
    {
      id: 'SMALL-PVT-002',
      projectName: 'จ้างซ่อมแซมระบบไฟฟ้าร้านอาหาร',
      organization: 'ร้านอาหารบ้านสวน',
      budget: '42,000',
      announcementDate: '2025-10-04',
      closingDate: '2025-10-17',
      projectType: 'งานซ่อมบำรุง',
      method: 'เจรจาตกลง',
      description: 'ซ่อมแซมระบบไฟฟ้า เปลี่ยนสายไฟและเบรกเกอร์',
      documentUrl: null,
      sourceUrl: 'https://example.com',
    },
    {
      id: 'SMALL-PVT-003',
      projectName: 'จัดซื้อเครื่องปริ้นเตอร์สำนักงาน',
      organization: 'บริษัท เอสเอ็มอี จำกัด',
      budget: '68,000',
      announcementDate: '2025-10-03',
      closingDate: '2025-10-20',
      projectType: 'จัดซื้ออุปกรณ์',
      method: 'เจรจาตกลง',
      description: 'จัดซื้อเครื่องปริ้นเตอร์ Laser จำนวน 2 เครื่อง',
      documentUrl: null,
      sourceUrl: 'https://example.com',
    },
    {
      id: 'SMALL-PVT-004',
      projectName: 'จ้างทาสีอาคารสำนักงาน',
      organization: 'บริษัท ธุรกิจดี จำกัด',
      budget: '125,000',
      announcementDate: '2025-10-02',
      closingDate: '2025-10-25',
      projectType: 'งานซ่อมบำรุง',
      method: 'เจรจาตกลง',
      description: 'ทาสีภายในอาคารสำนักงาน 3 ชั้น',
      documentUrl: null,
      sourceUrl: 'https://example.com',
    },
    {
      id: 'SMALL-PVT-005',
      projectName: 'จ้างทำเว็บไซต์ธุรกิจ',
      organization: 'ร้านเบเกอรี่หวานใจ',
      budget: '95,000',
      announcementDate: '2025-10-01',
      closingDate: '2025-10-30',
      projectType: 'งานเทคโนโลยี',
      method: 'เจรจาตกลง',
      description: 'ทำเว็บไซต์ธุรกิจพร้อมระบบสั่งซื้อออนไลน์',
      documentUrl: null,
      sourceUrl: 'https://example.com',
    },
    {
      id: 'SMALL-PVT-006',
      projectName: 'จัดซื้อเฟอร์นิเจอร์สำนักงาน',
      organization: 'คลินิกทันตกรรม',
      budget: '178,000',
      announcementDate: '2025-10-05',
      closingDate: '2025-10-22',
      projectType: 'จัดซื้อเฟอร์นิเจอร์',
      method: 'เจรจาตกลง',
      description: 'จัดซื้อโต๊ะ เก้าอี้ และตู้เก็บเอกสาร',
      documentUrl: null,
      sourceUrl: 'https://example.com',
    },
    {
      id: 'SMALL-PVT-007',
      projectName: 'จ้างติดตั้งระบบกล้องวงจรปิด',
      organization: 'ร้านทองคำ',
      budget: '145,000',
      announcementDate: '2025-10-04',
      closingDate: '2025-10-19',
      projectType: 'งานติดตั้ง',
      method: 'เจรจาตกลง',
      description: 'ติดตั้งกล้อง CCTV 8 จุด พร้อม DVR',
      documentUrl: null,
      sourceUrl: 'https://example.com',
    },
    {
      id: 'SMALL-PVT-008',
      projectName: 'จ้างทำระบบบัญชีออนไลน์',
      organization: 'ร้านค้าปลีก',
      budget: '85,000',
      announcementDate: '2025-10-06',
      closingDate: '2025-10-28',
      projectType: 'งานเทคโนโลยี',
      method: 'เจรจาตกลง',
      description: 'ทำระบบบัญชีและสต็อกสินค้าออนไลน์',
      documentUrl: null,
      sourceUrl: 'https://example.com',
    },
  ];

  // กรองตามคำค้นหา
  let filtered = mockProjects;
  if (keyword) {
    const keywordLower = keyword.toLowerCase();
    filtered = mockProjects.filter(
      (p) =>
        p.projectName.toLowerCase().includes(keywordLower) ||
        p.organization.toLowerCase().includes(keywordLower) ||
        p.description.toLowerCase().includes(keywordLower) ||
        p.projectType.toLowerCase().includes(keywordLower)
    );
  }

  // กรองตามงบประมาณ
  if (options.budgetMin || options.budgetMax) {
    filtered = filtered.filter((p) => {
      const budget = parseFloat(p.budget.replace(/,/g, ''));
      if (options.budgetMin && budget < options.budgetMin) return false;
      if (options.budgetMax && budget > options.budgetMax) return false;
      return true;
    });
  }

  // กรองตามประเภท
  if (options.projectType) {
    filtered = filtered.filter((p) =>
      p.projectType.includes(options.projectType!)
    );
  }

  // จำกัดจำนวน
  return filtered.slice(0, limit);
}

/**
 * ดึงรายละเอียดโครงการจาก ID
 */
export async function getEGPProjectDetail(projectId: string): Promise<EGPProject | null> {
  const projects = await searchEGPProjects('', { limit: 100 });
  return projects.find((p) => p.id === projectId) || null;
}

/**
 * ดึงโครงการที่ใกล้ปิดรับสมัคร
 */
export async function getClosingSoonProjects(days: number = 7): Promise<EGPProject[]> {
  const projects = await searchEGPProjects('', { limit: 100 });
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(now.getDate() + days);

  return projects.filter((p) => {
    const closingDate = new Date(p.closingDate);
    return closingDate >= now && closingDate <= futureDate;
  }).sort((a, b) => new Date(a.closingDate).getTime() - new Date(b.closingDate).getTime());
}

/**
 * หมายเหตุ: สำหรับการใช้งานจริง
 * 
 * ควรใช้ Web Scraping จริงด้วย:
 * 1. Puppeteer - สำหรับเว็บไซต์ที่ใช้ JavaScript
 * 2. Cheerio - สำหรับเว็บไซต์ HTML แบบธรรมดา
 * 3. Playwright - ทางเลือกอื่นของ Puppeteer
 * 
 * แหล่งข้อมูลจริง:
 * - https://www.gprocurement.go.th (e-GP)
 * - https://process3.gprocurement.go.th (e-GP Process)
 * - เว็บไซต์จัดซื้อจัดจ้างของหน่วยงานต่างๆ
 * 
 * ข้อควรระวัง:
 * - ต้องเคารพ robots.txt
 * - ไม่ควร scrape บ่อยเกินไป (ใช้ rate limiting)
 * - เก็บ cache ข้อมูลเพื่อลดการ request
 * - ตรวจสอบ Terms of Service ของเว็บไซต์
 */
