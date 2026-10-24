import { useEffect, useRef } from 'react'
import { subscribe, SCENES, type DirectorState } from '../engine/director'
import { frameImg, getManifest, shotOf, loaded } from '../engine/frames'
import { isMobile } from '../engine/anim'

/** Fixed full-viewport canvas: draws the person for the current scroll position + the blade transition. */
export default function Stage() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const cv = ref.current!
    const ctx = cv.getContext('2d')!
    let dpr = 1, W = 0, H = 0
    let mx = 0, my = 0, px = 0, py = 0
    let lastKey = ''

    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1)
      W = window.innerWidth
      H = window.innerHeight
      cv.width = Math.round(W * dpr)
      cv.height = Math.round(H * dpr)
      cv.style.width = W + 'px'
      cv.style.height = H + 'px'
      lastKey = ''
    }
    const onMove = (e: MouseEvent) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 2 * 14
      my = (e.clientY / window.innerHeight - 0.5) * 2 * 14
    }
    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', onMove)

    const drawImg = (i: number, sceneIdx: number, alpha: number) => {
      const M = getManifest()
      if (!M || alpha <= 0.001) return
      const img = frameImg(i)
      if (!img) return
      const shot = M.shots[shotOf(i)]
      const [bx, by, bw, bh] = shot.box
      const sc = SCENES[sceneIdx]
      let scale: number, x: number
      if (isMobile()) {
        scale = Math.min((H * 0.74) / 900, (W * 1.5) / bw)
        x = 0.5
      } else {
        scale = (H * sc.k) / 900
        x = sc.x
      }
      const offY = H - 900 * scale + py
      const offX = x * W - shot.cx * 1600 * scale + px
      ctx.globalAlpha = alpha
      ctx.drawImage(img, offX + bx * scale, offY + by * scale, bw * scale, bh * scale)
    }

    // fractional frame: floor(f), then floor(f)+1 on top at alpha = fraction (same shot only)
    const drawFrame = (f: number, sceneIdx: number, alpha: number) => {
      const M = getManifest()
      if (!M) return
      const ff = Math.max(0, Math.min(M.count - 1, f))
      const i0 = Math.floor(ff)
      const fr = ff - i0
      drawImg(i0, sceneIdx, alpha)
      if (fr > 0.002 && i0 + 1 < M.count && shotOf(i0 + 1) === shotOf(i0)) drawImg(i0 + 1, sceneIdx, alpha * fr)
    }

    const draw = (s: DirectorState) => {
      const f = s.frame
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)
      ctx.globalAlpha = 1
      if (f.t >= 0.999 || f.scene === 0 && f.t >= 1) {
        drawFrame(f.b, f.scene, 1)
        return
      }
      const skew = 0.2 * H
      const t = f.t
      const e = -skew + (W + 2 * skew) * t
      // outgoing shot: right of the blade
      ctx.save()
      ctx.beginPath()
      ctx.moveTo(e + skew, 0); ctx.lineTo(W + 200, 0); ctx.lineTo(W + 200, H); ctx.lineTo(e - skew, H); ctx.closePath()
      ctx.clip()
      ctx.translate(60 * t, 0)
      drawFrame(f.a, f.prev, 1 - 0.35 * t)
      ctx.restore()
      // incoming shot: left of the blade
      ctx.save()
      ctx.beginPath()
      ctx.moveTo(-200, 0); ctx.lineTo(e + skew, 0); ctx.lineTo(e - skew, H); ctx.lineTo(-200, H); ctx.closePath()
      ctx.clip()
      ctx.translate(-60 * (1 - t), 0)
      drawFrame(f.b, f.scene, 1)
      ctx.restore()
      // the blade
      if (t > 0.002) {
        const col = f.scene === SCENES.length - 1 ? '255,255,255' : '255,31,31'
        ctx.globalAlpha = 1
        const g = ctx.createLinearGradient(e - 90, 0, e + skew * 0.0, 0)
        g.addColorStop(0, `rgba(${col},0)`)
        g.addColorStop(1, `rgba(${col},0.28)`)
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.moveTo(e + skew - 90, 0); ctx.lineTo(e + skew, 0); ctx.lineTo(e - skew, H); ctx.lineTo(e - skew - 90, H); ctx.closePath()
        ctx.fill()
        ctx.save()
        ctx.shadowColor = `rgb(${col})`
        ctx.shadowBlur = 24
        ctx.strokeStyle = `rgb(${col})`
        ctx.lineWidth = 3
        ctx.beginPath(); ctx.moveTo(e + skew, 0); ctx.lineTo(e - skew, H); ctx.stroke()
        ctx.restore()
      }
    }

    const unsub = subscribe((s) => {
      px += (mx - px) * 0.06
      py += (my - py) * 0.06
      const f = s.frame
      const key = [W, H, dpr, f.scene, f.prev, f.t.toFixed(4), f.a.toFixed(2), f.b.toFixed(2), px.toFixed(1), py.toFixed(1), loaded.n].join('|')
      if (key === lastKey) return // redraw only when an input changes
      lastKey = key
      draw(s)
    })
    return () => {
      unsub()
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMove)
    }
  }, [])

  return <canvas ref={ref} className="stage" aria-hidden />
}
