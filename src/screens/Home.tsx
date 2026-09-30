import { motion } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import { playDing, speak, speakDuration } from "../lib/audio";
import { Chick } from "../art/Chick";
import { Glyph } from "../art/Glyph";
import { useMood } from "../fx/useMood";
import {
  GAME_IDS,
  GAME_META,
  STARS_PER_STICKER,
  STICKERS,
  type GameId,
} from "../lib/data";
import type { Visit } from "../hooks/useProgress";
import { P } from "../lib/phrases";
import { Background, SpeechBubble, StarJar } from "../components/ui";
import { StickerFace, useBuddy } from "../components/buddy";
import type { Screen } from "../types";

interface Props {
  stars: number;
  stickerCount: number;
  shiny: number;
  todayStars: number;
  visit: Visit;
  onSelect: (s: Screen) => void;
  onCycle: () => void;
  onOpenSettings: () => void;
}

/** 빙글빙글 카드: 놀이가 차례로 바뀌는 모드 */
export const CYCLE_CARD = {
  emoji: "🎠",
  title: "빙글빙글",
  sub: "놀이가 차례로 바뀌어요",
  bg: "linear-gradient(160deg,#fbcfe8,#f472b6 45%,#a78bfa)",
  shadow: "#9d174d",
};

const CARDS: { id: GameId | "cycle"; emoji: string; title: string; sub: string; bg: string; shadow: string }[] = [
  ...GAME_IDS.map((id) => ({ id, ...GAME_META[id] })),
  { id: "cycle" as const, ...CYCLE_CARD },
];

/**
 * 카드는 폰 세로 화면에서 두 칸, 태블릿에서 세 칸, 큰 화면·가로로 눕힌 폰에서 네 칸씩 놓인다.
 * 마지막 줄이 비면 마지막 카드(빙글빙글)가 남은 자리를 다 차지한다 (Tailwind 가 읽도록 클래스는 통째로 적는다)
 */
const SPAN_CLASSES: Record<"base" | "sm" | "lg" | "short", { cols: number; span: string[] }> = {
  base: { cols: 2, span: ["", "col-span-1", "col-span-2"] },
  sm: { cols: 3, span: ["", "sm:col-span-1", "sm:col-span-2", "sm:col-span-3"] },
  lg: { cols: 4, span: ["", "lg:col-span-1", "lg:col-span-2", "lg:col-span-3", "lg:col-span-4"] },
  short: { cols: 4, span: ["", "short:col-span-1", "short:col-span-2", "short:col-span-3", "short:col-span-4"] },
};
const lastSpan = (cols: number) => (CARDS.length % cols === 0 ? 1 : cols - (CARDS.length % cols) + 1);
const LAST_CARD_SPAN = Object.values(SPAN_CLASSES)
  .map(({ cols, span }) => span[lastSpan(cols)])
  .join(" ");
/** 마지막 카드가 어느 화면에서든 두 칸 이상이면 키가 작은 가로 띠로 그려서 한 화면에 더 잘 들어오게 한다 */
const LAST_CARD_WIDE = Object.values(SPAN_CLASSES).every(({ cols }) => lastSpan(cols) >= 2);

/** 다시 찾아온 아이를 기억하는 인사, 오늘 모은 별 이야기를 앞에 붙인다 */
function greetingsFor(visit: Visit, buddyName: string | null, todayStars: number): string[] {
  const out: string[] = [];
  if (visit.returning && buddyName) {
    out.push(P.buddyWaiting(visit.yesterday, buddyName));
  } else if (visit.returning) {
    out.push(P.missedYou);
  }
  if (todayStars > 0) out.push(P.todayStars(todayStars));
  return [...out, ...P.greetings];
}

