
import { firestore } from './firebase';
import { logger } from '@/lib/logger';

const TRADES_COLLECTION = 'ai_trades';

export type AgentId = 'Aggressive' | 'Conservative' | 'Contrarian';
export type AssetType = 'Stock' | 'Currency' | 'Gold';

export interface Trade {
  id?: string;
  agentId: AgentId;
  assetType: AssetType; // New field for asset type
  ticker: string; // This will be the identifier for the asset (e.g., AAPL, USDTHB=X, GC=F)
  decision: 'Buy' | 'Sell';
  price: number;
  timestamp: Date;
  reasoning: string;
  isClosed: boolean;
  profit?: number;
  closedAt?: Date;
}

async function closeOpenTrade(sellTrade: Omit<Trade, 'id' | 'isClosed'>): Promise<string> {
  const openTradesQuery = firestore.collection(TRADES_COLLECTION)
    .where('agentId', '==', sellTrade.agentId)
    .where('assetType', '==', sellTrade.assetType) // Match asset type
    .where('ticker', '==', sellTrade.ticker)
    .where('decision', '==', 'Buy')
    .where('isClosed', '==', false)
    .orderBy('timestamp', 'asc')
    .limit(1);

  const snapshot = await openTradesQuery.get();

  if (snapshot.empty) {
    const docRef = await firestore.collection(TRADES_COLLECTION).add({
        ...sellTrade,
        isClosed: false,
        timestamp: new Date(),
    });
    logger.info(`Recorded new short sell trade ${docRef.id} for ${sellTrade.ticker} (${sellTrade.assetType}) by ${sellTrade.agentId}`, undefined, 'TradingGameService');
    return docRef.id;
  }

  const openTradeDoc = snapshot.docs[0];
  const openTrade = openTradeDoc.data() as Trade;
  const profit = sellTrade.price - openTrade.price;

  await openTradeDoc.ref.update({
    isClosed: true,
    profit: profit,
    closedAt: new Date(),
  });

  logger.info(`Closed trade ${openTradeDoc.id} for ${sellTrade.ticker} (${sellTrade.assetType}) by ${sellTrade.agentId} with profit ${profit}`, undefined, 'TradingGameService');
  return openTradeDoc.id;
}

export async function recordTrade(trade: Omit<Trade, 'id' | 'isClosed'>): Promise<string> {
  try {
    if (trade.decision === 'Sell') {
      return await closeOpenTrade(trade);
    }

    const docRef = await firestore.collection(TRADES_COLLECTION).add({
      ...trade,
      isClosed: false,
      timestamp: new Date(),
    });
    logger.info(`Recorded new buy trade ${docRef.id} for ${trade.ticker} (${trade.assetType}) by ${trade.agentId}`, undefined, 'TradingGameService');
    return docRef.id;
  } catch (error) {
    logger.error('Error recording trade:', error, 'TradingGameService');
    throw new Error('Could not record trade in Firestore.');
  }
}

export async function getAgentOverallScores(): Promise<Record<AgentId, number>> {
    const snapshot = await firestore.collection(TRADES_COLLECTION)
        .where('isClosed', '==', true)
        .get();

    const scores: Record<AgentId, number> = {
        Aggressive: 0,
        Conservative: 0,
        Contrarian: 0,
    };

    if (snapshot.empty) {
        return scores;
    }

    snapshot.forEach(doc => {
        const trade = doc.data() as Trade;
        if (typeof trade.profit === 'number') {
            scores[trade.agentId] = (scores[trade.agentId] || 0) + trade.profit;
        }
    });

    return scores;
}

export async function getTradeHistory(ticker?: string, assetType?: AssetType): Promise<Trade[]> {
    let query: FirebaseFirestore.Query = firestore.collection(TRADES_COLLECTION).orderBy('timestamp', 'desc');

    if (ticker) {
        query = query.where('ticker', '==', ticker);
    }
    if (assetType) {
        query = query.where('assetType', '==', assetType);
    }

    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Trade));
}
