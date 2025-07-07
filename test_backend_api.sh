#!/bin/bash

# 后端API完成度测试脚本 (升级版)
# 支持自动登录并带token测试所有接口

set -e

# 配置
BASE_URL="${1:-http://localhost:8070}"
TIMEOUT=10
RESULTS_FILE="api_test_results.txt"
ADMIN_EMAIL="zhangsan@hkex.com"
ADMIN_PASSWORD="user123"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 计数器
TOTAL=0
PASSED=0
FAILED=0
SKIPPED=0
ERRORS=0

# token变量
ACCESS_TOKEN=""

# 测试结果数组
declare -a RESULTS

# 日志函数
log() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
    ((PASSED++))
    ((TOTAL++))
    RESULTS+=("✅ $1")
}

fail() {
    echo -e "${RED}❌ $1${NC}"
    ((FAILED++))
    ((TOTAL++))
    RESULTS+=("❌ $1")
}

skip() {
    echo -e "${YELLOW}⏭️  $1${NC}"
    ((SKIPPED++))
    ((TOTAL++))
    RESULTS+=("⏭️  $1")
}

error() {
    echo -e "${RED}💥 $1${NC}"
    ((ERRORS++))
    ((TOTAL++))
    RESULTS+=("💥 $1")
}

# 自动登录获取token
get_token() {
    log "🔑 正在登录获取token..."
    local login_data="{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\",\"rememberMe\":false}"
    local resp=$(curl -s -X POST "$BASE_URL/api/auth/login" -H "Content-Type: application/json" -d "$login_data")
    
    # 调试：显示完整响应
    log "🔍 登录响应: $resp"
    
    # 尝试多种方式提取token
    # 首先尝试从data.token中提取（标准格式）
    ACCESS_TOKEN=$(echo "$resp" | grep -o '"data":{[^}]*"token":"[^"]*"' | grep -o '"token":"[^"]*"' | cut -d':' -f2 | sed 's/[\"]//g')
    if [ -z "$ACCESS_TOKEN" ]; then
        # 尝试直接从根级别提取token
        ACCESS_TOKEN=$(echo "$resp" | grep -o '"token":"[^"]*"' | head -n1 | cut -d':' -f2 | sed 's/[\"]//g')
    fi
    if [ -z "$ACCESS_TOKEN" ]; then
        # 尝试从accessToken中提取
        ACCESS_TOKEN=$(echo "$resp" | grep -o '"accessToken":"[^"]*"' | head -n1 | cut -d':' -f2 | sed 's/[\"]//g')
    fi
    
    if [ -z "$ACCESS_TOKEN" ]; then
        echo -e "${RED}登录失败，无法获取token，部分接口将无法测试！${NC}"
        echo -e "${RED}请检查用户 $ADMIN_EMAIL 是否存在且密码正确${NC}"
    else
        echo -e "${GREEN}登录成功，已获取token: ${ACCESS_TOKEN:0:20}...${NC}"
    fi
}

# 通用接口测试函数，支持带token
# $1: method, $2: path, $3: desc, $4: data, $5: need_auth (1=需要认证)
test_endpoint() {
    local method="$1"
    local path="$2"
    local desc="$3"
    local data="$4"
    local need_auth="$5"
    local url="$BASE_URL$path"
    local full_desc="$method $path - $desc"
    local curl_cmd="curl -s -o /dev/null -w '%{http_code}' --max-time $TIMEOUT"
    curl_cmd+=" -H 'User-Agent: BackendApiTester/1.0'"
    curl_cmd+=" -H 'Content-Type: application/json'"
    if [ "$need_auth" = "1" ] && [ -n "$ACCESS_TOKEN" ]; then
        curl_cmd+=" -H 'Authorization: Bearer $ACCESS_TOKEN'"
    fi
    if [ "$method" = "POST" ] || [ "$method" = "PUT" ]; then
        if [ -n "$data" ]; then
            curl_cmd+=" -X ${method} -d '${data}'"
        else
            curl_cmd+=" -X ${method}"
        fi
    else
        curl_cmd+=" -X ${method}"
    fi
    curl_cmd+=" '${url}'"
    local response_code
    local start_time=$(date +%s.%N)
    if response_code=$(eval $curl_cmd 2>/dev/null); then
        local end_time=$(date +%s.%N)
        local response_time=$(echo "$end_time - $start_time" | bc -l 2>/dev/null || echo "0")
        case $response_code in
            200|201)
                success "${full_desc} (${response_code}) - ${response_time}s"
                ;;
            401)
                fail "${full_desc} (${response_code}) - 认证失败"
                ;;
            404)
                fail "${full_desc} (${response_code}) - 接口不存在"
                ;;
            *)
                fail "${full_desc} (${response_code}) - 其他错误"
                ;;
        esac
    else
        error "${full_desc} - 连接失败"
    fi
}

