import type React from "react"

import { cn } from "@/lib/utils"

// Adaptado de "dark-gradient-background" (21st.dev):
// - Colores de 30X: negro arriba, amarillo abajo. Se pueden cambiar con `stops`.
// - La textura de ruido ya no se descarga de cdn.21st.dev: es un SVG
//   (feTurbulence) en línea, así la página no depende de un servidor externo.
// - Se quitó la clase bg-gradient-to-b que el estilo en línea sobrescribía.

const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='150' height='150' filter='url(%23n)'/%3E%3C/svg%3E\")"

export const GRADIENT_30X =
  "linear-gradient(180deg, #000000 0%, #050505 28%, #14170a 45%, #4a5413 64%, #a9bd3c 84%, #ddf46b 100%)"

interface GradientBackgroundProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "className"> {
  children?: React.ReactNode
  className?: string
  /** Cualquier valor CSS de background. @default GRADIENT_30X */
  stops?: string
}

export function GradientBackground({ children, className, stops = GRADIENT_30X, ...props }: GradientBackgroundProps) {
  return (
    <div className={cn("relative min-h-svh w-full overflow-hidden", className)} {...props}>
      <div aria-hidden className="absolute inset-0" style={{ background: stops }} />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[.07] mix-blend-overlay"
        style={{ backgroundImage: NOISE, backgroundSize: "150px" }}
      />
      {/* Retícula */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      {/* Diagonales */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(45deg, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(-45deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}

export default GradientBackground
