import { v4 as uuidv4 } from 'uuid'

type FoodCategory = '生鲜果蔬' | '熟食' | '干货' | '罐头' | '烘焙' | '冷冻食品'
type PickupMethod = '放置共享冰箱' | '定点自取' | '上门领取'
type FoodStatus = 'pending_review' | 'available' | 'reserved' | 'claimed' | 'expired' | 'spoiled' | 'rejected'

interface FoodItem {
  id: string
  name: string
  category: FoodCategory
  quantity: string
  weight?: string
  expiryDate: string
  pickupMethod: PickupMethod
  pickupLocation: string
  description?: string
  images: string[]
  pickupCode: string
  status: FoodStatus
  donorId: string
  claimantId?: string
  fridgeId?: string
  createdAt: string
  updatedAt: string
}

interface User {
  id: string
  name: string
  phone: string
  email: string
  role: 'donor' | 'claimant' | 'admin'
  avatar?: string
  createdAt: string
}

interface Fridge {
  id: string
  name: string
  location: string
  temperature: number
  cleanliness: number
  capacity: number
  currentStock: number
  status: 'normal' | 'warning' | 'maintenance'
  lastInspected: string
}

interface ClaimRecord {
  id: string
  foodId: string
  claimantId: string
  donorId: string
  pickupCode: string
  status: 'pending' | 'completed' | 'cancelled' | 'timeout'
  createdAt: string
  completedAt?: string
  cancelledAt?: string
  timeoutAt?: string
}

interface ReservationQueue {
  id: string
  foodId: string
  claimantId: string
  claimantName: string
  queuePosition: number
  status: 'waiting' | 'notified' | 'expired' | 'cancelled'
  createdAt: string
  notifiedAt?: string
  expiresAt?: string
}

interface StockChangeLog {
  id: string
  foodId: string
  userId: string
  userName: string
  changeType: 'donated' | 'reserved' | 'claimed' | 'expired' | 'spoiled' | 'returned' | 'adjusted'
  quantityChange: number
  oldQuantity: number
  newQuantity: number
  reason: string
  createdAt: string
}

interface StatusTimeline {
  id: string
  foodId: string
  userId?: string
  userName?: string
  fromStatus: string
  toStatus: string
  reason: string
  createdAt: string
}

interface RejectRecord {
  id: string
  foodId: string
  adminId: string
  adminName: string
  reason: string
  createdAt: string
}

interface ClaimVoucher {
  id: string
  foodId: string
  foodName: string
  claimantId: string
  claimantName: string
  donorId: string
  donorName: string
  pickupCode: string
  claimedAt: string
  pickupLocation: string
  quantity: number
  weight: string
  category: string
  images: string[]
}

interface FoodReview {
  id: string
  foodId: string
  reviewerId: string
  reviewerName: string
  reviewerRole: 'donor' | 'claimant'
  targetId: string
  targetName: string
  rating: number
  content: string
  thankYouNote?: string
  createdAt: string
}

interface Notification {
  id: string
  userId: string
  type: 'review_result' | 'expiry_alert' | 'reservation_success' | 'claim_success' | 'reservation_available' | 'system_announcement'
  title: string
  content: string
  relatedId?: string
  relatedType?: string
  read: boolean
  createdAt: string
  readAt?: string
}

interface MaterialNeed {
  id: string
  requesterId: string
  requesterName: string
  title: string
  description: string
  category: string
  quantity: number
  unit: string
  urgency: 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'matched' | 'fulfilled' | 'cancelled'
  location: string
  contactInfo: string
  createdAt: string
  matchedDonationId?: string
  fulfilledAt?: string
}

interface InspectionTask {
  id: string
  fridgeId: string
  fridgeName: string
  assigneeId: string
  assigneeName: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high'
  scheduledDate: string
  completedDate?: string
  notes?: string
  temperature?: number
  cleanliness?: number
  issues?: string
  createdAt: string
}

interface AlertRule {
  id: string
  name: string
  type: 'temperature' | 'expiry' | 'capacity'
  enabled: boolean
  threshold: number
  operator: 'gt' | 'lt' | 'gte' | 'lte' | 'eq'
  notificationChannels: string[]
  createdAt: string
  updatedAt: string
}

interface FoodCategoryConfig {
  id: string
  name: string
  icon: string
  color: string
  sortOrder: number
  enabled: boolean
  createdAt: string
}

interface FridgePoint {
  id: string
  name: string
  location: string
  address: string
  latitude: number
  longitude: number
  temperature: number
  cleanliness: number
  capacity: number
  currentStock: number
  status: 'normal' | 'warning' | 'maintenance' | 'offline'
  contactPerson: string
  contactPhone: string
  community: string
  lastInspected?: string
  createdAt: string
}

interface LossRecord {
  id: string
  foodId: string
  foodName: string
  category: string
  quantity: number
  weight: string
  reason: 'expired' | 'spoiled' | 'damaged' | 'returned' | 'other'
  description: string
  reportedBy: string
  reportedAt: string
  fridgeId?: string
}

interface InspectionRecord {
  id: string
  fridgeId: string
  inspectorId: string
  inspectorName: string
  temperature: number
  cleanliness: number
  issues: string
  notes: string
  createdAt: string
}

interface DailyStats {
  date: string
  donated: number
  claimed: number
  wasted: number
}

