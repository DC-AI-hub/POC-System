import { NextRequest, NextResponse } from 'next/server';
import type { IntegrationConfig, IntegrationApiResponse } from '@/lib/types/integration';

// 这里应该从数据库或其他持久化存储获取数据
// 为了演示，我们使用一个模拟的数据存储
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
      { sourceField: 'mail', targetField: 'email', dataType: 'string', required: true }
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

// GET - 获取单个集成配置
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const config = integrationConfigs.find(c => c.id === id);

    if (!config) {
      const response: IntegrationApiResponse = {
        success: false,
        message: '集成配置不存在',
        errors: [`ID为 ${id} 的配置不存在`],
        timestamp: new Date(),
        requestId: `req-${Date.now()}`
      };

      return NextResponse.json(response, { status: 404 });
    }

    // 隐藏敏感信息
    const safeConfig = {
      ...config,
      credentials: Object.keys(config.credentials).reduce((acc, key) => {
        acc[key] = '******';
        return acc;
      }, {} as Record<string, string>)
    };

    const response: IntegrationApiResponse<IntegrationConfig> = {
      success: true,
      data: safeConfig,
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

// PUT - 更新单个集成配置
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const configIndex = integrationConfigs.findIndex(c => c.id === id);

    if (configIndex === -1) {
      const response: IntegrationApiResponse = {
        success: false,
        message: '集成配置不存在',
        errors: [`ID为 ${id} 的配置不存在`],
        timestamp: new Date(),
        requestId: `req-${Date.now()}`
      };

      return NextResponse.json(response, { status: 404 });
    }

    // 更新配置
    const updatedConfig: IntegrationConfig = {
      ...integrationConfigs[configIndex],
      ...body,
      id, // 确保ID不被覆盖
      updatedAt: new Date()
    };

    integrationConfigs[configIndex] = updatedConfig;

    const response: IntegrationApiResponse<IntegrationConfig> = {
      success: true,
      data: updatedConfig,
      message: '更新集成配置成功',
      timestamp: new Date(),
      requestId: `req-${Date.now()}`
    };

    return NextResponse.json(response);
  } catch (error) {
    const response: IntegrationApiResponse = {
      success: false,
      message: '更新集成配置失败',
      errors: [error instanceof Error ? error.message : '未知错误'],
      timestamp: new Date(),
      requestId: `req-${Date.now()}`
    };

    return NextResponse.json(response, { status: 500 });
  }
}

// DELETE - 删除单个集成配置
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const configIndex = integrationConfigs.findIndex(c => c.id === id);

    if (configIndex === -1) {
      const response: IntegrationApiResponse = {
        success: false,
        message: '集成配置不存在',
        errors: [`ID为 ${id} 的配置不存在`],
        timestamp: new Date(),
        requestId: `req-${Date.now()}`
      };

      return NextResponse.json(response, { status: 404 });
    }

    // 检查配置是否正在使用
    const config = integrationConfigs[configIndex];
    if (config.isActive) {
      const response: IntegrationApiResponse = {
        success: false,
        message: '无法删除活跃的集成配置',
        errors: ['请先停用配置，然后再删除'],
        timestamp: new Date(),
        requestId: `req-${Date.now()}`
      };

      return NextResponse.json(response, { status: 400 });
    }

    // 删除配置
    const deletedConfig = integrationConfigs.splice(configIndex, 1)[0];

    const response: IntegrationApiResponse<IntegrationConfig> = {
      success: true,
      data: deletedConfig,
      message: '删除集成配置成功',
      timestamp: new Date(),
      requestId: `req-${Date.now()}`
    };

    return NextResponse.json(response);
  } catch (error) {
    const response: IntegrationApiResponse = {
      success: false,
      message: '删除集成配置失败',
      errors: [error instanceof Error ? error.message : '未知错误'],
      timestamp: new Date(),
      requestId: `req-${Date.now()}`
    };

    return NextResponse.json(response, { status: 500 });
  }
} 