# 测试认证相关接口
# 这些接口不需要token
# $5: need_auth=0

test_auth_apis() {
    log "🔐 测试认证相关接口..."
    local login_data='{"email":"test@example.com","password":"password123","rememberMe":false}'
    test_endpoint "POST" "/api/auth/login" "用户登录" "$login_data" 0
    test_endpoint "POST" "/api/auth/refresh?refreshToken=test_refresh_token" "Token刷新" "" 0
}

# 测试用户管理接口
# 这些接口需要token
# $5: need_auth=1
test_user_apis() {
    log "👥 测试用户管理接口..."
    test_endpoint "GET" "/api/users?size=100" "获取用户列表" "" 1
    local user_data='{"employeeId":"TEST001","userName":"测试用户","email":"test@example.com","phone":"13800138000","department":"测试部门","position":"测试职位","userType":"员工","status":"在职"}'
    test_endpoint "POST" "/api/users" "创建用户" "$user_data" 1
    local update_data='{"userName":"更新后的用户名","email":"updated@example.com"}'
    test_endpoint "PUT" "/api/users/1" "更新用户" "$update_data" 1
    test_endpoint "DELETE" "/api/users/1" "删除用户" "" 1
    
    # 测试用户导入接口（使用文件上传）
    log "📁 测试用户导入接口..."
    local import_url="$BASE_URL/api/users/import"
    local curl_cmd="curl -s -o /dev/null -w '%{http_code}' --max-time $TIMEOUT"
    curl_cmd+=" -H 'User-Agent: BackendApiTester/1.0'"
    if [ -n "$ACCESS_TOKEN" ]; then
        curl_cmd+=" -H 'Authorization: Bearer $ACCESS_TOKEN'"
    fi
    curl_cmd+=" -F 'file=@fronted/public/templates/test-users.csv'"
    curl_cmd+=" -X POST '${import_url}'"
    
    local response_code
    local start_time=$(date +%s.%N)
    if response_code=$(eval $curl_cmd 2>/dev/null); then
        local end_time=$(date +%s.%N)
        local response_time=$(echo "$end_time - $start_time" | bc -l 2>/dev/null || echo "0")
        case $response_code in
            200|201)
                success "POST /api/users/import - 用户批量导入 (${response_code}) - ${response_time}s"
                ;;
            401)
                fail "POST /api/users/import - 用户批量导入 (${response_code}) - 认证失败"
                ;;
            404)
                fail "POST /api/users/import - 用户批量导入 (${response_code}) - 接口不存在"
                ;;
            *)
                fail "POST /api/users/import - 用户批量导入 (${response_code}) - 其他错误"
                ;;
        esac
    else
        error "POST /api/users/import - 用户批量导入 - 连接失败"
    fi
}

# 测试数据库相关接口
# 这些接口不需要token
test_database_apis() {
    log "🗄️ 测试数据库相关接口..."
    test_endpoint "GET" "/api/database/test-connection" "数据库连接测试" "" 0
    test_endpoint "GET" "/api/database/health" "数据库健康检查" "" 0
    local jpa_data='{"testType":"basic","entityName":"TestEntity"}'
    test_endpoint "POST" "/api/database/test-jpa" "JPA功能测试" "$jpa_data" 0
    test_endpoint "GET" "/api/database/test-data" "获取测试数据" "" 0
    test_endpoint "DELETE" "/api/database/clear-test-data" "清空测试数据" "" 0
}

