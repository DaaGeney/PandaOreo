import { useEffect, useRef, useState } from 'react'
import { fetchPublicBoard } from '../lib/store'
import { shareCardPng } from '../lib/exportImage'
import type { GridNumber } from '../components/NumberGrid'
import NumberGrid from '../components/NumberGrid'
import ExportCard from '../components/ExportCard'
import { DRAW_DATE, PRIZE, TICKET_PRICE, formatCOP } from '../lib/types'

const REFRESH_MS = 30_000

export default function PublicBoard() {
  const [numbers, setNumbers] = useState<GridNumber[]>([])
  const [exporting, setExporting] = useState(false)
  const exportRef = useRef<HTMLDivElement>(null)

  const downloadImage = async () => {
    if (!exportRef.current) return
    setExporting(true)
    try {
      await shareCardPng(exportRef.current)
    } finally {
      setExporting(false)
    }
  }

  useEffect(() => {
    const load = () => fetchPublicBoard().then(setNumbers).catch(() => {})
    load()
    const interval = setInterval(load, REFRESH_MS)
    const onVisible = () => document.visibilityState === 'visible' && load()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  const available = numbers.filter((n) => n.status === 'available').length

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-6">
      <div className="text-center mb-5">
        <span className="inline-block bg-plum text-cream text-sm sm:text-base font-bold tracking-[0.25em] rounded-lg px-4 py-1 uppercase mb-2">
          Rifa Solidaria
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-ink tracking-tight">
          OREO Y PANDA 🐾
        </h1>
        <p className="text-plum font-semibold mt-1">
          Premio {formatCOP(PRIZE)} · Número {formatCOP(TICKET_PRICE)}
        </p>
      </div>

      <div className="bg-white rounded-2xl border-2 border-plum/15 p-3 sm:p-5 shadow-sm">
        <NumberGrid numbers={numbers} publicView />
      </div>

      <div className="flex items-center justify-center gap-5 text-sm font-semibold text-plum mt-3">
        <span className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-white border border-plum/30" /> Disponible
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-plum" /> Vendido
        </span>
        {numbers.length > 0 && <span>{available} disponibles</span>}
      </div>

      <button
        type="button"
        onClick={downloadImage}
        disabled={exporting || numbers.length === 0}
        className="block mx-auto mt-5 bg-plum text-cream font-bold rounded-xl px-6 py-3 hover:brightness-110 disabled:opacity-50"
      >
        {exporting ? 'Generando…' : '📲 Compartir imagen de la rifa'}
      </button>

      <p className="text-center text-plum-dark font-bold mt-5">{DRAW_DATE}</p>
      <p className="text-center text-blush font-semibold mt-1">
        Escríbeme para apartar tu número · ¡Gracias por tu apoyo! ♥
      </p>

      {/* Tarjeta off-screen para la exportación PNG */}
      <div className="fixed -left-[3000px] top-0" aria-hidden="true">
        <ExportCard ref={exportRef} numbers={numbers} />
      </div>
    </div>
  )
}
