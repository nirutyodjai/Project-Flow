'use client'

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { 
  Upload,
  Trash2,
  Rocket,
  Cpu,
  TriangleAlert,
  CircleCheck,
  ChevronRight,
  Info,
  Calendar,
  List,
  ShieldAlert,
  Save,
  FileText,
  PenTool,
} from 'lucide-react';
import { 
    analyzeBiddingDocument, 
    AnalyzedBiddingDocumentOutput 
} from '@/ai/flows/analyze-bidding-document';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import { addDocumentToCollection } from '@/services/firestore';

// Helper function to convert file to data URI
const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

interface TORImageAnalysisProps {
    onAnalysisComplete?: (analysisId: string, documentId: string, projectId?: string, projectName?: string) => void;
}

export default function TORImageAnalysis({ onAnalysisComplete }: TORImageAnalysisProps) {
    const [torFile, setTorFile] = useState<File | null>(null);
    const [torPreview, setTorPreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<AnalyzedBiddingDocumentOutput | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [documentId, setDocumentId] = useState<string | null>(null);
    const { toast } = useToast();
    const router = useRouter();

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file && file.type.startsWith('image/')) {
            setTorFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setTorPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
            setError(null);
        } else {
            setError('โปรดอัปโหลดไฟล์รูปภาพเท่านั้น (PNG, JPG, etc.)');
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.png', '.gif', '.jpeg', '.jpg', '.webp'] },
        multiple: false
    });
    
    const handleRemoveFile = () => {
        setTorFile(null);
        setTorPreview(null);
        setAnalysisResult(null);
    }
    
    const handleStartAnalysis = async () => {
        if (!torFile) {
            setError('กรุณาอัปโหลดไฟล์ภาพ TOR ก่อนเริ่มการวิเคราะห์');
            return;
        }
        
        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);
        
        try {
            const imageDataUri = await fileToDataUri(torFile);
            const result = await analyzeBiddingDocument({ imageDataUri });
            setAnalysisResult(result);
            
            // สร้าง document ID จากชื่อไฟล์และเวลาปัจจุบัน
            const docId = `tor_image_${Date.now()}_${torFile.name.replace(/\s+/g, '_')}`;
            setDocumentId(docId);
            
            // เรียกใช้ callback (ถ้ามี) เพื่อแจ้งข้อมูลการวิเคราะห์
            if (onAnalysisComplete) {
                // ส่ง ID การวิเคราะห์
                onAnalysisComplete(
                    `analysis_${Date.now()}`, 
                    docId,
                    undefined,
                    result.summary.split(' ').slice(0, 3).join(' ') // ใช้ 3 คำแรกของ summary เป็นชื่อโครงการ
                );
            }
        } catch (e) {
            console.error(e);
            setError('เกิดข้อผิดพลาดในการวิเคราะห์เอกสาร กรุณาลองใหม่อีกครั้ง');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveAnalysis = async () => {
        if (!analysisResult || !documentId || !torPreview) {
            setError('ไม่สามารถบันทึกผลการวิเคราะห์ได้ กรุณาลองอีกครั้ง');
            return;
        }

        setIsSaving(true);
        try {
            const analysisData = {
                id: documentId,
                title: analysisResult.summary.split(' ').slice(0, 5).join(' '),
                summary: analysisResult.summary,
                scopeOfWork: analysisResult.scopeOfWork,
                keyRequirements: analysisResult.keyRequirements,
                risks: analysisResult.risks,
                deadlines: analysisResult.deadlines,
                imageUrl: torPreview,
                createdAt: new Date().toISOString(),
                status: 'analyzed',
            };

            // บันทึกข้อมูลลงใน Firestore
            await addDocumentToCollection('torAnalyses', documentId, analysisData);
            
            toast({
                title: "บันทึกการวิเคราะห์สำเร็จ",
                description: "ผลการวิเคราะห์ TOR ถูกบันทึกเรียบร้อยแล้ว",
                duration: 3000,
            });
        } catch (e) {
            console.error(e);
            setError('เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCreateBOQ = () => {
        if (!analysisResult || !documentId) {
            setError('ไม่สามารถสร้าง BOQ ได้ กรุณาลองอีกครั้ง');
            return;
        }

        // บันทึกข้อมูลการวิเคราะห์เข้า session storage เพื่อใช้ในหน้าสร้าง BOQ
        sessionStorage.setItem('torAnalysisResult', JSON.stringify(analysisResult));
        sessionStorage.setItem('torAnalysisId', documentId);
        
        // นำทางไปยังหน้าสร้าง BOQ
        router.push('/procurement/boq/new?from=tor&id=' + documentId);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Left Column: Upload & Control */}
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">1. อัปโหลดเอกสาร TOR</CardTitle>
                        <CardDescription>ลากและวางไฟล์ภาพ หรือคลิกเพื่อเลือกไฟล์</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {torPreview ? (
                            <div className="relative group">
                                <Image 
                                    src={torPreview} 
                                    alt="TOR Document Preview" 
                                    width={400}
                                    height={256}
                                    className="w-full h-64 object-contain rounded-md border p-2 bg-secondary/30" 
                                    priority
                                />
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={handleRemoveFile}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <div {...getRootProps()} className={`border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary transition-colors cursor-pointer ${isDragActive ? 'border-primary bg-primary/10' : ''}`}>
                                <input {...getInputProps()} />
                                <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                                <p className="mt-4 text-sm text-muted-foreground">
                                    {isDragActive ? 'วางไฟล์ที่นี่' : 'ลากไฟล์มาวาง หรือ คลิกเพื่อเลือกไฟล์'}
                                </p>
                                <p className="mt-2 text-xs text-muted-foreground">รองรับไฟล์รูปภาพ (PNG, JPG, WEBP)</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Button onClick={handleStartAnalysis} disabled={isLoading || !torFile} size="lg" className="w-full text-lg py-7">
                    {isLoading ? (
                        <>
                            <Cpu className="mr-2 h-6 w-6 animate-pulse" />
                            กำลังวิเคราะห์...
                        </>
                    ) : (
                        <>
                            <Rocket className="mr-2 h-6 w-6" />
                            2. เริ่มการวิเคราะห์
                        </>
                    )}
                </Button>
                
                {error && (
                     <Alert variant="destructive">
                        <TriangleAlert className="h-4 w-4" />
                        <AlertTitle>เกิดข้อผิดพลาด</AlertTitle>
                        <AlertDescription>
                            {error}
                        </AlertDescription>
                    </Alert>
                )}

            </div>

            {/* Right Column: Results */}
            <div className="h-full">
                <Card className="min-h-full">
                    <CardHeader>
                        <CardTitle>3. ผลการวิเคราะห์</CardTitle>
                        <CardDescription>AI จะแสดงสรุปข้อมูลสำคัญจากเอกสารที่นี่</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading && (
                            <div className="flex flex-col items-center justify-center h-96 gap-4 text-muted-foreground animate-pulse">
                                <Cpu className="h-16 w-16" />
                                <p className="text-lg font-medium">AI กำลังอ่านและประมวลผลเอกสาร...</p>
                                <p>ขั้นตอนนี้อาจใช้เวลาสักครู่</p>
                            </div>
                        )}

                        {analysisResult && !isLoading && (
                            <div className="space-y-6 animate-in fade-in-50 duration-500">
                                <div className="p-4 bg-secondary/50 rounded-lg">
                                    <h4 className="font-semibold text-lg mb-2 flex items-center gap-2"><Info className="text-primary"/> สรุปภาพรวม</h4>
                                    <p className="text-muted-foreground leading-relaxed">{analysisResult.summary}</p>
                                </div>
                                
                                 <div className="p-4 bg-secondary/50 rounded-lg">
                                    <h4 className="font-semibold text-lg mb-3 flex items-center gap-2"><List className="text-primary"/> ขอบเขตงานหลัก</h4>
                                    <ul className="space-y-2 list-inside">
                                        {analysisResult.scopeOfWork.map((item, index) => (
                                            <li key={index} className="flex items-start gap-3">
                                                <CircleCheck className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                 <div className="p-4 bg-secondary/50 rounded-lg">
                                    <h4 className="font-semibold text-lg mb-3 flex items-center gap-2"><CircleCheck className="text-primary"/> คุณสมบัติสำคัญ</h4>
                                    <ul className="space-y-2 list-inside">
                                        {analysisResult.keyRequirements.map((item, index) => (
                                            <li key={index} className="flex items-start gap-3">
                                                 <ChevronRight className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                                                 <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                 <div className="p-4 bg-secondary/50 rounded-lg">
                                    <h4 className="font-semibold text-lg mb-3 flex items-center gap-2"><ShieldAlert className="text-primary"/> ความเสี่ยงและข้อกังวล</h4>
                                    <ul className="space-y-2 list-inside">
                                        {analysisResult.risks.map((item, index) => (
                                            <li key={index} className="flex items-start gap-3">
                                                <TriangleAlert className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                
                                <div className="p-4 bg-secondary/50 rounded-lg">
                                    <h4 className="font-semibold text-lg mb-3 flex items-center gap-2"><Calendar className="text-primary"/> กำหนดการสำคัญ</h4>
                                    <ul className="space-y-2 list-inside">
                                        {analysisResult.deadlines.map((item, index) => (
                                            <li key={index} className="flex items-center gap-3">
                                                 <Calendar className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                                 <span><strong>{item.date}:</strong> {item.description}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                            </div>
                        )}
                        
                        {!analysisResult && !isLoading && !error && (
                            <div className="flex items-center justify-center h-96 border-2 border-dashed border-border rounded-lg">
                                <p className="text-muted-foreground text-center">ผลลัพธ์การวิเคราะห์จะแสดงที่นี่<br/>หลังจากอัปโหลดและกดปุ่มวิเคราะห์</p>
                            </div>
                        )}

                    </CardContent>
                    
                    {analysisResult && !isLoading && (
                        <CardFooter className="flex flex-col sm:flex-row gap-3">
                            <Button 
                                onClick={handleSaveAnalysis}
                                disabled={isSaving}
                                className="w-full sm:w-auto"
                                variant="secondary"
                            >
                                <Save className="mr-2 h-4 w-4" />
                                {isSaving ? 'กำลังบันทึก...' : 'บันทึกผลการวิเคราะห์'}
                            </Button>
                            <Button 
                                onClick={handleCreateBOQ}
                                className="w-full sm:w-auto"
                            >
                                <FileText className="mr-2 h-4 w-4" />
                                สร้าง BOQ จากผลการวิเคราะห์
                            </Button>
                        </CardFooter>
                    )}
                </Card>
            </div>
        </div>
    );
}
