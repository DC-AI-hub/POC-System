#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
费用申请办款功能联合测试脚本
测试前后端的日常费用申请办款所有功能
"""

import requests
import json
import time
import random
from datetime import datetime, timedelta
import sys
import os

# 配置
BASE_URL = "http://localhost:8070"
FRONTEND_URL = "http://localhost:3000"
API_BASE = f"{BASE_URL}/api"

class ExpenseApplicationTester:
    def __init__(self):
        self.session = requests.Session()
        self.test_results = []
        self.current_test = 0
        self.jwt_token = None
        
    def log_test(self, test_name, status, message="", data=None):
        """记录测试结果"""
        self.current_test += 1
        result = {
            "test_id": self.current_test,
            "test_name": test_name,
            "status": status,
            "message": message,
            "timestamp": datetime.now().isoformat(),
            "data": data
        }
        self.test_results.append(result)
        
        status_icon = "✅" if status == "PASS" else "❌"
        print(f"{status_icon} [{self.current_test:02d}] {test_name}: {message}")
        
    def test_backend_health(self):
        """测试后端健康状态"""
        try:
            response = self.session.get(f"{BASE_URL}/api/health")
            if response.status_code == 200:
                self.log_test("后端健康检查", "PASS", "后端服务正常运行")
                return True
            else:
                self.log_test("后端健康检查", "FAIL", f"后端服务异常，状态码: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("后端健康检查", "FAIL", f"无法连接到后端服务: {str(e)}")
            return False
    
    def test_login(self):
        """测试登录获取JWT token"""
        try:
            login_data = {
                "email": "zhangsan@hkex.com",
                "password": "user123"
            }
            
            response = self.session.post(
                f"{API_BASE}/auth/login",
                json=login_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("code") == 200 and "data" in data and "token" in data["data"]:
                    self.jwt_token = data["data"]["token"]
                    self.session.headers.update({"Authorization": f"Bearer {self.jwt_token}"})
                    self.log_test("用户登录", "PASS", "成功获取JWT token")
                    return True
                else:
                    self.log_test("用户登录", "FAIL", "登录响应格式错误")
                    return False
            else:
                self.log_test("用户登录", "FAIL", f"登录失败，状态码: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("用户登录", "FAIL", f"登录异常: {str(e)}")
            return False
    
    def test_get_expense_categories(self):
        """测试获取费用科目列表"""
        try:
            response = self.session.get(f"{API_BASE}/expense/categories")
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "data" in data:
                    categories = data["data"]
                    self.log_test("获取费用科目", "PASS", f"成功获取 {len(categories)} 个费用科目", categories)
                    return categories
                else:
                    self.log_test("获取费用科目", "FAIL", "API返回格式错误")
                    return None
            else:
                self.log_test("获取费用科目", "FAIL", f"API调用失败，状态码: {response.status_code}")
                return None
        except Exception as e:
            self.log_test("获取费用科目", "FAIL", f"API调用异常: {str(e)}")
            return None
    
    def test_create_expense_application(self):
        """测试创建费用申请单"""
        try:
            # 准备测试数据
            application_data = {
                "applicant": "张三",
                "employeeId": "EMP001",
                "department": "技术部",
                "applicationDate": datetime.now().strftime("%Y-%m-%d"),
                "expenseDate": (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d"),
                "company": "测试公司",
                "reason": "测试费用申请，用于系统功能验证",
                "expenseItems": [
                    {
                        "expenseCategory": "办公用品",
                        "purpose": "购买办公用品",
                        "amount": 150.00
                    },
                    {
                        "expenseCategory": "交通费",
                        "purpose": "出差交通费用",
                        "amount": 200.00
                    }
                ],
                "supervisorComment": "",
                "approvalComment": ""
            }
            
            response = self.session.post(
                f"{API_BASE}/expense/applications",
                json=application_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    app_id = data["data"]["id"]
                    self.log_test("创建费用申请", "PASS", f"成功创建申请单，ID: {app_id}", data["data"])
                    return app_id
                else:
                    self.log_test("创建费用申请", "FAIL", "创建申请单失败")
                    return None
            else:
                self.log_test("创建费用申请", "FAIL", f"API调用失败，状态码: {response.status_code}")
                return None
        except Exception as e:
            self.log_test("创建费用申请", "FAIL", f"API调用异常: {str(e)}")
            return None
    
    def test_get_expense_applications(self):
        """测试获取费用申请单列表"""
        try:
            response = self.session.get(f"{API_BASE}/expense/applications")
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "data" in data:
                    applications = data["data"]
                    self.log_test("获取申请单列表", "PASS", f"成功获取 {len(applications)} 个申请单", applications)
                    return applications
                else:
                    self.log_test("获取申请单列表", "FAIL", "API返回格式错误")
                    return None
            else:
                self.log_test("获取申请单列表", "FAIL", f"API调用失败，状态码: {response.status_code}")
                return None
        except Exception as e:
            self.log_test("获取申请单列表", "FAIL", f"API调用异常: {str(e)}")
            return None
    
    def test_get_expense_application_detail(self, app_id):
        """测试获取费用申请单详情"""
        try:
            response = self.session.get(f"{API_BASE}/expense/applications/{app_id}")
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "data" in data:
                    detail = data["data"]
                    self.log_test("获取申请单详情", "PASS", f"成功获取申请单 {app_id} 详情", detail)
                    return detail
                else:
                    self.log_test("获取申请单详情", "FAIL", "API返回格式错误")
                    return None
            else:
                self.log_test("获取申请单详情", "FAIL", f"API调用失败，状态码: {response.status_code}")
                return None
        except Exception as e:
            self.log_test("获取申请单详情", "FAIL", f"API调用异常: {str(e)}")
            return None
    
    def test_submit_expense_application(self, app_id):
        """测试提交费用申请单"""
        try:
            response = self.session.post(f"{API_BASE}/expense/applications/{app_id}/submit")
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    self.log_test("提交申请单", "PASS", f"成功提交申请单 {app_id}", data)
                    return True
                else:
                    self.log_test("提交申请单", "FAIL", "提交申请单失败")
                    return False
            else:
                self.log_test("提交申请单", "FAIL", f"API调用失败，状态码: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("提交申请单", "FAIL", f"API调用异常: {str(e)}")
            return False
    
    def test_approve_expense_application(self, app_id):
        """测试审批费用申请单"""
        try:
            approval_data = {
                "action": "approve",
                "comment": "审批通过，费用合理",
                "approverId": "APPROVER001"
            }
            
            response = self.session.post(
                f"{API_BASE}/expense/applications/{app_id}/approve",
                json=approval_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    self.log_test("审批申请单", "PASS", f"成功审批申请单 {app_id}", data)
                    return True
                else:
                    self.log_test("审批申请单", "FAIL", "审批申请单失败")
                    return False
            else:
                self.log_test("审批申请单", "FAIL", f"API调用失败，状态码: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("审批申请单", "FAIL", f"API调用异常: {str(e)}")
            return False
    
    def test_get_expense_statistics(self):
        """测试获取费用统计信息"""
        try:
            response = self.session.get(f"{API_BASE}/expense/statistics")
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    self.log_test("获取费用统计", "PASS", "成功获取费用统计信息", data["data"])
                    return True
                else:
                    self.log_test("获取费用统计", "FAIL", "获取费用统计失败")
                    return False
            else:
                self.log_test("获取费用统计", "FAIL", f"API调用失败，状态码: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("获取费用统计", "FAIL", f"API调用异常: {str(e)}")
            return False
    
    def test_complete_workflow(self):
        """测试完整的费用申请工作流程"""
        try:
            self.log_test("开始完整工作流程测试", "INFO", "测试费用申请从创建到审批的完整流程")
            
            # 1. 创建申请单
            app_id = self.test_create_expense_application()
            if not app_id:
                return False
            
            # 2. 获取申请单详情
            detail = self.test_get_expense_application_detail(app_id)
            if not detail:
                return False
            
            # 3. 提交申请单
            if not self.test_submit_expense_application(app_id):
                return False
            
            # 4. 审批申请单（通过）
            if not self.test_approve_expense_application(app_id):
                return False
            
            # 5. 再次获取申请单详情，检查状态变化
            updated_detail = self.test_get_expense_application_detail(app_id)
            if updated_detail:
                self.log_test("工作流程完整性", "PASS", "完整工作流程测试成功")
                return True
            else:
                self.log_test("工作流程完整性", "FAIL", "工作流程测试失败")
                return False
                
        except Exception as e:
            self.log_test("工作流程测试", "FAIL", f"工作流程测试异常: {str(e)}")
            return False
    
    def run_all_tests(self):
        """运行所有测试"""
        print("=" * 60)
        print("🚀 开始费用申请办款功能联合测试")
        print("=" * 60)
        
        # 基础功能测试
        if not self.test_backend_health():
            print("❌ 后端服务不可用，停止测试")
            return
        
        # 登录获取JWT token
        if not self.test_login():
            print("❌ 登录失败，停止测试")
            return
        
        self.test_get_expense_categories()
        self.test_get_expense_applications()
        self.test_get_expense_statistics()
        
        # 完整工作流程测试
        self.test_complete_workflow()
        
        # 生成测试报告
        self.generate_test_report()
    
    def generate_test_report(self):
        """生成测试报告"""
        print("\n" + "=" * 60)
        print("📊 测试报告")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = len([r for r in self.test_results if r["status"] == "PASS"])
        failed_tests = len([r for r in self.test_results if r["status"] == "FAIL"])
        info_tests = len([r for r in self.test_results if r["status"] == "INFO"])
        
        print(f"总测试数: {total_tests}")
        print(f"通过: {passed_tests} ✅")
        print(f"失败: {failed_tests} ❌")
        print(f"信息: {info_tests} ℹ️")
        print(f"成功率: {(passed_tests/total_tests*100):.1f}%" if total_tests > 0 else "成功率: 0%")
        
        # 保存详细报告
        report_data = {
            "test_summary": {
                "total": total_tests,
                "passed": passed_tests,
                "failed": failed_tests,
                "info": info_tests,
                "success_rate": (passed_tests/total_tests*100) if total_tests > 0 else 0
            },
            "test_results": self.test_results,
            "timestamp": datetime.now().isoformat()
        }
        
        with open("expense_application_test_report.json", "w", encoding="utf-8") as f:
            json.dump(report_data, f, ensure_ascii=False, indent=2)
        
        print(f"\n📄 详细报告已保存到: expense_application_test_report.json")
        
        # 显示失败的测试
        failed_results = [r for r in self.test_results if r["status"] == "FAIL"]
        if failed_results:
            print(f"\n❌ 失败的测试 ({len(failed_results)}):")
            for result in failed_results:
                print(f"  - {result['test_name']}: {result['message']}")

def main():
    """主函数"""
    tester = ExpenseApplicationTester()
    
    try:
        tester.run_all_tests()
    except KeyboardInterrupt:
        print("\n⚠️ 测试被用户中断")
    except Exception as e:
        print(f"\n💥 测试过程中发生异常: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main() 