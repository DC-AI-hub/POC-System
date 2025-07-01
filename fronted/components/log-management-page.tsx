"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Pagination } from "@/components/ui/pagination"
import { 
  Search, 
  Download, 
  Eye, 
  Filter, 
  RefreshCw, 
  BarChart3, 
  Activity,
  Calendar,
  MapPin,
  Monitor,
  Globe,
  Clock,
  TrendingUp,
  Users,
  FileText
} from "lucide-react"

interface Log {
  id: number
  description: string
  module: string
  ip: string
  creator: string
  status: string
  createTime: string
}

interface DashboardData {
  pv: number
  ip: number
  geo: any[]
  moduleTop: any[]
  osTop: any[]
  browserTop: any[]
  accessTrend: any[]
  timeslot: any[]
}

export default function LogManagementPage() {
  const [activeTab, setActiveTab] = useState('logs')
  const [logs, setLogs] = useState<Log[]>([])
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [total, setTotal] = useState(0)
  const [selectedLog, setSelectedLog] = useState<Log | null>(null)
  const [showLogDetail, setShowLogDetail] = useState(false)
  
  // 筛选条件
  const [filters, setFilters] = useState({
    description: '',
    module: '',
    ip: '',
    creator: '',
    status: '',
    startTime: '',
    endTime: ''
  })

  // 模拟数据
  const mockLogs: Log[] = [
    {
      id: 1,
      description: "用户登录成功",
      module: "认证模块",
      ip: "192.168.1.100",
      creator: "张三",
      status: "SUCCESS",
      createTime: "2024-01-15 10:30:00"
    },
    {
      id: 2,
      description: "费用申请创建",
      module: "费用管理",
      ip: "192.168.1.101",
      creator: "李四",
      status: "SUCCESS",
      createTime: "2024-01-15 11:20:00"
    },
    {
      id: 3,
      description: "审批通过",
      module: "工作流",
      ip: "192.168.1.102",
      creator: "王五",
      status: "SUCCESS",
      createTime: "2024-01-15 14:15:00"
    }
  ]

  const mockDashboardData: DashboardData = {
    pv: 1250,
    ip: 89,
    geo: [
      { region: "北京", count: 450 },
      { region: "上海", count: 320 },
      { region: "广州", count: 280 },
      { region: "深圳", count: 200 }
    ],
    moduleTop: [
      { module: "费用管理", count: 450 },
      { module: "工作流", count: 320 },
      { module: "用户管理", count: 280 },
      { module: "系统配置", count: 200 }
    ],
    osTop: [
      { os: "Windows", count: 650 },
      { os: "macOS", count: 320 },
      { os: "Linux", count: 180 },
      { os: "Android", count: 100 }
    ],
    browserTop: [
      { browser: "Chrome", count: 750 },
      { browser: "Safari", count: 250 },
      { browser: "Firefox", count: 150 },
      { browser: "Edge", count: 100 }
    ],
    accessTrend: [
      { date: "2024-01-10", pv: 120, ip: 45 },
      { date: "2024-01-11", pv: 135, ip: 52 },
      { date: "2024-01-12", pv: 98, ip: 38 },
      { date: "2024-01-13", pv: 156, ip: 61 },
      { date: "2024-01-14", pv: 142, ip: 55 },
      { date: "2024-01-15", pv: 178, ip: 67 }
    ],
    timeslot: [
      { hour: "09:00", count: 45 },
      { hour: "10:00", count: 78 },
      { hour: "11:00", count: 92 },
      { hour: "14:00", count: 85 },
      { hour: "15:00", count: 76 },
      { hour: "16:00", count: 68 }
    ]
  }

  useEffect(() => {
    loadLogs()
    loadDashboardData()
  }, [currentPage, pageSize])

  const loadLogs = async () => {
    setLoading(true)
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      setLogs(mockLogs)
      setTotal(100)
    } catch (error) {
      console.error('加载日志失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadDashboardData = async () => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 300))
      setDashboardData(mockDashboardData)
    } catch (error) {
      console.error('加载仪表盘数据失败:', error)
    }
  }

  const handleSearch = () => {
    setCurrentPage(1)
    loadLogs()
  }

  const handleReset = () => {
    setFilters({
      description: '',
      module: '',
      ip: '',
      creator: '',
      status: '',
      startTime: '',
      endTime: ''
    })
    setCurrentPage(1)
    loadLogs()
  }

  const handleExport = (type: 'login' | 'operation') => {
    // 模拟导出
    const link = document.createElement('a')
    link.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent('日志ID,描述,模块,IP,创建人,状态,创建时间\n1,用户登录成功,认证模块,192.168.1.100,张三,SUCCESS,2024-01-15 10:30:00')
    link.download = `${type}_logs_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <Badge variant="default" className="bg-green-100 text-green-800">成功</Badge>
      case 'FAILED':
        return <Badge variant="destructive">失败</Badge>
      case 'PENDING':
        return <Badge variant="secondary">待处理</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* 页面标题 */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">日志管理</h1>
          <p className="text-gray-600 mt-2">系统日志查询、分析和导出管理</p>
        </div>

        {/* 标签页导航 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="logs" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>日志查询</span>
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>仪表盘</span>
            </TabsTrigger>
          </TabsList>

          {/* 日志查询标签页 */}
          <TabsContent value="logs" className="space-y-6">
            {/* 筛选条件 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Filter className="w-5 h-5" />
                  <span>筛选条件</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="description">描述</Label>
                    <Input
                      id="description"
                      placeholder="输入描述关键词"
                      value={filters.description}
                      onChange={(e) => setFilters({...filters, description: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="module">模块</Label>
                    <Select value={filters.module} onValueChange={(value) => setFilters({...filters, module: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择模块" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="认证模块">认证模块</SelectItem>
                        <SelectItem value="费用管理">费用管理</SelectItem>
                        <SelectItem value="工作流">工作流</SelectItem>
                        <SelectItem value="用户管理">用户管理</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="ip">IP地址</Label>
                    <Input
                      id="ip"
                      placeholder="输入IP地址"
                      value={filters.ip}
                      onChange={(e) => setFilters({...filters, ip: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="creator">创建人</Label>
                    <Input
                      id="creator"
                      placeholder="输入创建人"
                      value={filters.creator}
                      onChange={(e) => setFilters({...filters, creator: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">状态</Label>
                    <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择状态" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SUCCESS">成功</SelectItem>
                        <SelectItem value="FAILED">失败</SelectItem>
                        <SelectItem value="PENDING">待处理</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="startTime">开始时间</Label>
                    <Input
                      id="startTime"
                      type="date"
                      value={filters.startTime}
                      onChange={(e) => setFilters({...filters, startTime: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endTime">结束时间</Label>
                    <Input
                      id="endTime"
                      type="date"
                      value={filters.endTime}
                      onChange={(e) => setFilters({...filters, endTime: e.target.value})}
                    />
                  </div>
                  <div className="flex items-end space-x-2">
                    <Button onClick={handleSearch} className="flex-1">
                      <Search className="w-4 h-4 mr-2" />
                      查询
                    </Button>
                    <Button variant="outline" onClick={handleReset}>
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 操作按钮 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button variant="outline" onClick={() => handleExport('login')}>
                  <Download className="w-4 h-4 mr-2" />
                  导出登录日志
                </Button>
                <Button variant="outline" onClick={() => handleExport('operation')}>
                  <Download className="w-4 h-4 mr-2" />
                  导出操作日志
                </Button>
              </div>
            </div>

            {/* 日志列表 */}
            <Card>
              <CardHeader>
                <CardTitle>日志列表</CardTitle>
                <CardDescription>共 {total} 条记录</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">ID</th>
                        <th className="text-left p-2">描述</th>
                        <th className="text-left p-2">模块</th>
                        <th className="text-left p-2">IP地址</th>
                        <th className="text-left p-2">创建人</th>
                        <th className="text-left p-2">状态</th>
                        <th className="text-left p-2">创建时间</th>
                        <th className="text-left p-2">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log) => (
                        <tr key={log.id} className="border-b hover:bg-gray-50">
                          <td className="p-2">{log.id}</td>
                          <td className="p-2">{log.description}</td>
                          <td className="p-2">{log.module}</td>
                          <td className="p-2">{log.ip}</td>
                          <td className="p-2">{log.creator}</td>
                          <td className="p-2">{getStatusBadge(log.status)}</td>
                          <td className="p-2">{log.createTime}</td>
                          <td className="p-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedLog(log)
                                setShowLogDetail(true)
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 分页 */}
                <div className="mt-4">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(total / pageSize)}
                    pageSize={pageSize}
                    total={total}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={setPageSize}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 仪表盘标签页 */}
          <TabsContent value="dashboard" className="space-y-6">
            {dashboardData && (
              <>
                {/* 统计卡片 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">总访问量</CardTitle>
                      <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{dashboardData.pv}</div>
                      <p className="text-xs text-muted-foreground">
                        独立IP {dashboardData.ip} 个
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">独立访客</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{dashboardData.ip}</div>
                      <p className="text-xs text-muted-foreground">
                        今日新增 12 个
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">活跃模块</CardTitle>
                      <Monitor className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{dashboardData.moduleTop.length}</div>
                      <p className="text-xs text-muted-foreground">
                        费用管理最活跃
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">地域分布</CardTitle>
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{dashboardData.geo.length}</div>
                      <p className="text-xs text-muted-foreground">
                        覆盖 {dashboardData.geo.length} 个地区
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* 图表区域 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* 访问趋势 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <TrendingUp className="w-5 h-5" />
                        <span>访问趋势</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 flex items-end justify-between space-x-2">
                        {dashboardData.accessTrend.map((item, index) => (
                          <div key={index} className="flex flex-col items-center space-y-2">
                            <div 
                              className="bg-blue-500 rounded-t w-8"
                              style={{ height: `${(item.pv / 200) * 200}px` }}
                            ></div>
                            <span className="text-xs text-gray-500">{item.date}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* 模块分布 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <BarChart3 className="w-5 h-5" />
                        <span>模块分布</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {dashboardData.moduleTop.map((item, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm">{item.module}</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-32 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-500 h-2 rounded-full"
                                  style={{ width: `${(item.count / 450) * 100}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-500">{item.count}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>

        {/* 日志详情弹窗 */}
        <Dialog open={showLogDetail} onOpenChange={setShowLogDetail}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>日志详情</DialogTitle>
              <DialogDescription>
                查看日志的详细信息
              </DialogDescription>
            </DialogHeader>
            {selectedLog && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>日志ID</Label>
                    <p className="text-sm text-gray-600">{selectedLog.id}</p>
                  </div>
                  <div>
                    <Label>状态</Label>
                    <div className="mt-1">{getStatusBadge(selectedLog.status)}</div>
                  </div>
                  <div>
                    <Label>描述</Label>
                    <p className="text-sm text-gray-600">{selectedLog.description}</p>
                  </div>
                  <div>
                    <Label>模块</Label>
                    <p className="text-sm text-gray-600">{selectedLog.module}</p>
                  </div>
                  <div>
                    <Label>IP地址</Label>
                    <p className="text-sm text-gray-600">{selectedLog.ip}</p>
                  </div>
                  <div>
                    <Label>创建人</Label>
                    <p className="text-sm text-gray-600">{selectedLog.creator}</p>
                  </div>
                  <div className="col-span-2">
                    <Label>创建时间</Label>
                    <p className="text-sm text-gray-600">{selectedLog.createTime}</p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
} 