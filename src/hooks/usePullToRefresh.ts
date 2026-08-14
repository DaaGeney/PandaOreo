import { useEffect, useRef, useState } from 'react'

const THRESHOLD = 70

/**
 * Gesto de "deslizar hacia abajo para recargar", como apps nativas.
 * Necesario porque en modo PWA (standalone) el pull-to-refresh del
 * navegador no está disponible.
 */
export function usePullToRefresh(onRefresh: () => Promise<void> | void) {
  const [pulling, setPulling] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const startY = useRef<number | null>(null)

  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) startY.current = e.touches[0].clientY
    }
    const onTouchMove = (e: TouchEvent) => {
      if (startY.current === null) return
      const delta = e.touches[0].clientY - startY.current
      if (delta > 10 && window.scrollY === 0) setPulling(delta > THRESHOLD)
    }
    const onTouchEnd = async () => {
      if (pulling && !refreshing) {
        setRefreshing(true)
        await onRefresh()
        setRefreshing(false)
      }
      setPulling(false)
      startY.current = null
    }
    document.addEventListener('touchstart', onTouchStart, { passive: true })
    document.addEventListener('touchmove', onTouchMove, { passive: true })
    document.addEventListener('touchend', onTouchEnd)
    return () => {
      document.removeEventListener('touchstart', onTouchStart)
      document.removeEventListener('touchmove', onTouchMove)
      document.removeEventListener('touchend', onTouchEnd)
    }
  }, [pulling, refreshing, onRefresh])

  return { pulling, refreshing }
}
