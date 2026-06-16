import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, Home, AlertCircle, MapPin, Phone } from 'lucide-react'
import { useStore, type FoodCategory } from '@/store/useStore'
import { cn } from '@/lib/utils'

const categories: FoodCategory[] = ['生鲜果蔬', '熟食', '干货', '罐头', '烘焙', '冷冻食品']

const categoryIcons: Record<FoodCategory, string> = {
  '生鲜果蔬': '🥬',
  '熟食': '🍖',
  '干货': '🌾',
  '罐头': '🥫',
  '烘焙': '🍞',
  '冷冻食品': '🧊',
}

const urgencyLevels = [
  { value: 'low', label: '低', color: 'bg-green-100 text-green-600 border-green-300' },
  { value: 'medium', label: '中', color: 'bg-yellow-100 text-yellow-600 border-yellow-300' },
  { value: 'high', label: '高', color: 'bg-orange-100 text-orange-600 border-orange-300' },
  { value: 'urgent', label: '紧急', color: 'bg-red-100 text-red-600 border-red-300' },
] as const

const unitOptions = ['份', 'kg', 'g', '箱', '盒', '包', '瓶', '个', '袋']

const stepLabels = ['基本信息', '详细描述', '确认发布']

export default function NeedPublish() {
  const navigate = useNavigate()
  const { createMaterialNeed } = useStore()

  const [step, setStep] = useState(0)
  const [showSuccess, setShowSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<FoodCategory>('生鲜果蔬')
  const [quantity, setQuantity] = useState('')
  const [unit, setUnit] = useState('份')
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [contactInfo, setContactInfo] = useState('')

  const validateStep0 = () => {
    const e: Record<string, string> = {}
    if (!title.trim()) e.title = '请输入需求标题'
    else if (title.trim().length < 2) e.title = '标题至少2个字符'
    if (!quantity || Number(quantity) <= 0) e.quantity = '请输入有效数量'
    else if (Number(quantity) > 9999) e.quantity = '数量不能超过9999'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const validateStep1 = () => {
    const e: Record<string, string> = {}
    if (!description.trim()) e.description = '请输入需求描述'
    else if (description.trim().length < 10) e.description = '描述至少10个字符，请详细说明需求'
    if (!location.trim()) e.location = '请输入取货地点'
    else if (location.trim().length < 5) e.location = '地址信息不够详细'
    if (!contactInfo.trim()) e.contactInfo = '请输入联系方式'
    else if (!/^1[3-9]\d{9}$/.test(contactInfo.trim())) e.contactInfo = '请输入有效的手机号码'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleNext = () => {
    if (step === 0 && !validateStep0()) return
    if (step === 1 && !validateStep1()) return
    setStep(step + 1)
    setErrors({})
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    const result = await createMaterialNeed({
      title: title.trim(),
      description: description.trim(),
      category,
      quantity: Number(quantity),
      unit,
      urgency,
      location: location.trim(),
      contactInfo: contactInfo.trim(),
    })

    if (result) {
      setShowSuccess(true)
    }
    setIsSubmitting(false)
  }

  if (showSuccess) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 rounded-2xl bg-secondary-100 flex items-center justify-center mx-auto mb-6 animate-fade-in-up">
          <Check className="w-10 h-10 text-secondary-500" />
        </div>
        <h2 className="text-2xl font-bold text-stone-800 mb-2">发布成功！</h2>
        <p className="text-sm text-stone-500 mb-8">您的物资需求已成功发布，我们会尽快为您匹配合适的捐赠者。</p>

        <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 mb-8 text-left">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-primary-700 space-y-1">
              <p className="font-medium">温馨提示：</p>
              <ul className="list-disc list-inside space-y-0.5 text-xs">
                <li>请保持联系方式畅通，以便捐赠者与您联系</li>
                <li>如有匹配的捐赠，系统会第一时间通知您</li>
                <li>需求发布后7天内如未匹配将自动过期</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium shadow-md hover:shadow-lg transition-all"
          >
            <Home className="w-4 h-4" /> 返回首页
          </button>
          <button
            onClick={() => {
              setShowSuccess(false)
              setStep(0)
              setTitle('')
              setQuantity('')
              setUnit('份')
              setUrgency('medium')
              setDescription('')
              setLocation('')
              setContactInfo('')
            }}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-stone-200 text-stone-600 font-medium hover:bg-stone-50 transition-all"
          >
            继续发布
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-stone-500 hover:text-stone-700 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm font-medium">返回</span>
      </button>

      <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
        {stepLabels.map((label, i) => (
          <div key={label} className="flex items-center">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all',
                  i <= step ? 'bg-primary-500 text-white shadow-md shadow-primary-200' : 'bg-stone-200 text-stone-400',
                )}
              >
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={cn('text-sm font-medium', i <= step ? 'text-primary-600' : 'text-stone-400')}>
                {label}
              </span>
            </div>
            {i < stepLabels.length - 1 && (
              <div className={cn('w-8 sm:w-12 h-0.5 mx-1 sm:mx-2 transition-colors', i < step ? 'bg-primary-500' : 'bg-stone-200')} />
            )}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-200/60 p-6 sm:p-8">
        {step === 0 && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">需求标题 <span className="text-red-500">*</span></label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={cn('w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all text-sm', errors.title ? 'border-red-300 bg-red-50 focus:ring-red-100' : 'border-stone-200')}
                placeholder="例如：急需新鲜蔬菜、求购大米等"
                maxLength={50}
              />
              {errors.title && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.title}</p>}
              <p className="text-xs text-stone-400 mt-1 text-right">{title.length}/50</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">物资分类 <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-3 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={cn(
                      'px-3 py-3 rounded-xl text-sm font-medium border-2 transition-all flex flex-col items-center gap-1',
                      category === cat ? 'border-primary-400 bg-primary-50 text-primary-600 shadow-sm' : 'border-stone-200 text-stone-500 hover:bg-stone-50 hover:border-stone-300',
                    )}
                  >
                    <span className="text-xl">{categoryIcons[cat]}</span>
                    <span>{cat}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">需求数量 <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  min="1"
                  max="9999"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className={cn('w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all text-sm', errors.quantity ? 'border-red-300 bg-red-50 focus:ring-red-100' : 'border-stone-200')}
                  placeholder="例如：5"
                />
                {errors.quantity && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.quantity}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">计量单位 <span className="text-red-500">*</span></label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all text-sm bg-white"
                >
                  {unitOptions.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">紧急程度 <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-4 gap-2">
                {urgencyLevels.map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => setUrgency(level.value)}
                    className={cn(
                      'px-3 py-2.5 rounded-xl text-sm font-medium border-2 transition-all',
                      urgency === level.value
                        ? `${level.color} shadow-sm`
                        : 'border-stone-200 text-stone-500 hover:bg-stone-50 hover:border-stone-300',
                    )}
                  >
                    {level.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">详细描述 <span className="text-red-500">*</span></label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className={cn('w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all text-sm resize-none', errors.description ? 'border-red-300 bg-red-50 focus:ring-red-100' : 'border-stone-200')}
                placeholder="请详细描述您的需求，包括：用途、特殊要求、期望交付时间等信息，以便捐赠者更好地了解您的需求"
                maxLength={500}
              />
              {errors.description && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.description}</p>}
              <p className="text-xs text-stone-400 mt-1 text-right">{description.length}/500</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                <MapPin className="w-4 h-4 inline mr-1 text-primary-500" />
                取货地点 <span className="text-red-500">*</span>
              </label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={cn('w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all text-sm', errors.location ? 'border-red-300 bg-red-50 focus:ring-red-100' : 'border-stone-200')}
                placeholder="请输入详细地址，包括门牌号、小区名称等"
              />
              {errors.location && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.location}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                <Phone className="w-4 h-4 inline mr-1 text-primary-500" />
                联系方式 <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                className={cn('w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all text-sm', errors.contactInfo ? 'border-red-300 bg-red-50 focus:ring-red-100' : 'border-stone-200')}
                placeholder="请输入手机号码，方便捐赠者联系您"
                maxLength={11}
              />
              {errors.contactInfo && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.contactInfo}</p>}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
              <Check className="w-5 h-5 text-secondary-500" />
              确认需求信息
            </h3>

            <div className="space-y-3 bg-stone-50 rounded-xl p-5">
              {[
                ['需求标题', title],
                ['物资分类', `${categoryIcons[category]} ${category}`],
                ['需求数量', `${quantity} ${unit}`],
                ['紧急程度', urgencyLevels.find(u => u.value === urgency)?.label || '-'],
                ['详细描述', description],
                ['取货地点', location],
                ['联系方式', contactInfo.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between py-2 border-b border-stone-200 last:border-0">
                  <span className="text-sm text-stone-400 flex-shrink-0 w-24">{label}</span>
                  <span className="text-sm font-medium text-stone-700 text-right break-all">{value}</span>
                </div>
              ))}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-amber-700 space-y-0.5">
                  <p>提交后，您的需求将公开展示给所有捐赠者</p>
                  <p>请确保填写的联系方式真实有效，以便及时沟通</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-8">
          {step > 0 && (
            <button
              type="button"
              onClick={() => { setStep(step - 1); setErrors({}) }}
              className="flex-1 py-3 rounded-xl border-2 border-stone-200 text-stone-600 font-medium text-sm hover:bg-stone-50 hover:border-stone-300 transition-all"
            >
              上一步
            </button>
          )}
          {step < 2 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium shadow-md shadow-primary-200 hover:shadow-lg hover:from-primary-600 hover:to-primary-700 transition-all text-sm"
            >
              下一步
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-secondary-500 to-secondary-600 text-white font-medium shadow-md shadow-secondary-200 hover:shadow-lg hover:from-secondary-600 hover:to-secondary-700 transition-all text-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  提交中...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  确认发布
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
