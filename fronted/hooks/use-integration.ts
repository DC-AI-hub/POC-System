'use client';

import { useState, useEffect, useCallback } from 'react';
import type {
  IntegrationConfig,
  SyncResult,
  ConnectionTestResult,
  IntegrationMonitor,
  IntegrationAlert,
  IntegrationStats,
  IntegrationType,
  AuthType,
  SyncStatus,
  IntegrationApiResponse,
  PaginatedResponse
} from '@/lib/types/integration';

// Hook返回类型
interface UseIntegrationReturn {
  // 配置管理
  configs: IntegrationConfig[];
  loading: boolean;
  error: string | null;
  
  // 配置操作
  createConfig: (config: Omit<IntegrationConfig, 'id' | 'createdAt' | 'updatedAt'>) => Promise<IntegrationConfig>;
  updateConfig: (id: string, updates: Partial<IntegrationConfig>) => Promise<IntegrationConfig>;
  deleteConfig: (id: string) => Promise<void>;
  toggleConfig: (id: string) => Promise<void>;
  
  // 连接测试
  testConnection: (configId: string) => Promise<ConnectionTestResult>;
  
  // 同步管理
  syncResults: SyncResult[];
  startSync: (configId: string, type?: 'full' | 'incremental') => Promise<SyncResult>;
  stopSync: (syncId: string) => Promise<void>;
  getSyncHistory: (configId: string, page?: number, pageSize?: number) => Promise<PaginatedResponse<SyncResult>>;
  
  // 监控数据
  monitors: IntegrationMonitor[];
  alerts: IntegrationAlert[];
  stats: IntegrationStats | null;
  
  // 监控操作
  refreshMonitors: () => Promise<void>;
  acknowledgeAlert: (alertId: string) => Promise<void>;
  resolveAlert: (alertId: string) => Promise<void>;
  
  // 工具函数
  getConfigsByType: (type: IntegrationType) => IntegrationConfig[];
  getActiveConfigs: () => IntegrationConfig[];
  exportConfigs: () => Promise<Blob>;
  importConfigs: (file: File) => Promise<void>;
}

