import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, MessageSquare, Clock } from "lucide-react"
import { WorkflowStepDetailProps, WorkflowStatus } from "@/lib/types/workflow"
import { cn } from "@/lib/utils"

const getStatusConfig = (status: WorkflowStatus) => {
  switch (status) {
    case 'completed':
      return {
        color: 'bg-green-100 text-green-800 border-green-200',
        label: '已完成'
      }
    case 'in-progress':
      return {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        label: '进行中'
      }
    case 'rejected':
      return {
        color: 'bg-red-100 text-red-800 border-red-200',
        label: '已拒绝'
      }
    case 'pending':
    default:
      return {
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        label: '待处理'
      }
  }
}

export function WorkflowStepDetail({ step, isOpen, onClose }: WorkflowStepDetailProps) {
  const statusConfig = getStatusConfig(step.status)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>{step.name}</span>
            <Badge className={cn("text-xs", statusConfig.color)}>
              {statusConfig.label}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* 步骤描述 */}
          {step.description && (
            <div className="text-sm text-gray-600">
              {step.description}
            </div>
          )}
          
          {/* 审批人信息 */}
          {step.approver && (
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700">审批人：</span>
              <span className="font-medium">{step.approver}</span>
            </div>
          )}
          
          {/* 审批时间 */}
          {step.approvedAt && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700">审批时间：</span>
              <span className="font-medium">
                {step.approvedAt.toLocaleString('zh-CN', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          )}
          
          {/* 审批意见 */}
          {step.comment && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <MessageSquare className="w-4 h-4 text-gray-500" />
                <span>审批意见：</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-sm">
                {step.comment}
              </div>
            </div>
          )}
          
          {/* 等待状态提示 */}
          {step.status === 'pending' && (
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
              <Clock className="w-4 h-4" />
              <span>等待审批中...</span>
            </div>
          )}
          
          {/* 进行中状态提示 */}
          {step.status === 'in-progress' && (
            <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 rounded-lg p-3">
              <Clock className="w-4 h-4" />
              <span>正在处理中...</span>
            </div>
          )}
          
          {/* 拒绝状态提示 */}
          {step.status === 'rejected' && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg p-3">
              <MessageSquare className="w-4 h-4" />
              <span>此步骤已被拒绝，请查看审批意见</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 