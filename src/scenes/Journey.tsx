import { useRef } from 'react'
import { createPortal } from 'react-dom'
import Section, { Label } from '../components/Section'
import { Odometer, type OdoHandle } from '../components/Odometer'
import { JOURNEY, LABELS } from '../data'
import { useTick, sceneIndex } from '../engine/hooks'
import { clamp, easeInOutSine, easeOutCubic, fx } from '../engine/anim'

const I = sceneIndex('journey')

export default function Journey({ back }: { back: HTMLElement }) {
  const year = useRef<HTMLDivElement>(null)
  const odo = useRef<OdoHandle>(null)
  const col = useRef<HTMLDivElement>(null)
  const line = useRef<SVGLineElement>(null)
  const items = useRef<HTMLDivElement[]>([])
  const nodes = useRef<HTMLSpanElement[]>([])
  const n = JOURNEY.items.length

  useTick((s) => {
    const sc = s.scenes[I]
    if (year.current) {
      year.current.style.opacity = String(sc.vis)
      year.current.style.transform = `translate3d(0,${((1 - easeOutCubic(sc.enter)) * 10).toFixed(2)}vh,0)`
    }
    const prog = easeInOutSine(clamp(sc.p * 1.05 + sc.enter * 0.15))
    odo.current?.set(JOURNEY.from + (JOURNEY.to - JOURNEY.from) * prog)
    const f = fx(sc)
    if (col.current) {
      col.current.style.opacity = String(f)
    }
    // red line draws bottom → top (pathLength = 1, dashoffset)
    const draw = clamp((sc.p * 1.15 + sc.enter * 0.25 - 0.1) / 0.8)
    if (line.current) line.current.style.strokeDashoffset = String((1 - draw).toFixed(4))
    items.current.forEach((it, i) => {
      if (!it) return
      // newest at the top → last in the line's path; bottom item reveals first
      const order = n - 1 - i
      const t = easeOutCubic(clamp((draw - order / n * 0.9) / 0.28))
      it.style.opacity = t.toFixed(3)
      it.style.transform = `translate3d(0,${((1 - t) * 40).toFixed(1)}px,0) rotateY(${(-55 * (1 - t)).toFixed(1)}deg)`
      nodes.current[i]?.classList.toggle('on', t > 0.6)
    })
  })

  return (
    <>
      {createPortal(
        <div className="year-back" ref={year} aria-hidden>
          <Odometer places={4} ref={odo} />
        </div>,
        back,
      )}
      <Section id="journey">
        <div className="journey-col" ref={col}>
          <Label n="03">{LABELS.journey}</Label>
          <h2 className="h2">
            <span>DU BAC</span>
            <span className="red">AU MASTER.</span>
          </h2>
          <div className="timeline">
            <span className="track" />
            <svg className="tl-svg" preserveAspectRatio="none" viewBox="0 0 2 100">
              <line ref={line} x1="1" y1="100" x2="1" y2="0" pathLength={1} strokeDasharray="1" strokeDashoffset="1" />
            </svg>
            {JOURNEY.items.map((it, i) => (
              <div className="tl-item" key={it.year} ref={(el) => { if (el) items.current[i] = el }}>
                <span className="node" ref={(el) => { if (el) nodes.current[i] = el }} />
                <div className="mono tl-year">{it.year}</div>
                <div className="tl-title">{it.title}</div>
                <div className="tl-org">{it.org}</div>
              </div>
            ))}
          </div>
        </div>
      </Section>
    </>
  )
}
