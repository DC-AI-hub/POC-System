#!/bin/bash

# 费用申请办款功能联合测试脚本
# 启动前后端服务并执行完整的测试流程

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# 检查依赖
check_dependencies() {
    log_info "检查系统依赖..."
    
    # 检查Java
    if ! command -v java &> /dev/null; then
        log_error "Java未安装，请先安装Java 8或更高版本"
        exit 1
    fi
    
    # 检查Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js未安装，请先安装Node.js 16或更高版本"
        exit 1
    fi
    
    # 检查Python
    if ! command -v python3 &> /dev/null; then
        log_error "Python3未安装，请先安装Python 3.7或更高版本"
        exit 1
    fi
    
    # 检查Docker
    if ! command -v docker &> /dev/null; then
        log_warning "Docker未安装，将使用本地服务模式"
    fi
    
    log_success "依赖检查完成"
}

# 启动后端服务
start_backend() {
    log_info "启动后端服务..."
    
    cd backend
    
    # 检查Maven wrapper是否存在
    if [ -f "./mvnw" ]; then
        log_info "使用Maven wrapper启动后端..."
        ./mvnw spring-boot:run > ../logs/backend.log 2>&1 &
        BACKEND_PID=$!
    else
        log_info "使用Maven启动后端..."
        mvn spring-boot:run > ../logs/backend.log 2>&1 &
        BACKEND_PID=$!
    fi
    
    cd ..
    
    # 等待后端启动
    log_info "等待后端服务启动..."
    for i in {1..30}; do
        if curl -s http://localhost:8070/api/health > /dev/null 2>&1; then
            log_success "后端服务启动成功 (PID: $BACKEND_PID)"
            return 0
        fi
        sleep 2
        echo -n "."
    done
    
    log_error "后端服务启动超时"
    return 1
}

# 启动前端服务
start_frontend() {
    log_info "启动前端服务..."
    
    cd fronted
    
    # 检查是否已安装依赖
    if [ ! -d "node_modules" ]; then
        log_info "安装前端依赖..."
        npm install
    fi
    
    # 启动开发服务器
    log_info "启动前端开发服务器..."
    npm run dev > ../logs/frontend.log 2>&1 &
    FRONTEND_PID=$!
    
    cd ..
    
    # 等待前端启动
    log_info "等待前端服务启动..."
    for i in {1..30}; do
        if curl -s http://localhost:3000 > /dev/null 2>&1; then
            log_success "前端服务启动成功 (PID: $FRONTEND_PID)"
            return 0
        fi
        sleep 2
        echo -n "."
    done
    
    log_error "前端服务启动超时"
    return 1
}

# 安装Python依赖
install_python_deps() {
    log_info "安装Python测试依赖..."
    
    # 检查是否已安装requests
    if ! python3 -c "import requests" 2>/dev/null; then
        log_info "安装requests库..."
        pip3 install requests
    fi
    
    log_success "Python依赖安装完成"
}

# 安装前端测试依赖
install_frontend_test_deps() {
    log_info "安装前端测试依赖..."
    
    cd fronted
    
    # 检查是否已安装puppeteer
    if ! npm list puppeteer > /dev/null 2>&1; then
        log_info "安装Puppeteer..."
        export PUPPETEER_SKIP_DOWNLOAD=true
        npm install --save-dev puppeteer --legacy-peer-deps
    fi
    
    cd ..
    
    log_success "前端测试依赖安装完成"
}

# 运行后端API测试
run_backend_tests() {
    log_info "运行后端API测试..."
    
    if python3 expense_application_integration_test.py; then
        log_success "后端API测试完成"
        return 0
    else
        log_error "后端API测试失败"
        return 1
    fi
}

# 运行前端功能测试
run_frontend_tests() {
    log_info "运行前端功能测试..."
    
    cd fronted
    
    if node ../frontend_expense_test_simple.js; then
        log_success "前端功能测试完成"
        cd ..
        return 0
    else
        log_error "前端功能测试失败"
        cd ..
        return 1
    fi
}

