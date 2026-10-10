// Portada: "Cuadrilla". Personajes pixel-art propios (9×12, dibujados aquí en
// código) que arman un subrayado de bloques bajo "construyendo." y después
// siguen trabajando solos: uno martilla la viga, otro lleva bloques de la pila
// a la viga, otro descansa sentado y saluda, y de vez en cuando entra alguien
// con un bloque para la pila. Un clic en una zona vacía trae a alguien más.
// Todo pasa en la franja entre el título y el párrafo: nunca tapa el texto ni
// los botones.
//
// Canvas decorativo (aria-hidden), sin librerías, a ~30 fps. Con reduced-motion
// se dibuja una escena quieta y los clics no hacen nada. No corre si la portada
// está fuera de pantalla o la pestaña está oculta.
import * as React from "react"

const PAL: Record<string, string> = {
  Y: "#ddf46b", // amarillo 30X
  L: "#f4ffc0", // brillo del casco
  D: "#a9bd3c", // sombra del amarillo
  W: "#f2f2ee", // tiza
  G: "#9c9c95", // humo
  K: "#0a0a0a", // ojos
}

// Mirando a la derecha. "." = transparente.
const HEAD = ["...YYY...", "..YLYYY..", ".DYYYYYYY", "..WWWW...", "..WWKW...", "..WWWW..."]
const HEAD_BLINK = [...HEAD.slice(0, 4), "..WWWW...", HEAD[5]]
const BODY = [".WYYYYW..", ".WYDDYW..", "..YYYY..."]
const LEGS = [
  ["..GGGG...", "..G..G...", ".GG..GG.."],
  ["..GGGG...", "...GG....", "...GGG..."],
  ["..GGGG...", ".G....G..", "GG....GG."],
]
const WALK = [0, 1, 2, 1]
const SIT_LEGS = ["..GGGGGG.", "......GG."]

const SW = 9
const SH = 12
const PILE_MAX = 9
const PILE_COLS = 3
const FPS = 1000 / 30

type Role = "hammer" | "carrier" | "sitter" | "visitor"
type State = "walk" | "idle" | "hammer" | "pick" | "lift" | "place" | "drop" | "sit"

interface Bot {
  role: Role
  x: number
  tx: number
  face: 1 | -1
  state: State
  carry: boolean
  stride: number
  t: number
  blink: number
  blinkIn: number
  wave: number
  waveIn: number
  drop: number
  arrive?: () => void
  gone?: boolean
}

interface Spark {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  c: string
}

interface Geo {
  w: number
  h: number
  p: number
  narrow: boolean
  beamX: number
  beamY: number
  beamEnd: number
  slots: number
  pitch: number
  ground: number
  pileX: number
  stations: Record<"hammer" | "carrier" | "sitter", number>
}

