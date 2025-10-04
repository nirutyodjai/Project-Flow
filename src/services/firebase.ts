/**
 * Firebase Replacement
 * ใช้ PostgreSQL แทน Firebase
 * ไฟล์นี้เก็บไว้เพื่อ backward compatibility
 */

import { prisma } from '@/lib/prisma';

// Mock Firebase objects for backward compatibility
export const app = null;
export const db = prisma; // ใช้ Prisma แทน Firestore
export const auth = null;
export const storage = null;

console.warn('⚠️ Firebase has been replaced with PostgreSQL. Please use Prisma services instead.');
