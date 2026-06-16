import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  SlidersHorizontal,
  X,
  RotateCcw,
  Clock,
  MapPin,
  User,
  AlertCircle,
  CheckCircle,
  XCircle,
  Package,
  PackageOpen,
  Zap,
  Filter,
  Calendar,
  Check,
  HandHeart,
  ListTodo,
  Plus,
} from 'lucide-react'
import { useStore, type MaterialNeed, type FoodCategory } from '@/store/useStore'
import { cn } from '@/lib/utils'

const statusOptions: Array<{ value: MaterialNeed['status']; label: string; color: string }> = [
  { value: 'open', label: '进行中', color: 'bg-blue-100 text-blue-700' },
  { value: 'matched', label: '已匹配', color: 'bg-purple-100 text-purple-700' },
  { value: 'fulfilled', label: '已完成', color: 'bg-green-100 text-green-700' },
  { value: 'cancelled', label: '已取消', color: 'bg-stone-100 text-stone-500' },
]

const urgencyOptions: Array<{ value: MaterialNeed['urgency']; label: string; color: string; bgColor: string }> = [
  { value: 'low', label: '低', color: 'text-green-600', bgColor: 'bg-green-50 border-green-200' },
  { value: 'medium', label: '中', color: 'text-yellow-600', bgColor: 'bg-yellow-50 border-yellow-200' },
  { value: 'high', label: '高', color: 'text-orange-600', bgColor: 'bg-orange-50 border-orange-200' },
  { value: 'urgent', label: '紧急', color: 'text-red-600', bgColor: 'bg-red-50 border-red-200' },
]

const categories: FoodCategory[] = ['生鲜果蔬', '熟食', '干货', '罐头', '烘焙', '冷冻食品']

const categoryIcons: Record<FoodCategory, string> = {
  '生鲜果蔬': '🥬',
  '熟食': '🍖',
  '干货': '🌾',
  '罐头': '🥫',
  '烘焙': '🍞',
  '冷冻食品': '🧊',
}

const sortOptions = [
  { value: 'urgency-desc', label: '紧急程度优先', icon: Zap },
  { value: 'urgency-asc', label: '紧急程度从低到高', icon: Zap },
  { value: 'createdAt-desc', label: '最新发布', icon: Calendar },
  { value: 'createdAt-asc', label: '最早发布', icon: Calendar },
] as const

type TabType = 'all' | 'my'

function NeedCard({ need, onClick }: { need: MaterialNeed; onClick: () => void }) {
  const statusConfig = statusOptions.find((s) => s.value === need.status)
  const urgencyConfig = urgencyOptions.find((u) => u.value === need.urgency)

  return (
    <div
      onClick={onClick}
      className="rounded-2xl bg-white shadow-sm border border-stone-200/60 p-5 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary-200"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{categoryIcons[need.category as FoodCategory] || '📦'}</span>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-stone-100 text-stone-600">
            {need.category}
          </span>
        </div>
        <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full', statusConfig?.color)}>
          {statusConfig?.label}
        </span>
      </div>

      <h3 className="font-semibold text-stone-800 mb-2 line-clamp-1">{need.title}</h3>
      <p className="text-sm text-stone-500 mb-4 line-clamp-2">{need.description}</p>

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-stone-400" />
          <span className="text-sm text-stone-600">
            需求数量: <span className="font-semibold text-stone-800">{need.quantity} {need.unit}</span>
          </span>
        </div>
        <span
          className={cn(
            'inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border',
            urgencyConfig?.bgColor,
            urgencyConfig?.color,
          )}
        >
          <AlertCircle className="w-3 h-3" />
          {urgencyConfig?.label}
        </span>
      </div>

      <div className="pt-3 border-t border-stone-100">
        <div className="flex items-center justify-between text-xs text-stone-400">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              <span>{need.requesterName}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{need.createdAt}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-stone-400 mt-2">
          <MapPin className="w-3.5 h-3.5 text-primary-500" />
          <span className="truncate">{need.location}</span>
        </div>
      </div>
    </div>
  )
}

