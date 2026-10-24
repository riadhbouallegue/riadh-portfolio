import { useEffect, useRef, type ReactNode } from 'react'
import gsap from 'gsap'
import { SCENES, scrollToScene, scrollToTop, start, type DirectorState } from '../engine/director'
import { useTick } from '../engine/hooks'
import { ME } from '../data'
import { clamp, smoothstep } from '../engine/anim'

/* ───────────── Preloader ───────────── */
export function Preloader({ getProgress, ready }: { getProgress: () => number; ready: () => boolean }) {
  const top = useRef<HTMLDivElement>(null)
  const bot = useRef<HTMLDivElement>(null)
  const num = useRef<HTMLDivElement>(null)
  const lines = useRef<HTMLDivElement>(null)
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const o = { v: 0 }
    let done = false
    const finish = () => {
      done = true
      gsap.ticker.remove(tick)
      gsap.to(lines.current, { yPercent: -140, opacity: 0, duration: 0.6, ease: 'power3.in' })
      gsap.to(top.current, { yPercent: -100, duration: 1.2, delay: 0.35, ease: 'expo.inOut' })
      gsap.to(bot.current, {
        yPercent: 100,
        duration: 1.2,
        delay: 0.35,
        ease: 'expo.inOut',
        onComplete: () => {
          root.current?.remove()
        },
      })
      gsap.delayedCall(0.35 + 0.55, () => {
        ;(window as unknown as { __intro?: boolean }).__intro = true
        window.dispatchEvent(new Event('intro'))
        start()
      })
    }
    const tick = () => {
      if (done) return
      const target = getProgress() * 100
      o.v += (target - o.v) * 0.1
      if (target >= 100 && o.v > 99.4) o.v = 100
      if (num.current) num.current.textContent = String(Math.round(o.v)).padStart(3, '0')
      if (o.v >= 100 && ready()) finish()
    }
    gsap.ticker.add(tick)
    return () => gsap.ticker.remove(tick)
  }, [])

  return (
    <div className="preloader" ref={root}>
      <div className="pre-half pre-top" ref={top} />
      <div className="pre-half pre-bot" ref={bot} />
      <div className="pre-center" ref={lines}>
        <div className="mono pre-line">{ME.full} — Portfolio {ME.year}</div>
        <div className="pre-num" ref={num}>000</div>
        <div className="mono pre-line">{ME.roleLong}</div>
      </div>
    </div>
  )
}

/* ───────────── HUD ───────────── */
export function Hud() {
  const pills = useRef<(HTMLButtonElement | null)[]>([])
  const pct = useRef<HTMLSpanElement>(null)
  const rail = useRef<HTMLSpanElement>(null)
  const last = useRef(-1)

  useTick((s: DirectorState) => {
    const a = s.frame.scene
    if (a !== last.current) {
      last.current = a
      pills.current.forEach((p, i) => p?.classList.toggle('on', i === a))
    }
    if (pct.current) pct.current.textContent = String(Math.round(s.progress * 100)).padStart(2, '0') + '%'
    if (rail.current) rail.current.style.transform = `scaleY(${clamp(s.progress)})`
    // only after the blade has passed t > .6 does the HUD turn white on Contact
    const onRed = a === SCENES.length - 1 && s.frame.t > 0.6
    document.documentElement.classList.toggle('on-red', onRed)
  })

  return (
    <div className="hud">
      <a className="logo" href="#" onClick={(e) => { e.preventDefault(); scrollToTop() }} data-cursor="Top">
        {ME.first}<span className="reg">®</span>
      </a>
      <nav className="pillnav" aria-label="Sections">
        {SCENES.map((s, i) => (
          <button key={s.id} ref={(el) => (pills.current[i] = el)} onClick={() => scrollToScene(s.id)} className={i === 0 ? 'on' : ''}>
            {s.label}
          </button>
        ))}
      </nav>
      <div className="progress">
        <span className="mono" ref={pct}>00%</span>
        <span className="rail"><span ref={rail} /></span>
      </div>
    </div>
  )
}

/* ───────────── Cursor (desktop only) ───────────── */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const label = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    document.documentElement.classList.add('has-cursor')
    const m = { x: -100, y: -100 }
    const r = { x: -100, y: -100 }
    const move = (e: MouseEvent) => {
      m.x = e.clientX
      m.y = e.clientY
      const t = (e.target as HTMLElement | null)?.closest?.('[data-cursor]') as HTMLElement | null
      ring.current?.classList.toggle('big', !!t)
      if (t && label.current) label.current.textContent = t.dataset.cursor || ''
    }
    const tick = () => {
      r.x += (m.x - r.x) * 0.16
      r.y += (m.y - r.y) * 0.16
      if (dot.current) dot.current.style.transform = `translate3d(${m.x}px,${m.y}px,0) translate(-50%,-50%)`
      if (ring.current) ring.current.style.transform = `translate3d(${r.x}px,${r.y}px,0) translate(-50%,-50%)`
    }
    window.addEventListener('mousemove', move)
    gsap.ticker.add(tick)
    return () => {
      window.removeEventListener('mousemove', move)
      gsap.ticker.remove(tick)
    }
  }, [])

  return (
    <>
      <div className="cursor-ring" ref={ring}><span ref={label} className="mono" /></div>
      <div className="cursor-dot" ref={dot} />
    </>
  )
}

/* ───────────── Button (magnetic, rolling text, sliding fill) ───────────── */
export function Btn({
  children, href, onClick, variant = 'red', cursor = 'Go', download, target,
}: {
  children: ReactNode
  href?: string
  onClick?: () => void
  variant?: 'red' | 'outline' | 'white'
  cursor?: string
  download?: boolean
  target?: string
}) {
  const el = useRef<HTMLAnchorElement>(null)
  useEffect(() => {
    const node = el.current!
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const qx = gsap.quickTo(node, 'x', { duration: 1, ease: 'elastic.out(1, 0.3)' })
    const qy = gsap.quickTo(node, 'y', { duration: 1, ease: 'elastic.out(1, 0.3)' })
    const move = (e: MouseEvent) => {
      const r = node.getBoundingClientRect()
      qx((e.clientX - (r.left + r.width / 2)) * 0.35)
      qy((e.clientY - (r.top + r.height / 2)) * 0.35)
    }
    const leave = () => { qx(0); qy(0) }
    node.addEventListener('mousemove', move)
    node.addEventListener('mouseleave', leave)
    return () => {
      node.removeEventListener('mousemove', move)
      node.removeEventListener('mouseleave', leave)
    }
  }, [])
  return (
    <a
      ref={el}
      className={`btn btn-${variant}`}
      href={href ?? '#'}
      data-cursor={cursor}
      target={target}
      rel={target ? 'noreferrer' : undefined}
      {...(download ? { download: true } : {})}
      onClick={(e) => {
        if (onClick) { e.preventDefault(); onClick() }
      }}
    >
      <span className="btn-fill" />
      <span className="btn-roll">
        <span>{children}</span>
        <span aria-hidden>{children}</span>
      </span>
    </a>
  )
}
export { smoothstep }
