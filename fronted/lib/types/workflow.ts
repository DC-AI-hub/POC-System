export type WorkflowStatus = 'pending' | 'in-progress' | 'completed' | 'rejected'

// 原有工作流步骤（用于工作流跟踪器）
export interface WorkflowStep {
  id: string
  name: string
  status: WorkflowStatus
  approver?: string
  approvedAt?: Date
  comment?: string
  position?: number
  icon?: string
  description?: string
}

export interface WorkflowData {
  id: string
  title: string
  applicant: string
  applicationDate: Date
  currentStep: number
  steps: WorkflowStep[]
  status: 'draft' | 'in-progress' | 'completed' | 'rejected'
}

export interface WorkflowStepDetailProps {
  step: WorkflowStep
  isOpen: boolean
  onClose: () => void
}

export interface WorkflowTrackerProps {
  workflow: WorkflowData
  className?: string
  onStepClick?: (step: WorkflowStep) => void
  showDetails?: boolean
  orientation?: 'horizontal' | 'vertical'
}

// 工作流步骤配置
export const WORKFLOW_STEPS_CONFIG: Omit<WorkflowStep, 'status' | 'approver' | 'approvedAt' | 'comment'>[] = [
  {
    id: 'applicant',
    name: '申请发起',
    position: 0,
    icon: 'User',
    description: '员工提交费用申请'
  },
  {
    id: 'aa1-approval',
    name: 'AA1资格审批',
    position: 1,
    icon: 'Shield',
    description: '具有AA1资格的人员审批'
  },
  {
    id: 'supervisor-approval',
    name: '直属主管审批',
    position: 2,
    icon: 'UserCheck',
    description: '申请人直属主管审批'
  },
  {
    id: 'ghbc-finance-approval',
    name: 'GHBC财务组审批',
    position: 3,
    icon: 'Calculator',
    description: 'GHBC财务组相关人员审批'
  },
  {
    id: 'ghbc-compliance-approval',
    name: 'GHBC合规组审批',
    position: 4,
    icon: 'FileCheck',
    description: 'GHBC合规组相关人员审批'
  },
  {
    id: 'functional-head-approval',
    name: 'Functional Head审批',
    position: 5,
    icon: 'Crown',
    description: '功能负责人审批'
  },
  {
    id: 'coo-ceo-approval',
    name: 'COO/CEO审批',
    position: 6,
    icon: 'Star',
    description: '首席运营官/首席执行官审批'
  },
  {
    id: 'completed',
    name: '审批完成',
    position: 7,
    icon: 'CheckCircle',
    description: '审批流程完成'
  }
]

// ===== 灵活审批相关类型 =====

// 审批人类型
export type ApproverType = 'user' | 'group' | 'role';

// 审批模式
export type ApprovalMode = 
  | 'sequential'     // 顺序审批
  | 'parallel'       // 并行审批 - 需要所有人同意
  | 'any_one'        // 并行审批 - 任意一人同意即可
  | 'majority'       // 并行审批 - 多数人同意
  | 'weighted';      // 权重审批

// 动态分配条件类型
export type DynamicAssignmentCondition = 
  | 'amount_based'    // 基于金额
  | 'department_based' // 基于部门
  | 'type_based'      // 基于申请类型
  | 'custom_rule';    // 自定义规则

// 审批人定义
export interface ApproverDefinition {
  id: string;
  type: ApproverType;
  name: string;
  // 当type为user时
  userId?: string;
  email?: string;
  // 当type为group时
  groupId?: string;
  members?: string[]; // 用户ID列表
  // 当type为role时
  roleId?: string;
  // 权重（用于权重审批）
  weight?: number;
  // 是否必需
  isRequired?: boolean;
}

// 审批组配置
export interface ApprovalGroup {
  id: string;
  name: string;
  description: string;
  mode: ApprovalMode;
  approvers: ApproverDefinition[];
  // 并行审批的通过条件
  passCondition?: {
    type: 'all' | 'any' | 'majority' | 'weighted';
    minWeight?: number; // 权重审批的最小权重
    minCount?: number;  // 最少通过人数
  };
  // 超时设置
  timeoutHours?: number;
  // 委托设置
  allowDelegate?: boolean;
  autoDelegate?: {
    enabled: boolean;
    targetUserId?: string;
    condition?: string; // 委托条件，如"离职"、"请假"等
  };
}

