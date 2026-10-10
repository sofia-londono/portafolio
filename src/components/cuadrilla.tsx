// Portada: "Cuadrilla". Personajes pixel-art propios (8×10, dibujados aquí en
// código) que arman un subrayado de bloques bajo "construyendo.". Un clic en una
// zona vacía de la portada trae un personaje más con un bloque, que lo deja en
// la pila. Todo pasa en la franja entre el título y el párrafo: nunca tapa el
// texto ni los botones.
//
// Canvas decorativo (aria-hidden), sin librerías. Con reduced-motion se dibuja
// la escena final, quieta, y los clics no hacen nada. El bucle se duerme cuando
// nada se mueve y no corre si la portada está fuera de pantalla.
import * as React from "react"

const COLORS: Record<string, string> = { y: "#ddf46b", w: "#f2f2ee", k: "#0a0a0a" }
const BLOCK = "#ddf46b"
const BLOCK_EDGE = "#a9bd3c"

// Mirando a la derecha. "." = transparente.
const HEAD = ["..yyyy..", ".yyyyyyy", "..wwww..", "..wwkw..", "..wwww.."]
const BODY = [".wwyyww.", ".wwyyww.", "..wwww.."]
const WALK_A = [...HEAD, ...BODY, "..w..w..", "..ww.ww."]
const WALK_B = [...HEAD, ...BODY, "...ww...", "...www.."]
const STAND = [...HEAD, ...BODY, "..w..w..", "..w..w.."]
const SIT = [...HEAD, ".wwyyww.", "..wwwwww", "......ww"]

const SPRITE_W = 8
const SPRITE_H = 10
const PILE_MAX = 12
const PILE_COLS = 3

type Mode = "walk" | "stand" | "sit" | "leave"
interface Bot {
  x: number
  tx: number
  face: 1 | -1
  mode: Mode
  carry: boolean
  crew: boolean
  phase: number
  bob: number
  drop: number
}

interface Geo {
  w: number
  h: number
  p: number
  beamX: number
  beamY: number
  slots: number
  pitch: number
  ground: number
  pileX: number
  crewN: number
  maxExtra: number
}

