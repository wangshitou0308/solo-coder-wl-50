import { create } from 'zustand'

type Role = 'donor' | 'claimant' | 'admin'

type FoodCategory = '生鲜果蔬' | '熟食' | '干货' | '罐头' | '烘焙' | '冷冻食品'

type FoodStatus = 'available' | 'pending_review' | 'reserved' | 'claimed' | 'expired' | 'spoiled' | 'rejected'

type PickupMethod = '放置共享冰箱' | '定点自取' | '上门领取'

export interface User {
  id: string
  name: string
  avatar: string
  role: Role
  phone: string
  donationCount: number
  claimCount: number
}

export interface Food {
  id: string
  name: string
  category: FoodCategory
  quantity: number
  weight: string
  expiryDate: string
  pickupMethod: PickupMethod
  location: string
  fridgeId?: string
  description: string
  images: string[]
  status: FoodStatus
  donorId: string
  donorName: string
  claimantId?: string
  claimantName?: string
  pickupCode?: string
  createdAt: string
  updatedAt?: string
  distance: number
}

export interface Fridge {
  id: string
  name: string
  location: string
  temperature: number
  cleanliness: number
  capacity: number
  currentStock: number
  status: '正常' | '温度异常' | '需清洁'
  lastInspected?: string
}

export interface DashboardStats {
  totalDonated: number
  totalClaimed: number
  totalWasted: number
  beneficiaryFamilies: number
  carbonReduction: number
  monthlyTrend: { month: string; donated: number; claimed: number; wasted: number }[]
  categoryBreakdown: { name: string; value: number }[]
  topDonors: { id: string; name: string; count: number }[]
  fridgeStatus: { id: string; name: string; status: string; currentStock: number; capacity: number }[]
  expiryAlerts: { id: string; name: string; expiryDate: string; daysLeft: number; category: string }[]
}

export type { FoodCategory, PickupMethod, FoodStatus }

export interface FridgeInspection {
  id: string
  fridgeId: string
  inspectorId: string
  temperature: number
  cleanliness: number
  notes: string
  createdAt: string
}

