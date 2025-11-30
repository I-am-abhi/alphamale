export const motivationalQuotes = [
  "Your silence becomes your aura.",
  "A warrior sharpens his weapons on Sunday.",
  "Friday nights create future millionaires, not drunk people.",
  "You don't become a better version of yourself. You bury the old version.",
  "Discipline is choosing between what you want now and what you want most.",
  "The only bad workout is the one that didn't happen.",
  "Excellence is not a skill, it's an attitude.",
  "The pain of discipline is nothing like the pain of disappointment.",
  "Success is the sum of small efforts repeated day in and day out.",
  "The body achieves what the mind believes.",
  "Strength does not come from physical capacity. It comes from an indomitable will.",
  "The only way to do great work is to love what you do.",
  "Champions are made in the gym, not in the ring.",
  "Your future is created by what you do today, not tomorrow.",
  "The difference between who you are and who you want to be is what you do.",
  "Don't stop when you're tired. Stop when you're done.",
  "The only person you should try to be better than is the person you were yesterday.",
  "Hard work beats talent when talent doesn't work hard.",
  "Success isn't given. It's earned.",
  "The grind never stops.",
];

export function getRandomQuote(): string {
  return motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
}

export function getQuoteForDay(day: number): string {
  return motivationalQuotes[day % motivationalQuotes.length];
}

// Get quote based on day of year (1-365) for daily rotation
export function getQuoteForDate(date: Date): string {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return motivationalQuotes[dayOfYear % motivationalQuotes.length];
}

