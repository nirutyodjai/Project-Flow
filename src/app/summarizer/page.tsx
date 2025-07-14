'use client';
import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { summarizeDocument } from '@/ai/flows/summarize-document-flow';
import { textToSpeech } from '@/ai/flows/text-to-speech-flow';
import { LoaderCircle, FileText, Upload, Volume2, X, Rocket } from 'lucide-react';
import { logger } from '@/lib/logger';

const SummarizerPage = () => {
  const [inputText, setInputText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [summary, setSummary] = useState('');
  const [audioDataUri, setAudioDataUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSummarize = async () => {
    if (!inputText && !imageFile) {
      setError('โปรดป้อนข้อความหรืออัปโหลดรูปภาพ');
      return;
    }
    setLoading(true);
    setError(null);
    setSummary('');
    setAudioDataUri(null);

    try {
        let imageDataUri: string | undefined = undefined;
        if (imageFile) {
          const reader = new FileReader();
          const dataUriPromise = new Promise<string>((resolve, reject) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
          });
          reader.readAsDataURL(imageFile);
          imageDataUri = await dataUriPromise;
        }

      // First, get the summary
      const summaryResult = await summarizeDocument({
        text: inputText || undefined,
        imageDataUri: imageDataUri,
      });

      setSummary(summaryResult.summary);
      
      // Then, synthesize the audio from the summary
      const audioResult = await textToSpeech(summaryResult.summary);
      setAudioDataUri(audioResult.media);

      // Autoplay audio
      setTimeout(() => {
        audioRef.current?.play();
      }, 100);

    } catch (err) {
      logger.error('Error occurred', err);
      setError('เกิดข้อผิดพลาดในการสรุปเอกสาร โปรดลองอีกครั้ง');
    } finally {
      setLoading(false);
    }
  };
  
  const clearImage = () => {
      setImageFile(null);
      setImagePreview(null);
  }

  return (
    <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
      <div className="space-y-1">
        <h1 className="text-3xl font-headline font-bold">สรุปเอกสารด้วย AI</h1>
        <p className="text-muted-foreground">
          ป้อนข้อความ หรืออัปโหลดไฟล์ภาพเอกสารเพื่อให้ AI สรุปและอ่านให้ฟัง
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
        {/* Input Card */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-6 w-6" />
              ข้อมูลสำหรับวิเคราะห์
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 flex-1">
            <Textarea
              placeholder="วางข้อความที่นี่..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 text-base"
              rows={10}
            />
            <div className="text-center text-sm text-muted-foreground">หรือ</div>
            <div className="space-y-2">
                <Label htmlFor="document-upload">อัปโหลดไฟล์ภาพ</Label>
                {imagePreview ? (
                     <div className="relative group">
                        <Image 
                            src={imagePreview} 
                            alt="Document Preview" 
                            width={400}
                            height={192}
                            className="w-full h-48 object-contain rounded-md border p-2 bg-secondary/30"
                            priority
                        />
                        <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={clearImage}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                        <Input id="document-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*"/>
                        <label htmlFor="document-upload" className="cursor-pointer">
                            <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
                            <p className="mt-2 text-sm text-muted-foreground">คลิกเพื่อเลือกไฟล์ หรือลากและวางที่นี่</p>
                            <p className="mt-1 text-xs text-muted-foreground">รองรับ PNG, JPG, WEBP</p>
                        </label>
                    </div>
                )}
            </div>
             <div className="pt-4 mt-auto">
                <Button onClick={handleSummarize} disabled={loading} className="w-full text-lg py-6">
                    {loading ? <LoaderCircle className="animate-spin mr-2" /> : <Rocket className="mr-2"/>}
                    {loading ? 'กำลังวิเคราะห์...' : 'สรุปและอ่านให้ฟัง'}
                </Button>
            </div>
          </CardContent>
        </Card>

        {/* Output Card */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="h-6 w-6" />
              ผลลัพธ์การวิเคราะห์
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 flex-1">
             {loading && (
                <div className="flex flex-col items-center justify-center flex-1 gap-4 text-muted-foreground">
                    <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
                    <p className="text-lg">AI กำลังอ่านและสรุปข้อมูล...</p>
                    <p>ขั้นตอนนี้อาจใช้เวลาสักครู่</p>
                </div>
            )}
            {error && <p className="text-destructive text-center">{error}</p>}
            
            {summary && !loading && (
                 <div className="flex flex-col gap-4 flex-1 animate-in fade-in-50">
                    <div className="p-4 bg-secondary/50 rounded-lg flex-1 overflow-y-auto custom-scrollbar">
                        <h4 className="font-semibold mb-2">บทสรุป:</h4>
                        <p className="whitespace-pre-wrap leading-relaxed">{summary}</p>
                    </div>
                    {audioDataUri && (
                         <div>
                            <audio ref={audioRef} src={audioDataUri} controls className="w-full"></audio>
                        </div>
                    )}
                 </div>
            )}

            {!summary && !loading && !error && (
                <div className="flex items-center justify-center flex-1 border-2 border-dashed border-border rounded-lg">
                    <p className="text-muted-foreground">ผลลัพธ์จะแสดงที่นี่</p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SummarizerPage;
