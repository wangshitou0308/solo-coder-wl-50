import { Router, type Request, type Response } from 'express'
import db from '../database.js'

const router = Router()

router.get('/', async (req: Request, res: Response): Promise<void> => {
  const { status, category, urgency, requesterId } = req.query
  const needs = db.getMaterialNeeds({
    status: status as string | undefined,
    category: category as string | undefined,
    urgency: urgency as string | undefined,
    requesterId: requesterId as string | undefined,
  })
  res.json({ success: true, data: needs })
})

router.post('/', async (req: Request, res: Response): Promise<void> => {
  const { requesterId, requesterName, title, description, category, quantity, unit, urgency, location, contactInfo } = req.body
  if (!requesterId || !requesterName || !title || !description || !category || !quantity || !unit || !urgency || !location || !contactInfo) {
    res.status(400).json({ success: false, error: '缺少必要参数' })
    return
  }

  const need = db.createMaterialNeed({
    requesterId,
    requesterName,
    title,
    description,
    category,
    quantity: Number(quantity),
    unit,
    urgency,
    status: 'open',
    location,
    contactInfo,
  })
  res.json({ success: true, data: need })
})

router.put('/:id/status', async (req: Request, res: Response): Promise<void> => {
  const { status, matchedDonationId } = req.body
  if (!status) {
    res.status(400).json({ success: false, error: '缺少状态参数' })
    return
  }

  const need = db.updateMaterialNeedStatus(req.params.id, status, matchedDonationId)
  if (!need) {
    res.status(404).json({ success: false, error: '需求不存在' })
    return
  }
  res.json({ success: true, data: need })
})

export default router
