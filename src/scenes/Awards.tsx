import { useRef } from 'react'
import Section, { Label } from '../components/Section'
import { CERTS, COUNTS, LABELS } from '../data'
import { useTick, sceneIndex } from '../engine/hooks'
import { clamp, easeOutCubic, fx } from '../engine/anim'

const I = sceneIndex('awards')
const NC = CERTS.length

export default function Awards() {
  const left = useRef<HTMLDivElement>(null)
  const cards = useRef<HTMLDivElement[]>([])
  const nums = useRef<HTMLSpanElement[]>([])
  const cyl = useRef<HTMLDivElement>(null)

  useTick((s) => {
    const sc = s.scenes[I]
    if (left.current) left.current.style.opacity = String(fx(sc))
    cards.current.forEach((c, i) => {
      if (!c) return
      const t = easeOutCubic(clamp((sc.enter * 1.4 + sc.p * 2.2 - 0.15 - i * 0.2)))
      c.style.transform = `rotateX(${(-100 * (1 - t)).toFixed(1)}deg)`
      c.style.opacity = Math.min(1, t * 3).toFixed(2)
      const el = nums.current[i]
      if (el) el.textContent = String(Math.round(COUNTS[i].n * t))
    })
    if (cyl.current) {
      const p = clamp(sc.p)
      cyl.current.style.transform = `translateZ(-360px) rotateX(-14deg) rotateY(${(-p * (360 - 360 / NC)).toFixed(2)}deg)`
    }
  })

  return (
    <Section id="awards">
      <div className="awards-left" ref={left}>
        <Label n="05">{LABELS.awards}</Label>
        <div className="counters">
          {COUNTS.map((c, i) => (
            <div key={c.label} className={`counter ${i % 2 ? 'dark' : 'red'}`} ref={(el) => { if (el) cards.current[i] = el }}>
              <div className="c-num"><span ref={(el) => { if (el) nums.current[i] = el }}>0</span>{c.suffix}</div>
              <div className="mono c-label">{c.label}</div>
            </div>
          ))}
        </div>
        <div className="cyl-wrap">
          <div className="cyl" ref={cyl}>
            {CERTS.map((c, i) => (
              <div className="cert" key={c.title} style={{ transform: `rotateY(${(360 / NC) * i}deg) translateZ(360px)` }}>
                <div className={`face front ${i % 3 === 2 ? 'red' : ''}`}>
                  <div className="mono">Certification</div>
                  <div className="cert-title">{c.title}</div>
                  <div className="cert-issuer">{c.issuer}</div>
                  <span className="seal">✓</span>
                </div>
                <div className="face back" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  )
}
