'use client'

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  FileText,
  Rocket,
  Cpu,
  TriangleAlert,
  CircleCheck,
  ChevronRight,
  Info,
  ShieldAlert,
  Calendar,
  BadgePercent,
  DollarSign,
  Save,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { TORAnalysisResult } from '@/ai/document-analysis';
import { useToast } from '@/hooks/use-toast';

interface TORTextAnalysisProps {
    projectId?: string | null;
    projectName?: string;
    onAnalysisComplete?: (analysisId: string, documentId: string, projectId?: string, projectName?: string) => void;
}

export default function TORTextAnalysis({ 
    projectId, 
    projectName = '', 
    onAnalysisComplete 
}: TORTextAnalysisProps) {
    const [torContent, setTorContent] = useState('');
    const [docId, setDocId] = useState(`tor_text_${Date.now()}`);
    const [projName, setProjName] = useState(projectName);
    const [projId, setProjId] = useState(projectId || '');
    const [additionalContext, setAdditionalContext] = useState('');
    
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<TORAnalysisResult | null>(null);
    
    const { toast } = useToast();

    const handleStartAnalysis = async () => {
        if (!torContent || torContent.trim().length < 100) {
            setError('กรุณากรอกเนื้อหาเอกสาร TOR ให้เพียงพอ (อย่างน้อย 100 ตัวอักษร)');
            return;
        }
        
        setIsLoading(true);
        setError(null);
        
        try {
            // เรียกใช้ API สำหรับวิเคราะห์ TOR
            const response = await fetch('/api/analysis/document/tor', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    torContent,
                    documentId: docId,
                    projectId: projId || undefined,
                    additionalContext: additionalContext || undefined
                }),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'การวิเคราะห์ล้มเหลว');
            }
            
            const data = await response.json();
            setAnalysisResult(data.analysis);
            
            // เรียกใช้ callback (ถ้ามี) เพื่อแจ้งข้อมูลการวิเคราะห์
            if (onAnalysisComplete) {
                onAnalysisComplete(
                    data.analysis.id,
                    docId,
                    projId || undefined,
                    projName
                );
            }
        } catch (err) {
            console.error('Error analyzing TOR:', err);
            setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการวิเคราะห์เอกสาร');
        } finally {
            setIsLoading(false);
        }
    };

    const getWinProbabilityColor = (score: number) => {
        if (score >= 80) return 'text-green-500';
        if (score >= 60) return 'text-yellow-500';
        if (score >= 40) return 'text-orange-500';
        return 'text-red-500';
    };

    const getRiskLevelColor = (level: 'low' | 'medium' | 'high' | 'critical') => {
        switch (level) {
            case 'low': return 'bg-green-100 text-green-700';
            case 'medium': return 'bg-yellow-100 text-yellow-700';
            case 'high': return 'bg-orange-100 text-orange-700';
            case 'critical': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };
    
    // เพิ่มฟังก์ชันใหม่สำหรับบันทึกข้อมูลการวิเคราะห์เพื่อนำไปใช้ต่อใน BOQ
    const handleSaveForBOQ = async () => {
        if (!analysisResult) {
            toast({
                title: "ไม่พบข้อมูลการวิเคราะห์",
                description: "กรุณาวิเคราะห์ TOR ก่อนทำการบันทึกข้อมูล",
                variant: "destructive"
            });
            return;
        }
        
        setIsSaving(true);
        setSaveSuccess(false);
        
        try {
            // บันทึกข้อมูลสำหรับนำไปใช้ใน BOQ, ราคา และสเปค
            const response = await fetch('/api/analysis/document/save-for-boq', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    analysisId: analysisResult.id,
                    documentId: docId,
                    projectId: projId || undefined,
                    projectName: projName,
                    analysisData: {
                        mainRequirements: analysisResult.mainRequirements,
                        keyDeliverables: analysisResult.keyDeliverables,
                        budget: analysisResult.budget
                    }
                }),
            });
            
            if (!response.ok) {
                throw new Error('การบันทึกล้มเหลว');
            }
            
            const data = await response.json();
            setSaveSuccess(true);
            
            toast({
                title: "บันทึกข้อมูลสำเร็จ",
                description: "ข้อมูลการวิเคราะห์ TOR ถูกบันทึกสำหรับใช้งานต่อใน BOQ เรียบร้อยแล้ว",
                variant: "success"
            });
            
        } catch (err) {
            console.error('Error saving analysis for BOQ:', err);
            setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
            
            toast({
                title: "เกิดข้อผิดพลาด",
                description: "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง",
                variant: "destructive"
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Left Column: Input Form */}
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">1. กรอกข้อมูลเอกสาร TOR</CardTitle>
                        <CardDescription>วางหรือพิมพ์เนื้อหาเอกสาร TOR เพื่อวิเคราะห์</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="projectName">ชื่อโครงการ</Label>
                            <Input
                                id="projectName"
                                placeholder="ระบุชื่อโครงการ (ถ้าทราบ)"
                                value={projName}
                                onChange={(e) => setProjName(e.target.value)}
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="torContent" className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                เนื้อหาเอกสาร TOR
                            </Label>
                            <Textarea
                                id="torContent"
                                placeholder="วางหรือพิมพ์เนื้อหาเอกสาร TOR ที่นี่..."
                                value={torContent}
                                onChange={(e) => setTorContent(e.target.value)}
                                className="min-h-[300px]"
                            />
                            <p className="text-xs text-muted-foreground">
                                ใส่เนื้อหาเอกสาร TOR ให้ครบถ้วนที่สุดเพื่อการวิเคราะห์ที่แม่นยำ
                            </p>
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="additionalContext">ข้อมูลเพิ่มเติม (ถ้ามี)</Label>
                            <Textarea
                                id="additionalContext"
                                placeholder="ข้อมูลเพิ่มเติมเกี่ยวกับโครงการ..."
                                value={additionalContext}
                                onChange={(e) => setAdditionalContext(e.target.value)}
                                className="h-[100px]"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Button 
                    onClick={handleStartAnalysis} 
                    disabled={isLoading || torContent.trim().length < 100} 
                    size="lg" 
                    className="w-full text-lg py-7"
                >
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
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
            </div>

            {/* Right Column: Analysis Results */}
            <div className="h-full">
                <Card className="min-h-full">
                    <CardHeader>
                        <CardTitle>3. ผลการวิเคราะห์ TOR</CardTitle>
                        <CardDescription>AI จะวิเคราะห์และสรุปข้อมูลสำคัญจากเอกสาร TOR</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading && (
                            <div className="flex flex-col items-center justify-center h-96 gap-4 text-muted-foreground animate-pulse">
                                <Cpu className="h-16 w-16" />
                                <p className="text-lg font-medium">AI กำลังวิเคราะห์เอกสาร TOR...</p>
                                <p>กรุณารอสักครู่</p>
                            </div>
                        )}

                        {analysisResult && !isLoading && (
                            <div className="space-y-6 animate-in fade-in-50 duration-500">
                                {/* ข้อมูลทั่วไป */}
                                <div className="p-4 bg-secondary/50 rounded-lg">
                                    <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
                                        <Info className="text-primary"/> ข้อมูลทั่วไป
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                                        <div>
                                            <p className="text-sm text-muted-foreground">ชื่อโครงการ</p>
                                            <p className="font-medium">{analysisResult.projectName}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">ประเภทโครงการ</p>
                                            <p className="font-medium">{analysisResult.projectType}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">หน่วยงาน</p>
                                            <p className="font-medium">{analysisResult.agency}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">งบประมาณ</p>
                                            <p className="font-medium flex items-center">
                                                <DollarSign className="h-4 w-4 text-muted-foreground mr-1" />
                                                {analysisResult.budget.toLocaleString()} บาท
                                            </p>
                                        </div>
                                        {analysisResult.startDate && (
                                            <div>
                                                <p className="text-sm text-muted-foreground">วันเริ่มต้น</p>
                                                <p className="font-medium">{analysisResult.startDate}</p>
                                            </div>
                                        )}
                                        {analysisResult.endDate && (
                                            <div>
                                                <p className="text-sm text-muted-foreground">วันสิ้นสุด</p>
                                                <p className="font-medium">{analysisResult.endDate}</p>
                                            </div>
                                        )}
                                        {analysisResult.duration && (
                                            <div>
                                                <p className="text-sm text-muted-foreground">ระยะเวลาดำเนินการ</p>
                                                <p className="font-medium">{analysisResult.duration} วัน</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                {/* สรุปภาพรวม */}
                                <div className="p-4 bg-secondary/50 rounded-lg">
                                    <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
                                        <Info className="text-primary"/> สรุปภาพรวม
                                    </h4>
                                    <p className="text-muted-foreground leading-relaxed">{analysisResult.summary}</p>
                                </div>
                                
                                {/* ข้อกำหนดหลัก */}
                                <div className="p-4 bg-secondary/50 rounded-lg">
                                    <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                        <CircleCheck className="text-primary"/> ข้อกำหนดหลัก
                                    </h4>
                                    <ul className="space-y-2 list-inside">
                                        {analysisResult.mainRequirements.map((item, index) => (
                                            <li key={index} className="flex items-start gap-3">
                                                <CircleCheck className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                
                                {/* ผลงานที่ต้องส่งมอบ */}
                                <div className="p-4 bg-secondary/50 rounded-lg">
                                    <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                        <ChevronRight className="text-primary"/> ผลงานที่ต้องส่งมอบ
                                    </h4>
                                    <ul className="space-y-2 list-inside">
                                        {analysisResult.keyDeliverables.map((item, index) => (
                                            <li key={index} className="flex items-start gap-3">
                                                <ChevronRight className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                
                                {/* ปัจจัยความเสี่ยง */}
                                <div className="p-4 bg-secondary/50 rounded-lg">
                                    <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                        <ShieldAlert className="text-primary"/> ปัจจัยความเสี่ยง
                                    </h4>
                                    <ul className="space-y-3 list-inside">
                                        {analysisResult.riskFactors.map((risk, index) => (
                                            <li key={index} className="flex items-start gap-3">
                                                <TriangleAlert className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span>{risk.description}</span>
                                                        <span className={`text-xs px-2 py-1 rounded-full ${getRiskLevelColor(risk.level)}`}>
                                                            {risk.level === 'low' ? 'ต่ำ' : 
                                                             risk.level === 'medium' ? 'ปานกลาง' : 
                                                             risk.level === 'high' ? 'สูง' : 'วิกฤต'}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mt-1">ผลกระทบ: {risk.impact}</p>
                                                    {risk.mitigation && (
                                                        <p className="text-sm text-muted-foreground">การลดความเสี่ยง: {risk.mitigation}</p>
                                                    )}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                
                                {/* คะแนนโอกาส */}
                                <div className="p-4 bg-secondary/50 rounded-lg">
                                    <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
                                        <BadgePercent className="text-primary"/> โอกาสและข้อได้เปรียบ
                                    </h4>
                                    <div className="mb-4">
                                        <p className="text-sm text-muted-foreground">คะแนนโอกาสความเป็นไปได้</p>
                                        <p className={`text-2xl font-bold ${getWinProbabilityColor(analysisResult.opportunityScore)}`}>
                                            {analysisResult.opportunityScore}/100
                                        </p>
                                    </div>
                                    <h5 className="font-medium mb-2">ข้อได้เปรียบในการแข่งขัน</h5>
                                    <ul className="space-y-2 list-inside">
                                        {analysisResult.competitiveAdvantage.map((item, index) => (
                                            <li key={index} className="flex items-start gap-3">
                                                <CircleCheck className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                
                                {/* คำแนะนำ */}
                                <div className="p-4 bg-secondary/50 rounded-lg">
                                    <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                        <Rocket className="text-primary"/> คำแนะนำ
                                    </h4>
                                    <ul className="space-y-2 list-inside">
                                        {analysisResult.recommendations.map((item, index) => (
                                            <li key={index} className="flex items-start gap-3">
                                                <ChevronRight className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                
                                {/* เพิ่มส่วนการบันทึกข้อมูลเพื่อนำไปใช้ต่อ */}
                                <div className="mt-8 pt-6 border-t border-border">
                                    <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                        <ArrowRight className="text-primary"/> นำไปใช้งานต่อ
                                    </h4>
                                    
                                    <div className="space-y-4">
                                        <p className="text-sm text-muted-foreground">
                                            บันทึกข้อมูลการวิเคราะห์นี้เพื่อนำไปใช้ในการจัดทำ BOQ ราคา และสเป็คต่างๆ
                                        </p>
                                        
                                        <div className="flex gap-4">
                                            <Button 
                                                onClick={handleSaveForBOQ} 
                                                className="flex-1"
                                                disabled={!analysisResult || isSaving}
                                                variant="outline"
                                            >
                                                {isSaving ? (
                                                    <>
                                                        <Cpu className="mr-2 h-4 w-4 animate-spin" />
                                                        กำลังบันทึก...
                                                    </>
                                                ) : saveSuccess ? (
                                                    <>
                                                        <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                                                        บันทึกแล้ว
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="mr-2 h-4 w-4" />
                                                        บันทึกสำหรับจัดทำ BOQ
                                                    </>
                                                )}
                                            </Button>
                                            
                                            <Button 
                                                onClick={() => window.location.href = '/procurement/boq-generator'}
                                                disabled={!saveSuccess}
                                                variant="default"
                                            >
                                                <ArrowRight className="mr-2 h-4 w-4" />
                                                ไปยังหน้าสร้าง BOQ
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {!analysisResult && !isLoading && !error && (
                            <div className="flex items-center justify-center h-96 border-2 border-dashed border-border rounded-lg">
                                <p className="text-muted-foreground text-center">
                                    ผลลัพธ์การวิเคราะห์จะแสดงที่นี่<br/>
                                    หลังจากกรอกข้อมูลและกดปุ่มวิเคราะห์
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
