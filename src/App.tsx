import * as React from "react"

import { Cover } from "@/art/covers"
import cvUrl from "@/assets/cv-sofia-londono.pdf?url"
import { Cuadrilla } from "@/components/cuadrilla"
import { SectionNav, type NavSection } from "@/components/section-nav"
import { Terminal } from "@/components/terminal"
import { GradientBackground } from "@/components/ui/dark-gradient-background"
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { WorksWheel, type WorksWheelHandle } from "@/components/ui/works-wheel"
import { WORKS, type Work } from "@/data/works"

const Herramientas = React.lazy(() => import("@/components/herramientas"))

/** Monta a los hijos solo cuando el contenedor está cerca de la pantalla. */
function LazyWhenNear({ children, minHeight, className }: { children: React.ReactNode; minHeight: string; className?: string }) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [near, setNear] = React.useState(false)
  React.useEffect(() => {
    const el = ref.current
    if (!el || near) return
    const io = new IntersectionObserver((e) => e.some((x) => x.isIntersecting) && setNear(true), { rootMargin: "600px 0px" })
    io.observe(el)
    return () => io.disconnect()
  }, [near])
  return <div ref={ref} className={className} style={{ minHeight: near ? undefined : minHeight }}>{near ? children : null}</div>
}

const visible = WORKS.filter((w) => !w.hidden)
const CV = { href: cvUrl, download: "cv-sofia-londono.pdf" }

function useMedia(query: string) {
  const [m, setM] = React.useState(() => typeof window !== "undefined" && window.matchMedia(query).matches)
  React.useEffect(() => {
    const q = window.matchMedia(query)
    const read = () => setM(q.matches)
    read()
    q.addEventListener("change", read)
    return () => q.removeEventListener("change", read)
  }, [query])
  return m
}

