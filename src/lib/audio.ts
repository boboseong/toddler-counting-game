/* 효과음 + 한국어 음성 안내 */

import { cleanForSpeech } from "./phrases";

let ctx: AudioContext | null = null;
let soundOn = true;
let voiceOn = true;

export function setSoundOn(v: boolean) {
  soundOn = v;
}
export function setVoiceOn(v: boolean) {
  voiceOn = v;
  if (!v) stopSpeaking();
}

function getCtx(): AudioContext | null {
  try {
    if (!ctx) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

let speechUnlocked = false;

/** 첫 터치 시 오디오 컨텍스트/음성 합성을 깨우기 위해 호출 (사용자 제스처 안에서) */
export function unlockAudio() {
  getCtx();
  if (speechUnlocked) return;
  try {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
      // iOS/Safari: 제스처 안에서 한 번 speak 해야 이후 비동기 speak 가 허용됨
      const u = new SpeechSynthesisUtterance(" ");
      u.volume = 0;
      u.lang = "ko-KR";
      window.speechSynthesis.speak(u);
      speechUnlocked = true;
    }
  } catch {
    /* ignore */
  }
}

function tone(
  freq: number,
  start: number,
  dur: number,
  type: OscillatorType = "sine",
  gain = 0.25,
  slideTo?: number,
) {
  if (!soundOn) return;
  const c = getCtx();
  if (!c) return;
  try {
    const o = c.createOscillator();
    const g = c.createGain();
    const t0 = c.currentTime + start;
    o.type = type;
    o.frequency.setValueAtTime(freq, t0);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(gain, t0 + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g);
    g.connect(c.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.05);
  } catch {
    /* ignore */
  }
}

/** 톡! (셀 때마다 조금씩 높아지는 소리) */
export function playPop(index = 1) {
  const base = 520 * Math.pow(1.12, Math.max(0, index - 1));
  tone(base, 0, 0.18, "sine", 0.3, base * 1.6);
}

/** 이미 센 것을 또 눌렀을 때 — 부드러운 톡 */
export function playTap() {
  tone(700, 0, 0.08, "triangle", 0.12, 900);
}

/** 정답 딩동 */
export function playDing() {
  tone(880, 0, 0.3, "sine", 0.25);
  tone(1320, 0.12, 0.45, "sine", 0.2);
}

/** 큰 축하 팡파레 */
export function playFanfare() {
  const notes = [523, 659, 784, 1047];
  notes.forEach((n, i) => tone(n, i * 0.11, 0.32, "triangle", 0.2));
  tone(1047, 0.5, 0.7, "sine", 0.18);
  tone(1319, 0.62, 0.7, "sine", 0.14);
}

/** 오답 — 무섭지 않은 부드러운 소리 */
export function playSoft() {
  tone(330, 0, 0.22, "sine", 0.14, 280);
}

/** 냠! */
export function playChomp() {
  tone(220, 0, 0.09, "square", 0.08, 130);
  tone(180, 0.1, 0.08, "square", 0.06, 110);
}

/** 슝~ */
export function playWhoosh() {
  tone(380, 0, 0.28, "sine", 0.1, 1400);
}

/** 거품 팡 */
export function playBubble(index = 1) {
  const base = 600 * Math.pow(1.09, Math.max(0, index - 1));
  tone(base, 0, 0.12, "sine", 0.28, base * 2.2);
  tone(base * 0.5, 0.02, 0.1, "triangle", 0.08);
}

/** 빈 곳을 톡 — 작은 반짝 소리 (5음계에서 아무 음이나) */
const TWINKLE = [1047, 1175, 1319, 1568, 1760];
export function playTwinkle() {
  const f = TWINKLE[Math.floor(Math.random() * TWINKLE.length)];
  tone(f, 0, 0.16, "sine", 0.07, f * 1.05);
}

/** 전화기 버튼 소리 (진짜 전화기처럼 두 음을 겹친 DTMF) */
const DTMF: Record<string, [number, number]> = {
  "1": [697, 1209], "2": [697, 1336], "3": [697, 1477],
  "4": [770, 1209], "5": [770, 1336], "6": [770, 1477],
  "7": [852, 1209], "8": [852, 1336], "9": [852, 1477],
  "*": [941, 1209], "0": [941, 1336], "#": [941, 1477],
};
export function playDial(key: string) {
  const f = DTMF[key];
  if (!f) return;
  tone(f[0], 0, 0.16, "sine", 0.11);
  tone(f[1], 0, 0.16, "sine", 0.09);
}

/** 지우기 — 뿅 */
export function playErase() {
  tone(620, 0, 0.13, "sine", 0.16, 330);
}

/** 따르릉 따르릉 (1.5초쯤) */
export function playRing() {
  for (let burst = 0; burst < 2; burst++) {
    for (let i = 0; i < 12; i++) {
      tone(i % 2 ? 1400 : 1150, burst * 0.85 + i * 0.05, 0.055, "triangle", 0.09);
    }
  }
}

/** 빵빵! (버스 경적: 두 음을 겹쳐서 두 번) */
export function playHorn() {
  [0, 0.22].forEach((t) => {
    tone(392, t, 0.15, "square", 0.05);
    tone(494, t, 0.15, "square", 0.04);
  });
}

/** 뿌우~ (기차 기적) */
export function playWhistle() {
  tone(587, 0, 0.55, "triangle", 0.13, 560);
  tone(740, 0, 0.55, "triangle", 0.1, 700);
}

/** 더 큰 숫자 도전! — 올라가는 소리 */
export function playLevelUp() {
  [523, 659, 784, 1047, 1319].forEach((n, i) => tone(n, i * 0.08, 0.22, "triangle", 0.16));
}

/** 보너스 별 — 반짝반짝 */
export function playBonus() {
  [1568, 1319, 1760, 1568, 2093].forEach((n, i) => tone(n, 0.9 + i * 0.07, 0.25, "sine", 0.12));
}

/* ---------------- 음성 ----------------
 * 1순위: Gemini TTS 로 미리 만든 음성 파일 (public/voice, 목록은 voice-manifest.json)
 * 2순위: 파일이 없거나 늦게 오면 브라우저 TTS (기기마다 목소리가 다르다)
 */

/** 문장 → [파일 이름, 길이(ms)] */
type Manifest = Record<string, [string, number]>;

let manifest: Manifest = {};
if (typeof window !== "undefined") {
  // 목록이 커서 첫 화면 번들과 따로 받는다. 받기 전에 말하면 브라우저 TTS 로
  void import("./voice-manifest.json")
    .then((m) => {
      manifest = m.default as unknown as Manifest;
    })
    .catch(() => {
      /* ignore */
    });
}

const VOICE_BASE = `${import.meta.env.BASE_URL}voice/`;
/** 음성 파일을 이만큼까지 기다리고, 넘으면 브라우저 TTS 로 */
const LOAD_WAIT_MS = 700;
/** 디코딩해 둔 음성 개수 (오래된 것부터 버린다) */
const BUFFER_CACHE = 120;

const buffers = new Map<string, Promise<AudioBuffer | null>>();

function decode(c: AudioContext, data: ArrayBuffer): Promise<AudioBuffer | null> {
  return new Promise((resolve) => {
    try {
      // 옛 Safari 는 콜백 방식만 된다
      const p = c.decodeAudioData(data, resolve, () => resolve(null));
      if (p && typeof p.then === "function") p.then(resolve, () => resolve(null));
    } catch {
      resolve(null);
    }
  });
}

function loadClip(file: string): Promise<AudioBuffer | null> {
  const hit = buffers.get(file);
  if (hit) {
    // 최근에 쓴 것으로 옮긴다
    buffers.delete(file);
    buffers.set(file, hit);
    return hit;
  }
  const c = getCtx();
  if (!c) return Promise.resolve(null);
  const p = fetch(VOICE_BASE + file)
    .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(String(r.status)))))
    .then((data) => decode(c, data))
    .catch(() => null);
  p.then((b) => {
    if (!b) buffers.delete(file); // 실패하면 다음에 다시 받아 본다
  });
  buffers.set(file, p);
  while (buffers.size > BUFFER_CACHE) {
    const oldest = buffers.keys().next().value;
    if (oldest === undefined) break;
    buffers.delete(oldest);
  }
  return p;
}

