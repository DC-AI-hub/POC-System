# AI沟通快速参考卡 🚀

## 📋 必备上下文模板

```markdown
## 项目背景
**项目名称**: 港交所POC系统 - 费用管理与审批系统
**技术栈**: Next.js 15.2.4 + React 19 + TypeScript + Tailwind CSS + Radix UI
**开发阶段**: [前端UI开发/API集成/工作流开发]
**当前模块**: [费用申请/差旅报销/人员管理]

## 技术约束
- 组件设计: 原子化设计原则
- TypeScript: 严格类型检查
- 样式: 只使用Tailwind CSS + Radix UI
- 表单: React Hook Form + Zod验证
- 错误处理: 统一错误处理机制
```

## 🎨 可直接使用的提示词

### 基础组件开发（复制即用）
```markdown
基于港交所POC系统，需要创建通用的 StatusBadge 组件。

**项目背景**: 港交所POC系统 - 费用管理与审批系统
**技术栈**: Next.js 15.2.4 + React 19 + TypeScript + Tailwind CSS + Radix UI
**目标文件**: fronted/components/ui/status-badge.tsx
**参考文件**: fronted/components/data-management-page.tsx（查看现有状态显示）

**功能需求**: 
- 显示不同状态的徽章（草稿、审批中、已通过、已拒绝等）
- 支持自定义颜色和图标
- 响应式设计，移动端适配
- 支持点击事件和 hover 效果

**状态定义**:
```typescript
type StatusType = 'draft' | 'pending' | 'approved' | 'rejected' | 'in-progress';
interface StatusBadgeProps {
  status: StatusType;
  children?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}
```

**设计要求**: 使用 slate-800/blue-600/green-600/red-600 配色，圆角设计，符合现有按钮样式。

请提供完整的 StatusBadge 组件实现和 TypeScript 类型定义。
```

### 表单验证增强（复制即用）
```markdown
基于港交所POC系统，需要为 ExpenseApplicationPage 组件添加完整的表单验证。

**项目背景**: 港交所POC系统 - 费用管理与审批系统
**技术栈**: Next.js 15.2.4 + React 19 + TypeScript + Tailwind CSS + Radix UI
**目标文件**: fronted/components/expense-application-page.tsx
**相关需求**: 项目需求文档 > 2.1.1 日常费用申请模块

**当前状态**: 基本表单结构已完成，缺少验证机制
**具体需求**:
1. 集成 React Hook Form + Zod 验证
2. 申请人、部门、金额等字段验证
3. 费用明细数组验证（至少一条，金额>0）
4. 实时错误提示显示

**验证规则**:
- 申请人：必填，最少2个字符
- 申请日期：必填，不能超过当前日期
- 费用明细：至少一条，每条金额必须>0
- 事由描述：必填，最少10个字符

**技术要求**: 保持现有UI风格，添加错误状态样式，使用 TypeScript 严格类型。

请提供完整的表单验证逻辑和相关 Hook 实现。
```

### 数据表格功能（复制即用）
```markdown
基于港交所POC系统，需要为 DataManagementPage 组件添加高级表格功能。

**项目背景**: 港交所POC系统 - 费用管理与审批系统
**技术栈**: Next.js 15.2.4 + React 19 + TypeScript + Tailwind CSS + Radix UI
**目标文件**: fronted/components/data-management-page.tsx
**相关需求**: 项目需求文档 > 2.1.3 人员信息管理模块

**当前状态**: 基础表格显示已完成，需要添加高级功能
**具体需求**:
1. 表格排序：点击列标题进行升序/降序排序
2. 搜索过滤：全局搜索和列级过滤
3. 分页功能：前端分页，每页显示数量可选
4. 批量操作：多选删除和批量导出

**功能设计**:
- 排序：支持姓名、部门、状态等字段排序
- 搜索：实时搜索，防抖处理
- 分页：10/20/50条每页，显示总数统计
- 选择：全选checkbox，单行选择，跨页保持

**技术要求**: 基于现有 Table 组件扩展，保持设计一致性，添加 loading 状态。

请提供完整的高级表格功能实现，包括搜索、排序、分页和选择逻辑。
```

