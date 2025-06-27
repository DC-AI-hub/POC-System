import React from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface PaginationProps {
  currentPage: number
  totalPages: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  showSizeChanger?: boolean
  showQuickJumper?: boolean
  showTotal?: boolean
  className?: string
}

const PAGE_SIZE_OPTIONS = [
  { value: 10, label: "10条/页" },
  { value: 20, label: "20条/页" },
  { value: 50, label: "50条/页" },
  { value: 100, label: "100条/页" },
]

export function Pagination({
  currentPage,
  totalPages,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  showSizeChanger = true,
  showQuickJumper = false,
  showTotal = true,
  className,
}: PaginationProps) {
  // 计算显示的页码
  const getVisiblePages = () => {
    const delta = 2 // 当前页前后显示的页数
    const range = []
    const rangeWithDots = []

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages)
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots
  }

  const visiblePages = getVisiblePages()

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page)
    }
  }

  const handlePageSizeChange = (newPageSize: string) => {
    onPageSizeChange(Number(newPageSize))
  }

  if (totalPages <= 1 && !showTotal) return null

  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      {/* 总数显示 */}
      {showTotal && (
        <div className="text-sm text-gray-600">
          共 {total} 条记录
        </div>
      )}

      <div className="flex items-center gap-2">
        {/* 每页显示数量选择器 */}
        {showSizeChanger && (
          <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* 分页按钮 */}
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            {/* 第一页 */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>

            {/* 上一页 */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* 页码 */}
            {visiblePages.map((page, index) => (
              <React.Fragment key={index}>
                {page === '...' ? (
                  <span className="flex h-8 w-8 items-center justify-center text-sm text-gray-500">
                    ...
                  </span>
                ) : (
                  <Button
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page as number)}
                    className="h-8 w-8 p-0"
                  >
                    {page}
                  </Button>
                )}
              </React.Fragment>
            ))}

            {/* 下一页 */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            {/* 最后一页 */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* 快速跳转 */}
        {showQuickJumper && totalPages > 1 && (
          <div className="flex items-center gap-2 text-sm">
            <span>跳至</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              className="w-12 h-8 px-2 text-center border border-gray-300 rounded"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const value = parseInt((e.target as HTMLInputElement).value)
                  if (value >= 1 && value <= totalPages) {
                    handlePageChange(value)
                  }
                }
              }}
            />
            <span>页</span>
          </div>
        )}
      </div>
    </div>
  )
}
