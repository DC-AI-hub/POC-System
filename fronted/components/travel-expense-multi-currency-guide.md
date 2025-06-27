# 港交所POC系统 - 多币种差旅报销功能使用指南

## 功能概述

多币种差旅报销模块是港交所POC系统的核心功能之一，支持多种国际货币的费用管理和实时汇率换算。该模块完全符合项目需求文档中的差旅费报销模块要求。

## 主要特性

### 1. 多币种支持
- **支持货币**: 人民币(CNY)、港币(HKD)、美元(USD)、欧元(EUR)、日元(JPY)、英镑(GBP)、新加坡元(SGD)、澳元(AUD)
- **实时汇率**: 自动获取和更新汇率（模拟数据）
- **手动调整**: 支持手动设置特定汇率
- **汇率历史**: 完整的汇率变更历史记录

### 2. 智能计算
- **自动换算**: 发票金额自动换算为人民币
- **防抖处理**: 输入防抖避免频繁计算
- **实时更新**: 汇率变化时自动重新计算
- **精确计算**: 支持4位小数精度

### 3. 表单验证
- **必填项验证**: 申请人、工号、部门、事由等
- **金额验证**: 发票金额必须大于0
- **日期验证**: 返程日期不能早于启程日期
- **实时反馈**: 输入时即时显示验证结果

### 4. 数据管理
- **自动保存**: 支持自动保存功能
- **导入导出**: JSON格式数据导入导出
- **复制删除**: 费用明细的复制和删除操作
- **批量操作**: 支持批量删除所有明细

## 使用方法

### 基本使用

```tsx
import { TravelExpensePage } from '@/components/travel-expense-page'

// 基本使用
export default function MyTravelExpensePage() {
  return <TravelExpensePage />
}

// 带初始数据
export default function MyTravelExpensePageWithData() {
  const initialData = {
    applicant: '张三',
    employeeId: 'HK001',
    department: '财务部',
    // ... 其他初始数据
  }
  
  return <TravelExpensePage initialData={initialData} />
}

// 只读模式
export default function ReadOnlyTravelExpensePage() {
  return <TravelExpensePage readonly={true} />
}
```

### 高级使用

```tsx
import { TravelExpensePage } from '@/components/travel-expense-page'
import { TravelExpenseForm } from '@/lib/types/travel-expense'

export default function AdvancedTravelExpensePage() {
  const handleSave = async (data: TravelExpenseForm) => {
    // 保存到服务器
    const response = await fetch('/api/travel-expense', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      throw new Error('保存失败')
    }
  }
  
  const handleSubmit = async (data: TravelExpenseForm) => {
    // 提交审批
    const response = await fetch('/api/travel-expense/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      throw new Error('提交失败')
    }
  }
  
  return (
    <TravelExpensePage 
      onSave={handleSave}
      onSubmit={handleSubmit}
    />
  )
}
```

### 自定义Hook使用

```tsx
import { useTravelExpense } from '@/hooks/use-travel-expense'
import { useExchangeRate } from '@/hooks/use-exchange-rate'

export default function CustomTravelExpenseComponent() {
  const {
    formData,
    loading,
    errors,
    exchangeRate,
    calculations,
    addExpenseItem,
    updateExpenseItem,
    validateForm
  } = useTravelExpense()
  
  const handleAddExpense = () => {
    addExpenseItem()
  }
  
  const handleUpdateExpense = (id: string, amount: number) => {
    updateExpenseItem(id, { invoiceAmount: amount })
  }
  
  return (
    <div>
      <h2>自定义差旅报销组件</h2>
      <p>总金额: ¥{calculations.totalRMB.toFixed(2)}</p>
      <button onClick={handleAddExpense}>添加费用</button>
      {/* 其他自定义UI */}
    </div>
  )
}
```

## 核心组件说明

### TravelExpensePage
主要的差旅报销页面组件，包含完整的表单和功能。

**Props:**
- `initialData?: Partial<TravelExpenseForm>` - 初始数据
- `readonly?: boolean` - 是否只读模式
- `onSave?: (data: TravelExpenseForm) => Promise<void>` - 保存回调
- `onSubmit?: (data: TravelExpenseForm) => Promise<void>` - 提交回调

### ExchangeRateDialog
汇率管理弹窗组件，支持查看、设置和管理汇率。

**Props:**
- `trigger?: React.ReactNode` - 触发器元素
- `open?: boolean` - 是否打开
- `onOpenChange?: (open: boolean) => void` - 打开状态变化回调

## Hook使用说明

### useTravelExpense
差旅费用管理的核心Hook。

**参数:**
```tsx
interface UseTravelExpenseOptions {
  initialData?: Partial<TravelExpenseForm>
  autoSave?: boolean
  autoSaveInterval?: number
}
```

