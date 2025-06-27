import { NextRequest, NextResponse } from 'next/server';
import type { 
  SyncResult, 
  IntegrationApiResponse, 
  SyncStatus,
  SyncError,
  PaginatedResponse 
} from '@/lib/types/integration';

// 模拟同步结果存储
let syncResults: SyncResult[] = [
  {
    id: 'sync-1',
    configId: 'config-1',
    status: 'completed',
    startTime: new Date('2024-01-22T02:00:00'),
    endTime: new Date('2024-01-22T02:05:30'),
    recordsProcessed: 1250,
    recordsSucceeded: 1248,
    recordsFailed: 2,
    errors: [
      {
        recordId: 'user-001',
        field: 'email',
        errorCode: 'INVALID_EMAIL',
        errorMessage: '邮箱格式不正确',
        originalValue: 'invalid-email',
        timestamp: new Date('2024-01-22T02:03:15')
      }
    ],
    summary: {
      totalRecords: 1250,
      newRecords: 15,
      updatedRecords: 1233,
      deletedRecords: 0,
      skippedRecords: 2
    },
    metadata: {
      dataSource: 'LDAP',
      syncType: 'incremental'
    }
  },
  {
    id: 'sync-2',
    configId: 'config-2',
    status: 'running',
    startTime: new Date('2024-01-22T15:00:00'),
    recordsProcessed: 856,
    recordsSucceeded: 856,
    recordsFailed: 0,
    errors: [],
    summary: {
      totalRecords: 1200,
      newRecords: 5,
      updatedRecords: 851,
      deletedRecords: 0,
      skippedRecords: 0
    },
    metadata: {
      dataSource: 'SAP',
      syncType: 'incremental'
    }
  }
];

// 模拟同步过程
async function performSync(configId: string, syncType: 'full' | 'incremental' = 'incremental'): Promise<SyncResult> {
  const syncResult: SyncResult = {
    id: `sync-${Date.now()}`,
    configId,
    status: 'running',
    startTime: new Date(),
    recordsProcessed: 0,
    recordsSucceeded: 0,
    recordsFailed: 0,
    errors: [],
    summary: {
      totalRecords: 0,
      newRecords: 0,
      updatedRecords: 0,
      deletedRecords: 0,
      skippedRecords: 0
    },
    metadata: {
      syncType,
      initiatedBy: 'api'
    }
  };

  // 添加到同步结果列表
  syncResults.unshift(syncResult);

  // 模拟异步同步过程
  setTimeout(() => {
    const totalRecords = Math.floor(Math.random() * 1000) + 100;
    const failedRecords = Math.floor(Math.random() * 10);
    const succeededRecords = totalRecords - failedRecords;
    
    const completedResult: SyncResult = {
      ...syncResult,
      status: Math.random() > 0.1 ? 'completed' : 'failed', // 90%成功率
      endTime: new Date(),
      recordsProcessed: totalRecords,
      recordsSucceeded: succeededRecords,
      recordsFailed: failedRecords,
      errors: Array.from({ length: failedRecords }, (_, index) => ({
        recordId: `record-${index + 1}`,
        field: ['email', 'phone', 'department'][Math.floor(Math.random() * 3)],
        errorCode: ['INVALID_FORMAT', 'MISSING_REQUIRED', 'DUPLICATE_KEY'][Math.floor(Math.random() * 3)],
        errorMessage: '数据验证失败',
        timestamp: new Date()
      })),
      summary: {
        totalRecords,
        newRecords: Math.floor(totalRecords * 0.1),
        updatedRecords: Math.floor(totalRecords * 0.8),
        deletedRecords: Math.floor(totalRecords * 0.05),
        skippedRecords: Math.floor(totalRecords * 0.05)
      }
    };

    // 更新同步结果
    const index = syncResults.findIndex(sr => sr.id === syncResult.id);
    if (index !== -1) {
      syncResults[index] = completedResult;
    }
  }, Math.floor(Math.random() * 10000) + 5000); // 5-15秒后完成

  return syncResult;
}

