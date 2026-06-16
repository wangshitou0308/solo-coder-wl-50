import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, SlidersHorizontal, Plus, PackageOpen, Clock, TrendingDown } from 'lucide-react'
import { useStore } from '@/store/useStore'
import CategoryNav from '@/components/CategoryNav'
import FoodCard from '@/components/FoodCard'
import FilterPanel from '@/components/FilterPanel'
import { cn } from '@/lib/utils'

export default function Home() {
  const navigate = useNavigate()
  const {
    foods, fetchFoods, activeCategory, searchKeyword, sortBy, pickupFilter, role, distanceRange,
    filterPanelOpen, setFilterPanelOpen,
  } = useStore()

  useEffect(() => {
    fetchFoods()
  }, [fetchFoods])

  const expiryWarnings = useMemo(() => {
    const now = Date.now()
    return foods.filter((f) => {
      if (f.status !== 'available') return false
      const diff = new Date(f.expiryDate).getTime() - now
      return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000
    })
  }, [foods])

  const autoExpiredIds = useMemo(() => {
    const now = Date.now()
    return foods
      .filter((f) => {
        if (f.status === 'expired' || f.status === 'claimed' || f.status === 'rejected') return false
        return new Date(f.expiryDate).getTime() < now
      })
      .map((f) => f.id)
  }, [foods])

  useEffect(() => {
    autoExpiredIds.forEach((id) => {
      const food = foods.find((f) => f.id === id)
      if (food && food.status !== 'expired') {
        useStore.getState().updateFoodStatus(id, 'expired')
      }
    })
  }, [autoExpiredIds, foods])

  const filteredFoods = useMemo(() => {
    let result = foods.filter((f) => f.status === 'available')

    if (activeCategory !== '全部') {
      result = result.filter((f) => f.category === activeCategory)
    }

    if (searchKeyword) {
      const kw = searchKeyword.toLowerCase()
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(kw) ||
          f.category.toLowerCase().includes(kw) ||
          f.description.toLowerCase().includes(kw) ||
          f.location.toLowerCase().includes(kw),
      )
    }

    if (pickupFilter.length > 0) {
      result = result.filter((f) => pickupFilter.includes(f.pickupMethod))
    }

    result = result.filter((f) => f.distance >= distanceRange[0] && f.distance <= distanceRange[1])

    switch (sortBy) {
      case '即将过期':
        result.sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())
        break
      case '距离最近':
        result.sort((a, b) => a.distance - b.distance)
        break
      case '最新发布':
      default:
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }

    return result
  }, [foods, activeCategory, searchKeyword, sortBy, pickupFilter, distanceRange])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {expiryWarnings.length > 0 && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-800">
              食品安全提醒：有 {expiryWarnings.length} 件食物即将过期！
            </p>
            <p className="text-xs text-amber-600 mt-0.5 truncate">
              包括 {expiryWarnings.slice(0, 3).map((f) => f.name).join('、')}
              {expiryWarnings.length > 3 && ` 等${expiryWarnings.length}件`}，请尽快领取避免浪费
            </p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Clock className="w-4 h-4 text-amber-500" />
            <span className="text-xs text-amber-700 font-medium">3天内</span>
          </div>
        </div>
      )}

      <div className="mb-6">
        <CategoryNav />
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <p className="text-sm text-stone-500">
            共 <span className="font-semibold text-stone-700">{filteredFoods.length}</span> 件可领取食物
          </p>
          {autoExpiredIds.length > 0 && (
            <span className={cn(
              'flex items-center gap-1 text-xs px-2 py-0.5 rounded-full',
              'bg-red-50 text-red-600',
            )}>
              <TrendingDown className="w-3 h-3" />
              {autoExpiredIds.length}件已自动下架
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setFilterPanelOpen(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filterPanelOpen || pickupFilter.length > 0 || distanceRange[1] < 10
                ? 'bg-primary-50 text-primary-600 border border-primary-200'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            筛选
            {(pickupFilter.length > 0 || distanceRange[1] < 10) && (
              <span className="w-5 h-5 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center">
                {pickupFilter.length + (distanceRange[1] < 10 ? 1 : 0)}
              </span>
            )}
          </button>

          {role === 'donor' && (
            <button
              onClick={() => navigate('/donate')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-medium shadow-md shadow-primary-200 hover:shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              捐赠食物
            </button>
          )}
        </div>
      </div>

      {filteredFoods.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-20 h-20 rounded-2xl bg-stone-100 flex items-center justify-center mb-4">
            <PackageOpen className="w-10 h-10 text-stone-300" />
          </div>
          <p className="text-lg font-medium text-stone-400">暂无符合条件的食物</p>
          <p className="text-sm text-stone-300 mt-1">试试调整筛选条件或更换类别</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredFoods.map((food, index) => (
            <div
              key={food.id}
              className="card-enter"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <FoodCard food={food} />
            </div>
          ))}
        </div>
      )}

      <FilterPanel />
    </div>
  )
}
