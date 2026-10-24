import { applyManifest, type Manifest } from './director'

let M: Manifest | null = null
const imgs: (HTMLImageElement | null)[] = []
export const loaded = { n: 0 }

export const getManifest = () => M
export function shotOf(i: number) {
  if (!M) return 0
  for (let s = 0; s < M.shots.length; s++) if (i <= M.shots[s].to) return s
  return M.shots.length - 1
}

/** Frame i, or the nearest loaded frame of the same shot (never crosses a cut). */
export function frameImg(i: number): HTMLImageElement | null {
  if (!M) return null
  const sh = M.shots[shotOf(i)]
  const direct = imgs[i]
  if (direct) return direct
  for (let d = 1; d <= sh.to - sh.from; d++) {
    const a = imgs[i - d]
    if (a && i - d >= sh.from) return a
    const b = imgs[i + d]
    if (b && i + d <= sh.to) return b
  }
  return null
}

const pad = (n: number) => String(n).padStart(3, '0')

/** Loads frames in stride order 8 → 4 → 2 → 1 (shot boundaries first). `onReady` fires after the first quarter. */
export async function startLoading(onProgress: (p: number) => void, onReady: () => void) {
  const res = await fetch('./frames/manifest.json')
  M = (await res.json()) as Manifest
  applyManifest(M)
  const dir = window.innerWidth < 820 ? 'sm' : 'lg'
  const total = M.count
  const need = Math.ceil(total * 0.25)
  const order: number[] = []
  const seen = new Set<number>()
  const push = (i: number) => {
    if (i >= 0 && i < total && !seen.has(i)) {
      seen.add(i)
      order.push(i)
    }
  }
  M.shots.forEach((s) => {
    push(s.from)
    push(s.to)
  })
  for (const stride of [8, 4, 2, 1]) for (let i = 0; i < total; i += stride) push(i)

  let cursor = 0
  let readyFired = false
  const worker = async () => {
    while (cursor < order.length) {
      const i = order[cursor++]
      const img = new Image()
      img.decoding = 'async'
      img.src = `./frames/${dir}/f${pad(i)}.webp`
      try {
        await img.decode()
        imgs[i] = img
      } catch {
        /* missing frame: falls back to the nearest loaded one */
      }
      loaded.n++
      onProgress(Math.min(1, loaded.n / need))
      if (!readyFired && loaded.n >= need) {
        readyFired = true
        onReady()
      }
    }
  }
  await Promise.all(Array.from({ length: 6 }, worker))
  if (!readyFired) onReady()
}
