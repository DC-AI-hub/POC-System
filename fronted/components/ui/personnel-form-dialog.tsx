"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CalendarIcon, AlertCircle, User, Building, Phone, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import {
  personnelFormSchema,
  employeeTypeOptions,
  employeeStatusOptions,
  fieldLabels,
  type PersonnelFormData,
} from "@/lib/validations/personnel-management";
import type { PersonnelInfo } from "@/lib/types/personnel-management";

interface PersonnelFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personnel?: PersonnelInfo | null;
  onSubmit: (data: PersonnelFormData) => Promise<void>;
  loading?: boolean;
}

// 部门选项
const departmentOptions = [
  { value: "财务部", label: "财务部" },
  { value: "技术部", label: "技术部" },
  { value: "人事部", label: "人事部" },
  { value: "市场部", label: "市场部" },
  { value: "运营部", label: "运营部" },
];

// 主管选项
const managerOptions = [
  { value: "李总监", label: "李总监" },
  { value: "王总监", label: "王总监" },
  { value: "赵经理", label: "赵经理" },
  { value: "钱主管", label: "钱主管" },
  { value: "CEO", label: "CEO" },
];

// 工作地点选项
const workLocationOptions = [
  { value: "香港中环", label: "香港中环" },
  { value: "深圳南山", label: "深圳南山" },
  { value: "上海浦东", label: "上海浦东" },
  { value: "北京朝阳", label: "北京朝阳" },
  { value: "广州天河", label: "广州天河" },
];