// POST - 启动新的数据同步
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { configId, syncType = 'incremental' } = body;

    if (!configId) {
      const response: IntegrationApiResponse = {
        success: false,
        message: '缺少必需参数',
        errors: ['configId是必需的'],
        timestamp: new Date(),
        requestId: `req-${Date.now()}`
      };

      return NextResponse.json(response, { status: 400 });
    }

    // 检查是否已有正在运行的同步任务
    const runningSyncs = syncResults.filter(sr => 
      sr.configId === configId && sr.status === 'running'
    );

    if (runningSyncs.length > 0) {
      const response: IntegrationApiResponse = {
        success: false,
        message: '已有正在运行的同步任务',
        errors: [`配置 ${configId} 已有同步任务正在执行`],
        timestamp: new Date(),
        requestId: `req-${Date.now()}`
      };

      return NextResponse.json(response, { status: 409 });
    }

    // 启动同步
    const syncResult = await performSync(configId, syncType);

    const response: IntegrationApiResponse<SyncResult> = {
      success: true,
      data: syncResult,
      message: '同步任务已启动',
      timestamp: new Date(),
      requestId: `req-${Date.now()}`
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    const response: IntegrationApiResponse = {
      success: false,
      message: '启动同步失败',
      errors: [error instanceof Error ? error.message : '未知错误'],
      timestamp: new Date(),
      requestId: `req-${Date.now()}`
    };

    return NextResponse.json(response, { status: 500 });
  }
}

// GET - 获取同步历史
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const configId = searchParams.get('configId');
    const status = searchParams.get('status') as SyncStatus | null;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    let filteredResults = syncResults;

    // 按配置ID过滤
    if (configId) {
      filteredResults = filteredResults.filter(sr => sr.configId === configId);
    }

    // 按状态过滤
    if (status) {
      filteredResults = filteredResults.filter(sr => sr.status === status);
    }

    // 排序（最新的在前）
    filteredResults.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());

    // 分页
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedResults = filteredResults.slice(startIndex, endIndex);

    const paginatedResponse: PaginatedResponse<SyncResult> = {
      data: paginatedResults,
      pagination: {
        page,
        pageSize,
        total: filteredResults.length,
        totalPages: Math.ceil(filteredResults.length / pageSize),
        hasNext: endIndex < filteredResults.length,
        hasPrev: page > 1
      }
    };

    const response: IntegrationApiResponse<PaginatedResponse<SyncResult>> = {
      success: true,
      data: paginatedResponse,
      message: '获取同步历史成功',
      timestamp: new Date(),
      requestId: `req-${Date.now()}`
    };

    return NextResponse.json(response);
  } catch (error) {
    const response: IntegrationApiResponse = {
      success: false,
      message: '获取同步历史失败',
      errors: [error instanceof Error ? error.message : '未知错误'],
      timestamp: new Date(),
      requestId: `req-${Date.now()}`
    };

    return NextResponse.json(response, { status: 500 });
  }
}

// DELETE - 取消正在运行的同步任务
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const syncId = searchParams.get('syncId');

    if (!syncId) {
      const response: IntegrationApiResponse = {
        success: false,
        message: '缺少同步任务ID',
        errors: ['syncId参数是必需的'],
        timestamp: new Date(),
        requestId: `req-${Date.now()}`
      };

      return NextResponse.json(response, { status: 400 });
    }

    const syncIndex = syncResults.findIndex(sr => sr.id === syncId);

    if (syncIndex === -1) {
      const response: IntegrationApiResponse = {
        success: false,
        message: '同步任务不存在',
        errors: [`ID为 ${syncId} 的同步任务不存在`],
        timestamp: new Date(),
        requestId: `req-${Date.now()}`
      };

      return NextResponse.json(response, { status: 404 });
    }

    const syncResult = syncResults[syncIndex];

    if (syncResult.status !== 'running') {
      const response: IntegrationApiResponse = {
        success: false,
        message: '只能取消正在运行的同步任务',
        errors: [`同步任务状态为 ${syncResult.status}，无法取消`],
        timestamp: new Date(),
        requestId: `req-${Date.now()}`
      };

      return NextResponse.json(response, { status: 400 });
    }

    // 取消同步任务
    const cancelledResult: SyncResult = {
      ...syncResult,
      status: 'cancelled',
      endTime: new Date()
    };

    syncResults[syncIndex] = cancelledResult;

    const response: IntegrationApiResponse<SyncResult> = {
      success: true,
      data: cancelledResult,
      message: '同步任务已取消',
      timestamp: new Date(),
      requestId: `req-${Date.now()}`
    };

    return NextResponse.json(response);
  } catch (error) {
    const response: IntegrationApiResponse = {
      success: false,
      message: '取消同步任务失败',
      errors: [error instanceof Error ? error.message : '未知错误'],
      timestamp: new Date(),
      requestId: `req-${Date.now()}`
    };

    return NextResponse.json(response, { status: 500 });
  }
} 