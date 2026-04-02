'use client'

import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n'
import { Languages } from 'lucide-react'

export function LanguageToggle() {
  const { language, setLanguage } = useI18n()

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
