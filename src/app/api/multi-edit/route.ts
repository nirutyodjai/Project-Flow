import { NextRequest, NextResponse } from 'next/server';
import { multiEditFile, regexMultiEditFile, insertCodeAt, removeCodeSections } from '@/lib/advanced-file-manager';

/**
 * POST /api/multi-edit
 * แก้ไขไฟล์หลายจุดพร้อมกัน
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { filePath, edits, mode = 'replace', options = {} } = body;

    if (!filePath || !edits || !Array.isArray(edits)) {
      return NextResponse.json(
        { error: 'Invalid request. Required: filePath, edits (array)' },
        { status: 400 }
      );
    }

    let result;

    switch (mode) {
      case 'replace':
        result = await multiEditFile(filePath, edits, options);
        break;
      
      case 'regex':
        // แปลง string เป็น RegExp
        const regexEdits = edits.map((edit: any) => ({
          pattern: new RegExp(edit.pattern, edit.flags || 'g'),
          replacement: edit.replacement,
          description: edit.description,
        }));
        result = await regexMultiEditFile(filePath, regexEdits, options);
        break;
      
      case 'insert':
        result = await insertCodeAt(filePath, edits);
        break;
      
      case 'remove':
        result = await removeCodeSections(filePath, edits);
        break;
      
      default:
        return NextResponse.json(
          { error: `Invalid mode: ${mode}. Use: replace, regex, insert, or remove` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: result.success,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in multi-edit:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Multi-edit failed',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/multi-edit
 * ดูตัวอย่างการใช้งาน
 */
export async function GET() {
  return NextResponse.json({
    name: 'Multi-Edit API',
    description: 'แก้ไขไฟล์หลายจุดพร้อมกัน',
    modes: {
      replace: 'แทนที่ข้อความ (exact match)',
      regex: 'แทนที่ด้วย Regular Expression',
      insert: 'แทรกโค้ดในตำแหน่งที่กำหนด',
      remove: 'ลบโค้ดหลายส่วน',
    },
    examples: {
      replace: {
        filePath: './src/example.ts',
        mode: 'replace',
        edits: [
          {
            search: 'const oldName',
            replace: 'const newName',
            description: 'เปลี่ยนชื่อตัวแปร',
          },
          {
            search: 'function oldFunc()',
            replace: 'function newFunc()',
            description: 'เปลี่ยนชื่อฟังก์ชัน',
          },
        ],
        options: {
          backup: true,
          dryRun: false,
        },
      },
      regex: {
        filePath: './src/example.ts',
        mode: 'regex',
        edits: [
          {
            pattern: 'console\\.log\\([^)]+\\)',
            flags: 'g',
            replacement: '// removed console.log',
            description: 'ลบ console.log ทั้งหมด',
          },
        ],
      },
      insert: {
        filePath: './src/example.ts',
        mode: 'insert',
        edits: [
          {
            after: 'import React',
            code: "import { useState } from 'react';",
            description: 'เพิ่ม import',
          },
          {
            atLine: 10,
            code: '  // TODO: Implement this',
            description: 'เพิ่ม comment',
          },
        ],
      },
      remove: {
        filePath: './src/example.ts',
        mode: 'remove',
        edits: [
          {
            contains: 'console.log',
            description: 'ลบบรรทัดที่มี console.log',
          },
          {
            startsWith: '//',
            description: 'ลบ comment',
          },
        ],
      },
    },
  });
}