**返回值:**
```tsx
{
  formData: TravelExpenseForm
  loading: boolean
  errors: Record<string, string>
  isDirty: boolean
  exchangeRate: ExchangeRateHook
  calculations: CalculationResult
  
  // 表单操作
  updateFormData: (updates: Partial<TravelExpenseForm>) => void
  validateForm: () => boolean
  
  // 费用明细操作
  addExpenseItem: () => void
  updateExpenseItem: (id: string, updates: Partial<TravelExpenseItem>) => void
  removeExpenseItem: (id: string) => void
  duplicateExpenseItem: (id: string) => void
  clearAllExpenseItems: () => void
  
  // 津贴操作
  addAllowanceItem: () => void
  updateAllowanceItem: (id: string, updates: Partial<TravelAllowanceItem>) => void
  removeAllowanceItem: (id: string) => void
  
  // 数据操作
  exportData: () => void
  importData: (file: File) => Promise<void>
  resetForm: () => void
}
```

### useExchangeRate
汇率管理Hook。

**参数:**
```tsx
interface UseExchangeRateOptions {
  baseCurrency?: Currency
  autoFetch?: boolean
  refreshInterval?: number
}
```

**返回值:**
```tsx
{
  rates: Record<Currency, number>
  loading: boolean
  error: string | null
  lastUpdated: Date
  history: ExchangeRateHistory[]
  
  fetchExchangeRates: (targetCurrency?: Currency) => Promise<void>
  setManualRate: (currency: Currency, rate: number, updatedBy?: string) => void
  convertAmount: (amount: number, fromCurrency: Currency, toCurrency?: Currency) => number
  getRate: (currency: Currency) => number
  formatAmount: (amount: number, currency: Currency, showSymbol?: boolean) => string
  validateRate: (currency: Currency, rate: number) => boolean
  refresh: () => Promise<void>
}
```

## 数据结构

### TravelExpenseForm
```tsx
interface TravelExpenseForm {
  // 基本信息
  applicationNumber: string
  reimbursementNumber: string
  applicant: string
  employeeId: string
  department: string
  applicationDate: Date
  travelDate: Date
  company: string
  startDate: Date
  returnDate: Date
  days: number
  purpose: string
  localContact: string
  
  // 行政津贴
  allowanceItems: TravelAllowanceItem[]
  
  // 费用明细
  expenseItems: TravelExpenseItem[]
  
  // 总计信息
  totalApplicants: number
  subtotalPersons: number
  totalCompanyExpense: number
  
  // 说明
  expenseDescription: string
}
```

### TravelExpenseItem
```tsx
interface TravelExpenseItem {
  id: string
  category: string
  expenseDate: Date
  currency: Currency
  exchangeRate: number
  invoiceAmount: number
  rmbAmount: number
  description: string
  time?: string
  remarks?: string
}
```

## 最佳实践

### 1. 错误处理
```tsx
const handleSave = async (data: TravelExpenseForm) => {
  try {
    await saveToServer(data)
    toast.success('保存成功')
  } catch (error) {
    toast.error(`保存失败: ${error.message}`)
  }
}
```

### 2. 表单验证
```tsx
const { validateForm, errors } = useTravelExpense()

const handleSubmit = () => {
  if (!validateForm()) {
    console.log('验证错误:', errors)
    return
  }
  // 继续提交逻辑
}
```

### 3. 汇率管理
```tsx
const { exchangeRate } = useTravelExpense()

// 手动设置汇率
exchangeRate.setManualRate('USD', 7.25, '财务部')

// 格式化显示
const formattedAmount = exchangeRate.formatAmount(100, 'USD') // $100.00
```

### 4. 数据导入导出
```tsx
const { exportData, importData } = useTravelExpense()

// 导出数据
const handleExport = () => {
  exportData() // 自动下载JSON文件
}

// 导入数据
const handleImport = async (file: File) => {
  try {
    await importData(file)
    toast.success('导入成功')
  } catch (error) {
    toast.error('导入失败')
  }
}
```

## 常见问题

### Q: 如何添加新的货币支持？
A: 在 `CURRENCIES` 配置中添加新货币，并在 `DEFAULT_EXCHANGE_RATES` 中设置默认汇率。

### Q: 汇率更新频率如何控制？
A: 通过 `useExchangeRate` 的 `refreshInterval` 参数控制，默认为60秒。

### Q: 如何实现服务端汇率获取？
A: 修改 `useExchangeRate` 中的 `fetchExchangeRates` 函数，调用实际的汇率API。

### Q: 表单数据如何持久化？
A: 通过 `onSave` 回调函数将数据发送到服务器，或使用 `autoSave` 功能。

### Q: 如何自定义费用科目？
A: 修改 `EXPENSE_CATEGORIES` 配置数组，添加或修改费用科目选项。

## 技术特点

1. **TypeScript 严格类型**: 完整的类型定义和类型检查
2. **React 19 兼容**: 使用最新的React特性和Hook
3. **响应式设计**: 完美支持桌面和移动设备
4. **无障碍访问**: 完整的ARIA标签和键盘导航支持
5. **性能优化**: 防抖、记忆化和懒加载
6. **错误边界**: 完善的错误处理和用户反馈
7. **国际化就绪**: 支持多语言扩展的架构设计

## 更新日志

### v1.0.0 (2024-01-20)
- ✅ 完整的多币种支持
- ✅ 实时汇率换算
- ✅ 表单验证和错误处理
- ✅ 数据导入导出功能
- ✅ 汇率管理界面
- ✅ 响应式设计
- ✅ TypeScript 类型支持
- ✅ 自动保存功能
- ✅ 完整的使用文档 