### 工作流开发（复制即用）
```markdown
基于港交所POC系统，需要开发工作流状态追踪组件。

**项目背景**: 港交所POC系统 - 费用管理与审批系统
**技术栈**: Next.js 15.2.4 + React 19 + TypeScript + Tailwind CSS + Radix UI
**目标文件**: fronted/components/workflow-tracker.tsx
**相关需求**: 项目需求文档 > 2.2 工作流审批系统

**工作流节点**（需求文档2.2.1章节）:
申请发起人 → AA1资格审批 → 直属主管审批 → GHBC财务组审批 → GHBC合规组审批 → Functional Head审批 → COO/CEO审批 → 审批完成

**功能需求**:
1. 步骤可视化：显示8个审批节点的状态
2. 状态标识：当前(蓝色)、已完成(绿色)、待处理(灰色)、拒绝(红色)
3. 详情显示：点击节点显示审批人、时间、意见
4. 响应式：水平布局(桌面)、垂直布局(移动端)

**数据结构**:
```typescript
interface WorkflowStep {
  id: string;
  name: string;
  status: 'pending' | 'in-progress' | 'completed' | 'rejected';
  approver?: string;
  approvedAt?: Date;
  comment?: string;
}
```

**设计要求**: 使用蓝色主题，步骤间连线，支持点击展开详情。

请提供完整的 WorkflowTracker 组件实现，包括状态管理和响应式布局。
```

### Bug修复（复制即用）
```markdown
港交所POC系统 ExpenseApplicationPage 组件存在表单提交问题。

**项目背景**: 港交所POC系统 - 费用管理与审批系统
**目标文件**: fronted/components/expense-application-page.tsx
**Bug描述**: 点击"提交申请"按钮后，表单数据未正确提交，页面无响应

**复现步骤**:
1. 打开费用申请页面 (ExpenseApplicationPage)
2. 填写申请人、选择部门、输入费用明细
3. 点击"提交申请"按钮
4. 期望：显示提交成功提示，实际：按钮无响应

**技术环境**: Chrome 最新版本，开发环境
**相关代码**: fronted/components/expense-application-page.tsx 中的表单提交逻辑

**修复目标**: 
- 修复表单提交功能
- 添加提交中的 loading 状态
- 添加成功/失败的用户反馈
- 确保表单验证正常工作

请分析问题原因并提供修复代码，保持现有的UI样式不变。
```

## ✅ 开发检查清单

### 开发前
- [ ] 确认开发阶段和模块
- [ ] 准备需求文档要点
- [ ] 检查现有相关组件
- [ ] 明确技术栈约束

### 沟通时
- [ ] 包含项目背景信息
- [ ] 使用具体需求描述
- [ ] 指定技术约束条件
- [ ] 明确期望交付物

### 代码检查
- [ ] TypeScript类型完整
- [ ] 错误处理机制
- [ ] 响应式设计
- [ ] 无障碍性支持
- [ ] 性能优化考虑

## 🎯 质量标准

### TypeScript类型
```typescript
// ✅ 好的类型定义
interface ComponentProps {
  data: SpecificType[];
  onAction: (id: string) => void;
  status: 'loading' | 'error' | 'success';
}

// ❌ 避免
interface BadProps {
  data: any[];
  callback: Function;
}
```

### 组件接口
```typescript
// ✅ 标准组件接口
interface BaseProps {
  className?: string;
  children?: React.ReactNode;
  'data-testid'?: string;
}

interface SpecificProps extends BaseProps {
  // 具体属性
}
```

### 错误处理
```typescript
// ✅ 标准错误处理
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

try {
  setLoading(true);
  setError(null);
  // 业务逻辑
} catch (err) {
  setError(err instanceof Error ? err.message : '操作失败');
} finally {
  setLoading(false);
}
```

## 🚫 常见问题避免

### 模糊请求
❌ "帮我做个表单"
✅ "基于费用申请需求，创建包含基本信息、费用明细、审批意见的表单，使用React Hook Form + Zod验证"

### 缺少上下文
❌ "这个组件有bug"
✅ "ExpenseApplicationPage组件中，点击'增加明细'按钮后新增表单行验证失效，请检查并修复"

### 技术要求不明确
❌ "优化一下性能"
✅ "优化DataTable组件渲染性能，使用React.memo和useCallback，支持1000+行数据流畅显示"

## 🚀 完整开发流程提示词

