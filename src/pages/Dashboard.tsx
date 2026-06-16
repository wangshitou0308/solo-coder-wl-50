import { useEffect } from 'react'
import { Trophy, Medal, User, Refrigerator } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useStore } from '@/store/useStore'
import StatCard from '@/components/StatCard'
import { cn } from '@/lib/utils'

const pieColors = ['#22C55E', '#F97316', '#F59E0B', '#3B82F6', '#EC4899', '#06B6D4']

const fridgeStatusColors: Record<string, string> = {
  '正常': 'bg-green-500',
  '温度异常': 'bg-red-500',
  '需清洁': 'bg-amber-500',
}

export default function Dashboard() {
  const { dashboard, fetchDashboard, fridges, fetchFridges } = useStore()

  useEffect(() => {
    fetchDashboard()
    fetchFridges()
  }, [fetchDashboard, fetchFridges])

  if (!dashboard) return null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-bold text-stone-800 mb-6">社区数据看板</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          value={dashboard.totalDonated}
          label="投放总量"
          gradient="bg-gradient-to-br from-primary-500 to-primary-600"
          trend="up"
          trendValue="较上月 +12%"
          suffix="件"
        />
        <StatCard
          value={dashboard.totalClaimed}
          label="领取总量"
          gradient="bg-gradient-to-br from-secondary-500 to-secondary-600"
          trend="up"
          trendValue="较上月 +8%"
          suffix="件"
        />
        <StatCard
          value={dashboard.beneficiaryFamilies}
          label="受益家庭"
          gradient="bg-gradient-to-br from-blue-500 to-blue-600"
          trend="up"
          trendValue="较上月 +15%"
          suffix="户"
        />
        <StatCard
          value={dashboard.carbonReduction}
          label="减碳量"
          gradient="bg-gradient-to-br from-teal-500 to-teal-600"
          trend="up"
          trendValue="较上月 +10%"
          suffix="kg"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200/60 p-6">
          <h2 className="text-lg font-bold text-stone-800 mb-4">月度趋势</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dashboard.monthlyTrend}>
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
              <Bar dataKey="donated" name="捐赠" fill="#F97316" radius={[4, 4, 0, 0]} />
              <Bar dataKey="claimed" name="领取" fill="#16A34A" radius={[4, 4, 0, 0]} />
              <Bar dataKey="wasted" name="浪费" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200/60 p-6">
          <h2 className="text-lg font-bold text-stone-800 mb-4">类别分布</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={dashboard.categoryBreakdown}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
              >
                {dashboard.categoryBreakdown.map((_, index) => (
                  <Cell key={index} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {dashboard.categoryBreakdown.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: pieColors[index % pieColors.length] }} />
                <span className="text-xs text-stone-500">{item.name} {item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-stone-200/60 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-stone-800">捐赠排行</h2>
          </div>
          <div className="space-y-3">
            {dashboard.topDonors.map((donor, index) => (
              <div key={donor.id} className="flex items-center gap-3 p-3 rounded-xl bg-stone-50">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                  {index === 0 && <Medal className="w-6 h-6 text-amber-400" />}
                  {index === 1 && <Medal className="w-6 h-6 text-stone-400" />}
                  {index === 2 && <Medal className="w-6 h-6 text-amber-700" />}
                  {index > 2 && <span className="text-sm font-bold text-stone-400">{index + 1}</span>}
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

        <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200/60 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Refrigerator className="w-5 h-5 text-primary-500" />
            <h2 className="text-lg font-bold text-stone-800">冰箱库存状态</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fridges.map((fridge) => (
              <div key={fridge.id} className="bg-stone-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-stone-700">{fridge.name}</h3>
                  <span className={cn('w-2.5 h-2.5 rounded-full', fridgeStatusColors[fridge.status])} />
                </div>
                <div className="flex items-center justify-between text-xs text-stone-400 mb-2">
                  <span>库存</span>
                  <span>{fridge.currentStock}/{fridge.capacity}</span>
                </div>
                <div className="w-full h-2.5 bg-stone-200 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      fridge.currentStock / fridge.capacity > 0.8 ? 'bg-red-400' : 'bg-primary-400',
                    )}
                    style={{ width: `${(fridge.currentStock / fridge.capacity) * 100}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-stone-400">{fridge.location}</span>
                  <span className={cn(
                    'text-xs font-medium',
                    fridge.temperature > 6 ? 'text-red-500' : 'text-green-500',
                  )}>
                    {fridge.temperature}°C
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
