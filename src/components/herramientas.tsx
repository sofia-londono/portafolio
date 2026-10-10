// Sección "Herramientas": un solo carrusel (stack + IA que uso a diario) y tres
// líneas sobre cómo trabajo. Se carga aparte (React.lazy) para no
// retrasar la primera pantalla.
import {
  siAngular, siClaude, siCplusplus, siFastapi, siGit, siGooglegemini, siJavascript,
  siJira, siKotlin, siPerplexity, siPython, siStreamlit, siTailwindcss, siUnity, siVercel,
} from "simple-icons"

// Versiones en blanco (monocromo) de los logos que no están en simple-icons.
import aws from "@/assets/logos/aws.webp"
import orca from "@/assets/logos/orca.webp"
import vscode from "@/assets/logos/vscode.webp"

import { MarqueeLogoScroller, type MarqueeLogo } from "@/components/ui/marquee-logo-scroller"

// Degradados del hover, de la paleta de la galería.
const AMARILLO = { from: "#f4ffc0", via: "#ddf46b", to: "#a9bd3c" }
const TIZA = { from: "#ffffff", via: "#f2f2ee", to: "#9c9c95" }
const g = (i: number) => (i % 2 ? TIZA : AMARILLO)

// Solo lo que de verdad uso. Todos los logos en blanco: simple-icons, y AWS,
// VS Code y Orca a partir de los logos que me pasó Sofía.
const STACK: Omit<MarqueeLogo, "gradient">[] = [
  { name: "Python", icon: siPython },
  { name: "C++", icon: siCplusplus },
  { name: "JavaScript", icon: siJavascript },
  { name: "Kotlin", icon: siKotlin },
  { name: "FastAPI", icon: siFastapi },
  { name: "Angular", icon: siAngular },
  { name: "Tailwind CSS", icon: siTailwindcss },
  { name: "Streamlit", icon: siStreamlit },
  { name: "AWS", src: aws },
  { name: "Vercel", icon: siVercel },
  { name: "Git", icon: siGit },
  { name: "VS Code", src: vscode },
  { name: "Jira", icon: siJira },
  { name: "Unity", icon: siUnity },
]

const IA: Omit<MarqueeLogo, "gradient">[] = [
  { name: "Claude", icon: siClaude },
  { name: "Claude Code", icon: siClaude },
  { name: "Gemini", icon: siGooglegemini },
  { name: "Perplexity", icon: siPerplexity },
  { name: "Orca", src: orca },
]

// Un solo bucle: primero el stack, después la IA.
const HERRAMIENTAS: MarqueeLogo[] = [...STACK, ...IA].map((l, i) => ({ ...l, gradient: g(i) }))

const LINEAS = [
  "Ingeniería, IA y experimentación.",
  "Código con propósito.",
  "Pensar el sistema. Construir la solución.",
]

export default function Herramientas() {
  return (
    <div className="mx-auto grid w-full max-w-[1400px] grid-cols-1 gap-12 px-5 py-20 sm:px-10 md:pr-16">
      <div className="grid min-w-0 grid-cols-1">
        <MarqueeLogoScroller
          title="Herramientas"
          description="Lenguajes, frameworks y plataformas que he usado en proyectos reales, y la IA que uso a diario para investigar, planear y programar."
          logos={HERRAMIENTAS}
          label="Herramientas: stack e IA"
          speed="slow"
        />
      </div>
      <ol className="grid gap-6 border-t border-white/10 pt-10 md:grid-cols-3 md:gap-10">
        {LINEAS.map((l) => (
          <li key={l} className="text-[clamp(1.35rem,2.2vw,1.75rem)] leading-tight font-[680] tracking-tight text-balance">{l}</li>
        ))}
      </ol>
    </div>
  )
}
