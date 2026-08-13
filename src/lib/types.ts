export type NumberStatus = 'available' | 'reserved' | 'paid'

export interface RaffleNumber {
  number: number
  buyer_name: string | null
  buyer_phone: string | null
  sold_by: string | null
  status: NumberStatus
}

export const TICKET_PRICE = 20000
export const PRIZE = 500000
export const RAFFLE_TITLE = 'Rifa Solidaria Oreo y Panda'
export const DRAW_DATE = 'Viernes 28 de agosto · Lotería de Medellín · 11:00 p.m.'

export const formatCOP = (value: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)

export const pad2 = (n: number) => n.toString().padStart(2, '0')
