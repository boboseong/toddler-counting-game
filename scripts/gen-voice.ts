/*
 * Gemini TTS 로 앱의 모든 문장 음성을 만든다.
 *
 *   GEMINI_API_KEY=... npm run voice:gen
 *   OPENROUTER_API_KEY=... npm run voice:gen   (OpenRouter 를 거쳐 같은 Gemini TTS 를 쓴다)
 *
 * - 문장 목록: src/lib/phrases.ts 의 allPhrases()
 * - 결과: public/voice/*.mp3 + src/lib/voice-manifest.json ({ 문장: [파일, 길이ms] })
 * - 이미 만든 문장은 건너뛴다 (중간에 멈춰도 다시 실행하면 이어서 만든다)
 * - 문장·목소리·말투 지시가 바뀌면 파일 이름(해시)이 바뀌어 그 문장만 다시 만든다
 *
 * 환경 변수
 *   OPENROUTER_API_KEY    있으면 OpenRouter 로 만든다 (Gemini 무료 등급 하루 한도를 피할 때)
 *   OPENROUTER_TTS_MODEL  OpenRouter 모델 ID (기본 google/gemini-3.8-flash-tts)
 *   GEMINI_API_KEY        OpenRouter 키가 없을 때 Gemini API 를 직접 쓴다
 *                         키는 환경 변수에서만 읽고 어디에도 저장하지 않는다
 *   GEMINI_TTS_MODEL      모델 ID. 비우면 모델 목록에서 가장 최신 TTS 모델을 고른다
 *   GEMINI_VOICE_NARRATOR 병아리(해설) 목소리 (기본 Leda)
 *   GEMINI_VOICE_ANIMAL   동물 손님 목소리 (기본 Puck)
 *   GEMINI_CONCURRENCY    동시에 보낼 요청 수 (기본 Gemini 3, OpenRouter 6)
 *   VOICE_LIMIT           이번에 만들 최대 개수 (시험용)
 *   VOICE_ONLY            core 면 자주 나오는 문장만
 *   --prune               목록에 없는 옛 파일을 지운다
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Mp3Encoder } from "@breezystack/lamejs";
import { allPhrases, type PhraseSpec, type Role, type Style } from "../src/lib/phrases";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, "public", "voice");
const MANIFEST = path.join(ROOT, "src", "lib", "voice-manifest.json");
const API = "https://generativelanguage.googleapis.com/v1beta";

type Manifest = Record<string, [string, number]>;

/* ---------- 목소리 연기 지시 ---------- */

const VOICES: Record<Role, string> = {
  narrator: process.env.GEMINI_VOICE_NARRATOR || "Leda",
  animal: process.env.GEMINI_VOICE_ANIMAL || "Puck",
};

/*
 * 이 TTS 모델은 받은 글을 전부 읽어 버린다 ("Say cheerfully: …" 같은 앞말까지).
 * 그래서 연기 지시는 AUDIO PROFILE / DIRECTOR'S NOTES 형식으로 주고, 읽을 글은 TRANSCRIPT 아래에만 둔다.
 * (이 형식에서는 지시문이 읽히지 않고 길이가 지시 없이 읽을 때와 같았다)
 */
const PROFILE: Record<Role, string> = {
  narrator: "a cute baby chick who guides 2- and 3-year-old children in a Korean counting game",
  animal: "a cute, hungry little animal visiting a Korean counting game for toddlers",
};

const VOICE_NOTES: Record<Role, string> = {
  narrator: "Bright, warm, gentle and slightly high, like a kind preschool teacher talking to a toddler. Natural standard Korean.",
  animal: "Playful, bouncy and adorable, a little higher than normal. Natural standard Korean.",
};

const STYLE_NOTES: Record<Style, string> = {
  count: "One counting word, said slowly and clearly with a happy, encouraging tone, as if pointing at an object while counting together.",
  cheer: "Joyful and excited, praising and celebrating with the child.",
  ask: "A friendly, curious question or request to the child. A little slow.",
  talk: "Warm and gentle. A little slow.",
};

/** 말투 지시를 바꾸면 이 값을 올린다 (모든 문장을 다시 만든다) */
const PROMPT_VERSION = 2;

function promptFor(p: PhraseSpec): string {
  return [
    `# AUDIO PROFILE: ${PROFILE[p.role]}`,
    "## DIRECTOR'S NOTES",
    `Voice: ${VOICE_NOTES[p.role]}`,
    `Style: ${STYLE_NOTES[p.style]}`,
    "## TRANSCRIPT",
    p.text,
  ].join("\n");
}

