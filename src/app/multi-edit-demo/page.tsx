'use client';

import { useState } from 'react';
import { Sparkles, FileEdit, Trash2, Plus, RefreshCw } from 'lucide-react';

export default function MultiEditDemoPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const examples = [
    {
      name: 'ลบ console.log ทั้งหมด',
      icon: Trash2,
      color: 'red',
      action: async () => {
        setLoading(true);
        try {
          const response = await fetch('/api/multi-edit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filePath: './src/app/search-procurement/page.tsx',
              mode: 'remove',
              edits: [
                { contains: 'console.log' },
                { contains: 'console.error' },
              ],
              options: { backup: true, dryRun: true }
            })
          });
          const data = await response.json();
          setResult(data);
        } catch (error) {
          setResult({ error: String(error) });
        } finally {
          setLoading(false);
        }
      }
    },
    {
      name: 'เปลี่ยนคำว่า "งาน" เป็น "โครงการ"',
      icon: FileEdit,
      color: 'blue',
      action: async () => {
        setLoading(true);
        try {
          const response = await fetch('/api/multi-edit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filePath: './src/app/search-procurement/page.tsx',
              mode: 'replace',
              edits: [
                { search: 'ค้นหางานประมูล', replace: 'ค้นหาโครงการประมูล' },
                { search: 'งานประมูล', replace: 'โครงการประมูล' },
              ],
              options: { backup: true, dryRun: true }
            })
          });
          const data = await response.json();
          setResult(data);
        } catch (error) {
          setResult({ error: String(error) });
        } finally {
          setLoading(false);
        }
      }
    },
    {
      name: 'เพิ่ม import statements',
      icon: Plus,
      color: 'green',
      action: async () => {
        setLoading(true);
        try {
          const response = await fetch('/api/multi-edit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filePath: './src/app/search-procurement/page.tsx',
              mode: 'insert',
              edits: [
                {
                  after: "'use client';",
                  code: "\n// Auto-generated imports",
                }
              ],
              options: { backup: true, dryRun: true }
            })
          });
          const data = await response.json();
          setResult(data);
        } catch (error) {
          setResult({ error: String(error) });
        } finally {
          setLoading(false);
        }
      }
    },
    {
      name: 'Refactor - เปลี่ยนชื่อ 10 จุด',
      icon: RefreshCw,
      color: 'purple',
      action: async () => {
        setLoading(true);
        try {
          const response = await fetch('/api/multi-edit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filePath: './src/app/search-procurement/page.tsx',
              mode: 'replace',
              edits: [
                { search: 'const keyword', replace: 'const searchKeyword' },
                { search: 'const projects', replace: 'const projectList' },
                { search: 'const loading', replace: 'const isLoading' },
                { search: 'const searched', replace: 'const hasSearched' },
                { search: 'const estimating', replace: 'const isEstimating' },
                { search: 'const estimates', replace: 'const estimateResults' },
                { search: 'setKeyword', replace: 'setSearchKeyword' },
                { search: 'setProjects', replace: 'setProjectList' },
                { search: 'setLoading', replace: 'setIsLoading' },
                { search: 'setSearched', replace: 'setHasSearched' },
              ],
              options: { backup: true, dryRun: true }
            })
          });
          const data = await response.json();
          setResult(data);
        } catch (error) {
          setResult({ error: String(error) });
        } finally {
          setLoading(false);
        }
      }
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-12 h-12 text-purple-600" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Multi-Edit Demo
            </h1>
          </div>
          <p className="text-xl text-gray-600">
            แก้ไขไฟล์ 10+ จุดพร้อมกัน ในไฟล์เดียว!
          </p>
        </div>

        {/* Examples */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {examples.map((example, index) => {
            const Icon = example.icon;
            const colorClasses = {
              red: 'from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600',
              blue: 'from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600',
              green: 'from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600',
              purple: 'from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600',
            }[example.color];

            return (
              <button
                key={index}
                onClick={example.action}
                disabled={loading}
                className={`p-6 bg-gradient-to-r ${colorClasses} text-white rounded-xl shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="flex items-center gap-4">
                  <Icon className="w-8 h-8" />
                  <div className="text-left">
                    <div className="font-semibold text-lg">{example.name}</div>
                    <div className="text-sm opacity-90">คลิกเพื่อทดสอบ</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Result */}
        {result && (
          <div className="bg-white rounded-xl shadow-xl p-6">
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-600" />
              ผลลัพธ์
            </h3>
            
            {result.success ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-sm text-gray-600">แก้ไขสำเร็จ</div>
                    <div className="text-3xl font-bold text-green-600">
                      {result.editsApplied}
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-sm text-gray-600">ทั้งหมด</div>
                    <div className="text-3xl font-bold text-blue-600">
                      {result.totalEdits}
                    </div>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg">
                    <div className="text-sm text-gray-600">ข้อผิดพลาด</div>
                    <div className="text-3xl font-bold text-red-600">
                      {result.errors?.length || 0}
                    </div>
                  </div>
                </div>

                {result.errors && result.errors.length > 0 && (
                  <div className="p-4 bg-red-50 rounded-lg">
                    <div className="font-semibold text-red-900 mb-2">Errors:</div>
                    <ul className="list-disc list-inside text-sm text-red-700">
                      {result.errors.map((error: string, i: number) => (
                        <li key={i}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="font-semibold mb-2">Full Response:</div>
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-red-50 rounded-lg text-red-700">
                <div className="font-semibold mb-2">Error:</div>
                <pre className="text-sm">{JSON.stringify(result, null, 2)}</pre>
              </div>
            )}
          </div>
        )}

        {/* Info */}
        <div className="mt-8 p-6 bg-blue-50 rounded-xl">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            💡 หมายเหตุ
          </h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• ทุกตัวอย่างใช้ <code className="bg-blue-100 px-2 py-1 rounded">dryRun: true</code> (Preview เท่านั้น)</li>
            <li>• ระบบจะสร้าง backup อัตโนมัติก่อนแก้ไขจริง</li>
            <li>• สามารถแก้ไข 10+ จุดพร้อมกันได้</li>
            <li>• รองรับ 4 โหมด: Replace, Regex, Insert, Remove</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
