import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  CYCLE_ORDER,
  CYCLE_PACES,
  CYCLE_PACE_IDS,
  CYCLE_RULES,
  GAME_IDS,
  GAME_META,
  GAME_NAMES,
  MAX_LEVELS,
  STICKERS,
  TAP_GAP_OPTIONS,
  levelLabel,
  randomInt,
  shuffle,
  type CyclePace,
  type GameId,
} from "../lib/data";
import { playDing, playSoft, speak } from "../lib/audio";

/** 새 스티커 화면은 이 시간 동안은 눌러도 닫히지 않는다 (막 눌러서 지나쳐 버리지 않게) */
const REVEAL_MIN_MS = 2000;

/* ---------- 새 스티커 획득 ---------- */
export function StickerReveal({
  index,
  onClose,
}: {
  index: number | null;
  onClose: () => void;
}) {
  const openedAt = useRef(0);

  useEffect(() => {
    if (index === null) return;
    openedAt.current = performance.now();
    speak(`와! 새 친구가 왔어요! ${STICKERS[index].name}!`, { pitch: 1.3 });
    const t = window.setTimeout(onClose, 6000);
    return () => window.clearTimeout(t);
  }, [index, onClose]);

  const tryClose = () => {
    if (performance.now() - openedAt.current < REVEAL_MIN_MS) return;
    onClose();
  };

  return (
    <AnimatePresence>
      {index !== null ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onPointerDown={tryClose}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-violet-900/60 backdrop-blur-sm"
        >
          {/* 빛줄기 */}
          <motion.div
            className="absolute h-[140vmax] w-[140vmax] opacity-40"
            style={{
              background:
                "repeating-conic-gradient(from 0deg, #fde68a 0deg 12deg, transparent 12deg 24deg)",
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            initial={{ scale: 0.2, rotate: -20, y: 80 }}
            animate={{ scale: 1, rotate: 0, y: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 14 }}
            className="relative flex flex-col items-center gap-3 rounded-[3rem] border-8 border-yellow-300 bg-white px-10 py-8 text-center shadow-2xl"
          >
            <div className="text-3xl text-violet-500 sm:text-4xl">새 친구가 왔어요!</div>
            <motion.div
              className="emoji text-[clamp(6rem,30vw,12rem)] drop-shadow-xl"
              animate={{ y: [0, -18, 0], rotate: [0, -8, 8, 0] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            >
              {STICKERS[index].emoji}
            </motion.div>
            <div className="text-5xl text-slate-700 sm:text-6xl">{STICKERS[index].name}</div>
            <motion.div
              className="mt-2 text-lg text-slate-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: REVEAL_MIN_MS / 1000 }}
            >
              화면을 누르면 계속해요
            </motion.div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/* ---------- 날아가는 별 ---------- */
export interface FlyingStarItem {
  id: number;
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
          className="emoji absolute text-6xl"
          style={{ left: cx - 30, top: cy - 30 }}
          initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
          animate={{
            x: [0, 0, target.x - cx],
            y: [0, -60, target.y - cy],
            scale: [0, 2.2, 0.7],
            opacity: [1, 1, 0.9],
            rotate: [0, 20, 360],
          }}
          transition={{ duration: 1.4, times: [0, 0.35, 1], ease: "easeInOut" }}
          onAnimationComplete={() => onDone(it.id)}
        >
          ⭐
        </motion.div>
      ))}
    </div>
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
  onToggleSound,
  onToggleVoice,
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
  onToggleSound: () => void;
  onToggleVoice: () => void;
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
          className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/50 p-4"
        >
          <motion.div
            initial={{ y: 40, scale: 0.95 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 40, scale: 0.95 }}
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6 text-slate-700 shadow-2xl no-scrollbar"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl">⚙️ 부모님 설정</h2>
              <button
                onClick={onClose}
                className="rounded-full bg-slate-100 px-4 py-2 text-lg"
              >
                닫기
              </button>
            </div>

            <div className="space-y-3">
              <Row label="효과음" value={soundOn} onToggle={onToggleSound} />
              <Row label="음성 안내 (한국어 TTS)" value={voiceOn} onToggle={onToggleVoice} />

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
                <div className="mb-2 text-lg">난이도 (숫자 범위, 최대 19)</div>
                <div className="mb-3 text-sm text-slate-500">
                  3번 연속 잘하면 한 단계 올라가고, 2번 연속 어려워하면 내려가요. 놀이마다 따로
                  맞출 수 있어요. "몇 개일까?"는 다른 놀이보다 어려워서 단계를 잘게 나눴어요.
                </div>
                <div className="space-y-2">
                  {GAME_IDS.map((g) => (
                    <LevelRow
                      key={g}
                      name={GAME_NAMES[g]}
                      level={levels[g]}
                      max={MAX_LEVELS[g]}
                      label={levelLabel(g, levels[g])}
                      onChange={(l) => onSetLevel(g, l)}
                    />
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="mb-2 text-lg">🎠 빙글빙글 빠르기</div>
                <div className="mb-2 text-sm text-slate-500">
                  빙글빙글에서는 놀이가{" "}
                  {CYCLE_ORDER.map((g) => GAME_META[g].emoji).join(" → ")} 순서로 돌아요. 한 놀이에서
                  이만큼 성공하면(또는 이 시간이 지나면) 다음 놀이로 넘어가요.
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
                    </button>
                  ))}
                </div>
                <div className="mt-2 text-xs text-slate-400">
                  두 번 어려워하면 다음 성공 직후에, {CYCLE_RULES.idleMs / 1000}초 동안 아무것도 안 누르면
                  바로 다른 놀이로 바꿔요. 위쪽 놀이 순서 띠를 길게 누르면 바로 다음 놀이로 갈 수 있어요.
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                <div className="mb-1 text-lg text-slate-700">📊 기록</div>
                <div>
                  모은 별 {stars}개 · 완료한 라운드 {totalRounds}회
                </div>
              </div>

              <div className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">
                <div className="mb-1 text-lg">💡 함께 놀기 팁</div>
                <ul className="list-disc space-y-1 pl-5">
                  <li>아이가 누를 때 "하나, 둘, 셋" 함께 소리 내어 세어 주세요.</li>
                  <li>안내 음성이 나오는 동안(👂 표시)에는 눌러도 세지 않아요. 듣고 나서 누르는 습관을 만들어요.</li>
                  <li>막 눌러서 끝낸 라운드는 별을 주지 않고 거북이가 "천천히"라고 알려 줘요.</li>
                  <li>틀려도 괜찮아요. 이 앱은 벌점 없이 다시 세어 주는 방식이에요.</li>
                  <li>한 번에 5~10분 정도가 두세 살 아이에게 알맞아요.</li>
                  <li>먹이 주기 4단계부터는 딱 맞게 준 뒤 "다 줬어요"를 눌러야 해요.</li>
                  <li>수가 많아지면 5개씩 줄을 맞춰 보여 줘요. "다섯, 그리고 하나 더" 하고 묶어서 세는 연습이 돼요.</li>
                  <li>숫자 찾기는 "보고 찾기 → 듣고 찾기 → 개수를 세어서 찾기" 순서로 어려워져요. 숫자 이름은 "오"처럼 읽어 줘요.</li>
                  <li>뭘 할지 고르기 어려울 땐 🎠 빙글빙글을 눌러 보세요. 다섯 놀이가 차례로 바뀌고, 다음에 열면 지난번 다음 놀이부터 이어져요.</li>
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