### 完整模块开发（复制即用）
```markdown
基于港交所POC系统，需要完整开发差旅报销模块的多币种功能。

**项目背景**: 港交所POC系统 - 费用管理与审批系统
**技术栈**: Next.js 15.2.4 + React 19 + TypeScript + Tailwind CSS + Radix UI
**目标文件**: fronted/components/travel-expense-page.tsx
**相关需求**: 项目需求文档 > 2.1.2 差旅费报销模块 > 多币种支持

**完整需求**:
1. **币种选择**: 支持港币、美元、人民币、欧元等主要币种
2. **汇率计算**: 实时汇率获取（可使用模拟数据）
3. **金额换算**: 发票金额自动换算为人民币
4. **费用明细**: 每行支持不同币种
5. **汇率管理**: 汇率历史记录和手动调整

**数据结构**:
```typescript
interface TravelExpenseItem {
  id: string;
  category: string;
  expenseDate: Date;
  currency: string;
  exchangeRate: number;
  invoiceAmount: number;
  rmbAmount: number;
  description: string;
}
```

**技术要求**: 
- 基于现有的 TravelExpensePage 组件扩展
- 保持现有的表格布局和样式
- 添加汇率计算的防抖处理
- 完整的错误处理和边界情况
- TypeScript 严格类型检查

**交付物**: 完整的多币种费用管理功能、汇率计算逻辑、相关 Hook 和类型定义。

请提供完整实现方案，包括组件代码、数据处理逻辑和使用示例。
```

## 📚 项目文件速查

### 核心文件路径
- **主页面**: fronted/app/page.tsx
- **费用申请**: fronted/components/expense-application-page.tsx
- **差旅报销**: fronted/components/travel-expense-page.tsx
- **人员管理**: fronted/components/data-management-page.tsx
- **人员信息管理**: fronted/components/personnel-management-page.tsx
- **审批管理**: fronted/components/approval-management-page.tsx
- **系统配置**: fronted/components/system-config-page.tsx
- **报表分析**: fronted/components/report-analytics-page.tsx
- **移动端组件**: fronted/components/mobile/
- **API接口**: fronted/app/api/
- **侧边栏**: fronted/components/sidebar.tsx
- **UI组件**: fronted/components/ui/
- **工具函数**: fronted/lib/utils.ts

### 需求文档章节
- **2.1.1**: 日常费用申请模块
- **2.1.2**: 差旅费报销模块
- **2.1.3**: 人员信息管理模块
- **2.2**: 工作流审批系统
- **3**: 用户角色与权限
- **4**: 系统集成需求
- **5.4**: 兼容性需求（移动端）
- **6**: 数据需求（报表分析）
- **7**: 界面设计需求

### 技术约束
- **TypeScript**: 严格模式，完整类型定义
- **样式**: 只使用 Tailwind CSS + Radix UI
- **表单**: React Hook Form + Zod 验证
- **设计**: slate-800 标题栏，blue-600 主色调

### 人员信息管理（复制即用）
```markdown
基于港交所POC系统，需要开发完整的人员信息管理功能。

**项目背景**: 港交所POC系统 - 费用管理与审批系统
**技术栈**: Next.js 15.2.4 + React 19 + TypeScript + Tailwind CSS + Radix UI
**目标文件**: fronted/components/personnel-management-page.tsx
**相关需求**: 项目需求文档 > 2.1.3 人员信息管理模块

**完整需求**:
1. **人员信息录入**: 新增人员的完整信息录入表单
2. **人员信息修改**: 编辑现有人员信息，支持批量修改
3. **组织架构管理**: 部门层级管理和人员归属关系
4. **人员状态管理**: 在职、离职、调动等状态变更
5. **高级搜索**: 多条件组合搜索和筛选

**数据结构**:
```typescript
interface PersonnelInfo {
  id: string;
  name: string;
  loginName: string;
  employeeId: string;
  department: string;
  position: string;
  manager: string;
  phone: string;
  email: string;
  employeeType: 'full-time' | 'part-time' | 'contractor';
  status: 'active' | 'inactive' | 'transferred' | 'resigned';
  hireDate: Date;
  lastModified: Date;
}
```

**功能设计**:
- **录入表单**: 分步骤表单，基本信息→组织关系→联系方式
- **批量操作**: 批量导入、批量修改部门、批量状态变更
- **组织架构**: 树形结构显示，拖拽调整层级关系
- **数据验证**: 员工工号唯一性、邮箱格式、手机号验证

**技术要求**: 
- 基于现有 DataManagementPage 组件扩展
- 使用 React Hook Form + Zod 表单验证
- 支持Excel导入导出功能
- 完整的操作日志记录

请提供完整的人员管理功能实现，包括录入、修改、组织架构管理和批量操作。
```

