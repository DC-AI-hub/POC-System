"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge } from "@/components/ui/status-badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { PersonnelFormDialog } from "@/components/ui/personnel-form-dialog";
import { usePersonnelManagement } from "@/hooks/use-personnel-management";
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Download, 
  Upload,
  RefreshCw, 
  Filter,
  X,
  AlertCircle,
  Loader2,
  Users,
  Building,
  UserCheck,
  UserX,
  UserMinus,
  MoreHorizontal,
  FileText,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { PersonnelInfo } from "@/lib/types/personnel-management";
import { 
  employeeTypeOptions, 
  employeeStatusOptions,
  batchOperationOptions 
} from "@/lib/validations/personnel-management";
// 分页组件将通过简单的按钮实现

// 部门选项 - 与数据库实际部门保持一致
const departmentOptions = [
  { value: "all", label: "全部部门" },
  { value: "信息技术部", label: "信息技术部" },
  { value: "财务部", label: "财务部" },
  { value: "人力资源部", label: "人力资源部" },
  { value: "交易部", label: "交易部" },
  { value: "风控部", label: "风控部" },
  { value: "合规部", label: "合规部" },
  { value: "客户服务部", label: "客户服务部" },
  { value: "运营部", label: "运营部" },
];

// 职位选项 - 与数据库实际职位保持一致
const positionOptions = [
  { value: "all", label: "全部职位" },
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

// 主管选项 - 精简版
const managerOptions = [
  { value: "all", label: "全部主管" },
  { value: "李总监", label: "李总监" },
  { value: "魏主管", label: "魏主管" },
  { value: "钟总监", label: "钟总监" },
  { value: "CEO", label: "CEO" },
  { value: "CTO", label: "CTO" },
];

export function PersonnelManagementPage() {
  const {
    // 数据状态
    personnel,
    departments,
    filteredPersonnel,
    selectedPersonnel,
    stats,
    loading,
    error,

    // 搜索和过滤
    searchTerm,
    filters,
    setSearchTerm,
    setFilters,
    clearFilters,

    // 选择操作
    selectPersonnel,
    selectAll,
    clearSelection,

    // CRUD操作
    createPersonnel,
    updatePersonnel,
    deletePersonnel,

    // 批量操作
    batchUpdate,
    batchDelete,

    // 导入导出
    importPersonnel,
    exportPersonnel,

    // 组织架构
    organizationTree,

    // 刷新数据
    refreshData,
  } = usePersonnelManagement();

  // 本地状态
  const [showPersonnelForm, setShowPersonnelForm] = useState(false);
  const [showBatchDialog, setShowBatchDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showOrgChart, setShowOrgChart] = useState(false);
  const [editingPersonnel, setEditingPersonnel] = useState<PersonnelInfo | null>(null);
  const [batchOperation, setBatchOperation] = useState<string>("");
  const [batchValue, setBatchValue] = useState<string>("");

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // 计算分页数据
  const totalItems = filteredPersonnel.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentPageData = filteredPersonnel.slice(startIndex, endIndex);

  // 重置分页当筛选条件改变时
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters]);

  // 检查是否有活动的过滤条件
  const hasActiveFilters = useMemo(() => {
    return Boolean(
      searchTerm ||
      (filters.department && filters.department !== "all") ||
      (filters.position && filters.position !== "all") ||
      (filters.employeeType && filters.employeeType !== "all") ||
      (filters.status && filters.status !== "all") ||
      (filters.manager && filters.manager !== "all")
    );
  }, [searchTerm, filters]);

  // 获取状态标签
  const getStatusBadge = (status: PersonnelInfo["status"]) => {
    const statusMap = {
      active: { status: "approved" as const, label: "在职" },
      inactive: { status: "rejected" as const, label: "离职" },
      transferred: { status: "in-progress" as const, label: "调动" },
      resigned: { status: "draft" as const, label: "辞职" },
    };
    
    const config = statusMap[status];
    return <StatusBadge status={config.status}>{config.label}</StatusBadge>;
  };

  // 获取员工类型标签
  const getEmployeeTypeBadge = (type: PersonnelInfo["employeeType"]) => {
    const typeMap = {
      "full-time": { color: "bg-blue-100 text-blue-800", label: "正式员工" },
      "part-time": { color: "bg-yellow-100 text-yellow-800", label: "兼职员工" },
      "contractor": { color: "bg-purple-100 text-purple-800", label: "合同工" },
    };
    
    const config = typeMap[type];
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  // 处理批量操作
  const handleBatchOperation = async () => {
    if (!batchOperation || selectedPersonnel.size === 0) return;

    if (batchOperation === "delete") {
      await batchDelete(Array.from(selectedPersonnel));
    } else {
      await batchUpdate({
        type: batchOperation as any,
        targetIds: Array.from(selectedPersonnel),
        value: batchValue,
      });
    }

    setShowBatchDialog(false);
    setBatchOperation("");
    setBatchValue("");
  };

  return (
    <div className="p-6 space-y-6">
      {/* 页面标题和统计 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">人员信息管理</h1>
          <p className="text-gray-600 mt-1">管理组织人员信息，支持增删改查及批量操作</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-gray-600">总人数:</span>
              <span className="font-semibold">{stats.totalCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-green-600" />
              <span className="text-gray-600">在职:</span>
              <span className="font-semibold text-green-600">{stats.activeCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <UserX className="w-4 h-4 text-red-600" />
              <span className="text-gray-600">离职:</span>
              <span className="font-semibold text-red-600">{stats.inactiveCount}</span>
            </div>
          </div>
          <Button onClick={refreshData} disabled={loading} size="sm" variant="outline">
            <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
            刷新数据
          </Button>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 搜索和过滤区域 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            搜索和过滤
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="ml-auto text-red-600 hover:text-red-700"
              >
                <X className="w-4 h-4 mr-1" />
                清除过滤
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 搜索框 */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="搜索姓名、工号、邮箱、手机号..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* 过滤选项 */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <Select
              value={filters.department || "all"}
              onValueChange={(value) => setFilters({ department: value === "all" ? "" : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择部门" />
              </SelectTrigger>
              <SelectContent>
                {departmentOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.position || "all"}
              onValueChange={(value) => setFilters({ position: value === "all" ? "" : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择职位" />
              </SelectTrigger>
              <SelectContent>
                {positionOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.employeeType || "all"}
              onValueChange={(value) => setFilters({ employeeType: value === "all" ? "" : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="员工类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                {employeeTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.status || "all"}
              onValueChange={(value) => setFilters({ status: value === "all" ? "" : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="员工状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                {employeeStatusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.manager || "all"}
              onValueChange={(value) => setFilters({ manager: value === "all" ? "" : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="直属主管" />
              </SelectTrigger>
              <SelectContent>
                {managerOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 过滤结果统计 */}
          {hasActiveFilters && (
            <div className="text-sm text-gray-600">
              找到 <span className="font-semibold text-blue-600">{filteredPersonnel.length}</span> 条记录
              {searchTerm && (
                <span className="ml-2">
                  搜索关键词: <span className="font-medium">"{searchTerm}"</span>
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 操作按钮区域 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowPersonnelForm(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            新增员工
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setShowBatchDialog(true)}
            disabled={selectedPersonnel.size === 0}
          >
            <Settings className="w-4 h-4 mr-2" />
            批量操作 ({selectedPersonnel.size})
          </Button>

          <Button variant="outline" onClick={() => setShowImportDialog(true)}>
            <Upload className="w-4 h-4 mr-2" />
            导入数据
          </Button>

          <Button variant="outline" onClick={() => setShowExportDialog(true)}>
            <Download className="w-4 h-4 mr-2" />
            导出数据
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowOrgChart(true)}>
            <Building className="w-4 h-4 mr-2" />
            组织架构
          </Button>
        </div>
      </div>

      {/* 人员列表表格 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>人员列表</span>
            <div className="text-sm font-normal text-gray-600">
              共 {filteredPersonnel.length} 条记录
              {selectedPersonnel.size > 0 && (
                <span className="ml-2 text-blue-600">
                  已选择 {selectedPersonnel.size} 项
                </span>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={
                        currentPageData.length > 0 &&
                        currentPageData.every((person) => selectedPersonnel.has(person.id))
                      }
                      onCheckedChange={(checked) => selectAll(!!checked)}
                    />
                  </TableHead>
                  <TableHead>姓名</TableHead>
                  <TableHead>工号</TableHead>
                  <TableHead>部门</TableHead>
                  <TableHead>职位</TableHead>
                  <TableHead>员工类型</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>直属主管</TableHead>
                  <TableHead>联系方式</TableHead>
                  <TableHead>入职日期</TableHead>
                  <TableHead className="w-24">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin mr-2" />
                        加载中...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : currentPageData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8 text-gray-500">
                      {hasActiveFilters ? "没有找到符合条件的员工" : "暂无员工数据"}
                    </TableCell>
                  </TableRow>
                ) : (
                  currentPageData.map((person) => (
                    <TableRow key={person.id} className="hover:bg-gray-50">
                      <TableCell>
                        <Checkbox
                          checked={selectedPersonnel.has(person.id)}
                          onCheckedChange={() => selectPersonnel(person.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{person.name}</div>
                        <div className="text-sm text-gray-500">{person.loginName}</div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{person.employeeId}</TableCell>
                      <TableCell>{person.department}</TableCell>
                      <TableCell>{person.position}</TableCell>
                      <TableCell>{getEmployeeTypeBadge(person.employeeType)}</TableCell>
                      <TableCell>{getStatusBadge(person.status)}</TableCell>
                      <TableCell>{person.manager}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{person.phone}</div>
                          <div className="text-gray-500">{person.email}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {person.hireDate.toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingPersonnel(person);
                              setShowPersonnelForm(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deletePersonnel(person.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* 分页控件 */}
          {filteredPersonnel.length > 0 && (
            <div className="flex items-center justify-between px-4 py-4 border-t">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>
                  显示第 {startIndex + 1} - {Math.min(endIndex, totalItems)} 条，共 {totalItems} 条记录
                </span>
                <div className="flex items-center gap-2">
                  <span>每页显示:</span>
                  <Select
                    value={pageSize.toString()}
                    onValueChange={(value) => {
                      setPageSize(Number(value));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                  <span>条</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage <= 1}
                >
                  上一页
                </Button>
                
                <div className="flex items-center gap-1">
                  {/* 页码按钮 */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNumber}
                        variant={pageNumber === currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNumber)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNumber}
                      </Button>
                    );
                  })}
                  
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                      <span className="px-2">...</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(totalPages)}
                        className="w-8 h-8 p-0"
                      >
                        {totalPages}
                      </Button>
                    </>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage >= totalPages}
                >
                  下一页
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 人员表单弹窗 */}
      <PersonnelFormDialog
        open={showPersonnelForm}
        onOpenChange={(open) => {
          setShowPersonnelForm(open);
          if (!open) {
            setEditingPersonnel(null);
          }
        }}
        personnel={editingPersonnel}
        onSubmit={async (data) => {
          const formData = {
            ...data,
            notes: data.notes || "",
            emergencyContact: data.emergencyContact || "",
            emergencyPhone: data.emergencyPhone || "",
          };
          if (editingPersonnel) {
            await updatePersonnel(editingPersonnel.id, formData);
          } else {
            await createPersonnel(formData);
          }
        }}
        loading={loading}
      />

      {/* 批量操作弹窗 */}
      <Dialog open={showBatchDialog} onOpenChange={setShowBatchDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>批量操作</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              已选择 {selectedPersonnel.size} 个员工
            </div>
            
            <div className="space-y-2">
              <Label>操作类型</Label>
              <Select value={batchOperation} onValueChange={setBatchOperation}>
                <SelectTrigger>
                  <SelectValue placeholder="请选择操作类型" />
                </SelectTrigger>
                <SelectContent>
                  {batchOperationOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {batchOperation && batchOperation !== "delete" && (
              <div className="space-y-2">
                <Label>新值</Label>
                {batchOperation === "department" && (
                  <Select value={batchValue} onValueChange={setBatchValue}>
                    <SelectTrigger>
                      <SelectValue placeholder="请选择部门" />
                    </SelectTrigger>
                    <SelectContent>
                      {departmentOptions.slice(1).map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {batchOperation === "status" && (
                  <Select value={batchValue} onValueChange={setBatchValue}>
                    <SelectTrigger>
                      <SelectValue placeholder="请选择状态" />
                    </SelectTrigger>
                    <SelectContent>
                      {employeeStatusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {batchOperation === "manager" && (
                  <Select value={batchValue} onValueChange={setBatchValue}>
                    <SelectTrigger>
                      <SelectValue placeholder="请选择主管" />
                    </SelectTrigger>
                    <SelectContent>
                      {managerOptions.slice(1).map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}

            {batchOperation === "delete" && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  此操作将永久删除选中的员工信息，无法恢复。
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowBatchDialog(false)}>
                取消
              </Button>
              <Button
                onClick={handleBatchOperation}
                disabled={!batchOperation || (batchOperation !== "delete" && !batchValue)}
                variant={batchOperation === "delete" ? "destructive" : "default"}
              >
                确认操作
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 导入弹窗 */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>导入员工数据</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              支持 CSV (.csv) 格式，请先下载模板文件
            </div>
            
            <div className="space-y-2">
              <Label>选择文件</Label>
              <Input
                type="file"
                accept=".csv"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    try {
                      const result = await importPersonnel(file);
                      if (result.success) {
                        setShowImportDialog(false);
                      }
                    } catch (error) {
                      // 错误已经在hook中处理
                    }
                  }
                }}
              />
            </div>

            <div className="text-xs text-gray-500">
              <div className="font-medium mb-1">文件格式要求：</div>
              <ul className="space-y-1">
                <li>• 第一行为表头</li>
                <li>• 必需字段：姓名、登录名、工号、邮箱、手机、部门、职位</li>
                <li>• 员工类型：正式员工/兼职员工/合同工</li>
                <li>• 员工状态：在职/离职/调动/辞职</li>
              </ul>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowImportDialog(false)}>
                取消
              </Button>
              <Button variant="outline" onClick={() => {
                // 下载CSV模板
                const link = document.createElement('a');
                link.href = '/templates/personnel-template.csv';
                link.download = '员工信息导入模板.csv';
                link.click();
              }}>
                下载模板
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 导出弹窗 */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>导出员工数据</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>导出格式</Label>
              <Select defaultValue="excel">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excel">Excel 格式</SelectItem>
                  <SelectItem value="csv">CSV 格式</SelectItem>
                  <SelectItem value="pdf">PDF 格式</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>导出范围</Label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input type="radio" name="exportRange" value="all" defaultChecked />
                  <span className="text-sm">全部员工 ({personnel.length} 人)</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="radio" name="exportRange" value="filtered" />
                  <span className="text-sm">当前筛选结果 ({filteredPersonnel.length} 人)</span>
                </label>
                {selectedPersonnel.size > 0 && (
                  <label className="flex items-center space-x-2">
                    <input type="radio" name="exportRange" value="selected" />
                    <span className="text-sm">选中的员工 ({selectedPersonnel.size} 人)</span>
                  </label>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowExportDialog(false)}>
                取消
              </Button>
              <Button
                onClick={async () => {
                  await exportPersonnel({
                    format: "excel",
                    fields: ["name", "employeeId", "department", "position", "phone", "email"],
                    filters: filters,
                  });
                  setShowExportDialog(false);
                }}
              >
                导出
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 组织架构弹窗 */}
      <Dialog open={showOrgChart} onOpenChange={setShowOrgChart}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>组织架构</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              组织架构树形视图，显示部门层级和人员归属关系
            </div>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-center text-gray-500 py-8">
                  组织架构功能开发中...
                  <br />
                  将支持拖拽调整层级关系
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowOrgChart(false)}>
                关闭
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 