function clipOf(text: string): [string, number] | undefined {
  const key = cleanForSpeech(text);
  const clip = manifest[key];
  if (!clip && import.meta.env.DEV && Object.keys(manifest).length > 0) {
    console.warn(`[voice] 음성 파일 없음 (npm run voice:gen): ${key}`);
  }
  return clip;
}

/** 곧 말할 문장들의 음성 파일을 미리 받아 둔다 */
export function prefetchSpeech(texts: string | string[]) {
  if (!voiceOn) return;
  for (const t of Array.isArray(texts) ? texts : [texts]) {
    const clip = manifest[cleanForSpeech(t)];
    if (clip) void loadClip(clip[0]);
  }
}

/* ----- 브라우저 TTS (파일이 없을 때) ----- */

let voices: SpeechSynthesisVoice[] = [];

function loadVoices() {
  try {
    voices = window.speechSynthesis.getVoices();
  } catch {
    voices = [];
  }
}

if (typeof window !== "undefined" && "speechSynthesis" in window) {
  loadVoices();
  try {
    window.speechSynthesis.onvoiceschanged = loadVoices;
  } catch {
    /* ignore */
  }
}

function pickKoreanVoice(): SpeechSynthesisVoice | null {
  if (voices.length === 0) loadVoices();
  const ko = voices.filter((v) =>
    v.lang.replace("_", "-").toLowerCase().startsWith("ko"),
  );
  if (ko.length === 0) return null;
  return (
    ko.find((v) => /google/i.test(v.name)) ||
    ko.find((v) => /yuna|유나|sora|소라/i.test(v.name)) ||
    ko.find((v) => /female|여성/i.test(v.name)) ||
    ko[0]
  );
}

