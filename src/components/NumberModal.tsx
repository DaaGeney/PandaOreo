import { useState } from 'react'
import type { RaffleNumber } from '../lib/types'
import {
  pad2,
  formatCOP,
  formatThousands,
  TICKET_PRICE,
  whatsappLink,
  paidLink,
} from '../lib/types'
import AutocompleteInput, { type Suggestion } from './AutocompleteInput'
import WhatsAppIcon from './WhatsAppIcon'

interface Props {
  entry: RaffleNumber
  /** `extra` es lo que pagó de más: se registra como aporte junto al número. */
  onSave: (updated: RaffleNumber, extra?: number) => Promise<void>
  onClose: () => void
  buyerOptions: Suggestion[]
  sellerOptions: Suggestion[]
}

export default function NumberModal({
  entry,
  onSave,
  onClose,
  buyerOptions,
  sellerOptions,
}: Props) {
  const [name, setName] = useState(entry.buyer_name ?? '')
  const [phone, setPhone] = useState(entry.buyer_phone ?? '')
  const [soldBy, setSoldBy] = useState(entry.sold_by ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmStatus, setConfirmStatus] = useState<RaffleNumber['status'] | null>(null)
  // Un número ya vendido se abre bloqueado: hay que tocar «Editar» para cambiarlo
  const [editing, setEditing] = useState(entry.status === 'available')

  // Cuánto entregó. Arranca en el precio del número: si se deja así no pasa
  // nada raro, y si pone de más la diferencia se guarda como aporte.
  const [paidDigits, setPaidDigits] = useState(String(TICKET_PRICE))
  const handed = Number(paidDigits || 0)
  const extra = Math.max(0, handed - TICKET_PRICE)
  const missing = Math.max(0, TICKET_PRICE - handed)

  // A quien ya pagó se le agradece; a quien debe se le manda la llave para cobrar
  const whatsapp = entry.buyer_phone
    ? (entry.status === 'paid' ? paidLink : whatsappLink)(
        entry.buyer_phone,
        [entry.number],
        entry.buyer_name ?? ''
      )
    : null

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
      await onSave(
        {
          number: entry.number,
          buyer_name: status === 'available' ? null : name.trim(),
          buyer_phone: status === 'available' ? null : phone.trim() || null,
          sold_by: status === 'available' ? null : soldBy.trim() || null,
          status,
        },
        // El excedente solo cuenta cuando de verdad se está cobrando
        status === 'paid' ? extra : 0
      )
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar. Intenta de nuevo.')
      setSaving(false)
    }
  }

  return (
    <div
      data-modal
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

        {!editing && (
          <>
            <div className="bg-white rounded-xl border border-plum/15 divide-y divide-plum/10 mb-4">
              <Row label="Estado" value={<StatusBadge status={entry.status} />} />
              <Row label="Nombre" value={entry.buyer_name ?? '—'} />
              <Row label="Teléfono" value={entry.buyer_phone ?? '—'} />
              <Row label="Vendido por" value={entry.sold_by ?? '—'} />
            </div>

            {entry.status === 'reserved' && (
              <>
                <PaidAmount
                  label="¿Cuánto pagó?"
                  digits={paidDigits}
                  onChange={setPaidDigits}
                  extra={extra}
                  missing={missing}
                  who={entry.buyer_name ?? ''}
                />
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => save('paid')}
                  className="w-full rounded-lg bg-plum text-cream font-bold py-2.5 mb-2 hover:brightness-110 disabled:opacity-50"
                >
                  {saving ? 'Guardando…' : `💰 Marcar pagado${extra > 0 ? ' + aporte' : ''}`}
                </button>
              </>
            )}

            {whatsapp ? (
              <a
                href={whatsapp}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#25D366] text-white font-bold py-2.5 mb-2 hover:brightness-105"
              >
                <WhatsAppIcon />
                {entry.status === 'paid' ? 'Escribir por WhatsApp' : 'Cobrar por WhatsApp'}
              </a>
            ) : (
              entry.status !== 'available' && (
                <p className="text-xs text-plum-light text-center mb-2">
                  Sin teléfono guardado para escribirle por WhatsApp.
                </p>
              )
            )}

            {error && <p className="text-sm text-red-700 mb-2">{error}</p>}

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="rounded-lg border border-plum/30 text-plum font-semibold py-2.5 hover:bg-white"
              >
                ✏️ Editar
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-plum/30 text-plum font-semibold py-2.5 hover:bg-white"
              >
                Cerrar
              </button>
            </div>
          </>
        )}

        {editing && (
          <>
        <AutocompleteInput
          label="Nombre"
          value={name}
          onChange={setName}
          onPick={(s) => {
            // Solo rellena el teléfono si la sugerencia trae uno:
            // nunca borra lo que ya se escribió
            if (s.hint) setPhone(s.hint)
          }}
          suggestions={buyerOptions}
          placeholder="¿Quién toma este número?"
          autoFocus
        />
        <label className="block mb-3">
          <span className="text-sm font-semibold text-plum">Teléfono (opcional)</span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="300 123 4567"
            inputMode="tel"
            className="mt-1 w-full rounded-lg border border-plum/30 bg-white px-3 py-2 outline-none focus:border-plum"
          />
        </label>
        <div className="mb-1">
          <AutocompleteInput
            label="Vendido por (opcional)"
            value={soldBy}
            onChange={setSoldBy}
            suggestions={sellerOptions}
            placeholder="¿Quién hizo esta venta?"
          />
        </div>

        {error && <p className="text-sm text-red-700 mb-3">{error}</p>}

        {confirmStatus && (
          <p className="text-sm font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">
            ⚠️ Este número ya está <strong>PAGADO</strong>
            {entry.buyer_name ? ` por ${entry.buyer_name}` : ''}. Toca de nuevo{' '}
            «{confirmStatus === 'available' ? 'Liberar' : 'Apartar'}» para confirmar.
          </p>
        )}

        <PaidAmount
          label="¿Cuánto pagó? (al marcar pagado)"
          digits={paidDigits}
          onChange={setPaidDigits}
          extra={extra}
          missing={missing}
          who={name.trim()}
        />

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
          </>
        )}
      </div>
    </div>
  )
}