function fileFor(p: PhraseSpec): string {
  const h = createHash("sha1")
    .update(`${PROMPT_VERSION}|${VOICES[p.role]}|${p.role}|${p.style}|${p.text}`)
    .digest("hex")
    .slice(0, 12);
  return `${p.core ? "c" : "x"}-${h}.mp3`;
}

/* ---------- Gemini API ---------- */

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;
const KEY = process.env.GEMINI_API_KEY;

async function api(url: string, init: RequestInit = {}): Promise<Response> {
  return fetch(url, {
    ...init,
    headers: { "content-type": "application/json", "x-goog-api-key": KEY ?? "", ...(init.headers ?? {}) },
  });
}

interface ModelInfo {
  name: string;
  supportedGenerationMethods?: string[];
}

/** 모델 목록에서 가장 최신 TTS 모델 (3.8 이 있으면 그것) */
async function pickModel(): Promise<string> {
  if (process.env.GEMINI_TTS_MODEL) return process.env.GEMINI_TTS_MODEL.replace(/^models\//, "");
  const models: ModelInfo[] = [];
  let pageToken = "";
  do {
    const r = await api(`${API}/models?pageSize=1000${pageToken ? `&pageToken=${pageToken}` : ""}`);
    if (!r.ok) throw new Error(`모델 목록을 못 받았어요: ${r.status} ${await r.text()}`);
    const j = (await r.json()) as { models?: ModelInfo[]; nextPageToken?: string };
    models.push(...(j.models ?? []));
    pageToken = j.nextPageToken ?? "";
  } while (pageToken);
  const tts = models
    .filter((m) => /tts/i.test(m.name) && (m.supportedGenerationMethods ?? []).includes("generateContent"))
    .map((m) => m.name.replace(/^models\//, ""));
  if (tts.length === 0) throw new Error("TTS 모델이 없어요. GEMINI_TTS_MODEL 로 직접 정해 주세요.");
  const version = (n: string) => Number(/gemini-(\d+(?:\.\d+)?)/.exec(n)?.[1] ?? 0);
  const rank = (n: string) => (/3[.-]8/.test(n) ? 1000 : 0) + version(n) * 10 + (/flash/.test(n) ? 1 : 0) - (/preview/.test(n) ? 0.5 : 0) - (/lite/.test(n) ? 2 : 0);
  tts.sort((a, b) => rank(b) - rank(a));
  console.log(`TTS 모델 후보: ${tts.join(", ")}`);
  return tts[0];
}

class Retry extends Error {
  constructor(
    msg: string,
    readonly waitMs: number,
  ) {
    super(msg);
  }
}

interface Audio {
  pcm: Int16Array;
  rate: number;
}

function parseRate(mime: string): number {
  return Number(/rate=(\d+)/.exec(mime)?.[1] ?? 24000);
}

/** WAV 로 올 때: data 청크만 꺼낸다 */
function fromWav(buf: Buffer): Audio {
  let off = 12;
  let rate = 24000;
  while (off + 8 <= buf.length) {
    const id = buf.toString("ascii", off, off + 4);
    const size = buf.readUInt32LE(off + 4);
    if (id === "fmt ") rate = buf.readUInt32LE(off + 12);
    if (id === "data") {
      const data = buf.subarray(off + 8, off + 8 + size);
      return { pcm: new Int16Array(data.buffer.slice(data.byteOffset, data.byteOffset + data.length)), rate };
    }
    off += 8 + size;
  }
  throw new Error("WAV 에 data 가 없어요");
}

async function synthesize(model: string, p: PhraseSpec): Promise<Audio> {
  const body = {
    contents: [{ role: "user", parts: [{ text: promptFor(p) }] }],
    generationConfig: {
      responseModalities: ["AUDIO"],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICES[p.role] } } },
    },
  };
  const r = await api(`${API}/models/${model}:generateContent`, { method: "POST", body: JSON.stringify(body) });
  if (r.status === 429 || r.status >= 500) {
    const t = await r.text();
    const delay = /"retryDelay":\s*"(\d+(?:\.\d+)?)s"/.exec(t)?.[1];
    throw new Retry(`${r.status}`, delay ? Number(delay) * 1000 + 500 : 0);
  }
  if (!r.ok) throw new Error(`${r.status} ${(await r.text()).slice(0, 300)}`);
  const j = (await r.json()) as {
    candidates?: { content?: { parts?: { inlineData?: { mimeType: string; data: string } }[] }; finishReason?: string }[];
  };
  const part = j.candidates?.[0]?.content?.parts?.find((x) => x.inlineData);
  if (!part?.inlineData) throw new Retry(`오디오 없음 (${j.candidates?.[0]?.finishReason ?? "?"})`, 0);
  const buf = Buffer.from(part.inlineData.data, "base64");
  if (/wav/i.test(part.inlineData.mimeType)) return fromWav(buf);
  return {
    pcm: new Int16Array(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length)),
    rate: parseRate(part.inlineData.mimeType),
  };
}

