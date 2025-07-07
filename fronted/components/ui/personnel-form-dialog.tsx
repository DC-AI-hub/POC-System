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

// 部门选项 - 与数据库实际部门保持一致
const departmentOptions = [
  { value: "信息技术部", label: "信息技术部" },
  { value: "财务部", label: "财务部" },
  { value: "人力资源部", label: "人力资源部" },
  { value: "交易部", label: "交易部" },
  { value: "风控部", label: "风控部" },
  { value: "合规部", label: "合规部" },
  { value: "客户服务部", label: "客户服务部" },
  { value: "运营部", label: "运营部" },
];

// 主管选项 - 精简版
const managerOptions = [
  { value: "李总监", label: "李总监" },
  { value: "魏主管", label: "魏主管" },
  { value: "钟总监", label: "钟总监" },
  { value: "CEO", label: "CEO" },
  { value: "CTO", label: "CTO" },
];

// 工作地点选项
const workLocationOptions = [
  { value: "香港中环", label: "香港中环" },
  { value: "深圳南山", label: "深圳南山" },
  { value: "上海浦东", label: "上海浦东" },
  { value: "北京朝阳", label: "北京朝阳" },
  { value: "广州天河", label: "广州天河" },
];

// 职位选项 - 与数据库实际职位保持一致
const positionOptions = [
  { value: "系统管理员", label: "系统管理员" },
  { value: "高级软件工程师", label: "高级软件工程师" },
  { value: "数据库管理员", label: "数据库管理员" },
  { value: "系统架构师", label: "系统架构师" },
  { value: "前端开发", label: "前端开发" },
  { value: "会计师", label: "会计师" },
  { value: "高级会计师", label: "高级会计师" },
  { value: "出纳员", label: "出纳员" },
  { value: "财务分析师", label: "财务分析师" },
  { value: "会计助理", label: "会计助理" },
  { value: "HR专员", label: "HR专员" },
  { value: "人力资源总监", label: "人力资源总监" },
  { value: "招聘专员", label: "招聘专员" },
  { value: "薪酬专员", label: "薪酬专员" },
  { value: "交易总监", label: "交易总监" },
  { value: "高级交易员", label: "高级交易员" },
  { value: "交易员", label: "交易员" },
  { value: "风控经理", label: "风控经理" },
  { value: "风控专员", label: "风控专员" },
  { value: "风险分析师", label: "风险分析师" },
  { value: "合规总监", label: "合规总监" },
  { value: "合规专员", label: "合规专员" },
  { value: "法务专员", label: "法务专员" },
  { value: "客服总监", label: "客服总监" },
  { value: "高级客服", label: "高级客服" },
  { value: "客服专员", label: "客服专员" },
  { value: "运营总监", label: "运营总监" },
  { value: "运营专员", label: "运营专员" },
  { value: "业务运营", label: "业务运营" },
];

// 自定义日历标题组件 - 可点击选择月份和年份
function CustomCaption({ displayMonth, ...props }: any) {
  const [showMonthPicker, setShowMonthPicker] = React.useState(false);
  const [showYearPicker, setShowYearPicker] = React.useState(false);
  
  const currentYear = displayMonth.getFullYear();
  const currentMonth = displayMonth.getMonth();
  
  const months = [
    "1月", "2月", "3月", "4月", "5月", "6月",
    "7月", "8月", "9月", "10月", "11月", "12月"
  ];
  
  const years = Array.from({ length: 75 }, (_, i) => new Date().getFullYear() - i);
  
  // 获取父组件的月份切换函数
  const goToMonth = (newMonth: Date) => {
    if (props.onMonthChange) {
      props.onMonthChange(newMonth);
    }
  };
  
  return (
    <div className="flex justify-center pt-1 relative items-center">
      <div className="flex items-center space-x-6"> {/* 增加间距从space-x-1到space-x-6 */}
        {/* 月份选择器 */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowMonthPicker(!showMonthPicker);
              setShowYearPicker(false); // 关闭年份选择器
            }}
            className="text-sm font-medium hover:text-blue-600 cursor-pointer transition-colors duration-200"
          >
            {months[currentMonth]}
          </button>
                     {showMonthPicker && (
             <div 
               className="absolute top-8 -left-4 bg-white border rounded-md shadow-lg z-50 max-h-48 overflow-y-scroll min-w-[60px] whitespace-nowrap custom-scrollbar"
               style={{
                 scrollbarWidth: 'thin',
                 scrollbarColor: '#cbd5e0 #f7fafc',
                 WebkitOverflowScrolling: 'touch'
               }}
               onWheel={(e) => {
                 e.stopPropagation();
               }}
             >
               <div className="py-1">
                 {months.map((month, index) => (
                   <button
                     key={month}
                     type="button"
                     onClick={() => {
                       goToMonth(new Date(currentYear, index));
                       setShowMonthPicker(false);
                     }}
                     className={`block w-full text-left px-3 py-2 hover:bg-blue-50 text-sm transition-colors whitespace-nowrap ${
                       index === currentMonth ? 'bg-blue-100 text-blue-700' : ''
                     }`}
                   >
                     {month}
                   </button>
                 ))}
               </div>
             </div>
           )}
        </div>
        
        {/* 年份选择器 */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowYearPicker(!showYearPicker);
              setShowMonthPicker(false); // 关闭月份选择器
            }}
            className="text-sm font-medium hover:text-blue-600 cursor-pointer transition-colors duration-200"
          >
            {currentYear}
          </button>
                     {showYearPicker && (
             <div 
               className="absolute top-8 -left-4 bg-white border rounded-md shadow-lg z-50 max-h-48 overflow-y-scroll min-w-[70px] whitespace-nowrap custom-scrollbar"
               style={{
                 scrollbarWidth: 'thin',
                 scrollbarColor: '#cbd5e0 #f7fafc',
                 WebkitOverflowScrolling: 'touch'
               }}
               onWheel={(e) => {
                 e.stopPropagation();
               }}
             >
               <div className="py-1">
                 {years.map((year) => (
                   <button
                     key={year}
                     type="button"
                     onClick={() => {
                       goToMonth(new Date(year, currentMonth));
                       setShowYearPicker(false);
                     }}
                     className={`block w-full text-left px-3 py-2 hover:bg-blue-50 text-sm transition-colors whitespace-nowrap ${
                       year === currentYear ? 'bg-blue-100 text-blue-700' : ''
                     }`}
                   >
                     {year}
                   </button>
                 ))}
               </div>
             </div>
           )}
        </div>
      </div>
      
      {/* 点击其他区域关闭下拉框 */}
      {(showMonthPicker || showYearPicker) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setShowMonthPicker(false);
            setShowYearPicker(false);
          }}
        />
      )}
    </div>
  );
}