export function Cuadrilla({ word, hero }: { word: React.RefObject<HTMLElement | null>; hero: React.RefObject<HTMLElement | null> }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  React.useEffect(() => {
    const canvas = canvasRef.current
    const host = hero.current
    const maybeCtx = canvas?.getContext("2d")
    if (!canvas || !host || !maybeCtx) return
    const ctx: CanvasRenderingContext2D = maybeCtx

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)")
    let reduced = motion.matches
    let geo: Geo | null = null
    let bots: Bot[] = []
    let placed = 0
    let pile = 0
    let clearing = 0
    let started = false
    let visible = true
    let frame = 0
    let last = 0

    const measure = (): Geo | null => {
      const el = word.current
      if (!el) return null
      const box = host.getBoundingClientRect()
      const r = el.getBoundingClientRect()
      const w = box.width
      const p = w < 640 ? 2 : 3
      const pitch = 7 * p
      const slots = Math.max(1, Math.floor((r.width + p) / pitch))
      const beamX = Math.round(r.left - box.left + (r.width - (slots * pitch - p)) / 2)
      const beamY = Math.round(r.bottom - box.top + p)
      const ground = beamY + 2 * p + 2 * p + SPRITE_H * p
      const beamEnd = beamX + slots * pitch - p
      const pileW = PILE_COLS * 7 * p
      const pileX = beamEnd + 6 * p + pileW + 16 < w ? beamEnd + 6 * p : beamX + 2 * p
      const narrow = w < 640
      return { w, h: box.height, p, beamX, beamY, slots, pitch, ground, pileX, crewN: narrow ? 2 : 3, maxExtra: narrow ? 1 : 3 }
    }

    // Sitio final de la cuadrilla: al final de la viga, el primero sentado.
    const restSpot = (g: Geo, i: number) => g.beamX + g.slots * g.pitch - g.p - SPRITE_W * g.p - i * 11 * g.p
    const pileSide = (g: Geo, from: number) => {
      const pileW = PILE_COLS * 7 * g.p
      return from > g.pileX + pileW / 2 ? g.pileX + pileW + g.p : g.pileX - (SPRITE_W + 1) * g.p
    }

    const settleCrew = (g: Geo) => {
      bots.filter((b) => b.crew).forEach((b, i) => {
        b.x = b.tx = restSpot(g, i)
        b.mode = i === 0 ? "sit" : "stand"
        b.face = 1
        b.carry = false
      })
      bots.filter((b) => !b.crew).forEach((b) => {
        b.x = b.tx = pileSide(g, b.x)
        b.mode = "stand"
        b.carry = false
        b.drop = 0
      })
    }

    const resize = () => {
      const g = measure()
      if (!g) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(g.w * dpr)
      canvas.height = Math.round(g.h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.imageSmoothingEnabled = false
      const prev = geo
      geo = g
      if (prev && prev.w === g.w && prev.beamX === g.beamX && prev.beamY === g.beamY) {
        // Solo cambió el alto: nada que rehacer.
        draw()
        return
      }
      if (!prev) {
        bots = Array.from({ length: g.crewN }, (_, i) => ({
          x: g.beamX - (SPRITE_W + 4) * g.p - i * 12 * g.p,
          tx: g.beamX + g.slots * g.pitch,
          face: 1 as const,
          mode: "walk" as Mode,
          carry: true,
          crew: true,
          phase: i * 3,
          bob: 0,
          drop: 0,
        }))
        if (reduced) {
          placed = g.slots
          settleCrew(g)
        }
      } else {
        // Cambió el ancho: la viga se rehace completa y todos se acomodan.
        placed = g.slots
        settleCrew(g)
      }
      draw()
      if (!reduced) wake()
    }

    const sprite = (rows: string[], x: number, y: number, p: number, face: 1 | -1) => {
      for (let r = 0; r < rows.length; r++) {
        const row = rows[r]
        for (let c = 0; c < SPRITE_W; c++) {
          const ch = row[face === 1 ? c : SPRITE_W - 1 - c]
          if (ch === "." || !ch) continue
          ctx.fillStyle = COLORS[ch]
          ctx.fillRect(Math.round(x + c * p), Math.round(y + r * p), p, p)
        }
      }
    }

    const block = (x: number, y: number, p: number) => {
      ctx.fillStyle = BLOCK
      ctx.fillRect(Math.round(x), Math.round(y), 6 * p, 2 * p)
      ctx.fillStyle = BLOCK_EDGE
      ctx.fillRect(Math.round(x), Math.round(y + p), 6 * p, p)
    }

    function draw() {
      const g = geo
      if (!g) return
      ctx.clearRect(0, 0, g.w, g.h)
      const p = g.p
      for (let j = 0; j < placed; j++) block(g.beamX + j * g.pitch, g.beamY, p)
      for (let k = 0; k < pile; k++) {
        const row = Math.floor(k / PILE_COLS)
        const col = k % PILE_COLS
        block(g.pileX + col * 7 * p + (row % 2) * 3 * p, g.ground - (row + 1) * 3 * p + p, p)
      }
      for (const b of bots) {
        const lift = b.bob > 0 ? p : 0
        const top = g.ground - SPRITE_H * p - b.drop - lift
        if (b.mode === "sit") {
          sprite(SIT, b.x, g.ground - SIT.length * p, p, b.face)
          continue
        }
        const rows = b.mode === "stand" ? STAND : Math.floor(b.phase / 3) % 2 ? WALK_B : WALK_A
        sprite(rows, b.x, top, p, b.face)
        if (b.carry) block(b.x + p, top - 2 * p, p)
      }
    }

    const step = (dt: number) => {
      const g = geo
      if (!g) return false
      const p = g.p
      let moving = false
      const speedBuild = Math.max(120, (g.slots * g.pitch) / 2.2)
      const speedWalk = 46 * p

      for (const b of bots) {
        if (b.bob > 0) {
          b.bob -= dt
          moving = true
        }
        if (b.drop > 0) {
          b.drop = Math.max(0, b.drop - dt * 60 * p)
          moving = true
          continue
        }
        if (b.mode !== "walk" && b.mode !== "leave") continue
        const v = b.crew && placed < g.slots ? speedBuild : speedWalk
        const d = b.tx - b.x
        b.face = d >= 0 ? 1 : -1
        const move = Math.min(Math.abs(d), v * dt)
        b.x += Math.sign(d) * move
        b.phase += move / p
        moving = true
        if (Math.abs(b.tx - b.x) < 0.5) arrive(b, g)
      }

      // El primero de la cuadrilla pone un bloque cada vez que pasa por un hueco.
      const lead = bots.find((b) => b.crew)
      if (lead && placed < g.slots) {
        const center = lead.x + (SPRITE_W * p) / 2
        while (placed < g.slots && center >= g.beamX + placed * g.pitch + 3 * p) {
          placed++
          lead.bob = 0.09
        }
        if (placed === g.slots) {
          bots.filter((b) => b.crew).forEach((b, i) => {
            b.tx = restSpot(g, i)
            b.carry = false
          })
        }
        moving = true
      }

      if (clearing > 0) {
        clearing -= dt
        if (clearing <= 0 && pile > 0) {
          pile--
          clearing = pile > 0 ? 0.07 : 0
        }
        moving = true
      }

      bots = bots.filter((b) => !(b.mode === "leave" && Math.abs(b.tx - b.x) < 0.5))
      return moving
    }

    function arrive(b: Bot, g: Geo) {
      if (b.mode === "leave") return
      if (b.crew) {
        const i = bots.filter((x) => x.crew).indexOf(b)
        b.mode = i === 0 ? "sit" : "stand"
        b.face = 1
        return
      }
      b.mode = "stand"
      b.face = b.x > g.pileX ? -1 : 1
      if (b.carry) {
        b.carry = false
        b.bob = 0.12
        pile++
        if (pile >= PILE_MAX) clearing = 0.5
      }
    }

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const moving = step(dt)
      draw()
      frame = moving && visible ? requestAnimationFrame(tick) : 0
    }

    function wake() {
      if (frame || reduced || !visible || !started) return
      last = performance.now()
      frame = requestAnimationFrame(tick)
    }

    const onClick = (event: MouseEvent) => {
      const g = geo
      if (!g || reduced) return
      const target = event.target as Element | null
      if (target?.closest("a,button,input,h1,p,header,nav")) return
      const x = Math.min(Math.max(event.clientX - host.getBoundingClientRect().left - (SPRITE_W * g.p) / 2, 0), g.w - SPRITE_W * g.p)
      const extras = bots.filter((b) => !b.crew && b.mode !== "leave")
      if (extras.length >= g.maxExtra) {
        const old = extras[0]
        old.mode = "leave"
        old.carry = false
        old.tx = old.x < g.w / 2 ? -SPRITE_W * g.p - 4 : g.w + 4
      }
      bots.push({ x, tx: pileSide(g, x), face: 1, mode: "walk", carry: true, crew: false, phase: 0, bob: 0, drop: 10 * g.p })
      wake()
    }

    const onMotion = () => {
      reduced = motion.matches
      if (reduced && geo) {
        cancelAnimationFrame(frame)
        frame = 0
        placed = geo.slots
        clearing = 0
        settleCrew(geo)
        draw()
      }
    }

    const ro = new ResizeObserver(() => resize())
    ro.observe(host)
    const io = new IntersectionObserver((entries) => {
      visible = entries.some((e) => e.isIntersecting)
      if (visible) wake()
    })
    io.observe(host)
    const onVisibility = () => {
      visible = document.visibilityState === "visible"
      if (visible) wake()
    }
    document.addEventListener("visibilitychange", onVisibility)
    host.addEventListener("click", onClick)
    motion.addEventListener("change", onMotion)

    // Arranca cuando la fuente ya cargó (si no, la viga se mediría con otra letra).
    let alive = true
    const timer = window.setTimeout(() => {
      document.fonts.ready.then(() => {
        if (!alive) return
        started = true
        geo = null
        resize()
      })
    }, 350)

    return () => {
      alive = false
      window.clearTimeout(timer)
      cancelAnimationFrame(frame)
      ro.disconnect()
      io.disconnect()
      document.removeEventListener("visibilitychange", onVisibility)
      host.removeEventListener("click", onClick)
      motion.removeEventListener("change", onMotion)
    }
  }, [word, hero])

  return <canvas ref={canvasRef} aria-hidden className="pointer-events-none absolute inset-0 size-full" />
}
