import { FRIEND_VISIT_CHANCE, PORORO_ROUND_CHANCE } from "./data";

/* 뽀로로 친구가 나올지 정하는 주사위 (브라우저에서만 쓴다: 음성 만들기 스크립트는 data.ts 만 읽는다) */

/** 개발 서버에서 주소에 ?friends 를 붙이면 뽀로로 친구가 매번 나온다 (확인용) */
const force: boolean = import.meta.env.DEV && new URLSearchParams(window.location.search).has("friends");

/** 맞힌 뒤 병아리 대신 뽀로로 친구가 놀러 올 차례인지 */
export function rollVisit(): boolean {
  return force || Math.random() < FRIEND_VISIT_CHANCE;
}

/** 이번 판에 뽀로로 친구가 나올지 (나눠 주기 · 딱 맞게 태워요 · 엘리베이터 · 전화 · 계단 · 톡톡 세기 · 몇 개일까) */
export function rollPororo(): boolean {
  return force || Math.random() < PORORO_ROUND_CHANCE;
}
