import { NextRequest, NextResponse } from 'next/server';
import type { ConnectionTestResult, IntegrationApiResponse } from '@/lib/types/integration';

// 模拟集成配置数据
const mockIntegrationConfigs = [
  {
    id: 'config-1',
    name: 'LDAP用户认证',
    type: 'auth',
    provider: 'ldap',
    endpoint: 'ldap://dc.company.com:389',
    authType: 'basic'
  },
  {
    id: 'config-2',
    name: 'SAP财务系统',
    type: 'finance',
    provider: 'sap',
    endpoint: 'https://sap.company.com/api/v1',
    authType: 'oauth2'
  }
];

// 模拟不同类型的连接测试
async function performConnectionTest(configId: string): Promise<ConnectionTestResult> {
  const config = mockIntegrationConfigs.find(c => c.id === configId);
  
  if (!config) {
    throw new Error('配置不存在');
  }

  // 模拟网络延迟
  const delay = Math.floor(Math.random() * 2000) + 500;
  await new Promise(resolve => setTimeout(resolve, delay));

  // 模拟不同的测试结果
  const successRate = 0.8; // 80%的成功率
  const isSuccess = Math.random() < successRate;

  const baseResult: Omit<ConnectionTestResult, 'message'> = {
    success: isSuccess,
    responseTime: delay,
    timestamp: new Date(),
    details: {
      configId,
      configName: config.name,
      provider: config.provider,
      endpoint: config.endpoint,
      authType: config.authType
    }
  };

  if (isSuccess) {
    // 成功的测试结果
    switch (config.type) {
      case 'auth':
        return {
          ...baseResult,
          statusCode: 200,
          message: 'LDAP连接测试成功，认证服务器响应正常',
          details: {
            ...baseResult.details,
            serverInfo: 'Microsoft Active Directory',
            supportedAuthMethods: ['SIMPLE', 'DIGEST-MD5'],
            baseDN: 'DC=company,DC=com',
            userCount: 1250
          }
        };

      case 'finance':
        return {
          ...baseResult,
          statusCode: 200,
          message: 'SAP系统连接测试成功，API服务可用',
          details: {
            ...baseResult.details,
            systemVersion: 'SAP ERP 6.0',
            apiVersion: 'v1.2',
            availableModules: ['FI', 'CO', 'MM'],
            lastDataUpdate: new Date(Date.now() - 3600000) // 1小时前
          }
        };

      case 'hr':
        return {
          ...baseResult,
          statusCode: 200,
          message: 'HR系统连接测试成功，员工数据可访问',
          details: {
            ...baseResult.details,
            systemType: 'Workday',
            employeeCount: 2500,
            lastSync: new Date(Date.now() - 86400000), // 1天前
            dataQuality: 'Good'
          }
        };

      case 'notification':
        return {
          ...baseResult,
          statusCode: 200,
          message: '通知服务连接测试成功，消息推送正常',
          details: {
            ...baseResult.details,
            serviceType: '企业微信',
            rateLimits: {
              messagesPerMinute: 100,
              messagesPerDay: 10000
            },
            lastMessageSent: new Date(Date.now() - 1800000) // 30分钟前
          }
        };

      case 'storage':
        return {
          ...baseResult,
          statusCode: 200,
          message: '存储服务连接测试成功，文件上传下载正常',
          details: {
            ...baseResult.details,
            storageType: '阿里云OSS',
            totalSpace: '1TB',
            usedSpace: '256GB',
            availableSpace: '768GB',
            lastBackup: new Date(Date.now() - 86400000)
          }
        };

      default:
        return {
          ...baseResult,
          statusCode: 200,
          message: '连接测试成功',
          details: baseResult.details
        };
    }
  } else {
    // 失败的测试结果
    const errorTypes = [
      {
        statusCode: 401,
        message: '认证失败：用户名或密码错误',
        details: { errorCode: 'AUTH_FAILED', suggestion: '请检查认证凭据' }
      },
      {
        statusCode: 403,
        message: '权限不足：无法访问目标资源',
        details: { errorCode: 'ACCESS_DENIED', suggestion: '请检查用户权限配置' }
      },
      {
        statusCode: 404,
        message: '服务不可用：无法找到目标服务',
        details: { errorCode: 'SERVICE_NOT_FOUND', suggestion: '请检查服务地址配置' }
      },
      {
        statusCode: 500,
        message: '服务器内部错误：目标系统异常',
        details: { errorCode: 'INTERNAL_ERROR', suggestion: '请联系目标系统管理员' }
      },
      {
        statusCode: 0,
        message: '网络连接超时：无法连接到目标服务器',
        details: { errorCode: 'TIMEOUT', suggestion: '请检查网络连接和防火墙设置' }
      }
    ];

    const randomError = errorTypes[Math.floor(Math.random() * errorTypes.length)];
    
    return {
      ...baseResult,
      success: false,
      statusCode: randomError.statusCode,
      message: randomError.message,
      details: {
        ...baseResult.details,
        ...randomError.details,
        troubleshooting: [
          '检查网络连接是否正常',
          '验证服务器地址和端口',
          '确认认证信息正确',
          '检查防火墙和安全组设置'
        ]
      }
    };
  }
}

// POST - 执行连接测试
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // 执行连接测试
    const testResult = await performConnectionTest(id);

    const response: IntegrationApiResponse<ConnectionTestResult> = {
      success: true,
      data: testResult,
      message: '连接测试完成',
      timestamp: new Date(),
      requestId: `req-${Date.now()}`
    };

    return NextResponse.json(response);
  } catch (error) {
    const response: IntegrationApiResponse = {
      success: false,
      message: '连接测试失败',
      errors: [error instanceof Error ? error.message : '未知错误'],
      timestamp: new Date(),
      requestId: `req-${Date.now()}`
    };

    return NextResponse.json(response, { status: 500 });
  }
}

// GET - 获取测试历史（可选功能）
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    // 模拟测试历史数据
    const testHistory: ConnectionTestResult[] = Array.from({ length: limit }, (_, index) => ({
      success: Math.random() > 0.3,
      responseTime: Math.floor(Math.random() * 3000) + 200,
      statusCode: Math.random() > 0.3 ? 200 : [401, 403, 500, 0][Math.floor(Math.random() * 4)],
      message: Math.random() > 0.3 ? '连接测试成功' : '连接测试失败',
      timestamp: new Date(Date.now() - index * 3600000), // 每小时一个测试记录
      details: {
        configId: id,
        testType: 'scheduled'
      }
    }));

    const response: IntegrationApiResponse<ConnectionTestResult[]> = {
      success: true,
      data: testHistory,
      message: '获取测试历史成功',
      timestamp: new Date(),
      requestId: `req-${Date.now()}`
    };

    return NextResponse.json(response);
  } catch (error) {
    const response: IntegrationApiResponse = {
      success: false,
      message: '获取测试历史失败',
      errors: [error instanceof Error ? error.message : '未知错误'],
      timestamp: new Date(),
      requestId: `req-${Date.now()}`
    };

    return NextResponse.json(response, { status: 500 });
  }
} 