// 动态分配规则
export interface DynamicAssignmentRule {
  id: string;
  name: string;
  condition: DynamicAssignmentCondition;
  rules: {
    // 金额条件
    amountRange?: {
      min?: number;
      max?: number;
    };
    // 部门条件
    departments?: string[];
    // 类型条件
    types?: string[];
    // 自定义条件表达式
    customExpression?: string;
  };
  // 分配的审批组或审批人
  assignTo: {
    type: 'group' | 'user' | 'role';
    id: string;
  };
  priority: number; // 规则优先级
}

// 委托配置
export interface DelegationConfig {
  id: string;
  delegatorId: string;
  delegatorName: string;
  delegateeId: string;
  delegateeName: string;
  startDate: Date;
  endDate: Date;
  scopes: string[]; // 委托范围，如特定的审批步骤
  isActive: boolean;
  reason?: string;
}

// ===== 审批管理相关类型 =====

// 审批申请项（扩展）
export interface ApprovalItem {
  id: string;
  applicationId: string;
  applicant: string;
  applicantId: string;
  type: 'expense' | 'travel';
  amount: number;
  currentStep: string;
  status: 'pending' | 'approved' | 'rejected' | 'in-progress';
  submittedAt: Date;
  deadline: Date;
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  department: string;
  nextApprover?: string;
  attachments?: string[];
  
  // 灵活审批字段
  currentApprovalGroup?: ApprovalGroup;
  pendingApprovers?: ApproverDefinition[];
  approvalMode?: ApprovalMode;
  approvalProgress?: {
    total: number;
    approved: number;
    required: number;
  };
  dynamicallyAssigned?: boolean;
  delegatedFrom?: string; // 委托人ID
}

// 审批工作流步骤（与原有WorkflowStep区分）
export interface ApprovalWorkflowStep {
  id: string;
  name: string;
  order: number;
  status: 'pending' | 'in-progress' | 'completed' | 'rejected' | 'skipped';
  approver?: string;
  approverId?: string;
  approvedAt?: Date;
  comment?: string;
  action?: 'approve' | 'reject' | 'return';
  isRequired: boolean;
  
  // 灵活审批字段
  approvalGroup?: ApprovalGroup;
  mode?: ApprovalMode;
  pendingApprovers?: ApproverDefinition[];
  completedApprovers?: {
    approverId: string;
    approverName: string;
    action: 'approve' | 'reject';
    timestamp: Date;
    comment?: string;
  }[];
  isDynamicallyAssigned?: boolean;
}

// 审批历史记录
export interface ApprovalHistory {
  id: string;
  stepId: string;
  stepName: string;
  approver: string;
  approverId: string;
  action: 'approve' | 'reject' | 'return' | 'submit';
  comment: string;
  timestamp: Date;
  attachments?: string[];
  
  // 灵活审批字段
  approvalMode?: ApprovalMode;
  isDelegated?: boolean;
  delegatedFrom?: string;
  groupProgress?: {
    total: number;
    approved: number;
    rejected: number;
  };
}

// 审批详情
export interface ApprovalDetail {
  id: string;
  applicationId: string;
  applicant: string;
  applicantId: string;
  type: 'expense' | 'travel';
  title: string;
  description: string;
  amount: number;
  department: string;
  submittedAt: Date;
  currentStep: string;
  status: 'pending' | 'approved' | 'rejected' | 'in-progress';
  priority: 'low' | 'medium' | 'high';
  deadline: Date;
  
  // 工作流信息
  workflowSteps: ApprovalWorkflowStep[];
  approvalHistory: ApprovalHistory[];
  
  // 申请详细信息
  applicationData: any;
  attachments: string[];
  
  // 权限信息
  canApprove: boolean;
  canReject: boolean;
  canReturn: boolean;
  canView: boolean;
  
