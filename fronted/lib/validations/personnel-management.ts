import { z } from "zod";

// 人员信息表单验证 Schema
export const personnelFormSchema = z.object({
  // 基本信息
  name: z
    .string()
    .min(2, "姓名至少需要2个字符")
    .max(50, "姓名不能超过50个字符")
    .regex(/^[\u4e00-\u9fa5a-zA-Z\s]+$/, "姓名只能包含中文、英文和空格"),
  
  loginName: z
    .string()
    .min(3, "登录名至少需要3个字符")
    .max(20, "登录名不能超过20个字符")
    .regex(/^[a-zA-Z0-9_]+$/, "登录名只能包含字母、数字和下划线"),
  
  employeeId: z
    .string()
    .min(3, "员工工号至少需要3个字符")
    .max(20, "员工工号不能超过20个字符")
    .regex(/^[A-Z0-9]+$/, "员工工号只能包含大写字母和数字"),
  
  email: z
    .string()
    .email("请输入有效的邮箱地址")
    .max(100, "邮箱地址不能超过100个字符"),
  
  phone: z
    .string()
    .regex(/^1[3-9]\d{9}$/, "请输入有效的手机号码"),
  
  // 组织关系
  department: z
    .string()
    .min(1, "请选择部门"),
  
  position: z.enum(["经理", "总监", "专员", "工程师", "主管"], {
    errorMap: () => ({ message: "请选择职位" })
  }),
  
  manager: z
    .string()
    .min(1, "请选择直属主管"),
  
  workLocation: z
    .string()
    .min(2, "工作地点至少需要2个字符")
    .max(100, "工作地点不能超过100个字符"),
  
  // 员工类型和状态
  employeeType: z.enum(["full-time", "part-time", "contractor"], {
    errorMap: () => ({ message: "请选择员工类型" })
  }),
  
  status: z.enum(["active", "inactive", "transferred", "resigned"], {
    errorMap: () => ({ message: "请选择员工状态" })
  }),
  
  hireDate: z
    .date({
      required_error: "请选择入职日期",
      invalid_type_error: "请输入有效的日期"
    })
    .max(new Date(), "入职日期不能晚于今天"),
  
  // 紧急联系人（改为可选）
  emergencyContact: z
    .string()
    .max(50, "紧急联系人姓名不能超过50个字符")
    .optional()
    .or(z.literal("")),
  
  emergencyPhone: z
    .string()
    .optional()
    .refine((val) => !val || val === "" || /^1[3-9]\d{9}$/.test(val), {
      message: "请输入有效的紧急联系人手机号码"
    }),
  
  // 备注
  notes: z
    .string()
    .max(500, "备注不能超过500个字符")
    .optional(),
});

// 部门信息验证 Schema
export const departmentSchema = z.object({
  name: z
    .string()
    .min(2, "部门名称至少需要2个字符")
    .max(50, "部门名称不能超过50个字符"),
  
  parentId: z
    .string()
    .optional(),
  
  managerId: z
    .string()
    .min(1, "请选择部门负责人"),
  
  description: z
    .string()
    .max(200, "部门描述不能超过200个字符")
    .optional(),
});

// 批量操作验证 Schema
export const batchOperationSchema = z.object({
  type: z.enum(["department", "status", "manager", "delete"]),
  targetIds: z
    .array(z.string())
    .min(1, "请至少选择一个员工"),
  value: z
    .string()
    .optional(),
});

// 搜索过滤验证 Schema
export const searchFiltersSchema = z.object({
  searchTerm: z.string().optional(),
  department: z.string().optional(),
  position: z.string().optional(),
  employeeType: z.string().optional(),
  status: z.string().optional(),
  manager: z.string().optional(),
});

// 导入验证 Schema
export const importValidationSchema = z.object({
  name: z.string().min(1, "姓名不能为空"),
  loginName: z.string().min(1, "登录名不能为空"),
  employeeId: z.string().min(1, "员工工号不能为空"),
  email: z.string().email("邮箱格式不正确"),
  phone: z.string().regex(/^1[3-9]\d{9}$/, "手机号格式不正确"),
  department: z.string().min(1, "部门不能为空"),
  position: z.string().min(1, "职位不能为空"),
  employeeType: z.enum(["full-time", "part-time", "contractor"]),
  status: z.enum(["active", "inactive", "transferred", "resigned"]),
});

// 表单字段标签映射
export const fieldLabels = {
  name: "姓名",
  loginName: "登录名",
  employeeId: "员工工号",
  email: "邮箱",
  phone: "手机号",
  department: "部门",
  position: "职位",
  manager: "直属主管",
  workLocation: "工作地点",
  employeeType: "员工类型",
  status: "员工状态",
  hireDate: "入职日期",
  emergencyContact: "紧急联系人",
  emergencyPhone: "紧急联系人电话",
  notes: "备注",
} as const;

// 员工类型选项
export const employeeTypeOptions = [
  { value: "full-time", label: "正式员工" },
  { value: "part-time", label: "兼职员工" },
  { value: "contractor", label: "合同工" },
] as const;

// 员工状态选项
export const employeeStatusOptions = [
  { value: "active", label: "在职" },
  { value: "inactive", label: "离职" },
  { value: "transferred", label: "调动" },
  { value: "resigned", label: "辞职" },
] as const;

// 批量操作类型选项
export const batchOperationOptions = [
  { value: "department", label: "批量调整部门" },
  { value: "status", label: "批量修改状态" },
  { value: "manager", label: "批量调整主管" },
  { value: "delete", label: "批量删除" },
] as const;

// 导出格式选项
export const exportFormatOptions = [
  { value: "excel", label: "Excel 格式" },
  { value: "csv", label: "CSV 格式" },
  { value: "pdf", label: "PDF 格式" },
] as const;

// 验证工具函数
export const validateEmployeeId = async (employeeId: string, excludeId?: string): Promise<boolean> => {
  // 模拟检查员工工号唯一性
  // 实际项目中应该调用API检查
  const existingIds = ["EMP001", "EMP002", "EMP003"]; // 模拟已存在的工号
  return !existingIds.includes(employeeId);
};

export const validateLoginName = async (loginName: string, excludeId?: string): Promise<boolean> => {
  // 模拟检查登录名唯一性
  const existingLoginNames = ["admin", "test", "demo"]; // 模拟已存在的登录名
  return !existingLoginNames.includes(loginName);
};

export const validateEmail = async (email: string, excludeId?: string): Promise<boolean> => {
  // 模拟检查邮箱唯一性
  const existingEmails = ["admin@example.com", "test@example.com"]; // 模拟已存在的邮箱
  return !existingEmails.includes(email);
};

// 表单验证类型
export type PersonnelFormData = z.infer<typeof personnelFormSchema>;
export type DepartmentFormData = z.infer<typeof departmentSchema>;
export type BatchOperationData = z.infer<typeof batchOperationSchema>;
export type SearchFiltersData = z.infer<typeof searchFiltersSchema>; 