'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { predictStockTrend, PredictStockTrendOutput } from '@/ai/flows/predict-stock-trend';
import { Bot, User, TrendingUp, TrendingDown, LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type PredictionHistory = PredictStockTrendOutput & { winner: 'ai' | 'user' };

const TradingGamePage = () => {
    const [ticker, setTicker] = useState('GOOGL');
    const [loading, setLoading] = useState(false);
    const [prediction, setPrediction] = useState<PredictionHistory | null>(null);
    const [history, setHistory] = useState<PredictionHistory[]>([]);
    const [error, setError] = useState<string | null>(null);

    const handleAnalysis = async () => {
        if (!ticker.trim()) return;
        setLoading(true);
        setPrediction(null);
        setError(null);
        try {
            const result = await predictStockTrend({ 
                ticker: ticker.toUpperCase(),
                predictionHistory: history 
            });
            const winner = (result.confidence >= 70 ? 'ai' : 'user') as 'ai' | 'user';
            const newPrediction = { ...result, winner };
            setPrediction(newPrediction);
            setHistory(prev => [newPrediction, ...prev]);
        } catch (e) {
            console.error(e);
            setError('เกิดข้อผิดพลาดในการวิเคราะห์ โปรดลองอีกครั้ง');
        }
        setLoading(false);
    };

    const WinnerBadge = ({ winner }: { winner: 'ai' | 'user' }) => (
        <div className={cn(
            'flex items-center gap-2 rounded-lg p-2 text-sm font-semibold',
            winner === 'ai' ? 'bg-green-900/50 text-green-300' : 'bg-blue-900/50 text-blue-300'
        )}>
            {winner === 'ai' ? <Bot className="h-5 w-5" /> : <User className="h-5 w-5" />}
            <span>{winner === 'ai' ? 'AI ชนะ' : 'คุณชนะ'}</span>
        </div>
    );
    
    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
            <div className="space-y-1">
                <h1 className="text-3xl font-headline font-bold">เกมวิเคราะห์หุ้นกับ AI</h1>
                <p className="text-muted-foreground">ป้อนสัญลักษณ์หุ้น (Ticker) เพื่อให้ AI วิเคราะห์และคาดการณ์แนวโน้ม</p>
            </div>

            <div className="flex gap-2">
                <Input 
                    value={ticker}
                    onChange={(e) => setTicker(e.target.value)}
                    placeholder="เช่น GOOGL, AAPL, MSFT"
                    className="flex-grow bg-card"
                    onKeyDown={(e) => e.key === 'Enter' && handleAnalysis()}
                />
                <Button onClick={handleAnalysis} disabled={loading} className="w-32">
                    {loading ? <LoaderCircle className="animate-spin" /> : 'วิเคราะห์'}
                </Button>
            </div>

            {error && <p className="text-destructive text-center">{error}</p>}
            
            {prediction && (
                <Card className="bg-secondary/50 animate-in fade-in-50">
                    <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                            <span>ผลการวิเคราะห์ล่าสุด: {prediction.ticker}</span>
                            <span className="text-2xl font-bold">${prediction.price.toFixed(2)}</span>
                        </CardTitle>
                        <CardDescription>{prediction.reasoning}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6">
                        <div className={cn('flex items-center gap-3 text-2xl font-bold', prediction.prediction === 'up' ? 'text-green-400' : 'text-red-400')}>
                           {prediction.prediction === 'up' ? <TrendingUp className="h-8 w-8" /> : <TrendingDown className="h-8 w-8" />}
                           <span>แนวโน้ม: {prediction.prediction === 'up' ? 'ขึ้น' : 'ลง'}</span>
                        </div>
                         <div className="flex flex-col items-center">
                            <div className="text-sm text-muted-foreground">ความมั่นใจ</div>
                            <div className="text-4xl font-bold">{prediction.confidence.toFixed(0)}%</div>
                        </div>
                        <WinnerBadge winner={prediction.winner} />
                    </CardContent>
                </Card>
            )}

            {history.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-headline font-bold">ประวัติการวิเคราะห์</h2>
                    <div className="space-y-3">
                    {history.map((item, index) => (
                        <Card key={index} className="flex items-center justify-between p-4 bg-card">
                             <div className="flex items-center gap-4">
                                <div className={cn("p-2 rounded-full", item.prediction === 'up' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400')}>
                                    {item.prediction === 'up' ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                                </div>
                                <div>
                                    <p className="font-bold">{item.ticker} @ ${item.price.toFixed(2)}</p>
                                    <p className="text-sm text-muted-foreground">{item.reasoning.substring(0, 50)}...</p>
                                </div>
                            </div>
                             <div className="flex items-center gap-4">
                                <p className="text-lg font-semibold">{item.confidence.toFixed(0)}%</p>
                                {item.winner === 'ai' ? 
                                    <Bot className="h-6 w-6 text-green-400" /> : 
                                    <User className="h-6 w-6 text-blue-400" />
                                }
                            </div>
                        </Card>
                    ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default TradingGamePage;
