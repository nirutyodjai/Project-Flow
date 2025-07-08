
'use server';

export type Project = {
    id: string;
    name: string;
    organization: string | null;
    type: string | null;
    budget: string | null;
    address: string | null;
    contactPerson: string | null;
    phone: string | null;
    documentUrl: string | null;
};

export type Contact = {
    id: string;
    type: string | null;
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    contactPerson: string | null;
};

const mockProjects: Project[] = [
    { id: "proj-a", name: "โครงการก่อสร้างอาคารสำนักงาน A", organization: "บริษัท พัฒนาที่ดินไทย จำกัด", type: "เอกชน", budget: "12,500,000", address: "123 ถนนสาทร, กรุงเทพฯ", contactPerson: "คุณสมศักดิ์", phone: "081-234-5678", documentUrl: "#" },
    { id: "proj-b", name: "โครงการปรับปรุงระบบไฟฟ้า B", organization: "การไฟฟ้านครหลวง", type: "ภาครัฐ", budget: "8,750,000", address: "456 ถนนเพลินจิต, กรุงเทพฯ", contactPerson: "คุณวิเชียร", phone: "082-345-6789", documentUrl: "#" },
    { id: "proj-c", name: "โครงการติดตั้งระบบปรับอากาศ C", organization: "โรงแรมแกรนด์ไฮแอท", type: "เอกชน", budget: "6,200,000", address: "789 ถนนสุขุมวิท, กรุงเทพฯ", contactPerson: "คุณมาลี", phone: "083-456-7890", documentUrl: "#" },
];

const mockContacts: Contact[] = [
    { id: '1', type: "ลูกค้า", name: "บริษัท พัฒนาที่ดินไทย จำกัด", email: "contact@thaidev.co.th", phone: "02-123-4567", address: "123 ถนนสาทร แขวงทุ่งมหาเมฆ เขตสาทร กรุงเทพฯ 10120", contactPerson: "คุณสมศักดิ์ มั่นคง" },
    { id: '2', type: "ซัพพลายเออร์", name: "ห้างหุ้นส่วนจำกัด วัสดุภัณฑ์", email: "sales@wasadu.co.th", phone: "02-345-6789", address: "456 ถนนพระราม 9 แขวงบางกะปิ เขตห้วยขวาง กรุงเทพฯ 10310", contactPerson: "คุณวิชัย รุ่งเรือง" },
    { id: '3', type: "ดีลเลอร์", name: "บริษัท เอ็นเอส เทรดดิ้ง จำกัด", email: "info@nstrading.co.th", phone: "02-567-8901", address: "789 ถนนรัชดาภิเษก แขวงดินแดง เขตดินแดง กรุงเทพฯ 10400", contactPerson: "คุณนภา สุขสวัสดิ์" },
    { id: '4', type: "ผู้รับเหมา", name: "บริษัท ก่อสร้างไทย จำกัด", email: "contact@thaiconstruction.co.th", phone: "02-890-1234", address: "101 ถนนวิภาวดีรังสิต แขวงจตุจักร เขตจตุจักร กรุงเทพฯ 10900", contactPerson: "คุณประเสริฐ ก่อเกียรติ" },
    { id: '5', type: "ซับคอนแทรค", name: "บริษัท ระบบไฟฟ้าไทย จำกัด", email: "info@thaielectric.co.th", phone: "02-456-7890", address: "222 ถนนพัฒนาการ แขวงสวนหลวง เขตสวนหลวง กรุงเทพฯ 10250", contactPerson: "คุณสมชาย ไฟฟ้า" },
    { id: '6', type: "ลูกค้า", name: "บริษัท เรียลเอสเตท กรุ๊ป", email: "hello@realestategroup.com", phone: "02-987-6543", address: "1/2 อาคารวันซิตี้เซ็นเตอร์ ถนนเพลินจิต กรุงเทพฯ", contactPerson: "คุณอารยา เจริญสุข" },
    { id: '7', type: "ซัพพลายเออร์", name: "บริษัท ปูนซีเมนต์ไทย จำกัด (มหาชน)", email: "cement@scc.co.th", phone: "02-586-3333", address: "1 ถนนปูนซิเมนต์ไทย แขวงบางซื่อ เขตบางซื่อ กรุงเทพฯ 10800", contactPerson: "ฝ่ายจัดซื้อ" },
    { id: '8', type: "ผู้รับเหมา", name: "บริษัท อิตาเลียนไทย ดีเวล๊อปเมนต์ จำกัด (มหาชน)", email: "info@itd.co.th", phone: "02-733-4000", address: "2034/132-161 อาคารอิตัลไทย ทาวเวอร์ ถนนเพชรบุรีตัดใหม่ แขวงบางกะปิ เขตห้วยขวาง กรุงเทพฯ 10310", contactPerson: "คุณเปรมชัย กรรณสูต" },
    { id: '9', type: "ลูกค้า", name: "มหาวิทยาลัยเกษตรศาสตร์", email: "registrar@ku.ac.th", phone: "02-579-0113", address: "50 ถนนงามวงศ์วาน แขวงลาดยาว เขตจตุจักร กรุงเทพฯ 10900", contactPerson: "ฝ่ายอาคารและสถานที่" },
    { id: '10', type: "ดีลเลอร์", name: "บริษัท โฮม โปรดักส์ เซ็นเตอร์ จำกัด (มหาชน)", email: "info@homepro.co.th", phone: "02-832-1000", address: "96/27 หมู่ที่ 9 ตำบลบางเขน อำเภอเมืองนนทบุรี จังหวัดนนทบุรี 11000", contactPerson: "ฝ่ายจัดซื้อโครงการ" },
    { id: '11', type: "ซับคอนแทรค", name: "บริษัท ไทยแอร์คอนดิชั่น จำกัด", email: "service@thaiac.co.th", phone: "02-722-9999", address: "1234 ถนนสุขุมวิท แขวงพระโขนง เขตคลองเตย กรุงเทพฯ 10110", contactPerson: "คุณวิรัช ตั้งใจ" },
];

export async function listProjects(args: { query?: string | null }): Promise<Project[] | null> {
    console.log(`Searching for projects with query: ${args.query}`);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    if (!args.query) {
        return mockProjects;
    }
    const queryLower = args.query.toLowerCase();
    return mockProjects.filter(project => 
        project.name.toLowerCase().includes(queryLower) || 
        (project.organization && project.organization.toLowerCase().includes(queryLower))
    );
}

export async function listContacts(): Promise<Contact[] | null> {
    console.log('Fetching all contacts');
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockContacts;
}
