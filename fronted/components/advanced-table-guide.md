# 港交所POC系统 - 高级表格功能指南

## 概述
本指南介绍了为 DataManagementPage 组件添加的高级表格功能，包括排序、搜索、分页和批量操作。

## 功能特性

### ✅ 已实现功能

#### 1. 表格排序
- **多列排序支持**: 点击列标题进行排序
- **三态排序**: 无排序 → 升序 → 降序 → 无排序
- **可视化指示**: 排序图标和活动状态高亮
- **支持字段**: 姓名、登录名、人员编号、部门、电话、类型、状态

#### 2. 搜索过滤
- **全局搜索**: 实时搜索姓名、工号、部门等字段
- **列级过滤**: 部门、状态、类型独立过滤
- **防抖处理**: 300ms 延迟，避免频繁查询
- **清除过滤**: 一键清除所有过滤条件

#### 3. 分页功能
- **灵活分页**: 10/20/50/100条每页可选
- **完整导航**: 首页、末页、上下页按钮
- **页码显示**: 智能省略号显示
- **状态统计**: 显示当前页范围和总数

#### 4. 批量操作
- **多选管理**: 全选、单选、跨页保持
- **批量删除**: 支持选中项批量删除
- **批量导出**: CSV格式数据导出
- **选择状态**: 实时显示选中数量

## 技术架构

### 文件结构
```
fronted/
├── lib/types/
│   └── data-management.ts          # 类型定义
├── hooks/
│   ├── use-advanced-table.ts       # 高级表格Hook
│   └── use-debounce.ts            # 防抖Hook
├── components/
│   ├── ui/
│   │   ├── sortable-table-head.tsx # 可排序表头
│   │   └── pagination.tsx         # 分页组件
│   └── data-management-page.tsx    # 主组件
```

### 核心组件

#### 1. useAdvancedTable Hook
```typescript
const [tableState, tableActions] = useAdvancedTable({
  initialData: employees,
  defaultPageSize: 20,
  enableSelection: true,
})
```

**状态管理**:
- `data`: 当前页数据
- `selectedRows`: 选中行集合
- `sortConfig`: 排序配置
- `filterConfig`: 过滤配置
- `paginationConfig`: 分页配置
- `loading`: 加载状态

**操作方法**:
- `handleSort`: 排序处理
- `handleSearch`: 搜索处理
- `handleFilter`: 过滤处理
- `handlePageChange`: 分页切换
- `handleSelectRow`: 行选择
- `handleBatchDelete`: 批量删除
- `handleBatchExport`: 批量导出

#### 2. SortableTableHead 组件
```tsx
<SortableTableHead
  sortKey="name"
  currentSortKey={sortConfig.key}
  currentSortDirection={sortConfig.direction}
  onSort={handleSort}
>
  姓名
</SortableTableHead>
```

**特性**:
- 自动排序图标切换
- 活动状态高亮
- 键盘可访问性

#### 3. Pagination 组件
```tsx
<Pagination
  currentPage={paginationConfig.currentPage}
  totalPages={totalPages}
  pageSize={paginationConfig.pageSize}
  total={paginationConfig.total}
  onPageChange={handlePageChange}
  onPageSizeChange={handlePageSizeChange}
  showSizeChanger
  showTotal
/>
```

**功能**:
- 智能页码显示
- 页大小选择器
- 总数统计
- 快速跳转

## 使用示例

### 基础使用
```tsx
import { DataManagementPage } from '@/components/data-management-page'

// 直接使用增强后的组件
<DataManagementPage />
```

### 自定义配置
```tsx
const [tableState, tableActions] = useAdvancedTable({
  initialData: myData,
  defaultPageSize: 50,
  enableSelection: true,
  onDataChange: (filteredData) => {
    console.log('数据变化:', filteredData)
  }
})
```

