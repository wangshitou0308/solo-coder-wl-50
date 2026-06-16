import { Router, type Request, type Response } from 'express'
import db from '../database.js'

const router = Router()

router.get('/', async (req: Request, res: Response): Promise<void> => {
  const { status, assigneeId, fridgeId } = req.query
  const tasks = db.getInspectionTasks({
    status: status as string | undefined,
    assigneeId: assigneeId as string | undefined,
    fridgeId: fridgeId as string | undefined,
  })
  res.json({ success: true, data: tasks })
})

router.post('/', async (req: Request, res: Response): Promise<void> => {
  const { fridgeId, fridgeName, assigneeId, assigneeName, priority, scheduledDate, notes } = req.body
  if (!fridgeId || !fridgeName || !assigneeId || !assigneeName || !priority || !scheduledDate) {
    res.status(400).json({ success: false, error: '缺少必要参数' })
    return
  }

  const task = db.createInspectionTask({
    fridgeId,
    fridgeName,
    assigneeId,
    assigneeName,
    status: 'pending',
    priority,
    scheduledDate,
    notes,
  })
  res.json({ success: true, data: task })
})

router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  const task = db.updateInspectionTask(req.params.id, req.body)
  if (!task) {
    res.status(404).json({ success: false, error: '任务不存在' })
    return
  }
  res.json({ success: true, data: task })
})

router.post('/:id/complete', async (req: Request, res: Response): Promise<void> => {
  const { temperature, cleanliness, issues, notes } = req.body
  const task = db.updateInspectionTask(req.params.id, {
    status: 'completed',
    temperature: temperature ? Number(temperature) : undefined,
    cleanliness: cleanliness ? Number(cleanliness) : undefined,
    issues,
    notes,
  })
  if (!task) {
    res.status(404).json({ success: false, error: '任务不存在' })
    return
  }
  res.json({ success: true, data: task })
})

export default router
