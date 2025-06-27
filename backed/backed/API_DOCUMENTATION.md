# POC System 后端 API 文档

## 基础信息
- **服务地址**: http://localhost:8080
- **数据格式**: JSON
- **编码**: UTF-8

---

## 1. 基础测试接口

### 1.1 Hello接口
- **URL**: `GET /`
- **说明**: 基础测试接口
- **响应**: `"Hello, Spring Boot with JDK 1.8!"`

### 1.2 API测试接口
- **URL**: `GET /api/test`
- **说明**: API测试接口
- **响应**: `"API测试成功！您的Spring Boot后端已经正常运行。"`

---

## 2. 用户管理接口

### 2.1 获取所有用户
- **URL**: `GET /api/users`
- **说明**: 获取用户列表
- **响应示例**:
```json
[
  {
    "id": 1,
    "name": "张三",
    "email": "zhangsan@example.com"
  },
  {
    "id": 2,
    "name": "李四",
    "email": "lisi@example.com"
  }
]
```

### 2.2 根据ID获取用户
- **URL**: `GET /api/users/{id}`
- **说明**: 根据用户ID获取用户信息
- **响应示例**:
```json
{
  "id": 1,
  "name": "用户1",
  "email": "user1@example.com"
}
```

### 2.3 创建用户
- **URL**: `POST /api/users`
- **说明**: 创建新用户
- **请求体**:
```json
{
  "name": "新用户",
  "email": "newuser@example.com"
}
```

---

## 3. 工作流管理接口

### 3.1 获取所有工作流
- **URL**: `GET /api/workflow`
- **说明**: 获取工作流列表
- **响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "费用申请流程",
      "status": "active",
      "createTime": "2025-06-27T05:08:17.672+00:00"
    },
    {
      "id": 2,
      "name": "请假申请流程",
      "status": "active",
      "createTime": "2025-06-27T05:08:17.672+00:00"
    }
  ],
  "message": "获取工作流列表成功"
}
```

### 3.2 获取工作流节点
- **URL**: `GET /api/workflow/{workflowId}/nodes`
- **说明**: 获取指定工作流的节点信息
- **响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "申请提交",
      "status": "completed",
      "assignee": "张三",
      "order": 1
    },
    {
      "id": 2,
      "name": "主管审批",
      "status": "pending",
      "assignee": "李主管",
      "order": 2
    }
  ],
  "workflowId": 1
}
```

### 3.3 更新节点状态
- **URL**: `PUT /api/workflow/nodes/{nodeId}/status`
- **说明**: 更新工作流节点状态
- **请求体**:
```json
{
  "status": "completed",
  "comment": "审批通过"
}
```

### 3.4 节点打回操作
- **URL**: `POST /api/workflow/nodes/{nodeId}/reject`
- **说明**: 工作流节点打回操作
- **请求体**:
```json
{
  "reason": "信息不完整，需要补充材料",
  "targetNodeId": 1
}
```

---

## 4. 组织架构管理接口

### 4.1 获取组织架构树
- **URL**: `GET /api/organization/tree`
- **说明**: 获取完整的组织架构树形结构
- **响应示例**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "总公司",
    "type": "company",
    "level": 0,
    "children": [
      {
        "id": 2,
        "name": "技术部",
        "type": "department",
        "level": 1,
        "parentId": 1,
        "children": [
          {
            "id": 3,
            "name": "技术主管",
            "type": "position",
            "level": 2,
            "parentId": 2,
            "isManager": true
          }
        ]
      }
    ]
  },
  "message": "获取组织架构成功"
}
```

### 4.2 获取部门列表
- **URL**: `GET /api/organization/departments`
- **说明**: 获取所有部门信息
- **响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "id": 2,
      "name": "技术部",
      "description": "负责系统开发和技术支持",
      "managerName": "李技术"
    }
  ]
}
```

### 4.3 获取岗位列表
- **URL**: `GET /api/organization/positions`
- **参数**: `departmentId` (可选) - 部门ID，不传则返回所有岗位
- **说明**: 获取岗位信息
- **响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "id": 3,
      "name": "技术主管",
      "departmentId": 2,
      "departmentName": "技术部",
      "isManager": true,
      "level": "主管级"
    }
  ]
}
```

### 4.4 获取在线用户
- **URL**: `GET /api/organization/online-users`
- **说明**: 获取当前在线用户信息
- **响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "张三",
      "department": "技术部",
      "position": "开发工程师",
      "isManager": false,
      "loginTime": "2025-06-27T04:08:17.672+00:00",
      "status": "online"
    }
  ],
  "totalCount": 2
}
```

---

---

