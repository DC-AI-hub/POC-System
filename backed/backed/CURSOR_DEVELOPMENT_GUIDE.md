# Cursor 后端开发完整指南

## 🎯 项目概述

这是一个基于Spring Boot的POC系统后端，使用Maven进行依赖管理，支持工作流管理、费用申请、组织架构、代理设置和日志管理等功能。

## 🛠️ 开发环境配置

### 基础要求
- **Java**: JDK 1.8
- **构建工具**: Maven
- **IDE**: Cursor
- **端口**: 8080

### 项目结构
```
backed/backed/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── demo/backed/
│   │   │       ├── BackedApplication.java     # 主启动类
│   │   │       ├── HelloController.java       # 基础控制器
│   │   │       └── controller/                # 控制器包
│   │   │           ├── UserController.java
│   │   │           ├── WorkflowController.java
│   │   │           ├── OrganizationController.java
│   │   │           ├── ExpenseController.java
│   │   │           ├── ProxyController.java
│   │   │           └── LogController.java
│   │   └── resources/
│   │       └── application.properties         # 配置文件
│   └── test/
├── pom.xml                                   # Maven配置
├── API_DOCUMENTATION.md                      # API文档
└── CURSOR_DEVELOPMENT_GUIDE.md              # 本指南
```

## 🚀 在Cursor中启动项目

### 1. 打开终端
在Cursor中按 `Ctrl + `` (反引号) 打开终端

### 2. 导航到项目目录
```bash
cd backed/backed
```

### 3. 启动Spring Boot应用
```bash
./mvnw spring-boot:run
```

### 4. 验证服务启动
```bash
curl http://localhost:8080/api/test
```

## 📝 在Cursor中创建新的API接口

### 步骤1: 创建控制器文件
1. 在 `src/main/java/demo/backed/controller/` 目录下创建新的控制器文件
2. 使用 `@RestController` 注解标记类
3. 使用 `@RequestMapping` 设置基础路径
4. 添加 `@CrossOrigin(origins = "*")` 支持跨域

### 步骤2: 实现API方法
```java
@RestController
@RequestMapping("/api/your-module")
@CrossOrigin(origins = "*")
public class YourController {
    
    @GetMapping
    public Map<String, Object> getList() {
        Map<String, Object> response = new HashMap<>();
        // 实现逻辑
        response.put("success", true);
        response.put("data", data);
        return response;
    }
    