### 审批管理界面（复制即用）
```markdown
基于港交所POC系统，需要开发审批管理界面功能。

**项目背景**: 港交所POC系统 - 费用管理与审批系统
**技术栈**: Next.js 15.2.4 + React 19 + TypeScript + Tailwind CSS + Radix UI
**目标文件**: fronted/components/approval-management-page.tsx
**相关需求**: 项目需求文档 > 2.2 工作流审批系统

**完整需求**:
1. **待审批列表**: 显示当前用户需要审批的申请单
2. **审批详情**: 查看申请详情和审批历史
3. **审批操作**: 通过、拒绝、退回等操作
4. **批量审批**: 支持批量通过或拒绝
5. **审批统计**: 审批效率和状态统计

**工作流节点**（需求文档2.2.1章节）:
- AA1资格审批 → 直属主管审批 → GHBC财务组审批 → GHBC合规组审批 → Functional Head审批 → COO/CEO审批

**数据结构**:
```typescript
interface ApprovalItem {
  id: string;
  applicationId: string;
  applicant: string;
  type: 'expense' | 'travel';
  amount: number;
  currentStep: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
  deadline: Date;
  priority: 'low' | 'medium' | 'high';
}
```

**功能设计**:
- **列表视图**: 卡片式或表格式显示，支持排序和筛选
- **详情弹窗**: 完整的申请信息展示和审批历史
- **快速操作**: 一键通过、快速拒绝、添加意见
- **提醒功能**: 超时提醒、催办通知

**技术要求**: 
- 实时数据更新（WebSocket或轮询）
- 支持移动端审批操作
- 完整的权限控制和角色验证
- 审批意见富文本编辑

请提供完整的审批管理界面实现，包括列表、详情、操作和统计功能。
```

### 系统配置管理（复制即用）
```markdown
基于港交所POC系统，需要开发系统配置管理功能。

**项目背景**: 港交所POC系统 - 费用管理与审批系统
**技术栈**: Next.js 15.2.4 + React 19 + TypeScript + Tailwind CSS + Radix UI
**目标文件**: fronted/components/system-config-page.tsx
**相关需求**: 项目需求文档 > 3. 用户角色与权限

**完整需求**:
1. **用户角色管理**: 角色创建、权限分配、角色层级
2. **费用科目配置**: 科目分类、编码规则、预算限制
3. **审批流程配置**: 工作流节点设置、条件分支配置
4. **系统参数设置**: 全局配置、业务规则、通知设置
5. **权限矩阵管理**: 角色权限矩阵可视化配置

**角色定义**（需求文档3.1章节）:
- 系统管理员、普通员工、部门主管、AA1资格人员、财务人员、合规人员、功能负责人、高级管理层

**数据结构**:
```typescript
interface SystemRole {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  level: number;
  isActive: boolean;
}

interface ExpenseCategory {
  id: string;
  code: string;
  name: string;
  parentId?: string;
  budgetLimit?: number;
  approvalRequired: boolean;
}
```

**功能设计**:
- **角色管理**: 树形角色层级、权限继承、批量权限设置
- **科目管理**: 树形科目结构、拖拽排序、批量导入
- **流程配置**: 可视化流程设计器、条件分支设置
- **参数配置**: 分类配置、实时预览、配置验证

**技术要求**: 
- 角色权限的实时生效
- 配置变更的审计日志
- 配置导入导出功能
- 配置回滚和版本管理

请提供完整的系统配置管理实现，包括角色、权限、科目和流程配置。
```

### 报表分析模块（复制即用）
```markdown
基于港交所POC系统，需要开发报表分析功能。

**项目背景**: 港交所POC系统 - 费用管理与审批系统
**技术栈**: Next.js 15.2.4 + React 19 + TypeScript + Tailwind CSS + Radix UI + Chart.js
**目标文件**: fronted/components/report-analytics-page.tsx
**相关需求**: 项目需求文档 > 6. 数据需求

**完整需求**:
1. **费用统计报表**: 按部门、时间、科目的费用统计
2. **审批效率分析**: 审批时长、通过率、瓶颈分析
3. **预算对比分析**: 实际支出vs预算、超支预警
4. **趋势分析**: 费用趋势、季度对比、年度分析
5. **自定义报表**: 用户自定义维度和指标

**报表类型**:
- **汇总报表**: 总体费用概览、关键指标KPI
- **明细报表**: 详细费用清单、审批记录
- **对比报表**: 同比环比、部门对比、预算对比
- **图表分析**: 饼图、柱状图、趋势线、热力图

**数据结构**:
```typescript
interface ReportConfig {
  id: string;
  name: string;
  type: 'summary' | 'detail' | 'comparison' | 'trend';
  dimensions: string[];
  metrics: string[];
  filters: ReportFilter[];
  chartType: 'pie' | 'bar' | 'line' | 'table';
}

