import { config } from 'dotenv';
config();

import '@/ai/tools';
import '@/ai/flows/analyze-bidding-project.ts';
import '@/ai/flows/categorize-financial-transactions.ts';
import '@/ai/flows/forecast-budget-overruns.ts';
import '@/ai/flows/find-biddable-projects.ts';
import '@/ai/flows/predict-stock-trend.ts';
import '@/ai/flows/summarize-document-flow.ts';
import '@/ai/flows/text-to-speech-flow.ts';
