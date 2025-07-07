# 费用申请办款功能联合测试指南

## 概述

本文档详细说明了如何对前后端的日常费用申请办款功能进行联合测试，包括快速测试和完整集成测试两种方式。

## 测试范围

### 后端功能测试
- ✅ 费用申请单的创建、查询、更新、删除
- ✅ 费用申请单的提交和审批流程
- ✅ 费用科目管理
- ✅ 附件上传功能
- ✅ 费用统计信息
- ✅ API端点验证
- ✅ 数据验证和错误处理

### 前端功能测试
- ✅ 费用申请表单的填写和验证
- ✅ 费用明细的动态管理（增删改）
- ✅ 总金额的实时计算
- ✅ 表单提交和保存功能
- ✅ 响应式设计验证
- ✅ 无障碍访问测试
- ✅ 用户交互体验测试

### 集成测试
- ✅ 前后端数据交互
- ✅ 完整的工作流程测试
- ✅ 错误处理和异常情况
- ✅ 性能测试

## 测试文件说明

### 1. 快速测试脚本
```bash
./quick_expense_test.sh
```
**用途**: 快速验证项目结构和基本配置，不启动服务
**测试内容**:
- 项目文件结构检查
- 代码语法验证
- API端点定义检查
- 前端组件完整性检查
- 表单验证规则检查
- 依赖配置检查

### 2. 后端API测试脚本
```bash
python3 expense_application_integration_test.py
```
**用途**: 测试后端API的完整功能
**测试内容**:
- 健康检查
- 费用科目获取
- 费用申请单CRUD操作
- 申请单提交和审批流程
- 附件上传功能
- 费用统计
- 表单验证场景
- 完整工作流程测试

### 3. 前端功能测试脚本
```bash
cd fronted
node ../frontend_expense_test.js
```
**用途**: 使用Puppeteer测试前端页面功能
**测试内容**:
- 页面加载测试
- 表单验证测试
- 表单填写测试
- 费用明细管理测试
- 总金额计算测试
- 表单提交测试
- 响应式设计测试
- 无障碍访问测试

### 4. 完整集成测试脚本
```bash
./run_expense_integration_test.sh
```
**用途**: 启动完整的前后端服务并执行联合测试
**测试内容**:
- 自动启动前后端服务
- 执行后端API测试
- 执行前端功能测试
- 生成综合测试报告

## 运行步骤

### 步骤1: 环境准备
确保系统已安装以下依赖：
- Java 8+ 和 Maven
- Node.js 16+ 和 npm
- Python 3.7+
- Docker (可选)

### 步骤2: 快速验证
```bash
# 给脚本添加执行权限
chmod +x quick_expense_test.sh
chmod +x run_expense_integration_test.sh

# 运行快速测试
./quick_expense_test.sh
```

### 步骤3: 完整测试
```bash
# 运行完整集成测试
./run_expense_integration_test.sh
```

## 测试报告

测试完成后会生成以下报告文件：

### 1. 快速测试报告
- 控制台输出：实时显示测试结果
- 建议：根据测试结果决定是否进行完整测试

### 2. 后端API测试报告
- 文件：`expense_application_test_report.json`
- 内容：详细的API测试结果和错误信息

### 3. 前端功能测试报告
- 文件：`frontend_expense_test_report.json`
- 内容：前端页面测试结果和截图信息

### 4. 综合测试报告
- 文件：`expense_integration_test_report.json`
- 内容：前后端联合测试的综合结果

## 测试用例详解

### 后端API测试用例

#### 1. 基础功能测试
```python
# 健康检查
GET /api/health

# 获取费用科目
GET /api/expense/categories

# 获取费用统计
GET /api/expense/statistics
```

#### 2. 费用申请单管理
```python
# 创建申请单
POST /api/expense/applications
{
  "applicant": "张三",
  "employeeId": "EMP001",
  "department": "技术部",
  "applicationDate": "2025-01-27",
  "expenseDate": "2025-01-28",
  "company": "测试公司",
  "reason": "测试费用申请",
  "expenseItems": [
    {
      "expenseCategory": "办公用品",
      "purpose": "购买办公用品",
      "amount": 150.00
    }
  ]
}

# 获取申请单列表
GET /api/expense/applications

# 获取申请单详情
GET /api/expense/applications/{id}

# 提交申请单
POST /api/expense/applications/{id}/submit

# 审批申请单
POST /api/expense/applications/{id}/approve
{
  "action": "approve",
  "comment": "审批通过",
  "approverId": "APPROVER001"
}
```

#### 3. 附件管理
```python
# 上传附件
POST /api/expense/applications/{id}/attachments
Content-Type: multipart/form-data
```

### 前端功能测试用例

#### 1. 表单验证测试
- 必填字段验证
- 数据格式验证
- 业务规则验证

#### 2. 用户交互测试
- 表单填写流程
- 费用明细增删改
- 总金额计算
- 提交和保存操作

#### 3. 界面测试
- 响应式设计
- 无障碍访问
- 错误提示显示

## 常见问题解决

### 1. 后端服务启动失败
**问题**: 后端服务无法启动
**解决方案**:
```bash
# 检查Java版本
java -version

# 检查Maven配置
cd backend
./mvnw clean compile

# 查看详细错误日志
tail -f logs/backend.log
```

### 2. 前端服务启动失败
**问题**: 前端服务无法启动
**解决方案**:
```bash
# 检查Node.js版本
node --version

# 重新安装依赖
cd fronted
rm -rf node_modules package-lock.json
npm install

# 查看详细错误日志
tail -f logs/frontend.log
```

### 3. 测试依赖缺失
**问题**: Python或Node.js依赖缺失
**解决方案**:
```bash
# 安装Python依赖
pip3 install requests

# 安装前端测试依赖
cd fronted
npm install --save-dev puppeteer
```

### 4. 端口冲突
**问题**: 8080或3000端口被占用
**解决方案**:
```bash
# 查看端口占用
lsof -i :8080
lsof -i :3000

# 杀死占用进程
kill -9 <PID>
```

## 性能测试

### 1. API性能测试
```bash
# 使用ab进行压力测试
ab -n 1000 -c 10 http://localhost:8080/api/expense/applications
```

### 2. 前端性能测试
- 使用Chrome DevTools的Performance面板
- 检查页面加载时间
- 分析内存使用情况

## 安全测试

### 1. 输入验证测试
- SQL注入测试
- XSS攻击测试
- 文件上传安全测试

### 2. 权限控制测试
- 未授权访问测试
- 越权操作测试

## 持续集成

### GitHub Actions配置示例
```yaml
name: Expense Application Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Set up Java
      uses: actions/setup-java@v2
      with:
        java-version: '11'
        
    - name: Set up Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
        
    - name: Run Quick Tests
      run: ./quick_expense_test.sh
      
    - name: Run Integration Tests
      run: ./run_expense_integration_test.sh
```

## 测试最佳实践

### 1. 测试数据管理
- 使用独立的测试数据库
- 测试前清理测试数据
- 使用固定的测试数据集

### 2. 测试环境隔离
- 开发、测试、生产环境分离
- 使用环境变量配置
- 避免测试影响生产数据

### 3. 测试报告管理
- 保存历史测试报告
- 设置测试结果阈值
- 自动发送测试报告

### 4. 持续改进
- 定期更新测试用例
- 根据业务变化调整测试策略
- 收集测试反馈并优化

## 联系支持

如果在测试过程中遇到问题，请：

1. 查看测试日志文件
2. 检查系统依赖版本
3. 参考常见问题解决方案
4. 提交详细的错误报告

---

**最后更新**: 2025年1月27日
**版本**: 1.0.0 