'''
'use server';
/**
 * @fileOverview Tools for providing real-world construction knowledge.
 * This tool allows the AI to look up information about materials, systems, and prices.
 */
import { z } from 'zod';
import { ai } from '@/ai/genkit';
import { google_web_search } from 'genkit/tools';
import { generate } from 'genkit/ai';

// Schema for the output of our knowledge tool (UPDATED)
const MaterialDataSchema = z.object({
  description: z.string().describe('คำอธิบายทั่วไปของวัสดุหรือระบบนี้'),
  commonApplications: z.array(z.string()).describe('การใช้งานโดยทั่วไป'),
  // UPDATED: Price range instead of single estimated price
  priceRange: z.object({
    min: z.number().optional().describe('ราคาต่ำสุดโดยประมาณ'),
    max: z.number().optional().describe('ราคาสูงสุดโดยประมาณ'),
    unit: z.string().optional().describe('หน่วยของราคา เช่น บาท/เมตร, บาท/ตร.ม., บาท/ชุด'),
  }).optional().describe('ช่วงราคาตลาดโดยประมาณที่ค้นเจอ'),
  standardSpecifications: z.array(z.string()).describe('คุณสมบัติหรือมาตรฐานทั่วไป (เช่น มอก., Class)'),
  keyInstallationNotes: z.array(z.string()).describe('ข้อควรระวังหรือประเด็นสำคัญในการติดตั้ง'),
  // NEW: Common suppliers/sources
  commonSuppliers: z.array(z.string()).optional().describe('รายชื่อผู้จำหน่ายหรือแหล่งที่มาทั่วไป'),
});

export const getMaterialAndSystemData = ai.defineTool(
  {
    name: 'getMaterialAndSystemData',
    description: 'ค้นหาข้อมูลเชิงลึกเกี่ยวกับวัสดุ, อุปกรณ์, หรือระบบงานก่อสร้างจากอินเทอร์เน็ต เพื่อใช้ตรวจสอบความถูกต้องและสมเหตุสมผล',
    inputSchema: z.object({
      itemName: z.string().describe('ชื่อของวัสดุหรือระบบที่ต้องการค้นหา (เช่น "ท่อ HDPE Class 100", "ระบบปรับอากาศ VRF")'),
    }),
    outputSchema: MaterialDataSchema,
  },
  async (input) => {
    console.log(`[Knowledge Tool] Searching for data on: ${input.itemName}`);

    // Construct a detailed search query for Google (UPDATED)
    const searchQuery = `
      ข้อมูลคุณสมบัติ ราคาตลาด แหล่งที่มา และมาตรฐานการติดตั้งสำหรับ "${input.itemName}" ในงานก่อสร้างประเทศไทย
      - common applications of ${input.itemName}
      - estimated price range per unit/sqm ${input.itemName} in Thailand
      - standard specifications (TIS, ISO) for ${input.itemName}
      - key installation requirements for ${input.itemName}
      - common suppliers or distributors for ${input.itemName} in Thailand
    `;

    // Use the built-in Google Search tool
    const searchResult = await google_web_search({ query: searchQuery });

    // Now, use an AI to process the search results and extract structured data. (UPDATED PROMPT)
    const synthesisPrompt = `
      คุณคือผู้เชี่ยวชาญด้านวัสดุก่อสร้าง โปรดสรุปข้อมูลจากผลการค้นหาต่อไปนี้เกี่ยวกับ "${input.itemName}" 
      และจัดรูปแบบเป็น JSON ที่ตรงกับ Schema ที่กำหนดให้

      --- SEARCH RESULTS ---
      ${JSON.stringify(searchResult, null, 2)}
      --- END SEARCH RESULTS ---

      โปรดสกัดข้อมูลเฉพาะที่สำคัญและเกี่ยวข้องกับงานก่อสร้างในประเทศไทย โดยเน้นที่:
      - คำอธิบายทั่วไป
      - การใช้งานทั่วไป
      - **ช่วงราคาตลาดโดยประมาณ (ถ้ามี ให้ระบุ min, max และหน่วย เช่น บาท/เมตร, บาท/ตร.ม.)**
      - คุณสมบัติหรือมาตรฐานทั่วไป
      - ข้อควรระวังในการติดตั้ง
      - **รายชื่อผู้จำหน่ายหรือแหล่งที่มาทั่วไป (ถ้ามี)**
    `;

    const llmResponse = await generate({
        model: ai, // Use the general model for this synthesis task
        prompt: synthesisPrompt,
        output: {
            format: 'json',
            schema: MaterialDataSchema,
        },
    });

    const output = llmResponse.output();
    if (!output) {
        throw new Error(`Failed to synthesize search results for ${input.itemName}`);
    }

    console.log(`[Knowledge Tool] Successfully retrieved and synthesized data for: ${input.itemName}`);
    return output;
  }
);
'''