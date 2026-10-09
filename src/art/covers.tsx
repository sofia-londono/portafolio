// Portadas de los proyectos, en SVG hecho en código (sin imágenes externas).
// Las pantallas (Bancoldex, Mundial, DebtMap, Química) son RECREACIONES
// ilustrativas de cada producto: los datos que muestran son de ejemplo.
// Cuando haya capturas reales, se ponen en `image` dentro de works.ts y
// reemplazan a la portada.
import * as React from "react"

import datamindLogo from "@/assets/datamind-logo.webp"

export type CoverKind =
  | "bancoldex" | "datamind" | "mundial" | "debtmap" | "karts" | "quimica" | "musica" | "frame"

const W = 290
const H = 200
const FONT = "'Archivo Variable', system-ui, sans-serif"

type P = { id: string; still: boolean }

function rng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/* ---------- Bancoldex: tablero de preclasificación anonimizada ---------- */
function Bancoldex({ id }: P) {
  const rows = [
    ["A-17", 0.92],
    ["C-04", 0.87],
    ["B-22", 0.74],
    ["D-09", 0.58],
  ] as const
  return (
    <>
      <defs>
        <linearGradient id={`${id}bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#03140f" /><stop offset="1" stopColor="#0d3a2e" />
        </linearGradient>
        <radialGradient id={`${id}glow`} cx=".2" cy=".55" r=".5">
          <stop offset="0" stopColor="#5fe0b5" stopOpacity=".35" /><stop offset="1" stopColor="#5fe0b5" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill={`url(#${id}bg)`} />
      <rect width={W} height={H} fill={`url(#${id}glow)`} />
      {/* barra superior */}
      <text x="16" y="24" fill="#eafff6" fontSize="10" fontWeight="650">Preclasificación</text>
      <text x="16" y="36" fill="#8fd9bf" fontSize="7">Cargo: Analista de datos</text>
      <rect x="208" y="15" width="66" height="16" rx="8" fill="#5fe0b5" fillOpacity=".15" stroke="#5fe0b5" strokeOpacity=".6" />
      <text x="241" y="26" fill="#9ff5d6" fontSize="7" textAnchor="middle">Anonimizado</text>
      {/* hojas entrando */}
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${26 + i * 7} ${70 + i * 9}) rotate(${-8 + i * 8})`} opacity={0.5 + i * 0.25}>
          <rect width="34" height="44" rx="2" fill="#eafff6" />
          {[8, 15, 22, 29].map((y) => <rect key={y} x="5" y={y} width={y === 8 ? 14 : 24} height="2.4" fill="#0d3a2e" opacity=".45" />)}
        </g>
      ))}
      <path d="M78 116 H96" stroke="#5fe0b5" strokeWidth="1.6" markerEnd="" />
      <path d="M92 112 L97 116 L92 120" fill="none" stroke="#5fe0b5" strokeWidth="1.6" />
      {/* ranking */}
      {rows.map(([name, s], i) => {
        const y = 56 + i * 34
        const top = i === 0
        return (
          <g key={name}>
            <rect x="106" y={y} width="168" height="28" rx="5" fill={top ? "#5fe0b5" : "#ffffff"} fillOpacity={top ? 0.16 : 0.05} stroke={top ? "#5fe0b5" : "none"} strokeOpacity=".7" />
            <circle cx="120" cy={y + 14} r="7" fill="#0d3a2e" stroke="#8fd9bf" strokeOpacity=".6" />
            <text x="132" y={y + 12} fill="#eafff6" fontSize="7.5" fontWeight="600">Candidato {name}</text>
            <rect x="132" y={y + 16} width="46" height="4" rx="2" fill="#8fd9bf" opacity=".35" />
            <rect x="186" y={y + 12} width="56" height="4" rx="2" fill="#ffffff" opacity=".12" />
            <rect x="186" y={y + 12} width={56 * s} height="4" rx="2" fill="#5fe0b5" />
            <text x="266" y={y + 17} fill="#eafff6" fontSize="8" fontWeight="650" textAnchor="end">{Math.round(s * 100)}</text>
          </g>
        )
      })}
    </>
  )
}

/* ---------- DataMind: su logo real y su lema ---------- */
function DataMind({ id }: P) {
  return (
    <>
      <defs>
        <radialGradient id={`${id}bg`} cx=".3" cy=".45" r=".9">
          <stop offset="0" stopColor="#0f3a72" /><stop offset="1" stopColor="#030914" />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill={`url(#${id}bg)`} />
      <circle cx="78" cy="92" r="62" fill="#3380c8" opacity=".14" />
      <image href={datamindLogo} x="22" y="48" width="112" height="88" preserveAspectRatio="xMidYMid meet" />
      <text x="148" y="86" fill="#eaf3ff" fontSize="24" fontWeight="720" letterSpacing="-.5">DataMind</text>
      <text x="148" y="104" fill="#9cc4ee" fontSize="8.4">Análisis inteligente para</text>
      <text x="148" y="115" fill="#9cc4ee" fontSize="8.4">un comercio eficaz</text>
      {/* mini dashboard */}
      {[14, 22, 18, 28, 24, 34].map((v, i) => (
        <rect key={i} x={148 + i * 13} y={166 - v} width="9" height={v} rx="1.5" fill="#3380c8" opacity={0.45 + i * 0.09} />
      ))}
      <path d="M148 168 H 270" stroke="#3380c8" strokeOpacity=".6" />
      <text x="22" y="178" fill="#6f98c4" fontSize="7">SECOP · Supersociedades</text>
    </>
  )
}

/* ---------- Mundial 2026: tabla de predicciones con balón ---------- */
type Flag = { kind: "h" | "v"; c: string[]; w?: number[] }
const FLAGS: Record<string, Flag> = {
  Colombia: { kind: "h", c: ["#fcd116", "#003893", "#ce1126"], w: [2, 1, 1] },
  Argentina: { kind: "h", c: ["#75aadb", "#ffffff", "#75aadb"] },
  Brasil: { kind: "h", c: ["#009c3b", "#ffdf00", "#009c3b"] },
  México: { kind: "v", c: ["#006847", "#ffffff", "#ce1126"] },
  España: { kind: "h", c: ["#aa151b", "#f1bf00", "#aa151b"], w: [1, 2, 1] },
  Francia: { kind: "v", c: ["#0055a4", "#ffffff", "#ef4135"] },
}
function FlagChip({ x, y, f }: { x: number; y: number; f: Flag }) {
  const w = 14, h = 10
  const ws = f.w ?? [1, 1, 1]
  const tot = ws.reduce((a, b) => a + b, 0)
  let acc = 0
  return (
    <g>
      {f.c.map((c, i) => {
        const part = ws[i] / tot
        const r = f.kind === "h"
          ? <rect key={i} x={x} y={y + acc * h} width={w} height={part * h} fill={c} />
          : <rect key={i} x={x + acc * w} y={y} width={part * w} height={h} fill={c} />
        acc += part
        return r
      })}
      <rect x={x} y={y} width={w} height={h} fill="none" stroke="#000" strokeOpacity=".25" />
    </g>
  )
}
function Ball({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const pent = (px: number, py: number, s: number, rot = 0) =>
    Array.from({ length: 5 }, (_, i) => {
      const a = rot + (-90 + i * 72) * (Math.PI / 180)
      return `${(px + s * Math.cos(a)).toFixed(1)},${(py + s * Math.sin(a)).toFixed(1)}`
    }).join(" ")
  const ring = Array.from({ length: 5 }, (_, i) => {
    const a = (-90 + i * 72 + 36) * (Math.PI / 180)
    return [cx + Math.cos(a) * r * 0.78, cy + Math.sin(a) * r * 0.78, a] as const
  })
  return (
    <g>
      <ellipse cx={cx} cy={cy + r * 1.05} rx={r * 0.8} ry={r * 0.16} fill="#000" opacity=".3" />
      <circle cx={cx} cy={cy} r={r} fill="#f7f7f2" />
      <polygon points={pent(cx, cy, r * 0.32)} fill="#141414" />
      {ring.map(([x, y, a], i) => (
        <g key={i}>
          <line x1={cx + Math.cos(a) * r * 0.32} y1={cy + Math.sin(a) * r * 0.32} x2={x} y2={y} stroke="#141414" strokeWidth={r * 0.05} />
          <polygon points={pent(x, y, r * 0.2, a + Math.PI / 2)} fill="#141414" />
        </g>
      ))}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#141414" strokeWidth={r * 0.05} />
      <circle cx={cx - r * 0.35} cy={cy - r * 0.4} r={r * 0.28} fill="#fff" opacity=".35" />
    </g>
  )
}
function Mundial({ id }: P) {
  const rows: [string, number][] = [["Argentina", 0.81], ["Brasil", 0.77], ["Francia", 0.74], ["España", 0.72], ["Colombia", 0.66], ["México", 0.58]]
  return (
    <>
      <defs>
        <linearGradient id={`${id}bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#140a2e" /><stop offset="1" stopColor="#0b3b25" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill={`url(#${id}bg)`} />
      <text x="16" y="24" fill="#f4f0ff" fontSize="10" fontWeight="650">Mundial 2026 · Predicciones</text>
      <text x="16" y="36" fill="#b9a8e8" fontSize="7">Probabilidad de pasar la fase de grupos</text>
      <rect x="12" y="44" width="192" height="146" rx="6" fill="#ffffff" fillOpacity=".05" />
      {rows.map(([name, p], i) => {
        const y = 52 + i * 22.5
        return (
          <g key={name}>
            <text x="22" y={y + 9} fill="#b9a8e8" fontSize="7" textAnchor="middle">{i + 1}</text>
            <FlagChip x={32} y={y + 1} f={FLAGS[name]} />
            <text x="52" y={y + 9} fill="#f4f0ff" fontSize="8" fontWeight="560">{name}</text>
            <rect x="110" y={y + 4} width="62" height="4" rx="2" fill="#ffffff" opacity=".12" />
            <rect x="110" y={y + 4} width={62 * p} height="4" rx="2" fill="#2fd27c" />
            <text x="196" y={y + 9} fill="#f4f0ff" fontSize="7.5" fontWeight="650" textAnchor="end">{Math.round(p * 100)}%</text>
          </g>
        )
      })}
      <circle cx="248" cy="118" r="40" fill="#2fd27c" opacity=".12" />
      <Ball cx={248} cy={112} r={30} />
      <text x="248" y="178" fill="#b9a8e8" fontSize="7" textAnchor="middle">48 selecciones</text>
    </>
  )
}

/* ---------- DebtMap: billetera que transmite confianza ---------- */
function DebtMap({ id }: P) {
  const debts: [string, string, number, string][] = [
    ["Tarjeta de crédito", "$1.200.000", 0.65, "#f2b544"],
    ["Crédito educativo", "$3.800.000", 0.3, "#5ad1c4"],
    ["Préstamo familiar", "$400.000", 0.85, "#8fb6ff"],
  ]
  return (
    <>
      <defs>
        <linearGradient id={`${id}bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#06141c" /><stop offset="1" stopColor="#0d2e3a" />
        </linearGradient>
        <linearGradient id={`${id}card`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f6c55a" /><stop offset="1" stopColor="#c98a1b" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill={`url(#${id}bg)`} />
      {/* tarjeta */}
      <g transform="translate(16 22)">
        <rect width="118" height="74" rx="9" fill={`url(#${id}card)`} />
        <rect x="12" y="14" width="18" height="13" rx="2.5" fill="#fff3cf" opacity=".85" />
        <text x="12" y="46" fill="#2a1a03" fontSize="7">Capacidad de pago</text>
        <text x="12" y="60" fill="#1b1003" fontSize="13" fontWeight="720">Saludable</text>
        <text x="106" y="22" fill="#2a1a03" fontSize="8" fontWeight="700" textAnchor="end">DebtMap</text>
      </g>
      {/* escudo */}
      <g transform="translate(16 112)">
        <path d="M12 0 L24 5 V13 C24 20 18 25 12 27 C6 25 0 20 0 13 V5 Z" fill="#5ad1c4" fillOpacity=".18" stroke="#5ad1c4" strokeWidth="1.4" />
        <path d="M7 13 L11 17 L18 9" fill="none" stroke="#5ad1c4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <text x="32" y="11" fill="#e6f6f4" fontSize="7.5" fontWeight="600">Tus datos, protegidos</text>
        <text x="32" y="22" fill="#8fb9b5" fontSize="6.5">Diagnóstico privado y automático</text>
      </g>
      {/* lista de deudas */}
      <text x="150" y="30" fill="#e6f6f4" fontSize="9" fontWeight="650">Tu mapa de deudas</text>
      {debts.map(([n, v, p, c], i) => {
        const y = 42 + i * 44
        return (
          <g key={n}>
            <rect x="146" y={y} width="130" height="38" rx="6" fill="#ffffff" fillOpacity=".05" />
            <circle cx="158" cy={y + 12} r="4" fill={c} />
            <text x="167" y={y + 15} fill="#e6f6f4" fontSize="7.5">{n}</text>
            <text x="268" y={y + 15} fill="#e6f6f4" fontSize="7.5" fontWeight="650" textAnchor="end">{v}</text>
            <rect x="154" y={y + 25} width="114" height="4" rx="2" fill="#ffffff" opacity=".1" />
            <rect x="154" y={y + 25} width={114 * p} height="4" rx="2" fill={c} />
          </g>
        )
      })}
    </>
  )
}

/* ---------- Karts: pista sobre lava, con el kart en movimiento ---------- */
function Karts({ id, still }: P) {
  const r = rng(3)
  const track = "M-10 168 C 60 160, 70 92, 140 98 S 220 40, 300 34"
  return (
    <>
      <defs>
        <radialGradient id={`${id}g`} cx=".5" cy=".6" r=".8">
          <stop offset="0" stopColor="#ffd27a" /><stop offset=".22" stopColor="#ff6a1a" />
          <stop offset=".6" stopColor="#8f1c05" /><stop offset="1" stopColor="#1e0402" />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill={`url(#${id}g)`} />
      {Array.from({ length: 9 }, (_, k) => {
        const n = 36, base = 10 + k * 17, ph = r() * 6
        const pts = Array.from({ length: n }, (_, i) => {
          const a = (i / n) * Math.PI * 2
          const rr = base * (1 + 0.2 * Math.sin(3 * a + ph) + 0.08 * Math.sin(7 * a - ph))
          return `${(150 + Math.cos(a) * rr * 1.4).toFixed(1)},${(118 + Math.sin(a) * rr * 0.8).toFixed(1)}`
        })
        return <polygon key={k} points={pts.join(" ")} fill="none" stroke={k < 3 ? "#fff0c8" : "#ffb070"} strokeOpacity={k < 3 ? 0.9 : 0.35} strokeWidth="1.2" />
      })}
      <path d={track} fill="none" stroke="#120302" strokeWidth="26" strokeLinecap="round" />
      <path d={track} fill="none" stroke="#2a0a05" strokeWidth="22" strokeLinecap="round" />
      <path d={track} fill="none" stroke="#ffe8b0" strokeWidth="1.6" strokeDasharray="7 7" />
      <g>
        <g transform={still ? "translate(150 96) rotate(-22)" : undefined}>
          <rect x="-9" y="-5" width="18" height="10" rx="3" fill="#ffe8b0" />
          <rect x="2" y="-3.5" width="5" height="7" rx="1.5" fill="#2a0a05" />
        </g>
        {still ? null : <animateMotion dur="5s" repeatCount="indefinite" rotate="auto" path={track} />}
      </g>
    </>
  )
}

/* ---------- Química: fichas de seguridad consultadas por chat ---------- */
function Quimica({ id }: P) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#031118" /><stop offset="1" stopColor="#0b3442" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill={`url(#${id}bg)`} />
      {/* documento */}
      <g transform="translate(14 16)">
        <rect width="100" height="168" rx="5" fill="#eefcff" />
        <text x="8" y="16" fill="#0b3442" fontSize="6.5" fontWeight="700">FICHA DE SEGURIDAD</text>
        <text x="8" y="26" fill="#0b3442" fontSize="8.5" fontWeight="720">Ácido sulfúrico</text>
        <text x="8" y="35" fill="#4c7480" fontSize="6">H₂SO₄ · CAS 7664-93-9</text>
        {/* pictograma corrosivo (GHS05) */}
        <g transform="translate(74 6)">
          <rect x="4" y="4" width="14" height="14" transform="rotate(45 11 11)" fill="#fff" stroke="#d1221b" strokeWidth="1.8" />
          <rect x="7.5" y="9" width="7" height="3" fill="#0b3442" />
          <rect x="7" y="14" width="8" height="1.6" fill="#0b3442" />
        </g>
        {["1 · Identificación", "2 · Peligros", "7 · Manipulación", "8 · Protección personal", "11 · Toxicología"].map((t, i) => {
          const hl = i === 3
          return (
            <g key={t}>
              {hl ? <rect x="5" y={47 + i * 22} width="90" height="17" rx="3" fill="#2fb7d1" fillOpacity=".22" /> : null}
              <text x="9" y={58 + i * 22} fill="#0b3442" fontSize="6.6" fontWeight={hl ? 700 : 500}>{t}</text>
            </g>
          )
        })}
      </g>
      {/* chat */}
      <g fontSize="7">
        <rect x="126" y="22" width="150" height="34" rx="8" fill="#2fb7d1" />
        <text x="134" y="35" fill="#04202a" fontWeight="600">¿Qué protección necesito para</text>
        <text x="134" y="46" fill="#04202a" fontWeight="600">manipular ácido sulfúrico?</text>
        <rect x="126" y="66" width="150" height="74" rx="8" fill="#ffffff" fillOpacity=".08" stroke="#ffffff" strokeOpacity=".15" />
        <text x="134" y="80" fill="#dff7fc">Gafas de seguridad o careta,</text>
        <text x="134" y="91" fill="#dff7fc">guantes resistentes a ácidos</text>
        <text x="134" y="102" fill="#dff7fc">y bata o delantal resistente</text>
        <text x="134" y="113" fill="#dff7fc">a químicos.</text>
        <rect x="134" y="120" width="72" height="13" rx="6.5" fill="#2fb7d1" fillOpacity=".2" stroke="#2fb7d1" strokeOpacity=".6" />
        <text x="170" y="129" fill="#9fe6f5" fontSize="6" textAnchor="middle">Fuente: FDS · sección 8</text>
        <rect x="126" y="152" width="150" height="24" rx="12" fill="#ffffff" fillOpacity=".06" />
        <text x="138" y="167" fill="#7aa9b5" fontSize="6.8">Pregunta sobre un documento…</text>
      </g>
    </>
  )
}

/* ---------- Música: audio → espectrograma → 3 modelos → 10 géneros de GTZAN ---------- */
const GTZAN = ["blues", "classical", "country", "disco", "hiphop", "jazz", "metal", "pop", "reggae", "rock"]
function Musica({ id }: P) {
  const r = rng(10)
  // espectrograma (mel) de ejemplo: energía alta en graves, bandas que cambian en el tiempo
  const cells: React.ReactNode[] = []
  const cols = 22, rows = 14
  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      const low = 1 - y / rows
      const beat = x % 4 === 0 ? 0.35 : 0
      const v = Math.min(1, low * 0.55 + beat * (1 - low) + r() * 0.35 + 0.15 * Math.sin(x * 0.7 + y))
      cells.push(<rect key={`${x}-${y}`} x={14 + x * 4.6} y={52 + (rows - 1 - y) * 6.8} width="4.4" height="6.6" fill={`hsl(${330 - v * 40} 90% ${10 + v * 55}%)`} />)
    }
  }
  const scores = [0.08, 0.04, 0.05, 0.1, 0.12, 0.06, 0.03, 0.09, 0.07, 0.36]
  return (
    <>
      <defs>
        <linearGradient id={`${id}bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1a0612" /><stop offset="1" stopColor="#3a0c26" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill={`url(#${id}bg)`} />
      {/* onda de entrada */}
      <path d={Array.from({ length: 60 }, (_, i) => `${i ? "L" : "M"}${14 + i * 1.7} ${32 + Math.sin(i * 0.9) * (3 + (i % 7))}`).join(" ")} fill="none" stroke="#ff9cc8" strokeWidth="1" opacity=".8" />
      <text x="14" y="18" fill="#ffd3e6" fontSize="7" fontWeight="650">Audio → espectrograma</text>
      {cells}
      {/* modelos */}
      <path d="M120 100 H132" stroke="#ff9cc8" strokeWidth="1.4" />
      <path d="M128 96 L133 100 L128 104" fill="none" stroke="#ff9cc8" strokeWidth="1.4" />
      {["CNN", "LSTM", "CNN + LSTM"].map((m, i) => (
        <g key={m}>
          <rect x="138" y={60 + i * 28} width="62" height="20" rx="5" fill="#ff4f9a" fillOpacity={i === 2 ? 0.35 : 0.14} stroke="#ff9cc8" strokeOpacity=".6" />
          <text x="169" y={73 + i * 28} fill="#ffe6f1" fontSize="7.5" fontWeight="650" textAnchor="middle">{m}</text>
        </g>
      ))}
      <text x="169" y="50" fill="#ffd3e6" fontSize="7" fontWeight="650" textAnchor="middle">3 modelos</text>
      <path d="M204 100 H214" stroke="#ff9cc8" strokeWidth="1.4" />
      <path d="M210 96 L215 100 L210 104" fill="none" stroke="#ff9cc8" strokeWidth="1.4" />
      {/* 10 géneros */}
      <text x="220" y="30" fill="#ffd3e6" fontSize="7" fontWeight="650">10 géneros</text>
      {GTZAN.map((g, i) => (
        <g key={g}>
          <text x="220" y={44 + i * 14} fill={i === 9 ? "#fff" : "#d9a3bd"} fontSize="6.2">{g}</text>
          <rect x="248" y={39 + i * 14} width="30" height="4" rx="2" fill="#ffffff" opacity=".1" />
          <rect x="248" y={39 + i * 14} width={30 * Math.min(1, scores[i] * 2.4)} height="4" rx="2" fill={i === 9 ? "#ff4f9a" : "#ff9cc8"} opacity={i === 9 ? 1 : 0.6} />
        </g>
      ))}
    </>
  )
}

function Frame() {
  return (
    <>
      <rect width={W} height={H} fill="#0d0d0d" />
      <rect x={40} y={30} width={W - 80} height={H - 60} fill="none" stroke="#ddf46b" strokeOpacity=".5" strokeWidth="1.5" strokeDasharray="4 6" />
    </>
  )
}

const DRAW: Record<CoverKind, (p: P) => React.ReactElement> = {
  bancoldex: Bancoldex, datamind: DataMind, mundial: Mundial, debtmap: DebtMap,
  karts: Karts, quimica: Quimica, musica: Musica, frame: Frame,
}

function useReducedMotion() {
  const [r, setR] = React.useState(true)
  React.useEffect(() => {
    const q = window.matchMedia("(prefers-reduced-motion: reduce)")
    const read = () => setR(q.matches)
    read()
    q.addEventListener("change", read)
    return () => q.removeEventListener("change", read)
  }, [])
  return r
}

export function Cover({ kind, image, className }: { kind: CoverKind; image?: string; className?: string }) {
  const id = "c" + React.useId().replace(/[^a-zA-Z0-9]/g, "")
  const still = useReducedMotion()
  if (image) return <img src={image} alt="" className={className ?? "block size-full object-cover"} draggable={false} />
  const Draw = DRAW[kind]
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className ?? "block size-full"} preserveAspectRatio="xMidYMid slice" aria-hidden="true" fontFamily={FONT}>
      <Draw id={id} still={still} />
    </svg>
  )
}
