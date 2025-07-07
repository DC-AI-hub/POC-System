#!/bin/bash

# POC系统认证测试脚本
# 使用方法: ./authenticated_test.sh [base_url] [email] [password]
# 默认参数: http://localhost:8070 admin@hkex.com admin123

BASE_URL=${1:-http://localhost:8070}
EMAIL=${2:-admin@hkex.com}
PASSWORD=${3:-admin123}

echo "开始认证测试POC系统"
echo "基础URL: $BASE_URL"
echo "登录邮箱: $EMAIL"
echo "=================================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 测试计数器
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# 存储认证令牌
AUTH_TOKEN=""

# 登录函数
login() {
    echo -e "${BLUE}正在登录...${NC}"
    
    local login_response=$(curl -s -X POST "$BASE_URL/api/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
    
    # 提取token
    AUTH_TOKEN=$(echo "$login_response" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    
    if [ -n "$AUTH_TOKEN" ]; then
        echo -e "${GREEN}✓ 登录成功${NC}"
        echo "Token: ${AUTH_TOKEN:0:50}..."
        return 0
    else
        echo -e "${RED}✗ 登录失败${NC}"
        echo "响应: $login_response"
        return 1
    fi
}

# 测试函数
test_endpoint() {
    local name="$1"
    local method="$2"
    local url="$3"
    local expected_status="$4"
    local data="$5"
    local auth_required="$6"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -n "测试 $name... "
    
    # 构建curl命令
    local curl_cmd="curl -s -w \"%{http_code}\" -o /tmp/response.json"
    
    # 添加认证头
    if [ "$auth_required" = "true" ] && [ -n "$AUTH_TOKEN" ]; then
        curl_cmd="$curl_cmd -H \"Authorization: Bearer $AUTH_TOKEN\""
    fi
    
    # 添加方法
    if [ "$method" = "POST" ]; then
        curl_cmd="$curl_cmd -X POST -H \"Content-Type: application/json\""
        if [ -n "$data" ]; then
            curl_cmd="$curl_cmd -d '$data'"
        fi
    elif [ "$method" = "PUT" ]; then
        curl_cmd="$curl_cmd -X PUT -H \"Content-Type: application/json\""
        if [ -n "$data" ]; then
            curl_cmd="$curl_cmd -d '$data'"
        fi
    fi
    
    # 添加URL
    curl_cmd="$curl_cmd \"$url\""
    
    # 执行请求
    local response=$(eval $curl_cmd)
    local http_code="${response: -3}"
    
    if [ "$http_code" = "$expected_status" ]; then
        echo -e "${GREEN}✓ 通过${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}✗ 失败 (状态码: $http_code, 期望: $expected_status)${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        if [ -f /tmp/response.json ]; then
            echo "响应内容:"
            cat /tmp/response.json | head -3
        fi
    fi
}

# 执行登录
if ! login; then
    echo -e "${RED}登录失败，无法继续测试${NC}"
    exit 1
fi

echo ""
echo "1. 基础功能测试"
echo "----------------"

# 测试Hello接口（无需认证）
test_endpoint "Hello接口" "GET" "$BASE_URL/" "200" "" "false"

# 测试API测试接口（无需认证）
test_endpoint "API测试接口" "GET" "$BASE_URL/api/test" "200" "" "false"

echo ""
echo "2. 认证功能测试"
echo "----------------"

# 测试获取当前用户信息
test_endpoint "获取当前用户信息" "GET" "$BASE_URL/api/auth/userinfo" "200" "" "true"

# 测试验证Token
test_endpoint "验证Token" "GET" "$BASE_URL/api/auth/verify" "200" "" "true"

echo ""
echo "3. 用户管理测试"
echo "----------------"

# 测试获取用户列表
test_endpoint "获取用户列表" "GET" "$BASE_URL/api/users" "200" "" "true"

# 测试获取单个用户
test_endpoint "获取单个用户" "GET" "$BASE_URL/api/users/1" "200" "" "true"

# 测试创建用户
test_endpoint "创建用户" "POST" "$BASE_URL/api/users" "200" '{"name":"测试用户","email":"test@example.com"}' "true"

echo ""
echo "4. 工作流管理测试"
echo "----------------"

# 测试获取工作流列表
test_endpoint "获取工作流列表" "GET" "$BASE_URL/api/workflow" "200" "" "true"

# 测试获取工作流节点
test_endpoint "获取工作流节点" "GET" "$BASE_URL/api/workflow/1/nodes" "200" "" "true"

echo ""
echo "5. 组织架构管理测试"
echo "----------------"

# 测试获取组织架构树
test_endpoint "获取组织架构树" "GET" "$BASE_URL/api/organization/tree" "200" "" "true"

# 测试获取部门列表
test_endpoint "获取部门列表" "GET" "$BASE_URL/api/organization/departments" "200" "" "true"

# 测试获取岗位列表
test_endpoint "获取岗位列表" "GET" "$BASE_URL/api/organization/positions" "200" "" "true"

# 测试获取在线用户
test_endpoint "获取在线用户" "GET" "$BASE_URL/api/organization/online-users" "200" "" "true"

echo ""
echo "6. 费用申请管理测试"
echo "----------------"

# 测试获取费用申请单列表
test_endpoint "获取费用申请单列表" "GET" "$BASE_URL/api/expense/applications" "200" "" "true"

# 测试获取费用科目
test_endpoint "获取费用科目" "GET" "$BASE_URL/api/expense/categories" "200" "" "true"

# 测试获取报销统计
test_endpoint "获取报销统计" "GET" "$BASE_URL/api/expense/statistics" "200" "" "true"

echo ""
echo "7. 代理人设置测试"
echo "----------------"

# 测试获取代理设置列表
test_endpoint "获取代理设置列表" "GET" "$BASE_URL/api/proxy/settings" "200" "" "true"

# 测试获取可代理权限列表
test_endpoint "获取可代理权限列表" "GET" "$BASE_URL/api/proxy/available-permissions" "200" "" "true"

echo ""
echo "8. 日志管理测试"
echo "----------------"

# 测试获取系统日志
test_endpoint "获取系统日志" "GET" "$BASE_URL/api/logs/system?page=0&size=10" "200" "" "true"

# 测试获取安全日志
test_endpoint "获取安全日志" "GET" "$BASE_URL/api/logs/security?page=0&size=10" "200" "" "true"

# 测试获取审计日志
test_endpoint "获取审计日志" "GET" "$BASE_URL/api/logs/audit?page=0&size=10" "200" "" "true"

# 测试获取日志统计
test_endpoint "获取日志统计" "GET" "$BASE_URL/api/logs/statistics" "200" "" "true"

echo ""
echo "9. 登出测试"
echo "----------------"

# 测试登出
test_endpoint "用户登出" "POST" "$BASE_URL/api/auth/logout" "200" "" "true"

echo ""
echo "=================================="
echo "测试完成！"
echo "总测试数: $TOTAL_TESTS"
echo -e "通过: ${GREEN}$PASSED_TESTS${NC}"
echo -e "失败: ${RED}$FAILED_TESTS${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}🎉 所有测试通过！系统功能完整。${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  有 $FAILED_TESTS 个测试失败，请检查系统状态。${NC}"
    exit 1
fi 