'use client';

import { useState } from 'react';
import { Search, Building2, Calendar, DollarSign, FileText, Sparkles } from 'lucide-react';

export default function SearchProcurementPage() {
  const [keyword, setKeyword] = useState('');
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [estimating, setEstimating] = useState<string | null>(null);
  const [estimates, setEstimates] = useState<Record<string, any>>({});

  // helper: fetch with timeout
  const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeoutMs = 45000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      return res;
    } finally {
      clearTimeout(id);
    }
  };

  const search = async () => {
    setLoading(true);
    setSearched(false);
    setProjects([]);

    try {
      // ใช้ Puppeteer scrape ข้อมูลจริงจาก e-GP
      const response = await fetchWithTimeout('/api/scrape-egp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword: keyword.trim(),
          limit: 50,
        }),
      }, 45000);

      const data = await response.json();

      if (data.success && data.projects) {
        setProjects(data.projects);
        setSearched(true);
      } else {
        setProjects([]);
        setSearched(true);
        alert(`ไม่สามารถดึงข้อมูลจาก e-GP ได้\n\nError: ${data.error || 'Unknown error'}\n\nกำลังสลับไปใช้การค้นหาจากอินเทอร์เน็ต...`);
        await searchRealJobs();
      }
    } catch (error) {
      console.error('Error scraping e-GP:', error);
      setProjects([]);
      setSearched(true);
      const message = error instanceof Error ? error.message : String(error);
      alert(`ไม่สามารถเชื่อมต่อกับ e-GP ได้\n\n${message}\n\nกำลังสลับไปใช้การค้นหาจากอินเทอร์เน็ต...`);
      await searchRealJobs();
    } finally {
      setLoading(false);
    }
  };

  const getDaysUntilClose = (closingDate: string) => {
    const now = new Date();
    const close = new Date(closingDate);
    const diffTime = close.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getAIEstimate = async (project: any) => {
    setEstimating(project.id);
    try {
      const response = await fetch('/api/ai-estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName: project.projectName,
          budget: project.budget,
          organization: project.organization,
          projectType: project.projectType,
          method: project.method,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setEstimates(prev => ({ ...prev, [project.id]: data.estimate }));
      }
    } catch (error) {
      console.error('Error getting AI estimate:', error);
    } finally {
      setEstimating(null);
    }
  };

  const searchRealJobs = async () => {
    if (!keyword.trim()) {
      alert('กรุณาใส่คำค้นหา');
      return;
    }

    setLoading(true);
    setSearched(false);
    setProjects([]);
    
    try {
      const response = await fetch('/api/search-real-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: keyword,
          site: 'gprocurement.go.th',
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Brave Search API Response:', data);
      
      if (data.success && data.results && data.results.length > 0) {
        // แปลงผลลัพธ์จากอินเทอร์เน็ตเป็นรูปแบบโครงการ
        const realProjects = data.results.map((result: any, index: number) => ({
          id: `REAL-${Date.now()}-${index}`,
          projectName: result.title || 'ไม่มีชื่อโครงการ',
          organization: 'หน่วยงานภาครัฐ',
          projectType: 'ภาครัฐ',
          budget: 'ดูรายละเอียดในเว็บไซต์',
          announcementDate: new Date().toISOString().split('T')[0],
          closingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          method: 'ดูรายละเอียดในเว็บไซต์',
          description: result.description || 'ไม่มีรายละเอียด',
          sourceUrl: result.url,
          contactPerson: null,
          phone: null,
          address: null,
        }));
        
        setProjects(realProjects);
        setSearched(true);
      } else {
        // ไม่พบผลลัพธ์จากอินเทอร์เน็ต
        setProjects([]);
        setSearched(true);
        alert(`ไม่พบผลลัพธ์จากอินเทอร์เน็ตสำหรับ "${keyword}"\n\nลองใช้คำค้นหาอื่นหรือคลิกปุ่ม "ค้นหา" สีน้ำเงินเพื่อค้นหาจากฐานข้อมูล`);
      }
    } catch (error) {
      console.error('Error searching from internet:', error);
      setProjects([]);
      setSearched(true);
      alert(`ไม่สามารถค้นหาจากอินเทอร์เน็ตได้\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}\n\nกรุณาตรวจสอบ:\n1. Brave API Key ใน .env\n2. เชื่อมต่ออินเทอร์เน็ต\n3. ลองใช้ปุ่ม "ค้นหา" สีน้ำเงินแทน`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            ค้นหางานประมูล
          </h1>
          <p className="text-gray-600">
            ค้นหาโครงการประมูลจากภาครัฐและเอกชน
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="ค้นหา เช่น ก่อสร้าง, ระบบไฟฟ้า, โรงพยาบาล..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && search()}
              />
            </div>
            <button
              onClick={search}
              disabled={loading}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'กำลังค้นหา...' : 'ค้นหา'}
            </button>
            <button
              onClick={searchRealJobs}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 font-medium flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              ค้นหาจากอินเทอร์เน็ต
            </button>
          </div>
        </div>

        {/* Results Count */}
        {searched && (
          <div className="mb-4 text-gray-600">
            พบ <span className="font-semibold text-gray-900">{projects.length}</span> โครงการ
          </div>
        )}

        {/* Results */}
        <div className="space-y-4">
          {projects.map((project) => {
            const daysLeft = getDaysUntilClose(project.closingDate);
            const isUrgent = daysLeft <= 7;
            const isClosed = daysLeft < 0;

            return (
              <div
                key={project.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md p-6 border border-gray-200"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {project.projectName}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Building2 className="w-4 h-4" />
                      <span>{project.organization}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        project.id.startsWith('EGP')
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      {project.id.startsWith('EGP') ? 'ภาครัฐ' : 'เอกชน'}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      {project.projectType}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-700 mb-4 line-clamp-2">
                  {project.description}
                </p>

                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {/* Budget */}
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <div>
                      <div className="text-xs text-gray-500">งบประมาณ</div>
                      <div className="font-semibold text-gray-900">
                        {project.budget} บาท
                      </div>
                    </div>
                  </div>

                  {/* Announcement Date */}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="text-xs text-gray-500">ประกาศ</div>
                      <div className="font-medium text-gray-900">
                        {formatDate(project.announcementDate)}
                      </div>
                    </div>
                  </div>

                  {/* Closing Date */}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-red-600" />
                    <div>
                      <div className="text-xs text-gray-500">ปิดรับสมัคร</div>
                      <div className={`font-semibold ${
                        isClosed ? 'text-gray-400' : isUrgent ? 'text-red-600' : 'text-gray-900'
                      }`}>
                        {formatDate(project.closingDate)}
                      </div>
                      {!isClosed && (
                        <div className={`text-xs ${isUrgent ? 'text-red-600' : 'text-gray-500'}`}>
                          {isUrgent ? '⚠️ ' : ''}เหลือ {daysLeft} วัน
                        </div>
                      )}
                      {isClosed && (
                        <div className="text-xs text-gray-400">
                          ปิดรับแล้ว
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Method */}
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    วิธีการ: <span className="font-medium">{project.method}</span>
                  </span>
                </div>

                {/* Contact Info */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    {project.contactPerson && (
                      <div className="flex items-start gap-2">
                        <Building2 className="w-4 h-4 text-blue-600 mt-0.5" />
                        <div>
                          <div className="text-gray-500 text-xs">ผู้ติดต่อ</div>
                          <div className="font-medium text-gray-900">{project.contactPerson}</div>
                        </div>
                      </div>
                    )}
                    {project.phone && (
                      <div className="flex items-start gap-2">
                        <div className="text-blue-600 mt-0.5">📞</div>
                        <div>
                          <div className="text-gray-500 text-xs">โทรศัพท์</div>
                          <a 
                            href={`tel:${project.phone.replace(/[^0-9]/g, '')}`}
                            className="font-medium text-blue-600 hover:underline"
                          >
                            {project.phone}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {project.address && (
                    <div className="flex items-start gap-2 mt-3">
                      <div className="text-gray-500 mt-0.5">📍</div>
                      <div>
                        <div className="text-gray-500 text-xs">ที่อยู่</div>
                        <div className="text-sm text-gray-700">{project.address}</div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* AI Estimate */}
                {estimates[project.id] ? (
                  <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                      <span className="font-semibold text-purple-900">การประเมินด้วย AI</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <div className="text-xs text-gray-600">โอกาสชนะ</div>
                        <div className="text-2xl font-bold text-green-600">
                          {estimates[project.id].winProbability}%
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600">กำไรคาดการณ์</div>
                        <div className="text-2xl font-bold text-blue-600">
                          {estimates[project.id].estimatedProfit}%
                        </div>
                      </div>
                    </div>
                    <div className="text-sm space-y-2">
                      <div>
                        <span className="text-gray-600">ราคาแนะนำ:</span>{' '}
                        <span className="font-semibold text-purple-900">
                          {estimates[project.id].recommendedBidPrice} บาท
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">คำแนะนำ:</span>{' '}
                        <span className="font-medium text-purple-900">
                          {estimates[project.id].recommendation}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => getAIEstimate(project)}
                    disabled={estimating === project.id}
                    className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <Sparkles className="w-4 h-4" />
                    {estimating === project.id ? 'กำลังประเมิน...' : 'ประเมินโอกาสชนะด้วย AI'}
                  </button>
                )}

                {/* Footer Info */}
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <div>รหัส: {project.id}</div>
                  {project.sourceUrl && (
                    <div className="text-blue-600">
                      แหล่งข้อมูล: {project.id.startsWith('EGP') ? 'e-GP' : 'ภาคเอกชน'}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {searched && projects.length === 0 && !loading && (
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              ไม่พบโครงการที่ค้นหา
            </h3>
            <p className="text-gray-600">
              ลองเปลี่ยนคำค้นหาหรือค้นหาใหม่อีกครั้ง
            </p>
          </div>
        )}

        {/* Initial State */}
        {!searched && !loading && (
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              ค้นหาโครงการประมูล
            </h3>
            <p className="text-gray-600 mb-4">
              ใส่คำค้นหาหรือคลิกปุ่มค้นหาเพื่อดูโครงการทั้งหมด
            </p>
            <button
              onClick={search}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              ดูโครงการทั้งหมด
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