interface ReportData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
  }[];
}
```

**功能设计**:
- **报表生成器**: 拖拽式报表设计、实时预览
- **数据钻取**: 点击图表深入查看明细数据
- **导出功能**: PDF、Excel、图片格式导出
- **定时报表**: 自动生成和邮件发送

**技术要求**: 
- 使用 Chart.js 或 Recharts 图表库
- 支持大数据量的分页和虚拟滚动
- 报表缓存和增量更新
- 响应式图表设计

请提供完整的报表分析功能实现，包括报表生成、图表展示和数据导出。
```

### 移动端适配（复制即用）
```markdown
基于港交所POC系统，需要开发移动端适配功能。

**项目背景**: 港交所POC系统 - 费用管理与审批系统
**技术栈**: Next.js 15.2.4 + React 19 + TypeScript + Tailwind CSS + PWA
**目标文件**: fronted/components/mobile/ 目录下相关组件
**相关需求**: 项目需求文档 > 5.4 兼容性需求

**完整需求**:
1. **响应式布局**: 适配手机、平板等不同屏幕尺寸
2. **移动端审批**: 简化的审批流程和操作界面
3. **离线功能**: PWA支持、离线数据缓存
4. **手势操作**: 滑动操作、下拉刷新、上拉加载
5. **原生体验**: 底部导航、全屏模式、状态栏适配

**移动端特性**:
- **快速申请**: 简化表单、语音输入、拍照上传
- **消息推送**: 审批通知、状态变更提醒
- **指纹识别**: 生物识别登录、安全验证
- **位置服务**: 差旅定位、地点自动填充

**数据结构**:
```typescript
interface MobileConfig {
  theme: 'light' | 'dark' | 'auto';
  notifications: boolean;
  biometric: boolean;
  offline: boolean;
  autoSync: boolean;
}

interface OfflineData {
  applications: ExpenseApplication[];
  lastSync: Date;
  pendingUploads: File[];
}
```

**功能设计**:
- **自适应导航**: 底部Tab导航、汉堡菜单
- **手势友好**: 大按钮设计、易点击区域
- **性能优化**: 图片懒加载、代码分割
- **离线优先**: Service Worker、IndexedDB缓存

**技术要求**: 
- 使用 Tailwind CSS 响应式类
- PWA配置和Service Worker
- 触摸事件处理和手势识别
- 移动端性能优化

请提供完整的移动端适配实现，包括响应式布局、PWA功能和移动端优化。
```

### 集成接口开发（复制即用）
```markdown
基于港交所POC系统，需要开发系统集成接口功能。

**项目背景**: 港交所POC系统 - 费用管理与审批系统
**技术栈**: Next.js 15.2.4 + React 19 + TypeScript + API Routes
**目标文件**: fronted/app/api/ 目录下相关接口
**相关需求**: 项目需求文档 > 4. 系统集成需求

**完整需求**:
1. **用户认证集成**: 企业域账户、SSO单点登录
2. **财务系统集成**: 会计科目同步、费用数据推送
3. **HR系统集成**: 人员信息同步、组织架构同步
4. **邮件系统集成**: 审批通知、状态变更邮件
5. **文件存储集成**: 附件上传、文档管理

**集成类型**（需求文档4章节）:
- **用户认证**: LDAP、SAML、OAuth2.0
- **财务系统**: SAP、用友、金蝶等ERP系统
- **HR系统**: 人力资源管理系统
- **通知系统**: 邮件、短信、企业微信

**数据结构**:
```typescript
interface IntegrationConfig {
  id: string;
  name: string;
  type: 'auth' | 'finance' | 'hr' | 'notification';
  endpoint: string;
  credentials: Record<string, string>;
  mapping: FieldMapping[];
  isActive: boolean;
}

interface SyncResult {
  success: boolean;
  recordsProcessed: number;
  errors: string[];
  lastSync: Date;
}
```

**功能设计**:
- **接口配置**: 可视化配置界面、连接测试
- **数据映射**: 字段映射配置、数据转换规则
- **同步管理**: 增量同步、全量同步、冲突处理
- **监控告警**: 同步状态监控、异常告警

**技术要求**: 
- RESTful API设计规范
- 数据加密和安全传输
- 异步处理和队列管理
- 完整的错误处理和重试机制

请提供完整的系统集成接口实现，包括配置管理、数据同步和监控功能。
```

---

**💡 提示**: 
1. 复制提示词时确保包含完整的项目背景信息
2. 根据实际需求调整文件路径和功能描述
3. 使用时可以组合多个提示词来处理复杂需求 