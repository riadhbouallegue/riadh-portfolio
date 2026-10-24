import { useEffect, useRef, type ReactNode } from 'react'
import gsap from 'gsap'

/** Glass card that 3D-tilts toward the cursor (±14°) with a moving radial glare. */
export default function TiltCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  const el = useRef<HTMLDivElement>(null)
  const glare = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = el.current!
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const cur = { rx: 0, ry: 0 }
    const tgt = { rx: 0, ry: 0, gx: 50, gy: 50, on: 0 }
    const move = (e: MouseEvent) => {
      const r = node.getBoundingClientRect()
      const nx = (e.clientX - r.left) / r.width
      const ny = (e.clientY - r.top) / r.height
      tgt.ry = (nx - 0.5) * 28
      tgt.rx = -(ny - 0.5) * 28
      tgt.gx = nx * 100
      tgt.gy = ny * 100
      tgt.on = 1
    }
    const leave = () => {
      tgt.rx = tgt.ry = 0
      tgt.on = 0
    }
    const tick = () => {
      cur.rx += (tgt.rx - cur.rx) * 0.12
      cur.ry += (tgt.ry - cur.ry) * 0.12
      node.style.transform = `perspective(900px) rotateX(${cur.rx.toFixed(2)}deg) rotateY(${cur.ry.toFixed(2)}deg)`
      const g = glare.current
      if (g) {
        g.style.opacity = String(tgt.on * 0.9)
        g.style.background = `radial-gradient(260px circle at ${tgt.gx}% ${tgt.gy}%, rgba(255,255,255,.85), rgba(255,255,255,0) 60%)`
      }
    }
    node.addEventListener('mousemove', move)
    node.addEventListener('mouseleave', leave)
    gsap.ticker.add(tick)
    return () => {
      node.removeEventListener('mousemove', move)
      node.removeEventListener('mouseleave', leave)
      gsap.ticker.remove(tick)
    }
  }, [])

  return (
    <div ref={el} className={`tilt ${className}`}>
      {children}
      <div ref={glare} className="tilt-glare" />
    </div>
  )
}
