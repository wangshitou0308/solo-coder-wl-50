import { Router, type Request, type Response } from 'express'
import db, { type Notification } from '../database.js'

const router = Router()

router.get('/:userId', async (req: Request, res: Response): Promise<void> => {
  const { read, type } = req.query
  const notifications = db.getNotifications(req.params.userId, {
    read: read !== undefined ? read === 'true' : undefined,
    type: type as string | undefined,
  })
  res.json({ success: true, data: notifications })
})

router.post('/:userId/read/:notificationId', async (req: Request, res: Response): Promise<void> => {
  const notification = db.markNotificationAsRead(req.params.userId, req.params.notificationId)
  if (!notification) {
    res.status(404).json({ success: false, error: '通知不存在' })
    return
  }
  res.json({ success: true, data: notification })
})

router.post('/:userId/read-all', async (req: Request, res: Response): Promise<void> => {
  const notifications = db.markAllNotificationsAsRead(req.params.userId)
  res.json({ success: true, data: notifications, count: notifications.filter(n => n.read).length })
})

router.post('/', async (req: Request, res: Response): Promise<void> => {
  const { userId, type, title, content, relatedId, relatedType } = req.body
  if (!userId || !type || !title || !content) {
    res.status(400).json({ success: false, error: '缺少必要参数' })
    return
  }

  const notification = db.addNotification(userId, {
    type: type as Notification['type'],
    title,
    content,
    relatedId,
    relatedType,
  })
  res.json({ success: true, data: notification })
})

export default router
