import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  RotateCcw,
  type LucideIcon 
} from "lucide-react"

import { cn } from "@/lib/utils"

// 状态类型定义
export type StatusType = 'draft' | 'pending' | 'approved' | 'rejected' | 'in-progress';

// 状态配置映射
const statusConfig: Record<StatusType, {
  label: string;
  icon: LucideIcon;
  colorClass: string;
}> = {
  draft: {
    label: '草稿',
    icon: FileText,
    colorClass: 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200'
  },
  pending: {
    label: '审批中',
    icon: Clock,
    colorClass: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200'
  },
  approved: {
    label: '已通过',
    icon: CheckCircle,
    colorClass: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200'
  },
  rejected: {
    label: '已拒绝',
    icon: XCircle,
    colorClass: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200'
  },
  'in-progress': {
    label: '处理中',
    icon: RotateCcw,
    colorClass: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200'
  }
}

const statusBadgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
  {
    variants: {
      size: {
        sm: "px-2 py-1 text-xs",
        default: "px-3 py-1.5 text-xs",
        lg: "px-4 py-2 text-sm",
      },
      clickable: {
        true: "cursor-pointer select-none active:scale-95",
        false: "cursor-default",
      },
    },
    defaultVariants: {
      size: "default",
      clickable: false,
    },
  }
)

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusBadgeVariants> {
  status: StatusType;
  children?: React.ReactNode;
  onClick?: () => void;
  showIcon?: boolean;
  size?: 'sm' | 'default' | 'lg';
}

const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ 
    className, 
    status, 
    children, 
    onClick, 
    showIcon = true, 
    size = "default",
    ...props 
  }, ref) => {
    const config = statusConfig[status]
    const Icon = config.icon
    const isClickable = !!onClick

    const handleClick = (e: React.MouseEvent) => {
      if (onClick) {
        e.preventDefault()
        e.stopPropagation()
        onClick()
      }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (onClick && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault()
        onClick()
      }
    }

    return (
      <span
        ref={ref}
        className={cn(
          statusBadgeVariants({ size, clickable: isClickable }),
          config.colorClass,
          className
        )}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={isClickable ? 0 : undefined}
        role={isClickable ? "button" : undefined}
        aria-label={`状态: ${config.label}${isClickable ? ', 点击操作' : ''}`}
        {...props}
      >
        {showIcon && (
          <Icon 
            className={cn(
              "shrink-0",
              size === 'sm' ? "w-3 h-3" : size === 'lg' ? "w-4 h-4" : "w-3.5 h-3.5"
            )} 
          />
        )}
        <span className="whitespace-nowrap">
          {children || config.label}
        </span>
      </span>
    )
  }
)

StatusBadge.displayName = "StatusBadge"

// 便捷的状态徽章组件
export const DraftBadge = (props: Omit<StatusBadgeProps, 'status'>) => (
  <StatusBadge status="draft" {...props} />
)

export const PendingBadge = (props: Omit<StatusBadgeProps, 'status'>) => (
  <StatusBadge status="pending" {...props} />
)

export const ApprovedBadge = (props: Omit<StatusBadgeProps, 'status'>) => (
  <StatusBadge status="approved" {...props} />
)

export const RejectedBadge = (props: Omit<StatusBadgeProps, 'status'>) => (
  <StatusBadge status="rejected" {...props} />
)

export const InProgressBadge = (props: Omit<StatusBadgeProps, 'status'>) => (
  <StatusBadge status="in-progress" {...props} />
)

export { StatusBadge, statusBadgeVariants, statusConfig } 