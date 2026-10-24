import { useRef } from 'react'
import { createPortal } from 'react-dom'
import Section from '../components/Section'
import { ME, LINKS } from '../data'
import { scrollToTop } from '../engine/director'
import { useTick, sceneIndex } from '../engine/hooks'
import { clamp, easeOutCubic, smoothstep } from '../engine/anim'

const I = sceneIndex('contact')

export default function Contact({ back }: { back: HTMLElement }) {
  const red = useRef<HTMLDivElement>(null)
  const big = useRef<HTMLDivElement>(null)
  const front = useRef<HTMLDivElement>(null)
  const [name, domain] = ME.email.split('@')

  useTick((s) => {
    const f = s.frame
    const sc = s.scenes[I]
    const active = f.scene === I
    if (red.current) {
      if (!active) {
        red.current.style.visibility = 'hidden'
      } else {
        // identical blade maths as the canvas
        const skew = 0.2 * s.vh
        const e = -skew + (s.vw + 2 * skew) * f.t
        red.current.style.visibility = 'visible'
        red.current.style.clipPath =
          f.t >= 0.999 ? 'none' : `polygon(0 0, ${(e + skew).toFixed(1)}px 0, ${(e - skew).toFixed(1)}px 100%, 0 100%)`
      }
    }
    const k = active ? easeOutCubic(smoothstep(0.35, 1, f.t)) : 0
    if (big.current) {
      big.current.style.opacity = String(k)
      big.current.style.transform = `translate3d(-50%,${((1 - k) * 8).toFixed(2)}vh,0)`
    }
    if (front.current) {
      const kk = active ? smoothstep(0.55, 0.95, f.t) : 0
      front.current.style.opacity = String(kk)
      front.current.style.transform = `translate3d(0,${((1 - kk) * 30).toFixed(1)}px,0)`
      front.current.style.pointerEvents = kk > 0.8 ? 'auto' : 'none'
    }
    void sc
    void clamp
  })

  return (
    <>
      {createPortal(
        <div className="contact-red" ref={red}>
          <div className="lets" ref={big} aria-hidden>
            <span>LET’S</span>
            <span>TALK</span>
          </div>
        </div>,
        back,
      )}
      <Section id="contact">
        <div className="contact-front" ref={front}>
          <a className="email" href={`mailto:${ME.email}`} data-cursor="Write">
            <span className="e-name">{name}</span>
            <span className="e-dom">@{domain}</span>
          </a>
          <ul className="links">
            {LINKS.map((l) => (
              <li key={l.label}>
                <a href={l.href} target={l.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" data-cursor={l.cursor} {...(l.label === 'Résumé' ? { download: true } : {})}>
                  <span>{l.label}</span>
                  <i>↗</i>
                </a>
              </li>
            ))}
          </ul>
          <footer className="foot mono">
            <span>© {ME.year} {ME.full}</span>
            <a href="#" onClick={(e) => { e.preventDefault(); scrollToTop() }} data-cursor="Top">Retour en haut ↑</a>
          </footer>
        </div>
      </Section>
    </>
  )
}
