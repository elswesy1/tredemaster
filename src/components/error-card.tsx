'use client'

import { CheckCircle } from 'lucide-react'

interface Props {
  message: string
  description?: string
  action?: { label: string; onClick: () => void }
}

export function SuccessToast({ message, description, action }: Props) {
  return (
    <div className="flex items-start gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg max-w-sm">
      <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium text-green-400">{message}</p>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {action && (
          <button
            onClick={action.onClick}
            className="text-xs text-cyan-400 hover:text-cyan-300 underline"
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  )
}
