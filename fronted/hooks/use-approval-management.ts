import { useState, useEffect, useCallback, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/use-debounce';
import {
  ApprovalItem,
  ApprovalDetail,
  ApprovalAction,
  BatchApprovalAction,
  ApprovalStats,
  ApprovalFilters,
  ApprovalPermissions,
  UseApprovalManagementReturn,
  UserRole,
  ApprovalWorkflowStep,
  ApprovalHistory,
  APPROVAL_WORKFLOW_STEPS,
  PRIORITY_CONFIG,
  APPLICATION_TYPE_CONFIG,
  ApprovalGroup,
  DynamicAssignmentRule,
  DelegationConfig,
  ApproverDefinition,
  ApprovalMode
} from '@/lib/types/workflow';

// 模拟当前用户角色 - 实际项目中应从认证系统获取
const CURRENT_USER_ROLE: UserRole = 'supervisor'; // 可以是 'aa1_approver', 'supervisor', 'finance_approver' 等
const CURRENT_USER_ID = 'user123';
const CURRENT_USER_NAME = '张主管';

// 模拟审批组数据
const mockApprovalGroups: ApprovalGroup[] = [
  {
    id: 'group_1',
    name: '技术部主管组',
    description: '技术部门主管审批组',
    mode: 'any_one',
    approvers: [
      {
        id: 'approver_1',
        type: 'user',
        name: '张技术总监',
        userId: 'tech_director_zhang',
        email: 'zhang.tech@company.com',
        weight: 10,
        isRequired: true
      },
      {
        id: 'approver_2',
        type: 'user',
        name: '李项目经理',
        userId: 'pm_li',
        email: 'li.pm@company.com',
        weight: 8,
        isRequired: false
      },
      {
        id: 'approver_3',
        type: 'user',
        name: '王架构师',
        userId: 'architect_wang',
        email: 'wang.arch@company.com',
        weight: 9,
        isRequired: false
      }
    ],
    passCondition: {
      type: 'any',
      minCount: 1
    },
    timeoutHours: 48,
    allowDelegate: true
  },
  {
    id: 'group_2',
    name: '财务审批委员会',
    description: '大额费用审批委员会',
    mode: 'majority',
    approvers: [
      {
        id: 'approver_4',
        type: 'user',
        name: '陈财务总监',
        userId: 'finance_director_chen',
        email: 'chen.finance@company.com',
        weight: 15,
        isRequired: true
      },
      {
        id: 'approver_5',
        type: 'user',
        name: '赵会计经理',
        userId: 'accounting_zhao',
        email: 'zhao.acc@company.com',
        weight: 10,
        isRequired: true
      },
      {
        id: 'approver_6',
        type: 'user',
        name: '孙预算经理',
        userId: 'budget_sun',
        email: 'sun.budget@company.com',
        weight: 10,
        isRequired: false
      }
    ],
    passCondition: {
      type: 'majority',
      minCount: 2
    },
    timeoutHours: 72,
    allowDelegate: true
  },
  {
    id: 'group_3',
    name: '合规审核组',
    description: '合规性审核小组',
    mode: 'parallel',
    approvers: [
      {
        id: 'approver_7',
        type: 'user',
        name: '吴合规专员',
        userId: 'compliance_wu',
        email: 'wu.compliance@company.com',
        weight: 12,
        isRequired: true
      },
      {
        id: 'approver_8',
        type: 'user',
        name: '刘法务顾问',
        userId: 'legal_liu',
        email: 'liu.legal@company.com',
        weight: 12,
        isRequired: true
      }
    ],
    passCondition: {
      type: 'all',
      minCount: 2
    },
    timeoutHours: 24,
    allowDelegate: false
  },
  {
    id: 'group_4',
    name: '销售部门组',
    description: '销售部门审批组',
    mode: 'weighted',
    approvers: [
      {
        id: 'approver_9',
        type: 'user',
        name: '郑销售总监',
        userId: 'sales_director_zheng',
        email: 'zheng.sales@company.com',
        weight: 20,
        isRequired: true
      },
      {
        id: 'approver_10',
        type: 'user',
        name: '周区域经理',
        userId: 'regional_zhou',
        email: 'zhou.regional@company.com',
        weight: 15,
        isRequired: false
      },
      {
        id: 'approver_11',
        type: 'user',
        name: '徐客户经理',
        userId: 'account_xu',
        email: 'xu.account@company.com',
        weight: 10,
        isRequired: false
      }
    ],
    passCondition: {
      type: 'weighted',
      minWeight: 25
    },
    timeoutHours: 36,
    allowDelegate: true
  }
];

// 模拟动态分配规则
const mockDynamicRules: DynamicAssignmentRule[] = [
  {
    id: 'rule_1',
    name: '大额费用自动分配',
    condition: 'amount_based',
    rules: {
      amountRange: {
        min: 50000
      }
    },
    assignTo: {
      type: 'group',
      id: 'group_2'
    },
    priority: 1
  },
  {
    id: 'rule_2',
    name: '技术部费用分配',
    condition: 'department_based',
    rules: {
      departments: ['技术部', 'IT部', '研发部']
    },
    assignTo: {
      type: 'group',
      id: 'group_1'
    },
    priority: 2
  },
  {
    id: 'rule_3',
    name: '合规性审查',
    condition: 'type_based',
    rules: {
      types: ['travel']
    },
    assignTo: {
      type: 'group',
      id: 'group_3'
    },
    priority: 3
  },
  {
    id: 'rule_4',
    name: '销售差旅费',
    condition: 'custom_rule',
    rules: {
      customExpression: 'department === "销售部" && type === "travel" && amount > 10000'
    },
    assignTo: {
      type: 'group',
      id: 'group_4'
    },
    priority: 1
  }
];

// 模拟委托配置
const mockDelegations: DelegationConfig[] = [
  {
    id: 'delegation_1',
    delegatorId: 'tech_director_zhang',
    delegatorName: '张技术总监',
    delegateeId: 'pm_li',
    delegateeName: '李项目经理',
    startDate: new Date('2024-01-10T00:00:00'),
    endDate: new Date('2024-01-20T23:59:59'),
    scopes: ['aa1_approval', 'supervisor_approval'],
    isActive: true,
    reason: '出差期间委托审批'
  },
  {
    id: 'delegation_2',
    delegatorId: 'finance_director_chen',
    delegatorName: '陈财务总监',
    delegateeId: 'accounting_zhao',
    delegateeName: '赵会计经理',
    startDate: new Date('2024-01-12T00:00:00'),
    endDate: new Date('2024-01-25T23:59:59'),
    scopes: ['finance_approval'],
    isActive: true,
    reason: '年假期间委托'
  }
];

// 模拟审批数据（大幅增加示例数据）
const mockApprovalItems: ApprovalItem[] = [
  {
    id: '1',
    applicationId: 'APP001',
    applicant: '李小明',
    applicantId: 'emp001',
    type: 'expense',
    amount: 5000,
    currentStep: 'aa1_approval',
    status: 'pending',
    submittedAt: new Date('2024-01-15T09:00:00'),
    deadline: new Date('2024-01-17T18:00:00'),
    priority: 'high',
    title: '办公用品采购申请',
    description: '采购打印机、纸张等办公用品',
    department: '技术部',
    nextApprover: '王经理',
    attachments: ['receipt1.pdf', 'quote1.pdf'],
    currentApprovalGroup: mockApprovalGroups[0],
    pendingApprovers: mockApprovalGroups[0].approvers,
    approvalMode: 'any_one',
    approvalProgress: {
      total: 3,
      approved: 0,
      required: 1
    },
    dynamicallyAssigned: true
  },
  {
    id: '2',
    applicationId: 'APP002',
    applicant: '王小红',
    applicantId: 'emp002',
    type: 'travel',
    amount: 8000,
    currentStep: 'supervisor_approval',
    status: 'in-progress',
    submittedAt: new Date('2024-01-14T14:30:00'),
    deadline: new Date('2024-01-18T18:00:00'),
    priority: 'medium',
    title: '北京出差费用报销',
    description: '参加技术会议差旅费用',
    department: '技术部',
    nextApprover: '张主管',
    attachments: ['ticket.pdf', 'hotel.pdf'],
    currentApprovalGroup: mockApprovalGroups[2],
    pendingApprovers: mockApprovalGroups[2].approvers,
    approvalMode: 'parallel',
    approvalProgress: {
      total: 2,
      approved: 1,
      required: 2
    },
    dynamicallyAssigned: true
  },
  {
    id: '3',
    applicationId: 'APP003',
    applicant: '刘大强',
    applicantId: 'emp003',
    type: 'expense',
    amount: 2000,
    currentStep: 'finance_approval',
    status: 'pending',
    submittedAt: new Date('2024-01-13T11:15:00'),
    deadline: new Date('2024-01-20T18:00:00'),
    priority: 'low',
    title: '团队聚餐费用',
    description: '月度团队建设聚餐',
    department: '市场部',
    nextApprover: '财务部',
    attachments: ['invoice.pdf'],
    approvalMode: 'sequential',
    approvalProgress: {
      total: 1,
      approved: 0,
      required: 1
    },
    dynamicallyAssigned: false
  },
  {
    id: '4',
    applicationId: 'APP004',
    applicant: '陈小花',
    applicantId: 'emp004',
    type: 'travel',
    amount: 12000,
    currentStep: 'compliance_approval',
    status: 'pending',
    submittedAt: new Date('2024-01-12T16:45:00'),
    deadline: new Date('2024-01-19T18:00:00'),
    priority: 'high',
    title: '上海客户拜访',
    description: '重要客户商务拜访',
    department: '销售部',
    nextApprover: '合规部',
    attachments: ['proposal.pdf', 'contract.pdf'],
    currentApprovalGroup: mockApprovalGroups[2],
    pendingApprovers: mockApprovalGroups[2].approvers,
    approvalMode: 'parallel',
    approvalProgress: {
      total: 2,
      approved: 0,
      required: 2
    },
    dynamicallyAssigned: true
  },
  {
    id: '5',
    applicationId: 'APP005',
    applicant: '赵小明',
    applicantId: 'emp005',
    type: 'expense',
    amount: 25000,
    currentStep: 'ceo_approval',
    status: 'pending',
    submittedAt: new Date('2024-01-11T10:20:00'),
    deadline: new Date('2024-01-16T18:00:00'),
    priority: 'high',
    title: '设备采购申请',
    description: '服务器设备采购',
    department: 'IT部',
    nextApprover: 'CEO',
    attachments: ['quote.pdf', 'specs.pdf'],
    approvalMode: 'sequential',
    approvalProgress: {
      total: 1,
      approved: 0,
      required: 1
    },
    dynamicallyAssigned: false
  },
  {
    id: '6',
    applicationId: 'APP006',
    applicant: '孙小军',
    applicantId: 'emp006',
    type: 'expense',
    amount: 60000,
    currentStep: 'finance_approval',
    status: 'in-progress',
    submittedAt: new Date('2024-01-10T08:30:00'),
    deadline: new Date('2024-01-15T18:00:00'),
    priority: 'high',
    title: '大型设备采购',
    description: '生产线设备采购',
    department: '生产部',
    nextApprover: '财务审批委员会',
    attachments: ['contract.pdf', 'technical_specs.pdf'],
    currentApprovalGroup: mockApprovalGroups[1],
    pendingApprovers: mockApprovalGroups[1].approvers,
    approvalMode: 'majority',
    approvalProgress: {
      total: 3,
      approved: 1,
      required: 2
    },
    dynamicallyAssigned: true
  },
  {
    id: '7',
    applicationId: 'APP007',
    applicant: '周小敏',
    applicantId: 'emp007',
    type: 'travel',
    amount: 15000,
    currentStep: 'supervisor_approval',
    status: 'pending',
    submittedAt: new Date('2024-01-09T15:20:00'),
    deadline: new Date('2024-01-14T18:00:00'),
    priority: 'medium',
    title: '欧洲客户考察',
    description: '欧洲分公司业务考察',
    department: '销售部',
    nextApprover: '销售部门组',
    attachments: ['itinerary.pdf', 'business_case.pdf'],
    currentApprovalGroup: mockApprovalGroups[3],
    pendingApprovers: mockApprovalGroups[3].approvers,
    approvalMode: 'weighted',
    approvalProgress: {
      total: 3,
      approved: 1,
      required: 25 // 权重值
    },
    dynamicallyAssigned: true,
    delegatedFrom: 'sales_director_zheng'
  },
  {
    id: '8',
    applicationId: 'APP008',
    applicant: '吴小亮',
    applicantId: 'emp008',
    type: 'expense',
    amount: 3500,
    currentStep: 'aa1_approval',
    status: 'approved',
    submittedAt: new Date('2024-01-08T12:00:00'),
    deadline: new Date('2024-01-12T18:00:00'),
    priority: 'low',
    title: '培训费用报销',
    description: '技术培训课程费用',
    department: '技术部',
    nextApprover: '',
    attachments: ['training_receipt.pdf'],
    approvalMode: 'sequential',
    approvalProgress: {
      total: 1,
      approved: 1,
      required: 1
    },
    dynamicallyAssigned: false
  },
  {
    id: '9',
    applicationId: 'APP009',
    applicant: '郑小丽',
    applicantId: 'emp009',
    type: 'travel',
    amount: 22000,
    currentStep: 'compliance_approval',
    status: 'in-progress',
    submittedAt: new Date('2024-01-07T09:45:00'),
    deadline: new Date('2024-01-13T18:00:00'),
    priority: 'high',
    title: '美国技术交流',
    description: '与美国合作伙伴技术交流',
    department: '研发部',
    nextApprover: '合规审核组',
    attachments: ['invitation.pdf', 'agenda.pdf'],
    currentApprovalGroup: mockApprovalGroups[2],
    pendingApprovers: mockApprovalGroups[2].approvers,
    approvalMode: 'parallel',
    approvalProgress: {
      total: 2,
      approved: 1,
      required: 2
    },
    dynamicallyAssigned: true
  },
  {
    id: '10',
    applicationId: 'APP010',
    applicant: '何小波',
    applicantId: 'emp010',
    type: 'expense',
    amount: 8500,
    currentStep: 'supervisor_approval',
    status: 'rejected',
    submittedAt: new Date('2024-01-06T16:30:00'),
    deadline: new Date('2024-01-10T18:00:00'),
    priority: 'medium',
    title: '市场活动费用',
    description: '产品发布会活动费用',
    department: '市场部',
    nextApprover: '',
    attachments: ['event_proposal.pdf'],
    approvalMode: 'sequential',
    approvalProgress: {
      total: 1,
      approved: 0,
      required: 1
    },
    dynamicallyAssigned: false
  },
  {
    id: '11',
    applicationId: 'APP011',
    applicant: '冯小雅',
    applicantId: 'emp011',
    type: 'travel',
    amount: 18000,
    currentStep: 'finance_approval',
    status: 'pending',
    submittedAt: new Date('2024-01-05T11:00:00'),
    deadline: new Date('2024-01-11T18:00:00'),
    priority: 'medium',
    title: '日本供应商拜访',
    description: '供应链合作洽谈',
    department: '采购部',
    nextApprover: '财务审批委员会',
    attachments: ['supplier_info.pdf', 'negotiation_plan.pdf'],
    currentApprovalGroup: mockApprovalGroups[1],
    pendingApprovers: mockApprovalGroups[1].approvers,
    approvalMode: 'majority',
    approvalProgress: {
      total: 3,
      approved: 0,
      required: 2
    },
    dynamicallyAssigned: true,
    delegatedFrom: 'finance_director_chen'
  },
  {
    id: '12',
    applicationId: 'APP012',
    applicant: '蒋小峰',
    applicantId: 'emp012',
    type: 'expense',
    amount: 4200,
    currentStep: 'aa1_approval',
    status: 'pending',
    submittedAt: new Date('2024-01-04T14:15:00'),
    deadline: new Date('2024-01-08T18:00:00'),
    priority: 'low',
    title: '办公家具采购',
    description: '会议室桌椅采购',
    department: '行政部',
    nextApprover: '技术部主管组',
    attachments: ['furniture_quote.pdf'],
    currentApprovalGroup: mockApprovalGroups[0],
    pendingApprovers: mockApprovalGroups[0].approvers,
    approvalMode: 'any_one',
    approvalProgress: {
      total: 3,
      approved: 0,
      required: 1
    },
    dynamicallyAssigned: true
  }
];

export function useApprovalManagement(): UseApprovalManagementReturn {
  // 状态管理
  const [approvalItems, setApprovalItems] = useState<ApprovalItem[]>(mockApprovalItems);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [currentApproval, setCurrentApproval] = useState<ApprovalDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 灵活审批状态
  const [approvalGroups, setApprovalGroups] = useState<ApprovalGroup[]>(mockApprovalGroups);
  const [dynamicAssignmentRules, setDynamicAssignmentRules] = useState<DynamicAssignmentRule[]>(mockDynamicRules);
  const [activeDelegations, setActiveDelegations] = useState<DelegationConfig[]>(mockDelegations);
  
  // 搜索和过滤
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<ApprovalFilters>({
    type: 'all',
    status: 'all',
    priority: 'all',
    overdue: false,
    approvalMode: 'all',
    isDelegated: false,
    isDynamicallyAssigned: false
  });
  
  const { toast } = useToast();
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  // 用户权限（基于当前用户角色）
  const permissions = useMemo((): ApprovalPermissions => {
    const role = CURRENT_USER_ROLE;
    return {
      canApproveAA1: role === 'aa1_approver' || role === 'admin',
      canApproveSupervisor: role === 'supervisor' || role === 'admin',
      canApproveFinance: role === 'finance_approver' || role === 'admin',
      canApproveCompliance: role === 'compliance_approver' || role === 'admin',
      canApproveFunctionalHead: role === 'functional_head' || role === 'admin',
      canApproveCEO: role === 'ceo' || role === 'admin',
      canViewAll: role === 'admin' || role === 'finance_approver',
      canBatchApprove: true,
      canDelegate: role !== 'employee',
      canConfigureApprovalGroups: role === 'admin' || role === 'supervisor',
      canSetupDynamicAssignment: role === 'admin',
      canManageDelegations: role === 'admin' || role === 'supervisor',
      canViewApprovalAnalytics: role === 'admin' || role === 'supervisor' || role === 'finance_approver'
    };
  }, []);
  
  // 过滤后的数据
  const filteredItems = useMemo(() => {
    let filtered = approvalItems;
    
    // 权限过滤：只显示当前用户可以审批的项目
    if (!permissions.canViewAll) {
      filtered = filtered.filter(item => {
        const currentStep = item.currentStep;
        switch (currentStep) {
          case 'aa1_approval':
            return permissions.canApproveAA1;
          case 'supervisor_approval':
            return permissions.canApproveSupervisor;
          case 'finance_approval':
            return permissions.canApproveFinance;
          case 'compliance_approval':
            return permissions.canApproveCompliance;
          case 'functional_head_approval':
            return permissions.canApproveFunctionalHead;
          case 'ceo_approval':
            return permissions.canApproveCEO;
          default:
            return false;
        }
      });
    }
    
    // 搜索过滤
    if (debouncedSearchTerm) {
      const term = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.applicant.toLowerCase().includes(term) ||
        item.title.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term) ||
        item.applicationId.toLowerCase().includes(term) ||
        item.department.toLowerCase().includes(term)
      );
    }
    
    // 类型过滤
    if (filters.type && filters.type !== 'all') {
      filtered = filtered.filter(item => item.type === filters.type);
    }
    
    // 状态过滤
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(item => item.status === filters.status);
    }
    
    // 优先级过滤
    if (filters.priority && filters.priority !== 'all') {
      filtered = filtered.filter(item => item.priority === filters.priority);
    }
    
    // 部门过滤
    if (filters.department) {
      filtered = filtered.filter(item => item.department === filters.department);
    }
    
    // 超时过滤
    if (filters.overdue) {
      const now = new Date();
      filtered = filtered.filter(item => item.deadline < now && item.status === 'pending');
    }
    
    // 审批模式过滤
    if (filters.approvalMode && filters.approvalMode !== 'all') {
      filtered = filtered.filter(item => item.approvalMode === filters.approvalMode);
    }
    
    // 委托过滤
    if (filters.isDelegated) {
      filtered = filtered.filter(item => item.delegatedFrom);
    }
    
    // 动态分配过滤
    if (filters.isDynamicallyAssigned) {
      filtered = filtered.filter(item => item.dynamicallyAssigned);
    }
    
    return filtered;
  }, [approvalItems, debouncedSearchTerm, filters, permissions]);
  
  // 计算统计数据
  const stats = useMemo((): ApprovalStats => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeekStart = new Date(today.getTime() - (today.getDay() * 24 * 60 * 60 * 1000));
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    return {
      totalPending: approvalItems.filter(item => item.status === 'pending').length,
      totalApproved: approvalItems.filter(item => item.status === 'approved').length,
      totalRejected: approvalItems.filter(item => item.status === 'rejected').length,
      totalOverdue: approvalItems.filter(item => 
        item.deadline < now && item.status === 'pending'
      ).length,
      avgProcessingTime: 2.5,
      myPendingCount: filteredItems.filter(item => item.status === 'pending').length,
      myApprovedToday: approvalItems.filter(item => 
        item.status === 'approved' && 
        new Date(item.submittedAt) >= today
      ).length,
      myApprovedThisWeek: approvalItems.filter(item => 
        item.status === 'approved' && 
        new Date(item.submittedAt) >= thisWeekStart
      ).length,
      myApprovedThisMonth: approvalItems.filter(item => 
        item.status === 'approved' && 
        new Date(item.submittedAt) >= thisMonthStart
      ).length,
      expenseCount: approvalItems.filter(item => item.type === 'expense').length,
      travelCount: approvalItems.filter(item => item.type === 'travel').length,
      highPriorityCount: approvalItems.filter(item => item.priority === 'high').length,
      mediumPriorityCount: approvalItems.filter(item => item.priority === 'medium').length,
      lowPriorityCount: approvalItems.filter(item => item.priority === 'low').length,
      statusStats: {
        pending: approvalItems.filter(item => item.status === 'pending').length,
        approved: approvalItems.filter(item => item.status === 'approved').length,
        rejected: approvalItems.filter(item => item.status === 'rejected').length,
        inProgress: approvalItems.filter(item => item.status === 'in-progress').length,
      },
      parallelApprovalCount: approvalItems.filter(item => item.approvalMode === 'parallel').length,
      sequentialApprovalCount: approvalItems.filter(item => item.approvalMode === 'sequential').length,
      delegatedApprovalCount: approvalItems.filter(item => item.delegatedFrom).length,
      dynamicAssignmentCount: approvalItems.filter(item => item.dynamicallyAssigned).length,
    };
  }, [approvalItems, filteredItems]);

  // 选择操作
  const selectItem = useCallback((id: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const selectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedItems(new Set(filteredItems.map(item => item.id)));
    } else {
      setSelectedItems(new Set());
    }
  }, [filteredItems]);

  const clearSelection = useCallback(() => {
    setSelectedItems(new Set());
  }, []);

  // 过滤操作
  const setFiltersCallback = useCallback((newFilters: Partial<ApprovalFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      type: 'all',
      status: 'all',
      priority: 'all',
      overdue: false,
      approvalMode: 'all',
      isDelegated: false,
      isDynamicallyAssigned: false
    });
  }, []);

  // 审批操作
  const approveApplication = useCallback(async (action: ApprovalAction) => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setApprovalItems(prev => prev.map(item => {
        if (item.id === action.applicationId) {
          return {
            ...item,
            status: action.action === 'approve' ? 'approved' : 'rejected',
            // 更新审批进度
            approvalProgress: item.approvalProgress ? {
              ...item.approvalProgress,
              approved: action.action === 'approve' ? item.approvalProgress.approved + 1 : item.approvalProgress.approved
            } : undefined
          };
        }
        return item;
      }));
      
      toast({
        title: action.action === 'approve' ? '审批通过' : '审批拒绝',
        description: `申请 ${action.applicationId} 已${action.action === 'approve' ? '通过' : '拒绝'}`,
      });
    } catch (error) {
      toast({
        title: '操作失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const batchApprove = useCallback(async (action: BatchApprovalAction) => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setApprovalItems(prev => prev.map(item => {
        if (action.applicationIds.includes(item.id)) {
          return {
            ...item,
            status: action.action === 'approve' ? 'approved' : 'rejected',
          };
        }
        return item;
      }));
      
      clearSelection();
      
      toast({
        title: action.action === 'approve' ? '批量审批通过' : '批量审批拒绝',
        description: `已${action.action === 'approve' ? '通过' : '拒绝'} ${action.applicationIds.length} 个申请`,
      });
    } catch (error) {
      toast({
        title: '批量操作失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast, clearSelection]);

  const getApprovalDetail = useCallback(async (id: string): Promise<ApprovalDetail> => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const item = approvalItems.find(item => item.id === id);
      if (!item) {
        throw new Error('申请不存在');
      }
      
      // 构造详细信息
      const detail: ApprovalDetail = {
        id: item.id,
        applicationId: item.applicationId,
        applicant: item.applicant,
        applicantId: item.applicantId,
        type: item.type,
        title: item.title,
        description: item.description,
        amount: item.amount,
        department: item.department,
        submittedAt: item.submittedAt,
        currentStep: item.currentStep,
        status: item.status,
        priority: item.priority,
        deadline: item.deadline,
        workflowSteps: [],
        approvalHistory: [],
        applicationData: {},
        attachments: item.attachments || [],
        canApprove: true,
        canReject: true,
        canReturn: true,
        canView: true,
        currentApprovalGroup: item.currentApprovalGroup,
        dynamicAssignmentRules: dynamicAssignmentRules,
        activeDelegations: activeDelegations
      };
      
      setCurrentApproval(detail);
      return detail;
    } catch (error) {
      toast({
        title: '获取详情失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [approvalItems, dynamicAssignmentRules, activeDelegations, toast]);

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      // 这里实际项目中会重新获取数据
      toast({
        title: '刷新成功',
        description: '数据已更新',
      });
    } catch (error) {
      toast({
        title: '刷新失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // 灵活审批功能
  const createApprovalGroup = useCallback(async (group: Omit<ApprovalGroup, 'id'>) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const newGroup: ApprovalGroup = {
        ...group,
        id: `group_${Date.now()}`
      };
      setApprovalGroups(prev => [...prev, newGroup]);
      toast({
        title: '创建成功',
        description: `审批组"${group.name}"已创建`,
      });
    } catch (error) {
      toast({
        title: '创建失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateApprovalGroup = useCallback(async (id: string, group: Partial<ApprovalGroup>) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setApprovalGroups(prev => prev.map(g => g.id === id ? { ...g, ...group } : g));
      toast({
        title: '更新成功',
        description: '审批组已更新',
      });
    } catch (error) {
      toast({
        title: '更新失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const deleteApprovalGroup = useCallback(async (id: string) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setApprovalGroups(prev => prev.filter(g => g.id !== id));
      toast({
        title: '删除成功',
        description: '审批组已删除',
      });
    } catch (error) {
      toast({
        title: '删除失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createDynamicRule = useCallback(async (rule: Omit<DynamicAssignmentRule, 'id'>) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const newRule: DynamicAssignmentRule = {
        ...rule,
        id: `rule_${Date.now()}`
      };
      setDynamicAssignmentRules(prev => [...prev, newRule]);
      toast({
        title: '创建成功',
        description: `动态分配规则"${rule.name}"已创建`,
      });
    } catch (error) {
      toast({
        title: '创建失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateDynamicRule = useCallback(async (id: string, rule: Partial<DynamicAssignmentRule>) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setDynamicAssignmentRules(prev => prev.map(r => r.id === id ? { ...r, ...rule } : r));
      toast({
        title: '更新成功',
        description: '动态分配规则已更新',
      });
    } catch (error) {
      toast({
        title: '更新失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const deleteDynamicRule = useCallback(async (id: string) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setDynamicAssignmentRules(prev => prev.filter(r => r.id !== id));
      toast({
        title: '删除成功',
        description: '动态分配规则已删除',
      });
    } catch (error) {
      toast({
        title: '删除失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createDelegation = useCallback(async (delegation: Omit<DelegationConfig, 'id'>) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const newDelegation: DelegationConfig = {
        ...delegation,
        id: `delegation_${Date.now()}`
      };
      setActiveDelegations(prev => [...prev, newDelegation]);
      toast({
        title: '创建成功',
        description: '委托配置已创建',
      });
    } catch (error) {
      toast({
        title: '创建失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateDelegation = useCallback(async (id: string, delegation: Partial<DelegationConfig>) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setActiveDelegations(prev => prev.map(d => d.id === id ? { ...d, ...delegation } : d));
      toast({
        title: '更新成功',
        description: '委托配置已更新',
      });
    } catch (error) {
      toast({
        title: '更新失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const deleteDelegation = useCallback(async (id: string) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setActiveDelegations(prev => prev.filter(d => d.id !== id));
      toast({
        title: '删除成功',
        description: '委托配置已删除',
      });
    } catch (error) {
      toast({
        title: '删除失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const enableRealTimeUpdates = useCallback(() => {
    // 实现实时更新逻辑
    console.log('启用实时更新');
  }, []);

  const disableRealTimeUpdates = useCallback(() => {
    // 禁用实时更新逻辑
    console.log('禁用实时更新');
  }, []);

  return {
    // 数据状态
    approvalItems,
    filteredItems,
    selectedItems,
    currentApproval,
    stats,
    permissions,
    loading,
    error,
    
    // 搜索和过滤
    searchTerm,
    filters,
    setSearchTerm,
    setFilters: setFiltersCallback,
    clearFilters,
    
    // 选择操作
    selectItem,
    selectAll,
    clearSelection,
    
    // 审批操作
    approveApplication,
    batchApprove,
    getApprovalDetail,
    
    // 数据刷新
    refreshData,
    
    // 实时更新
    enableRealTimeUpdates,
    disableRealTimeUpdates,
    
    // 灵活审批功能
    approvalGroups,
    dynamicAssignmentRules,
    activeDelegations,
    createApprovalGroup,
    updateApprovalGroup,
    deleteApprovalGroup,
    createDynamicRule,
    updateDynamicRule,
    deleteDynamicRule,
    createDelegation,
    updateDelegation,
    deleteDelegation,
  };
} 