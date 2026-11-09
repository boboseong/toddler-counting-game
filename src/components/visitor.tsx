import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { PORORO_FRIENDS } from "../art/pororo";
import { fx } from "../fx/bus";
import { playHello } from "../lib/audio";

/** 라운드 성공 때 같이 기뻐해 주는 쪽: 늘 오는 병아리 / 가끔 오는 뽀로로 친구 */
export type CheerBy = "chick" | "friend";

/** 맞힌 뒤 친구가 들어오기까지 (팡파레와 너무 겹치지 않게 조금 늦게) */
const ENTER_DELAY_MS = 550;
/** 화면에 머무는 시간 */
const STAY_MS = 3000;

interface Shown {
  n: number;
  friend: number;
  side: -1 | 1;
}

/**
 * 가끔 뽀로로 친구가 화면 옆에서 깡충깡충 들어와 같이 기뻐하고 돌아간다.
 * cheer 가 바뀔 때(라운드 성공) by 가 "friend" 이면 온다. 누르는 것은 가로막지 않는다.
 */
export function FriendVisit({ cheer, by }: { cheer: number; by: CheerBy }) {
  const [shown, setShown] = useState<Shown | null>(null);
  const last = useRef(-1);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cheer === 0) return;
    if (by !== "friend") {
      setShown(null);
      return;
    }
    // 방금 왔던 친구는 빼고 고른다
    const pool = PORORO_FRIENDS.map((_, i) => i).filter((i) => i !== last.current);
    const friend = pool[Math.floor(Math.random() * pool.length)];
    last.current = friend;
    const side = Math.random() < 0.5 ? -1 : 1;
    const t1 = window.setTimeout(() => {
      setShown({ n: cheer, friend, side });
      playHello();
    }, ENTER_DELAY_MS);
    const t2 = window.setTimeout(() => setShown(null), ENTER_DELAY_MS + STAY_MS);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
    // by 는 cheer 와 같이 바뀌므로 cheer 만 본다
  }, [cheer]);

  // 자리에 도착하면 머리 위로 하트가 퐁퐁 (얼굴은 가리지 않게)
  useEffect(() => {
    if (!shown) return;
    const t = window.setTimeout(() => {
      const r = ref.current?.getBoundingClientRect();
      if (r) fx.burst(r.left + r.width / 2, r.top + r.height * 0.12, "hearts", { count: 9 });
    }, 700);
    return () => window.clearTimeout(t);
  }, [shown]);

  const f = shown ? PORORO_FRIENDS[shown.friend] : null;
  return (
    <AnimatePresence>
      {shown && f ? (
        <motion.div
          key={shown.n}
          ref={ref}
          className={`pointer-events-none fixed z-[54] text-[clamp(5rem,min(24vw,24vh),9rem)] short:text-[4.5rem] ${
            shown.side < 0 ? "left-[3%]" : "right-[3%]"
          } ${f.fly ? "bottom-[24%]" : "bottom-0"}`}
          initial={{ x: shown.side < 0 ? "-140%" : "140%" }}
          animate={{ x: "0%" }}
          exit={{ x: shown.side < 0 ? "-150%" : "150%", transition: { duration: 0.5, ease: "easeIn" } }}
          transition={{ type: "spring", stiffness: 120, damping: 15 }}
        >
          {/* 이름 말풍선 */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 320, damping: 14 }}
              className="whitespace-nowrap rounded-full border-4 border-white bg-white/95 px-4 py-1 text-[clamp(1.3rem,4.5vmin,2rem)] text-sky-600 shadow-lg"
            >
              {f.name}!
            </motion.div>
          </div>
          {/* 걸어오는 친구는 깡충깡충, 해리는 둥실둥실 */}
          <motion.div
            style={{ fontSize: `${f.size ?? 1}em` }}
            animate={f.fly ? { y: [0, -14, 0] } : { y: [0, -36, 0, -26, 0, -14, 0] }}
            transition={f.fly ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" } : { duration: 1.1, ease: "easeOut" }}
            className="drop-shadow-lg"
          >
            <span className="glyph">
              <f.C mood="cheer" />
            </span>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
