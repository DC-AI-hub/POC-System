# 港交所POC系统 - 表单验证增强指南

## 概述
本指南介绍了基于 React Hook Form + Zod 的完整表单验证解决方案，专为港交所POC系统的费用申请模块设计。

## 技术栈
- **React Hook Form**: 高性能表单库，支持非受控组件
- **Zod**: TypeScript 优先的模式验证库
- **@hookform/resolvers**: React Hook Form 的 Zod 解析器
- **TypeScript**: 严格类型检查

## 文件结构

```
fronted/
├── lib/validations/
│   └── expense-application.ts          # 验证规则和类型定义
├── hooks/
│   └── use-expense-application.ts      # 自定义表单Hook
├── components/
│   ├── ui/
│   │   └── form-error.tsx             # 错误提示组件
│   └── expense-application-page.tsx    # 增强后的表单组件
```

## 核心功能

### 1. 验证规则定义 (`lib/validations/expense-application.ts`)

#### 基本验证规则
- **申请人**: 必填，2-50字符，只允许中英文和空格
- **员工工号**: 必填，最多20字符
- **部门/公司**: 必填选择项
- **申请日期**: 必填，不能超过当前日期
- **申请费用日**: 必填，不能早于申请日期
- **事由描述**: 必填，10-500字符

#### 费用明细验证
- **数组验证**: 至少1条，最多20条明细
- **费用科目**: 必填选择项
- **费用用途**: 必填文本
- **申请金额**: 必填，大于0，最多两位小数

#### 复合验证
```typescript
.refine((data) => {
  const applicationDate = new Date(data.applicationDate)
  const expenseDate = new Date(data.expenseDate)
  return expenseDate >= applicationDate
}, {
  message: "申请费用日不能早于申请日期",
  path: ["expenseDate"],
})
```

### 2. 自定义Hook (`hooks/use-expense-application.ts`)

#### 核心功能
- **表单状态管理**: 验证、提交、加载状态
- **费用明细操作**: 增删改费用项
- **自动计算**: 实时计算总金额
- **业务逻辑**: 保存、提交审批等操作

#### 使用示例
```typescript
const {
  form,                    // React Hook Form 实例
  fields,                  // 费用明细数组
  totalAmount,             // 自动计算的总金额
  applicationStatus,       // 申请状态
  addExpenseItem,          // 添加费用明细
  removeExpenseItem,       // 删除费用明细
  saveForm,               // 保存表单
  submitForApproval,      // 提交审批
  getValidationSummary,   // 获取验证摘要
  canSubmit,              // 检查是否可提交
} = useExpenseApplication({
  onSave: async (data) => {
    // 自定义保存逻辑
  },
  onSubmitForApproval: async (data) => {
    // 自定义提交逻辑
  },
})
```

### 3. 错误处理 (`components/ui/form-error.tsx`)

#### 统一错误显示
```tsx
<FormError>{errors.fieldName?.message}</FormError>
```

#### 视觉设计
- 红色警告图标
- 清晰的错误信息
- 一致的样式风格

### 4. 表单组件增强

#### 实时验证
```typescript
mode: "onChange", // 实时验证模式
```

#### 错误状态样式
```tsx
className={cn(
  "mt-1", 
  errors.fieldName && "border-red-500 focus:border-red-500"
)}
```

#### 验证摘要显示
```tsx
{validationSummary.hasErrors && (
  <div className="flex items-center gap-2 text-sm text-red-600">
    <AlertTriangle className="h-4 w-4" />
    <span>{validationSummary.errorCount} 个错误</span>
  </div>
)}
```

## 实现步骤

### 步骤1: 安装依赖
```bash
pnpm add react-hook-form @hookform/resolvers zod
```

### 步骤2: 定义验证规则
```typescript
// lib/validations/expense-application.ts
export const expenseApplicationSchema = z.object({
  applicant: z.string().min(2, "申请人姓名至少需要2个字符"),
  // ... 其他字段验证
})
```

### 步骤3: 创建自定义Hook
```typescript
// hooks/use-expense-application.ts
export function useExpenseApplication(options = {}) {
  const form = useForm({
    resolver: zodResolver(expenseApplicationSchema),
    mode: "onChange",
  })
  // ... Hook 逻辑
}
```

### 步骤4: 集成到组件
```tsx
// components/expense-application-page.tsx
export function ExpenseApplicationPage() {
  const { form, errors } = useExpenseApplication()
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* 表单字段 */}
    </form>
  )
}
```

## 最佳实践

### 1. 验证规则设计
- **渐进式验证**: 从基础验证到复杂业务规则
- **用户友好**: 错误信息清晰、具体
- **性能优化**: 避免不必要的重复验证

### 2. 用户体验
- **实时反馈**: onChange 模式提供即时验证
- **视觉指示**: 错误状态的视觉反馈
- **操作禁用**: 验证失败时禁用提交按钮

### 3. 代码组织
- **关注点分离**: 验证规则、业务逻辑、UI组件分离
- **类型安全**: 完整的 TypeScript 类型定义
- **可复用性**: Hook 和组件的模块化设计

### 4. 错误处理
- **统一错误显示**: 使用 FormError 组件
- **错误分类**: 字段错误、表单错误、业务错误
- **用户指导**: 提供具体的修正建议

## 高级功能

### 1. 条件验证
```typescript
.refine((data) => {
  if (data.expenseType === 'travel') {
    return data.travelDetails !== undefined
  }
  return true
}, "差旅费用需要填写差旅详情")
```

### 2. 异步验证
```typescript
.refine(async (employeeId) => {
  const exists = await checkEmployeeExists(employeeId)
  return exists
}, "员工工号不存在")
```

### 3. 动态表单
- 根据选择动态显示字段
- 费用明细的动态增删
- 条件必填字段

### 4. 表单状态持久化
```typescript
// 保存草稿到本地存储
const saveDraft = (data) => {
  localStorage.setItem('expense-draft', JSON.stringify(data))
}

// 恢复草稿
const restoreDraft = () => {
  const draft = localStorage.getItem('expense-draft')
  return draft ? JSON.parse(draft) : null
}
```

## 测试策略

### 1. 单元测试
- 验证规则测试
- Hook 功能测试
- 组件渲染测试

### 2. 集成测试
- 表单提交流程
- 错误处理流程
- 用户交互测试

### 3. 端到端测试
- 完整业务流程
- 浏览器兼容性
- 性能测试

## 性能优化

### 1. 表单优化
- 使用 Controller 包装复杂组件
- 避免不必要的重新渲染
- 懒加载验证规则

### 2. 验证优化
- 防抖验证（异步验证）
- 缓存验证结果
- 批量验证

### 3. 用户体验优化
- 加载状态指示
- 乐观更新
- 错误重试机制

## 总结

本表单验证增强方案提供了：

✅ **完整的验证体系**: 覆盖所有业务需求的验证规则
✅ **优秀的用户体验**: 实时验证和友好的错误提示
✅ **类型安全**: 完整的 TypeScript 支持
✅ **高度可复用**: 模块化的设计便于维护和扩展
✅ **性能优化**: 高效的表单处理和验证机制

通过这套方案，港交所POC系统的费用申请表单将具备企业级应用的验证能力和用户体验。 