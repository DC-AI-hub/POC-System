# OAuth2 身份认证设置指南

## 概述

本系统支持多种 OAuth2 身份认证提供商，包括 Google、GitHub、Microsoft、微信和钉钉。本指南将帮助您配置这些提供商。

## 环境变量配置

创建 `.env.local` 文件并添加以下配置：

```env
# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Google OAuth2
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# GitHub OAuth2
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here

# Microsoft OAuth2
NEXT_PUBLIC_MICROSOFT_CLIENT_ID=your_microsoft_client_id_here
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret_here

# WeChat OAuth2
NEXT_PUBLIC_WECHAT_CLIENT_ID=your_wechat_app_id_here
WECHAT_CLIENT_SECRET=your_wechat_app_secret_here

# DingTalk OAuth2
NEXT_PUBLIC_DINGTALK_CLIENT_ID=your_dingtalk_app_id_here
DINGTALK_CLIENT_SECRET=your_dingtalk_app_secret_here
```

## 提供商配置

### 1. Google OAuth2

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用 Google+ API
4. 创建 OAuth2 客户端 ID
5. 设置重定向 URI：`http://localhost:3000/auth/callback/google`
6. 复制客户端 ID 和密钥到环境变量

**作用域：** `openid email profile`

### 2. GitHub OAuth2

1. 访问 [GitHub Developer Settings](https://github.com/settings/developers)
2. 点击 "New OAuth App"
3. 填写应用信息：
   - Application name: 您的应用名称
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/auth/callback/github`
4. 创建应用后复制 Client ID 和 Client Secret

**作用域：** `user:email`

### 3. Microsoft OAuth2

1. 访问 [Azure Portal](https://portal.azure.com/)
2. 注册新应用程序
3. 配置重定向 URI：`http://localhost:3000/auth/callback/microsoft`
4. 配置 API 权限：
   - Microsoft Graph: `openid`
   - Microsoft Graph: `email`
   - Microsoft Graph: `profile`
5. 复制应用程序 ID 和密钥

**作用域：** `openid email profile`

### 4. 微信 OAuth2

1. 访问 [微信开放平台](https://open.weixin.qq.com/)
2. 注册开发者账号
3. 创建网站应用
4. 设置授权回调域：`localhost:3000`
5. 获取 AppID 和 AppSecret

**作用域：** `snsapi_userinfo`

### 5. 钉钉 OAuth2

1. 访问 [钉钉开放平台](https://open.dingtalk.com/)
2. 创建应用
3. 配置回调地址：`http://localhost:3000/auth/callback/dingtalk`
4. 获取 AppKey 和 AppSecret

**作用域：** `openid`

## 安全注意事项

1. **客户端密钥安全**：
   - 永远不要在客户端代码中暴露客户端密钥
   - 使用环境变量存储敏感信息
   - 在生产环境中使用安全的密钥管理服务

2. **HTTPS 要求**：
   - 生产环境必须使用 HTTPS
   - 更新所有重定向 URI 为 HTTPS

3. **状态参数验证**：
   - 系统自动生成和验证状态参数
   - 防止 CSRF 攻击

4. **PKCE 支持**：
   - Google 和 Microsoft 自动启用 PKCE
   - 增强安全性

## 功能特性

### 支持的功能

- ✅ 标准 OAuth2 授权码流程
- ✅ PKCE (Proof Key for Code Exchange) 支持
- ✅ 状态参数验证
- ✅ 令牌刷新
- ✅ 用户信息获取
- ✅ 多提供商支持
- ✅ 响应式 UI

### 安全特性

- ✅ CSRF 保护
- ✅ 令牌过期检查
- ✅ 安全的会话管理
- ✅ 错误处理

## 开发测试

### 本地测试

1. 启动开发服务器：
   ```bash
   npm run dev
   ```

2. 访问 `http://localhost:3000`

3. 点击任意 OAuth2 登录按钮测试

### 调试模式

在开发环境中，回调页面会显示调试信息，包括：
- 提供商信息
- 当前 URL
- 认证状态
- 错误信息

## 生产部署

### 环境变量更新

1. 更新 `NEXT_PUBLIC_APP_URL` 为您的生产域名
2. 更新所有提供商的重定向 URI
3. 使用生产环境的客户端 ID 和密钥

### 域名配置

确保在各个提供商的控制台中添加您的生产域名作为授权域名。

## 故障排除

### 常见问题

1. **重定向 URI 不匹配**
   - 检查提供商控制台中的重定向 URI 配置
   - 确保 URL 完全匹配（包括协议和端口）

2. **客户端 ID 无效**
   - 检查环境变量是否正确设置
   - 确认客户端 ID 来自正确的应用

3. **权限不足**
   - 检查请求的作用域是否已授权
   - 确认应用具有必要的 API 权限

4. **令牌过期**
   - 系统会自动处理令牌刷新
   - 如果刷新失败，用户需要重新登录

### 调试步骤

1. 检查浏览器控制台错误
2. 查看网络请求和响应
3. 验证环境变量配置
4. 检查提供商控制台设置

## API 端点

系统期望以下 API 端点（需要后端实现）：

- `POST /api/auth/token` - 交换授权码获取令牌
- `GET /api/auth/profile` - 获取用户信息
- `POST /api/auth/refresh` - 刷新访问令牌

## 自定义配置

您可以通过修改 `lib/auth/oauth2-config.ts` 来：

- 添加新的提供商
- 修改作用域
- 调整重定向 URI
- 更新提供商显示信息

## 支持

如需帮助，请查看：
- 各提供商的官方文档
- OAuth2 标准规范
- 项目 GitHub Issues 