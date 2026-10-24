import { useEffect, useRef } from 'react'
import { subscribe, registerSection, SCENES, type DirectorState, type SceneId } from './director'

/** Subscribe to the single scroll tick. The callback mutates the DOM through refs; React never re-renders. */
export function useTick(fn: (s: DirectorState) => void) {
  const r = useRef(fn)
  r.current = fn
  useEffect(() => subscribe((s) => r.current(s)), [])
}

export function useSection<T extends HTMLElement = HTMLElement>(id: SceneId) {
  const ref = useRef<T>(null)
  useEffect(() => {
    registerSection(id, ref.current)
    return () => registerSection(id, null)
  }, [id])
  return ref
}

export const sceneIndex = (id: SceneId) => SCENES.findIndex((s) => s.id === id)

/** Runs once the preloader has split (immediately if it already has). */
export function useIntro(fn: () => void) {
  useEffect(() => {
    const h = () => fn()
    window.addEventListener('intro', h)
    if ((window as unknown as { __intro?: boolean }).__intro) h()
    return () => window.removeEventListener('intro', h)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
