import { Router, type Request, type Response } from 'express'
import db from '../database.js'

const router = Router()

router.get('/', async (req: Request, res: Response): Promise<void> => {
  const { status, community } = req.query
  const points = db.getFridgePoints({
    status: status as string | undefined,
    community: community as string | undefined,
  })
  res.json({ success: true, data: points })
})

router.post('/', async (req: Request, res: Response): Promise<void> => {
  const { name, location, address, latitude, longitude, temperature, cleanliness, capacity, currentStock, status, contactPerson, contactPhone, community } = req.body
  if (!name || !location || !address || !latitude || !longitude || !capacity || !contactPerson || !contactPhone || !community) {
    res.status(400).json({ success: false, error: '缺少必要参数' })
    return
  }

  const point = {
    id: 'fp-' + Date.now(),
    name,
    location,
    address,
    latitude: Number(latitude),
    longitude: Number(longitude),
    temperature: Number(temperature) || 4,
    cleanliness: Number(cleanliness) || 90,
    capacity: Number(capacity),
    currentStock: Number(currentStock) || 0,
    status: status || 'normal',
    contactPerson,
    contactPhone,
    community,
    createdAt: new Date().toISOString().split('T')[0],
  }
  db.fridgePoints.set(point.id, point)
  res.json({ success: true, data: point })
})

router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  const point = db.updateFridgePoint(req.params.id, req.body)
  if (!point) {
    res.status(404).json({ success: false, error: '点位不存在' })
    return
  }
  res.json({ success: true, data: point })
})

router.get('/:id/inspection-records', async (req: Request, res: Response): Promise<void> => {
  const records = db.getInspectionRecords(req.params.id)
  res.json({ success: true, data: records })
})

router.post('/:id/inspection', async (req: Request, res: Response): Promise<void> => {
  const { inspectorId, inspectorName, temperature, cleanliness, issues, notes } = req.body
  if (!inspectorId || !inspectorName || temperature === undefined || cleanliness === undefined) {
    res.status(400).json({ success: false, error: '缺少必要参数' })
    return
  }

  const record = db.addInspectionRecord(req.params.id, {
    inspectorId,
    inspectorName,
    temperature: Number(temperature),
    cleanliness: Number(cleanliness),
    issues: issues || '',
    notes: notes || '',
  })
  res.json({ success: true, data: record })
})

export default router
