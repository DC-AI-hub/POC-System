#!/bin/bash

# 港交所POC系统 - 生产环境部署脚本
# 适用于Ubuntu服务器的完整部署解决方案

set -e

echo "🚀 港交所POC系统 - 生产环境部署开始..."

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查运行环境
check_environment() {
    log_info "检查运行环境..."
    
    if [[ ! -f "docker-compose.yml" ]]; then
        log_error "请在项目根目录运行此脚本"
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker未安装，请先安装Docker"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        log_error "Docker Compose未安装，请先安装Docker Compose"
        exit 1
    fi
    
    log_info "环境检查通过"
}

# 停止并清理现有容器
cleanup_existing() {
    log_info "停止并清理现有容器..."
    docker-compose down --remove-orphans 2>/dev/null || true
    docker container prune -f 2>/dev/null || true
}

# 检查端口占用
check_ports() {
    log_info "检查端口占用情况..."
    if netstat -tlnp 2>/dev/null | grep -q ":5137 " || ss -tlnp 2>/dev/null | grep -q ":5137 "; then
        log_warn "端口5137已被占用，正在尝试释放..."
        sudo pkill -f "nginx.*5137" 2>/dev/null || true
        sudo pkill -f "node.*5137" 2>/dev/null || true
        sleep 2
    fi
}

# 创建目录结构
setup_directories() {
    log_info "创建目录结构..."
    mkdir -p {logs/{app,nginx,postgres,redis},uploads,ssl,database/init,monitoring,nginx}
    
    # 设置权限
    sudo chown -R $USER:$USER .
    chmod -R 755 logs uploads
    chmod -R 644 *.yml *.conf 2>/dev/null || true
}

# 配置Nginx
setup_nginx() {
    log_info "配置Nginx..."
    if [[ ! -f "nginx/nginx.conf" ]]; then
        if [[ -f "nginx.conf" ]]; then
            cp nginx.conf nginx/nginx.conf
            log_info "Nginx配置文件复制完成"
        else
            log_error "找不到nginx.conf配置文件"
            exit 1
        fi
    fi
}

# 配置监控服务
setup_monitoring() {
    log_info "配置监控服务..."
    if [[ ! -f "monitoring/prometheus.yml" ]]; then
        cat > monitoring/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'hkex-poc-app'
    static_configs:
      - targets: ['app:5137']
    metrics_path: '/api/metrics'
    scrape_interval: 30s

  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx:5137']
    scrape_interval: 30s
EOF
        log_info "监控配置创建完成"
    fi
}

# 创建SSL证书
create_ssl_certificates() {
    log_info "创建SSL证书..."
    if [[ ! -f "ssl/cert.pem" ]] || [[ ! -f "ssl/key.pem" ]]; then
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout ssl/key.pem \
            -out ssl/cert.pem \
            -subj "/C=CN/ST=HK/L=HongKong/O=HKEX/CN=localhost"
        log_info "SSL证书创建完成"
    else
        log_info "SSL证书已存在"
    fi
}

# 配置环境变量
setup_environment() {
    log_info "配置环境变量..."
    if [[ ! -f "fronted/.env" ]]; then
        if [[ -f "fronted/.env.example" ]]; then
            cp fronted/.env.example fronted/.env
            log_info "环境变量文件创建完成"
        else
            # 创建基本的环境变量文件
            cat > fronted/.env << 'EOF'
NODE_ENV=production
PORT=5137
NEXTAUTH_SECRET=your-secret-key-here
JWT_SECRET=your-jwt-secret-here
DATABASE_URL=postgresql://hkex_user:hkex_password_2024@postgres:5432/hkex_poc
REDIS_URL=redis://:redis_password_2024@redis:6379
EOF
            log_info "基本环境变量文件创建完成"
        fi
    fi
}

# 配置数据库
setup_database() {
    log_info "配置数据库..."
    if [[ ! -f "database/init/01-init.sql" ]]; then
        cat > database/init/01-init.sql << 'EOF'
-- 港交所POC系统数据库初始化
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 创建基础表结构
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 插入默认管理员用户
INSERT INTO users (username, email, password_hash, role) 
VALUES ('admin', 'admin@hkex.com', '$2b$10$defaulthashedpassword', 'admin')
ON CONFLICT (username) DO NOTHING;
EOF
        log_info "数据库初始化脚本创建完成"
    fi
}

# 构建和启动服务
build_and_start() {
    log_info "清理Docker系统..."
    docker system prune -f --volumes 2>/dev/null || true
    
    log_info "验证配置文件..."
    if ! docker-compose config > /dev/null 2>&1; then
        log_error "Docker Compose配置验证失败"
        docker-compose config
        exit 1
    fi
    
    log_info "构建Docker镜像..."
    docker-compose build --no-cache --pull
    
    log_info "启动服务..."
    docker-compose up -d
    
    log_info "等待服务启动..."
    sleep 45
}

# 健康检查
health_check() {
    log_info "执行健康检查..."
    max_attempts=12
    attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        log_info "健康检查尝试 $attempt/$max_attempts..."
        
        if curl -s -f http://localhost:5137/api/health > /dev/null 2>&1; then
            log_info "✅ 应用健康检查通过"
            return 0
        elif [ $attempt -eq $max_attempts ]; then
            log_error "❌ 应用健康检查失败"
            log_error "查看服务日志："
            docker-compose logs --tail=50 app
            log_error "查看所有服务状态："
            docker-compose ps
            exit 1
        else
            log_info "⏳ 等待应用启动... ($attempt/$max_attempts)"
            sleep 10
        fi
        
        attempt=$((attempt + 1))
    done
}

# 显示部署结果
show_results() {
    log_info "🎉 部署完成！"
    log_info "📋 服务状态："
    docker-compose ps
    
    echo ""
    log_info "🌐 访问地址："
    echo "  应用主页: http://localhost:5137"
    echo "  健康检查: http://localhost:5137/api/health"
    echo "  监控面板: http://localhost:9090"
    
    echo ""
    log_info "📋 常用命令："
    echo "  查看服务状态: docker-compose ps"
    echo "  查看日志: docker-compose logs -f [服务名]"
    echo "  重启服务: docker-compose restart [服务名]"
    echo "  停止服务: docker-compose down"
    echo "  备份系统: bash backup.sh"
    
    echo ""
    log_info "📁 重要目录："
    echo "  日志目录: ./logs/"
    echo "  上传目录: ./uploads/"
    echo "  SSL证书: ./ssl/"
    echo "  数据库初始化: ./database/init/"
}

# 主函数
main() {
    log_info "开始港交所POC系统生产环境部署..."
    
    check_environment
    cleanup_existing
    check_ports
    setup_directories
    setup_nginx
    setup_monitoring
    create_ssl_certificates
    setup_environment
    setup_database
    build_and_start
    health_check
    show_results
    
    log_info "✅ 部署流程完成！"
}

# 错误处理
trap 'log_error "部署失败，退出代码: $?"' ERR

# 运行主函数
main "$@" 