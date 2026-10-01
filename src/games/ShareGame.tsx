import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent } from "react";
import { createPortal } from "react-dom";
import { playChomp, playDing, playPop, playSoft, playTap, prefetchSpeech, speak, speakDuration } from "../lib/audio";
import { P } from "../lib/phrases";
import {
  ANIMALS,
  GUEST_CHANCE,
  counterPhrase,
  guestsFrom,
  obj,
  pick,
  randomIntExcept,
  randomPraise,
  shareLevel,
  type Animal,
} from "../lib/data";
import { useTimers } from "../hooks/useTimers";
import { useRoundGuard } from "../hooks/useRoundGuard";
import { BigNumeral, GameFrame, ListenChip, SpeechBubble, TopBar, WinBanner } from "../components/ui";
import type { GameProps } from "../types";
import { Glyph } from "../art/Glyph";
import type { Mood } from "../art/types";
import { centerOf, fx, type Point } from "../fx/bus";
import { useMood } from "../fx/useMood";

/*
 * 쏙쏙 나눠 주기.
 * 아래쪽에 아이가 가진 먹이가 있고, 위쪽 친구가 "당근 세 개 주세요!" 하면 끌어서(또는 톡 눌러서) 준다.
 * 아이 쪽에는 남은 개수만, 친구 쪽에는 "받은 개수 / 달라는 개수" 가 보인다.
 * "다 줬어요" 를 눌렀을 때 딱 맞으면 친구가 냠냠 먹고, 많거나 적으면 "두 개 빼 주세요!" 처럼 차이만큼 알려 준다.
 * 잘못 준 것은 친구 쪽에서 끌거나 눌러서 돌려받는다.
 */

interface Round {
  id: number;
  animal: Animal;
  /** 친구가 달라는 개수 */
  want: number;
  /** 아이가 가진 개수 */
  have: number;
  /** 스티커로 모은 친구가 손님으로 왔다 */
  guest: boolean;
}

type Phase = "play" | "done";
type Side = "mine" | "friend";

/** 누른 채로 이만큼(px) 움직이면 누르기가 아니라 끌기 */
const DRAG_START_PX = 10;
/** 끌어서 놓을 때 상대 쪽 영역을 이만큼(px) 넉넉하게 봐준다 */
const DROP_SLACK_PX = 24;
/**
 * 옮겨지는 먹이가 날아가는 시간(초).
 * 먹이가 건너가는 것이 곧 "준다"는 뜻이라 '동작 줄이기' 설정에서도 곧게 미끄러져 가는 모습을 보여 준다 (essential)
 */
const FLY_S = 0.5;
/** 날아가는 먹이 크기 (칸 크기에 대한 비율): 칸 안에 놓인 먹이 그림과 비슷하게 */
const FLY_SIZE = 0.9;
/** 아무것도 안 하고 이만큼 지나면 다시 알려 준다 (한 라운드에 MAX_HINTS 번까지) */
const IDLE_HINT_MS = 9000;
const MAX_HINTS = 2;
/** "다 줬어요" 를 연달아 눌러도 한 번만 */
const CONFIRM_GAP_MS = 600;

/** 가진 개수가 많을수록 작게 (Tailwind 가 읽도록 클래스는 통째로 적는다). 5개씩 줄을 맞춘다 */
function sizesFor(have: number) {
  if (have > 10) {
    return {
      grid: "grid grid-cols-5 justify-items-center gap-1.5 short:grid-cols-10 short:gap-1",
      box: "h-[clamp(34px,min(12vw,5.2vh),60px)] w-[clamp(34px,min(12vw,5.2vh),60px)] short:h-[30px] short:w-[30px]",
      tile: "rounded-2xl border-2 short:rounded-xl",
      emoji: "text-[clamp(1.5rem,min(8.5vw,3.7vh),2.6rem)] short:text-[1.3rem]",
    };
  }
  if (have > 5) {
    return {
      grid: "grid grid-cols-5 justify-items-center gap-2 short:grid-cols-10 short:gap-1.5",
      box: "h-[clamp(42px,min(13vw,7.5vh),76px)] w-[clamp(42px,min(13vw,7.5vh),76px)] short:h-[38px] short:w-[38px]",
      tile: "rounded-2xl border-4 short:border-2",
      emoji: "text-[clamp(1.8rem,min(9vw,5.3vh),3.3rem)] short:text-[1.65rem]",
    };
  }
  return {
    grid: "flex flex-wrap justify-center gap-2 sm:gap-4 short:gap-2",
    box: "h-[clamp(48px,min(14vw,10vh),96px)] w-[clamp(48px,min(14vw,10vh),96px)] short:h-[46px] short:w-[46px]",
    tile: "rounded-3xl border-4 short:rounded-2xl short:border-2",
    emoji: "text-[clamp(2.2rem,min(10.5vw,7vh),4.2rem)] short:text-[2rem]",
  };
}