# 生成综合测试报告
generate_integration_report() {
    log_info "生成综合测试报告..."
    
    # 检查测试报告文件是否存在
    if [ -f "expense_application_test_report.json" ] && [ -f "frontend_expense_test_report.json" ]; then
        python3 -c "
import json
import sys
from datetime import datetime

# 读取后端测试报告
with open('expense_application_test_report.json', 'r', encoding='utf-8') as f:
    backend_report = json.load(f)

# 读取前端测试报告
with open('frontend_expense_test_report.json', 'r', encoding='utf-8') as f:
    frontend_report = json.load(f)

# 生成综合报告
integration_report = {
    'test_summary': {
        'backend': backend_report['test_summary'],
        'frontend': frontend_report['test_summary'],
        'overall': {
            'total_tests': backend_report['test_summary']['total'] + frontend_report['test_summary']['total'],
            'total_passed': backend_report['test_summary']['passed'] + frontend_report['test_summary']['passed'],
            'total_failed': backend_report['test_summary']['failed'] + frontend_report['test_summary']['failed'],
            'overall_success_rate': 0
        }
    },
    'test_results': {
        'backend': backend_report['test_results'],
        'frontend': frontend_report['test_results']
    },
    'timestamp': datetime.now().isoformat(),
    'test_type': '费用申请办款功能联合测试'
}

# 计算总体成功率
total_tests = integration_report['test_summary']['overall']['total_tests']
total_passed = integration_report['test_summary']['overall']['total_passed']
if total_tests > 0:
    integration_report['test_summary']['overall']['overall_success_rate'] = (total_passed / total_tests) * 100

# 保存综合报告
with open('expense_integration_test_report.json', 'w', encoding='utf-8') as f:
    json.dump(integration_report, f, ensure_ascii=False, indent=2)

# 打印综合报告摘要
print('=' * 60)
print('📊 费用申请办款功能联合测试综合报告')
print('=' * 60)
print(f'后端测试: {backend_report[\"test_summary\"][\"passed\"]}/{backend_report[\"test_summary\"][\"total\"]} 通过')
print(f'前端测试: {frontend_report[\"test_summary\"][\"passed\"]}/{frontend_report[\"test_summary\"][\"total\"]} 通过')
print(f'总体测试: {total_passed}/{total_tests} 通过')
print(f'总体成功率: {integration_report[\"test_summary\"][\"overall\"][\"overall_success_rate\"]:.1f}%')

if integration_report['test_summary']['overall']['overall_success_rate'] >= 80:
    print('🎉 测试结果: 优秀')
elif integration_report['test_summary']['overall']['overall_success_rate'] >= 60:
    print('✅ 测试结果: 良好')
else:
    print('⚠️ 测试结果: 需要改进')

print('=' * 60)
"
        
        log_success "综合测试报告已生成: expense_integration_test_report.json"
    else
        log_warning "部分测试报告文件缺失，无法生成综合报告"
    fi
}

# 清理函数
cleanup() {
    log_info "清理测试环境..."
    
    # 停止后端服务
    if [ ! -z "$BACKEND_PID" ]; then
        log_info "停止后端服务 (PID: $BACKEND_PID)..."
        kill $BACKEND_PID 2>/dev/null || true
    fi
    
    # 停止前端服务
    if [ ! -z "$FRONTEND_PID" ]; then
        log_info "停止前端服务 (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    
    # 清理临时文件
    rm -f logs/backend.log logs/frontend.log 2>/dev/null || true
    
    log_success "清理完成"
}

# 信号处理
trap cleanup EXIT INT TERM

# 主函数
main() {
    echo "=" * 60
    echo "🚀 费用申请办款功能联合测试"
    echo "=" * 60
    
    # 创建日志目录
    mkdir -p logs
    
    # 检查依赖
    check_dependencies
    
    # 安装依赖
    install_python_deps
    install_frontend_test_deps
    
    # 启动服务
    if ! start_backend; then
        log_error "后端服务启动失败，退出测试"
        exit 1
    fi
    
    if ! start_frontend; then
        log_error "前端服务启动失败，退出测试"
        exit 1
    fi
    
    # 等待服务完全启动
    log_info "等待服务完全启动..."
    sleep 5
    
    # 运行测试
    backend_test_result=0
    frontend_test_result=0
    
    if run_backend_tests; then
        backend_test_result=0
    else
        backend_test_result=1
    fi
    
    if run_frontend_tests; then
        frontend_test_result=0
    else
        frontend_test_result=1
    fi
    
    # 生成综合报告
    generate_integration_report
    
    # 输出最终结果
    echo ""
    echo "=" * 60
    echo "🎯 测试完成"
    echo "=" * 60
    
    if [ $backend_test_result -eq 0 ] && [ $frontend_test_result -eq 0 ]; then
        log_success "所有测试通过！"
        exit 0
    else
        log_error "部分测试失败"
        if [ $backend_test_result -ne 0 ]; then
            log_error "后端测试失败"
        fi
        if [ $frontend_test_result -ne 0 ]; then
            log_error "前端测试失败"
        fi
        exit 1
    fi
}

# 运行主函数
main "$@" 