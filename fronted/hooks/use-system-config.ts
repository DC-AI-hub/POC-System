"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  SystemRole,
  Permission,
  ExpenseCategory,
  WorkflowTemplate,
  SystemParameter,
  PermissionMatrix,
  ConfigAuditLog,
  ConfigExport,
  ConfigValidation,
  UseSystemConfigReturn,
  PERMISSION_MODULES,
  BUILT_IN_ROLES,
  WorkflowNode,
  WorkflowEdge
} from '@/lib/types/system-config';

// 模拟数据
const mockPermissions: Permission[] = [
  {
    id: '1',
    code: 'expense.create',
    name: '创建费用申请',
    description: '允许创建新的费用申请',
    module: 'expense',
    actions: ['create']
  },
  {
    id: '2',
    code: 'expense.approve',
    name: '审批费用申请',
    description: '允许审批费用申请',
    module: 'expense',
    actions: ['approve']
  },
  {
    id: '3',
    code: 'personnel.manage',
    name: '人员管理',
    description: '允许管理人员信息',
    module: 'personnel',
    actions: ['create', 'read', 'update', 'delete']
  },
  {
    id: '4',
    code: 'config.manage',
    name: '系统配置',
    description: '允许管理系统配置',
    module: 'config',
    actions: ['read', 'update']
  }
];

const mockRoles: SystemRole[] = [
  {
    id: '1',
    name: '系统管理员',
    code: 'admin',
    description: '拥有系统所有权限',
    permissions: mockPermissions,
    level: 1,
    isActive: true,
    isBuiltIn: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    createdBy: 'system'
  },
  {
    id: '2',
    name: '普通员工',
    code: 'employee',
    description: '基本的申请和查看权限',
    permissions: [mockPermissions[0]],
    level: 5,
    isActive: true,
    isBuiltIn: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    createdBy: 'system'
  },
  {
    id: '3',
    name: '部门主管',
    code: 'supervisor',
    description: '部门审批权限',
    permissions: [mockPermissions[0], mockPermissions[1]],
    level: 4,
    isActive: true,
    isBuiltIn: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    createdBy: 'system'
  }
];

const mockCategories: ExpenseCategory[] = [
  {
    id: '1',
    code: 'OFFICE',
    name: '办公用品',
    description: '日常办公用品采购',
    level: 1,
    budgetLimit: 10000,
    approvalRequired: true,
    isActive: true,
    sortOrder: 1,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    children: [
      {
        id: '11',
        code: 'OFFICE_STATIONERY',
        name: '文具用品',
        parentId: '1',
        level: 2,
        budgetLimit: 5000,
        approvalRequired: false,
        isActive: true,
        sortOrder: 1,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        id: '12',
        code: 'OFFICE_EQUIPMENT',
        name: '办公设备',
        parentId: '1',
        level: 2,
        budgetLimit: 5000,
        approvalRequired: true,
        isActive: true,
        sortOrder: 2,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      }
    ]
  },
  {
    id: '2',
    code: 'TRAVEL',
    name: '差旅费用',
    description: '出差相关费用',
    level: 1,
    budgetLimit: 50000,
    approvalRequired: true,
    isActive: true,
    sortOrder: 2,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    children: [
      {
        id: '21',
        code: 'TRAVEL_TRANSPORT',
        name: '交通费',
        parentId: '2',
        level: 2,
        approvalRequired: true,
        isActive: true,
        sortOrder: 1,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        id: '22',
        code: 'TRAVEL_ACCOMMODATION',
        name: '住宿费',
        parentId: '2',
        level: 2,
        approvalRequired: true,
        isActive: true,
        sortOrder: 2,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      }
    ]
  }
];

