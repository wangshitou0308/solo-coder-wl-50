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
  status: 'pending' | 'completed' | 'cancelled'
  createdAt: string
  completedAt?: string
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

  constructor() {
    SEED_USERS.forEach((u) => this.users.set(u.id, u))
    SEED_FOODS.forEach((f) => this.foods.set(f.id, f))
    SEED_FRIDGES.forEach((f) => this.fridges.set(f.id, f))
    SEED_CLAIM_RECORDS.forEach((c) => this.claimRecords.set(c.id, c))
    this.dailyStats = [...SEED_DAILY_STATS]
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
export type { FoodItem, User, Fridge, ClaimRecord, DailyStats, FoodCategory, PickupMethod, FoodStatus }
