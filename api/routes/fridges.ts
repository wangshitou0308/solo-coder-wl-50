import { Router, type Request, type Response } from 'express'
import db from '../database.js'

const router = Router()

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  const fridges = Array.from(db.fridges.values())
  res.json({ success: true, data: fridges })
})

router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  const fridge = db.updateFridge(req.params.id, req.body)
  if (!fridge) {
    res.status(404).json({ success: false, error: '冰箱不存在' })
    return
  }
  res.json({ success: true, data: fridge })
})

router.get('/:id/foods', async (req: Request, res: Response): Promise<void> => {
  const fridge = db.getFridgeById(req.params.id)
  if (!fridge) {
    res.status(404).json({ success: false, error: '冰箱不存在' })
    return
  }
  const foods = db.getFoodsByFridgeId(req.params.id)
  res.json({ success: true, data: foods })
})

router.post('/:id/inspect', async (req: Request, res: Response): Promise<void> => {
  const { temperature, cleanliness, notes, inspectorId } = req.body

  if (temperature === undefined || cleanliness === undefined) {
    res.status(400).json({ success: false, error: '缺少温度或清洁度数据' })
    return
  }

  const fridge = db.getFridgeById(req.params.id)
  if (!fridge) {
    res.status(404).json({ success: false, error: '冰箱不存在' })
    return
  }

  const cleanlinessPercent = cleanliness * 20

  let status: 'normal' | 'warning' | 'maintenance' = 'normal'
  if (temperature > 6) {
    status = 'warning'
  } else if (cleanlinessPercent < 60) {
    status = 'maintenance'
  }

  const updatedFridge = db.updateFridge(req.params.id, {
    temperature,
    cleanliness: cleanlinessPercent,
    status,
    lastInspected: new Date().toISOString().split('T')[0],
  })

  if (!updatedFridge) {
    res.status(500).json({ success: false, error: '更新冰箱状态失败' })
    return
  }

  res.json({ success: true, data: updatedFridge })
})

export default router