export interface ReservationQueue {
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

export interface StockChangeLog {
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

export interface StatusTimeline {
  id: string
  foodId: string
  userId?: string
  userName?: string
  fromStatus: string
  toStatus: string
  reason: string
  createdAt: string
}

export interface RejectRecord {
  id: string
  foodId: string
  adminId: string
  adminName: string
  reason: string
  createdAt: string
}

export interface ClaimVoucher {
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

export interface FoodReview {
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

export interface Notification {
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

export interface MaterialNeed {
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

export interface InspectionTask {
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

export interface AlertRule {
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

export interface FoodCategoryConfig {
  id: string
  name: string
  icon: string
  color: string
  sortOrder: number
  enabled: boolean
  createdAt: string
}

export interface FridgePoint {
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

export interface LossRecord {
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

export interface InspectionRecord {
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

export interface AdvancedStats {
  totalDonated: number
  totalClaimed: number
  totalWasted: number
  expiryConversionRate: number
  avgClaimResponseTime: number
  lossReasonDistribution: Record<string, number>
  categoryStats: Record<string, { donated: number; claimed: number; wasted: number }>
  roleStats: {
    donors: number
    claimants: number
    topDonors: Array<{ id: string; name: string; count: number }>
    topClaimants: Array<{ id: string; name: string; count: number }>
  }
  fridgeStats: Array<{
    id: string
    name: string
    community: string
    donated: number
    claimed: number
    wasted: number
    currentStock: number
    capacity: number
  }>
  vouchers: ClaimVoucher[]
}

export interface DashboardStats {
  totalDonated: number
  totalClaimed: number
  totalWasted: number
  beneficiaryFamilies: number
  carbonReduction: number
  monthlyTrend: { month: string; donated: number; claimed: number; wasted: number }[]
  categoryBreakdown: { name: string; value: number }[]
  topDonors: { id: string; name: string; count: number }[]
  fridgeStatus: { id: string; name: string; status: string; currentStock: number; capacity: number }[]
  expiryAlerts: { id: string; name: string; expiryDate: string; daysLeft: number; category: string }[]
}

interface StoreState {
  currentUser: User
  foods: Food[]
  fridges: Fridge[]
  dashboard: DashboardStats | null
  activeCategory: FoodCategory | '全部'
  searchKeyword: string
  filterPanelOpen: boolean
  role: Role
  sortBy: '最新发布' | '即将过期' | '距离最近'
  pickupFilter: PickupMethod[]
  distanceRange: [number, number]
  notifications: Notification[]
  vouchers: ClaimVoucher[]
  materialNeeds: MaterialNeed[]
  fridgePoints: FridgePoint[]
  inspectionTasks: InspectionTask[]
  alertRules: AlertRule[]
  categoryConfigs: FoodCategoryConfig[]
  advancedStats: AdvancedStats | null
  selectedFoodIds: string[]
  reviews: FoodReview[]
  fetchFoods: (filters?: { category?: string; sortBy?: string; status?: string }) => Promise<void>
  fetchFridges: () => Promise<void>
  fetchDashboard: () => Promise<void>
  createFood: (food: Omit<Food, 'id' | 'status' | 'donorId' | 'donorName' | 'createdAt' | 'distance' | 'pickupCode' | 'updatedAt' | 'images'> & { images?: string[] }) => Promise<Food | null>
  claimFood: (foodId: string) => Promise<boolean>
  completeClaim: (foodId: string, pickupCode: string) => Promise<boolean>
  updateFoodStatus: (foodId: string, status: FoodStatus) => Promise<boolean>
  setActiveCategory: (category: FoodCategory | '全部') => void
  setSearchKeyword: (keyword: string) => void
  setFilterPanelOpen: (open: boolean) => void
  setRole: (role: Role) => void
  setSortBy: (sort: '最新发布' | '即将过期' | '距离最近') => void
  setPickupFilter: (filters: PickupMethod[]) => void
  setDistanceRange: (range: [number, number]) => void
  login: (role: Role) => void
  logout: () => void
  uploadImage: (file: File) => Promise<string | null>
  inspectFridge: (fridgeId: string, data: { temperature: number; cleanliness: number; notes: string }) => Promise<boolean>
  cancelClaim: (foodId: string) => Promise<boolean>
  withdrawDonation: (foodId: string) => Promise<boolean>
  resubmitFood: (foodId: string, data: Partial<Food>) => Promise<boolean>
  fetchRejectReason: (foodId: string) => Promise<RejectRecord | null>
  fetchStockLogs: (foodId: string) => Promise<StockChangeLog[]>
  fetchStatusTimeline: (foodId: string) => Promise<StatusTimeline[]>
  addToQueue: (foodId: string) => Promise<ReservationQueue | null>
  cancelQueue: (foodId: string) => Promise<boolean>
  fetchQueue: (foodId: string) => Promise<ReservationQueue[]>
  fetchNotifications: (filters?: { read?: boolean; type?: string }) => Promise<void>
  markNotificationRead: (notificationId: string) => Promise<boolean>
  markAllNotificationsRead: () => Promise<boolean>
  fetchVouchers: () => Promise<void>
  createVoucher: (food: Food) => Promise<ClaimVoucher | null>
  fetchMaterialNeeds: (filters?: { status?: string; category?: string; urgency?: string }) => Promise<void>
  createMaterialNeed: (data: Omit<MaterialNeed, 'id' | 'createdAt' | 'status' | 'requesterId' | 'requesterName'>) => Promise<MaterialNeed | null>
  updateMaterialNeedStatus: (id: string, status: MaterialNeed['status'], matchedDonationId?: string) => Promise<boolean>
  addReview: (foodId: string, data: Omit<FoodReview, 'id' | 'foodId' | 'createdAt'>) => Promise<FoodReview | null>
  fetchReviews: (foodId: string) => Promise<FoodReview[]>
  fetchUserReviews: () => Promise<void>
  fetchFridgePoints: (filters?: { status?: string; community?: string }) => Promise<void>
  fetchInspectionTasks: (filters?: { status?: string }) => Promise<void>
  createInspectionTask: (data: Omit<InspectionTask, 'id' | 'createdAt' | 'status'>) => Promise<InspectionTask | null>
  updateInspectionTask: (id: string, data: Partial<InspectionTask>) => Promise<boolean>
  completeInspectionTask: (id: string, data: { temperature: number; cleanliness: number; issues?: string; notes?: string }) => Promise<boolean>
  fetchAlertRules: () => Promise<void>
  updateAlertRule: (id: string, data: Partial<AlertRule>) => Promise<boolean>
  fetchCategoryConfigs: () => Promise<void>
  updateCategoryConfig: (id: string, data: Partial<FoodCategoryConfig>) => Promise<boolean>
  fetchAdvancedStats: (filters?: { startDate?: string; endDate?: string; community?: string; role?: string; fridgeId?: string }) => Promise<void>
  exportReport: (filters?: { startDate?: string; endDate?: string; community?: string; role?: string; fridgeId?: string; format?: string }) => Promise<void>
  batchUpdateFoodStatus: (ids: string[], status: FoodStatus) => Promise<number>
  batchMarkExpired: (ids: string[]) => Promise<number>
  toggleFoodSelection: (foodId: string) => void
  clearFoodSelection: () => void
  selectAllFoods: (foodIds: string[]) => void
}

const mockUsers: Record<Role, User> = {
  claimant: {
    id: 'user-2',
    name: '李秀英',
    avatar: '',
    role: 'claimant',
    phone: '139****9002',
    donationCount: 0,
    claimCount: 5,
  },
  donor: {
    id: 'user-1',
    name: '张明华',
    avatar: '',
    role: 'donor',
    phone: '138****8001',
    donationCount: 12,
    claimCount: 0,
  },
  admin: {
    id: 'user-3',
    name: '王建国',
    avatar: '',
    role: 'admin',
    phone: '137****7003',
    donationCount: 0,
    claimCount: 0,
  },
}

const generatePickupCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

const mockFoods: Food[] = [
  {
    id: 'food-1', name: '新鲜有机西红柿', category: '生鲜果蔬', quantity: 5, weight: '2.5kg',
    expiryDate: '2026-06-18', pickupMethod: '放置共享冰箱', location: '阳光社区共享冰箱',
    fridgeId: 'fridge-1', description: '自家菜园种植的新鲜有机西红柿，无农药残留', images: [],
    status: 'available', donorId: 'user-1', donorName: '张明华', createdAt: '2026-06-14', distance: 0.8,
  },
  {
    id: 'food-2', name: '手工水饺', category: '熟食', quantity: 3, weight: '1.5kg',
    expiryDate: '2026-06-18', pickupMethod: '定点自取', location: '和谐家园小区北门领取点',
    description: '手工包制的猪肉白菜水饺，新鲜美味', images: [],
    status: 'available', donorId: 'user-1', donorName: '张明华', createdAt: '2026-06-15', distance: 1.2,
  },
  {
    id: 'food-3', name: '东北大米', category: '干货', quantity: 2, weight: '10kg',
    expiryDate: '2026-12-31', pickupMethod: '定点自取', location: '绿洲社区活动中心领取点',
    description: '优质东北五常大米，颗粒饱满', images: [],
    status: 'available', donorId: 'user-1', donorName: '张明华', createdAt: '2026-06-11', distance: 2.5,
  },
  {
    id: 'food-4', name: '黄桃罐头', category: '罐头', quantity: 6, weight: '3kg',
    expiryDate: '2027-06-01', pickupMethod: '上门领取', location: '北京市朝阳区阳光社区12号楼3单元',
    description: '新鲜黄桃制作，口感脆甜', images: [],
    status: 'available', donorId: 'user-1', donorName: '张明华', createdAt: '2026-06-13', distance: 1.5,
  },
  {
    id: 'food-5', name: '全麦面包', category: '烘焙', quantity: 4, weight: '2kg',
    expiryDate: '2026-06-17', pickupMethod: '放置共享冰箱', location: '和谐家园共享冰箱',
    fridgeId: 'fridge-2', description: '现烤全麦面包，健康营养', images: [],
    status: 'pending_review', donorId: 'user-1', donorName: '张明华', createdAt: '2026-06-16', distance: 1.0,
  },
  {
    id: 'food-6', name: '速冻蔬菜包', category: '冷冻食品', quantity: 8, weight: '4kg',
    expiryDate: '2026-09-30', pickupMethod: '放置共享冰箱', location: '绿洲社区共享冰箱',
    fridgeId: 'fridge-3', description: '混合时蔬，速冻保鲜', images: [],
    status: 'reserved', donorId: 'user-1', donorName: '张明华', claimantId: 'user-2', claimantName: '李秀英',
    pickupCode: 'AB3K7M', createdAt: '2026-06-12', distance: 0.5,
  },
  {
    id: 'food-7', name: '新鲜草莓', category: '生鲜果蔬', quantity: 2, weight: '1kg',
    expiryDate: '2026-06-17', pickupMethod: '定点自取', location: '果园路12号农场直供点',
    description: '当日采摘新鲜草莓，香甜多汁', images: [],
    status: 'available', donorId: 'user-1', donorName: '张明华', createdAt: '2026-06-16', distance: 3.1,
  },
  {
    id: 'food-8', name: '土鸡蛋', category: '生鲜果蔬', quantity: 30, weight: '1.8kg',
    expiryDate: '2026-06-25', pickupMethod: '放置共享冰箱', location: '和谐家园共享冰箱',
    fridgeId: 'fridge-2', description: '农村散养土鸡蛋30枚', images: [],
    status: 'claimed', donorId: 'user-1', donorName: '张明华', claimantId: 'user-2', claimantName: '李秀英',
    pickupCode: 'XZ9L2P', createdAt: '2026-06-10', distance: 1.0,
  },
  {
    id: 'food-9', name: '过期牛奶', category: '干货', quantity: 2, weight: '2L',
    expiryDate: '2026-06-10', pickupMethod: '定点自取', location: '已下架处理',
    description: '已过期牛奶，待销毁', images: [],
    status: 'expired', donorId: 'user-1', donorName: '张明华', createdAt: '2026-06-05', distance: 1.0,
  },
  {
    id: 'food-10', name: '巧克力蛋糕', category: '烘焙', quantity: 2, weight: '1.2kg',
    expiryDate: '2026-06-17', pickupMethod: '定点自取', location: '甜蜜蛋糕店门店自取',
    description: '手工制作巧克力慕斯蛋糕', images: [],
    status: 'available', donorId: 'user-1', donorName: '张明华', createdAt: '2026-06-16', distance: 1.5,
  },
  {
    id: 'food-11', name: '红烧牛肉', category: '熟食', quantity: 2, weight: '1kg',
    expiryDate: '2026-06-17', pickupMethod: '放置共享冰箱', location: '阳光社区共享冰箱',
    fridgeId: 'fridge-1', description: '新鲜烧制红烧牛肉，入味香浓', images: [],
    status: 'available', donorId: 'user-1', donorName: '张明华', createdAt: '2026-06-15', distance: 0.8,
  },
  {
    id: 'food-12', name: '苹果', category: '生鲜果蔬', quantity: 10, weight: '5kg',
    expiryDate: '2026-06-14', pickupMethod: '放置共享冰箱', location: '和谐家园共享冰箱',
    fridgeId: 'fridge-2', description: '红富士苹果，脆甜多汁', images: [],
    status: 'expired', donorId: 'user-1', donorName: '张明华', createdAt: '2026-06-06', distance: 1.0,
  },
]

const mockFridges: Fridge[] = [
  { id: 'fridge-1', name: '阳光社区共享冰箱', location: '北京市朝阳区阳光社区服务中心1楼', temperature: 4, cleanliness: 5, capacity: 50, currentStock: 23, status: '正常', lastInspected: '2026-06-15' },
  { id: 'fridge-2', name: '和谐家园共享冰箱', location: '北京市海淀区和谐家园小区北门', temperature: 8, cleanliness: 3, capacity: 40, currentStock: 35, status: '温度异常', lastInspected: '2026-06-13' },
  { id: 'fridge-3', name: '绿洲社区共享冰箱', location: '北京市西城区绿洲社区活动中心', temperature: 3, cleanliness: 4, capacity: 60, currentStock: 12, status: '正常', lastInspected: '2026-06-14' },
]

const mockDashboard: DashboardStats = {
  totalDonated: 1286,
  totalClaimed: 1043,
  totalWasted: 86,
  beneficiaryFamilies: 358,
  carbonReduction: 2580,
  monthlyTrend: [
    { month: '1月', donated: 85, claimed: 72, wasted: 5 },
    { month: '2月', donated: 92, claimed: 80, wasted: 4 },
    { month: '3月', donated: 110, claimed: 95, wasted: 6 },
    { month: '4月', donated: 105, claimed: 90, wasted: 3 },
    { month: '5月', donated: 120, claimed: 108, wasted: 4 },
    { month: '6月', donated: 118, claimed: 98, wasted: 2 },
  ],
  categoryBreakdown: [
    { name: '生鲜果蔬', value: 35 },
    { name: '熟食', value: 20 },
    { name: '干货', value: 18 },
    { name: '罐头', value: 12 },
    { name: '烘焙', value: 10 },
    { name: '冷冻食品', value: 5 },
  ],
  topDonors: [
    { id: 'd1', name: '张明华', count: 48 },
    { id: 'd2', name: '李面包', count: 35 },
    { id: 'd3', name: '张果蔬', count: 28 },
    { id: 'd4', name: '陈超市', count: 22 },
    { id: 'd5', name: '赵面点', count: 18 },
  ],
  fridgeStatus: [
    { id: 'fridge-1', name: '阳光社区共享冰箱', status: 'normal', currentStock: 23, capacity: 50 },
    { id: 'fridge-2', name: '和谐家园共享冰箱', status: 'warning', currentStock: 35, capacity: 40 },
    { id: 'fridge-3', name: '绿洲社区共享冰箱', status: 'normal', currentStock: 12, capacity: 60 },
  ],
  expiryAlerts: [
    { id: 'food-1', name: '新鲜有机西红柿', expiryDate: '2026-06-18', daysLeft: 2, category: '生鲜果蔬' },
    { id: 'food-2', name: '手工水饺', expiryDate: '2026-06-18', daysLeft: 2, category: '熟食' },
    { id: 'food-7', name: '新鲜草莓', expiryDate: '2026-06-17', daysLeft: 1, category: '生鲜果蔬' },
  ],
}

const convertDbFoodToStore = (dbFood: any, users?: Map<string, any>): Food => {
  const donor = users?.get(dbFood.donorId)
  const claimant = dbFood.claimantId ? users?.get(dbFood.claimantId) : undefined
  return {
    id: dbFood.id,
    name: dbFood.name,
    category: dbFood.category as FoodCategory,
    quantity: parseInt(dbFood.quantity) || 1,
    weight: dbFood.weight || '',
    expiryDate: dbFood.expiryDate,
    pickupMethod: dbFood.pickupMethod as PickupMethod,
    location: dbFood.pickupLocation || dbFood.location || '',
    fridgeId: dbFood.fridgeId,
    description: dbFood.description || '',
    images: dbFood.images || [],
    status: dbFood.status as FoodStatus,
    donorId: dbFood.donorId,
    donorName: donor?.name || dbFood.donorName || '匿名捐赠者',
    claimantId: dbFood.claimantId,
    claimantName: claimant?.name || dbFood.claimantName,
    pickupCode: dbFood.pickupCode,
    createdAt: dbFood.createdAt,
    updatedAt: dbFood.updatedAt,
    distance: Math.round(Math.random() * 50) / 10,
  }
}

const convertDbFridgeToStore = (dbFridge: any): Fridge => {
  const statusMap: Record<string, Fridge['status']> = {
    normal: '正常',
    warning: '温度异常',
    maintenance: '需清洁',
  }
  return {
    id: dbFridge.id,
    name: dbFridge.name,
    location: dbFridge.location,
    temperature: dbFridge.temperature,
    cleanliness: Math.ceil((dbFridge.cleanliness || 80) / 20),
    capacity: dbFridge.capacity,
    currentStock: dbFridge.currentStock,
    status: statusMap[dbFridge.status] || dbFridge.status || '正常',
    lastInspected: dbFridge.lastInspected,
  }
}

export const useStore = create<StoreState>((set, get) => ({
  currentUser: mockUsers.claimant,
  foods: [],
  fridges: [],
  dashboard: null,
  activeCategory: '全部',
  searchKeyword: '',
  filterPanelOpen: false,
  role: 'claimant',
  sortBy: '最新发布',
  pickupFilter: [],
  distanceRange: [0, 10],
  notifications: [],
  vouchers: [],
  materialNeeds: [],
  fridgePoints: [],
  inspectionTasks: [],
  alertRules: [],
  categoryConfigs: [],
  advancedStats: null,
  selectedFoodIds: [],
  reviews: [],

  fetchFoods: async (filters) => {
    try {
      const params = new URLSearchParams()
      if (filters?.category && filters.category !== '全部') params.append('category', filters.category)
      if (filters?.sortBy) {
        const sortMap: Record<string, string> = {
          '最新发布': 'createdAt',
          '即将过期': 'expiryDate',
        }
        params.append('sortBy', sortMap[filters.sortBy] || 'createdAt')
      }
      if (filters?.status) params.append('status', filters.status)

      const res = await fetch(`/api/foods?${params.toString()}`)
      if (res.ok) {
        const result = await res.json()
        if (result.success && result.data) {
          const apiFoods = Array.isArray(result.data) ? result.data : []
          const usersMap = new Map<string, any>()
          try {
            const usersRes = await fetch('/api/auth/users')
            if (usersRes.ok) {
              const usersResult = await usersRes.json()
              if (usersResult.success && usersResult.data) {
                usersResult.data.forEach((u: any) => usersMap.set(u.id, u))
              }
            }
          } catch {}

          const convertedApiFoods = apiFoods.map((f: any) => convertDbFoodToStore(f, usersMap))

          set((state) => {
            const foodMap = new Map<string, Food>()
            state.foods.forEach((f) => foodMap.set(f.id, f))
            convertedApiFoods.forEach((f) => {
              const existing = foodMap.get(f.id)
              if (existing) {
                foodMap.set(f.id, { ...existing, ...f })
              } else {
                foodMap.set(f.id, f)
              }
            })
            return { foods: Array.from(foodMap.values()) }
          })
          return
        }
      }
      throw new Error('API failed')
    } catch {
      const currentFoods = get().foods
      if (currentFoods.length === 0) {
        set({ foods: mockFoods })
      }
    }
  },

  fetchFridges: async () => {
    try {
      const res = await fetch('/api/fridges')
      if (res.ok) {
        const result = await res.json()
        if (result.success && result.data) {
          const fridges = Array.isArray(result.data) ? result.data : []
          set({ fridges: fridges.map(convertDbFridgeToStore) })
          return
        }
      }
      throw new Error('API failed')
    } catch {
      set({ fridges: mockFridges })
    }
  },

  fetchDashboard: async () => {
    try {
      const res = await fetch('/api/dashboard')
      if (res.ok) {
        const result = await res.json()
        if (result.success && result.data) {
          const data = result.data
          const rawMonthlyTrend = data.monthlyTrend || mockDashboard.monthlyTrend
          const monthlyTrend = rawMonthlyTrend.map((item: any) => ({
            month: item.month || item.date?.slice(5) || '',
            donated: item.donated || 0,
            claimed: item.claimed || 0,
            wasted: item.wasted || 0,
          }))
          const rawTopDonors = data.topDonors || mockDashboard.topDonors
          const topDonors = rawTopDonors.map((item: any) => ({
            id: item.donorId,
            name: item.donorName || item.name || '',
            count: item.count || 0,
          }))
          set({
            dashboard: {
              totalDonated: data.totalDonated || 0,
              totalClaimed: data.totalClaimed || 0,
              totalWasted: data.totalWasted || 0,
              beneficiaryFamilies: data.benefitedFamilies || data.beneficiaryFamilies || 0,
              carbonReduction: data.carbonReduction || 0,
              monthlyTrend,
              categoryBreakdown: data.categoryBreakdown || mockDashboard.categoryBreakdown,
              topDonors,
              fridgeStatus: data.fridgeStatus || mockDashboard.fridgeStatus,
              expiryAlerts: data.expiryAlerts || mockDashboard.expiryAlerts,
            },
          })
          return
        }
      }
      throw new Error('API failed')
    } catch {
      set({ dashboard: mockDashboard })
    }
  },

  createFood: async (foodData) => {
    try {
      const res = await fetch('/api/foods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: foodData.name,
          category: foodData.category,
          quantity: String(foodData.quantity),
          weight: foodData.weight,
          expiryDate: foodData.expiryDate,
          pickupMethod: foodData.pickupMethod,
          pickupLocation: foodData.location,
          images: foodData.images || [],
          donorId: get().currentUser.id,
          fridgeId: foodData.fridgeId,
          description: foodData.description,
        }),
      })
      if (res.ok) {
        const result = await res.json()
        if (result.success && result.data) {
          const newFood = convertDbFoodToStore(result.data)
          if (!newFood.donorName) {
            newFood.donorName = get().currentUser.name
          }
          set((state) => {
            const foodMap = new Map<string, Food>()
            state.foods.forEach((f) => foodMap.set(f.id, f))
            foodMap.set(newFood.id, newFood)
            const sorted = Array.from(foodMap.values()).sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )
            return { foods: sorted }
          })
          return newFood
        }
      }
      throw new Error('API failed')
    } catch {
      const newFood: Food = {
        ...foodData,
        id: 'f' + Date.now(),
        status: 'pending_review',
        donorId: get().currentUser.id,
        donorName: get().currentUser.name,
        createdAt: new Date().toISOString().split('T')[0],
        distance: Math.round(Math.random() * 50) / 10,
        pickupCode: generatePickupCode(),
        images: foodData.images || [],
      }
      set((state) => {
        const foodMap = new Map<string, Food>()
        state.foods.forEach((f) => foodMap.set(f.id, f))
        foodMap.set(newFood.id, newFood)
        const sorted = Array.from(foodMap.values()).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        return { foods: sorted }
      })
      return newFood
    }
  },