# 测试集成管理接口
# 这些接口不需要token
test_integration_apis() {
    log "🔗 测试集成管理接口..."
    test_endpoint "GET" "/api/integrations" "获取所有集成配置" "" 0
    local config_data='{"name":"测试集成","type":"auth","provider":"test","endpoint":"http://test.example.com","authType":"basic"}'
    test_endpoint "POST" "/api/integrations" "创建集成配置" "$config_data" 0
    test_endpoint "GET" "/api/integrations/config-1" "获取单个集成配置" "" 0
    local update_config='{"name":"更新后的集成配置"}'
    test_endpoint "PUT" "/api/integrations/config-1" "更新集成配置" "$update_config" 0
    test_endpoint "DELETE" "/api/integrations/config-1" "删除集成配置" "" 0
    test_endpoint "POST" "/api/integrations/config-1/test-connection" "连接测试" "" 0
    test_endpoint "GET" "/api/integrations/config-1/test-connection" "获取测试历史" "" 0
    local sync_data='{"configId":"config-1","syncType":"incremental"}'
    test_endpoint "POST" "/api/integrations/sync" "启动同步" "$sync_data" 0
    test_endpoint "GET" "/api/integrations/sync" "获取同步历史" "" 0
    test_endpoint "DELETE" "/api/integrations/sync?syncId=sync-1" "取消同步" "" 0
    test_endpoint "GET" "/api/integrations/monitor" "获取监控数据" "" 0
    local monitor_data='{"configIds":["config-1"]}'
    test_endpoint "POST" "/api/integrations/monitor" "刷新监控数据" "$monitor_data" 0
    test_endpoint "GET" "/api/integrations/stats" "获取统计数据" "" 0
    local stats_data='{"dateRange":{"start":"2024-01-01","end":"2024-01-31"}}'
    test_endpoint "POST" "/api/integrations/stats" "重新计算统计数据" "$stats_data" 0
}

# 测试健康检查接口
test_health_api() {
    log "🏥 测试健康检查接口..."
    test_endpoint "GET" "/api/health" "应用健康检查" "" 0
}

# 打印结果汇总
print_summary() {
    echo
    echo "=================================================================================="
    echo "📊 测试结果汇总"
    echo "=================================================================================="
    echo "📍 目标地址: ${BASE_URL}"
    echo "⏱️  超时时间: ${TIMEOUT}秒"
    echo "📈 总计: ${TOTAL} 个接口"
    echo "✅ 通过: ${PASSED} 个"
    echo "❌ 失败: ${FAILED} 个"
    echo "⏭️  跳过: ${SKIPPED} 个"
    echo "💥 错误: ${ERRORS} 个"
    if [ $TOTAL -gt 0 ]; then
        local completion_rate=$(echo "scale=1; $PASSED * 100 / $TOTAL" | bc -l 2>/dev/null || echo "0")
        echo "🎯 完成度: ${completion_rate}%"
    fi
    echo
    echo "📋 详细结果:"
    echo "----------------------------------------------------------------------------------"
    for result in "${RESULTS[@]}"; do
        echo "$result"
    done
    {
        echo "后端API完成度测试结果"
        echo "测试时间: $(date)"
        echo "目标地址: ${BASE_URL}"
        echo "总计: ${TOTAL} 个接口"
        echo "通过: ${PASSED} 个"
        echo "失败: ${FAILED} 个"
        echo "跳过: ${SKIPPED} 个"
        echo "错误: ${ERRORS} 个"
        if [ $TOTAL -gt 0 ]; then
            local completion_rate=$(echo "scale=1; $PASSED * 100 / $TOTAL" | bc -l 2>/dev/null || echo "0")
            echo "完成度: ${completion_rate}%"
        fi
        echo
        echo "详细结果:"
        for result in "${RESULTS[@]}"; do
            echo "$result"
        done
    } > "$RESULTS_FILE"
    echo
    echo "💾 测试结果已保存到: ${RESULTS_FILE}"
}

# 检查依赖
check_dependencies() {
    if ! command -v curl &> /dev/null; then
        echo "❌ curl 未安装，请安装后重试"
        exit 1
    fi
    if ! command -v bc &> /dev/null; then
        echo "⚠️  bc 未安装，响应时间计算可能不准确"
    fi
}

# 主流程
main() {
    check_dependencies
    get_token
    test_health_api
    test_auth_apis
    test_user_apis
    test_database_apis
    test_integration_apis
    print_summary
}

main "$@"

# 显示帮助信息
show_help() {
    echo "后端API完成度测试脚本"
    echo
    echo "用法: $0 [后端地址]"
    echo
    echo "参数:"
    echo "  后端地址    后端服务地址 (默认: http://localhost:8070)"
    echo
    echo "示例:"
    echo "  $0                           # 测试默认地址"
    echo "  $0 http://localhost:8080     # 测试指定地址"
    echo
    echo "输出:"
    echo "  控制台显示测试结果"
    echo "  结果文件: ${RESULTS_FILE}"
}

# 处理命令行参数
case "${1:-}" in
    -h|--help)
        show_help
        exit 0
        ;;
    *)
        main
        ;;
esac 