const mockWorkflows: WorkflowTemplate[] = [
  {
    id: '1',
    name: '标准费用审批流程',
    code: 'STANDARD_EXPENSE',
    description: '适用于一般费用申请的标准审批流程',
    type: 'expense',
    nodes: [
      {
        id: 'start',
        name: '开始',
        code: 'START',
        type: 'start',
        position: { x: 100, y: 100 },
        roles: [],
        isRequired: true
      },
      {
        id: 'supervisor',
        name: '直属主管审批',
        code: 'SUPERVISOR_APPROVAL',
        type: 'approval',
        position: { x: 300, y: 100 },
        roles: ['3'],
        timeLimit: 24,
        isRequired: true
      },
      {
        id: 'end',
        name: '结束',
        code: 'END',
        type: 'end',
        position: { x: 500, y: 100 },
        roles: [],
        isRequired: true
      }
    ],
    edges: [
      {
        id: 'e1',
        source: 'start',
        target: 'supervisor',
        label: '提交申请'
      },
      {
        id: 'e2',
        source: 'supervisor',
        target: 'end',
        label: '审批通过'
      }
    ],
    conditions: [],
    isActive: true,
    version: '1.0',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

const mockParameters: SystemParameter[] = [
  {
    id: '1',
    key: 'system.title',
    value: '港交所POC系统',
    type: 'string',
    category: 'general',
    name: '系统标题',
    description: '系统显示的标题名称',
    isEditable: true
  },
  {
    id: '2',
    key: 'approval.timeout',
    value: '72',
    type: 'number',
    category: 'approval',
    name: '审批超时时间',
    description: '审批超时时间（小时）',
    isEditable: true,
    validation: 'min:1,max:168'
  },
  {
    id: '3',
    key: 'notification.email.enabled',
    value: 'true',
    type: 'boolean',
    category: 'notification',
    name: '邮件通知',
    description: '是否启用邮件通知',
    isEditable: true
  }
];

export function useSystemConfig(): UseSystemConfigReturn {
  // 状态管理
  const [roles, setRoles] = useState<SystemRole[]>(mockRoles);
  const [permissions] = useState<Permission[]>(mockPermissions);
  const [categories, setCategories] = useState<ExpenseCategory[]>(mockCategories);
  const [workflows, setWorkflows] = useState<WorkflowTemplate[]>(mockWorkflows);
  const [parameters, setParameters] = useState<SystemParameter[]>(mockParameters);
  const [auditLogs, setAuditLogs] = useState<ConfigAuditLog[]>([]);
  
  // 加载状态
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingWorkflows, setLoadingWorkflows] = useState(false);
  const [loadingParameters, setLoadingParameters] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 权限矩阵
  const [permissionMatrix, setPermissionMatrix] = useState<PermissionMatrix[]>([]);

  // 初始化权限矩阵
  useEffect(() => {
    const matrix = roles.map(role => ({
      roleId: role.id,
      roleName: role.name,
      permissions: Object.keys(PERMISSION_MODULES).reduce((acc, moduleKey) => {
        const module = PERMISSION_MODULES[moduleKey as keyof typeof PERMISSION_MODULES];
        acc[module.code] = module.actions.reduce((actionAcc, action) => {
          actionAcc[action] = role.permissions.some(p => 
            p.module === module.code && p.actions.includes(action)
          );
          return actionAcc;
        }, {} as { [key: string]: boolean });
        return acc;
      }, {} as { [key: string]: { [key: string]: boolean } })
    }));
    setPermissionMatrix(matrix);
  }, [roles]);

  // 角色管理
  const createRole = useCallback(async (roleData: Omit<SystemRole, 'id' | 'createdAt' | 'updatedAt'>) => {
    setSaving(true);
    setError(null);
    
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newRole: SystemRole = {
        ...roleData,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setRoles(prev => [...prev, newRole]);
      
      // 记录审计日志
      const log: ConfigAuditLog = {
        id: Date.now().toString(),
        type: 'role',
        action: 'create',
        entityId: newRole.id,
        entityName: newRole.name,
        newValue: newRole,
        operator: 'current_user',
        operatorName: '当前用户',
        timestamp: new Date(),
        description: `创建角色: ${newRole.name}`
      };
      setAuditLogs(prev => [log, ...prev]);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建角色失败');
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const updateRole = useCallback(async (id: string, roleData: Partial<SystemRole>) => {
    setSaving(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const oldRole = roles.find(r => r.id === id);
      if (!oldRole) throw new Error('角色不存在');
      
      const updatedRole = { ...oldRole, ...roleData, updatedAt: new Date() };
      setRoles(prev => prev.map(r => r.id === id ? updatedRole : r));
      
      // 记录审计日志
      const log: ConfigAuditLog = {
        id: Date.now().toString(),
        type: 'role',
        action: 'update',
        entityId: id,
        entityName: updatedRole.name,
        oldValue: oldRole,
        newValue: updatedRole,
        operator: 'current_user',
        operatorName: '当前用户',
        timestamp: new Date(),
        description: `更新角色: ${updatedRole.name}`
      };
      setAuditLogs(prev => [log, ...prev]);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新角色失败');
      throw err;
    } finally {
      setSaving(false);
    }
  }, [roles]);

  const deleteRole = useCallback(async (id: string) => {
    setSaving(true);
    setError(null);
    
    try {
      const role = roles.find(r => r.id === id);
      if (!role) throw new Error('角色不存在');
      if (role.isBuiltIn) throw new Error('内置角色不能删除');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setRoles(prev => prev.filter(r => r.id !== id));
      
      // 记录审计日志
      const log: ConfigAuditLog = {
        id: Date.now().toString(),
        type: 'role',
        action: 'delete',
        entityId: id,
        entityName: role.name,
        oldValue: role,
        operator: 'current_user',
        operatorName: '当前用户',
        timestamp: new Date(),
        description: `删除角色: ${role.name}`
      };
      setAuditLogs(prev => [log, ...prev]);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除角色失败');
      throw err;
    } finally {
      setSaving(false);
    }
  }, [roles]);

  // 权限矩阵更新
  const updatePermissionMatrix = useCallback(async (roleId: string, permissions: any) => {
    setSaving(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 更新角色权限
      const updatedPermissions: Permission[] = [];
      Object.keys(permissions).forEach(moduleCode => {
        Object.keys(permissions[moduleCode]).forEach(action => {
          if (permissions[moduleCode][action]) {
            updatedPermissions.push({
              id: `${moduleCode}_${action}`,
              code: `${moduleCode}.${action}`,
              name: `${moduleCode} ${action}`,
              description: '',
              module: moduleCode,
              actions: [action]
            });
          }
        });
      });
      
      setRoles(prev => prev.map(role => 
        role.id === roleId 
          ? { ...role, permissions: updatedPermissions, updatedAt: new Date() }
          : role
      ));
      
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新权限失败');
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  // 费用科目管理
  const createCategory = useCallback(async (categoryData: Omit<ExpenseCategory, 'id' | 'createdAt' | 'updatedAt'>) => {
    setSaving(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newCategory: ExpenseCategory = {
        ...categoryData,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      if (categoryData.parentId) {
        // 添加到父级的children中
        setCategories(prev => prev.map(cat => {
          if (cat.id === categoryData.parentId) {
            return {
              ...cat,
              children: [...(cat.children || []), newCategory]
            };
          }
          return cat;
        }));
      } else {
        setCategories(prev => [...prev, newCategory]);
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建科目失败');
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const updateCategory = useCallback(async (id: string, categoryData: Partial<ExpenseCategory>) => {
    setSaving(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updateCategoryRecursive = (categories: ExpenseCategory[]): ExpenseCategory[] => {
        return categories.map(cat => {
          if (cat.id === id) {
            return { ...cat, ...categoryData, updatedAt: new Date() };
          }
          if (cat.children) {
            return { ...cat, children: updateCategoryRecursive(cat.children) };
          }
          return cat;
        });
      };
      
      setCategories(prev => updateCategoryRecursive(prev));
      
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新科目失败');
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const deleteCategory = useCallback(async (id: string) => {
    setSaving(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const deleteCategoryRecursive = (categories: ExpenseCategory[]): ExpenseCategory[] => {
        return categories.filter(cat => {
          if (cat.id === id) return false;
          if (cat.children) {
            cat.children = deleteCategoryRecursive(cat.children);
          }
          return true;
        });
      };
      
      setCategories(prev => deleteCategoryRecursive(prev));
      
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除科目失败');
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const reorderCategories = useCallback(async (newCategories: ExpenseCategory[]) => {
    setSaving(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setCategories(newCategories);
    } catch (err) {
      setError(err instanceof Error ? err.message : '重新排序失败');
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  // 工作流管理
  const createWorkflow = useCallback(async (workflowData: Omit<WorkflowTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    setSaving(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newWorkflow: WorkflowTemplate = {
        ...workflowData,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setWorkflows(prev => [...prev, newWorkflow]);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建工作流失败');
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const updateWorkflow = useCallback(async (id: string, workflowData: Partial<WorkflowTemplate>) => {
    setSaving(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setWorkflows(prev => prev.map(w => 
        w.id === id 
          ? { ...w, ...workflowData, updatedAt: new Date() }
          : w
      ));
      
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新工作流失败');
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const deleteWorkflow = useCallback(async (id: string) => {
    setSaving(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setWorkflows(prev => prev.filter(w => w.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除工作流失败');
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  // 系统参数管理
  const updateParameter = useCallback(async (key: string, value: string) => {
    setSaving(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setParameters(prev => prev.map(p => 
        p.key === key 
          ? { ...p, value }
          : p
      ));
      
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新参数失败');
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  // 配置导入导出
  const exportConfig = useCallback(async (): Promise<ConfigExport> => {
    return {
      version: '1.0',
      timestamp: new Date(),
      roles,
      categories,
      workflows,
      parameters
    };
  }, [roles, categories, workflows, parameters]);

  const importConfig = useCallback(async (config: ConfigExport) => {
    setSaving(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setRoles(config.roles);
      setCategories(config.categories);
      setWorkflows(config.workflows);
      setParameters(config.parameters);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : '导入配置失败');
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const validateConfig = useCallback((config: any): ConfigValidation => {
    const errors: any[] = [];
    const warnings: any[] = [];
    
    // 简单验证逻辑
    if (!config.roles || config.roles.length === 0) {
      errors.push({
        type: 'roles',
        field: 'roles',
        message: '至少需要一个角色',
        code: 'ROLES_REQUIRED'
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }, []);

  // 审计日志
  const getAuditLogs = useCallback(async (filters?: any) => {
    setLoadingLogs(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      // 这里可以根据filters过滤日志
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取日志失败');
    } finally {
      setLoadingLogs(false);
    }
  }, []);

  // 刷新数据
  const refresh = useCallback(async () => {
    setLoadingRoles(true);
    setLoadingCategories(true);
    setLoadingWorkflows(true);
    setLoadingParameters(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      // 重新加载数据
    } catch (err) {
      setError(err instanceof Error ? err.message : '刷新数据失败');
    } finally {
      setLoadingRoles(false);
      setLoadingCategories(false);
      setLoadingWorkflows(false);
      setLoadingParameters(false);
    }
  }, []);

  return {
    // 角色管理
    roles,
    loadingRoles,
    createRole,
    updateRole,
    deleteRole,
    
    // 权限管理
    permissions,
    permissionMatrix,
    updatePermissionMatrix,
    
    // 费用科目管理
    categories,
    loadingCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
    
    // 工作流管理
    workflows,
    loadingWorkflows,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    
    // 系统参数
    parameters,
    loadingParameters,
    updateParameter,
    
    // 配置管理
    exportConfig,
    importConfig,
    validateConfig,
    
    // 审计日志
    auditLogs,
    loadingLogs,
    getAuditLogs,
    
    // 通用操作
    refresh,
    saving,
    error
  };
} 