  claimFood: async (foodId) => {
    const currentUser = get().currentUser
    try {
      const res = await fetch(`/api/foods/${foodId}/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimantId: currentUser.id }),
      })
      if (res.ok) {
        const result = await res.json()
        if (result.success && result.data) {
          const updatedFood = convertDbFoodToStore(result.data)
          if (!updatedFood.claimantName) {
            updatedFood.claimantName = currentUser.name
          }
          if (!updatedFood.claimantId) {
            updatedFood.claimantId = currentUser.id
          }
          set((state) => ({
            foods: state.foods.map((f) => (f.id === foodId ? { ...f, ...updatedFood } : f)),
          }))
          return true
        }
      }
      const errorData = await res.json().catch(() => ({}))
      console.error('Claim failed:', errorData.error || 'Unknown error')
      throw new Error(errorData.error || 'Claim failed')
    } catch {
      const code = generatePickupCode()
      set((state) => ({
        foods: state.foods.map((f) =>
          f.id === foodId && (f.status === 'available')
            ? { ...f, status: 'reserved' as FoodStatus, claimantId: currentUser.id, claimantName: currentUser.name, pickupCode: code }
            : f
        ),
      }))
      const updated = get().foods.find((f) => f.id === foodId)
      return updated?.status === 'reserved'
    }
  },

  completeClaim: async (foodId, pickupCode) => {
    try {
      const res = await fetch(`/api/foods/${foodId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pickupCode }),
      })
      if (res.ok) {
        const result = await res.json()
        if (result.success) {
          set((state) => ({
            foods: state.foods.map((f) => (f.id === foodId ? { ...f, status: 'claimed' as FoodStatus } : f)),
          }))
          return true
        }
      }
      return false
    } catch {
      set((state) => ({
        foods: state.foods.map((f) => (f.id === foodId ? { ...f, status: 'claimed' as FoodStatus } : f)),
      }))
      return true
    }
  },

