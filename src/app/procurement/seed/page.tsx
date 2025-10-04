'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SeedProcurementPage() {
  const router = useRouter();
  
  // Redirect to search page
  useEffect(() => {
    router.push('/search-procurement');
  }, [router]);
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">กำลังเปลี่ยนหน้า...</h2>
        <p className="text-gray-600">กำลังนำคุณไปยังหน้าค้นหางานประมูล</p>
      </div>
    </div>
  );
}
