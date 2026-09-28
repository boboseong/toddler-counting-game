/*
 * 모든 문장에 음성 파일이 있는지 확인한다.
 *   npm run voice:check
 * 없는 문장은 앱에서 브라우저 TTS 로 대신 읽는다 (npm run voice:gen 으로 만들기).
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { allPhrases } from "../src/lib/phrases";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(readFileSync(path.join(ROOT, "src", "lib", "voice-manifest.json"), "utf8")) as Record<
  string,
  [string, number]
>;

const phrases = allPhrases();
const texts = new Set(phrases.map((p) => p.text));
const missing = phrases.filter((p) => {
  const m = manifest[p.text];
  return !m || !existsSync(path.join(ROOT, "public", "voice", m[0]));
});
const orphans = Object.keys(manifest).filter((k) => !texts.has(k));
const core = phrases.filter((p) => p.core).length;

console.log(`문장 ${phrases.length}개 (미리 받는 것 ${core}개) · 음성 있음 ${phrases.length - missing.length}개 · 없음 ${missing.length}개`);
if (orphans.length) console.log(`목록에 없는 옛 음성 ${orphans.length}개 (npm run voice:gen -- --prune 로 정리)`);
missing.slice(0, 15).forEach((p) => console.log(`  없음: ${p.text}`));
if (missing.length > 15) console.log(`  … 외 ${missing.length - 15}개`);
if (missing.length > 0) process.exitCode = 1;
