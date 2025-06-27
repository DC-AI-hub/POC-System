"use client";

import dynamic from 'next/dynamic';
import React from 'react';

// 动态导入FlowgramWrapper，禁用SSR
const FlowGramWrapper = dynamic(() => import('./flowgram-wrapper'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-sm text-gray-600">加载工作流编辑器...</p>
      </div>
    </div>
  ),
});

interface DynamicFlowGramProps {
  initialData: any;
  readonly?: boolean;
  onChange?: (data: any) => void;
}

const DynamicFlowGram: React.FC<DynamicFlowGramProps> = (props) => {
  return <FlowGramWrapper {...props} />;
};

export default DynamicFlowGram; 