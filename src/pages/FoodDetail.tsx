import { useMemo, useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, MapPin, Truck, Refrigerator, Copy, CheckCircle, XCircle, User, QrCode, Check, AlertTriangle, Image as ImageIcon } from 'lucide-react'
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

const statusLabels: Record<string, { text: string; color: string }> = {
  available: { text: '可领取', color: 'bg-green-100 text-green-700' },
  pending_review: { text: '待审核', color: 'bg-amber-100 text-amber-700' },
  reserved: { text: '已预约', color: 'bg-purple-100 text-purple-700' },
  claimed: { text: '已领取', color: 'bg-blue-100 text-blue-700' },
  expired: { text: '已过期', color: 'bg-red-100 text-red-700' },
  spoiled: { text: '已变质', color: 'bg-stone-100 text-stone-700' },
  rejected: { text: '已驳回', color: 'bg-red-100 text-red-700' },
}

export default function FoodDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { foods, role, currentUser, claimFood, completeClaim, updateFoodStatus, fetchFoods } = useStore()
  const [showClaimSuccess, setShowClaimSuccess] = useState(false)
  const [claiming, setClaiming] = useState(false)
  const [claimError, setClaimError] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [verifyCode, setVerifyCode] = useState('')
  const [verifyError, setVerifyError] = useState('')

  useEffect(() => {
    fetchFoods()
  }, [fetchFoods])

  const food = useMemo(() => foods.find((f) => f.id === id), [foods, id])

  if (!food) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-lg text-stone-400">食物不存在或已被移除</p>
        <button onClick={() => navigate('/')} className="mt-4 text-primary-500 text-sm font-medium hover:underline">返回首页</button>
      </div>
    )
  }

  const colors = categoryColors[food.category] || categoryColors['生鲜果蔬']
  const PickupIcon = pickupIcons[food.pickupMethod] || MapPin
  const status = statusLabels[food.status] || statusLabels.available

  const diffMs = new Date(food.expiryDate).getTime() - Date.now()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  const isNearExpiry = diffDays >= 0 && diffDays <= 2
  const isExpired = diffDays < 0 || food.status === 'expired'

  const isMyClaim = role === 'claimant' && food.claimantId === currentUser.id && food.status === 'reserved'
  const isMyDonation = role === 'donor' && food.donorId === currentUser.id

  const handleClaim = async () => {
    setClaiming(true)
    setClaimError('')
    const success = await claimFood(food.id)
    setClaiming(false)
    if (success) {
      setShowClaimSuccess(true)
    } else {
      setClaimError('预约失败，该食物可能已被他人预约或已下架')
    }
  }

  const handleVerifyClaim = async () => {
    if (!verifyCode || verifyCode.length !== 6) {
      setVerifyError('请输入6位取餐码')
      return
    }
    if (verifyCode.toUpperCase() !== food.pickupCode?.toUpperCase()) {
      setVerifyError('取餐码不正确，请重试')
      return
    }
    setVerifying(true)
    setVerifyError('')
    const success = await completeClaim(food.id, verifyCode.toUpperCase())
    setVerifying(false)
    if (success) {
      setShowClaimSuccess(true)
    }
  }

  const handleApprove = async () => {
    await updateFoodStatus(food.id, 'available')
  }

  const handleReject = async () => {
    await updateFoodStatus(food.id, 'rejected')
  }

  const handleMarkSpoiled = async () => {
    await updateFoodStatus(food.id, 'spoiled')
  }

  const handleCopy = () => {
    if (food.pickupCode) {
      navigator.clipboard.writeText(food.pickupCode)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-stone-500 hover:text-stone-700 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm font-medium">返回</span>
      </button>

      {showClaimSuccess && (food.status === 'reserved' || food.status === 'claimed') && (
        <div className="mb-6 bg-secondary-50 border border-secondary-200 rounded-2xl p-5 flex items-start gap-3 animate-fade-in-up">
          <div className="w-10 h-10 rounded-xl bg-secondary-100 flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-5 h-5 text-secondary-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-secondary-800">
              {food.status === 'claimed' ? '领取成功！' : '预约成功！'}
            </p>
            <p className="text-xs text-secondary-600 mt-0.5">
              {food.status === 'claimed'
                ? '感谢您的领取，愿这份食物为您带来温暖'
                : '请在指定时间前往领取点，凭取餐码领取食物'}
            </p>
          </div>
          <button onClick={() => setShowClaimSuccess(false)} className="text-secondary-400 hover:text-secondary-600">
            <XCircle className="w-5 h-5" />
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-stone-200/60 overflow-hidden">
        {food.images && food.images.length > 0 ? (
          <div className="h-56 sm:h-72 bg-stone-100 relative">
            <img
              src={food.images[0]}
              alt={food.name}
              className="w-full h-full object-cover"
            />
            {food.images.length > 1 && (
              <div className="absolute bottom-3 right-3 flex gap-1">
                {food.images.slice(0, 4).map((_, i) => (
                  <div key={i} className={cn(
                    'w-1.5 h-1.5 rounded-full',
                    i === 0 ? 'bg-white' : 'bg-white/50',
                  )} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className={cn('h-48 sm:h-64 bg-gradient-to-br flex items-center justify-center relative', colors.gradient)}>
            <span className="text-8xl sm:text-9xl text-white/20 font-bold">{food.name.charAt(0)}</span>
            <ImageIcon className="w-12 h-12 text-white/15 absolute bottom-4 right-4" />
          </div>
        )}

        <div className="absolute top-4 right-4 z-10">
          <span className={cn('text-xs font-medium px-3 py-1.5 rounded-full shadow-sm', status.color)}>
            {status.text}
          </span>
        </div>

        <div className="p-6 sm:p-8 relative">
          {(isNearExpiry || isExpired) && food.status === 'available' && (
            <div className={cn(
              'mb-6 rounded-xl p-4 flex items-start gap-3',
              isExpired ? 'bg-red-50 border border-red-200' : 'bg-amber-50 border border-amber-200',
            )}>
              <AlertTriangle className={cn('w-5 h-5 flex-shrink-0 mt-0.5', isExpired ? 'text-red-500' : 'text-amber-500')} />
              <div>
                <p className={cn('text-sm font-semibold', isExpired ? 'text-red-800' : 'text-amber-800')}>
                  {isExpired ? '该食物已超过保质期' : `食品安全提醒：距离过期仅剩 ${diffDays} 天`}
                </p>
                <p className={cn('text-xs mt-0.5', isExpired ? 'text-red-600' : 'text-amber-600')}>
                  {isExpired ? '请不要领取，管理员将尽快下架处理' : '领取后请尽快食用，确保食品安全'}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-stone-800 mb-2">{food.name}</h1>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full', colors.bg, colors.text)}>
                  {food.category}
                </span>
                <span className="text-xs text-stone-400">发布于 {food.createdAt}</span>
                {food.updatedAt && food.updatedAt !== food.createdAt && (
                  <span className="text-xs text-stone-400">· 更新于 {food.updatedAt}</span>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-stone-400 mb-1.5">捐赠者</p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-200 to-primary-300 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary-600" />
                </div>
                <span className="text-sm font-medium text-stone-700">{food.donorName}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 my-6">
            <div className="bg-stone-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-stone-800">{food.quantity}</p>
              <p className="text-xs text-stone-400 mt-1">数量(份)</p>
            </div>
            <div className="bg-stone-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-stone-800">{food.weight}</p>
              <p className="text-xs text-stone-400 mt-1">总重量</p>
            </div>
            <div className={cn(
              'rounded-xl p-4 text-center',
              isNearExpiry && !isExpired ? 'bg-amber-50' : isExpired ? 'bg-red-50' : 'bg-stone-50',
            )}>
              <p className={cn('text-2xl font-bold',
                isExpired ? 'text-red-500' : isNearExpiry ? 'text-amber-500' : 'text-stone-800',
              )}>
                {isExpired ? '已过期' : diffDays === 0 ? '今天' : `${diffDays}天`}
              </p>
              <p className={cn('text-xs mt-1 flex items-center justify-center gap-0.5',
                isExpired ? 'text-red-400' : isNearExpiry ? 'text-amber-400' : 'text-stone-400',
              )}>
                <Clock className="w-3 h-3" />保质期剩余
              </p>
            </div>
            <div className="bg-stone-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-stone-800">{food.distance}km</p>
              <p className="text-xs text-stone-400 mt-1">距离您</p>
            </div>
          </div>

          {food.description && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-stone-600 mb-2 flex items-center gap-1.5">
                <span className="w-1 h-4 bg-primary-400 rounded-full" />
                食物描述
              </h3>
              <p className="text-sm text-stone-500 leading-relaxed bg-stone-50 rounded-xl p-4">
                {food.description}
              </p>
            </div>
          )}

          <div className="bg-gradient-to-r from-stone-50 to-primary-50/30 rounded-xl p-5 mb-6 border border-stone-100">
            <h3 className="text-sm font-semibold text-stone-600 mb-3 flex items-center gap-1.5">
              <span className="w-1 h-4 bg-secondary-400 rounded-full" />
              取餐信息
            </h3>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm border border-stone-100 flex-shrink-0">
                <PickupIcon className="w-6 h-6 text-primary-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-stone-700">{food.pickupMethod}</p>
                <p className="text-xs text-stone-400 mt-1 break-all">{food.location}</p>
                {food.fridgeId && (
                  <p className="text-xs text-primary-500 mt-1 flex items-center gap-1">
                    <Refrigerator className="w-3 h-3" />
                    请放入指定共享冰箱并关好门
                  </p>
                )}
              </div>
            </div>
          </div>

          {(food.status === 'reserved' || food.status === 'claimed') && food.pickupCode && (
            <div className="bg-primary-50 border border-primary-200 rounded-2xl p-6 mb-6 text-center">
              <p className="text-sm text-primary-600 font-medium mb-2 flex items-center justify-center gap-1.5">
                <QrCode className="w-4 h-4" />
                {food.status === 'claimed' ? '取餐凭证' : '预约取餐码'}
              </p>
              <p className="text-xs text-primary-400 mb-4">
                {food.status === 'claimed' ? '凭此码完成领取核销' : '凭此码到指定地点扫码领取'}
              </p>
              <div className="inline-flex items-center gap-3 bg-white border-2 border-dashed border-primary-300 rounded-xl px-8 py-4 shadow-sm">
                <span className="pickup-code text-3xl sm:text-4xl font-bold text-primary-600 tracking-widest">
                  {food.pickupCode}
                </span>
                <button onClick={handleCopy} className="p-2 hover:bg-primary-50 rounded-lg transition-colors" title="复制取餐码">
                  <Copy className="w-5 h-5 text-primary-400" />
                </button>
              </div>
              <div className="mt-6 inline-flex flex-col items-center bg-white rounded-xl p-4 border border-primary-100 shadow-sm">
                <div className="w-28 h-28 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-lg flex items-center justify-center border border-primary-100 relative overflow-hidden">
                  <div className="grid grid-cols-5 gap-0.5 p-2">
                    {Array.from({ length: 25 }).map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          'w-2 h-2 rounded-sm',
                          Math.random() > 0.4 ? 'bg-stone-800' : 'bg-transparent',
                        )}
                      />
                    ))}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-6 h-6 bg-white rounded flex items-center justify-center border border-stone-200">
                      <QrCode className="w-3.5 h-3.5 text-primary-500" />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-stone-400 mt-2">扫码取餐</p>
              </div>
            </div>
          )}

          {role === 'admin' && food.status === 'reserved' && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6">
              <h3 className="text-sm font-semibold text-blue-800 mb-4 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" />
                扫码核销领取
              </h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={verifyCode}
                  onChange={(e) => { setVerifyCode(e.target.value.toUpperCase()); setVerifyError('') }}
                  placeholder="输入6位取餐码"
                  maxLength={6}
                  className={cn(
                    'flex-1 px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all text-lg tracking-widest font-mono text-center',
                    verifyError ? 'border-red-300 bg-red-50 focus:ring-red-100' : 'border-blue-200 bg-white focus:border-blue-400 focus:ring-blue-100',
                  )}
                />
                <button
                  onClick={handleVerifyClaim}
                  disabled={verifying || !verifyCode}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-60 flex items-center gap-2"
                >
                  {verifying ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  核销
                </button>
              </div>
              {verifyError && (
                <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {verifyError}
                </p>
              )}
              <p className="text-xs text-blue-500 mt-2">
                领取人：{food.claimantName || '未知'} · 取餐码：{food.pickupCode?.slice(0, 3)}****
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            {role === 'claimant' && food.status === 'available' && !isExpired && (
              <div className="flex-1">
                <button
                  onClick={handleClaim}
                  disabled={claiming}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium shadow-md shadow-primary-200 hover:shadow-lg hover:from-primary-600 hover:to-primary-700 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {claiming ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <QrCode className="w-4 h-4" />
                  )}
                  {claiming ? '预约中...' : '立即预约领取'}
                </button>
                {claimError && (
                  <p className="text-xs text-red-500 mt-2 flex items-center gap-1 justify-center">
                    <AlertTriangle className="w-3 h-3" />
                    {claimError}
                  </p>
                )}
              </div>
            )}

            {isMyClaim && (
              <div className="flex-1 py-3.5 rounded-xl bg-purple-50 text-purple-600 font-medium text-center text-sm border border-purple-200">
                ✨ 您已预约，请凭取餐码前往领取
              </div>
            )}

            {isMyDonation && food.status === 'pending_review' && (
              <div className="flex-1 py-3.5 rounded-xl bg-amber-50 text-amber-600 font-medium text-center text-sm border border-amber-200">
                ⏳ 审核中，请耐心等待管理员审核
              </div>
            )}

            {isMyDonation && food.status === 'available' && (
              <div className="flex-1 py-3.5 rounded-xl bg-secondary-50 text-secondary-600 font-medium text-center text-sm border border-secondary-200">
                ✓ 已上架展示中
              </div>
            )}

            {role === 'admin' && food.status === 'pending_review' && (
              <>
                <button
                  onClick={handleApprove}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-secondary-500 to-secondary-600 text-white font-medium shadow-md hover:shadow-lg transition-all text-sm"
                >
                  <CheckCircle className="w-4 h-4" /> 审核通过并上架
                </button>
                <button
                  onClick={handleReject}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 border-red-200 text-red-500 font-medium hover:bg-red-50 transition-all text-sm"
                >
                  <XCircle className="w-4 h-4" /> 驳回申请
                </button>
              </>
            )}

            {role === 'admin' && (food.status === 'available' || food.status === 'reserved') && !isExpired && (
              <button
                onClick={handleMarkSpoiled}
                className="sm:w-auto px-6 py-3.5 rounded-xl border-2 border-amber-200 text-amber-600 font-medium hover:bg-amber-50 transition-all text-sm flex items-center justify-center gap-2"
              >
                <AlertTriangle className="w-4 h-4" /> 标记变质
              </button>
            )}

            {role === 'claimant' && food.status === 'claimed' && food.claimantName && (
              <div className="flex-1 py-3.5 rounded-xl bg-blue-50 text-blue-600 font-medium text-center text-sm border border-blue-200">
                已由 {food.claimantName} 领取完成
              </div>
            )}

            {food.status === 'expired' && (
              <div className="flex-1 py-3.5 rounded-xl bg-red-50 text-red-600 font-medium text-center text-sm border border-red-200">
                已过期下架，等待管理员处理
              </div>
            )}

            {food.status === 'rejected' && (
              <div className="flex-1 py-3.5 rounded-xl bg-stone-100 text-stone-600 font-medium text-center text-sm border border-stone-200">
                捐赠申请已被驳回
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
