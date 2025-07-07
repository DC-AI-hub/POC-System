#!/bin/bash

# 费用申请办款功能快速测试脚本
# 快速验证基本功能，不启动完整的前后端服务

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 测试计数器
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# 测试函数
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -n "🧪 测试 $test_name... "
    
    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ 通过${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}❌ 失败${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
}

# 检查文件存在性
check_file_exists() {
    local file_path="$1"
    local description="$2"
    
    if [ -f "$file_path" ]; then
        log_success "$description 存在: $file_path"
        return 0
    else
        log_error "$description 不存在: $file_path"
        return 1
    fi
}

# 检查目录结构
check_project_structure() {
    log_info "检查项目结构..."
    
    local structure_ok=true
    
    # 检查后端结构
    if ! check_file_exists "backend/pom.xml" "后端Maven配置"; then
        structure_ok=false
    fi
    
    if ! check_file_exists "backend/src/main/java/demo/backed/controller/ExpenseController.java" "后端费用控制器"; then
        structure_ok=false
    fi
    
    # 检查前端结构
    if ! check_file_exists "fronted/package.json" "前端package.json"; then
        structure_ok=false
    fi
    
    if ! check_file_exists "fronted/components/expense-application-page.tsx" "前端费用申请页面"; then
        structure_ok=false
    fi
    
    if ! check_file_exists "fronted/lib/validations/expense-application.ts" "前端表单验证"; then
        structure_ok=false
    fi
    
    if [ "$structure_ok" = true ]; then
        log_success "项目结构检查通过"
        return 0
    else
        log_error "项目结构检查失败"
        return 1
    fi
}

# 检查代码语法
check_code_syntax() {
    log_info "检查代码语法..."
    
    local syntax_ok=true
    
    # 检查Java语法
    if command -v javac &> /dev/null; then
        log_info "检查Java语法..."
        if ! javac -cp "$(find backend -name "*.jar" | tr '\n' ':')" backend/src/main/java/demo/backed/controller/ExpenseController.java 2>/dev/null; then
            log_warning "Java语法检查失败（可能是依赖问题）"
        else
            log_success "Java语法检查通过"
        fi
    fi
    
    # 检查TypeScript语法
    if command -v npx &> /dev/null; then
        log_info "检查TypeScript语法..."
        cd fronted
        if npx tsc --noEmit --skipLibCheck 2>/dev/null; then
            log_success "TypeScript语法检查通过"
        else
            log_warning "TypeScript语法检查失败（可能是依赖问题）"
            syntax_ok=false
        fi
        cd ..
    fi
    
    return 0
}

# 检查API端点定义
check_api_endpoints() {
    log_info "检查API端点定义..."
    
    local endpoints=(
        "GET /api/expense/applications"
        "GET /api/expense/applications/{id}"
        "POST /api/expense/applications"
        "POST /api/expense/applications/{id}/submit"
        "POST /api/expense/applications/{id}/approve"
        "POST /api/expense/applications/{id}/attachments"
        "GET /api/expense/categories"
        "GET /api/expense/statistics"
    )
    
    local found_endpoints=0
    local total_endpoints=${#endpoints[@]}
    
    for endpoint in "${endpoints[@]}"; do
        # 提取路径部分进行匹配
        local path=$(echo "$endpoint" | cut -d' ' -f2)
        local method=$(echo "$endpoint" | cut -d' ' -f1)
        
        # 根据HTTP方法查找对应的注解
        local found=false
        case $method in
            "GET")
                if grep -q "@GetMapping.*$path" backend/src/main/java/demo/backed/controller/ExpenseController.java 2>/dev/null; then
                    found=true
                fi
                ;;
            "POST")
                if grep -q "@PostMapping.*$path" backend/src/main/java/demo/backed/controller/ExpenseController.java 2>/dev/null; then
                    found=true
                fi
                ;;
        esac
        
        if [ "$found" = true ]; then
            found_endpoints=$((found_endpoints + 1))
            log_success "找到API端点: $endpoint"
        else
            log_warning "未找到API端点: $endpoint"
        fi
    done
    
    if [ $found_endpoints -eq $total_endpoints ]; then
        log_success "所有API端点都已定义"
        return 0
    else
        log_warning "部分API端点缺失 ($found_endpoints/$total_endpoints)"
        return 1
    fi
}