export default function Home({
  stars,
  stickerCount,
  shiny,
  todayStars,
  visit,
  onSelect,
  onCycle,
  onOpenSettings,
}: Props) {
  const buddy = useBuddy();
  const buddyName = buddy ? STICKERS[buddy.index].name : null;
  // 홈에 들어온 순간의 인사말 목록 (놀다 돌아와도 첫 인사가 바뀌지 않게 한 번만)
  const greetings = useMemo(
    () => greetingsFor(visit, buddyName, todayStars),
    [], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const [greet, setGreet] = useState(0);
  const [mood, flashMood] = useMood("idle", 20000);
  const [buddyHop, setBuddyHop] = useState(0);
  const pressTimer = useRef<number | null>(null);
  const [pressing, setPressing] = useState(false);

  const startPress = () => {
    setPressing(true);
    pressTimer.current = window.setTimeout(() => {
      setPressing(false);
      onOpenSettings();
    }, 1500);
  };
  const endPress = () => {
    setPressing(false);
    if (pressTimer.current) window.clearTimeout(pressTimer.current);
    pressTimer.current = null;
  };

  // 첫 번째 누름은 지금 보이는 인사를 읽어 주고, 그다음부터 다음 인사로
  const spoken = useRef(false);
  const tapMascot = () => {
    playDing();
    const i = spoken.current ? (greet + 1) % greetings.length : greet;
    spoken.current = true;
    setGreet(i);
    speak(greetings[i]);
    flashMood("talk", speakDuration(greetings[i]));
  };

  const tapBuddy = () => {
    if (!buddyName) return;
    playDing();
    setBuddyHop((h) => h + 1);
    speak(P.buddyPlay(buddyName), { pitch: 1.3 });
  };

  const toNext = STARS_PER_STICKER - (stars % STARS_PER_STICKER);
  const collected = stickerCount >= STICKERS.length;
  const allDone = collected && shiny >= STICKERS.length;

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden">
      <Background />

      <div className="relative z-10 flex items-center justify-between px-4 pt-4 short:pt-2 sm:px-6">
        <div className="text-2xl text-slate-500 sm:text-3xl short:text-xl">
          <Glyph emoji="🎈" /> 숫자 놀이터
        </div>
        <StarJar stars={stars} />
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center gap-3 overflow-y-auto px-4 py-3 no-scrollbar short:gap-2 short:py-1 sm:gap-5 short:sm:gap-2">
        {/* 마스코트 */}
        <div className="flex items-center gap-3">
          <motion.button
            onPointerDown={tapMascot}
            whileTap={{ scale: 0.85, rotate: -10 }}
            className="text-[clamp(3.5rem,min(14vw,12vh),7rem)] drop-shadow-lg short:text-[2.6rem]"
            aria-label="병아리 친구"
          >
            <Chick mood={mood} />
          </motion.button>
          <SpeechBubble
            tail="left"
            className="max-w-[min(70vw,28rem)] break-keep text-xl sm:text-2xl short:px-3 short:py-1 short:text-base"
          >
            {greetings[greet]}
          </SpeechBubble>
          {buddy ? (
            <motion.button
              key={buddyHop}
              onPointerDown={tapBuddy}
              animate={buddyHop ? { y: [0, -24, 0], rotate: [0, -10, 10, 0] } : {}}
              transition={{ duration: 0.6 }}
              aria-label={`${buddyName} 친구`}
              className="bob hidden min-[420px]:block"
            >
              <StickerFace
                index={buddy.index}
                shiny={buddy.shiny}
                className="text-[clamp(2.6rem,min(10vw,9vh),4.5rem)] drop-shadow-lg short:text-[2.2rem]"
              />
            </motion.button>
          ) : null}
        </div>

        {todayStars > 0 ? (
          <div className="-mt-1 rounded-full bg-white/80 px-4 py-0.5 text-lg text-amber-600 shadow short:hidden">
            오늘 모은 별 <Glyph emoji="⭐" /> {todayStars}
          </div>
        ) : null}

        {/* 게임 카드 */}
        <div className="grid w-full max-w-4xl grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-4 lg:max-w-5xl lg:grid-cols-4 short:grid-cols-4 short:gap-2">
          {CARDS.map((g, i) => {
            const wide = i === CARDS.length - 1 && LAST_CARD_WIDE;
            return (
              <motion.button
                key={g.id}
                initial={{ opacity: 0, y: 30, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.08 * i, type: "spring", stiffness: 260, damping: 18 }}
                whileTap={{ scale: 0.93 }}
                onClick={() => (g.id === "cycle" ? onCycle() : onSelect(g.id))}
                className={`pressable flex items-center justify-center rounded-[2rem] border-4 border-white text-white short:rounded-2xl ${
                  wide
                    ? "flex-row gap-3 px-4 py-1.5 sm:gap-4 sm:py-3 short:gap-2 short:py-1"
                    : "min-h-[clamp(104px,min(28vw,24vh),220px)] flex-col gap-1 px-3 py-2 sm:p-3 short:min-h-0 short:gap-0 short:p-1.5"
                } ${i === CARDS.length - 1 ? LAST_CARD_SPAN : ""}`}
                style={{ background: g.bg, boxShadow: `0 8px 0 0 ${g.shadow}55` }}
              >
                <Glyph
                  emoji={g.emoji}
                  className={`drop-shadow ${
                    wide
                      ? "text-[clamp(2.2rem,min(9vw,7vh),4.5rem)] short:text-[1.8rem]"
                      : "text-[clamp(2.5rem,min(11vw,9vh),5.5rem)] short:text-[2rem]"
                  } ${g.id === "cycle" ? "spin-slow" : "wiggle"}`}
                  style={{ animationDelay: `${i * 0.3}s` }}
                />
                <span
                  className={`flex ${
                    wide
                      ? "flex-row flex-wrap items-baseline gap-x-2 sm:flex-col sm:items-start"
                      : "flex-col items-center gap-1 short:gap-0"
                  }`}
                >
                  <span
                    className="text-2xl sm:text-3xl short:text-lg"
                    style={{ textShadow: "0 2px 0 rgba(0,0,0,0.2)" }}
                  >
                    {g.title}
                  </span>
                  <span className="text-sm opacity-90 sm:text-base short:hidden">{g.sub}</span>
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* 스티커북 */}
        <motion.button
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onSelect("stickers")}
          className="pressable flex w-full max-w-4xl items-center justify-between rounded-[2rem] lg:max-w-5xl border-4 border-white bg-gradient-to-r from-violet-300 to-fuchsia-300 px-5 py-3 text-white shadow-[0_8px_0_0_rgba(109,40,217,0.35)] short:rounded-2xl short:py-1 short:pr-3"
        >
          <div className="flex items-center gap-3">
            <Glyph emoji="📒" className="text-4xl sm:text-6xl short:text-3xl" />
            <div className="text-left">
              <div className="text-2xl sm:text-3xl short:text-lg" style={{ textShadow: "0 2px 0 rgba(0,0,0,0.2)" }}>
                내 스티커 {stickerCount > 0 ? `(${stickerCount})` : ""}
              </div>
              <div className="text-sm sm:text-base short:text-xs">
                {allDone ? (
                  <>
                    스티커를 모두 모았어요! <Glyph emoji="🎉" />
                  </>
                ) : collected
                    ? `별 ${toNext}개 더 모으면 반짝이 스티커!`
                    : `별 ${toNext}개 더 모으면 새 친구가 와요!`}
              </div>
            </div>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: STARS_PER_STICKER }).map((_, i) => (
              <Glyph
                key={i}
                emoji="⭐"
                className="text-3xl sm:text-4xl short:text-2xl"
                style={{ opacity: i < stars % STARS_PER_STICKER || allDone ? 1 : 0.3 }}
              />
            ))}
          </div>
        </motion.button>
      </div>

      {/* 부모님용 설정 (길게 누르기) */}
      <div className="relative z-10 flex items-center justify-end px-4 pb-3 short:pb-1 sm:px-6">
        <button
          onPointerDown={startPress}
          onPointerUp={endPress}
          onPointerLeave={endPress}
          onPointerCancel={endPress}
          onContextMenu={(e) => e.preventDefault()}
          className="relative flex items-center gap-2 rounded-full bg-white/70 px-3 py-1.5 text-sm text-slate-500 shadow"
          aria-label="부모님 설정 (길게 누르기)"
        >
          <Glyph emoji="⚙️" className="text-lg" />
          <span>부모님용 · 길게 누르기</span>
          {pressing ? (
            <motion.span
              className="absolute inset-0 rounded-full bg-violet-300/40"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.5, ease: "linear" }}
              style={{ transformOrigin: "left" }}
            />
          ) : null}
        </button>
      </div>
    </div>
  );
}
