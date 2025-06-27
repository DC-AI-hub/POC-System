"use client"

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  DollarSign,
  FileText,
  MessageSquare,
  ArrowLeft,
  Download,
  Eye
} from "lucide-react";
import { ApprovalDetail, ApprovalAction } from '@/lib/types/workflow';
import { cn } from '@/lib/utils';

interface ApprovalDetailDialogProps {
  approval: ApprovalDetail | null;
  open: boolean;
  onClose: () => void;
  onApprove: (action: ApprovalAction) => Promise<void>;
  loading?: boolean;
}

export function ApprovalDetailDialog({
  approval,
  open,
  onClose,
  onApprove,
  loading = false
}: ApprovalDetailDialogProps) {
  const [comment, setComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  if (!approval) return null;

  const handleAction = async (action: 'approve' | 'reject' | 'return') => {
    if (!comment.trim() && action !== 'approve') {
      return;
    }

    setActionLoading(true);
    try {
      await onApprove({
        applicationId: approval.id,
        action,
        comment: comment.trim() || (action === 'approve' ? '同意' : ''),
      });
      setComment('');
      onClose();
    } catch (error) {
      console.error('审批操作失败:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold">
                审批详情 - {approval.applicationId}
              </DialogTitle>
              <DialogDescription>
                {approval.title}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getTypeColor(approval.type)}>
                {approval.type === 'expense' ? '日常费用' : '差旅费用'}
              </Badge>
              <Badge className={getPriorityColor(approval.priority)}>
                {approval.priority === 'high' ? '高优先级' : 
                 approval.priority === 'medium' ? '中优先级' : '低优先级'}
              </Badge>
              <Badge className={getStatusColor(approval.status)}>
                {approval.status === 'pending' ? '待审批' :
                 approval.status === 'approved' ? '已通过' :
                 approval.status === 'rejected' ? '已拒绝' : '审批中'}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="details" className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">申请详情</TabsTrigger>
            <TabsTrigger value="workflow">审批流程</TabsTrigger>
            <TabsTrigger value="history">审批历史</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[500px] mt-4">
            <TabsContent value="details" className="space-y-6 pr-4">
              {/* 基本信息 */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">申请人信息</span>
                  </div>
                  <div className="pl-6 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">姓名:</span>
                      <span>{approval.applicant}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">部门:</span>
                      <span>{approval.department}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">时间信息</span>
                  </div>
                  <div className="pl-6 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">提交时间:</span>
                      <span>{approval.submittedAt.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">截止时间:</span>
                      <span className={cn(
                        approval.deadline < new Date() ? 'text-red-600' : ''
                      )}>
                        {approval.deadline.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* 费用信息 */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">费用信息</span>
                </div>
                <div className="pl-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">申请金额:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      ¥{approval.amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* 申请描述 */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">申请描述</span>
                </div>
                <div className="pl-6">
                  <p className="text-gray-700 leading-relaxed">
                    {approval.description}
                  </p>
                </div>
              </div>

              {/* 附件 */}
              {approval.attachments.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">附件</span>
                    </div>
                    <div className="pl-6 space-y-2">
                      {approval.attachments.map((attachment, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <span>{attachment}</span>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              预览
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4 mr-1" />
                              下载
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="workflow" className="space-y-4 pr-4">
              <div className="space-y-4">
                {approval.workflowSteps.map((step, index) => (
                  <div key={step.id} className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      {getStatusIcon(step.status)}
                      {index < approval.workflowSteps.length - 1 && (
                        <div className="w-px h-12 bg-gray-300 mt-2" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{step.name}</h4>
                        <Badge className={getStatusColor(step.status)}>
                          {step.status === 'completed' ? '已完成' :
                           step.status === 'in-progress' ? '审批中' :
                           step.status === 'rejected' ? '已拒绝' : '待审批'}
                        </Badge>
                      </div>
                      {step.approver && (
                        <p className="text-sm text-gray-600 mt-1">
                          审批人: {step.approver}
                        </p>
                      )}
                      {step.approvedAt && (
                        <p className="text-sm text-gray-600">
                          完成时间: {step.approvedAt.toLocaleString()}
                        </p>
                      )}
                      {step.comment && (
                        <p className="text-sm text-gray-700 mt-2 p-2 bg-gray-50 rounded">
                          {step.comment}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-4 pr-4">
              <div className="space-y-4">
                {approval.approvalHistory.map((history, index) => (
                  <div key={history.id} className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className="flex-shrink-0">
                      <MessageSquare className="h-5 w-5 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{history.stepName}</h4>
                        <Badge variant="outline">
                          {history.action === 'approve' ? '通过' :
                           history.action === 'reject' ? '拒绝' :
                           history.action === 'return' ? '退回' : '提交'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        操作人: {history.approver}
                      </p>
                      <p className="text-sm text-gray-600 mb-2">
                        时间: {history.timestamp.toLocaleString()}
                      </p>
                      {history.comment && (
                        <p className="text-sm text-gray-700 p-2 bg-gray-50 rounded">
                          {history.comment}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        {/* 审批操作区 */}
        {approval.canApprove && approval.status === 'pending' && (
          <div className="border-t pt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="comment">审批意见</Label>
              <Textarea
                id="comment"
                placeholder="请输入审批意见..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={onClose}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回
              </Button>
              <div className="flex gap-2">
                {approval.canReturn && (
                  <Button
                    variant="outline"
                    onClick={() => handleAction('return')}
                    disabled={actionLoading || loading}
                  >
                    退回
                  </Button>
                )}
                <Button
                  variant="destructive"
                  onClick={() => handleAction('reject')}
                  disabled={actionLoading || loading || !comment.trim()}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  拒绝
                </Button>
                <Button
                  onClick={() => handleAction('approve')}
                  disabled={actionLoading || loading}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  通过
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 