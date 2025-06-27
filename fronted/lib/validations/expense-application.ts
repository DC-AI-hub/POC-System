import { z } from "zod"

// 费用明细项的验证规则
export const expenseItemSchema = z.object({
  id: z.string().optional(), // 用于编辑时的唯一标识
  expenseCategory: z.string().min(1, "请选择费用科目"),
  purpose: z.string().min(1, "请输入费用用途"),
  amount: z.number({
    required_error: "请输入申请金额",
    invalid_type_error: "申请金额必须是数字",
  }).positive("申请金额必须大于0").multipleOf(0.01, "金额最多保留两位小数"),
})

// 费用申请表单的验证规则
export const expenseApplicationSchema = z.object({
  // 基本信息
  applicant: z.string()
    .min(2, "申请人姓名至少需要2个字符")
    .max(50, "申请人姓名不能超过50个字符")
    .regex(/^[\u4e00-\u9fa5a-zA-Z\s]+$/, "申请人姓名只能包含中文、英文和空格"),
  
  employeeId: z.string()
    .min(1, "请输入员工工号")
    .max(20, "员工工号不能超过20个字符"),
  
  department: z.string()
    .min(1, "请选择所属部门"),
  
  applicationDate: z.string()
    .min(1, "请选择申请日期")
    .refine((date) => {
      const selectedDate = new Date(date)
      const today = new Date()
      today.setHours(23, 59, 59, 999) // 设置为当天最后一刻
      return selectedDate <= today
    }, "申请日期不能超过当前日期"),
  
  expenseDate: z.string()
    .min(1, "请选择申请费用日"),
  
  company: z.string()
    .min(1, "请选择费用所属公司"),
  
  reason: z.string()
    .min(10, "事由描述至少需要10个字符")
    .max(500, "事由描述不能超过500个字符"),
  
  // 费用明细数组
  expenseItems: z.array(expenseItemSchema)
    .min(1, "至少需要添加一条费用明细")
    .max(20, "费用明细不能超过20条"),
  
  // 主管审批意见（可选）
  supervisorComment: z.string().optional(),
  
  // 批准与批复（可选）
  approvalComment: z.string().optional(),
}).refine((data) => {
  // 验证申请费用日不能早于申请日期
  const applicationDate = new Date(data.applicationDate)
  const expenseDate = new Date(data.expenseDate)
  return expenseDate >= applicationDate
}, {
  message: "申请费用日不能早于申请日期",
  path: ["expenseDate"], // 错误显示在expenseDate字段
})

// TypeScript 类型定义
export type ExpenseItem = z.infer<typeof expenseItemSchema>
export type ExpenseApplicationForm = z.infer<typeof expenseApplicationSchema>

// 默认表单值
export const defaultExpenseApplicationValues: Partial<ExpenseApplicationForm> = {
  applicant: "",
  employeeId: "",
  department: "",
  applicationDate: new Date().toISOString().split('T')[0], // 今天的日期
  expenseDate: "",
  company: "",
  reason: "",
  expenseItems: [
    {
      expenseCategory: "",
      purpose: "",
      amount: 0,
    }
  ],
  supervisorComment: "",
  approvalComment: "",
}

// 费用科目选项
export const expenseCategoryOptions = [
  { value: "office-supplies", label: "办公用品" },
  { value: "business-entertainment", label: "业务招待" },
  { value: "equipment-purchase", label: "设备采购" },
  { value: "communication", label: "通讯费" },
  { value: "transportation", label: "交通费" },
  { value: "training", label: "培训费" },
  { value: "marketing", label: "市场推广" },
  { value: "maintenance", label: "维护费" },
  { value: "consulting", label: "咨询费" },
  { value: "other", label: "其他" },
] as const

// 部门选项
export const departmentOptions = [
  { value: "finance", label: "财务部" },
  { value: "hr", label: "人事部" },
  { value: "it", label: "技术部" },
  { value: "sales", label: "销售部" },
  { value: "marketing", label: "市场部" },
  { value: "operations", label: "运营部" },
  { value: "legal", label: "法务部" },
  { value: "admin", label: "行政部" },
] as const

// 公司选项
export const companyOptions = [
  { value: "chc", label: "CHC" },
  { value: "hexe-tech", label: "HEXE Tech (SZ)" },
  { value: "ghbc", label: "GHBC" },
  { value: "hexe", label: "HEXE" },
] as const 