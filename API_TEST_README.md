# 后端API完成度测试工具

这个工具用于测试前端调用的所有后端API接口的完成度，帮助开发者了解后端API的实现情况。

## 📋 测试的接口列表

### 1. 认证相关接口 (Authentication)
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/refresh` - Token刷新

### 2. 用户管理接口 (User Management)
- `GET /api/users?size=100` - 获取用户列表
- `POST /api/users` - 创建用户
- `PUT /api/users/{id}` - 更新用户
- `DELETE /api/users/{id}` - 删除用户
- `POST /api/users/import` - 用户批量导入

### 3. 数据库相关接口 (Database)
- `GET /api/database/test-connection` - 数据库连接测试
- `GET /api/database/health` - 数据库健康检查
- `POST /api/database/test-jpa` - JPA功能测试
- `GET /api/database/test-data` - 获取测试数据
- `DELETE /api/database/clear-test-data` - 清空测试数据

### 4. 集成管理接口 (Integration Management)
- `GET /api/integrations` - 获取所有集成配置
- `POST /api/integrations` - 创建集成配置
- `GET /api/integrations/{id}` - 获取单个集成配置
- `PUT /api/integrations/{id}` - 更新集成配置
- `DELETE /api/integrations/{id}` - 删除集成配置
- `POST /api/integrations/{id}/test-connection` - 连接测试
- `GET /api/integrations/{id}/test-connection` - 获取测试历史
- `POST /api/integrations/sync` - 启动同步
- `GET /api/integrations/sync` - 获取同步历史
- `DELETE /api/integrations/sync?syncId={id}` - 取消同步
- `GET /api/integrations/monitor` - 获取监控数据
- `POST /api/integrations/monitor` - 刷新监控数据
- `GET /api/integrations/stats` - 获取统计数据
- `POST /api/integrations/stats` - 重新计算统计数据

### 5. 健康检查接口 (Health Check)
- `GET /api/health` - 应用健康检查

## 🚀 使用方法

### Shell脚本版本 (推荐)

#### 基本用法
```bash
# 测试默认地址 (http://localhost:8070)
./test_backend_api.sh

# 测试指定地址
./test_backend_api.sh http://localhost:8080

# 显示帮助信息
./test_backend_api.sh --help
```

#### 依赖要求
- `curl` - HTTP请求工具
- `bc` - 数学计算工具 (可选，用于精确的响应时间计算)

#### 安装依赖 (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install curl bc
```

#### 安装依赖 (macOS)
```bash
# curl通常已预装
# 安装bc
brew install bc
```

### Python脚本版本

#### 基本用法
```bash
# 测试默认地址
python3 test_backend_api_completion.py

# 测试指定地址
python3 test_backend_api_completion.py --url http://localhost:8080

# 设置超时时间
python3 test_backend_api_completion.py --timeout 15

# 导出结果到JSON文件
python3 test_backend_api_completion.py --export

# 自定义导出文件名
python3 test_backend_api_completion.py --export --export-file my_results.json
```

#### 依赖要求
```bash
pip install requests
```

## 📊 测试结果说明

### 状态码含义
- **✅ 通过** - 接口返回200/201状态码，表示接口正常工作
- **❌ 失败** - 接口返回404或其他错误状态码，表示接口未实现或有问题
- **⏭️ 跳过** - 接口返回401状态码，表示需要认证，测试跳过
- **💥 错误** - 连接失败、超时等网络错误

### 完成度计算
```
完成度 = (通过的接口数 / 总接口数) × 100%
```

## 📁 输出文件

### Shell脚本输出
- 控制台实时显示测试结果
- 结果文件: `api_test_results.txt`

### Python脚本输出
- 控制台详细显示测试结果
- 可选JSON格式结果文件: `api_test_results.json`

## 🔧 配置说明

### Shell脚本配置
```bash
# 在脚本开头修改这些变量
BASE_URL="${1:-http://localhost:8070}"  # 默认后端地址
TIMEOUT=10                              # 请求超时时间(秒)
RESULTS_FILE="api_test_results.txt"     # 结果文件名
```

### Python脚本配置
```python
# 通过命令行参数配置
--url http://localhost:8070    # 后端地址
--timeout 10                   # 超时时间
--export                       # 是否导出结果
--export-file results.json     # 导出文件名
```

## 🎯 使用场景

1. **开发阶段** - 检查后端API实现进度
2. **测试阶段** - 验证API接口可用性
3. **部署前** - 确保所有接口正常工作
4. **问题排查** - 快速定位API问题

## 📝 示例输出

```
🚀 开始测试后端API完成度...
📍 目标地址: http://localhost:8070
⏱️  超时时间: 10秒

[14:30:15] 🔐 测试认证相关接口...
[14:30:15] 测试: POST /api/auth/login - 用户登录
✅ POST /api/auth/login - 用户登录 (200) - 0.045s
[14:30:15] 测试: POST /api/auth/refresh - Token刷新
⏭️  POST /api/auth/refresh - Token刷新 (401) - 需要认证

==================================================================================
📊 测试结果汇总
==================================================================================
📍 目标地址: http://localhost:8070
⏱️  超时时间: 10秒
📈 总计: 25 个接口
✅ 通过: 15 个
❌ 失败: 8 个
⏭️  跳过: 2 个
💥 错误: 0 个
🎯 完成度: 60.0%
```

## 🤝 贡献

欢迎提交Issue和Pull Request来改进这个测试工具！

## �� 许可证

MIT License 