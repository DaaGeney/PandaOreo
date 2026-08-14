import { useState } from 'react'
import type { NumberRequest } from '../lib/types'
import { pad2, whatsappLink } from '../lib/types'

interface Props {
  requests: NumberRequest[]
  onApprove: (req: NumberRequest) => Promise<void>
  onReject: (req: NumberRequest) => Promise<void>
}

export default function PendingRequests({ requests, onApprove, onReject }: Props) {
  const [busy, setBusy] = useState<number | null>(null)
  const [confirmReject, setConfirmReject] = useState<number | null>(null)

  if (requests.length === 0) return null

  const run = async (req: NumberRequest, fn: (r: NumberRequest) => Promise<void>) => {
    setBusy(req.id)
    try {
      await fn(req)
    } finally {
      setBusy(null)
      setConfirmReject(null)
    }
  }

  return (
    <div className="border-2 border-tangerine bg-tangerine/10 rounded-xl overflow-hidden mb-4">
      <div className="px-3 py-2 bg-tangerine text-plum-dark font-bold text-sm">
        🙋 {requests.length} solicitud{requests.length === 1 ? '' : 'es'} por confirmar
      </div>

      <div className="divide-y divide-tangerine/40">
        {requests.map((req) => (
          <div key={req.id} className="px-3 py-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="shrink-0 bg-plum text-cream rounded-md px-2 py-0.5 font-bold">
                {pad2(req.number)}
              </span>
              <span className="min-w-0 flex-1 font-bold text-ink truncate">{req.name}</span>
              <span className="shrink-0 text-xs text-plum-light">
                {new Date(req.created_at).toLocaleString('es-CO', {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <p className="text-sm text-plum mb-2">{req.phone}</p>

            <div className="grid grid-cols-3 gap-2">
              <a
                href={whatsappLink(req.phone, req.number, req.name)}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg bg-[#25D366] text-white font-bold py-2 text-center text-sm hover:brightness-105"
              >
                WhatsApp
              </a>
              <button
                type="button"
                disabled={busy === req.id}
                onClick={() => run(req, onApprove)}
                className="rounded-lg bg-plum text-cream font-bold py-2 text-sm hover:brightness-110 disabled:opacity-50"
              >
                ✅ Aprobar
              </button>
              <button
                type="button"
                disabled={busy === req.id}
                onClick={() =>
                  confirmReject === req.id
                    ? run(req, onReject)
                    : setConfirmReject(req.id)
                }
                className="rounded-lg border border-plum/30 text-plum font-semibold py-2 text-sm hover:bg-white disabled:opacity-50"
              >
                {confirmReject === req.id ? '¿Seguro?' : '❌ Rechazar'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
