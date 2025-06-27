// 系统配置管理相关类型定义

// 权限定义
export interface Permission {
  id: string;
  code: string;
  name: string;
  description: string;
  module: string;
  actions: string[]; // ['create', 'read', 'update', 'delete']
}

// 系统角色
export interface SystemRole {
  id: string;
  name: string;
  code: string;
  description: string;
  permissions: Permission[];
  level: number;
  isActive: boolean;
  isBuiltIn: boolean; // 是否为内置角色
  parentId?: string;
  children?: SystemRole[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

// 费用科目
export interface ExpenseCategory {
  id: string;
  code: string;
  name: string;
  description?: string;
  parentId?: string;
  children?: ExpenseCategory[];
  level: number;
  budgetLimit?: number;
  approvalRequired: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

// 审批流程节点
export interface WorkflowNode {
  id: string;
  name: string;
  code: string;
  type: 'start' | 'approval' | 'condition' | 'end';
  position: { x: number; y: number };
  roles: string[]; // 可执行此节点的角色ID
  conditions?: WorkflowCondition[];
  timeLimit?: number; // 审批时限（小时）
  isRequired: boolean;
  description?: string;
}

// 审批流程连线
export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  condition?: string;
  label?: string;
}

// 审批流程
export interface WorkflowTemplate {
  id: string;
  name: string;
  code: string;
  description?: string;
  type: 'expense' | 'travel' | 'general';
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  conditions: WorkflowCondition[];
  isActive: boolean;
  version: string;
  createdAt: Date;
  updatedAt: Date;
}

// 流程条件
export interface WorkflowCondition {
  id: string;
  field: string;
  operator: 'eq' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'contains';
  value: any;
  logic?: 'and' | 'or';
}

// 系统参数
export interface SystemParameter {
  id: string;
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  category: string;
  name: string;
  description?: string;
  isEditable: boolean;
  validation?: string; // 验证规则
}

// 权限矩阵
export interface PermissionMatrix {
  roleId: string;
  roleName: string;
  permissions: {
    [moduleCode: string]: {
      [actionCode: string]: boolean;
    };
  };
}

// 配置变更日志
export interface ConfigAuditLog {
  id: string;
  type: 'role' | 'permission' | 'category' | 'workflow' | 'parameter';
  action: 'create' | 'update' | 'delete';
  entityId: string;
  entityName: string;
  oldValue?: any;
  newValue?: any;
  operator: string;
  operatorName: string;
  timestamp: Date;
  description?: string;
}

// 配置导入导出
export interface ConfigExport {
  version: string;
  timestamp: Date;
  roles: SystemRole[];
  categories: ExpenseCategory[];
  workflows: WorkflowTemplate[];
  parameters: SystemParameter[];
}

// 配置验证结果
export interface ConfigValidation {
  isValid: boolean;
  errors: ConfigValidationError[];
  warnings: ConfigValidationWarning[];
}

export interface ConfigValidationError {
  type: string;
  field: string;
  message: string;
  code: string;
}

export interface ConfigValidationWarning {
  type: string;
  field: string;
  message: string;
  suggestion?: string;
}

// Hook返回类型
export interface UseSystemConfigReturn {
  // 角色管理
  roles: SystemRole[];
  loadingRoles: boolean;
  createRole: (role: Omit<SystemRole, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateRole: (id: string, role: Partial<SystemRole>) => Promise<void>;
  deleteRole: (id: string) => Promise<void>;
  
  // 权限管理
  permissions: Permission[];
  permissionMatrix: PermissionMatrix[];
  updatePermissionMatrix: (roleId: string, permissions: any) => Promise<void>;
  
  // 费用科目管理
  categories: ExpenseCategory[];
  loadingCategories: boolean;
  createCategory: (category: Omit<ExpenseCategory, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateCategory: (id: string, category: Partial<ExpenseCategory>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  reorderCategories: (categories: ExpenseCategory[]) => Promise<void>;
  
  // 工作流管理
  workflows: WorkflowTemplate[];
  loadingWorkflows: boolean;
  createWorkflow: (workflow: Omit<WorkflowTemplate, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateWorkflow: (id: string, workflow: Partial<WorkflowTemplate>) => Promise<void>;
  deleteWorkflow: (id: string) => Promise<void>;
  
  // 系统参数
  parameters: SystemParameter[];
  loadingParameters: boolean;
  updateParameter: (key: string, value: string) => Promise<void>;
  
  // 配置管理
  exportConfig: () => Promise<ConfigExport>;
  importConfig: (config: ConfigExport) => Promise<void>;
  validateConfig: (config: any) => ConfigValidation;
  
  // 审计日志
  auditLogs: ConfigAuditLog[];
  loadingLogs: boolean;
  getAuditLogs: (filters?: any) => Promise<void>;
  
  // 通用操作
  refresh: () => Promise<void>;
  saving: boolean;
  error: string | null;
}

// 预定义权限模块
export const PERMISSION_MODULES = {
  EXPENSE: {
    code: 'expense',
    name: '费用管理',
    actions: ['create', 'read', 'update', 'delete', 'approve']
  },
  TRAVEL: {
    code: 'travel',
    name: '差旅管理',
    actions: ['create', 'read', 'update', 'delete', 'approve']
  },
  PERSONNEL: {
    code: 'personnel',
    name: '人员管理',
    actions: ['create', 'read', 'update', 'delete']
  },
  APPROVAL: {
    code: 'approval',
    name: '审批管理',
    actions: ['read', 'approve', 'reject', 'delegate']
  },
  REPORT: {
    code: 'report',
    name: '报表分析',
    actions: ['read', 'export']
  },
  CONFIG: {
    code: 'config',
    name: '系统配置',
    actions: ['read', 'update']
  }
} as const;

// 预定义角色
export const BUILT_IN_ROLES = {
  ADMIN: {
    code: 'admin',
    name: '系统管理员',
    description: '拥有系统所有权限',
    level: 1
  },
  EMPLOYEE: {
    code: 'employee',
    name: '普通员工',
    description: '基本的申请和查看权限',
    level: 5
  },
  SUPERVISOR: {
    code: 'supervisor',
    name: '部门主管',
    description: '部门审批权限',
    level: 4
  },
  AA1: {
    code: 'aa1',
    name: 'AA1资格人员',
    description: 'AA1资格审批权限',
    level: 3
  },
  FINANCE: {
    code: 'finance',
    name: '财务人员',
    description: '财务审批权限',
    level: 3
  },
  COMPLIANCE: {
    code: 'compliance',
    name: '合规人员',
    description: '合规审批权限',
    level: 3
  },
  FUNCTIONAL_HEAD: {
    code: 'functional_head',
    name: '功能负责人',
    description: '功能模块负责人审批权限',
    level: 2
  },
  SENIOR_MANAGEMENT: {
    code: 'senior_management',
    name: '高级管理层',
    description: 'COO/CEO级别审批权限',
    level: 1
  }
} as const; 