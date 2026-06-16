import { useState, useEffect } from 'react'
import {
  ClipboardList,
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Thermometer,
  Sparkles,
  MapPin,
  X,
  Save,
  ChevronDown,
  ArrowUpRight,
} from 'lucide-react'
import { useStore, type InspectionTask, type Fridge } from '@/store/useStore'
import { cn } from '@/lib/utils'

type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'

interface Tab {
  key: TaskStatus | 'all'
  label: string
  icon: typeof ClipboardList
}

const tabs: Tab[] = [
  { key: 'all', label: '全部', icon: ClipboardList },
  { key: 'pending', label: '待处理', icon: Clock },
  { key: 'in_progress', label: '进行中', icon: AlertCircle },
  { key: 'completed', label: '已完成', icon: CheckCircle2 },
  { key: 'cancelled', label: '已取消', icon: XCircle },
]

const priorityConfig = {
  low: { label: '低', color: 'bg-blue-50 text-blue-600', dot: 'bg-blue-400' },
  medium: { label: '中', color: 'bg-amber-50 text-amber-600', dot: 'bg-amber-400' },
  high: { label: '高', color: 'bg-red-50 text-red-600', dot: 'bg-red-400' },
}

const statusConfig = {
  pending: { label: '待处理', color: 'bg-stone-100 text-stone-600' },
  in_progress: { label: '进行中', color: 'bg-primary-50 text-primary-600' },
  completed: { label: '已完成', color: 'bg-secondary-50 text-secondary-600' },
  cancelled: { label: '已取消', color: 'bg-red-50 text-red-600' },
}

const mockInspectors = [
  { id: 'user-1', name: '张明华' },
  { id: 'user-2', name: '李秀英' },
  { id: 'user-3', name: '王建国' },
  { id: 'user-4', name: '赵小云' },
  { id: 'user-5', name: '陈大伟' },
]

