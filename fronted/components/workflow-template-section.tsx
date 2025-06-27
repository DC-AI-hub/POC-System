"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Edit, Eye, GitBranch, Clock, Settings } from 'lucide-react';
import { WorkflowEditor } from '@/components/workflow-editor';

// 工作流模板数据
const workflowTemplates = [
  {
    id: 'expense-approval-001',
    name: '标准费用审批流程',
    description: '适用于日常办公费用、差旅费等标准审批流程，支持多级审批和条件判断',
    type: 'expense',
    status: 'active',
    version: 'v1.2',
    nodes: 6,
    lastUpdated: '2024-01-20',
    usageCount: 156
  },
  {
    id: 'travel-approval-001',
    name: '差旅费审批流程',
    description: '专门用于差旅费报销的审批流程，包含费用分类和额度控制',
    type: 'travel',
    status: 'active',
    version: 'v1.0',
    nodes: 5,
    lastUpdated: '2024-01-18',
    usageCount: 89
  },
  {
    id: 'high-amount-approval-001',
    name: '高额费用审批流程',
    description: '超过10000元的高额费用专用审批流程，需要多级审批',
    type: 'expense',
    status: 'active',
    version: 'v1.1',
    nodes: 8,
    lastUpdated: '2024-01-15',
    usageCount: 23
  }
];

interface WorkflowTemplateSectionProps {
  className?: string;
}

export function WorkflowTemplateSection({ className }: WorkflowTemplateSectionProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [editorMode, setEditorMode] = useState<'view' | 'edit'>('view');
  const [editorOpen, setEditorOpen] = useState(false);

  const handleEditTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    setEditorMode('edit');
    setEditorOpen(true);
  };

  const handleViewTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    setEditorMode('view');
    setEditorOpen(true);
  };

  const handleCloseEditor = () => {
    setEditorOpen(false);
    setSelectedTemplate(null);
  };

  const handleSaveTemplate = (template: any) => {
    console.log('保存工作流模板:', template);
    handleCloseEditor();
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

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'expense':
        return '费用申请';
      case 'travel':
        return '差旅报销';
      default:
        return '通用';
    }
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            工作流模板管理
          </CardTitle>
          <CardDescription>
            管理和配置各类审批工作流模板，支持可视化编辑和预览
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflowTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow border-2 hover:border-blue-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge className={getTypeColor(template.type)}>
                          {getTypeLabel(template.type)}
                        </Badge>
                        <Badge variant={template.status === 'active' ? 'default' : 'secondary'}>
                          {template.status === 'active' ? '启用' : '禁用'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {template.description}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center text-gray-600">
                      <GitBranch className="h-4 w-4 mr-2" />
                      <span>{template.nodes} 个节点</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>版本 {template.version}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
                      <span>使用次数: {template.usageCount}</span>
                      <span>更新: {template.lastUpdated}</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleViewTemplate(template.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        预览
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleEditTemplate(template.id)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        编辑
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 工作流编辑器弹窗 */}
      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle>
              {editorMode === 'edit' ? '编辑工作流模板' : '预览工作流模板'}
              {selectedTemplate && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({workflowTemplates.find(t => t.id === selectedTemplate)?.name})
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="h-[80vh]">
            {selectedTemplate && (
              <WorkflowEditor
                workflowId={selectedTemplate}
                mode={editorMode}
                onSave={handleSaveTemplate}
                onCancel={handleCloseEditor}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 