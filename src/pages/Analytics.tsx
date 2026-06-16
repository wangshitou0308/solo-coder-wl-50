import { useEffect, useState, useMemo, useCallback } from 'react'
import {
  Calendar,
  MapPin,
  Users,
  Refrigerator,
  Download,
  Trophy,
  Medal,
  User,
  Filter,
  RotateCcw,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts'
import { useStore } from '@/store/useStore'
import StatCard from '@/components/StatCard'
import { cn } from '@/lib/utils'
import type { AdvancedStats } from '@/store/useStore'

const pieColors = ['#22C55E', '#F97316', '#F59E0B', '#3B82F6', '#EC4899', '#06B6D4']
const lossReasonColors: Record<string, string> = {
  expired: '#EF4444',
  spoiled: '#F97316',
  damaged: '#F59E0B',
  returned: '#3B82F6',
  other: '#6B7280',
}

const lossReasonLabels: Record<string, string> = {
  expired: '过期',
  spoiled: '变质',
  damaged: '损坏',
  returned: '退回',
  other: '其他',
}

const communities = ['阳光社区', '和谐家园', '绿洲社区']
const roles = [
  { label: '全部', value: '' },
  { label: '捐赠者', value: 'donor' },
  { label: '领取者', value: 'claimant' },
]

const mockMonthlyTrend = [
  { month: '1月', donated: 85, claimed: 72, wasted: 5 },
  { month: '2月', donated: 92, claimed: 80, wasted: 4 },
  { month: '3月', donated: 110, claimed: 95, wasted: 6 },
  { month: '4月', donated: 105, claimed: 90, wasted: 3 },
  { month: '5月', donated: 120, claimed: 108, wasted: 4 },
  { month: '6月', donated: 118, claimed: 98, wasted: 2 },
]

interface FilterState {
  startDate: string
  endDate: string
  community: string
  role: string
  fridgeId: string
}

export default function Analytics() {
  const {
    advancedStats,
    fetchAdvancedStats,
    exportReport,
    fridgePoints,
    fetchFridgePoints,
  } = useStore()

  const [filters, setFilters] = useState<FilterState>({
    startDate: '',
    endDate: '',
    community: '',
    role: '',
    fridgeId: '',
  })

  const [showFilters, setShowFilters] = useState(true)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchFridgePoints()
  }, [fetchFridgePoints])

  const loadData = useCallback(async () => {
    setLoading(true)
    const filterParams: Record<string, string> = {}
    if (filters.startDate) filterParams.startDate = filters.startDate
    if (filters.endDate) filterParams.endDate = filters.endDate
    if (filters.community) filterParams.community = filters.community
    if (filters.role) filterParams.role = filters.role
    if (filters.fridgeId) filterParams.fridgeId = filters.fridgeId
    await fetchAdvancedStats(filterParams)
    setLoading(false)
  }, [filters, fetchAdvancedStats])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleApplyFilters = () => {
    loadData()
  }

  const handleResetFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      community: '',
      role: '',
      fridgeId: '',
    })
  }

  const handleExport = () => {
    const filterParams: Record<string, string> = { format: 'csv' }
    if (filters.startDate) filterParams.startDate = filters.startDate
    if (filters.endDate) filterParams.endDate = filters.endDate
    if (filters.community) filterParams.community = filters.community
    if (filters.role) filterParams.role = filters.role
    if (filters.fridgeId) filterParams.fridgeId = filters.fridgeId
    exportReport(filterParams)
  }

  const displayStats = useMemo((): AdvancedStats => {
    if (advancedStats) return advancedStats
    return {
      totalDonated: 1286,
      totalClaimed: 1043,
      totalWasted: 86,
      expiryConversionRate: 78,
      avgClaimResponseTime: 2.5,
      lossReasonDistribution: {
        expired: 45,
        spoiled: 23,
        damaged: 12,
        returned: 8,
        other: 8,
      },
      categoryStats: {
        '生鲜果蔬': { donated: 450, claimed: 380, wasted: 35 },
        '熟食': { donated: 257, claimed: 210, wasted: 18 },
        '干货': { donated: 231, claimed: 190, wasted: 12 },
        '罐头': { donated: 154, claimed: 130, wasted: 8 },
        '烘焙': { donated: 129, claimed: 105, wasted: 7 },
        '冷冻食品': { donated: 65, claimed: 28, wasted: 6 },
      },
      roleStats: {
        donors: 156,
        claimants: 423,
        topDonors: [
          { id: 'd1', name: '张明华', count: 48 },
          { id: 'd2', name: '李面包', count: 35 },
          { id: 'd3', name: '张果蔬', count: 28 },
          { id: 'd4', name: '陈超市', count: 22 },
          { id: 'd5', name: '赵面点', count: 18 },
        ],
        topClaimants: [
          { id: 'c1', name: '李秀英', count: 32 },
          { id: 'c2', name: '王大爷', count: 25 },
          { id: 'c3', name: '刘阿姨', count: 21 },
          { id: 'c4', name: '张奶奶', count: 18 },
          { id: 'c5', name: '陈叔叔', count: 15 },
        ],
      },
      fridgeStats: [
        {
          id: 'fridge-1',
          name: '阳光社区共享冰箱',
          community: '阳光社区',
          donated: 450,
          claimed: 380,
          wasted: 25,
          currentStock: 23,
          capacity: 50,
        },
        {
          id: 'fridge-2',
          name: '和谐家园共享冰箱',
          community: '和谐家园',
          donated: 420,
          claimed: 350,
          wasted: 32,
          currentStock: 35,
          capacity: 40,
        },
        {
          id: 'fridge-3',
          name: '绿洲社区共享冰箱',
          community: '绿洲社区',
          donated: 416,
          claimed: 313,
          wasted: 29,
          currentStock: 12,
          capacity: 60,
        },
      ],
      vouchers: [],
    }
  }, [advancedStats])

  const categoryChartData = useMemo(() => {
    return Object.entries(displayStats.categoryStats).map(([name, stats]) => ({
      name,
      捐赠: stats.donated,
      领取: stats.claimed,
      损耗: stats.wasted,
    }))
  }, [displayStats.categoryStats])

  const lossReasonChartData = useMemo(() => {
    return Object.entries(displayStats.lossReasonDistribution).map(([reason, count]) => ({
      name: lossReasonLabels[reason] || reason,
      value: count,
      reason,
    }))
  }, [displayStats.lossReasonDistribution])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">高级数据分析</h1>
          <p className="text-sm text-stone-500 mt-1">多维度数据统计和分析</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors',
              showFilters
                ? 'border-primary-300 bg-primary-50 text-primary-700'
                : 'border-stone-200 text-stone-600 hover:bg-stone-50'
            )}
          >
            <Filter className="w-4 h-4" />
            筛选
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-medium shadow-md shadow-primary-200 hover:shadow-lg transition-all"
          >
            <Download className="w-4 h-4" />
            导出报表
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white rounded-2xl border border-stone-200/60 p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-stone-600 mb-2">
                <Calendar className="w-4 h-4" />
                开始日期
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-stone-600 mb-2">
                <Calendar className="w-4 h-4" />
                结束日期
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-stone-600 mb-2">
                <MapPin className="w-4 h-4" />
                社区
              </label>
              <select
                value={filters.community}
                onChange={(e) => handleFilterChange('community', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors appearance-none bg-white"
              >
                <option value="">全部社区</option>
                {communities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-stone-600 mb-2">
                <Users className="w-4 h-4" />
                角色
              </label>
              <select
                value={filters.role}
                onChange={(e) => handleFilterChange('role', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors appearance-none bg-white"
              >
                {roles.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-stone-600 mb-2">
                <Refrigerator className="w-4 h-4" />
                点位
              </label>
              <select
                value={filters.fridgeId}
                onChange={(e) => handleFilterChange('fridgeId', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors appearance-none bg-white"
              >
                <option value="">全部点位</option>
                {fridgePoints.map((fp) => (
                  <option key={fp.id} value={fp.id}>
                    {fp.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-stone-300 text-stone-600 text-sm font-medium hover:bg-stone-50 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              重置
            </button>
            <button
              onClick={handleApplyFilters}
              disabled={loading}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-medium shadow-md shadow-primary-200 hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? '加载中...' : '应用筛选'}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard
          value={displayStats.totalDonated}
          label="总捐赠数"
          gradient="bg-gradient-to-br from-primary-500 to-primary-600"
          trend="up"
          trendValue="较上月 +12%"
          suffix="件"
        />
        <StatCard
          value={displayStats.totalClaimed}
          label="总领取数"
          gradient="bg-gradient-to-br from-secondary-500 to-secondary-600"
          trend="up"
          trendValue="较上月 +8%"
          suffix="件"
        />
        <StatCard
          value={displayStats.totalWasted}
          label="总损耗数"
          gradient="bg-gradient-to-br from-red-500 to-red-600"
          trend="down"
          trendValue="较上月 -5%"
          suffix="件"
        />
        <StatCard
          value={displayStats.expiryConversionRate}
          label="临期转化率"
          gradient="bg-gradient-to-br from-teal-500 to-teal-600"
          trend="up"
          trendValue="较上月 +3%"
          suffix="%"
        />
        <StatCard
          value={displayStats.avgClaimResponseTime}
          label="平均领取响应时长"
          gradient="bg-gradient-to-br from-blue-500 to-blue-600"
          trend="down"
          trendValue="较上月 -0.5h"
          suffix="h"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200/60 p-6">
          <h2 className="text-lg font-bold text-stone-800 mb-4">月度趋势对比</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockMonthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F4" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#78716C' }} />
              <YAxis tick={{ fontSize: 12, fill: '#78716C' }} />
              <Tooltip
                contentStyle={{
                  borderRadius: '12px',
                  border: '1px solid #E7E5E4',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="donated"
                name="捐赠"
                stroke="#F97316"
                strokeWidth={2}
                dot={{ fill: '#F97316', strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="claimed"
                name="领取"
                stroke="#16A34A"
                strokeWidth={2}
                dot={{ fill: '#16A34A', strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="wasted"
                name="损耗"
                stroke="#EF4444"
                strokeWidth={2}
                dot={{ fill: '#EF4444', strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200/60 p-6">
          <h2 className="text-lg font-bold text-stone-800 mb-4">损耗原因分布</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={lossReasonChartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {lossReasonChartData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={lossReasonColors[entry.reason] || pieColors[index % pieColors.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {lossReasonChartData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor:
                      lossReasonColors[item.reason] || pieColors[index % pieColors.length],
                  }}
                />
                <span className="text-xs text-stone-500">
                  {item.name} {item.value}件
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200/60 p-6 mb-8">
        <h2 className="text-lg font-bold text-stone-800 mb-4">分类统计</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={categoryChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F4" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#78716C' }} />
            <YAxis tick={{ fontSize: 12, fill: '#78716C' }} />
            <Tooltip
              contentStyle={{
                borderRadius: '12px',
                border: '1px solid #E7E5E4',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
              }}
            />
            <Legend />
            <Bar dataKey="捐赠" fill="#F97316" radius={[4, 4, 0, 0]} />
            <Bar dataKey="领取" fill="#16A34A" radius={[4, 4, 0, 0]} />
            <Bar dataKey="损耗" fill="#EF4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-stone-200/60 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-stone-800">捐赠者排行</h2>
          </div>
          <div className="space-y-3">
            {displayStats.roleStats.topDonors.map((donor, index) => (
              <div
                key={donor.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-stone-50"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                  {index === 0 && <Medal className="w-6 h-6 text-amber-400" />}
                  {index === 1 && <Medal className="w-6 h-6 text-stone-400" />}
                  {index === 2 && <Medal className="w-6 h-6 text-amber-700" />}
                  {index > 2 && (
                    <span className="text-sm font-bold text-stone-400">{index + 1}</span>
                  )}
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-200 to-primary-300 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-700 truncate">{donor.name}</p>
                </div>
                <span className="text-sm font-bold text-primary-500">{donor.count}件</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200/60 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Trophy className="w-5 h-5 text-secondary-500" />
            <h2 className="text-lg font-bold text-stone-800">领取者排行</h2>
          </div>
          <div className="space-y-3">
            {displayStats.roleStats.topClaimants.map((claimant, index) => (
              <div
                key={claimant.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-stone-50"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                  {index === 0 && <Medal className="w-6 h-6 text-amber-400" />}
                  {index === 1 && <Medal className="w-6 h-6 text-stone-400" />}
                  {index === 2 && <Medal className="w-6 h-6 text-amber-700" />}
                  {index > 2 && (
                    <span className="text-sm font-bold text-stone-400">{index + 1}</span>
                  )}
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-secondary-200 to-secondary-300 flex items-center justify-center">
                  <User className="w-4 h-4 text-secondary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-700 truncate">{claimant.name}</p>
                </div>
                <span className="text-sm font-bold text-secondary-500">{claimant.count}件</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200/60 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Refrigerator className="w-5 h-5 text-primary-500" />
          <h2 className="text-lg font-bold text-stone-800">点位统计</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stone-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-stone-600">点位名称</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-stone-600">所属社区</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-stone-600">捐赠数</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-stone-600">领取数</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-stone-600">损耗数</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-stone-600">库存/容量</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-stone-600">使用率</th>
              </tr>
            </thead>
            <tbody>
              {displayStats.fridgeStats.map((fridge) => (
                <tr key={fridge.id} className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                  <td className="py-3 px-4">
                    <span className="text-sm font-medium text-stone-700">{fridge.name}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-stone-500">{fridge.community}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-sm font-medium text-primary-600">{fridge.donated}件</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-sm font-medium text-green-600">{fridge.claimed}件</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-sm font-medium text-red-600">{fridge.wasted}件</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-sm text-stone-600">
                      {fridge.currentStock}/{fridge.capacity}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-20 h-2 bg-stone-200 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all',
                            fridge.currentStock / fridge.capacity > 0.8
                              ? 'bg-red-400'
                              : 'bg-primary-400'
                          )}
                          style={{
                            width: `${(fridge.currentStock / fridge.capacity) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-stone-500">
                        {Math.round((fridge.currentStock / fridge.capacity) * 100)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
