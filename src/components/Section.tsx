import type { ReactNode } from 'react'
import { HEIGHTS, type SceneId } from '../engine/director'
import { useSection } from '../engine/hooks'

/** Tall section → sticky 100vh stage → inner overflow:hidden. */
export default function Section({ id, children }: { id: SceneId; children: ReactNode }) {
  const ref = useSection<HTMLElement>(id)
  return (
    <section ref={ref} id={id} className={`scene scene-${id}`} style={{ height: `${HEIGHTS[id]}vh` }}>
      <div className="sticky">
        <div className="inner">{children}</div>
      </div>
    </section>
  )
}

export const Label = ({ n, children, className = '' }: { n: string; children: ReactNode; className?: string }) => (
  <div className={`label ${className}`}>
    (<b>{n}</b>) — {children}
  </div>
)
