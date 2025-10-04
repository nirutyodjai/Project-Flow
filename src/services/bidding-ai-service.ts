/**
 * Bidding AI Service
 * ระบบ AI สำหรับแนะนำการเสนอราคา
 */

import type {
  BiddingProject,
  BiddingAnalysis,
  BiddingStrategy,
  BiddingInsights,
  BiddingRecommendation,
  BiddingHistory,
} from '@/types/bidding';

export class BiddingAIService {
  /**
   * วิเคราะห์โครงการและแนะนำราคาเสนอ
   */
  static async analyzeBidding(
    project: BiddingProject,
    history: BiddingHistory[]
  ): Promise<BiddingAnalysis> {
    // คำนวณต้นทุนโดยประมาณ
    const estimatedCost = this.estimateCost(project);
    
    // วิเคราะห์คู่แข่ง
    const competitorInsights = this.analyzeCompetitors(project, history);
    
    // คำนวณราคาแนะนำ
    const recommendedBid = this.calculateRecommendedBid(
      project,
      estimatedCost,
      competitorInsights,
      history
    );
    
    // คำนวณความน่าจะเป็นที่จะชนะ
    const winProbability = this.calculateWinProbability(
      recommendedBid,
      project,
      history
    );
    
    // ประเมินความเสี่ยง
    const { riskLevel, riskFactors } = this.assessRisk(project, recommendedBid, estimatedCost);
    
    // สร้างคำแนะนำ
    const recommendations = this.generateRecommendations(
      project,
      recommendedBid,
      estimatedCost,
      winProbability,
      riskLevel
    );
    
    // วิเคราะห์ปัจจัยสำคัญ
    const keyFactors = this.analyzeKeyFactors(project, history);
    
    const estimatedProfit = recommendedBid - estimatedCost;
    const profitMargin = (estimatedProfit / recommendedBid) * 100;
    
    return {
      projectId: project.id,
      projectName: project.name,
      recommendedBid,
      minBid: estimatedCost * 1.05,  // ต้นทุน + 5%
      maxBid: project.budget * 0.95,  // งบประมาณ - 5%
      winProbability,
      confidenceLevel: this.getConfidenceLevel(history.length, winProbability),
      estimatedCost,
      estimatedProfit,
      profitMargin,
      riskLevel,
      riskFactors,
      competitorInsights,
      recommendations,
      reasoning: this.generateReasoning(
        recommendedBid,
        project.budget,
        winProbability,
        profitMargin
      ),
      keyFactors,
    };
  }

  /**
   * ประมาณการต้นทุน
   */
  private static estimateCost(project: BiddingProject): number {
    // ใช้สูตรประมาณการพื้นฐาน
    // ในระบบจริงควรใช้ ML model
    const baseCost = project.budget * 0.65;  // 65% ของงบประมาณ
    
    // ปรับตามความซับซ้อน
    const complexityFactor = project.requirements.length * 0.02;
    const adjustedCost = baseCost * (1 + complexityFactor);
    
    return Math.round(adjustedCost);
  }

  /**
   * วิเคราะห์คู่แข่ง
   */
  private static analyzeCompetitors(
    project: BiddingProject,
    history: BiddingHistory[]
  ) {
    // หาโครงการที่คล้ายกัน
    const similarProjects = history.filter(
      h => h.category === project.category
    );
    
    if (similarProjects.length === 0) {
      return {
        averageCompetitorBid: project.budget * 0.85,
        recommendedDiscount: 10,
        competitiveAdvantage: ['ไม่มีข้อมูลคู่แข่งในหมวดหมู่นี้'],
      };
    }
    
    // คำนวณค่าเฉลี่ย
    const avgWinningBid = similarProjects.reduce((sum, p) => sum + p.winningBid, 0) / similarProjects.length;
    const avgDiscount = ((project.budget - avgWinningBid) / project.budget) * 100;
    
    // หาจุดแข็ง
    const advantages = this.identifyAdvantages(project, history);
    
    return {
      averageCompetitorBid: avgWinningBid,
      recommendedDiscount: Math.round(avgDiscount),
      competitiveAdvantage: advantages,
    };
  }

