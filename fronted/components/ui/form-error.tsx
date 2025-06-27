import * as React from "react"
import { AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export interface FormErrorProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

const FormError = React.forwardRef<HTMLDivElement, FormErrorProps>(
  ({ className, children, ...props }, ref) => {
    if (!children) return null

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center gap-2 text-sm text-red-600 mt-1",
          className
        )}
        {...props}
      >
        <AlertCircle className="h-4 w-4 shrink-0" />
        <span>{children}</span>
      </div>
    )
  }
)
FormError.displayName = "FormError"

export { FormError } 