  updateFoodStatus: async (foodId, status) => {
    try {
      const res = await fetch(`/api/foods/${foodId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        const result = await res.json()
        if (result.success && result.data) {
          const updatedFood = convertDbFoodToStore(result.data)
          set((state) => {
            const foodMap = new Map<string, Food>()
            state.foods.forEach((f) => foodMap.set(f.id, f))
            const existing = foodMap.get(foodId)
            if (existing) {
              foodMap.set(foodId, { ...existing, ...updatedFood, status })
            } else {
              foodMap.set(foodId, updatedFood)
            }
            return { foods: Array.from(foodMap.values()) }
          })
          return true
        }
      }
      throw new Error('API failed')
    } catch {
      set((state) => {
        const foodMap = new Map<string, Food>()
        state.foods.forEach((f) => foodMap.set(f.id, f))
        const existing = foodMap.get(foodId)
        if (existing) {
          foodMap.set(foodId, { ...existing, status, updatedAt: new Date().toISOString().split('T')[0] })
        }
        return { foods: Array.from(foodMap.values()) }
      })
      return true
    }
  },

  setActiveCategory: (category) => set({ activeCategory: category }),
  setSearchKeyword: (keyword) => set({ searchKeyword: keyword }),
  setFilterPanelOpen: (open) => set({ filterPanelOpen: open }),
  setRole: (role) => set({ role, currentUser: mockUsers[role] }),
  setSortBy: (sort) => set({ sortBy: sort }),
  setPickupFilter: (filters) => set({ pickupFilter: filters }),
  setDistanceRange: (range) => set({ distanceRange: range }),
  login: (role) => set({ role, currentUser: mockUsers[role] }),
  logout: () => set({ role: 'claimant', currentUser: mockUsers.claimant }),

  uploadImage: async (file) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      if (res.ok) {
        const result = await res.json()
        if (result.success && result.data) {
          return result.data.path
        }
      }
      return null
    } catch {
      return null
    }
  },

  inspectFridge: async (fridgeId, data) => {
    try {
      const res = await fetch(`/api/fridges/${fridgeId}/inspect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          inspectorId: get().currentUser.id,
        }),
      })
      if (res.ok) {
        const result = await res.json()
        if (result.success && result.data) {
          const updatedFridge = convertDbFridgeToStore(result.data)
          set((state) => ({
            fridges: state.fridges.map((f) => (f.id === fridgeId ? updatedFridge : f)),
          }))
          return true
        }
      }
      return false
    } catch {
      set((state) => ({
        fridges: state.fridges.map((f) =>
          f.id === fridgeId
            ? {
                ...f,
                temperature: data.temperature,
                cleanliness: data.cleanliness,
                lastInspected: new Date().toISOString().split('T')[0],
                status: data.temperature > 6 ? '温度异常' : data.cleanliness < 3 ? '需清洁' : '正常',
              }
            : f
        ),
      }))
      return true
    }
  },

