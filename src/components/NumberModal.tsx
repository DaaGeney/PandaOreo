import { useState } from 'react'
import type { RaffleNumber } from '../lib/types'
import { pad2, formatCOP, TICKET_PRICE } from '../lib/types'

interface Props {
  entry: RaffleNumber
  onSave: (updated: RaffleNumber) => Promise<void>
  onClose: () => void
}

export default function NumberModal({ entry, onSave, onClose }: Props) {
  const [name, setName] = useState(entry.buyer_name ?? '')
  const [phone, setPhone] = useState(entry.buyer_phone ?? '')
  const [soldBy, setSoldBy] = useState(entry.sold_by ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmStatus, setConfirmStatus] = useState<RaffleNumber['status'] | null>(null)

  const save = async (status: RaffleNumber['status']) => {
    if (status !== 'available' && !name.trim()) {
      setError('Escribe el nombre de quien toma el número.')
      return
    }
    // Un número PAGADO no se degrada sin doble confirmación
    if (entry.status === 'paid' && status !== 'paid' && confirmStatus !== status) {
      setConfirmStatus(status)
      setError(null)
      return
    }
    setSaving(true)
    setError(null)
    try {
      await onSave({
        number: entry.number,
        buyer_name: status === 'available' ? null : name.trim(),
        buyer_phone: status === 'available' ? null : phone.trim() || null,
        sold_by: status === 'available' ? null : soldBy.trim() || null,
        status,
      })
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar. Intenta de nuevo.')
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-ink/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-cream rounded-2xl shadow-xl w-full max-w-sm p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-plum">
            Número <span className="bg-plum text-cream rounded-lg px-2 py-0.5">{pad2(entry.number)}</span>
          </h2>
          <span className="text-sm text-plum-light font-semibold">{formatCOP(TICKET_PRICE)}</span>
        </div>

        <label className="block mb-3">
          <span className="text-sm font-semibold text-plum">Nombre</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="¿Quién toma este número?"
            className="mt-1 w-full rounded-lg border border-plum/30 bg-white px-3 py-2 outline-none focus:border-plum"
            autoFocus
          />
        </label>
        <label className="block mb-3">
          <span className="text-sm font-semibold text-plum">Teléfono (opcional)</span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="300 123 4567"
            className="mt-1 w-full rounded-lg border border-plum/30 bg-white px-3 py-2 outline-none focus:border-plum"
          />
        </label>
        <label className="block mb-4">
          <span className="text-sm font-semibold text-plum">Vendido por (opcional)</span>
          <input
            value={soldBy}
            onChange={(e) => setSoldBy(e.target.value)}
            placeholder="¿Quién hizo esta venta?"
            className="mt-1 w-full rounded-lg border border-plum/30 bg-white px-3 py-2 outline-none focus:border-plum"
          />
        </label>

        {error && <p className="text-sm text-red-700 mb-3">{error}</p>}

        {confirmStatus && (
          <p className="text-sm font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">
            ⚠️ Este número ya está <strong>PAGADO</strong>
            {entry.buyer_name ? ` por ${entry.buyer_name}` : ''}. Toca de nuevo{' '}
            «{confirmStatus === 'available' ? 'Liberar' : 'Apartar'}» para confirmar.
          </p>
        )}

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={saving}
            onClick={() => save('reserved')}
            className="rounded-lg bg-tangerine text-plum-dark font-bold py-2.5 hover:brightness-105 disabled:opacity-50"
          >
            Apartar
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => save('paid')}
            className="rounded-lg bg-plum text-cream font-bold py-2.5 hover:brightness-110 disabled:opacity-50"
          >
            Marcar pagado
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <button
            type="button"
            disabled={saving || entry.status === 'available'}
            onClick={() => save('available')}
            className="rounded-lg border border-plum/30 text-plum font-semibold py-2 hover:bg-white disabled:opacity-40"
          >
            Liberar
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-plum/30 text-plum font-semibold py-2 hover:bg-white"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
