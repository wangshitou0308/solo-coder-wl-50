import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Star, Send, MessageSquareHeart, User, Clock, ChefHat, ShoppingBag, Heart } from 'lucide-react'
import { useStore, type Food, type FoodReview } from '@/store/useStore'
import { cn } from '@/lib/utils'

type ReviewTab = 'pending' | 'completed'
type ReviewDirection = 'received' | 'sent'

interface PendingReview {
  food: Food
  targetId: string
  targetName: string
  tradeTime: string
}

export default function ReviewPage() {
  const navigate = useNavigate()
  const { currentUser, foods, reviews, fetchFoods, fetchUserReviews, addReview } = useStore()
  const [activeTab, setActiveTab] = useState<ReviewTab>('pending')
  const [direction, setDirection] = useState<ReviewDirection>('received')
  const [selectedPending, setSelectedPending] = useState<PendingReview | null>(null)
  const [rating, setRating] = useState(5)
  const [content, setContent] = useState('')
  const [thankYouNote, setThankYouNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hoverRating, setHoverRating] = useState(0)

  useEffect(() => {
    fetchFoods()
    fetchUserReviews()
  }, [fetchFoods, fetchUserReviews])

  const pendingReviews = useMemo<PendingReview[]>(() => {
    const completedTrades = foods.filter((f) => f.status === 'claimed')
    const reviewedFoodIds = new Set(reviews.map((r) => r.foodId))
    
    return completedTrades
      .filter((f) => {
        if (reviewedFoodIds.has(f.id)) return false
        if (currentUser.role === 'donor') {
          return f.donorId === currentUser.id && f.claimantId
        } else {
          return f.claimantId === currentUser.id
        }
      })
      .map((f) => ({
        food: f,
        targetId: currentUser.role === 'donor' ? (f.claimantId as string) : f.donorId,
        targetName: currentUser.role === 'donor' ? (f.claimantName as string) : f.donorName,
        tradeTime: f.createdAt,
      }))
  }, [foods, reviews, currentUser])

  const filteredReviews = useMemo(() => {
    const filtered = direction === 'received'
      ? reviews.filter((r) => r.targetId === currentUser.id)
      : reviews.filter((r) => r.reviewerId === currentUser.id)
    
    return [...filtered].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }, [reviews, direction, currentUser.id])

  const handleSubmit = async () => {
    if (!selectedPending || !content.trim()) return
    
    setIsSubmitting(true)
    try {
      const result = await addReview(selectedPending.food.id, {
        reviewerId: currentUser.id,
        reviewerName: currentUser.name,
        reviewerRole: currentUser.role as 'donor' | 'claimant',
        targetId: selectedPending.targetId,
        targetName: selectedPending.targetName,
        rating,
        content: content.trim(),
        thankYouNote: thankYouNote.trim() || undefined,
      })
      
      if (result) {
        setSelectedPending(null)
        setRating(5)
        setContent('')
        setThankYouNote('')
        fetchUserReviews()
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStars = (value: number, interactive = false, size = 'w-5 h-5') => {
    const displayValue = interactive ? (hoverRating || value) : value
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              size,
              'transition-all',
              star <= displayValue
                ? 'text-amber-400 fill-amber-400'
                : 'text-stone-300',
              interactive && 'cursor-pointer hover:scale-110'
            )}
            onClick={interactive ? () => setRating(star) : undefined}
            onMouseEnter={interactive ? () => setHoverRating(star) : undefined}
            onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
          />
        ))}
      </div>
    )
  }

  const getRatingText = (rating: number) => {
    const texts = ['很差', '较差', '一般', '较好', '非常好']
    return texts[rating - 1] || ''
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

      <div className="bg-white rounded-2xl shadow-sm border border-stone-200/60 p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <MessageSquareHeart className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-stone-800">评价与感谢</h1>
            <p className="text-sm text-stone-500 mt-1">记录每一次温暖的分享与相遇</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary-600">{pendingReviews.length}</div>
            <div className="text-xs text-stone-400">待评价</div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 bg-stone-100 rounded-xl p-1 mb-6">
        <button
          onClick={() => setActiveTab('pending')}
          className={cn(
            'flex-1 py-2.5 rounded-lg text-sm font-medium transition-all',
            activeTab === 'pending' ? 'bg-white text-primary-600 shadow-sm' : 'text-stone-500'
          )}
        >
          待评价 ({pendingReviews.length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={cn(
            'flex-1 py-2.5 rounded-lg text-sm font-medium transition-all',
            activeTab === 'completed' ? 'bg-white text-primary-600 shadow-sm' : 'text-stone-500'
          )}
        >
          已评价 ({reviews.length})
        </button>
      </div>

      {activeTab === 'pending' && (
        <div className="space-y-4">
          {selectedPending ? (
            <div className="bg-white rounded-2xl shadow-sm border border-stone-200/60 p-6">
              <div className="flex items-center gap-4 mb-6 pb-4 border-b border-stone-100">
                <button
                  onClick={() => setSelectedPending(null)}
                  className="p-2 rounded-lg hover:bg-stone-100 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-stone-500" />
                </button>
                <div className="flex-1">
                  <h3 className="font-semibold text-stone-800">评价 {selectedPending.targetName}</h3>
                  <p className="text-sm text-stone-500">{selectedPending.food.name}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-sm text-stone-600 mb-3">请为本次交易评分</p>
                  <div className="flex flex-col items-center gap-2">
                    {renderStars(rating, true, 'w-8 h-8')}
                    <span className="text-sm font-medium text-amber-600">{getRatingText(rating)}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    评价内容 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="分享您的真实感受和体验..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all resize-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    <span className="flex items-center gap-1.5">
                      <Heart className="w-4 h-4 text-pink-500" />
                      感谢卡留言（可选）
                    </span>
                  </label>
                  <textarea
                    value={thankYouNote}
                    onChange={(e) => setThankYouNote(e.target.value)}
                    placeholder="写下您的感谢话语，让温暖传递..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all resize-none text-sm bg-gradient-to-br from-pink-50 to-orange-50"
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !content.trim()}
                  className={cn(
                    'w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all',
                    isSubmitting || !content.trim()
                      ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-primary-500 to-orange-500 text-white hover:from-primary-600 hover:to-orange-600 shadow-lg shadow-primary-200'
                  )}
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      提交评价
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <>
              {pendingReviews.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-stone-200/60 py-20">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-20 h-20 rounded-2xl bg-stone-100 flex items-center justify-center mb-4">
                      <Star className="w-10 h-10 text-stone-300" />
                    </div>
                    <p className="text-lg font-medium text-stone-400">暂无待评价</p>
                    <p className="text-sm text-stone-300 mt-1">完成交易后可以在这里评价对方</p>
                  </div>
                </div>
              ) : (
                pendingReviews.map((item, index) => (
                  <div
                    key={item.food.id}
                    className={cn(
                      'bg-white rounded-xl border border-stone-200/60 p-4 hover:shadow-md transition-all cursor-pointer',
                      'animate-fade-in-up'
                    )}
                    style={{ animationDelay: `${index * 0.05}s` }}
                    onClick={() => setSelectedPending(item)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center flex-shrink-0">
                        {currentUser.role === 'donor' ? (
                          <ShoppingBag className="w-6 h-6 text-stone-400" />
                        ) : (
                          <ChefHat className="w-6 h-6 text-stone-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-stone-800 truncate">{item.food.name}</p>
                          <span className="text-xs text-stone-400">·</span>
                          <span className="text-xs text-stone-500">{item.food.category}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <User className="w-3.5 h-3.5 text-stone-400" />
                          <span className="text-xs text-stone-500">
                            {currentUser.role === 'donor' ? '领取人' : '捐赠人'}：{item.targetName}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Clock className="w-3.5 h-3.5 text-stone-400" />
                          <span className="text-xs text-stone-400">交易时间：{item.tradeTime}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1.5 rounded-lg bg-primary-50 text-primary-600 text-xs font-medium">
                          去评价
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      )}

      {activeTab === 'completed' && (
        <div>
          <div className="flex items-center gap-1 bg-stone-50 rounded-xl p-1 mb-4">
            <button
              onClick={() => setDirection('received')}
              className={cn(
                'flex-1 py-2 rounded-lg text-sm font-medium transition-all',
                direction === 'received' ? 'bg-white text-primary-600 shadow-sm' : 'text-stone-500'
              )}
            >
              我收到的
            </button>
            <button
              onClick={() => setDirection('sent')}
              className={cn(
                'flex-1 py-2 rounded-lg text-sm font-medium transition-all',
                direction === 'sent' ? 'bg-white text-primary-600 shadow-sm' : 'text-stone-500'
              )}
            >
              我发出的
            </button>
          </div>

          <div className="space-y-3">
            {filteredReviews.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-stone-200/60 py-20">
                <div className="flex flex-col items-center justify-center">
                  <div className="w-20 h-20 rounded-2xl bg-stone-100 flex items-center justify-center mb-4">
                    <MessageSquareHeart className="w-10 h-10 text-stone-300" />
                  </div>
                  <p className="text-lg font-medium text-stone-400">
                    {direction === 'received' ? '暂无收到的评价' : '暂无发出的评价'}
                  </p>
                  <p className="text-sm text-stone-300 mt-1">
                    {direction === 'received' ? '完成交易后对方可以评价您' : '完成交易后记得评价对方哦'}
                  </p>
                </div>
              </div>
            ) : (
              filteredReviews.map((review, index) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  direction={direction}
                  index={index}
                  renderStars={renderStars}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function ReviewCard({
  review,
  direction,
  index,
  renderStars,
}: {
  review: FoodReview
  direction: ReviewDirection
  index: number
  renderStars: (value: number, interactive?: boolean, size?: string) => React.ReactNode
}) {
  const foods = useStore((state) => state.foods)
  const food = foods.find((f) => f.id === review.foodId)

  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-stone-200/60 p-4 hover:shadow-md transition-all',
        'animate-fade-in-up'
      )}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-200 to-secondary-300 flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-medium text-stone-800">
                {direction === 'received' ? review.reviewerName : review.targetName}
              </p>
              <p className="text-xs text-stone-400">
                {direction === 'received'
                  ? `来自${review.reviewerRole === 'donor' ? '捐赠者' : '领取者'}`
                  : `给${review.reviewerRole === 'donor' ? '领取者' : '捐赠者'}`}
              </p>
            </div>
            {renderStars(review.rating, false, 'w-4 h-4')}
          </div>
        </div>
      </div>

      {food && (
        <div className="mb-3 px-3 py-2 rounded-lg bg-stone-50">
          <p className="text-xs text-stone-500">
            交易物品：<span className="text-stone-700 font-medium">{food.name}</span>
            <span className="text-stone-400 mx-1">·</span>
            {food.category}
          </p>
        </div>
      )}

      <p className="text-sm text-stone-600 mb-2">{review.content}</p>

      {review.thankYouNote && (
        <div className="mt-3 p-3 rounded-xl bg-gradient-to-br from-pink-50 to-orange-50 border border-pink-100">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Heart className="w-3.5 h-3.5 text-pink-500" />
            <span className="text-xs font-medium text-pink-600">感谢卡</span>
          </div>
          <p className="text-sm text-stone-600">{review.thankYouNote}</p>
        </div>
      )}

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-stone-100">
        <div className="flex items-center gap-1 text-xs text-stone-400">
          <Clock className="w-3 h-3" />
          {review.createdAt}
        </div>
        <span className="text-xs text-stone-400">
          {review.reviewerRole === 'donor' ? '捐赠者评价' : '领取者评价'}
        </span>
      </div>
    </div>
  )
}
