
import { NextRequest, NextResponse } from 'next/server';
import { currencyConverterFlow } from '@/ai/flows/currency-converter-flow';

export async function POST(req: NextRequest) {
  try {
    const { amount, from, to } = await req.json();
    if (typeof amount !== 'number' || !from || !to) {
      return NextResponse.json({ error: 'Amount, from, and to are required' }, { status: 400 });
    }

    const result = await currencyConverterFlow.run({ amount, from, to });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in currency converter API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
