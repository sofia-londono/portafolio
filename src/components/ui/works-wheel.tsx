"use client";

// A portfolio index built as a wheel you turn.
//
// At rest the work sits in a ring around a title, each card tangent to the
// circle. Picking a card (click, tap, arrow keys, the index or a horizontal
// swipe) blows the ring open into a vertical drum: the card at the front lies
// flat and full size, the ones above and below rotate away into hard
// perspective. Keep turning and the drum carries the next piece to the front.
//
// The whole thing is one number - `turn` - read by a single rAF pass that writes
// transforms straight to the DOM. 0 is the ring, 1 is the drum with item 0 at
// the front, and every whole number after that is one more item turned past.
//
// Changes from the original (crafterui) component, all for the portfolio:
// - The mouse wheel turns the drum only while the whole stage is on screen,
//   and lets the page scroll again at either end (3 notches per piece).
// - Touch drags horizontally (`touch-action: pan-y`), so a vertical swipe on a
//   phone always scrolls the page. Mouse drag stays vertical, as designed.
// - `onSelect` opens a piece; `onActiveChange` reports the front card; a
//   `controlRef` lets outside buttons turn it. Cards accept a `cover` node
//   (inline SVG) instead of an image URL.
// - Index and front title adapt to narrow stages instead of shrinking to 4px.
// - The animation loop sleeps once the wheel has landed.
// - In the drum, the card at the front grows (FRONT) and the drum is fitted to
//   the stage with that size, so it never spills over the text beside it.
// - Cards wear a thin frame that fades from the 30X yellow to black.
import * as React from "react";

import { cn } from "@/lib/utils";

export interface WorksWheelItem {
  /** Stable key. Falls back to the title. */
  id?: string;
  /** Project name. Shown beside the front card and in the index. */
  title: string;
  /** Cover art as an image src... */
  image?: string;
  /** ...or as a node (inline SVG). Takes precedence over `image`. */
  cover?: React.ReactNode;
  /** Small mark drawn on the card's corner (e.g. a status dot). */
  badge?: React.ReactNode;
  /** Where the card links to, when there is no `onSelect`. */
  href?: string;
}

export interface WorksWheelHandle {
  next: () => void;
  prev: () => void;
  /** Bring item `i` to the front of the drum. */
  go: (i: number) => void;
}

export interface WorksWheelProps extends Omit<
  React.ComponentPropsWithoutRef<"section">,
  "children" | "onSelect"
> {
  items: WorksWheelItem[];
  /** Sits in the middle of the ring. */
  label?: string;
  /** Small line under the ring label. */
  sublabel?: string;
  /** Label on the card's hover affordance. Omit to drop it. */
  action?: string;
  /** Called when the front card is activated (click, tap or Enter). */
  onSelect?: (index: number) => void;
  /** Called whenever a different card reaches the front. */
  onActiveChange?: (index: number) => void;
  /** Called when the reader keeps scrolling past either end of the wheel
      (1 = past the last piece, -1 = above the ring). Use it to hand the scroll
      back to the page, e.g. by scrolling to the next section. */
  onEdge?: (direction: 1 | -1) => void;
  /** Called when the wheel opens from the ring into the drum (true) or closes back (false). */
  onOpenChange?: (open: boolean) => void;
  controlRef?: React.Ref<WorksWheelHandle>;
  /** Draw the title beside the front card. @default true */
  showTitle?: boolean;
  /** Draw the index down the right-hand side (wide stages only). @default true */
  showIndex?: boolean;
}

/* Geometry - see the original notes: card measured against the stage,
   everything else against the card. */
const CARD_H = 0.6;
const CARD_MAX_W = 0.5; // wide stages
const CARD_MAX_W_NARROW = 0.72; // phones: the card is the point, let it be big
const NARROW = 640;
const CARD_RATIO = 1.45;
const STEP = 30;
const DRUM = 2.05; // > 0.5·sin(STEP)/(1−cos(STEP)) so neighbours stay behind the front card
const LENS = 2.7;
const RING_R = 1.14;
const BOW = 1.82;
const TITLE = 0.124;
const INDEX = 0.04;
const CULL = 1.6;
const FRONT = 1.22; // extra scale of the front card in the drum

