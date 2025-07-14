'use client';
import { clientSignup } from '@/services/auth-client';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data: { email: string; password: string }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await clientSignup(data.email, data.password);
      
      if (result.success) {
        toast({
          title: "สมัครสมาชิกสำเร็จ",
          description: "ระบบกำลังนำคุณไปยังหน้าหลัก",
          variant: "default",
        });
        
        // เมื่อสมัครสำเร็จ ให้เปลี่ยนไปยังหน้าหลัก
        setTimeout(() => {
          router.push('/');
          router.refresh();
        }, 1000);
      } else if (result.message) {
        setError(result.message);
      }
    } catch (e) {
      setError('เกิดข้อผิดพลาดในการสมัครใช้งาน');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">สมัครใช้งาน</CardTitle>
          <CardDescription>
            สร้างบัญชีใหม่เพื่อเริ่มต้นใช้งาน
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">อีเมล</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="name@example.com" 
                {...register('email', { required: 'กรุณากรอกอีเมล' })}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message as string}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">รหัสผ่าน</Label>
              <Input 
                id="password" 
                type="password" 
                {...register('password', { 
                  required: 'กรุณากรอกรหัสผ่าน',
                  minLength: { 
                    value: 6, 
                    message: 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร' 
                  }
                })}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message as string}</p>
              )}
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'กำลังสมัคร...' : 'สมัครใช้งาน'}
            </Button>
            <div className="text-center text-sm">
                มีบัญชีอยู่แล้ว? <Link href="/login" className="underline">เข้าสู่ระบบ</Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}
