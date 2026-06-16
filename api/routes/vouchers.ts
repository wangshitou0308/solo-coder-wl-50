import { Router, type Request, type Response } from 'express'
import db from '../database.js'

const router = Router()

router.get('/claimant/:claimantId', async (req: Request, res: Response): Promise<void> => {
  const vouchers = db.getClaimVouchersByClaimant(req.params.claimantId)
  res.json({ success: true, data: vouchers })
})

router.get('/donor/:donorId', async (req: Request, res: Response): Promise<void> => {
  const vouchers = db.getClaimVouchersByDonor(req.params.donorId)
  res.json({ success: true, data: vouchers })
})

router.post('/', async (req: Request, res: Response): Promise<void> => {
  const { foodId, foodName, claimantId, claimantName, donorId, donorName, pickupCode, claimedAt, pickupLocation, quantity, weight, category, images } = req.body
  if (!foodId || !foodName || !claimantId || !claimantName || !donorId || !donorName || !pickupCode || !claimedAt || !pickupLocation || !quantity || !category) {
    res.status(400).json({ success: false, error: '缺少必要参数' })
    return
  }

  const voucher = db.createClaimVoucher({
    foodId,
    foodName,
    claimantId,
    claimantName,
    donorId,
    donorName,
    pickupCode,
    claimedAt,
    pickupLocation,
    quantity: Number(quantity),
    weight: weight || '',
    category,
    images: images || [],
  })
  res.json({ success: true, data: voucher })
})

export default router
