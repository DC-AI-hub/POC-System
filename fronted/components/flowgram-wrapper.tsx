"use client";

import React, { useMemo } from 'react';
import { EditorRenderer, FixedLayoutEditorProvider, FixedLayoutProps } from '@flowgram.ai/fixed-layout-editor';
import '@flowgram.ai/fixed-layout-editor/index.css';

// 最简化的节点注册表
const basicNodeRegistries = [
  {
    type: 'start',
    meta: {
      defaultExpanded: true,
    },
  },
  {
    type: 'end',
    meta: {
      defaultExpanded: true,
    },
  },
  {
    type: 'llm',
    meta: {
      defaultExpanded: true,
    },
  },
];

interface FlowGramWrapperProps {
  initialData: any;
  readonly?: boolean;
  onChange?: (data: any) => void;
}

const FlowGramWrapper: React.FC<FlowGramWrapperProps> = ({ 
  initialData, 
  readonly = false, 
  onChange 
}) => {
  const editorProps = useMemo<FixedLayoutProps>(() => ({
    background: true,
    readonly,
    initialData: initialData || { nodes: [] },
    nodeRegistries: basicNodeRegistries,
    getNodeDefaultRegistry(type) {
      return {
        type,
        meta: {
          defaultExpanded: true,
        },
      };
    },
    fromNodeJSON(node, json) {
      return json;
    },
    toNodeJSON(node, json) {
      return json;
    },
    history: {
      enable: false, // 暂时禁用历史记录以避免冲突
    },
    nodeEngine: {
      enable: false, // 暂时禁用节点引擎以避免冲突
    },
    variableEngine: {
      enable: false, // 禁用变量引擎以避免冲突
    },
    // 移除materials配置以使用默认配置
    onInit: (ctx) => {
      console.log('FlowGram初始化完成');
      if (onChange && !readonly) {
        // 初始化后设置数据变更监听
        setTimeout(() => {
          const data = ctx.document.toJSON();
          onChange(data);
        }, 100);
      }
    },
  }), [initialData, readonly, onChange]);

  return (
    <div className="w-full h-full">
      <FixedLayoutEditorProvider {...editorProps}>
        <EditorRenderer />
      </FixedLayoutEditorProvider>
    </div>
  );
};

export default FlowGramWrapper; 