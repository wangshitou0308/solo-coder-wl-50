import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Leaf, Search, Bell, User, ChevronDown, LogOut, LayoutDashboard, Heart, Shield, AlertTriangle, Clock, X, MapPin, FileText, MessageSquareHeart, ClipboardList, Settings, BarChart3, Ticket } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { cn } from '@/lib/utils'

const roleLabels = { donor: '捐赠者', claimant: '需求者', admin: '管理员' }

export default function Navbar() {
  const navigate = useNavigate()
  const { currentUser, role, setRole, searchKeyword, setSearchKeyword, foods, notifications, fetchNotifications } = useStore()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const nearExpiryFoods = foods.filter((f) => {
    const diff = new Date(f.expiryDate).getTime() - Date.now()
    return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000 && f.status === 'available'
  })

  const nearExpiryCount = nearExpiryFoods.length
  const unreadNotificationCount = notifications.filter(n => !n.read).length

  const roles: Array<'donor' | 'claimant' | 'admin'> = ['donor', 'claimant', 'admin']

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-200/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
              食物银行
            </span>
          </div>

          <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="搜索食物..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-stone-100 border border-transparent focus:border-primary-300 focus:bg-white focus:outline-none transition-all text-sm"
              />
            </div>
          </div>

          <div className="hidden md:flex items-center gap-1 bg-stone-100 rounded-xl p-1">
            {roles.map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  role === r
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                {roleLabels[r]}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 ml-4">
            <div className="relative">
              <button
                onClick={() => {
                  navigate('/notifications')
                  setNotifOpen(false)
                }}
                className="relative p-2 rounded-xl hover:bg-stone-100 transition-colors"
              >
                <Bell className="w-5 h-5 text-stone-500" />
                {(nearExpiryCount + unreadNotificationCount) > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {nearExpiryCount + unreadNotificationCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <>
                  <div
                    className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-lg border border-stone-200 z-50 overflow-hidden"
                    style={{ pointerEvents: 'auto' }}
                  >
                    <div className="px-4 py-3 border-b border-stone-100 flex items-center justify-between">
                      <p className="font-semibold text-stone-800 text-sm">食品安全提醒</p>
                      <button onClick={(e) => { e.stopPropagation(); setNotifOpen(false) }} className="text-stone-400 hover:text-stone-600">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {nearExpiryCount === 0 ? (
                        <div className="py-8 text-center">
                          <Clock className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                          <p className="text-sm text-stone-400">暂无临期食物提醒</p>
                        </div>
                      ) : (
                        nearExpiryFoods.map((food) => {
                          const diffDays = Math.ceil((new Date(food.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                          return (
                            <div
                              key={food.id}
                              onClick={(e) => {
                                e.stopPropagation()
                                setNotifOpen(false)
                                navigate(`/food/${food.id}`)
                              }}
                              className="px-4 py-3 hover:bg-stone-50 cursor-pointer transition-colors border-b border-stone-50 last:border-0"
                            >
                              <div className="flex items-center gap-3">
                                <div className={cn(
                                  'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                                  diffDays <= 1 ? 'bg-red-100' : 'bg-amber-100',
                                )}>
                                  <AlertTriangle className={cn(
                                    'w-4 h-4',
                                    diffDays <= 1 ? 'text-red-500' : 'text-amber-500',
                                  )} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-stone-800 truncate">{food.name}</p>
                                  <p className={cn(
                                    'text-xs mt-0.5',
                                    diffDays <= 1 ? 'text-red-500' : 'text-amber-600',
                                  )}>
                                    {diffDays <= 1 ? `⚠️ 仅剩${diffDays}天过期` : `剩余${diffDays}天过期`} · {food.category}
                                  </p>
                                </div>
                                <span className="text-xs text-stone-400">{food.weight}</span>
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>
                    {nearExpiryCount > 0 && (
                      <div className="px-4 py-2.5 bg-stone-50 border-t border-stone-100">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setNotifOpen(false)
                            navigate('/')
                          }}
                          className="text-xs text-primary-600 font-medium hover:text-primary-700 transition-colors"
                        >
                          查看全部在架食物 →
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                </>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-stone-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-300 to-secondary-400 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="hidden sm:block text-sm font-medium text-stone-700">{currentUser.name}</span>
                <ChevronDown className="w-4 h-4 text-stone-400" />
              </button>

              {userMenuOpen && (
                <>
                  <div
                    className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-lg border border-stone-200 py-2 z-50"
                    style={{ pointerEvents: 'auto' }}
                  >
                    <div className="px-4 py-3 border-b border-stone-100">
                      <p className="font-medium text-stone-800">{currentUser.name}</p>
                      <p className="text-xs text-stone-400 mt-0.5">{currentUser.phone}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setUserMenuOpen(false)
                        navigate('/profile')
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-stone-600 hover:bg-stone-50"
                    >
                      <Heart className="w-4 h-4" /> 个人中心
                    </button>
                    {role === 'admin' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setUserMenuOpen(false)
                          navigate('/admin')
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-stone-600 hover:bg-stone-50"
                      >
                        <Shield className="w-4 h-4" /> 管理后台
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setUserMenuOpen(false)
                        navigate('/dashboard')
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-stone-600 hover:bg-stone-50"
                    >
                      <LayoutDashboard className="w-4 h-4" /> 数据看板
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setUserMenuOpen(false)
                        navigate('/notifications')
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-stone-600 hover:bg-stone-50"
                    >
                      <Bell className="w-4 h-4" /> 消息通知
                      {unreadNotificationCount > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                          {unreadNotificationCount}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setUserMenuOpen(false)
                        navigate('/vouchers')
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-stone-600 hover:bg-stone-50"
                    >
                      <Ticket className="w-4 h-4" /> 领取凭证
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setUserMenuOpen(false)
                        navigate('/fridge-map')
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-stone-600 hover:bg-stone-50"
                    >
                      <MapPin className="w-4 h-4" /> 冰箱地图
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setUserMenuOpen(false)
                        navigate('/needs')
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-stone-600 hover:bg-stone-50"
                    >
                      <FileText className="w-4 h-4" /> 物资需求
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setUserMenuOpen(false)
                        navigate('/reviews')
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-stone-600 hover:bg-stone-50"
                    >
                      <MessageSquareHeart className="w-4 h-4" /> 评价与感谢
                    </button>
                    {role === 'admin' && (
                      <>
                        <div className="border-t border-stone-100 my-1" />
                        <p className="px-4 py-1.5 text-xs font-medium text-stone-400">管理员功能</p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setUserMenuOpen(false)
                            navigate('/inspection-tasks')
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-stone-600 hover:bg-stone-50"
                        >
                          <ClipboardList className="w-4 h-4" /> 巡检任务
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setUserMenuOpen(false)
                            navigate('/alert-rules')
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-stone-600 hover:bg-stone-50"
                        >
                          <Settings className="w-4 h-4" /> 告警规则
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setUserMenuOpen(false)
                            navigate('/analytics')
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-stone-600 hover:bg-stone-50"
                        >
                          <BarChart3 className="w-4 h-4" /> 高级分析
                        </button>
                      </>
                    )}
                    <div className="border-t border-stone-100 mt-1 pt-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setUserMenuOpen(false)
                          useStore.getState().logout()
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4" /> 退出登录
                      </button>
                    </div>
                  </div>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                </>
              )}
            </div>
          </div>
        </div>

        <div className="md:hidden pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="搜索食物..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-stone-100 border border-transparent focus:border-primary-300 focus:bg-white focus:outline-none transition-all text-sm"
            />
          </div>
          <div className="flex items-center gap-1 bg-stone-100 rounded-xl p-1 mt-2">
            {roles.map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  role === r
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-stone-500'
                }`}
              >
                {roleLabels[r]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
