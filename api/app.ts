import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import authRoutes from './routes/auth.js'
import foodRoutes from './routes/foods.js'
import fridgeRoutes from './routes/fridges.js'
import dashboardRoutes from './routes/dashboard.js'
import uploadRoutes from './routes/upload.js'
import notificationRoutes from './routes/notifications.js'
import needRoutes from './routes/needs.js'
import reviewRoutes from './routes/reviews.js'
import voucherRoutes from './routes/vouchers.js'
import fridgePointRoutes from './routes/fridge-points.js'
import inspectionRoutes from './routes/inspections.js'
import adminRoutes from './routes/admin.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

const app: express.Application = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

app.use('/api/auth', authRoutes)
app.use('/api/foods', foodRoutes)
app.use('/api/fridges', fridgeRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/needs', needRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/vouchers', voucherRoutes)
app.use('/api/fridge-points', fridgePointRoutes)
app.use('/api/inspections', inspectionRoutes)
app.use('/api/admin', adminRoutes)

app.use(
  '/api/health',
  (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json({
      success: true,
      message: 'ok',
    })
  },
)

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('[Server Error]', error.message, error.stack)
  res.status(500).json({
    success: false,
    error: 'Server internal error',
  })
})

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  })
})

export default app
