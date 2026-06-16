import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell,
  Thermometer,
  Clock,
  Package,
  ArrowLeft,
  Edit2,
  Save,
  X,
  CheckCircle,
  XCircle,
  Search,
  Settings,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react'
import { useStore, type AlertRule } from '@/store/useStore'
import { cn } from '@/lib/utils'

const ruleTypeConfig: Record<
  AlertRule['type'],
  {
    icon: typeof Thermometer
    label: string
    unit: string
    color: string
    bgColor: string
    borderColor: string
    description: string
  }
> = {
  temperature: {
    icon: Thermometer,
    label: '温度告警',
    unit: '℃',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    description: '监控冰箱温度，超出阈值时告警',
  },
  expiry: {
    icon: Clock,
    label: '临期提醒',
    unit: '天',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    description: '食物即将过期时提前提醒',
  },
  capacity: {
    icon: Package,
    label: '满载预警',
    unit: '%',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    description: '冰箱库存容量达到阈值时预警',
  },
}

const operatorConfig: Record<AlertRule['operator'], { label: string; symbol: string }> = {
  gt: { label: '大于', symbol: '>' },
  lt: { label: '小于', symbol: '<' },
  gte: { label: '大于等于', symbol: '≥' },
  lte: { label: '小于等于', symbol: '≤' },
  eq: { label: '等于', symbol: '=' },
}

const notificationChannelOptions = [
  { value: 'app', label: 'APP推送' },
  { value: 'sms', label: '短信通知' },
  { value: 'email', label: '邮件通知' },
  { value: 'wechat', label: '微信通知' },
]

const defaultRules: AlertRule[] = [
  {
    id: 'rule-temp-high',
    name: '高温告警',
    type: 'temperature',
    enabled: true,
    threshold: 8,
    operator: 'gt',
    notificationChannels: ['app', 'sms'],
    createdAt: '2026-01-01',
    updatedAt: '2026-06-15',
  },
  {
    id: 'rule-temp-low',
    name: '低温告警',
    type: 'temperature',
    enabled: false,
    threshold: 0,
    operator: 'lt',
    notificationChannels: ['app'],
    createdAt: '2026-01-01',
    updatedAt: '2026-06-10',
  },
  {
    id: 'rule-expiry-3',
    name: '临期3天提醒',
    type: 'expiry',
    enabled: true,
    threshold: 3,
    operator: 'lte',
    notificationChannels: ['app', 'wechat'],
    createdAt: '2026-01-01',
    updatedAt: '2026-06-12',
  },
  {
    id: 'rule-expiry-7',
    name: '临期7天提醒',
    type: 'expiry',
    enabled: true,
    threshold: 7,
    operator: 'lte',
    notificationChannels: ['app'],
    createdAt: '2026-01-01',
    updatedAt: '2026-06-12',
  },
  {
    id: 'rule-capacity-80',
    name: '满载80%预警',
    type: 'capacity',
    enabled: true,
    threshold: 80,
    operator: 'gte',
    notificationChannels: ['app', 'sms', 'email'],
    createdAt: '2026-01-01',
    updatedAt: '2026-06-14',
  },
  {
    id: 'rule-capacity-95',
    name: '满载95%预警',
    type: 'capacity',
    enabled: false,
    threshold: 95,
    operator: 'gte',
    notificationChannels: ['app', 'sms', 'wechat'],
    createdAt: '2026-01-01',
    updatedAt: '2026-06-08',
  },
]

type FilterType = 'all' | AlertRule['type']

const filterTabs: { key: FilterType; label: string }[] = [
  { key: 'all', label: '全部规则' },
  { key: 'temperature', label: '温度告警' },
  { key: 'expiry', label: '临期提醒' },
  { key: 'capacity', label: '满载预警' },
]

