export interface Last6DaysResponse {
  date: string;
  last_6_days: {
    window_3?: string;
    window_4?: string;
    window_10?: string;
    window_15?: string;
  };
}

export interface EmojiDay {
  emoji: string;
  direction: 'up' | 'down' | 'neutral';
}