"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { ExchangeRateDialog } from "@/components/ui/exchange-rate-dialog"
import { 
  Plus, 
  Copy, 
  Trash2, 
  Download, 
  Upload, 
  Calculator,
  TrendingUp,
  AlertTriangle,
  Save,
  Send,
  Printer,
  FileText
} from 'lucide-react'
import { useTravelExpense } from '@/hooks/use-travel-expense'
import { 
  Currency, 
  CURRENCIES, 
  EXPENSE_CATEGORIES,
  TravelExpensePageProps 
} from '@/lib/types/travel-expense'
import { useToast } from '@/hooks/use-toast'

export function TravelExpensePage({ 
  initialData, 
  readonly = false, 
  onSave, 
  onSubmit 
}: TravelExpensePageProps = {}) {
  const { toast } = useToast()
  const [isMounted, setIsMounted] = useState(false)
  const [exchangeRateDialogOpen, setExchangeRateDialogOpen] = useState(false)
  
  const {
    formData,
    loading,
    errors,
    isDirty,
    exchangeRate,
    calculations,
    updateFormData,
    validateForm,
    addExpenseItem,
    updateExpenseItem,
    removeExpenseItem,
    duplicateExpenseItem,
    clearAllExpenseItems,
    addAllowanceItem,
    updateAllowanceItem,
    removeAllowanceItem,
    exportData,
    importData,
    resetForm
  } = useTravelExpense({ initialData, autoSave: true })

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleSave = async () => {
    try {
      if (onSave) {
        await onSave(formData)
      }
      toast({
        title: "保存成功",
        description: "差旅报销单已保存",
      })
    } catch (error) {
      toast({
        title: "保存失败",
        description: error instanceof Error ? error.message : "保存时发生错误",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast({
        title: "表单验证失败",
        description: "请检查并填写所有必填项",
        variant: "destructive",
      })
      return
    }

    try {
      if (onSubmit) {
        await onSubmit(formData)
      }
      toast({
        title: "提交成功",
        description: "差旅报销单已提交审批",
      })
    } catch (error) {
      toast({
        title: "提交失败",
        description: error instanceof Error ? error.message : "提交时发生错误",
        variant: "destructive",
      })
    }
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        try {
          await importData(file)
          toast({
            title: "导入成功",
            description: "数据已成功导入",
          })
        } catch (error) {
          toast({
            title: "导入失败",
            description: error instanceof Error ? error.message : "导入时发生错误",
            variant: "destructive",
          })
        }
      }
    }
    input.click()
  }

  const formatCurrency = (amount: number, currency: Currency) => {
    return exchangeRate.formatAmount(amount, currency)
  }

  if (!isMounted) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-4">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">差旅费报销单 (GHBC)</h1>
          <p className="text-muted-foreground mt-1">
            支持多币种费用管理和实时汇率换算
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isDirty && (
            <Badge variant="outline" className="text-orange-600 border-orange-200">
              未保存
            </Badge>
          )}
          {exchangeRate.loading && (
            <Badge variant="outline" className="text-blue-600 border-blue-200">
              汇率更新中...
            </Badge>
          )}
        </div>
      </div>

      {/* Application Numbers */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="application-number">出差申请单编号</Label>
              <Input 
                id="application-number"
                value={formData.applicationNumber}
                onChange={(e) => updateFormData({ applicationNumber: e.target.value })}
                placeholder="输入申请单编号"
                disabled={readonly}
                className={errors.applicationNumber ? 'border-red-500' : ''}
              />
              {errors.applicationNumber && (
                <p className="text-sm text-red-500 mt-1">{errors.applicationNumber}</p>
              )}
            </div>
            <div>
              <Label htmlFor="reimbursement-number">报销单编号</Label>
              <Input 
                id="reimbursement-number"
                value={formData.reimbursementNumber}
                onChange={(e) => updateFormData({ reimbursementNumber: e.target.value })}
                placeholder="自动生成或手动输入"
                disabled={readonly}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader className="bg-slate-800 text-white">
          <CardTitle>基本信息</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="applicant">报销申请人 *</Label>
              <Input 
                id="applicant"
                value={formData.applicant}
                onChange={(e) => updateFormData({ applicant: e.target.value })}
                placeholder="输入申请人姓名"
                disabled={readonly}
                className={errors.applicant ? 'border-red-500' : ''}
              />
              {errors.applicant && (
                <p className="text-sm text-red-500 mt-1">{errors.applicant}</p>
              )}
            </div>
            <div>
              <Label htmlFor="employee-id">员工工号 *</Label>
              <Input 
                id="employee-id"
                value={formData.employeeId}
                onChange={(e) => updateFormData({ employeeId: e.target.value })}
                placeholder="输入员工工号"
                disabled={readonly}
                className={errors.employeeId ? 'border-red-500' : ''}
              />
              {errors.employeeId && (
                <p className="text-sm text-red-500 mt-1">{errors.employeeId}</p>
              )}
            </div>
            <div>
              <Label htmlFor="department">所属部门 *</Label>
              <Input 
                id="department"
                value={formData.department}
                onChange={(e) => updateFormData({ department: e.target.value })}
                placeholder="输入所属部门"
                disabled={readonly}
                className={errors.department ? 'border-red-500' : ''}
              />
              {errors.department && (
                <p className="text-sm text-red-500 mt-1">{errors.department}</p>
              )}
            </div>
            <div>
              <Label htmlFor="application-date">申请日期</Label>
              <Input 
                id="application-date"
                type="date"
                value={formData.applicationDate.toISOString().split('T')[0]}
                onChange={(e) => updateFormData({ applicationDate: new Date(e.target.value) })}
                disabled={readonly}
              />
            </div>
            <div>
              <Label htmlFor="travel-date">出差日期</Label>
              <Input 
                id="travel-date"
                type="date"
                value={formData.travelDate.toISOString().split('T')[0]}
                onChange={(e) => updateFormData({ travelDate: new Date(e.target.value) })}
                disabled={readonly}
              />
            </div>
            <div>
              <Label htmlFor="company">所属公司</Label>
              <Input 
                id="company"
                value={formData.company}
                onChange={(e) => updateFormData({ company: e.target.value })}
                placeholder="输入所属公司"
                disabled={readonly}
              />
            </div>
            <div>
              <Label htmlFor="start-date">启程日期</Label>
              <Input 
                id="start-date"
                type="date"
                value={formData.startDate.toISOString().split('T')[0]}
                onChange={(e) => updateFormData({ startDate: new Date(e.target.value) })}
                disabled={readonly}
              />
            </div>
            <div>
              <Label htmlFor="return-date">返程日期</Label>
              <Input 
                id="return-date"
                type="date"
                value={formData.returnDate.toISOString().split('T')[0]}
                onChange={(e) => updateFormData({ returnDate: new Date(e.target.value) })}
                disabled={readonly}
                className={errors.returnDate ? 'border-red-500' : ''}
              />
              {errors.returnDate && (
                <p className="text-sm text-red-500 mt-1">{errors.returnDate}</p>
              )}
            </div>
            <div>
              <Label htmlFor="days">天数</Label>
              <Input 
                id="days"
                type="number"
                value={formData.days}
                onChange={(e) => updateFormData({ days: parseInt(e.target.value) || 0 })}
                disabled={readonly}
                min="1"
              />
            </div>
            <div className="md:col-span-3">
              <Label htmlFor="purpose">事由描述 *</Label>
              <Textarea 
                id="purpose"
                value={formData.purpose}
                onChange={(e) => updateFormData({ purpose: e.target.value })}
                placeholder="详细描述出差事由和目的"
                rows={2}
                disabled={readonly}
                className={errors.purpose ? 'border-red-500' : ''}
              />
              {errors.purpose && (
                <p className="text-sm text-red-500 mt-1">{errors.purpose}</p>
              )}
            </div>
            <div className="md:col-span-3">
              <Label htmlFor="local-contact">当地联系人</Label>
              <Input 
                id="local-contact"
                value={formData.localContact}
                onChange={(e) => updateFormData({ localContact: e.target.value })}
                placeholder="输入当地联系人信息"
                disabled={readonly}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exchange Rate Info */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calculator className="h-5 w-5 text-blue-600" />
              <div>
                <h3 className="font-semibold text-blue-900">汇率信息</h3>
                <p className="text-sm text-blue-700">
                  最后更新: {exchangeRate.lastUpdated.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setExchangeRateDialogOpen(true)}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                汇率管理
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mt-4">
            {CURRENCIES.filter(c => c.code !== 'CNY').map(currency => (
              <div key={currency.code} className="text-center p-2 bg-white rounded border">
                <div className="font-semibold text-sm">{currency.code}</div>
                <div className="text-xs text-muted-foreground">{currency.symbol}</div>
                <div className="text-sm font-mono">
                  {exchangeRate.rates[currency.code]?.toFixed(4) || '0.0000'}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Travel Allowance */}
      <Card>
        <CardHeader className="bg-slate-800 text-white">
          <CardTitle>行政津贴</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="mb-4 flex flex-wrap gap-2">
            <Button size="sm" onClick={addAllowanceItem} disabled={readonly}>
              <Plus className="h-4 w-4 mr-2" />
              增加
            </Button>
            <Button size="sm" variant="outline" onClick={handleImport} disabled={readonly}>
              <Upload className="h-4 w-4 mr-2" />
              导入数据
            </Button>
            <Button size="sm" variant="outline" onClick={exportData}>
              <Download className="h-4 w-4 mr-2" />
              导出数据
            </Button>
          </div>
          
          {formData.allowanceItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>暂无津贴项目，点击"增加"按钮添加</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">序号</TableHead>
                    <TableHead>日期</TableHead>
                    <TableHead>起始地点</TableHead>
                    <TableHead>FP代码/港币</TableHead>
                    <TableHead className="w-24">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formData.allowanceItems.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <Input
                          type="date"
                          value={item.date.toISOString().split('T')[0]}
                          onChange={(e) => updateAllowanceItem(item.id, { 
                            date: new Date(e.target.value) 
                          })}
                          disabled={readonly}
                          className="min-w-[140px]"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={item.startLocation}
                          onChange={(e) => updateAllowanceItem(item.id, { 
                            startLocation: e.target.value 
                          })}
                          placeholder="输入地点"
                          disabled={readonly}
                          className="min-w-[120px]"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Input
                            value={item.fpCode}
                            onChange={(e) => updateAllowanceItem(item.id, { 
                              fpCode: e.target.value 
                            })}
                            placeholder="FP代码"
                            disabled={readonly}
                            className="min-w-[100px]"
                          />
                          <Input
                            type="number"
                            value={item.hkdAmount}
                            onChange={(e) => updateAllowanceItem(item.id, { 
                              hkdAmount: parseFloat(e.target.value) || 0 
                            })}
                            placeholder="港币金额"
                            disabled={readonly}
                            className="min-w-[100px]"
                            step="0.01"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeAllowanceItem(item.id)}
                          disabled={readonly}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          {formData.allowanceItems.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-semibold">津贴总计:</span>
                <span className="text-lg font-bold text-green-600">
                  HK$ {calculations.totalHKD.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expense Details */}
      <Card>
        <CardHeader className="bg-slate-800 text-white">
          <CardTitle>费用明细 (多币种支持)</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="mb-4 flex flex-wrap gap-2">
            <Button size="sm" onClick={addExpenseItem} disabled={readonly}>
              <Plus className="h-4 w-4 mr-2" />
              增加
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={clearAllExpenseItems} 
              disabled={readonly || formData.expenseItems.length === 0}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              删除全部
            </Button>
            <Button size="sm" variant="outline" onClick={handleImport} disabled={readonly}>
              <Upload className="h-4 w-4 mr-2" />
              导入数据
            </Button>
            <Button size="sm" variant="outline" onClick={exportData}>
              <Download className="h-4 w-4 mr-2" />
              导出数据
            </Button>
          </div>

          {formData.expenseItems.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calculator className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">暂无费用明细</p>
              <p className="text-sm">点击"增加"按钮开始添加费用项目</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">序号</TableHead>
                    <TableHead className="min-w-[120px]">费用科目</TableHead>
                    <TableHead className="min-w-[140px]">费用日期</TableHead>
                    <TableHead className="min-w-[100px]">币别</TableHead>
                    <TableHead className="min-w-[100px]">汇率</TableHead>
                    <TableHead className="min-w-[120px]">发票金额</TableHead>
                    <TableHead className="min-w-[120px]">人民币金额</TableHead>
                    <TableHead className="min-w-[100px]">时间</TableHead>
                    <TableHead className="min-w-[150px]">备注</TableHead>
                    <TableHead className="w-24">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formData.expenseItems.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <Select
                          value={item.category}
                          onValueChange={(value) => updateExpenseItem(item.id, { category: value })}
                          disabled={readonly}
                        >
                          <SelectTrigger className={errors[`expenseItems.${index}.category`] ? 'border-red-500' : ''}>
                            <SelectValue placeholder="选择科目" />
                          </SelectTrigger>
                          <SelectContent>
                            {EXPENSE_CATEGORIES.map(category => (
                              <SelectItem key={category.value} value={category.value}>
                                {category.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors[`expenseItems.${index}.category`] && (
                          <p className="text-xs text-red-500 mt-1">
                            {errors[`expenseItems.${index}.category`]}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Input
                          type="date"
                          value={item.expenseDate.toISOString().split('T')[0]}
                          onChange={(e) => updateExpenseItem(item.id, { 
                            expenseDate: new Date(e.target.value) 
                          })}
                          disabled={readonly}
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={item.currency}
                          onValueChange={(value: Currency) => updateExpenseItem(item.id, { currency: value })}
                          disabled={readonly}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CURRENCIES.map(currency => (
                              <SelectItem key={currency.code} value={currency.code}>
                                <div className="flex items-center gap-2">
                                  <span>{currency.symbol}</span>
                                  <span>{currency.code}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            value={item.exchangeRate}
                            onChange={(e) => updateExpenseItem(item.id, { 
                              exchangeRate: parseFloat(e.target.value) || 0 
                            })}
                            disabled={readonly}
                            step="0.0001"
                            className="text-xs"
                          />
                          <Badge variant="outline" className="text-xs whitespace-nowrap">
                            {item.currency}→CNY
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.invoiceAmount}
                          onChange={(e) => updateExpenseItem(item.id, { 
                            invoiceAmount: parseFloat(e.target.value) || 0 
                          })}
                          disabled={readonly}
                          step="0.01"
                          className={errors[`expenseItems.${index}.invoiceAmount`] ? 'border-red-500' : ''}
                        />
                        {errors[`expenseItems.${index}.invoiceAmount`] && (
                          <p className="text-xs text-red-500 mt-1">
                            {errors[`expenseItems.${index}.invoiceAmount`]}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-green-600">
                          ¥{item.rmbAmount.toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input
                          value={item.time || ''}
                          onChange={(e) => updateExpenseItem(item.id, { time: e.target.value })}
                          placeholder="时间"
                          disabled={readonly}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={item.remarks || ''}
                          onChange={(e) => updateExpenseItem(item.id, { remarks: e.target.value })}
                          placeholder="备注"
                          disabled={readonly}
                          className={errors[`expenseItems.${index}.description`] ? 'border-red-500' : ''}
                        />
                        {errors[`expenseItems.${index}.description`] && (
                          <p className="text-xs text-red-500 mt-1">
                            {errors[`expenseItems.${index}.description`]}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => duplicateExpenseItem(item.id)}
                            disabled={readonly}
                            title="复制"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeExpenseItem(item.id)}
                            disabled={readonly}
                            title="删除"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {formData.expenseItems.length > 0 && (
            <>
              <Separator className="my-6" />
              
              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-green-200 bg-green-50/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-green-800">费用汇总</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>费用项目数:</span>
                      <span className="font-semibold">{calculations.itemCount} 项</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>人民币总计:</span>
                      <span className="text-xl font-bold text-green-600">
                        ¥{calculations.totalRMB.toFixed(2)}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-blue-200 bg-blue-50/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-blue-800">按币种统计</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {Object.entries(calculations.byCurrency)
                      .filter(([_, amount]) => amount > 0)
                      .map(([currency, amount]) => {
                        const currencyInfo = CURRENCIES.find(c => c.code === currency)
                        return (
                          <div key={currency} className="flex justify-between items-center text-sm">
                            <span>{currencyInfo?.name} ({currency}):</span>
                            <span className="font-semibold">
                              {formatCurrency(amount, currency as Currency)}
                            </span>
                          </div>
                        )
                      })}
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          <div className="mt-6">
            <Label htmlFor="expense-description">费用明细说明</Label>
            <Textarea 
              id="expense-description"
              value={formData.expenseDescription}
              onChange={(e) => updateFormData({ expenseDescription: e.target.value })}
              placeholder="详细说明差旅费用情况..."
              rows={3}
              disabled={readonly}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Summary Information */}
      <Card>
        <CardHeader className="bg-slate-800 text-white">
          <CardTitle>报销费用汇总</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="total-applicants">申请人数</Label>
              <Input 
                id="total-applicants"
                type="number"
                value={formData.totalApplicants}
                onChange={(e) => updateFormData({ totalApplicants: parseInt(e.target.value) || 1 })}
                disabled={readonly}
                min="1"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="subtotal-persons">小计人数</Label>
              <Input 
                id="subtotal-persons"
                type="number"
                value={formData.subtotalPersons}
                onChange={(e) => updateFormData({ subtotalPersons: parseInt(e.target.value) || 1 })}
                disabled={readonly}
                min="1"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="total-company-expense">总计费用 (CNY)</Label>
              <Input 
                id="total-company-expense"
                type="number"
                value={calculations.totalRMB.toFixed(2)}
                disabled
                className="mt-1 font-semibold text-green-600"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Summary */}
      {Object.keys(errors).length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-semibold mb-2">请修正以下错误:</div>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {Object.entries(errors).map(([field, message]) => (
                <li key={field}>{message}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center gap-4 pt-6">
        <Button onClick={handleSave} disabled={loading || readonly}>
          <Save className="h-4 w-4 mr-2" />
          保存
        </Button>
        <Button onClick={handleSubmit} disabled={loading || readonly}>
          <Send className="h-4 w-4 mr-2" />
          提交审批
        </Button>
        <Button variant="outline" onClick={() => window.print()}>
          <Printer className="h-4 w-4 mr-2" />
          打印
        </Button>
        <Button variant="outline" onClick={exportData}>
          <Download className="h-4 w-4 mr-2" />
          导出
        </Button>
        {!readonly && (
          <Button variant="outline" onClick={resetForm}>
            重置表单
          </Button>
        )}
      </div>

      {/* Exchange Rate Dialog */}
      <ExchangeRateDialog 
        open={exchangeRateDialogOpen}
        onOpenChange={setExchangeRateDialogOpen}
      />
    </div>
  )
}
