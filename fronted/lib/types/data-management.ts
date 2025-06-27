export interface Employee {
  id: number
  name: string
  loginName: string
  employeeId: string
  employeeId2: string
  department: string
  supervisor: string
  phone: string
  type: string
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'in-progress'
  createTime?: string
  updateTime?: string
}

export type SortDirection = 'asc' | 'desc' | null

export interface SortConfig {
  key: keyof Employee | null
  direction: SortDirection
}

export interface FilterConfig {
  searchTerm: string
  departmentFilter: string
  statusFilter: string
  typeFilter: string
}

export interface PaginationConfig {
  currentPage: number
  pageSize: number
  total: number
}

export interface TableState {
  data: Employee[]
  filteredData: Employee[]
  selectedRows: Set<number>
  sortConfig: SortConfig
  filterConfig: FilterConfig
  paginationConfig: PaginationConfig
  loading: boolean
}

export interface TableActions {
  // 排序
  handleSort: (key: keyof Employee) => void
  
  // 过滤
  handleSearch: (searchTerm: string) => void
  handleFilter: (filterType: keyof FilterConfig, value: string) => void
  clearFilters: () => void
  
  // 分页
  handlePageChange: (page: number) => void
  handlePageSizeChange: (pageSize: number) => void
  
  // 选择
  handleSelectRow: (id: number) => void
  handleSelectAll: (checked: boolean) => void
  handleClearSelection: () => void
  
  // 批量操作
  handleBatchDelete: () => void
  handleBatchExport: () => void
  
  // 数据刷新
  refreshData: () => void
} 