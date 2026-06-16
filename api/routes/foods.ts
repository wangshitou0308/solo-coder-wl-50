import { Router, type Request, type Response } from 'express'
import db from '../database.js'
import type { FoodStatus } from '../database.js'

const router = Router()

router.get('/', async (req: Request, res: Response): Promise<void> => {
  const { category, pickupMethod, keyword, status, sortBy } = req.query
  const foods = db.queryFoods({
    category: category as string | undefined,
    pickupMethod: pickupMethod as string | undefined,
    keyword: keyword as string | undefined,
    status: status as string | undefined,
    sortBy: sortBy as string | undefined,
  })
  res.json({ success: true, data: foods })
})

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const food = db.getFoodById(req.params.id)
  if (!food) {
    res.status(404).json({ success: false, error: '食物不存在' })
    return
  }
  res.json({ success: true, data: food })
})

router.post('/', async (req: Request, res: Response): Promise<void> => {
  const {
    name,
    category,
    quantity,
    weight,
    expiryDate,
    pickupMethod,
    pickupLocation,
    images,
    donorId,
    fridgeId,
  } = req.body

  if (!name || !category || !quantity || !expiryDate || !pickupMethod || !pickupLocation || !donorId) {
    res.status(400).json({ success: false, error: '缺少必填字段' })
    return
  }

  const food = db.createFood({
    name,
    category,
    quantity,
    weight,
    expiryDate,
    pickupMethod,
    pickupLocation,
    images: images || [],
    donorId,
    fridgeId,
  })
  res.status(201).json({ success: true, data: food })
})

router.put('/:id/status', async (req: Request, res: Response): Promise<void> => {
  const { status } = req.body
  const validStatuses: FoodStatus[] = [
    'pending_review',
    'available',
    'rejected',
    'reserved',
    'claimed',
    'expired',
  ]
  if (!status || !validStatuses.includes(status)) {
    res.status(400).json({ success: false, error: '无效的状态值' })
    return
  }

  const food = db.updateFoodStatus(req.params.id, status as FoodStatus)
  if (!food) {
    res.status(404).json({ success: false, error: '食物不存在' })
    return
  }
  res.json({ success: true, data: food })
})

router.post('/:id/claim', async (req: Request, res: Response): Promise<void> => {
  const { claimantId } = req.body
  if (!claimantId) {
    res.status(400).json({ success: false, error: '缺少认领人ID' })
    return
  }

  const food = db.claimFood(req.params.id, claimantId)
  if (!food) {
    res.status(400).json({ success: false, error: '认领失败，食物不可用或不存在' })
    return
  }
  res.json({ success: true, data: food })
})

router.post('/:id/complete', async (req: Request, res: Response): Promise<void> => {
  const { pickupCode } = req.body
  if (!pickupCode) {
    res.status(400).json({ success: false, error: '缺少取餐码' })
    return
  }

  const food = db.getFoodById(req.params.id)
  if (!food) {
    res.status(404).json({ success: false, error: '食物不存在' })
    return
  }

  if (food.pickupCode.toUpperCase() !== pickupCode.toUpperCase()) {
    res.status(400).json({ success: false, error: '取餐码不正确' })
    return
  }

  if (food.status !== 'reserved') {
    res.status(400).json({ success: false, error: '食物状态不正确，无法完成领取' })
    return
  }

  const updatedFood = db.updateFoodStatus(req.params.id, 'claimed')
  if (!updatedFood) {
    res.status(500).json({ success: false, error: '更新状态失败' })
    return
  }

  const claimRecord = Array.from(db.claimRecords.values()).find(
    (c) => c.foodId === req.params.id && c.status === 'pending'
  )
  if (claimRecord) {
    claimRecord.status = 'completed'
    claimRecord.completedAt = new Date().toISOString().split('T')[0]
    db.claimRecords.set(claimRecord.id, claimRecord)
  }

  res.json({ success: true, data: updatedFood })
})

export default router
