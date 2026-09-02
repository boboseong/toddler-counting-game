/* 효과음 + 한국어 음성 안내 */

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

/* ---------------- 음성 ---------------- */

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
  rate?: number;
  pitch?: number;
}

let pendingSpeak: number | null = null;

function doSpeak(text: string, rate: number, pitch: number) {
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ko-KR";
    u.rate = rate;
    u.pitch = pitch;
    u.volume = 1;
    const v = pickKoreanVoice();
    if (v) u.voice = v;
    window.speechSynthesis.speak(u);
  } catch {
    /* ignore */
  }
}

/**
 * 한국어로 말하기.
 * Chrome 은 cancel() 직후 speak() 를 종종 무시하므로, 끊고 말할 때는 잠깐 뒤에 speak 한다.
 * 그 사이에 들어온 이어 말하기(interrupt:false)는 순서를 지키기 위해 같이 늦춘다.
 */
export function speak(text: string, opts: SpeakOptions = {}) {
  if (!voiceOn) return;
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const { interrupt = true, rate = 0.9, pitch = 1.15 } = opts;
  try {
    if (interrupt) {
      if (pendingSpeak !== null) window.clearTimeout(pendingSpeak);
      window.speechSynthesis.cancel();
      pendingSpeak = window.setTimeout(() => {
        pendingSpeak = null;
        doSpeak(text, rate, pitch);
      }, 60);
    } else if (pendingSpeak !== null) {
      window.setTimeout(() => doSpeak(text, rate, pitch), 80);
    } else {
      doSpeak(text, rate, pitch);
    }
  } catch {
    /* ignore */
  }
}

export function stopSpeaking() {
  try {
    if (pendingSpeak !== null) {
      window.clearTimeout(pendingSpeak);
      pendingSpeak = null;
    }
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  } catch {
    /* ignore */
  }
}
