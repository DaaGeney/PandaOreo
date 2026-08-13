import { toPng } from 'html-to-image'

/** Genera el PNG de la tarjeta y dispara la descarga. */
export async function downloadCardPng(node: HTMLElement) {
  const dataUrl = await toPng(node, { pixelRatio: 2, cacheBust: true })
  const link = document.createElement('a')
  link.download = 'rifa-oreo-y-panda.png'
  link.href = dataUrl
  link.click()
}
