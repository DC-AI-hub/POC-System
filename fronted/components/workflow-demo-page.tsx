"use client"

import React, { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { WorkflowTracker } from "@/components/workflow-tracker"
import { useWorkflow } from "@/hooks/use-workflow"
import { 
  Play, 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  Clock,
  Smartphone,
  Monitor
} from "lucide-react"
import { cn } from "@/lib/utils"

export function WorkflowDemoPage() {
  const { 
    workflow, 
    loading, 
    createWorkflow, 
    simulateApproval, 
    resetToStep 
  } = useWorkflow()

  const [orientation, setOrientation] = React.useState<'horizontal' | 'vertical'>('horizontal')

  // 初始化示例工作流
  useEffect(() => {
    if (!workflow) {
      createWorkflow({
        title: "日常费用申请 - 办公用品采购",
        applicant: "张三",
        applicationDate: new Date(2024, 0, 15)
      })
    }
  }, [workflow, createWorkflow])

  // 模拟批准当前步骤
  const handleApproveCurrentStep = () => {
    if (!workflow) return
    
    const currentStep = workflow.steps.find(step => step.status === 'in-progress')
    if (currentStep) {
      simulateApproval(currentStep.id, true)
    }
  }

  // 模拟拒绝当前步骤
  const handleRejectCurrentStep = () => {
    if (!workflow) return
    
    const currentStep = workflow.steps.find(step => step.status === 'in-progress')
    if (currentStep) {
      simulateApproval(currentStep.id, false)
    }
  }

  // 重置工作流
  const handleResetWorkflow = () => {
    resetToStep(1) // 重置到第二步（AA1审批）
  }

  // 创建新的工作流示例
  const handleCreateNewWorkflow = () => {
    const examples = [
      {
        title: "差旅费用报销 - 北京出差",
        applicant: "李四"
      },
      {
        title: "设备采购申请 - 办公电脑",
        applicant: "王五"
      },
      {
        title: "培训费用申请 - 技术培训",
        applicant: "赵六"
      }
    ]
    
    const randomExample = examples[Math.floor(Math.random() * examples.length)]
    createWorkflow({
      ...randomExample,
      applicationDate: new Date()
    })
  }

  if (!workflow) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <Clock className="w-8 h-8 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600">加载工作流...</span>
        </div>
      </div>
    )
  }

  const currentStep = workflow.steps.find(step => step.status === 'in-progress')
  const canApprove = currentStep && workflow.status === 'in-progress'
  const canReset = workflow.status !== 'in-progress'

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* 页面标题 */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">工作流状态追踪</h1>
        <p className="text-gray-600 mt-1">港交所POC系统 - 费用审批工作流演示</p>
      </div>

      {/* 控制面板 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="w-5 h-5" />
            操作控制面板
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            {/* 审批操作 */}
            <div className="flex items-center gap-2">
              <Button
                onClick={handleApproveCurrentStep}
                disabled={!canApprove || loading}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                批准当前步骤
              </Button>
              <Button
                onClick={handleRejectCurrentStep}
                disabled={!canApprove || loading}
                size="sm"
                variant="destructive"
              >
                <XCircle className="w-4 h-4 mr-2" />
                拒绝当前步骤
              </Button>
            </div>

            {/* 重置和新建 */}
            <div className="flex items-center gap-2">
              <Button
                onClick={handleResetWorkflow}
                disabled={!canReset || loading}
                size="sm"
                variant="outline"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                重置工作流
              </Button>
              <Button
                onClick={handleCreateNewWorkflow}
                disabled={loading}
                size="sm"
                variant="outline"
              >
                <Play className="w-4 h-4 mr-2" />
                新建示例
              </Button>
            </div>

            {/* 布局切换 */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">布局：</span>
              <Button
                onClick={() => setOrientation('horizontal')}
                size="sm"
                variant={orientation === 'horizontal' ? 'default' : 'outline'}
              >
                <Monitor className="w-4 h-4 mr-2" />
                水平
              </Button>
              <Button
                onClick={() => setOrientation('vertical')}
                size="sm"
                variant={orientation === 'vertical' ? 'default' : 'outline'}
              >
                <Smartphone className="w-4 h-4 mr-2" />
                垂直
              </Button>
            </div>

            {/* 状态指示 */}
            {loading && (
              <Badge variant="secondary" className="animate-pulse">
                <Clock className="w-3 h-3 mr-1" />
                处理中...
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 工作流追踪器 */}
      <Card>
        <CardHeader>
          <CardTitle>审批流程追踪</CardTitle>
        </CardHeader>
        <CardContent>
          <WorkflowTracker
            workflow={workflow}
            orientation={orientation}
            onStepClick={(step) => {
              console.log('点击步骤:', step)
            }}
            showDetails={true}
          />
        </CardContent>
      </Card>

      {/* 工作流信息 */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>工作流详细信息</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">工作流ID</label>
              <div className="mt-1 text-sm text-gray-900">{workflow.id}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">申请标题</label>
              <div className="mt-1 text-sm text-gray-900">{workflow.title}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">申请人</label>
              <div className="mt-1 text-sm text-gray-900">{workflow.applicant}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">申请时间</label>
              <div className="mt-1 text-sm text-gray-900">
                {workflow.applicationDate.toLocaleDateString('zh-CN')}
              </div>
            </div>
          </div>

          {/* 当前步骤信息 */}
          {currentStep && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">当前审批步骤</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">步骤名称：</span>
                  <span className="font-medium">{currentStep.name}</span>
                </div>
                <div>
                  <span className="text-blue-700">步骤描述：</span>
                  <span>{currentStep.description}</span>
                </div>
                <div>
                  <span className="text-blue-700">状态：</span>
                  <Badge className="ml-1 bg-blue-100 text-blue-800">
                    {currentStep.status === 'in-progress' ? '进行中' : currentStep.status}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* 步骤历史 */}
          <div className="mt-6">
            <h4 className="font-medium text-gray-900 mb-3">审批历史</h4>
            <div className="space-y-2">
              {workflow.steps
                .filter(step => step.status === 'completed' || step.status === 'rejected')
                .map(step => (
                  <div
                    key={step.id}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border",
                      step.status === 'completed' && "bg-green-50 border-green-200",
                      step.status === 'rejected' && "bg-red-50 border-red-200"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Badge className={cn(
                        "text-xs",
                        step.status === 'completed' && "bg-green-100 text-green-800",
                        step.status === 'rejected' && "bg-red-100 text-red-800"
                      )}>
                        {step.status === 'completed' ? '已完成' : '已拒绝'}
                      </Badge>
                      <span className="font-medium">{step.name}</span>
                      {step.approver && (
                        <span className="text-sm text-gray-600">by {step.approver}</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {step.approvedAt?.toLocaleString('zh-CN')}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 