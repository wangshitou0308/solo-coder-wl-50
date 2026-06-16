import { Router, type Request, type Response } from 'express'
import db from '../database.js'

const router = Router()

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { phone } = req.body
  if (!phone) {
    res.status(400).json({ success: false, error: '请提供手机号' })
    return
  }
  const user = db.getUserByPhone(phone)
  if (!user) {
    res.status(404).json({ success: false, error: '用户不存在' })
    return
  }
  res.json({ success: true, data: user })
})

router.get('/users/:id', async (req: Request, res: Response): Promise<void> => {
  const user = db.getUserById(req.params.id)
  if (!user) {
    res.status(404).json({ success: false, error: '用户不存在' })
    return
  }
  res.json({ success: true, data: user })
})

export default router
