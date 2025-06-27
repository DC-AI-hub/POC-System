'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  DollarSign,
  FileText,
  RefreshCw,
  Download
} from 'lucide-react';

// 模拟数据
const mockExpenseStats = {
  totalAmount: 2500000,
  totalCount: 156,
  averageAmount: 16025,
  byDepartment: [
    { department: '财务部', totalAmount: 650000, count: 32, averageAmount: 20312, utilizationRate: 0.82 },
    { department: '人事部', totalAmount: 420000, count: 28, averageAmount: 15000, utilizationRate: 0.75 },
    { department: '技术部', totalAmount: 780000, count: 45, averageAmount: 17333, utilizationRate: 0.68 },
    { department: '市场部', totalAmount: 380000, count: 25, averageAmount: 15200, utilizationRate: 0.92 },
    { department: '运营部', totalAmount: 270000, count: 26, averageAmount: 10384, utilizationRate: 0.58 }
  ],
  byCategory: [
    { category: '办公用品', amount: 450000, percentage: 18, trend: 'up' },
    { category: '差旅费', amount: 680000, percentage: 27.2, trend: 'down' },
    { category: '招待费', amount: 320000, percentage: 12.8, trend: 'stable' },
    { category: '设备采购', amount: 750000, percentage: 30, trend: 'up' },
    { category: '培训费', amount: 300000, percentage: 12, trend: 'stable' }
  ]
};

const mockApprovalStats = {
  totalApplications: 156,
  approvalRate: 0.89,
  averageProcessingTime: 3.2,
  byStep: [
    { step: '部门审批', averageTime: 1.2, count: 156 },
    { step: '财务审核', averageTime: 0.8, count: 145 },
    { step: '总经理审批', averageTime: 1.2, count: 89 }
  ]
};

const mockBudgetStats = {
  totalBudget: 5000000,
  totalSpent: 2500000,
  utilizationRate: 0.5,
  byDepartment: [
    { department: '财务部', budget: 800000, spent: 650000, utilizationRate: 0.8125, status: 'on-track' },
    { department: '人事部', budget: 600000, spent: 420000, utilizationRate: 0.7, status: 'on-track' },
    { department: '技术部', budget: 1200000, spent: 780000, utilizationRate: 0.65, status: 'on-track' },
    { department: '市场部', budget: 500000, spent: 380000, utilizationRate: 0.76, status: 'at-risk' },
    { department: '运营部', budget: 400000, spent: 270000, utilizationRate: 0.675, status: 'on-track' }
  ]
};

