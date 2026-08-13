import type { RaffleNumber } from '../lib/types'
import { pad2 } from '../lib/types'

export type GridNumber = Pick<RaffleNumber, 'number' | 'status'> &
  Partial<Pick<RaffleNumber, 'buyer_name' | 'buyer_phone' | 'sold_by'>>

interface Props {
  numbers: GridNumber[]
  onSelect?: (n: number) => void
  /** En vista pública, apartado y pagado se muestran igual (vendido). */
  publicView?: boolean
  highlight?: Set<number>
}

export default function NumberGrid({ numbers, onSelect, publicView, highlight }: Props) {
  return (
    <div className="grid grid-cols-10 gap-1.5 sm:gap-2">
      {numbers.map((n) => {
        const sold = n.status !== 'available'
        const cls = publicView
          ? sold
            ? 'bg-plum text-cream border-plum'
            : 'bg-white text-plum border-plum/30'
          : n.status === 'paid'
            ? 'bg-plum text-cream border-plum'
            : n.status === 'reserved'
              ? 'bg-tangerine text-plum-dark border-tangerine'
              : 'bg-white text-plum border-plum/30'
        const dimmed = highlight && highlight.size > 0 && !highlight.has(n.number)
        return (
          <button
            key={n.number}
            type="button"
            onClick={onSelect ? () => onSelect(n.number) : undefined}
            disabled={!onSelect}
            title={
              !publicView && n.buyer_name
                ? n.buyer_name + (n.sold_by ? ` · vende ${n.sold_by}` : '')
                : undefined
            }
            className={`aspect-square rounded-lg border text-sm sm:text-base font-bold flex items-center justify-center transition
              ${cls} ${dimmed ? 'opacity-25' : ''} ${onSelect ? 'cursor-pointer hover:scale-105 hover:shadow-md' : 'cursor-default'}`}
          >
            {pad2(n.number)}
          </button>
        )
      })}
    </div>
  )
}
