"use client";

import confetti from "canvas-confetti";
import type { ReactionId } from "@/lib/reactions";

const COLORS: Record<ReactionId, string[]> = {
  like: ["#e11d48", "#2563eb", "#f59e0b", "#ffffff"],
  love: ["#e11d48", "#fb7185", "#fecdd3", "#ffffff"],
  laugh: ["#facc15", "#fb923c", "#fef08a", "#ffffff"],
  wow: ["#a855f7", "#38bdf8", "#e9d5ff", "#ffffff"],
  sad: ["#38bdf8", "#64748b", "#93c5fd", "#ffffff"],
  angry: ["#ef4444", "#f97316", "#7f1d1d", "#ffffff"],
};

export function burstReaction(emoji: string, type: ReactionId, el: HTMLElement) {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const rect = el.getBoundingClientRect();
  const origin = {
    x: (rect.left + rect.width / 2) / window.innerWidth,
    y: (rect.top + rect.height / 2) / window.innerHeight,
  };
  const scalar = 2.2;
  const shape = confetti.shapeFromText({ text: emoji, scalar });

  confetti({
    particleCount: 28,
    spread: 78,
    startVelocity: 34,
    gravity: 0.9,
    ticks: 180,
    origin,
    shapes: [shape],
    scalar,
    disableForReducedMotion: true,
  });

  confetti({
    particleCount: 36,
    spread: 80,
    startVelocity: 38,
    gravity: 1,
    ticks: 140,
    origin,
    colors: COLORS[type],
    scalar: 0.85,
    disableForReducedMotion: true,
  });
}
