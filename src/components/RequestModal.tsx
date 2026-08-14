import { useState } from 'react'
import { requestNumber } from '../lib/store'
import { pad2, formatCOP, TICKET_PRICE, CONTACT_NAME } from '../lib/types'

interface Props {
  number: number
  onClose: () => void
  onDone: () => void
}

export default function RequestModal({ number, onClose, onDone }: Props) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim().length < 2) return setError('Escribe tu nombre.')
    if (phone.replace(/\D/g, '').length < 7)
      return setError('Escribe un teléfono válido para poder confirmarte.')

    setSending(true)
    setError(null)
    try {
      await requestNumber(number, name, phone)
      setDone(true)
      onDone()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar. Intenta de nuevo.')
      setSending(false)
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
        {done ? (
          <div className="text-center">
            <p className="text-5xl mb-3">🐾</p>
            <h2 className="text-xl font-black text-plum mb-2">
              ¡Listo! Apartamos el {pad2(number)}
            </h2>
            <p className="text-ink mb-5">
              {CONTACT_NAME} te escribirá por WhatsApp para confirmar tu número y
              coordinar el pago.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="w-full bg-plum text-cream font-bold rounded-xl py-3 hover:brightness-110"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xl font-bold text-plum">
                Pedir el{' '}
                <span className="bg-plum text-cream rounded-lg px-2 py-0.5">
                  {pad2(number)}
                </span>
              </h2>
              <span className="text-sm text-plum-light font-semibold">
                {formatCOP(TICKET_PRICE)}
              </span>
            </div>
            <p className="text-sm text-plum-light mb-4">
              Queda apartado mientras {CONTACT_NAME} te confirma por WhatsApp.
            </p>

            <form onSubmit={submit}>
              <label className="block mb-3">
                <span className="text-sm font-semibold text-plum">Tu nombre</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nombre y apellido"
                  className="mt-1 w-full rounded-lg border border-plum/30 bg-white px-3 py-2 outline-none focus:border-plum"
                  autoFocus
                />
              </label>
              <label className="block mb-4">
                <span className="text-sm font-semibold text-plum">Tu WhatsApp</span>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="300 123 4567"
                  inputMode="tel"
                  className="mt-1 w-full rounded-lg border border-plum/30 bg-white px-3 py-2 outline-none focus:border-plum"
                />
              </label>

              {error && <p className="text-sm text-red-700 mb-3">{error}</p>}

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="submit"
                  disabled={sending}
                  className="rounded-lg bg-plum text-cream font-bold py-2.5 hover:brightness-110 disabled:opacity-50"
                >
                  {sending ? 'Enviando…' : 'Apartar'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-plum/30 text-plum font-semibold py-2.5 hover:bg-white"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
