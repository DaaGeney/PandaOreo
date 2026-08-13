import type { RaffleNumber } from '../lib/types'
import { TICKET_PRICE, formatCOP } from '../lib/types'

export default function StatsBar({ numbers }: { numbers: RaffleNumber[] }) {
  const paid = numbers.filter((n) => n.status === 'paid').length
  const reserved = numbers.filter((n) => n.status === 'reserved').length
  const sold = paid + reserved

  const stats = [
    { label: 'Recibido', value: formatCOP(paid * TICKET_PRICE), accent: 'text-green-700' },
    { label: 'Me deben', value: formatCOP(reserved * TICKET_PRICE), accent: 'text-tangerine' },
    { label: 'Total esperado', value: formatCOP(sold * TICKET_PRICE), accent: 'text-plum' },
    { label: 'Vendidos', value: `${sold} / 100`, accent: 'text-plum' },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
      {stats.map((s) => (
        <div key={s.label} className="bg-white rounded-xl border border-plum/15 px-3 py-2.5 shadow-sm">
          <div className="text-xs uppercase tracking-wide text-plum-light font-semibold">{s.label}</div>
          <div className={`text-lg sm:text-xl font-bold ${s.accent}`}>{s.value}</div>
        </div>
      ))}
    </div>
  )
}
