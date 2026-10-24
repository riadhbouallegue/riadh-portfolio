import { forwardRef, useImperativeHandle, useRef } from 'react'
import { smoothstep } from '../engine/anim'

export interface OdoHandle {
  set: (x: number) => void
}

/** Mechanical odometer: each digit column holds 0–9,0 and rolls; the lowest digit snaps with smoothstep(.55, 1). */
export const Odometer = forwardRef<OdoHandle, { places: number; className?: string }>(function Odometer({ places, className }, fwd) {
  const strips = useRef<(HTMLDivElement | null)[]>([])
  useImperativeHandle(fwd, () => ({
    set(x: number) {
      // Mechanical carry: the lowest digit snaps with smoothstep(.55, 1); a higher digit only rolls
      // while every digit below it is a 9 that is itself rolling over.
      const xi = Math.floor(x + 1e-9)
      const f0 = Math.max(0, x - xi)
      let carry = smoothstep(0.55, 1, f0)
      for (let k = 0; k < places; k++) {
        const digit = Math.floor(xi / Math.pow(10, k)) % 10
        const j = places - 1 - k
        const el = strips.current[j]
        if (el) el.style.transform = `translate3d(0,${(-(digit + carry)).toFixed(3)}em,0)`
        carry = digit === 9 ? carry : 0
      }
    },
  }))
  return (
    <span className={`odo ${className ?? ''}`} aria-hidden>
      {Array.from({ length: places }, (_, j) => (
        <span className="odo-col" key={j}>
          <span className="odo-strip" ref={(el) => (strips.current[j] = el)}>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((d, n) => (
              <span key={n}>{d}</span>
            ))}
          </span>
        </span>
      ))}
    </span>
  )
})
