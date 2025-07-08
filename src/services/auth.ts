
'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
} from 'firebase/auth';
import { getFirebaseAuth } from './firebase';

const NOT_CONFIGURED_MESSAGE = 'Firebase is not configured. Please check your .env file.';

export async function login(prevState: { message: string } | undefined, formData: FormData) {
  const auth = getFirebaseAuth();
  if (!auth) {
    return { message: NOT_CONFIGURED_MESSAGE };
  }

  try {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
      return { message: 'กรุณากรอกอีเมลและรหัสผ่าน' };
    }
    await signInWithEmailAndPassword(auth, email, password);
  } catch (e) {
    if (e instanceof Error && 'code' in e && e.code === 'auth/invalid-credential') {
      return { message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' };
    }
    console.error(e);
    return { message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' };
  }

  revalidatePath('/');
  redirect('/');
}

export async function signup(prevState: { message: string } | undefined, formData: FormData) {
  const auth = getFirebaseAuth();
  if (!auth) {
    return { message: NOT_CONFIGURED_MESSAGE };
  }
  
  try {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
      return { message: 'กรุณากรอกอีเมลและรหัสผ่าน' };
    }
    if (password.length < 6) {
      return { message: 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร' };
    }

    await createUserWithEmailAndPassword(auth, email, password);
  } catch (e) {
     if (e instanceof Error && 'code' in e && e.code === 'auth/email-already-in-use') {
        return { message: 'อีเมลนี้ถูกใช้งานแล้ว' };
    }
    console.error(e);
    return { message: 'เกิดข้อผิดพลาดในการสมัครใช้งาน' };
  }
  
  revalidatePath('/');
  redirect('/');
}

export async function logout() {
    const auth = getFirebaseAuth();
    if (!auth) {
      console.warn(NOT_CONFIGURED_MESSAGE);
    } else {
        try {
            await signOut(auth);
        } catch (e) {
            console.warn("Could not sign out: " + (e as Error).message);
        }
    }
    revalidatePath('/');
    redirect('/login');
}
