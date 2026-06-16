import { useNavigate } from 'react-router-dom'
import { Clock, MapPin, Truck, Refrigerator, Image as ImageIcon } from 'lucide-react'
import { useStore, type Food } from '@/store/useStore'
import { cn } from '@/lib/utils'

const categoryColors: Record<string, { bg: string; text: string; gradient: string }> = {
  '生鲜果蔬': { bg: 'bg-green-100', text: 'text-green-700', gradient: 'from-green-400 to-emerald-500' },
  '熟食': { bg: 'bg-orange-100', text: 'text-orange-700', gradient: 'from-orange-400 to-amber-500' },
  '干货': { bg: 'bg-amber-100', text: 'text-amber-700', gradient: 'from-amber-400 to-yellow-500' },
  '罐头': { bg: 'bg-blue-100', text: 'text-blue-700', gradient: 'from-blue-400 to-indigo-500' },
  '烘焙': { bg: 'bg-pink-100', text: 'text-pink-700', gradient: 'from-pink-400 to-rose-500' },
  '冷冻食品': { bg: 'bg-cyan-100', text: 'text-cyan-700', gradient: 'from-cyan-400 to-teal-500' },
}

const pickupIcons: Record<string, typeof MapPin> = {
  '定点自取': MapPin,
  '放置共享冰箱': Refrigerator,
  '上门领取': Truck,
}

function getExpiryInfo(expiryDate: string) {
  const now = new Date()
  const expiry = new Date(expiryDate)
  const diffMs = expiry.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return { text: `已过期${Math.abs(diffDays)}天`, status: 'expired' as const }
  if (diffDays === 0) return { text: '今天过期', status: 'urgent' as const }
  if (diffDays <= 2) return { text: `剩余${diffDays}天`, status: 'near' as const }
  return { text: `剩余${diffDays}天`, status: 'normal' as const }
}

export default function FoodCard({ food }: { food: Food }) {
  const navigate = useNavigate()
  const colors = categoryColors[food.category] || categoryColors['生鲜果蔬']
  const expiryInfo = getExpiryInfo(food.expiryDate)
  const PickupIcon = pickupIcons[food.pickupMethod] || MapPin

  const isNearExpiry = expiryInfo.status === 'near' || expiryInfo.status === 'urgent'
  const isExpired = expiryInfo.status === 'expired'

  return (
    <div
      onClick={() => navigate(`/food/${food.id}`)}
      className={cn(
        'relative rounded-2xl overflow-hidden bg-white shadow-sm border-2 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1',
        isNearExpiry && !isExpired && 'animate-pulse-border border-amber-400',
        isExpired && 'border-red-300',
        !isNearExpiry && !isExpired && 'border-transparent',
      )}
    >
      {isExpired && (
        <div className="absolute inset-0 bg-red-500/20 z-10 flex items-center justify-center">
          <span className="bg-red-500 text-white px-4 py-1.5 rounded-full text-sm font-bold">已过期</span>
        </div>
      )}

      {food.images && food.images.length > 0 ? (
        <div className="h-36 bg-stone-100 overflow-hidden">
          <img
            src={food.images[0]}
            alt={food.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        </div>
      ) : (
        <div className={cn('h-36 bg-gradient-to-br flex items-center justify-center relative', colors.gradient)}>
          <span className="text-5xl text-white/30 font-bold">{food.name.charAt(0)}</span>
          {food.images && food.images.length === 0 && (
            <ImageIcon className="w-8 h-8 text-white/20 absolute bottom-3 right-3" />
          )}
        </div>
      )}

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', colors.bg, colors.text)}>
            {food.category}
          </span>
          <span
            className={cn(
              'text-xs font-medium',
              expiryInfo.status === 'expired' && 'text-red-500',
              expiryInfo.status === 'urgent' && 'text-red-500',
              expiryInfo.status === 'near' && 'text-amber-500',
              expiryInfo.status === 'normal' && 'text-stone-400',
            )}
          >
            <Clock className="w-3 h-3 inline mr-1" />
            {expiryInfo.text}
          </span>
        </div>

        <h3 className="font-semibold text-stone-800 mb-1 truncate">{food.name}</h3>

        <div className="flex items-center justify-between text-sm text-stone-500 mb-3">
          <span>数量: {food.quantity}份</span>
          <span>{food.weight}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-stone-400">
            <PickupIcon className="w-3.5 h-3.5" />
            <span className="truncate max-w-[120px]">{food.pickupMethod}</span>
          </div>
          <span className="text-xs bg-primary-50 text-primary-600 px-2 py-0.5 rounded-full font-medium">
            {food.distance}km
          </span>
        </div>

        {food.status === 'claimed' && (
          <div className="mt-2 text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-lg text-center font-medium">
            已被领取
          </div>
        )}
        {food.status === 'reserved' && (
          <div className="mt-2 text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded-lg text-center font-medium">
            已预约
          </div>
        )}
        {food.status === 'pending_review' && (
          <div className="mt-2 text-xs bg-amber-50 text-amber-600 px-2 py-1 rounded-lg text-center font-medium">
            待审核
          </div>
        )}
      </div>
    </div>
  )
}
