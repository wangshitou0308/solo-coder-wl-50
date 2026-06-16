import { Router, type Request, type Response } from 'express'
import db from '../database.js'

const router = Router()

router.get('/food/:foodId', async (req: Request, res: Response): Promise<void> => {
  const reviews = db.getFoodReviews(req.params.foodId)
  res.json({ success: true, data: reviews })
})

router.get('/user/:userId', async (req: Request, res: Response): Promise<void> => {
  const reviews = db.getReviewsByUser(req.params.userId)
  res.json({ success: true, data: reviews })
})

router.post('/:foodId', async (req: Request, res: Response): Promise<void> => {
  const { reviewerId, reviewerName, reviewerRole, targetId, targetName, rating, content, thankYouNote } = req.body
  if (!reviewerId || !reviewerName || !reviewerRole || !targetId || !targetName || !rating || !content) {
    res.status(400).json({ success: false, error: '缺少必要参数' })
    return
  }

  const review = db.addFoodReview(req.params.foodId, {
    reviewerId,
    reviewerName,
    reviewerRole,
    targetId,
    targetName,
    rating: Number(rating),
    content,
    thankYouNote,
  })
  res.json({ success: true, data: review })
})

export default router
