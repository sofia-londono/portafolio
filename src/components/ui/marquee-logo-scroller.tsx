import * as React from "react"

import { cn } from "@/lib/utils"

// Adaptado de MarqueeLogoScroller (21st.dev) para el portafolio:
// - Logos como íconos SVG (simple-icons) en vez de imágenes externas; si una
//   herramienta no tiene ícono, se muestra como chip de texto.
// - Los degradados del hover salen de la paleta de la galería.
// - Velocidades "normal" y "slow" (sin "fast").
// - prefers-reduced-motion: sin animación; la lista se muestra envuelta y completa.
// - La copia duplicada (para el bucle) es aria-hidden; pausa con hover y foco.

export interface MarqueeIcon {
  /** `path` de 24×24 de simple-icons. */
  path: string
}

export interface MarqueeLogo {
  name: string
  icon?: MarqueeIcon
  /** Logo como imagen (cuando no hay ícono en simple-icons). */
  src?: string
  gradient: { from: string; via: string; to: string }
}

interface MarqueeLogoScrollerProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
  logos: MarqueeLogo[]
  speed?: "normal" | "slow"
  /** Dirección del desplazamiento. */
  reverse?: boolean
  /** Etiqueta accesible de la lista. */
  label: string
}

const DURATION = { normal: "45s", slow: "80s" } as const

function Tile({ logo }: { logo: MarqueeLogo }) {
  return (
    <div className="group relative flex h-24 w-40 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/[.04]">
      <div
        aria-hidden
        style={{ "--from": logo.gradient.from, "--via": logo.gradient.via, "--to": logo.gradient.to } as React.CSSProperties}
        className="absolute inset-0 scale-150 bg-gradient-to-br from-[var(--from)] via-[var(--via)] to-[var(--to)] opacity-0 transition-all duration-700 ease-out group-hover:scale-100 group-hover:opacity-100"
      />
      <div className="relative flex flex-col items-center gap-2 text-white transition-colors duration-500 group-hover:text-black">
        {logo.src ? (
          <img src={logo.src} alt="" className="h-8 w-auto max-w-20 object-contain transition duration-500 group-hover:invert" draggable={false} />
        ) : logo.icon ? (
          <svg viewBox="0 0 24 24" className="size-8" fill="currentColor" aria-hidden>
            <path d={logo.icon.path} />
          </svg>
        ) : (
          <span className="rounded-md border border-current/40 px-2 py-1 font-mono text-sm leading-none">{logo.name}</span>
        )}
        {logo.icon || logo.src ? <span className="text-xs opacity-80">{logo.name}</span> : null}
      </div>
    </div>
  )
}

function useReducedMotion() {
  const [r, setR] = React.useState(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches)
  React.useEffect(() => {
    const q = window.matchMedia("(prefers-reduced-motion: reduce)")
    const read = () => setR(q.matches)
    q.addEventListener("change", read)
    return () => q.removeEventListener("change", read)
  }, [])
  return r
}

const MarqueeLogoScroller = React.forwardRef<HTMLDivElement, MarqueeLogoScrollerProps>(
  ({ title, description, logos, speed = "normal", reverse = false, label, className, ...props }, ref) => {
    const reduced = useReducedMotion()

    return (
      <div ref={ref} className={cn("w-full min-w-0 text-foreground", className)} {...props}>
        <style>{`
          @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
          .marquee-track:hover, .marquee-track:focus-within { animation-play-state: paused !important; }
        `}</style>

        {title || description ? (
          <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-[3fr_2fr] lg:gap-8">
            {title ? <h3 className="text-2xl font-[650] tracking-tight text-balance md:text-3xl">{title}</h3> : null}
            {description ? <p className="text-muted-foreground self-start text-balance lg:justify-self-end">{description}</p> : null}
          </div>
        ) : null}

        {reduced ? (
          <ul aria-label={label} className="flex flex-wrap gap-3">
            {logos.map((l) => (
              <li key={l.name}><Tile logo={l} /></li>
            ))}
          </ul>
        ) : (
          <div
            className="w-full overflow-hidden"
            style={{ maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)" }}
          >
            <div
              className="marquee-track flex w-max items-center gap-3 py-2 pr-3"
              style={{ animation: `marquee ${DURATION[speed]} linear infinite${reverse ? " reverse" : ""}` }}
            >
              <ul aria-label={label} className="flex items-center gap-3">
                {logos.map((l) => (
                  <li key={l.name}><Tile logo={l} /></li>
                ))}
              </ul>
              <ul aria-hidden className="flex items-center gap-3">
                {logos.map((l) => (
                  <li key={l.name}><Tile logo={l} /></li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    )
  },
)

MarqueeLogoScroller.displayName = "MarqueeLogoScroller"

export { MarqueeLogoScroller }
