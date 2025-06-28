"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { LoginPage } from "@/components/login-page"

import { useJWTAuth } from "@/hooks/use-jwt-auth"
import { ExpenseApplicationPage } from "@/components/expense-application-page"
import { DataManagementPage } from "@/components/data-management-page"
import { TravelExpensePage } from "@/components/travel-expense-page"
import { WorkflowDemoPage } from "@/components/workflow-demo-page"
import ApprovalManagementPage from "@/components/approval-management-page"
import SystemConfigPage from "@/components/system-config-page"
import ReportAnalyticsPage from "@/components/report-analytics-page"
import IntegrationManagementPage from "@/components/integration-management-page"
import OAuth2DemoPage from "@/components/oauth2-demo-page"
import DatabaseTestPage from "@/components/database-test-page"

export type PageType = "expense-application" | "data-management" | "travel-expense" | "workflow-demo" | "approval-management" | "system-config" | "report-analytics" | "integration-management" | "oauth2-demo" | "database-test"

export default function AdminSPA() {
  const [currentPage, setCurrentPage] = useState<PageType>("expense-application")
  const { isAuthenticated, user, logout, loading, updateAuthState } = useJWTAuth()

  const handleLogin = () => {
    // 登录成功后，从localStorage读取用户信息并更新状态
    const userInfo = localStorage.getItem('user_info')
    if (userInfo) {
      try {
        const user = JSON.parse(userInfo)
        updateAuthState(user)
      } catch (error) {
        console.error('更新认证状态失败:', error)
      }
    }
  }

  const handleLogout = () => {
    logout()
  }

  // 显示加载状态
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  // 显示登录页面
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "expense-application":
        return <ExpenseApplicationPage />
      case "data-management":
        return <DataManagementPage />
      case "travel-expense":
        return <TravelExpensePage />
      case "workflow-demo":
        return <WorkflowDemoPage />
      case "approval-management":
        return <ApprovalManagementPage />
      case "system-config":
        return <SystemConfigPage />
      case "report-analytics":
        return <ReportAnalyticsPage />
      case "integration-management":
        return <IntegrationManagementPage />
      case "oauth2-demo":
        return <OAuth2DemoPage />
      case "database-test":
        return <DatabaseTestPage />
      default:
        return <ExpenseApplicationPage />
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar 
        currentPage={currentPage} 
        onPageChange={setCurrentPage}
        user={user}
        isAuthenticated={isAuthenticated}
        showDemoLogin={false}
        onLogout={handleLogout}
      />
      <main className="flex-1 overflow-auto">
        {renderCurrentPage()}
      </main>
    </div>
  )
}
