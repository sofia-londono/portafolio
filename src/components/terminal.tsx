// Terminal semi-interactiva: 4 comandos (clic o teclado) que imprimen texto
// estático. Sin API. Texto real y seleccionable; efecto de tecleo solo si el
// usuario no pidió reducir el movimiento.
import * as React from "react"

import { WORKS } from "@/data/works"

type Line = { text: string; href?: string; dim?: boolean; download?: string }
type Entry = { cmd: string; lines: Line[] }

const PROMPT = "sofia@portafolio:~$"

function buildCommands(cvHref: string): Record<string, Line[]> {
  const projects = WORKS.filter((w) => !w.hidden)
  return {
    whoami: [
      { text: "Laura Sofía Londoño Pérez" },
      { text: "Ingeniería en Ciencias de la Computación e Inteligencia Artificial", dim: true },
      { text: "Universidad Sergio Arboleda · Bogotá · 2023 — hoy", dim: true },
      { text: "Aprendo construyendo: problemas concretos, soluciones que alguien usa." },
    ],
    proyectos: projects.map((w) => ({
      text: [w.year ?? "    ", w.title, w.role ? `— ${w.role}` : w.collection ? `— ${w.collection}` : ""].join("  ").trim(),
    })),
    // Solo fechas confirmadas. Las que no tienen mes quedan con el año.
    "git log": [
      { text: "oct 2026  Portafolio para 30X: rueda de proyectos, terminal y fichas" },
      { text: "jul 2026  Bancoldex: agente RAG desplegado en AWS" },
      { text: "jun 2026  Bancoldex: stack elegido componente por componente" },
      { text: "2026      MVP Predicciones del Mundial 2026, en 4 días" },
      { text: "2024      DataMind: finalista del Hackathon TalentoTECH" },
    ],
    contacto: [
      { text: "correo    sofialp5w@gmail.com", href: "mailto:sofialp5w@gmail.com" },
      { text: "linkedin  linkedin.com/in/sofia-londono-perez", href: "https://www.linkedin.com/in/sofia-londono-perez/" },
      { text: "cv        cv-sofia-londono.pdf  (descargar)", href: cvHref, download: "cv-sofia-londono.pdf" },
    ],
  }
}

const HELP: Line[] = [
  { text: "Comandos: whoami · proyectos · git log · contacto · clear", dim: true },
]

function useReducedMotion() {
  const [r, setR] = React.useState(false)
  React.useEffect(() => {
    const q = window.matchMedia("(prefers-reduced-motion: reduce)")
    const read = () => setR(q.matches)
    read()
    q.addEventListener("change", read)
    return () => q.removeEventListener("change", read)
  }, [])
  return r
}

export function Terminal({ cvHref, className = "" }: { cvHref: string; className?: string }) {
  const commands = React.useMemo(() => buildCommands(cvHref), [cvHref])
  const reduced = useReducedMotion()
  const [log, setLog] = React.useState<Entry[]>([{ cmd: "whoami", lines: commands.whoami }])
  const [typed, setTyped] = React.useState(Infinity) // caracteres visibles de la última salida
  const [value, setValue] = React.useState("")
  const [focused, setFocused] = React.useState(false)
  const bodyRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const run = (raw: string) => {
    const cmd = raw.trim().toLowerCase().replace(/\s+/g, " ")
    if (!cmd) return
    if (cmd === "clear") {
      setLog([])
      return
    }
    const lines = commands[cmd] ?? (cmd === "help" ? HELP : [{ text: `${cmd}: comando no encontrado`, dim: true }, ...HELP])
    setLog((l) => [...l.slice(-3), { cmd, lines }])
    setTyped(reduced ? Infinity : 0)
  }

  // Efecto de tecleo sobre la última salida.
  const last = log[log.length - 1]
  const total = last ? last.lines.reduce((n, l) => n + l.text.length + 1, 0) : 0
  React.useEffect(() => {
    if (typed >= total) return
    const id = window.setTimeout(() => setTyped((t) => t + 6), 12)
    return () => window.clearTimeout(id)
  }, [typed, total])

  React.useEffect(() => {
    const el = bodyRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [log, typed])

  const renderLines = (lines: Line[], visible: number) => {
    let left = visible
    return lines.map((l, i) => {
      if (left <= 0) return null
      const shown = l.text.slice(0, left)
      left -= l.text.length + 1
      const done = shown.length === l.text.length
      const cls = l.dim ? "text-muted-foreground" : "text-foreground"
      return (
        <div key={i} className={`${cls} whitespace-pre-wrap break-words`}>
          {l.href && done ? (
            <a
              href={l.href}
              className="hover:text-amarillo underline decoration-white/30 underline-offset-4"
              {...(l.download ? { download: l.download } : { target: "_blank", rel: "noopener noreferrer" })}
            >
              {shown}
            </a>
          ) : (
            shown
          )}
        </div>
      )
    })
  }

  return (
    <div className={`overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d0d] shadow-[0_30px_80px_-30px_rgba(0,0,0,.9)] ${className}`}>
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
        <span className="size-3 rounded-full bg-white/15" />
        <span className="size-3 rounded-full bg-white/15" />
        <span className="bg-amarillo size-3 rounded-full" />
        <span className="text-muted-foreground ml-3 font-mono text-xs">terminal — sofía</span>
      </div>

      {/* Comandos clicables */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 px-4 py-3" role="group" aria-label="Comandos">
        {Object.keys(commands).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => run(c)}
            className="hover:border-amarillo hover:text-amarillo rounded-full border border-white/15 px-3 py-1 font-mono text-xs transition-colors"
          >
            {c}
          </button>
        ))}
      </div>

      <div
        ref={bodyRef}
        className="h-[min(52svh,380px)] overflow-y-auto px-5 py-4 font-mono text-[0.85rem] leading-relaxed sm:text-[0.9rem]"
        role="log"
        aria-live="polite"
        aria-label="Salida de la terminal"
        onClick={() => inputRef.current?.focus({ preventScroll: true })}
      >
        {log.map((e, i) => (
          <div key={i} className="mb-4">
            <div>
              <span className="text-amarillo">{PROMPT}</span> <span className="text-foreground">{e.cmd}</span>
            </div>
            <div className="mt-1 grid gap-0.5">{renderLines(e.lines, i === log.length - 1 ? typed : Infinity)}</div>
          </div>
        ))}
        <form
          className="flex items-center gap-2"
          onSubmit={(ev) => {
            ev.preventDefault()
            run(value)
            setValue("")
          }}
        >
          <label htmlFor="term-input" className="text-amarillo shrink-0">{PROMPT}</label>
          <span className="relative min-w-0 flex-1">
            <input
              id="term-input"
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              aria-describedby="term-help"
              className="caret-amarillo w-full bg-transparent font-mono outline-none focus-visible:outline-none"
            />
            {value || focused ? null : (
              <span aria-hidden className="term-cursor bg-foreground pointer-events-none absolute top-1/2 left-0 h-[1.1em] w-[0.55em] -translate-y-1/2" />
            )}
          </span>
        </form>
        <p id="term-help" className="sr-only">Escribe whoami, proyectos, git log o contacto y presiona Enter.</p>
      </div>
    </div>
  )
}