    @PostMapping
    public Map<String, Object> create(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        // 实现逻辑
        response.put("success", true);
        response.put("message", "创建成功");
        return response;
    }
}
```

### 步骤3: 重启服务
由于Spring Boot的热重载机制，通常需要重启服务来加载新的控制器：
```bash
# 停止服务 (Ctrl+C)
# 重新启动
./mvnw spring-boot:run
```

### 步骤4: 测试API
```bash
curl http://localhost:8080/api/your-module
```

## 🔧 Cursor开发技巧

### 1. 使用Cursor的智能提示
- 输入 `@` 会自动提示Spring注解
- 输入 `Map<String, Object>` 会自动导入相关包
- 使用 `Ctrl+Space` 触发代码补全

### 2. 快速创建模板代码
使用Cursor的代码生成功能：
- 输入 `controller` 可能会提示控制器模板
- 输入 `restapi` 可能会提示REST API模板

### 3. 文件导航
- `Ctrl+P` 快速打开文件
- `Ctrl+Shift+F` 全局搜索
- `Ctrl+G` 跳转到指定行

### 4. 调试技巧
- 在Cursor中设置断点
- 使用 `System.out.println()` 进行简单调试
- 查看终端输出的日志信息

## 📊 现有API接口总览

### 基础接口
- `GET /` - Hello接口
- `GET /api/test` - API测试接口

### 用户管理
- `GET /api/users` - 获取用户列表
- `GET /api/users/{id}` - 获取用户详情
- `POST /api/users` - 创建用户

### 工作流管理
- `GET /api/workflow` - 获取工作流列表
- `GET /api/workflow/{id}/nodes` - 获取工作流节点
- `PUT /api/workflow/nodes/{id}/status` - 更新节点状态
- `POST /api/workflow/nodes/{id}/reject` - 节点打回

### 组织架构管理
- `GET /api/organization/tree` - 获取组织架构树
- `GET /api/organization/departments` - 获取部门列表
- `GET /api/organization/positions` - 获取岗位列表
- `GET /api/organization/online-users` - 获取在线用户

### 费用申请管理
- `GET /api/expense/applications` - 获取申请单列表
- `POST /api/expense/applications` - 创建申请单
- `POST /api/expense/applications/{id}/approve` - 审批申请单
- `GET /api/expense/categories` - 获取费用科目

### 代理设置管理
- `GET /api/proxy/settings` - 获取代理设置列表
- `POST /api/proxy/settings` - 创建代理设置
- `GET /api/proxy/permissions/{userId}` - 获取用户代理权限

### 日志管理
- `GET /api/logs/system` - 获取系统日志
- `GET /api/logs/security` - 获取安全日志
- `GET /api/logs/audit` - 获取审计日志
- `GET /api/logs/statistics` - 获取日志统计

## 🎨 代码规范

### 1. 命名规范
- 控制器类名：`XxxController`
- 方法名：使用驼峰命名法
- 包名：全小写

### 2. 响应格式统一
```json
{
  "success": true,
  "data": {},
  "message": "操作成功",
  "totalCount": 100
}
```

### 3. 异常处理
```java
try {
    // 业务逻辑
} catch (Exception e) {
    response.put("success", false);
    response.put("message", "操作失败：" + e.getMessage());
    return response;
}
```

## 🧪 测试和调试

### 1. 使用curl测试API
```bash
# GET请求
curl http://localhost:8080/api/workflow

# POST请求
curl -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"测试用户","email":"test@example.com"}'
```

### 2. 使用Postman测试
- 导入API文档到Postman
- 创建测试集合
- 设置环境变量

### 3. 查看日志
Spring Boot应用的日志会在终端中显示：
```
2025-06-27 13:05:49.349  INFO 40776 --- [           main] demo.backed.BackedApplication            : Starting BackedApplication
```

## 📈 性能优化建议

### 1. 数据库优化
- 添加数据库连接池配置
- 使用JPA或MyBatis进行数据访问
- 添加缓存机制

### 2. 接口优化
- 实现分页查询
- 添加数据验证
- 使用DTO对象替代Map

### 3. 安全性增强
- 添加JWT认证
- 实现权限控制
- 添加请求限流

## 🔄 持续开发流程

### 1. 需求分析
- 阅读需求文档
- 确定API设计
- 设计数据结构

### 2. 编码实现
- 创建控制器
- 实现业务逻辑
- 编写测试用例

### 3. 测试验证
- 单元测试
- 集成测试
- API测试

### 4. 文档更新
- 更新API文档
- 更新开发指南
- 提交代码

## 🚨 常见问题解决

### 1. 端口被占用
```bash
# 查看端口占用
netstat -ano | findstr :8080
# 杀死进程
taskkill /PID <PID> /F
```

### 2. Maven依赖问题
```bash
# 清理并重新构建
./mvnw clean install
```

### 3. 热重载不生效
- 重启Spring Boot应用
- 检查IDE设置
- 确认文件保存

### 4. 跨域问题
确保控制器上有 `@CrossOrigin(origins = "*")` 注解

## 📚 学习资源

- [Spring Boot官方文档](https://spring.io/projects/spring-boot)
- [Maven官方文档](https://maven.apache.org/)
- [RESTful API设计指南](https://restfulapi.net/)
- [Java 8特性](https://www.oracle.com/java/technologies/javase/8-whats-new.html)

---

## 📝 总结

通过本指南，您应该能够：
1. ✅ 在Cursor中启动和运行Spring Boot项目
2. ✅ 创建新的REST API接口
3. ✅ 测试和调试API
4. ✅ 理解项目结构和代码规范
5. ✅ 解决常见开发问题

继续开发时，请参考 `API_DOCUMENTATION.md` 了解所有可用的接口，并遵循本指南中的最佳实践。 