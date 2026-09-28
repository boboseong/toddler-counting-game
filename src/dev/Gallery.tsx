import { useState } from "react";
import { Glyph } from "../art/Glyph";
import { ART } from "../art/registry";
import type { Mood } from "../art/types";

const MOODS: Mood[] = ["idle", "talk", "happy", "cheer", "surprised", "hmm", "eating", "full", "hungry", "sleepy"];

/** 자체 제작 그림 한눈에 보기 (?gallery). 새 그림을 그릴 때 표정·크기를 확인하는 용도 */
export default function Gallery() {
  const [mood, setMood] = useState<Mood>("idle");
  const [full, setFull] = useState(0);
  const list = Object.keys(ART);
  return (
    <div className="h-full overflow-y-auto bg-sky-50 p-4 text-slate-700">
      <h1 className="text-2xl">그림 모음 ({list.length})</h1>
      <div className="my-3 flex flex-wrap gap-2">
        {MOODS.map((m) => (
          <button
            key={m}
            onClick={() => setMood(m)}
            className={`rounded-full px-3 py-1 ${m === mood ? "bg-violet-500 text-white" : "bg-white"}`}
          >
            {m}
          </button>
        ))}
        <label className="flex items-center gap-2">
          배부름
          <input type="range" min={0} max={1} step={0.1} value={full} onChange={(e) => setFull(Number(e.target.value))} />
        </label>
      </div>
      <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
        {list.map((e) => (
          <div key={e} className="flex flex-col items-center rounded-2xl bg-white p-2 shadow">
            <Glyph emoji={e} mood={mood} fullness={full} className="text-6xl" />
            <span className="emoji mt-1 text-xl opacity-60">{e}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
