"use client";

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PermissionMatrix as PermissionMatrixType, PERMISSION_MODULES } from '@/lib/types/system-config';

interface PermissionMatrixProps {
  matrix: PermissionMatrixType[];
  onPermissionChange: (roleId: string, moduleCode: string, action: string, checked: boolean) => void;
  readonly?: boolean;
}

const actionLabels = {
  create: '创建',
  read: '查看',
  update: '修改',
  delete: '删除',
  approve: '审批',
  reject: '拒绝',
  delegate: '委托',
  export: '导出'
};

const moduleLabels = {
  expense: '费用管理',
  travel: '差旅管理',
  personnel: '人员管理',
  approval: '审批管理',
  report: '报表分析',
  config: '系统配置'
};

export function PermissionMatrix({ matrix, onPermissionChange, readonly = false }: PermissionMatrixProps) {
  // 获取所有唯一的操作
  const allActions = Array.from(
    new Set(
      Object.values(PERMISSION_MODULES).flatMap(module => module.actions)
    )
  );

  // 获取所有模块
  const modules = Object.values(PERMISSION_MODULES);

  return (
    <Card>
      <CardHeader>
        <CardTitle>权限矩阵</CardTitle>
        <CardDescription>角色权限配置一览表</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-32">角色</TableHead>
                {modules.map(module => (
                  <TableHead key={module.code} className="text-center min-w-32">
                    <div className="space-y-1">
                      <div className="font-semibold">{moduleLabels[module.code as keyof typeof moduleLabels]}</div>
                      <div className="flex flex-wrap gap-1 justify-center">
                        {module.actions.map(action => (
                          <Badge key={action} variant="outline" className="text-xs">
                            {actionLabels[action as keyof typeof actionLabels]}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {matrix.map(role => (
                <TableRow key={role.roleId}>
                  <TableCell className="font-medium">
                    <div className="space-y-1">
                      <div>{role.roleName}</div>
                    </div>
                  </TableCell>
                  {modules.map(module => (
                    <TableCell key={module.code} className="text-center">
                      <div className="space-y-2">
                        {module.actions.map(action => (
                          <div key={action} className="flex items-center justify-center space-x-2">
                            <Checkbox
                              id={`${role.roleId}-${module.code}-${action}`}
                              checked={role.permissions[module.code]?.[action] || false}
                              onCheckedChange={(checked) => {
                                if (!readonly) {
                                  onPermissionChange(role.roleId, module.code, action, checked as boolean);
                                }
                              }}
                              disabled={readonly}
                            />
                            <label
                              htmlFor={`${role.roleId}-${module.code}-${action}`}
                              className="text-xs cursor-pointer"
                            >
                              {actionLabels[action as keyof typeof actionLabels]}
                            </label>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

// 简化版权限矩阵组件
export function SimplePermissionMatrix({ matrix, onPermissionChange, readonly = false }: PermissionMatrixProps) {
  const modules = Object.values(PERMISSION_MODULES);

  return (
    <div className="space-y-4">
      {matrix.map(role => (
        <Card key={role.roleId}>
          <CardHeader>
            <CardTitle className="text-lg">{role.roleName}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {modules.map(module => (
                <div key={module.code} className="border rounded-lg p-3">
                  <h4 className="font-semibold mb-2">{moduleLabels[module.code as keyof typeof moduleLabels]}</h4>
                  <div className="space-y-2">
                    {module.actions.map(action => (
                      <div key={action} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${role.roleId}-${module.code}-${action}`}
                          checked={role.permissions[module.code]?.[action] || false}
                          onCheckedChange={(checked) => {
                            if (!readonly) {
                              onPermissionChange(role.roleId, module.code, action, checked as boolean);
                            }
                          }}
                          disabled={readonly}
                        />
                        <label
                          htmlFor={`${role.roleId}-${module.code}-${action}`}
                          className="text-sm cursor-pointer"
                        >
                          {actionLabels[action as keyof typeof actionLabels]}
                        </label>
                      </div>
                    ))}
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

// 权限统计组件
export function PermissionStats({ matrix }: { matrix: PermissionMatrixType[] }) {
  const stats = matrix.map(role => {
    const totalPermissions = Object.values(role.permissions).reduce((total, modulePerms) => {
      return total + Object.values(modulePerms).filter(Boolean).length;
    }, 0);

    const moduleStats = Object.entries(role.permissions).map(([moduleCode, modulePerms]) => ({
      module: moduleLabels[moduleCode as keyof typeof moduleLabels] || moduleCode,
      count: Object.values(modulePerms).filter(Boolean).length,
      total: Object.keys(modulePerms).length
    }));

    return {
      roleName: role.roleName,
      totalPermissions,
      moduleStats
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>权限统计</CardTitle>
        <CardDescription>各角色权限分布统计</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stats.map(stat => (
            <div key={stat.roleName} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">{stat.roleName}</h4>
                <Badge variant="outline">
                  总权限: {stat.totalPermissions}
                </Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {stat.moduleStats.map(moduleStat => (
                  <div key={moduleStat.module} className="text-sm">
                    <span className="text-gray-600">{moduleStat.module}: </span>
                    <span className="font-medium">{moduleStat.count}/{moduleStat.total}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 