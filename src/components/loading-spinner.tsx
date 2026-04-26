'use client'

import { Loader2 } from 'lucide-react'

interface Props {
  message?: string
  fullScreen?: boolean
}

export function LoadingSpinner({ message, fullScreen = false }: Props) {
  if (fullScreen) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        {message && (
          <p className="text-sm text-muted-foreground">{message}</p>
        )}
      </div>
    )
  }
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" />
      {message && <span className="text-sm">{message}</span>}
    </div>
  )
}