export default function InspectionTasks() {
  const {
    inspectionTasks,
    fridges,
    fetchInspectionTasks,
    fetchFridges,
    createInspectionTask,
    updateInspectionTask,
    completeInspectionTask,
    currentUser,
  } = useStore()

  const [activeTab, setActiveTab] = useState<TaskStatus | 'all'>('all')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState<InspectionTask | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [loading, setLoading] = useState(false)

  const [newTask, setNewTask] = useState({
    fridgeId: '',
    fridgeName: '',
    assigneeId: '',
    assigneeName: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    scheduledDate: new Date().toISOString().split('T')[0],
    notes: '',
  })

  const [completionData, setCompletionData] = useState({
    temperature: 4,
    cleanliness: 5,
    issues: '',
    notes: '',
  })

  useEffect(() => {
    fetchInspectionTasks()
    fetchFridges()
  }, [fetchInspectionTasks, fetchFridges])

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(t)
    }
  }, [toast])

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
  }

  const filteredTasks = inspectionTasks.filter((task) => {
    const matchesTab = activeTab === 'all' || task.status === activeTab
    const matchesSearch =
      task.fridgeName.includes(searchKeyword) ||
      task.assigneeName.includes(searchKeyword)
    return matchesTab && matchesSearch
  })

  const handleCreateTask = async () => {
    if (!newTask.fridgeId || !newTask.assigneeId || !newTask.scheduledDate) {
      showToast('请填写完整信息', 'error')
      return
    }

    setLoading(true)
    const success = await createInspectionTask(newTask)
    setLoading(false)

    if (success) {
      showToast('任务创建成功')
      setShowCreateModal(false)
      setNewTask({
        fridgeId: '',
        fridgeName: '',
        assigneeId: '',
        assigneeName: '',
        priority: 'medium',
        scheduledDate: new Date().toISOString().split('T')[0],
        notes: '',
      })
    } else {
      showToast('创建失败，请重试', 'error')
    }
  }

  const handleStartTask = async (taskId: string) => {
    const success = await updateInspectionTask(taskId, { status: 'in_progress' })
    if (success) {
      showToast('任务已开始')
    } else {
      showToast('操作失败', 'error')
    }
  }

  const handleCancelTask = async (taskId: string) => {
    const success = await updateInspectionTask(taskId, { status: 'cancelled' })
    if (success) {
      showToast('任务已取消')
      setShowDetailModal(false)
    } else {
      showToast('操作失败', 'error')
    }
  }

  const handleCompleteTask = async () => {
    if (!selectedTask) return

    setLoading(true)
    const success = await completeInspectionTask(selectedTask.id, completionData)
    setLoading(false)

    if (success) {
      showToast('任务已完成')
      setShowDetailModal(false)
      setCompletionData({
        temperature: 4,
        cleanliness: 5,
        issues: '',
        notes: '',
      })
    } else {
      showToast('保存失败，请重试', 'error')
    }
  }

  const openTaskDetail = (task: InspectionTask) => {
    setSelectedTask(task)
    setCompletionData({
      temperature: task.temperature || 4,
      cleanliness: task.cleanliness || 5,
      issues: task.issues || '',
      notes: task.notes || '',
    })
    setShowDetailModal(true)
  }

  const handleFridgeSelect = (fridge: Fridge) => {
    setNewTask({
      ...newTask,
      fridgeId: fridge.id,
      fridgeName: fridge.name,
    })
  }

  const handleAssigneeSelect = (inspector: { id: string; name: string }) => {
    setNewTask({
      ...newTask,
      assigneeId: inspector.id,
      assigneeName: inspector.name,
    })
  }

  const stats = {
    total: inspectionTasks.length,
    pending: inspectionTasks.filter((t) => t.status === 'pending').length,
    inProgress: inspectionTasks.filter((t) => t.status === 'in_progress').length,
    completed: inspectionTasks.filter((t) => t.status === 'completed').length,
    cancelled: inspectionTasks.filter((t) => t.status === 'cancelled').length,
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative">
      {toast && (
        <div
          className={cn(
            'fixed top-20 right-6 z-50 rounded-xl shadow-lg px-5 py-3 flex items-center gap-3 animate-fade-in-up border',
            toast.type === 'success'
              ? 'bg-secondary-50 border-secondary-200 text-secondary-800'
              : 'bg-red-50 border-red-200 text-red-800'
          )}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-secondary-500" />
          ) : (
            <XCircle className="w-5 h-5 text-red-500" />
          )}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
            <ClipboardList className="w-7 h-7 text-primary-500" />
            巡检任务管理
          </h1>
          <p className="text-sm text-stone-400 mt-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {new Date().toLocaleDateString('zh-CN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long',
            })}
            {' · '}
            管理员：{currentUser.name}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-medium shadow-sm hover:shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          创建新任务
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {[
          { label: '全部任务', value: stats.total, color: 'from-stone-400 to-stone-500', icon: ClipboardList },
          { label: '待处理', value: stats.pending, color: 'from-amber-400 to-amber-500', icon: Clock },
          { label: '进行中', value: stats.inProgress, color: 'from-primary-400 to-primary-500', icon: AlertCircle },
          { label: '已完成', value: stats.completed, color: 'from-secondary-400 to-secondary-500', icon: CheckCircle2 },
          { label: '已取消', value: stats.cancelled, color: 'from-red-400 to-red-500', icon: XCircle },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className={cn(
                'relative rounded-2xl p-4 text-white overflow-hidden',
                `bg-gradient-to-br ${stat.color}`
              )}
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-6 translate-x-6" />
              <div className="flex items-center justify-between mb-2 relative">
                <Icon className="w-5 h-5 text-white/80" />
              </div>
              <div className="relative">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-white/80 mt-0.5">{stat.label}</p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex items-center gap-1 bg-stone-100 rounded-xl p-1 mb-6 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const count = tab.key === 'all' ? stats.total : stats[tab.key as keyof typeof stats]
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex-1 sm:flex-none justify-center',
                activeTab === tab.key
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-stone-500 hover:text-stone-700'
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              <span className="w-5 h-5 rounded-full bg-stone-200 text-stone-600 text-xs flex items-center justify-center font-medium">
                {count}
              </span>
            </button>
          )
        })}
      </div>

      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="搜索冰箱名称或巡检人员..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-primary-400 text-sm bg-white"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 text-sm hover:bg-stone-50 transition-colors">
          <Filter className="w-4 h-4" />
          筛选
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>

      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-stone-200/60">
            <div className="w-16 h-16 rounded-2xl bg-stone-50 flex items-center justify-center mx-auto mb-4">
              <ClipboardList className="w-8 h-8 text-stone-300" />
            </div>
            <p className="text-lg font-medium text-stone-600">暂无任务</p>
            <p className="text-sm text-stone-400 mt-1">当前筛选条件下没有巡检任务</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-50 text-primary-600 text-sm font-medium mx-auto hover:bg-primary-100 transition-colors"
            >
              <Plus className="w-4 h-4" />
              创建第一个任务
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTasks.map((task, index) => {
              const priority = priorityConfig[task.priority]
              const status = statusConfig[task.status]
              return (
                <div
                  key={task.id}
                  onClick={() => openTaskDetail(task)}
                  className="bg-white rounded-2xl border border-stone-200/60 p-5 hover:shadow-md hover:border-primary-200 transition-all cursor-pointer card-enter group"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-primary-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-stone-800 text-sm">{task.fridgeName}</h3>
                        <p className="text-xs text-stone-400 flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {task.assigneeName}
                        </p>
                      </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-stone-300 group-hover:text-primary-500 transition-colors" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={cn('w-2 h-2 rounded-full', priority.dot)} />
                        <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', priority.color)}>
                          {priority.label}优先级
                        </span>
                      </div>
                      <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', status.color)}>
                        {status.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-stone-500">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>计划日期：{task.scheduledDate}</span>
                    </div>

                    {task.completedDate && (
                      <div className="flex items-center gap-2 text-xs text-stone-500">
                        <CheckCircle2 className="w-3.5 h-3.5 text-secondary-500" />
                        <span>完成日期：{task.completedDate}</span>
                      </div>
                    )}

                    {task.temperature !== undefined && (
                      <div className="flex items-center gap-2 text-xs text-stone-500">
                        <Thermometer className="w-3.5 h-3.5" />
                        <span>温度：{task.temperature}°C</span>
                      </div>
                    )}

                    {task.notes && (
                      <p className="text-xs text-stone-400 bg-stone-50 rounded-lg px-3 py-2 line-clamp-2">
                        {task.notes}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-xs text-stone-400">创建于 {task.createdAt}</span>
                    {task.status === 'pending' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleStartTask(task.id)
                        }}
                        className="text-xs font-medium text-primary-600 hover:text-primary-700"
                      >
                        开始任务 →
                      </button>
                    )}
                    {task.status === 'in_progress' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          openTaskDetail(task)
                        }}
                        className="text-xs font-medium text-secondary-600 hover:text-secondary-700"
                      >
                        填写记录 →
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-stone-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-primary-500" />
                  创建巡检任务
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="w-8 h-8 rounded-lg hover:bg-stone-100 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-stone-400" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  选择冰箱 <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto border border-stone-200 rounded-xl p-2">
                  {fridges.length === 0 ? (
                    <p className="text-sm text-stone-400 text-center py-4">暂无冰箱数据</p>
                  ) : (
                    fridges.map((fridge) => (
                      <div
                        key={fridge.id}
                        onClick={() => handleFridgeSelect(fridge)}
                        className={cn(
                          'p-3 rounded-lg cursor-pointer transition-all border-2',
                          newTask.fridgeId === fridge.id
                            ? 'border-primary-400 bg-primary-50'
                            : 'border-transparent hover:bg-stone-50'
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-stone-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-stone-800 truncate">{fridge.name}</p>
                            <p className="text-xs text-stone-400 flex items-center gap-1 truncate">
                              <MapPin className="w-3 h-3 flex-shrink-0" />
                              {fridge.location}
                            </p>
                          </div>
                          <span
                            className={cn(
                              'text-xs font-medium px-2 py-0.5 rounded-full',
                              fridge.status === '正常' && 'bg-secondary-50 text-secondary-600',
                              fridge.status === '温度异常' && 'bg-red-50 text-red-600',
                              fridge.status === '需清洁' && 'bg-amber-50 text-amber-600'
                            )}
                          >
                            {fridge.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  指派人员 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {mockInspectors.map((inspector) => (
                    <div
                      key={inspector.id}
                      onClick={() => handleAssigneeSelect(inspector)}
                      className={cn(
                        'p-3 rounded-lg cursor-pointer transition-all border-2',
                        newTask.assigneeId === inspector.id
                          ? 'border-primary-400 bg-primary-50'
                          : 'border-stone-200 hover:border-stone-300'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-500 flex items-center justify-center text-white text-sm font-bold">
                          {inspector.name.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-stone-700">{inspector.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  优先级 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['low', 'medium', 'high'] as const).map((p) => {
                    const config = priorityConfig[p]
                    return (
                      <button
                        key={p}
                        onClick={() => setNewTask({ ...newTask, priority: p })}
                        className={cn(
                          'p-3 rounded-lg border-2 transition-all text-sm font-medium',
                          newTask.priority === p
                            ? cn(config.color, 'border-current')
                            : 'border-stone-200 text-stone-500 hover:border-stone-300'
                        )}
                      >
                        <span className={cn('w-2 h-2 rounded-full inline-block mr-2', config.dot)} />
                        {config.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  计划日期 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={newTask.scheduledDate}
                  onChange={(e) => setNewTask({ ...newTask, scheduledDate: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-primary-400 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">备注说明</label>
                <textarea
                  value={newTask.notes}
                  onChange={(e) => setNewTask({ ...newTask, notes: e.target.value })}
                  rows={3}
                  placeholder="输入任务备注或特殊说明..."
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-primary-400 text-sm resize-none"
                />
              </div>
            </div>

            <div className="p-6 border-t border-stone-100 flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-5 py-2.5 rounded-xl border-2 border-stone-200 text-stone-600 text-sm font-medium hover:bg-stone-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleCreateTask}
                disabled={loading || !newTask.fridgeId || !newTask.assigneeId}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-medium shadow-sm hover:shadow-md transition-all disabled:opacity-60"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                创建任务
              </button>
            </div>
          </div>
        </div>
      )}

      {showDetailModal && selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-stone-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-primary-500" />
                  任务详情
                </h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="w-8 h-8 rounded-lg hover:bg-stone-100 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-stone-400" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div className="bg-stone-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-stone-500">冰箱名称</span>
                  <span className="text-sm font-medium text-stone-800">{selectedTask.fridgeName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-stone-500">巡检人员</span>
                  <span className="text-sm font-medium text-stone-800">{selectedTask.assigneeName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-stone-500">优先级</span>
                  <span
                    className={cn(
                      'text-xs font-medium px-2 py-0.5 rounded-full',
                      priorityConfig[selectedTask.priority].color
                    )}
                  >
                    {priorityConfig[selectedTask.priority].label}优先级
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-stone-500">状态</span>
                  <span
                    className={cn(
                      'text-xs font-medium px-2 py-0.5 rounded-full',
                      statusConfig[selectedTask.status].color
                    )}
                  >
                    {statusConfig[selectedTask.status].label}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-stone-500">计划日期</span>
                  <span className="text-sm font-medium text-stone-800">{selectedTask.scheduledDate}</span>
                </div>
                {selectedTask.completedDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-stone-500">完成日期</span>
                    <span className="text-sm font-medium text-secondary-600">{selectedTask.completedDate}</span>
                  </div>
                )}
              </div>

              {selectedTask.status === 'in_progress' && (
                <>
                  <div className="border-t border-stone-100 pt-5">
                    <h3 className="text-sm font-semibold text-stone-800 mb-4 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-secondary-500" />
                      填写巡检记录
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="flex items-center justify-between text-xs font-medium text-stone-600 mb-2">
                          <span className="flex items-center gap-1">
                            <Thermometer className="w-3.5 h-3.5" /> 当前温度
                          </span>
                          <span
                            className={cn(
                              'font-bold text-lg',
                              completionData.temperature > 6
                                ? 'text-red-500'
                                : completionData.temperature > 4
                                ? 'text-amber-500'
                                : 'text-secondary-500'
                            )}
                          >
                            {completionData.temperature}°C
                          </span>
                        </label>
                        <input
                          type="range"
                          min="-5"
                          max="15"
                          value={completionData.temperature}
                          onChange={(e) =>
                            setCompletionData({ ...completionData, temperature: Number(e.target.value) })
                          }
                          className="w-full accent-primary-500"
                        />
                        <div className="flex justify-between text-xs text-stone-400 mt-1">
                          <span>-5°C</span>
                          <span className="text-secondary-500">理想: 2-4°C</span>
                          <span>15°C</span>
                        </div>
                      </div>

                      <div>
                        <label className="flex items-center justify-between text-xs font-medium text-stone-600 mb-2">
                          清洁度评分
                          <span className="font-bold text-lg text-amber-500">
                            {completionData.cleanliness}/5
                          </span>
                        </label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setCompletionData({ ...completionData, cleanliness: s })}
                              className="flex-1 py-2 rounded-lg border-2 transition-all flex items-center justify-center"
                            >
                              <Sparkles
                                className={cn(
                                  'w-5 h-5 transition-all',
                                  s <= completionData.cleanliness
                                    ? 'text-amber-400 fill-amber-400 scale-110'
                                    : 'text-stone-200'
                                )}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-stone-600 mb-2">问题描述</label>
                        <textarea
                          value={completionData.issues}
                          onChange={(e) => setCompletionData({ ...completionData, issues: e.target.value })}
                          rows={2}
                          placeholder="描述发现的问题，如温度异常、设备故障等..."
                          className="w-full px-3 py-2 rounded-lg border border-stone-200 focus:outline-none focus:border-primary-400 text-sm resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-stone-600 mb-2">巡检备注</label>
                        <textarea
                          value={completionData.notes}
                          onChange={(e) => setCompletionData({ ...completionData, notes: e.target.value })}
                          rows={2}
                          placeholder="记录其他需要说明的情况..."
                          className="w-full px-3 py-2 rounded-lg border border-stone-200 focus:outline-none focus:border-primary-400 text-sm resize-none"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {selectedTask.status === 'completed' && (
                <div className="bg-secondary-50 rounded-xl p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-secondary-700 mb-3">巡检结果</h3>
                  {selectedTask.temperature !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-stone-500">温度</span>
                      <span
                        className={cn(
                          'text-sm font-medium',
                          selectedTask.temperature > 6
                            ? 'text-red-500'
                            : selectedTask.temperature > 4
                            ? 'text-amber-500'
                            : 'text-secondary-600'
                        )}
                      >
                        {selectedTask.temperature}°C
                      </span>
                    </div>
                  )}
                  {selectedTask.cleanliness !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-stone-500">清洁度</span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Sparkles
                            key={s}
                            className={cn(
                              'w-4 h-4',
                              s <= (selectedTask.cleanliness || 0)
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-stone-200'
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedTask.issues && (
                    <div>
                      <span className="text-sm text-stone-500">问题描述</span>
                      <p className="text-sm text-stone-700 mt-1 bg-white rounded-lg p-3">
                        {selectedTask.issues}
                      </p>
                    </div>
                  )}
                  {selectedTask.notes && (
                    <div>
                      <span className="text-sm text-stone-500">备注</span>
                      <p className="text-sm text-stone-700 mt-1 bg-white rounded-lg p-3">
                        {selectedTask.notes}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {selectedTask.notes && selectedTask.status !== 'completed' && (
                <div className="bg-stone-50 rounded-xl p-4">
                  <span className="text-sm text-stone-500">任务备注</span>
                  <p className="text-sm text-stone-700 mt-1">{selectedTask.notes}</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-stone-100 flex gap-3">
              <button
                onClick={() => setShowDetailModal(false)}
                className="flex-1 px-5 py-2.5 rounded-xl border-2 border-stone-200 text-stone-600 text-sm font-medium hover:bg-stone-50 transition-colors"
              >
                关闭
              </button>
              {selectedTask.status === 'pending' && (
                <button
                  onClick={() => handleCancelTask(selectedTask.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border-2 border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  取消任务
                </button>
              )}
              {selectedTask.status === 'in_progress' && (
                <button
                  onClick={handleCompleteTask}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-secondary-500 to-secondary-600 text-white text-sm font-medium shadow-sm hover:shadow-md transition-all disabled:opacity-60"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  标记完成
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
