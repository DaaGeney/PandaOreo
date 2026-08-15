import { useState } from 'react'
import type { Donation } from '../lib/types'
import {
  pad2,
  formatCOP,
  formatDate,
  normalize,
  thanksLink,
  DONATION_LABEL,
  sumDonations,
} from '../lib/types'

interface Props {
  donations: Donation[]
  onAdd: () => void
  onEdit: (donation: Donation) => void
}

/** Cuántos aportes se ven antes de tener que desplegar la lista. */
const PREVIEW = 4

/**
 * Plata que entra por fuera de los números: donaciones de quien no quiere
 * boleta y lo que la gente paga de más. Se suma al total recibido.
 */
export default function DonationsPanel({ donations, onAdd, onEdit }: Props) {
  const [expanded, setExpanded] = useState(false)

  const total = sumDonations(donations)
  const people = new Set(donations.map((d) => normalize(d.name))).size
  const visible = expanded ? donations : donations.slice(0, PREVIEW)

  return (
    <section className="rounded-2xl border border-blush/40 bg-white overflow-hidden shadow-sm">
      <header className="flex items-center gap-3 px-3 py-3 bg-gradient-to-r from-blush/25 to-blush/5">
        <span className="grid place-items-center w-9 h-9 shrink-0 rounded-full bg-blush text-white text-lg shadow-sm">
          ♥
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-bold text-plum-dark leading-tight text-sm sm:text-base">
            Aportes y donaciones
          </h2>
          <p className="text-xs text-plum-light">
            {donations.length === 0
              ? 'Lo que entra sin número'
              : `${donations.length} aporte${donations.length === 1 ? '' : 's'} · ${people} persona${
                  people === 1 ? '' : 's'
                }`}
          </p>
        </div>
        <div className="shrink-0 text-lg sm:text-xl font-black text-plum leading-tight">
          {formatCOP(total)}
        </div>
      </header>

      {donations.length === 0 ? (
        <div className="px-4 py-5 text-center">
          <p className="text-sm text-plum-light mb-3">
            Aquí llevas la cuenta de quien te dona sin llevar boleta o te paga de más.
          </p>
          <button
            type="button"
            onClick={onAdd}
            className="bg-blush text-white font-bold rounded-xl px-5 py-2.5 hover:brightness-105"
          >
            + Registrar aporte
          </button>
        </div>
      ) : (
        <>
          <ul className="divide-y divide-blush/20">
            {visible.map((d) => (
              <li
                key={d.id}
                className="flex items-center gap-2.5 px-3 hover:bg-blush/5 transition"
              >
                <button
                  type="button"
                  onClick={() => onEdit(d)}
                  className="min-w-0 flex-1 flex items-center gap-2.5 py-2.5 text-left"
                >
                  <span
                    className={`grid place-items-center w-8 h-8 shrink-0 rounded-full text-sm font-black ${
                      d.kind === 'donation'
                        ? 'bg-blush/25 text-blush'
                        : 'bg-tangerine/25 text-tangerine'
                    }`}
                  >
                    {d.name.trim().charAt(0).toUpperCase() || '?'}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-ink text-sm">
                      {d.name}
                    </span>
                    <span className="block truncate text-xs text-plum-light">
                      {DONATION_LABEL[d.kind]}
                      {d.number != null && ` en el ${pad2(d.number)}`}
                      {' · '}
                      {formatDate(d.created_at)}
                      {d.note && ` · ${d.note}`}
                    </span>
                  </span>
                  <span className="shrink-0 font-bold text-plum text-sm">
                    +{formatCOP(d.amount)}
                  </span>
                </button>
                {d.phone && (
                  <a
                    href={thanksLink(d.phone, d.name, d.amount)}
                    target="_blank"
                    rel="noreferrer"
                    title={`Agradecer a ${d.name} por WhatsApp`}
                    aria-label={`Agradecer a ${d.name} por WhatsApp`}
                    className="shrink-0 grid place-items-center w-9 h-9 rounded-lg text-[#25D366] hover:bg-[#25D366]/10"
                  >
                    <WhatsAppIcon />
                  </a>
                )}
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2 px-3 py-2.5 border-t border-blush/20 bg-blush/5">
            <button
              type="button"
              onClick={onAdd}
              className="flex-1 sm:flex-none sm:px-6 bg-blush text-white font-bold rounded-lg py-2 text-sm hover:brightness-105"
            >
              + Registrar aporte
            </button>
            {donations.length > PREVIEW && (
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="shrink-0 sm:ml-auto rounded-lg border border-plum/25 text-plum font-semibold px-3 py-2 text-sm hover:bg-white"
              >
                {expanded ? 'Ver menos' : `Ver los ${donations.length}`}
              </button>
            )}
          </div>
        </>
      )}
    </section>
  )
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 18.15a8.2 8.2 0 0 1-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.18 8.18 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23 2.2 0 4.27.86 5.83 2.42a8.19 8.19 0 0 1 2.41 5.82c0 4.54-3.7 8.23-8.24 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.79.97-.14.16-.29.18-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.24-1.47-1.38-1.72-.15-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.15.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.84-.2-.48-.4-.42-.56-.43h-.47c-.17 0-.43.06-.66.31-.23.25-.86.84-.86 2.05s.89 2.38 1.01 2.54c.12.16 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.17-.47-.29z" />
    </svg>
  )
}
