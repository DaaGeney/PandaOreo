import { supabase, isDemo } from './supabase'
import type { RaffleNumber, NumberStatus } from './types'

const DEMO_KEY = 'rifa-demo-numbers'
const DEMO_HISTORY_KEY = 'rifa-demo-history'

export interface HistoryEntry {
  id: number
  number: number
  old_status: NumberStatus | null
  new_status: NumberStatus | null
  old_buyer: string | null
  new_buyer: string | null
  changed_at: string
}

const emptyBoard = (): RaffleNumber[] =>
  Array.from({ length: 100 }, (_, i) => ({
    number: i,
    buyer_name: null,
    buyer_phone: null,
    sold_by: null,
    status: 'available' as NumberStatus,
  }))

function loadDemo(): RaffleNumber[] {
  try {
    const raw = localStorage.getItem(DEMO_KEY)
    if (raw) return JSON.parse(raw) as RaffleNumber[]
  } catch {
    // datos corruptos: se reinicia el tablero
  }
  const board = emptyBoard()
  localStorage.setItem(DEMO_KEY, JSON.stringify(board))
  return board
}

function saveDemo(board: RaffleNumber[]) {
  localStorage.setItem(DEMO_KEY, JSON.stringify(board))
}

/** Tablero completo para el admin (nombres y teléfonos incluidos). */
export async function fetchNumbers(): Promise<RaffleNumber[]> {
  if (isDemo) return loadDemo()
  const { data, error } = await supabase!
    .from('raffle_numbers')
    .select('number, buyer_name, buyer_phone, sold_by, status')
    .order('number')
  if (error) throw error
  return data as RaffleNumber[]
}

/** Tablero público: solo número y estado, vía la vista public_board. */
export async function fetchPublicBoard(): Promise<Pick<RaffleNumber, 'number' | 'status'>[]> {
  if (isDemo)
    return loadDemo().map(({ number, status }) => ({ number, status }))
  const { data, error } = await supabase!
    .from('public_board')
    .select('number, status')
    .order('number')
  if (error) throw error
  return data as Pick<RaffleNumber, 'number' | 'status'>[]
}

export async function updateNumber(entry: RaffleNumber): Promise<void> {
  if (isDemo) {
    const board = loadDemo()
    const prev = board[entry.number]
    board[entry.number] = entry
    saveDemo(board)
    logDemoHistory(prev, entry)
    return
  }
  const { error } = await supabase!
    .from('raffle_numbers')
    .update({
      buyer_name: entry.buyer_name,
      buyer_phone: entry.buyer_phone,
      sold_by: entry.sold_by,
      status: entry.status,
      updated_at: new Date().toISOString(),
    })
    .eq('number', entry.number)
  if (error) throw error
}

function logDemoHistory(prev: RaffleNumber, next: RaffleNumber) {
  if (
    prev.status === next.status &&
    prev.buyer_name === next.buyer_name &&
    prev.buyer_phone === next.buyer_phone
  )
    return
  let history: HistoryEntry[] = []
  try {
    history = JSON.parse(localStorage.getItem(DEMO_HISTORY_KEY) ?? '[]')
  } catch {
    // historial corrupto: se reinicia
  }
  history.unshift({
    id: Date.now(),
    number: next.number,
    old_status: prev.status,
    new_status: next.status,
    old_buyer: prev.buyer_name,
    new_buyer: next.buyer_name,
    changed_at: new Date().toISOString(),
  })
  localStorage.setItem(DEMO_HISTORY_KEY, JSON.stringify(history.slice(0, 100)))
}

/** Últimos cambios, del más reciente al más antiguo. */
export async function fetchHistory(): Promise<HistoryEntry[]> {
  if (isDemo) {
    try {
      return JSON.parse(localStorage.getItem(DEMO_HISTORY_KEY) ?? '[]')
    } catch {
      return []
    }
  }
  const { data, error } = await supabase!
    .from('raffle_history')
    .select('id, number, old_status, new_status, old_buyer, new_buyer, changed_at')
    .order('changed_at', { ascending: false })
    .limit(50)
  if (error) throw error
  return data as HistoryEntry[]
}
