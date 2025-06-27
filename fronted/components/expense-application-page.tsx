"use client"

import React, { useState, useEffect } from "react"
import { useForm, useFieldArray, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FormError } from "@/components/ui/form-error"
import { StatusBadge } from "@/components/ui/status-badge"
import { useToast } from "@/hooks/use-toast"
import { Plus, Trash2, Calculator, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  expenseApplicationSchema,
  defaultExpenseApplicationValues,
  expenseCategoryOptions,
  departmentOptions,
  companyOptions,
  type ExpenseApplicationForm,
} from "@/lib/validations/expense-application"

export function ExpenseApplicationPage() {
  const [applicationStatus, setApplicationStatus] = useState<'draft' | 'pending' | 'approved' | 'rejected'>('draft')
  const [applicationNumber, setApplicationNumber] = useState<string>("")
  const [isMounted, setIsMounted] = useState(false)
  const [isSubmittingForApproval, setIsSubmittingForApproval] = useState(false)
  const { toast } = useToast()
  
  // 防止 hydration 错误，在客户端生成申请编号
  useEffect(() => {
    setIsMounted(true)
    const year = new Date().getFullYear()
    const timestamp = String(Date.now()).slice(-6)
    setApplicationNumber(`EXP-${year}-${timestamp}`)
  }, [])

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    watch,
    setValue,
    trigger,
  } = useForm<ExpenseApplicationForm>({
    resolver: zodResolver(expenseApplicationSchema),
    defaultValues: defaultExpenseApplicationValues,
    mode: "onChange", // 实时验证
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "expenseItems",
  })

  // 监听费用明细变化，计算总金额
  const expenseItems = watch("expenseItems")
  const totalAmount = expenseItems?.reduce((sum, item) => sum + (Number(item.amount) || 0), 0) || 0

  // 添加费用明细行
  const addExpenseItem = () => {
    append({
      expenseCategory: "",
      purpose: "",
      amount: 0,
    })
  }

  // 删除费用明细行
  const removeExpenseItem = (index: number) => {
    if (fields.length > 1) {
      remove(index)
    }
  }

  // 删除所有费用明细，保留一行空白
  const removeAllExpenseItems = () => {
    remove() // 清空所有
    append({
      expenseCategory: "",
      purpose: "",
      amount: 0,
    })
  }

  // 表单提交处理
  const onSubmit = async (data: ExpenseApplicationForm) => {
    console.log("表单数据:", data)
    console.log("总金额:", totalAmount)
    
    try {
      // 这里可以添加API调用逻辑
      // await saveExpenseApplication(data)
      
      // 模拟保存过程
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: "保存成功",
        description: "费用申请已保存，您可以继续编辑或提交审批。",
        duration: 3000,
      })
      
      return { success: true }
    } catch (error) {
      console.error("保存失败:", error)
      toast({
        title: "保存失败",
        description: "保存过程中出现错误，请检查网络连接后重试。",
        variant: "destructive",
        duration: 5000,
      })
      throw error
    }
  }

  // 提交审批
  const submitForApproval = async () => {
    try {
      setIsSubmittingForApproval(true)
      
      // 先验证表单
      const isValid = await trigger()
      if (!isValid) {
        toast({
          title: "表单验证失败",
          description: "请检查并修正表单中的错误后再提交。",
          variant: "destructive",
          duration: 5000,
        })
        return
      }

      // 获取表单数据
      const formData = watch()
      console.log("提交审批数据:", formData)
      console.log("总金额:", totalAmount)
      
      // 模拟提交审批过程
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // 模拟可能的失败情况（10%概率）
      if (Math.random() < 0.1) {
        throw new Error("网络错误")
      }
      
      // 更新状态
      setApplicationStatus('pending')
      
      toast({
        title: "提交成功",
        description: `费用申请已提交审批，申请编号：${applicationNumber}。您将收到审批进度通知。`,
        duration: 5000,
      })
      
    } catch (error) {
      console.error("提交审批失败:", error)
      toast({
        title: "提交失败",
        description: error instanceof Error ? error.message : "提交过程中出现错误，请重试。",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setIsSubmittingForApproval(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-4 max-w-6xl mx-auto compact-ui">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">日常费用申请单</h1>
          <p className="text-gray-600 mt-0.5 text-sm">
            申请编号：{isMounted ? applicationNumber : "加载中..."}
          </p>
        </div>
        <StatusBadge status={applicationStatus} size="default" />
      </div>

      {/* 基本信息 */}
      <Card className="mb-4 compact-card">
        <CardHeader className="bg-slate-800 text-white compact-card-header">
          <CardTitle className="text-lg">基本信息</CardTitle>
        </CardHeader>
        <CardContent className="p-4 compact-card-content">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label htmlFor="applicant">申请人 *</Label>
              <Input
                id="applicant"
                {...register("applicant")}
                className={cn("mt-1", errors.applicant && "border-red-500 focus:border-red-500")}
                placeholder="请输入申请人姓名"
              />
              <FormError>{errors.applicant?.message}</FormError>
            </div>
            
            <div>
              <Label htmlFor="employee-id">员工工号 *</Label>
              <Input
                id="employee-id"
                {...register("employeeId")}
                className={cn("mt-1", errors.employeeId && "border-red-500 focus:border-red-500")}
                placeholder="请输入员工工号"
              />
              <FormError>{errors.employeeId?.message}</FormError>
            </div>
            
            <div>
              <Label htmlFor="department">所属部门 *</Label>
              <Controller
                name="department"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className={cn("mt-1", errors.department && "border-red-500 focus:border-red-500")}>
                      <SelectValue placeholder="请选择部门" />
                    </SelectTrigger>
                    <SelectContent>
                      {departmentOptions.map((dept) => (
                        <SelectItem key={dept.value} value={dept.value}>
                          {dept.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FormError>{errors.department?.message}</FormError>
            </div>
            
            <div>
              <Label htmlFor="application-date">申请日期 *</Label>
              <Input
                id="application-date"
                type="date"
                {...register("applicationDate")}
                className={cn("mt-1", errors.applicationDate && "border-red-500 focus:border-red-500")}
              />
              <FormError>{errors.applicationDate?.message}</FormError>
            </div>
            
            <div>
              <Label htmlFor="expense-date">申请费用日 *</Label>
              <Input
                id="expense-date"
                type="date"
                {...register("expenseDate")}
                className={cn("mt-1", errors.expenseDate && "border-red-500 focus:border-red-500")}
              />
              <FormError>{errors.expenseDate?.message}</FormError>
            </div>
            
            <div>
              <Label htmlFor="company">费用所属公司 *</Label>
              <Controller
                name="company"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className={cn("mt-1", errors.company && "border-red-500 focus:border-red-500")}>
                      <SelectValue placeholder="请选择公司" />
                    </SelectTrigger>
                    <SelectContent>
                      {companyOptions.map((company) => (
                        <SelectItem key={company.value} value={company.value}>
                          {company.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FormError>{errors.company?.message}</FormError>
            </div>
          </div>
          
          <div className="mt-4">
            <Label htmlFor="reason">事由描述 *</Label>
            <Textarea
              id="reason"
              {...register("reason")}
              className={cn("mt-1", errors.reason && "border-red-500 focus:border-red-500")}
              rows={3}
              placeholder="请详细描述申请费用的事由（至少10个字符）"
            />
            <FormError>{errors.reason?.message}</FormError>
          </div>
        </CardContent>
      </Card>

      {/* 申请费用明细 */}
      <Card className="mb-4 compact-card">
        <CardHeader className="bg-slate-800 text-white flex flex-row items-center justify-between compact-card-header">
          <CardTitle className="text-lg">申请费用明细</CardTitle>
          <div className="flex items-center gap-2 text-white">
            <Calculator className="h-3 w-3" />
            <span className="text-sm">合计：¥{totalAmount.toFixed(2)}</span>
          </div>
        </CardHeader>
        <CardContent className="p-4 compact-card-content">
          <div className="mb-3 flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              onClick={addExpenseItem}
              disabled={fields.length >= 20}
              className="compact-button"
            >
              <Plus className="h-3 w-3 mr-1" />
              增加明细
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={removeAllExpenseItems}
              disabled={fields.length <= 1}
              className="compact-button"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              删除全部
            </Button>
          </div>
          
          {errors.expenseItems && (
            <FormError className="mb-4">{errors.expenseItems.message}</FormError>
          )}
          
          <div className="overflow-x-auto">
            <Table className="compact-table">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-xs">序号</TableHead>
                  <TableHead className="min-w-40 text-xs">费用科目名称 *</TableHead>
                  <TableHead className="min-w-40 text-xs">费用用途 *</TableHead>
                  <TableHead className="min-w-28 text-xs">申请金额 *</TableHead>
                  <TableHead className="w-16 text-xs">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((field, index) => (
                  <TableRow key={field.id}>
                    <TableCell className="text-center">{index + 1}</TableCell>
                    
                    <TableCell>
                      <Controller
                        name={`expenseItems.${index}.expenseCategory`}
                        control={control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger 
                              className={cn(
                                errors.expenseItems?.[index]?.expenseCategory && "border-red-500 focus:border-red-500"
                              )}
                            >
                              <SelectValue placeholder="请选择费用科目" />
                            </SelectTrigger>
                            <SelectContent>
                              {expenseCategoryOptions.map((category) => (
                                <SelectItem key={category.value} value={category.value}>
                                  {category.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <FormError>{errors.expenseItems?.[index]?.expenseCategory?.message}</FormError>
                    </TableCell>
                    
                    <TableCell>
                      <Input
                        {...register(`expenseItems.${index}.purpose`)}
                        placeholder="请输入费用用途"
                        className={cn(
                          errors.expenseItems?.[index]?.purpose && "border-red-500 focus:border-red-500"
                        )}
                      />
                      <FormError>{errors.expenseItems?.[index]?.purpose?.message}</FormError>
                    </TableCell>
                    
                    <TableCell>
                      <Input
                        {...register(`expenseItems.${index}.amount`, {
                          valueAsNumber: true,
                        })}
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className={cn(
                          errors.expenseItems?.[index]?.amount && "border-red-500 focus:border-red-500"
                        )}
                      />
                      <FormError>{errors.expenseItems?.[index]?.amount?.message}</FormError>
                    </TableCell>
                    
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeExpenseItem(index)}
                        disabled={fields.length <= 1}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 compact-button p-1"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <div className="mt-3 text-right">
            <div className="inline-flex items-center gap-2 text-base font-semibold">
              <Calculator className="h-4 w-4" />
              <span>合计：¥{totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 主管审批意见 */}
      <Card className="mb-4 compact-card">
        <CardHeader className="bg-slate-800 text-white compact-card-header">
          <CardTitle className="text-lg">主管审批意见</CardTitle>
        </CardHeader>
        <CardContent className="p-4 compact-card-content">
          <Textarea
            {...register("supervisorComment")}
            rows={2}
            placeholder="主管审批意见..."
            className={cn("text-sm", errors.supervisorComment && "border-red-500 focus:border-red-500")}
          />
          <FormError>{errors.supervisorComment?.message}</FormError>
        </CardContent>
      </Card>

      {/* 批准与批复 */}
      <Card className="mb-4 compact-card">
        <CardHeader className="bg-slate-800 text-white compact-card-header">
          <CardTitle className="text-lg">批准与批复</CardTitle>
        </CardHeader>
        <CardContent className="p-4 compact-card-content">
          <Input
            {...register("approvalComment")}
            placeholder="批复"
            className={cn("text-sm", errors.approvalComment && "border-red-500 focus:border-red-500")}
          />
          <FormError>{errors.approvalComment?.message}</FormError>
        </CardContent>
      </Card>

      {/* 操作按钮 */}
      <div className="flex justify-center gap-3 pt-3">
        <Button
          type="submit"
          disabled={isSubmitting || isSubmittingForApproval}
          className="min-w-20 compact-button"
          size="sm"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              保存中...
            </>
          ) : (
            <>
              <CheckCircle className="w-3 h-3 mr-1" />
              保存
            </>
          )}
        </Button>
        
        <Button
          type="button"
          variant="default"
          onClick={submitForApproval}
          disabled={isSubmitting || isSubmittingForApproval || applicationStatus === 'pending'}
          className="min-w-24 bg-blue-600 hover:bg-blue-700 compact-button"
          size="sm"
        >
          {isSubmittingForApproval ? (
            <>
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              提交中...
            </>
          ) : applicationStatus === 'pending' ? (
            <>
              <CheckCircle className="w-3 h-3 mr-1" />
              已提交
            </>
          ) : (
            <>
              <AlertCircle className="w-3 h-3 mr-1" />
              提交审批
            </>
          )}
        </Button>
        
        <Button
          type="button"
          variant="outline"
          onClick={() => window.print()}
          className="min-w-16 compact-button"
          size="sm"
          disabled={isSubmitting || isSubmittingForApproval}
        >
          打印
        </Button>
      </div>

      {/* 表单状态指示 */}
      {isDirty && (
        <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded-md shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-600 rounded-full animate-pulse"></div>
            <span className="text-sm">表单有未保存的更改</span>
          </div>
        </div>
      )}
    </form>
  )
}
