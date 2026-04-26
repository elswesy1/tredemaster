'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n'
import { Languages } from 'lucide-react'

export function LanguageToggle() {
  const { language, setLanguage } = useI18n()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent hydration mismatch by not rendering anything until mounted
  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="opacity-0">
        <Languages className="h-5 w-5" />
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
    >
      <Languages className="h-5 w-5" />
      <span className="sr-only">Toggle language</span>
    </Button>
  )
}
