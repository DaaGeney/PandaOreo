import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase, isDemo, ADMIN_EMAIL } from '../lib/supabase'
import { fetchNumbers, updateNumber, fetchHistory, type HistoryEntry } from '../lib/store'
import { downloadCardPng } from '../lib/exportImage'
import type { RaffleNumber } from '../lib/types'
import { pad2 } from '../lib/types'
import NumberGrid from '../components/NumberGrid'
import NumberModal from '../components/NumberModal'
import StatsBar from '../components/StatsBar'
import ExportCard from '../components/ExportCard'

export default function AdminPage() {
  const [session, setSession] = useState<Session | null>(null)
  const [authReady, setAuthReady] = useState(isDemo)
  const [numbers, setNumbers] = useState<RaffleNumber[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)
  const [selected, setSelected] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [exporting, setExporting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const exportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isDemo) return
    supabase!.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setAuthReady(true)
    })
    const { data: sub } = supabase!.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  const isAdmin = isDemo || session?.user.email === ADMIN_EMAIL

  const load = useCallback(async () => {
    try {
      setNumbers(await fetchNumbers())
      setLoadError(null)
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Error cargando los números')
    }
  }, [])

  useEffect(() => {
    if (isAdmin) load()
  }, [isAdmin, load])

  const highlight = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return undefined
    return new Set(
      numbers
        .filter(
          (n) =>
            n.buyer_name?.toLowerCase().includes(q) ||
            n.sold_by?.toLowerCase().includes(q)
        )
        .map((n) => n.number)
    )
  }, [search, numbers])

  const save = async (updated: RaffleNumber) => {
    await updateNumber(updated)
    setNumbers((prev) => prev.map((n) => (n.number === updated.number ? updated : n)))
    if (showHistory) setHistory(await fetchHistory().catch(() => []))
  }

  const exportImage = async () => {
    if (!exportRef.current) return
    setExporting(true)
    try {
      await downloadCardPng(exportRef.current)
    } finally {
      setExporting(false)
    }
  }

  const toggleHistory = async () => {
    if (showHistory) {
      setShowHistory(false)
      return
    }
    setHistory(await fetchHistory().catch(() => []))
    setShowHistory(true)
  }

  const copyPublicLink = async () => {
    const url = `${window.location.origin}/tablero`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!authReady) {
    return <Centered>Cargando…</Centered>
  }

  if (!isDemo && !session) {
    return <LoginScreen />
  }

  if (!isAdmin) {
    return (
      <Centered>
        <p className="text-plum font-semibold mb-4">
          Esta cuenta ({session?.user.email}) no tiene acceso a la administración.
        </p>
        <button
          type="button"
          onClick={() => supabase!.auth.signOut()}
          className="border border-plum/30 text-plum font-semibold rounded-xl px-5 py-2 hover:bg-white"
        >
          Cerrar sesión
        </button>
      </Centered>
    )
  }

  const selectedEntry = selected !== null ? numbers.find((n) => n.number === selected) : undefined

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-xl sm:text-2xl font-black text-plum">Rifa Oreo y Panda 🐾</h1>
        {!isDemo && (
          <button
            type="button"
            onClick={() => supabase!.auth.signOut()}
            className="text-sm text-plum-light hover:text-plum font-semibold"
          >
            Salir
          </button>
        )}
      </header>

      {isDemo && (
        <div className="bg-tangerine/20 border border-tangerine rounded-xl px-3 py-2 text-sm text-plum-dark mb-4">
          <strong>Modo demo:</strong> los datos se guardan solo en este navegador. Configura
          Supabase en <code>.env</code> para tener login y datos en la nube.
        </div>
      )}

      {loadError && (
        <div className="bg-red-100 border border-red-300 rounded-xl px-3 py-2 text-sm text-red-800 mb-4">
          {loadError}
        </div>
      )}

      <StatsBar numbers={numbers} />

      <div className="flex gap-2 my-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre…"
          className="flex-1 rounded-xl border border-plum/25 bg-white px-3 py-2 outline-none focus:border-plum"
        />
      </div>

      <NumberGrid numbers={numbers} onSelect={setSelected} highlight={highlight} />

      <div className="flex items-center justify-center gap-4 text-xs sm:text-sm font-semibold text-plum mt-3 mb-5">
        <span className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-white border border-plum/30" /> Libre
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-tangerine" /> Apartado (debe)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-plum" /> Pagado
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-2">
        <button
          type="button"
          onClick={exportImage}
          disabled={exporting}
          className="bg-plum text-cream font-bold rounded-xl py-3 hover:brightness-110 disabled:opacity-50"
        >
          {exporting ? 'Generando…' : '📸 Exportar imagen'}
        </button>
        <button
          type="button"
          onClick={copyPublicLink}
          className="border-2 border-plum text-plum font-bold rounded-xl py-3 hover:bg-white"
        >
          {copied ? '✅ Copiado' : '🔗 Copiar link público'}
        </button>
      </div>

      <button
        type="button"
        onClick={toggleHistory}
        className="w-full border border-plum/25 text-plum font-semibold rounded-xl py-2.5 hover:bg-white"
      >
        {showHistory ? 'Ocultar historial' : '🕘 Ver historial de cambios'}
      </button>

      {showHistory && (
        <div className="mt-3 bg-white rounded-xl border border-plum/15 divide-y divide-plum/10">
          {history.length === 0 && (
            <p className="px-4 py-3 text-sm text-plum-light">Aún no hay cambios registrados.</p>
          )}
          {history.map((h) => (
            <div key={h.id} className="px-4 py-2.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-bold text-plum">Nº {pad2(h.number)}</span>
                <span className="text-xs text-plum-light">
                  {new Date(h.changed_at).toLocaleString('es-CO', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <div className="text-ink/80">
                {statusLabel(h.old_status)}
                {h.old_buyer ? ` (${h.old_buyer})` : ''} → {statusLabel(h.new_status)}
                {h.new_buyer ? ` (${h.new_buyer})` : ''}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedEntry && (
        <NumberModal
          entry={selectedEntry}
          onSave={save}
          onClose={() => setSelected(null)}
        />
      )}

      {/* Tarjeta off-screen para la exportación PNG */}
      <div className="fixed -left-[3000px] top-0" aria-hidden="true">
        <ExportCard ref={exportRef} numbers={numbers} />
      </div>
    </div>
  )
}

function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const login = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error: err } = await supabase!.auth.signInWithPassword({ email, password })
    if (err) {
      setError('Correo o contraseña incorrectos.')
      setLoading(false)
    }
    // con éxito, onAuthStateChange actualiza la sesión y desmonta esta pantalla
  }

  return (
    <Centered>
      <h1 className="text-3xl font-black text-plum mb-2">Rifa Oreo y Panda 🐾</h1>
      <p className="text-plum-light mb-6">Inicia sesión para administrar la rifa</p>
      <form onSubmit={login} className="w-full max-w-xs text-left">
        <label className="block mb-3">
          <span className="text-sm font-semibold text-plum">Correo</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-plum/30 bg-white px-3 py-2 outline-none focus:border-plum"
          />
        </label>
        <label className="block mb-4">
          <span className="text-sm font-semibold text-plum">Contraseña</span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-plum/30 bg-white px-3 py-2 outline-none focus:border-plum"
          />
        </label>
        {error && <p className="text-sm text-red-700 mb-3">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-plum text-cream font-bold rounded-xl py-3 hover:brightness-110 disabled:opacity-50"
        >
          {loading ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </Centered>
  )
}

function statusLabel(s: string | null) {
  return s === 'paid' ? 'Pagado' : s === 'reserved' ? 'Apartado' : 'Libre'
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh flex flex-col items-center justify-center text-center px-6">
      {children}
    </div>
  )
}
