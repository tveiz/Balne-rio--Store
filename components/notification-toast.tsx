"use client"
import { X, CheckCircle2, XCircle, Info, AlertTriangle } from "lucide-react"
import { useNotificationStore } from "@/lib/stores/notification-store"

export function NotificationToast() {
  const { notifications, removeNotification } = useNotificationStore()

  const icons = {
    success: CheckCircle2,
    error: XCircle,
    info: Info,
    warning: AlertTriangle,
  }

  const colors = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500",
    warning: "bg-yellow-500",
  }

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      {notifications.map((notification) => {
        const Icon = icons[notification.type]
        return (
          <div
            key={notification.id}
            className={`${colors[notification.type]} text-white p-4 rounded-lg shadow-lg flex items-start gap-3 animate-in slide-in-from-right`}
          >
            <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <p className="flex-1 text-sm">{notification.message}</p>
            <button
              onClick={() => removeNotification(notification.id)}
              className="text-white/80 hover:text-white transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
