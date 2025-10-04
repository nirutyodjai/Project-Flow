'use client';

import { useState, useEffect } from 'react';
import { Mic, MicOff, Sparkles, FileText, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { VoiceRecognitionService, isSpeechRecognitionSupported, VoiceCommand } from '@/lib/voice-recognition';

export default function VoiceQuotationPage() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [voiceService, setVoiceService] = useState<VoiceRecognitionService | null>(null);
  const [commands, setCommands] = useState<VoiceCommand[]>([]);
  const [quotationData, setQuotationData] = useState<any>(null);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    setSupported(isSpeechRecognitionSupported());
    if (isSpeechRecognitionSupported()) {
      setVoiceService(new VoiceRecognitionService({ language: 'th-TH' }));
    }
  }, []);

  const startListening = () => {
    if (!voiceService) return;

    voiceService.start(
      (result) => {
        setTranscript(result.transcript);
        setCommands((prev) => [result, ...prev]);
        
        // ถ้าเป็นคำสั่งสร้างใบเสนอราคา
        if (result.intent === 'create-quotation') {
          generateQuotation(result);
        }
      },
      (error) => {
        console.error('Voice error:', error);
        setIsListening(false);
      }
    );

    setIsListening(true);
  };

  const stopListening = () => {
    voiceService?.stop();
    setIsListening(false);
  };

  const generateQuotation = (command: VoiceCommand) => {
    const data = {
      projectName: command.entities?.projectName || 'โครงการจากเสียง',
      budget: command.entities?.budget || 0,
      materials: command.entities?.materials || [],
      transcript: command.transcript,
      createdAt: new Date().toLocaleString('th-TH'),
    };
    
    setQuotationData(data);
  };

  if (!supported) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-8 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">ไม่รองรับ Voice Recognition</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              เบราว์เซอร์ของคุณไม่รองรับ Speech Recognition
              <br />
              กรุณาใช้ Chrome, Edge หรือ Safari
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Volume2 className="w-12 h-12 text-purple-600" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Voice Quotation AI
            </h1>
          </div>
          <p className="text-xl text-gray-600">
            พูดคุยกับ AI เพื่อสร้างใบเสนอราคาอัตโนมัติ
          </p>
        </div>

        {/* Voice Control */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="text-center">
              <Button
                size="lg"
                onClick={isListening ? stopListening : startListening}
                className={`w-32 h-32 rounded-full ${
                  isListening
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                    : 'bg-purple-600 hover:bg-purple-700'
                }`}
              >
                {isListening ? (
                  <MicOff className="w-16 h-16" />
                ) : (
                  <Mic className="w-16 h-16" />
                )}
              </Button>
              
              <div className="mt-4">
                <Badge variant={isListening ? 'destructive' : 'secondary'} className="text-sm">
                  {isListening ? '🔴 กำลังฟัง...' : '⚪ พร้อมรับคำสั่ง'}
                </Badge>
              </div>

              {transcript && (
                <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                  <p className="text-lg font-medium text-purple-900">{transcript}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Example Commands */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              ตัวอย่างคำสั่ง
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="font-semibold text-sm mb-1">สร้างใบเสนอราคา</div>
                <p className="text-xs text-muted-foreground">
                  "สร้างใบเสนอราคา โครงการก่อสร้างอาคาร งบประมาณ 50 ล้านบาท"
                </p>
              </div>
              
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="font-semibold text-sm mb-1">เพิ่มรายการวัสดุ</div>
                <p className="text-xs text-muted-foreground">
                  "เพิ่มสายไฟ 1000 เมตร ท่อ PVC 500 เมตร"
                </p>
              </div>
              
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="font-semibold text-sm mb-1">คำนวณต้นทุน</div>
                <p className="text-xs text-muted-foreground">
                  "คำนวณต้นทุนรวม พร้อมค่าแรงและเครื่องมือ"
                </p>
              </div>
              
              <div className="p-3 bg-orange-50 rounded-lg">
                <div className="font-semibold text-sm mb-1">ค้นหางาน</div>
                <p className="text-xs text-muted-foreground">
                  "ค้นหางานก่อสร้าง งบประมาณ 30 ถึง 50 ล้าน"
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Generated Quotation */}
        {quotationData && (
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <FileText className="w-6 h-6" />
                ใบเสนอราคาที่สร้างจากเสียง
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground">ชื่อโครงการ</div>
                  <div className="text-lg font-semibold">{quotationData.projectName}</div>
                </div>
                
                <div>
                  <div className="text-sm text-muted-foreground">งบประมาณ</div>
                  <div className="text-2xl font-bold text-green-600">
                    {quotationData.budget.toLocaleString()} บาท
                  </div>
                </div>
                
                {quotationData.materials.length > 0 && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">วัสดุที่ตรวจพบ</div>
                    <div className="flex flex-wrap gap-2">
                      {quotationData.materials.map((material: string, index: number) => (
                        <Badge key={index} variant="secondary">
                          {material}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="pt-4 border-t">
                  <div className="text-xs text-muted-foreground">คำสั่งเสียงต้นฉบับ</div>
                  <div className="text-sm italic">&quot;{quotationData.transcript}&quot;</div>
                </div>
                
                <Button className="w-full" size="lg">
                  <FileText className="mr-2 h-4 w-4" />
                  สร้างใบเสนอราคาเต็มรูปแบบ
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Command History */}
        {commands.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>ประวัติคำสั่งเสียง</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {commands.slice(0, 5).map((cmd, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="outline">{cmd.intent}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(cmd.timestamp).toLocaleTimeString('th-TH')}
                      </span>
                    </div>
                    <p className="text-sm">{cmd.transcript}</p>
                    <div className="text-xs text-muted-foreground mt-1">
                      Confidence: {(cmd.confidence * 100).toFixed(0)}%
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