function NeedDetailModal({
  need,
  onClose,
  onMatch,
  onComplete,
  onCancel,
}: {
  need: MaterialNeed
  onClose: () => void
  onMatch: () => void
  onComplete: () => void
  onCancel: () => void
}) {
  const { role, currentUser } = useStore()
  const statusConfig = statusOptions.find((s) => s.value === need.status)
  const urgencyConfig = urgencyOptions.find((u) => u.value === need.urgency)
  const isOwner = need.requesterId === currentUser.id

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-fade-in-up">
        <div className="sticky top-0 bg-white border-b border-stone-100 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold text-stone-800">需求详情</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-stone-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-stone-400" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-3xl">{categoryIcons[need.category as FoodCategory] || '📦'}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-stone-100 text-stone-600">
                {need.category}
              </span>
              <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full', statusConfig?.color)}>
                {statusConfig?.label}
              </span>
              <span
                className={cn(
                  'inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border',
                  urgencyConfig?.bgColor,
                  urgencyConfig?.color,
                )}
              >
                <AlertCircle className="w-3 h-3" />
                {urgencyConfig?.label}
              </span>
            </div>
          </div>

          <h3 className="text-xl font-bold text-stone-800 mb-3">{need.title}</h3>

          <div className="bg-stone-50 rounded-xl p-4 mb-5">
            <h4 className="text-sm font-semibold text-stone-600 mb-2">需求描述</h4>
            <p className="text-sm text-stone-600 leading-relaxed">{need.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-stone-50 rounded-xl p-4">
              <p className="text-xs text-stone-400 mb-1">需求数量</p>
              <p className="text-lg font-bold text-stone-800">
                {need.quantity} <span className="text-sm font-medium">{need.unit}</span>
              </p>
            </div>
            <div className="bg-stone-50 rounded-xl p-4">
              <p className="text-xs text-stone-400 mb-1">发布时间</p>
              <p className="text-sm font-semibold text-stone-700">{need.createdAt}</p>
            </div>
          </div>

          <div className="bg-primary-50/50 border border-primary-100 rounded-xl p-4 mb-5">
            <h4 className="text-sm font-semibold text-primary-700 mb-3 flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              取货地点
            </h4>
            <p className="text-sm text-primary-600">{need.location}</p>
          </div>

          <div className="bg-secondary-50/50 border border-secondary-100 rounded-xl p-4 mb-5">
            <h4 className="text-sm font-semibold text-secondary-700 mb-2 flex items-center gap-1.5">
              <User className="w-4 h-4" />
              发布人信息
            </h4>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-200 to-primary-300 flex items-center justify-center">
                <User className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-stone-700">{need.requesterName}</p>
                <p className="text-xs text-stone-400">联系方式: {need.contactInfo}</p>
              </div>
            </div>
          </div>

          {need.fulfilledAt && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-5">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm font-semibold text-green-700">已完成</p>
                  <p className="text-xs text-green-600">完成时间: {need.fulfilledAt}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            {role === 'donor' && need.status === 'open' && (
              <button
                onClick={onMatch}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium shadow-md shadow-primary-200 hover:shadow-lg hover:from-primary-600 hover:to-primary-700 transition-all text-sm flex items-center justify-center gap-2"
              >
                <HandHeart className="w-4 h-4" />
                我要捐赠
              </button>
            )}

            {isOwner && need.status === 'matched' && (
              <button
                onClick={onComplete}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-secondary-500 to-secondary-600 text-white font-medium shadow-md shadow-secondary-200 hover:shadow-lg hover:from-secondary-600 hover:to-secondary-700 transition-all text-sm flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                确认已收到
              </button>
            )}

            {isOwner && need.status === 'open' && (
              <button
                onClick={onCancel}
                className="flex-1 py-3 rounded-xl border-2 border-red-200 text-red-500 font-medium hover:bg-red-50 transition-all text-sm flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                取消需求
              </button>
            )}

            {need.status === 'fulfilled' && (
              <div className="flex-1 py-3 rounded-xl bg-green-50 text-green-600 font-medium text-center text-sm border border-green-200">
                <CheckCircle className="w-4 h-4 inline mr-1.5" />
                需求已完成
              </div>
            )}

            {need.status === 'cancelled' && (
              <div className="flex-1 py-3 rounded-xl bg-stone-100 text-stone-500 font-medium text-center text-sm border border-stone-200">
                <XCircle className="w-4 h-4 inline mr-1.5" />
                需求已取消
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function NeedsList() {
  const navigate = useNavigate()
  const {
    materialNeeds,
    fetchMaterialNeeds,
    updateMaterialNeedStatus,
    role,
    currentUser,
  } = useStore()

  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [filterPanelOpen, setFilterPanelOpen] = useState(false)
  const [selectedNeed, setSelectedNeed] = useState<MaterialNeed | null>(null)
  const [statusFilter, setStatusFilter] = useState<MaterialNeed['status'] | 'all'>('all')
  const [urgencyFilter, setUrgencyFilter] = useState<MaterialNeed['urgency'] | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('全部')
  const [sortBy, setSortBy] = useState<(typeof sortOptions)[number]['value']>('createdAt-desc')
  const [actionLoading, setActionLoading] = useState(false)
  const [actionSuccess, setActionSuccess] = useState(false)

  useEffect(() => {
    fetchMaterialNeeds()
  }, [fetchMaterialNeeds])

  const filteredNeeds = useMemo(() => {
    let result = [...materialNeeds]

    if (activeTab === 'my') {
      result = result.filter((n) => n.requesterId === currentUser.id)
    }

    if (statusFilter !== 'all') {
      result = result.filter((n) => n.status === statusFilter)
    }

    if (urgencyFilter !== 'all') {
      result = result.filter((n) => n.urgency === urgencyFilter)
    }

    if (categoryFilter !== '全部') {
      result = result.filter((n) => n.category === categoryFilter)
    }

    const [sortField, sortOrder] = sortBy.split('-') as [
      'urgency' | 'createdAt',
      'asc' | 'desc'
    ]
    const urgencyWeight: Record<MaterialNeed['urgency'], number> = {
      low: 1,
      medium: 2,
      high: 3,
      urgent: 4,
    }

    result.sort((a, b) => {
      let comparison = 0
      if (sortField === 'urgency') {
        comparison = urgencyWeight[a.urgency] - urgencyWeight[b.urgency]
      } else {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      }
      return sortOrder === 'desc' ? -comparison : comparison
    })

    return result
  }, [
    materialNeeds,
    activeTab,
    statusFilter,
    urgencyFilter,
    categoryFilter,
    sortBy,
    currentUser.id,
  ])

  const handleResetFilters = () => {
    setStatusFilter('all')
    setUrgencyFilter('all')
    setCategoryFilter('全部')
    setSortBy('createdAt-desc')
  }

  const hasActiveFilters =
    statusFilter !== 'all' ||
    urgencyFilter !== 'all' ||
    categoryFilter !== '全部' ||
    sortBy !== 'createdAt-desc'

  const handleMatch = async () => {
    if (!selectedNeed || actionLoading) return
    setActionLoading(true)
    const success = await updateMaterialNeedStatus(selectedNeed.id, 'matched')
    setActionLoading(false)
    if (success) {
      setActionSuccess(true)
      setTimeout(() => {
        setActionSuccess(false)
        setSelectedNeed(null)
      }, 1500)
    }
  }

  const handleComplete = async () => {
    if (!selectedNeed || actionLoading) return
    setActionLoading(true)
    const success = await updateMaterialNeedStatus(selectedNeed.id, 'fulfilled')
    setActionLoading(false)
    if (success) {
      setActionSuccess(true)
      setTimeout(() => {
        setActionSuccess(false)
        setSelectedNeed(null)
      }, 1500)
    }
  }

  const handleCancel = async () => {
    if (!selectedNeed || actionLoading) return
    setActionLoading(true)
    const success = await updateMaterialNeedStatus(selectedNeed.id, 'cancelled')
    setActionLoading(false)
    if (success) {
      setActionSuccess(true)
      setTimeout(() => {
        setActionSuccess(false)
        setSelectedNeed(null)
      }, 1500)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-stone-500 hover:text-stone-700 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm font-medium">返回</span>
      </button>

      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-800 mb-1">物资需求列表</h1>
          <p className="text-sm text-stone-500">
            浏览社区发布的物资需求，您可以捐赠闲置物资帮助有需要的人
          </p>
        </div>
        {role === 'claimant' && (
          <button
            onClick={() => navigate('/publish-need')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-secondary-500 to-secondary-600 text-white text-sm font-medium shadow-md shadow-secondary-200 hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            发布需求
          </button>
        )}
      </div>

      <div className="flex items-center gap-3 mb-6 border-b border-stone-200 overflow-x-auto pb-0">
        <button
          onClick={() => setActiveTab('all')}
          className={cn(
            'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap -mb-px',
            activeTab === 'all'
              ? 'text-primary-600 border-primary-500'
              : 'text-stone-400 border-transparent hover:text-stone-600',
          )}
        >
          <ListTodo className="w-4 h-4" />
          全部需求
          <span className="text-xs px-1.5 py-0.5 rounded-full bg-stone-100 text-stone-500">
            {materialNeeds.length}
          </span>
        </button>
        {role === 'claimant' && (
          <button
            onClick={() => setActiveTab('my')}
            className={cn(
              'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap -mb-px',
              activeTab === 'my'
                ? 'text-primary-600 border-primary-500'
                : 'text-stone-400 border-transparent hover:text-stone-600',
            )}
          >
            <User className="w-4 h-4" />
            我的需求
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-primary-100 text-primary-600">
              {materialNeeds.filter((n) => n.requesterId === currentUser.id).length}
            </span>
          </button>
        )}
      </div>

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <p className="text-sm text-stone-500">
            共 <span className="font-semibold text-stone-700">{filteredNeeds.length}</span> 条需求
          </p>
          {hasActiveFilters && (
            <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-primary-50 text-primary-600">
              <Filter className="w-3 h-3" />
              已筛选
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setFilterPanelOpen(true)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border',
              filterPanelOpen || hasActiveFilters
                ? 'bg-primary-50 text-primary-600 border-primary-200'
                : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50',
            )}
          >
            <SlidersHorizontal className="w-4 h-4" />
            筛选
            {hasActiveFilters && (
              <span className="w-5 h-5 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center">
                {[statusFilter !== 'all', urgencyFilter !== 'all', categoryFilter !== '全部', sortBy !== 'createdAt-desc'].filter(Boolean).length}
              </span>
            )}
          </button>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as (typeof sortOptions)[number]['value'])}
            className="px-3 py-2 rounded-xl border border-stone-200 text-sm text-stone-600 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all bg-white"
          >
            {sortOptions.map((opt) => {
              const Icon = opt.icon
              return (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              )
            })}
          </select>
        </div>
      </div>

      {filteredNeeds.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-20 h-20 rounded-2xl bg-stone-100 flex items-center justify-center mb-4">
            <PackageOpen className="w-10 h-10 text-stone-300" />
          </div>
          <p className="text-lg font-medium text-stone-400">暂无匹配的需求</p>
          <p className="text-sm text-stone-300 mt-1">试试调整筛选条件或查看其他分类</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredNeeds.map((need, index) => (
            <div
              key={need.id}
              className="card-enter"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <NeedCard need={need} onClick={() => setSelectedNeed(need)} />
            </div>
          ))}
        </div>
      )}

      {filterPanelOpen && (
        <>
          <div className="fixed inset-0 bg-black/20 z-40 lg:hidden" onClick={() => setFilterPanelOpen(false)} />
          <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl z-50 p-6 overflow-y-auto animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-stone-800">筛选条件</h3>
              <button onClick={() => setFilterPanelOpen(false)} className="p-2 hover:bg-stone-100 rounded-xl">
                <X className="w-5 h-5 text-stone-400" />
              </button>
            </div>

            <div className="mb-6">
              <h4 className="text-sm font-semibold text-stone-600 mb-3">需求状态</h4>
              <div className="space-y-2">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border text-left',
                    statusFilter === 'all'
                      ? 'border-primary-300 bg-primary-50'
                      : 'border-stone-200 hover:bg-stone-50',
                  )}
                >
                  <input
                    type="radio"
                    checked={statusFilter === 'all'}
                    onChange={() => setStatusFilter('all')}
                    className="w-4 h-4 accent-primary-500"
                  />
                  <span className={cn('text-sm', statusFilter === 'all' ? 'text-primary-700 font-medium' : 'text-stone-600')}>
                    全部
                  </span>
                </button>
                {statusOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setStatusFilter(opt.value)}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border text-left',
                      statusFilter === opt.value
                        ? 'border-primary-300 bg-primary-50'
                        : 'border-stone-200 hover:bg-stone-50',
                    )}
                  >
                    <input
                      type="radio"
                      checked={statusFilter === opt.value}
                      onChange={() => setStatusFilter(opt.value)}
                      className="w-4 h-4 accent-primary-500"
                    />
                    <span className={cn('text-sm', statusFilter === opt.value ? 'text-primary-700 font-medium' : 'text-stone-600')}>
                      {opt.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-sm font-semibold text-stone-600 mb-3">紧急程度</h4>
              <div className="space-y-2">
                <button
                  onClick={() => setUrgencyFilter('all')}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border text-left',
                    urgencyFilter === 'all'
                      ? 'border-primary-300 bg-primary-50'
                      : 'border-stone-200 hover:bg-stone-50',
                  )}
                >
                  <input
                    type="radio"
                    checked={urgencyFilter === 'all'}
                    onChange={() => setUrgencyFilter('all')}
                    className="w-4 h-4 accent-primary-500"
                  />
                  <span className={cn('text-sm', urgencyFilter === 'all' ? 'text-primary-700 font-medium' : 'text-stone-600')}>
                    全部
                  </span>
                </button>
                {urgencyOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setUrgencyFilter(opt.value)}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border text-left',
                      urgencyFilter === opt.value
                        ? 'border-primary-300 bg-primary-50'
                        : 'border-stone-200 hover:bg-stone-50',
                    )}
                  >
                    <input
                      type="radio"
                      checked={urgencyFilter === opt.value}
                      onChange={() => setUrgencyFilter(opt.value)}
                      className="w-4 h-4 accent-primary-500"
                    />
                    <span className={cn('text-sm', urgencyFilter === opt.value ? 'text-primary-700 font-medium' : 'text-stone-600')}>
                      {opt.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h4 className="text-sm font-semibold text-stone-600 mb-3">物资分类</h4>
              <div className="space-y-2">
                <button
                  onClick={() => setCategoryFilter('全部')}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border text-left',
                    categoryFilter === '全部'
                      ? 'border-primary-300 bg-primary-50'
                      : 'border-stone-200 hover:bg-stone-50',
                  )}
                >
                  <input
                    type="radio"
                    checked={categoryFilter === '全部'}
                    onChange={() => setCategoryFilter('全部')}
                    className="w-4 h-4 accent-primary-500"
                  />
                  <span className={cn('text-sm', categoryFilter === '全部' ? 'text-primary-700 font-medium' : 'text-stone-600')}>
                    全部
                  </span>
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border text-left',
                      categoryFilter === cat
                        ? 'border-primary-300 bg-primary-50'
                        : 'border-stone-200 hover:bg-stone-50',
                    )}
                  >
                    <input
                      type="radio"
                      checked={categoryFilter === cat}
                      onChange={() => setCategoryFilter(cat)}
                      className="w-4 h-4 accent-primary-500"
                    />
                    <span className="text-lg">{categoryIcons[cat]}</span>
                    <span className={cn('text-sm', categoryFilter === cat ? 'text-primary-700 font-medium' : 'text-stone-600')}>
                      {cat}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleResetFilters}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-stone-300 text-stone-600 text-sm font-medium hover:bg-stone-50 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                重置
              </button>
              <button
                onClick={() => setFilterPanelOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-medium shadow-md shadow-primary-200 hover:shadow-lg transition-all"
              >
                应用
              </button>
            </div>
          </div>
        </>
      )}

      {selectedNeed && !actionSuccess && (
        <NeedDetailModal
          need={selectedNeed}
          onClose={() => setSelectedNeed(null)}
          onMatch={handleMatch}
          onComplete={handleComplete}
          onCancel={handleCancel}
        />
      )}

      {actionSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl p-8 text-center animate-fade-in-up">
            <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-lg font-semibold text-stone-800">操作成功</p>
          </div>
        </div>
      )}
    </div>
  )
}
