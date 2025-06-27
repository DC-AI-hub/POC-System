"use client";

import React, { useState } from 'react';
import { useSystemConfig } from '@/hooks/use-system-config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Settings,
  Users,
  Shield,
  FolderTree,
  GitBranch,
  Database,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  Save,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  Eye,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { SystemRole, ExpenseCategory, WorkflowTemplate, SystemParameter, PERMISSION_MODULES, BUILT_IN_ROLES } from '@/lib/types/system-config';
import { WorkflowManagement, WorkflowEditor } from '@/components/workflow-editor';

// 角色管理组件
function RoleManagement() {
  const { roles, loadingRoles, createRole, updateRole, deleteRole, saving, error } = useSystemConfig();
  const [selectedRole, setSelectedRole] = useState<SystemRole | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    level: 5,
    isActive: true
  });

  const handleCreateRole = async () => {
    try {
      await createRole({
        ...formData,
        permissions: [],
        isBuiltIn: false,
        createdBy: 'current_user'
      });
      setIsDialogOpen(false);
      setFormData({ name: '', code: '', description: '', level: 5, isActive: true });
    } catch (err) {
      console.error('创建角色失败:', err);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (confirm('确定要删除这个角色吗？')) {
      try {
        await deleteRole(roleId);
      } catch (err) {
        console.error('删除角色失败:', err);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">角色管理</h3>
          <p className="text-sm text-gray-600">管理系统角色和权限层级</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              新建角色
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新建角色</DialogTitle>
              <DialogDescription>创建新的系统角色</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">角色名称</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="请输入角色名称"
                />
              </div>
              <div>
                <Label htmlFor="code">角色代码</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="请输入角色代码"
                />
              </div>
              <div>
                <Label htmlFor="description">描述</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="请输入角色描述"
                />
              </div>
              <div>
                <Label htmlFor="level">权限层级</Label>
                <Select value={formData.level.toString()} onValueChange={(value) => setFormData({ ...formData, level: parseInt(value) })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - 最高权限</SelectItem>
                    <SelectItem value="2">2 - 高级权限</SelectItem>
                    <SelectItem value="3">3 - 中级权限</SelectItem>
                    <SelectItem value="4">4 - 基础权限</SelectItem>
                    <SelectItem value="5">5 - 最低权限</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive">启用角色</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={handleCreateRole} disabled={saving}>
                {saving ? '创建中...' : '创建'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>角色名称</TableHead>
                <TableHead>代码</TableHead>
                <TableHead>描述</TableHead>
                <TableHead>权限层级</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{role.code}</Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{role.description}</TableCell>
                  <TableCell>
                    <Badge variant={role.level <= 2 ? 'default' : role.level <= 4 ? 'secondary' : 'outline'}>
                      级别 {role.level}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={role.isActive ? 'default' : 'secondary'}>
                      {role.isActive ? '启用' : '禁用'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={role.isBuiltIn ? 'outline' : 'default'}>
                      {role.isBuiltIn ? '内置' : '自定义'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      {!role.isBuiltIn && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRole(role.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// 权限矩阵组件
function PermissionMatrix() {
  const { permissionMatrix, updatePermissionMatrix, saving } = useSystemConfig();
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');

  const handlePermissionChange = (roleId: string, moduleCode: string, action: string, checked: boolean) => {
    const role = permissionMatrix.find(r => r.roleId === roleId);
    if (!role) return;

    const updatedPermissions = {
      ...role.permissions,
      [moduleCode]: {
        ...role.permissions[moduleCode],
        [action]: checked
      }
    };

    updatePermissionMatrix(roleId, updatedPermissions);
  };

  const selectedRole = permissionMatrix.find(r => r.roleId === selectedRoleId);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">权限矩阵</h3>
        <p className="text-sm text-gray-600">配置角色权限矩阵</p>
      </div>

      <div className="flex space-x-4">
        <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="选择角色" />
          </SelectTrigger>
          <SelectContent>
            {permissionMatrix.map((role) => (
              <SelectItem key={role.roleId} value={role.roleId}>
                {role.roleName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedRole && (
        <Card>
          <CardHeader>
            <CardTitle>{selectedRole.roleName} - 权限配置</CardTitle>
            <CardDescription>配置该角色的功能模块权限</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Object.entries(PERMISSION_MODULES).map(([key, module]) => (
                <div key={key} className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-3">{module.name}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {module.actions.map((action) => (
                      <div key={action} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${module.code}-${action}`}
                          checked={selectedRole.permissions[module.code]?.[action] || false}
                          onCheckedChange={(checked) =>
                            handlePermissionChange(selectedRoleId, module.code, action, checked as boolean)
                          }
                        />
                        <Label htmlFor={`${module.code}-${action}`} className="text-sm">
                          {action === 'create' && '创建'}
                          {action === 'read' && '查看'}
                          {action === 'update' && '修改'}
                          {action === 'delete' && '删除'}
                          {action === 'approve' && '审批'}
                          {action === 'reject' && '拒绝'}
                          {action === 'delegate' && '委托'}
                          {action === 'export' && '导出'}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-6">
              <Button disabled={saving}>
                {saving ? '保存中...' : '保存权限'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// 费用科目管理组件
function CategoryManagement() {
  const { categories, loadingCategories, createCategory, updateCategory, deleteCategory, saving } = useSystemConfig();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    parentId: '',
    budgetLimit: '',
    approvalRequired: true
  });

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const renderCategoryTree = (categories: ExpenseCategory[], level = 0) => {
    return categories.map((category) => (
      <div key={category.id}>
        <div className={`flex items-center py-2 px-4 hover:bg-gray-50 ${level > 0 ? 'ml-6 border-l-2 border-gray-200' : ''}`}>
          <div className="flex items-center flex-1">
            {category.children && category.children.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="p-0 h-6 w-6 mr-2"
                onClick={() => toggleExpanded(category.id)}
              >
                {expandedIds.has(category.id) ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </Button>
            )}
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-medium">{category.name}</span>
                <Badge variant="secondary">{category.code}</Badge>
                {category.budgetLimit && (
                  <Badge variant="outline">预算: ¥{category.budgetLimit.toLocaleString()}</Badge>
                )}
                <Badge variant={category.approvalRequired ? 'default' : 'secondary'}>
                  {category.approvalRequired ? '需审批' : '免审批'}
                </Badge>
                                    <Badge variant={category.isActive ? 'default' : 'secondary'}>
                  {category.isActive ? '启用' : '禁用'}
                </Badge>
              </div>
              {category.description && (
                <p className="text-sm text-gray-600 mt-1">{category.description}</p>
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm">
              <Edit className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        {category.children && expandedIds.has(category.id) && (
          <div>
            {renderCategoryTree(category.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  const handleCreateCategory = async () => {
    try {
      await createCategory({
        ...formData,
        level: formData.parentId ? 2 : 1,
        budgetLimit: formData.budgetLimit ? parseFloat(formData.budgetLimit) : undefined,
        isActive: true,
        sortOrder: 1
      });
      setIsDialogOpen(false);
      setFormData({ name: '', code: '', description: '', parentId: '', budgetLimit: '', approvalRequired: true });
    } catch (err) {
      console.error('创建科目失败:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">费用科目管理</h3>
          <p className="text-sm text-gray-600">管理费用科目分类和预算限制</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              新建科目
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新建费用科目</DialogTitle>
              <DialogDescription>创建新的费用科目分类</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">科目名称</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="请输入科目名称"
                />
              </div>
              <div>
                <Label htmlFor="code">科目代码</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="请输入科目代码"
                />
              </div>
              <div>
                <Label htmlFor="parentId">上级科目</Label>
                <Select value={formData.parentId} onValueChange={(value) => setFormData({ ...formData, parentId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择上级科目（可选）" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">无上级科目</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="budgetLimit">预算限制（元）</Label>
                <Input
                  id="budgetLimit"
                  type="number"
                  value={formData.budgetLimit}
                  onChange={(e) => setFormData({ ...formData, budgetLimit: e.target.value })}
                  placeholder="请输入预算限制"
                />
              </div>
              <div>
                <Label htmlFor="description">描述</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="请输入科目描述"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="approvalRequired"
                  checked={formData.approvalRequired}
                  onCheckedChange={(checked) => setFormData({ ...formData, approvalRequired: checked })}
                />
                <Label htmlFor="approvalRequired">需要审批</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={handleCreateCategory} disabled={saving}>
                {saving ? '创建中...' : '创建'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-96">
            {renderCategoryTree(categories)}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

// 工作流配置组件
function WorkflowConfiguration() {
  const [currentView, setCurrentView] = useState<'list' | 'edit' | 'view'>('list');
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);

  const handleEditWorkflow = (workflowId: string) => {
    setSelectedWorkflowId(workflowId);
    setCurrentView('edit');
  };

  const handleViewWorkflow = (workflowId: string) => {
    setSelectedWorkflowId(workflowId);
    setCurrentView('view');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedWorkflowId(null);
  };

  const handleSaveWorkflow = (workflow: any) => {
    // 这里可以调用API保存工作流
    console.log('保存工作流:', workflow);
    handleBackToList();
  };

  if (currentView === 'edit' || currentView === 'view') {
  return (
      <div className="h-[600px]">
        <WorkflowEditor
          workflowId={selectedWorkflowId || undefined}
          mode={currentView}
          onSave={handleSaveWorkflow}
          onCancel={handleBackToList}
        />
        </div>
    );
  }

  return (
    <WorkflowManagement
      onEditWorkflow={handleEditWorkflow}
      onViewWorkflow={handleViewWorkflow}
    />
  );
}

// 系统参数组件
function SystemParameters() {
  const { parameters, loadingParameters, updateParameter, saving } = useSystemConfig();
  const [editingParam, setEditingParam] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleEdit = (param: SystemParameter) => {
    setEditingParam(param.key);
    setEditValue(param.value);
  };

  const handleSave = async (key: string) => {
    try {
      await updateParameter(key, editValue);
      setEditingParam(null);
      setEditValue('');
    } catch (err) {
      console.error('更新参数失败:', err);
    }
  };

  const handleCancel = () => {
    setEditingParam(null);
    setEditValue('');
  };

  const groupedParams = parameters.reduce((acc, param) => {
    if (!acc[param.category]) {
      acc[param.category] = [];
    }
    acc[param.category].push(param);
    return acc;
  }, {} as Record<string, SystemParameter[]>);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">系统参数</h3>
        <p className="text-sm text-gray-600">配置系统全局参数和业务规则</p>
      </div>

      {Object.entries(groupedParams).map(([category, params]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="capitalize">
              {category === 'general' && '通用设置'}
              {category === 'approval' && '审批设置'}
              {category === 'notification' && '通知设置'}
              {category}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {params.map((param) => (
                <div key={param.key} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{param.name}</div>
                    {param.description && (
                      <div className="text-sm text-gray-600">{param.description}</div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {editingParam === param.key ? (
                      <>
                        {param.type === 'boolean' ? (
                          <Switch
                            checked={editValue === 'true'}
                            onCheckedChange={(checked) => setEditValue(checked.toString())}
                          />
                        ) : (
                          <Input
                            type={param.type === 'number' ? 'number' : 'text'}
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-32"
                          />
                        )}
                        <Button size="sm" onClick={() => handleSave(param.key)} disabled={saving}>
                          <Save className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancel}>
                          取消
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                          {param.type === 'boolean' ? (param.value === 'true' ? '启用' : '禁用') : param.value}
                        </div>
                        {param.isEditable && (
                          <Button size="sm" variant="outline" onClick={() => handleEdit(param)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// 配置管理组件
function ConfigurationManagement() {
  const { exportConfig, importConfig, validateConfig, auditLogs, getAuditLogs, saving } = useSystemConfig();
  const [importData, setImportData] = useState('');
  const [validationResult, setValidationResult] = useState<any>(null);

  const handleExport = async () => {
    try {
      const config = await exportConfig();
      const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `system-config-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('导出配置失败:', err);
    }
  };

  const handleImport = async () => {
    try {
      const config = JSON.parse(importData);
      const validation = validateConfig(config);
      setValidationResult(validation);
      
      if (validation.isValid) {
        await importConfig(config);
        setImportData('');
        setValidationResult(null);
      }
    } catch (err) {
      console.error('导入配置失败:', err);
      setValidationResult({
        isValid: false,
        errors: [{ message: '配置格式错误' }],
        warnings: []
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">配置管理</h3>
        <p className="text-sm text-gray-600">导入导出系统配置和查看变更日志</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>配置导出</CardTitle>
            <CardDescription>导出当前系统配置</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleExport} className="w-full">
              <Download className="w-4 h-4 mr-2" />
              导出配置
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>配置导入</CardTitle>
            <CardDescription>导入系统配置</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="请粘贴配置JSON数据"
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              rows={6}
            />
            {validationResult && (
              <Alert variant={validationResult.isValid ? 'default' : 'destructive'}>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {validationResult.isValid ? '配置验证通过' : `验证失败: ${validationResult.errors[0]?.message}`}
                </AlertDescription>
              </Alert>
            )}
            <Button onClick={handleImport} disabled={!importData || saving} className="w-full">
              <Upload className="w-4 h-4 mr-2" />
              {saving ? '导入中...' : '导入配置'}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>变更日志</CardTitle>
          <CardDescription>系统配置变更历史记录</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            {auditLogs.length > 0 ? (
              <div className="space-y-2">
                {auditLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{log.description}</div>
                      <div className="text-sm text-gray-600">
                        {log.operatorName} · {log.timestamp.toLocaleString()}
                      </div>
                    </div>
                    <Badge variant={
                      log.action === 'create' ? 'default' :
                      log.action === 'update' ? 'secondary' :
                      'destructive'
                    }>
                      {log.action === 'create' ? '创建' : log.action === 'update' ? '更新' : '删除'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                暂无变更记录
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

// 主组件
export default function SystemConfigPage() {
  const [activeTab, setActiveTab] = useState('roles');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 主内容 */}
      <div className="p-6">
        {/* 页面标题 */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">系统配置管理</h1>
          <p className="text-gray-600 mt-2">管理系统角色、权限、科目和工作流程配置</p>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="roles" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>角色管理</span>
            </TabsTrigger>
            <TabsTrigger value="permissions" className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>权限矩阵</span>
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center space-x-2">
              <FolderTree className="w-4 h-4" />
              <span>费用科目</span>
            </TabsTrigger>
            <TabsTrigger value="workflows" className="flex items-center space-x-2">
              <GitBranch className="w-4 h-4" />
              <span>工作流</span>
            </TabsTrigger>
            <TabsTrigger value="parameters" className="flex items-center space-x-2">
              <Database className="w-4 h-4" />
              <span>系统参数</span>
            </TabsTrigger>
            <TabsTrigger value="config" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>配置管理</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="roles">
            <RoleManagement />
          </TabsContent>

          <TabsContent value="permissions">
            <PermissionMatrix />
          </TabsContent>

          <TabsContent value="categories">
            <CategoryManagement />
          </TabsContent>

          <TabsContent value="workflows">
            <WorkflowConfiguration />
          </TabsContent>

          <TabsContent value="parameters">
            <SystemParameters />
          </TabsContent>

          <TabsContent value="config">
            <ConfigurationManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 