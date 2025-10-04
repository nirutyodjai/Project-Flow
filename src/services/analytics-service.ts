/**
 * Analytics Service
 * จัดการการวิเคราะห์ Win Rate และสถิติต่างๆ
 */

import { 
  collection, 
  query, 
  where, 
  getDocs,
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import type {
  ProjectAnalytics,
  WinRateStats,
  CategoryStats,
  MonthlyStats,
  CompetitorAnalysis,
  WinRateAnalysis,
  AnalyticsFilters,
  ProjectCategory,
  ProjectStatus
} from '@/types/analytics';

const PROJECTS_COLLECTION = 'projects';

export class AnalyticsService {
  /**
   * ดึงข้อมูลโครงการทั้งหมด
   */
  static async getProjects(
    userId: string,
    filters?: AnalyticsFilters
  ): Promise<ProjectAnalytics[]> {
    try {
      let q = query(
        collection(db, PROJECTS_COLLECTION),
        where('userId', '==', userId)
      );

      // Apply filters
      if (filters?.startDate) {
        q = query(q, where('submittedDate', '>=', Timestamp.fromDate(filters.startDate)));
      }
      if (filters?.endDate) {
        q = query(q, where('submittedDate', '<=', Timestamp.fromDate(filters.endDate)));
      }
      if (filters?.categories && filters.categories.length > 0) {
        q = query(q, where('category', 'in', filters.categories));
      }
      if (filters?.status && filters.status.length > 0) {
        q = query(q, where('status', 'in', filters.status));
      }

      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          submittedDate: data.submittedDate?.toDate() || new Date(),
          resultDate: data.resultDate?.toDate(),
        } as ProjectAnalytics;
      });
    } catch (error) {
      console.error('Error getting projects:', error);
      throw error;
    }
  }

  /**
   * คำนวณ Win Rate Stats
   */
  static calculateWinRateStats(projects: ProjectAnalytics[]): WinRateStats {
    const totalProjects = projects.length;
    const wonProjects = projects.filter(p => p.status === 'won').length;
    const lostProjects = projects.filter(p => p.status === 'lost').length;
    const pendingProjects = projects.filter(p => p.status === 'pending').length;

    const winRate = totalProjects > 0 ? (wonProjects / totalProjects) * 100 : 0;
    const lossRate = totalProjects > 0 ? (lostProjects / totalProjects) * 100 : 0;
    const pendingRate = totalProjects > 0 ? (pendingProjects / totalProjects) * 100 : 0;

    const totalBidAmount = projects.reduce((sum, p) => sum + p.bidAmount, 0);
    const wonProjects_data = projects.filter(p => p.status === 'won');
    const totalWonAmount = wonProjects_data.reduce((sum, p) => sum + p.bidAmount, 0);
    const totalProfit = wonProjects_data.reduce((sum, p) => sum + (p.profit || 0), 0);
    
    const averageProfitMargin = wonProjects_data.length > 0
      ? wonProjects_data.reduce((sum, p) => sum + (p.profitMargin || 0), 0) / wonProjects_data.length
      : 0;

    // Calculate average days
    const wonProjectsWithDates = wonProjects_data.filter(p => p.resultDate && p.submittedDate);
    const averageDaysToWin = wonProjectsWithDates.length > 0
      ? wonProjectsWithDates.reduce((sum, p) => {
          const days = Math.ceil((p.resultDate!.getTime() - p.submittedDate.getTime()) / (1000 * 60 * 60 * 24));
          return sum + days;
        }, 0) / wonProjectsWithDates.length
      : 0;

    const completedProjects = wonProjects_data.filter(p => p.daysToComplete);
    const averageDaysToComplete = completedProjects.length > 0
      ? completedProjects.reduce((sum, p) => sum + (p.daysToComplete || 0), 0) / completedProjects.length
      : 0;

    // Calculate trends (compare last 3 months vs previous 3 months)
    const now = new Date();
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);

    const recentProjects = projects.filter(p => p.submittedDate >= threeMonthsAgo);
    const previousProjects = projects.filter(p => 
      p.submittedDate >= sixMonthsAgo && p.submittedDate < threeMonthsAgo
    );

    const recentWinRate = recentProjects.length > 0
      ? (recentProjects.filter(p => p.status === 'won').length / recentProjects.length) * 100
      : 0;
    const previousWinRate = previousProjects.length > 0
      ? (previousProjects.filter(p => p.status === 'won').length / previousProjects.length) * 100
      : 0;

    const winRateTrend = recentWinRate > previousWinRate + 5 ? 'up' 
      : recentWinRate < previousWinRate - 5 ? 'down' 
      : 'stable';

    const recentProfit = recentProjects
      .filter(p => p.status === 'won')
      .reduce((sum, p) => sum + (p.profit || 0), 0);
    const previousProfit = previousProjects
      .filter(p => p.status === 'won')
      .reduce((sum, p) => sum + (p.profit || 0), 0);

    const profitTrend = recentProfit > previousProfit * 1.1 ? 'up'
      : recentProfit < previousProfit * 0.9 ? 'down'
      : 'stable';

    return {
      totalProjects,
      wonProjects,
      lostProjects,
      pendingProjects,
      winRate,
      lossRate,
      pendingRate,
      totalBidAmount,
      totalWonAmount,
      totalProfit,
      averageProfitMargin,
      averageDaysToWin,
      averageDaysToComplete,
      winRateTrend,
      profitTrend,
    };
  }

  /**
   * วิเคราะห์ตามหมวดหมู่
   */
  static analyzeByCategory(projects: ProjectAnalytics[]): CategoryStats[] {
    const categories = new Map<ProjectCategory, ProjectAnalytics[]>();

    projects.forEach(project => {
      const existing = categories.get(project.category) || [];
      categories.set(project.category, [...existing, project]);
    });

    const stats: CategoryStats[] = [];

    categories.forEach((categoryProjects, category) => {
      const totalProjects = categoryProjects.length;
      const wonProjects = categoryProjects.filter(p => p.status === 'won').length;
      const winRate = totalProjects > 0 ? (wonProjects / totalProjects) * 100 : 0;
      const totalAmount = categoryProjects.reduce((sum, p) => sum + p.bidAmount, 0);
      
      const wonProjectsData = categoryProjects.filter(p => p.status === 'won');
      const averageProfit = wonProjectsData.length > 0
        ? wonProjectsData.reduce((sum, p) => sum + (p.profit || 0), 0) / wonProjectsData.length
        : 0;
      
      const profitMargin = wonProjectsData.length > 0
        ? wonProjectsData.reduce((sum, p) => sum + (p.profitMargin || 0), 0) / wonProjectsData.length
        : 0;

      stats.push({
        category,
        totalProjects,
        wonProjects,
        winRate,
        totalAmount,
        averageProfit,
        profitMargin,
      });
    });

    return stats.sort((a, b) => b.winRate - a.winRate);
  }

  /**
   * วิเคราะห์รายเดือน
   */
  static analyzeByMonth(projects: ProjectAnalytics[]): MonthlyStats[] {
    const months = new Map<string, ProjectAnalytics[]>();

    projects.forEach(project => {
      const month = `${project.submittedDate.getFullYear()}-${String(project.submittedDate.getMonth() + 1).padStart(2, '0')}`;
      const existing = months.get(month) || [];
      months.set(month, [...existing, project]);
    });

    const stats: MonthlyStats[] = [];

    months.forEach((monthProjects, month) => {
      const totalProjects = monthProjects.length;
      const wonProjects = monthProjects.filter(p => p.status === 'won').length;
      const lostProjects = monthProjects.filter(p => p.status === 'lost').length;
      const winRate = totalProjects > 0 ? (wonProjects / totalProjects) * 100 : 0;
      const totalAmount = monthProjects.reduce((sum, p) => sum + p.bidAmount, 0);
      const profit = monthProjects
        .filter(p => p.status === 'won')
        .reduce((sum, p) => sum + (p.profit || 0), 0);

      stats.push({
        month,
        totalProjects,
        wonProjects,
        lostProjects,
        winRate,
        totalAmount,
        profit,
      });
    });

    return stats.sort((a, b) => a.month.localeCompare(b.month));
  }

  /**
   * วิเคราะห์ Win Rate แบบเต็ม
   */
  static async analyzeWinRate(
    userId: string,
    filters?: AnalyticsFilters
  ): Promise<WinRateAnalysis> {
    const projects = await this.getProjects(userId, filters);
    
    const overall = this.calculateWinRateStats(projects);
    const byCategory = this.analyzeByCategory(projects);
    const byMonth = this.analyzeByMonth(projects);
    
    // Top winning categories
    const topWinningCategories = byCategory
      .filter(c => c.totalProjects >= 3)
      .sort((a, b) => b.winRate - a.winRate)
      .slice(0, 5);

    // Improvement areas
    const improvementAreas = byCategory
      .filter(c => c.totalProjects >= 3 && c.winRate < 50)
      .map(c => ({
        category: c.category,
        currentWinRate: c.winRate,
        potentialWinRate: c.winRate + 20,
        recommendation: this.getRecommendation(c),
      }));

    return {
      overall,
      byCategory,
      byMonth,
      competitors: [], // TODO: Implement competitor analysis
      topWinningCategories,
      improvementAreas,
    };
  }

  /**
   * สร้างคำแนะนำ
   */
  private static getRecommendation(stats: CategoryStats): string {
    if (stats.winRate < 30) {
      return `Win rate ต่ำมาก (${stats.winRate.toFixed(1)}%) - ควรทบทวนกลยุทธ์การเสนอราคาและคุณภาพงาน`;
    } else if (stats.winRate < 50) {
      return `Win rate ต่ำกว่าค่าเฉลี่ย - ลองวิเคราะห์คู่แข่งและปรับราคาให้เหมาะสม`;
    } else if (stats.profitMargin < 10) {
      return `กำไรต่ำ - ควรเพิ่ม profit margin หรือลดต้นทุน`;
    }
    return 'ควรรักษาระดับและพัฒนาต่อไป';
  }
}