  // 灵活审批信息
  currentApprovalGroup?: ApprovalGroup;
  dynamicAssignmentRules?: DynamicAssignmentRule[];
  activeDelegations?: DelegationConfig[];
}

// 审批操作（扩展）
export interface ApprovalAction {
  applicationId: string;
  action: 'approve' | 'reject' | 'return';
  comment: string;
  attachments?: string[];
  nextApprover?: string;
  
  // 灵活审批字段
  approverType?: ApproverType;
  isDelegated?: boolean;
  delegatedFrom?: string;
  groupId?: string; // 当前审批组ID
}

// 批量审批操作
export interface BatchApprovalAction {
  applicationIds: string[];
  action: 'approve' | 'reject';
  comment: string;
}

// 审批统计
export interface ApprovalStats {
  totalPending: number;
  totalApproved: number;
  totalRejected: number;
  totalOverdue: number;
  avgProcessingTime: number;
  myPendingCount: number;
  myApprovedToday: number;
  myApprovedThisWeek: number;
  myApprovedThisMonth: number;
  
  // 按类型统计
  expenseCount: number;
  travelCount: number;
  
  // 按优先级统计
  highPriorityCount: number;
  mediumPriorityCount: number;
  lowPriorityCount: number;
  
  // 按状态统计
  statusStats: {
    pending: number;
    approved: number;
    rejected: number;
    inProgress: number;
  };
  
  // 灵活审批统计
  parallelApprovalCount: number;
  sequentialApprovalCount: number;
  delegatedApprovalCount: number;
  dynamicAssignmentCount: number;
}

// 审批过滤条件（扩展）
export interface ApprovalFilters {
  type?: 'expense' | 'travel' | 'all';
  status?: 'pending' | 'approved' | 'rejected' | 'in-progress' | 'all';
  priority?: 'low' | 'medium' | 'high' | 'all';
  department?: string;
  applicant?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  amountRange?: {
    min: number;
    max: number;
  };
  currentStep?: string;
  overdue?: boolean;
  
  // 灵活审批过滤
  approvalMode?: ApprovalMode | 'all';
  isDelegated?: boolean;
  isDynamicallyAssigned?: boolean;
  approvalGroup?: string;
}

// 审批权限
export interface ApprovalPermissions {
  canApproveAA1: boolean;
  canApproveSupervisor: boolean;
  canApproveFinance: boolean;
  canApproveCompliance: boolean;
  canApproveFunctionalHead: boolean;
  canApproveCEO: boolean;
  canViewAll: boolean;
  canBatchApprove: boolean;
  canDelegate: boolean;
  
  // 灵活审批权限
  canConfigureApprovalGroups: boolean;
  canSetupDynamicAssignment: boolean;
  canManageDelegations: boolean;
  canViewApprovalAnalytics: boolean;
}

// 用户角色
export type UserRole = 
  | 'aa1_approver'
  | 'supervisor'
  | 'finance_approver'
  | 'compliance_approver'
  | 'functional_head'
  | 'ceo'
  | 'admin'
  | 'employee';

// 审批配置
export interface ApprovalConfig {
  workflowSteps: {
    id: string;
    name: string;
    order: number;
    requiredRoles: UserRole[];
    isParallel: boolean;
    isOptional: boolean;
    timeoutHours: number;
  }[];
  
  amountThresholds: {
    aa1Required: number;
    supervisorRequired: number;
    financeRequired: number;
    complianceRequired: number;
    functionalHeadRequired: number;
    ceoRequired: number;
  };
  
  autoApprovalRules: {
    maxAmount: number;
    allowedTypes: string[];
    requiredConditions: string[];
  };
  
  // 灵活审批配置
  approvalGroups: ApprovalGroup[];
  dynamicAssignmentRules: DynamicAssignmentRule[];
  delegationSettings: {
    maxDelegationDays: number;
    allowChainDelegation: boolean;
    requireApproval: boolean;
  };
}

// Hook返回类型（扩展）
export interface UseApprovalManagementReturn {
  // 数据状态
  approvalItems: ApprovalItem[];
  filteredItems: ApprovalItem[];
  selectedItems: Set<string>;
  currentApproval: ApprovalDetail | null;
  stats: ApprovalStats;
  permissions: ApprovalPermissions;
  loading: boolean;
  error: string | null;
  
