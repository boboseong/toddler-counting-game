import type { ComponentType } from "react";
import { ChickArt } from "./Chick";
import * as A from "./animals";
import * as F from "./food";
import * as I from "./items";
import type { ArtProps, TapReaction } from "./types";

export interface ArtEntry {
  C: ComponentType<ArtProps>;
  /** 물건을 셀 때의 반응 */
  react?: TapReaction;
}

/**
 * 이모지 → 자체 제작 그림.
 * 여기에 등록만 하면 그 이모지를 쓰는 모든 화면(놀이·스티커북·손님·축하)에 그림이 나온다.
 */
export const ART: Record<string, ArtEntry> = {
  "🐥": { C: ChickArt, react: "hop" },
  "🐤": { C: ChickArt, react: "hop" },
  // 먹이 주기 동물
  "🐰": { C: A.critter(A.RABBIT), react: "hop" },
  "🐵": { C: A.critter(A.MONKEY), react: "hop" },
  "🐒": { C: A.critter(A.MONKEY), react: "hop" },
  "🐶": { C: A.critter(A.DOG), react: "hop" },
  "🐼": { C: A.critter(A.PANDA), react: "hop" },
  "🐱": { C: A.critter(A.CAT), react: "hop" },
  "🐘": { C: A.critter(A.ELEPHANT), react: "hop" },
  "🐻": { C: A.critter(A.BEAR), react: "hop" },
  "🐿️": { C: A.critter(A.SQUIRREL), react: "hop" },
  "🐔": { C: A.critter(A.CHICKEN), react: "hop" },
  "🐭": { C: A.critter(A.MOUSE), react: "hop" },
  "🐨": { C: A.critter(A.KOALA), react: "hop" },
  "🐷": { C: A.critter(A.PIG), react: "hop" },
  // 스티커 친구
  "🦁": { C: A.critter(A.LION), react: "hop" },
  "🐯": { C: A.critter(A.TIGER), react: "hop" },
  "🦊": { C: A.critter(A.FOX), react: "hop" },
  "🐮": { C: A.critter(A.COW), react: "hop" },
  "🐹": { C: A.critter(A.HAMSTER), react: "hop" },
  // 먹을 것
  "🍎": { C: F.Apple, react: "bounce" },
  "🍊": { C: F.Orange, react: "bounce" },
  "🍑": { C: F.Peach, react: "bounce" },
  "🍓": { C: F.Strawberry, react: "bounce" },
  "🍌": { C: F.Banana, react: "wiggle" },
  "🍒": { C: F.Cherry, react: "bounce" },
  "🥕": { C: F.Carrot, react: "wiggle" },
  "🍪": { C: F.Cookie, react: "spin" },
  "🍩": { C: F.Donut, react: "spin" },
  "🧁": { C: F.Cupcake, react: "bounce" },
  "🍦": { C: F.IceCream, react: "wiggle" },
  "🍭": { C: F.Lollipop, react: "spin" },
  "🎋": { C: F.Bamboo, react: "wiggle" },
  "🌰": { C: F.Acorn, react: "bounce" },
  "🌽": { C: F.Corn, react: "wiggle" },
  "🧀": { C: F.Cheese, react: "bounce" },
  "🍃": { C: F.LeafArt, react: "spin" },
  "🍖": { C: F.Meat, react: "wiggle" },
  "🍇": { C: F.Grape, react: "bounce" },
  "🦐": { C: F.Shrimp, react: "flip" },
  "🌸": { C: F.Blossom, react: "bloom" },
  "🍉": { C: F.Watermelon, react: "bounce" },
  "🐛": { C: F.Caterpillar, react: "hop" },
  "🐟": { C: F.Fish, react: "flip" },
  // 장난감 · 탈것 · 작은 동물 · 꽃 · 하늘
  "⭐": { C: I.Star, react: "spin" },
  "🌟": { C: I.GoldStar, react: "spin" },
  "🎈": { C: I.Balloon, react: "wiggle" },
  "⚽": { C: I.Ball, react: "spin" },
  "🎁": { C: I.Gift, react: "wiggle" },
  "🧸": { C: I.Teddy, react: "hop" },
  "🍄": { C: I.Mushroom, react: "bounce" },
  "🚗": { C: I.Car, react: "drive" },
  "🚌": { C: I.Bus, react: "drive" },
  "🚀": { C: I.Rocket, react: "hop" },
  "✈️": { C: I.Plane, react: "drive" },
  "🐞": { C: I.Ladybug, react: "hop" },
  "🦋": { C: I.Butterfly, react: "hop" },
  "🐝": { C: I.Bee, react: "hop" },
  "🐌": { C: I.Snail, react: "wiggle" },
  "🦆": { C: I.Duck, react: "hop" },
  "🌼": { C: I.Daisy, react: "bloom" },
  "🌷": { C: I.Tulip, react: "bloom" },
  "🥚": { C: I.Egg, react: "wiggle" },
  "☁️": { C: I.Cloud, react: "bounce" },
  "☀️": { C: I.Sun, react: "spin" },
  "🌙": { C: I.Moon, react: "wiggle" },
  "💖": { C: I.Heart, react: "bounce" },
  "🐢": { C: I.Turtle, react: "wiggle" },
};
