# 港交所POC系统部署指南

## 快速部署

**推荐使用一键部署脚本**：
```bash
# 在项目根目录运行
bash deploy-production.sh
```

该脚本会自动完成：
- 环境检查和依赖安装
- 目录结构创建
- SSL证书生成
- 服务配置和启动
- 健康检查

## 手动部署步骤

如果需要手动部署，请按以下步骤操作：

### 1. 环境准备

#### 1.1 系统要求
- **操作系统**: Ubuntu 18.04+
- **Docker**: 20.10+
- **Docker Compose**: 1.29+

#### 1.2 安装依赖
```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. 项目配置

#### 2.1 目录结构
```
项目根目录/
├── docker-compose.yml
├── nginx.conf
├── deploy-production.sh  # 一键部署脚本
├── backup.sh            # 备份脚本
├── fronted/             # 前端应用
├── nginx/               # Nginx配置
├── ssl/                 # SSL证书
├── logs/                # 日志文件
├── uploads/             # 上传文件
└── database/            # 数据库初始化
```

#### 2.2 环境变量配置
```bash
# 复制环境变量模板
cp fronted/.env.example fronted/.env

# 编辑环境变量
nano fronted/.env
```

### 3. 服务启动

#### 3.1 使用一键部署脚本（推荐）
```bash
bash deploy-production.sh
```

#### 3.2 手动启动
```bash
# 创建必要目录
mkdir -p {logs/{app,nginx,postgres,redis},uploads,ssl,database/init,monitoring,nginx}

# 复制配置文件
cp nginx.conf nginx/nginx.conf

# 启动服务
docker-compose up -d
```

## 4. SSL 证书配置

### 4.1 自签名证书（开发环境）
```bash
cd /opt/hkex-poc/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout key.pem -out cert.pem \
  -subj "/C=CN/ST=HK/L=HongKong/O=HKEX/CN=111.231.53.25"
```

### 4.2 Let's Encrypt 证书（生产环境）
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

## 5. 防火墙配置

```bash
# 开放必要端口
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

## 6. 监控和日志

### 6.1 查看应用日志
```bash
# Docker 容器日志
docker-compose logs -f app

# Nginx 日志
tail -f /opt/hkex-poc/logs/nginx/access.log
tail -f /opt/hkex-poc/logs/nginx/error.log
```

### 6.2 系统监控
```bash
# 检查服务状态
docker-compose ps

# 检查资源使用
docker stats

# 检查磁盘空间
df -h

# 检查内存使用
free -h
```

## 7. 备份策略

### 7.1 创建备份脚本
```bash
sudo nano /opt/hkex-poc/backup.sh
```

### 7.2 设置定时备份
```bash
# 添加到 crontab
crontab -e

# 每天凌晨 2 点备份
0 2 * * * /opt/hkex-poc/backup.sh
```

## 8. 故障排除

### 8.1 常见问题
1. **端口占用**: 检查端口是否被其他服务占用
   ```bash
   netstat -tulpn | grep :5137
   ```

2. **权限问题**: 确保文件权限正确
   ```bash
   sudo chown -R $USER:$USER /opt/hkex-poc
   ```

3. **内存不足**: 检查系统资源
   ```bash
   free -h
   docker system prune -f
   ```

### 8.2 重启服务
```bash
cd /opt/hkex-poc
docker-compose restart
```

### 8.3 完全重新部署
```bash
cd /opt/hkex-poc
docker-compose down
docker-compose pull
docker-compose up -d
```

## 9. 性能优化

### 9.1 Next.js 优化
- 启用静态文件压缩
- 配置 CDN
- 优化图片加载
- 启用缓存策略

### 9.2 Nginx 优化
- 启用 gzip 压缩
- 配置缓存头
- 优化 worker 进程数
- 设置连接池

### 9.3 Docker 优化
- 使用多阶段构建
- 优化镜像大小
- 配置健康检查
- 设置资源限制

## 10. 安全配置

### 10.1 系统安全
```bash
# 禁用 root 登录
sudo nano /etc/ssh/sshd_config
# PermitRootLogin no

# 更新系统
sudo apt update && sudo apt upgrade -y

# 配置自动安全更新
sudo apt install unattended-upgrades -y
```

### 10.2 应用安全
- 配置 HTTPS
- 设置安全头
- 启用 CSRF 保护
- 配置 CORS 策略

## 11. 维护清单

### 11.1 日常维护
- [ ] 检查服务状态
- [ ] 查看错误日志
- [ ] 监控资源使用
- [ ] 检查备份状态

### 11.2 周期维护
- [ ] 更新系统补丁
- [ ] 清理日志文件
- [ ] 检查 SSL 证书有效期
- [ ] 性能监控报告

### 11.3 紧急响应
- [ ] 服务异常处理流程
- [ ] 数据恢复流程
- [ ] 安全事件响应
- [ ] 联系人信息

## 12. 联系信息

**运维负责人**: [姓名]
**电话**: [电话号码]
**邮箱**: [邮箱地址]
**备用联系**: [备用联系方式]

---

**部署完成检查清单**:
- [ ] 服务器环境准备完成
- [ ] 项目代码部署完成
- [ ] Docker 容器运行正常
- [ ] Nginx 配置生效
- [ ] SSL 证书配置完成
- [ ] 防火墙规则设置
- [ ] 监控系统配置
- [ ] 备份策略实施
- [ ] 访问测试通过
- [ ] 文档交接完成 