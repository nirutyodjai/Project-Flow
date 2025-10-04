/**
 * Bidding Types & Interfaces
 * สำหรับระบบแนะนำการเสนอราคาด้วย AI
 */

export interface BiddingProject {
  id: string;
  name: string;
  category: string;
  budget: number;
  deadline: Date;
  requirements: string[];
  location?: string;
  competitorCount?: number;
  historicalData?: {
    averageBidAmount: number;
    lowestBid: number;
    highestBid: number;
    winningBid?: number;
  };
}

export interface BiddingAnalysis {
  projectId: string;
  projectName: string;
  
  // Recommended bid
  recommendedBid: number;
  minBid: number;
  maxBid: number;
  
  // Win probability
  winProbability: number;        // 0-100%
  confidenceLevel: 'low' | 'medium' | 'high';
  
  // Cost analysis
  estimatedCost: number;
  estimatedProfit: number;
  profitMargin: number;
  
  // Risk assessment
  riskLevel: 'low' | 'medium' | 'high' | 'very-high';
  riskFactors: string[];
  
  // Competitor analysis
  competitorInsights: {
    averageCompetitorBid: number;
    recommendedDiscount: number;  // %
    competitiveAdvantage: string[];
  };
  
  // Recommendations
  recommendations: {
    type: 'pricing' | 'strategy' | 'risk' | 'opportunity';
    priority: 'low' | 'medium' | 'high';
    message: string;
    action?: string;
  }[];
  
  // AI reasoning
  reasoning: string;
  keyFactors: {
    factor: string;
    impact: 'positive' | 'negative' | 'neutral';
    weight: number;  // 0-1
    description: string;
  }[];
}

export interface BiddingStrategy {
  strategy: 'aggressive' | 'moderate' | 'conservative';
  description: string;
  recommendedBid: number;
  winProbability: number;
  profitMargin: number;
  pros: string[];
  cons: string[];
}

export interface BiddingHistory {
  projectId: string;
  projectName: string;
  category: string;
  budget: number;
  ourBid: number;
  winningBid: number;
  won: boolean;
  competitorCount: number;
  submittedDate: Date;
  resultDate?: Date;
  actualProfit?: number;
  lessons: string[];
}

export interface BiddingInsights {
  // Historical performance
  totalBids: number;
  wonBids: number;
  winRate: number;
  averageDiscount: number;      // % from budget
  
  // Optimal bidding range
  optimalDiscountRange: {
    min: number;
    max: number;
    averageWinRate: number;
  };
  
  // Category-specific insights
  categoryInsights: {
    category: string;
    winRate: number;
    averageDiscount: number;
    optimalDiscount: number;
  }[];
  
  // Competitor patterns
  competitorPatterns: {
    averageBidCount: number;
    typicalDiscount: number;
    winningPattern: string;
  };
  
  // Success factors
  successFactors: {
    factor: string;
    correlation: number;  // -1 to 1
    importance: number;   // 0-1
  }[];
}

export interface BiddingRecommendation {
  shouldBid: boolean;
  confidence: number;           // 0-100%
  reasoning: string;
  
  // If should bid
  recommendedAmount?: number;
  strategy?: 'aggressive' | 'moderate' | 'conservative';
  expectedProfit?: number;
  winProbability?: number;
  
  // If should not bid
  reasons?: string[];
  alternatives?: string[];
}