const slotSel = (rid: number, side: Side, id: number) => `[data-share-slot="${rid}-${side}-${id}"]`;

export default function ShareGame({ level, friends, stars, tapGap, onHome, onWin, onResult }: GameProps) {
  const { after, clearAll } = useTimers();
  const guard = useRoundGuard(tapGap);
  const prev = useRef<{ animal?: Animal; want?: number }>({});
  const levelRef = useRef(level);
  levelRef.current = level;
  const friendsRef = useRef(friends);
  friendsRef.current = friends;

  const newRound = (id: number): Round => {
    const lv = shareLevel(levelRef.current);
    const guests = guestsFrom(friendsRef.current).filter((g) => g.name !== prev.current.animal?.name);
    const guest = guests.length > 0 && Math.random() < GUEST_CHANCE;
    const animal = guest
      ? pick(guests)
      : pick(ANIMALS.filter((a) => a.name !== prev.current.animal?.name));
    const want = randomIntExcept(lv.min, lv.max, prev.current.want);
    prev.current = { animal, want };
    return { id, animal, want, have: lv.max, guest };
  };

  const [round, setRound] = useState<Round>(() => newRound(0));
  /** 친구에게 준 먹이 (준 순서대로) */
  const [given, setGiven] = useState<number[]>([]);
  /** 날아가는 중이라 도착하기 전까지 자리만 비워 둔 먹이 */
  const [landing, setLanding] = useState<number[]>([]);
  /** 반대쪽이 아닌 곳에 놓아서 제자리로 돌아가는 중인 먹이 (자리를 옮긴 게 아니라 개수는 그대로) */
  const [snapping, setSnapping] = useState<number[]>([]);
  /** 지금 끌고 있는 먹이 */
  const [drag, setDrag] = useState<{ id: number; from: Side; x: number; y: number; size: number } | null>(null);
  const [overTarget, setOverTarget] = useState(false);
  const [phase, setPhaseState] = useState<Phase>("play");
  /** "다 줬어요" 를 눌렀는데 안 맞았을 때: 많은지 적은지와 차이 */
  const [feedback, setFeedback] = useState<{ more: boolean; diff: number } | null>(null);
  const [shakeKey, setShakeKey] = useState(0);
  /** 한참 가만히 있어서 "다 줬으면 초록 버튼" 을 알려 준 뒤 버튼이 두근거린다 */
  const [nudge, setNudge] = useState(false);
  /** 다 맞게 준 뒤 친구 입으로 들어간 개수 */
  const [eaten, setEaten] = useState(0);
  const [banner, setBanner] = useState(false);
  const [praise, setPraise] = useState("");

  const roundRef = useRef(round);
  roundRef.current = round;
  const givenRef = useRef<number[]>([]);
  const phaseRef = useRef<Phase>("play");
  const setPhase = (p: Phase) => {
    phaseRef.current = p;
    setPhaseState(p);
  };
  /**
   * 이번 라운드에서 한 번이라도 안 맞게 줬거나 다시 알려 주는 힌트를 받았는지 (처음 한 번만 실패로 알린다).
   * 그 뒤에 맞게 주면 화면은 똑같이 축하하지만 단계에는 성공으로 치지 않는다.
   */
  const missed = useRef(false);
  const miss = () => {
    if (missed.current) return;
    missed.current = true;
    onResult(false);
  };
  const lastConfirm = useRef(0);
  const hints = useRef(0);
  const idleTimer = useRef<number | null>(null);
  /** 누르고 있는 손가락 (한 번에 하나만) */
  const press = useRef<{
    id: number;
    from: Side;
    pointerId: number;
    x0: number;
    y0: number;
    el: HTMLElement;
    dragging: boolean;
  } | null>(null);
  /** 상태가 바뀐 뒤 새 자리를 재서 날려 보낼 먹이 */
  const pendingFly = useRef<{ id: number; to: Side; from: Point; arc: number; n: number }[]>([]);

  const friendZoneRef = useRef<HTMLDivElement>(null);
  const trayRef = useRef<HTMLDivElement>(null);
  const animalRef = useRef<HTMLSpanElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);

  const { animal, want, have } = round;
  const food = animal.food;
  // 날아가는 중인 먹이는 어느 쪽에도 세지 않는다: 떠나면 내 숫자가 줄고, 도착해야 친구 숫자가 오른다
  const friendCount = given.filter((id) => !landing.includes(id)).length;
  const mine = have - given.length - landing.filter((id) => !given.includes(id)).length;
  const locked = guard.locked;

  // 친구 표정: 안내할 땐 말하고, 기다릴 땐 입 벌리고, 먹이를 들고 오면 반가워하고, 다 먹으면 폴짝
  const baseMood: Mood =
    phase === "done"
      ? eaten >= want
        ? "cheer"
        : "eating"
      : locked
        ? "talk"
        : drag?.from === "mine"
          ? "happy"
          : "hungry";
  const [animalMood, flashAnimal] = useMood(baseMood);

  /* ---------- 가만히 있을 때 다시 알려 주기 ---------- */

  const clearIdle = () => {
    if (idleTimer.current) window.clearTimeout(idleTimer.current);
    idleTimer.current = null;
  };

  const giveIdleHint = () => {
    idleTimer.current = null;
    if (phaseRef.current !== "play") return;
    if (guard.lockedRef.current || press.current) {
      scheduleIdle();
      return;
    }
    hints.current += 1;
    miss();
    const r = roundRef.current;
    // 아직 하나도 안 줬으면 달라는 말을 다시, 뭔가 줬으면 "다 줬으면 초록 버튼을 눌러 줘"
    const line = givenRef.current.length === 0 ? P.feedAsk(r.animal.food, r.want) : P.pressGreen;
    if (givenRef.current.length > 0) setNudge(true);
    guard.lock(speakDuration(line));
    speak(line, { pitch: 1.3 });
    scheduleIdle();
  };

  const scheduleIdle = (extra = 0) => {
    clearIdle();
    if (hints.current >= MAX_HINTS) return;
    idleTimer.current = window.setTimeout(giveIdleHint, IDLE_HINT_MS + extra);
  };

  /* ---------- 라운드 ---------- */

  useEffect(() => {
    const ask = P.feedAsk(food, want);
    const intro: string[] = [];
    if (round.id === 0) intro.push(P.shareIntro);
    if (round.guest) intro.push(P.guestHello(animal.name));
    intro.push(ask);
    prefetchSpeech([...intro, P.feedThanks(food, want)]);
    const ms = 400 + speakDuration(intro);
    guard.lock(ms);
    after(400, () => speak(intro, { interrupt: false, pitch: 1.3 }));
    scheduleIdle(ms);
    return clearIdle;
  }, [round.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const nextRound = () => {
    clearAll();
    clearIdle();
    givenRef.current = [];
    missed.current = false;
    hints.current = 0;
    press.current = null;
    pendingFly.current = [];
    guard.resetRound();
    setGiven([]);
    setLanding([]);
    setSnapping([]);
    setDrag(null);
    setOverTarget(false);
    setFeedback(null);
    setNudge(false);
    setEaten(0);
    setBanner(false);
    setPhase("play");
    setRound((r) => newRound(r.id + 1));
  };

  /* ---------- 옮기기 ---------- */

  const land = (id: number) => setLanding((l) => l.filter((x) => x !== id));

  /** 먹이 하나를 반대쪽으로 옮긴다. 새 자리를 잰 뒤 from 에서 그 자리로 날아간다 */
  const move = (id: number, fromSide: Side, from: Point, arc: number) => {
    const cur = givenRef.current;
    let next: number[];
    if (fromSide === "mine") {
      if (cur.includes(id)) return;
      next = [...cur, id];
    } else {
      if (!cur.includes(id)) return;
      next = cur.filter((x) => x !== id);
    }
    givenRef.current = next;
    setGiven(next);
    setLanding((l) => [...l.filter((x) => x !== id), id]);
    const n = next.length;
    pendingFly.current.push({ id, to: fromSide === "mine" ? "friend" : "mine", from, arc, n });
    setFeedback(null);
    setNudge(false);
    fx.haptic(12);
    if (fromSide === "mine") {
      playPop(n); // 친구가 받은 개수는 먹이가 도착할 때 세어 준다
    } else {
      playTap();
      // 돌려받으면 친구가 가진 개수를 다시 세어 준다
      if (n > 0) speak(P.count(n), { rate: 0.85, pitch: 1.2 });
    }
    scheduleIdle();
  };

  // 옮긴 먹이의 새 자리가 그려진 뒤, 그 자리로 날려 보낸다 (도착하면 나타난다)
  useLayoutEffect(() => {
    const flights = pendingFly.current;
    if (flights.length === 0) return;
    pendingFly.current = [];
    const rid = roundRef.current.id;
    const emoji = roundRef.current.animal.food.emoji;
    for (const f of flights) {
      const el = document.querySelector<HTMLElement>(slotSel(rid, f.to, f.id));
      const to = centerOf(el);
      if (!el || !to) {
        land(f.id);
        continue;
      }
      let done = false;
      const arrive = () => {
        if (done) return;
        done = true;
        land(f.id);
        if (f.to === "friend" && roundRef.current.id === rid) {
          fx.burst(to.x, to.y, "sparkle", { count: 4 });
          speak(P.count(f.n), { rate: 0.85, pitch: 1.2 });
        }
      };
      fx.fly({
        from: f.from,
        to,
        emoji,
        size: el.getBoundingClientRect().width * FLY_SIZE,
        arc: f.arc,
        duration: FLY_S,
        essential: true,
        onArrive: arrive,
      });
      // 화면이 가려져 애니메이션이 멈춰도 먹이가 사라진 채로 남지 않게
      after(FLY_S * 1000 + 500, arrive);
    }
  }, [given]); // eslint-disable-line react-hooks/exhaustive-deps

  /** 톡 누르기: 반대쪽으로 날아간다 */
  const tapMove = (id: number, fromSide: Side, el: HTMLElement) => {
    if (!guard.accept()) return;
    const c = centerOf(el);
    if (c) move(id, fromSide, c, 70);
  };

  /** 끌던 먹이를 놓은 곳이 반대쪽인지 (위아래로 넉넉하게 본다) */
  const isOverTarget = (fromSide: Side, x: number, y: number): boolean => {
    if (fromSide === "mine") {
      const zone = friendZoneRef.current?.getBoundingClientRect();
      const tray = trayRef.current?.getBoundingClientRect();
      if (tray && y < tray.top - DROP_SLACK_PX) return true;
      return (
        !!zone &&
        x >= zone.left - DROP_SLACK_PX &&
        x <= zone.right + DROP_SLACK_PX &&
        y >= zone.top - DROP_SLACK_PX &&
        y <= zone.bottom + DROP_SLACK_PX
      );
    }
    const zone = friendZoneRef.current?.getBoundingClientRect();
    return !!zone && y > zone.bottom + DROP_SLACK_PX;
  };

  const onItemDown = (id: number, fromSide: Side, e: PointerEvent<HTMLButtonElement>) => {
    if (phaseRef.current !== "play") return;
    if (press.current) return; // 다른 손가락이 이미 끌고 있다
    if (guard.lockedRef.current) return; // 안내를 듣는 중
    press.current = {
      id,
      from: fromSide,
      pointerId: e.pointerId,
      x0: e.clientX,
      y0: e.clientY,
      el: e.currentTarget,
      dragging: false,
    };
    clearIdle();
  };

  const onPointerMove = (e: globalThis.PointerEvent) => {
    const p = press.current;
    if (!p || e.pointerId !== p.pointerId) return;
    if (!p.dragging) {
      if (Math.hypot(e.clientX - p.x0, e.clientY - p.y0) < DRAG_START_PX) return;
      p.dragging = true;
      const size = p.el.getBoundingClientRect().width * 1.15;
      setDrag({ id: p.id, from: p.from, x: e.clientX, y: e.clientY, size });
      playTap();
    }
    const g = ghostRef.current;
    if (g) {
      const s = g.offsetWidth;
      g.style.transform = `translate(${e.clientX - s / 2}px, ${e.clientY - s / 2}px)`;
    }
    const over = isOverTarget(p.from, e.clientX, e.clientY);
    setOverTarget((o) => (o === over ? o : over));
  };

  const onPointerUp = (e: globalThis.PointerEvent, cancel: boolean) => {
    const p = press.current;
    if (!p || e.pointerId !== p.pointerId) return;
    press.current = null;
    if (!p.dragging) {
      if (!cancel && phaseRef.current === "play") tapMove(p.id, p.from, p.el);
      scheduleIdle();
      return;
    }
    setDrag(null);
    setOverTarget(false);
    const at = { x: e.clientX, y: e.clientY };
    if (!cancel && phaseRef.current === "play" && isOverTarget(p.from, at.x, at.y)) {
      move(p.id, p.from, at, 24);
      return;
    }
    // 반대쪽이 아니면 제자리로 돌아간다
    const slot = document.querySelector<HTMLElement>(slotSel(roundRef.current.id, p.from, p.id));
    const home = centerOf(slot);
    if (slot && home) {
      setSnapping((l) => [...l.filter((x) => x !== p.id), p.id]);
      let done = false;
      const back = () => {
        if (done) return;
        done = true;
        setSnapping((l) => l.filter((x) => x !== p.id));
      };
      fx.fly({
        from: at,
        to: home,
        emoji: roundRef.current.animal.food.emoji,
        size: slot.getBoundingClientRect().width * FLY_SIZE,
        arc: 10,
        duration: 0.3,
        essential: true,
        onArrive: back,
      });
      after(800, back);
    }
    scheduleIdle();
  };

  // 끄는 손가락은 먹이 밖으로 나가도 따라가도록 창 전체에서 듣는다 (최신 함수는 ref 로)
  const handlers = useRef({ onPointerMove, onPointerUp });
  handlers.current = { onPointerMove, onPointerUp };
  useEffect(() => {
    const move = (e: globalThis.PointerEvent) => handlers.current.onPointerMove(e);
    const up = (e: globalThis.PointerEvent) => handlers.current.onPointerUp(e, false);
    const cancel = (e: globalThis.PointerEvent) => handlers.current.onPointerUp(e, true);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", cancel);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cancel);
    };
  }, []);

  /* ---------- 다 줬어요 ---------- */

  /** 딱 맞게 줬다: 친구가 하나씩 냠냠 먹고 고맙다고 한다 */
  const finish = () => {
    setPhase("done");
    clearIdle();
    playDing();
    const r = roundRef.current;
    const box = animalRef.current?.getBoundingClientRect();
    const mouth = box ? { x: box.left + box.width / 2, y: box.top + box.height * 0.55 } : null;
    const step = Math.min(110, 1000 / r.want);
    givenRef.current.forEach((id, k) => {
      after(250 + k * step, () => {
        const from = centerOf(document.querySelector(slotSel(r.id, "friend", id)));
        setEaten(k + 1);
        if (!from || !mouth || !box) return;
        fx.fly({
          from,
          to: mouth,
          emoji: r.animal.food.emoji,
          size: box.width * 0.3,
          arc: 50,
          duration: 0.4,
          essential: true,
          onArrive: () => {
            if (k % 2 === 0 || r.want <= 5) playChomp();
            flashAnimal("eating", 500);
          },
        });
      });
    });
    const eatMs = 250 + r.want * step + 450;
    after(eatMs, () => {
      fx.burstAt(animalRef.current, "hearts", { count: 9 });
      fx.haptic([10, 40, 10]);
      setPraise(randomPraise());
      setBanner(true);
      speak(P.feedThanks(r.animal.food, r.want), { interrupt: false, pitch: 1.3 });
      onWin();
      if (!missed.current) onResult(true);
    });
    after(eatMs + 3600, nextRound);
  };

  const handleConfirm = () => {
    if (phaseRef.current !== "play") return;
    if (guard.lockedRef.current || press.current) return;
    const now = performance.now();
    if (now - lastConfirm.current < CONFIRM_GAP_MS) return;
    lastConfirm.current = now;
    setNudge(false);
    const n = givenRef.current.length;
    if (n === want) {
      finish();
      return;
    }
    // 많으면 "너무 많아요! 두 개 빼 주세요!", 적으면 "너무 적어요! 한 개 더 주세요!"
    const more = n > want;
    const diff = Math.abs(n - want);
    const line = more ? P.shareTooMany(diff, food.counter) : P.shareTooFew(diff, food.counter);
    setFeedback({ more, diff });
    setShakeKey((k) => k + 1);
    playSoft();
    fx.haptic(30);
    flashAnimal(more ? "full" : "hungry", 1800);
    guard.lock(speakDuration(line));
    speak(line, { pitch: 1.3 });
    miss();
    scheduleIdle();
  };

  /* ---------- 그리기 ---------- */

  const size = sizesFor(have);
  const dragFromMine = drag?.from === "mine";
  const dragFromFriend = drag?.from === "friend";

  /**
   * 먹이 하나. 끌고 있는 동안에는 손가락을 따라다니는 그림이 따로 그려지고 제자리의 것은 투명해진다
   * (없애 버리면 터치 기기에서 끄는 도중에 손가락 움직임이 끊길 수 있다)
   */
  const itemButton = (id: number, side: Side, dim: boolean) => {
    const lifted = drag !== null && drag.id === id && drag.from === side;
    return (
      <motion.button
        key={`${round.id}-${id}`}
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: lifted ? 0 : dim ? 0.4 : 1 }}
        transition={lifted ? { duration: 0.05 } : { type: "spring", stiffness: 380, damping: 20 }}
        onPointerDown={(e) => onItemDown(id, side, e)}
        onContextMenu={(e) => e.preventDefault()}
        aria-label={food.name}
        className={`flex h-full w-full items-center justify-center border-white bg-white shadow-[0_5px_0_0_rgba(0,0,0,0.1)] ${size.tile} ${
          side === "mine" && phase === "play" && !locked ? "bob" : ""
        }`}
        // 끄는 동안 화면이 스크롤되지 않게 (index.css 의 button 기본값 manipulation 을 덮는다)
        style={{ touchAction: "none", animationDelay: `${(id % 7) * 0.15}s` }}
      >
        <Glyph emoji={food.emoji} className={`pointer-events-none ${size.emoji}`} />
      </motion.button>
    );
  };

  /** 준 자리·끌려 나간 자리는 점선으로 남겨 둔다 (돌려받으면 여기로 돌아온다) */
  const emptySlot = <div className={`absolute inset-0 border-dashed border-amber-300/80 ${size.tile}`} />;

  const hintText =
    phase === "done" ? (
      <span>
        냠냠! <Glyph emoji="🎉" />
      </span>
    ) : locked ? (
      <ListenChip />
    ) : given.length === 0 ? (
      `${obj(food.name)} 끌어다 주세요`
    ) : (
      "다 줬으면 아래 버튼을 눌러요"
    );

  return (
    <GameFrame scene="meadow">
      <TopBar onHome={onHome} stars={stars} title="쏙쏙 나눠 주기" emoji="🤲" />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-between gap-1 overflow-y-auto px-4 pb-3 pt-1 no-scrollbar short:pb-1.5 short:pt-0">
        {/* 친구: 달라는 말 + 받은 먹이 (여기에 끌어다 놓는다) */}
        <div
          ref={friendZoneRef}
          className="flex w-full max-w-3xl flex-col items-center gap-4 short:flex-row short:items-end short:justify-center short:gap-3"
        >
          <div className="flex items-center gap-3 short:shrink-0 short:gap-2">
            <motion.div
              key={round.id}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.35 }}
              className="relative"
            >
              {/* 안 맞게 주면 도리도리 */}
              <motion.span
                key={shakeKey}
                initial={false}
                animate={shakeKey > 0 ? { x: [0, -10, 10, -8, 8, 0] } : {}}
                transition={{ duration: 0.45 }}
                ref={animalRef}
                className="inline-block leading-none"
              >
                <Glyph
                  emoji={animal.emoji}
                  mood={animalMood}
                  fullness={phase === "done" ? Math.min(1, eaten / want) : 0}
                  className="text-[clamp(3.6rem,min(20vw,12vh),8rem)] drop-shadow-lg short:text-[3rem]"
                />
              </motion.span>
              {round.guest ? (
                <span className="absolute -left-3 -top-3 whitespace-nowrap rounded-full border-2 border-white bg-violet-400 px-2 py-0.5 text-sm text-white shadow sm:text-base">
                  <Glyph emoji="📒" /> 내 친구
                </span>
              ) : null}
            </motion.div>

            <SpeechBubble tail="left" className="flex flex-col items-center px-5 py-3 short:px-3 short:py-1">
              {feedback ? (
                <>
                  <span className="whitespace-nowrap text-2xl text-rose-500 sm:text-3xl short:text-lg">
                    {feedback.more ? "너무 많아요!" : "너무 적어요!"}
                  </span>
                  <span className="flex items-center gap-2">
                    <BigNumeral n={feedback.diff} className="text-5xl sm:text-6xl short:text-3xl" />
                    <span className="whitespace-nowrap text-2xl sm:text-3xl short:text-lg">
                      {food.counter} {feedback.more ? "빼" : "더"} 주세요!
                    </span>
                  </span>
                </>
              ) : (
                <span className="flex items-center gap-2">
                  <Glyph emoji={food.emoji} className="text-5xl sm:text-6xl short:text-3xl" />
                  <BigNumeral n={want} className="text-[clamp(3.2rem,9vh,5.5rem)] short:text-[2.4rem]" />
                  <span className="whitespace-nowrap text-2xl text-slate-600 sm:text-3xl short:text-lg">
                    {food.counter} 주세요!
                  </span>
                </span>
              )}
            </SpeechBubble>
          </div>

          <div
            data-share-zone="friend"
            className={`relative w-full max-w-xl rounded-[2rem] border-4 border-dashed px-3 pb-3 pt-8 transition-colors short:mt-5 short:max-w-none short:flex-1 short:rounded-2xl short:px-2 short:pb-1.5 short:pt-6 ${
              dragFromMine
                ? overTarget
                  ? "border-teal-500 bg-teal-100/90"
                  : "border-teal-400 bg-white/80"
                : "border-teal-300 bg-white/60"
            }`}
          >
            {/* 받은 개수 / 달라는 개수 */}
            <div className="absolute -top-6 left-3 flex items-center gap-1 rounded-2xl border-4 border-white bg-white px-3 shadow short:-top-5 short:px-2">
              <motion.span
                key={friendCount}
                initial={{ scale: 1.5 }}
                animate={{ scale: 1 }}
                className="inline-block"
              >
                <BigNumeral n={friendCount} className="text-4xl sm:text-5xl short:text-3xl" />
              </motion.span>
              <span className="text-3xl text-slate-400 sm:text-4xl short:text-2xl">/</span>
              <BigNumeral n={want} className="text-4xl sm:text-5xl short:text-3xl" />
            </div>
            <div className={size.grid}>
              {given.map((id, k) => (
                <motion.div
                  key={`${round.id}-${id}`}
                  layout
                  data-share-slot={`${round.id}-friend-${id}`}
                  className={size.box}
                >
                  {landing.includes(id) || snapping.includes(id) || (phase === "done" && k < eaten)
                    ? null
                    : itemButton(id, "friend", dragFromMine)}
                </motion.div>
              ))}
              {/* 받을 자리 (가진 개수만큼 미리 잡아 두어서 줄 때 화면이 움직이지 않게) */}
              {Array.from({ length: have - given.length }).map((_, i) => (
                <div key={`space-${i}`} className={size.box} />
              ))}
            </div>
          </div>
        </div>

        {/* 안내 */}
        <div className="flex h-11 shrink-0 items-center text-xl text-slate-500 sm:text-2xl short:h-8 short:text-base">
          {hintText}
        </div>

        {/* 내 먹이: 남은 개수만 보여 준다 */}
        <div
          ref={trayRef}
          data-share-zone="mine"
          className={`relative w-full max-w-xl rounded-[2rem] border-4 px-3 pb-3 pt-8 shadow-xl transition-colors short:max-w-3xl short:rounded-2xl short:px-2 short:pb-1.5 short:pt-6 ${
            dragFromFriend
              ? overTarget
                ? "border-amber-400 bg-amber-200/95"
                : "border-amber-300 bg-amber-100/95"
              : "border-white bg-amber-100/90"
          }`}
        >
          <div className="absolute -top-6 left-3 flex items-center rounded-2xl border-4 border-white bg-white px-3 shadow short:-top-5 short:px-2">
            <motion.span key={mine} initial={{ scale: 1.5 }} animate={{ scale: 1 }} className="inline-block">
              <BigNumeral n={mine} className="text-4xl sm:text-5xl short:text-3xl" />
            </motion.span>
          </div>
          <div className={size.grid}>
            {Array.from({ length: have }).map((_, id) => {
              const here = !given.includes(id) && !landing.includes(id) && !snapping.includes(id);
              const lifted = dragFromMine && drag.id === id;
              return (
                <div
                  key={`${round.id}-${id}`}
                  data-share-slot={`${round.id}-mine-${id}`}
                  className={`relative ${size.box}`}
                >
                  {!here || lifted ? emptySlot : null}
                  {here ? itemButton(id, "mine", dragFromFriend) : null}
                </div>
              );
            })}
          </div>
        </div>

        <motion.button
          animate={nudge && phase === "play" ? { scale: [1, 1.08, 1] } : { scale: 1 }}
          transition={nudge ? { duration: 1, repeat: Infinity } : { duration: 0.2 }}
          whileTap={{ scale: 0.93 }}
          onPointerDown={handleConfirm}
          disabled={phase !== "play"}
          className={`pressable mt-2 shrink-0 rounded-full border-4 border-white bg-green-500 px-8 py-2.5 text-2xl text-white shadow-[0_6px_0_0_rgba(0,0,0,0.15)] transition-opacity sm:text-3xl short:mt-1 short:px-5 short:py-1 short:text-lg ${
            phase !== "play" ? "invisible" : locked ? "opacity-60" : ""
          }`}
        >
          <Glyph emoji="✔" className="text-[0.9em]" /> 다 줬어요!
        </motion.button>
      </div>

      {/* 끌고 있는 먹이 (손가락을 따라다닌다) */}
      {drag
        ? createPortal(
            <div
              ref={ghostRef}
              className="pointer-events-none fixed left-0 top-0 z-[60] flex items-center justify-center"
              style={{
                width: drag.size,
                height: drag.size,
                fontSize: drag.size * 0.75,
                transform: `translate(${drag.x - drag.size / 2}px, ${drag.y - drag.size / 2}px)`,
              }}
            >
              <motion.span
                animate={{ scale: overTarget ? 1.2 : 1.05, rotate: overTarget ? [0, -8, 8, 0] : 0 }}
                transition={{ duration: 0.3 }}
                className="inline-block drop-shadow-xl"
              >
                <Glyph emoji={food.emoji} />
              </motion.span>
            </div>,
            document.body,
          )
        : null}

      <AnimatePresence>
        {banner ? (
          <WinBanner
            emoji={food.emoji}
            n={want}
            label={`${food.name} ${counterPhrase(want, food.counter)}`}
            praise={praise}
          />
        ) : null}
      </AnimatePresence>
    </GameFrame>
  );
}
