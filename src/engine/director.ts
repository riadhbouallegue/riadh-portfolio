import gsap from 'gsap'
import Lenis from 'lenis'
import { clamp, easeInOutSine, easeOutQuart } from './anim'

export type SceneId = 'hero' | 'about' | 'work' | 'journey' | 'skills' | 'awards' | 'contact'

export interface SceneDef {
  id: SceneId
  label: string
  from: number // video frame (to < from plays in reverse)
  to: number
  x: number // horizontal anchor of the person (0..1)
  k: number // scale factor
}

// 240 frames, one continuous take, cut in four logical shots (see manifest.json):
// S1 standing/turning · S2 profile · S3 seated at the laptop · S4 getting up, facing camera.
// Filled from the manifest at boot so the engine never hard-codes frame numbers.
export const SCENES: SceneDef[] = [
  { id: 'hero', label: 'Accueil', from: 0, to: 0, x: 0.7, k: 1.0 },
  { id: 'about', label: 'À propos', from: 0, to: 0, x: 0.27, k: 1.0 },
  { id: 'work', label: 'Missions', from: 0, to: 0, x: 0.77, k: 0.86 },
  { id: 'journey', label: 'Parcours', from: 0, to: 0, x: 0.26, k: 1.0 },
  { id: 'skills', label: 'Outils', from: 0, to: 0, x: 0.5, k: 0.98 },
  { id: 'awards', label: 'Distinctions', from: 0, to: 0, x: 0.75, k: 1.0 },
  { id: 'contact', label: 'Contact', from: 0, to: 0, x: 0.5, k: 1.0 },
]

export interface Manifest {
  w: number
  h: number
  count: number
  shots: { from: number; to: number; box: [number, number, number, number]; cx: number }[]
}

/** Map the shots onto scenes as specified: S4 is split 60 / 25 / 15 %, contact = S1 reversed. */
export function applyManifest(m: Manifest) {
  const [s1, s2, s3, s4] = m.shots
  const n4 = s4.to - s4.from
  const a = Math.round(s4.from + n4 * 0.6)
  const b = Math.round(s4.from + n4 * 0.85)
  const set = (i: number, from: number, to: number) => {
    SCENES[i].from = from
    SCENES[i].to = to
  }
  set(0, s1.from, s1.to)
  set(1, s2.from, s2.to)
  set(2, s3.from, s3.to)
  set(3, s4.from, a)
  set(4, a, b)
  set(5, b, s4.to)
  set(6, s1.to, s1.from)
}

export const HEIGHTS: Record<SceneId, number> = {
  hero: 230, about: 280, work: 460, journey: 240, skills: 280, awards: 320, contact: 240,
}

export interface SceneState {
  id: SceneId
  top: number
  h: number
  enter: number
  p: number
  exit: number
  vis: number
}

export interface Frame {
  scene: number // active scene index
  t: number // blade progress 0..1 (eased)
  a: number // outgoing frame (fractional)
  b: number // incoming frame (fractional)
  prev: number // outgoing scene index
}

export interface DirectorState {
  y: number
  vh: number
  vw: number
  max: number
  progress: number
  scenes: SceneState[]
  frame: Frame
  ready: boolean
}

export const state: DirectorState = {
  y: 0, vh: 1, vw: 1, max: 1, progress: 0,
  scenes: SCENES.map((s) => ({ id: s.id, top: 0, h: 0, enter: 0, p: 0, exit: 0, vis: 0 })),
  frame: { scene: 0, t: 1, a: 0, b: 0, prev: 0 },
  ready: false,
}

type Sub = (s: DirectorState) => void
const subs = new Set<Sub>()
export function subscribe(fn: Sub) {
  subs.add(fn)
  fn(state)
  return () => void subs.delete(fn)
}

const els = new Map<SceneId, HTMLElement>()
export function registerSection(id: SceneId, el: HTMLElement | null) {
  if (el) els.set(id, el)
  else els.delete(id)
  measure()
}

let lenis: Lenis | null = null
let ro: ResizeObserver | null = null

function measure() {
  state.vh = window.innerHeight
  state.vw = window.innerWidth
  state.max = Math.max(1, document.documentElement.scrollHeight - state.vh)
  SCENES.forEach((s, i) => {
    const el = els.get(s.id)
    if (!el) return
    const r = el.getBoundingClientRect()
    state.scenes[i].top = r.top + window.scrollY
    state.scenes[i].h = r.height
  })
}

export function frameOf(i: number, p: number) {
  const s = SCENES[i]
  return s.from + (s.to - s.from) * p
}

function tick() {
  const y = window.scrollY
  const { vh } = state
  state.y = y
  state.progress = clamp(y / state.max)
  const lead = 0.78 * vh
  const span = 0.62 * vh

  let active = 0
  SCENES.forEach((_, i) => {
    const sc = state.scenes[i]
    sc.enter = clamp((y - (sc.top - vh)) / vh)
    sc.p = clamp((y - sc.top) / Math.max(1, sc.h - vh))
    sc.exit = clamp((y - (sc.top + sc.h - vh)) / vh)
    sc.vis = clamp(Math.min(sc.enter * 1.6, 1 - sc.exit * 2.2))
    if (y >= sc.top - lead) active = i
  })

  const f = state.frame
  f.scene = active
  if (active === 0) {
    f.t = 1
    f.prev = 0
    f.a = f.b = frameOf(0, state.scenes[0].p)
  } else {
    const sc = state.scenes[active]
    const tt = clamp((y - (sc.top - lead)) / span)
    f.t = easeInOutSine(tt)
    f.prev = active - 1
    f.a = SCENES[active - 1].to
    f.b = frameOf(active, sc.p)
    if (tt >= 1) f.a = f.b
  }
  subs.forEach((fn) => fn(state))
}

let booted = false
export function boot() {
  if (booted) return
  booted = true
  history.scrollRestoration = 'manual'
  window.scrollTo(0, 0)

  lenis = new Lenis({ lerp: 0.075, smoothWheel: true, wheelMultiplier: 0.9, touchMultiplier: 1.4, autoRaf: false } as ConstructorParameters<typeof Lenis>[0])
  lenis.stop()
  gsap.ticker.lagSmoothing(0)
  gsap.ticker.add((time: number) => {
    lenis!.raf(time * 1000)
    tick() // one rAF tick drives everything
  })

  ro = new ResizeObserver(() => measure())
  ro.observe(document.body)
  els.forEach((el) => ro!.observe(el))
  window.addEventListener('resize', measure)
  measure()
  state.ready = true
}

export function start() {
  lenis?.start()
}
export function stop() {
  lenis?.stop()
}

export function scrollToScene(id: SceneId) {
  const i = SCENES.findIndex((s) => s.id === id)
  const sc = state.scenes[i]
  if (!sc || !lenis) return
  // land inside the scene, once its transition has fully played
  const target = i === 0 ? 0 : sc.top + 2
  lenis.scrollTo(target, { duration: 2.2, easing: easeOutQuart })
}

export function scrollToTop() {
  lenis?.scrollTo(0, { duration: 2.4, easing: easeOutQuart })
}
