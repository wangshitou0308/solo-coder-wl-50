import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, Truck, Refrigerator, Upload, Check, Copy, Home, X, Image as ImageIcon, AlertCircle } from 'lucide-react'
import { useStore, type PickupMethod, type FoodCategory } from '@/store/useStore'
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

const pickupOptions: Array<{ label: PickupMethod; icon: typeof MapPin; desc: string }> = [
  { label: '放置共享冰箱', icon: Refrigerator, desc: '放入社区共享冰箱冷藏保存' },
  { label: '定点自取', icon: MapPin, desc: '领取者到指定地点自取' },
  { label: '上门领取', icon: Truck, desc: '捐赠者自行送达或上门领取' },
]

const stepLabels = ['基本信息', '取餐方式', '确认发布']

export default function Donate() {
  const navigate = useNavigate()
  const { createFood, fridges, fetchFridges, uploadImage } = useStore()

  const [step, setStep] = useState(0)
  const [showSuccess, setShowSuccess] = useState(false)
  const [pickupCode, setPickupCode] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState('')
  const [category, setCategory] = useState<FoodCategory>('生鲜果蔬')
  const [quantity, setQuantity] = useState('')
  const [weight, setWeight] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [pickupMethod, setPickupMethod] = useState<PickupMethod>('放置共享冰箱')
  const [location, setLocation] = useState('')
  const [fridgeId, setFridgeId] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    fetchFridges()
  }, [fetchFridges])

  const today = new Date().toISOString().split('T')[0]

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    for (let i = 0; i < files.length && uploadedImages.length + i < 5; i++) {
      const path = await uploadImage(files[i])
      if (path) {
        setUploadedImages((prev) => [...prev, path])
      }
    }
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index))
  }

  const validateStep0 = () => {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = '请输入食物名称'
    else if (name.trim().length < 2) e.name = '食物名称至少2个字符'
    if (!quantity || Number(quantity) <= 0) e.quantity = '请输入有效数量'
    else if (Number(quantity) > 999) e.quantity = '数量不能超过999'
    if (!weight.trim()) e.weight = '请输入重量'
    if (!expiryDate) e.expiryDate = '请选择过期日期'
    else if (new Date(expiryDate) < new Date(today)) e.expiryDate = '过期日期不能早于今天'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const validateStep1 = () => {
    const e: Record<string, string> = {}
    if (!location.trim()) e.location = '请输入取餐地址'
    else if (location.trim().length < 5) e.location = '地址信息不够详细'
    if (pickupMethod === '放置共享冰箱' && !fridgeId) e.fridgeId = '请选择要放入的共享冰箱'
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
    const result = await createFood({
      name: name.trim(),
      category,
      quantity: Number(quantity),
      weight: weight.trim(),
      expiryDate,
      pickupMethod,
      location: location.trim(),
      fridgeId: pickupMethod === '放置共享冰箱' ? fridgeId : undefined,
      description: description.trim(),
      images: uploadedImages,
    })

    if (result) {
      setPickupCode(result.pickupCode || Math.random().toString(36).substring(2, 8).toUpperCase())
      setShowSuccess(true)
    }
    setIsSubmitting(false)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(pickupCode)
  }

  if (showSuccess) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 rounded-2xl bg-secondary-100 flex items-center justify-center mx-auto mb-6 animate-fade-in-up">
          <Check className="w-10 h-10 text-secondary-500" />
        </div>
        <h2 className="text-2xl font-bold text-stone-800 mb-2">发布成功！</h2>
        <p className="text-sm text-stone-500 mb-8">您的食物已提交审核，管理员审核通过后将自动上架。请保存取餐码：</p>
        <div className="bg-primary-50 border-2 border-dashed border-primary-300 rounded-2xl p-6 mb-6">
          <p className="text-sm text-primary-600 font-medium mb-3">取 餐 码</p>
          <div className="flex items-center justify-center gap-3">
            <span className="pickup-code text-4xl font-bold text-primary-600 tracking-wider">{pickupCode}</span>
            <button onClick={handleCopy} className="p-2 hover:bg-primary-100 rounded-lg transition-colors" title="复制取餐码">
              <Copy className="w-5 h-5 text-primary-400" />
            </button>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 text-left">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-700 space-y-1">
              <p className="font-medium">温馨提示：</p>
              <ul className="list-disc list-inside space-y-0.5 text-xs">
                <li>请妥善保管取餐码，用于后续核对</li>
                <li>如选择共享冰箱，请在2小时内将食物放入指定冰箱</li>
                <li>管理员将在24小时内完成审核</li>
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
              setName('')
              setQuantity('')
              setWeight('')
              setExpiryDate('')
              setLocation('')
              setFridgeId('')
              setDescription('')
              setUploadedImages([])
            }}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-stone-200 text-stone-600 font-medium hover:bg-stone-50 transition-all"
          >
            继续捐赠
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
              <label className="block text-sm font-medium text-stone-700 mb-1.5">食物名称 <span className="text-red-500">*</span></label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={cn('w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all text-sm', errors.name ? 'border-red-300 bg-red-50 focus:ring-red-100' : 'border-stone-200')}
                placeholder="例如：新鲜有机西红柿、手工水饺等"
              />
              {errors.name && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">食物类别 <span className="text-red-500">*</span></label>
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
                <label className="block text-sm font-medium text-stone-700 mb-1.5">数量(份) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  min="1"
                  max="999"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className={cn('w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all text-sm', errors.quantity ? 'border-red-300 bg-red-50 focus:ring-red-100' : 'border-stone-200')}
                  placeholder="例如：5"
                />
                {errors.quantity && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.quantity}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">总重量 <span className="text-red-500">*</span></label>
                <input
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className={cn('w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all text-sm', errors.weight ? 'border-red-300 bg-red-50 focus:ring-red-100' : 'border-stone-200')}
                  placeholder="例如：2.5kg、500g"
                />
                {errors.weight && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.weight}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">保质期限 <span className="text-red-500">*</span></label>
              <input
                type="date"
                min={today}
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className={cn('w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all text-sm', errors.expiryDate ? 'border-red-300 bg-red-50 focus:ring-red-100' : 'border-stone-200')}
              />
              {errors.expiryDate && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.expiryDate}</p>}
              <p className="text-xs text-stone-400 mt-1.5">请确保在保质期内食物可安全食用</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">食物描述</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all text-sm resize-none"
                placeholder="请描述食物详情，如：食材来源、烹饪方式、储存条件、过敏原提示等"
                maxLength={500}
              />
              <p className="text-xs text-stone-400 mt-1 text-right">{description.length}/500</p>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-3">取餐方式 <span className="text-red-500">*</span></label>
              <div className="space-y-3">
                {pickupOptions.map((opt) => {
                  const Icon = opt.icon
                  return (
                    <label
                      key={opt.label}
                      className={cn(
                        'flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all',
                        pickupMethod === opt.label
                          ? 'border-primary-400 bg-primary-50 shadow-sm'
                          : 'border-stone-200 hover:bg-stone-50 hover:border-stone-300',
                      )}
                    >
                      <input
                        type="radio"
                        name="pickupMethod"
                        checked={pickupMethod === opt.label}
                        onChange={() => setPickupMethod(opt.label)}
                        className="accent-primary-500 w-4 h-4"
                      />
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                        <Icon className="w-5 h-5 text-primary-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-stone-700">{opt.label}</p>
                        <p className="text-xs text-stone-400 mt-0.5">{opt.desc}</p>
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">取餐地址 <span className="text-red-500">*</span></label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={cn('w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all text-sm', errors.location ? 'border-red-300 bg-red-50 focus:ring-red-100' : 'border-stone-200')}
                placeholder="请输入详细地址，包括门牌号等"
              />
              {errors.location && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.location}</p>}
            </div>

            {pickupMethod === '放置共享冰箱' && (
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">选择共享冰箱 <span className="text-red-500">*</span></label>
                <select
                  value={fridgeId}
                  onChange={(e) => setFridgeId(e.target.value)}
                  className={cn('w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all text-sm bg-white', errors.fridgeId ? 'border-red-300 bg-red-50 focus:ring-red-100' : 'border-stone-200')}
                >
                  <option value="">请选择要放入的共享冰箱</option>
                  {fridges.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} - {f.location} ({f.currentStock}/{f.capacity})
                      {f.status !== '正常' && ` 【${f.status}】`}
                    </option>
                  ))}
                </select>
                {errors.fridgeId && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.fridgeId}</p>}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">实物照片 <span className="text-stone-400 text-xs">(可选，最多5张)</span></label>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {uploadedImages.map((img, index) => (
                  <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-stone-200 bg-stone-100 group">
                    <img src={img} alt={`上传图片${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 w-6 h-6 bg-black/50 hover:bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                ))}
                {uploadedImages.length < 5 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="aspect-square rounded-xl border-2 border-dashed border-stone-300 hover:border-primary-400 hover:bg-primary-50 flex flex-col items-center justify-center gap-1 transition-all disabled:opacity-50"
                  >
                    {uploading ? (
                      <div className="w-6 h-6 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Upload className="w-5 h-5 text-stone-400" />
                        <span className="text-xs text-stone-400">添加图片</span>
                      </>
                    )}
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
              <div className="flex items-center gap-2 mt-2 text-xs text-stone-400">
                <ImageIcon className="w-3.5 h-3.5" />
                <span>支持 JPG、PNG、WEBP 格式，单张不超过 5MB</span>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
              <Check className="w-5 h-5 text-secondary-500" />
              确认捐赠信息
            </h3>

            {uploadedImages.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-stone-400 mb-2">实物照片</p>
                <div className="flex gap-2">
                  {uploadedImages.map((img, i) => (
                    <div key={i} className="w-16 h-16 rounded-lg overflow-hidden border border-stone-200">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3 bg-stone-50 rounded-xl p-5">
              {[
                ['食物名称', name],
                ['食物类别', `${categoryIcons[category]} ${category}`],
                ['数量', `${quantity} 份`],
                ['总重量', weight],
                ['保质期限', expiryDate],
                ['取餐方式', pickupMethod],
                ['取餐地址', location],
                ['放入冰箱', pickupMethod === '放置共享冰箱' ? fridges.find((f) => f.id === fridgeId)?.name || '-' : '-'],
                ['食物描述', description || '未填写'],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between py-2 border-b border-stone-200 last:border-0">
                  <span className="text-sm text-stone-400 flex-shrink-0 w-20">{label}</span>
                  <span className="text-sm font-medium text-stone-700 text-right break-all">{value}</span>
                </div>
              ))}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-amber-700 space-y-0.5">
                  <p>提交后，系统将自动生成唯一取餐码，食物状态为"待审核"</p>
                  <p>请确保捐赠食物符合食品安全标准，不符合要求的捐赠将被驳回</p>
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
