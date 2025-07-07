#!/bin/bash

# JWT Token测试脚本
BASE_URL="http://localhost:8070"
ADMIN_EMAIL="admin@hkex.com"
ADMIN_PASSWORD="admin123"

echo "🔑 测试JWT Token内容..."

# 登录获取token
echo "1. 登录获取token..."
login_data="{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\",\"rememberMe\":false}"
resp=$(curl -s -X POST "$BASE_URL/api/auth/login" -H "Content-Type: application/json" -d "$login_data")
echo "登录响应: $resp"

# 提取token
ACCESS_TOKEN=$(echo "$resp" | grep -o '"token":"[^"]*"' | head -n1 | cut -d':' -f2 | sed 's/[\"]//g')
echo "Token: $ACCESS_TOKEN"

if [ -n "$ACCESS_TOKEN" ]; then
    echo "2. 验证Token..."
    verify_resp=$(curl -s -X GET "$BASE_URL/api/auth/verify" -H "Authorization: Bearer $ACCESS_TOKEN")
    echo "Token验证响应: $verify_resp"
    
    echo "3. 测试用户管理接口..."
    echo "测试创建用户..."
    user_data='{"employeeId":"TEST001","userName":"测试用户","email":"test@example.com","phone":"13800138000","department":"测试部门","position":"测试职位","userType":"员工","status":"在职"}'
    create_resp=$(curl -s -X POST "$BASE_URL/api/users" -H "Content-Type: application/json" -H "Authorization: Bearer $ACCESS_TOKEN" -d "$user_data")
    echo "创建用户响应: $create_resp"
    
    echo "测试更新用户..."
    update_data='{"userName":"更新后的用户名","email":"updated@example.com"}'
    update_resp=$(curl -s -X PUT "$BASE_URL/api/users/1" -H "Content-Type: application/json" -H "Authorization: Bearer $ACCESS_TOKEN" -d "$update_data")
    echo "更新用户响应: $update_resp"
    
    echo "测试删除用户..."
    delete_resp=$(curl -s -X DELETE "$BASE_URL/api/users/1" -H "Authorization: Bearer $ACCESS_TOKEN")
    echo "删除用户响应: $delete_resp"
else
    echo "❌ 无法获取token"
fi 