import { useState, useEffect, useMemo } from 'react'
import { X, SlidersHorizontal, RotateCcw, Navigation, Thermometer, User, Phone, Clock, Package, MapPin, Refrigerator, AlertTriangle, Wrench, CheckCircle, XCircle } from 'lucide-react'
import { useStore, type FridgePoint } from '@/store/useStore'
import { cn } from '@/lib/utils'

const statusOptions: Array<{ label: string; value: FridgePoint['status']; icon: typeof CheckCircle; color: string }> = [
  { label: '正常', value: 'normal', icon: CheckCircle, color: 'text-green-500 bg-green-50 border-green-200' },
  { label: '预警', value: 'warning', icon: AlertTriangle, color: 'text-amber-500 bg-amber-50 border-amber-200' },
  { label: '维护中', value: 'maintenance', icon: Wrench, color: 'text-blue-500 bg-blue-50 border-blue-200' },
  { label: '离线', value: 'offline', icon: XCircle, color: 'text-red-500 bg-red-50 border-red-200' },
]

const capacityOptions = [
  { label: '0-30%', value: [0, 30] },
  { label: '30-60%', value: [30, 60] },
  { label: '60-100%', value: [60, 100] },
]

const sortOptions = ['距离最近', '容量最高', '容量最低'] as const

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c * 10) / 10
}

function getStatusInfo(status: FridgePoint['status']) {
  const info = statusOptions.find((s) => s.value === status) || statusOptions[0]
  return info
}

function getCapacityUsage(current: number, capacity: number) {
  return capacity > 0 ? Math.round((current / capacity) * 100) : 0
}

function getCapacityColor(usage: number) {
  if (usage >= 80) return 'text-red-500 bg-red-50'
  if (usage >= 60) return 'text-amber-500 bg-amber-50'
  return 'text-green-500 bg-green-50'
}

function getTemperatureColor(temp: number) {
  if (temp > 6 || temp < 2) return 'text-red-500'
  if (temp > 5 || temp < 3) return 'text-amber-500'
  return 'text-green-500'
}

