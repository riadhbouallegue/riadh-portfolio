import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import Section, { Label } from '../components/Section'
import { LABELS, SKILLS } from '../data'
import { useTick, sceneIndex } from '../engine/hooks'
import { fx } from '../engine/anim'

const I = sceneIndex('skills')
const N = SKILLS.length
// Fibonacci sphere
const PTS = SKILLS.map((_, i) => {
  const y = 1 - ((i + 0.5) * 2) / N
  const r = Math.sqrt(1 - y * y)
  const phi = i * 2.399963229728653
  return { x: Math.cos(phi) * r, y, z: Math.sin(phi) * r }
})

export default function Skills({ back, front }: { back: HTMLElement; front: HTMLElement }) {
  const bw = useRef<HTMLDivElement>(null)
  const fw = useRef<HTMLDivElement>(null)
  const bc = useRef<HTMLSpanElement[]>([])
  const fc = useRef<HTMLSpanElement[]>([])
  const col = useRef<HTMLDivElement>(null)
  const tape = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const mouse = useRef({ x: 0, y: 0, sx: 0, sy: 0 })
  const segW = useRef(0)

  useEffect(() => {
    const mv = (e: MouseEvent) => {
      mouse.current.x = e.clientX / window.innerWidth - 0.5
      mouse.current.y = e.clientY / window.innerHeight - 0.5
    }
    window.addEventListener('mousemove', mv)
    return () => window.removeEventListener('mousemove', mv)
  }, [])

  useTick((s) => {
    const sc = s.scenes[I]
    const vis = sc.vis
    if (bw.current) bw.current.style.opacity = String(vis)
    if (fw.current) fw.current.style.opacity = String(vis)
    const f = fx(sc)
    if (col.current) {
      col.current.style.opacity = String(f)
      col.current.style.transform = `translate3d(0,${((1 - f) * 24).toFixed(1)}px,0)`
    }
    if (tape.current) {
      tape.current.style.opacity = String(f)
      tape.current.style.transform = `translate3d(0,${((1 - f) * 12).toFixed(1)}vh,0) rotate(-2deg)`
    }
    if (track.current) {
      if (!segW.current) segW.current = (track.current.firstElementChild as HTMLElement | null)?.offsetWidth || 0
      const w = segW.current || 1
      track.current.style.transform = `translate3d(${(-((s.y * 0.45) % w)).toFixed(1)}px,0,0)`
    }
    if (vis < 0.01) return
    const m = mouse.current
    m.sx += (m.x - m.sx) * 0.06
    m.sy += (m.y - m.sy) * 0.06
    const t = performance.now() / 1000
    const ang = t * 0.22 + s.y * 0.005 + m.sx * 1.6
    const tilt = -0.28 + m.sy * 0.5
    const ca = Math.cos(ang), sa = Math.sin(ang), ct = Math.cos(tilt), st = Math.sin(tilt)
    const R = Math.min(s.vw * 0.27, s.vh * 0.46) * (s.vw < 820 ? 1.25 : 1)
    const cx = s.vw * 0.5
    const cy = s.vh * (s.vw < 820 ? 0.5 : 0.5)
    PTS.forEach((p, i) => {
      const x1 = p.x * ca + p.z * sa
      const z1 = -p.x * sa + p.z * ca
      const y2 = p.y * ct - z1 * st
      const z2 = p.y * st + z1 * ct
      const sx = cx + x1 * R
      const sy = cy + y2 * R * 0.78
      const sc2 = 0.8 + 0.22 * z2
      const tr = `translate3d(${sx.toFixed(1)}px,${sy.toFixed(1)}px,0) translate(-50%,-50%) scale(${sc2.toFixed(3)})`
      const b = bc.current[i], fr = fc.current[i]
      if (!b || !fr) return
      if (z2 < 0) {
        b.style.transform = tr
        b.style.opacity = (0.45 + 0.4 * (z2 + 1)).toFixed(2)
        fr.style.opacity = '0'
      } else {
        fr.style.transform = tr
        fr.style.opacity = '1'
        b.style.opacity = '0'
      }
    })
  })

  const marquee = SKILLS.map((k) => `${k.toUpperCase()} ✦ `).join('')
  return (
    <>
      {createPortal(
        <div className="orbit orbit-back" ref={bw}>
          {SKILLS.map((k, i) => <span key={k} className="chip chip-back" ref={(el) => { if (el) bc.current[i] = el }}>{k}</span>)}
        </div>,
        back,
      )}
      {createPortal(
        <div className="orbit orbit-front" ref={fw}>
          {SKILLS.map((k, i) => <span key={k} className="chip chip-front" ref={(el) => { if (el) fc.current[i] = el }}>{k}</span>)}
        </div>,
        front,
      )}
      <Section id="skills">
        <div className="skills-col" ref={col}>
          <Label n="04">{LABELS.skills}</Label>
          <h2 className="h2"><span>TOUT</span><span className="red">EN ORBITE.</span></h2>
        </div>
        <div className="tape" ref={tape}>
          <div className="tape-track" ref={track}>
            <span>{marquee}</span><span>{marquee}</span><span>{marquee}</span>
          </div>
        </div>
      </Section>
    </>
  )
}
