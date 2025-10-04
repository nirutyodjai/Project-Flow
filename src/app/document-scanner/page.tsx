'use client';

import { useState, useRef } from 'react';
import { Camera, Upload, FileText, Sparkles, Download, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function DocumentScannerPage() {
  const [image, setImage] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [ocrResult, setOcrResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const scanDocument = async () => {
    if (!image) return;

    setScanning(true);
    setError(null);

    try {
      // เรียก API เพื่อวิเคราะห์เอกสารด้วย Gemini Vision
      const response = await fetch('/api/ocr-scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image }),
      });

      if (!response.ok) {
        throw new Error('Failed to scan document');
      }

      const result = await response.json();
      setOcrResult(result);
    } catch (err) {
      console.error('OCR Error:', err);
      setError('เกิดข้อผิดพลาดในการ Scan เอกสาร กรุณาลองใหม่อีกครั้ง');
    } finally {
      setScanning(false);
    }
  };

  const exportToExcel = () => {
    alert('กำลัง Export ไป Excel... (ฟีเจอร์นี้กำลังพัฒนา)');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Camera className="w-12 h-12 text-cyan-600" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              Document Scanner (OCR)
            </h1>
          </div>
          <p className="text-xl text-gray-600">
            Scan เอกสาร BOQ/TOR และแปลงเป็นข้อมูลอัตโนมัติ
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload/Scan */}
          <Card>
            <CardHeader>
              <CardTitle>อัพโหลดเอกสาร</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {!image ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-sm text-muted-foreground mb-2">
                      คลิกเพื่ออัพโหลดเอกสาร
                    </p>
                    <p className="text-xs text-muted-foreground">
                      รองรับ: JPG, PNG, PDF
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <img
                      src={image}
                      alt="Uploaded document"
                      className="w-full rounded-lg border"
                    />
                    <div className="flex gap-2">
                      <Button onClick={scanDocument} disabled={scanning} className="flex-1">
                        {scanning ? (
                          <>
                            <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                            กำลัง Scan...
                          </>
                        ) : (
                          <>
                            <Camera className="mr-2 h-4 w-4" />
                            Scan เอกสาร
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => {
                          setImage(null);
                          setOcrResult(null);
                        }}
                        variant="outline"
                      >
                        ลบ
                      </Button>
                    </div>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </CardContent>
          </Card>

          {/* OCR Result */}
          <Card>
            <CardHeader>
              <CardTitle>ผลการ Scan</CardTitle>
            </CardHeader>
            <CardContent>
              {!ocrResult ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-muted-foreground">
                    อัพโหลดและ Scan เอกสารเพื่อดูผลลัพธ์
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <div className="font-semibold text-green-700">ประเภทเอกสาร</div>
                      <div className="text-2xl font-bold text-green-600">{ocrResult.type}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">ความแม่นยำ</div>
                      <div className="text-2xl font-bold text-green-600">{ocrResult.confidence}%</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-semibold mb-2">ชื่อโครงการ</div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      {ocrResult.data.projectName}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-semibold mb-2">รายการที่ตรวจพบ</div>
                    <div className="space-y-2">
                      {ocrResult.data.items.map((item: any, index: number) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg text-sm">
                          <div className="flex justify-between">
                            <span className="font-medium">{item.description}</span>
                            <span className="font-bold text-blue-600">
                              {item.price.toLocaleString()} บาท
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-blue-700">รวมทั้งสิ้น</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {ocrResult.data.total.toLocaleString()} บาท
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={exportToExcel} className="flex-1">
                      <Download className="mr-2 h-4 w-4" />
                      Export to Excel
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <FileText className="mr-2 h-4 w-4" />
                      สร้างใบเสนอราคา
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>ความสามารถของ OCR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl mb-2">📄</div>
                <div className="text-sm font-semibold">Scan BOQ</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl mb-2">📋</div>
                <div className="text-sm font-semibold">Scan TOR</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl mb-2">📊</div>
                <div className="text-sm font-semibold">แยกตาราง</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl mb-2">💾</div>
                <div className="text-sm font-semibold">Export Excel</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