export function PersonnelFormDialog({
  open,
  onOpenChange,
  personnel,
  onSubmit,
  loading = false,
}: PersonnelFormDialogProps) {
  const isEditing = !!personnel;
  
  // 日历月份状态
  const [calendarMonth, setCalendarMonth] = React.useState<Date>(new Date());

  // 添加CSS样式用于滚动条
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 3px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #cbd5e0;
        border-radius: 3px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #a0aec0;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const form = useForm<PersonnelFormData>({
    resolver: zodResolver(personnelFormSchema),
    defaultValues: {
      name: "",
      loginName: "",
      employeeId: "",
      email: "",
      phone: "",
      department: "",
      position: undefined,
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
        const hireDate = personnel.hireDate;
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
          hireDate: hireDate,
          emergencyContact: personnel.emergencyContact || "",
          emergencyPhone: personnel.emergencyPhone || "",
          notes: personnel.notes || "",
        });
        // 同步日历月份到入职日期
        setCalendarMonth(hireDate || new Date());
      } else {
        // 新增模式：重置为默认值
        const defaultDate = new Date();
        reset({
          name: "",
          loginName: "",
          employeeId: "",
          email: "",
          phone: "",
          department: "",
          position: undefined,
          manager: "",
          workLocation: "",
          employeeType: "full-time",
          status: "active",
          hireDate: defaultDate,
          emergencyContact: "",
          emergencyPhone: "",
          notes: "",
        });
        // 同步日历月份到当前月份
        setCalendarMonth(defaultDate);
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

  // 验证必填字段是否完整
  const validateRequiredFields = () => {
    const requiredFields = [
      { key: 'name', label: '姓名' },
      { key: 'loginName', label: '登录名' },
      { key: 'employeeId', label: '员工工号' },
      { key: 'email', label: '邮箱' },
      { key: 'phone', label: '手机号' },
      { key: 'department', label: '部门' },
      { key: 'position', label: '职位' },
      { key: 'manager', label: '直属主管' },
      { key: 'workLocation', label: '工作地点' },
    ];

    const missingFields = requiredFields.filter(field => {
      const value = watchedValues[field.key as keyof PersonnelFormData];
      return !value || (typeof value === 'string' && value.trim() === '');
    });

    if (missingFields.length > 0) {
      const missingFieldNames = missingFields.map(field => field.label).join('、');
      alert(`请完善信息：缺少${missingFieldNames}`);
      return false;
    }
    return true;
  };

  // 重写提交处理
  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 先进行基本验证
    if (!validateRequiredFields()) {
      return;
    }
    
    // 然后执行表单验证和提交
    handleSubmit(handleFormSubmit)(e);
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

        <form onSubmit={handleCustomSubmit} className="space-y-6">
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
                          month={calendarMonth}
                          onMonthChange={setCalendarMonth}
                          fromYear={1950}
                          toYear={new Date().getFullYear()}
                          locale={zhCN}
                          components={{
                            Caption: (props) => <CustomCaption {...props} onMonthChange={setCalendarMonth} />
                          }}
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
                    <Label className="text-sm font-medium">
                      职位 <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={watchedValues.position}
                      onValueChange={(value) => setValue("position", value)}
                    >
                      <SelectTrigger className={cn(errors.position && "border-red-500")}>
                        <SelectValue placeholder="请选择职位" />
                      </SelectTrigger>
                      <SelectContent>
                        {positionOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                      紧急联系人
                    </Label>
                    <Input
                      id="emergencyContact"
                      {...register("emergencyContact")}
                      placeholder="请输入紧急联系人姓名（选填）"
                      className={cn(errors.emergencyContact && "border-red-500")}
                    />
                    {errors.emergencyContact && (
                      <p className="text-sm text-red-500">{errors.emergencyContact.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergencyPhone" className="text-sm font-medium">
                      紧急联系人电话
                    </Label>
                    <Input
                      id="emergencyPhone"
                      {...register("emergencyPhone")}
                      placeholder="请输入紧急联系人电话（选填）"
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