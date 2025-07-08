
'use client';
import { signup } from '@/services/auth';
import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" className="w-full" disabled={pending}>{pending ? 'กำลังสมัคร...' : 'สมัครใช้งาน'}</Button>;
}

export default function SignupPage() {
    const [state, formAction] = useFormState(signup, undefined);

    return (
        <main className="flex items-center justify-center min-h-screen">
            <Card className="w-full max-w-sm">
                <CardHeader>
                <CardTitle className="text-2xl">สมัครใช้งาน</CardTitle>
                <CardDescription>
                    สร้างบัญชีใหม่เพื่อเริ่มต้นใช้งาน
                </CardDescription>
                </CardHeader>
                <form action={formAction}>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">อีเมล</Label>
                            <Input id="email" type="email" name="email" placeholder="name@example.com" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">รหัสผ่าน</Label>
                            <Input id="password" name="password" type="password" required minLength={6} />
                        </div>
                         {state?.message && (
                            <p className="text-sm text-destructive">{state.message}</p>
                        )}
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <SubmitButton />
                         <div className="text-center text-sm">
                            มีบัญชีอยู่แล้ว? <Link href="/login" className="underline">เข้าสู่ระบบ</Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </main>
    );
}
