export type Currency = 'CNY' | 'HKD' | 'USD' | 'EUR' | 'JPY' | 'GBP' | 'SGD' | 'AUD'

export interface CurrencyInfo {
  code: Currency
  name: string
  symbol: string
  nameEn: string
}

export interface ExchangeRate {
  baseCurrency: Currency
  targetCurrency: Currency
  rate: number
  date: Date
  source: 'manual' | 'api' | 'system'
  updatedBy?: string
}

export interface TravelExpenseItem {
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

export interface TravelAllowanceItem {
  id: string
  date: Date
  startLocation: string
  fpCode: string
  hkdAmount: number
}

export interface TravelExpenseForm {
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

// 币种配置
export const CURRENCIES: CurrencyInfo[] = [
  { code: 'CNY', name: '人民币', symbol: '¥', nameEn: 'Chinese Yuan' },
  { code: 'HKD', name: '港币', symbol: 'HK$', nameEn: 'Hong Kong Dollar' },
  { code: 'USD', name: '美元', symbol: '$', nameEn: 'US Dollar' },
  { code: 'EUR', name: '欧元', symbol: '€', nameEn: 'Euro' },
  { code: 'JPY', name: '日元', symbol: '¥', nameEn: 'Japanese Yen' },
  { code: 'GBP', name: '英镑', symbol: '£', nameEn: 'British Pound' },
  { code: 'SGD', name: '新加坡元', symbol: 'S$', nameEn: 'Singapore Dollar' },
  { code: 'AUD', name: '澳元', symbol: 'A$', nameEn: 'Australian Dollar' },
]

// 费用科目配置
export const EXPENSE_CATEGORIES = [
  { value: 'accommodation', label: '住宿费' },
  { value: 'transport', label: '交通费' },
  { value: 'meal', label: '餐费' },
  { value: 'taxi', label: '出租车费' },
  { value: 'communication', label: '通讯费' },
  { value: 'entertainment', label: '业务招待费' },
  { value: 'conference', label: '会议费' },
  { value: 'training', label: '培训费' },
  { value: 'visa', label: '签证费' },
  { value: 'insurance', label: '保险费' },
  { value: 'other', label: '其他费用' },
]

// 默认汇率（模拟数据，实际应该从API获取）
export const DEFAULT_EXCHANGE_RATES: Record<Currency, number> = {
  CNY: 1.0000, // 基准货币
  HKD: 0.9200,
  USD: 7.2500,
  EUR: 7.8900,
  JPY: 0.0485,
  GBP: 9.1200,
  SGD: 5.3800,
  AUD: 4.7600,
}

export interface TravelExpensePageProps {
  initialData?: Partial<TravelExpenseForm>
  readonly?: boolean
  onSave?: (data: TravelExpenseForm) => Promise<void>
  onSubmit?: (data: TravelExpenseForm) => Promise<void>
} 