export default function AlertRules() {
  const navigate = useNavigate()
  const { alertRules, fetchAlertRules, updateAlertRule } = useStore()
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null)
  const [editForm, setEditForm] = useState<Partial<AlertRule>>({})
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    const loadData = async () => {
      await fetchAlertRules()
    }
    loadData()
  }, [fetchAlertRules])

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(t)
    }
  }, [toast])

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
  }

  const displayRules = useMemo(() => {
    let rules = alertRules.length > 0 ? alertRules : defaultRules
    if (activeFilter !== 'all') {
      rules = rules.filter((r) => r.type === activeFilter)
    }
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase()
      rules = rules.filter(
        (r) =>
          r.name.toLowerCase().includes(keyword) ||
          ruleTypeConfig[r.type].label.toLowerCase().includes(keyword)
      )
    }
    return rules.sort((a, b) => {
      if (a.enabled !== b.enabled) return a.enabled ? -1 : 1
      return b.updatedAt.localeCompare(a.updatedAt)
    })
  }, [alertRules, activeFilter, searchKeyword])

  const stats = useMemo(() => {
    const rules = alertRules.length > 0 ? alertRules : defaultRules
    return {
      total: rules.length,
      enabled: rules.filter((r) => r.enabled).length,
      temperature: rules.filter((r) => r.type === 'temperature').length,
      expiry: rules.filter((r) => r.type === 'expiry').length,
      capacity: rules.filter((r) => r.type === 'capacity').length,
    }
  }, [alertRules])

  const handleToggle = async (rule: AlertRule) => {
    const newEnabled = !rule.enabled
    const success = await updateAlertRule(rule.id, { enabled: newEnabled })
    showToast(
      success
        ? `已${newEnabled ? '启用' : '禁用'}规则「${rule.name}」`
        : '操作失败',
      success ? 'success' : 'error'
    )
  }

  const handleEdit = (rule: AlertRule) => {
    setEditingRule(rule)
    setEditForm({
      threshold: rule.threshold,
      operator: rule.operator,
      notificationChannels: [...rule.notificationChannels],
    })
  }

  const handleSave = async () => {
    if (!editingRule || !editForm.threshold || !editForm.operator || !editForm.notificationChannels) {
      showToast('请填写完整信息', 'error')
      return
    }
    setSaving(true)
    const success = await updateAlertRule(editingRule.id, {
      threshold: editForm.threshold,
      operator: editForm.operator,
      notificationChannels: editForm.notificationChannels,
    })
    setSaving(false)
    if (success) {
      showToast('规则已更新')
      setEditingRule(null)
    } else {
      showToast('保存失败', 'error')
    }
  }

  const toggleChannel = (channel: string) => {
    const current = editForm.notificationChannels || []
    const next = current.includes(channel)
      ? current.filter((c) => c !== channel)
      : [...current, channel]
    setEditForm({ ...editForm, notificationChannels: next })
  }

  const getRuleIcon = (type: AlertRule['type']) => ruleTypeConfig[type].icon

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative">
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
            <CheckCircle className="w-5 h-5 text-secondary-500" />
          ) : (
            <XCircle className="w-5 h-5 text-red-500" />
          )}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-stone-500 hover:text-stone-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">返回</span>
        </button>
        <h1 className="text-xl font-bold text-stone-800 flex items-center gap-2">
          <Bell className="w-6 h-6 text-primary-500" />
          告警规则配置
        </h1>
        <div className="w-20" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {[
          { label: '规则总数', value: stats.total, color: 'from-stone-400 to-stone-500', icon: Settings },
          { label: '已启用', value: stats.enabled, color: 'from-secondary-400 to-secondary-500', icon: CheckCircle },
          { label: '温度告警', value: stats.temperature, color: 'from-red-400 to-red-500', icon: Thermometer },
          { label: '临期提醒', value: stats.expiry, color: 'from-amber-400 to-amber-500', icon: Clock },
          { label: '满载预警', value: stats.capacity, color: 'from-blue-400 to-blue-500', icon: Package },
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

      <div className="bg-white rounded-2xl shadow-sm border border-stone-200/60 mb-6">
        <div className="p-4 border-b border-stone-100">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="搜索规则名称..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-stone-50 rounded-xl p-1 m-4 overflow-x-auto">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex-1 sm:flex-none justify-center',
                activeFilter === tab.key
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-stone-500 hover:text-stone-700'
              )}
            >
              {tab.key !== 'all' && (
                <>{(() => {
                  const Icon = getRuleIcon(tab.key as AlertRule['type'])
                  return <Icon className="w-4 h-4" />
                })()}</>
              )}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {displayRules.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-stone-200/60">
            <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-stone-300" />
            </div>
            <p className="text-lg font-medium text-stone-600">暂无匹配的规则</p>
            <p className="text-sm text-stone-400 mt-1">尝试调整筛选条件或搜索关键词</p>
          </div>
        ) : (
          displayRules.map((rule, index) => {
            const config = ruleTypeConfig[rule.type]
            const operator = operatorConfig[rule.operator]
            const Icon = config.icon
            return (
              <div
                key={rule.id}
                className={cn(
                  'bg-white rounded-2xl border p-5 sm:p-6 transition-all hover:shadow-md',
                  rule.enabled ? 'border-stone-200/60' : 'border-stone-200/40 opacity-70'
                )}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start justify-between gap-4 flex-col sm:flex-row">
                  <div className="flex items-start gap-4 flex-1 w-full">
                    <div
                      className={cn(
                        'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
                        config.bgColor
                      )}
                    >
                      <Icon className={cn('w-6 h-6', config.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-stone-800 text-lg">{rule.name}</h3>
                        <span
                          className={cn(
                            'text-xs font-medium px-2.5 py-0.5 rounded-full',
                            config.bgColor,
                            config.color
                          )}
                        >
                          {config.label}
                        </span>
                        {rule.enabled ? (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-secondary-50 text-secondary-600 font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-secondary-500 animate-pulse" />
                            已启用
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-500 font-medium">
                            已禁用
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-stone-400 mb-3">{config.description}</p>
                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-2 bg-stone-50 rounded-lg px-3 py-2">
                          <span className="text-xs text-stone-500">阈值条件</span>
                          <span className="font-mono font-bold text-stone-700">
                            {operator.symbol} {rule.threshold} {config.unit}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-stone-500">通知渠道：</span>
                          <div className="flex items-center gap-1 flex-wrap">
                            {rule.notificationChannels.length > 0 ? (
                              rule.notificationChannels.map((ch) => {
                                const opt = notificationChannelOptions.find((o) => o.value === ch)
                                return opt ? (
                                  <span
                                    key={ch}
                                    className="text-xs px-2 py-0.5 rounded-full bg-primary-50 text-primary-600 font-medium"
                                  >
                                    {opt.label}
                                  </span>
                                ) : null
                              })
                            ) : (
                              <span className="text-xs text-stone-400">未设置</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-stone-400 mt-3">
                        最后更新：{rule.updatedAt}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:flex-col sm:items-stretch w-full sm:w-auto">
                    <button
                      onClick={() => handleToggle(rule)}
                      className={cn(
                        'flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all',
                        rule.enabled
                          ? 'border-secondary-200 text-secondary-600 hover:bg-secondary-50'
                          : 'border-stone-200 text-stone-500 hover:bg-stone-50'
                      )}
                    >
                      {rule.enabled ? (
                        <>
                          <ToggleRight className="w-5 h-5" />
                          <span className="text-sm font-medium">禁用</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-5 h-5" />
                          <span className="text-sm font-medium">启用</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleEdit(rule)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-medium shadow-sm hover:shadow-md transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                      编辑规则
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {editingRule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up">
            <div className="p-6 border-b border-stone-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center',
                      ruleTypeConfig[editingRule.type].bgColor
                    )}
                  >
                    {(() => {
                      const Icon = ruleTypeConfig[editingRule.type].icon
                      return <Icon className={cn('w-5 h-5', ruleTypeConfig[editingRule.type].color)} />
                    })()}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-stone-800">编辑规则</h2>
                    <p className="text-sm text-stone-500">{editingRule.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingRule(null)}
                  className="p-2 rounded-lg hover:bg-stone-100 transition-colors"
                >
                  <X className="w-5 h-5 text-stone-400" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  阈值 ({ruleTypeConfig[editingRule.type].unit})
                </label>
                <input
                  type="number"
                  value={editForm.threshold ?? ''}
                  onChange={(e) => setEditForm({ ...editForm, threshold: Number(e.target.value) })}
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 text-lg font-mono"
                  min={editingRule.type === 'temperature' ? -20 : 0}
                  max={editingRule.type === 'capacity' ? 100 : 365}
                />
                <p className="text-xs text-stone-400 mt-2">
                  {ruleTypeConfig[editingRule.type].description}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  运算符
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {(Object.keys(operatorConfig) as AlertRule['operator'][]).map((op) => {
                    const cfg = operatorConfig[op]
                    return (
                      <button
                        key={op}
                        type="button"
                        onClick={() => setEditForm({ ...editForm, operator: op })}
                        className={cn(
                          'py-2.5 rounded-xl border-2 transition-all flex flex-col items-center gap-0.5',
                          editForm.operator === op
                            ? 'border-primary-400 bg-primary-50 text-primary-700'
                            : 'border-stone-200 text-stone-600 hover:border-stone-300'
                        )}
                      >
                        <span className="font-mono font-bold text-lg">{cfg.symbol}</span>
                        <span className="text-xs">{cfg.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  通知渠道
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {notificationChannelOptions.map((opt) => {
                    const selected = editForm.notificationChannels?.includes(opt.value)
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => toggleChannel(opt.value)}
                        className={cn(
                          'py-3 px-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2',
                          selected
                            ? 'border-primary-400 bg-primary-50 text-primary-700'
                            : 'border-stone-200 text-stone-600 hover:border-stone-300'
                        )}
                      >
                        {selected && <CheckCircle className="w-4 h-4" />}
                        <span className="text-sm font-medium">{opt.label}</span>
                      </button>
                    )
                  })}
                </div>
                <p className="text-xs text-stone-400 mt-2">
                  选择触发告警时的通知方式，可多选
                </p>
              </div>

              <div className="bg-stone-50 rounded-xl p-4">
                <p className="text-sm text-stone-500 mb-2">规则预览</p>
                <p className="text-lg font-bold text-stone-800">
                  当{ruleTypeConfig[editingRule.type].label}值 {operatorConfig[editForm.operator || editingRule.operator].symbol}{' '}
                  <span className="text-primary-600">{editForm.threshold ?? editingRule.threshold}</span>{' '}
                  {ruleTypeConfig[editingRule.type].unit}时，
                  通过{' '}
                  <span className="text-secondary-600">
                    {(editForm.notificationChannels || editingRule.notificationChannels)
                      .map((ch) => notificationChannelOptions.find((o) => o.value === ch)?.label)
                      .join('、') || '无'}
                  </span>{' '}
                  发送通知
                </p>
              </div>
            </div>

            <div className="p-6 bg-stone-50 border-t border-stone-100 flex items-center gap-3">
              <button
                onClick={() => setEditingRule(null)}
                className="flex-1 py-3 rounded-xl border-2 border-stone-200 text-stone-600 text-sm font-medium hover:bg-stone-100 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-secondary-500 to-secondary-600 text-white text-sm font-medium shadow-sm hover:shadow-md transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                保存修改
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
