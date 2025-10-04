/**
 * Advanced File Manager with Multi-Edit Support
 * สามารถแก้ไขหลายส่วนในไฟล์เดียวได้
 */

import fs from 'fs/promises';
import path from 'path';

export interface CodeEdit {
  search: string;
  replace: string;
  description?: string;
}

export interface MultiEditResult {
  success: boolean;
  filePath: string;
  editsApplied: number;
  totalEdits: number;
  errors: string[];
  preview?: string;
}

/**
 * แก้ไขไฟล์หลายจุดพร้อมกัน
 */
export async function multiEditFile(
  filePath: string,
  edits: CodeEdit[],
  options: {
    backup?: boolean;
    dryRun?: boolean;
  } = {}
): Promise<MultiEditResult> {
  const result: MultiEditResult = {
    success: false,
    filePath,
    editsApplied: 0,
    totalEdits: edits.length,
    errors: [],
  };

  try {
    // อ่านไฟล์
    const originalContent = await fs.readFile(filePath, 'utf-8');
    let content = originalContent;

    // Backup ถ้าต้องการ
    if (options.backup && !options.dryRun) {
      const backupPath = `${filePath}.backup.${Date.now()}`;
      await fs.writeFile(backupPath, originalContent);
    }

    // ทำการแก้ไขทีละอัน
    for (let i = 0; i < edits.length; i++) {
      const edit = edits[i];
      
      try {
        if (content.includes(edit.search)) {
          content = content.replace(edit.search, edit.replace);
          result.editsApplied++;
        } else {
          result.errors.push(`Edit ${i + 1}: Search string not found - "${edit.search.substring(0, 50)}..."`);
        }
      } catch (error) {
        result.errors.push(`Edit ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Preview หรือเขียนไฟล์
    if (options.dryRun) {
      result.preview = content;
    } else {
      await fs.writeFile(filePath, content, 'utf-8');
    }

    result.success = result.editsApplied > 0;
    return result;
  } catch (error) {
    result.errors.push(`File operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return result;
  }
}

/**
 * แก้ไขไฟล์แบบ Regex (ทรงพลังกว่า)
 */
export async function regexMultiEditFile(
  filePath: string,
  edits: Array<{
    pattern: RegExp;
    replacement: string;
    description?: string;
  }>,
  options: {
    backup?: boolean;
    dryRun?: boolean;
  } = {}
): Promise<MultiEditResult> {
  const result: MultiEditResult = {
    success: false,
    filePath,
    editsApplied: 0,
    totalEdits: edits.length,
    errors: [],
  };

  try {
    const originalContent = await fs.readFile(filePath, 'utf-8');
    let content = originalContent;

    if (options.backup && !options.dryRun) {
      const backupPath = `${filePath}.backup.${Date.now()}`;
      await fs.writeFile(backupPath, originalContent);
    }

    for (let i = 0; i < edits.length; i++) {
      const edit = edits[i];
      
      try {
        if (edit.pattern.test(content)) {
          content = content.replace(edit.pattern, edit.replacement);
          result.editsApplied++;
        } else {
          result.errors.push(`Edit ${i + 1}: Pattern not matched - ${edit.pattern.toString()}`);
        }
      } catch (error) {
        result.errors.push(`Edit ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    if (options.dryRun) {
      result.preview = content;
    } else {
      await fs.writeFile(filePath, content, 'utf-8');
    }

    result.success = result.editsApplied > 0;
    return result;
  } catch (error) {
    result.errors.push(`File operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return result;
  }
}

/**
 * สร้างไฟล์ใหม่พร้อมเนื้อหาหลายส่วน
 */
export async function createFileWithSections(
  filePath: string,
  sections: Array<{
    name: string;
    content: string;
    position?: 'top' | 'bottom' | number;
  }>
): Promise<{ success: boolean; filePath: string; error?: string }> {
  try {
    // เรียงลำดับ sections
    const sortedSections = sections.sort((a, b) => {
      const posA = a.position === 'top' ? 0 : a.position === 'bottom' ? 999999 : (a.position || 0);
      const posB = b.position === 'top' ? 0 : b.position === 'bottom' ? 999999 : (b.position || 0);
      return posA - posB;
    });

    // รวมเนื้อหา
    const content = sortedSections.map(s => s.content).join('\n\n');

    // สร้างโฟลเดอร์ถ้ายังไม่มี
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });

    // เขียนไฟล์
    await fs.writeFile(filePath, content, 'utf-8');

    return { success: true, filePath };
  } catch (error) {
    return {
      success: false,
      filePath,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * เพิ่มโค้ดในตำแหน่งที่กำหนด
 */
export async function insertCodeAt(
  filePath: string,
  insertions: Array<{
    after?: string;
    before?: string;
    atLine?: number;
    code: string;
    description?: string;
  }>
): Promise<MultiEditResult> {
  const result: MultiEditResult = {
    success: false,
    filePath,
    editsApplied: 0,
    totalEdits: insertions.length,
    errors: [],
  };

  try {
    const originalContent = await fs.readFile(filePath, 'utf-8');
    const lines = originalContent.split('\n');

    for (let i = 0; i < insertions.length; i++) {
      const insertion = insertions[i];

      try {
        if (insertion.atLine !== undefined) {
          // แทรกที่บรรทัดที่กำหนด
          lines.splice(insertion.atLine, 0, insertion.code);
          result.editsApplied++;
        } else if (insertion.after) {
          // แทรกหลังข้อความที่กำหนด
          const index = lines.findIndex(line => line.includes(insertion.after!));
          if (index !== -1) {
            lines.splice(index + 1, 0, insertion.code);
            result.editsApplied++;
          } else {
            result.errors.push(`Insertion ${i + 1}: "after" text not found`);
          }
        } else if (insertion.before) {
          // แทรกก่อนข้อความที่กำหนด
          const index = lines.findIndex(line => line.includes(insertion.before!));
          if (index !== -1) {
            lines.splice(index, 0, insertion.code);
            result.editsApplied++;
          } else {
            result.errors.push(`Insertion ${i + 1}: "before" text not found`);
          }
        }
      } catch (error) {
        result.errors.push(`Insertion ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    await fs.writeFile(filePath, lines.join('\n'), 'utf-8');
    result.success = result.editsApplied > 0;
    return result;
  } catch (error) {
    result.errors.push(`File operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return result;
  }
}

/**
 * ลบโค้ดหลายส่วน
 */
export async function removeCodeSections(
  filePath: string,
  removals: Array<{
    startsWith?: string;
    endsWith?: string;
    contains?: string;
    exactMatch?: string;
    lineNumber?: number;
  }>
): Promise<MultiEditResult> {
  const result: MultiEditResult = {
    success: false,
    filePath,
    editsApplied: 0,
    totalEdits: removals.length,
    errors: [],
  };

  try {
    const originalContent = await fs.readFile(filePath, 'utf-8');
    let lines = originalContent.split('\n');

    for (const removal of removals) {
      const initialLength = lines.length;

      if (removal.lineNumber !== undefined) {
        lines.splice(removal.lineNumber, 1);
      } else if (removal.exactMatch) {
        lines = lines.filter(line => line !== removal.exactMatch);
      } else if (removal.contains) {
        lines = lines.filter(line => !line.includes(removal.contains!));
      } else if (removal.startsWith) {
        lines = lines.filter(line => !line.trim().startsWith(removal.startsWith!));
      } else if (removal.endsWith) {
        lines = lines.filter(line => !line.trim().endsWith(removal.endsWith!));
      }

      if (lines.length < initialLength) {
        result.editsApplied++;
      }
    }

    await fs.writeFile(filePath, lines.join('\n'), 'utf-8');
    result.success = result.editsApplied > 0;
    return result;
  } catch (error) {
    result.errors.push(`File operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return result;
  }
}
