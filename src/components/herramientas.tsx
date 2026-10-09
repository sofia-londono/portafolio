// Sección "Herramientas": dos carruseles (stack y herramientas de IA) y tres
// ejemplos concretos de cómo uso IA. Se carga aparte (React.lazy) para no
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
// VS Code y Orca a partir de los logos que me pasó Sofía. HLSL va como chip.
const STACK: MarqueeLogo[] = [
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
  { name: "HLSL" },
].map((l, i) => ({ ...l, gradient: g(i) }))

const IA: MarqueeLogo[] = [
  { name: "Claude", icon: siClaude },
  { name: "Claude Code", icon: siClaude },
  { name: "Gemini", icon: siGooglegemini },
  { name: "Perplexity", icon: siPerplexity },
  { name: "Orca", src: orca },
].map((l, i) => ({ ...l, gradient: g(i + 1) }))

const EJEMPLOS: [string, string][] = [
  ["Planeo con IA, decido yo.", "En Bancoldex comparé el stack componente por componente y elegí cada pieza; la captura de correos fue con Power Automate, no con la opción recomendada."],
  ["Construyo con agentes de código.", "El MVP del Mundial 2026: un día de plan con Gemini y tres de construcción con Claude Code."],
  ["Investigo antes de elegir.", "Perplexity para entrar a un dominio nuevo con fuentes; Claude Code desde Orca para iterar mi juego en Unity."],
]

export default function Herramientas() {
  return (
    <div className="mx-auto grid w-full max-w-[1400px] grid-cols-1 gap-12 px-5 py-20 sm:px-10 md:pr-16">
      <div className="grid min-w-0 grid-cols-1 gap-10">
        <MarqueeLogoScroller
          title="Stack"
          description="Lenguajes, frameworks y plataformas que he usado en proyectos reales."
          logos={STACK}
          label="Stack"
          speed="slow"
        />
        <MarqueeLogoScroller
          title="IA que uso a diario"
          description="Para investigar, planear y programar."
          logos={IA}
          label="Herramientas de IA"
          speed="slow"
          reverse
        />
      </div>
      <ol className="grid gap-6 border-t border-white/10 pt-10 md:grid-cols-3 md:gap-10">
        {EJEMPLOS.map(([big, small]) => (
          <li key={big} className="grid content-start gap-2">
            <p className="text-[1.35rem] leading-tight font-[680] tracking-tight">{big}</p>
            <p className="text-muted-foreground leading-relaxed">{small}</p>
          </li>
        ))}
      </ol>
    </div>
  )
}