  // 搜索和过滤
  searchTerm: string;
  filters: ApprovalFilters;
  setSearchTerm: (term: string) => void;
  setFilters: (filters: Partial<ApprovalFilters>) => void;
  clearFilters: () => void;
  
  // 选择操作
  selectItem: (id: string) => void;
  selectAll: (checked: boolean) => void;
  clearSelection: () => void;
  
  // 审批操作
  approveApplication: (action: ApprovalAction) => Promise<void>;
  batchApprove: (action: BatchApprovalAction) => Promise<void>;
  getApprovalDetail: (id: string) => Promise<ApprovalDetail>;
  
  // 数据刷新
  refreshData: () => Promise<void>;
  
  // 实时更新
  enableRealTimeUpdates: () => void;
  disableRealTimeUpdates: () => void;
  
  // 灵活审批功能
  approvalGroups: ApprovalGroup[];
  dynamicAssignmentRules: DynamicAssignmentRule[];
  activeDelegations: DelegationConfig[];
  createApprovalGroup: (group: Omit<ApprovalGroup, 'id'>) => Promise<void>;
  updateApprovalGroup: (id: string, group: Partial<ApprovalGroup>) => Promise<void>;
  deleteApprovalGroup: (id: string) => Promise<void>;
  createDynamicRule: (rule: Omit<DynamicAssignmentRule, 'id'>) => Promise<void>;
  updateDynamicRule: (id: string, rule: Partial<DynamicAssignmentRule>) => Promise<void>;
  deleteDynamicRule: (id: string) => Promise<void>;
  createDelegation: (delegation: Omit<DelegationConfig, 'id'>) => Promise<void>;
  updateDelegation: (id: string, delegation: Partial<DelegationConfig>) => Promise<void>;
  deleteDelegation: (id: string) => Promise<void>;
}

// 审批工作流节点定义
export const APPROVAL_WORKFLOW_STEPS = {
  AA1_APPROVAL: {
    id: 'aa1_approval',
    name: 'AA1资格审批',
    order: 1,
    requiredRoles: ['aa1_approver'] as UserRole[],
  },
  SUPERVISOR_APPROVAL: {
    id: 'supervisor_approval',
    name: '直属主管审批',
    order: 2,
    requiredRoles: ['supervisor'] as UserRole[],
  },
  FINANCE_APPROVAL: {
    id: 'finance_approval',
    name: 'GHBC财务组审批',
    order: 3,
    requiredRoles: ['finance_approver'] as UserRole[],
  },
  COMPLIANCE_APPROVAL: {
    id: 'compliance_approval',
    name: 'GHBC合规组审批',
    order: 4,
    requiredRoles: ['compliance_approver'] as UserRole[],
  },
  FUNCTIONAL_HEAD_APPROVAL: {
    id: 'functional_head_approval',
    name: 'Functional Head审批',
    order: 5,
    requiredRoles: ['functional_head'] as UserRole[],
  },
  CEO_APPROVAL: {
    id: 'ceo_approval',
    name: 'COO/CEO审批',
    order: 6,
    requiredRoles: ['ceo'] as UserRole[],
  },
} as const;

// 优先级配置
export const PRIORITY_CONFIG = {
  high: {
    label: '高优先级',
    color: 'bg-red-100 text-red-800',
    deadline: 24, // 小时
  },
  medium: {
    label: '中优先级', 
    color: 'bg-yellow-100 text-yellow-800',
    deadline: 72, // 小时
  },
  low: {
    label: '低优先级',
    color: 'bg-green-100 text-green-800',
    deadline: 168, // 小时
  },
} as const;

// 申请类型配置
export const APPLICATION_TYPE_CONFIG = {
  expense: {
    label: '日常费用',
    icon: 'Receipt',
    color: 'bg-blue-100 text-blue-800',
  },
  travel: {
    label: '差旅费用',
    icon: 'Plane',
    color: 'bg-purple-100 text-purple-800',
  },
} as const; 