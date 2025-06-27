// 系统集成相关类型定义

// 集成类型枚举
export type IntegrationType = 'auth' | 'finance' | 'hr' | 'notification' | 'storage';

// 认证方式枚举
export type AuthType = 'basic' | 'oauth2' | 'saml' | 'ldap' | 'api_key';

// 同步状态枚举
export type SyncStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

// 字段映射接口
export interface FieldMapping {
  sourceField: string;
  targetField: string;
  dataType: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
  transform?: string; // 转换函数名
  required: boolean;
  defaultValue?: any;
}

// 集成配置接口
export interface IntegrationConfig {
  id: string;
  name: string;
  description?: string;
  type: IntegrationType;
  provider: string; // SAP, 用友, LDAP等
  endpoint: string;
  authType: AuthType;
  credentials: Record<string, string>;
  mapping: FieldMapping[];
  syncSchedule?: {
    enabled: boolean;
    frequency: 'manual' | 'hourly' | 'daily' | 'weekly' | 'monthly';
    time?: string; // HH:mm格式
    timezone: string;
  };
  retryPolicy: {
    maxRetries: number;
    retryDelay: number; // 毫秒
    backoffMultiplier: number;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

// 同步结果接口
export interface SyncResult {
  id: string;
  configId: string;
  status: SyncStatus;
  startTime: Date;
  endTime?: Date;
  recordsProcessed: number;
  recordsSucceeded: number;
  recordsFailed: number;
  errors: SyncError[];
  summary: {
    totalRecords: number;
    newRecords: number;
    updatedRecords: number;
    deletedRecords: number;
    skippedRecords: number;
  };
  metadata: Record<string, any>;
}

// 同步错误接口
export interface SyncError {
  recordId?: string;
  field?: string;
  errorCode: string;
  errorMessage: string;
  originalValue?: any;
  timestamp: Date;
}

// 连接测试结果
export interface ConnectionTestResult {
  success: boolean;
  responseTime: number; // 毫秒
  statusCode?: number;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
}

// 用户认证集成数据
export interface AuthIntegrationData {
  userId: string;
  username: string;
  email: string;
  displayName: string;
  department?: string;
  title?: string;
  manager?: string;
  groups: string[];
  attributes: Record<string, any>;
  isActive: boolean;
  lastLogin?: Date;
}

// 财务系统集成数据
export interface FinanceIntegrationData {
  accountCode: string;
  accountName: string;
  accountType: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  parentAccount?: string;
  costCenter?: string;
  department?: string;
  budgetAmount?: number;
  actualAmount?: number;
  currency: string;
  isActive: boolean;
  lastUpdated: Date;
}

// HR系统集成数据
export interface HRIntegrationData {
  employeeId: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department: string;
  position: string;
  manager?: string;
  hireDate: Date;
  status: 'active' | 'inactive' | 'terminated';
  location?: string;
  costCenter?: string;
  salary?: {
    amount: number;
    currency: string;
    effectiveDate: Date;
  };
}

// 通知集成数据
export interface NotificationIntegrationData {
  id: string;
  type: 'email' | 'sms' | 'wechat' | 'push';
  recipients: string[];
  subject?: string;
  content: string;
  template?: string;
  variables?: Record<string, any>;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  scheduledTime?: Date;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  metadata?: Record<string, any>;
}

// 文件存储集成数据
export interface StorageIntegrationData {
  fileId: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: Date;
  tags?: string[];
  metadata?: Record<string, any>;
  accessUrl?: string;
  expiresAt?: Date;
}

// 集成监控数据
export interface IntegrationMonitor {
  configId: string;
  status: 'healthy' | 'warning' | 'error' | 'offline';
  lastSyncTime?: Date;
  nextSyncTime?: Date;
  avgResponseTime: number;
  successRate: number; // 0-1之间
  errorCount: number;
  warningCount: number;
  uptime: number; // 百分比
  metrics: {
    requestsPerHour: number;
    dataTransferred: number; // 字节
    errorRate: number; // 0-1之间
    avgProcessingTime: number; // 毫秒
  };
  alerts: IntegrationAlert[];
}

// 集成告警
export interface IntegrationAlert {
  id: string;
  configId: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolved: boolean;
  resolvedAt?: Date;
}

// API响应接口
export interface IntegrationApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  timestamp: Date;
  requestId: string;
}

// 分页响应接口
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// 集成统计数据
export interface IntegrationStats {
  totalConfigs: number;
  activeConfigs: number;
  totalSyncs: number;
  successfulSyncs: number;
  failedSyncs: number;
  avgSyncTime: number;
  dataVolume: {
    totalRecords: number;
    recordsToday: number;
    recordsThisWeek: number;
    recordsThisMonth: number;
  };
  systemHealth: {
    overallStatus: 'healthy' | 'warning' | 'error';
    activeAlerts: number;
    systemUptime: number;
  };
}

// 预定义的集成提供商
export const INTEGRATION_PROVIDERS = {
  auth: [
    { id: 'ldap', name: 'LDAP/Active Directory', description: '企业域认证' },
    { id: 'saml', name: 'SAML 2.0', description: 'SAML单点登录' },
    { id: 'oauth2', name: 'OAuth 2.0', description: 'OAuth2认证' },
    { id: 'custom', name: '自定义认证', description: '自定义认证接口' }
  ],
  finance: [
    { id: 'sap', name: 'SAP ERP', description: 'SAP企业资源规划系统' },
    { id: 'yonyou', name: '用友', description: '用友财务管理系统' },
    { id: 'kingdee', name: '金蝶', description: '金蝶财务软件' },
    { id: 'oracle', name: 'Oracle Financials', description: 'Oracle财务云' }
  ],
  hr: [
    { id: 'workday', name: 'Workday', description: 'Workday人力资源系统' },
    { id: 'successfactors', name: 'SuccessFactors', description: 'SAP SuccessFactors' },
    { id: 'custom_hr', name: '自定义HR系统', description: '自定义人力资源系统' }
  ],
  notification: [
    { id: 'smtp', name: 'SMTP邮件', description: 'SMTP邮件服务' },
    { id: 'wechat_work', name: '企业微信', description: '企业微信通知' },
    { id: 'dingtalk', name: '钉钉', description: '钉钉企业通知' },
    { id: 'sms', name: '短信服务', description: '短信通知服务' }
  ],
  storage: [
    { id: 'aliyun_oss', name: '阿里云OSS', description: '阿里云对象存储' },
    { id: 'aws_s3', name: 'AWS S3', description: 'Amazon S3存储' },
    { id: 'local', name: '本地存储', description: '本地文件系统' },
    { id: 'ftp', name: 'FTP服务器', description: 'FTP文件传输' }
  ]
} as const;

// 默认字段映射模板
export const DEFAULT_FIELD_MAPPINGS = {
  user: [
    { sourceField: 'id', targetField: 'userId', dataType: 'string' as const, required: true },
    { sourceField: 'username', targetField: 'loginName', dataType: 'string' as const, required: true },
    { sourceField: 'email', targetField: 'email', dataType: 'string' as const, required: true },
    { sourceField: 'displayName', targetField: 'name', dataType: 'string' as const, required: true },
    { sourceField: 'department', targetField: 'department', dataType: 'string' as const, required: false }
  ],
  account: [
    { sourceField: 'code', targetField: 'accountCode', dataType: 'string' as const, required: true },
    { sourceField: 'name', targetField: 'accountName', dataType: 'string' as const, required: true },
    { sourceField: 'type', targetField: 'accountType', dataType: 'string' as const, required: true },
    { sourceField: 'parent', targetField: 'parentAccount', dataType: 'string' as const, required: false }
  ],
  employee: [
    { sourceField: 'empId', targetField: 'employeeId', dataType: 'string' as const, required: true },
    { sourceField: 'empNo', targetField: 'employeeNumber', dataType: 'string' as const, required: true },
    { sourceField: 'firstName', targetField: 'firstName', dataType: 'string' as const, required: true },
    { sourceField: 'lastName', targetField: 'lastName', dataType: 'string' as const, required: true },
    { sourceField: 'email', targetField: 'email', dataType: 'string' as const, required: true }
  ]
} as const; 