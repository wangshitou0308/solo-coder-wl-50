import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Bell,
  CheckCircle,
  AlertTriangle,
  CalendarCheck,
  ShoppingBag,
  Clock,
  Info,
  Check,
  Circle,
  CheckCheck,
} from 'lucide-react'
import { useStore, type Notification } from '@/store/useStore'
import { cn } from '@/lib/utils'

const notificationTypeConfig: Record<
  Notification['type'],
  { icon: typeof Bell; color: string; bgColor: string }
> = {
  review_result: {
    icon: CheckCircle,
    color: 'text-primary-600',
    bgColor: 'bg-primary-50',
  },
  expiry_alert: {
    icon: AlertTriangle,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
  },
  reservation_success: {
    icon: CalendarCheck,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  claim_success: {
    icon: ShoppingBag,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  reservation_available: {
    icon: Clock,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  system_announcement: {
    icon: Info,
    color: 'text-stone-600',
    bgColor: 'bg-stone-50',
  },
}

const tabs = [
  { key: 'all', label: '全部' },
  { key: 'unread', label: '未读' },
  { key: 'read', label: '已读' },
] as const

type TabType = (typeof tabs)[number]['key']

export default function Notifications() {
  const navigate = useNavigate()
  const { notifications, fetchNotifications, markNotificationRead, markAllNotificationsRead } =
    useStore()
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const filteredNotifications = useMemo(() => {
    switch (activeTab) {
      case 'unread':
        return notifications.filter((n) => !n.read)
      case 'read':
        return notifications.filter((n) => n.read)
      default:
        return notifications
    }
  }, [notifications, activeTab])

  const sortedNotifications = useMemo(() => {
    return [...filteredNotifications].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }, [filteredNotifications])

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications])

  const handleMarkAsRead = async (notificationId: string) => {
    await markNotificationRead(notificationId)
  }

  const handleMarkAllAsRead = async () => {
    setIsLoading(true)
    await markAllNotificationsRead()
    setIsLoading(false)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes}分钟前`
    if (hours < 24) return `${hours}小时前`
    if (days < 7) return `${days}天前`
    return date.toLocaleDateString('zh-CN')
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-stone-500 hover:text-stone-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">返回</span>
        </button>
        <h1 className="text-xl font-bold text-stone-800">消息通知</h1>
        <div className="w-20" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-200/60 mb-6">
        <div className="flex items-center justify-between p-4 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-stone-800">通知中心</p>
              <p className="text-xs text-stone-400">
                共 {notifications.length} 条，{unreadCount} 条未读
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              disabled={isLoading}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                isLoading
                  ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                  : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
              )}
            >
              <CheckCheck className="w-4 h-4" />
              全部已读
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 bg-stone-50 rounded-xl p-1 m-4">
          {tabs.map((tab) => {
            const count =
              tab.key === 'all'
                ? notifications.length
                : tab.key === 'unread'
                  ? unreadCount
                  : notifications.length - unreadCount
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5',
                  activeTab === tab.key
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-stone-500 hover:text-stone-700'
                )}
              >
                {tab.label}
                <span
                  className={cn(
                    'text-xs px-1.5 py-0.5 rounded-full',
                    activeTab === tab.key
                      ? 'bg-primary-100 text-primary-600'
                      : 'bg-stone-200 text-stone-500'
                  )}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="space-y-3">
        {sortedNotifications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200/60 py-20">
            <div className="flex flex-col items-center justify-center">
              <div className="w-20 h-20 rounded-2xl bg-stone-100 flex items-center justify-center mb-4">
                <Bell className="w-10 h-10 text-stone-300" />
              </div>
              <p className="text-lg font-medium text-stone-400">暂无通知</p>
              <p className="text-sm text-stone-300 mt-1">
                {activeTab === 'unread'
                  ? '您已阅读所有通知'
                  : activeTab === 'read'
                    ? '还没有已读的通知'
                    : '有新消息时会在这里显示'}
              </p>
            </div>
          </div>
        ) : (
          sortedNotifications.map((notification, index) => {
            const config = notificationTypeConfig[notification.type] || notificationTypeConfig.system_announcement
            const Icon = config.icon
            return (
              <div
                key={notification.id}
                className={cn(
                  'bg-white rounded-xl border p-4 flex items-start gap-4 transition-all cursor-pointer hover:shadow-md',
                  notification.read
                    ? 'border-stone-200/60 opacity-75'
                    : 'border-primary-200/60 shadow-sm'
                )}
                style={{ animationDelay: `${index * 0.05}s` }}
                onClick={() => !notification.read && handleMarkAsRead(notification.id)}
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                    config.bgColor
                  )}
                >
                  <Icon className={cn('w-5 h-5', config.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <h3
                      className={cn(
                        'text-sm font-medium truncate',
                        notification.read ? 'text-stone-500' : 'text-stone-800'
                      )}
                    >
                      {notification.title}
                    </h3>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!notification.read && (
                        <Circle className="w-2.5 h-2.5 fill-primary-500 text-primary-500" />
                      )}
                      <span className="text-xs text-stone-400 whitespace-nowrap">
                        {formatDate(notification.createdAt)}
                      </span>
                    </div>
                  </div>
                  <p
                    className={cn(
                      'text-sm mt-1 line-clamp-2',
                      notification.read ? 'text-stone-400' : 'text-stone-600'
                    )}
                  >
                    {notification.content}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <span
                      className={cn(
                        'text-xs font-medium px-2 py-0.5 rounded-full',
                        config.bgColor,
                        config.color
                      )}
                    >
                      {notification.type === 'review_result' && '审核结果'}
                      {notification.type === 'expiry_alert' && '临期提醒'}
                      {notification.type === 'reservation_success' && '预约成功'}
                      {notification.type === 'claim_success' && '核销成功'}
                      {notification.type === 'reservation_available' && '预约可用'}
                      {notification.type === 'system_announcement' && '系统公告'}
                    </span>
                    {!notification.read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleMarkAsRead(notification.id)
                        }}
                        className="flex items-center gap-1 text-xs text-primary-500 hover:text-primary-600 font-medium"
                      >
                        <Check className="w-3.5 h-3.5" />
                        标为已读
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
