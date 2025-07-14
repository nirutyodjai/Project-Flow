'use client';

import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
} from 'firebase/auth';
import { getFirebaseAuth } from './firebase';

const NOT_CONFIGURED_MESSAGE = 'Firebase is not configured. Please check your .env file.';

/**
 * Client-side authentication functions that can be used directly in components
 */
export async function clientLogin(email: string, password: string): Promise<{ success: boolean; message?: string }> {
  const auth = getFirebaseAuth();
  if (!auth) {
    return { success: false, message: NOT_CONFIGURED_MESSAGE };
  }

  try {
    if (!email || !password) {
      return { success: false, message: 'กรุณากรอกอีเมลและรหัสผ่าน' };
    }
    await signInWithEmailAndPassword(auth, email, password);
    return { success: true };
  } catch (e) {
    if (e instanceof Error && 'code' in e) {
      if (e.code === 'auth/invalid-credential') {
        return { success: false, message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' };
      } else if (e.code === 'auth/too-many-requests') {
        return { success: false, message: 'มีการลองเข้าสู่ระบบหลายครั้งเกินไป กรุณาลองใหม่ภายหลัง' };
      }
    }
    console.error('Login error:', e);
    return { success: false, message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' };
  }
}

export async function clientSignup(email: string, password: string): Promise<{ success: boolean; message?: string }> {
  const auth = getFirebaseAuth();
  if (!auth) {
    return { success: false, message: NOT_CONFIGURED_MESSAGE };
  }
  
  try {
    if (!email || !password) {
      return { success: false, message: 'กรุณากรอกอีเมลและรหัสผ่าน' };
    }
    if (password.length < 6) {
      return { success: false, message: 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร' };
    }

    await createUserWithEmailAndPassword(auth, email, password);
    return { success: true };
  } catch (e) {
    if (e instanceof Error && 'code' in e) {
      if (e.code === 'auth/email-already-in-use') {
        return { success: false, message: 'อีเมลนี้ถูกใช้งานแล้ว' };
      }
    }
    console.error('Signup error:', e);
    return { success: false, message: 'เกิดข้อผิดพลาดในการสมัครใช้งาน' };
  }
}

export async function clientLogout(): Promise<boolean> {
  const auth = getFirebaseAuth();
  if (!auth) {
    console.warn(NOT_CONFIGURED_MESSAGE);
    return false;
  }
  
  try {
    await signOut(auth);
    return true;
  } catch (e) {
    console.warn("Could not sign out:", (e as Error).message);
    return false;
  }
}
