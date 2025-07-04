#!/bin/bash

# Poc System 数据库初始化脚本
# 用于初始化测试数据和解决刷新Token问题

echo "🚀 开始初始化Poc System数据库..."

# 检查Docker是否运行
if ! docker ps > /dev/null 2>&1; then
    echo "❌ Docker未运行，请先启动Docker"
    exit 1
fi

# 检查PostgreSQL容器是否运行
if ! docker ps | grep -q "postgres"; then
    echo "📦 启动PostgreSQL容器..."
    docker-compose up -d postgres
    echo "⏳ 等待PostgreSQL启动..."
    sleep 10
fi

# 数据库连接信息
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="hkex_poc"
DB_USER="hkex_user"
DB_PASSWORD="hkex_password_2024"

echo "🔌 连接数据库: $DB_HOST:$DB_PORT/$DB_NAME"

# 检查数据库连接
if ! docker exec poc_postgres_1 pg_isready -U $DB_USER -d $DB_NAME > /dev/null 2>&1; then
    echo "❌ 无法连接到数据库，请检查Docker容器状态"
    exit 1
fi

echo "✅ 数据库连接成功"

# 执行SQL脚本
echo "📝 执行数据库初始化脚本..."
docker exec -i poc_postgres_1 psql -U $DB_USER -d $DB_NAME < init_test_data.sql

if [ $? -eq 0 ]; then
    echo "✅ 数据库初始化成功！"
    echo ""
    echo "📋 测试账户信息："
    echo "  管理员: admin@hkex.com / admin123"
    echo "  测试用户: testuser@hkex.com / test123"
    echo "  财务主管: finance@hkex.com / admin123"
    echo "  人事专员: hr@hkex.com / admin123"
    echo ""
    echo "🎯 现在可以测试登录和刷新Token功能了！"
else
    echo "❌ 数据库初始化失败，请检查错误信息"
    exit 1
fi

echo ""
echo "🔧 下一步操作："
echo "1. 启动Spring Boot应用: ./mvnw spring-boot:run"
echo "2. 使用Postman测试登录接口"
echo "3. 测试刷新Token功能" 