export function useIntegration(): UseIntegrationReturn {
  const [configs, setConfigs] = useState<IntegrationConfig[]>([]);
  const [syncResults, setSyncResults] = useState<SyncResult[]>([]);
  const [monitors, setMonitors] = useState<IntegrationMonitor[]>([]);
  const [alerts, setAlerts] = useState<IntegrationAlert[]>([]);
  const [stats, setStats] = useState<IntegrationStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 模拟数据
  const mockConfigs: IntegrationConfig[] = [
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
        password: '******'
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
    },
    {
      id: 'config-2',
      name: 'SAP财务系统',
      description: 'SAP ERP财务数据同步',
      type: 'finance',
      provider: 'sap',
      endpoint: 'https://sap.company.com/api/v1',
      authType: 'oauth2',
      credentials: {
        clientId: 'sap_client_id',
        clientSecret: '******',
        tokenUrl: 'https://sap.company.com/oauth/token'
      },
      mapping: [
        { sourceField: 'SAKNR', targetField: 'accountCode', dataType: 'string', required: true },
        { sourceField: 'TXT50', targetField: 'accountName', dataType: 'string', required: true },
        { sourceField: 'KTOKS', targetField: 'accountType', dataType: 'string', required: true }
      ],
      syncSchedule: {
        enabled: true,
        frequency: 'hourly',
        timezone: 'Asia/Shanghai'
      },
      retryPolicy: {
        maxRetries: 5,
        retryDelay: 3000,
        backoffMultiplier: 1.5
      },
      isActive: true,
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-22'),
      createdBy: 'admin'
    },
    {
      id: 'config-3',
      name: '企业微信通知',
      description: '企业微信消息推送服务',
      type: 'notification',
      provider: 'wechat_work',
      endpoint: 'https://qyapi.weixin.qq.com/cgi-bin',
      authType: 'api_key',
      credentials: {
        corpId: 'corp_id',
        agentId: 'agent_id',
        secret: '******'
      },
      mapping: [
        { sourceField: 'userid', targetField: 'userId', dataType: 'string', required: true },
        { sourceField: 'message', targetField: 'content', dataType: 'string', required: true }
      ],
      syncSchedule: {
        enabled: false,
        frequency: 'manual',
        timezone: 'Asia/Shanghai'
      },
      retryPolicy: {
        maxRetries: 3,
        retryDelay: 2000,
        backoffMultiplier: 2
      },
      isActive: true,
      createdAt: new Date('2024-01-12'),
      updatedAt: new Date('2024-01-18'),
      createdBy: 'admin'
    }
  ];

  const mockSyncResults: SyncResult[] = [
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
    }
  ];

  const mockStats: IntegrationStats = {
    totalConfigs: 3,
    activeConfigs: 3,
    totalSyncs: 156,
    successfulSyncs: 148,
    failedSyncs: 8,
    avgSyncTime: 4.2,
    dataVolume: {
      totalRecords: 125000,
      recordsToday: 2500,
      recordsThisWeek: 17500,
      recordsThisMonth: 75000
    },
    systemHealth: {
      overallStatus: 'healthy',
      activeAlerts: 1,
      systemUptime: 99.2
    }
  };

  // 初始化数据
  useEffect(() => {
    setConfigs(mockConfigs);
    setSyncResults(mockSyncResults);
    setMonitors(mockMonitors);
    setAlerts(mockMonitors.flatMap(m => m.alerts));
    setStats(mockStats);
  }, []);

  // 创建配置
  const createConfig = useCallback(async (configData: Omit<IntegrationConfig, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true);
    setError(null);
    
    try {
      const newConfig: IntegrationConfig = {
        ...configData,
        id: `config-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setConfigs(prev => [...prev, newConfig]);
      return newConfig;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '创建配置失败';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // 更新配置
  const updateConfig = useCallback(async (id: string, updates: Partial<IntegrationConfig>) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedConfig = { ...updates, updatedAt: new Date() };
      setConfigs(prev => prev.map(config => 
        config.id === id 
          ? { ...config, ...updatedConfig } as IntegrationConfig
          : config
      ));
      
      const config = configs.find(c => c.id === id);
      if (!config) throw new Error('配置不存在');
      
      return { ...config, ...updatedConfig } as IntegrationConfig;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '更新配置失败';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [configs]);

  // 删除配置
  const deleteConfig = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      setConfigs(prev => prev.filter(config => config.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '删除配置失败';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // 切换配置状态
  const toggleConfig = useCallback(async (id: string) => {
    const config = configs.find(c => c.id === id);
    if (!config) throw new Error('配置不存在');
    
    await updateConfig(id, { isActive: !config.isActive });
  }, [configs, updateConfig]);

  // 测试连接
  const testConnection = useCallback(async (configId: string): Promise<ConnectionTestResult> => {
    setLoading(true);
    setError(null);
    
    try {
      // 模拟连接测试
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const config = configs.find(c => c.id === configId);
      if (!config) throw new Error('配置不存在');
      
      const result: ConnectionTestResult = {
        success: Math.random() > 0.2, // 80%成功率
        responseTime: Math.floor(Math.random() * 3000) + 500,
        statusCode: 200,
        message: '连接测试成功',
        details: {
          endpoint: config.endpoint,
          provider: config.provider,
          authType: config.authType
        },
        timestamp: new Date()
      };
      
      if (!result.success) {
        result.message = '连接测试失败：无法连接到目标系统';
        result.statusCode = 500;
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '连接测试失败';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [configs]);

  // 开始同步
  const startSync = useCallback(async (configId: string, type: 'full' | 'incremental' = 'incremental'): Promise<SyncResult> => {
    setLoading(true);
    setError(null);
    
    try {
      const config = configs.find(c => c.id === configId);
      if (!config) throw new Error('配置不存在');
      
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
          syncType: type,
          provider: config.provider
        }
      };
      
      setSyncResults(prev => [syncResult, ...prev]);
      
      // 模拟同步过程
      setTimeout(() => {
        const completedResult: SyncResult = {
          ...syncResult,
          status: 'completed',
          endTime: new Date(),
          recordsProcessed: Math.floor(Math.random() * 1000) + 100,
          recordsSucceeded: Math.floor(Math.random() * 950) + 50,
          recordsFailed: Math.floor(Math.random() * 5),
          summary: {
            totalRecords: Math.floor(Math.random() * 1000) + 100,
            newRecords: Math.floor(Math.random() * 50),
            updatedRecords: Math.floor(Math.random() * 900) + 50,
            deletedRecords: 0,
            skippedRecords: Math.floor(Math.random() * 10)
          }
        };
        
        setSyncResults(prev => prev.map(sr => 
          sr.id === syncResult.id ? completedResult : sr
        ));
      }, 5000);
      
      return syncResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '启动同步失败';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [configs]);

  // 停止同步
  const stopSync = useCallback(async (syncId: string) => {
    setSyncResults(prev => prev.map(sr => 
      sr.id === syncId && sr.status === 'running'
        ? { ...sr, status: 'cancelled' as SyncStatus, endTime: new Date() }
        : sr
    ));
  }, []);

  // 获取同步历史
  const getSyncHistory = useCallback(async (
    configId: string, 
    page: number = 1, 
    pageSize: number = 10
  ): Promise<PaginatedResponse<SyncResult>> => {
    const configResults = syncResults.filter(sr => sr.configId === configId);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedResults = configResults.slice(startIndex, endIndex);
    
    return {
      data: paginatedResults,
      pagination: {
        page,
        pageSize,
        total: configResults.length,
        totalPages: Math.ceil(configResults.length / pageSize),
        hasNext: endIndex < configResults.length,
        hasPrev: page > 1
      }
    };
  }, [syncResults]);

  // 刷新监控数据
  const refreshMonitors = useCallback(async () => {
    setLoading(true);
    try {
      // 模拟刷新监控数据
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMonitors(mockMonitors);
    } catch (err) {
      setError('刷新监控数据失败');
    } finally {
      setLoading(false);
    }
  }, []);

  // 确认告警
  const acknowledgeAlert = useCallback(async (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { 
            ...alert, 
            acknowledged: true, 
            acknowledgedBy: 'current-user',
            acknowledgedAt: new Date() 
          }
        : alert
    ));
  }, []);

  // 解决告警
  const resolveAlert = useCallback(async (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { 
            ...alert, 
            resolved: true, 
            resolvedAt: new Date() 
          }
        : alert
    ));
  }, []);

  // 工具函数
  const getConfigsByType = useCallback((type: IntegrationType) => {
    return configs.filter(config => config.type === type);
  }, [configs]);

  const getActiveConfigs = useCallback(() => {
    return configs.filter(config => config.isActive);
  }, [configs]);

  const exportConfigs = useCallback(async (): Promise<Blob> => {
    const exportData = {
      configs: configs.map(config => ({
        ...config,
        credentials: {} // 不导出敏感信息
      })),
      exportTime: new Date(),
      version: '1.0'
    };
    
    return new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
  }, [configs]);

  const importConfigs = useCallback(async (file: File) => {
    try {
      const text = await file.text();
      const importData = JSON.parse(text);
      
      if (!importData.configs || !Array.isArray(importData.configs)) {
        throw new Error('无效的配置文件格式');
      }
      
      const newConfigs = importData.configs.map((config: any) => ({
        ...config,
        id: `config-${Date.now()}-${Math.random()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: false // 导入的配置默认为非活跃状态
      }));
      
      setConfigs(prev => [...prev, ...newConfigs]);
    } catch (err) {
      throw new Error('导入配置文件失败：' + (err instanceof Error ? err.message : '未知错误'));
    }
  }, []);

  return {
    // 配置管理
    configs,
    loading,
    error,
    
    // 配置操作
    createConfig,
    updateConfig,
    deleteConfig,
    toggleConfig,
    
    // 连接测试
    testConnection,
    
    // 同步管理
    syncResults,
    startSync,
    stopSync,
    getSyncHistory,
    
    // 监控数据
    monitors,
    alerts,
    stats,
    
    // 监控操作
    refreshMonitors,
    acknowledgeAlert,
    resolveAlert,
    
    // 工具函数
    getConfigsByType,
    getActiveConfigs,
    exportConfigs,
    importConfigs
  };
} 