/* ---------------- Ficha del proyecto ---------------- */
function Ficha({ work }: { work: Work }) {
  const [videoFailed, setVideoFailed] = React.useState(false)
  // Si el video no carga y hay galería, no repetir la misma imagen arriba.
  const hideMain = videoFailed && !!work.gallery?.length
  const facts: [string, string | undefined][] = [
    ["Stack", work.technique],
    ["Tiempo", work.dimensions],
    ["Contexto", work.collection],
    ["Rol", work.role],
    ["Estado", work.status],
  ]
  const lines = ([
    ["Problema", work.problem],
    ["Decisión", work.decision],
    ["Resultado", work.result],
  ] as [string, string | undefined][]).filter(([, v]) => v)
  return (
    <div className="flex min-h-0 flex-col gap-6 overflow-y-auto px-6 pt-14 pb-10 sm:px-8">
      <figure className={hideMain ? "hidden" : "shrink-0"}>
        <div className="aspect-[29/20] w-full overflow-hidden rounded-xl ring-1 ring-white/10">
          {work.video && !videoFailed ? <FichaVideo work={work} onFail={() => setVideoFailed(true)} /> : <Cover kind={work.cover} image={work.image} />}
        </div>
        {work.recreation && !work.image ? (
          <figcaption className="text-muted-foreground mt-2 text-xs">Recreación ilustrativa del producto; los datos son de ejemplo.</figcaption>
        ) : null}
      </figure>
      {work.gallery?.length ? (
        <div className="grid shrink-0 gap-3">
          {work.gallery.map((g) => (
            <figure key={g.src}>
              <img src={g.src} alt={g.alt} loading="lazy" className="w-full rounded-xl ring-1 ring-white/10" />
              {g.caption ? <figcaption className="text-muted-foreground mt-2 text-xs">{g.caption}</figcaption> : null}
            </figure>
          ))}
        </div>
      ) : null}
      <div>
        <SheetTitle className="text-[1.6rem] leading-tight font-[600]">
          {work.title}
          {work.year ? <span className="text-muted-foreground font-normal">, {work.year}</span> : null}
        </SheetTitle>
        <SheetDescription className="text-foreground/90 mt-3 text-[1rem] leading-relaxed">{work.summary}</SheetDescription>
        <dl className="text-muted-foreground mt-4 grid gap-1 text-[0.95rem] leading-snug">
          {facts.filter(([, v]) => v).map(([k, v]) => (
            <div key={k} className="grid grid-cols-[5.5rem_1fr] gap-3">
              <dt className="text-foreground/60">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </div>
      {lines.length ? (
        <dl className="grid gap-4 border-t border-white/15 pt-5">
          {lines.map(([k, v]) => (
            <div key={k} className="grid gap-1 sm:grid-cols-[7.5rem_1fr] sm:gap-4">
              <dt className="text-amarillo font-[600]">{k}</dt>
              <dd className="leading-relaxed">{v}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {work.links?.length ? <Links work={work} /> : null}
    </div>
  )
}

/** Video de la ficha: solo existe mientras la ficha está abierta (se desmonta al
    cerrarla, así que se detiene y libera). Con reduced-motion muestra el póster. */
function FichaVideo({ work, onFail }: { work: Work; onFail?: () => void }) {
  const ref = React.useRef<HTMLVideoElement>(null)
  const reduced = useMedia("(prefers-reduced-motion: reduce)")
  const [failed, setFailed] = React.useState(false)
  React.useEffect(() => {
    const v = ref.current
    if (!v || reduced) return
    v.play().catch(() => {})
    return () => v.pause()
  }, [reduced])
  if (failed) return <Cover kind={work.cover} image={work.image} />
  if (reduced) {
    return work.poster ? <img src={work.poster} alt="" className="size-full object-cover" /> : <Cover kind={work.cover} image={work.image} />
  }
  return (
    <video
      ref={ref}
      src={work.video}
      poster={work.poster}
      className="size-full object-cover"
      muted
      loop
      playsInline
      preload="metadata"
      controls
      aria-label={`Video del ${work.title}`}
      onError={() => { setFailed(true); onFail?.() }}
    />
  )
}

function Links({ work }: { work: Work }) {
  return (
    <ul className="flex flex-wrap gap-x-6 gap-y-3">
      {work.links!.map((l) => (
        <li key={l.href}>
          <a className="font-[600] underline decoration-1 underline-offset-4 hover:decoration-2" href={l.href} target="_blank" rel="noopener noreferrer">
            {l.label} ↗
          </a>
          {l.note ? <span className="text-muted-foreground block text-sm">{l.note}</span> : null}
        </li>
      ))}
    </ul>
  )
}
/* ---------------- Fuera del código + Trayectoria (datos del CV) ---------------- */
const FUERA: { t: string; big: string; small: string }[] = [
  { t: "Idiomas", big: "Español e inglés; estudio mandarín y alemán.", small: "Español nativo · Inglés B2 · Mandarín HSK3 · Alemán A2" },
  { t: "Voluntariado", big: "Colombia Tech Fest", small: "Voluntaria en la atención a speakers." },
  { t: "Robótica", big: "Competencia USA BOT", small: "Un robot autónomo que sigue líneas con visión por computador." },
]

const CV_FACTS: { t: string; items: string[] }[] = [
  { t: "Experiencia", items: ["Bancóldex · Práctica en Gestión del Talento Humano"] },
  { t: "Formación", items: ["Ing. en Ciencias de la Computación e IA · U. Sergio Arboleda", "Talento Tech · Bootcamps de IA y de Análisis de Datos"] },
]

const SECTIONS: NavSection[] = [
  { id: "inicio", label: "Inicio" },
  { id: "sobre-mi", label: "Sobre mí" },
  { id: "proyectos", label: "Proyectos" },
  { id: "herramientas", label: "Herramientas" },
  { id: "fuera-del-codigo", label: "Fuera del código" },
  { id: "contacto", label: "Contacto" },
]

const H2 = "text-[clamp(2.2rem,6vw,4.5rem)] leading-[0.95] font-[700] tracking-[-0.03em] [font-stretch:115%]"

/* ---------------- Página ---------------- */
export default function App() {
  const wheel = React.useRef<WorksWheelHandle>(null)
  const [active, setActive] = React.useState(0)
  const [opened, setOpened] = React.useState(false)
  const [open, setOpen] = React.useState<number | null>(null)
  const wide = useMedia("(min-width: 768px)")
  const heroRef = React.useRef<HTMLDivElement>(null)
  const wordRef = React.useRef<HTMLSpanElement>(null)

  // Enlace directo a un proyecto: #proyecto/<id>
  React.useEffect(() => {
    const m = location.hash.match(/^#proyecto\/(.+)$/)
    if (!m) return
    const i = visible.findIndex((w) => w.id === m[1])
    if (i >= 0) {
      document.getElementById("proyectos")?.scrollIntoView()
      wheel.current?.go(i)
      setOpen(i)
    }
  }, [])

  const openWork = (i: number) => {
    setOpen(i)
    history.replaceState(null, "", `#proyecto/${visible[i].id}`)
  }
  const close = () => {
    setOpen(null)
    history.replaceState(null, "", location.pathname + location.search)
  }
  const current = visible[active]

  return (
    <>
      <a href="#proyectos" className="bg-amarillo absolute -left-[999px] top-2 z-50 px-3 py-2 text-black focus:left-4">
        Saltar a los proyectos
      </a>

      <main>
        {/* 1 · Portada */}
        <GradientBackground id="inicio" className="snap-start">
          <div ref={heroRef} className="relative mx-auto flex min-h-svh max-w-[1400px] flex-col px-5 sm:px-10">
            <Cuadrilla word={wordRef} hero={heroRef} />
            <header className="flex h-16 items-center gap-6">
              <span className="font-[620] tracking-tight">Sofía Londoño Pérez</span>
              <nav aria-label="Principal" className="ml-auto">
                <ul className="flex gap-5 text-[0.95rem] text-white/80">
                  <li><a className="hover:text-white" href="#proyectos">Proyectos</a></li>
                  <li><a className="hover:text-white" {...CV}>CV</a></li>
                  <li className="hidden sm:block"><a className="hover:text-white" href="#contacto">Contacto</a></li>
                </ul>
              </nav>
            </header>

            <div className="flex flex-1 flex-col justify-center gap-7 pb-10">
              <p className="text-amarillo text-[0.95rem] font-[560] tracking-wide">Builder en 30X</p>
              {/* El pb deja la franja donde trabaja la cuadrilla, entre el título y el párrafo. */}
              <h1 className="pb-2 text-[clamp(2.4rem,6.5vw,5rem)] leading-[0.95] font-[720] tracking-[-0.03em] [font-stretch:108%] sm:pb-7">
                Aprendo <span ref={wordRef}>construyendo.</span>
              </h1>
              <p className="max-w-[60ch] text-[clamp(1.05rem,1.6vw,1.3rem)] leading-relaxed text-white/80">
                Estudio Ciencias de la Computación e Inteligencia Artificial con un enfoque en la ingeniería de software y el backend. Impulsada por una curiosidad constante por entender cómo funcionan los sistemas por dentro, me apasiona transformar problemas complejos en código limpio, APIs escalables y herramientas potenciadas por IA.
              </p>
              <div className="flex flex-wrap gap-3">
                <a href="#proyectos" className="bg-amarillo inline-flex h-12 items-center px-6 font-[650] text-black hover:brightness-105">Ver proyectos ↓</a>
                <a {...CV} className="inline-flex h-12 items-center border border-white/40 px-6 font-[600] hover:border-white">Descargar CV</a>
              </div>
            </div>

            <div className="grid gap-1 pb-20 text-[0.95rem] font-[560] text-black sm:grid-cols-2 sm:pb-8">
              <p>Ciencias de la Computación e IA</p>
              <p className="sm:text-right sm:pr-44">Universidad Sergio Arboleda · Bogotá</p>
            </div>
          </div>
        </GradientBackground>

        {/* 2 · Sobre mí: texto a un lado, terminal al otro. El fondo arranca en el
              amarillo con el que termina la portada y baja a negro, sin corte. */}
        <section id="sobre-mi" aria-labelledby="t-sobre" className="flex min-h-svh snap-start flex-col justify-center"
          style={{ background: "linear-gradient(180deg, #ddf46b 0px, #b5c945 32px, #6b7a1f 80px, #2a300d 135px, #0d0f06 185px, #050505 240px)" }}>
          <div className="mx-auto grid w-full max-w-[1400px] items-center gap-10 px-5 pt-60 pb-24 sm:px-10 md:pr-16 lg:grid-cols-[1fr_1.1fr] lg:gap-16 lg:py-24">
            <div className="grid gap-5">
              <h2 id="t-sobre" className={H2}>Sobre mí</h2>
              <p className="max-w-[46ch] text-[1.15rem] leading-relaxed">
                Mi metodología de trabajo se basa en la experimentación constante. Si me enfrento a algo desconocido, construyo un prototipo rápido, evalúo los resultados y lo perfecciono hasta lograr una solución funcional.
              </p>
              <p className="text-muted-foreground max-w-[48ch] text-[1.05rem] leading-relaxed">
                Así he llegado a desarrollar proyectos muy distintos: desde un agente de IA durante mis pasantías en Bancóldex o un robot autónomo que sigue líneas con visión por computador, hasta un juego de karts en Unity inspirado en Sugar Rush y pequeñas herramientas para mi día a día.
              </p>
              <p className="text-muted-foreground max-w-[48ch] text-[1.05rem] leading-relaxed">
                Esa misma curiosidad me mueve fuera del código: hablo español e inglés, estudio chino mandarín y alemán, y me formo como ingeniera en la Universidad Sergio Arboleda.
              </p>
              <p className="text-muted-foreground text-sm">Prueba la terminal: haz clic en un comando o escríbelo.</p>
            </div>
            <Terminal cvHref={cvUrl} />
          </div>
        </section>

        {/* 3 · Proyectos */}
        <section
          id="proyectos"
          aria-labelledby="t-proyectos"
          className="relative flex min-h-svh snap-start flex-col bg-[#050505]"
        >
          <div className="mx-auto grid w-full max-w-[1400px] flex-1 grid-cols-1 md:grid-cols-[minmax(280px,26%)_1fr] md:pr-12">
            {/* Panel izquierdo: el proyecto al frente, con su descripción */}
            <div className="relative z-10 hidden flex-col justify-center gap-5 px-5 pt-24 sm:px-10 md:flex" aria-live="polite">
              {!opened ? (
                <>
                  <h2 id="t-proyectos" className={H2}>Proyectos</h2>
                  <p className="text-muted-foreground max-w-[34ch] text-[1.05rem] leading-relaxed">
                    Una selección de algunos de los proyectos, herramientas y prototipos en los que he trabajado. Interactúa con la rueda para explorar cada ficha.
                  </p>
                  <p className="text-muted-foreground text-sm">Estado: continuando…</p>
                </>
              ) : (
                <>
                  <p className="text-muted-foreground text-sm tabular-nums">{active + 1} / {visible.length}{current?.status ? ` · ${current.status}` : ""}</p>
                  <h3 className="text-[clamp(1.6rem,2.6vw,2.4rem)] leading-[1.05] font-[680] tracking-[-0.02em]">{current?.title}</h3>
                  <p className="text-foreground/85 max-w-[38ch] text-[1.05rem] leading-relaxed">{current?.summary}</p>
                  {current?.technique ? <p className="text-muted-foreground max-w-[40ch] text-sm">{current.technique}</p> : null}
                  <div className="flex flex-wrap items-center gap-4">
                    <button type="button" onClick={() => openWork(active)} className="bg-amarillo h-11 rounded-full px-5 font-[650] text-black">Ver ficha completa</button>
                  </div>
                </>
              )}
            </div>

            {/* Rueda */}
            <div className="flex min-w-0 flex-col pt-16 md:pt-20">
              <h2 className="sr-only md:hidden">Proyectos</h2>
              <div className="relative min-h-[440px] flex-1">
                <WorksWheel
                  controlRef={wheel}
                  className="absolute inset-0 bg-transparent"
                  items={visible.map((w) => ({
                    id: w.id,
                    title: w.title,
                    cover: <Cover kind={w.cover} image={w.image} />,
                  }))}
                  label="Rueda de Proyectos"
                  sublabel="Gira la rueda y selecciona una ficha"
                  action="Ver ficha"
                  showTitle={false}
                  showIndex={false}
                  onSelect={openWork}
                  onActiveChange={setActive}
                  onOpenChange={setOpened}
                  onEdge={(dir) => {
                    const id = dir > 0 ? "herramientas" : "sobre-mi"
                    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
                    document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" })
                  }}
                />
              </div>

              {/* Celular: descripción del proyecto al frente */}
              <div className="px-5 pt-2 md:hidden" aria-live="polite">
                <p className="text-muted-foreground text-xs tabular-nums">{active + 1} / {visible.length}</p>
                <p className="text-[1.15rem] leading-tight font-[650]">{current?.title}</p>
                <p className="text-foreground/80 mt-1 line-clamp-3 text-[0.95rem] leading-snug">{current?.summary}</p>
              </div>

              <div className="flex items-center justify-center gap-2 px-5 py-5">
                <button type="button" onClick={() => wheel.current?.prev()} className="grid size-11 place-items-center rounded-full border border-white/25 hover:border-white" aria-label="Proyecto anterior">‹</button>
                <button type="button" onClick={() => { wheel.current?.go(active); openWork(active) }} className="bg-amarillo h-11 rounded-full px-5 font-[650] text-black">Ver ficha</button>
                <button type="button" onClick={() => wheel.current?.next()} className="grid size-11 place-items-center rounded-full border border-white/25 hover:border-white" aria-label="Proyecto siguiente">›</button>
              </div>
            </div>
          </div>

        </section>

        {/* 4 · Herramientas (se carga cuando se acerca a la pantalla) */}
        <section id="herramientas" aria-labelledby="t-herr" className="flex min-h-svh snap-start flex-col justify-center border-t border-white/10">
          <h2 id="t-herr" className="sr-only">Herramientas</h2>
          <LazyWhenNear minHeight="80svh" className="min-w-0">
            <React.Suspense fallback={null}>
              <Herramientas />
            </React.Suspense>
          </LazyWhenNear>
        </section>

        {/* 5 · Fuera del código + Trayectoria compacta */}
        <section id="fuera-del-codigo" aria-labelledby="t-fuera" className="flex min-h-svh snap-start flex-col justify-center border-t border-white/10">
          <div className="mx-auto w-full max-w-[1400px] px-5 py-16 sm:px-10 md:pr-16">
            <h2 id="t-fuera" className={`${H2} mb-10`}>Fuera del código</h2>
            <ul className="grid gap-8 border-y border-white/10 py-8 md:grid-cols-3 md:gap-10">
              {FUERA.map((f) => (
                <li key={f.t} className="grid content-start gap-2">
                  <p className="text-amarillo text-sm font-[650]">{f.t}</p>
                  <p className="text-[clamp(1.25rem,2vw,1.6rem)] leading-tight font-[650] tracking-tight">{f.big}</p>
                  <p className="text-muted-foreground leading-relaxed">{f.small}</p>
                </li>
              ))}
            </ul>

            {/* Trayectoria (datos del CV) */}
            <h3 className="text-muted-foreground mt-12 mb-5 text-[1.05rem] font-[650]">Trayectoria</h3>
            <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {CV_FACTS.map((f) => (
                <div key={f.t}>
                  <dt className="text-amarillo mb-1.5 text-sm font-[650]">{f.t}</dt>
                  {f.items.map((it) => <dd key={it} className="text-muted-foreground text-[0.9rem] leading-snug">{it}</dd>)}
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* 5 · Contacto */}
        <section id="contacto" aria-labelledby="t-contacto" className="bg-amarillo flex min-h-svh snap-start flex-col text-black">
          <div className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col justify-center gap-10 px-5 py-16 sm:px-10">
            <h2 id="t-contacto" className="text-[clamp(3rem,13vw,10rem)] leading-[0.88] font-[760] tracking-[-0.04em] [font-stretch:110%]">Hablemos.</h2>
            <ul className="flex flex-wrap items-center gap-x-8 gap-y-4 text-[1.1rem] font-[600]">
              <li><a className="inline-flex h-12 items-center rounded-full bg-black px-6 text-white" href="mailto:sofialp5w@gmail.com?subject=Builder%2030X">sofialp5w@gmail.com</a></li>
              <li><a className="underline decoration-2 underline-offset-4" href="https://www.linkedin.com/in/sofia-londono-perez/" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a></li>
              <li><a className="underline decoration-2 underline-offset-4" {...CV}>Descargar CV (PDF)</a></li>
            </ul>
          </div>
        </section>
      </main>

      <SectionNav sections={SECTIONS} />

      {/* Footer */}
      <footer className="bg-[#050505]">
        <div className="mx-auto grid max-w-[1400px] gap-8 px-5 py-12 sm:px-10 md:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <p className="text-[1.15rem] font-[650]">Sofía Londoño Pérez</p>
            <p className="text-muted-foreground mt-1 text-sm">Ciencias de la Computación e IA · Bogotá, Colombia</p>
            <p className="text-muted-foreground mt-4 max-w-[36ch] text-sm">Aprendo construyendo.</p>
          </div>
          <nav aria-label="Pie de página">
            <p className="text-amarillo mb-2 text-sm font-[650]">Página</p>
            <ul className="grid gap-1.5 text-sm">
              <li><a className="hover:text-amarillo" href="#proyectos">Proyectos</a></li>
              <li><a className="hover:text-amarillo" href="#fuera-del-codigo">Fuera del código</a></li>
              <li><a className="hover:text-amarillo" href="#contacto">Contacto</a></li>
            </ul>
          </nav>
          <div>
            <p className="text-amarillo mb-2 text-sm font-[650]">Contacto</p>
            <ul className="grid gap-1.5 text-sm">
              <li><a className="hover:text-amarillo" href="mailto:sofialp5w@gmail.com">sofialp5w@gmail.com</a></li>
              <li><a className="hover:text-amarillo" href="https://www.linkedin.com/in/sofia-londono-perez/" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a></li>
              <li><a className="hover:text-amarillo" {...CV}>CV (PDF)</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="text-muted-foreground mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-5 py-5 text-xs sm:px-10">
            <p>© 2026 Sofía Londoño Pérez · Hecho con React, TypeScript, Tailwind y shadcn. Portadas generadas en código.</p>
            <a className="hover:text-amarillo" href="#">Volver arriba ↑</a>
          </div>
        </div>
      </footer>

      <Sheet open={open !== null} onOpenChange={(o) => (o ? null : close())}>
        <SheetContent
          side={wide ? "right" : "bottom"}
          className={wide ? "bg-card w-full border-white/10 sm:max-w-[540px]" : "bg-card max-h-[92svh] border-white/10"}
        >
          {open !== null ? <Ficha work={visible[open]} /> : null}
        </SheetContent>
      </Sheet>
    </>
  )
}
