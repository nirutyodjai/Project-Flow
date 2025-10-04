'use client';

import { useState } from 'react';
import { FileUploader } from '@/components/file-uploader';
import { Upload, FileText, FileSpreadsheet, Image, File, CheckCircle } from 'lucide-react';

export default function UploadDemoPage() {
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [analysisResults, setAnalysisResults] = useState<any[]>([]);

  const handleUploadSuccess = (urls: string[]) => {
    setUploadedFiles(prev => [...prev, ...urls]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Upload className="w-12 h-12 text-indigo-600" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              อัพโหลดและวิเคราะห์ไฟล์
            </h1>
          </div>
          <p className="text-xl text-gray-600">
            อัพโหลด TOR, BOQ, ใบเสนอราคา และวิเคราะห์อัตโนมัติ
          </p>
        </div>

        {/* Supported Files */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 bg-white rounded-lg shadow text-center">
            <FileText className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <div className="font-semibold text-sm">PDF</div>
            <div className="text-xs text-gray-500">TOR, สัญญา</div>
          </div>
          <div className="p-4 bg-white rounded-lg shadow text-center">
            <FileSpreadsheet className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="font-semibold text-sm">Excel</div>
            <div className="text-xs text-gray-500">BOQ, ราคา</div>
          </div>
          <div className="p-4 bg-white rounded-lg shadow text-center">
            <File className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="font-semibold text-sm">Word</div>
            <div className="text-xs text-gray-500">เอกสาร</div>
          </div>
          <div className="p-4 bg-white rounded-lg shadow text-center">
            <Image className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <div className="font-semibold text-sm">รูปภาพ</div>
            <div className="text-xs text-gray-500">แบบ, ภาพ</div>
          </div>
        </div>

        {/* Upload Area */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">อัพโหลดไฟล์</h2>
          <FileUploader
            maxFiles={10}
            maxSize={10 * 1024 * 1024}
            onUploadSuccess={handleUploadSuccess}
            acceptedFileTypes={[
              'application/pdf',
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              'application/vnd.ms-excel',
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              'application/msword',
              'image/jpeg',
              'image/png',
              'image/gif',
              'text/plain',
            ]}
          />
        </div>

        {/* Results */}
        {uploadedFiles.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              ไฟล์ที่อัพโหลดสำเร็จ
            </h2>
            <div className="space-y-2">
              {uploadedFiles.map((url, index) => (
                <div key={index} className="p-3 bg-green-50 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">{url}</span>
                  </div>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    ดูไฟล์
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info */}
        <div className="mt-8 p-6 bg-indigo-50 rounded-xl">
          <h3 className="text-lg font-semibold text-indigo-900 mb-3">
            💡 ฟีเจอร์การวิเคราะห์อัตโนมัติ
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-indigo-700">
            <div className="flex items-start gap-2">
              <span className="text-lg">📄</span>
              <div>
                <div className="font-semibold">TOR (PDF/Word)</div>
                <div className="text-xs">วิเคราะห์ขอบเขตงาน แยกรายการงาน</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-lg">📊</span>
              <div>
                <div className="font-semibold">BOQ (Excel)</div>
                <div className="text-xs">ถอดรายการวัสดุ-แรงงาน-เครื่องมือ</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-lg">💰</span>
              <div>
                <div className="font-semibold">ใบเสนอราคา</div>
                <div className="text-xs">เปรียบเทียบราคากับต้นทุน</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-lg">📋</span>
              <div>
                <div className="font-semibold">สัญญา</div>
                <div className="text-xs">ตรวจสอบเงื่อนไขและข้อกำหนด</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
