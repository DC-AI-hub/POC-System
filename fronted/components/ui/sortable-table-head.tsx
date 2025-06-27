import React from "react"
import { TableHead } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { type SortDirection } from "@/lib/types/data-management"

interface SortableTableHeadProps {
  children: React.ReactNode
  sortKey?: string
  currentSortKey?: string | null
  currentSortDirection?: SortDirection
  onSort?: (key: any) => void
  className?: string
  align?: 'left' | 'center' | 'right'
}

export function SortableTableHead({
  children,
  sortKey,
  currentSortKey,
  currentSortDirection,
  onSort,
  className,
  align = 'left',
}: SortableTableHeadProps) {
  const isActive = sortKey && currentSortKey === sortKey
  const isSortable = !!sortKey && !!onSort

  const getSortIcon = () => {
    if (!isActive || !currentSortDirection) {
      return <ArrowUpDown className="h-4 w-4" />
    }
    return currentSortDirection === 'asc' 
      ? <ArrowUp className="h-4 w-4" />
      : <ArrowDown className="h-4 w-4" />
  }

  const handleSort = () => {
    if (isSortable) {
      onSort(sortKey)
    }
  }

  if (!isSortable) {
    return (
      <TableHead className={cn(className, {
        'text-center': align === 'center',
        'text-right': align === 'right',
      })}>
        {children}
      </TableHead>
    )
  }

  return (
    <TableHead className={cn(className, {
      'text-center': align === 'center',
      'text-right': align === 'right',
    })}>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSort}
        className={cn(
          "h-auto p-0 font-semibold hover:bg-transparent",
          isActive && "text-blue-600"
        )}
      >
        <span className="flex items-center gap-1">
          {children}
          <span className={cn(
            "opacity-50 transition-opacity",
            isActive && "opacity-100"
          )}>
            {getSortIcon()}
          </span>
        </span>
      </Button>
    </TableHead>
  )
} 