# 港交所POC系统快速部署指南

## 一键部署

### 1. 连接服务器
```bash
ssh username@111.231.53.25
```

### 2. 下载部署脚本
```bash
# 上传项目文件到服务器，或从Git仓库克隆
git clone <repository-url> /tmp/hkex-poc
cd /tmp/hkex-poc

# 或者使用scp上传
scp -r ./项目文件夹 username@111.231.53.25:/tmp/hkex-poc
```

### 3. 运行部署脚本
```bash
chmod +x deploy.sh
./deploy.sh
```

### 4. 访问系统
- HTTP: http://111.231.53.25
- HTTPS: https://111.231.53.25 (自签名证书，浏览器会警告)

## 手动部署步骤

### 1. 环境准备
```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# 安装Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 重新登录以使用户组生效
exit
ssh username@111.231.53.25
```

### 2. 创建项目目录
```bash
sudo mkdir -p /opt/hkex-poc/{nginx,app,ssl,logs,uploads,backups}
sudo chown -R $USER:$USER /opt/hkex-poc
```

### 3. 上传项目文件
```bash
# 复制项目文件到服务器
cp -r /path/to/project/fronted /opt/hkex-poc/app/
cp docker-compose.yml /opt/hkex-poc/
cp nginx.conf /opt/hkex-poc/nginx/
```

### 4. 配置环境变量
```bash
cd /opt/hkex-poc/app
cp .env.example .env.local
nano .env.local  # 编辑配置

# 重要：确保端口配置正确
PORT=5137
```

### 5. 生成SSL证书
```bash
cd /opt/hkex-poc/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout key.pem -out cert.pem \
  -subj "/C=CN/ST=HK/L=HongKong/O=HKEX/CN=111.231.53.25"
```

### 6. 启动服务
```bash
cd /opt/hkex-poc
docker-compose up -d
```

### 7. 验证部署
```bash
# 检查容器状态
docker-compose ps

# 检查日志
docker-compose logs -f

# 测试访问
curl -k https://111.231.53.25/health
```

## 端口配置说明

### 应用端口
- **内部端口**: 5137 (Next.js应用)
- **外部端口**: 80 (HTTP) / 443 (HTTPS)
- **数据库端口**: 5432 (PostgreSQL)
- **缓存端口**: 6379 (Redis)
- **监控端口**: 9090 (Prometheus)

### 防火墙配置
```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

## 常用操作

### 查看服务状态
```bash
cd /opt/hkex-poc
docker-compose ps
```

### 查看日志
```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f app
docker-compose logs -f nginx
```

### 重启服务
```bash
# 重启所有服务
docker-compose restart

# 重启特定服务
docker-compose restart app
```

### 更新应用
```bash
# 停止服务
docker-compose down

# 更新代码
cp -r /path/to/new/code/* /opt/hkex-poc/app/

# 重新构建并启动
docker-compose build --no-cache
docker-compose up -d
```

### 备份数据
```bash
# 手动备份
/opt/hkex-poc/backup.sh

# 查看备份文件
ls -la /opt/hkex-poc/backups/
```

## 故障排除

### 端口被占用
```bash
# 检查端口占用
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443
sudo netstat -tulpn | grep :5137

# 停止占用端口的服务
sudo systemctl stop nginx  # 如果系统安装了nginx
```

### 容器启动失败
```bash
# 查看详细错误日志
docker-compose logs app

# 检查配置文件
docker-compose config

# 重新构建镜像
docker-compose build --no-cache app
```

### 权限问题
```bash
# 修复文件权限
sudo chown -R $USER:$USER /opt/hkex-poc
chmod -R 755 /opt/hkex-poc
```

### 内存不足
```bash
# 检查系统资源
free -h
df -h

# 清理Docker资源
docker system prune -f
```

## 监控和维护

### 系统监控
```bash
# 检查系统资源
htop
iotop
docker stats

# 检查磁盘空间
df -h
du -sh /opt/hkex-poc/*
```

### 日志管理
```bash
# 清理旧日志
find /opt/hkex-poc/logs -name "*.log" -mtime +7 -delete

# 轮转日志
logrotate -f /etc/logrotate.conf
```

### 安全更新
```bash
# 更新系统包
sudo apt update && sudo apt upgrade -y

# 更新Docker镜像
docker-compose pull
docker-compose up -d
```

## 配置说明

### 环境变量 (.env.local)
```bash
# 必须配置的变量
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://111.231.53.25
PORT=5137
DATABASE_URL=postgresql://user:pass@postgres:5432/hkex_poc

# 外部系统集成
LDAP_SERVER_URL=ldap://your-ldap-server:389
SAP_API_ENDPOINT=https://your-sap-server/api
SMTP_HOST=smtp.company.com
```

### Docker Compose服务
- **app**: Next.js应用 (端口5137)
- **nginx**: 反向代理 (端口80/443)
- **postgres**: 数据库 (端口5432)
- **redis**: 缓存 (端口6379)
- **monitoring**: 监控服务 (端口9090)

### Nginx配置
- 自动HTTP到HTTPS重定向
- 静态文件缓存
- API请求限流
- 安全头设置

## 性能优化

### 数据库优化
```sql
-- 创建索引
CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_status ON expenses(status);
CREATE INDEX idx_expenses_created_at ON expenses(created_at);
```

### 缓存配置
```bash
# Redis配置优化
echo "maxmemory 512mb" >> /opt/hkex-poc/redis.conf
echo "maxmemory-policy allkeys-lru" >> /opt/hkex-poc/redis.conf
```

### Nginx优化
```nginx
# 在nginx.conf中添加
worker_processes auto;
worker_connections 2048;
keepalive_timeout 30;
```

## 联系支持

如果遇到问题，请联系：
- **技术支持**: [邮箱]
- **紧急联系**: [电话]
- **文档地址**: [文档链接]

---

**快速检查清单**:
- [ ] 服务器连接正常
- [ ] Docker和Docker Compose已安装
- [ ] 项目文件已上传
- [ ] 环境变量已配置 (PORT=5137)
- [ ] SSL证书已生成
- [ ] 服务启动成功
- [ ] 网站访问正常
- [ ] 备份脚本已设置