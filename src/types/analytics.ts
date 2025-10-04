/**
 * Analytics Types & Interfaces
 * สำหรับระบบวิเคราะห์ Win Rate และสถิติต่างๆ
 */

export type ProjectStatus = 'pending' | 'won' | 'lost' | 'in-progress' | 'completed';

export type ProjectCategory = 
  | 'construction'      // ก่อสร้าง
  | 'electrical'        // ไฟฟ้า
  | 'plumbing'          // ประปา
  | 'interior'          // ตกแต่งภายใน
  | 'landscape'         // จัดสวน
  | 'renovation'        // ปรับปรุง
  | 'maintenance'       // บำรุงรักษา
  | 'other';            // อื่นๆ

export interface ProjectAnalytics {
  id: string;
  name: string;
  category: ProjectCategory;
  status: ProjectStatus;
  budget: number;
  bidAmount: number;
  actualCost?: number;
  profit?: number;
  profitMargin?: number;
  submittedDate: Date;
  resultDate?: Date;
  daysToComplete?: number;
  competitorCount?: number;
  winProbability?: number;
}

export interface WinRateStats {
  // Overall stats
  totalProjects: number;
  wonProjects: number;
  lostProjects: number;
  pendingProjects: number;
  
  // Win rate
  winRate: number;        // %
  lossRate: number;       // %
  pendingRate: number;    // %
  
  // Financial stats
  totalBidAmount: number;
  totalWonAmount: number;
  totalProfit: number;
  averageProfitMargin: number;
  
  // Time stats
  averageDaysToWin: number;
  averageDaysToComplete: number;
  
  // Trends
  winRateTrend: 'up' | 'down' | 'stable';
  profitTrend: 'up' | 'down' | 'stable';
}

export interface CategoryStats {
  category: ProjectCategory;
  totalProjects: number;
  wonProjects: number;
  winRate: number;
  totalAmount: number;
  averageProfit: number;
  profitMargin: number;
}

export interface MonthlyStats {
  month: string;          // YYYY-MM
  totalProjects: number;
  wonProjects: number;
  lostProjects: number;
  winRate: number;
  totalAmount: number;
  profit: number;
}

export interface CompetitorAnalysis {
  competitorName: string;
  projectsAgainst: number;
  timesWon: number;
  timesLost: number;
  winRateAgainst: number;
  averageBidDifference: number;  // % difference
}

export interface WinRateAnalysis {
  overall: WinRateStats;
  byCategory: CategoryStats[];
  byMonth: MonthlyStats[];
  competitors: CompetitorAnalysis[];
  topWinningCategories: CategoryStats[];
  improvementAreas: {
    category: ProjectCategory;
    currentWinRate: number;
    potentialWinRate: number;
    recommendation: string;
  }[];
}

export interface AnalyticsFilters {
  startDate?: Date;
  endDate?: Date;
  categories?: ProjectCategory[];
  minAmount?: number;
  maxAmount?: number;
  status?: ProjectStatus[];
}
