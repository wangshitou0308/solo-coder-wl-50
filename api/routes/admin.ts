import { Router, type Request, type Response } from 'express'
import db from '../database.js'

const router = Router()

router.get('/alert-rules', async (_req: Request, res: Response): Promise<void> => {
  const rules = db.getAlertRules()
  res.json({ success: true, data: rules })
})

router.put('/alert-rules/:id', async (req: Request, res: Response): Promise<void> => {
  const rule = db.updateAlertRule(req.params.id, req.body)
  if (!rule) {
    res.status(404).json({ success: false, error: '规则不存在' })
    return
  }
  res.json({ success: true, data: rule })
})

router.get('/category-configs', async (_req: Request, res: Response): Promise<void> => {
  const configs = db.getCategoryConfigs()
  res.json({ success: true, data: configs })
})

router.put('/category-configs/:id', async (req: Request, res: Response): Promise<void> => {
  const config = db.updateCategoryConfig(req.params.id, req.body)
  if (!config) {
    res.status(404).json({ success: false, error: '配置不存在' })
    return
  }
  res.json({ success: true, data: config })
})

router.get('/loss-records', async (req: Request, res: Response): Promise<void> => {
  const { reason, category, fridgeId, startDate, endDate } = req.query
  const records = db.getLossRecords({
    reason: reason as string | undefined,
    category: category as string | undefined,
    fridgeId: fridgeId as string | undefined,
    startDate: startDate as string | undefined,
    endDate: endDate as string | undefined,
  })
  res.json({ success: true, data: records })
})

router.post('/loss-records', async (req: Request, res: Response): Promise<void> => {
  const { foodId, foodName, category, quantity, weight, reason, description, reportedBy, fridgeId } = req.body
  if (!foodId || !foodName || !category || !quantity || !reason || !description || !reportedBy) {
    res.status(400).json({ success: false, error: '缺少必要参数' })
    return
  }

  const record = db.createLossRecord({
    foodId,
    foodName,
    category,
    quantity: Number(quantity),
    weight: weight || '',
    reason,
    description,
    reportedBy,
    fridgeId,
  })
  res.json({ success: true, data: record })
})

router.get('/advanced-stats', async (req: Request, res: Response): Promise<void> => {
  const { startDate, endDate, community, role, fridgeId } = req.query
  const stats = db.getAdvancedStats({
    startDate: startDate as string | undefined,
    endDate: endDate as string | undefined,
    community: community as string | undefined,
    role: role as string | undefined,
    fridgeId: fridgeId as string | undefined,
  })
  res.json({ success: true, data: stats })
})

router.get('/export', async (req: Request, res: Response): Promise<void> => {
  const { startDate, endDate, community, role, fridgeId, format } = req.query
  const stats = db.getAdvancedStats({
    startDate: startDate as string | undefined,
    endDate: endDate as string | undefined,
    community: community as string | undefined,
    role: role as string | undefined,
    fridgeId: fridgeId as string | undefined,
  })

  if (format === 'csv') {
    const headers = ['指标', '数值']
    const rows = [
      ['总捐赠数', stats.totalDonated.toString()],
      ['总领取数', stats.totalClaimed.toString()],
      ['总损耗数', stats.totalWasted.toString()],
      ['临期转化率', stats.expiryConversionRate + '%'],
      ['平均领取响应时长', stats.avgClaimResponseTime + '小时'],
    ]
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', 'attachment; filename="report.csv"')
    res.send('\ufeff' + csvContent)
    return
  }

  res.json({ success: true, data: stats })
})

export default router