## 5. 费用申请管理接口

### 5.1 获取费用申请单列表
- **URL**: `GET /api/expense/applications`
- **参数**: `status` (可选) - 申请单状态, `userId` (可选) - 用户ID
- **说明**: 获取费用申请单列表

### 5.2 获取费用申请单详情
- **URL**: `GET /api/expense/applications/{id}`
- **说明**: 获取指定费用申请单的详细信息

### 5.3 创建费用申请单
- **URL**: `POST /api/expense/applications`
- **说明**: 创建新的费用申请单

### 5.4 提交费用申请单
- **URL**: `POST /api/expense/applications/{id}/submit`
- **说明**: 提交费用申请单进入审批流程

### 5.5 审批费用申请单
- **URL**: `POST /api/expense/applications/{id}/approve`
- **说明**: 审批费用申请单

### 5.6 上传附件
- **URL**: `POST /api/expense/applications/{id}/attachments`
- **说明**: 为费用申请单上传附件

### 5.7 获取费用科目
- **URL**: `GET /api/expense/categories`
- **说明**: 获取费用科目列表

### 5.8 获取报销统计
- **URL**: `GET /api/expense/statistics`
- **说明**: 获取报销统计信息

---

## 6. 代理人设置（AB岗管理）接口

### 6.1 获取代理设置列表
- **URL**: `GET /api/proxy/settings`
- **参数**: `userId` (可选), `status` (可选)
- **说明**: 获取代理设置列表

### 6.2 获取代理设置详情
- **URL**: `GET /api/proxy/settings/{id}`
- **说明**: 获取指定代理设置的详细信息

### 6.3 创建代理设置
- **URL**: `POST /api/proxy/settings`
- **说明**: 创建新的代理设置

### 6.4 更新代理设置
- **URL**: `PUT /api/proxy/settings/{id}`
- **说明**: 更新代理设置信息

### 6.5 激活代理设置
- **URL**: `POST /api/proxy/settings/{id}/activate`
- **说明**: 激活代理设置

### 6.6 停用代理设置
- **URL**: `POST /api/proxy/settings/{id}/deactivate`
- **说明**: 停用代理设置

### 6.7 删除代理设置
- **URL**: `DELETE /api/proxy/settings/{id}`
- **说明**: 删除代理设置

### 6.8 获取用户代理权限
- **URL**: `GET /api/proxy/permissions/{userId}`
- **说明**: 获取用户的代理权限信息

### 6.9 导出代理设置文档
- **URL**: `GET /api/proxy/settings/export`
- **说明**: 导出代理设置为文档

### 6.10 获取可代理权限列表
- **URL**: `GET /api/proxy/available-permissions`
- **说明**: 获取系统中可代理的权限列表

---

## 7. 日志管理接口

### 7.1 获取系统日志
- **URL**: `GET /api/logs/system`
- **参数**: `level` (可选), `startDate` (可选), `endDate` (可选), `page`, `size`
- **说明**: 获取系统运行日志

### 7.2 获取安全日志
- **URL**: `GET /api/logs/security`
- **参数**: `action` (可选), `userId` (可选), `startDate` (可选), `endDate` (可选), `page`, `size`
- **说明**: 获取安全相关日志（登录、权限变更等）

### 7.3 获取审计日志
- **URL**: `GET /api/logs/audit`
- **参数**: `module` (可选), `operation` (可选), `userId` (可选), `startDate` (可选), `endDate` (可选), `page`, `size`
- **说明**: 获取审计日志（业务操作记录）

### 7.4 获取日志统计
- **URL**: `GET /api/logs/statistics`
- **参数**: `startDate` (可选), `endDate` (可选)
- **说明**: 获取各类日志的统计信息

### 7.5 导出日志
- **URL**: `POST /api/logs/export`
- **说明**: 导出日志数据

### 7.6 清理过期日志
- **URL**: `POST /api/logs/cleanup`
- **说明**: 清理过期的日志数据

---

## 测试命令

```bash
# 测试工作流接口
curl http://localhost:8080/api/workflow

# 测试组织架构接口
curl http://localhost:8080/api/organization/tree

# 测试用户接口
curl http://localhost:8080/api/users

# 测试在线用户
curl http://localhost:8080/api/organization/online-users

# 测试费用申请接口
curl http://localhost:8080/api/expense/applications

# 测试代理设置接口
curl http://localhost:8080/api/proxy/settings

# 测试系统日志接口
curl http://localhost:8080/api/logs/system

# 测试安全日志接口
curl http://localhost:8080/api/logs/security

# 测试审计日志接口
curl http://localhost:8080/api/logs/audit
``` 