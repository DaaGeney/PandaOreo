import { useState } from 'react'
import { readableError } from '../lib/types'

interface Props {
  closed: boolean
  onChange: (closed: boolean) => Promise<void>
}

/**
 * Interruptor para dejar de recibir números. La rifa juega el viernes a las
 * 11 p.m., pero el momento de cerrar lo decide el admin, no un reloj: por eso
 * es un botón y no una fecha automática.
 *
 * Cerrar pide confirmación (lo ve todo el mundo en el tablero público);
 * volver a abrir es de un toque, porque es deshacer.
 */
export default function SalesLock({ closed, onChange }: Props) {
  const [saving, setSaving] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const apply = async (next: boolean) => {
    if (next && !confirming) {
      setConfirming(true)
      return
    }
    setSaving(true)
    setError(null)
    try {
      await onChange(next)
      setConfirming(false)
    } catch (e) {
      setError(readableError(e, 'No se pudo cambiar el estado de las ventas.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className={`rounded-xl border px-3 py-2.5 ${
        closed ? 'bg-plum/10 border-plum/30' : 'bg-white border-plum/15'
      }`}
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs uppercase tracking-wide font-bold text-plum-light">
          Ventas
        </span>
        <span className={`text-sm font-black ${closed ? 'text-plum' : 'text-green-700'}`}>
          {closed ? '🔒 Cerradas' : '🟢 Abiertas'}
        </span>
      </div>

      <p className="text-xs text-plum-light mt-1">
        {closed
          ? 'En el tablero público nadie puede apartar números.'
          : 'Cualquiera puede apartar números desde el tablero público.'}
      </p>

      {confirming && !closed && (
        <p className="text-xs font-semibold text-plum-dark bg-tangerine/25 border border-tangerine/60 rounded-lg px-2 py-1.5 mt-2">
          Al cerrar, nadie más podrá apartar. Toca de nuevo para confirmar.
        </p>
      )}

      {error && <p className="text-xs text-red-700 mt-2">{error}</p>}

      <button
        type="button"
        disabled={saving}
        onClick={() => apply(!closed)}
        className={`mt-2 w-full rounded-lg font-bold py-2 text-sm disabled:opacity-50 ${
          closed
            ? 'bg-plum text-cream hover:brightness-110'
            : 'border-2 border-plum text-plum hover:bg-cream'
        }`}
      >
        {saving
          ? 'Guardando…'
          : closed
            ? '🔓 Reabrir las ventas'
            : confirming
              ? 'Sí, cerrar las ventas'
              : '🔒 Cerrar las ventas'}
      </button>
    </div>
  )
}