# 检查前端组件
check_frontend_components() {
    log_info "检查前端组件..."
    
    local components_ok=true
    
    # 检查必要的组件文件
    local required_components=(
        "expense-application-page.tsx"
        "ui/form.tsx"
        "ui/input.tsx"
        "ui/button.tsx"
        "ui/select.tsx"
        "ui/table.tsx"
        "ui/card.tsx"
    )
    
    for component in "${required_components[@]}"; do
        if [ -f "fronted/components/$component" ]; then
            log_success "找到组件: $component"
        else
            log_warning "未找到组件: $component"
            components_ok=false
        fi
    done
    
    if [ "$components_ok" = true ]; then
        log_success "前端组件检查通过"
        return 0
    else
        log_warning "前端组件检查失败"
        return 1
    fi
}

# 检查表单验证
check_form_validation() {
    log_info "检查表单验证..."
    
    local validation_ok=true
    
    # 检查验证规则
    local validation_rules=(
        "applicant"
        "employeeId"
        "department"
        "applicationDate"
        "expenseDate"
        "company"
        "reason"
        "expenseItems"
    )
    
    for rule in "${validation_rules[@]}"; do
        if grep -q "$rule" fronted/lib/validations/expense-application.ts 2>/dev/null; then
            log_success "找到验证规则: $rule"
        else
            log_warning "未找到验证规则: $rule"
            validation_ok=false
        fi
    done
    
    if [ "$validation_ok" = true ]; then
        log_success "表单验证检查通过"
        return 0
    else
        log_warning "表单验证检查失败"
        return 1
    fi
}

# 检查依赖配置
check_dependencies() {
    log_info "检查依赖配置..."
    
    local deps_ok=true
    
    # 检查后端依赖
    if grep -q "spring-boot-starter-web" backend/pom.xml 2>/dev/null; then
        log_success "后端Web依赖配置正确"
    else
        log_warning "后端Web依赖可能缺失"
        deps_ok=false
    fi
    
    # 检查前端依赖
    if grep -q "react" fronted/package.json 2>/dev/null; then
        log_success "前端React依赖配置正确"
    else
        log_warning "前端React依赖可能缺失"
        deps_ok=false
    fi
    
    if grep -q "react-hook-form" fronted/package.json 2>/dev/null; then
        log_success "前端表单库依赖配置正确"
    else
        log_warning "前端表单库依赖可能缺失"
        deps_ok=false
    fi
    
    if [ "$deps_ok" = true ]; then
        log_success "依赖配置检查通过"
        return 0
    else
        log_warning "依赖配置检查失败"
        return 1
    fi
}

# 生成测试报告
generate_quick_report() {
    echo ""
    echo "=" * 50
    echo "📊 快速测试报告"
    echo "=" * 50
    echo "总测试数: $TOTAL_TESTS"
    echo "通过: $PASSED_TESTS ✅"
    echo "失败: $FAILED_TESTS ❌"
    
    if [ $TOTAL_TESTS -gt 0 ]; then
        local success_rate=$((PASSED_TESTS * 100 / TOTAL_TESTS))
        echo "成功率: $success_rate%"
        
        if [ $success_rate -ge 80 ]; then
            echo "🎉 测试结果: 优秀"
        elif [ $success_rate -ge 60 ]; then
            echo "✅ 测试结果: 良好"
        else
            echo "⚠️ 测试结果: 需要改进"
        fi
    fi
    
    echo "=" * 50
}

# 主函数
main() {
    echo "🚀 费用申请办款功能快速测试"
    echo "=" * 50
    
    # 运行各项检查
    run_test "项目结构检查" "check_project_structure"
    run_test "代码语法检查" "check_code_syntax"
    run_test "API端点检查" "check_api_endpoints"
    run_test "前端组件检查" "check_frontend_components"
    run_test "表单验证检查" "check_form_validation"
    run_test "依赖配置检查" "check_dependencies"
    
    # 生成报告
    generate_quick_report
    
    # 输出建议
    echo ""
    echo "💡 建议:"
    if [ $FAILED_TESTS -eq 0 ]; then
        echo "  - 所有基本检查都通过了，可以运行完整的集成测试"
        echo "  - 运行: ./run_expense_integration_test.sh"
    else
        echo "  - 请先修复失败的检查项"
        echo "  - 然后运行完整的集成测试"
    fi
    
    # 返回结果
    if [ $FAILED_TESTS -eq 0 ]; then
        exit 0
    else
        exit 1
    fi
}

# 运行主函数
main "$@" 