"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { useDebounce } from "@/hooks/use-debounce"
import {
  Employee,
  SortConfig,
  FilterConfig,
  PaginationConfig,
  TableState,
  TableActions,
  type SortDirection,
} from "@/lib/types/data-management"

interface UseAdvancedTableOptions {
  initialData: Employee[]
  defaultPageSize?: number
  enableSelection?: boolean
  onDataChange?: (data: Employee[]) => void
}

export function useAdvancedTable({
  initialData,
  defaultPageSize = 20,
  enableSelection = true,
  onDataChange,
}: UseAdvancedTableOptions): [TableState, TableActions] {
  // 基础状态
  const [data, setData] = useState<Employee[]>(initialData)
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(false)

  // 排序状态
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: null,
  })

  // 过滤状态
  const [filterConfig, setFilterConfig] = useState<FilterConfig>({
    searchTerm: "",
    departmentFilter: "all",
    statusFilter: "all",
    typeFilter: "all",
  })

  // 分页状态
  const [paginationConfig, setPaginationConfig] = useState<PaginationConfig>({
    currentPage: 1,
    pageSize: defaultPageSize,
    total: initialData.length,
  })

  // 搜索防抖
  const debouncedSearchTerm = useDebounce(filterConfig.searchTerm, 300)

  // 排序逻辑
  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) {
      return data
    }

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key!]
      const bValue = b[sortConfig.key!]

      if (aValue === bValue) return 0

      let comparison = 0
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue, 'zh-CN')
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue
      } else {
        comparison = String(aValue).localeCompare(String(bValue), 'zh-CN')
      }

      return sortConfig.direction === 'asc' ? comparison : -comparison
    })
  }, [data, sortConfig])

  // 过滤逻辑
  const filteredData = useMemo(() => {
    return sortedData.filter((item) => {
      // 全局搜索
      if (debouncedSearchTerm) {
        const searchLower = debouncedSearchTerm.toLowerCase()
        const searchableFields = [item.name, item.loginName, item.employeeId, item.department, item.phone]
        const matchesSearch = searchableFields.some(field => 
          field?.toLowerCase().includes(searchLower)
        )
        if (!matchesSearch) return false
      }

      // 部门过滤
      if (filterConfig.departmentFilter && filterConfig.departmentFilter !== "all" && item.department !== filterConfig.departmentFilter) {
        return false
      }

      // 状态过滤
      if (filterConfig.statusFilter && filterConfig.statusFilter !== "all" && item.status !== filterConfig.statusFilter) {
        return false
      }

      // 类型过滤
      if (filterConfig.typeFilter && filterConfig.typeFilter !== "all" && item.type !== filterConfig.typeFilter) {
        return false
      }

      return true
    })
  }, [sortedData, debouncedSearchTerm, filterConfig])

  // 分页数据
  const paginatedData = useMemo(() => {
    const startIndex = (paginationConfig.currentPage - 1) * paginationConfig.pageSize
    const endIndex = startIndex + paginationConfig.pageSize
    return filteredData.slice(startIndex, endIndex)
  }, [filteredData, paginationConfig.currentPage, paginationConfig.pageSize])

  // 更新总数
  useEffect(() => {
    setPaginationConfig(prev => ({
      ...prev,
      total: filteredData.length,
    }))
  }, [filteredData.length])

  // 当过滤条件变化时重置到第一页
  useEffect(() => {
    setPaginationConfig(prev => ({
      ...prev,
      currentPage: 1,
    }))
  }, [debouncedSearchTerm, filterConfig.departmentFilter, filterConfig.statusFilter, filterConfig.typeFilter])

  // 数据变化时通知父组件
  useEffect(() => {
    if (onDataChange) {
      onDataChange(filteredData)
    }
  }, [filteredData, onDataChange])

  // 排序处理
  const handleSort = useCallback((key: keyof Employee) => {
    setSortConfig(prev => {
      if (prev.key === key) {
        // 同一列：无排序 -> 升序 -> 降序 -> 无排序
        const direction: SortDirection = 
          prev.direction === null ? 'asc' :
          prev.direction === 'asc' ? 'desc' :
          null
        return { key: direction ? key : null, direction }
      } else {
        // 不同列：直接设置为升序
        return { key, direction: 'asc' }
      }
    })
  }, [])

  // 搜索处理
  const handleSearch = useCallback((searchTerm: string) => {
    setFilterConfig(prev => ({
      ...prev,
      searchTerm,
    }))
  }, [])

  // 过滤处理
  const handleFilter = useCallback((filterType: keyof FilterConfig, value: string) => {
    setFilterConfig(prev => ({
      ...prev,
      [filterType]: value,
    }))
  }, [])

  // 清除过滤
  const clearFilters = useCallback(() => {
    setFilterConfig({
      searchTerm: "",
      departmentFilter: "all",
      statusFilter: "all",
      typeFilter: "all",
    })
  }, [])

  // 分页处理
  const handlePageChange = useCallback((page: number) => {
    setPaginationConfig(prev => ({
      ...prev,
      currentPage: page,
    }))
  }, [])

  const handlePageSizeChange = useCallback((pageSize: number) => {
    setPaginationConfig(prev => ({
      ...prev,
      pageSize,
      currentPage: 1, // 重置到第一页
    }))
  }, [])

  // 选择处理
  const handleSelectRow = useCallback((id: number) => {
    if (!enableSelection) return
    
    setSelectedRows(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }, [enableSelection])

  const handleSelectAll = useCallback((checked: boolean) => {
    if (!enableSelection) return
    
    if (checked) {
      // 选择当前页所有项
      const currentPageIds = paginatedData.map(item => item.id)
      setSelectedRows(prev => new Set([...prev, ...currentPageIds]))
    } else {
      // 取消选择当前页所有项
      const currentPageIds = new Set(paginatedData.map(item => item.id))
      setSelectedRows(prev => new Set([...prev].filter(id => !currentPageIds.has(id))))
    }
  }, [enableSelection, paginatedData])

  const handleClearSelection = useCallback(() => {
    setSelectedRows(new Set())
  }, [])

  // 批量操作
  const handleBatchDelete = useCallback(async () => {
    if (selectedRows.size === 0) return

    setLoading(true)
    try {
      // 模拟删除操作
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setData(prev => prev.filter(item => !selectedRows.has(item.id)))
      setSelectedRows(new Set())
      
      alert(`已删除 ${selectedRows.size} 条记录`)
    } catch (error) {
      console.error('批量删除失败:', error)
      alert('删除失败，请重试')
    } finally {
      setLoading(false)
    }
  }, [selectedRows])

  const handleBatchExport = useCallback(async () => {
    const exportData = selectedRows.size > 0 
      ? data.filter(item => selectedRows.has(item.id))
      : filteredData

    setLoading(true)
    try {
      // 模拟导出操作
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 创建CSV内容
      const headers = ['姓名', '登录名', '人员编号', '所属部门', '联系电话', '人员类型', '人员状态']
      const csvContent = [
        headers.join(','),
        ...exportData.map(item => [
          item.name,
          item.loginName,
          item.employeeId,
          item.department,
          item.phone,
          item.type,
          item.status,
        ].join(','))
      ].join('\n')

      // 下载文件
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `人员数据_${new Date().toISOString().slice(0, 10)}.csv`
      link.click()
      
      alert(`已导出 ${exportData.length} 条记录`)
    } catch (error) {
      console.error('批量导出失败:', error)
      alert('导出失败，请重试')
    } finally {
      setLoading(false)
    }
  }, [selectedRows, data, filteredData])

  // 刷新数据
  const refreshData = useCallback(() => {
    setLoading(true)
    // 模拟数据刷新
    setTimeout(() => {
      setData([...initialData])
      setLoading(false)
    }, 1000)
  }, [initialData])

  // 计算选择状态
  const currentPageIds = paginatedData.map(item => item.id)
  const selectedInCurrentPage = currentPageIds.filter(id => selectedRows.has(id))
  const isAllSelected = currentPageIds.length > 0 && selectedInCurrentPage.length === currentPageIds.length
  const isIndeterminate = selectedInCurrentPage.length > 0 && selectedInCurrentPage.length < currentPageIds.length

  const tableState: TableState = {
    data: paginatedData,
    filteredData,
    selectedRows,
    sortConfig,
    filterConfig,
    paginationConfig: {
      ...paginationConfig,
      total: filteredData.length,
    },
    loading,
  }

  const tableActions: TableActions = {
    handleSort,
    handleSearch,
    handleFilter,
    clearFilters,
    handlePageChange,
    handlePageSizeChange,
    handleSelectRow,
    handleSelectAll,
    handleClearSelection,
    handleBatchDelete,
    handleBatchExport,
    refreshData,
  }

  // 添加选择状态到返回值
  const extendedTableState = {
    ...tableState,
    isAllSelected,
    isIndeterminate,
    selectedCount: selectedRows.size,
  }

  return [extendedTableState as any, tableActions]
} 