  cancelClaim: async (foodId) => {
    const currentUser = get().currentUser
    try {
      const res = await fetch(`/api/foods/${foodId}/cancel-claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimantId: currentUser.id }),
      })
      if (res.ok) {
        const result = await res.json()
        if (result.success && result.data) {
          const updatedFood = convertDbFoodToStore(result.data)
          set((state) => ({
            foods: state.foods.map((f) => (f.id === foodId ? { ...f, ...updatedFood } : f)),
          }))
          return true
        }
      }
      return false
    } catch {
      set((state) => ({
        foods: state.foods.map((f) =>
          f.id === foodId && f.status === 'reserved' && f.claimantId === currentUser.id
            ? { ...f, status: 'available' as FoodStatus, claimantId: undefined, claimantName: undefined }
            : f
        ),
      }))
      return true
    }
  },

  withdrawDonation: async (foodId) => {
    const currentUser = get().currentUser
    try {
      const res = await fetch(`/api/foods/${foodId}/withdraw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ donorId: currentUser.id }),
      })
      if (res.ok) {
        const result = await res.json()
        if (result.success && result.data) {
          const updatedFood = convertDbFoodToStore(result.data)
          set((state) => ({
            foods: state.foods.map((f) => (f.id === foodId ? { ...f, ...updatedFood } : f)),
          }))
          return true
        }
      }
      return false
    } catch {
      set((state) => ({
        foods: state.foods.map((f) =>
          f.id === foodId && f.donorId === currentUser.id && ['pending_review', 'available'].includes(f.status)
            ? { ...f, status: 'rejected' as FoodStatus }
            : f
        ),
      }))
      return true
    }
  },

