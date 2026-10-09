// Indicador de secciones (puntos) + botón "Siguiente sección ↓".
// Nunca bloquea el scroll: solo observa qué sección está en pantalla.
import * as React from "react"

export interface NavSection {
  id: string
  label: string
}

export function SectionNav({ sections }: { sections: NavSection[] }) {
  const [current, setCurrent] = React.useState(0)

  React.useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[]
    const ratios = new Map<Element, number>()
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => ratios.set(e.target, e.intersectionRatio))
        let best = 0
        let bestRatio = -1
        els.forEach((el, i) => {
          const r = ratios.get(el) ?? 0
          if (r > bestRatio) {
            bestRatio = r
            best = i
          }
        })
        setCurrent(best)
      },
      { threshold: [0, 0.15, 0.3, 0.5, 0.7, 0.9, 1] },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [sections])

  const go = (i: number) => {
    const el = document.getElementById(sections[i]?.id ?? "")
    if (!el) return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" })
  }
  const isLast = current >= sections.length - 1

  return (
    <>
      <nav
        aria-label="Secciones"
        className="fixed bottom-3 left-3 z-40 rounded-full bg-black/70 px-2 py-1 backdrop-blur-sm sm:top-1/2 sm:right-4 sm:bottom-auto sm:left-auto sm:-translate-y-1/2 sm:px-1.5 sm:py-2"
      >
        <ol className="flex items-center gap-0.5 sm:flex-col sm:gap-1">
          {sections.map((s, i) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => go(i)}
                aria-label={s.label}
                aria-current={i === current ? "true" : undefined}
                title={s.label}
                className="group grid size-6 place-items-center"
              >
                <span
                  className={`block rounded-full transition-all ${
                    i === current ? "bg-amarillo h-2 w-4 sm:h-4 sm:w-2" : "size-2 bg-white/45 group-hover:bg-white"
                  }`}
                />
              </button>
            </li>
          ))}
        </ol>
      </nav>

      {!isLast ? (
        <button
          type="button"
          onClick={() => go(current + 1)}
          className="border-amarillo/70 hover:bg-amarillo fixed right-3 bottom-3 z-40 inline-flex h-10 items-center gap-1.5 rounded-full border bg-black/80 px-4 text-sm font-[600] text-white backdrop-blur-sm transition-colors hover:text-black sm:right-5 sm:bottom-5"
        >
          Siguiente sección <span aria-hidden>↓</span>
        </button>
      ) : null}
    </>
  )
}
