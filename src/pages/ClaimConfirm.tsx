import { useMemo, useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, MapPin, Copy, CheckCircle, XCircle, QrCode, Check, AlertTriangle, Image as ImageIcon, Truck, Refrigerator } from 'lucide-react'
import { useStore } from '@/store/useStore'
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

export default function ClaimConfirm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { foods, currentUser, completeClaim, cancelClaim, createVoucher, fetchFoods } = useStore()
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showCancelConfirmModal, setShowCancelConfirmModal] = useState(false)
  const [showCancelSuccessModal, setShowCancelSuccessModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [actionType, setActionType] = useState<'claim' | 'cancel'>('claim')
  const [timeLeft, setTimeLeft] = useState({ hours: 24, minutes: 0, seconds: 0 })

  useEffect(() => {
    fetchFoods()
  }, [fetchFoods])

  useEffect(() => {
    const endTime = Date.now() + 24 * 60 * 60 * 1000
    const timer = setInterval(() => {
      const diff = endTime - Date.now()
      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 })
        clearInterval(timer)
        return
      }
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      setTimeLeft({ hours, minutes, seconds })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const food = useMemo(() => foods.find((f) => f.id === id), [foods, id])

  if (!food) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-lg text-stone-400">预约信息不存在或已失效</p>
        <button onClick={() => navigate('/')} className="mt-4 text-primary-500 text-sm font-medium hover:underline">返回首页</button>
      </div>
    )
  }

  const colors = categoryColors[food.category] || categoryColors['生鲜果蔬']
  const PickupIcon = pickupIcons[food.pickupMethod] || MapPin

  const diffMs = new Date(food.expiryDate).getTime() - Date.now()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  const isNearExpiry = diffDays >= 0 && diffDays <= 2
  const isExpired = diffDays < 0

  const isTimeExpired = timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0

  const handleCopyCode = () => {
    if (food.pickupCode) {
      navigator.clipboard.writeText(food.pickupCode)
    }
  }

  const handleConfirmClaim = async () => {
    if (isTimeExpired || isExpired) return
    setActionType('claim')
    setLoading(true)
    try {
      const claimSuccess = await completeClaim(food.id, food.pickupCode || '')
      if (claimSuccess) {
        await createVoucher(food)
        setShowSuccessModal(true)
      }
    } catch {
      console.error('领取失败')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelClaim = async () => {
    setActionType('cancel')
    setLoading(true)
    try {
      const success = await cancelClaim(food.id)
      if (success) {
        setShowCancelConfirmModal(false)
        setShowCancelSuccessModal(true)
      }
    } catch {
      console.error('取消失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSuccessClose = () => {
    setShowSuccessModal(false)
    navigate('/')
  }

  const handleCancelSuccessClose = () => {
    setShowCancelSuccessModal(false)
    navigate('/')
  }

  const isMyClaim = food.claimantId === currentUser.id && food.status === 'reserved'

  if (!isMyClaim) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <p className="text-lg text-stone-400">您没有权限查看此预约信息</p>
        <button onClick={() => navigate('/')} className="mt-4 text-primary-500 text-sm font-medium hover:underline">返回首页</button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-stone-500 hover:text-stone-700 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm font-medium">返回</span>
      </button>

      <h1 className="text-2xl font-bold text-stone-800 mb-6">确认领取</h1>

      <div className={cn(
        'rounded-2xl p-5 mb-6 flex items-start gap-3',
        isTimeExpired ? 'bg-red-50 border border-red-200' : 'bg-amber-50 border border-amber-200',
      )}>
        <div className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
          isTimeExpired ? 'bg-red-100' : 'bg-amber-100',
        )}>
          <Clock className={cn('w-5 h-5', isTimeExpired ? 'text-red-500' : 'text-amber-500')} />
        </div>
        <div className="flex-1">
          <p className={cn(
            'text-sm font-semibold',
            isTimeExpired ? 'text-red-800' : 'text-amber-800',
          )}>
            {isTimeExpired ? '预约已超时' : '请在24小时内完成领取'}
          </p>
          {!isTimeExpired && (
            <p className="text-xs text-amber-600 mt-0.5">
              剩余时间：
              <span className="font-mono font-bold text-amber-700">
                {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
              </span>
            </p>
          )}
          {isTimeExpired && (
            <p className="text-xs text-red-600 mt-0.5">
              您的预约已超时，食物已重新放回待领区
            </p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-200/60 overflow-hidden mb-6">
        {food.images && food.images.length > 0 ? (
          <div className="h-48 bg-stone-100">
            <img
              src={food.images[0]}
              alt={food.name}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className={cn('h-40 bg-gradient-to-br flex items-center justify-center relative', colors.gradient)}>
            <span className="text-6xl text-white/20 font-bold">{food.name.charAt(0)}</span>
            <ImageIcon className="w-10 h-10 text-white/15 absolute bottom-3 right-3" />
          </div>
        )}

        <div className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-stone-800">{food.name}</h2>
              <div className="flex items-center gap-2 mt-2">
                <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full', colors.bg, colors.text)}>
                  {food.category}
                </span>
                <span className="text-xs text-stone-400">捐赠者：{food.donorName}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="bg-stone-50 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-stone-800">{food.quantity}</p>
              <p className="text-xs text-stone-400 mt-0.5">数量(份)</p>
            </div>
            <div className="bg-stone-50 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-stone-800">{food.weight}</p>
              <p className="text-xs text-stone-400 mt-0.5">总重量</p>
            </div>
            <div className={cn(
              'rounded-xl p-3 text-center',
              isNearExpiry && !isExpired ? 'bg-amber-50' : isExpired ? 'bg-red-50' : 'bg-stone-50',
            )}>
              <p className={cn('text-xl font-bold',
                isExpired ? 'text-red-500' : isNearExpiry ? 'text-amber-500' : 'text-stone-800',
              )}>
                {isExpired ? '已过期' : diffDays === 0 ? '今天' : `${diffDays}天`}
              </p>
              <p className={cn('text-xs mt-0.5',
                isExpired ? 'text-red-400' : isNearExpiry ? 'text-amber-400' : 'text-stone-400',
              )}>
                保质期剩余
              </p>
            </div>
          </div>

          {(isNearExpiry || isExpired) && (
            <div className={cn(
              'mb-5 rounded-xl p-3 flex items-start gap-3',
              isExpired ? 'bg-red-50 border border-red-200' : 'bg-amber-50 border border-amber-200',
            )}>
              <AlertTriangle className={cn('w-4 h-4 flex-shrink-0 mt-0.5', isExpired ? 'text-red-500' : 'text-amber-500')} />
              <div>
                <p className={cn('text-xs font-semibold', isExpired ? 'text-red-800' : 'text-amber-800')}>
                  {isExpired ? '该食物已超过保质期' : `食品安全提醒：距离过期仅剩 ${diffDays} 天`}
                </p>
                <p className={cn('text-xs mt-0.5', isExpired ? 'text-red-600' : 'text-amber-600')}>
                  {isExpired ? '请不要领取，已自动取消预约' : '领取后请尽快食用，确保食品安全'}
                </p>
              </div>
            </div>
          )}

          <div className="bg-gradient-to-r from-stone-50 to-primary-50/30 rounded-xl p-4 mb-5 border border-stone-100">
            <h3 className="text-sm font-semibold text-stone-600 mb-3 flex items-center gap-1.5">
              <span className="w-1 h-4 bg-secondary-400 rounded-full" />
              领取地点
            </h3>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm border border-stone-100 flex-shrink-0">
                <PickupIcon className="w-5 h-5 text-primary-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-stone-700">{food.pickupMethod}</p>
                <p className="text-xs text-stone-400 mt-1 break-all">{food.location}</p>
              </div>
            </div>
          </div>

          <div className="bg-primary-50 border border-primary-200 rounded-2xl p-5 text-center">
            <p className="text-sm text-primary-600 font-medium mb-2 flex items-center justify-center gap-1.5">
              <QrCode className="w-4 h-4" />
              取餐码
            </p>
            <p className="text-xs text-primary-400 mb-4">
              凭此码到指定地点扫码领取
            </p>
            <div className="inline-flex items-center gap-3 bg-white border-2 border-dashed border-primary-300 rounded-xl px-6 py-3 shadow-sm">
              <span className="pickup-code text-2xl sm:text-3xl font-bold text-primary-600 tracking-widest">
                {food.pickupCode}
              </span>
              <button onClick={handleCopyCode} className="p-2 hover:bg-primary-50 rounded-lg transition-colors" title="复制取餐码">
                <Copy className="w-4 h-4 text-primary-400" />
              </button>
            </div>
            <div className="mt-4 inline-flex flex-col items-center bg-white rounded-xl p-3 border border-primary-100 shadow-sm">
              <div className="w-24 h-24 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-lg flex items-center justify-center border border-primary-100 relative overflow-hidden">
                <div className="grid grid-cols-5 gap-0.5 p-2">
                  {Array.from({ length: 25 }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        'w-1.5 h-1.5 rounded-sm',
                        Math.random() > 0.4 ? 'bg-stone-800' : 'bg-transparent',
                      )}
                    />
                  ))}
                </div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-5 h-5 bg-white rounded flex items-center justify-center border border-stone-200">
                    <QrCode className="w-3 h-3 text-primary-500" />
                  </div>
                </div>
              </div>
              <p className="text-xs text-stone-400 mt-2">扫码取餐</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => setShowCancelConfirmModal(true)}
          disabled={loading || isTimeExpired || isExpired}
          className="flex-1 py-3.5 rounded-xl border-2 border-stone-200 text-stone-600 font-medium hover:bg-stone-50 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <XCircle className="w-4 h-4" />
          取消预约
        </button>
        <button
          onClick={handleConfirmClaim}
          disabled={loading || isTimeExpired || isExpired}
          className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium shadow-md shadow-primary-200 hover:shadow-lg hover:from-primary-600 hover:to-primary-700 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading && actionType === 'claim' ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Check className="w-4 h-4" />
          )}
          {loading && actionType === 'claim' ? '确认中...' : '确认领取'}
        </button>
      </div>

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full animate-fade-in-up">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-stone-800 mb-2">领取成功！</h3>
              <p className="text-sm text-stone-500 mb-6">
                感谢您的领取，凭券已保存到您的账户中
              </p>
              <button
                onClick={handleSuccessClose}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium hover:from-primary-600 hover:to-primary-700 transition-all"
              >
                完成
              </button>
            </div>
          </div>
        </div>
      )}

      {showCancelConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full animate-fade-in-up">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-amber-500" />
              </div>
              <h3 className="text-xl font-bold text-stone-800 mb-2">确认取消预约？</h3>
              <p className="text-sm text-stone-500 mb-6">
                取消后，该食物将重新放回待领区，其他人可以预约
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelConfirmModal(false)}
                  className="flex-1 py-3 rounded-xl border-2 border-stone-200 text-stone-600 font-medium hover:bg-stone-50 transition-all"
                >
                  再想想
                </button>
                <button
                  onClick={handleCancelClaim}
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading && actionType === 'cancel' ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : null}
                  确认取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCancelSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full animate-fade-in-up">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-stone-800 mb-2">已取消预约</h3>
              <p className="text-sm text-stone-500 mb-6">
                您的预约已取消，食物已重新放回待领区
              </p>
              <button
                onClick={handleCancelSuccessClose}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium hover:from-primary-600 hover:to-primary-700 transition-all"
              >
                完成
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