  /**
   * คำนวณราคาแนะนำ
   */
  private static calculateRecommendedBid(
    project: BiddingProject,
    estimatedCost: number,
    competitorInsights: any,
    history: BiddingHistory[]
  ): number {
    // เริ่มจากราคาคู่แข่ง
    let recommendedBid = competitorInsights.averageCompetitorBid;
    
    // ปรับตามต้นทุน (ต้องไม่ต่ำกว่าต้นทุน + 10%)
    const minAcceptable = estimatedCost * 1.1;
    if (recommendedBid < minAcceptable) {
      recommendedBid = minAcceptable;
    }
    
    // ปรับตามจำนวนคู่แข่ง
    if (project.competitorCount && project.competitorCount > 5) {
      recommendedBid *= 0.97;  // ลด 3% ถ้าคู่แข่งเยอะ
    }
    
    // ปรับตาม win rate ในหมวดหมู่นี้
    const categoryHistory = history.filter(h => h.category === project.category);
    const categoryWinRate = categoryHistory.length > 0
      ? categoryHistory.filter(h => h.won).length / categoryHistory.length
      : 0.5;
    
    if (categoryWinRate < 0.3) {
      recommendedBid *= 0.95;  // ลด 5% ถ้า win rate ต่ำ
    }
    
    return Math.round(recommendedBid);
  }

  /**
   * คำนวณความน่าจะเป็นที่จะชนะ
   */
  private static calculateWinProbability(
    bid: number,
    project: BiddingProject,
    history: BiddingHistory[]
  ): number {
    // ใช้ข้อมูลในอดีตคำนวณ
    const similarProjects = history.filter(h => h.category === project.category);
    
    if (similarProjects.length === 0) {
      // ไม่มีข้อมูล ประมาณการพื้นฐาน
      const discount = ((project.budget - bid) / project.budget) * 100;
      return Math.min(95, Math.max(5, 50 + discount * 2));
    }
    
    // นับว่ามีกี่โครงการที่เสนอราคาใกล้เคียงและชนะ
    const bidRange = bid * 0.1;  // ±10%
    const similarBids = similarProjects.filter(
      h => Math.abs(h.ourBid - bid) <= bidRange
    );
    
    if (similarBids.length === 0) {
      return 50;  // ไม่มีข้อมูลที่ใกล้เคียง
    }
    
    const winRate = (similarBids.filter(h => h.won).length / similarBids.length) * 100;
    
    // ปรับตามส่วนลดจากงบประมาณ
    const discount = ((project.budget - bid) / project.budget) * 100;
    const adjustedProbability = winRate + (discount - 10) * 2;
    
    return Math.min(95, Math.max(5, adjustedProbability));
  }

