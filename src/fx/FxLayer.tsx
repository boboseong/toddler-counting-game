import { MotionConfig, animate, motion } from "framer-motion";
import { useEffect, useRef, useState, type RefObject } from "react";
import { Glyph } from "../art/Glyph";
import { burstCh, flyCh, reducedMotion, shakeCh, type BurstKind, type FlyEvent, type Point } from "./bus";

/* ---------- 조각 모양 ---------- */

type PieceShape = "star" | "heart" | "dot" | "sparkle" | "petal";

const SHAPES: Record<PieceShape, string> = {
  star: "M12 1.5l3.1 6.6 7.2.9-5.3 5 1.4 7.1L12 17.6l-6.4 3.5L7 14l-5.3-5 7.2-.9z",
  heart: "M12 21s-8.5-5.3-8.5-11.2C3.5 6.6 5.8 4.5 8.4 4.5c1.6 0 2.9.8 3.6 2 .7-1.2 2-2 3.6-2 2.6 0 4.9 2.1 4.9 5.3C20.5 15.7 12 21 12 21z",
  dot: "M12 4a8 8 0 1 0 0 16a8 8 0 1 0 0-16z",
  sparkle: "M12 0c.9 6.2 5.8 11.1 12 12-6.2.9-11.1 5.8-12 12-.9-6.2-5.8-11.1-12-12C6.2 11.1 11.1 6.2 12 0z",
  petal: "M12 2c4 4 5 10 0 20C7 12 8 6 12 2z",
};

const PALETTE = ["#F87171", "#FBBF24", "#4ADE80", "#60A5FA", "#A78BFA", "#F472B6", "#FDE68A"];

interface KindSpec {
  shapes: PieceShape[];
  colors: string[];
  count: number;
  dist: [number, number];
  size: [number, number];
  duration: number;
  /** 위로 떠오르는 정도 (하트) */
  rise: number;
}

const KINDS: Record<BurstKind, KindSpec> = {
  sparkle: {
    shapes: ["sparkle", "star", "dot", "petal"],
    colors: PALETTE,
    count: 6,
    dist: [26, 60],
    size: [12, 22],
    duration: 0.7,
    rise: 10,
  },
  pop: {
    shapes: ["dot", "sparkle", "star"],
    colors: PALETTE,
    count: 9,
    dist: [40, 90],
    size: [10, 20],
    duration: 0.65,
    rise: 0,
  },
  hearts: {
    shapes: ["heart"],
    colors: ["#F472B6", "#FB7185", "#F9A8D4", "#EC4899"],
    count: 7,
    dist: [30, 80],
    size: [18, 30],
    duration: 1.1,
    rise: 60,
  },
  stars: {
    shapes: ["star", "sparkle"],
    colors: ["#FDE68A", "#FBBF24", "#FCD34D", "#ffffff"],
    count: 10,
    dist: [50, 120],
    size: [16, 28],
    duration: 0.9,
    rise: 0,
  },
  confetti: {
    shapes: ["petal", "dot", "star", "heart"],
    colors: PALETTE,
    count: 16,
    dist: [80, 180],
    size: [12, 22],
    duration: 1.1,
    rise: -40,
  },
};

interface Piece {
  shape: PieceShape;
  color: string;
  dx: number;
  dy: number;
  size: number;
  rot: number;
}

interface Burst extends Point {
  id: number;
  pieces: Piece[];
  duration: number;
}

interface Flight extends FlyEvent {
  id: number;
  target: Point;
  /** '동작 줄이기' 설정인데 꼭 보여 줘야 하는 움직임(essential): 돌거나 커지지 않고 곧게 미끄러진다 */
  calm: boolean;
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);

function makePieces(kind: BurstKind, count: number | undefined, color: string | undefined): Piece[] {
  const k = KINDS[kind];
  const n = reducedMotion() ? Math.min(3, count ?? k.count) : Math.min(28, count ?? k.count);
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 + rand(-0.4, 0.4);
    const d = rand(k.dist[0], k.dist[1]);
    return {
      shape: k.shapes[Math.floor(Math.random() * k.shapes.length)],
      // 대표 색이 있으면 반은 그 색으로
      color: color && i % 2 === 0 ? color : k.colors[Math.floor(Math.random() * k.colors.length)],
      dx: Math.cos(a) * d,
      dy: Math.sin(a) * d - k.rise,
      size: rand(k.size[0], k.size[1]),
      rot: rand(-180, 180),
    };
  });
}

