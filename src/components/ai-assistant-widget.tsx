'use client';

import React, { useState } from 'react';
import { Bot, Send, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

/**
 * 🤖 AI Assistant Widget - ผู้ช่วยอัจฉริยะตลอด 24 ชั่วโมง
 */
export function AIAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'สวัสดีครับ! ผมคือ AI Assistant พร้อมช่วยเหลือคุณในเรื่องการจัดการโครงการ การวิเคราะห์ราคา และอื่นๆ มีอะไรให้ช่วยไหมครับ?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const getAIResponse = (userMessage: string): string => {
    const msg = userMessage.toLowerCase();
    if (msg.includes('สวัสดี') || msg.includes('hello')) {
      return 'สวัสดีครับ! ผมคือ AI Assistant ของ ProjectFlow (Powered by Gemini) ยินดีให้บริการครับ 😊';
    }
    if (msg.includes('โครงการ') || msg.includes('project')) {
      return 'คุณมีโครงการทั้งหมด 3 รายการ โครงการที่กำลังดำเนินการ 2 รายการ และเสร็จสิ้นแล้ว 1 รายการครับ';
    }
    if (msg.includes('งบประมาณ') || msg.includes('budget')) {
      return 'งบประมาณรวมของโครงการทั้งหมดคือ 73 ล้านบาท โครงการที่ใหญ่ที่สุดมีงบ 50 ล้านบาทครับ';
    }
    if (msg.includes('ช่วย') || msg.includes('help')) {
      return 'ผมสามารถช่วยคุณได้หลายอย่างครับ:\n\n1. ตอบคำถามเกี่ยวกับโครงการ\n2. วิเคราะห์งบประมาณและต้นทุน\n3. แนะนำราคาเสนอ\n4. ประเมินโอกาสชนะ\n5. คำนวณกำไรและความเสี่ยง\n\nลองถามผมได้เลยครับ!';
    }
    return 'ขอโทษครับ ผมไม่แน่ใจว่าคุณต้องการอะไร ลองถามใหม่อีกครั้งได้ไหมครับ? หรือพิมพ์ "ช่วย" เพื่อดูว่าผมช่วยอะไรได้บ้าง';
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    const currentInput = input;
    setInput('');
    setIsTyping(true);

    try {
      // เรียก Gemini API จริง
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: currentInput,
          history: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();

      if (data.success) {
        const aiMessage: Message = {
          role: 'assistant',
          content: data.message,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      // Fallback to mock response
      const aiMessage: Message = {
        role: 'assistant',
        content: getAIResponse(currentInput),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          onClick={() => setIsOpen(true)}
        >
          <Bot className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full animate-pulse" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96">
      <Card className="shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              <CardTitle className="text-lg">AI Assistant</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-96 overflow-y-auto p-4 space-y-4 bg-background">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={cn(
                  'flex gap-2',
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {msg.role === 'assistant' && (
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                )}
                <div
                  className={cn(
                    'rounded-lg px-4 py-2 max-w-[80%]',
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  )}
                >
                  <p className="text-sm">{msg.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {msg.timestamp.toLocaleTimeString('th-TH', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                {msg.role === 'user' && (
                  <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-bold">คุณ</span>
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-2 justify-start">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div className="rounded-lg px-4 py-2 bg-muted">
                  <div className="flex gap-1">
                    <span className="animate-bounce">●</span>
                    <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>●</span>
                    <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>●</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                placeholder="พิมพ์ข้อความ..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1"
                disabled={isTyping}
              />
              <Button onClick={handleSend} size="icon" disabled={isTyping}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
