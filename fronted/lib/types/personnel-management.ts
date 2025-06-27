export interface PersonnelInfo {
  id: string;
  name: string;
  loginName: string;
  employeeId: string;
  department: string;
  position: string;
  manager: string;
  phone: string;
  email: string;
  employeeType: 'full-time' | 'part-time' | 'contractor';
  status: 'active' | 'inactive' | 'transferred' | 'resigned';
  hireDate: Date;
  lastModified: Date;
  // 扩展字段
  workLocation?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  notes?: string;
}

export interface Department {
  id: string;
  name: string;
  parentId?: string;
  level: number;
  managerId?: string;
  description?: string;
  children?: Department[];
}

export interface PersonnelFormData {
  // 基本信息
  name: string;
  loginName: string;
  employeeId: string;
  email: string;
  phone: string;
  
  // 组织关系
  department: string;
  position: string;
  manager: string;
  workLocation: string;
  
  // 员工类型和状态
  employeeType: 'full-time' | 'part-time' | 'contractor';
  status: 'active' | 'inactive' | 'transferred' | 'resigned';
  hireDate: Date;
  
  // 紧急联系人
  emergencyContact: string;
  emergencyPhone: string;
  
  // 备注
  notes?: string;
}

export interface PersonnelSearchFilters {
  searchTerm: string;
  department: string;
  position: string;
  employeeType: string;
  status: string;
  manager: string;
}

export interface BatchOperation {
  type: 'department' | 'status' | 'manager' | 'delete';
  targetIds: string[];
  value?: string;
}

export interface ImportResult {
  success: boolean;
  totalRecords: number;
  successCount: number;
  errorCount: number;
  errors: ImportError[];
}

export interface ImportError {
  row: number;
  field: string;
  message: string;
  value: string;
}

export interface PersonnelStats {
  totalCount: number;
  activeCount: number;
  inactiveCount: number;
  transferredCount: number;
  resignedCount: number;
  departmentStats: { [key: string]: number };
  typeStats: { [key: string]: number };
}

// 组织架构相关
export interface OrganizationNode {
  id: string;
  name: string;
  type: 'department' | 'person';
  parentId?: string;
  children: OrganizationNode[];
  data?: PersonnelInfo | Department;
  expanded?: boolean;
}

// 操作日志
export interface OperationLog {
  id: string;
  userId: string;
  userName: string;
  operation: 'create' | 'update' | 'delete' | 'batch_update' | 'import';
  targetType: 'personnel' | 'department';
  targetId: string;
  targetName: string;
  changes?: { [key: string]: { from: any; to: any } };
  timestamp: Date;
  description: string;
}

// 表单验证规则
export interface ValidationRule {
  field: keyof PersonnelFormData;
  required?: boolean;
  pattern?: RegExp;
  minLength?: number;
  maxLength?: number;
  customValidator?: (value: any) => string | null;
}

// 导出配置
export interface ExportConfig {
  format: 'excel' | 'csv' | 'pdf';
  fields: (keyof PersonnelInfo)[];
  filters?: PersonnelSearchFilters;
  includeInactive?: boolean;
}

// Hook返回类型
export interface UsePersonnelManagementReturn {
  // 数据状态
  personnel: PersonnelInfo[];
  departments: Department[];
  filteredPersonnel: PersonnelInfo[];
  selectedPersonnel: Set<string>;
  stats: PersonnelStats;
  loading: boolean;
  error: string | null;
  
  // 搜索和过滤
  searchTerm: string;
  filters: PersonnelSearchFilters;
  setSearchTerm: (term: string) => void;
  setFilters: (filters: Partial<PersonnelSearchFilters>) => void;
  clearFilters: () => void;
  
  // 选择操作
  selectPersonnel: (id: string) => void;
  selectAll: (checked: boolean) => void;
  clearSelection: () => void;
  
  // CRUD操作
  createPersonnel: (data: PersonnelFormData) => Promise<void>;
  updatePersonnel: (id: string, data: Partial<PersonnelFormData>) => Promise<void>;
  deletePersonnel: (id: string) => Promise<void>;
  
  // 批量操作
  batchUpdate: (operation: BatchOperation) => Promise<void>;
  batchDelete: (ids: string[]) => Promise<void>;
  
  // 导入导出
  importPersonnel: (file: File) => Promise<ImportResult>;
  exportPersonnel: (config: ExportConfig) => Promise<void>;
  
  // 组织架构
  organizationTree: OrganizationNode[];
  updateOrganization: (nodeId: string, parentId?: string) => Promise<void>;
  
  // 操作日志
  operationLogs: OperationLog[];
  getOperationLogs: (targetId?: string) => Promise<void>;
  
  // 刷新数据
  refreshData: () => Promise<void>;
} 