import { useState, useCallback, useEffect } from 'react'
import { useExchangeRate } from './use-exchange-rate'
import { useDebounce } from './use-debounce'
import {
  TravelExpenseForm,
  TravelExpenseItem,
  TravelAllowanceItem,
  Currency,
  EXPENSE_CATEGORIES
} from '@/lib/types/travel-expense'

interface UseTravelExpenseOptions {
  initialData?: Partial<TravelExpenseForm>
  autoSave?: boolean
  autoSaveInterval?: number
}

export function useTravelExpense({
  initialData,
  autoSave = false,
  autoSaveInterval = 30000 // 30秒
}: UseTravelExpenseOptions = {}) {
  const exchangeRate = useExchangeRate()
  
  // 表单数据
  const [formData, setFormData] = useState<TravelExpenseForm>(() => ({
    applicationNumber: '',
    reimbursementNumber: '',
    applicant: '',
    employeeId: '',
    department: '',
    applicationDate: new Date(),
    travelDate: new Date(),
    company: '',
    startDate: new Date(),
    returnDate: new Date(),
    days: 1,
    purpose: '',
    localContact: '',
    allowanceItems: [],
    expenseItems: [],
    totalApplicants: 1,
    subtotalPersons: 1,
    totalCompanyExpense: 0,
    expenseDescription: '',
    ...initialData
  }))

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isDirty, setIsDirty] = useState(false)

  // 防抖的表单数据用于自动保存
  const debouncedFormData = useDebounce(formData, 1000)

  // 更新表单数据
  const updateFormData = useCallback((updates: Partial<TravelExpenseForm>) => {
    setFormData(prev => ({ ...prev, ...updates }))
    setIsDirty(true)
  }, [])

  // 添加费用明细
  const addExpenseItem = useCallback(() => {
    const newItem: TravelExpenseItem = {
      id: `expense-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      category: '',
      expenseDate: new Date(),
      currency: 'CNY',
      exchangeRate: exchangeRate.getRate('CNY'),
      invoiceAmount: 0,
      rmbAmount: 0,
      description: '',
      time: '',
      remarks: ''
    }
    
    setFormData(prev => ({
      ...prev,
      expenseItems: [...prev.expenseItems, newItem]
    }))
    setIsDirty(true)
  }, [exchangeRate])

  // 更新费用明细
  const updateExpenseItem = useCallback((id: string, updates: Partial<TravelExpenseItem>) => {
    setFormData(prev => ({
      ...prev,
      expenseItems: prev.expenseItems.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, ...updates }
          
          // 如果更新了币种或发票金额，重新计算人民币金额
          if ('currency' in updates || 'invoiceAmount' in updates) {
            const currency = updates.currency || item.currency
            const amount = updates.invoiceAmount ?? item.invoiceAmount
            const rate = exchangeRate.getRate(currency)
            
            updatedItem.exchangeRate = rate
            updatedItem.rmbAmount = exchangeRate.convertAmount(amount, currency, 'CNY')
          }
          
          return updatedItem
        }
        return item
      })
    }))
    setIsDirty(true)
  }, [exchangeRate])

  // 删除费用明细
  const removeExpenseItem = useCallback((id: string) => {
    setFormData(prev => ({
      ...prev,
      expenseItems: prev.expenseItems.filter(item => item.id !== id)
    }))
    setIsDirty(true)
  }, [])

  // 复制费用明细
  const duplicateExpenseItem = useCallback((id: string) => {
    const item = formData.expenseItems.find(item => item.id === id)
    if (item) {
      const newItem: TravelExpenseItem = {
        ...item,
        id: `expense-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      }
      
      setFormData(prev => ({
        ...prev,
        expenseItems: [...prev.expenseItems, newItem]
      }))
      setIsDirty(true)
    }
  }, [formData.expenseItems])

  // 清空所有费用明细
  const clearAllExpenseItems = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      expenseItems: []
    }))
    setIsDirty(true)
  }, [])

  // 添加津贴项目
  const addAllowanceItem = useCallback(() => {
    const newItem: TravelAllowanceItem = {
      id: `allowance-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      date: new Date(),
      startLocation: '',
      fpCode: '',
      hkdAmount: 0
    }
    
    setFormData(prev => ({
      ...prev,
      allowanceItems: [...prev.allowanceItems, newItem]
    }))
    setIsDirty(true)
  }, [])

  // 更新津贴项目
  const updateAllowanceItem = useCallback((id: string, updates: Partial<TravelAllowanceItem>) => {
    setFormData(prev => ({
      ...prev,
      allowanceItems: prev.allowanceItems.map(item => 
        item.id === id ? { ...item, ...updates } : item
      )
    }))
    setIsDirty(true)
  }, [])

  // 删除津贴项目
  const removeAllowanceItem = useCallback((id: string) => {
    setFormData(prev => ({
      ...prev,
      allowanceItems: prev.allowanceItems.filter(item => item.id !== id)
    }))
    setIsDirty(true)
  }, [])

  // 计算总金额
  const calculations = useCallback(() => {
    const totalRMB = formData.expenseItems.reduce((sum, item) => sum + item.rmbAmount, 0)
    const totalHKD = formData.allowanceItems.reduce((sum, item) => sum + item.hkdAmount, 0)
    
    // 按币种分组统计
    const byCurrency: Record<Currency, number> = {
      CNY: 0, HKD: 0, USD: 0, EUR: 0, JPY: 0, GBP: 0, SGD: 0, AUD: 0
    }
    
    formData.expenseItems.forEach(item => {
      byCurrency[item.currency] += item.invoiceAmount
    })

    return {
      totalRMB,
      totalHKD,
      byCurrency,
      itemCount: formData.expenseItems.length,
      allowanceCount: formData.allowanceItems.length
    }
  }, [formData.expenseItems, formData.allowanceItems])

  // 表单验证
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.applicant.trim()) {
      newErrors.applicant = '请输入申请人姓名'
    }
    
    if (!formData.employeeId.trim()) {
      newErrors.employeeId = '请输入员工工号'
    }
    
    if (!formData.department.trim()) {
      newErrors.department = '请输入所属部门'
    }
    
    if (!formData.purpose.trim()) {
      newErrors.purpose = '请输入出差事由'
    }
    
    if (formData.startDate > formData.returnDate) {
      newErrors.returnDate = '返程日期不能早于启程日期'
    }
    
    // 验证费用明细
    formData.expenseItems.forEach((item, index) => {
      if (!item.category) {
        newErrors[`expenseItems.${index}.category`] = '请选择费用科目'
      }
      if (item.invoiceAmount <= 0) {
        newErrors[`expenseItems.${index}.invoiceAmount`] = '发票金额必须大于0'
      }
      if (!item.description.trim()) {
        newErrors[`expenseItems.${index}.description`] = '请输入费用描述'
      }
    })
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  // 导出数据
  const exportData = useCallback(() => {
    const calc = calculations()
    const exportData = {
      ...formData,
      calculations: calc,
      exportDate: new Date(),
      exchangeRates: exchangeRate.rates
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `travel-expense-${formData.applicationNumber || 'draft'}-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [formData, calculations, exchangeRate.rates])

  // 导入数据
  const importData = useCallback((file: File) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string)
          setFormData(prev => ({ ...prev, ...data }))
          setIsDirty(true)
          resolve()
        } catch (error) {
          reject(new Error('文件格式不正确'))
        }
      }
      reader.onerror = () => reject(new Error('文件读取失败'))
      reader.readAsText(file)
    })
  }, [])

  // 自动保存
  useEffect(() => {
    if (autoSave && isDirty && debouncedFormData) {
      // 这里可以调用API保存数据
      console.log('自动保存数据:', debouncedFormData)
      setIsDirty(false)
    }
  }, [autoSave, isDirty, debouncedFormData])

  // 计算天数
  useEffect(() => {
    const days = Math.ceil((formData.returnDate.getTime() - formData.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
    if (days !== formData.days && days > 0) {
      setFormData(prev => ({ ...prev, days }))
    }
  }, [formData.startDate, formData.returnDate, formData.days])

  return {
    formData,
    loading,
    errors,
    isDirty,
    exchangeRate,
    calculations: calculations(),
    
    // 表单操作
    updateFormData,
    validateForm,
    
    // 费用明细操作
    addExpenseItem,
    updateExpenseItem,
    removeExpenseItem,
    duplicateExpenseItem,
    clearAllExpenseItems,
    
    // 津贴操作
    addAllowanceItem,
    updateAllowanceItem,
    removeAllowanceItem,
    
    // 数据操作
    exportData,
    importData,
    
    // 重置表单
    resetForm: () => {
      setFormData({
        applicationNumber: '',
        reimbursementNumber: '',
        applicant: '',
        employeeId: '',
        department: '',
        applicationDate: new Date(),
        travelDate: new Date(),
        company: '',
        startDate: new Date(),
        returnDate: new Date(),
        days: 1,
        purpose: '',
        localContact: '',
        allowanceItems: [],
        expenseItems: [],
        totalApplicants: 1,
        subtotalPersons: 1,
        totalCompanyExpense: 0,
        expenseDescription: '',
      })
      setIsDirty(false)
      setErrors({})
    }
  }
} 