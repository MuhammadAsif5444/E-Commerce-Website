export type SentimentType = 'positive' | 'neutral' | 'negative';

export interface SentimentAnalysis {
  type: SentimentType;
  score: number; // 0 to 100
  label: string;
  badgeBg: string;
  badgeText: string;
  highlights: string[];
}

const POSITIVE_KEYWORDS = [
  'best', 'love', 'exceptional', 'superior', 'flawless', 'fast', 'crisp', 'premium',
  'great', 'excellent', 'amazing', 'perfect', 'comfortable', 'sharp', 'vibrant', 'worth',
  'quiet', 'soft', 'sturdy', 'recommend', 'reliable', 'solid', 'beautiful', 'quality'
];

const NEGATIVE_KEYWORDS = [
  'poor', 'terrible', 'worst', 'broken', 'bad', 'slow', 'defective', 'cheap',
  'disappointed', 'heavy', 'noisy', 'muddy', 'scratch', 'failed', 'refund', 'waste',
  'flimsy', 'uncomfortable', 'difficult', 'pain'
];

export function analyzeReviewSentiment(rating: number, title: string, comment: string): SentimentAnalysis {
  const text = `${title.toLowerCase()} ${comment.toLowerCase()}`;
  
  let positiveScore = 0;
  let negativeScore = 0;
  const highlights: string[] = [];

  POSITIVE_KEYWORDS.forEach(word => {
    if (text.includes(word)) {
      positiveScore += 1;
      if (highlights.length < 3) highlights.push(word);
    }
  });

  NEGATIVE_KEYWORDS.forEach(word => {
    if (text.includes(word)) {
      negativeScore += 1;
      if (highlights.length < 3) highlights.push(word);
    }
  });

  // Base score from rating (1 to 5 maps to 0 to 100)
  let rawScore = (rating / 5) * 70;
  // Keyword adjustment (up to 30 points)
  const keywordDiff = positiveScore - negativeScore;
  rawScore += Math.max(-30, Math.min(30, keywordDiff * 10));

  const finalScore = Math.max(5, Math.min(98, Math.round(rawScore)));

  if (finalScore >= 65 || rating >= 4) {
    return {
      type: 'positive',
      score: finalScore,
      label: 'Positive Experience',
      badgeBg: 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
      badgeText: 'Positive',
      highlights,
    };
  } else if (finalScore <= 40 || rating <= 2) {
    return {
      type: 'negative',
      score: finalScore,
      label: 'Critical Feedback',
      badgeBg: 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
      badgeText: 'Critical',
      highlights,
    };
  } else {
    return {
      type: 'neutral',
      score: finalScore,
      label: 'Balanced Review',
      badgeBg: 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
      badgeText: 'Balanced',
      highlights,
    };
  }
}

export const analyzeSentiment = analyzeReviewSentiment;
