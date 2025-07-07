"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Database, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Plus, 
  Trash2,
  Server,
  Activity,
  Info,
  Clock,
  Wifi,
  HardDrive
} from "lucide-react"
import { cn } from "@/lib/utils"

interface DatabaseInfo {
  connected: boolean
  message: string
  databaseProductName?: string
  databaseProductVersion?: string
  url?: string
  userName?: string
  currentTime?: string
  version?: string
  tableCount?: number
  error?: string
}

interface HealthStatus {
  status: string
  database: string
  timestamp: number
}

interface TestEntity {
  id: number
  testName: string
  testMessage: string
  createdTime: string
}

interface JpaTestResult {
  jpaStatus: string
  message: string
  saved?: TestEntity
  allTests?: TestEntity[]
  totalCount?: number
  countFromQuery?: number
  error?: string
}

export function DatabaseTestPage() {
  const [connectionInfo, setConnectionInfo] = useState<DatabaseInfo | null>(null)
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null)
  const [testData, setTestData] = useState<TestEntity[]>([])
  const [jpaResult, setJpaResult] = useState<JpaTestResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('connection')

  const API_BASE = '/api/backend'

  // 测试数据库连接
  const testConnection = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/database/test-connection`)
      const data = await response.json()
      setConnectionInfo(data)
    } catch (error) {
      setConnectionInfo({
        connected: false,
        message: `连接失败: ${error instanceof Error ? error.message : '未知错误'}`,
        error: 'NetworkError'
      })
    } finally {
      setLoading(false)
    }
  }

  // 健康检查
  const checkHealth = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/database/health`)
      const data = await response.json()
      setHealthStatus(data)
    } catch (error) {
      setHealthStatus({
        status: 'DOWN',
        database: 'PostgreSQL',
        timestamp: Date.now()
      })
    } finally {
      setLoading(false)
    }
  }

  // 测试JPA功能
  const testJPA = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/database/test-jpa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      const data = await response.json()
      setJpaResult(data)
      if (data.allTests) {
        setTestData(data.allTests)
      }
    } catch (error) {
      setJpaResult({
        jpaStatus: 'FAILED',
        message: `JPA测试失败: ${error instanceof Error ? error.message : '未知错误'}`,
        error: 'NetworkError'
      })
    } finally {
      setLoading(false)
    }
  }

  // 获取测试数据
  const getTestData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/database/test-data`)
      const data = await response.json()
      if (data.status === 'SUCCESS') {
        setTestData(data.allTests || [])
      }
    } catch (error) {
      console.error('获取测试数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 清空测试数据
  const clearTestData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/database/clear-test-data`, {
        method: 'DELETE'
      })
      const data = await response.json()
      if (data.status === 'SUCCESS') {
        setTestData([])
        alert(`已清空 ${data.deletedCount} 条测试数据`)
      }
    } catch (error) {
      alert('清空数据失败')
    } finally {
      setLoading(false)
    }
  }

  // 页面加载时自动检查健康状态
  useEffect(() => {
    checkHealth()
    getTestData()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Database className="w-8 h-8 text-blue-600" />
              数据库连接测试
            </h1>
            <p className="text-gray-600 mt-2">测试PostgreSQL数据库连接状态和JPA功能</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={checkHealth} disabled={loading}>
              <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
              刷新状态
            </Button>
          </div>
        </div>

        {/* 快速状态卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">数据库状态</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {healthStatus?.status === 'UP' ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <span className="text-2xl font-bold">
                  {healthStatus?.status || 'UNKNOWN'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {healthStatus?.database || 'PostgreSQL'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">连接状态</CardTitle>
              <Wifi className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {connectionInfo?.connected ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : connectionInfo?.connected === false ? (
                  <XCircle className="w-5 h-5 text-red-500" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                )}
                <span className="text-2xl font-bold">
                  {connectionInfo?.connected ? '已连接' : 
                   connectionInfo?.connected === false ? '未连接' : '未测试'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                连接池状态
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">数据表数量</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {connectionInfo?.tableCount || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                公共模式表
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 详细测试 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="connection">连接测试</TabsTrigger>
            <TabsTrigger value="jpa">JPA测试</TabsTrigger>
            <TabsTrigger value="data">测试数据</TabsTrigger>
            <TabsTrigger value="info">数据库信息</TabsTrigger>
          </TabsList>

          {/* 连接测试 */}
          <TabsContent value="connection" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>数据库连接测试</CardTitle>
                <CardDescription>测试与PostgreSQL数据库的基本连接</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={testConnection} disabled={loading} className="w-full">
                  <Database className="w-4 h-4 mr-2" />
                  {loading ? '测试中...' : '测试数据库连接'}
                </Button>

                {connectionInfo && (
                  <Alert variant={connectionInfo.connected ? 'default' : 'destructive'}>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      {connectionInfo.message}
                    </AlertDescription>
                  </Alert>
                )}

                {connectionInfo?.connected && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="text-sm font-medium">数据库信息</div>
                      <div className="text-sm text-gray-600">
                        <div>产品: {connectionInfo.databaseProductName}</div>
                        <div>版本: {connectionInfo.databaseProductVersion}</div>
                        <div>用户: {connectionInfo.userName}</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium">连接信息</div>
                      <div className="text-sm text-gray-600">
                        <div>URL: {connectionInfo.url}</div>
                        <div>当前时间: {connectionInfo.currentTime}</div>
                        <div>表数量: {connectionInfo.tableCount}</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* JPA测试 */}
          <TabsContent value="jpa" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>JPA数据操作测试</CardTitle>
                <CardDescription>测试Spring Data JPA的数据库操作功能</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={testJPA} disabled={loading} className="w-full">
                  <Activity className="w-4 h-4 mr-2" />
                  {loading ? '测试中...' : '测试JPA数据操作'}
                </Button>

                {jpaResult && (
                  <Alert variant={jpaResult.jpaStatus === 'SUCCESS' ? 'default' : 'destructive'}>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      {jpaResult.message}
                    </AlertDescription>
                  </Alert>
                )}

                {jpaResult?.jpaStatus === 'SUCCESS' && jpaResult.saved && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">新创建的测试记录</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm space-y-1">
                        <div><strong>ID:</strong> {jpaResult.saved.id}</div>
                        <div><strong>名称:</strong> {jpaResult.saved.testName}</div>
                        <div><strong>消息:</strong> {jpaResult.saved.testMessage}</div>
                        <div><strong>创建时间:</strong> {jpaResult.saved.createdTime}</div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 测试数据 */}
          <TabsContent value="data" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>测试数据管理</CardTitle>
                    <CardDescription>查看和管理数据库中的测试数据</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={getTestData} disabled={loading}>
                      <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
                      刷新
                    </Button>
                    <Button variant="destructive" onClick={clearTestData} disabled={loading || testData.length === 0}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      清空数据
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {testData.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>测试名称</TableHead>
                        <TableHead>测试消息</TableHead>
                        <TableHead>创建时间</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {testData.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.id}</TableCell>
                          <TableCell>{item.testName}</TableCell>
                          <TableCell>{item.testMessage}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              {new Date(item.createdTime).toLocaleString('zh-CN')}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    暂无测试数据，请先运行JPA测试
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 数据库信息 */}
          <TabsContent value="info" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>数据库配置信息</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">主机地址:</span>
                    <span className="text-sm">1.15.34.167</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">端口:</span>
                    <span className="text-sm">5432</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">数据库名:</span>
                    <span className="text-sm">hkex_poc</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">用户名:</span>
                    <span className="text-sm">hkex_user</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">连接池类型:</span>
                    <span className="text-sm">HikariCP</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>连接池配置</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">最大连接数:</span>
                    <span className="text-sm">20</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">最小空闲连接:</span>
                    <span className="text-sm">5</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">连接超时:</span>
                    <span className="text-sm">30秒</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">空闲超时:</span>
                    <span className="text-sm">10分钟</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">最大生命周期:</span>
                    <span className="text-sm">30分钟</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {connectionInfo?.version && (
              <Card>
                <CardHeader>
                  <CardTitle>数据库版本信息</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-sm bg-gray-100 p-3 rounded-md overflow-x-auto">
                    {connectionInfo.version}
                  </pre>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default DatabaseTestPage 