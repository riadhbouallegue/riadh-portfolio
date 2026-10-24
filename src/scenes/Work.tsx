import { useRef } from 'react'
import { createPortal } from 'react-dom'
import Section, { Label } from '../components/Section'
import { LABELS, PROJECTS } from '../data'
import { useTick, sceneIndex } from '../engine/hooks'
import { clamp, easeInOutCubic, easeOutCubic, fx } from '../engine/anim'

const I = sceneIndex('work')
const N = PROJECTS.length

function Visual({ kind }: { kind: string }) {
  if (kind === 'gauge')
    return (
      <div className="vis vis-gauge">
        <svg viewBox="0 0 200 120">
          <path d="M20 110 A80 80 0 0 1 180 110" className="g-track" pathLength={1} />
          <path d="M20 110 A80 80 0 0 1 180 110" className="g-val" pathLength={1} />
          <line x1="100" y1="110" x2="100" y2="44" className="g-needle" />
          <circle cx="100" cy="110" r="6" fill="#fff" />
        </svg>
        <div className="g-num">98<small>%</small></div>
        <div className="mono g-cap">Couverture des risques</div>
      </div>
    )
  if (kind === 'heat')
    return (
      <div className="vis vis-heat">
        {Array.from({ length: 48 }, (_, i) => (
          <i key={i} style={{ animationDelay: `${((i * 37) % 23) * 0.13}s` }} />
        ))}
      </div>
    )
  return (
    <div className="vis vis-ledger">
      {[78, 54, 92, 41, 66].map((w, i) => (
        <div className="row" key={i}>
          <span style={{ width: `${30 + (i * 13) % 30}%` }} />
          <b style={{ width: `${w * 0.4}%`, animationDelay: `${i * 0.25}s` }} />
          <em>{i === 2 ? '✓' : ''}</em>
        </div>
      ))}
      <div className="mono total">Écart : 0,000</div>
    </div>
  )
}

export default function Work({ back }: { back: HTMLElement }) {
  const grid = useRef<HTMLDivElement>(null)
  const head = useRef<HTMLDivElement>(null)
  const deck = useRef<HTMLDivElement>(null)
  const cards = useRef<HTMLDivElement[]>([])
  const count = useRef<HTMLSpanElement>(null)
  const bar = useRef<HTMLSpanElement>(null)
  const lastIdx = useRef(-1)

  useTick((s) => {
    const sc = s.scenes[I]
    const vh = s.vh
    if (grid.current) {
      grid.current.style.opacity = String(sc.vis)
      grid.current.style.setProperty('--gy', `${(s.y * 0.35) % 90}px`)
    }
    const f = fx(sc)
    if (head.current) {
      head.current.style.opacity = String(f)
      head.current.style.transform = `translate3d(0,${((1 - f) * 24).toFixed(1)}px,0)`
    }
    // deck rises from below with rotateY(-25deg)
    const ee = easeOutCubic(clamp(sc.enter * 1.5))
    const out = Math.max(0, 1 - sc.exit * 2.4)
    if (deck.current) {
      deck.current.style.opacity = String(Math.min(1, ee * 1.4) * out)
      deck.current.style.transform = `translate3d(0,${((1 - ee) * 38).toFixed(2)}vh,0) rotateY(${(-25 * (1 - ee)).toFixed(2)}deg)`
    }
    // dwell on each card: q = i + ease(frac)
    const u = clamp(sc.p) * N
    const i = Math.min(N - 1, Math.floor(u))
    const f2 = u - i
    const frac = i < N - 1 ? clamp((f2 - 0.45) / 0.55) : 0
    const q = i + easeInOutCubic(frac)
    cards.current.forEach((c, k) => {
      if (!c) return
      const d = q - k
      let tr: string, op: number
      if (d > 0) {
        // leaving: flies up and toward the camera, tilting back
        const e = d
        tr = `translate3d(0,${(-12 * e).toFixed(2)}vh,${(e * 700).toFixed(1)}px) rotateX(${(28 * e).toFixed(2)}deg)`
        op = clamp(1 - 1.8 * e)
      } else {
        // upcoming: waits behind, rising into place
        const e = -d
        tr = `translate3d(0,${(e * 3.2).toFixed(2)}vh,${(-e * 300).toFixed(1)}px)`
        op = clamp(1 - e * 0.55)
      }
      c.style.transform = tr
      c.style.opacity = op.toFixed(3)
      c.style.zIndex = String(100 - Math.round(Math.abs(d) * 10) - (d > 0 ? 0 : 0))
      c.style.pointerEvents = Math.abs(d) < 0.5 ? 'auto' : 'none'
    })
    const idx = Math.round(q)
    if (idx !== lastIdx.current) {
      lastIdx.current = idx
      if (count.current) count.current.textContent = `${String(idx + 1).padStart(2, '0')} / ${String(N).padStart(2, '0')}`
    }
    if (bar.current) bar.current.style.transform = `scaleX(${(clamp(q / (N - 1)) * 0.92 + 0.08).toFixed(3)})`
    void vh
  })

  return (
    <>
      {createPortal(<div className="grid-floor" ref={grid}><div className="gf" /></div>, back)}
      <Section id="work">
        <div className="work-head" ref={head}>
          <Label n="02">{LABELS.work}</Label>
          <div className="work-count">
            <span className="anton" ref={count}>01 / {String(N).padStart(2, '0')}</span>
            <span className="bar"><span ref={bar} /></span>
          </div>
        </div>
        <div className="deck" ref={deck}>
          {PROJECTS.map((p, k) => (
            <div className="wcard" key={p.n} ref={(el) => { if (el) cards.current[k] = el }}>
              <div className="wc-left">
                <div className="mono wc-cat"><b>{p.n}</b> — {p.cat}</div>
                <h3 className="wc-name">{p.name}</h3>
                <p className="wc-desc">{p.desc}</p>
                <ul className="chips">{p.chips.map((c) => <li key={c}>{c}</li>)}</ul>
                <a className="wc-link" href={p.href} target="_blank" rel="noreferrer" data-cursor="Open">{p.link} ↗</a>
              </div>
              <div className="wc-right"><Visual kind={p.visual} /></div>
            </div>
          ))}
        </div>
      </Section>
    </>
  )
}
