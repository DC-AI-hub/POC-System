# StatusBadge 组件使用说明

## 概述
StatusBadge 是专为港交所POC系统设计的状态显示组件，用于显示申请、审批等业务流程的状态信息。

## 功能特性
- ✅ 支持 5 种预定义状态（草稿、审批中、已通过、已拒绝、处理中）
- ✅ 自带图标和语义化颜色
- ✅ 支持 3 种尺寸（sm、default、lg）
- ✅ 支持点击交互和 hover 效果
- ✅ 完全可访问性（支持键盘导航和屏幕阅读器）
- ✅ 响应式设计，移动端适配

## 基础使用

```tsx
import { StatusBadge } from '@/components/ui/status-badge'

// 基础状态显示
<StatusBadge status="pending" />
<StatusBadge status="approved" />
<StatusBadge status="rejected" />
```

## 状态类型
```typescript
type StatusType = 'draft' | 'pending' | 'approved' | 'rejected' | 'in-progress'
```

| 状态 | 中文 | 颜色 | 图标 |
|------|------|------|------|
| draft | 草稿 | 灰色 | FileText |
| pending | 审批中 | 蓝色 | Clock |
| approved | 已通过 | 绿色 | CheckCircle |
| rejected | 已拒绝 | 红色 | XCircle |
| in-progress | 处理中 | 黄色 | RotateCcw |

## 组件属性

```typescript
interface StatusBadgeProps {
  status: StatusType              // 必需：状态类型
  children?: React.ReactNode      // 可选：自定义显示文本
  onClick?: () => void           // 可选：点击事件处理
  showIcon?: boolean             // 可选：是否显示图标，默认 true
  size?: 'sm' | 'default' | 'lg' // 可选：尺寸，默认 'default'
  className?: string             // 可选：自定义样式类
}
```

## 使用示例

### 1. 不同尺寸
```tsx
<StatusBadge status="pending" size="sm" />
<StatusBadge status="pending" size="default" />
<StatusBadge status="pending" size="lg" />
```

### 2. 可点击状态
```tsx
<StatusBadge 
  status="draft" 
  onClick={() => handleStatusChange('draft')}
/>
```

### 3. 自定义文本
```tsx
<StatusBadge status="pending">等待主管审批</StatusBadge>
<StatusBadge status="approved">审核通过</StatusBadge>
```

### 4. 隐藏图标
```tsx
<StatusBadge status="pending" showIcon={false} />
```

### 5. 在表格中使用
```tsx
<TableCell>
  <StatusBadge 
    status={record.status} 
    size="sm"
    onClick={() => handleStatusClick(record.id)}
  />
</TableCell>
```

## 便捷组件
提供了预定义的便捷组件，可以直接使用：

```tsx
import { 
  DraftBadge, 
  PendingBadge, 
  ApprovedBadge, 
  RejectedBadge, 
  InProgressBadge 
} from '@/components/ui/status-badge'

<DraftBadge />
<PendingBadge onClick={handlePendingClick} />
<ApprovedBadge size="lg" />
```

## 样式定制
组件使用 Tailwind CSS 构建，支持通过 `className` 属性进行样式定制：

```tsx
<StatusBadge 
  status="pending" 
  className="shadow-lg border-2" 
/>
```

## 最佳实践

1. **在表格中使用 `sm` 尺寸**：节省空间，保持整洁
2. **重要状态使用 `lg` 尺寸**：提高可见性
3. **状态变更时添加点击事件**：提供交互能力
4. **保持状态一致性**：在整个应用中使用相同的状态定义

## 注意事项

- 组件会自动处理无效的状态值
- 点击事件会阻止事件冒泡
- 支持键盘导航（Enter 和 Space 键）
- 所有状态都包含适当的 ARIA 标签 