export function PersonnelFormDialog({
  open,
  onOpenChange,
  personnel,
  onSubmit,
  loading = false,
}: PersonnelFormDialogProps) {
  const isEditing = !!personnel;

  const form = useForm<PersonnelFormData>({
    resolver: zodResolver(personnelFormSchema),
    defaultValues: {
      name: "",
      loginName: "",
      employeeId: "",
      email: "",
      phone: "",
      department: "",
      position: "",
      manager: "",
      workLocation: "",
      employeeType: "full-time",
      status: "active",
      hireDate: new Date(),
      emergencyContact: "",
      emergencyPhone: "",
      notes: "",
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  // 监听表单值变化
  const watchedValues = watch();

  // 重置表单
  useEffect(() => {
    if (open) {
      if (personnel) {
        // 编辑模式：填充现有数据
        reset({
          name: personnel.name,
          loginName: personnel.loginName,
          employeeId: personnel.employeeId,
          email: personnel.email,
          phone: personnel.phone,
          department: personnel.department,
          position: personnel.position,
          manager: personnel.manager,
          workLocation: personnel.workLocation || "",
          employeeType: personnel.employeeType,
          status: personnel.status,
          hireDate: personnel.hireDate,
          emergencyContact: personnel.emergencyContact || "",
          emergencyPhone: personnel.emergencyPhone || "",
          notes: personnel.notes || "",
        });
      } else {
        // 新增模式：重置为默认值
        reset({
          name: "",
          loginName: "",
          employeeId: "",
          email: "",
          phone: "",
          department: "",
          position: "",
          manager: "",
          workLocation: "",
          employeeType: "full-time",
          status: "active",
          hireDate: new Date(),
          emergencyContact: "",
          emergencyPhone: "",
          notes: "",
        });
      }
    }
  }, [open, personnel, reset]);

  const handleFormSubmit = async (data: PersonnelFormData) => {
    try {
      await onSubmit(data);
      onOpenChange(false);
    } catch (error) {
      // 错误处理由父组件负责
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            {isEditing ? "编辑员工信息" : "新增员工"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                基本信息
              </TabsTrigger>
              <TabsTrigger value="organization" className="flex items-center gap-2">
                <Building className="w-4 h-4" />
                组织关系
              </TabsTrigger>
              <TabsTrigger value="contact" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                联系方式
              </TabsTrigger>
              <TabsTrigger value="additional" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                其他信息
              </TabsTrigger>
            </TabsList>

            {/* 基本信息 */}
            <TabsContent value="basic" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">基本信息</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                      姓名 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      {...register("name")}
                      placeholder="请输入员工姓名"
                      className={cn(errors.name && "border-red-500")}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500">{errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="loginName" className="text-sm font-medium">
                      登录名 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="loginName"
                      {...register("loginName")}
                      placeholder="请输入登录名"
                      className={cn(errors.loginName && "border-red-500")}
                    />
                    {errors.loginName && (
                      <p className="text-sm text-red-500">{errors.loginName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="employeeId" className="text-sm font-medium">
                      员工工号 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="employeeId"
                      {...register("employeeId")}
                      placeholder="请输入员工工号"
                      className={cn(errors.employeeId && "border-red-500")}
                    />
                    {errors.employeeId && (
                      <p className="text-sm text-red-500">{errors.employeeId.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      邮箱 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      {...register("email")}
                      placeholder="请输入邮箱地址"
                      className={cn(errors.email && "border-red-500")}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium">
                      手机号 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="phone"
                      {...register("phone")}
                      placeholder="请输入手机号"
                      className={cn(errors.phone && "border-red-500")}
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-500">{errors.phone.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      入职日期 <span className="text-red-500">*</span>
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !watchedValues.hireDate && "text-muted-foreground",
                            errors.hireDate && "border-red-500"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {watchedValues.hireDate ? (
                            format(watchedValues.hireDate, "PPP", { locale: zhCN })
                          ) : (
                            <span>选择入职日期</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={watchedValues.hireDate}
                          onSelect={(date) => setValue("hireDate", date || new Date())}
                          disabled={(date) => date > new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {errors.hireDate && (
                      <p className="text-sm text-red-500">{errors.hireDate.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 组织关系 */}
            <TabsContent value="organization" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">组织关系</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      部门 <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={watchedValues.department}
                      onValueChange={(value) => setValue("department", value)}
                    >
                      <SelectTrigger className={cn(errors.department && "border-red-500")}>
                        <SelectValue placeholder="请选择部门" />
                      </SelectTrigger>
                      <SelectContent>
                        {departmentOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.department && (
                      <p className="text-sm text-red-500">{errors.department.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="position" className="text-sm font-medium">
                      职位 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="position"
                      {...register("position")}
                      placeholder="请输入职位"
                      className={cn(errors.position && "border-red-500")}
                    />
                    {errors.position && (
                      <p className="text-sm text-red-500">{errors.position.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      直属主管 <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={watchedValues.manager}
                      onValueChange={(value) => setValue("manager", value)}
                    >
                      <SelectTrigger className={cn(errors.manager && "border-red-500")}>
                        <SelectValue placeholder="请选择直属主管" />
                      </SelectTrigger>
                      <SelectContent>
                        {managerOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.manager && (
                      <p className="text-sm text-red-500">{errors.manager.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      工作地点 <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={watchedValues.workLocation}
                      onValueChange={(value) => setValue("workLocation", value)}
                    >
                      <SelectTrigger className={cn(errors.workLocation && "border-red-500")}>
                        <SelectValue placeholder="请选择工作地点" />
                      </SelectTrigger>
                      <SelectContent>
                        {workLocationOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.workLocation && (
                      <p className="text-sm text-red-500">{errors.workLocation.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      员工类型 <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={watchedValues.employeeType}
                      onValueChange={(value) => setValue("employeeType", value as PersonnelFormData["employeeType"])}
                    >
                      <SelectTrigger className={cn(errors.employeeType && "border-red-500")}>
                        <SelectValue placeholder="请选择员工类型" />
                      </SelectTrigger>
                      <SelectContent>
                        {employeeTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.employeeType && (
                      <p className="text-sm text-red-500">{errors.employeeType.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      员工状态 <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={watchedValues.status}
                      onValueChange={(value) => setValue("status", value as PersonnelFormData["status"])}
                    >
                      <SelectTrigger className={cn(errors.status && "border-red-500")}>
                        <SelectValue placeholder="请选择员工状态" />
                      </SelectTrigger>
                      <SelectContent>
                        {employeeStatusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.status && (
                      <p className="text-sm text-red-500">{errors.status.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 联系方式 */}
            <TabsContent value="contact" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">紧急联系人</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContact" className="text-sm font-medium">
                      紧急联系人 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="emergencyContact"
                      {...register("emergencyContact")}
                      placeholder="请输入紧急联系人姓名"
                      className={cn(errors.emergencyContact && "border-red-500")}
                    />
                    {errors.emergencyContact && (
                      <p className="text-sm text-red-500">{errors.emergencyContact.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergencyPhone" className="text-sm font-medium">
                      紧急联系人电话 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="emergencyPhone"
                      {...register("emergencyPhone")}
                      placeholder="请输入紧急联系人电话"
                      className={cn(errors.emergencyPhone && "border-red-500")}
                    />
                    {errors.emergencyPhone && (
                      <p className="text-sm text-red-500">{errors.emergencyPhone.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 其他信息 */}
            <TabsContent value="additional" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">备注信息</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-sm font-medium">
                      备注
                    </Label>
                    <Textarea
                      id="notes"
                      {...register("notes")}
                      placeholder="请输入备注信息（可选）"
                      rows={4}
                      className={cn(errors.notes && "border-red-500")}
                    />
                    {errors.notes && (
                      <p className="text-sm text-red-500">{errors.notes.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* 表单操作按钮 */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading || isSubmitting}
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={loading || isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {(loading || isSubmitting) && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {isEditing ? "更新" : "创建"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 