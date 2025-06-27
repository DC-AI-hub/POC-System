'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useIntegration } from '@/hooks/use-integration';
import {
  Settings,
  Play,
  Pause,
  RotateCcw,
  TestTube,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Cloud,
  Mail,
  Users,
  Shield,
  FileText,
  Download,
  Upload,
  Plus,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';

export default function IntegrationManagementPage() {
  const {
    configs,
    loading,
    error,
    monitors,
    alerts,
    stats,
    syncResults,
    createConfig,
    updateConfig,
    deleteConfig,
    toggleConfig,
    testConnection,
    startSync,
    stopSync,
    refreshMonitors,
    acknowledgeAlert,
    resolveAlert
  } = useIntegration();

  const [activeTab, setActiveTab] = useState('overview');
  const [selectedConfig, setSelectedConfig] = useState<string | null>(null);

  // 获取集成类型图标
  const getTypeIcon = (type: string) => {
    const iconMap = {
      auth: Shield,
      finance: Database,
      hr: Users,
      notification: Mail,
      storage: Cloud
    };
    const Icon = iconMap[type as keyof typeof iconMap] || Settings;
    return <Icon className="w-4 h-4" />;
  };

  // 获取状态徽章
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      healthy: { label: '健康', variant: 'default' as const, icon: CheckCircle },
      warning: { label: '警告', variant: 'secondary' as const, icon: AlertTriangle },
      error: { label: '错误', variant: 'destructive' as const, icon: AlertTriangle },
      offline: { label: '离线', variant: 'outline' as const, icon: Clock }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.offline;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  // 处理连接测试
  const handleTestConnection = async (configId: string) => {
    try {
      const result = await testConnection(configId);
      if (result.success) {
        alert(`连接测试成功：${result.message}`);
      } else {
        alert(`连接测试失败：${result.message}`);
      }
    } catch (error) {
      alert('连接测试失败');
    }
  };

  // 处理同步启动
  const handleStartSync = async (configId: string) => {
    try {
      await startSync(configId);
      alert('同步任务已启动');
    } catch (error) {
      alert('启动同步失败');
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">系统集成管理</h1>
          <p className="text-slate-600 mt-2">配置和管理外部系统集成</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={refreshMonitors}>
            <RotateCcw className="w-4 h-4 mr-2" />
            刷新监控
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            新增集成
          </Button>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 主要内容 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">系统概览</TabsTrigger>
          <TabsTrigger value="configs">集成配置</TabsTrigger>
          <TabsTrigger value="monitor">监控状态</TabsTrigger>
          <TabsTrigger value="sync">同步管理</TabsTrigger>
          <TabsTrigger value="alerts">告警中心</TabsTrigger>
        </TabsList>

        {/* 系统概览 */}
        <TabsContent value="overview" className="space-y-6">
          {/* 统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">总配置数</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalConfigs || 0}</div>
                <p className="text-xs text-muted-foreground">
                  活跃配置 {stats?.activeConfigs || 0} 个
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">同步成功率</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats ? ((stats.successfulSyncs / stats.totalSyncs) * 100).toFixed(1) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  总计 {stats?.totalSyncs || 0} 次同步
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">数据记录</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.dataVolume.totalRecords.toLocaleString() || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  今日新增 {stats?.dataVolume.recordsToday.toLocaleString() || 0}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">系统状态</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.systemHealth.systemUptime.toFixed(1) || 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  活跃告警 {stats?.systemHealth.activeAlerts || 0} 个
                </p>
              </CardContent>
            </Card>
          </div>

          {/* 集成类型分布 */}
          <Card>
            <CardHeader>
              <CardTitle>集成类型分布</CardTitle>
              <CardDescription>各类型集成配置数量和状态</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { type: 'auth', name: '用户认证', count: 2, active: 2 },
                  { type: 'finance', name: '财务系统', count: 2, active: 1 },
                  { type: 'hr', name: 'HR系统', count: 2, active: 2 },
                  { type: 'notification', name: '通知服务', count: 1, active: 1 },
                  { type: 'storage', name: '文件存储', count: 1, active: 0 }
                ].map((item) => (
                  <div key={item.type} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(item.type)}
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-medium">{item.count} 个配置</div>
                        <div className="text-xs text-muted-foreground">
                          {item.active} 个活跃
                        </div>
                      </div>
                      <Progress 
                        value={(item.active / item.count) * 100} 
                        className="w-20" 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 集成配置 */}
        <TabsContent value="configs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>集成配置列表</CardTitle>
              <CardDescription>管理所有系统集成配置</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>名称</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>提供商</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>最后同步</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {configs.map((config) => {
                    const monitor = monitors.find(m => m.configId === config.id);
                    return (
                      <TableRow key={config.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTypeIcon(config.type)}
                            <div>
                              <div className="font-medium">{config.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {config.description}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{config.type}</Badge>
                        </TableCell>
                        <TableCell>{config.provider}</TableCell>
                        <TableCell>
                          {config.isActive ? (
                            <Badge variant="default">活跃</Badge>
                          ) : (
                            <Badge variant="secondary">停用</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {monitor?.lastSyncTime ? 
                            monitor.lastSyncTime.toLocaleString() : 
                            '从未同步'
                          }
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleTestConnection(config.id)}
                            >
                              <TestTube className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStartSync(config.id)}
                              disabled={!config.isActive}
                            >
                              <Play className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleConfig(config.id)}
                            >
                              {config.isActive ? (
                                <Pause className="w-3 h-3" />
                              ) : (
                                <Play className="w-3 h-3" />
                              )}
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 监控状态 */}
        <TabsContent value="monitor" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {monitors.map((monitor) => {
              const config = configs.find(c => c.id === monitor.configId);
              return (
                <Card key={monitor.configId}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        {config?.name || monitor.configId}
                      </CardTitle>
                      {getStatusBadge(monitor.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">成功率</div>
                        <div className="text-lg font-semibold">
                          {(monitor.successRate * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">响应时间</div>
                        <div className="text-lg font-semibold">
                          {monitor.avgResponseTime}ms
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">错误数</div>
                        <div className="text-lg font-semibold text-red-600">
                          {monitor.errorCount}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">运行时间</div>
                        <div className="text-lg font-semibold">
                          {monitor.uptime.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    
                    {monitor.nextSyncTime && (
                      <div className="text-sm text-muted-foreground">
                        下次同步：{monitor.nextSyncTime.toLocaleString()}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* 同步管理 */}
        <TabsContent value="sync" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>同步历史</CardTitle>
              <CardDescription>查看所有同步任务的执行记录</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>配置名称</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>开始时间</TableHead>
                    <TableHead>处理记录</TableHead>
                    <TableHead>成功/失败</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {syncResults.slice(0, 10).map((result) => {
                    const config = configs.find(c => c.id === result.configId);
                    return (
                      <TableRow key={result.id}>
                        <TableCell>{config?.name || result.configId}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              result.status === 'completed' ? 'default' :
                              result.status === 'running' ? 'secondary' :
                              result.status === 'failed' ? 'destructive' : 'outline'
                            }
                          >
                            {result.status === 'completed' ? '已完成' :
                             result.status === 'running' ? '运行中' :
                             result.status === 'failed' ? '失败' : '已取消'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {result.startTime.toLocaleString()}
                        </TableCell>
                        <TableCell>{result.recordsProcessed}</TableCell>
                        <TableCell>
                          <span className="text-green-600">{result.recordsSucceeded}</span>
                          {' / '}
                          <span className="text-red-600">{result.recordsFailed}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="w-3 h-3" />
                            </Button>
                            {result.status === 'running' && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => stopSync(result.id)}
                              >
                                <Pause className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 告警中心 */}
        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>活跃告警</CardTitle>
              <CardDescription>系统集成相关的告警信息</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                    <p>当前没有活跃告警</p>
                  </div>
                ) : (
                  alerts.map((alert) => {
                    const config = configs.find(c => c.id === alert.configId);
                    return (
                      <Alert 
                        key={alert.id}
                        variant={alert.type === 'error' ? 'destructive' : 'default'}
                      >
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-medium">{alert.title}</div>
                              <div className="text-sm mt-1">{alert.message}</div>
                              <div className="text-xs text-muted-foreground mt-2">
                                {config?.name} • {alert.timestamp.toLocaleString()}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              {!alert.acknowledged && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => acknowledgeAlert(alert.id)}
                                >
                                  确认
                                </Button>
                              )}
                              {!alert.resolved && (
                                <Button 
                                  size="sm"
                                  onClick={() => resolveAlert(alert.id)}
                                >
                                  解决
                                </Button>
                              )}
                            </div>
                          </div>
                        </AlertDescription>
                      </Alert>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 