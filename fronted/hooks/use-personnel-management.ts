"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { useToast } from "@/hooks/use-toast";
import type {
  PersonnelInfo,
  Department,
  PersonnelFormData,
  PersonnelSearchFilters,
  BatchOperation,
  ImportResult,
  PersonnelStats,
  OrganizationNode,
  OperationLog,
  ExportConfig,
  UsePersonnelManagementReturn,
} from "@/lib/types/personnel-management";

// 模拟数据
const mockPersonnel: PersonnelInfo[] = [
  {
    id: "1",
    name: "张三",
    loginName: "zhangsan",
    employeeId: "EMP001",
    department: "财务部",
    position: "财务经理",
    manager: "李总监",
    phone: "13800138001",
    email: "zhangsan@hkex.com",
    employeeType: "full-time",
    status: "active",
    hireDate: new Date("2020-01-15"),
    lastModified: new Date(),
    workLocation: "香港中环",
    emergencyContact: "张夫人",
    emergencyPhone: "13800138011",
    notes: "财务部门负责人",
  },
  {
    id: "2",
    name: "李四",
    loginName: "lisi",
    employeeId: "EMP002",
    department: "技术部",
    position: "高级开发工程师",
    manager: "王总监",
    phone: "13800138002",
    email: "lisi@hkex.com",
    employeeType: "full-time",
    status: "active",
    hireDate: new Date("2019-03-20"),
    lastModified: new Date(),
    workLocation: "深圳南山",
    emergencyContact: "李先生",
    emergencyPhone: "13800138012",
    notes: "核心技术开发人员",
  },
  {
    id: "3",
    name: "王五",
    loginName: "wangwu",
    employeeId: "EMP003",
    department: "人事部",
    position: "人事专员",
    manager: "赵经理",
    phone: "13800138003",
    email: "wangwu@hkex.com",
    employeeType: "part-time",
    status: "active",
    hireDate: new Date("2021-06-10"),
    lastModified: new Date(),
    workLocation: "香港中环",
    emergencyContact: "王女士",
    emergencyPhone: "13800138013",
  },
  {
    id: "4",
    name: "赵六",
    loginName: "zhaoliu",
    employeeId: "EMP004",
    department: "市场部",
    position: "市场总监",
    manager: "CEO",
    phone: "13800138004",
    email: "zhaoliu@hkex.com",
    employeeType: "full-time",
    status: "transferred",
    hireDate: new Date("2018-09-01"),
    lastModified: new Date(),
    workLocation: "上海浦东",
    emergencyContact: "赵太太",
    emergencyPhone: "13800138014",
    notes: "市场战略负责人",
  },
  {
    id: "5",
    name: "孙七",
    loginName: "sunqi",
    employeeId: "EMP005",
    department: "技术部",
    position: "前端工程师",
    manager: "王总监",
    phone: "13800138005",
    email: "sunqi@hkex.com",
    employeeType: "contractor",
    status: "inactive",
    hireDate: new Date("2022-01-15"),
    lastModified: new Date(),
    workLocation: "深圳南山",
    emergencyContact: "孙先生",
    emergencyPhone: "13800138015",
  },
];

const mockDepartments: Department[] = [
  {
    id: "dept-1",
    name: "总经理办公室",
    level: 1,
    managerId: "ceo-001",
  },
  {
    id: "dept-2",
    name: "财务部",
    parentId: "dept-1",
    level: 2,
    managerId: "1",
  },
  {
    id: "dept-3",
    name: "技术部",
    parentId: "dept-1",
    level: 2,
    managerId: "2",
  },
  {
    id: "dept-4",
    name: "人事部",
    parentId: "dept-1",
    level: 2,
    managerId: "3",
  },
  {
    id: "dept-5",
    name: "市场部",
    parentId: "dept-1",
    level: 2,
    managerId: "4",
  },
  {
    id: "dept-6",
    name: "前端开发组",
    parentId: "dept-3",
    level: 3,
    managerId: "5",
  },
  {
    id: "dept-7",
    name: "后端开发组",
    parentId: "dept-3",
    level: 3,
    managerId: "2",
  },
];

// 添加API调用函数
const API_BASE = 'http://1.15.34.167:8080/api';

