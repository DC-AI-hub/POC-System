#!/bin/bash

# 快速测试脚本 - 验证API测试工具是否正常工作

echo "🧪 快速测试API测试工具..."

# 检查脚本文件是否存在
if [ ! -f "test_backend_api.sh" ]; then
    echo "❌ 错误: test_backend_api.sh 文件不存在"
    exit 1
fi

if [ ! -f "test_backend_api_completion.py" ]; then
    echo "❌ 错误: test_backend_api_completion.py 文件不存在"
    exit 1
fi

# 检查脚本权限
if [ ! -x "test_backend_api.sh" ]; then
    echo "⚠️  警告: test_backend_api.sh 没有执行权限，正在添加..."
    chmod +x test_backend_api.sh
fi

# 检查依赖
echo "🔍 检查依赖..."

# 检查curl
if command -v curl &> /dev/null; then
    echo "✅ curl 已安装"
else
    echo "❌ curl 未安装，请安装后重试"
    exit 1
fi

# 检查bc
if command -v bc &> /dev/null; then
    echo "✅ bc 已安装"
else
    echo "⚠️  bc 未安装，响应时间计算可能不准确"
fi

# 检查Python
if command -v python3 &> /dev/null; then
    echo "✅ python3 已安装"
    
    # 检查requests模块
    if python3 -c "import requests" 2>/dev/null; then
        echo "✅ requests 模块已安装"
    else
        echo "⚠️  requests 模块未安装，Python脚本可能无法运行"
        echo "   安装命令: pip install requests"
    fi
else
    echo "⚠️  python3 未安装，Python脚本无法运行"
fi

echo
echo "🚀 开始测试..."

# 测试一个不存在的地址来验证工具是否正常工作
echo "📡 测试连接到一个不存在的地址 (应该显示连接失败)..."
./test_backend_api.sh http://localhost:9999 2>/dev/null || true

echo
echo "✅ 快速测试完成！"
echo
echo "📋 使用方法:"
echo "  ./test_backend_api.sh                    # 测试默认地址 (localhost:8070)"
echo "  ./test_backend_api.sh http://localhost:8080  # 测试指定地址"
echo "  python3 test_backend_api_completion.py   # 使用Python版本"
echo
echo "📖 详细说明请查看: API_TEST_README.md" 