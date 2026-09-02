import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { STICKERS, levelRangeLabel, bubbleTargetForLevel, randomInt, shuffle } from "../lib/data";
import { playDing, playSoft, speak } from "../lib/audio";

/* ---------- 새 스티커 획득 ---------- */
export function StickerReveal({
  index,
  onClose,
}: {
  index: number | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (index === null) return;
    speak(`와! 새 친구가 왔어요! ${STICKERS[index].name}!`, { pitch: 1.3 });
    const t = window.setTimeout(onClose, 6000);
    return () => window.clearTimeout(t);
  }, [index, onClose]);

  return (
    <AnimatePresence>
      {index !== null ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onPointerDown={onClose}
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
            <div className="mt-2 text-lg text-slate-400">화면을 누르면 계속해요</div>
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
  onToggleSound,
  onToggleVoice,
  onSetLevel,
  onReset,
  onClose,
}: {
  open: boolean;
  soundOn: boolean;
  voiceOn: boolean;
  levels: Record<string, number>;
  stars: number;
  totalRounds: number;
  onToggleSound: () => void;
  onToggleVoice: () => void;
  onSetLevel: (l: number) => void;
  onReset: () => void;
  onClose: () => void;
}) {
  const [confirmReset, setConfirmReset] = useState(false);
  const levelName = levelRangeLabel;

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
                <div className="mb-2 text-lg">난이도 (숫자 범위)</div>
                <div className="mb-2 text-sm text-slate-500">
                  3번 연속 잘하면 올라가고, 2번 연속 어려워하면 내려가요. 여기서 직접 맞출 수도 있어요.
                  (거품 팡팡은 레벨마다 5 · 7 · 10까지 세요)
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3].map((l) => (
                    <button
                      key={l}
                      onClick={() => onSetLevel(l)}
                      className={`flex-1 rounded-xl border-2 py-2 text-lg ${
                        Object.values(levels).every((v) => v === l)
                          ? "border-violet-400 bg-violet-100"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      {levelName(l)}
                    </button>
                  ))}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-1 text-sm text-slate-500">
                  <span>톡톡 세기: {levelName(levels.tap)}</span>
                  <span>몇 개일까: {levelName(levels.howmany)}</span>
                  <span>먹이 주기: {levelName(levels.feed)}</span>
                  <span>거품 팡팡: 1~{bubbleTargetForLevel(levels.bubbles)}</span>
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
                  <li>틀려도 괜찮아요. 이 앱은 벌점 없이 다시 세어 주는 방식이에요.</li>
                  <li>한 번에 5~10분 정도가 두세 살 아이에게 알맞아요.</li>
                  <li>먹이 주기 최고 레벨에서는 딱 맞게 준 뒤 "다 줬어요"를 눌러야 해요.</li>
                  <li>음성이 안 나오면 기기의 한국어 음성(TTS)을 설치해 주세요.</li>
                </ul>
              </div>

              {!confirmReset ? (
                <button
                  onClick={() => setConfirmReset(true)}
                  className="w-full rounded-2xl border-2 border-rose-200 py-3 text-lg text-rose-500"
                >
                  기록 초기화
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      onReset();
                      setConfirmReset(false);
                      onClose();
                    }}
                    className="flex-1 rounded-2xl bg-rose-500 py-3 text-lg text-white"
                  >
                    정말 초기화
                  </button>
                  <button
                    onClick={() => setConfirmReset(false)}
                    className="flex-1 rounded-2xl bg-slate-100 py-3 text-lg"
                  >
                    취소
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
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

/* ---------- 부모님 확인 (덧셈 문제) ---------- */
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
  const q = useMemo(() => {
    const a = randomInt(3, 9);
    const b = randomInt(2, 9);
    const answer = a + b;
    const wrong = new Set<number>();
    while (wrong.size < 2) {
      const w = answer + randomInt(-4, 4);
      if (w !== answer && w > 0) wrong.add(w);
    }
    return { a, b, answer, options: shuffle([answer, ...wrong]) };
    // 열릴 때마다 새 문제
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const pickAnswer = (n: number) => {
    if (n === q.answer) {
      playDing();
      onPass();
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
            <div className="text-lg text-slate-500">부모님 확인</div>
            <div className="mt-1 text-sm text-slate-400">아이가 열지 못하게 간단한 문제를 풀어 주세요</div>
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