### 扩展过滤选项
```tsx
const customFilters = [
  { value: "", label: "全部部门" },
  { value: "财务部", label: "财务部" },
  { value: "技术部", label: "技术部" },
  // 更多选项...
]
```

## 数据格式

### Employee 接口
```typescript
interface Employee {
  id: number
  name: string
  loginName: string
  employeeId: string
  employeeId2: string
  department: string
  supervisor: string
  phone: string
  type: string
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'in-progress'
}
```

## 性能优化

### 1. 防抖搜索
- 搜索输入延迟300ms执行
- 避免频繁API调用

### 2. 虚拟化（可扩展）
```typescript
// 大数据量时可启用虚拟滚动
const virtualizedTable = useVirtualizedTable({
  data: largeDataset,
  itemHeight: 48,
  containerHeight: 600,
})
```

### 3. 记忆化处理
- 过滤和排序结果缓存
- 避免不必要的重新计算

## 自定义样式

### 表格样式
```css
/* 选中行高亮 */
.selected-row {
  @apply bg-blue-50 border-blue-200;
}

/* 排序列高亮 */
.sorted-column {
  @apply bg-gray-50;
}

/* 加载状态 */
.loading-overlay {
  @apply absolute inset-0 bg-white/50 flex items-center justify-center;
}
```

### 响应式设计
```tsx
<div className="overflow-x-auto">
  <Table className="min-w-full">
    {/* 表格内容 */}
  </Table>
</div>
```

## 扩展功能

### 1. 列管理
```typescript
interface ColumnConfig {
  key: keyof Employee
  title: string
  sortable: boolean
  filterable: boolean
  visible: boolean
  width?: number
}
```

### 2. 导出格式扩展
```typescript
const exportFormats = {
  csv: exportToCSV,
  excel: exportToExcel,
  pdf: exportToPDF,
}
```

### 3. 高级过滤
```typescript
interface AdvancedFilter {
  field: keyof Employee
  operator: 'contains' | 'equals' | 'startsWith' | 'endsWith'
  value: string
}
```

## 最佳实践

### 1. 数据管理
- 使用 React Hook Form 处理表单状态
- 实现乐观更新提升用户体验
- 错误边界处理异常情况

### 2. 用户体验
- 加载状态指示
- 空数据状态提示
- 操作确认对话框

### 3. 可访问性
- 键盘导航支持
- 屏幕阅读器友好
- 语义化HTML结构

### 4. 测试策略
```typescript
// 单元测试
describe('useAdvancedTable', () => {
  it('should handle sorting correctly', () => {
    // 测试排序逻辑
  })
  
  it('should filter data correctly', () => {
    // 测试过滤逻辑
  })
})

// 集成测试
describe('DataManagementPage', () => {
  it('should render table with data', () => {
    // 测试组件渲染
  })
})
```

## 故障排除

### 常见问题

1. **排序不生效**
   - 检查 sortKey 是否正确
   - 确认数据字段类型

2. **搜索无结果**
   - 检查防抖配置
   - 确认搜索字段包含

3. **分页异常**
   - 检查总数计算
   - 确认页大小设置

4. **选择状态错误**
   - 检查 ID 唯一性
   - 确认选择逻辑

### 调试技巧
```typescript
// 开启调试模式
const DEBUG = process.env.NODE_ENV === 'development'

if (DEBUG) {
  console.log('Table State:', tableState)
  console.log('Filter Config:', filterConfig)
}
```

## 总结

港交所POC系统的高级表格功能提供了：

✅ **完整的数据管理**: 排序、搜索、分页、选择
✅ **优秀的用户体验**: 实时反馈、加载状态、响应式设计
✅ **高性能**: 防抖搜索、内存优化、虚拟化支持
✅ **可扩展性**: 模块化设计、自定义Hook、类型安全
✅ **企业级特性**: 批量操作、数据导出、权限控制

这套解决方案为人员信息管理提供了现代化、高效的表格交互体验。 