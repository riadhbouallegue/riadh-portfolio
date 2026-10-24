import { useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import Section, { Label } from '../components/Section'
import TiltCard from '../components/TiltCard'
import { Odometer, type OdoHandle } from '../components/Odometer'
import { LABELS, MANIFESTO, STATS } from '../data'
import { useTick, sceneIndex } from '../engine/hooks'
import { clamp, easeInOutSine, easeOutCubic, fx } from '../engine/anim'

const I = sceneIndex('about')

export default function About({ back }: { back: HTMLElement }) {
  const shade = useRef<HTMLDivElement>(null)
  const col = useRef<HTMLDivElement>(null)
  const words = useRef<HTMLSpanElement[]>([])
  const cards = useRef<HTMLDivElement[]>([])
  const odos = useRef<(OdoHandle | null)[]>([])

  const list = useMemo(() => MANIFESTO.flatMap((c) => c.t.split(' ').filter(Boolean).map((w) => ({ w, k: !!c.k && true }))), [])

  useTick((s) => {
    const sc = s.scenes[I]
    if (shade.current) {
      shade.current.style.opacity = String(sc.vis)
      shade.current.style.transform = `translate3d(${((1 - easeOutCubic(sc.enter)) * -8).toFixed(2)}vw,0,0)`
    }
    const f = fx(sc)
    if (col.current) {
      col.current.style.opacity = String(f)
      col.current.style.transform = `translate3d(0,${((1 - easeOutCubic(clamp(sc.enter * 1.6))) * 8).toFixed(2)}vh,0)`
    }
    const n = words.current.length
    words.current.forEach((w, i) => {
      if (!w) return
      const t = clamp((sc.p * 1.5 + sc.enter * 0.1 - (i / n) * 0.8) / 0.14)
      w.style.opacity = (0.1 + 0.9 * t).toFixed(3)
      w.style.transform = `translate3d(0,${((1 - t) * 0.25).toFixed(3)}em,0)`
      w.style.filter = t >= 1 ? 'none' : `blur(${((1 - t) * 4).toFixed(2)}px)`
    })
    cards.current.forEach((c, i) => {
      if (!c) return
      const t = easeOutCubic(clamp(sc.enter * 1.8 + sc.p * 3 - 0.3 - i * 0.18))
      c.style.opacity = t.toFixed(3)
      c.style.transform = `translate3d(0,${((1 - t) * 40).toFixed(1)}px,0)`
    })
    const roll = easeInOutSine(clamp((sc.p - 0.18) / 0.55))
    STATS.forEach((st, i) => odos.current[i]?.set(st.value * roll))
  })

  return (
    <>
      {createPortal(<div className="about-shade" ref={shade} />, back)}
      <Section id="about">
        <div className="about-col" ref={col}>
          <div>
            <Label n="01">{LABELS.about}</Label>
            <p className="manifesto">
              {list.map((x, i) => (
                <span key={i} className={`w ${x.k ? 'k' : ''}`} ref={(el) => { if (el) words.current[i] = el }}>{x.w}{' '}</span>
              ))}
            </p>
          </div>
          <div className="stats">
            {STATS.map((st, i) => (
              <div key={i} className="stat-wrap" ref={(el) => { if (el) cards.current[i] = el }}>
                <TiltCard className="stat">
                  <div className="stat-num">
                    <Odometer places={String(st.value).length} ref={(h) => (odos.current[i] = h)} />
                    <span className="suf">{st.suffix}</span>
                  </div>
                  <div className="stat-label">{st.label}</div>
                  <div className="mono stat-sub">{st.sub}</div>
                </TiltCard>
              </div>
            ))}
          </div>
        </div>
      </Section>
    </>
  )
}
