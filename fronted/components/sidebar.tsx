"use client"

import { cn } from "@/lib/utils"
import type { PageType } from "@/app/page"
import { FileText, Users, Plane, Settings, BarChart3, CreditCard, Building, UserCircle, GitBranch, CheckSquare, TrendingUp, Workflow, Shield, LogOut, User, Database } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

interface UserInfo {
  name: string
  email: string
  avatar?: string
  provider?: string
}

interface SidebarProps {
  currentPage: PageType
  onPageChange: (page: PageType) => void
  user?: UserInfo | null
  isAuthenticated: boolean
  showDemoLogin: boolean
  onLogout: () => void
}

const menuItems = [
  { id: "expense-application" as PageType, label: "日常费用申请", icon: FileText },
  { id: "data-management" as PageType, label: "人员信息管理", icon: Users },
  { id: "travel-expense" as PageType, label: "差旅费报销", icon: Plane },
  { id: "approval-management" as PageType, label: "审批管理", icon: CheckSquare },
  { id: "workflow-demo" as PageType, label: "工作流追踪", icon: GitBranch },
  { id: "system-config" as PageType, label: "系统配置管理", icon: Settings },
  { id: "report-analytics" as PageType, label: "报表分析", icon: TrendingUp },
  { id: "integration-management" as PageType, label: "系统集成管理", icon: Workflow },
  { id: "database-test" as PageType, label: "数据库连接测试", icon: Database },
]

const otherMenuItems = [
  { label: "会计科目", icon: BarChart3 },
  { label: "财务管理", icon: CreditCard },
  { label: "组织架构", icon: Building },
]

export function Sidebar({ currentPage, onPageChange, user, isAuthenticated, showDemoLogin, onLogout }: SidebarProps) {
  return (
    <div className="w-56 bg-slate-800 text-white flex flex-col">
      {/* User Profile Section */}
      <div className="p-3 border-b border-slate-700">
        <div className="flex items-center space-x-2 mb-2">
          {user ? (
            <>
              <Avatar className="h-9 w-9">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-blue-500 text-white text-xs">
                  {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">{user.name}</div>
                <div className="text-xs text-slate-300 truncate">{user.email}</div>
              </div>
            </>
          ) : (
            <>
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-red-500 text-white">
                  <User className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white">演示用户</div>
                <div className="text-xs text-slate-300">demo@example.com</div>
              </div>
            </>
          )}
        </div>
        
        {/* User Status Badge */}
        <div>
          {user ? (
            <div className="flex items-center gap-1 text-xs text-blue-200 bg-blue-600/20 px-2 py-1 rounded-full w-fit">
              <Shield className="w-2.5 h-2.5" />
              <span className="text-xs">OAuth2 {user.provider}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-xs text-orange-200 bg-orange-600/20 px-2 py-1 rounded-full w-fit">
              <span className="text-xs">演示模式</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-3">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={cn(
                "w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-md text-left transition-colors text-sm",
                currentPage === item.id
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-700 hover:text-white",
              )}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          ))}

          <div className="pt-3 border-t border-slate-700 mt-3">
            {otherMenuItems.map((item, index) => (
              <button
                key={index}
                className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-md text-left transition-colors text-sm text-slate-300 hover:bg-slate-700 hover:text-white"
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Logout Button at Bottom */}
      <div className="p-3 border-t border-slate-700">
        <Button
          variant="outline"
          size="sm"
          onClick={onLogout}
          className="w-full bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600 hover:text-white hover:border-slate-500 transition-colors"
        >
          <LogOut className="w-3 h-3 mr-2" />
          退出登录
        </Button>
      </div>
    </div>
  )
}