// 通用API调用函数，自动携带JWT Token
const apiCall = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = localStorage.getItem('jwt_token');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  // 如果返回401，可能是token过期，尝试刷新
  if (response.status === 401) {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      try {
        const refreshResponse = await fetch(`${API_BASE}/auth/refresh?refreshToken=${encodeURIComponent(refreshToken)}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (refreshResponse.ok) {
          const refreshResult = await refreshResponse.json();
          localStorage.setItem('jwt_token', refreshResult.data.token);
          
          // 重新发起原请求
          headers['Authorization'] = `Bearer ${refreshResult.data.token}`;
          return fetch(url, { ...options, headers });
        }
      } catch (error) {
        console.error('Token刷新失败:', error);
      }
    }
    
    // 如果刷新失败，清除本地存储并跳转到登录页
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_info');
    window.location.reload();
  }
  
  return response;
};

// 数据映射函数
const mapUserTypeToEmployeeType = (userType: string): PersonnelInfo["employeeType"] => {
  switch (userType) {
    case '主管':
    case '经理':
    case '总监':
    case '正式员工':
    case '员工':
      return 'full-time';
    case '兼职':
    case '兼职员工':
      return 'part-time';
    case '合同工':
      return 'contractor';
    default:
      return 'full-time';
  }
};

const mapStatusToFrontend = (status: string): PersonnelInfo["status"] => {
  switch (status) {
    case '在职':
      return 'active';
    case '离职':
      return 'inactive';
    case '调动':
      return 'transferred';
    case '辞职':
      return 'resigned';
    default:
      return 'active';
  }
};

const mapEmployeeTypeToBackend = (employeeType: PersonnelInfo["employeeType"]): string => {
  switch (employeeType) {
    case 'full-time':
      return '正式员工';
    case 'part-time':
      return '兼职员工';
    case 'contractor':
      return '合同工';
    default:
      return '正式员工';
  }
};

const mapStatusToBackend = (status: PersonnelInfo["status"]): string => {
  switch (status) {
    case 'active':
      return '在职';
    case 'inactive':
      return '离职';
    case 'transferred':
      return '调动';
    case 'resigned':
      return '辞职';
    default:
      return '在职';
  }
};

// 获取所有用户
const fetchPersonnel = async (): Promise<PersonnelInfo[]> => {
  const response = await apiCall(`${API_BASE}/users?size=100`);
  if (!response.ok) {
    throw new Error('获取用户列表失败');
  }
  const result = await response.json();
  
  // 检查响应数据结构
  if (!result.data || !result.data.content) {
    console.error('API响应格式错误:', result);
    return [];
  }
  
  // 转换后端数据格式到前端格式
  return result.data.content.map((user: any) => ({
    id: user.id.toString(),
    name: user.userName,
    loginName: user.employeeId,
    employeeId: user.employeeId,
    department: user.department || '未指定',
    position: user.position || '未指定',
    manager: user.manager || '',
    phone: user.phone || '',
    email: user.email || '',
    employeeType: mapUserTypeToEmployeeType(user.userType),
    status: mapStatusToFrontend(user.status),
    hireDate: user.hireDate ? new Date(user.hireDate) : new Date(),
    lastModified: user.updatedTime ? new Date(user.updatedTime) : new Date(),
    workLocation: user.workLocation || '',
    emergencyContact: user.emergencyContact || '',
    emergencyPhone: user.emergencyPhone || '',
    notes: user.notes || '',
  }));
};

export function usePersonnelManagement(): UsePersonnelManagementReturn {
  // Toast hook
  const { toast } = useToast();

  // 基础状态
  const [personnel, setPersonnel] = useState<PersonnelInfo[]>([]);
  const [departments, setDepartments] = useState<Department[]>(mockDepartments);
  const [selectedPersonnel, setSelectedPersonnel] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [operationLogs, setOperationLogs] = useState<OperationLog[]>([]);

  // 搜索和过滤状态
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<PersonnelSearchFilters>({
    searchTerm: "",
    department: "",
    position: "",
    employeeType: "",
    status: "",
    manager: "",
  });

  // 防抖搜索
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // 初始化加载数据
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const data = await fetchPersonnel();
        setPersonnel(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "加载数据失败";
        setError(errorMessage);
        toast({
          title: "加载失败",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [toast]);

  // 过滤后的人员数据
  const filteredPersonnel = useMemo(() => {
    let result = personnel;

    // 搜索过滤
    if (debouncedSearchTerm) {
      const term = debouncedSearchTerm.toLowerCase();
      result = result.filter(
        (person) =>
          person.name.toLowerCase().includes(term) ||
          person.loginName.toLowerCase().includes(term) ||
          person.employeeId.toLowerCase().includes(term) ||
          person.email.toLowerCase().includes(term) ||
          person.phone.includes(term)
      );
    }

    // 其他过滤条件
    if (filters.department && filters.department !== "all") {
      result = result.filter((person) => person.department === filters.department);
    }

    if (filters.position && filters.position !== "all") {
      result = result.filter((person) => person.position === filters.position);
    }

    if (filters.employeeType && filters.employeeType !== "all") {
      result = result.filter((person) => person.employeeType === filters.employeeType);
    }

    if (filters.status && filters.status !== "all") {
      result = result.filter((person) => person.status === filters.status);
    }

    if (filters.manager && filters.manager !== "all") {
      result = result.filter((person) => person.manager === filters.manager);
    }

    return result;
  }, [personnel, debouncedSearchTerm, filters]);

  // 统计数据
  const stats = useMemo((): PersonnelStats => {
    const totalCount = personnel.length;
    const activeCount = personnel.filter((p) => p.status === "active").length;
    const inactiveCount = personnel.filter((p) => p.status === "inactive").length;
    const transferredCount = personnel.filter((p) => p.status === "transferred").length;
    const resignedCount = personnel.filter((p) => p.status === "resigned").length;

    const departmentStats: { [key: string]: number } = {};
    const typeStats: { [key: string]: number } = {};

    personnel.forEach((person) => {
      departmentStats[person.department] = (departmentStats[person.department] || 0) + 1;
      typeStats[person.employeeType] = (typeStats[person.employeeType] || 0) + 1;
    });

    return {
      totalCount,
      activeCount,
      inactiveCount,
      transferredCount,
      resignedCount,
      departmentStats,
      typeStats,
    };
  }, [personnel]);

  // 组织架构树
  const organizationTree = useMemo((): OrganizationNode[] => {
    const buildTree = (parentId?: string): OrganizationNode[] => {
      return departments
        .filter((dept) => dept.parentId === parentId)
        .map((dept) => ({
          id: dept.id,
          name: dept.name,
          type: "department",
          parentId: dept.parentId,
          children: [
            ...buildTree(dept.id),
            ...personnel
              .filter((person) => person.department === dept.name)
              .map((person) => ({
                id: person.id,
                name: person.name,
                type: "person" as const,
                parentId: dept.id,
                children: [],
                data: person,
              })),
          ],
          data: dept,
          expanded: true,
        }));
    };

    return buildTree();
  }, [departments, personnel]);

  // 更新过滤条件
  const updateFilters = useCallback((newFilters: Partial<PersonnelSearchFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  // 清除过滤条件
  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setFilters({
      searchTerm: "",
      department: "",
      position: "",
      employeeType: "",
      status: "",
      manager: "",
    });
  }, []);

  // 选择操作
  const selectPersonnel = useCallback((id: string) => {
    setSelectedPersonnel((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const selectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelectedPersonnel(new Set(filteredPersonnel.map((p) => p.id)));
      } else {
        setSelectedPersonnel(new Set());
      }
    },
    [filteredPersonnel]
  );

  const clearSelection = useCallback(() => {
    setSelectedPersonnel(new Set());
  }, []);

  // CRUD操作
  const createPersonnel = useCallback(async (data: PersonnelFormData) => {
    setLoading(true);
    setError(null);

    try {
      // 调用后端API创建用户
      const response = await apiCall(`${API_BASE}/users`, {
        method: 'POST',
        body: JSON.stringify({
          employeeId: data.employeeId,
          userName: data.name,
          email: data.email,
          phone: data.phone,
          department: data.department,
          position: data.position,
          userType: mapEmployeeTypeToBackend(data.employeeType),
          status: mapStatusToBackend(data.status),
          hireDate: data.hireDate?.toISOString(),
          manager: data.manager,
          workLocation: data.workLocation,
          emergencyContact: data.emergencyContact,
          emergencyPhone: data.emergencyPhone,
          notes: data.notes,
        }),
      });

      if (!response.ok) {
        throw new Error('创建用户失败');
      }

      const result = await response.json();
      
      // 重新加载数据以确保同步
      const updatedData = await fetchPersonnel();
      setPersonnel(updatedData);

      toast({
        title: "创建成功",
        description: "员工信息创建成功",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "创建失败";
      setError(errorMessage);
      toast({
        title: "创建失败",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updatePersonnel = useCallback(async (id: string, data: Partial<PersonnelFormData>) => {
    setLoading(true);
    setError(null);

    try {
      console.log('更新用户数据:', { id, data }); // 调试日志
      
      // 调用后端API更新用户
      const response = await apiCall(`${API_BASE}/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          employeeId: data.employeeId,
          userName: data.name,
          email: data.email,
          phone: data.phone,
          department: data.department,
          position: data.position,
          userType: mapEmployeeTypeToBackend(data.employeeType || 'full-time'),
          status: mapStatusToBackend(data.status || 'active'),
          hireDate: data.hireDate?.toISOString(),
          manager: data.manager,
          workLocation: data.workLocation,
          emergencyContact: data.emergencyContact,
          emergencyPhone: data.emergencyPhone,
          notes: data.notes,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('更新用户失败响应:', errorText);
        throw new Error(`更新用户失败: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      console.log('更新用户成功响应:', result);

      // 重新加载数据以确保同步
      const updatedData = await fetchPersonnel();
      setPersonnel(updatedData);

      toast({
        title: "更新成功",
        description: "员工信息更新成功",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "更新失败";
      console.error('更新用户错误:', err);
      setError(errorMessage);
      toast({
        title: "更新失败",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const deletePersonnel = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      // 调用后端API删除用户
      const response = await apiCall(`${API_BASE}/users/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('删除用户失败');
      }

      // 重新加载数据以确保同步
      const updatedData = await fetchPersonnel();
      setPersonnel(updatedData);
      
      setSelectedPersonnel((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });

      toast({
        title: "删除成功",
        description: "员工信息删除成功",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "删除失败";
      setError(errorMessage);
      toast({
        title: "删除失败",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // 批量操作
  const batchUpdate = useCallback(async (operation: BatchOperation) => {
    setLoading(true);
    setError(null);

    try {
      const { type, targetIds, value } = operation;
      
      // 批量更新每个用户
      const updatePromises = targetIds.map(async (id) => {
        const user = personnel.find(p => p.id === id);
        if (!user) return;

        const updateData: any = {
          employeeId: user.employeeId,
          userName: user.name,
          email: user.email,
          phone: user.phone,
          department: type === 'department' ? value : user.department,
          position: user.position,
          userType: mapEmployeeTypeToBackend(user.employeeType),
          status: type === 'status' ? mapStatusToBackend(value as PersonnelInfo["status"]) : mapStatusToBackend(user.status),
          hireDate: user.hireDate?.toISOString(),
          manager: type === 'manager' ? value : user.manager,
          workLocation: user.workLocation,
          emergencyContact: user.emergencyContact,
          emergencyPhone: user.emergencyPhone,
          notes: user.notes,
        };

        const response = await apiCall(`${API_BASE}/users/${id}`, {
          method: 'PUT',
          body: JSON.stringify(updateData),
        });

        if (!response.ok) {
          throw new Error(`更新用户 ${user.name} 失败`);
        }
      });

      await Promise.all(updatePromises);

      // 重新加载数据以确保同步
      const updatedData = await fetchPersonnel();
      setPersonnel(updatedData);

      clearSelection();
      toast({
        title: "批量操作成功",
        description: `共处理 ${targetIds.length} 个员工`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "批量操作失败";
      setError(errorMessage);
      toast({
        title: "批量操作失败",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [personnel, clearSelection, toast]);

  const batchDelete = useCallback(async (ids: string[]) => {
    setLoading(true);
    setError(null);

    try {
      // 批量删除每个用户
      const deletePromises = ids.map(async (id) => {
        const response = await apiCall(`${API_BASE}/users/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error(`删除用户失败: ${id}`);
        }
      });

      await Promise.all(deletePromises);

      // 重新加载数据以确保同步
      const updatedData = await fetchPersonnel();
      setPersonnel(updatedData);
      
      clearSelection();

      toast({
        title: "批量删除成功",
        description: `共删除 ${ids.length} 个员工`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "批量删除失败";
      setError(errorMessage);
      toast({
        title: "批量删除失败",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [clearSelection, toast]);

  // 导入导出
  const importPersonnel = useCallback(async (file: File): Promise<ImportResult> => {
    setLoading(true);
    setError(null);

    try {
      // 创建FormData对象
      const formData = new FormData();
      formData.append('file', file);

      // 调用后端API
      const response = await fetch('http://1.15.34.167:8080/api/users/import', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.code !== 200) {
        throw new Error(result.message || '导入失败');
      }

      const importData = result.data;
      const importResult: ImportResult = {
        success: importData.success || false,
        totalRecords: importData.totalRecords || 0,
        successCount: importData.successCount || 0,
        errorCount: importData.errorCount || 0,
        errors: importData.errors || [],
      };

      if (importResult.successCount > 0) {
        toast({
          title: "导入成功",
          description: `导入成功 ${importResult.successCount} 条记录`,
        });
        // 导入成功后刷新数据
        try {
          const data = await fetchPersonnel();
          setPersonnel(data);
        } catch (refreshErr) {
          console.error('刷新数据失败:', refreshErr);
        }
      }

      if (importResult.errorCount > 0) {
        toast({
          title: "部分导入失败",
          description: `${importResult.errorCount} 条记录导入失败，请检查错误详情`,
          variant: "destructive",
        });
      }

      return importResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "导入失败";
      setError(errorMessage);
      toast({
        title: "导入失败",
        description: errorMessage,
        variant: "destructive",
      });
      
      return {
        success: false,
        totalRecords: 0,
        successCount: 0,
        errorCount: 0,
        errors: [],
      };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const exportPersonnel = useCallback(async (config: ExportConfig) => {
    setLoading(true);
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // 模拟导出数据
      const dataToExport = filteredPersonnel.filter((person) => {
        if (!config.includeInactive && person.status === "inactive") {
          return false;
        }
        return true;
      });

      toast({
        title: "导出成功",
        description: `共 ${dataToExport.length} 条记录`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "导出失败";
      setError(errorMessage);
      toast({
        title: "导出失败",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [filteredPersonnel, toast]);

  // 组织架构操作
  const updateOrganization = useCallback(async (nodeId: string, parentId?: string) => {
    setLoading(true);
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      toast({
        title: "更新成功",
        description: "组织架构更新成功",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "更新失败";
      setError(errorMessage);
      toast({
        title: "更新失败",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // 操作日志
  const getOperationLogs = useCallback(async (targetId?: string) => {
    setLoading(true);
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      // 模拟操作日志数据
      const mockLogs: OperationLog[] = [];
      setOperationLogs(mockLogs);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "获取日志失败";
      setError(errorMessage);
      toast({
        title: "获取日志失败",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // 刷新数据
  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchPersonnel();
      setPersonnel(data);
      toast({
        title: "刷新成功",
        description: "数据已更新",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "刷新失败";
      setError(errorMessage);
      toast({
        title: "刷新失败",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    // 数据状态
    personnel,
    departments,
    filteredPersonnel,
    selectedPersonnel,
    stats,
    loading,
    error,

    // 搜索和过滤
    searchTerm,
    filters,
    setSearchTerm,
    setFilters: updateFilters,
    clearFilters,

    // 选择操作
    selectPersonnel,
    selectAll,
    clearSelection,

    // CRUD操作
    createPersonnel,
    updatePersonnel,
    deletePersonnel,

    // 批量操作
    batchUpdate,
    batchDelete,

    // 导入导出
    importPersonnel,
    exportPersonnel,

    // 组织架构
    organizationTree,
    updateOrganization,

    // 操作日志
    operationLogs,
    getOperationLogs,

    // 刷新数据
    refreshData,
  };
} 