export interface SpeakOptions {
  interrupt?: boolean;
  /** 브라우저 TTS 일 때만 쓰인다 (음성 파일은 말투가 이미 정해져 있다) */
  rate?: number;
  pitch?: number;
}

/** 이 문장을 말하는 데 걸리는 대략의 시간(ms) (음성 파일이 없을 때) */
function estimateMs(text: string): number {
  const syllables = (cleanForSpeech(text).match(/[\uac00-\ud7a3]/g) ?? []).length;
  return Math.min(4000, Math.max(1500, 300 + syllables * 190));
}

/** 이 문장(들)을 말하는 데 걸리는 시간(ms). 안내 잠금 길이에 쓴다 */
export function speakDuration(text: string | string[]): number {
  if (!voiceOn) return 1200;
  const parts = Array.isArray(text) ? text : [text];
  const total = parts.reduce((sum, t) => {
    const clip = manifest[cleanForSpeech(t)];
    return sum + (clip ? clip[1] + 120 : estimateMs(t));
  }, 0);
  return Math.min(9000, Math.max(900, total));
}

/**
 * 음성 파일 한 개의 길이(ms). 파일이 없으면(브라우저 TTS 로 말하면) null, 음성을 껐으면 0.
 * 말에 맞춰 화면을 한 칸씩 움직일 때 쓴다 (엘리베이터가 층을 셀 때)
 */
export function clipMs(text: string): number | null {
  if (!voiceOn) return 0;
  const clip = manifest[cleanForSpeech(text)];
  return clip ? clip[1] : null;
}

/* ----- 차례로 말하기 ----- */

interface QueueItem {
  text: string;
  rate: number;
  pitch: number;
}

let queue: QueueItem[] = [];
/** 지금 돌고 있는 말하기의 번호 (-1: 없음) */
let pumpGen = -1;
/** 끊을 때마다 올라간다. 진행 중이던 말하기는 자기 번호가 아니면 멈춘다 */
let generation = 0;
let currentSource: AudioBufferSourceNode | null = null;
/** 지금 기다리는 중인 말하기를 바로 끝낸다 */
let abortCurrent: (() => void) | null = null;
let lastCancel = 0;

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function playBuffer(buf: AudioBuffer): Promise<void> {
  const c = getCtx();
  if (!c) return Promise.resolve();
  return new Promise((resolve) => {
    try {
      const src = c.createBufferSource();
      src.buffer = buf;
      src.connect(c.destination);
      currentSource = src;
      const done = () => {
        if (currentSource === src) currentSource = null;
        abortCurrent = null;
        resolve();
      };
      src.onended = done;
      abortCurrent = () => {
        try {
          src.stop();
        } catch {
          /* ignore */
        }
        done();
      };
      src.start();
    } catch {
      resolve();
    }
  });
}