/**
 * Cuánto entregó la persona. Viene con el precio puesto para que el caso
 * normal sea un solo toque; si entrega de más, la diferencia se avisa aquí
 * y se guarda sola como aporte.
 */
function PaidAmount({
  label,
  digits,
  onChange,
  extra,
  missing,
  who,
}: {
  label: string
  digits: string
  onChange: (v: string) => void
  extra: number
  missing: number
  who: string
}) {
  return (
    <div className="bg-white rounded-xl border border-plum/15 px-3 py-2.5 mb-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-plum">{label}</span>
        <div className="flex items-center rounded-lg border-2 border-plum/25 px-2 focus-within:border-plum">
          <span className="font-black text-plum-light">$</span>
          <input
            value={formatThousands(digits)}
            onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 9))}
            inputMode="numeric"
            aria-label={label}
            className="w-24 bg-transparent px-1 py-1 text-right text-lg font-black text-ink outline-none"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mt-2">
        {[1000, 5000, 10000, 20000].map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(String(Number(digits || 0) + v))}
            className="rounded-full border border-plum/25 px-2.5 py-0.5 text-xs font-bold text-plum hover:bg-blush/15 hover:border-blush"
          >
            +{formatThousands(String(v))}
          </button>
        ))}
        {Number(digits || 0) !== TICKET_PRICE && (
          <button
            type="button"
            onClick={() => onChange(String(TICKET_PRICE))}
            className="rounded-full px-2.5 py-0.5 text-xs font-bold text-plum-light hover:text-plum"
          >
            Exacto
          </button>
        )}
      </div>

      {extra > 0 && (
        <p className="text-xs font-semibold text-blush mt-2">
          ♥ {formatCOP(extra)} de más: se guardan como aporte
          {who ? ` de ${who}` : ''}.
        </p>
      )}
      {missing > 0 && (
        <p className="text-xs font-semibold text-tangerine mt-2">
          Faltan {formatCOP(missing)} para el precio del número. Se marcará pagado igual.
        </p>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-3 py-2.5">
      <span className="text-sm font-semibold text-plum-light">{label}</span>
      <span className="font-bold text-ink text-right">{value}</span>
    </div>
  )
}

function StatusBadge({ status }: { status: RaffleNumber['status'] }) {
  const paid = status === 'paid'
  return (
    <span
      className={`rounded-lg px-2.5 py-1 text-sm font-bold ${
        paid ? 'bg-plum text-cream' : 'bg-tangerine text-plum-dark'
      }`}
    >
      {paid ? 'Pagado' : 'Apartado (debe)'}
    </span>
  )
}
