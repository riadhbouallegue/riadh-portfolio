import { useEffect, useRef, useState } from 'react'
import Stage from './components/Stage'
import { Cursor, Hud, Preloader } from './components/Chrome'
import { boot } from './engine/director'
import { startLoading } from './engine/frames'
import Hero from './scenes/Hero'
import About from './scenes/About'
import Work from './scenes/Work'
import Journey from './scenes/Journey'
import Skills from './scenes/Skills'
import Awards from './scenes/Awards'
import Contact from './scenes/Contact'

export default function App() {
  const [layers, setLayers] = useState<{ back: HTMLElement; front: HTMLElement } | null>(null)
  const back = useRef<HTMLDivElement>(null)
  const front = useRef<HTMLDivElement>(null)
  const progress = useRef(0)
  const isReady = useRef(false)

  useEffect(() => {
    setLayers({ back: back.current!, front: front.current! })
    boot()
    startLoading(
      (p) => { progress.current = p },
      () => { isReady.current = true },
    )
  }, [])

  return (
    <>
      <div className="layer-back" ref={back} />
      <Stage />
      <div className="layer-front" ref={front} />
      <main>
        {layers && (
          <>
            <Hero back={layers.back} />
            <About back={layers.back} />
            <Work back={layers.back} />
            <Journey back={layers.back} />
            <Skills back={layers.back} front={layers.front} />
            <Awards />
            <Contact back={layers.back} />
          </>
        )}
      </main>
      <Hud />
      <Cursor />
      <Preloader getProgress={() => progress.current} ready={() => isReady.current} />
    </>
  )
}
