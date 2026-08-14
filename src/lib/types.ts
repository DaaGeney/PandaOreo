export type NumberStatus = 'available' | 'reserved' | 'paid'

/** El tablero público suma 'pending': solicitado y a la espera de confirmación. */
export type BoardStatus = NumberStatus | 'pending'

export interface RaffleNumber {
  number: number
  buyer_name: string | null
  buyer_phone: string | null
  sold_by: string | null
  status: NumberStatus
}

export interface NumberRequest {
  id: number
  number: number
  name: string
  phone: string
  created_at: string
}

/** Link de WhatsApp con el mensaje de confirmación ya escrito. */
export function whatsappLink(phone: string, number: number, name: string) {
  const digits = phone.replace(/\D/g, '')
  const full = digits.length === 10 ? `57${digits}` : digits
  const text = `Hola ${name}, te escribo por la ${RAFFLE_TITLE} 🐾 Confirmo tu número ${pad2(
    number
  )}. El valor es ${formatCOP(TICKET_PRICE)}. ¡Gracias por tu apoyo!`
  return `https://wa.me/${full}?text=${encodeURIComponent(text)}`
}

export const TICKET_PRICE = 20000
export const PRIZE = 1000000
export const RAFFLE_TITLE = 'Rifa Solidaria Oreo y Panda'
export const DRAW_DATE = 'Viernes 4 de septiembre · Lotería de Medellín · 11:00 p.m.'
export const CONTACT_PHONE = '3008827856'
export const CONTACT_NAME = 'Diego Assia'
export const CONTACT_LABEL = `Responsable: ${CONTACT_NAME} · ${CONTACT_PHONE}`
export const BREB_KEY = '@assia951'
export const BREB_LABEL = `Paga con Bre-B: ${BREB_KEY}`

export const formatCOP = (value: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)

export const pad2 = (n: number) => n.toString().padStart(2, '0')
