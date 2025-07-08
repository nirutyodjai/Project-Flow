
'use client';
import { login } from '@/services/auth';
import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" className="w-full" disabled={pending}>{pending ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}</Button>;
}

export default function LoginPage() {
  const [state, formAction] = useFormState(login, undefined);

  return (
    <main className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">เข้าสู่ระบบ</CardTitle>
          <CardDescription>
            กรุณากรอกอีเมลและรหัสผ่านเพื่อเข้าใช้งาน
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">อีเมล</Label>
              <Input id="email" type="email" name="email" placeholder="m@example.com" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">รหัสผ่าน</Label>
              <Input id="password" type="password" name="password" required />
            </div>
            {state?.message && (
              <p className="text-sm text-destructive">{state.message}</p>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <SubmitButton />
            <div className="text-center text-sm">
                ยังไม่มีบัญชี? <Link href="/signup" className="underline">สมัครใช้งาน</Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}
