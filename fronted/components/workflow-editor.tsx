"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Eye, Trash2, Save, Download, Upload, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SimpleWorkflowViewer } from './simple-workflow-viewer';

// 工作流模板类型定义
interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  type: 'expense' | 'approval' | 'custom';
  status: 'active' | 'draft' | 'archived';
  flowData: any;
  createdAt: string;
  updatedAt: string;
}

// 费用审批工作流模板数据
const expenseApprovalWorkflow = {
  nodes: [
    {
      id: 'start_expense',
      type: 'start',
      blocks: [],
      data: {
        title: '费用申请提交',
        outputs: {
          type: 'object',
          properties: {
            amount: { type: 'number' },
            category: { type: 'string' },
            description: { type: 'string' },
            applicant: { type: 'string' }
          }
        }
      }
    },
    {
      id: 'amount_check',
      type: 'if',
      data: {
        title: '金额审核',
        condition: 'amount > 5000',
        inputsValues: {
          condition: { type: 'ref', content: ['start_expense', 'amount'] }
        },
        inputs: {
          type: 'object',
          properties: {
            condition: { type: 'number' }
          }
        }
      },
      blocks: [
        {
          id: 'high_amount',
          type: 'ifBlock',
          data: {
            title: '高额费用(>5000)',
            condition: 'amount > 5000'
          },
          blocks: []
        },
        {
          id: 'normal_amount',
          type: 'ifBlock',
          data: {
            title: '普通费用(<=5000)',
            condition: 'amount <= 5000'
          },
          blocks: []
        }
      ]
    },
    {
      id: 'supervisor_approval',
      type: 'llm',
      data: {
        title: '主管审批',
        inputsValues: {
          approver: { type: 'constant', content: 'supervisor' }
        }
      }
    },
    {
      id: 'finance_approval',
      type: 'llm',
      data: {
        title: '财务审批',
        inputsValues: {
          approver: { type: 'constant', content: 'finance' }
        }
      }
    },
    {
      id: 'end_approved',
      type: 'end',
      data: {
        title: '审批通过'
      }
    }
  ]
};

// 模拟工作流模板数据
const initialWorkflowTemplates: WorkflowTemplate[] = [
  {
    id: 'expense-approval-001',
    name: '标准费用审批流程',
    description: '适用于日常办公费用、差旅费等标准审批流程',
    type: 'expense',
    status: 'active',
    flowData: expenseApprovalWorkflow,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20'
  },
  {
    id: 'leave-approval-001',
    name: '请假审批流程',
    description: '员工请假申请的标准审批流程',
    type: 'approval',
    status: 'active',
    flowData: { nodes: [] },
    createdAt: '2024-01-10',
    updatedAt: '2024-01-18'
  }
];

interface WorkflowEditorProps {
  workflowId?: string;
  mode?: 'view' | 'edit' | 'create';
  onSave?: (workflow: WorkflowTemplate) => void;
  onCancel?: () => void;
}

