import { useMemo, useState } from 'react'
import type { RaffleNumber } from '../lib/types'
import { pad2, formatCOP, normalize, reminderLink, TICKET_PRICE } from '../lib/types'
import WhatsAppIcon from './WhatsAppIcon'

interface Props {
  numbers: RaffleNumber[]
  onSelect: (n: number) => void
}

interface Debtor {
  key: string
  name: string
  phone: string | null
  numbers: number[]
}

/**
 * Quién debe y cuánto, agrupado por persona para poder cobrarle todo de una.
 * Antes había que abrir número por número; quien tiene tres apartados recibía
 * tres mensajes, que es justo lo que molesta.
 */
function debtors(numbers: RaffleNumber[]): Debtor[] {
  const map = new Map<string, Debtor>()
  for (const n of numbers) {
    if (n.status !== 'reserved' || !n.buyer_name?.trim()) continue
    const key = normalize(n.buyer_name)
    let found = map.get(key)
    if (!found)
      map.set(
        key,
        (found = { key, name: n.buyer_name.trim(), phone: null, numbers: [] })
      )
    found.numbers.push(n.number)
    if (!found.phone && n.buyer_phone?.trim()) found.phone = n.buyer_phone.trim()
  }
  return [...map.values()]
    .map((d) => ({ ...d, numbers: d.numbers.sort((a, b) => a - b) }))
    .sort(
      (a, b) => b.numbers.length - a.numbers.length || a.name.localeCompare(b.name, 'es')
    )
}

export default function DebtorsPanel({ numbers, onSelect }: Props) {
  const list = useMemo(() => debtors(numbers), [numbers])
  const [open, setOpen] = useState(true)

  const pendientes = list.reduce((total, d) => total + d.numbers.length, 0)
  const porCobrar = pendientes * TICKET_PRICE

  return (
    <div className="bg-white rounded-xl border border-plum/15 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-tangerine text-plum-dark font-bold text-sm"
      >
        <span>💬 Cobrar apartados ({list.length})</span>
        <span className="font-black">{open ? '▾' : '▸'}</span>
      </button>

      {open && (
        <>
          {list.length === 0 ? (
            <p className="px-3 py-4 text-sm text-plum-light">
              Nadie debe nada. Todo está pago ♥
            </p>
          ) : (
            <>
              <div className="max-h-[50vh] overflow-y-auto divide-y divide-plum/10">
                {list.map((d) => (
                  <div key={d.key} className="px-3 py-2.5">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="min-w-0 truncate font-semibold text-ink text-sm">
                        {d.name}
                      </span>
                      <span className="shrink-0 text-xs font-bold text-plum-light">
                        {formatCOP(d.numbers.length * TICKET_PRICE)}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {d.numbers.map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => onSelect(n)}
                          title="Abrir este número"
                          className="rounded-md bg-tangerine/25 text-plum-dark border border-tangerine/60 px-1.5 py-0.5 text-xs font-bold hover:bg-tangerine/45"
                        >
                          {pad2(n)}
                        </button>
                      ))}
                    </div>

                    {d.phone ? (
                      <a
                        href={reminderLink(d.phone, d.numbers, d.name)}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 w-full flex items-center justify-center gap-2 rounded-lg bg-[#25D366] text-white font-bold text-sm py-1.5 hover:brightness-105"
                      >
                        <WhatsAppIcon />
                        Recordarle
                      </a>
                    ) : (
                      <p className="mt-2 text-xs text-plum-light">Sin teléfono guardado.</p>
                    )}
                  </div>
                ))}
              </div>

              <p className="px-3 py-2 bg-cream text-xs font-bold text-plum border-t border-plum/10">
                {pendientes} número{pendientes === 1 ? '' : 's'} por cobrar ·{' '}
                {formatCOP(porCobrar)}
              </p>
            </>
          )}
        </>
      )}
    </div>
  )
}