const WHEEL_UNITS = 300;
const DRAG_UNITS = 420;
const SETTLE = 140;
const EASE = 0.12;
const TAP_SLOP = 6; // px a pointer may move and still count as a tap

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const rad = (deg: number) => (deg * Math.PI) / 180;

type Stage = { w: number; h: number };

const bowAt = (drumDeg: number, bow: number) =>
  -bow * (1 - Math.cos(rad(drumDeg)));

function place(
  ringDeg: number,
  drumDeg: number,
  ringR: number,
  drumR: number,
  bow: number,
  m: number,
  lift = 0,
) {
  return (
    `translateX(${m * bowAt(drumDeg, bow)}px)` +
    ` rotateZ(${(1 - m) * ringDeg}deg) translateY(${-(1 - m) * ringR}px)` +
    ` rotateX(${m * drumDeg}deg) translateZ(${m * drumR + lift}px)`
  );
}

export function WorksWheel({
  items,
  label = "Taller abierto",
  sublabel,
  action,
  onSelect,
  onActiveChange,
  onOpenChange,
  onEdge,
  controlRef,
  showTitle = true,
  showIndex = true,
  className,
  ...props
}: WorksWheelProps) {
  const stageRef = React.useRef<HTMLDivElement>(null);
  const wheelRef = React.useRef<HTMLDivElement>(null);
  const cardRefs = React.useRef<(HTMLElement | null)[]>([]);
  const labelRef = React.useRef<HTMLDivElement>(null);
  const titleRef = React.useRef<HTMLDivElement>(null);
  const indexRef = React.useRef<HTMLOListElement>(null);

  const turn = React.useRef(0);
  const target = React.useRef(0);
  const [active, setActive] = React.useState(0);
  const [stage, setStage] = React.useState<Stage>({ w: 0, h: 0 });
  const wake = React.useRef<() => void>(() => {});

  const count = items.length;
  const last = Math.max(count - 1, 0);
  const narrow = stage.w > 0 && stage.w < NARROW;

  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const read = () => setReduced(query.matches);
    read();
    query.addEventListener("change", read);
    return () => query.removeEventListener("change", read);
  }, []);

  React.useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const read = () => setStage({ w: el.clientWidth, h: el.clientHeight });
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const metrics = React.useMemo(() => {
    const { w, h } = stage;
    const maxW = w < NARROW ? CARD_MAX_W_NARROW : CARD_MAX_W;
    const cardW = Math.min(h * CARD_H * CARD_RATIO, w * maxW);
    const cardH = cardW / CARD_RATIO;
    const drumR = cardH * DRUM;
    const ringR = cardH * RING_R;
    const ringScale = count
      ? clamp((((2 * Math.PI * ringR) / count) * 0.82) / (cardW || 1), 0.16, 1)
      : 1;
    // The ring must fit the stage: on a phone the card is big (it is the point
    // of the drum), so the ring is drawn smaller and grows into the drum.
    // Outer radius of the ring: card centres sit on ringR, each card is tangent,
    // so its far corners reach sqrt((ringR + h/2)^2 + (w/2)^2).
    const outer = Math.hypot(ringR + (cardH * ringScale) / 2, (cardW * ringScale) / 2);
    const ringFit = outer ? Math.min(1, (Math.min(w, h) * 0.46) / outer) : 1;
    // The drum must fit too: the neighbours one step away are the tallest and,
    // with the bow, the furthest left. Project their outer edge and shrink the
    // whole drum if it would leave the stage.
    const depth = cardH * LENS;
    const th = rad(STEP);
    const zN = drumR * (Math.cos(th) - 1);
    const pScale = depth / (depth - zN);
    const yN = (drumR * Math.sin(th) + (cardH / 2) * Math.cos(th)) * pScale;
    const xN = (cardH * BOW * (1 - Math.cos(th)) + cardW / 2) * pScale;
    const drumFit = Math.min(
      1,
      (h * 0.49) / Math.max(yN, (cardH * FRONT) / 2 || 1),
      (w * 0.47) / Math.max(xN, (cardW * FRONT) / 2 || 1),
    );
    return {
      cardW,
      cardH,
      ringR,
      ringScale,
      ringFit,
      drumFit,
      drumR,
      bow: cardH * BOW,
      depth: cardH * LENS,
      title: Math.max(cardH * TITLE, 18),
      // Width of the hole in the middle of the ring, so the label never
      // touches the cards: inner radius = ring radius minus half a card.
      hole: Math.max(2 * (ringR - (cardH * ringScale) / 2) * ringFit * 0.86, 120),
      index: Math.max(cardH * INDEX, 12),
    };
  }, [stage, count]);

  const onActiveRef = React.useRef(onActiveChange);
  onActiveRef.current = onActiveChange;
  const onEdgeRef = React.useRef(onEdge);
  onEdgeRef.current = onEdge;
  const edgeAt = React.useRef(0);
  const onOpenRef = React.useRef(onOpenChange);
  onOpenRef.current = onOpenChange;
  const isOpen = React.useRef(false);
  React.useEffect(() => {
    onActiveRef.current?.(active);
  }, [active]);

  // One pass per frame while moving; the loop stops once the wheel has landed
  // and `wake` restarts it, so an idle wheel costs nothing.
  React.useEffect(() => {
    if (!stage.h) return;
    let frame = 0;
    const { ringR, ringScale, ringFit, drumFit, drumR, bow, depth } = metrics;
    // The front card comes toward the camera instead of scaling in its own
    // plane: perspective makes it FRONT times bigger, and it stays in front
    // of its tilted neighbours instead of being cut by them.
    const frontLift = depth * (1 - 1 / FRONT);

    const draw = () => {
      const gap = target.current - turn.current;
      const settled = Math.abs(gap) < 0.0005;
      if (settled) turn.current = target.current;
      else turn.current += gap * (reduced ? 1 : EASE);

      const t = turn.current;
      const m = clamp(t, 0, 1);
      const pos = Math.max(0, t - 1);

      if (wheelRef.current) {
        wheelRef.current.style.transform = `translateZ(${-m * drumR}px) scale(${lerp(ringFit, drumFit, m)})`;
      }

      for (let i = 0; i < count; i++) {
        const d = i - pos;
        const card = cardRefs.current[i];
        if (card) {
          const lift = frontLift * m * clamp(1 - Math.abs(d), 0, 1);
          card.style.transform = place(d * (360 / count), d * STEP, ringR, drumR, bow, m, lift);
          const hidden = m > 0.5 && Math.abs(d) > CULL;
          card.style.opacity = hidden ? "0" : "1";
          card.style.visibility = hidden ? "hidden" : "visible";
          card.style.zIndex = String(Math.round(100 - Math.abs(d) * 2));
        }
        const face = card?.firstElementChild as HTMLElement | null;
        if (face) face.style.transform = `scale(${lerp(ringScale, 1, m)})`;
      }

      if (labelRef.current) labelRef.current.style.opacity = String(1 - m);
      if (titleRef.current) titleRef.current.style.opacity = String(m);
      if (indexRef.current) {
        indexRef.current.style.opacity = String(m);
        indexRef.current.style.visibility = m < 0.05 ? "hidden" : "visible";
      }
      if ((m >= 0.5) !== isOpen.current) {
        isOpen.current = m >= 0.5;
        onOpenRef.current?.(isOpen.current);
      }
      const near = clamp(Math.round(pos), 0, last);
      setActive((prev) => (prev === near ? prev : near));

      frame = settled ? 0 : requestAnimationFrame(draw);
    };

    wake.current = () => {
      if (!frame) frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };
  }, [metrics, stage.h, count, last, reduced]);

  const to = React.useCallback(
    (next: number) => {
      target.current = clamp(next, 0, last + 1);
      wake.current();
    },
    [last],
  );

  React.useImperativeHandle(
    controlRef,
    () => ({
      next: () => to(Math.round(target.current) + 1),
      prev: () => to(Math.max(1, Math.round(target.current) - 1)),
      go: (i: number) => to(i + 1),
    }),
    [to],
  );

  // Wheel/trackpad turns the drum, and lets go at both ends: scrolling up from
  // the ring, or down past the last piece, scrolls the page as usual. The
  // vertical wheel is only taken while the whole stage is on screen, so a
  // reader passing through the page is never caught half-way.
  const settling = React.useRef(0);
  React.useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const onWheel = (event: WheelEvent) => {
      const horiz = Math.abs(event.deltaX) > Math.abs(event.deltaY);
      const delta = horiz ? event.deltaX : event.deltaY;
      if (!delta) return;
      if (!horiz) {
        const r = el.getBoundingClientRect();
        if (r.top < -8 || r.bottom > window.innerHeight + 8) return;
      }
      const cur = target.current;
      if ((delta < 0 && cur <= 0) || (delta > 0 && cur >= last + 1)) {
        // At an end: give the scroll back to the page. With a handler, hand
        // off once per gesture so scroll-snap can't pull the reader back.
        if (!horiz && onEdgeRef.current) {
          event.preventDefault();
          const now = performance.now();
          if (now - edgeAt.current > 700) onEdgeRef.current(delta > 0 ? 1 : -1);
          edgeAt.current = now;
        }
        return;
      }
      event.preventDefault();
      to(cur + delta / WHEEL_UNITS);
      // Settle in the direction of travel: a single notch always lands on the
      // next piece instead of springing back to where it started.
      window.clearTimeout(settling.current);
      settling.current = window.setTimeout(() => {
        const t = target.current;
        to(delta > 0 ? Math.ceil(t - 0.001) : Math.floor(t + 0.001));
      }, SETTLE);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
      window.clearTimeout(settling.current);
    };
  }, [to, last]);

  // Drag. Touch reads the horizontal axis (vertical belongs to the page);
  // mouse and pen read the vertical axis, as the drum turns.
  const drag = React.useRef<{ x: number; y: number; last: number; touch: boolean; moved: boolean } | null>(null);
  const suppressClick = React.useRef(false);

  const activate = (i: number) => {
    if (suppressClick.current) return;
    const atFront = turn.current >= 0.98 && i === active && Math.abs(target.current - (i + 1)) < 0.01;
    if (atFront) {
      if (onSelect) onSelect(i);
      else if (items[i]?.href) window.location.href = items[i].href!;
    } else {
      to(i + 1);
    }
  };

  return (
    <section
      aria-label={label}
      className={cn(
        "bg-background text-foreground relative h-full min-h-[24rem] w-full overflow-hidden select-none",
        className,
      )}
      {...props}
    >
      <div
        ref={stageRef}
        tabIndex={0}
        role="listbox"
        aria-label={`${label}. Flechas para girar, Enter para abrir.`}
        aria-activedescendant={`works-wheel-${active}`}
        className="focus-visible:outline-foreground absolute inset-0 cursor-grab touch-pan-y outline-none focus-visible:outline-2 focus-visible:-outline-offset-4 active:cursor-grabbing"
        style={{ perspective: `${metrics.depth}px` }}
        onPointerDown={(event) => {
          suppressClick.current = false;
          const touch = event.pointerType === "touch";
          drag.current = {
            x: event.clientX,
            y: event.clientY,
            last: touch ? event.clientX : event.clientY,
            touch,
            moved: false,
          };
        }}
        onPointerMove={(event) => {
          const d = drag.current;
          if (!d) return;
          const dx = event.clientX - d.x;
          const dy = event.clientY - d.y;
          if (!d.moved) {
            // A touch that starts vertical is a page scroll: let it go.
            if (d.touch && Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > TAP_SLOP) {
              drag.current = null;
              return;
            }
            if (Math.hypot(dx, dy) < TAP_SLOP) return;
            d.moved = true;
            event.currentTarget.setPointerCapture(event.pointerId);
          }
          const now = d.touch ? event.clientX : event.clientY;
          // Swipe left (or drag up) brings the next piece forward.
          to(Math.max(target.current + (d.last - now) / (d.touch ? DRAG_UNITS * 0.6 : DRAG_UNITS), 0));
          d.last = now;
        }}
        onPointerUp={() => {
          const d = drag.current;
          drag.current = null;
          if (d?.moved) {
            suppressClick.current = true;
            to(Math.max(1, Math.round(target.current)));
          }
        }}
        onPointerCancel={() => {
          drag.current = null;
          if (target.current > 0) to(Math.max(1, Math.round(target.current)));
        }}
        onKeyDown={(event) => {
          const k = event.key;
          if (k === "ArrowDown" || k === "ArrowRight") to(Math.round(target.current) + 1);
          else if (k === "ArrowUp" || k === "ArrowLeft") to(Math.max(1, Math.round(target.current) - 1));
          else if (k === "Home") to(1);
          else if (k === "End") to(last + 1);
          else if (k === "Enter" || k === " ") {
            if (target.current < 1) to(1);
            else onSelect?.(active);
          } else return;
          event.preventDefault();
        }}
      >
        <div
          ref={wheelRef}
          className="absolute top-1/2 left-1/2 [transform-style:preserve-3d]"
        >
          {items.map((item, i) => (
            <button
              key={item.id ?? item.title}
              id={`works-wheel-${i}`}
              type="button"
              role="option"
              tabIndex={-1}
              aria-selected={i === active}
              aria-label={item.title}
              onClick={() => activate(i)}
              ref={(node: HTMLElement | null) => {
                cardRefs.current[i] = node;
              }}
              className="group absolute cursor-pointer [backface-visibility:hidden]"
              style={{
                width: metrics.cardW,
                height: metrics.cardH,
                marginLeft: -metrics.cardW / 2,
                marginTop: -metrics.cardH / 2,
              }}
            >
              {/* Marco: el degradado asoma por el padding, la portada queda entera dentro. */}
              <span className="relative block size-full rounded-xl bg-[linear-gradient(160deg,#ddf46b_0%,#6b7a1f_45%,#000_100%)] p-[3px] shadow-[0_24px_60px_-20px_rgba(0,0,0,.9)]">
              <span className="bg-muted relative block size-full overflow-hidden rounded-[9px]">
                {item.cover ?? (
                  <img
                    src={item.image}
                    alt=""
                    draggable={false}
                    className="size-full object-cover"
                  />
                )}
                {item.badge ? (
                  <span className="absolute top-2.5 right-2.5">{item.badge}</span>
                ) : null}
                {action ? (
                  <span className="bg-background/85 text-foreground pointer-events-none absolute right-3 bottom-3 flex translate-y-1 items-center gap-1 px-2.5 py-1 text-[0.75rem] opacity-0 backdrop-blur-sm transition group-hover:translate-y-0 group-hover:opacity-100">
                    {action}
                  </span>
                ) : null}
              </span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <div
        ref={labelRef}
        className="pointer-events-none absolute inset-0 grid place-content-center text-center"
      >
        <span
          className="mx-auto leading-[1.05] font-[650] tracking-tight text-balance [font-stretch:125%]"
          style={{ fontSize: metrics.title, maxWidth: metrics.hole }}
        >
          {label}
        </span>
        {sublabel ? (
          <span className="text-muted-foreground mx-auto mt-1.5 text-balance tabular-nums" style={{ fontSize: Math.max(metrics.title * 0.4, 12), maxWidth: metrics.hole }}>
            {sublabel}
          </span>
        ) : null}
      </div>

      {showTitle && !narrow ? (
        <div
          ref={titleRef}
          className="pointer-events-none absolute top-1/2 left-[6%] -translate-y-1/2 leading-tight italic opacity-0"
          style={{
            fontSize: metrics.title * 0.8,
            maxWidth: Math.max((stage.w - metrics.cardW) / 2 - stage.w * 0.08, 120),
          }}
        >
          {items[active]?.title}
        </div>
      ) : null}

      {showIndex && !narrow ? (
        <ol
          ref={indexRef}
          className="text-muted-foreground absolute top-[6%] right-[2.5%] text-right leading-[1.8]"
          style={{ fontSize: metrics.index }}
        >
          {items.map((item, i) => (
            <li key={item.id ?? item.title}>
              <button
                type="button"
                onClick={() => to(i + 1)}
                className={cn(
                  "focus-visible:outline-foreground cursor-pointer transition-colors outline-none hover:text-foreground focus-visible:outline-1",
                  i === active && turn.current >= 0.5 && "text-foreground font-medium",
                )}
              >
                {item.title}
              </button>
            </li>
          ))}
        </ol>
      ) : null}
    </section>
  );
}

export default WorksWheel;
