'use client';

import { useState } from 'react';
import { 
  BookOpen, Search, MessageCircle, Mail, 
  FileText, Video, HelpCircle, ChevronRight,
  Sparkles, Calculator, BarChart3, Users,
  Zap, Globe, Shield, TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const features = [
    {
      icon: Sparkles,
      title: 'วิเคราะห์เอกสาร AI',
      description: 'วิเคราะห์เอกสาร TOR และ BOQ ด้วย AI',
      link: '/document-analyzer',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: Calculator,
      title: 'สร้างใบเสนอราคาอัตโนมัติ',
      description: 'สร้างใบเสนอราคาด้วย AI ภายในไม่กี่วินาที',
      link: '/auto-quotation',
      color: 'from-green-500 to-green-600',
    },
    {
      icon: Users,
      title: 'วิเคราะห์คู่แข่ง',
      description: 'วิเคราะห์คู่แข่งและปรับกลยุทธ์',
      link: '/competitor-intelligence',
      color: 'from-red-500 to-red-600',
    },
    {
      icon: Zap,
      title: 'ที่ปรึกษาการประมูล',
      description: 'รับคำแนะนำการประมูลจาก AI',
      link: '/bidding-advisor',
      color: 'from-yellow-500 to-yellow-600',
    },
    {
      icon: TrendingUp,
      title: 'Win Rate Analytics',
      description: 'วิเคราะห์สถิติการชนะ-แพ้',
      link: '/win-rate-analytics',
      color: 'from-indigo-500 to-indigo-600',
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'วิเคราะห์ข้อมูลเชิงลึกและติดตามผลงาน',
      link: '/analytics',
      color: 'from-purple-500 to-purple-600',
    },
  ];

  const faqs = [
    {
      question: 'ProjectFlow คืออะไร?',
      answer: 'ProjectFlow เป็นระบบจัดการโครงการและการประมูลที่ขับเคลื่อนด้วย AI ช่วยให้คุณสร้างใบเสนอราคา วิเคราะห์เอกสาร ค้นหางานประมูล และจัดการโครงการได้อย่างมีประสิทธิภาพ',
    },
    {
      question: 'ฟีเจอร์ AI ทำงานอย่างไร?',
      answer: 'เราใช้ Google Gemini AI และเทคโนโลยี Machine Learning ในการวิเคราะห์เอกสาร สร้างใบเสนอราคา วิเคราะห์ตลาด และให้คำแนะนำการประมูล ระบบจะเรียนรู้จากข้อมูลและปรับปรุงความแม่นยำอย่างต่อเนื่อง',
    },
    {
      question: 'ข้อมูลของฉันปลอดภัยหรือไม่?',
      answer: 'ใช่ เราใช้การเข้ารหัส SSL/TLS สำหรับการส่งข้อมูล และเก็บข้อมูลในฐานข้อมูลที่ปลอดภัย ข้อมูลของคุณจะไม่ถูกแชร์กับบุคคลที่สาม',
    },
    {
      question: 'สามารถ Export ข้อมูลได้หรือไม่?',
      answer: 'ได้ คุณสามารถ Export ใบเสนอราคาเป็น PDF, Excel และรายงานต่างๆ ได้ตามต้องการ',
    },
    {
      question: 'มีการสนับสนุนภาษาไทยหรือไม่?',
      answer: 'ใช่ ระบบรองรับภาษาไทยเต็มรูปแบบ ทั้งการแสดงผล การค้นหา และการวิเคราะห์เอกสารภาษาไทย',
    },
    {
      question: 'ราคาบริการเป็นอย่างไร?',
      answer: 'เรามีแพ็กเกจให้เลือกหลายระดับ เริ่มต้นจาก Free Plan สำหรับผู้ใช้งานพื้นฐาน ไปจนถึง Enterprise Plan สำหรับองค์กรขนาดใหญ่ ติดต่อทีมขายเพื่อข้อมูลเพิ่มเติม',
    },
  ];

  const tutorials = [
    {
      title: 'เริ่มต้นใช้งาน ProjectFlow',
      duration: '5 นาที',
      topics: ['สร้างบัญชี', 'ตั้งค่าโปรไฟล์', 'สร้างโครงการแรก'],
    },
    {
      title: 'วิธีใช้ AI Document Analyzer',
      duration: '10 นาที',
      topics: ['อัพโหลดเอกสาร', 'วิเคราะห์ TOR/BOQ', 'Export ผลลัพธ์'],
    },
    {
      title: 'สร้างใบเสนอราคาอัตโนมัติ',
      duration: '15 นาที',
      topics: ['เลือกวัสดุ', 'คำนวณราคา', 'สร้าง PDF'],
    },
    {
      title: 'ค้นหางานประมูล',
      duration: '8 นาที',
      topics: ['ตั้งค่าการค้นหา', 'ดูรายละเอียดงาน', 'บันทึกงานที่สนใจ'],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center">
            <BookOpen className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-5xl font-bold mb-4">ศูนย์ช่วยเหลือ</h1>
            <p className="text-xl opacity-90 mb-8">
              ค้นหาคำตอบ บทเรียน และเอกสารประกอบการใช้งาน
            </p>
            
            {/* Search */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="ค้นหาคำถาม บทความ หรือฟีเจอร์..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-6 text-lg bg-white/10 backdrop-blur-lg border-white/20 text-white placeholder:text-white/60"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">เอกสารประกอบ</h3>
                <p className="text-sm text-muted-foreground">คู่มือการใช้งานโดยละเอียด</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Video className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">วิดีโอสอน</h3>
                <p className="text-sm text-muted-foreground">เรียนรู้ผ่านวิดีโอสั้นๆ</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">ติดต่อ Support</h3>
                <p className="text-sm text-muted-foreground">พูดคุยกับทีมงาน</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="features" className="mb-12">
          <TabsList className="grid grid-cols-3 w-full max-w-2xl mx-auto">
            <TabsTrigger value="features">ฟีเจอร์หลัก</TabsTrigger>
            <TabsTrigger value="tutorials">บทเรียน</TabsTrigger>
            <TabsTrigger value="faq">คำถามที่พบบ่อย</TabsTrigger>
          </TabsList>

          {/* Features Tab */}
          <TabsContent value="features" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="hover:shadow-lg transition-all group cursor-pointer">
                  <CardHeader>
                    <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="ghost" className="w-full group-hover:bg-gray-100">
                      เรียนรู้เพิ่มเติม
                      <ChevronRight className="ml-2 w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Tutorials Tab */}
          <TabsContent value="tutorials" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tutorials.map((tutorial, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg mb-2">{tutorial.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <Video className="w-4 h-4" />
                          {tutorial.duration}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      {tutorial.topics.map((topic, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                          {topic}
                        </div>
                      ))}
                    </div>
                    <Button className="w-full">
                      <Video className="mr-2 w-4 h-4" />
                      เริ่มดูวิดีโอ
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* FAQ Tab */}
          <TabsContent value="faq" className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5" />
                  คำถามที่พบบ่อย (FAQ)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="text-muted-foreground">{faq.answer}</p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Contact Support */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-center">ยังหาคำตอบไม่เจอ?</CardTitle>
            <CardDescription className="text-center">
              ติดต่อทีมงานของเรา เราพร้อมช่วยเหลือคุณ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="gap-2">
                <Mail className="w-4 h-4" />
                ส่งอีเมล
              </Button>
              <Button variant="outline" className="gap-2">
                <MessageCircle className="w-4 h-4" />
                Live Chat
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Additional Resources */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center">
            <CardContent className="pt-6">
              <Globe className="w-12 h-12 mx-auto mb-4 text-blue-600" />
              <h3 className="font-semibold mb-2">API Documentation</h3>
              <p className="text-sm text-muted-foreground mb-4">
                สำหรับนักพัฒนาที่ต้องการ integrate
              </p>
              <Button variant="link">ดูเอกสาร API →</Button>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <Shield className="w-12 h-12 mx-auto mb-4 text-green-600" />
              <h3 className="font-semibold mb-2">ความปลอดภัย</h3>
              <p className="text-sm text-muted-foreground mb-4">
                เรียนรู้เกี่ยวกับมาตรการรักษาความปลอดภัย
              </p>
              <Button variant="link">อ่านเพิ่มเติม →</Button>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 text-purple-600" />
              <h3 className="font-semibold mb-2">Release Notes</h3>
              <p className="text-sm text-muted-foreground mb-4">
                ฟีเจอร์ใหม่และการอัพเดทล่าสุด
              </p>
              <Button variant="link">ดูประกาศ →</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
