import { AnimatePresence, motion } from "framer-motion";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import {
  CYCLE_ORDER,
  CYCLE_PACES,
  CYCLE_PACE_IDS,
  CYCLE_RULES,
  GAME_IDS,
  GAME_META,
  ALBUMS,
  GAME_NAMES,
  MAX_LEVELS,
  SESSION_LIMITS,
  STICKERS,
  albumOf,
  isFollowGame,
  TAP_GAP_OPTIONS,
  levelLabel,
  randomInt,
  shuffle,
  type CyclePace,
  type GameId,
} from "../lib/data";
import { afterSpeech, playDing, playSoft, speak } from "../lib/audio";
import { P } from "../lib/phrases";
import type { Unlock } from "../hooks/useProgress";
import { StickerFace } from "./buddy";
import { Glyph } from "../art/Glyph";
import { Chick } from "../art/Chick";
import { useAutoAdvance } from "../hooks/useAutoAdvance";

/** 선물 상자는 적어도 이만큼 보여 준 뒤(그리고 "선물이 왔어요!" 가 끝난 뒤) 누를 수 있다 */
const GIFT_MIN_MS = 800;
/** 새 친구는 적어도 이만큼 보여 준 뒤(그리고 이름을 다 말한 뒤) 확인 버튼이 나온다 */
const REVEAL_MIN_MS = 1500;
/** 말이 끝나지 않아도 이만큼 지나면 버튼을 보여 준다 (소리가 멈춰 버린 기기에서 갇히지 않게) */
const BUTTON_WAIT_MAX_MS = 8000;

