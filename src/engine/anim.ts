import gsap from 'gsap'

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
export const smoothstep = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a))
  return t * t * (3 - 2 * t)
}
export const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
export const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4)
export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
export const expoOut = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t))

/** Tween a 0→1 value through gsap; the callback mutates the DOM through refs. */
export function tween(
  duration: number,
  ease: string,
  onUpdate: (v: number) => void,
  opts: { delay?: number; onComplete?: () => void } = {},
) {
  const o = { v: 0 }
  return gsap.to(o, {
    v: 1,
    duration,
    ease,
    delay: opts.delay ?? 0,
    onUpdate: () => onUpdate(o.v),
    onComplete: opts.onComplete,
  })
}

export const isMobile = () => window.innerWidth < 820
export const isTouch = () => !window.matchMedia('(hover: hover) and (pointer: fine)').matches

export const easeInOutCubic2 = easeInOutCubic
/** Standard reveal factor: fades/translates in on enter, fades out fast on exit. */
export const fx = (sc: { enter: number; exit: number }, delay = 0) =>
  easeOutCubic(clamp(sc.enter * 1.6 - delay)) * Math.max(0, 1 - sc.exit * 2.4)
