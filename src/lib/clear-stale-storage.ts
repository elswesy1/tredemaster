/**
 * Storage Migration Script
 * Clears stale localStorage data that might cause hydration and rendering errors
 */

const CURRENT_VERSION = '1.0';

export function clearStaleStorage() {
  if (typeof window === 'undefined') return;

  try {
    console.log('[Storage Migration] Checking localStorage...');
    
    // Check trademaster_user
    const user = localStorage.getItem('trademaster_user');
    if (user) {
      const parsed = JSON.parse(user);
      
      // Check if version exists and matches
      if (!parsed.version || parsed.version !== CURRENT_VERSION) {
        console.log('[Storage Migration] Old user data found, clearing...');
        localStorage.removeItem('trademaster_user');
        localStorage.removeItem('trading-platform-storage');
        localStorage.removeItem('i18n-storage');
        localStorage.removeItem('trademaster-settings');
        
        // Clear all trademaster-related keys
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith('trademaster') || key.startsWith('trading'))) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        console.log('[Storage Migration] Storage cleared, reloading page...');
        window.location.reload();
        return;
      }
      
      console.log('[Storage Migration] User data is valid, version:', parsed.version);
    }
    
    // Check for corrupted data
    const tradingStorage = localStorage.getItem('trading-platform-storage');
    if (tradingStorage) {
      try {
        const parsed = JSON.parse(tradingStorage);
        // Verify structure
        if (typeof parsed !== 'object' || parsed === null) {
          throw new Error('Invalid structure');
        }
      } catch {
        console.log('[Storage Migration] Corrupted trading storage, clearing...');
        localStorage.removeItem('trading-platform-storage');
      }
    }
    
    console.log('[Storage Migration] Check complete');
    
  } catch (error) {
    console.error('[Storage Migration] Error:', error);
    
    // Clear all on error
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('trademaster') || key.startsWith('trading') || key.startsWith('i18n'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    window.location.reload();
  }
}

/**
 * Set current version on user data
 */
export function setStorageVersion(userId: string) {
  if (typeof window === 'undefined') return;
  
  const user = localStorage.getItem('trademaster_user');
  if (user) {
    const parsed = JSON.parse(user);
    parsed.version = CURRENT_VERSION;
    parsed.migratedAt = new Date().toISOString();
    localStorage.setItem('trademaster_user', JSON.stringify(parsed));
  }
}

/**
 * Safe localStorage get with fallback
 */
export function safeGetStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    
    const parsed = JSON.parse(item);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}
