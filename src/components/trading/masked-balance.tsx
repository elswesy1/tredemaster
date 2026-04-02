'use client'

import { useTradingStore } from '@/lib/store'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface MaskedBalanceProps {
  value: number | string
  currency?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showToggle?: boolean
}

// تنسيق الأرقام
function formatNumber(value: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

// تعتيم الرقم
function maskValue(value: number | string): string {
  const str = String(value)
  // استبدال الأرقام بعلامات **
  const masked = str.replace(/[0-9]/g, '*')

  // الحفاظ على التنسيق
  if (str.includes('$') || str.includes('€') || str.includes('£')) {
    return masked
  }
  return masked
}

export function MaskedBalance({
  value,
  currency = 'USD',
  className,
  size = 'md',
  showToggle = true,
}: MaskedBalanceProps) {
  const { hideBalance, toggleHideBalance } = useTradingStore()

  const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value
  const displayValue = formatNumber(numValue, currency)
  const maskedValue = maskValue(displayValue)

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg font-semibold',
    lg: 'text-2xl font-bold',
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className={cn(sizeClasses[size], 'transition-all duration-300')}>
        {hideBalance ? maskedValue : displayValue}
      </span>
      {showToggle && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={toggleHideBalance}
          title={hideBalance ? 'إظهار الرصيد' : 'إخفاء الرصيد'}
        >
          {hideBalance ? (
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Eye className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      )}
    </div>
  )
}

// مكون مبسط للأرقام فقط (بدون زر)
export function MaskedNumber({
  value,
  prefix = '',
  suffix = '',
  className,
}: {
  value: number | string
  prefix?: string
  suffix?: string
  className?: string
}) {
  const { hideBalance } = useTradingStore()

  const strValue = typeof value === 'string' ? value : String(value)
  const displayValue = `${prefix}${strValue}${suffix}`

  if (hideBalance) {
    return (
      <span className={cn('font-mono', className)}>
        {prefix}{strValue.replace(/[0-9]/g, '*')}{suffix}
      </span>
    )
  }

  return (
    <span className={cn('font-mono', className)}>
      {displayValue}
    </span>
  )
}