  /**
   * ประเมินความเสี่ยง
   */
  private static assessRisk(
    project: BiddingProject,
    bid: number,
    estimatedCost: number
  ): { riskLevel: 'low' | 'medium' | 'high' | 'very-high'; riskFactors: string[] } {
    const riskFactors: string[] = [];
    let riskScore = 0;
    
    // ตรวจสอบ profit margin
    const profitMargin = ((bid - estimatedCost) / bid) * 100;
    if (profitMargin < 5) {
      riskFactors.push('กำไรต่ำมาก (< 5%)');
      riskScore += 3;
    } else if (profitMargin < 10) {
      riskFactors.push('กำไรค่อนข้างต่ำ (< 10%)');
      riskScore += 2;
    }
    
    // ตรวจสอบขนาดโครงการ
    if (project.budget > 50000000) {
      riskFactors.push('โครงการขนาดใหญ่ (> 50M)');
      riskScore += 1;
    }
    
    // ตรวจสอบจำนวนคู่แข่ง
    if (project.competitorCount && project.competitorCount > 10) {
      riskFactors.push('คู่แข่งเยอะมาก (> 10 ราย)');
      riskScore += 2;
    }
    
    // ตรวจสอบเวลา
    const daysToDeadline = Math.ceil(
      (project.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    if (daysToDeadline < 3) {
      riskFactors.push('เวลาเตรียมน้อย (< 3 วัน)');
      riskScore += 2;
    }
    
    // ตรวจสอบความซับซ้อน
    if (project.requirements.length > 10) {
      riskFactors.push('ความต้องการซับซ้อน');
      riskScore += 1;
    }
    
    // กำหนดระดับความเสี่ยง
    let riskLevel: 'low' | 'medium' | 'high' | 'very-high';
    if (riskScore <= 2) riskLevel = 'low';
    else if (riskScore <= 4) riskLevel = 'medium';
    else if (riskScore <= 6) riskLevel = 'high';
    else riskLevel = 'very-high';
    
    return { riskLevel, riskFactors };
  }

  /**
   * สร้างคำแนะนำ
   */
  private static generateRecommendations(
    project: BiddingProject,
    bid: number,
    cost: number,
    winProbability: number,
    riskLevel: string
  ) {
    const recommendations: BiddingAnalysis['recommendations'] = [];
    
    const profitMargin = ((bid - cost) / bid) * 100;
    
    // คำแนะนำด้านราคา
    if (profitMargin < 10) {
      recommendations.push({
        type: 'pricing',
        priority: 'high',
        message: 'กำไรต่ำ ควรพิจารณาเพิ่มราคาหรือลดต้นทุน',
        action: 'ทบทวนรายการต้นทุน',
      });
    } else if (profitMargin > 30) {
      recommendations.push({
        type: 'pricing',
        priority: 'medium',
        message: 'กำไรสูง อาจลดราคาเพื่อเพิ่มโอกาสชนะ',
        action: 'พิจารณาลดราคา 5-10%',
      });
    }
    
    // คำแนะนำด้านกลยุทธ์
    if (winProbability < 40) {
      recommendations.push({
        type: 'strategy',
        priority: 'high',
        message: 'โอกาสชนะต่ำ ควรเน้นคุณภาพและความแตกต่าง',
        action: 'เพิ่มมูลค่าให้กับข้อเสนอ',
      });
    } else if (winProbability > 80) {
      recommendations.push({
        type: 'opportunity',
        priority: 'medium',
        message: 'โอกาสชนะสูง อาจเพิ่มกำไรได้',
        action: 'พิจารณาเพิ่มราคาเล็กน้อย',
      });
    }
    
    // คำแนะนำด้านความเสี่ยง
    if (riskLevel === 'high' || riskLevel === 'very-high') {
      recommendations.push({
        type: 'risk',
        priority: 'high',
        message: 'ความเสี่ยงสูง ควรพิจารณาอย่างรอบคอบ',
        action: 'ประเมินความเสี่ยงอีกครั้ง',
      });
    }
    
    return recommendations;
  }

  /**
   * วิเคราะห์ปัจจัยสำคัญ
   */
  private static analyzeKeyFactors(
    project: BiddingProject,
    history: BiddingHistory[]
  ) {
    const factors: BiddingAnalysis['keyFactors'] = [];
    
    // ปัจจัยด้านราคา
    const avgBudget = history.length > 0
      ? history.reduce((sum, h) => sum + h.budget, 0) / history.length
      : project.budget;
    
    if (project.budget > avgBudget * 1.5) {
      factors.push({
        factor: 'ขนาดโครงการ',
        impact: 'positive',
        weight: 0.8,
        description: 'โครงการใหญ่กว่าค่าเฉลี่ย เป็นโอกาสดี',
      });
    }
    
    // ปัจจัยด้านคู่แข่ง
    if (project.competitorCount && project.competitorCount < 5) {
      factors.push({
        factor: 'จำนวนคู่แข่ง',
        impact: 'positive',
        weight: 0.7,
        description: 'คู่แข่งน้อย โอกาสชนะสูง',
      });
    } else if (project.competitorCount && project.competitorCount > 10) {
      factors.push({
        factor: 'จำนวนคู่แข่ง',
        impact: 'negative',
        weight: 0.6,
        description: 'คู่แข่งเยอะ ต้องแข่งขันสูง',
      });
    }
    
    // ปัจจัยด้านประสบการณ์
    const categoryHistory = history.filter(h => h.category === project.category);
    if (categoryHistory.length > 5) {
      const winRate = categoryHistory.filter(h => h.won).length / categoryHistory.length;
      factors.push({
        factor: 'ประสบการณ์',
        impact: winRate > 0.5 ? 'positive' : 'negative',
        weight: 0.9,
        description: `มีประสบการณ์ ${categoryHistory.length} โครงการ, Win rate ${(winRate * 100).toFixed(0)}%`,
      });
    }
    
    return factors;
  }

  /**
   * ระดับความมั่นใจ
   */
  private static getConfidenceLevel(
    historyCount: number,
    winProbability: number
  ): 'low' | 'medium' | 'high' {
    if (historyCount < 5) return 'low';
    if (historyCount < 15) return 'medium';
    return 'high';
  }

  /**
   * สร้างเหตุผล
   */
  private static generateReasoning(
    bid: number,
    budget: number,
    winProbability: number,
    profitMargin: number
  ): string {
    const discount = ((budget - bid) / budget) * 100;
    
    return `แนะนำเสนอราคา ${bid.toLocaleString()} บาท (ลด ${discount.toFixed(1)}% จากงบประมาณ) ` +
      `โดยมีโอกาสชนะ ${winProbability.toFixed(0)}% และกำไร ${profitMargin.toFixed(1)}% ` +
      `ซึ่งเป็นจุดสมดุลที่ดีระหว่างโอกาสชนะและผลกำไร`;
  }

  /**
   * ระบุจุดแข็ง
   */
  private static identifyAdvantages(
    project: BiddingProject,
    history: BiddingHistory[]
  ): string[] {
    const advantages: string[] = [];
    
    const categoryHistory = history.filter(h => h.category === project.category);
    if (categoryHistory.length > 0) {
      const winRate = categoryHistory.filter(h => h.won).length / categoryHistory.length;
      if (winRate > 0.6) {
        advantages.push('มีประสบการณ์และ Win Rate สูงในหมวดหมู่นี้');
      }
    }
    
    if (project.competitorCount && project.competitorCount < 5) {
      advantages.push('คู่แข่งน้อย มีโอกาสชนะสูง');
    }
    
    return advantages.length > 0 ? advantages : ['ควรเน้นคุณภาพและความน่าเชื่อถือ'];
  }

  /**
   * สร้างกลยุทธ์ต่างๆ
   */
  static generateStrategies(analysis: BiddingAnalysis): BiddingStrategy[] {
    const { recommendedBid, estimatedCost, projectName } = analysis;
    
    return [
      {
        strategy: 'aggressive',
        description: 'เสนอราคาต่ำเพื่อเพิ่มโอกาสชนะ',
        recommendedBid: recommendedBid * 0.95,
        winProbability: Math.min(95, analysis.winProbability + 15),
        profitMargin: ((recommendedBid * 0.95 - estimatedCost) / (recommendedBid * 0.95)) * 100,
        pros: ['โอกาสชนะสูงมาก', 'แข่งขันได้ดี'],
        cons: ['กำไรต่ำ', 'ความเสี่ยงสูงถ้าต้นทุนเกิน'],
      },
      {
        strategy: 'moderate',
        description: 'สมดุลระหว่างโอกาสชนะและกำไร',
        recommendedBid: recommendedBid,
        winProbability: analysis.winProbability,
        profitMargin: analysis.profitMargin,
        pros: ['สมดุลดี', 'กำไรพอสมควร', 'ความเสี่ยงปานกลาง'],
        cons: ['อาจแพ้ถ้าคู่แข่งเสนอต่ำกว่า'],
      },
      {
        strategy: 'conservative',
        description: 'เน้นกำไรมากกว่าโอกาสชนะ',
        recommendedBid: recommendedBid * 1.05,
        winProbability: Math.max(5, analysis.winProbability - 15),
        profitMargin: ((recommendedBid * 1.05 - estimatedCost) / (recommendedBid * 1.05)) * 100,
        pros: ['กำไรสูง', 'ความเสี่ยงต่ำ'],
        cons: ['โอกาสชนะต่ำ', 'อาจแพ้คู่แข่ง'],
      },
    ];
  }
}