const today = new Date()
const fmt = (d: Date) => d.toISOString().split('T')[0]
const addDays = (d: Date, n: number) => {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

const SEED_USERS: User[] = [
  {
    id: 'user-1',
    name: '张明华',
    phone: '13800138001',
    email: 'zhangmh@example.com',
    role: 'donor',
    avatar: '/uploads/donor1.jpg',
    createdAt: '2025-12-01',
  },
  {
    id: 'user-2',
    name: '李秀英',
    phone: '13900139002',
    email: 'lixy@example.com',
    role: 'claimant',
    avatar: '/uploads/claimant1.jpg',
    createdAt: '2026-01-15',
  },
  {
    id: 'user-3',
    name: '王建国',
    phone: '13700137003',
    email: 'wangjg@example.com',
    role: 'admin',
    avatar: '/uploads/admin1.jpg',
    createdAt: '2025-11-01',
  },
]

const SEED_FRIDGES: Fridge[] = [
  {
    id: 'fridge-1',
    name: '阳光社区共享冰箱',
    location: '北京市朝阳区阳光社区服务中心1楼',
    temperature: 4,
    cleanliness: 95,
    capacity: 50,
    currentStock: 23,
    status: 'normal',
    lastInspected: fmt(addDays(today, -1)),
  },
  {
    id: 'fridge-2',
    name: '和谐家园共享冰箱',
    location: '北京市海淀区和谐家园小区北门',
    temperature: 6,
    cleanliness: 78,
    capacity: 40,
    currentStock: 35,
    status: 'warning',
    lastInspected: fmt(addDays(today, -3)),
  },
  {
    id: 'fridge-3',
    name: '绿洲社区共享冰箱',
    location: '北京市西城区绿洲社区活动中心',
    temperature: 4,
    cleanliness: 90,
    capacity: 60,
    currentStock: 12,
    status: 'normal',
    lastInspected: fmt(addDays(today, -2)),
  },
]

const SEED_FOODS: FoodItem[] = [
  {
    id: 'food-1',
    name: '新鲜有机西红柿',
    category: '生鲜果蔬',
    quantity: '5斤',
    weight: '2.5kg',
    expiryDate: fmt(addDays(today, 1)),
    pickupMethod: '放置共享冰箱',
    pickupLocation: '阳光社区共享冰箱',
    images: ['/uploads/tomato.jpg'],
    pickupCode: uuidv4().slice(0, 6).toUpperCase(),
    status: 'available',
    donorId: 'user-1',
    fridgeId: 'fridge-1',
    createdAt: fmt(addDays(today, -2)),
    updatedAt: fmt(addDays(today, -1)),
  },
  {
    id: 'food-2',
    name: '手工水饺',
    category: '熟食',
    quantity: '3盒',
    weight: '1.5kg',
    expiryDate: fmt(addDays(today, 2)),
    pickupMethod: '定点自取',
    pickupLocation: '和谐家园小区北门领取点',
    images: ['/uploads/dumpling.jpg'],
    pickupCode: uuidv4().slice(0, 6).toUpperCase(),
    status: 'available',
    donorId: 'user-1',
    createdAt: fmt(addDays(today, -1)),
    updatedAt: fmt(addDays(today, -1)),
  },
  {
    id: 'food-3',
    name: '东北大米',
    category: '干货',
    quantity: '2袋',
    weight: '10kg',
    expiryDate: fmt(addDays(today, 90)),
    pickupMethod: '定点自取',
    pickupLocation: '绿洲社区活动中心领取点',
    images: ['/uploads/rice.jpg'],
    pickupCode: uuidv4().slice(0, 6).toUpperCase(),
    status: 'available',
    donorId: 'user-1',
    createdAt: fmt(addDays(today, -5)),
    updatedAt: fmt(addDays(today, -3)),
  },
  {
    id: 'food-4',
    name: '黄桃罐头',
    category: '罐头',
    quantity: '6瓶',
    weight: '3kg',
    expiryDate: fmt(addDays(today, 180)),
    pickupMethod: '上门领取',
    pickupLocation: '北京市朝阳区阳光社区12号楼3单元',
    images: ['/uploads/peach-canned.jpg'],
    pickupCode: uuidv4().slice(0, 6).toUpperCase(),
    status: 'available',
    donorId: 'user-1',
    createdAt: fmt(addDays(today, -3)),
    updatedAt: fmt(addDays(today, -2)),
  },
  {
    id: 'food-5',
    name: '全麦面包',
    category: '烘焙',
    quantity: '4袋',
    weight: '2kg',
    expiryDate: fmt(addDays(today, -1)),
    pickupMethod: '放置共享冰箱',
    pickupLocation: '和谐家园共享冰箱',
    images: ['/uploads/bread.jpg'],
    pickupCode: uuidv4().slice(0, 6).toUpperCase(),
    status: 'expired',
    donorId: 'user-1',
    fridgeId: 'fridge-2',
    createdAt: fmt(addDays(today, -5)),
    updatedAt: fmt(addDays(today, -1)),
  },
  {
    id: 'food-6',
    name: '速冻蔬菜包',
    category: '冷冻食品',
    quantity: '8包',
    weight: '4kg',
    expiryDate: fmt(addDays(today, 30)),
    pickupMethod: '放置共享冰箱',
    pickupLocation: '绿洲社区共享冰箱',
    images: ['/uploads/frozen-veg.jpg'],
    pickupCode: uuidv4().slice(0, 6).toUpperCase(),
    status: 'reserved',
    donorId: 'user-1',
    fridgeId: 'fridge-3',
    claimantId: 'user-2',
    createdAt: fmt(addDays(today, -4)),
    updatedAt: fmt(addDays(today, -1)),
  },
  {
    id: 'food-7',
    name: '鸡蛋',
    category: '生鲜果蔬',
    quantity: '2板',
    weight: '3kg',
    expiryDate: fmt(addDays(today, 5)),
    pickupMethod: '定点自取',
    pickupLocation: '阳光社区服务中心领取点',
    images: ['/uploads/eggs.jpg'],
    pickupCode: uuidv4().slice(0, 6).toUpperCase(),
    status: 'pending_review',
    donorId: 'user-1',
    createdAt: fmt(addDays(today, 0)),
    updatedAt: fmt(addDays(today, 0)),
  },
  {
    id: 'food-8',
    name: '红烧牛肉',
    category: '熟食',
    quantity: '2份',
    weight: '1kg',
    expiryDate: fmt(addDays(today, 1)),
    pickupMethod: '放置共享冰箱',
    pickupLocation: '阳光社区共享冰箱',
    images: ['/uploads/beef.jpg'],
    pickupCode: uuidv4().slice(0, 6).toUpperCase(),
    status: 'available',
    donorId: 'user-1',
    fridgeId: 'fridge-1',
    createdAt: fmt(addDays(today, -1)),
    updatedAt: fmt(addDays(today, 0)),
  },
  {
    id: 'food-9',
    name: '纯牛奶',
    category: '干货',
    quantity: '3箱',
    weight: '9kg',
    expiryDate: fmt(addDays(today, 7)),
    pickupMethod: '上门领取',
    pickupLocation: '北京市海淀区和谐家园8号楼1单元',
    images: ['/uploads/milk.jpg'],
    pickupCode: uuidv4().slice(0, 6).toUpperCase(),
    status: 'claimed',
    donorId: 'user-1',
    claimantId: 'user-2',
    createdAt: fmt(addDays(today, -6)),
    updatedAt: fmt(addDays(today, -2)),
  },
  {
    id: 'food-10',
    name: '苹果',
    category: '生鲜果蔬',
    quantity: '10斤',
    weight: '5kg',
    expiryDate: fmt(addDays(today, -2)),
    pickupMethod: '放置共享冰箱',
    pickupLocation: '和谐家园共享冰箱',
    images: ['/uploads/apple.jpg'],
    pickupCode: uuidv4().slice(0, 6).toUpperCase(),
    status: 'expired',
    donorId: 'user-1',
    fridgeId: 'fridge-2',
    createdAt: fmt(addDays(today, -8)),
    updatedAt: fmt(addDays(today, -2)),
  },
]

const SEED_CLAIM_RECORDS: ClaimRecord[] = [
  {
    id: 'claim-1',
    foodId: 'food-6',
    claimantId: 'user-2',
    donorId: 'user-1',
    pickupCode: SEED_FOODS[5].pickupCode,
    status: 'pending',
    createdAt: fmt(addDays(today, -1)),
  },
  {
    id: 'claim-2',
    foodId: 'food-9',
    claimantId: 'user-2',
    donorId: 'user-1',
    pickupCode: SEED_FOODS[8].pickupCode,
    status: 'completed',
    createdAt: fmt(addDays(today, -6)),
    completedAt: fmt(addDays(today, -2)),
  },
]

const SEED_DAILY_STATS: DailyStats[] = Array.from({ length: 30 }, (_, i) => {
  const d = addDays(today, -29 + i)
  return {
    date: fmt(d),
    donated: Math.floor(Math.random() * 8) + 2,
    claimed: Math.floor(Math.random() * 6) + 1,
    wasted: Math.floor(Math.random() * 3),
  }
})

class Database {
  users: Map<string, User> = new Map()
  foods: Map<string, FoodItem> = new Map()
  fridges: Map<string, Fridge> = new Map()
  claimRecords: Map<string, ClaimRecord> = new Map()
  dailyStats: DailyStats[] = []
  reservationQueues: Map<string, ReservationQueue[]> = new Map()
  stockChangeLogs: Map<string, StockChangeLog[]> = new Map()
  statusTimelines: Map<string, StatusTimeline[]> = new Map()
  rejectRecords: Map<string, RejectRecord> = new Map()
  claimVouchers: Map<string, ClaimVoucher> = new Map()
  foodReviews: Map<string, FoodReview[]> = new Map()
  notifications: Map<string, Notification[]> = new Map()
  materialNeeds: Map<string, MaterialNeed> = new Map()
  inspectionTasks: Map<string, InspectionTask> = new Map()
  alertRules: Map<string, AlertRule> = new Map()
  categoryConfigs: Map<string, FoodCategoryConfig> = new Map()
  fridgePoints: Map<string, FridgePoint> = new Map()
  lossRecords: Map<string, LossRecord> = new Map()
  inspectionRecords: Map<string, InspectionRecord[]> = new Map()

  constructor() {
    SEED_USERS.forEach((u) => this.users.set(u.id, u))
    SEED_FOODS.forEach((f) => this.foods.set(f.id, f))
    SEED_FRIDGES.forEach((f) => this.fridges.set(f.id, f))
    SEED_CLAIM_RECORDS.forEach((c) => this.claimRecords.set(c.id, c))
    this.dailyStats = [...SEED_DAILY_STATS]
    this.initializeSeedData()
  }

  private initializeSeedData() {
    const defaultCategories: FoodCategoryConfig[] = [
      { id: 'cat-1', name: '生鲜果蔬', icon: '🥬', color: '#22c55e', sortOrder: 1, enabled: true, createdAt: fmt(today) },
      { id: 'cat-2', name: '熟食', icon: '🍖', color: '#f97316', sortOrder: 2, enabled: true, createdAt: fmt(today) },
      { id: 'cat-3', name: '干货', icon: '🌾', color: '#eab308', sortOrder: 3, enabled: true, createdAt: fmt(today) },
      { id: 'cat-4', name: '罐头', icon: '🥫', color: '#3b82f6', sortOrder: 4, enabled: true, createdAt: fmt(today) },
      { id: 'cat-5', name: '烘焙', icon: '🍞', color: '#ec4899', sortOrder: 5, enabled: true, createdAt: fmt(today) },
      { id: 'cat-6', name: '冷冻食品', icon: '🧊', color: '#06b6d4', sortOrder: 6, enabled: true, createdAt: fmt(today) },
    ]
    defaultCategories.forEach((c) => this.categoryConfigs.set(c.id, c))

    const defaultFridgePoints: FridgePoint[] = [
      { id: 'fp-1', name: '阳光社区共享冰箱', location: '阳光社区', address: '北京市朝阳区阳光社区服务中心1楼', latitude: 39.9042, longitude: 116.4074, temperature: 4, cleanliness: 95, capacity: 50, currentStock: 23, status: 'normal', contactPerson: '张阿姨', contactPhone: '138****0001', community: '阳光社区', lastInspected: fmt(addDays(today, -1)), createdAt: fmt(today) },
      { id: 'fp-2', name: '和谐家园共享冰箱', location: '和谐家园', address: '北京市海淀区和谐家园小区北门', latitude: 39.9142, longitude: 116.3974, temperature: 6, cleanliness: 78, capacity: 40, currentStock: 35, status: 'warning', contactPerson: '李叔叔', contactPhone: '138****0002', community: '和谐家园', lastInspected: fmt(addDays(today, -3)), createdAt: fmt(today) },
      { id: 'fp-3', name: '绿洲社区共享冰箱', location: '绿洲社区', address: '北京市西城区绿洲社区活动中心', latitude: 39.9242, longitude: 116.3874, temperature: 3, cleanliness: 90, capacity: 60, currentStock: 12, status: 'normal', contactPerson: '王大姐', contactPhone: '138****0003', community: '绿洲社区', lastInspected: fmt(addDays(today, -2)), createdAt: fmt(today) },
    ]
    defaultFridgePoints.forEach((f) => this.fridgePoints.set(f.id, f))

    const defaultAlertRules: AlertRule[] = [
      { id: 'rule-1', name: '温度过高告警', type: 'temperature', enabled: true, threshold: 6, operator: 'gt', notificationChannels: ['email', 'app'], createdAt: fmt(today), updatedAt: fmt(today) },
      { id: 'rule-2', name: '临期提醒', type: 'expiry', enabled: true, threshold: 2, operator: 'lte', notificationChannels: ['app'], createdAt: fmt(today), updatedAt: fmt(today) },
      { id: 'rule-3', name: '满载预警', type: 'capacity', enabled: true, threshold: 80, operator: 'gte', notificationChannels: ['email', 'app'], createdAt: fmt(today), updatedAt: fmt(today) },
    ]
    defaultAlertRules.forEach((r) => this.alertRules.set(r.id, r))

    SEED_USERS.forEach((u) => {
      this.notifications.set(u.id, [])
    })

    this.addNotification('user-1', {
      type: 'review_result',
      title: '捐赠审核通过',
      content: '您捐赠的"新鲜有机西红柿"已通过审核，成功上架！',
      relatedId: 'food-1',
      relatedType: 'food',
    })

    this.addNotification('user-2', {
      type: 'reservation_success',
      title: '预约成功',
      content: '您已成功预约"速冻蔬菜包"，请尽快前往领取！',
      relatedId: 'food-6',
      relatedType: 'food',
    })
  }

  addNotification(userId: string, notification: Omit<Notification, 'id' | 'read' | 'createdAt' | 'userId'>) {
    const userNotifications = this.notifications.get(userId) || []
    const newNotification: Notification = {
      ...notification,
      userId,
      id: uuidv4(),
      read: false,
      createdAt: fmt(today),
    }
    userNotifications.unshift(newNotification)
    this.notifications.set(userId, userNotifications)
    return newNotification
  }

  getNotifications(userId: string, filters?: { read?: boolean; type?: string }) {
    const notifications = this.notifications.get(userId) || []
    let result = notifications
    if (filters?.read !== undefined) {
      result = result.filter((n) => n.read === filters.read)
    }
    if (filters?.type) {
      result = result.filter((n) => n.type === filters.type)
    }
    return result
  }

  markNotificationAsRead(userId: string, notificationId: string) {
    const notifications = this.notifications.get(userId) || []
    const notification = notifications.find((n) => n.id === notificationId)
    if (notification) {
      notification.read = true
      notification.readAt = fmt(today)
      this.notifications.set(userId, notifications)
      return notification
    }
    return undefined
  }

  markAllNotificationsAsRead(userId: string) {
    const notifications = this.notifications.get(userId) || []
    notifications.forEach((n) => {
      if (!n.read) {
        n.read = true
        n.readAt = fmt(today)
      }
    })
    this.notifications.set(userId, notifications)
    return notifications
  }

  addReservationQueue(foodId: string, claimantId: string, claimantName: string) {
    const queues = this.reservationQueues.get(foodId) || []
    const existingQueue = queues.find((q) => q.claimantId === claimantId && q.status === 'waiting')
    if (existingQueue) return existingQueue

    const newQueue: ReservationQueue = {
      id: uuidv4(),
      foodId,
      claimantId,
      claimantName,
      queuePosition: queues.filter((q) => q.status === 'waiting').length + 1,
      status: 'waiting',
      createdAt: fmt(today),
      expiresAt: fmt(addDays(today, 3)),
    }
    queues.push(newQueue)
    this.reservationQueues.set(foodId, queues)
    return newQueue
  }

  getReservationQueue(foodId: string) {
    return this.reservationQueues.get(foodId) || []
  }

  cancelReservationQueue(foodId: string, queueId: string) {
    const queues = this.reservationQueues.get(foodId) || []
    const queue = queues.find((q) => q.id === queueId)
    if (queue) {
      queue.status = 'cancelled'
      this.reorderReservationQueue(foodId)
      this.reservationQueues.set(foodId, queues)
    }
    return queue
  }

  cancelReservationByUser(foodId: string, claimantId: string) {
    const queues = this.reservationQueues.get(foodId) || []
    const queue = queues.find((q) => q.foodId === foodId && q.claimantId === claimantId && q.status === 'waiting')
    if (queue) {
      queue.status = 'cancelled'
      this.reorderReservationQueue(foodId)
      this.reservationQueues.set(foodId, queues)
    }
    return queue
  }

  private reorderReservationQueue(foodId: string) {
    const queues = this.reservationQueues.get(foodId) || []
    let position = 1
    queues.forEach((q) => {
      if (q.status === 'waiting') {
        q.queuePosition = position++
      }
    })
    this.reservationQueues.set(foodId, queues)
  }

  notifyNextInQueue(foodId: string) {
    const queues = this.reservationQueues.get(foodId) || []
    const nextInQueue = queues.find((q) => q.status === 'waiting')
    if (nextInQueue) {
      nextInQueue.status = 'notified'
      nextInQueue.notifiedAt = fmt(today)
      nextInQueue.expiresAt = fmt(addDays(today, 1))
      this.reservationQueues.set(foodId, queues)

      this.addNotification(nextInQueue.claimantId, {
        type: 'reservation_available',
        title: '预约名额释放',
        content: `您排队的食物已释放名额，请在24小时内确认领取！`,
        relatedId: foodId,
        relatedType: 'food',
      })
      return nextInQueue
    }
    return null
  }

  addStockChangeLog(foodId: string, data: Omit<StockChangeLog, 'id' | 'foodId' | 'createdAt'>) {
    const logs = this.stockChangeLogs.get(foodId) || []
    const newLog: StockChangeLog = {
      ...data,
      id: uuidv4(),
      foodId,
      createdAt: fmt(today),
    }
    logs.unshift(newLog)
    this.stockChangeLogs.set(foodId, logs)
    return newLog
  }

  getStockChangeLogs(foodId: string) {
    return this.stockChangeLogs.get(foodId) || []
  }

  addStatusTimeline(foodId: string, data: Omit<StatusTimeline, 'id' | 'foodId' | 'createdAt'>) {
    const timelines = this.statusTimelines.get(foodId) || []
    const newTimeline: StatusTimeline = {
      ...data,
      id: uuidv4(),
      foodId,
      createdAt: fmt(today),
    }
    timelines.unshift(newTimeline)
    this.statusTimelines.set(foodId, timelines)
    return newTimeline
  }

  getStatusTimeline(foodId: string) {
    return this.statusTimelines.get(foodId) || []
  }

  addRejectRecord(foodId: string, data: Omit<RejectRecord, 'id' | 'foodId' | 'createdAt'>) {
    const record: RejectRecord = {
      ...data,
      id: uuidv4(),
      foodId,
      createdAt: fmt(today),
    }
    this.rejectRecords.set(foodId, record)
    return record
  }

  getRejectRecord(foodId: string) {
    return this.rejectRecords.get(foodId)
  }

  createClaimVoucher(data: Omit<ClaimVoucher, 'id'>) {
    const voucher: ClaimVoucher = {
      ...data,
      id: uuidv4(),
    }
    this.claimVouchers.set(voucher.id, voucher)
    return voucher
  }

  getClaimVouchersByClaimant(claimantId: string) {
    return Array.from(this.claimVouchers.values()).filter((v) => v.claimantId === claimantId)
  }

  getClaimVouchersByDonor(donorId: string) {
    return Array.from(this.claimVouchers.values()).filter((v) => v.donorId === donorId)
  }

  addFoodReview(foodId: string, data: Omit<FoodReview, 'id' | 'foodId' | 'createdAt'>) {
    const reviews = this.foodReviews.get(foodId) || []
    const newReview: FoodReview = {
      ...data,
      id: uuidv4(),
      foodId,
      createdAt: fmt(today),
    }
    reviews.push(newReview)
    this.foodReviews.set(foodId, reviews)
    return newReview
  }

  getFoodReviews(foodId: string) {
    return this.foodReviews.get(foodId) || []
  }

  getReviewsByUser(userId: string) {
    const allReviews: FoodReview[] = []
    this.foodReviews.forEach((reviews) => {
      allReviews.push(...reviews.filter((r) => r.reviewerId === userId || r.targetId === userId))
    })
    return allReviews
  }

  createMaterialNeed(data: Omit<MaterialNeed, 'id' | 'createdAt'>) {
    const need: MaterialNeed = {
      ...data,
      id: uuidv4(),
      createdAt: fmt(today),
    }
    this.materialNeeds.set(need.id, need)
    return need
  }

  getMaterialNeeds(filters?: { status?: string; category?: string; urgency?: string; requesterId?: string }) {
    let needs = Array.from(this.materialNeeds.values())
    if (filters?.status) needs = needs.filter((n) => n.status === filters.status)
    if (filters?.category) needs = needs.filter((n) => n.category === filters.category)
    if (filters?.urgency) needs = needs.filter((n) => n.urgency === filters.urgency)
    if (filters?.requesterId) needs = needs.filter((n) => n.requesterId === filters.requesterId)
    return needs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  updateMaterialNeedStatus(id: string, status: MaterialNeed['status'], matchedDonationId?: string) {
    const need = this.materialNeeds.get(id)
    if (need) {
      need.status = status
      if (matchedDonationId) need.matchedDonationId = matchedDonationId
      if (status === 'fulfilled') need.fulfilledAt = fmt(today)
      this.materialNeeds.set(id, need)
    }
    return need
  }

  createInspectionTask(data: Omit<InspectionTask, 'id' | 'createdAt'>) {
    const task: InspectionTask = {
      ...data,
      id: uuidv4(),
      createdAt: fmt(today),
    }
    this.inspectionTasks.set(task.id, task)

    this.addNotification(task.assigneeId, {
      type: 'system_announcement',
      title: '新的巡检任务',
      content: `您有一项新的巡检任务：${task.fridgeName}`,
      relatedId: task.id,
      relatedType: 'inspection',
    })
    return task
  }

  getInspectionTasks(filters?: { status?: string; assigneeId?: string; fridgeId?: string }) {
    let tasks = Array.from(this.inspectionTasks.values())
    if (filters?.status) tasks = tasks.filter((t) => t.status === filters.status)
    if (filters?.assigneeId) tasks = tasks.filter((t) => t.assigneeId === filters.assigneeId)
    if (filters?.fridgeId) tasks = tasks.filter((t) => t.fridgeId === filters.fridgeId)
    return tasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  updateInspectionTask(id: string, data: Partial<InspectionTask>) {
    const task = this.inspectionTasks.get(id)
    if (task) {
      Object.assign(task, data)
      if (data.status === 'completed' && !task.completedDate) {
        task.completedDate = fmt(today)
      }
      this.inspectionTasks.set(id, task)
    }
    return task
  }

  getAlertRules() {
    return Array.from(this.alertRules.values())
  }

  updateAlertRule(id: string, data: Partial<AlertRule>) {
    const rule = this.alertRules.get(id)
    if (rule) {
      Object.assign(rule, data)
      rule.updatedAt = fmt(today)
      this.alertRules.set(id, rule)
    }
    return rule
  }

  getCategoryConfigs() {
    return Array.from(this.categoryConfigs.values()).sort((a, b) => a.sortOrder - b.sortOrder)
  }

  updateCategoryConfig(id: string, data: Partial<FoodCategoryConfig>) {
    const config = this.categoryConfigs.get(id)
    if (config) {
      Object.assign(config, data)
      this.categoryConfigs.set(id, config)
    }
    return config
  }

  getFridgePoints(filters?: { status?: string; community?: string }) {
    let points = Array.from(this.fridgePoints.values())
    if (filters?.status) points = points.filter((p) => p.status === filters.status)
    if (filters?.community) points = points.filter((p) => p.community === filters.community)
    return points
  }

  updateFridgePoint(id: string, data: Partial<FridgePoint>) {
    const point = this.fridgePoints.get(id)
    if (point) {
      Object.assign(point, data)
      this.fridgePoints.set(id, point)
    }
    return point
  }

  createLossRecord(data: Omit<LossRecord, 'id' | 'reportedAt'>) {
    const record: LossRecord = {
      ...data,
      id: uuidv4(),
      reportedAt: fmt(today),
    }
    this.lossRecords.set(record.id, record)
    return record
  }

  getLossRecords(filters?: { reason?: string; category?: string; fridgeId?: string; startDate?: string; endDate?: string }) {
    let records = Array.from(this.lossRecords.values())
    if (filters?.reason) records = records.filter((r) => r.reason === filters.reason)
    if (filters?.category) records = records.filter((r) => r.category === filters.category)
    if (filters?.fridgeId) records = records.filter((r) => r.fridgeId === filters.fridgeId)
    if (filters?.startDate) records = records.filter((r) => r.reportedAt >= filters.startDate!)
    if (filters?.endDate) records = records.filter((r) => r.reportedAt <= filters.endDate!)
    return records
  }

  addInspectionRecord(fridgeId: string, data: Omit<InspectionRecord, 'id' | 'fridgeId' | 'createdAt'>) {
    const records = this.inspectionRecords.get(fridgeId) || []
    const newRecord: InspectionRecord = {
      ...data,
      id: uuidv4(),
      fridgeId,
      createdAt: fmt(today),
    }
    records.unshift(newRecord)
    this.inspectionRecords.set(fridgeId, records)
    return newRecord
  }

  getInspectionRecords(fridgeId: string) {
    return this.inspectionRecords.get(fridgeId) || []
  }

  cancelClaim(foodId: string, claimantId: string) {
    const food = this.foods.get(foodId)
    if (!food || food.status !== 'reserved' || food.claimantId !== claimantId) {
      return undefined
    }

    const oldStatus = food.status
    food.status = 'available'
    food.claimantId = undefined
    food.updatedAt = fmt(today)
    this.foods.set(foodId, food)

    const claimRecord = Array.from(this.claimRecords.values()).find(
      (c) => c.foodId === foodId && c.claimantId === claimantId && c.status === 'pending'
    )
    if (claimRecord) {
      claimRecord.status = 'cancelled'
      claimRecord.cancelledAt = fmt(today)
      this.claimRecords.set(claimRecord.id, claimRecord)
    }

    this.addStatusTimeline(foodId, {
      fromStatus: oldStatus,
      toStatus: 'available',
      reason: '用户取消预约',
      userId: claimantId,
      userName: this.users.get(claimantId)?.name,
    })

    const nextInQueue = this.notifyNextInQueue(foodId)
    if (nextInQueue) {
      food.status = 'reserved'
      food.claimantId = nextInQueue.claimantId
      this.foods.set(foodId, food)
      this.addStatusTimeline(foodId, {
        fromStatus: 'available',
        toStatus: 'reserved',
        reason: '二次排队预约',
        userId: nextInQueue.claimantId,
        userName: nextInQueue.claimantName,
      })
    }

    return food
  }

  withdrawDonation(foodId: string, donorId: string) {
    const food = this.foods.get(foodId)
    if (!food || food.donorId !== donorId) return undefined
    if (food.status === 'claimed' || food.status === 'reserved') return undefined

    const oldStatus = food.status
    food.status = 'rejected'
    food.updatedAt = fmt(today)
    this.foods.set(foodId, food)

    this.addStatusTimeline(foodId, {
      fromStatus: oldStatus,
      toStatus: 'rejected',
      reason: '捐赠者撤回',
      userId: donorId,
      userName: this.users.get(donorId)?.name,
    })

    return food
  }

  resubmitFood(foodId: string, data: Partial<FoodItem>) {
    const food = this.foods.get(foodId)
    if (!food || food.status !== 'rejected') return undefined

    Object.assign(food, data)
    food.status = 'pending_review'
    food.updatedAt = fmt(today)
    this.foods.set(foodId, food)

    this.rejectRecords.delete(foodId)

    this.addStatusTimeline(foodId, {
      fromStatus: 'rejected',
      toStatus: 'pending_review',
      reason: '重新提交审核',
      userId: food.donorId,
      userName: this.users.get(food.donorId)?.name,
    })

    return food
  }

  processTimeoutReservations() {
    const timeoutThreshold = addDays(today, -2)
    const formattedThreshold = fmt(timeoutThreshold)

    Array.from(this.claimRecords.values()).forEach((record) => {
      if (record.status === 'pending' && record.createdAt < formattedThreshold) {
        record.status = 'timeout'
        record.timeoutAt = fmt(today)
        this.claimRecords.set(record.id, record)

        const food = this.foods.get(record.foodId)
        if (food && food.status === 'reserved' && food.claimantId === record.claimantId) {
          const oldStatus = food.status
          food.status = 'available'
          food.claimantId = undefined
          food.updatedAt = fmt(today)
          this.foods.set(record.foodId, food)

          this.addStatusTimeline(record.foodId, {
            fromStatus: oldStatus,
            toStatus: 'available',
            reason: '领取超时自动释放',
          })

          this.notifyNextInQueue(record.foodId)
        }
      }
    })
  }

  batchUpdateFoodStatus(ids: string[], status: FoodStatus) {
    const results: FoodItem[] = []
    ids.forEach((id) => {
      const food = this.updateFoodStatus(id, status)
      if (food) results.push(food)
    })
    return results
  }

  batchMarkExpired(ids: string[]) {
    const results: FoodItem[] = []
    ids.forEach((id) => {
      const food = this.foods.get(id)
      if (food && food.status !== 'expired' && food.status !== 'claimed') {
        const updatedFood = this.updateFoodStatus(id, 'expired')
        if (updatedFood) {
          results.push(updatedFood)
          this.createLossRecord({
            foodId: id,
            foodName: food.name,
            category: food.category,
            quantity: parseInt(food.quantity) || 1,
            weight: food.weight || '',
            reason: 'expired',
            description: '批量标记过期',
            reportedBy: 'system',
            fridgeId: food.fridgeId,
          })
        }
      }
    })
    return results
  }

  getAdvancedStats(filters?: { startDate?: string; endDate?: string; community?: string; role?: string; fridgeId?: string }) {
    let foods = Array.from(this.foods.values())
    let vouchers = Array.from(this.claimVouchers.values())

    if (filters?.startDate) {
      foods = foods.filter((f) => f.createdAt >= filters.startDate!)
      vouchers = vouchers.filter((v) => v.claimedAt >= filters.startDate!)
    }
    if (filters?.endDate) {
      foods = foods.filter((f) => f.createdAt <= filters.endDate!)
      vouchers = vouchers.filter((v) => v.claimedAt <= filters.endDate!)
    }
    if (filters?.fridgeId) {
      foods = foods.filter((f) => f.fridgeId === filters.fridgeId)
      vouchers = vouchers.filter((v) => {
        const food = this.foods.get(v.foodId)
        return food?.fridgeId === filters.fridgeId
      })
    }

    const communityFridgeIds = filters?.community
      ? Array.from(this.fridgePoints.values())
          .filter((fp) => fp.community === filters.community)
          .map((fp) => fp.id)
      : null

    if (communityFridgeIds) {
      foods = foods.filter((f) => f.fridgeId && communityFridgeIds.includes(f.fridgeId))
    }

    if (filters?.role === 'donor') {
      vouchers = []
    } else if (filters?.role === 'claimant') {
      foods = foods.filter((f) => f.status === 'claimed')
    }

    const totalDonated = foods.length
    const totalClaimed = foods.filter((f) => f.status === 'claimed').length
    const totalWasted = foods.filter((f) => f.status === 'expired' || f.status === 'spoiled').length

    const expiryConverted = foods.filter((f) => {
      const daysLeft = Math.ceil((new Date(f.expiryDate).getTime() - new Date(f.createdAt).getTime()) / (1000 * 60 * 60 * 24))
      return daysLeft <= 3 && f.status === 'claimed'
    }).length
    const expiryTotal = foods.filter((f) => {
      const daysLeft = Math.ceil((new Date(f.expiryDate).getTime() - new Date(f.createdAt).getTime()) / (1000 * 60 * 60 * 24))
      return daysLeft <= 3
    }).length
    const expiryConversionRate = expiryTotal > 0 ? Math.round((expiryConverted / expiryTotal) * 100) : 0

    const claimResponseTimes: number[] = []
    Array.from(this.claimRecords.values()).forEach((record) => {
      if (record.status === 'completed' && record.completedAt) {
        const timeDiff = new Date(record.completedAt).getTime() - new Date(record.createdAt).getTime()
        claimResponseTimes.push(timeDiff / (1000 * 60 * 60))
      }
    })
    const avgClaimResponseTime = claimResponseTimes.length > 0
      ? Math.round(claimResponseTimes.reduce((a, b) => a + b, 0) / claimResponseTimes.length * 10) / 10
      : 0

    const lossRecords = this.getLossRecords({
      startDate: filters?.startDate,
      endDate: filters?.endDate,
    })
    const lossReasonDistribution: Record<string, number> = {}
    lossRecords.forEach((r) => {
      lossReasonDistribution[r.reason] = (lossReasonDistribution[r.reason] || 0) + 1
    })

    const categoryStats: Record<string, { donated: number; claimed: number; wasted: number }> = {}
    foods.forEach((f) => {
      if (!categoryStats[f.category]) {
        categoryStats[f.category] = { donated: 0, claimed: 0, wasted: 0 }
      }
      categoryStats[f.category].donated++
      if (f.status === 'claimed') categoryStats[f.category].claimed++
      if (f.status === 'expired' || f.status === 'spoiled') categoryStats[f.category].wasted++
    })

    const roleStats = {
      donors: Array.from(this.users.values()).filter((u) => u.role === 'donor').length,
      claimants: Array.from(this.users.values()).filter((u) => u.role === 'claimant').length,
      topDonors: Array.from(this.users.values())
        .filter((u) => u.role === 'donor')
        .map((u) => ({
          id: u.id,
          name: u.name,
          count: foods.filter((f) => f.donorId === u.id).length,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      topClaimants: Array.from(this.users.values())
        .filter((u) => u.role === 'claimant')
        .map((u) => ({
          id: u.id,
          name: u.name,
          count: foods.filter((f) => f.claimantId === u.id && f.status === 'claimed').length,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
    }

    const fridgeStats = Array.from(this.fridgePoints.values()).map((fp) => {
      const fridgeFoods = foods.filter((f) => f.fridgeId === fp.id)
      return {
        id: fp.id,
        name: fp.name,
        community: fp.community,
        donated: fridgeFoods.length,
        claimed: fridgeFoods.filter((f) => f.status === 'claimed').length,
        wasted: fridgeFoods.filter((f) => f.status === 'expired' || f.status === 'spoiled').length,
        currentStock: fp.currentStock,
        capacity: fp.capacity,
      }
    })

    return {
      totalDonated,
      totalClaimed,
      totalWasted,
      expiryConversionRate,
      avgClaimResponseTime,
      lossReasonDistribution,
      categoryStats,
      roleStats,
      fridgeStats,
      vouchers,
    }
  }

  getUserById(id: string): User | undefined {
    return this.users.get(id)
  }

  getUserByPhone(phone: string): User | undefined {
    return Array.from(this.users.values()).find((u) => u.phone === phone)
  }

  queryFoods(filters: {
    category?: string
    pickupMethod?: string
    keyword?: string
    status?: string
    sortBy?: string
  }): FoodItem[] {
    let result = Array.from(this.foods.values())

    if (filters.category) {
      result = result.filter((f) => f.category === filters.category)
    }
    if (filters.pickupMethod) {
      result = result.filter((f) => f.pickupMethod === filters.pickupMethod)
    }
    if (filters.keyword) {
      const kw = filters.keyword.toLowerCase()
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(kw) ||
          f.pickupLocation.toLowerCase().includes(kw)
      )
    }
    if (filters.status) {
      result = result.filter((f) => f.status === filters.status)
    }

    switch (filters.sortBy) {
      case 'expiryDate':
        result.sort(
          (a, b) =>
            new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
        )
        break
      case 'createdAt':
        result.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        break
      default:
        result.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
    }

    return result
  }

  getFoodById(id: string): FoodItem | undefined {
    return this.foods.get(id)
  }

  createFood(data: Omit<FoodItem, 'id' | 'pickupCode' | 'status' | 'createdAt' | 'updatedAt'>): FoodItem {
    const food: FoodItem = {
      ...data,
      id: uuidv4(),
      pickupCode: uuidv4().slice(0, 6).toUpperCase(),
      status: 'pending_review',
      createdAt: fmt(today),
      updatedAt: fmt(today),
    }
    this.foods.set(food.id, food)
    return food
  }

  updateFoodStatus(id: string, status: FoodStatus): FoodItem | undefined {
    const food = this.foods.get(id)
    if (!food) return undefined
    food.status = status
    food.updatedAt = fmt(today)
    this.foods.set(id, food)
    return food
  }

  claimFood(id: string, claimantId: string): FoodItem | undefined {
    const food = this.foods.get(id)
    if (!food) return undefined
    if (food.status !== 'available' && food.status !== 'reserved') return undefined
    food.status = 'reserved'
    food.claimantId = claimantId
    food.updatedAt = fmt(today)
    this.foods.set(id, food)

    const record: ClaimRecord = {
      id: uuidv4(),
      foodId: id,
      claimantId,
      donorId: food.donorId,
      pickupCode: food.pickupCode,
      status: 'pending',
      createdAt: fmt(today),
    }
    this.claimRecords.set(record.id, record)

    return food
  }

  generatePickupCode(): string {
    return uuidv4().slice(0, 6).toUpperCase()
  }

  getFridgeById(id: string): Fridge | undefined {
    return this.fridges.get(id)
  }

  updateFridge(id: string, data: Partial<Fridge>): Fridge | undefined {
    const fridge = this.fridges.get(id)
    if (!fridge) return undefined
    Object.assign(fridge, data)
    this.fridges.set(id, fridge)
    return fridge
  }

  getFoodsByFridgeId(fridgeId: string): FoodItem[] {
    return Array.from(this.foods.values()).filter((f) => f.fridgeId === fridgeId)
  }

  getDashboardStats() {
    const allFoods = Array.from(this.foods.values())
    const totalDonated = allFoods.length
    const totalClaimed = allFoods.filter((f) => f.status === 'claimed').length
    const totalWasted = allFoods.filter((f) => f.status === 'expired').length
    const benefitedFamilies = new Set(
      allFoods.filter((f) => f.claimantId).map((f) => f.claimantId!)
    ).size || totalClaimed

    const carbonReduction = totalClaimed * 2.5

    const donorMap = new Map<string, { donorId: string; donorName: string; count: number }>()
    allFoods.forEach((f) => {
      const donor = this.users.get(f.donorId)
      const key = f.donorId
      if (!donorMap.has(key)) {
        donorMap.set(key, { donorId: f.donorId, donorName: donor?.name ?? '未知', count: 0 })
      }
      donorMap.get(key)!.count++
    })
    const topDonors = Array.from(donorMap.values()).sort((a, b) => b.count - a.count)

    const fridgeStatus = Array.from(this.fridges.values()).map((f) => ({
      id: f.id,
      name: f.name,
      status: f.status,
      currentStock: f.currentStock,
      capacity: f.capacity,
    }))

    const monthlyTrend = this.dailyStats.slice(-30)

    const categoryMap = new Map<string, number>()
    allFoods.forEach((f) => {
      categoryMap.set(f.category, (categoryMap.get(f.category) || 0) + 1)
    })
    const categoryBreakdown = Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }))

    const expiryAlerts = allFoods
      .filter((f) => {
        if (f.status === 'claimed' || f.status === 'expired' || f.status === 'rejected') return false
        const daysLeft = Math.ceil(
          (new Date(f.expiryDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        )
        return daysLeft <= 2
      })
      .map((f) => {
        const daysLeft = Math.ceil(
          (new Date(f.expiryDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        )
        return {
          id: f.id,
          name: f.name,
          expiryDate: f.expiryDate,
          daysLeft,
          category: f.category,
        }
      })

    return {
      totalDonated,
      totalClaimed,
      totalWasted,
      benefitedFamilies,
      carbonReduction,
      topDonors,
      fridgeStatus,
      monthlyTrend,
      categoryBreakdown,
      expiryAlerts,
    }
  }

  getExpiryWarnings(days: number = 2): FoodItem[] {
    const now = today.getTime()
    return Array.from(this.foods.values()).filter((f) => {
      if (f.status === 'claimed' || f.status === 'expired' || f.status === 'rejected') return false
      const daysLeft = Math.ceil(
        (new Date(f.expiryDate).getTime() - now) / (1000 * 60 * 60 * 24)
      )
      return daysLeft <= days && daysLeft >= 0
    })
  }
}

const db = new Database()

export default db
export type {
  FoodItem,
  User,
  Fridge,
  ClaimRecord,
  DailyStats,
  FoodCategory,
  PickupMethod,
  FoodStatus,
  ReservationQueue,
  StockChangeLog,
  StatusTimeline,
  RejectRecord,
  ClaimVoucher,
  FoodReview,
  Notification,
  MaterialNeed,
  InspectionTask,
  AlertRule,
  FoodCategoryConfig,
  FridgePoint,
  LossRecord,
  InspectionRecord,
}
