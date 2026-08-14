export const THEME_KEY = 'chemical_shop_theme'

export function getStoredTheme() {
  try {
    return localStorage.getItem(THEME_KEY) || 'system'
  } catch (e) {
    return 'system'
  }
}

export function setStoredTheme(themeChoice) {
  try {
    localStorage.setItem(THEME_KEY, themeChoice)
  } catch (e) {
    console.error('Failed to save theme setting:', e)
  }
  applyTheme(themeChoice)
}

export function getEffectiveTheme(themeChoice = getStoredTheme()) {
  if (themeChoice === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return themeChoice
}

export function applyTheme(themeChoice = getStoredTheme()) {
  const effectiveTheme = getEffectiveTheme(themeChoice)
  document.documentElement.setAttribute('data-theme', effectiveTheme)
  return effectiveTheme
}

export function initThemeListener(onThemeChange) {
  // 1. Initial application
  const effective = applyTheme()
  if (onThemeChange) onThemeChange(effective)

  // 2. Listen to OS system preference changes
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  const handleSystemThemeChange = () => {
    const currentStored = getStoredTheme()
    if (currentStored === 'system') {
      const updatedEffective = applyTheme('system')
      if (onThemeChange) onThemeChange(updatedEffective)
    }
  }

  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handleSystemThemeChange)
  } else {
    mediaQuery.addListener(handleSystemThemeChange)
  }

  // 3. Return cleanup / unsubscribe function to prevent listener accumulation
  return () => {
    if (mediaQuery.removeEventListener) {
      mediaQuery.removeEventListener('change', handleSystemThemeChange)
    } else {
      mediaQuery.removeListener(handleSystemThemeChange)
    }
  }
}
