import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState } from "react";
import { playDing, playPop, speak } from "../lib/audio";
import {
  ALBUMS,
  NUM_COLORS,
  STICKERS,
  albumOf,
} from "../lib/data";
import type { SceneSpot, StarMeter } from "../hooks/useProgress";
import { P } from "../lib/phrases";
import { useTimers } from "../hooks/useTimers";
import { GameFrame, StarGauge, TopBar } from "../components/ui";
import { StickerFace } from "../components/buddy";
import { Glyph } from "../art/Glyph";

interface Props {
  stars: StarMeter;
  unlocked: number[];
  shiny: number;
  scene: SceneSpot[];
  onPlace: (i: number) => boolean;
  onBuddy: (i: number) => void;
  onHome: () => void;
}

export default function StickerBook({ stars, unlocked, shiny, scene, onPlace, onBuddy, onHome }: Props) {
  const { after, clearAll } = useTimers();
  const [bounce, setBounce] = useState<number | null>(null);
  const [counting, setCounting] = useState(-1);
  const countingRef = useRef(false);
  // 지금 모으는 중인 스티커북까지만 보여 준다
  const lastAlbum = albumOf(Math.min(unlocked.length, STICKERS.length - 1));
  const [album, setAlbum] = useState(unlocked.length > 0 ? albumOf(unlocked[unlocked.length - 1]) : 0);
  const isShiny = (i: number) => i < shiny;

  const hop = (i: number) => {
    setBounce(i);
    after(700, () => setBounce((b) => (b === i ? null : b)));
  };

  const tapSticker = (i: number) => {
    if (!unlocked.includes(i)) {
      speak(P.moreStars);
      return;
    }
    if (countingRef.current) return;
    playDing();
    hop(i);
    onBuddy(i);
    const placed = onPlace(i);
    speak(placed ? P.stickerHop(STICKERS[i].name) : P.stickerName(STICKERS[i].name), { pitch: 1.3 });
  };

  const tapInScene = (i: number) => {
    if (countingRef.current) return;
    playPop(2);
    hop(i);
    speak(P.stickerName(STICKERS[i].name), { pitch: 1.3 });
  };

  /** 장면에 있는 친구를 하나씩 짚으며 같이 센다 */
  const countScene = () => {
    if (countingRef.current || scene.length === 0) return;
    countingRef.current = true;
    clearAll();
    const step = 750;
    speak(P.countScene);
    scene.forEach((_, k) => {
      after(1100 + k * step, () => {
        setCounting(k);
        playPop(k + 1);
        speak(P.count(k + 1), { rate: 0.85, pitch: 1.2 });
      });
    });
    after(1100 + scene.length * step + 200, () => {
      speak(P.friendsTotal(scene.length), { pitch: 1.25 });
    });
    after(1100 + scene.length * step + 2400, () => {
      setCounting(-1);
      countingRef.current = false;
    });
  };

  const a = ALBUMS[album];

  return (
    <GameFrame scene="town" buddy={false}>
      <TopBar onHome={onHome} stars={stars} title="내 스티커" emoji="📒" />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center gap-3 px-4 pb-4 pt-2 short:gap-1.5 short:pb-2 short:pt-1">
        {/* 꾸미기 장면: 스티커를 누르면 여기로 폴짝 */}
        <div className="relative h-[clamp(130px,30vh,260px)] w-full max-w-3xl shrink-0 overflow-hidden rounded-[2rem] border-4 border-white shadow-xl short:h-[34vh] short:rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-b from-sky-300 via-sky-100 to-sky-50" />
          <div className="absolute bottom-0 left-0 right-0 h-[48%] rounded-t-[40%] bg-gradient-to-t from-lime-300 to-lime-200" />
          <Glyph emoji="☀️" className="absolute right-3 top-2 text-3xl" />
          <Glyph emoji="☁️" className="absolute left-4 top-3 text-2xl opacity-80" />

          {scene.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-xl text-slate-500 sm:text-2xl">
              아래 스티커를 누르면 여기로 폴짝! <Glyph emoji="🐾" />
            </div>
          ) : null}

          <AnimatePresence>
            {scene.map((s, k) => {
              const active = counting === k;
              const counted = counting >= k;
              return (
                <motion.button
                  key={s.i}
                  initial={{ scale: 0, y: 60 }}
                  animate={
                    active || bounce === s.i
                      ? { scale: [1, 1.35, 1], y: [0, -24, 0] }
                      : { scale: 1, y: 0 }
                  }
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 320, damping: 14 }}
                  onPointerDown={() => tapInScene(s.i)}
                  aria-label={STICKERS[s.i].name}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${s.x * 100}%`, top: `${s.y * 100}%` }}
                >
                  <StickerFace
                    index={s.i}
                    shiny={isShiny(s.i)}
                    mood={active || bounce === s.i ? "cheer" : counting >= 0 && counted ? "happy" : "idle"}
                    className="text-[clamp(2.2rem,min(9vw,8vh),3.8rem)] drop-shadow"
                  />
                  {counting >= 0 && counted ? (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-base text-white shadow"
                      style={{ background: NUM_COLORS[k % NUM_COLORS.length] }}
                    >
                      {k + 1}
                    </motion.span>
                  ) : null}
                </motion.button>
              );
            })}
          </AnimatePresence>

          {scene.length > 0 ? (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={countScene}
              className="pressable absolute bottom-2 right-2 flex items-center gap-1 rounded-full border-4 border-white bg-amber-400 px-4 py-1.5 text-xl text-white shadow-[0_5px_0_0_rgba(0,0,0,0.12)] short:py-0.5 short:text-base"
            >
              <Glyph emoji="🔢" /> 같이 세기
            </motion.button>
          ) : null}
        </div>

        {/* 다음 스티커까지 */}
        <div className="flex w-full max-w-3xl flex-wrap items-center justify-center gap-2">
          <div className="flex items-center gap-2 rounded-full border-4 border-white bg-white/90 px-4 py-1 shadow short:py-0">
            <span className="text-lg text-slate-600 sm:text-xl">
              {stars.done ? "모두 모았어요!" : stars.shiny ? "반짝이까지" : "다음 친구까지"}
            </span>
            <StarGauge meter={stars} big className="w-[clamp(9rem,40vw,16rem)]" />
          </div>
          {/* 스티커북 고르기 (두 번째 스티커북부터) */}
          {lastAlbum > 0 ? (
            <div className="flex items-center justify-center gap-2">
              {ALBUMS.slice(0, lastAlbum + 1).map((al, k) => (
                <button
                  key={al.title}
                  onClick={() => setAlbum(k)}
                  aria-label={al.title}
                  className={`flex items-center gap-1 rounded-full border-4 px-3 py-1 text-lg shadow short:py-0 ${
                    album === k
                      ? "border-white bg-violet-400 text-white"
                      : "border-white bg-white/80 text-slate-500"
                  }`}
                >
                  <Glyph emoji={al.emoji} className="text-2xl" />
                  <span className="hidden sm:inline">{al.title}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {/* 스티커 그리드 */}
        <div className="min-h-0 w-full max-w-3xl flex-1 overflow-y-auto no-scrollbar">
          <div className="grid grid-cols-4 gap-3 pb-2 sm:grid-cols-6 sm:gap-4 short:grid-cols-8 short:gap-2">
            {STICKERS.slice(a.start, a.end).map((s, k) => {
              const i = a.start + k;
              const has = unlocked.includes(i);
              const inScene = scene.some((x) => x.i === i);
              return (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={
                    bounce === i
                      ? { opacity: 1, scale: [1, 1.3, 0.95, 1.1, 1], rotate: [0, -12, 12, 0] }
                      : { opacity: 1, scale: 1 }
                  }
                  transition={{ delay: bounce === i ? 0 : k * 0.03, duration: 0.6 }}
                  whileTap={{ scale: 0.9 }}
                  onPointerDown={() => tapSticker(i)}
                  aria-label={has ? s.name : "잠긴 스티커"}
                  className={`relative flex aspect-square flex-col items-center justify-center gap-1 rounded-3xl border-4 shadow-[0_6px_0_0_rgba(0,0,0,0.1)] short:gap-0 short:rounded-2xl ${
                    has
                      ? isShiny(i)
                        ? "border-amber-300 bg-gradient-to-br from-yellow-50 to-amber-200"
                        : "border-white bg-gradient-to-br from-white to-yellow-100"
                      : "border-dashed border-slate-300 bg-white/50"
                  }`}
                >
                  {has ? (
                    <StickerFace
                      index={i}
                      shiny={isShiny(i)}
                      className="text-[clamp(2.2rem,min(9vw,9vh),4.2rem)] short:text-3xl"
                    />
                  ) : (
                    <Glyph emoji="❔" className="text-[clamp(2.2rem,min(9vw,9vh),4.2rem)] opacity-30 short:text-3xl" />
                  )}
                  <span
                    className={`text-sm sm:text-base short:hidden ${has ? "text-slate-600" : "text-slate-400"}`}
                  >
                    {has ? s.name : "?"}
                  </span>
                  {inScene ? (
                    <Glyph emoji="🏡" className="absolute -right-1 -top-1 text-lg" />
                  ) : null}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </GameFrame>
  );
}