export default function ReportAnalyticsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert('数据已刷新');
    }, 1000);
  };

  const handleExport = () => {
    alert('导出功能开发中');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">报表分析</h1>
          <p className="text-slate-600 mt-2">费用数据分析与报表生成</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            刷新数据
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            导出报表
          </Button>
        </div>
      </div>

      {/* 主要内容 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">数据概览</TabsTrigger>
          <TabsTrigger value="expense">费用统计</TabsTrigger>
          <TabsTrigger value="approval">审批效率</TabsTrigger>
          <TabsTrigger value="budget">预算对比</TabsTrigger>
        </TabsList>

        {/* 数据概览 */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">总费用</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">¥2,500,000</div>
                <p className="text-xs text-muted-foreground">较上月增长 12.5%</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">申请数量</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">156</div>
                <p className="text-xs text-muted-foreground">本月新增申请</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">审批通过率</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">89.1%</div>
                <p className="text-xs text-muted-foreground">审批效率良好</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">平均审批时间</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3.2天</div>
                <p className="text-xs text-muted-foreground">处理时间稳定</p>
              </CardContent>
            </Card>
          </div>

          {/* 部门费用分布 */}
          <Card>
            <CardHeader>
              <CardTitle>部门费用分布</CardTitle>
              <CardDescription>各部门费用统计概览</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">技术部</span>
                  <div className="flex items-center gap-2">
                    <Progress value={31.2} className="w-20" />
                    <span className="text-sm text-muted-foreground">¥780,000</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">财务部</span>
                  <div className="flex items-center gap-2">
                    <Progress value={26} className="w-20" />
                    <span className="text-sm text-muted-foreground">¥650,000</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">人事部</span>
                  <div className="flex items-center gap-2">
                    <Progress value={16.8} className="w-20" />
                    <span className="text-sm text-muted-foreground">¥420,000</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">市场部</span>
                  <div className="flex items-center gap-2">
                    <Progress value={15.2} className="w-20" />
                    <span className="text-sm text-muted-foreground">¥380,000</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">运营部</span>
                  <div className="flex items-center gap-2">
                    <Progress value={10.8} className="w-20" />
                    <span className="text-sm text-muted-foreground">¥270,000</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 费用统计 */}
        <TabsContent value="expense" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>部门费用统计</CardTitle>
              <CardDescription>详细的部门费用数据</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>部门</TableHead>
                    <TableHead>总金额</TableHead>
                    <TableHead>申请数量</TableHead>
                    <TableHead>平均金额</TableHead>
                    <TableHead>预算利用率</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">财务部</TableCell>
                    <TableCell>¥650,000</TableCell>
                    <TableCell>32</TableCell>
                    <TableCell>¥20,312</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={82} className="w-16" />
                        <span className="text-sm">82%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">人事部</TableCell>
                    <TableCell>¥420,000</TableCell>
                    <TableCell>28</TableCell>
                    <TableCell>¥15,000</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={75} className="w-16" />
                        <span className="text-sm">75%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">技术部</TableCell>
                    <TableCell>¥780,000</TableCell>
                    <TableCell>45</TableCell>
                    <TableCell>¥17,333</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={68} className="w-16" />
                        <span className="text-sm">68%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">市场部</TableCell>
                    <TableCell>¥380,000</TableCell>
                    <TableCell>25</TableCell>
                    <TableCell>¥15,200</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={92} className="w-16" />
                        <span className="text-sm">92%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">运营部</TableCell>
                    <TableCell>¥270,000</TableCell>
                    <TableCell>26</TableCell>
                    <TableCell>¥10,384</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={58} className="w-16" />
                        <span className="text-sm">58%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>费用科目分析</CardTitle>
              <CardDescription>各类费用科目统计</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { category: '设备采购', amount: 750000, percentage: 30, trend: 'up' },
                  { category: '差旅费', amount: 680000, percentage: 27.2, trend: 'down' },
                  { category: '办公用品', amount: 450000, percentage: 18, trend: 'up' },
                  { category: '招待费', amount: 320000, percentage: 12.8, trend: 'stable' },
                  { category: '培训费', amount: 300000, percentage: 12, trend: 'stable' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {item.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
                        {item.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
                        {item.trend === 'stable' && <div className="w-4 h-4 bg-gray-300 rounded-full" />}
                        <span className="font-medium">{item.category}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-medium">¥{item.amount.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">{item.percentage}%</div>
                      </div>
                      <Progress value={item.percentage} className="w-20" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 审批效率 */}
        <TabsContent value="approval" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">审批效率概览</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">总申请数</span>
                    <span className="font-semibold">156</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">已处理</span>
                    <span className="font-semibold text-green-600">139</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">待处理</span>
                    <span className="font-semibold text-orange-600">17</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">通过率</span>
                    <span className="font-semibold text-blue-600">89.1%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">平均处理时间</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">部门审批</span>
                    <span className="font-semibold">1.2天</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">财务审核</span>
                    <span className="font-semibold">0.8天</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">总经理审批</span>
                    <span className="font-semibold">1.2天</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">总平均</span>
                    <span className="font-semibold text-blue-600">3.2天</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">效率等级</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">高效处理</span>
                    <Badge variant="default">65%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">正常处理</span>
                    <Badge variant="secondary">28%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">待优化</span>
                    <Badge variant="outline">7%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 预算对比 */}
        <TabsContent value="budget" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>预算执行概览</CardTitle>
              <CardDescription>总体预算使用情况</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">总预算</span>
                  <span className="font-semibold">¥5,000,000</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">已使用</span>
                  <span className="font-semibold text-blue-600">¥2,500,000</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">剩余预算</span>
                  <span className="font-semibold text-green-600">¥2,500,000</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">执行率</span>
                  <span className="font-semibold">50%</span>
                </div>
                <Progress value={50} className="w-full" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>部门预算对比</CardTitle>
              <CardDescription>各部门预算执行情况</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>部门</TableHead>
                    <TableHead>预算</TableHead>
                    <TableHead>已支出</TableHead>
                    <TableHead>执行率</TableHead>
                    <TableHead>状态</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">财务部</TableCell>
                    <TableCell>¥800,000</TableCell>
                    <TableCell>¥650,000</TableCell>
                    <TableCell>81.3%</TableCell>
                    <TableCell>
                      <Badge variant="default" className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        正常
                      </Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">人事部</TableCell>
                    <TableCell>¥600,000</TableCell>
                    <TableCell>¥420,000</TableCell>
                    <TableCell>70%</TableCell>
                    <TableCell>
                      <Badge variant="default" className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        正常
                      </Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">技术部</TableCell>
                    <TableCell>¥1,200,000</TableCell>
                    <TableCell>¥780,000</TableCell>
                    <TableCell>65%</TableCell>
                    <TableCell>
                      <Badge variant="default" className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        正常
                      </Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">市场部</TableCell>
                    <TableCell>¥500,000</TableCell>
                    <TableCell>¥380,000</TableCell>
                    <TableCell>76%</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        风险
                      </Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">运营部</TableCell>
                    <TableCell>¥400,000</TableCell>
                    <TableCell>¥270,000</TableCell>
                    <TableCell>67.5%</TableCell>
                    <TableCell>
                      <Badge variant="default" className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        正常
                      </Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 