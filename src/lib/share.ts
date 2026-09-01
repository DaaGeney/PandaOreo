/**
 * Mandar un mensaje a alguien de quien no tenemos el teléfono guardado.
 *
 * El link wa.me exige el número, así que aquí se usa la hoja de compartir del
 * sistema: en el celular abre WhatsApp y deja elegir el contacto de la agenda.
 * En computador casi nunca existe, así que se copia el texto al portapapeles.
 */
export type ShareResult = 'shared' | 'copied' | 'cancelled' | 'failed'

export async function shareText(text: string): Promise<ShareResult> {
  if (navigator.canShare?.({ text })) {
    try {
      await navigator.share({ text })
      return 'shared'
    } catch (e) {
      // Cerró la hoja de compartir: no copiamos a sus espaldas
      if (e instanceof DOMException && e.name === 'AbortError') return 'cancelled'
    }
  }
  try {
    await navigator.clipboard.writeText(text)
    return 'copied'
  } catch {
    return 'failed'
  }
}
