import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, User, Gift, ShoppingBag, Clock, CheckCircle, XCircle, AlertTriangle, Eye } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { cn } from '@/lib/utils'

const statusConfig: Record<string, { text: string; color: string; icon: typeof CheckCircle }> = {
  available: { text: '可领取', color: 'text-green-600 bg-green-50', icon: CheckCircle },
  pending_review: { text: '待审核', color: 'text-amber-600 bg-amber-50', icon: Clock },
  claimed: { text: '已领取', color: 'text-blue-600 bg-blue-50', icon: ShoppingBag },
  expired: { text: '已过期', color: 'text-red-600 bg-red-50', icon: AlertTriangle },
  spoiled: { text: '已变质', color: 'text-stone-600 bg-stone-50', icon: XCircle },
  rejected: { text: '已驳回', color: 'text-red-600 bg-red-50', icon: XCircle },
}

export default function Profile() {
  const navigate = useNavigate()
  const { currentUser, foods, role } = useStore()
  const [activeTab, setActiveTab] = useState<'donate' | 'claim'>('donate')

  const donations = foods.filter((f) => f.donorId === currentUser.id)
  const claims = foods.filter((f) => f.claimantId === currentUser.id)

  const records = activeTab === 'donate' ? donations : claims

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-stone-500 hover:text-stone-700 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm font-medium">返回</span>
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-200/60 p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-300 to-secondary-400 flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-stone-800">{currentUser.name}</h2>
              <span className={cn(
                'text-xs font-medium px-2.5 py-0.5 rounded-full',
                role === 'donor' && 'bg-primary-50 text-primary-600',
                role === 'claimant' && 'bg-blue-50 text-blue-600',
                role === 'admin' && 'bg-purple-50 text-purple-600',
              )}>
                {role === 'donor' ? '捐赠者' : role === 'claimant' ? '需求者' : '管理员'}
              </span>
            </div>
            <p className="text-sm text-stone-400 mt-1">{currentUser.phone}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-primary-50 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Gift className="w-4 h-4 text-primary-500" />
              <span className="text-2xl font-bold text-primary-600">{currentUser.donationCount || donations.length}</span>
            </div>
            <p className="text-xs text-primary-500">捐赠数</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <ShoppingBag className="w-4 h-4 text-blue-500" />
              <span className="text-2xl font-bold text-blue-600">{currentUser.claimCount || claims.length}</span>
            </div>
            <p className="text-xs text-blue-500">领取数</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 bg-stone-100 rounded-xl p-1 mb-6">
        <button
          onClick={() => setActiveTab('donate')}
          className={cn(
            'flex-1 py-2 rounded-lg text-sm font-medium transition-all',
            activeTab === 'donate' ? 'bg-white text-primary-600 shadow-sm' : 'text-stone-500',
          )}
        >
          我的捐赠
        </button>
        <button
          onClick={() => setActiveTab('claim')}
          className={cn(
            'flex-1 py-2 rounded-lg text-sm font-medium transition-all',
            activeTab === 'claim' ? 'bg-white text-blue-600 shadow-sm' : 'text-stone-500',
          )}
        >
          我的领取
        </button>
      </div>

      <div className="space-y-3">
        {records.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-stone-400">暂无记录</p>
          </div>
        ) : (
          records.map((food) => {
            const sc = statusConfig[food.status] || statusConfig.available
            const StatusIcon = sc.icon
            return (
              <div
                key={food.id}
                onClick={() => navigate(`/food/${food.id}`)}
                className="bg-white rounded-xl border border-stone-200/60 p-4 flex items-center gap-4 cursor-pointer hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg font-bold text-stone-300">{food.name.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-800 truncate">{food.name}</p>
                  <p className="text-xs text-stone-400 mt-0.5">
                    {food.category} · {food.weight} · {food.createdAt}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1', sc.color)}>
                    <StatusIcon className="w-3 h-3" />
                    {sc.text}
                  </span>
                  <Eye className="w-4 h-4 text-stone-300" />
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
