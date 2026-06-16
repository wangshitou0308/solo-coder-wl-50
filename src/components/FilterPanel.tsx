import { X, RotateCcw, MapPin, Truck, Refrigerator, Navigation } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { cn } from '@/lib/utils'
import type { PickupMethod } from '@/store/useStore'

const pickupOptions: Array<{ label: string; value: PickupMethod; icon: typeof MapPin }> = [
  { label: '放置共享冰箱', value: '放置共享冰箱', icon: Refrigerator },
  { label: '定点自取', value: '定点自取', icon: MapPin },
  { label: '上门领取', value: '上门领取', icon: Truck },
]

const sortOptions = ['最新发布', '即将过期', '距离最近'] as const

export default function FilterPanel() {
  const { filterPanelOpen, setFilterPanelOpen, pickupFilter, setPickupFilter, sortBy, setSortBy, distanceRange, setDistanceRange } = useStore()

  const togglePickup = (value: PickupMethod) => {
    if (pickupFilter.includes(value)) {
      setPickupFilter(pickupFilter.filter((v) => v !== value))
    } else {
      setPickupFilter([...pickupFilter, value])
    }
  }

  const handleReset = () => {
    setPickupFilter([])
    setSortBy('最新发布')
    setDistanceRange([0, 10])
  }

  if (!filterPanelOpen) return null

  return (
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
          <h4 className="text-sm font-semibold text-stone-600 mb-3">取餐方式</h4>
          <div className="space-y-2">
            {pickupOptions.map((opt) => {
              const Icon = opt.icon
              const checked = pickupFilter.includes(opt.value)
              return (
                <label
                  key={opt.value}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border',
                    checked ? 'border-primary-300 bg-primary-50' : 'border-stone-200 hover:bg-stone-50',
                  )}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => togglePickup(opt.value)}
                    className="w-4 h-4 accent-primary-500"
                  />
                  <Icon className={cn('w-4 h-4', checked ? 'text-primary-500' : 'text-stone-400')} />
                  <span className={cn('text-sm', checked ? 'text-primary-700 font-medium' : 'text-stone-600')}>
                    {opt.label}
                  </span>
                </label>
              )
            })}
          </div>
        </div>

        <div className="mb-6">
          <h4 className="text-sm font-semibold text-stone-600 mb-3 flex items-center gap-1.5">
            <Navigation className="w-4 h-4" /> 距离范围
          </h4>
          <div className="px-2">
            <input
              type="range"
              min="0"
              max="10"
              step="1"
              value={distanceRange[1]}
              onChange={(e) => setDistanceRange([0, Number(e.target.value)])}
              className="w-full accent-primary-500"
            />
            <div className="flex justify-between text-xs text-stone-400 mt-2">
              <span>0km</span>
              <span className="text-sm font-medium text-primary-600">{distanceRange[1]}km以内</span>
              <span>10km+</span>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h4 className="text-sm font-semibold text-stone-600 mb-3">排序方式</h4>
          <div className="space-y-2">
            {sortOptions.map((opt) => (
              <label
                key={opt}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border',
                  sortBy === opt ? 'border-primary-300 bg-primary-50' : 'border-stone-200 hover:bg-stone-50',
                )}
              >
                <input
                  type="radio"
                  name="sortBy"
                  checked={sortBy === opt}
                  onChange={() => setSortBy(opt)}
                  className="w-4 h-4 accent-primary-500"
                />
                <span className={cn('text-sm', sortBy === opt ? 'text-primary-700 font-medium' : 'text-stone-600')}>
                  {opt}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleReset}
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
  )
}