async function speakTTS(item: QueueItem, gen: number): Promise<void> {
  if (!("speechSynthesis" in window)) return;
  // Chrome 은 cancel() 직후 speak() 를 종종 무시한다
  const since = performance.now() - lastCancel;
  if (since < 80) await wait(80 - since);
  if (gen !== generation) return; // 기다리는 사이에 끊겼으면 옛 말은 하지 않는다
  return new Promise((resolve) => {
    let settled = false;
    const done = () => {
      if (settled) return;
      settled = true;
      abortCurrent = null;
      window.clearTimeout(guard);
      resolve();
    };
    // onend 가 안 오는 브라우저가 있어서 예상 시간이 지나면 넘어간다
    const guard = window.setTimeout(done, estimateMs(item.text) + 1500);
    abortCurrent = done;
    try {
      const u = new SpeechSynthesisUtterance(cleanForSpeech(item.text));
      u.lang = "ko-KR";
      u.rate = item.rate;
      u.pitch = item.pitch;
      u.volume = 1;
      const v = pickKoreanVoice();
      if (v) u.voice = v;
      u.onend = done;
      u.onerror = done;
      window.speechSynthesis.speak(u);
    } catch {
      done();
    }
  });
}

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T | null> {
  return new Promise((resolve) => {
    const t = window.setTimeout(() => resolve(null), ms);
    p.then(
      (v) => {
        window.clearTimeout(t);
        resolve(v);
      },
      () => {
        window.clearTimeout(t);
        resolve(null);
      },
    );
  });
}

async function sayOne(item: QueueItem, gen: number) {
  const clip = clipOf(item.text);
  if (clip) {
    const buf = await withTimeout(loadClip(clip[0]), LOAD_WAIT_MS);
    if (gen !== generation) return;
    if (buf) return playBuffer(buf);
  }
  return speakTTS(item, gen);
}

async function pump() {
  // 끊긴 옛 말하기가 음성 파일을 기다리는 중이어도 새 말은 바로 시작한다 (옛 것은 알아서 멈춘다)
  const gen = generation;
  if (pumpGen === gen) return;
  pumpGen = gen;
  while (queue.length > 0 && gen === generation) {
    const item = queue.shift()!;
    await sayOne(item, gen);
  }
  if (pumpGen === gen) pumpGen = -1;
}

/** 지금 말하고 있거나 말할 차례가 남아 있으면 true */
export function isSpeaking(): boolean {
  return pumpGen !== -1 || queue.length > 0;
}

/**
 * 말이 끝날 때까지 기다렸다가 fn 을 부른다 (적어도 minMs, 길어도 minMs + maxWaitMs 뒤).
 * 화면을 바꾸는 일(스티커 공개·놀이 전환·안내 잠금 풀기)을 실제 소리에 맞추는 데 쓴다.
 * 타이머 id 는 track 으로 넘겨 주므로 부르는 쪽에서 취소할 수 있다.
 */
export function afterSpeech(
  minMs: number,
  maxWaitMs: number,
  fn: () => void,
  track: (id: number) => void,
) {
  const deadline = performance.now() + minMs + maxWaitMs;
  const tick = (ms: number) =>
    track(
      window.setTimeout(() => {
        if (isSpeaking() && performance.now() < deadline) tick(100);
        else fn();
      }, ms),
    );
  tick(minMs);
}

/**
 * 한국어로 말하기. 여러 문장을 주면 차례로 이어서 말한다.
 * interrupt(기본): 지금 하던 말을 끊고 바로 / interrupt:false: 하던 말 뒤에 이어서
 */
export function speak(text: string | string[], opts: SpeakOptions = {}) {
  if (!voiceOn) return;
  if (typeof window === "undefined") return;
  const { interrupt = true, rate = 0.9, pitch = 1.15 } = opts;
  if (interrupt) stopSpeaking();
  for (const t of Array.isArray(text) ? text : [text]) {
    if (cleanForSpeech(t)) queue.push({ text: t, rate, pitch });
  }
  void pump();
}

export function stopSpeaking() {
  generation += 1;
  queue = [];
  const abort = abortCurrent;
  abortCurrent = null;
  abort?.();
  if (currentSource) {
    try {
      currentSource.stop();
    } catch {
      /* ignore */
    }
    currentSource = null;
  }
  try {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      lastCancel = performance.now();
    }
  } catch {
    /* ignore */
  }
}
