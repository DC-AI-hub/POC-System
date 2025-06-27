"use client"

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Users,
  FileText,
  Calendar,
  DollarSign,
  RefreshCw,
  Download,
  Settings,
  GitBranch,
  UserCheck,
  Zap,
  Shuffle
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApprovalManagement } from '@/hooks/use-approval-management';
import { ApprovalDetailDialog } from '@/components/ui/approval-detail-dialog';
import { cn } from '@/lib/utils';
import { WorkflowTemplateSection } from '@/components/workflow-template-section';

export default function ApprovalManagementPage() {
  const {
    approvalItems,
    filteredItems,
    selectedItems,
    currentApproval,
    stats,
    permissions,
    loading,
    error,
    searchTerm,
    filters,
    setSearchTerm,
    setFilters,
    clearFilters,
    selectItem,
    selectAll,
    clearSelection,
    approveApplication,
    batchApprove,
    getApprovalDetail,
    refreshData,
    approvalGroups,
    dynamicAssignmentRules,
    activeDelegations,
  } = useApprovalManagement();

  // 弹窗状态
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [batchActionDialog, setBatchActionDialog] = useState<{
    open: boolean;
    action: 'approve' | 'reject';
  }>({ open: false, action: 'approve' });
  const [batchComment, setBatchComment] = useState('');

  // 打开详情弹窗
  const handleViewDetail = async (id: string) => {
    try {
      await getApprovalDetail(id);
      setDetailDialogOpen(true);
    } catch (error) {
      console.error('获取详情失败:', error);
    }
  };

  // 快速审批操作
  const handleQuickAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      await approveApplication({
        applicationId: id,
        action,
        comment: action === 'approve' ? '同意' : '不同意',
      });
    } catch (error) {
      console.error('操作失败:', error);
    }
  };

  // 批量操作
  const handleBatchAction = async () => {
    if (selectedItems.size === 0) return;

    try {
      await batchApprove({
        applicationIds: Array.from(selectedItems),
        action: batchActionDialog.action,
        comment: batchComment.trim() || (batchActionDialog.action === 'approve' ? '批量通过' : '批量拒绝'),
      });
      setBatchActionDialog({ open: false, action: 'approve' });
      setBatchComment('');
    } catch (error) {
      console.error('批量操作失败:', error);
    }
  };

  // 获取状态颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'expense':
        return 'bg-blue-100 text-blue-800';
      case 'travel':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 获取审批模式显示信息
  const getApprovalModeDisplay = (mode: string) => {
    switch (mode) {
      case 'sequential':
        return { label: '顺序', icon: <GitBranch className="h-3 w-3" />, color: 'bg-blue-100 text-blue-800' };
      case 'parallel':
        return { label: '并行(全部)', icon: <Users className="h-3 w-3" />, color: 'bg-purple-100 text-purple-800' };
      case 'any_one':
        return { label: '并行(任一)', icon: <UserCheck className="h-3 w-3" />, color: 'bg-green-100 text-green-800' };
      case 'majority':
        return { label: '多数通过', icon: <Users className="h-3 w-3" />, color: 'bg-orange-100 text-orange-800' };
      case 'weighted':
        return { label: '权重审批', icon: <Zap className="h-3 w-3" />, color: 'bg-indigo-100 text-indigo-800' };
      default:
        return { label: '标准', icon: <FileText className="h-3 w-3" />, color: 'bg-gray-100 text-gray-800' };
    }
  };

  // 是否全选
  const isAllSelected = useMemo(() => {
    return filteredItems.length > 0 && selectedItems.size === filteredItems.length;
  }, [filteredItems.length, selectedItems.size]);

  // 是否部分选择
  const isIndeterminate = useMemo(() => {
    return selectedItems.size > 0 && selectedItems.size < filteredItems.length;
  }, [selectedItems.size, filteredItems.length]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* 页面标题 */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">审批管理</h1>
          <p className="text-gray-600 mt-2">管理和处理待审批的申请 - 支持灵活审批模式</p>
        </div>

        {/* 标签页导航 */}
        <Tabs defaultValue="approvals" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="approvals" className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>审批列表</span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center space-x-2">
              <GitBranch className="w-4 h-4" />
              <span>工作流模板</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="approvals" className="space-y-6">

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">待审批</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.myPendingCount}</div>
              <p className="text-xs text-muted-foreground">
                需要您审批的申请
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">今日已审批</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.myApprovedToday}</div>
              <p className="text-xs text-muted-foreground">
                比昨天多 2 个
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">并行审批</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.parallelApprovalCount}</div>
              <p className="text-xs text-muted-foreground">
                多人协同审批
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">委托审批</CardTitle>
              <Shuffle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.delegatedApprovalCount}</div>
              <p className="text-xs text-muted-foreground">
                委托处理中
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 灵活审批配置概览 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                审批组配置
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{approvalGroups.length}</div>
              <p className="text-sm text-gray-600 mt-1">
                已配置 {approvalGroups.length} 个审批组
              </p>
              <div className="mt-3 space-y-1">
                {approvalGroups.slice(0, 3).map(group => (
                  <div key={group.id} className="text-xs text-gray-500 flex items-center justify-between">
                    <span>{group.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {getApprovalModeDisplay(group.mode).label}
                    </Badge>
                  </div>
                ))}
                {approvalGroups.length > 3 && (
                  <div className="text-xs text-gray-400">... 还有 {approvalGroups.length - 3} 个</div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5" />
                动态分配规则
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{dynamicAssignmentRules.length}</div>
              <p className="text-sm text-gray-600 mt-1">
                运行中的自动分配规则
              </p>
              <div className="mt-3 space-y-1">
                {dynamicAssignmentRules.slice(0, 3).map(rule => (
                  <div key={rule.id} className="text-xs text-gray-500 flex items-center justify-between">
                    <span>{rule.name}</span>
                    <Badge variant="outline" className="text-xs">
                      优先级 {rule.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shuffle className="h-5 w-5" />
                活跃委托
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{activeDelegations.filter(d => d.isActive).length}</div>
              <p className="text-sm text-gray-600 mt-1">
                当前生效的委托配置
              </p>
              <div className="mt-3 space-y-1">
                {activeDelegations.filter(d => d.isActive).slice(0, 3).map(delegation => (
                  <div key={delegation.id} className="text-xs text-gray-500">
                    {delegation.delegatorName} → {delegation.delegateeName}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 搜索和过滤 */}
        <Card>
          <CardHeader>
            <CardTitle>审批列表</CardTitle>
            <CardDescription>
              管理和处理您的审批任务 - 支持多种审批模式
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              {/* 搜索框 */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="搜索申请人、标题、申请单号..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* 过滤器 */}
              <div className="flex gap-2 flex-wrap">
                <Select
                  value={filters.type || 'all'}
                  onValueChange={(value) => setFilters({ type: value as any })}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部类型</SelectItem>
                    <SelectItem value="expense">日常费用</SelectItem>
                    <SelectItem value="travel">差旅费用</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.status || 'all'}
                  onValueChange={(value) => setFilters({ status: value as any })}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部状态</SelectItem>
                    <SelectItem value="pending">待审批</SelectItem>
                    <SelectItem value="in-progress">审批中</SelectItem>
                    <SelectItem value="approved">已通过</SelectItem>
                    <SelectItem value="rejected">已拒绝</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.approvalMode || 'all'}
                  onValueChange={(value) => setFilters({ approvalMode: value as any })}
                >
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="审批模式" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部模式</SelectItem>
                    <SelectItem value="sequential">顺序审批</SelectItem>
                    <SelectItem value="parallel">并行(全部)</SelectItem>
                    <SelectItem value="any_one">并行(任一)</SelectItem>
                    <SelectItem value="majority">多数通过</SelectItem>
                    <SelectItem value="weighted">权重审批</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.priority || 'all'}
                  onValueChange={(value) => setFilters({ priority: value as any })}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="优先级" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部优先级</SelectItem>
                    <SelectItem value="high">高优先级</SelectItem>
                    <SelectItem value="medium">中优先级</SelectItem>
                    <SelectItem value="low">低优先级</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="delegated"
                    checked={filters.isDelegated || false}
                    onCheckedChange={(checked) => setFilters({ isDelegated: !!checked })}
                  />
                  <Label htmlFor="delegated" className="text-sm">委托</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="dynamic"
                    checked={filters.isDynamicallyAssigned || false}
                    onCheckedChange={(checked) => setFilters({ isDynamicallyAssigned: !!checked })}
                  />
                  <Label htmlFor="dynamic" className="text-sm">动态分配</Label>
                </div>

                <Button variant="outline" onClick={clearFilters}>
                  <Filter className="h-4 w-4 mr-2" />
                  清空
                </Button>
              </div>
            </div>

            {/* 批量操作栏 */}
            {selectedItems.size > 0 && (
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg mb-4">
                <span className="text-sm text-blue-700">
                  已选择 {selectedItems.size} 个申请
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => setBatchActionDialog({ open: true, action: 'approve' })}
                    disabled={!permissions.canBatchApprove}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    批量通过
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setBatchActionDialog({ open: true, action: 'reject' })}
                    disabled={!permissions.canBatchApprove}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    批量拒绝
                  </Button>
                  <Button size="sm" variant="outline" onClick={clearSelection}>
                    取消选择
                  </Button>
                </div>
              </div>
            )}

            {/* 数据表格 */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={isAllSelected}
                        onCheckedChange={selectAll}
                        {...(isIndeterminate ? { indeterminate: true } : {})}
                      />
                    </TableHead>
                    <TableHead>申请信息</TableHead>
                    <TableHead>申请人</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>金额</TableHead>
                    <TableHead>审批模式</TableHead>
                    <TableHead>审批进度</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>委托/动态</TableHead>
                    <TableHead>提交时间</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center py-8">
                        <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                        加载中...
                      </TableCell>
                    </TableRow>
                  ) : filteredItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center py-8 text-gray-500">
                        暂无数据
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredItems.map((item) => {
                      const modeDisplay = getApprovalModeDisplay(item.approvalMode || 'sequential');
                      return (
                        <TableRow key={item.id} className="hover:bg-gray-50">
                          <TableCell>
                            <Checkbox
                              checked={selectedItems.has(item.id)}
                              onCheckedChange={() => selectItem(item.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-900">{item.title}</div>
                              <div className="text-sm text-gray-500">
                                {item.applicationId} • {item.department}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{item.applicant}</TableCell>
                          <TableCell>
                            <Badge className={getTypeColor(item.type)}>
                              {item.type === 'expense' ? '日常费用' : '差旅费用'}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            ¥{item.amount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge className={cn("flex items-center gap-1", modeDisplay.color)}>
                              {modeDisplay.icon}
                              {modeDisplay.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {item.approvalProgress && (
                              <div className="flex flex-col">
                                <div className="text-sm font-medium">
                                  {item.approvalProgress.approved}/{item.approvalProgress.total}
                                </div>
                                <div className="text-xs text-gray-500">
                                  需要: {item.approvalProgress.required}
                                </div>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(item.status)}>
                              {item.status === 'pending' && '待审批'}
                              {item.status === 'approved' && '已通过'}
                              {item.status === 'rejected' && '已拒绝'}
                              {item.status === 'in-progress' && '审批中'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              {item.delegatedFrom && (
                                <Badge variant="outline" className="text-xs">
                                  <Shuffle className="h-3 w-3 mr-1" />
                                  委托
                                </Badge>
                              )}
                              {item.dynamicallyAssigned && (
                                <Badge variant="outline" className="text-xs">
                                  <Zap className="h-3 w-3 mr-1" />
                                  动态
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {item.submittedAt.toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>操作</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleViewDetail(item.id)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  查看详情
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {item.status === 'pending' && (
                                  <>
                                    <DropdownMenuItem 
                                      onClick={() => handleQuickAction(item.id, 'approve')}
                                      className="text-green-600"
                                    >
                                      <CheckCircle className="mr-2 h-4 w-4" />
                                      快速通过
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => handleQuickAction(item.id, 'reject')}
                                      className="text-red-600"
                                    >
                                      <XCircle className="mr-2 h-4 w-4" />
                                      快速拒绝
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
          </TabsContent>

          <TabsContent value="templates">
            <WorkflowTemplateSection />
          </TabsContent>
        </Tabs>
      </div>

      {/* 详情弹窗 */}
      {currentApproval && (
        <ApprovalDetailDialog
          isOpen={detailDialogOpen}
          onClose={() => setDetailDialogOpen(false)}
          approval={currentApproval}
        />
      )}

      {/* 批量操作确认弹窗 */}
      <Dialog 
        open={batchActionDialog.open} 
        onOpenChange={(open) => setBatchActionDialog(prev => ({ ...prev, open }))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              批量{batchActionDialog.action === 'approve' ? '通过' : '拒绝'}确认
            </DialogTitle>
            <DialogDescription>
              您确定要{batchActionDialog.action === 'approve' ? '通过' : '拒绝'}选中的 {selectedItems.size} 个申请吗？
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="batchComment">审批意见</Label>
            <Textarea
              id="batchComment"
              placeholder={`请输入${batchActionDialog.action === 'approve' ? '通过' : '拒绝'}原因...`}
              value={batchComment}
              onChange={(e) => setBatchComment(e.target.value)}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setBatchActionDialog({ open: false, action: 'approve' })}
            >
              取消
            </Button>
            <Button
              onClick={handleBatchAction}
              variant={batchActionDialog.action === 'approve' ? 'default' : 'destructive'}
              disabled={loading}
            >
              {loading && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
              确认{batchActionDialog.action === 'approve' ? '通过' : '拒绝'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 