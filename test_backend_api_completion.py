#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
后端API完成度测试脚本
测试前端调用的所有接口是否在后端正确实现
"""

import requests
import json
import time
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from enum import Enum
import sys

class TestStatus(Enum):
    PASS = "✅ 通过"
    FAIL = "❌ 失败"
    SKIP = "⏭️  跳过"
    ERROR = "💥 错误"

@dataclass
class ApiTestResult:
    endpoint: str
    method: str
    status: TestStatus
    response_code: Optional[int] = None
    response_time: Optional[float] = None
    error_message: Optional[str] = None
    description: str = ""

class BackendApiTester:
    def __init__(self, base_url: str = "http://localhost:8070", timeout: int = 10):
        self.base_url = base_url.rstrip('/')
        self.timeout = timeout
        self.session = requests.Session()
        self.results: List[ApiTestResult] = []
        
        # 设置通用请求头
        self.session.headers.update({
            'Content-Type': 'application/json',
            'User-Agent': 'BackendApiTester/1.0'
        })
    
    def test_endpoint(self, method: str, endpoint: str, 
                     data: Optional[Dict] = None, 
                     headers: Optional[Dict] = None,
                     description: str = "",
                     expected_status: int = 200) -> ApiTestResult:
        """测试单个接口"""
        url = f"{self.base_url}{endpoint}"
        full_description = f"{method} {endpoint}"
        if description:
            full_description += f" - {description}"
        
        try:
            start_time = time.time()
            
            if method.upper() == 'GET':
                response = self.session.get(url, timeout=self.timeout, headers=headers)
            elif method.upper() == 'POST':
                response = self.session.post(url, json=data, timeout=self.timeout, headers=headers)
            elif method.upper() == 'PUT':
                response = self.session.put(url, json=data, timeout=self.timeout, headers=headers)
            elif method.upper() == 'DELETE':
                response = self.session.delete(url, timeout=self.timeout, headers=headers)
            else:
                return ApiTestResult(
                    endpoint=endpoint,
                    method=method,
                    status=TestStatus.ERROR,
                    error_message=f"不支持的HTTP方法: {method}",
                    description=full_description
                )
            
            response_time = time.time() - start_time
            
            # 判断测试结果
            if response.status_code == expected_status:
                status = TestStatus.PASS
            elif response.status_code == 404:
                status = TestStatus.FAIL
            elif response.status_code == 401:
                status = TestStatus.SKIP  # 需要认证的接口跳过
            else:
                status = TestStatus.FAIL
            
            result = ApiTestResult(
                endpoint=endpoint,
                method=method,
                status=status,
                response_code=response.status_code,
                response_time=response_time,
                description=full_description
            )
            
        except requests.exceptions.ConnectionError:
            result = ApiTestResult(
                endpoint=endpoint,
                method=method,
                status=TestStatus.ERROR,
                error_message="连接失败 - 后端服务可能未启动",
                description=full_description
            )
        except requests.exceptions.Timeout:
            result = ApiTestResult(
                endpoint=endpoint,
                method=method,
                status=TestStatus.ERROR,
                error_message="请求超时",
                description=full_description
            )
        except Exception as e:
            result = ApiTestResult(
                endpoint=endpoint,
                method=method,
                status=TestStatus.ERROR,
                error_message=str(e),
                description=full_description
            )
        
        self.results.append(result)
        return result
    
    def test_auth_apis(self):
        """测试认证相关接口"""
        print("\n🔐 测试认证相关接口...")
        
        # 登录接口
        login_data = {
            "email": "test@example.com",
            "password": "password123",
            "rememberMe": False
        }
        self.test_endpoint("POST", "/api/auth/login", data=login_data, description="用户登录")
        
        # Token刷新接口
        refresh_data = {
            "refreshToken": "test_refresh_token"
        }
        self.test_endpoint("POST", "/api/auth/refresh", data=refresh_data, description="Token刷新")
    
    def test_user_apis(self):
        """测试用户管理接口"""
        print("\n👥 测试用户管理接口...")
        
        # 获取用户列表
        self.test_endpoint("GET", "/api/users?size=100", description="获取用户列表")
        
        # 创建用户
        user_data = {
            "employeeId": "TEST001",
            "userName": "测试用户",
            "email": "test@example.com",
            "phone": "13800138000",
            "department": "测试部门",
            "position": "测试职位",
            "userType": "full-time",
            "status": "active"
        }
        self.test_endpoint("POST", "/api/users", data=user_data, description="创建用户")
        
        # 更新用户
        update_data = {
            "userName": "更新后的用户名",
            "email": "updated@example.com"
        }
        self.test_endpoint("PUT", "/api/users/1", data=update_data, description="更新用户")
        
        # 删除用户
        self.test_endpoint("DELETE", "/api/users/1", description="删除用户")
        
        # 用户导入
        # 注意：这个接口需要文件上传，这里只测试接口是否存在
        self.test_endpoint("POST", "/api/users/import", description="用户批量导入")
    
    def test_database_apis(self):
        """测试数据库相关接口"""
        print("\n🗄️ 测试数据库相关接口...")
        
        # 数据库连接测试
        self.test_endpoint("GET", "/api/database/test-connection", description="数据库连接测试")
        
        # 数据库健康检查
        self.test_endpoint("GET", "/api/database/health", description="数据库健康检查")
        
        # JPA功能测试
        jpa_data = {
            "testType": "basic",
            "entityName": "TestEntity"
        }
        self.test_endpoint("POST", "/api/database/test-jpa", data=jpa_data, description="JPA功能测试")
        
        # 获取测试数据
        self.test_endpoint("GET", "/api/database/test-data", description="获取测试数据")
        
        # 清空测试数据
        self.test_endpoint("DELETE", "/api/database/clear-test-data", description="清空测试数据")
    
    def test_integration_apis(self):
        """测试集成管理接口"""
        print("\n🔗 测试集成管理接口...")
        
        # 获取所有集成配置
        self.test_endpoint("GET", "/api/integrations", description="获取所有集成配置")
        
        # 创建集成配置
        config_data = {
            "name": "测试集成",
            "type": "auth",
            "provider": "test",
            "endpoint": "http://test.example.com",
            "authType": "basic"
        }
        self.test_endpoint("POST", "/api/integrations", data=config_data, description="创建集成配置")
        
        # 获取单个集成配置
        self.test_endpoint("GET", "/api/integrations/config-1", description="获取单个集成配置")
        
        # 更新集成配置
        update_config = {
            "name": "更新后的集成配置"
        }
        self.test_endpoint("PUT", "/api/integrations/config-1", data=update_config, description="更新集成配置")
        
        # 删除集成配置
        self.test_endpoint("DELETE", "/api/integrations/config-1", description="删除集成配置")
        
        # 连接测试
        self.test_endpoint("POST", "/api/integrations/config-1/test-connection", description="连接测试")
        self.test_endpoint("GET", "/api/integrations/config-1/test-connection", description="获取测试历史")
        
        # 同步管理
        sync_data = {
            "configId": "config-1",
            "syncType": "incremental"
        }
        self.test_endpoint("POST", "/api/integrations/sync", data=sync_data, description="启动同步")
        self.test_endpoint("GET", "/api/integrations/sync", description="获取同步历史")
        self.test_endpoint("DELETE", "/api/integrations/sync?syncId=sync-1", description="取消同步")
        
        # 监控管理
        self.test_endpoint("GET", "/api/integrations/monitor", description="获取监控数据")
        monitor_data = {
            "configIds": ["config-1"]
        }
        self.test_endpoint("POST", "/api/integrations/monitor", data=monitor_data, description="刷新监控数据")
        
        # 统计管理
        self.test_endpoint("GET", "/api/integrations/stats", description="获取统计数据")
        stats_data = {
            "dateRange": {
                "start": "2024-01-01",
                "end": "2024-01-31"
            }
        }
        self.test_endpoint("POST", "/api/integrations/stats", data=stats_data, description="重新计算统计数据")
    
    def test_health_api(self):
        """测试健康检查接口"""
        print("\n🏥 测试健康检查接口...")
        self.test_endpoint("GET", "/api/health", description="应用健康检查")
    
    def run_all_tests(self):
        """运行所有测试"""
        print(f"🚀 开始测试后端API完成度...")
        print(f"📍 目标地址: {self.base_url}")
        print(f"⏱️  超时时间: {self.timeout}秒")
        
        # 首先测试健康检查
        self.test_health_api()
        
        # 测试各个模块的接口
        self.test_auth_apis()
        self.test_user_apis()
        self.test_database_apis()
        self.test_integration_apis()
        
        self.print_results()
    
    def print_results(self):
        """打印测试结果"""
        print("\n" + "="*80)
        print("📊 测试结果汇总")
        print("="*80)
        
        # 统计结果
        total = len(self.results)
        passed = sum(1 for r in self.results if r.status == TestStatus.PASS)
        failed = sum(1 for r in self.results if r.status == TestStatus.FAIL)
        skipped = sum(1 for r in self.results if r.status == TestStatus.SKIP)
        errors = sum(1 for r in self.results if r.status == TestStatus.ERROR)
        
        print(f"📈 总计: {total} 个接口")
        print(f"✅ 通过: {passed} 个")
        print(f"❌ 失败: {failed} 个")
        print(f"⏭️  跳过: {skipped} 个")
        print(f"💥 错误: {errors} 个")
        
        if total > 0:
            completion_rate = (passed / total) * 100
            print(f"🎯 完成度: {completion_rate:.1f}%")
        
        print("\n📋 详细结果:")
        print("-"*80)
        
        for result in self.results:
            status_icon = result.status.value
            print(f"{status_icon} {result.description}")
            
            if result.response_code:
                print(f"   状态码: {result.response_code}")
            if result.response_time:
                print(f"   响应时间: {result.response_time:.3f}秒")
            if result.error_message:
                print(f"   错误信息: {result.error_message}")
            print()
        
        # 按状态分组显示
        print("\n📊 按状态分组:")
        print("-"*40)
        
        for status in TestStatus:
            status_results = [r for r in self.results if r.status == status]
            if status_results:
                print(f"\n{status.value} ({len(status_results)}个):")
                for result in status_results:
                    print(f"  - {result.description}")
    
    def export_results(self, filename: str = "api_test_results.json"):
        """导出测试结果到JSON文件"""
        export_data = {
            "test_info": {
                "base_url": self.base_url,
                "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
                "total_tests": len(self.results)
            },
            "results": [
                {
                    "endpoint": r.endpoint,
                    "method": r.method,
                    "status": r.status.value,
                    "response_code": r.response_code,
                    "response_time": r.response_time,
                    "error_message": r.error_message,
                    "description": r.description
                }
                for r in self.results
            ]
        }
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(export_data, f, ensure_ascii=False, indent=2)
        
        print(f"\n💾 测试结果已导出到: {filename}")

def main():
    """主函数"""
    import argparse
    
    parser = argparse.ArgumentParser(description="后端API完成度测试工具")
    parser.add_argument("--url", default="http://localhost:8070", 
                       help="后端服务地址 (默认: http://localhost:8070)")
    parser.add_argument("--timeout", type=int, default=10,
                       help="请求超时时间(秒) (默认: 10)")
    parser.add_argument("--export", action="store_true",
                       help="导出测试结果到JSON文件")
    parser.add_argument("--export-file", default="api_test_results.json",
                       help="导出文件名 (默认: api_test_results.json)")
    
    args = parser.parse_args()
    
    try:
        tester = BackendApiTester(base_url=args.url, timeout=args.timeout)
        tester.run_all_tests()
        
        if args.export:
            tester.export_results(args.export_file)
            
    except KeyboardInterrupt:
        print("\n\n⏹️  测试被用户中断")
        sys.exit(1)
    except Exception as e:
        print(f"\n💥 测试过程中发生错误: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 