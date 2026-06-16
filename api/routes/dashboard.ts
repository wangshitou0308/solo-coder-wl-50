import { Router, type Request, type Response } from 'express'
import db from '../database.js'

const router = Router()

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  const stats = db.getDashboardStats()
  res.json({ success: true, data: stats })
})

export default router
