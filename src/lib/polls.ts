export type PollOptionState = {
  id: string;
  label: string;
  count: number;
  percent: number;
};

export type PollState = {
  id: string;
  question: string;
  description: string | null;
  totalVotes: number;
  options: PollOptionState[];
  mine: string | null;
  closed: boolean;
  showResults: boolean;
};

export function emptyPollState(): PollState {
  return {
    id: "",
    question: "",
    description: null,
    totalVotes: 0,
    options: [],
    mine: null,
    closed: false,
    showResults: true,
  };
}

export function isPollOpen(endsAt: Date | null | undefined, active: boolean) {
  if (!active) return false;
  if (!endsAt) return true;
  return endsAt.getTime() > Date.now();
}

export function buildPollPercents(
  options: Array<{ id: string; label: string; count: number }>,
  total: number,
): PollOptionState[] {
  if (total <= 0) {
    return options.map((option) => ({ ...option, percent: 0 }));
  }
  return options.map((option) => ({
    ...option,
    percent: Math.round((option.count / total) * 100),
  }));
}