/** step 이 바뀐 뒤 적어도 minMs 가 지나고 모든 말이 끝나면 true. 버튼은 이때부터 누를 수 있다 */
function useReadyAfterSpeech(step: string | null, minMs: number): boolean {
  const [readyFor, setReadyFor] = useState<string | null>(null);
  useEffect(() => {
    if (step === null) return;
    const timers: number[] = [];
    afterSpeech(minMs, BUTTON_WAIT_MAX_MS, () => setReadyFor(step), (id) => timers.push(id));
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [step, minMs]);
  return step !== null && readyFor === step;
}

/* ---------- 새 스티커 획득 ----------
 * 한 단계씩 끝나고 나서 다음으로:
 *   ① 선물 상자 + "선물이 왔어요! 눌러 봐!" → 말이 끝나면 상자를 누를 수 있다
 *   ② 상자를 누르면 새 친구 + "와! 새 친구가 왔어요! ○○!" → 말이 끝나면 [확인] 버튼
 *   ③ [확인] 을 누르면 onClose (다음 라운드 / 다음 놀이)
 * 버튼이 아닌 곳을 눌러도 넘어가지 않는다. 버튼이 나온 뒤 한참(AUTO_ADVANCE_MS) 안 누르면 저절로 넘어간다.
 */
export function StickerReveal({
  unlock,
  onOpen,
  onClose,
}: {
  unlock: Unlock | null;
  /** 선물 상자를 연 순간 (축하 연출) */
  onOpen: () => void;
  onClose: () => void;
}) {
  const index = unlock?.index ?? null;
  const shiny = unlock?.shiny ?? false;
  // 새 스티커북의 첫 장이면 "새 스티커북" 이라고 알려 준다
  const newAlbum = index !== null && !shiny && index > 0 && ALBUMS.some((a) => a.start === index);
  const album = index !== null ? ALBUMS[albumOf(index)] : null;
  const title = shiny ? "반짝반짝 스티커!" : newAlbum ? "새 스티커북이 열렸어요!" : "새 친구가 왔어요!";

  // 선물 상자를 연 스티커. 새 스티커가 오면 다시 선물 상자부터
  const [openedFor, setOpenedFor] = useState<Unlock | null>(null);
  const opened = unlock !== null && openedFor === unlock;
  const step = index === null ? null : opened ? `open-${index}` : `gift-${index}`;
  const giftReady = useReadyAfterSpeech(index !== null && !opened ? step : null, GIFT_MIN_MS);
  const closeReady = useReadyAfterSpeech(index !== null && opened ? step : null, REVEAL_MIN_MS);

  // ① 선물 상자
  useEffect(() => {
    if (index === null || opened) return;
    speak(P.gift, { pitch: 1.3 });
  }, [index, opened]);

  // ② 새 친구
  useEffect(() => {
    if (index === null || !opened) return;
    const name = STICKERS[index].name;
    const say = shiny
      ? P.revealShiny(name)
      : newAlbum && album
        ? P.revealAlbum(album.title, name)
        : P.revealNew(name);
    speak(say, { pitch: 1.3 });
  }, [index, opened, shiny, newAlbum, album]);

  const openGift = () => {
    if (!giftReady || opened) return;
    setOpenedFor(unlock);
    onOpen();
  };

  const close = () => {
    if (!closeReady) return;
    onClose();
  };

  // 한참 안 누르면 저절로 상자를 열고, 또 한참 지나면 저절로 확인
  useAutoAdvance(giftReady && !opened, openGift);
  useAutoAdvance(closeReady, close);

  return (
    <AnimatePresence>
      {index !== null ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-violet-900/60 backdrop-blur-sm"
        >
          {/* 빛줄기 */}
          <motion.div
            className="pointer-events-none absolute h-[140vmax] w-[140vmax] opacity-40"
            style={{
              background:
                "repeating-conic-gradient(from 0deg, #fde68a 0deg 12deg, transparent 12deg 24deg)",
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
          />
          <AnimatePresence mode="wait">
            {!opened ? (
              <motion.div
                key="gift"
                initial={{ scale: 0.2, y: 80, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 1.4, opacity: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 16 }}
                className="relative flex flex-col items-center gap-4 text-center short:gap-2"
              >
                <div className="break-keep text-4xl text-white drop-shadow sm:text-5xl short:text-3xl">
                  선물이 왔어요!
                </div>
                <motion.button
                  onClick={openGift}
                  disabled={!giftReady}
                  aria-label="선물 열기"
                  animate={
                    giftReady
                      ? { scale: [1, 1.1, 1], rotate: [0, -6, 6, 0] }
                      : { scale: 1, rotate: [0, -3, 3, 0] }
                  }
                  transition={{ duration: giftReady ? 0.9 : 1.6, repeat: Infinity }}
                  whileTap={giftReady ? { scale: 0.9 } : undefined}
                  className={`relative flex h-[clamp(9rem,min(40vw,34vh),15rem)] w-[clamp(9rem,min(40vw,34vh),15rem)] items-center justify-center rounded-[3rem] border-8 bg-white/90 shadow-2xl transition-colors ${
                    giftReady ? "border-yellow-300" : "border-white/60"
                  }`}
                >
                  {giftReady ? (
                    <motion.span
                      className="pointer-events-none absolute inset-0 rounded-[2.6rem] border-8 border-yellow-200"
                      initial={{ opacity: 0.9, scale: 1 }}
                      animate={{ opacity: 0, scale: 1.35 }}
                      transition={{ duration: 1.1, repeat: Infinity }}
                    />
                  ) : null}
                  <Glyph emoji="🎁" mood="happy" className="text-[clamp(5rem,min(24vw,20vh),9rem)]" />
                </motion.button>
                <div className="h-10 text-2xl text-white/90 short:h-8 short:text-xl">
                  {giftReady ? (
                    <motion.span
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="inline-flex items-center gap-2"
                    >
                      <motion.span
                        className="inline-block"
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                      >
                        <Glyph emoji="👆" />
                      </motion.span>
                      눌러 봐요
                    </motion.span>
                  ) : (
                    <span className="text-white/60">잘 들어 봐!</span>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="friend"
                initial={{ scale: 0.2, rotate: -20, y: 80 }}
                animate={{ scale: 1, rotate: 0, y: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 14 }}
                className={`relative flex flex-col items-center gap-3 rounded-[3rem] border-8 px-10 py-8 text-center shadow-2xl short:gap-1 short:py-4 ${
                  shiny ? "border-amber-400 bg-gradient-to-b from-yellow-50 to-amber-100" : "border-yellow-300 bg-white"
                }`}
              >
                <div className="break-keep text-3xl text-violet-500 sm:text-4xl short:text-2xl">{title}</div>
                {newAlbum && album ? (
                  <div className="rounded-full bg-violet-100 px-4 py-1 text-xl text-violet-600">
                    <Glyph emoji={album.emoji} /> {album.title}
                  </div>
                ) : null}
                <motion.div
                  className="drop-shadow-xl"
                  animate={{ y: [0, -18, 0], rotate: [0, -8, 8, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                >
                  <StickerFace
                    index={index}
                    shiny={shiny}
                    mood="cheer"
                    className="text-[clamp(6rem,min(30vw,30vh),12rem)]"
                  />
                </motion.div>
                <div className="text-5xl text-slate-700 sm:text-6xl short:text-4xl">{STICKERS[index].name}</div>
                {/* 이름을 다 말하고 나서 확인 버튼 (그전에는 자리만 잡아 둔다) */}
                <div className="mt-2 flex h-16 items-center justify-center short:mt-0 short:h-12">
                  {closeReady ? (
                    <motion.button
                      onClick={close}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: [1, 1.06, 1], opacity: 1 }}
                      transition={{ scale: { duration: 1, repeat: Infinity }, opacity: { duration: 0.2 } }}
                      whileTap={{ scale: 0.9 }}
                      className="rounded-full border-4 border-white bg-emerald-400 px-10 py-2 text-3xl text-white shadow-[0_6px_0_0_#059669] short:py-1 short:text-2xl"
                    >
                      확인 <Glyph emoji="✔" />
                    </motion.button>
                  ) : (
                    <span className="text-lg text-slate-300">잘 들어 봐!</span>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/* ---------- 날아가는 별 ---------- */
export interface FlyingStarItem {
  id: number;
  /** 보너스 별은 금빛으로, 조금 늦게 */
  gold?: boolean;
}

export function FlyingStars({
  items,
  onDone,
}: {
  items: FlyingStarItem[];
  onDone: (id: number) => void;
}) {
  const [target, setTarget] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const jar = document.getElementById("star-jar")?.getBoundingClientRect();
    if (jar) {
      setTarget({ x: jar.left + jar.width / 2, y: jar.top + jar.height / 2 });
    } else {
      setTarget({ x: window.innerWidth - 50, y: 40 });
    }
  }, [items.length]);

  if (!target) return null;
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;

  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      {items.map((it) => (
        <motion.div
          key={it.id}
          className="absolute text-6xl leading-none"
          style={{
            left: cx - 30 + (it.gold ? 50 : 0),
            top: cy - 30,
            filter: it.gold ? "drop-shadow(0 0 10px #f59e0b)" : undefined,
          }}
          initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
          animate={{
            x: [0, 0, target.x - cx],
            y: [0, -60, target.y - cy],
            scale: [0, 2.2, 0.7],
            opacity: [1, 1, 0.9],
            rotate: [0, 20, 360],
          }}
          transition={{
            duration: 1.4,
            times: [0, 0.35, 1],
            ease: "easeInOut",
            delay: it.gold ? 0.35 : 0,
          }}
          onAnimationComplete={() => onDone(it.id)}
        >
          <Glyph emoji={it.gold ? "🌟" : "⭐"} mood="cheer" />
        </motion.div>
      ))}
    </div>
  );
}

/* ---------- 풍선이 둥실둥실 (축하 연출 중 하나) ---------- */
const BALLOONS = Array.from({ length: 10 }, () => "🎈");
const BALLOON_HUES = [0, 200, 35, 265, 320, 180, 0, 230, 300, 20];

export function BalloonRise({ burst }: { burst: number }) {
  const [shown, setShown] = useState(0);
  // 같은 burst 번호로 다시 그리면 풍선 위치가 바뀌지 않게 한 번만 만든다
  const items = useMemo(
    () =>
      BALLOONS.map((e, i) => ({
        e,
        x: 4 + ((i * 97) % 90),
        delay: (i % 5) * 0.12 + Math.random() * 0.2,
        dur: 2.2 + Math.random() * 0.8,
        // 빨간 풍선을 돌려서 예쁜 색만 (초록·올리브는 탁해 보여서 뺀다)
        hue: BALLOON_HUES[i % BALLOON_HUES.length],
      })),
    [burst], // eslint-disable-line react-hooks/exhaustive-deps
  );

  useEffect(() => {
    if (burst === 0) return;
    setShown(burst);
    const t = window.setTimeout(() => setShown(0), 3400);
    return () => window.clearTimeout(t);
  }, [burst]);

  if (shown === 0) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-[55] overflow-hidden">
      {items.map((b, i) => (
        <motion.span
          key={`${shown}-${i}`}
          className="absolute bottom-0 text-6xl leading-none sm:text-7xl"
          style={{ left: `${b.x}%`, filter: `hue-rotate(${b.hue}deg)` }}
          initial={{ y: "20vh", x: 0, rotate: 0 }}
          animate={{ y: "-115vh", x: [0, 18, -14, 10], rotate: [0, 8, -8, 0] }}
          transition={{ duration: b.dur, delay: b.delay, ease: "easeIn" }}
        >
          <Glyph emoji={b.e} mood={i % 2 ? "happy" : "cheer"} />
        </motion.span>
      ))}
    </div>
  );
}

/* ---------- 보너스 별 ---------- */
export function BonusBadge({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          initial={{ opacity: 0, y: -30, scale: 0.5 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6 }}
          transition={{ type: "spring", stiffness: 320, damping: 16 }}
          className="pointer-events-none fixed inset-x-0 top-[16%] z-[56] flex justify-center short:top-[12%]"
        >
          <div className="flex items-center gap-2 rounded-full border-4 border-white bg-gradient-to-r from-amber-300 to-yellow-400 px-6 py-2 text-3xl text-white shadow-xl sm:text-4xl short:text-2xl">
            <motion.span
              className="inline-block leading-none"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
            >
              <Glyph emoji="🌟" />
            </motion.span>
            <span style={{ textShadow: "0 2px 0 rgba(0,0,0,0.2)" }}>보너스 별!</span>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/* ---------- 더 큰 숫자 도전! (레벨업) ---------- */
export function LevelUpBadge({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.6 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ type: "spring", stiffness: 300, damping: 16 }}
          className="pointer-events-none fixed inset-x-0 bottom-[18%] z-[56] flex justify-center"
        >
          <div className="flex items-center gap-2 rounded-full border-4 border-white bg-gradient-to-r from-sky-400 to-violet-400 px-6 py-2 text-2xl text-white shadow-xl sm:text-3xl short:text-xl">
            <motion.span
              className="inline-block leading-none"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 0.6, repeat: Infinity }}
            >
              <Glyph emoji="🚀" mood="cheer" />
            </motion.span>
            <span style={{ textShadow: "0 2px 0 rgba(0,0,0,0.2)" }}>우와, 더 큰 숫자 도전!</span>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/* ---------- 부모님 설정 ---------- */
export function ParentSettings({
  open,
  soundOn,
  voiceOn,
  levels,
  stars,
  totalRounds,
  tapGap,
  cyclePace,
  sessionMin,
  onSetSessionMin,
  onToggleSound,
  onToggleVoice,
  hapticsOn,
  onToggleHaptics,
  onSetLevel,
  onSetTapGap,
  onSetCyclePace,
  onReset,
  onClose,
}: {
  open: boolean;
  soundOn: boolean;
  voiceOn: boolean;
  levels: Record<GameId, number>;
  stars: number;
  totalRounds: number;
  tapGap: number;
  cyclePace: CyclePace;
  sessionMin: number;
  onSetSessionMin: (m: number) => void;
  onToggleSound: () => void;
  onToggleVoice: () => void;
  hapticsOn: boolean;
  onToggleHaptics: () => void;
  onSetLevel: (game: GameId, level: number) => void;
  onSetTapGap: (ms: number) => void;
  onSetCyclePace: (pace: CyclePace) => void;
  onReset: () => void;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          data-no-sparkle
          className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/50 p-4"
        >
          <motion.div
            initial={{ y: 40, scale: 0.95 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 40, scale: 0.95 }}
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6 text-slate-700 shadow-2xl no-scrollbar"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl">
                <Glyph emoji="⚙️" /> 부모님 설정
              </h2>
              <button
                onClick={onClose}
                className="rounded-full bg-slate-100 px-4 py-2 text-lg"
              >
                닫기
              </button>
            </div>

            <div className="space-y-3">
              <Row label="효과음" value={soundOn} onToggle={onToggleSound} />
              <Row label="음성 안내" value={voiceOn} onToggle={onToggleVoice} />
              <Row label="누를 때 진동 (지원 기기만)" value={hapticsOn} onToggle={onToggleHaptics} />

              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="mb-2 text-lg">누르기 속도</div>
                <div className="mb-2 text-sm text-slate-500">
                  이보다 빨리 연달아 누르면 세지 않아요. 아이가 막 누르면 "천천히"로 바꿔 보세요.
                </div>
                <div className="flex gap-2">
                  {TAP_GAP_OPTIONS.map((o) => (
                    <button
                      key={o.ms}
                      onClick={() => onSetTapGap(o.ms)}
                      className={`flex-1 rounded-xl border-2 py-2 text-lg ${
                        tapGap === o.ms
                          ? "border-violet-400 bg-violet-100"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      {o.label}
                      <span className="block text-xs text-slate-400">{o.ms / 1000}초</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="mb-2 text-lg">난이도 (숫자 범위, 최대 19 · 엘리베이터는 20층)</div>
                <div className="mb-3 text-sm text-slate-500">
                  3번 연속 잘하면 한 단계 올라가고, 2번 연속 어려워하면 내려가요. 놀이마다 따로
                  맞출 수 있어요. "몇 개일까?"는 다른 놀이보다 어려워서 단계를 잘게 나눴어요.
                  톡톡 세기·거품 팡팡은 문제를 푸는 단계가 없어서, 몇 개일까·먹이 주기·숫자 찾기에서
                  지금 나오는 가장 큰 수까지 세요. 딩동 엘리베이터는 첫 단계에서만 정답 버튼에 노란 빛을
                  비춰요. 숫자 따라 누르기는 누를 자리 수(2~8자리)로 단계를 나눠요.
                </div>
                <div className="space-y-2">
                  {GAME_IDS.map((g) =>
                    isFollowGame(g) ? (
                      <div key={g} className="rounded-xl bg-white px-3 py-2">
                        <div className="text-base text-slate-700">{GAME_NAMES[g]}</div>
                        <div className="text-sm text-slate-500">
                          {levelLabel(g, levels)} · 다른 놀이의 가장 큰 수에 맞춰요
                        </div>
                      </div>
                    ) : (
                      <LevelRow
                        key={g}
                        name={GAME_NAMES[g]}
                        level={levels[g]}
                        max={MAX_LEVELS[g]}
                        label={levelLabel(g, levels)}
                        onChange={(l) => onSetLevel(g, l)}
                      />
                    ),
                  )}
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="mb-2 text-lg">
                  <Glyph emoji="🎠" /> 빙글빙글 빠르기
                </div>
                <div className="mb-2 text-sm text-slate-500">
                  빙글빙글에서는 놀이가{" "}
                  {CYCLE_ORDER.map((g, i) => (
                    <Fragment key={g}>
                      {i > 0 ? " → " : null}
                      <Glyph emoji={GAME_META[g].emoji} />
                    </Fragment>
                  ))}{" "}
                  순서로 돌아요. 한 놀이에서
                  이만큼 성공하면(또는 이 시간이 지나면) 다음 놀이로 넘어가요. 세기만 하면 끝나는
                  톡톡 세기·거품 팡팡은 시간과 상관없이 더 적게 성공해도 바로 넘어가요.
                </div>
                <div className="flex gap-2">
                  {CYCLE_PACE_IDS.map((p) => (
                    <button
                      key={p}
                      onClick={() => onSetCyclePace(p)}
                      className={`flex-1 rounded-xl border-2 py-2 text-lg ${
                        cyclePace === p
                          ? "border-violet-400 bg-violet-100"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      {CYCLE_PACES[p].label}
                      <span className="block text-xs text-slate-400">{CYCLE_PACES[p].desc}</span>
                      <span className="block text-xs text-slate-400">
                        <Glyph emoji={GAME_META.tap.emoji} />
                        <Glyph emoji={GAME_META.bubbles.emoji} /> {CYCLE_PACES[p].quickWins}번
                      </span>
                    </button>
                  ))}
                </div>
                <div className="mt-2 text-xs text-slate-400">
                  두 번 어려워하면 다음 성공 직후에, {CYCLE_RULES.idleMs / 1000}초 동안 아무것도 안 누르면
                  바로 다른 놀이로 바꿔요. 위쪽 놀이 순서 띠를 길게 누르면 바로 다음 놀이로 갈 수 있어요.
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="mb-2 text-lg">
                  <Glyph emoji="⏰" /> 놀이 시간 알림
                </div>
                <div className="mb-2 text-sm text-slate-500">
                  이만큼 놀면 다음 성공 직후에 병아리가 "오늘은 여기까지! 내일 또 만나" 하고 오늘 모은
                  별과 친구를 보여 줘요. 신나게 끝내야 다음에 또 찾아와요.
                </div>
                <div className="flex gap-2">
                  {SESSION_LIMITS.map((m) => (
                    <button
                      key={m}
                      onClick={() => onSetSessionMin(m)}
                      className={`flex-1 rounded-xl border-2 py-2 text-lg ${
                        sessionMin === m
                          ? "border-violet-400 bg-violet-100"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      {m === 0 ? "끄기" : `${m}분`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                <div className="mb-1 text-lg text-slate-700">
                  <Glyph emoji="📊" /> 기록
                </div>
                <div>
                  모은 별 {stars}개 · 완료한 라운드 {totalRounds}회
                </div>
              </div>

              <div className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">
                <div className="mb-1 text-lg">
                  <Glyph emoji="💡" /> 함께 놀기 팁
                </div>
                <ul className="list-disc space-y-1 pl-5">
                  <li>아이가 누를 때 "하나, 둘, 셋" 함께 소리 내어 세어 주세요.</li>
                  <li>
                    안내 음성이 나오는 동안(<Glyph emoji="👂" /> 표시)에는 눌러도 세지 않아요. 듣고 나서 누르는
                    습관을 만들어요.
                  </li>
                  <li>막 눌러서 끝낸 라운드는 별을 주지 않고 거북이가 "천천히"라고 알려 줘요.</li>
                  <li>틀려도 괜찮아요. 이 앱은 벌점 없이 다시 세어 주는 방식이에요.</li>
                  <li>한 번에 5~10분 정도가 두세 살 아이에게 알맞아요.</li>
                  <li>먹이 주기 4단계부터는 딱 맞게 준 뒤 "다 줬어요"를 눌러야 해요.</li>
                  <li>수가 많아지면 5개씩 줄을 맞춰 보여 줘요. "다섯, 그리고 하나 더" 하고 묶어서 세는 연습이 돼요.</li>
                  <li>숫자 찾기는 "보고 찾기 → 듣고 찾기 → 개수를 세어서 찾기" 순서로 어려워져요. 숫자 이름은 "오"처럼 읽어 줘요.</li>
                  <li>
                    뭘 할지 고르기 어려울 땐 <Glyph emoji="🎠" /> 빙글빙글을 눌러 보세요. 다섯 놀이가 차례로
                    바뀌고, 다음에 열면 지난번 다음 놀이부터 이어져요.
                  </li>
                  <li>스티커북에서 스티커를 누르면 위쪽 장면에 붙고, 그 친구가 놀이 화면에 같이 나와요. 모은 동물 친구는 먹이 주기에 손님으로도 와요.</li>
                  <li>스티커 72개(동물·탈것·숲속 스티커북)를 다 모으면 별 3개마다 스티커가 하나씩 반짝이 스티커로 바뀌어요.</li>
                  <li>음성이 안 나오면 기기의 한국어 음성(TTS)을 설치해 주세요.</li>
                </ul>
              </div>

              <HoldButton
                label="기록 초기화 (2초 길게 누르기)"
                onHold={() => {
                  onReset();
                  onClose();
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/** 놀이 하나의 단계 조절 줄: [−] n단계 · 범위 [+] */
function LevelRow({
  name,
  level,
  max,
  label,
  onChange,
}: {
  name: string;
  level: number;
  max: number;
  label: string;
  onChange: (level: number) => void;
}) {
  const btn =
    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-slate-200 bg-white text-2xl leading-none disabled:opacity-30";
  return (
    <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2">
      <div className="min-w-0 flex-1">
        <div className="text-base text-slate-700">{name}</div>
        <div className="text-sm text-slate-500">
          {level}/{max}단계 · {label}
        </div>
      </div>
      <button
        onClick={() => onChange(level - 1)}
        disabled={level <= 1}
        className={btn}
        aria-label={`${name} 쉽게`}
      >
        −
      </button>
      <button
        onClick={() => onChange(level + 1)}
        disabled={level >= max}
        className={btn}
        aria-label={`${name} 어렵게`}
      >
        +
      </button>
    </div>
  );
}

/** 길게 눌러야 실행되는 버튼 (실수로 초기화되지 않게) */
function HoldButton({ label, onHold, ms = 2000 }: { label: string; onHold: () => void; ms?: number }) {
  const [holding, setHolding] = useState(false);
  const timer = useRef<number | null>(null);

  const start = () => {
    setHolding(true);
    timer.current = window.setTimeout(() => {
      setHolding(false);
      timer.current = null;
      onHold();
    }, ms);
  };
  const end = () => {
    setHolding(false);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = null;
  };

  return (
    <button
      onPointerDown={start}
      onPointerUp={end}
      onPointerLeave={end}
      onPointerCancel={end}
      onContextMenu={(e) => e.preventDefault()}
      className="relative w-full overflow-hidden rounded-2xl border-2 border-rose-200 py-3 text-lg text-rose-500"
    >
      {holding ? (
        <motion.span
          className="absolute inset-0 bg-rose-200/60"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: ms / 1000, ease: "linear" }}
          style={{ transformOrigin: "left" }}
        />
      ) : null}
      <span className="relative">{label}</span>
    </button>
  );
}

function Row({
  label,
  value,
  onToggle,
}: {
  label: string;
  value: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="flex w-full items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-lg"
    >
      <span>{label}</span>
      <span
        className={`relative h-8 w-14 rounded-full transition-colors ${
          value ? "bg-green-400" : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${
            value ? "left-7" : "left-1"
          }`}
        />
      </span>
    </button>
  );
}

/* ---------- 부모님 확인 (덧셈 문제 2개 연속) ---------- */
const GATE_QUESTIONS = 2;

function makeQuestion() {
  const a = randomInt(3, 9);
  const b = randomInt(2, 9);
  const answer = a + b;
  const wrong = new Set<number>();
  while (wrong.size < 2) {
    const w = answer + randomInt(-4, 4);
    if (w !== answer && w > 0) wrong.add(w);
  }
  return { a, b, answer, options: shuffle([answer, ...wrong]) };
}

export function ParentGate({
  open,
  onPass,
  onClose,
}: {
  open: boolean;
  onPass: () => void;
  onClose: () => void;
}) {
  const [shake, setShake] = useState(false);
  const [solved, setSolved] = useState(0);
  // 열릴 때마다, 그리고 한 문제 맞힐 때마다 새 문제
  const q = useMemo(makeQuestion, [open, solved]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (open) setSolved(0);
  }, [open]);

  const pickAnswer = (n: number) => {
    if (n === q.answer) {
      playDing();
      if (solved + 1 >= GATE_QUESTIONS) onPass();
      else setSolved(solved + 1);
    } else {
      playSoft();
      setShake(true);
      window.setTimeout(() => {
        setShake(false);
        onClose();
      }, 500);
    }
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onPointerDown={onClose}
          data-no-sparkle
          className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/50 p-4"
        >
          <motion.div
            onPointerDown={(e) => e.stopPropagation()}
            initial={{ y: 40, scale: 0.95 }}
            animate={shake ? { x: [0, -12, 12, -8, 8, 0], y: 0, scale: 1 } : { y: 0, scale: 1 }}
            exit={{ y: 40, scale: 0.95 }}
            className="w-full max-w-sm rounded-3xl bg-white p-6 text-center text-slate-700 shadow-2xl"
          >
            <div className="text-lg text-slate-500">
              부모님 확인 ({solved + 1}/{GATE_QUESTIONS})
            </div>
            <div className="mt-1 text-sm text-slate-400">
              아이가 열지 못하게 문제 두 개를 이어서 풀어 주세요
            </div>
            <div className="my-4 text-5xl">
              {q.a} + {q.b} = ?
            </div>
            <div className="flex gap-2">
              {q.options.map((n) => (
                <button
                  key={n}
                  onClick={() => pickAnswer(n)}
                  className="flex-1 rounded-2xl border-2 border-slate-200 bg-slate-50 py-3 text-3xl"
                >
                  {n}
                </button>
              ))}
            </div>
            <button onClick={onClose} className="mt-4 text-slate-400 underline">
              닫기
            </button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/* ---------- 같이 춤추는 병아리 (라운드 성공마다) ---------- */
export function CheerChick({ cheer }: { cheer: number }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (cheer === 0) return;
    setShown(cheer);
    const t = window.setTimeout(() => setShown(0), 2600);
    return () => window.clearTimeout(t);
  }, [cheer]);
  return (
    <AnimatePresence>
      {shown ? (
        <motion.div
          key={shown}
          className="pointer-events-none fixed bottom-0 right-[16%] z-[54] text-[clamp(4rem,min(16vw,16vh),7rem)] short:text-[3.5rem]"
          initial={{ y: "110%", rotate: -10 }}
          animate={{ y: "8%", rotate: 0 }}
          exit={{ y: "120%", transition: { duration: 0.3 } }}
          transition={{ type: "spring", stiffness: 260, damping: 14 }}
        >
          <Chick mood="cheer" />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
