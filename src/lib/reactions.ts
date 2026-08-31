export const REACTION_TYPES = [
  { id: "like", emoji: "👍", label: "Beğendim" },
  { id: "love", emoji: "❤️", label: "Harika" },
  { id: "laugh", emoji: "😂", label: "Güldüm" },
  { id: "wow", emoji: "😮", label: "Şaşırdım" },
  { id: "sad", emoji: "😢", label: "Üzüldüm" },
  { id: "angry", emoji: "😡", label: "Kızdım" },
] as const;

export type ReactionId = (typeof REACTION_TYPES)[number]["id"];

export type ReactionState = {
  counts: Record<ReactionId, number>;
  mine: ReactionId | null;
};

export const EMPTY_REACTION_COUNTS = Object.fromEntries(
  REACTION_TYPES.map((r) => [r.id, 0]),
) as Record<ReactionId, number>;

export function isReactionId(value: string): value is ReactionId {
  return REACTION_TYPES.some((r) => r.id === value);
}

export function emptyReactionState(): ReactionState {
  return { counts: { ...EMPTY_REACTION_COUNTS }, mine: null };
}