function resolveTarget(to: Point | string): Point | null {
  if (typeof to !== "string") return to;
  const el = document.getElementById(to);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

/**
 * 앱 전체에 하나. 버스(fx.*)로 들어온 반짝이·날아가기·흔들기를 그린다.
 * 누르는 것을 가로막지 않도록 pointer-events 는 없다.
 */
export function FxLayer({ shakeTarget }: { shakeTarget: RefObject<HTMLElement | null> }) {
  const [bursts, setBursts] = useState<Burst[]>([]);
  const [flights, setFlights] = useState<Flight[]>([]);
  const nextId = useRef(0);

  useEffect(() => {
    const offBurst = burstCh.on((e) => {
      const id = ++nextId.current;
      const k = KINDS[e.kind];
      const b: Burst = { id, x: e.x, y: e.y, pieces: makePieces(e.kind, e.count, e.color), duration: k.duration };
      setBursts((list) => [...list.slice(-11), b]);
      window.setTimeout(() => setBursts((list) => list.filter((x) => x.id !== id)), k.duration * 1000 + 150);
    });
    const offFly = flyCh.on((e) => {
      const target = resolveTarget(e.to);
      if (!target) {
        e.onArrive?.();
        return;
      }
      const id = ++nextId.current;
      setFlights((list) => [...list, { ...e, id, target, calm: reducedMotion() }]);
    });
    const offShake = shakeCh.on((s) => {
      const el = shakeTarget.current;
      if (!el) return;
      const a = 5 * s;
      void animate(el, { x: [0, -a, a, -a * 0.6, a * 0.6, 0], y: [0, a * 0.4, -a * 0.4, 0] }, { duration: 0.35 });
    });
    return () => {
      offBurst();
      offFly();
      offShake();
    };
  }, [shakeTarget]);

  const landed = (f: Flight) => {
    setFlights((list) => list.filter((x) => x.id !== f.id));
    f.onArrive?.();
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-[66] overflow-hidden" aria-hidden>
      {bursts.map((b) =>
        b.pieces.map((p, i) => (
          <motion.svg
            key={`${b.id}-${i}`}
            viewBox="0 0 24 24"
            width={p.size}
            height={p.size}
            className="absolute"
            style={{ left: b.x - p.size / 2, top: b.y - p.size / 2 }}
            initial={{ x: 0, y: 0, scale: 0.2, opacity: 1, rotate: 0 }}
            animate={{
              x: p.dx,
              y: [0, p.dy * 0.8, p.dy],
              scale: [0.2, 1.2, 0.6],
              opacity: [1, 1, 0],
              rotate: p.rot,
            }}
            transition={{ duration: b.duration, ease: "easeOut" }}
          >
            <path d={SHAPES[p.shape]} fill={p.color} stroke="#fff" strokeWidth={1.2} strokeLinejoin="round" />
          </motion.svg>
        )),
      )}
      {/* '동작 줄이기' 설정에서는 essential 인 것만 여기까지 오므로, 그것들은 설정과 상관없이 움직인다 */}
      <MotionConfig reducedMotion="never">
        {flights.map((f) => {
          const size = f.size ?? 56;
          const dx = f.target.x - f.from.x;
          const dy = f.target.y - f.from.y;
          const arc = f.arc ?? 120;
          return (
            <motion.div
              key={f.id}
              className="absolute flex items-center justify-center"
              style={{ left: f.from.x - size / 2, top: f.from.y - size / 2, width: size, height: size, fontSize: size * 0.85 }}
              initial={{ x: 0, y: 0, scale: 1, rotate: 0 }}
              animate={
                f.calm
                  ? { x: dx, y: dy }
                  : {
                      x: [0, dx * 0.5, dx],
                      y: [0, Math.min(0, dy) * 0.5 - arc, dy],
                      scale: [1, 1.25, 0.55],
                      rotate: [0, -15, 20],
                    }
              }
              transition={
                f.calm
                  ? { duration: f.duration ?? 0.55, ease: "easeInOut" }
                  : { duration: f.duration ?? 0.55, ease: "easeInOut", times: [0, 0.45, 1] }
              }
              onAnimationComplete={() => landed(f)}
            >
              <Glyph emoji={f.emoji} />
            </motion.div>
          );
        })}
      </MotionConfig>
    </div>
  );
}
