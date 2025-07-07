#!/bin/bash

# 测试职位更新功能
echo "🔍 测试职位更新功能..."

# 获取token
TOKEN=$(curl -s -X POST "http://localhost:8070/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"zhangsan@hkex.com","password":"user123"}' | \
  grep -o '"data":{[^}]*"token":"[^"]*"' | \
  grep -o '"token":"[^"]*"' | \
  cut -d':' -f2 | \
  sed 's/[\"]//g')

echo "✅ 获取token成功"

# 获取第一个用户的信息
USER_INFO=$(curl -s -X GET "http://localhost:8070/api/users?size=1" \
  -H "Authorization: Bearer $TOKEN" | \
  jq '.data.content[0]')

USER_ID=$(echo "$USER_INFO" | jq -r '.id')
CURRENT_POSITION=$(echo "$USER_INFO" | jq -r '.position')
USER_NAME=$(echo "$USER_INFO" | jq -r '.userName')

echo "👤 用户信息:"
echo "  ID: $USER_ID"
echo "  姓名: $USER_NAME"
echo "  当前职位: $CURRENT_POSITION"

# 测试更新职位
NEW_POSITION="高级软件工程师"
echo "🔄 正在更新职位为: $NEW_POSITION"

UPDATE_RESPONSE=$(curl -s -X PUT "http://localhost:8070/api/users/$USER_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"employeeId\": \"$(echo "$USER_INFO" | jq -r '.employeeId')\",
    \"userName\": \"$USER_NAME\",
    \"email\": \"$(echo "$USER_INFO" | jq -r '.email')\",
    \"phone\": \"$(echo "$USER_INFO" | jq -r '.phone')\",
    \"department\": \"$(echo "$USER_INFO" | jq -r '.department')\",
    \"position\": \"$NEW_POSITION\",
    \"userType\": \"$(echo "$USER_INFO" | jq -r '.userType')\",
    \"status\": \"$(echo "$USER_INFO" | jq -r '.status')\",
    \"manager\": \"$(echo "$USER_INFO" | jq -r '.manager')\",
    \"workLocation\": \"$(echo "$USER_INFO" | jq -r '.workLocation')\",
    \"emergencyContact\": \"$(echo "$USER_INFO" | jq -r '.emergencyContact')\",
    \"emergencyPhone\": \"$(echo "$USER_INFO" | jq -r '.emergencyPhone')\",
    \"notes\": \"$(echo "$USER_INFO" | jq -r '.notes')\"
  }")

echo "📤 更新请求响应:"
echo "$UPDATE_RESPONSE" | jq '.'

# 验证更新结果
UPDATED_USER=$(curl -s -X GET "http://localhost:8070/api/users/$USER_ID" \
  -H "Authorization: Bearer $TOKEN" | \
  jq '.data')

UPDATED_POSITION=$(echo "$UPDATED_USER" | jq -r '.position')

echo "📋 更新后用户信息:"
echo "  新职位: $UPDATED_POSITION"

if [ "$UPDATED_POSITION" = "$NEW_POSITION" ]; then
    echo "✅ 职位更新成功！"
else
    echo "❌ 职位更新失败！"
    echo "  期望: $NEW_POSITION"
    echo "  实际: $UPDATED_POSITION"
fi

# 恢复原职位
echo "🔄 恢复原职位: $CURRENT_POSITION"

RESTORE_RESPONSE=$(curl -s -X PUT "http://localhost:8070/api/users/$USER_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"employeeId\": \"$(echo "$USER_INFO" | jq -r '.employeeId')\",
    \"userName\": \"$USER_NAME\",
    \"email\": \"$(echo "$USER_INFO" | jq -r '.email')\",
    \"phone\": \"$(echo "$USER_INFO" | jq -r '.phone')\",
    \"department\": \"$(echo "$USER_INFO" | jq -r '.department')\",
    \"position\": \"$CURRENT_POSITION\",
    \"userType\": \"$(echo "$USER_INFO" | jq -r '.userType')\",
    \"status\": \"$(echo "$USER_INFO" | jq -r '.status')\",
    \"manager\": \"$(echo "$USER_INFO" | jq -r '.manager')\",
    \"workLocation\": \"$(echo "$USER_INFO" | jq -r '.workLocation')\",
    \"emergencyContact\": \"$(echo "$USER_INFO" | jq -r '.emergencyContact')\",
    \"emergencyPhone\": \"$(echo "$USER_INFO" | jq -r '.emergencyPhone')\",
    \"notes\": \"$(echo "$USER_INFO" | jq -r '.notes')\"
  }")

echo "✅ 测试完成！" 