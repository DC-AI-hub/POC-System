"use client"

import React, { useState } from "react"
import { 
  User, 
  Shield, 
  UserCheck, 
  Calculator, 
  FileCheck, 
  Crown, 
  Star, 
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react"
import { WorkflowStepDetail } from "@/components/ui/workflow-step-detail"
import { WorkflowTrackerProps, WorkflowStep, WorkflowStatus } from "@/lib/types/workflow"
import { cn } from "@/lib/utils"

// 图标映射
const iconMap = {
  User,
  Shield,
  UserCheck,
  Calculator,
  FileCheck,
  Crown,
  Star,
  CheckCircle,
}

// 获取步骤状态样式
const getStepStatusStyles = (status: WorkflowStatus, isActive: boolean) => {
  const baseStyles = "relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200 cursor-pointer hover:scale-105"
  
  switch (status) {
    case 'completed':
      return cn(baseStyles, "bg-green-500 border-green-500 text-white shadow-lg")
    case 'in-progress':
      return cn(baseStyles, "bg-blue-500 border-blue-500 text-white shadow-lg animate-pulse")
    case 'rejected':
      return cn(baseStyles, "bg-red-500 border-red-500 text-white shadow-lg")
    case 'pending':
    default:
      return cn(baseStyles, "bg-gray-100 border-gray-300 text-gray-500")
  }
}

// 获取连接线样式
const getConnectorStyles = (currentStatus: WorkflowStatus, nextStatus: WorkflowStatus) => {
  if (currentStatus === 'completed') {
    return "bg-green-500"
  } else if (currentStatus === 'rejected') {
    return "bg-red-500"
  } else {
    return "bg-gray-300"
  }
}

// 单个工作流步骤组件
interface WorkflowStepNodeProps {
  step: WorkflowStep
  isLast: boolean
  onClick: (step: WorkflowStep) => void
  orientation: 'horizontal' | 'vertical'
}

function WorkflowStepNode({ step, isLast, onClick, orientation }: WorkflowStepNodeProps) {
  const IconComponent = iconMap[step.icon as keyof typeof iconMap] || User
  const isActive = step.status === 'in-progress'
  
  return (
    <div className={cn(
      "flex items-center",
      orientation === 'vertical' ? "flex-col" : "flex-row"
    )}>
      {/* 步骤节点 */}
      <div className="flex flex-col items-center">
        <button
          onClick={() => onClick(step)}
          className={getStepStatusStyles(step.status, isActive)}
          title={`${step.name} - ${step.status}`}
        >
          <IconComponent className="w-5 h-5" />
          
          {/* 状态指示器 */}
          {step.status === 'completed' && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-600 rounded-full border-2 border-white">
              <CheckCircle className="w-2 h-2 text-white" />
            </div>
          )}
          {step.status === 'rejected' && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full border-2 border-white">
              <AlertCircle className="w-2 h-2 text-white" />
            </div>
          )}
          {step.status === 'in-progress' && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full border-2 border-white animate-ping" />
          )}
        </button>
        
        {/* 步骤标题 */}
        <div className={cn(
          "mt-2 text-center",
          orientation === 'horizontal' ? "max-w-20" : "max-w-32"
        )}>
          <div className="text-xs font-medium text-gray-900 leading-tight">
            {step.name}
          </div>
          {step.approver && (
            <div className="text-xs text-gray-500 mt-1">
              {step.approver}
            </div>
          )}
          {step.approvedAt && (
            <div className="text-xs text-gray-400 mt-1">
              {step.approvedAt.toLocaleDateString('zh-CN')}
            </div>
          )}
        </div>
      </div>
      
      {/* 连接线 */}
      {!isLast && (
        <div className={cn(
          "flex-shrink-0",
          orientation === 'horizontal' 
            ? "w-8 h-0.5 mx-2" 
            : "h-8 w-0.5 my-2",
          getConnectorStyles(step.status, 'pending')
        )} />
      )}
    </div>
  )
}

export function WorkflowTracker({ 
  workflow, 
  className, 
  onStepClick,
  showDetails = true,
  orientation = 'horizontal'
}: WorkflowTrackerProps) {
  const [selectedStep, setSelectedStep] = useState<WorkflowStep | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  // 处理步骤点击
  const handleStepClick = (step: WorkflowStep) => {
    if (onStepClick) {
      onStepClick(step)
    }
    
    if (showDetails) {
      setSelectedStep(step)
      setIsDetailOpen(true)
    }
  }

  // 关闭详情弹窗
  const handleCloseDetail = () => {
    setIsDetailOpen(false)
    setSelectedStep(null)
  }

  // 计算进度百分比
  const completedSteps = workflow.steps.filter(step => step.status === 'completed').length
  const progressPercentage = (completedSteps / workflow.steps.length) * 100

  return (
    <div className={cn("w-full", className)}>
      {/* 工作流标题和进度 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">
            {workflow.title}
          </h3>
          <div className="text-sm text-gray-500">
            {completedSteps} / {workflow.steps.length} 已完成
          </div>
        </div>
        
        {/* 进度条 */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        
        {/* 申请信息 */}
        <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
          <span>申请人：{workflow.applicant}</span>
          <span>申请时间：{workflow.applicationDate.toLocaleDateString('zh-CN')}</span>
          <span className={cn(
            "px-2 py-1 rounded-full text-xs font-medium",
            workflow.status === 'completed' && "bg-green-100 text-green-800",
            workflow.status === 'in-progress' && "bg-blue-100 text-blue-800",
            workflow.status === 'rejected' && "bg-red-100 text-red-800",
            workflow.status === 'draft' && "bg-gray-100 text-gray-800"
          )}>
            {workflow.status === 'completed' && '已完成'}
            {workflow.status === 'in-progress' && '审批中'}
            {workflow.status === 'rejected' && '已拒绝'}
            {workflow.status === 'draft' && '草稿'}
          </span>
        </div>
      </div>

      {/* 工作流步骤 */}
      <div className={cn(
        "flex",
        orientation === 'horizontal' 
          ? "flex-row items-start justify-between overflow-x-auto pb-4" 
          : "flex-col items-center space-y-0",
        "min-w-0" // 防止 flex 子项溢出
      )}>
        {workflow.steps.map((step, index) => (
          <WorkflowStepNode
            key={step.id}
            step={step}
            isLast={index === workflow.steps.length - 1}
            onClick={handleStepClick}
            orientation={orientation}
          />
        ))}
      </div>

      {/* 当前步骤提示 */}
      {workflow.status === 'in-progress' && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <div>
              <div className="font-medium text-blue-900">
                当前步骤：{workflow.steps[workflow.currentStep]?.name}
              </div>
              <div className="text-sm text-blue-600 mt-1">
                {workflow.steps[workflow.currentStep]?.description}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 拒绝状态提示 */}
      {workflow.status === 'rejected' && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <div>
              <div className="font-medium text-red-900">
                申请已被拒绝
              </div>
              <div className="text-sm text-red-600 mt-1">
                请查看审批意见并重新提交申请
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 完成状态提示 */}
      {workflow.status === 'completed' && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <div className="font-medium text-green-900">
                审批已完成
              </div>
              <div className="text-sm text-green-600 mt-1">
                所有审批步骤已完成，申请已通过
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 步骤详情弹窗 */}
      {selectedStep && (
        <WorkflowStepDetail
          step={selectedStep}
          isOpen={isDetailOpen}
          onClose={handleCloseDetail}
        />
      )}
    </div>
  )
} 