  resubmitFood: async (foodId, data) => {
    try {
      const res = await fetch(`/api/foods/${foodId}/resubmit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        const result = await res.json()
        if (result.success && result.data) {
          const updatedFood = convertDbFoodToStore(result.data)
          set((state) => ({
            foods: state.foods.map((f) => (f.id === foodId ? { ...f, ...updatedFood } : f)),
          }))
          return true
        }
      }
      return false
    } catch {
      set((state) => ({
        foods: state.foods.map((f) =>
          f.id === foodId && f.status === 'rejected'
            ? { ...f, ...data, status: 'pending_review' as FoodStatus }
            : f
        ),
      }))
      return true
    }
  },

  fetchRejectReason: async (foodId) => {
    try {
      const res = await fetch(`/api/foods/${foodId}/reject-reason`)
      if (res.ok) {
        const result = await res.json()
        if (result.success && result.data) {
          return result.data
        }
      }
      return null
    } catch {
      return null
    }
  },

  fetchStockLogs: async (foodId) => {
    try {
      const res = await fetch(`/api/foods/${foodId}/stock-logs`)
      if (res.ok) {
        const result = await res.json()
        if (result.success && result.data) {
          return result.data
        }
      }
      return []
    } catch {
      return []
    }
  },

  fetchStatusTimeline: async (foodId) => {
    try {
      const res = await fetch(`/api/foods/${foodId}/timeline`)
      if (res.ok) {
        const result = await res.json()
        if (result.success && result.data) {
          return result.data
        }
      }
      return []
    } catch {
      return []
    }
  },

  addToQueue: async (foodId) => {
    const currentUser = get().currentUser
    try {
      const res = await fetch(`/api/foods/${foodId}/queue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimantId: currentUser.id, claimantName: currentUser.name }),
      })
      if (res.ok) {
        const result = await res.json()
        if (result.success && result.data) {
          return result.data
        }
      }
      return null
    } catch {
      return {
        id: 'q' + Date.now(),
        foodId,
        claimantId: currentUser.id,
        claimantName: currentUser.name,
        queuePosition: 1,
        status: 'waiting' as const,
        createdAt: new Date().toISOString().split('T')[0],
      }
    }
  },

  cancelQueue: async (foodId) => {
    const currentUser = get().currentUser
    try {
      const res = await fetch(`/api/foods/${foodId}/queue/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimantId: currentUser.id }),
      })
      return res.ok
    } catch {
      return true
    }
  },

  fetchQueue: async (foodId) => {
    try {
      const res = await fetch(`/api/foods/${foodId}/queue`)
      if (res.ok) {
        const result = await res.json()
        if (result.success && result.data) {
          return result.data
        }
      }
      return []
    } catch {
      return []
    }
  },

  fetchNotifications: async (filters) => {
    const currentUser = get().currentUser
    try {
      const params = new URLSearchParams()
      if (filters?.read !== undefined) params.append('read', String(filters.read))
      if (filters?.type) params.append('type', filters.type)
      const res = await fetch(`/api/notifications/${currentUser.id}?${params.toString()}`)
      if (res.ok) {
        const result = await res.json()
        if (result.success && result.data) {
          set({ notifications: result.data })
        }
      }
    } catch {
      set({ notifications: [] })
    }
  },

  markNotificationRead: async (notificationId) => {
    const currentUser = get().currentUser
    try {
      const res = await fetch(`/api/notifications/${currentUser.id}/read/${notificationId}`, {
        method: 'POST',
      })
      if (res.ok) {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === notificationId ? { ...n, read: true } : n
          ),
        }))
        return true
      }
      return false
    } catch {
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n
        ),
      }))
      return true
    }
  },

  markAllNotificationsRead: async () => {
    const currentUser = get().currentUser
    try {
      const res = await fetch(`/api/notifications/${currentUser.id}/read-all`, {
        method: 'POST',
      })
      if (res.ok) {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        }))
        return true
      }
      return false
    } catch {
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
      }))
      return true
    }
  },

  fetchVouchers: async () => {
    const currentUser = get().currentUser
    const endpoint = currentUser.role === 'claimant' ? 'claimant' : 'donor'
    try {
      const res = await fetch(`/api/vouchers/${endpoint}/${currentUser.id}`)
      if (res.ok) {
        const result = await res.json()
        if (result.success && result.data) {
          set({ vouchers: result.data })
        }
      }
    } catch {
      set({ vouchers: [] })
    }
  },

  createVoucher: async (food) => {
    const currentUser = get().currentUser
    try {
      const res = await fetch('/api/vouchers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          foodId: food.id,
          foodName: food.name,
          claimantId: currentUser.id,
          claimantName: currentUser.name,
          donorId: food.donorId,
          donorName: food.donorName,
          pickupCode: food.pickupCode,
          claimedAt: new Date().toISOString().split('T')[0],
          pickupLocation: food.location,
          quantity: food.quantity,
          weight: food.weight,
          category: food.category,
          images: food.images,
        }),
      })
      if (res.ok) {
        const result = await res.json()
        if (result.success && result.data) {
          return result.data
        }
      }
      return null
    } catch {
      return null
    }
  },

  fetchMaterialNeeds: async (filters) => {
    try {
      const params = new URLSearchParams()
      if (filters?.status) params.append('status', filters.status)
      if (filters?.category) params.append('category', filters.category)
      if (filters?.urgency) params.append('urgency', filters.urgency)
      const res = await fetch(`/api/needs?${params.toString()}`)
      if (res.ok) {
        const result = await res.json()
        if (result.success && result.data) {
          set({ materialNeeds: result.data })
        }
      }
    } catch {
      set({ materialNeeds: [] })
    }
  },

  createMaterialNeed: async (data) => {
    const currentUser = get().currentUser
    try {
      const res = await fetch('/api/needs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          requesterId: currentUser.id,
          requesterName: currentUser.name,
        }),
      })
      if (res.ok) {
        const result = await res.json()
        if (result.success && result.data) {
          set((state) => ({
            materialNeeds: [result.data, ...state.materialNeeds],
          }))
          return result.data
        }
      }
      return null
    } catch {
      const newNeed: MaterialNeed = {
        ...data,
        id: 'need-' + Date.now(),
        requesterId: currentUser.id,
        requesterName: currentUser.name,
        status: 'open',
        createdAt: new Date().toISOString().split('T')[0],
      }
      set((state) => ({ materialNeeds: [newNeed, ...state.materialNeeds] }))
      return newNeed
    }
  },

  updateMaterialNeedStatus: async (id, status, matchedDonationId) => {
    try {
      const res = await fetch(`/api/needs/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, matchedDonationId }),
      })
      if (res.ok) {
        const result = await res.json()
        if (result.success && result.data) {
          set((state) => ({
            materialNeeds: state.materialNeeds.map((n) => (n.id === id ? result.data : n)),
          }))
          return true
        }
      }
      return false
    } catch {
      set((state) => ({
        materialNeeds: state.materialNeeds.map((n) =>
          n.id === id ? { ...n, status, matchedDonationId } : n
        ),
      }))
      return true
    }
  },

  addReview: async (foodId, data) => {
    const currentUser = get().currentUser
    try {
      const res = await fetch(`/api/reviews/${foodId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          reviewerId: currentUser.id,
          reviewerName: currentUser.name,
          reviewerRole: currentUser.role as 'donor' | 'claimant',
        }),
      })
      if (res.ok) {
        const result = await res.json()
        if (result.success && result.data) {
          return result.data
        }
      }
      return null
    } catch {
      return {
        id: 'review-' + Date.now(),
        foodId,
        reviewerId: currentUser.id,
        reviewerName: currentUser.name,
        reviewerRole: currentUser.role as 'donor' | 'claimant',
        targetId: data.targetId,
        targetName: data.targetName,
        rating: data.rating,
        content: data.content,
        thankYouNote: data.thankYouNote,
        createdAt: new Date().toISOString().split('T')[0],
      }
    }
  },

  fetchReviews: async (foodId) => {
    try {
      const res = await fetch(`/api/reviews/food/${foodId}`)
      if (res.ok) {
        const result = await res.json()
        if (result.success && result.data) {
          return result.data
        }
      }
      return []
    } catch {
      return []
    }
  },

  fetchUserReviews: async () => {
    const currentUser = get().currentUser
    try {
      const res = await fetch(`/api/reviews/user/${currentUser.id}`)
      if (res.ok) {
        const result = await res.json()
        if (result.success && result.data) {
          set({ reviews: result.data })
          return
        }
      }
      throw new Error('API failed')
    } catch {
      set({ reviews: [] })
    }
  },

  fetchFridgePoints: async (filters) => {
    try {
      const params = new URLSearchParams()
      if (filters?.status) params.append('status', filters.status)
      if (filters?.community) params.append('community', filters.community)
      const res = await fetch(`/api/fridge-points?${params.toString()}`)
      if (res.ok) {
        const result = await res.json()
        if (result.success && result.data) {
          set({ fridgePoints: result.data })
        }
      }
    } catch {
      set({ fridgePoints: [] })
    }
  },

  fetchInspectionTasks: async (filters) => {
    try {
      const params = new URLSearchParams()
      if (filters?.status) params.append('status', filters.status)
      const res = await fetch(`/api/inspections?${params.toString()}`)
      if (res.ok) {
        const result = await res.json()
        if (result.success && result.data) {
          set({ inspectionTasks: result.data })
        }
      }
    } catch {
      set({ inspectionTasks: [] })
    }
  },

  createInspectionTask: async (data) => {
    try {
      const res = await fetch('/api/inspections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        const result = await res.json()
        if (result.success && result.data) {
          set((state) => ({
            inspectionTasks: [result.data, ...state.inspectionTasks],
          }))
          return result.data
        }
      }
      return null
    } catch {
      const newTask: InspectionTask = {
        ...data,
        id: 'task-' + Date.now(),
        status: 'pending',
        createdAt: new Date().toISOString().split('T')[0],
      }
      set((state) => ({ inspectionTasks: [newTask, ...state.inspectionTasks] }))
      return newTask
    }
  },

  updateInspectionTask: async (id, data) => {
    try {
      const res = await fetch(`/api/inspections/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        const result = await res.json()
        if (result.success && result.data) {
          set((state) => ({
            inspectionTasks: state.inspectionTasks.map((t) => (t.id === id ? result.data : t)),
          }))
          return true
        }
      }
      return false
    } catch {
      set((state) => ({
        inspectionTasks: state.inspectionTasks.map((t) => (t.id === id ? { ...t, ...data } : t)),
      }))
      return true
    }
  },

  completeInspectionTask: async (id, data) => {
    try {
      const res = await fetch(`/api/inspections/${id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        const result = await res.json()
        if (result.success && result.data) {
          set((state) => ({
            inspectionTasks: state.inspectionTasks.map((t) => (t.id === id ? result.data : t)),
          }))
          return true
        }
      }
      return false
    } catch {
      set((state) => ({
        inspectionTasks: state.inspectionTasks.map((t) =>
          t.id === id
            ? {
                ...t,
                status: 'completed',
                temperature: data.temperature,
                cleanliness: data.cleanliness,
                issues: data.issues,
                notes: data.notes,
                completedDate: new Date().toISOString().split('T')[0],
              }
            : t
        ),
      }))
      return true
    }
  },

  fetchAlertRules: async () => {
    try {
      const res = await fetch('/api/admin/alert-rules')
      if (res.ok) {
        const result = await res.json()
        if (result.success && result.data) {
          set({ alertRules: result.data })
        }
      }
    } catch {
      set({ alertRules: [] })
    }
  },

  updateAlertRule: async (id, data) => {
    try {
      const res = await fetch(`/api/admin/alert-rules/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        const result = await res.json()
        if (result.success && result.data) {
          set((state) => ({
            alertRules: state.alertRules.map((r) => (r.id === id ? result.data : r)),
          }))
          return true
        }
      }
      return false
    } catch {
      set((state) => ({
        alertRules: state.alertRules.map((r) => (r.id === id ? { ...r, ...data } : r)),
      }))
      return true
    }
  },

  fetchCategoryConfigs: async () => {
    try {
      const res = await fetch('/api/admin/category-configs')
      if (res.ok) {
        const result = await res.json()
        if (result.success && result.data) {
          set({ categoryConfigs: result.data })
        }
      }
    } catch {
      set({ categoryConfigs: [] })
    }
  },

  updateCategoryConfig: async (id, data) => {
    try {
      const res = await fetch(`/api/admin/category-configs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        const result = await res.json()
        if (result.success && result.data) {
          set((state) => ({
            categoryConfigs: state.categoryConfigs.map((c) => (c.id === id ? result.data : c)),
          }))
          return true
        }
      }
      return false
    } catch {
      set((state) => ({
        categoryConfigs: state.categoryConfigs.map((c) => (c.id === id ? { ...c, ...data } : c)),
      }))
      return true
    }
  },

  fetchAdvancedStats: async (filters) => {
    try {
      const params = new URLSearchParams()
      if (filters?.startDate) params.append('startDate', filters.startDate)
      if (filters?.endDate) params.append('endDate', filters.endDate)
      if (filters?.community) params.append('community', filters.community)
      if (filters?.role) params.append('role', filters.role)
      if (filters?.fridgeId) params.append('fridgeId', filters.fridgeId)
      const res = await fetch(`/api/admin/advanced-stats?${params.toString()}`)
      if (res.ok) {
        const result = await res.json()
        if (result.success && result.data) {
          set({ advancedStats: result.data })
        }
      }
    } catch {
      set({ advancedStats: null })
    }
  },

  exportReport: async (filters) => {
    try {
      const params = new URLSearchParams()
      if (filters?.startDate) params.append('startDate', filters.startDate)
      if (filters?.endDate) params.append('endDate', filters.endDate)
      if (filters?.community) params.append('community', filters.community)
      if (filters?.role) params.append('role', filters.role)
      if (filters?.fridgeId) params.append('fridgeId', filters.fridgeId)
      if (filters?.format) params.append('format', filters.format)
      const res = await fetch(`/api/admin/export?${params.toString()}`)
      if (res.ok && filters?.format === 'csv') {
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `report_${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch {}
  },

  batchUpdateFoodStatus: async (ids, status) => {
    try {
      const res = await fetch('/api/foods/batch-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, status }),
      })
      if (res.ok) {
        const result = await res.json()
        if (result.success) {
          set((state) => ({
            foods: state.foods.map((f) => (ids.includes(f.id) ? { ...f, status } : f)),
            selectedFoodIds: [],
          }))
          return result.count || 0
        }
      }
      return 0
    } catch {
      set((state) => ({
        foods: state.foods.map((f) => (ids.includes(f.id) ? { ...f, status } : f)),
        selectedFoodIds: [],
      }))
      return ids.length
    }
  },

  batchMarkExpired: async (ids) => {
    try {
      const res = await fetch('/api/foods/batch-mark-expired', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      })
      if (res.ok) {
        const result = await res.json()
        if (result.success) {
          set((state) => ({
            foods: state.foods.map((f) => (ids.includes(f.id) ? { ...f, status: 'expired' as FoodStatus } : f)),
            selectedFoodIds: [],
          }))
          return result.count || 0
        }
      }
      return 0
    } catch {
      set((state) => ({
        foods: state.foods.map((f) => (ids.includes(f.id) ? { ...f, status: 'expired' as FoodStatus } : f)),
        selectedFoodIds: [],
      }))
      return ids.length
    }
  },

  toggleFoodSelection: (foodId) => {
    set((state) => ({
      selectedFoodIds: state.selectedFoodIds.includes(foodId)
        ? state.selectedFoodIds.filter((id) => id !== foodId)
        : [...state.selectedFoodIds, foodId],
    }))
  },

  clearFoodSelection: () => {
    set({ selectedFoodIds: [] })
  },

  selectAllFoods: (foodIds) => {
    set({ selectedFoodIds: foodIds })
  },
}))
