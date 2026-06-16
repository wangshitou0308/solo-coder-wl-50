import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ShoppingBag, Gift, Clock, MapPin, QrCode, CheckCircle, ChevronDown, ChevronUp, Package, Scale, Tag, User } from 'lucide-react'
import { useStore, type ClaimVoucher } from '@/store/useStore'
import { cn } from '@/lib/utils'

const categoryColors: Record<string, { bg: string; text: string }> = {
  '生鲜果蔬': { bg: 'bg-green-100', text: 'text-green-700' },
  '熟食': { bg: 'bg-orange-100', text: 'text-orange-700' },
  '干货': { bg: 'bg-amber-100', text: 'text-amber-700' },
  '罐头': { bg: 'bg-blue-100', text: 'text-blue-700' },
  '烘焙': { bg: 'bg-pink-100', text: 'text-pink-700' },
  '冷冻食品': { bg: 'bg-cyan-100', text: 'text-cyan-700' },
}

function VoucherCard({ voucher, type }: { voucher: ClaimVoucher; type: 'claimed' | 'donated' }) {
  const [expanded, setExpanded] = useState(false)
  const colors = categoryColors[voucher.category] || categoryColors['生鲜果蔬']

  return (
    <div className="bg-white rounded-xl border border-stone-200/60 overflow-hidden transition-all hover:shadow-md">
      <div
        className="p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start gap-4">
          <div className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
            type === 'claimed' ? 'bg-blue-100' : 'bg-primary-100'
          )}>
            <span className={cn(
              'text-lg font-bold',
              type === 'claimed' ? 'text-blue-600' : 'text-primary-600'
            )}>
              {voucher.foodName.charAt(0)}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-stone-800 truncate">{voucher.foodName}</h3>
              <span className={cn(
                'flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-green-50 text-green-600 flex-shrink-0'
              )}>
                <CheckCircle className="w-3 h-3" />
                已完成
              </span>
            </div>

            <div className="flex items-center gap-1.5 mt-1.5">
              <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', colors.bg, colors.text)}>
                {voucher.category}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3">
              <div className="flex items-center gap-1.5 text-xs text-stone-500">
                <Clock className="w-3.5 h-3.5 text-stone-400" />
                <span>{voucher.claimedAt}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-stone-500">
                <QrCode className="w-3.5 h-3.5 text-stone-400" />
                <span className="font-mono font-medium text-stone-700">{voucher.pickupCode}</span>
              </div>
              <div className="flex items-start gap-1.5 text-xs text-stone-500 col-span-2">
                <MapPin className="w-3.5 h-3.5 text-stone-400 flex-shrink-0 mt-0.5" />
                <span className="truncate">{voucher.pickupLocation}</span>
              </div>
            </div>
          </div>

          <button className="flex-shrink-0 p-1 text-stone-400 hover:text-stone-600 transition-colors">
            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-stone-100">
          <div className="pt-4 grid grid-cols-2 gap-3">
            <div className="bg-stone-50 rounded-lg p-3">
              <div className="flex items-center gap-1.5 text-xs text-stone-400 mb-1">
                <Package className="w-3.5 h-3.5" />
                <span>数量</span>
              </div>
              <p className="text-sm font-semibold text-stone-800">{voucher.quantity} 份</p>
            </div>

            <div className="bg-stone-50 rounded-lg p-3">
              <div className="flex items-center gap-1.5 text-xs text-stone-400 mb-1">
                <Scale className="w-3.5 h-3.5" />
                <span>重量</span>
              </div>
              <p className="text-sm font-semibold text-stone-800">{voucher.weight || '-'}</p>
            </div>

            <div className="bg-stone-50 rounded-lg p-3">
              <div className="flex items-center gap-1.5 text-xs text-stone-400 mb-1">
                <Tag className="w-3.5 h-3.5" />
                <span>分类</span>
              </div>
              <p className="text-sm font-semibold text-stone-800">{voucher.category}</p>
            </div>

            <div className="bg-stone-50 rounded-lg p-3">
              <div className="flex items-center gap-1.5 text-xs text-stone-400 mb-1">
                <User className="w-3.5 h-3.5" />
                <span>{type === 'claimed' ? '捐赠者' : '领取者'}</span>
              </div>
              <p className="text-sm font-semibold text-stone-800 truncate">
                {type === 'claimed' ? voucher.donorName : voucher.claimantName}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function VoucherHistory() {
  const navigate = useNavigate()
  const { currentUser, vouchers, fetchVouchers, role } = useStore()
  const [activeTab, setActiveTab] = useState<'claimed' | 'donated'>('claimed')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await fetchVouchers()
      setLoading(false)
    }
    loadData()
  }, [fetchVouchers])

  const claimedVouchers = vouchers.filter((v) => v.claimantId === currentUser.id)
  const donatedVouchers = vouchers.filter((v) => v.donorId === currentUser.id)

  const displayedVouchers = activeTab === 'claimed' ? claimedVouchers : donatedVouchers

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-stone-500 hover:text-stone-700 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm font-medium">返回</span>
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-800">领取凭证</h1>
        <p className="text-sm text-stone-500 mt-1">查看您的所有领取和捐赠记录</p>
      </div>

      <div className="flex items-center gap-1 bg-stone-100 rounded-xl p-1 mb-6">
        <button
          onClick={() => setActiveTab('claimed')}
          className={cn(
            'flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2',
            activeTab === 'claimed' ? 'bg-white text-blue-600 shadow-sm' : 'text-stone-500',
          )}
        >
          <ShoppingBag className="w-4 h-4" />
          我领取的
          {claimedVouchers.length > 0 && (
            <span className={cn(
              'text-xs px-1.5 py-0.5 rounded-full',
              activeTab === 'claimed' ? 'bg-blue-100 text-blue-600' : 'bg-stone-200 text-stone-500'
            )}>
              {claimedVouchers.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('donated')}
          className={cn(
            'flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2',
            activeTab === 'donated' ? 'bg-white text-primary-600 shadow-sm' : 'text-stone-500',
          )}
        >
          <Gift className="w-4 h-4" />
          我捐赠的
          {donatedVouchers.length > 0 && (
            <span className={cn(
              'text-xs px-1.5 py-0.5 rounded-full',
              activeTab === 'donated' ? 'bg-primary-100 text-primary-600' : 'bg-stone-200 text-stone-500'
            )}>
              {donatedVouchers.length}
            </span>
          )}
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-stone-200/60 p-4 animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-stone-200" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-stone-200 rounded w-1/2" />
                  <div className="h-3 bg-stone-200 rounded w-1/4" />
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-3 bg-stone-200 rounded" />
                    <div className="h-3 bg-stone-200 rounded" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : displayedVouchers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-stone-200/60">
          <div className={cn(
            'w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4',
            activeTab === 'claimed' ? 'bg-blue-50' : 'bg-primary-50'
          )}>
            {activeTab === 'claimed' ? (
              <ShoppingBag className={cn('w-8 h-8', 'text-blue-400')} />
            ) : (
              <Gift className={cn('w-8 h-8', 'text-primary-400')} />
            )}
          </div>
          <p className="text-stone-500 font-medium">
            {activeTab === 'claimed' ? '暂无领取记录' : '暂无捐赠记录'}
          </p>
          <p className="text-sm text-stone-400 mt-1">
            {activeTab === 'claimed'
              ? '您领取的食物凭证将会显示在这里'
              : '您捐赠的食物被领取后将会显示在这里'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayedVouchers.map((voucher) => (
            <VoucherCard key={voucher.id} voucher={voucher} type={activeTab} />
          ))}
        </div>
      )}
    </div>
  )
}
