/**
 * Materials Page
 * หน้าค้นหาและเปรียบเทียบราคาวัสดุ
 */

import { MaterialSearch } from '@/components/materials';

export default function MaterialsPage() {
  return (
    <div className="container mx-auto py-6">
      <MaterialSearch />
    </div>
  );
}