export default function FridgeMap() {
  const { fridgePoints, fetchFridgePoints } = useStore()
  const [filterPanelOpen, setFilterPanelOpen] = useState(false)
  const [selectedFridge, setSelectedFridge] = useState<FridgePoint | null>(null)
  const [statusFilter, setStatusFilter] = useState<FridgePoint['status'][]>([])
  const [distanceRange, setDistanceRange] = useState<[number, number]>([0, 10])
  const [capacityFilter, setCapacityFilter] = useState<[number, number] | null>(null)
  const [sortBy, setSortBy] = useState<typeof sortOptions[number]>('距离最近')

  const userLocation = { lat: 39.9042, lng: 116.4074 }

  useEffect(() => {
    fetchFridgePoints()
  }, [fetchFridgePoints])

  const toggleStatus = (value: FridgePoint['status']) => {
    if (statusFilter.includes(value)) {
      setStatusFilter(statusFilter.filter((v) => v !== value))
    } else {
      setStatusFilter([...statusFilter, value])
    }
  }

  const handleReset = () => {
    setStatusFilter([])
    setDistanceRange([0, 10])
    setCapacityFilter(null)
    setSortBy('距离最近')
  }

  const filteredPoints = useMemo(() => {
    let result = fridgePoints.map((point) => ({
      ...point,
      distance: calculateDistance(userLocation.lat, userLocation.lng, point.latitude, point.longitude),
    }))

    if (statusFilter.length > 0) {
      result = result.filter((p) => statusFilter.includes(p.status))
    }

    result = result.filter((p) => p.distance >= distanceRange[0] && p.distance <= distanceRange[1])

    if (capacityFilter) {
      result = result.filter((p) => {
        const usage = getCapacityUsage(p.currentStock, p.capacity)
        return usage >= capacityFilter[0] && usage <= capacityFilter[1]
      })
    }

    switch (sortBy) {
      case '距离最近':
        result.sort((a, b) => a.distance - b.distance)
        break
      case '容量最高':
        result.sort((a, b) => getCapacityUsage(b.currentStock, b.capacity) - getCapacityUsage(a.currentStock, a.capacity))
        break
      case '容量最低':
        result.sort((a, b) => getCapacityUsage(a.currentStock, a.capacity) - getCapacityUsage(b.currentStock, b.capacity))
        break
    }

    return result
  }, [fridgePoints, statusFilter, distanceRange, capacityFilter, sortBy])

  const hasActiveFilters = statusFilter.length > 0 || distanceRange[1] < 10 || capacityFilter !== null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
            <Refrigerator className="w-6 h-6 text-primary-500" />
            冰箱地图
          </h1>
          <p className="text-sm text-stone-500 mt-1">查看附近所有共享冰箱点位</p>
        </div>
        <button
          onClick={() => setFilterPanelOpen(true)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border',
            hasActiveFilters
              ? 'bg-primary-50 text-primary-600 border-primary-200'
              : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
          )}
        >
          <SlidersHorizontal className="w-4 h-4" />
          筛选
          {hasActiveFilters && (
            <span className="w-5 h-5 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center">
              {statusFilter.length + (distanceRange[1] < 10 ? 1 : 0) + (capacityFilter ? 1 : 0)}
            </span>
          )}
        </button>
      </div>

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-stone-500">
          共 <span className="font-semibold text-stone-700">{filteredPoints.length}</span> 个冰箱点位
        </p>
      </div>

      {filteredPoints.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-20 h-20 rounded-2xl bg-stone-100 flex items-center justify-center mb-4">
            <Refrigerator className="w-10 h-10 text-stone-300" />
          </div>
          <p className="text-lg font-medium text-stone-400">暂无符合条件的冰箱</p>
          <p className="text-sm text-stone-300 mt-1">试试调整筛选条件</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPoints.map((point, index) => {
            const statusInfo = getStatusInfo(point.status)
            const StatusIcon = statusInfo.icon
            const capacityUsage = getCapacityUsage(point.currentStock, point.capacity)

            return (
              <div
                key={point.id}
                onClick={() => setSelectedFridge(point)}
                className="card-enter bg-white rounded-2xl shadow-sm border border-stone-200 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                        <Refrigerator className="w-5 h-5 text-primary-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-stone-800">{point.name}</h3>
                        <p className="text-xs text-stone-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {point.community}
                        </p>
                      </div>
                    </div>
                    <span className={cn('flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border', statusInfo.color)}>
                      <StatusIcon className="w-3 h-3" />
                      {statusInfo.label}
                    </span>
                  </div>

                  <p className="text-sm text-stone-500 mb-4 line-clamp-2">{point.address}</p>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-stone-50 rounded-xl p-3">
                      <div className="flex items-center gap-1.5 text-xs text-stone-400 mb-1">
                        <Thermometer className="w-3 h-3" />
                        温度
                      </div>
                      <p className={cn('text-lg font-bold', getTemperatureColor(point.temperature))}>
                        {point.temperature}°C
                      </p>
                    </div>
                    <div className="bg-stone-50 rounded-xl p-3">
                      <div className="flex items-center gap-1.5 text-xs text-stone-400 mb-1">
                        <Package className="w-3 h-3" />
                        容量
                      </div>
                      <p className={cn('text-lg font-bold', getCapacityColor(capacityUsage))}>
                        {capacityUsage}%
                      </p>
                    </div>
                  </div>

                  <div className="h-2 bg-stone-100 rounded-full overflow-hidden mb-3">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-500',
                        capacityUsage >= 80 ? 'bg-gradient-to-r from-red-400 to-red-500' :
                        capacityUsage >= 60 ? 'bg-gradient-to-r from-amber-400 to-amber-500' :
                        'bg-gradient-to-r from-green-400 to-green-500'
                      )}
                      style={{ width: `${capacityUsage}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-stone-400">
                      <Package className="w-3.5 h-3.5" />
                      <span>库存 {point.currentStock}/{point.capacity}</span>
                    </div>
                    <span className="text-xs bg-primary-50 text-primary-600 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                      <Navigation className="w-3 h-3" />
                      {point.distance}km
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
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
              <h4 className="text-sm font-semibold text-stone-600 mb-3">运行状态</h4>
              <div className="space-y-2">
                {statusOptions.map((opt) => {
                  const Icon = opt.icon
                  const checked = statusFilter.includes(opt.value)
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
                        onChange={() => toggleStatus(opt.value)}
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

            <div className="mb-6">
              <h4 className="text-sm font-semibold text-stone-600 mb-3">容量使用率</h4>
              <div className="space-y-2">
                {capacityOptions.map((opt) => (
                  <label
                    key={opt.label}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border',
                      capacityFilter?.[0] === opt.value[0] && capacityFilter?.[1] === opt.value[1]
                        ? 'border-primary-300 bg-primary-50'
                        : 'border-stone-200 hover:bg-stone-50',
                    )}
                  >
                    <input
                      type="radio"
                      name="capacity"
                      checked={capacityFilter?.[0] === opt.value[0] && capacityFilter?.[1] === opt.value[1]}
                      onChange={() => setCapacityFilter(opt.value as [number, number])}
                      className="w-4 h-4 accent-primary-500"
                    />
                    <span className={cn(
                      'text-sm',
                      capacityFilter?.[0] === opt.value[0] && capacityFilter?.[1] === opt.value[1]
                        ? 'text-primary-700 font-medium'
                        : 'text-stone-600'
                    )}>
                      {opt.label}
                    </span>
                  </label>
                ))}
                <button
                  onClick={() => setCapacityFilter(null)}
                  className={cn(
                    'w-full text-left p-3 rounded-xl text-sm transition-all border',
                    capacityFilter === null
                      ? 'border-primary-300 bg-primary-50 text-primary-700 font-medium'
                      : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                  )}
                >
                  全部
                </button>
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
      )}

      {selectedFridge && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setSelectedFridge(null)}>
            <div
              className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-fade-in-up"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center">
                      <Refrigerator className="w-6 h-6 text-primary-500" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-stone-800">{selectedFridge.name}</h2>
                      <p className="text-sm text-stone-400 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {selectedFridge.community}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedFridge(null)} className="p-2 hover:bg-stone-100 rounded-xl">
                    <X className="w-5 h-5 text-stone-400" />
                  </button>
                </div>

                <p className="text-sm text-stone-500 mb-6">{selectedFridge.address}</p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-stone-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-xs text-stone-400 mb-2">
                      <Thermometer className="w-4 h-4" />
                      当前温度
                    </div>
                    <p className={cn('text-2xl font-bold', getTemperatureColor(selectedFridge.temperature))}>
                      {selectedFridge.temperature}°C
                    </p>
                  </div>
                  <div className="bg-stone-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-xs text-stone-400 mb-2">
                      <Package className="w-4 h-4" />
                      当前库存
                    </div>
                    <p className="text-2xl font-bold text-stone-700">
                      {selectedFridge.currentStock}
                      <span className="text-sm font-normal text-stone-400">/{selectedFridge.capacity}</span>
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-stone-500">容量使用率</span>
                    <span className={cn('font-semibold', getCapacityColor(getCapacityUsage(selectedFridge.currentStock, selectedFridge.capacity)))}>
                      {getCapacityUsage(selectedFridge.currentStock, selectedFridge.capacity)}%
                    </span>
                  </div>
                  <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-500',
                        getCapacityUsage(selectedFridge.currentStock, selectedFridge.capacity) >= 80
                          ? 'bg-gradient-to-r from-red-400 to-red-500'
                          : getCapacityUsage(selectedFridge.currentStock, selectedFridge.capacity) >= 60
                          ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                          : 'bg-gradient-to-r from-green-400 to-green-500'
                      )}
                      style={{ width: `${getCapacityUsage(selectedFridge.currentStock, selectedFridge.capacity)}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
                    <User className="w-5 h-5 text-stone-400" />
                    <div>
                      <p className="text-xs text-stone-400">联系人</p>
                      <p className="text-sm font-medium text-stone-700">{selectedFridge.contactPerson}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
                    <Phone className="w-5 h-5 text-stone-400" />
                    <div>
                      <p className="text-xs text-stone-400">联系电话</p>
                      <p className="text-sm font-medium text-stone-700">{selectedFridge.contactPhone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
                    <Clock className="w-5 h-5 text-stone-400" />
                    <div>
                      <p className="text-xs text-stone-400">最近巡检时间</p>
                      <p className="text-sm font-medium text-stone-700">
                        {selectedFridge.lastInspected || '暂无记录'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-stone-500">运行状态：</span>
                  {(() => {
                    const statusInfo = getStatusInfo(selectedFridge.status)
                    const StatusIcon = statusInfo.icon
                    return (
                      <span className={cn('flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border', statusInfo.color)}>
                        <StatusIcon className="w-4 h-4" />
                        {statusInfo.label}
                      </span>
                    )
                  })()}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
