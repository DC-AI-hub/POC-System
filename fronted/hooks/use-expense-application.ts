"use client"

import { useState, useCallback } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  expenseApplicationSchema,
  defaultExpenseApplicationValues,
  type ExpenseApplicationForm,
} from "@/lib/validations/expense-application"

export type ApplicationStatus = 'draft' | 'pending' | 'approved' | 'rejected'

export interface UseExpenseApplicationOptions {
  initialData?: Partial<ExpenseApplicationForm>
  onSave?: (data: ExpenseApplicationForm) => Promise<void>
  onSubmitForApproval?: (data: ExpenseApplicationForm) => Promise<void>
}

export function useExpenseApplication(options: UseExpenseApplicationOptions = {}) {
  const { initialData, onSave, onSubmitForApproval } = options
  
  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus>('draft')
  const [isSaving, setIsSaving] = useState(false)
  const [isSubmittingForApproval, setIsSubmittingForApproval] = useState(false)

  const form = useForm<ExpenseApplicationForm>({
    resolver: zodResolver(expenseApplicationSchema),
    defaultValues: {
      ...defaultExpenseApplicationValues,
      ...initialData,
    },
    mode: "onChange", // 实时验证
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "expenseItems",
  })

  // 监听费用明细变化，计算总金额
  const expenseItems = form.watch("expenseItems")
  const totalAmount = expenseItems?.reduce((sum, item) => sum + (Number(item.amount) || 0), 0) || 0

  // 添加费用明细行
  const addExpenseItem = useCallback(() => {
    if (fields.length < 20) {
      append({
        expenseCategory: "",
        purpose: "",
        amount: 0,
      })
    }
  }, [append, fields.length])

  // 删除费用明细行
  const removeExpenseItem = useCallback((index: number) => {
    if (fields.length > 1) {
      remove(index)
    }
  }, [remove, fields.length])

  // 删除所有费用明细，保留一行空白
  const removeAllExpenseItems = useCallback(() => {
    remove() // 清空所有
    append({
      expenseCategory: "",
      purpose: "",
      amount: 0,
    })
  }, [remove, append])

  // 保存表单
  const saveForm = useCallback(async (data: ExpenseApplicationForm) => {
    setIsSaving(true)
    try {
      if (onSave) {
        await onSave(data)
      } else {
        // 默认保存逻辑
        console.log("保存表单数据:", data)
        await new Promise(resolve => setTimeout(resolve, 1000)) // 模拟API调用
      }
      
      // 保存成功后重置表单dirty状态
      form.reset(data)
      
      return { success: true, message: "保存成功" }
    } catch (error) {
      console.error("保存失败:", error)
      return { 
        success: false, 
        message: error instanceof Error ? error.message : "保存失败，请重试" 
      }
    } finally {
      setIsSaving(false)
    }
  }, [form, onSave])

  // 提交审批
  const submitForApproval = useCallback(async () => {
    setIsSubmittingForApproval(true)
    try {
      // 先验证表单
      const isValid = await form.trigger()
      if (!isValid) {
        return { success: false, message: "请检查表单中的错误信息" }
      }

      const data = form.getValues()
      
      if (onSubmitForApproval) {
        await onSubmitForApproval(data)
      } else {
        // 默认提交逻辑
        console.log("提交审批:", data)
        await new Promise(resolve => setTimeout(resolve, 1000)) // 模拟API调用
      }

      setApplicationStatus('pending')
      form.reset(data)
      
      return { success: true, message: "已提交审批" }
    } catch (error) {
      console.error("提交失败:", error)
      return { 
        success: false, 
        message: error instanceof Error ? error.message : "提交失败，请重试" 
      }
    } finally {
      setIsSubmittingForApproval(false)
    }
  }, [form, onSubmitForApproval])

  // 重置表单
  const resetForm = useCallback(() => {
    form.reset(defaultExpenseApplicationValues)
    setApplicationStatus('draft')
  }, [form])

  // 获取表单验证摘要
  const getValidationSummary = useCallback(() => {
    const errors = form.formState.errors
    const errorCount = Object.keys(errors).length
    const hasExpenseItemErrors = errors.expenseItems && Array.isArray(errors.expenseItems)
    const expenseItemErrorCount = hasExpenseItemErrors 
      ? (errors.expenseItems as any[]).filter(item => item && typeof item === 'object').length 
      : 0
    
    return {
      hasErrors: errorCount > 0,
      errorCount: errorCount + expenseItemErrorCount,
      errors,
    }
  }, [form.formState.errors])

  // 检查表单是否可以提交
  const canSubmit = useCallback(() => {
    const { isDirty, isValid } = form.formState
    return isDirty && isValid && !isSaving && !isSubmittingForApproval
  }, [form.formState, isSaving, isSubmittingForApproval])

  return {
    // 表单相关
    form,
    fields,
    totalAmount,
    
    // 状态
    applicationStatus,
    setApplicationStatus,
    isSaving,
    isSubmittingForApproval,
    
    // 费用明细操作
    addExpenseItem,
    removeExpenseItem,
    removeAllExpenseItems,
    
    // 表单操作
    saveForm,
    submitForApproval,
    resetForm,
    
    // 工具函数
    getValidationSummary,
    canSubmit,
  }
} 