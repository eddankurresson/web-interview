import { useEffect } from 'react'

export const useUnsavedChangesWarning = (hasUnsavedChanges) => {
  useEffect(() => {
    if (!hasUnsavedChanges) return
    const warnBeforeLeaving = (event) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', warnBeforeLeaving)
    return () => window.removeEventListener('beforeunload', warnBeforeLeaving)
  }, [hasUnsavedChanges])
}
