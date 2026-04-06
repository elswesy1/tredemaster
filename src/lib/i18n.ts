import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Language type
export type Language = 'ar' | 'en'

// Direction type
export type Direction = 'rtl' | 'ltr'

// Translation type
export type Translations = Record<string, any>

// Import translations
import arTranslations from '@/locales/ar.json'
import enTranslations from '@/locales/en.json'

const translations: Record<Language, Translations> = {
  ar: arTranslations,
  en: enTranslations,
}

// Helper function to get nested value
function getNestedValue(obj: Record<string, any>, path: string): string | undefined {
  const result = path.split('.').reduce((acc, part) => acc && acc[part], obj as unknown)
  return typeof result === 'string' ? result : undefined
}

// Helper function to replace params in translation
function replaceParams(text: string, params?: Record<string, string | number>): string {
  if (!params) return text
  return Object.entries(params).reduce(
    (str, [key, value]) => str.replace(new RegExp(`{${key}}`, 'g'), String(value)),
    text
  )
}

// i18n Store
interface I18nStore {
  language: Language
  direction: Direction
  setLanguage: (lang: Language) => void
  t: (key: string, params?: Record<string, string | number>) => string
}

export const useI18n = create<I18nStore>()(
  persist(
    (set, get) => ({
      language: 'ar',
      direction: 'rtl',
      
      setLanguage: (lang: Language) => {
        const direction = lang === 'ar' ? 'rtl' : 'ltr'
        set({ language: lang, direction })
        
        // Update document direction and lang
        if (typeof document !== 'undefined') {
          document.documentElement.dir = direction
          document.documentElement.lang = lang
        }
      },
      
      t: (key: string, params?: Record<string, string | number>) => {
        const { language } = get()
        const translation = getNestedValue(translations[language], key)
        
        if (!translation) {
          // Fallback to the other language
          const fallbackLang = language === 'ar' ? 'en' : 'ar'
          const fallback = getNestedValue(translations[fallbackLang], key)
          return fallback ? replaceParams(fallback, params) : key
        }
        
        return replaceParams(translation, params)
      },
    }),
    {
      name: 'i18n-storage',
      partialize: (state) => ({
        language: state.language,
        direction: state.direction,
      }),
    }
  )
)

// Export translations for direct access
export { translations }
