import * as React from "react"
import { cn } from "../../lib/utils"

const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default' | 'outline' }>(({ className, variant = 'default', ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50",
        variant === 'default' ? "bg-blue-600 text-white hover:bg-blue-500 shadow-sm" : "border border-slate-700 bg-transparent hover:bg-slate-800 text-slate-300",
        "h-9 px-4 py-2",
        className
      )}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button }
