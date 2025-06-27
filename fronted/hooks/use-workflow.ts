import { useState, useCallback } from "react"
import { WorkflowData, WorkflowStep, WorkflowStatus, WORKFLOW_STEPS_CONFIG } from "@/lib/types/workflow"

interface UseWorkflowOptions {
  initialWorkflow?: WorkflowData
}

export function useWorkflow({ initialWorkflow }: UseWorkflowOptions = {}) {
  const [workflow, setWorkflow] = useState<WorkflowData | null>(initialWorkflow || null)
  const [loading, setLoading] = useState(false)

  // 创建新的工作流
  const createWorkflow = useCallback((data: {
    title: string
    applicant: string
    applicationDate?: Date
  }) => {
    const newWorkflow: WorkflowData = {
      id: `WF-${Date.now()}`,
      title: data.title,
      applicant: data.applicant,
      applicationDate: data.applicationDate || new Date(),
      currentStep: 0,
      status: 'in-progress',
      steps: WORKFLOW_STEPS_CONFIG.map((config, index) => ({
        ...config,
        status: index === 0 ? 'completed' : index === 1 ? 'in-progress' : 'pending',
        approver: index === 0 ? data.applicant : undefined,
        approvedAt: index === 0 ? new Date() : undefined,
      }))
    }
    
    setWorkflow(newWorkflow)
    return newWorkflow
  }, [])

  // 更新步骤状态
  const updateStepStatus = useCallback((stepId: string, updates: Partial<WorkflowStep>) => {
    if (!workflow) return

    const updatedWorkflow = {
      ...workflow,
      steps: workflow.steps.map(step => 
        step.id === stepId ? { ...step, ...updates } : step
      )
    }

    // 更新当前步骤和整体状态
    const currentStepIndex = updatedWorkflow.steps.findIndex(step => step.status === 'in-progress')
    updatedWorkflow.currentStep = currentStepIndex >= 0 ? currentStepIndex : updatedWorkflow.steps.length - 1

    // 检查是否有被拒绝的步骤
    const hasRejected = updatedWorkflow.steps.some(step => step.status === 'rejected')
    if (hasRejected) {
      updatedWorkflow.status = 'rejected'
    } else {
      // 检查是否所有步骤都完成
      const allCompleted = updatedWorkflow.steps.every(step => step.status === 'completed')
      updatedWorkflow.status = allCompleted ? 'completed' : 'in-progress'
    }

    setWorkflow(updatedWorkflow)
  }, [workflow])

  // 批准步骤
  const approveStep = useCallback((stepId: string, approver: string, comment?: string) => {
    if (!workflow) return

    const stepIndex = workflow.steps.findIndex(step => step.id === stepId)
    if (stepIndex === -1) return

    // 更新当前步骤为已完成
    updateStepStatus(stepId, {
      status: 'completed',
      approver,
      approvedAt: new Date(),
      comment: comment || '已批准'
    })

    // 如果不是最后一步，激活下一步
    if (stepIndex < workflow.steps.length - 1) {
      const nextStepId = workflow.steps[stepIndex + 1].id
      setTimeout(() => {
        updateStepStatus(nextStepId, {
          status: 'in-progress'
        })
      }, 100)
    }
  }, [workflow, updateStepStatus])

  // 拒绝步骤
  const rejectStep = useCallback((stepId: string, approver: string, comment: string) => {
    updateStepStatus(stepId, {
      status: 'rejected',
      approver,
      approvedAt: new Date(),
      comment
    })
  }, [updateStepStatus])

  // 重置工作流到指定步骤
  const resetToStep = useCallback((stepIndex: number) => {
    if (!workflow || stepIndex < 0 || stepIndex >= workflow.steps.length) return

    const updatedWorkflow = {
      ...workflow,
      currentStep: stepIndex,
      status: 'in-progress' as const,
      steps: workflow.steps.map((step, index) => ({
        ...step,
        status: (index < stepIndex ? 'completed' : 
               index === stepIndex ? 'in-progress' : 'pending') as WorkflowStatus,
        ...(index >= stepIndex && { approver: undefined, approvedAt: undefined, comment: undefined })
      }))
    }

    setWorkflow(updatedWorkflow)
  }, [workflow])

  // 模拟异步操作
  const simulateApproval = useCallback(async (stepId: string, shouldApprove: boolean = true) => {
    setLoading(true)
    
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const mockApprovers = [
      '张经理', '李总监', '王主管', '赵财务', '钱合规', '孙总', '周CEO'
    ]
    const approver = mockApprovers[Math.floor(Math.random() * mockApprovers.length)]
    
    if (shouldApprove) {
      approveStep(stepId, approver, '审批通过，符合相关规定。')
    } else {
      rejectStep(stepId, approver, '申请不符合相关规定，请修改后重新提交。')
    }
    
    setLoading(false)
  }, [approveStep, rejectStep])

  return {
    workflow,
    loading,
    createWorkflow,
    updateStepStatus,
    approveStep,
    rejectStep,
    resetToStep,
    simulateApproval,
  }
} 