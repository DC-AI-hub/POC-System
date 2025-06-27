import { NextRequest, NextResponse } from 'next/server';
import type { 
  IntegrationMonitor, 
  IntegrationAlert, 
  IntegrationStats,
  IntegrationApiResponse 
} from '@/lib/types/integration';

// 模拟监控数据
const mockMonitors: IntegrationMonitor[] = [
  {
    configId: 'config-1',
    status: 'healthy',
    lastSyncTime: new Date('2024-01-22T02:05:30'),
    nextSyncTime: new Date('2024-01-23T02:00:00'),
    avgResponseTime: 1250,
    successRate: 0.998,
    errorCount: 2,
    warningCount: 0,
    uptime: 99.8,
    metrics: {
      requestsPerHour: 24,
      dataTransferred: 2048576,
      errorRate: 0.002,
      avgProcessingTime: 5500
    },
    alerts: []
  },
  {
    configId: 'config-2',
    status: 'warning',
    lastSyncTime: new Date('2024-01-22T14:00:00'),
    nextSyncTime: new Date('2024-01-22T16:00:00'),
    avgResponseTime: 3200,
    successRate: 0.95,
    errorCount: 12,
    warningCount: 3,
    uptime: 95.2,
    metrics: {
      requestsPerHour: 24,
      dataTransferred: 5242880,
      errorRate: 0.05,
      avgProcessingTime: 8500
    },
    alerts: [
      {
        id: 'alert-1',
        configId: 'config-2',
        type: 'warning',
        title: '响应时间过长',
        message: 'SAP系统响应时间超过3秒，可能影响同步效率',
        severity: 'medium',
        timestamp: new Date('2024-01-22T14:30:00'),
        acknowledged: false,
        resolved: false
      }
    ]
  },
  {
    configId: 'config-3',
    status: 'error',
    lastSyncTime: new Date('2024-01-22T10:00:00'),
    nextSyncTime: new Date('2024-01-22T18:00:00'),
    avgResponseTime: 8500,
    successRate: 0.75,
    errorCount: 25,
    warningCount: 8,
    uptime: 85.5,
    metrics: {
      requestsPerHour: 12,
      dataTransferred: 1048576,
      errorRate: 0.25,
      avgProcessingTime: 12000
    },
    alerts: [
      {
        id: 'alert-2',
        configId: 'config-3',
        type: 'error',
        title: '同步失败率过高',
        message: '企业微信通知服务失败率达到25%，需要立即处理',
        severity: 'high',
        timestamp: new Date('2024-01-22T10:15:00'),
        acknowledged: true,
        acknowledgedBy: 'admin',
        acknowledgedAt: new Date('2024-01-22T10:20:00'),
        resolved: false
      },
      {
        id: 'alert-3',
        configId: 'config-3',
        type: 'error',
        title: '服务连接异常',
        message: '无法连接到企业微信API服务器',
        severity: 'critical',
        timestamp: new Date('2024-01-22T11:00:00'),
        acknowledged: false,
        resolved: false
      }
    ]
  }
];

const mockStats: IntegrationStats = {
  totalConfigs: 5,
  activeConfigs: 4,
  totalSyncs: 1256,
  successfulSyncs: 1198,
  failedSyncs: 58,
  avgSyncTime: 4.2,
  dataVolume: {
    totalRecords: 125000,
    recordsToday: 2500,
    recordsThisWeek: 17500,
    recordsThisMonth: 75000
  },
  systemHealth: {
    overallStatus: 'warning',
    activeAlerts: 3,
    systemUptime: 98.5
  }
};

// GET - 获取所有监控数据
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const configId = searchParams.get('configId');
    const includeAlerts = searchParams.get('includeAlerts') === 'true';

    let monitors = mockMonitors;

    // 按配置ID过滤
    if (configId) {
      monitors = monitors.filter(m => m.configId === configId);
    }

    // 是否包含告警信息
    if (!includeAlerts) {
      monitors = monitors.map(m => ({ ...m, alerts: [] }));
    }

    // 实时更新监控数据
    const updatedMonitors = monitors.map(monitor => ({
      ...monitor,
      // 模拟实时数据更新
      avgResponseTime: monitor.avgResponseTime + Math.floor(Math.random() * 200) - 100,
      successRate: Math.max(0.7, Math.min(1, monitor.successRate + (Math.random() - 0.5) * 0.02)),
      metrics: {
        ...monitor.metrics,
        requestsPerHour: monitor.metrics.requestsPerHour + Math.floor(Math.random() * 10) - 5,
        errorRate: Math.max(0, Math.min(0.1, monitor.metrics.errorRate + (Math.random() - 0.5) * 0.01))
      }
    }));

    const response: IntegrationApiResponse<IntegrationMonitor[]> = {
      success: true,
      data: updatedMonitors,
      message: '获取监控数据成功',
      timestamp: new Date(),
      requestId: `req-${Date.now()}`
    };

    return NextResponse.json(response);
  } catch (error) {
    const response: IntegrationApiResponse = {
      success: false,
      message: '获取监控数据失败',
      errors: [error instanceof Error ? error.message : '未知错误'],
      timestamp: new Date(),
      requestId: `req-${Date.now()}`
    };

    return NextResponse.json(response, { status: 500 });
  }
}

// POST - 手动刷新监控数据
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { configIds } = body;

    let configsToRefresh: string[];

    if (configIds && Array.isArray(configIds)) {
      configsToRefresh = configIds;
    } else {
      // 刷新所有配置
      configsToRefresh = mockMonitors.map(m => m.configId);
    }

    // 模拟刷新过程
    await new Promise(resolve => setTimeout(resolve, 1000));

    const refreshedMonitors = mockMonitors.filter(m => 
      configsToRefresh.includes(m.configId)
    ).map(monitor => ({
      ...monitor,
      // 更新最后刷新时间和一些指标
      lastSyncTime: new Date(),
      avgResponseTime: Math.floor(Math.random() * 2000) + 500,
      successRate: Math.random() * 0.3 + 0.7, // 70%-100%
      uptime: Math.random() * 10 + 90 // 90%-100%
    }));

    const response: IntegrationApiResponse<IntegrationMonitor[]> = {
      success: true,
      data: refreshedMonitors,
      message: `成功刷新 ${refreshedMonitors.length} 个配置的监控数据`,
      timestamp: new Date(),
      requestId: `req-${Date.now()}`
    };

    return NextResponse.json(response);
  } catch (error) {
    const response: IntegrationApiResponse = {
      success: false,
      message: '刷新监控数据失败',
      errors: [error instanceof Error ? error.message : '未知错误'],
      timestamp: new Date(),
      requestId: `req-${Date.now()}`
    };

    return NextResponse.json(response, { status: 500 });
  }
} 