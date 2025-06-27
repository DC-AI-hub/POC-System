"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { LoginPage } from "@/components/login-page"

import { useOAuth2Auth } from "@/hooks/use-oauth2-auth"
import { ExpenseApplicationPage } from "@/components/expense-application-page"
import { DataManagementPage } from "@/components/data-management-page"
import { TravelExpensePage } from "@/components/travel-expense-page"
import { WorkflowDemoPage } from "@/components/workflow-demo-page"
import ApprovalManagementPage from "@/components/approval-management-page"
import SystemConfigPage from "@/components/system-config-page"
import ReportAnalyticsPage from "@/components/report-analytics-page"
import IntegrationManagementPage from "@/components/integration-management-page"
import OAuth2DemoPage from "@/components/oauth2-demo-page"

export type PageType = "expense-application" | "data-management" | "travel-expense" | "workflow-demo" | "approval-management" | "system-config" | "report-analytics" | "integration-management" | "oauth2-demo"

export default function AdminSPA() {
  const [currentPage, setCurrentPage] = useState<PageType>("expense-application")
  const { isAuthenticated, user, logout, loading } = useOAuth2Auth()
  const [showDemoLogin, setShowDemoLogin] = useState(false)

  const handleDemoLogin = () => {
    // For demo purposes, we still support the old login method
    setShowDemoLogin(true)
  }

  const handleDemoLogout = () => {
    setShowDemoLogin(false)
    logout()
  }

  const handleToggleAuth = () => {
    if (isAuthenticated || showDemoLogin) {
      handleDemoLogout()
    } else {
      handleDemoLogin()
    }
  }

  // Show login page if not authenticated
  if (!isAuthenticated && !showDemoLogin) {
    return <LoginPage onLogin={handleDemoLogin} />
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
        showDemoLogin={showDemoLogin}
        onLogout={handleDemoLogout}
      />
      <main className="flex-1 overflow-auto">
        {renderCurrentPage()}
      </main>
    </div>
  )
}
