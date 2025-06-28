<<<<<<< HEAD
# 港交所POC系统

## 部署脚本说明

本系统提供以下部署和管理脚本：

### 🚀 生产环境部署

**主要部署脚本**：
- `deploy-production.sh` - **生产环境一键部署脚本**

**使用方法**：
```bash
# 一键部署
bash deploy-production.sh
```

### 🔧 系统管理

**备份脚本**：
- `backup.sh` - 系统数据备份脚本

**使用方法**：
```bash
# 手动备份
bash backup.sh

# 设置定时备份（每天凌晨2点）
crontab -e
# 添加：0 2 * * * /path/to/backup.sh
```

### 📋 功能对比

| 脚本 | 用途 | 适用环境 | 功能完整度 |
|------|------|----------|------------|
| `deploy-production.sh` | 生产环境部署 | Ubuntu服务器 | ⭐⭐⭐⭐⭐ |
| `backup.sh` | 数据备份 | 所有环境 | ⭐⭐⭐⭐⭐ |

### 🗂️ 已删除的脚本

以下脚本已被删除，因为它们不适合生产环境或功能重复：
- ~~`deploy-local.sh`~~ - 本地开发用，服务器不需要
- ~~`quick-deploy.sh`~~ - 功能简单，已被更完整的脚本替代
- ~~`quick-deploy-fix.sh`~~ - 临时修复脚本，不稳定
- ~~`deploy-docker-fix.sh`~~ - 调试用脚本，不适合生产
- ~~`fix-deployment.sh`~~ - 调试脚本，已整合到主脚本
- ~~`debug-network.sh`~~ - 网络调试工具，不适合生产

### 🌐 快速开始

1. **上传项目文件到服务器**
2. **运行一键部署**：
   ```bash
   bash deploy-production.sh
   ```
3. **访问应用**：
   - 应用地址：http://localhost:8080
   - 健康检查：http://localhost:5137/api/health
   - 监控面板：http://localhost:9090

### 📝 常用命令

```bash
# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f app

# 重启服务
docker-compose restart

# 停止服务
docker-compose down

# 备份系统
bash backup.sh
```

### 📚 详细文档

- [部署指南](DEPLOYMENT_GUIDE.md) - 详细的部署说明
- [快速开始](QUICK_START.md) - 快速上手指南
- [后端集成指南](BACKEND_INTEGRATION_GUIDE.md) - 后端系统集成说明 
=======
# POC-System
>>>>>>> 4a673f7258e2bdf2c5f15796fb8a2793e888ade9
