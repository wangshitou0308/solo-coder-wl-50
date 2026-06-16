import { Apple, Soup, Wheat, Package, Cake, Snowflake } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { cn } from '@/lib/utils'

const categories = [
  { name: '全部' as const, icon: null },
  { name: '生鲜果蔬' as const, icon: Apple },
  { name: '熟食' as const, icon: Soup },
  { name: '干货' as const, icon: Wheat },
  { name: '罐头' as const, icon: Package },
  { name: '烘焙' as const, icon: Cake },
  { name: '冷冻食品' as const, icon: Snowflake },
]

export default function CategoryNav() {
  const { activeCategory, setActiveCategory } = useStore()

  return (
    <div className="overflow-x-auto scrollbar-none">
      <div className="flex items-center gap-2 pb-2 min-w-max">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.name
          const Icon = cat.icon
          return (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(cat.name)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all',
                isActive
                  ? 'bg-primary-500 text-white shadow-md shadow-primary-200'
                  : 'bg-white text-stone-500 hover:bg-stone-50 border border-stone-200',
              )}
            >
              {Icon && (
                <Icon className={cn('w-4 h-4', isActive ? 'text-white' : 'text-stone-400')} />
              )}
              {cat.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}