/* ---------- OpenRouter (/audio/speech: 원시 PCM 24kHz 16bit mono 를 돌려준다) ---------- */

const OPENROUTER_API = "https://openrouter.ai/api/v1";

async function synthesizeOpenRouter(model: string, p: PhraseSpec): Promise<Audio> {
  const r = await fetch(`${OPENROUTER_API}/audio/speech`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${OPENROUTER_KEY ?? ""}` },
    body: JSON.stringify({ model, input: promptFor(p), voice: VOICES[p.role], response_format: "pcm" }),
  });
  if (r.status === 429 || r.status >= 500) {
    const after = Number(r.headers.get("retry-after") ?? 0);
    throw new Retry(`${r.status} ${(await r.text()).slice(0, 200)}`, after > 0 ? after * 1000 : 0);
  }
  if (!r.ok) throw new Error(`${r.status} ${(await r.text()).slice(0, 300)}`);
  const mime = r.headers.get("content-type") ?? "";
  const buf = Buffer.from(await r.arrayBuffer());
  if (/json/i.test(mime)) throw new Retry(`오디오 없음 (${buf.toString("utf8").slice(0, 200)})`, 0);
  if (/wav/i.test(mime)) return fromWav(buf);
  if (!/pcm|l16/i.test(mime)) throw new Error(`모르는 오디오 형식: ${mime}`);
  if (buf.length < 2400) throw new Retry("오디오가 너무 짧아요", 0);
  return {
    pcm: new Int16Array(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length - (buf.length % 2))),
    rate: parseRate(mime),
  };
}

/* ---------- 후처리: 앞뒤 무음 자르기 · 음량 맞추기 · MP3 ---------- */

function trim({ pcm, rate }: Audio): Audio {
  const win = Math.round(rate * 0.01);
  const thresh = 700;
  const loud = (i: number) => {
    let peak = 0;
    for (let k = i; k < Math.min(pcm.length, i + win); k++) peak = Math.max(peak, Math.abs(pcm[k]));
    return peak > thresh;
  };
  let start = 0;
  while (start < pcm.length && !loud(start)) start += win;
  let end = pcm.length - win;
  while (end > start && !loud(end)) end -= win;
  if (end <= start) return { pcm, rate };
  // 셈말이 누르자마자 들리도록 앞은 짧게, 끝은 여운을 조금 남긴다
  start = Math.max(0, start - Math.round(rate * 0.03));
  end = Math.min(pcm.length, end + win + Math.round(rate * 0.09));
  return { pcm: pcm.slice(start, end), rate };
}

function normalize({ pcm, rate }: Audio): Audio {
  let peak = 1;
  for (const v of pcm) peak = Math.max(peak, Math.abs(v));
  const gain = Math.min(4, (0.89 * 32767) / peak);
  const fade = Math.round(rate * 0.006);
  const out = new Int16Array(pcm.length);
  for (let i = 0; i < pcm.length; i++) {
    const f = Math.min(1, i / fade, (pcm.length - 1 - i) / fade);
    out[i] = Math.max(-32768, Math.min(32767, Math.round(pcm[i] * gain * f)));
  }
  return { pcm: out, rate };
}

function toMp3({ pcm, rate }: Audio): Buffer {
  const enc = new Mp3Encoder(1, rate, rate >= 32000 ? 64 : 48);
  const chunks: Uint8Array[] = [];
  for (let i = 0; i < pcm.length; i += 1152) chunks.push(enc.encodeBuffer(pcm.subarray(i, i + 1152)));
  chunks.push(enc.flush());
  return Buffer.concat(chunks.map((c) => Buffer.from(c)));
}

/* ---------- 실행 ---------- */

function readManifest(): Manifest {
  try {
    return JSON.parse(readFileSync(MANIFEST, "utf8")) as Manifest;
  } catch {
    return {};
  }
}

function writeManifest(m: Manifest) {
  const sorted = Object.fromEntries(Object.entries(m).sort(([a], [b]) => a.localeCompare(b, "ko")));
  writeFileSync(MANIFEST, `${JSON.stringify(sorted, null, 0).replace(/\],"/g, '],\n"')}\n`);
}

/** 이 문장을 읽는 데 넉넉히 걸릴 시간 (보통 음절당 0.3초 안팎) */
function maxMs(text: string): number {
  return 1500 + 450 * (text.match(/[가-힣0-9A-Za-z]/g)?.length ?? 1);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const phrases = allPhrases();
  const manifest = readManifest();
  mkdirSync(OUT_DIR, { recursive: true });

  if (process.argv.includes("--prune")) {
    const keep = new Set(phrases.map(fileFor));
    const texts = new Set(phrases.map((p) => p.text));
    let removed = 0;
    for (const f of readdirSync(OUT_DIR)) {
      if (f.endsWith(".mp3") && !keep.has(f)) {
        unlinkSync(path.join(OUT_DIR, f));
        removed++;
      }
    }
    for (const k of Object.keys(manifest)) if (!texts.has(k) || !keep.has(manifest[k][0])) delete manifest[k];
    writeManifest(manifest);
    console.log(`옛 음성 ${removed}개를 지웠어요.`);
  }

  const todo = phrases.filter((p) => {
    if (process.env.VOICE_ONLY === "core" && !p.core) return false;
    const file = fileFor(p);
    const have = manifest[p.text];
    return !(have && have[0] === file && existsSync(path.join(OUT_DIR, file)));
  });
  const limit = Number(process.env.VOICE_LIMIT || todo.length);
  const queue = todo.slice(0, limit);
  console.log(`문장 ${phrases.length}개 중 만들 것 ${todo.length}개 (이번에 ${queue.length}개)`);
  if (queue.length === 0) return;

  if (!OPENROUTER_KEY && !KEY) {
    console.error("OPENROUTER_API_KEY 나 GEMINI_API_KEY 환경 변수가 필요해요.");
    process.exit(1);
  }
  const model = OPENROUTER_KEY ? process.env.OPENROUTER_TTS_MODEL || "google/gemini-3.8-flash-tts" : await pickModel();
  const synth = OPENROUTER_KEY ? synthesizeOpenRouter : synthesize;
  console.log(
    `${OPENROUTER_KEY ? "OpenRouter" : "Gemini"} 모델: ${model} / 목소리: 해설 ${VOICES.narrator}, 동물 ${VOICES.animal}`,
  );

  const concurrency = Math.max(1, Number(process.env.GEMINI_CONCURRENCY || (OPENROUTER_KEY ? 6 : 3)));
  let done = 0;
  let failed = 0;
  let next = 0;
  /** 하루 한도에 걸리면 모두 멈춘다 (몇 시간씩 기다리지 않는다) */
  let quotaHit = "";
  const stop = () => {
    writeManifest(manifest);
    console.log(`\n중간 저장: ${done}개 만듦. 다시 실행하면 이어서 만들어요.`);
    process.exit(130);
  };
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);

  async function worker() {
    while (next < queue.length && !quotaHit) {
      const p = queue[next++];
      for (let attempt = 1; ; attempt++) {
        try {
          const audio = normalize(trim(await synth(model, p)));
          // 짧은 말에 모델이 문장을 지어 붙이는 일이 있다 (예: "하마!" → 19초). 너무 길면 다시 만든다
          const ms = (audio.pcm.length / audio.rate) * 1000;
          if (ms > maxMs(p.text)) throw new Retry(`너무 길어요 (${Math.round(ms)}ms)`, 0);
          const file = fileFor(p);
          writeFileSync(path.join(OUT_DIR, file), toMp3(audio));
          manifest[p.text] = [file, Math.round((audio.pcm.length / audio.rate) * 1000)];
          done++;
          writeManifest(manifest); // 중간에 멈춰도 만든 것은 남게 매번 저장
          if (done % 25 === 0) console.log(`  ${done}/${queue.length}`);
          break;
        } catch (e) {
          if (e instanceof Retry && e.waitMs > 5 * 60_000) {
            // 무료 등급의 하루 요청 한도 등: 오늘은 여기까지
            quotaHit = `요청 한도에 걸렸어요. 약 ${Math.ceil(e.waitMs / 3_600_000)}시간 뒤에 다시 실행하세요.`;
            break;
          }
          const retry = e instanceof Retry && attempt < 7;
          if (!retry) {
            failed++;
            console.warn(`  실패: ${p.text} — ${(e as Error).message}`);
            break;
          }
          const wait = (e as Retry).waitMs || Math.min(60_000, 2000 * 2 ** (attempt - 1));
          await sleep(wait);
        }
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker));
  writeManifest(manifest);
  if (quotaHit) console.log(quotaHit);
  console.log(`완료: ${done}개 만듦, ${failed}개 실패, 남은 것 ${todo.length - done}개. (npm run voice:check 로 확인)`);
  if (failed > 0 || quotaHit) process.exitCode = 1;
}

void main();
