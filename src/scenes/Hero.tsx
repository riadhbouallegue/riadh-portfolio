import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import gsap from 'gsap'
import Section from '../components/Section'
import { Btn } from '../components/Chrome'
import { ME, TAGLINE } from '../data'
import { scrollToScene } from '../engine/director'
import { useIntro, useTick, sceneIndex } from '../engine/hooks'
import { clamp, easeOutCubic } from '../engine/anim'

const I = sceneIndex('hero')

export default function Hero({ back }: { back: HTMLElement }) {
  const name = useRef<HTMLDivElement>(null)
  const front = useRef<HTMLDivElement>(null)
  const hl = useRef<HTMLSpanElement>(null)
  const letters = useRef<HTMLSpanElement[]>([])
  const wraps = useRef<HTMLSpanElement[]>([])

  useEffect(() => {
    gsap.set(letters.current, { yPercent: 115, rotateX: -80 })
    gsap.set(front.current!.querySelectorAll('.line-in'), { yPercent: 115 })
    gsap.set(front.current!.querySelectorAll('.rise'), { opacity: 0, y: 28 })
  }, [])

  useIntro(() => {
    gsap.to(letters.current, { yPercent: 0, rotateX: 0, stagger: 0.07, duration: 1.6, ease: 'expo.out' })
    const root = front.current!
    gsap.to(root.querySelectorAll('.line-in'), { yPercent: 0, stagger: 0.12, duration: 1.3, ease: 'expo.out', delay: 0.15 })
    gsap.to(root.querySelectorAll('.rise'), { opacity: 1, y: 0, stagger: 0.12, duration: 1.1, ease: 'power3.out', delay: 0.5 })
  })

  useTick((s) => {
    const sc = s.scenes[I]
    const out = Math.max(0, 1 - sc.exit * 2.4)
    if (name.current) {
      name.current.style.opacity = String(out)
    }
    wraps.current.forEach((w, i) => {
      if (w) w.style.transform = `translate3d(0,${((i % 2 ? 1 : -1) * sc.p * 3.2).toFixed(2)}vh,0)`
    })
    if (front.current) {
      front.current.style.opacity = String(out)
      front.current.style.transform = `translate3d(0,${(-sc.exit * 6).toFixed(2)}vh,0)`
    }
    if (hl.current) hl.current.style.backgroundSize = `${(easeOutCubic(clamp(sc.p * 2.4)) * 100).toFixed(1)}% 0.34em`
  })

  return (
    <>
      {createPortal(
        <div className="hero-name" ref={name} aria-hidden>
          <span className="mask">
            {ME.first.toUpperCase().split('').map((c, i) => (
              <span className="ch-w" key={i} ref={(el) => { if (el) wraps.current[i] = el }}>
                <span className="ch" ref={(el) => { if (el) letters.current[i] = el }}>{c}</span>
              </span>
            ))}
          </span>
        </div>,
        back,
      )}
      <Section id="hero">
        <div className="hero-front" ref={front}>
          <p className="hi rise">Bonjour, moi c’est <b>{ME.full}</b> —</p>
          <h1 className="hero-title">
            <span className="line"><span className="line-in">{ME.role[0]}</span></span>
            <span className="line red"><span className="line-in">{ME.role[1]}</span></span>
          </h1>
          <p className="hero-desc rise"><span className="hl" ref={hl}>{TAGLINE}</span></p>
          <div className="hero-btns rise">
            <Btn variant="red" cursor="Go" onClick={() => scrollToScene('work')}>Voir mes missions ↘</Btn>
            <Btn variant="outline" cursor="PDF" href={ME.resume} download>Télécharger le CV</Btn>
          </div>
        </div>
      </Section>
    </>
  )
}
