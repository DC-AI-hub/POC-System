"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Play, CheckCircle, XCircle, GitBranch } from 'lucide-react';

interface WorkflowNode {
  id: string;
  type: string;
  data: {
    title: string;
    [key: string]: any;
  };
  blocks?: WorkflowNode[];
}

interface WorkflowData {
  nodes: WorkflowNode[];
}

interface SimpleWorkflowViewerProps {
  data: WorkflowData;
  readonly?: boolean;
  onNodeClick?: (node: WorkflowNode) => void;
}

const getNodeIcon = (type: string) => {
  switch (type) {
    case 'start':
      return <Play className="w-4 h-4 text-green-600" />;
    case 'end':
      return <CheckCircle className="w-4 h-4 text-blue-600" />;
    case 'llm':
      return <CheckCircle className="w-4 h-4 text-purple-600" />;
    case 'if':
      return <GitBranch className="w-4 h-4 text-orange-600" />;
    case 'ifBlock':
      return <ChevronRight className="w-4 h-4 text-gray-600" />;
    default:
      return <div className="w-4 h-4 rounded-full bg-gray-400" />;
  }
};

const getNodeColor = (type: string) => {
  switch (type) {
    case 'start':
      return 'border-green-200 bg-green-50';
    case 'end':
      return 'border-blue-200 bg-blue-50';
    case 'llm':
      return 'border-purple-200 bg-purple-50';
    case 'if':
      return 'border-orange-200 bg-orange-50';
    case 'ifBlock':
      return 'border-gray-200 bg-gray-50';
    default:
      return 'border-gray-200 bg-white';
  }
};

const WorkflowNodeComponent: React.FC<{
  node: WorkflowNode;
  level: number;
  readonly?: boolean;
  onNodeClick?: (node: WorkflowNode) => void;
}> = ({ node, level, readonly, onNodeClick }) => {
  const [expanded, setExpanded] = React.useState(true);
  const hasChildren = node.blocks && node.blocks.length > 0;

  return (
    <div className="space-y-2">
      <Card 
        className={`${getNodeColor(node.type)} border-2 cursor-pointer hover:shadow-md transition-shadow`}
        style={{ marginLeft: `${level * 20}px` }}
        onClick={() => onNodeClick?.(node)}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            {getNodeIcon(node.type)}
            <span>{node.data.title}</span>
            {hasChildren && (
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded(!expanded);
                }}
              >
                {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {node.type}
            </Badge>
            {node.data.condition && (
              <Badge variant="secondary" className="text-xs">
                {node.data.condition}
              </Badge>
            )}
          </div>
          {!readonly && (
            <div className="mt-2 text-xs text-gray-500">
              ID: {node.id}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 渲染子节点 */}
      {hasChildren && expanded && (
        <div className="space-y-2">
          {node.blocks!.map((childNode) => (
            <WorkflowNodeComponent
              key={childNode.id}
              node={childNode}
              level={level + 1}
              readonly={readonly}
              onNodeClick={onNodeClick}
            />
          ))}
        </div>
      )}

      {/* 添加连接线 */}
      {hasChildren && expanded && level === 0 && (
        <div className="flex justify-center">
          <div className="w-px h-4 bg-gray-300" />
        </div>
      )}
    </div>
  );
};

export const SimpleWorkflowViewer: React.FC<SimpleWorkflowViewerProps> = ({
  data,
  readonly = false,
  onNodeClick
}) => {
  const handleNodeClick = (node: WorkflowNode) => {
    if (!readonly && onNodeClick) {
      onNodeClick(node);
    }
  };

  if (!data || !data.nodes || data.nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center">
          <GitBranch className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">暂无工作流</h3>
          <p className="mt-1 text-sm text-gray-500">
            {readonly ? '该工作流还没有配置节点' : '开始创建您的第一个工作流节点'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 h-full overflow-auto bg-gray-50">
      <div className="space-y-4">
        {data.nodes.map((node) => (
          <WorkflowNodeComponent
            key={node.id}
            node={node}
            level={0}
            readonly={readonly}
            onNodeClick={handleNodeClick}
          />
        ))}
      </div>
      
      {/* 工作流统计信息 */}
      <div className="mt-6 p-4 bg-white rounded-lg border">
        <h4 className="text-sm font-medium text-gray-900 mb-2">工作流信息</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">节点总数:</span>
            <span className="ml-2 font-medium">{data.nodes.length}</span>
          </div>
          <div>
            <span className="text-gray-500">模式:</span>
            <span className="ml-2 font-medium">{readonly ? '只读' : '编辑'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}; 