const rand = (a: number, b: number) => a + Math.random() * (b - a)

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
    let sparks: Spark[] = []
    let placed = 0
    let placedAt: number[] = []
    let pile = 3
    let building = true
    let clock = 0
    let spawnIn = rand(4, 7)
    let started = false
    let visible = true
    let frame = 0
    let last = 0
    let drawnAt = 0

    /* ---------- geometría ---------- */
    const measure = (): Geo | null => {
      const el = word.current
      if (!el) return null
      const box = host.getBoundingClientRect()
      const r = el.getBoundingClientRect()
      const w = box.width
      const narrow = w < 640
      const p = narrow ? 2 : 3
      const pitch = 7 * p
      const slots = Math.max(1, Math.floor((r.width + p) / pitch))
      const beamX = Math.round(r.left - box.left + (r.width - (slots * pitch - p)) / 2)
      const beamY = Math.round(r.bottom - box.top + p)
      const beamEnd = beamX + slots * pitch - p
      const len = beamEnd - beamX
      const pileW = PILE_COLS * 7 * p
      const roomRight = beamEnd + 6 * p + pileW + 16 < w
      const pileX = roomRight ? beamEnd + 6 * p : beamX + 2 * p
      const stations = roomRight
        ? { sitter: beamX + 2 * p, hammer: beamX + len * 0.55, carrier: beamX + len * 0.8 }
        : { sitter: beamX + len * 0.25, hammer: beamX + len * 0.75 - SW * p, carrier: beamX + len * 0.45 }
      return { w, h: box.height, p, narrow, beamX, beamY, beamEnd, slots, pitch, ground: beamY + 4 * p + SH * p, pileX, stations }
    }

    const pileSide = (g: Geo, from: number) => {
      const pileW = PILE_COLS * 7 * g.p
      return from > g.pileX + pileW / 2 ? g.pileX + pileW + g.p : g.pileX - (SW + 1) * g.p
    }

    /* ---------- personajes ---------- */
    const bot = (role: Role, x: number): Bot => ({
      role, x, tx: x, face: 1, state: "idle", carry: false, stride: 0, t: 0,
      blink: 0, blinkIn: rand(1.5, 5), wave: 0, waveIn: rand(3, 7), drop: 0,
    })

    const walkTo = (b: Bot, x: number, then?: () => void) => {
      b.tx = x
      b.state = "walk"
      b.arrive = then
    }

    // Lo que hace cada uno cuando la viga ya está armada.
    const routine = (b: Bot, g: Geo) => {
      if (b.role === "hammer") {
        b.face = g.stations.carrier > b.x ? 1 : -1
        b.state = "hammer"
        b.t = 0
      } else if (b.role === "sitter") {
        b.face = 1
        b.state = "sit"
      } else if (b.role === "carrier") {
        fetchBlock(b, g)
      }
    }

    function fetchBlock(b: Bot, g: Geo) {
      if (pile <= 0) {
        b.state = "idle"
        b.t = 0.8 // vuelve a mirar la pila en un rato
        return
      }
      walkTo(b, pileSide(g, b.x), () => {
        if (pile <= 0) return fetchBlock(b, g)
        pile--
        b.face = b.x < g.pileX ? 1 : -1
        b.state = "pick"
        b.t = 0.3
      })
    }

    const crewRoles = (g: Geo): Role[] => (g.narrow ? ["hammer", "carrier"] : ["hammer", "carrier", "sitter"])

    const settle = (g: Geo) => {
      bots = crewRoles(g).map((role) => {
        const b = bot(role, g.stations[role as "hammer"])
        routine(b, g)
        return b
      })
      if (reduced) bots.forEach((b) => { if (b.role !== "sitter") { b.state = "idle"; b.carry = false } })
      placed = g.slots
      placedAt = Array(g.slots).fill(-1)
      building = false
      sparks = []
    }

    const startBuild = (g: Geo) => {
      bots = crewRoles(g).map((role, i) => {
        const b = bot(role, g.beamX - (SW + 4) * g.p - i * 13 * g.p)
        b.carry = true
        b.state = "walk"
        b.tx = g.beamEnd + g.p
        b.stride = i * 2
        return b
      })
      placed = 0
      placedAt = Array(g.slots).fill(-1)
      building = true
    }

    const spawnVisitor = (g: Geo, x?: number) => {
      const visitors = bots.filter((b) => b.role === "visitor").length
      if (visitors >= (g.narrow ? 1 : 2)) return
      const fromLeft = x === undefined ? Math.random() < 0.5 : x < g.w / 2
      const v = bot("visitor", x ?? (fromLeft ? -SW * g.p - 4 : g.w + 4))
      v.carry = true
      if (x !== undefined) {
        v.state = "drop"
        v.drop = 10 * g.p
      } else {
        walkTo(v, pileSide(g, v.x), () => place(v, g, fromLeft))
      }
      bots.push(v)
      if (x !== undefined) v.arrive = () => walkTo(v, pileSide(g, v.x), () => place(v, g, fromLeft))
    }

    function place(v: Bot, g: Geo, fromLeft: boolean) {
      v.face = v.x < g.pileX ? 1 : -1
      v.state = "place"
      v.t = 0.3
      v.arrive = () => {
        v.carry = false
        if (pile < PILE_MAX) pile++
        puff(v.x < g.pileX ? g.pileX : g.pileX + PILE_COLS * 7 * g.p - g.p, g.ground - 3 * g.p, 3, g.p)
        // Sigue su camino hacia el otro lado.
        walkTo(v, fromLeft ? g.w + 4 : -SW * g.p - 4, () => (v.gone = true))
      }
    }

    const puff = (x: number, y: number, n: number, p: number) => {
      for (let i = 0; i < n && sparks.length < 48; i++) {
        sparks.push({ x, y, vx: rand(-40, 40) * (p / 3), vy: rand(-120, -50) * (p / 3), life: rand(0.35, 0.6), c: Math.random() < 0.7 ? PAL.Y : PAL.W })
      }
    }

    /* ---------- simulación ---------- */
    const step = (dt: number) => {
      const g = geo
      if (!g) return
      const p = g.p
      clock += dt

      for (const b of bots) {
        // parpadeo y saludo
        b.blinkIn -= dt
        if (b.blinkIn <= 0) {
          b.blink = 0.12
          b.blinkIn = rand(2, 6)
        }
        if (b.blink > 0) b.blink -= dt
        if (b.state === "sit") {
          b.waveIn -= dt
          if (b.waveIn <= 0) {
            b.wave = 1.3
            b.waveIn = rand(6, 11)
          }
          if (b.wave > 0) b.wave -= dt
        }

        if (b.state === "drop") {
          b.drop = Math.max(0, b.drop - dt * 70 * p)
          if (!b.drop) b.arrive?.()
          continue
        }
        if (b.state === "walk") {
          const speed = building && b.role !== "visitor" ? Math.max(130, (g.beamEnd - g.beamX) / 2.2) : (b.role === "visitor" ? 30 : 38) * p
          const d = b.tx - b.x
          b.face = d >= 0 ? 1 : -1
          const move = Math.min(Math.abs(d), speed * dt)
          b.x += Math.sign(d) * move
          b.stride += move / (1.6 * p)
          if (Math.abs(b.tx - b.x) < 0.5) {
            b.x = b.tx
            b.state = "idle"
            const then = b.arrive
            b.arrive = undefined
            then?.()
          }
          continue
        }
        if (b.state === "hammer") {
          const before = b.t
          b.t += dt
          // 3 golpes (0,42 s cada uno) y un descanso de 1,6 s.
          const cycle = 3 * 0.42 + 1.6
          const k0 = before % cycle
          const k1 = b.t % cycle
          for (let hit = 1; hit <= 3; hit++) {
            const at = hit * 0.42 - 0.12
            if ((k0 < at && k1 >= at) || (k1 < k0 && at > k0)) {
              puff(b.x + (b.face > 0 ? SW * p : 0), g.beamY + 2 * p, 4, p)
            }
          }
          continue
        }
        if (b.state === "pick" || b.state === "lift" || b.state === "place") {
          b.t -= dt
          if (b.t > 0) continue
          if (b.state === "pick") {
            b.carry = true
            walkTo(b, g.stations.carrier, () => {
              b.face = 1
              b.state = "lift"
              b.t = 0.45
            })
          } else if (b.state === "lift") {
            b.carry = false
            puff(b.x + 4.5 * p, g.beamY + 2 * p, 5, p)
            fetchBlock(b, g)
          } else {
            const then = b.arrive
            b.arrive = undefined
            then?.()
          }
          continue
        }
        if (b.state === "idle" && b.role === "carrier" && !building) {
          b.t -= dt
          if (b.t <= 0) fetchBlock(b, g)
        }
      }

      // Armado de la viga: el primero pone un bloque cada vez que pasa por un hueco.
      if (building) {
        const lead = bots[0]
        const center = lead.x + (SW * p) / 2
        while (placed < g.slots && center >= g.beamX + placed * g.pitch + 3 * p) {
          placedAt[placed] = clock
          placed++
          if (placed % 3 === 0) puff(g.beamX + placed * g.pitch, g.beamY, 2, p)
        }
        if (placed === g.slots) {
          building = false
          bots.forEach((b) => {
            b.carry = false
            const station = g.stations[b.role as "hammer"]
            walkTo(b, station, () => routine(b, g))
          })
        }
      } else {
        spawnIn -= dt
        if (spawnIn <= 0) {
          if (pile < PILE_MAX) spawnVisitor(g)
          spawnIn = rand(6, 10)
        }
      }

      bots = bots.filter((b) => !b.gone)
      sparks = sparks.filter((s) => {
        s.life -= dt
        s.vy += 420 * (p / 3) * dt
        s.x += s.vx * dt
        s.y += s.vy * dt
        return s.life > 0
      })
    }

    /* ---------- dibujo ---------- */
    const px = (b: Bot, top: number, col: number, row: number, c: string, p: number) => {
      const x = b.face === 1 ? b.x + col * p : b.x + (SW - 1 - col) * p
      ctx.fillStyle = c
      ctx.fillRect(Math.round(x), Math.round(top + row * p), p, p)
    }

    const rows = (b: Bot, list: string[], top: number, p: number) => {
      for (let r = 0; r < list.length; r++) {
        for (let c = 0; c < SW; c++) {
          const ch = list[r][c]
          if (ch && ch !== ".") px(b, top, c, r, PAL[ch], p)
        }
      }
    }

    const block = (x: number, y: number, p: number, shine = false) => {
      ctx.fillStyle = PAL.Y
      ctx.fillRect(Math.round(x), Math.round(y), 6 * p, p)
      ctx.fillStyle = PAL.D
      ctx.fillRect(Math.round(x), Math.round(y + p), 6 * p, p)
      ctx.fillStyle = shine ? PAL.W : PAL.L
      ctx.fillRect(Math.round(x), Math.round(y), shine ? 6 * p : p, p)
    }

    const drawBot = (b: Bot, g: Geo) => {
      const p = g.p
      const head = b.blink > 0 ? HEAD_BLINK : HEAD
      if (b.state === "sit") {
        const top = g.ground - (HEAD.length + BODY.length + SIT_LEGS.length) * p
        rows(b, [...head, ...BODY, ...SIT_LEGS], top, p)
        if (b.wave > 0) {
          const up = Math.floor(b.wave * 6) % 2 === 0
          px(b, top, 7, up ? 2 : 3, PAL.W, p)
          px(b, top, up ? 8 : 7, up ? 1 : 4, PAL.W, p)
        }
        return
      }
      const lifting = b.state === "lift"
      const bob = b.state === "walk" && WALK[Math.floor(b.stride) % 4] === 1 ? -p : 0
      const top = g.ground - SH * p - b.drop + bob
      const legs = b.state === "walk" ? LEGS[WALK[Math.floor(b.stride) % 4]] : LEGS[0]
      rows(b, [...head, ...BODY, ...legs], top, p)

      if (b.carry || lifting) {
        // El bloque va sobre la cabeza; al levantarlo sube hasta la viga.
        const raise = lifting ? Math.min(1, (0.45 - b.t) / 0.3) * 2 * p : 0
        block(b.x + 1.5 * p, top - 2 * p - raise, p)
        px(b, top, 1, 0, PAL.W, p)
        px(b, top, 7, 0, PAL.W, p)
      }
      if (b.state === "hammer") {
        const k = b.t % (3 * 0.42 + 1.6)
        const up = k < 3 * 0.42 && k % 0.42 < 0.3
        if (up) {
          // brazo arriba: el martillo golpea la viga
          px(b, top, 7, 3, PAL.W, p)
          px(b, top, 8, 2, PAL.G, p)
          px(b, top, 8, 1, PAL.G, p)
          px(b, top, 8, -1, PAL.W, p)
          px(b, top, 7, -1, PAL.W, p)
          px(b, top, 8, 0, PAL.G, p)
        } else {
          px(b, top, 7, 6, PAL.W, p)
          px(b, top, 8, 6, PAL.G, p)
          px(b, top, 8, 5, PAL.W, p)
          px(b, top, 8, 7, PAL.W, p)
        }
      }
    }

    function draw() {
      const g = geo
      if (!g) return
      const p = g.p
      ctx.clearRect(0, 0, g.w, g.h)

      // Viga: cada bloque cae con un pequeño rebote; un destello la recorre cada 6 s.
      const sweep = reduced || building ? -99 : ((clock % 6) / 0.9) * (g.slots + 4) - 2
      for (let j = 0; j < placed; j++) {
        const age = placedAt[j] < 0 ? 1 : (clock - placedAt[j]) / 0.18
        const fall = age >= 1 ? 0 : (1 - age) * (1 - age) * 5 * p
        block(g.beamX + j * g.pitch, g.beamY - fall, p, j >= sweep && j < sweep + 2)
      }

      for (let k = 0; k < pile; k++) {
        const row = Math.floor(k / PILE_COLS)
        const col = k % PILE_COLS
        block(g.pileX + col * 7 * p + (row % 2) * 3 * p, g.ground - (row + 1) * 3 * p + p, p)
      }

      for (const b of bots) drawBot(b, g)

      for (const s of sparks) {
        ctx.globalAlpha = Math.min(1, s.life / 0.3)
        ctx.fillStyle = s.c
        ctx.fillRect(Math.round(s.x), Math.round(s.y), p, p)
      }
      ctx.globalAlpha = 1
    }

    /* ---------- bucle ---------- */
    const tick = (now: number) => {
      frame = 0
      if (!visible || reduced) return
      const elapsed = now - last
      if (elapsed >= FPS) {
        step(Math.min(0.05, elapsed / 1000))
        last = now
      }
      if (now - drawnAt >= FPS) {
        draw()
        drawnAt = now
      }
      frame = requestAnimationFrame(tick)
    }

    function wake() {
      if (frame || reduced || !visible || !started) return
      last = performance.now()
      frame = requestAnimationFrame(tick)
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
        draw()
        return
      }
      // Primera vez: la cuadrilla entra a armar la viga. Si cambió el ancho,
      // la viga se rehace completa y cada uno vuelve a su puesto.
      if (!prev && !reduced) startBuild(g)
      else settle(g)
      draw()
      wake()
    }

    const onClick = (event: MouseEvent) => {
      const g = geo
      if (!g || reduced || building) return
      const target = event.target as Element | null
      if (target?.closest("a,button,input,h1,p,header,nav")) return
      const x = Math.min(Math.max(event.clientX - host.getBoundingClientRect().left - (SW * g.p) / 2, 0), g.w - SW * g.p)
      spawnVisitor(g, x)
    }

    const onMotion = () => {
      reduced = motion.matches
      if (!geo) return
      if (reduced) {
        cancelAnimationFrame(frame)
        frame = 0
        settle(geo)
        draw()
      } else {
        settle(geo)
        wake()
      }
    }

    const ro = new ResizeObserver(() => started && resize())
    ro.observe(host)
    const io = new IntersectionObserver((entries) => {
      visible = entries.some((e) => e.isIntersecting) && document.visibilityState === "visible"
      wake()
    })
    io.observe(host)
    const onVisibility = () => {
      visible = document.visibilityState === "visible"
      wake()
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
