#!/bin/bash

# 测试修复admin用户
BASE_URL="http://localhost:8070"

echo "🔧 测试修复admin用户..."

# 1. 先检查admin用户的当前状态
echo "1. 检查admin用户当前状态..."
login_data='{"email":"admin@hkex.com","password":"admin123","rememberMe":false}'
resp=$(curl -s -X POST "$BASE_URL/api/auth/login" -H "Content-Type: application/json" -d "$login_data")
echo "登录响应: $resp"

# 2. 尝试调用修复接口
echo "2. 尝试调用修复接口..."
fix_resp=$(curl -s -X POST "$BASE_URL/api/database/fix-admin-user")
echo "修复接口响应: $fix_resp"

# 3. 再次检查admin用户状态
echo "3. 再次检查admin用户状态..."
resp2=$(curl -s -X POST "$BASE_URL/api/auth/login" -H "Content-Type: application/json" -d "$login_data")
echo "修复后登录响应: $resp2" 