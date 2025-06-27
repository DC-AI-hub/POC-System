import { NextRequest, NextResponse } from 'next/server';
import type { IntegrationConfig, IntegrationApiResponse } from '@/lib/types/integration';

// 模拟数据存储
let integrationConfigs: IntegrationConfig[] = [
  {
    id: 'config-1',
    name: 'LDAP用户认证',
    description: '企业域用户认证集成',
    type: 'auth',
    provider: 'ldap',
    endpoint: 'ldap://dc.company.com:389',
    authType: 'basic',
    credentials: {
      username: 'admin',
      password: 'encrypted_password'
    },
    mapping: [
      { sourceField: 'cn', targetField: 'name', dataType: 'string', required: true },
      { sourceField: 'mail', targetField: 'email', dataType: 'string', required: true },
      { sourceField: 'department', targetField: 'department', dataType: 'string', required: false }
    ],
    syncSchedule: {
      enabled: true,
      frequency: 'daily',
      time: '02:00',
      timezone: 'Asia/Shanghai'
    },
    retryPolicy: {
      maxRetries: 3,
      retryDelay: 5000,
      backoffMultiplier: 2
    },
    isActive: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
    createdBy: 'admin'
  }
];

// GET - 获取所有集成配置
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const active = searchParams.get('active');
    
    let filteredConfigs = integrationConfigs;
    
    // 按类型过滤
    if (type) {
      filteredConfigs = filteredConfigs.filter(config => config.type === type);
    }
    
    // 按状态过滤
    if (active !== null) {
      const isActive = active === 'true';
      filteredConfigs = filteredConfigs.filter(config => config.isActive === isActive);
    }
    
    // 隐藏敏感信息
    const safeConfigs = filteredConfigs.map(config => ({
      ...config,
      credentials: Object.keys(config.credentials).reduce((acc, key) => {
        acc[key] = '******';
        return acc;
      }, {} as Record<string, string>)
    }));

    const response: IntegrationApiResponse<IntegrationConfig[]> = {
      success: true,
      data: safeConfigs,
      message: '获取集成配置成功',
      timestamp: new Date(),
      requestId: `req-${Date.now()}`
    };

    return NextResponse.json(response);
  } catch (error) {
    const response: IntegrationApiResponse = {
      success: false,
      message: '获取集成配置失败',
      errors: [error instanceof Error ? error.message : '未知错误'],
      timestamp: new Date(),
      requestId: `req-${Date.now()}`
    };

    return NextResponse.json(response, { status: 500 });
  }
}

// POST - 创建新的集成配置
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 验证必需字段
    const requiredFields = ['name', 'type', 'provider', 'endpoint', 'authType'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      const response: IntegrationApiResponse = {
        success: false,
        message: '缺少必需字段',
        errors: [`缺少字段: ${missingFields.join(', ')}`],
        timestamp: new Date(),
        requestId: `req-${Date.now()}`
      };
      
      return NextResponse.json(response, { status: 400 });
    }

    const newConfig: IntegrationConfig = {
      id: `config-${Date.now()}`,
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'current-user' // 实际应用中应从认证信息获取
    };

    integrationConfigs.push(newConfig);

    const response: IntegrationApiResponse<IntegrationConfig> = {
      success: true,
      data: newConfig,
      message: '创建集成配置成功',
      timestamp: new Date(),
      requestId: `req-${Date.now()}`
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    const response: IntegrationApiResponse = {
      success: false,
      message: '创建集成配置失败',
      errors: [error instanceof Error ? error.message : '未知错误'],
      timestamp: new Date(),
      requestId: `req-${Date.now()}`
    };

    return NextResponse.json(response, { status: 500 });
  }
}

// PUT - 批量更新集成配置
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { configs } = body;

    if (!Array.isArray(configs)) {
      const response: IntegrationApiResponse = {
        success: false,
        message: '无效的请求格式',
        errors: ['configs必须是数组'],
        timestamp: new Date(),
        requestId: `req-${Date.now()}`
      };
      
      return NextResponse.json(response, { status: 400 });
    }

    const updatedConfigs: IntegrationConfig[] = [];
    const errors: string[] = [];

    for (const configUpdate of configs) {
      const existingIndex = integrationConfigs.findIndex(c => c.id === configUpdate.id);
      
      if (existingIndex === -1) {
        errors.push(`配置 ${configUpdate.id} 不存在`);
        continue;
      }

      const updatedConfig = {
        ...integrationConfigs[existingIndex],
        ...configUpdate,
        updatedAt: new Date()
      };

      integrationConfigs[existingIndex] = updatedConfig;
      updatedConfigs.push(updatedConfig);
    }

    const response: IntegrationApiResponse<IntegrationConfig[]> = {
      success: errors.length === 0,
      data: updatedConfigs,
      message: errors.length === 0 ? '批量更新成功' : '部分更新成功',
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date(),
      requestId: `req-${Date.now()}`
    };

    return NextResponse.json(response);
  } catch (error) {
    const response: IntegrationApiResponse = {
      success: false,
      message: '批量更新失败',
      errors: [error instanceof Error ? error.message : '未知错误'],
      timestamp: new Date(),
      requestId: `req-${Date.now()}`
    };

    return NextResponse.json(response, { status: 500 });
  }
}

// DELETE - 批量删除集成配置
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get('ids');
    
    if (!idsParam) {
      const response: IntegrationApiResponse = {
        success: false,
        message: '缺少删除ID列表',
        errors: ['ids参数是必需的'],
        timestamp: new Date(),
        requestId: `req-${Date.now()}`
      };
      
      return NextResponse.json(response, { status: 400 });
    }

    const ids = idsParam.split(',');
    const deletedIds: string[] = [];
    const errors: string[] = [];

    for (const id of ids) {
      const index = integrationConfigs.findIndex(c => c.id === id);
      
      if (index === -1) {
        errors.push(`配置 ${id} 不存在`);
        continue;
      }

      // 检查是否有正在运行的同步任务
      // 实际应用中应该检查同步状态
      const config = integrationConfigs[index];
      if (config.isActive) {
        errors.push(`配置 ${id} 正在使用中，无法删除`);
        continue;
      }

      integrationConfigs.splice(index, 1);
      deletedIds.push(id);
    }

    const response: IntegrationApiResponse<string[]> = {
      success: errors.length === 0,
      data: deletedIds,
      message: errors.length === 0 ? '批量删除成功' : '部分删除成功',
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date(),
      requestId: `req-${Date.now()}`
    };

    return NextResponse.json(response);
  } catch (error) {
    const response: IntegrationApiResponse = {
      success: false,
      message: '批量删除失败',
      errors: [error instanceof Error ? error.message : '未知错误'],
      timestamp: new Date(),
      requestId: `req-${Date.now()}`
    };

    return NextResponse.json(response, { status: 500 });
  }
} 