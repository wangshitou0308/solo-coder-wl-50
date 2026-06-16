import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  value: number
  label: string
  gradient: string
  trend?: 'up' | 'down'
  trendValue?: string
  suffix?: string
}

export default function StatCard({ value, label, gradient, trend, trendValue, suffix = '' }: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    let start = 0
    const duration = 1000
    const startTime = performance.now()

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.floor(eased * value)
      setDisplayValue(current)
      if (progress < 1) requestAnimationFrame(animate)
    }

    requestAnimationFrame(animate)
  }, [value])

  return (
    <div className={cn('rounded-2xl p-6 text-white relative overflow-hidden', gradient)}>
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-x-6 -translate-y-6" />
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-x-4 translate-y-4" />

      <div className="relative">
        <div className="text-3xl font-bold mb-1">
          {displayValue.toLocaleString()}
          {suffix && <span className="text-lg ml-0.5">{suffix}</span>}
        </div>
        <div className="text-sm text-white/80">{label}</div>

        {trend && trendValue && (
          <div className="flex items-center gap-1 mt-2">
            {trend === 'up' ? (
              <TrendingUp className="w-3.5 h-3.5 text-white/90" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-white/90" />
            )}
            <span className="text-xs text-white/80">{trendValue}</span>
          </div>
        )}
      </div>
    </div>
  )
}