export function WorkflowEditor({ workflowId, mode = 'view', onSave, onCancel }: WorkflowEditorProps) {
  const [currentWorkflow, setCurrentWorkflow] = useState<WorkflowTemplate | null>(null);

  useEffect(() => {
    if (workflowId) {
      const workflow = initialWorkflowTemplates.find(w => w.id === workflowId);
      if (workflow) {
        setCurrentWorkflow(workflow);
      }
    } else if (mode === 'create') {
      const newWorkflow: WorkflowTemplate = {
        id: `workflow-${Date.now()}`,
        name: '新建工作流',
        description: '',
        type: 'custom',
        status: 'draft',
        flowData: { nodes: [] },
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      };
      setCurrentWorkflow(newWorkflow);
    }
  }, [workflowId, mode]);

  const handleSave = () => {
    if (currentWorkflow && onSave) {
      onSave({
        ...currentWorkflow,
        updatedAt: new Date().toISOString().split('T')[0]
      });
    }
  };

  const handleNodeClick = (node: any) => {
    console.log('节点点击:', node);
    // 这里可以添加节点编辑功能
  };

  if (!currentWorkflow) {
    return <div>加载中...</div>;
  }

  return (
    <div className="h-full flex flex-col">
      {/* 工作流信息头部 */}
      <div className="flex-shrink-0 p-4 border-b bg-white">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold">{currentWorkflow.name}</h2>
            <p className="text-sm text-gray-600 mt-1">{currentWorkflow.description}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={currentWorkflow.status === 'active' ? 'default' : 'secondary'}>
                {currentWorkflow.status === 'active' ? '已启用' : 
                 currentWorkflow.status === 'draft' ? '草稿' : '已归档'}
              </Badge>
              <Badge variant="outline">
                {currentWorkflow.type === 'expense' ? '费用审批' :
                 currentWorkflow.type === 'approval' ? '审批流程' : '自定义'}
              </Badge>
              <Badge variant="secondary">可视化视图</Badge>
            </div>
          </div>
          <div className="flex gap-2">
            {mode === 'edit' && (
              <>
                <Button variant="outline" onClick={onCancel}>
                  取消
                </Button>
                <Button onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" />
                  保存
                </Button>
              </>
            )}
            {mode === 'view' && (
              <Badge variant="secondary">只读模式</Badge>
            )}
          </div>
        </div>
      </div>

      {/* 工作流查看器 */}
      <div className="flex-1 relative">
        <SimpleWorkflowViewer
          data={currentWorkflow.flowData}
          readonly={mode === 'view'}
          onNodeClick={handleNodeClick}
        />
      </div>

      {/* 底部提示 */}
      <div className="flex-shrink-0 p-4 border-t bg-gray-50">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            当前使用简化工作流视图。您可以查看工作流结构，点击节点查看详细信息。
            {mode === 'edit' && ' 完整的拖拽编辑功能正在开发中。'}
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}

interface WorkflowManagementProps {
  onEditWorkflow?: (workflowId: string) => void;
  onViewWorkflow?: (workflowId: string) => void;
}

export function WorkflowManagement({ onEditWorkflow, onViewWorkflow }: WorkflowManagementProps) {
  const [workflows, setWorkflows] = useState<WorkflowTemplate[]>(initialWorkflowTemplates);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newWorkflowForm, setNewWorkflowForm] = useState({
    name: '',
    description: '',
    type: 'custom' as 'expense' | 'approval' | 'custom'
  });

  const handleCreateWorkflow = () => {
    const newWorkflow: WorkflowTemplate = {
      id: `workflow-${Date.now()}`,
      name: newWorkflowForm.name,
      description: newWorkflowForm.description,
      type: newWorkflowForm.type,
      status: 'draft',
      flowData: { nodes: [] },
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    setWorkflows(prev => [...prev, newWorkflow]);
    setIsCreateDialogOpen(false);
    setNewWorkflowForm({ name: '', description: '', type: 'custom' });
    
    if (onEditWorkflow) {
      onEditWorkflow(newWorkflow.id);
    }
  };

  const handleDeleteWorkflow = (workflowId: string) => {
    if (confirm('确定要删除这个工作流吗？')) {
      setWorkflows(prev => prev.filter(w => w.id !== workflowId));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">工作流管理</h3>
          <p className="text-sm text-gray-600">创建和管理各类审批工作流程</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              新建工作流
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新建工作流</DialogTitle>
              <DialogDescription>创建新的工作流模板</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="workflow-name">工作流名称</Label>
                <Input
                  id="workflow-name"
                  value={newWorkflowForm.name}
                  onChange={(e) => setNewWorkflowForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="请输入工作流名称"
                />
              </div>
              <div>
                <Label htmlFor="workflow-description">描述</Label>
                <Textarea
                  id="workflow-description"
                  value={newWorkflowForm.description}
                  onChange={(e) => setNewWorkflowForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="请输入工作流描述"
                />
              </div>
              <div>
                <Label htmlFor="workflow-type">工作流类型</Label>
                <select
                  id="workflow-type"
                  value={newWorkflowForm.type}
                  onChange={(e) => setNewWorkflowForm(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="custom">自定义</option>
                  <option value="expense">费用审批</option>
                  <option value="approval">审批流程</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={handleCreateWorkflow} disabled={!newWorkflowForm.name}>
                创建
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>工作流名称</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>描述</TableHead>
                <TableHead>更新时间</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workflows.map((workflow) => (
                <TableRow key={workflow.id}>
                  <TableCell className="font-medium">{workflow.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {workflow.type === 'expense' ? '费用审批' :
                       workflow.type === 'approval' ? '审批流程' : '自定义'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={workflow.status === 'active' ? 'default' : 'secondary'}>
                      {workflow.status === 'active' ? '已启用' : 
                       workflow.status === 'draft' ? '草稿' : '已归档'}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{workflow.description}</TableCell>
                  <TableCell>{workflow.updatedAt}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewWorkflow?.(workflow.id)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditWorkflow?.(workflow.id)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteWorkflow(workflow.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 