import { useState, useEffect, useMemo } from 'react'
import { ClipboardCheck, Refrigerator, AlertTriangle, BarChart3, CheckCircle, XCircle, Trash2, Thermometer, Star, MapPin, Edit2, Save, X, FileText, TrendingUp, Calendar } from 'lucide-react'
import { useStore, type Fridge } from '@/store/useStore'
import { cn } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts'

type AdminTab = '待审核' | '冰箱巡查' | '过期处理' | '每日统计'

const tabs: AdminTab[] = ['待审核', '冰箱巡查', '过期处理', '每日统计']

export default function Admin() {
  const { foods, fridges, fetchFoods, fetchFridges, updateFoodStatus, inspectFridge, currentUser } = useStore()
  const [activeTab, setActiveTab] = useState<AdminTab>('待审核')
  const [inspectingFridge, setInspectingFridge] = useState<string | null>(null)
  const [inspectionData, setInspectionData] = useState({ temperature: 4, cleanliness: 5, notes: '' })
  const [savingInspection, setSavingInspection] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    fetchFoods()
    fetchFridges()
  }, [fetchFoods, fetchFridges])

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(t)
    }
  }, [toast])

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
  }

  const pendingFoods = foods.filter((f) => f.status === 'pending_review')
  const expiredFoods = foods.filter((f) => f.status === 'expired' || f.status === 'spoiled' || f.status === 'rejected')
  const nearExpiryFoods = foods.filter((f) => {
    const diff = new Date(f.expiryDate).getTime() - Date.now()
    return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000 && (f.status === 'available' || f.status === 'reserved')
  })

  const dailyStats = useMemo(() => {
    const stats: Record<string, { donated: number; claimed: number; wasted: number; reviewed: number }> = {}
    foods.forEach((f) => {
      const date = f.createdAt
      if (!stats[date]) stats[date] = { donated: 0, claimed: 0, wasted: 0, reviewed: 0 }
      stats[date].donated++
      if (f.status === 'claimed') stats[date].claimed++
      if (f.status === 'expired' || f.status === 'spoiled') stats[date].wasted++
      if (f.status !== 'pending_review') stats[date].reviewed++
    })
    return Object.entries(stats)
      .map(([date, data]) => ({ date: date.slice(5), ...data }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-14)
  }, [foods])

  const summaryStats = useMemo(() => ({
    todayDonated: foods.filter((f) => f.createdAt === new Date().toISOString().split('T')[0]).length,
    totalPending: pendingFoods.length,
    totalAvailable: foods.filter((f) => f.status === 'available').length,
    totalClaimed: foods.filter((f) => f.status === 'claimed').length,
    totalWasted: foods.filter((f) => f.status === 'expired' || f.status === 'spoiled').length,
    fridgeWarnings: fridges.filter((f) => f.status !== '正常').length,
  }), [foods, fridges, pendingFoods])

  const handleApprove = async (foodId: string) => {
    const success = await updateFoodStatus(foodId, 'available')
    showToast(success ? '食物已通过审核并上架' : '操作失败', success ? 'success' : 'error')
  }

  const handleReject = async (foodId: string) => {
    const success = await updateFoodStatus(foodId, 'rejected')
    showToast(success ? '已驳回捐赠申请' : '操作失败', success ? 'success' : 'error')
  }

  const handleMarkSpoiled = async (foodId: string) => {
    const success = await updateFoodStatus(foodId, 'spoiled')
    showToast(success ? '已标记为变质食物' : '操作失败', success ? 'success' : 'error')
  }

  const handleRemoveExpired = async (foodId: string) => {
    const success = await updateFoodStatus(foodId, 'rejected')
    showToast(success ? '已下架处理' : '操作失败', success ? 'success' : 'error')
  }

  const startInspection = (fridge: Fridge) => {
    setInspectingFridge(fridge.id)
    setInspectionData({
      temperature: fridge.temperature,
      cleanliness: fridge.cleanliness,
      notes: '',
    })
  }

  const saveInspection = async () => {
    if (!inspectingFridge) return
    setSavingInspection(true)
    const success = await inspectFridge(inspectingFridge, inspectionData)
    setSavingInspection(false)
    if (success) {
      showToast('巡查记录已保存')
      setInspectingFridge(null)
    } else {
      showToast('保存失败', 'error')
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative">
      {toast && (
        <div className={cn(
          'fixed top-20 right-6 z-50 rounded-xl shadow-lg px-5 py-3 flex items-center gap-3 animate-fade-in-up border',
          toast.type === 'success' ? 'bg-secondary-50 border-secondary-200 text-secondary-800' : 'bg-red-50 border-red-200 text-red-800',
        )}>
          {toast.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-secondary-500" />
          ) : (
            <XCircle className="w-5 h-5 text-red-500" />
          )}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
            <ClipboardCheck className="w-7 h-7 text-primary-500" />
            管理后台
          </h1>
          <p className="text-sm text-stone-400 mt-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
            {' · '}
            管理员：{currentUser.name}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {[
          { label: '今日新增', value: summaryStats.todayDonated, color: 'from-primary-400 to-primary-500', icon: TrendingUp },
          { label: '待审核', value: summaryStats.totalPending, color: 'from-amber-400 to-amber-500', icon: ClipboardCheck, badge: true },
          { label: '在架食物', value: summaryStats.totalAvailable, color: 'from-secondary-400 to-secondary-500', icon: CheckCircle },
          { label: '已领取', value: summaryStats.totalClaimed, color: 'from-blue-400 to-blue-500', icon: BarChart3 },
          { label: '已损耗', value: summaryStats.totalWasted, color: 'from-red-400 to-red-500', icon: Trash2 },
          { label: '冰箱预警', value: summaryStats.fridgeWarnings, color: 'from-purple-400 to-purple-500', icon: AlertTriangle, warn: summaryStats.fridgeWarnings > 0 },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className={cn(
              'relative rounded-2xl p-4 text-white overflow-hidden',
              `bg-gradient-to-br ${stat.color}`,
            )}>
              <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-6 translate-x-6" />
              <div className="flex items-center justify-between mb-2 relative">
                <Icon className="w-5 h-5 text-white/80" />
                {stat.badge && stat.value > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold border-2 border-white">
                    {stat.value}
                  </span>
                )}
                {stat.warn && stat.value > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse" />
                )}
              </div>
              <div className="relative">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-white/80 mt-0.5">{stat.label}</p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex items-center gap-1 bg-stone-100 rounded-xl p-1 mb-6 overflow-x-auto">
        {tabs.map((tab) => {
          const icons = {
            '待审核': ClipboardCheck,
            '冰箱巡查': Refrigerator,
            '过期处理': AlertTriangle,
            '每日统计': BarChart3,
          }
          const Icon = icons[tab]
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex-1 sm:flex-none justify-center',
                activeTab === tab ? 'bg-white text-primary-600 shadow-sm' : 'text-stone-500 hover:text-stone-700',
              )}
            >
              <Icon className="w-4 h-4" />
              {tab}
              {tab === '待审核' && pendingFoods.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-medium">
                  {pendingFoods.length}
                </span>
              )}
              {tab === '过期处理' && nearExpiryFoods.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center font-medium">
                  {nearExpiryFoods.length}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {activeTab === '待审核' && (
        <div className="space-y-4">
          {pendingFoods.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-stone-200/60">
              <div className="w-16 h-16 rounded-2xl bg-secondary-50 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-secondary-400" />
              </div>
              <p className="text-lg font-medium text-stone-600">太棒了！</p>
              <p className="text-sm text-stone-400 mt-1">暂无待审核食物，所有捐赠都已处理</p>
            </div>
          ) : (
            pendingFoods.map((food, index) => (
              <div key={food.id} className="bg-white rounded-2xl border border-stone-200/60 p-5 sm:p-6 card-enter" style={{ animationDelay: `${index * 0.05}s` }}>
                <div className="flex items-start justify-between gap-4 flex-col sm:flex-row">
                  <div className="flex items-start gap-4 flex-1">
                    {food.images && food.images.length > 0 ? (
                      <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-stone-100">
                        <img src={food.images[0]} alt={food.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl font-bold text-primary-400">{food.name.charAt(0)}</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-stone-800 text-lg">{food.name}</h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary-50 text-primary-600 font-medium">
                          {food.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-stone-400 mb-2 flex-wrap">
                        <span className="flex items-center gap-1"><FileText className="w-3 h-3" />{food.quantity}份 · {food.weight}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{food.pickupMethod}</span>
                        <span className="flex items-center gap-1"><Thermometer className="w-3 h-3" />保质期至 {food.expiryDate}</span>
                      </div>
                      <p className="text-sm text-stone-400 mb-2">
                        捐赠者：<span className="font-medium text-stone-600">{food.donorName}</span>
                        {' · '}
                        提交时间：{food.createdAt}
                      </p>
                      {food.description && (
                        <p className="text-sm text-stone-500 bg-stone-50 rounded-lg px-3 py-2">
                          {food.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:flex-col sm:items-stretch w-full sm:w-auto">
                    <button
                      onClick={() => handleApprove(food.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-secondary-500 to-secondary-600 text-white text-sm font-medium shadow-sm hover:shadow-md transition-all"
                    >
                      <CheckCircle className="w-4 h-4" /> 通过上架
                    </button>
                    <button
                      onClick={() => handleReject(food.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl border-2 border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 transition-colors"
                    >
                      <XCircle className="w-4 h-4" /> 驳回
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === '冰箱巡查' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {fridges.map((fridge) => (
            <div key={fridge.id} className="bg-white rounded-2xl border border-stone-200/60 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                    <Refrigerator className="w-5 h-5 text-primary-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-stone-800">{fridge.name}</h3>
                  </div>
                </div>
                <span className={cn(
                  'text-xs font-medium px-2.5 py-1 rounded-full',
                  fridge.status === '正常' && 'bg-secondary-50 text-secondary-600',
                  fridge.status === '温度异常' && 'bg-red-50 text-red-600',
                  fridge.status === '需清洁' && 'bg-amber-50 text-amber-600',
                )}>
                  {fridge.status}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-stone-500 mb-4 pb-4 border-b border-stone-100">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="text-xs leading-relaxed">{fridge.location}</span>
              </div>

              {inspectingFridge === fridge.id ? (
                <div className="space-y-4 p-4 bg-stone-50 rounded-xl -mx-1">
                  <div>
                    <label className="flex items-center justify-between text-xs font-medium text-stone-600 mb-2">
                      <span className="flex items-center gap-1">
                        <Thermometer className="w-3.5 h-3.5" /> 当前温度
                      </span>
                      <span className={cn('font-bold text-lg',
                        inspectionData.temperature > 6 ? 'text-red-500' : inspectionData.temperature > 4 ? 'text-amber-500' : 'text-secondary-500',
                      )}>
                        {inspectionData.temperature}°C
                      </span>
                    </label>
                    <input
                      type="range"
                      min="-5"
                      max="15"
                      value={inspectionData.temperature}
                      onChange={(e) => setInspectionData({ ...inspectionData, temperature: Number(e.target.value) })}
                      className="w-full accent-primary-500"
                    />
                    <div className="flex justify-between text-xs text-stone-400 mt-1">
                      <span>-5°C</span>
                      <span className="text-secondary-500">理想: 2-4°C</span>
                      <span>15°C</span>
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center justify-between text-xs font-medium text-stone-600 mb-2">
                      清洁度评分
                      <span className="font-bold text-lg text-amber-500">{inspectionData.cleanliness}/5</span>
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setInspectionData({ ...inspectionData, cleanliness: s })}
                          className="flex-1 py-2 rounded-lg border-2 transition-all flex items-center justify-center"
                        >
                          <Star className={cn(
                            'w-5 h-5 transition-all',
                            s <= inspectionData.cleanliness
                              ? 'text-amber-400 fill-amber-400 scale-110'
                              : 'text-stone-200',
                          )} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-2">巡查备注</label>
                    <textarea
                      value={inspectionData.notes}
                      onChange={(e) => setInspectionData({ ...inspectionData, notes: e.target.value })}
                      rows={2}
                      placeholder="记录异常情况或其他说明..."
                      className="w-full px-3 py-2 rounded-lg border border-stone-200 focus:outline-none focus:border-primary-400 text-sm resize-none"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={saveInspection}
                      disabled={savingInspection}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-secondary-500 to-secondary-600 text-white text-sm font-medium shadow-sm hover:shadow-md transition-all disabled:opacity-60"
                    >
                      {savingInspection ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      保存记录
                    </button>
                    <button
                      onClick={() => setInspectingFridge(null)}
                      className="px-4 py-2.5 rounded-xl border-2 border-stone-200 text-stone-500 text-sm font-medium hover:bg-stone-50 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-sm text-stone-600">
                        <Thermometer className="w-4 h-4" /> 温度
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn('text-sm font-bold',
                          fridge.temperature > 6 ? 'text-red-500' : fridge.temperature > 4 ? 'text-amber-500' : 'text-secondary-500',
                        )}>
                          {fridge.temperature}°C
                        </span>
                        {fridge.temperature > 6 && (
                          <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">偏高</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-stone-600">清洁度</span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={cn(
                            'w-4 h-4',
                            s <= fridge.cleanliness ? 'text-amber-400 fill-amber-400' : 'text-stone-200',
                          )} />
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-stone-600">库存容量</span>
                        <span className="text-xs text-stone-400">{fridge.currentStock}/{fridge.capacity} 件</span>
                      </div>
                      <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all',
                            fridge.currentStock / fridge.capacity > 0.85 ? 'bg-gradient-to-r from-red-400 to-red-500'
                              : fridge.currentStock / fridge.capacity > 0.6 ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                              : 'bg-gradient-to-r from-primary-400 to-secondary-400',
                          )}
                          style={{ width: `${(fridge.currentStock / fridge.capacity) * 100}%` }}
                        />
                      </div>
                      {(fridge.currentStock / fridge.capacity > 0.85) && (
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> 库存即将满载
                        </p>
                      )}
                    </div>
                  </div>

                  {fridge.lastInspected && (
                    <p className="text-xs text-stone-400 mb-3 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      上次巡查：{fridge.lastInspected}
                    </p>
                  )}

                  <button
                    onClick={() => startInspection(fridge)}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-primary-50 to-secondary-50 text-primary-600 text-sm font-medium border-2 border-primary-100 hover:border-primary-300 hover:shadow-sm transition-all"
                  >
                    <Edit2 className="w-4 h-4" /> 开始巡查
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === '过期处理' && (
        <div className="space-y-4">
          {nearExpiryFoods.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-amber-700 mb-3 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                即将过期预警（3天内）<span className="text-amber-500">({nearExpiryFoods.length}件)</span>
              </h2>
              <div className="space-y-3">
                {nearExpiryFoods.map((food) => {
                  const diffDays = Math.ceil((new Date(food.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                  return (
                    <div key={food.id} className="bg-white rounded-xl border-2 border-amber-200 p-5 bg-gradient-to-r from-amber-50/50 to-transparent">
                      <div className="flex items-start justify-between gap-4 flex-col sm:flex-row">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-semibold text-stone-800">{food.name}</h3>
                            <span className={cn(
                              'text-xs font-medium px-2 py-0.5 rounded-full animate-pulse',
                              diffDays <= 1 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600',
                            )}>
                              {diffDays <= 1 ? `⚠️ ${diffDays}天后过期` : `剩余${diffDays}天`}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary-50 text-primary-600">
                              {food.category}
                            </span>
                            {food.status === 'reserved' && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-600">已预约</span>
                            )}
                          </div>
                          <p className="text-xs text-stone-400">
                            过期日期：{food.expiryDate} · {food.quantity}份 · {food.weight} · {food.pickupMethod}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <button
                            onClick={() => handleMarkSpoiled(food.id)}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg border border-amber-200 text-amber-600 text-xs hover:bg-amber-50 transition-colors"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" /> 标记变质
                          </button>
                          <button
                            onClick={() => handleRemoveExpired(food.id)}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg border border-red-200 text-red-500 text-xs hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> 提前下架
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-sm font-semibold text-red-700 mb-3 mt-6 flex items-center gap-1.5">
              <Trash2 className="w-4 h-4 text-red-500" />
              已过期/变质食物 ({expiredFoods.length}件待处理)
            </h2>
            {expiredFoods.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-stone-200/60">
                <CheckCircle className="w-12 h-12 text-secondary-300 mx-auto mb-3" />
                <p className="text-stone-400 text-sm">暂无过期或变质食物</p>
              </div>
            ) : (
              <div className="space-y-3">
                {expiredFoods.map((food) => {
                  const isExpired = food.status === 'expired'
                  const isSpoiled = food.status === 'spoiled'
                  return (
                    <div key={food.id} className="bg-white rounded-xl border border-red-200 p-5 bg-gradient-to-r from-red-50/30 to-transparent">
                      <div className="flex items-start justify-between gap-4 flex-col sm:flex-row">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-semibold text-stone-800 line-through decoration-red-400">{food.name}</h3>
                            <span className={cn(
                              'text-xs font-medium px-2 py-0.5 rounded-full',
                              isExpired && 'bg-red-100 text-red-600',
                              isSpoiled && 'bg-stone-200 text-stone-600',
                              food.status === 'rejected' && 'bg-orange-100 text-orange-600',
                            )}>
                              {isExpired ? '已过期' : isSpoiled ? '已变质' : '已驳回'}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-500">
                              {food.category}
                            </span>
                          </div>
                          <p className="text-xs text-stone-400">
                            原过期日期：{food.expiryDate} · {food.quantity}份 · {food.weight}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveExpired(food.id)}
                          className="flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl bg-red-500 text-white text-xs font-medium hover:bg-red-600 transition-colors shadow-sm"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> 确认销毁
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === '每日统计' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-stone-200/60 p-6">
            <h2 className="text-lg font-bold text-stone-800 mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary-500" />
              近两周食物流转趋势
            </h2>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={dailyStats}>
                <defs>
                  <linearGradient id="colorDonated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F97316" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorClaimed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F4" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#78716C' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#78716C' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #E7E5E4',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  }}
                />
                <Legend />
                <Area type="monotone" dataKey="donated" name="新增捐赠" stroke="#F97316" strokeWidth={2} fill="url(#colorDonated)" />
                <Area type="monotone" dataKey="claimed" name="完成领取" stroke="#22C55E" strokeWidth={2} fill="url(#colorClaimed)" />
                <Area type="monotone" dataKey="wasted" name="损耗数量" stroke="#EF4444" strokeWidth={2} fill="rgba(239,68,68,0.1)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200/60 overflow-hidden">
            <div className="p-6 border-b border-stone-100">
              <h2 className="text-lg font-bold text-stone-800">每日详细数据</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-stone-50">
                    <th className="text-left text-xs font-semibold text-stone-600 px-6 py-4">日期</th>
                    <th className="text-center text-xs font-semibold text-stone-600 px-6 py-4">新增捐赠</th>
                    <th className="text-center text-xs font-semibold text-stone-600 px-6 py-4">已领取</th>
                    <th className="text-center text-xs font-semibold text-stone-600 px-6 py-4">审核通过</th>
                    <th className="text-center text-xs font-semibold text-stone-600 px-6 py-4">损耗量</th>
                    <th className="text-center text-xs font-semibold text-stone-600 px-6 py-4">领取率</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {dailyStats.slice().reverse().map((row) => {
                    const rate = row.donated > 0 ? Math.round((row.claimed / row.donated) * 100) : 0
                    return (
                      <tr key={row.date} className="hover:bg-stone-50/50 transition-colors">
                        <td className="text-sm font-medium text-stone-700 px-6 py-4">{row.date}</td>
                        <td className="text-sm text-center px-6 py-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-50 text-primary-600 font-medium">
                            {row.donated}
                          </span>
                        </td>
                        <td className="text-sm text-center px-6 py-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-50 text-secondary-600 font-medium">
                            {row.claimed}
                          </span>
                        </td>
                        <td className="text-sm text-stone-500 text-center px-6 py-4">{row.reviewed}</td>
                        <td className="text-sm text-center px-6 py-4">
                          <span className={cn(
                            'inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-medium',
                            row.wasted > 0 ? 'bg-red-50 text-red-500' : 'bg-stone-50 text-stone-400',
                          )}>
                            {row.wasted}
                          </span>
                        </td>
                        <td className="text-sm text-center px-6 py-4">
                          <div className="inline-flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  'h-full rounded-full',
                                  rate >= 80 ? 'bg-gradient-to-r from-secondary-400 to-secondary-500'
                                    : rate >= 60 ? 'bg-gradient-to-r from-primary-400 to-primary-500'
                                    : 'bg-gradient-to-r from-amber-400 to-amber-500',
                                )}
                                style={{ width: `${Math.min(rate, 100)}%` }}
                              />
                            </div>
                            <span className={cn(
                              'text-xs font-medium',
                              rate >= 80 ? 'text-secondary-600' : rate >= 60 ? 'text-primary-600' : 'text-amber-600',
                            )}>
                              {rate}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
