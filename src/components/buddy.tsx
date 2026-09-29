import { AnimatePresence, motion } from "framer-motion";
import { createContext, useContext, useEffect, useState } from "react";
import { STICKERS } from "../lib/data";
import { Glyph, hasArt } from "../art/Glyph";
import type { Mood } from "../art/types";

/** 같이 노는 스티커 친구. cheer 가 바뀔 때마다(라운드 성공) 박수를 친다 */
export interface BuddyInfo {
  index: number;
  shiny: boolean;
  cheer: number;
}

export const BuddyContext = createContext<BuddyInfo | null>(null);

export function useBuddy() {
  return useContext(BuddyContext);
}

/** 스티커 그림 (반짝이 스티커면 금빛 후광). 자체 제작 그림이 있으면 그림으로 */
export function StickerFace({
  index,
  shiny,
  className = "",
  mood,
}: {
  index: number;
  shiny: boolean;
  className?: string;
  mood?: Mood;
}) {
  return (
    <span
      className={`relative inline-block leading-none ${className}`}
      style={shiny ? { filter: "drop-shadow(0 0 6px #fbbf24) drop-shadow(0 0 2px #fde68a)" } : undefined}
    >
      <Glyph emoji={STICKERS[index].emoji} mood={mood} />
      {shiny ? (
        <Glyph emoji="✨" className="twinkle absolute -right-2 -top-2 text-[0.45em]" />
      ) : null}
    </span>
  );
}

/**
 * 놀이 화면 왼쪽 아래 풀밭에서 구경하는 친구.
 * 놀이 내용보다 아래 층에 있어서 누르는 것을 가로막지 않는다.
 */
export function GameBuddy() {
  const buddy = useBuddy();
  const [clap, setClap] = useState(false);
  const cheer = buddy?.cheer ?? 0;

  useEffect(() => {
    if (cheer === 0) return;
    setClap(true);
    const t = window.setTimeout(() => setClap(false), 2400);
    return () => window.clearTimeout(t);
  }, [cheer]);

  if (!buddy) return null;
  // 자체 제작 그림 친구는 표정으로 기뻐하고, 이모지 친구는 박수 손을 띄운다
  const art = hasArt(STICKERS[buddy.index].emoji);
  return (
    <div className="pointer-events-none absolute bottom-2 left-2 z-[5] sm:bottom-3 sm:left-4">
      <motion.div
        key={cheer}
        animate={clap ? { y: [0, -26, 0, -18, 0, -10, 0], rotate: [0, -10, 10, -6, 0] } : {}}
        transition={{ duration: 1.4 }}
        className={clap ? "" : "bob"}
      >
        <StickerFace
          index={buddy.index}
          shiny={buddy.shiny}
          mood={clap ? "cheer" : "idle"}
          className="text-[clamp(2.4rem,min(10vw,8vh),3.8rem)] opacity-90 drop-shadow"
        />
      </motion.div>
      <AnimatePresence>
        {clap && !art ? (
          <motion.span
            initial={{ opacity: 0, scale: 0.4, y: 0 }}
            animate={{ opacity: 1, scale: [1, 1.3, 1], y: -18 }}
            exit={{ opacity: 0 }}
            transition={{ scale: { duration: 0.35, repeat: 3 } }}
            className="absolute -right-7 top-0 text-3xl"
          >
            <Glyph emoji="👏" />
          </motion.span>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
