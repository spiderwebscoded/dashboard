
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export function Toaster() {
  const { toasts } = useToast()
  const [mounted, setMounted] = useState(false)

  // Handle mounted state for animation
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast 
            key={id} 
            {...props} 
            className={cn(
              "group backdrop-blur-lg bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 shadow-lg",
              "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-right-full",
              "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-right-full",
              "dark:shadow-2xl transition-all duration-300",
              props.variant === "destructive" && "destructive group border-destructive bg-destructive text-destructive-foreground",
              mounted ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
            )}
          >
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription className="text-gray-600 dark:text-gray-400">{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose className="rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" />
          </Toast>
        )
      })}
      <ToastViewport className="p-4 md:p-6 md:max-w-sm" />
    </ToastProvider>
  )
}
