import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { listAdminProjects, listTasks } from '@/services/firestore';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || 'json';
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const projectStatus = searchParams.get('status');

    // ดึงข้อมูลจาก Firebase
    const [projects, tasks] = await Promise.all([
      listAdminProjects(),
      listTasks()
    ]);

    // กรองข้อมูลตามเงื่อนไข
    let filteredProjects = projects || [];
    let filteredTasks = tasks || [];

    if (projectStatus) {
      filteredProjects = filteredProjects.filter(p => p.status === projectStatus);
    }

    if (dateFrom && dateTo) {
      const fromDate = new Date(dateFrom);
      const toDate = new Date(dateTo);
      
      filteredProjects = filteredProjects.filter(p => {
        const projectDate = new Date(p.createdAt || '');
        return projectDate >= fromDate && projectDate <= toDate;
      });
    }

    // สร้างรายงาน
    const report = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalProjects: filteredProjects.length,
        completedProjects: filteredProjects.filter(p => p.status === 'เสร็จสิ้น').length,
        activeProjects: filteredProjects.filter(p => p.status === 'กำลังดำเนินการ').length,
        pendingProjects: filteredProjects.filter(p => p.status === 'รอดำเนินการ').length,
        totalTasks: filteredTasks.length,
        completedTasks: filteredTasks.filter(t => t.checked).length,
        averageProgress: filteredProjects.reduce((sum, p) => sum + p.progress, 0) / filteredProjects.length || 0
      },
      projects: filteredProjects.map(project => ({
        id: project.id,
        name: project.name,
        status: project.status,
        progress: project.progress,
        dueDate: project.dueDate,
        createdAt: project.createdAt,
        description: project.desc
      })),
      tasks: filteredTasks.map(task => ({
        id: task.id,
        title: task.title,
        priority: task.priority,
        completed: task.checked,
        time: task.time
      })),
      analytics: {
        projectsByStatus: {
          completed: filteredProjects.filter(p => p.status === 'เสร็จสิ้น').length,
          active: filteredProjects.filter(p => p.status === 'กำลังดำเนินการ').length,
          pending: filteredProjects.filter(p => p.status === 'รอดำเนินการ').length,
          problem: filteredProjects.filter(p => p.status === 'มีปัญหา').length
        },
        tasksByPriority: {
          high: filteredTasks.filter(t => t.priority === 'สูง').length,
          medium: filteredTasks.filter(t => t.priority === 'ปานกลาง').length,
          low: filteredTasks.filter(t => t.priority === 'ต่ำ').length
        },
        progressDistribution: filteredProjects.reduce((acc, project) => {
          const range = Math.floor(project.progress / 10) * 10;
          const key = `${range}-${range + 9}%`;
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      }
    };

    // ส่งข้อมูลตามรูปแบบที่ร้องขอ
    if (format === 'csv') {
      // สร้าง CSV
      const csvData = [
        ['Project ID', 'Project Name', 'Status', 'Progress', 'Due Date', 'Created At'],
        ...filteredProjects.map(p => [
          p.id,
          p.name,
          p.status,
          p.progress,
          p.dueDate,
          p.createdAt || ''
        ])
      ];
      
      const csvContent = csvData.map(row => row.join(',')).join('\n');
      
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="project-report.csv"'
        }
      });
    } else if (format === 'excel') {
      // สำหรับ Excel จะต้องใช้ library เพิ่มเติม
      // ในที่นี้จะส่ง JSON กลับไปแทน
      return NextResponse.json({
        ...report,
        note: 'Excel format requires additional library implementation'
      });
    }

    return NextResponse.json(report);

  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการสร้างรายงาน' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reportType, filters, emailRecipients } = body;

    // สร้างรายงานตามประเภทที่ร้องขอ
    let reportData;
    
    switch (reportType) {
      case 'project-summary':
        reportData = await generateProjectSummaryReport(filters);
        break;
      case 'financial':
        reportData = await generateFinancialReport(filters);
        break;
      case 'performance':
        reportData = await generatePerformanceReport(filters);
        break;
      default:
        return NextResponse.json(
          { error: 'ประเภทรายงานไม่ถูกต้อง' },
          { status: 400 }
        );
    }

    // บันทึกรายงานและส่งอีเมล (ถ้ามีการร้องขอ)
    if (emailRecipients && emailRecipients.length > 0) {
      // TODO: Implement email sending functionality
      console.log('Sending report to:', emailRecipients);
    }

    return NextResponse.json({
      success: true,
      reportId: `report_${Date.now()}`,
      data: reportData,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error creating custom report:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการสร้างรายงาน' },
      { status: 500 }
    );
  }
}

// Helper functions for different report types
async function generateProjectSummaryReport(filters: any) {
  const projects = await listAdminProjects();
  
  return {
    type: 'project-summary',
    summary: {
      total: projects?.length || 0,
      byStatus: projects?.reduce((acc, p) => {
        acc[p.status] = (acc[p.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {}
    },
    projects: projects || []
  };
}

async function generateFinancialReport(filters: any) {
  // Mock financial data - ในการใช้งานจริงจะดึงจากฐานข้อมูลการเงิน
  return {
    type: 'financial',
    summary: {
      totalRevenue: 8500000,
      totalExpenses: 6200000,
      profit: 2300000,
      profitMargin: 27.06
    },
    monthlyData: [
      { month: 'ม.ค.', revenue: 2500000, expenses: 1800000 },
      { month: 'ก.พ.', revenue: 2800000, expenses: 2100000 },
      { month: 'มี.ค.', revenue: 3200000, expenses: 2300000 }
    ]
  };
}

async function generatePerformanceReport(filters: any) {
  const [projects, tasks] = await Promise.all([
    listAdminProjects(),
    listTasks()
  ]);

  const completionRate = projects?.length 
    ? (projects.filter(p => p.status === 'เสร็จสิ้น').length / projects.length) * 100 
    : 0;

  return {
    type: 'performance',
    summary: {
      projectCompletionRate: completionRate,
      averageProgress: projects?.reduce((sum, p) => sum + p.progress, 0) / (projects?.length || 1) || 0,
      taskCompletionRate: tasks?.length 
        ? (tasks.filter(t => t.checked).length / tasks.length) * 100 
        : 0
    },
    details: {
      projects: projects || [],
      tasks: tasks || []
    }
  };
}
