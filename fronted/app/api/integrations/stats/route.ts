import { NextRequest, NextResponse } from 'next/server';
import type { IntegrationStats, IntegrationApiResponse } from '@/lib/types/integration';

// 模拟统计数据生成
function generateStats(): IntegrationStats {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thisWeekStart = new Date(today.getTime() - (today.getDay() * 24 * 60 * 60 * 1000));
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // 基础数据
  const totalConfigs = 8;
  const activeConfigs = 6;
  const totalSyncs = Math.floor(Math.random() * 2000) + 1000;
  const successRate = 0.85 + Math.random() * 0.1; // 85%-95%
  const successfulSyncs = Math.floor(totalSyncs * successRate);
  const failedSyncs = totalSyncs - successfulSyncs;

  // 数据量统计
  const totalRecords = Math.floor(Math.random() * 100000) + 50000;
  const recordsToday = Math.floor(Math.random() * 5000) + 1000;
  const recordsThisWeek = Math.floor(Math.random() * 20000) + 10000;
  const recordsThisMonth = Math.floor(Math.random() * 80000) + 40000;

  // 系统健康状态
  const activeAlerts = Math.floor(Math.random() * 5);
  const systemUptime = 95 + Math.random() * 5; // 95%-100%
  
  let overallStatus: 'healthy' | 'warning' | 'error';
  if (activeAlerts === 0 && systemUptime > 99) {
    overallStatus = 'healthy';
  } else if (activeAlerts <= 2 && systemUptime > 95) {
    overallStatus = 'warning';
  } else {
    overallStatus = 'error';
  }

  return {
    totalConfigs,
    activeConfigs,
    totalSyncs,
    successfulSyncs,
    failedSyncs,
    avgSyncTime: Math.random() * 5 + 2, // 2-7分钟
    dataVolume: {
      totalRecords,
      recordsToday,
      recordsThisWeek,
      recordsThisMonth
    },
    systemHealth: {
      overallStatus,
      activeAlerts,
      systemUptime: Math.round(systemUptime * 10) / 10
    }
  };
}

// 模拟详细统计数据
function generateDetailedStats() {
  return {
    configsByType: {
      auth: { total: 2, active: 2, successRate: 0.98 },
      finance: { total: 2, active: 1, successRate: 0.85 },
      hr: { total: 2, active: 2, successRate: 0.92 },
      notification: { total: 1, active: 1, successRate: 0.88 },
      storage: { total: 1, active: 0, successRate: 0.95 }
    },
    syncFrequency: {
      hourly: 2,
      daily: 3,
      weekly: 1,
      monthly: 0,
      manual: 2
    },
    errorDistribution: {
      'AUTH_FAILED': 15,
      'NETWORK_TIMEOUT': 12,
      'DATA_VALIDATION': 8,
      'RATE_LIMIT': 5,
      'SERVER_ERROR': 3,
      'OTHER': 7
    },
    performanceMetrics: {
      avgResponseTime: Math.floor(Math.random() * 2000) + 500,
      p95ResponseTime: Math.floor(Math.random() * 5000) + 2000,
      p99ResponseTime: Math.floor(Math.random() * 8000) + 5000,
      throughputPerSecond: Math.floor(Math.random() * 100) + 50
    },
    dataQuality: {
      validRecords: 0.95,
      duplicateRecords: 0.02,
      incompleteRecords: 0.02,
      invalidRecords: 0.01
    }
  };
}

// GET - 获取集成统计数据
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const detailed = searchParams.get('detailed') === 'true';
    const refresh = searchParams.get('refresh') === 'true';

    // 生成基础统计数据
    let stats = generateStats();

    // 如果需要详细数据
    if (detailed) {
      const detailedStats = generateDetailedStats();
      stats = {
        ...stats,
        ...detailedStats
      } as any;
    }

    // 如果是刷新请求，模拟延迟
    if (refresh) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    const response: IntegrationApiResponse<IntegrationStats> = {
      success: true,
      data: stats,
      message: '获取统计数据成功',
      timestamp: new Date(),
      requestId: `req-${Date.now()}`
    };

    return NextResponse.json(response);
  } catch (error) {
    const response: IntegrationApiResponse = {
      success: false,
      message: '获取统计数据失败',
      errors: [error instanceof Error ? error.message : '未知错误'],
      timestamp: new Date(),
      requestId: `req-${Date.now()}`
    };

    return NextResponse.json(response, { status: 500 });
  }
}

// POST - 重新计算统计数据
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dateRange, configIds } = body;

    // 模拟重新计算过程
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 生成新的统计数据
    const stats = generateStats();
    const detailedStats = generateDetailedStats();

    const recalculatedStats = {
      ...stats,
      ...detailedStats,
      recalculatedAt: new Date(),
      dateRange: dateRange || {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30天前
        end: new Date()
      },
      configIds: configIds || ['all']
    };

    const response: IntegrationApiResponse<any> = {
      success: true,
      data: recalculatedStats,
      message: '统计数据重新计算完成',
      timestamp: new Date(),
      requestId: `req-${Date.now()}`
    };

    return NextResponse.json(response);
  } catch (error) {
    const response: IntegrationApiResponse = {
      success: false,
      message: '重新计算统计数据失败',
      errors: [error instanceof Error ? error.message : '未知错误'],
      timestamp: new Date(),
      requestId: `req-${Date.now()}`
    };

    return NextResponse.json(response, { status: 500 });
  }
} 