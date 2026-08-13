export interface ScoringWeights {
  substances: number;
  criticals: number;
  routines: number;
  employment: number;
  meditation: number;
  exercise: number;
  distractions: number;
}

export const DEFAULT_WEIGHTS: ScoringWeights = {
  substances: 20,
  criticals: 25,
  routines: 15,
  employment: 15,
  meditation: 10,
  exercise: 10,
  distractions: 5,
};

export class MetricsEngine {
  static calculateDailyProgress(actions: Array<{ status: string; targetValue?: number | null; realValue?: number | null }>): number {
    const evaluable = actions.filter(a => a.status !== 'NOT_APPLICABLE');
    if (evaluable.length === 0) return 0;

    const totalPoints = evaluable.reduce((acc, curr) => {
      if (curr.status === 'COMPLETED') return acc + 1;
      if (curr.status === 'PARTIAL') {
        if (curr.targetValue && curr.targetValue > 0) {
          const ratio = (curr.realValue || 0) / curr.targetValue;
          return acc + Math.min(Math.max(ratio, 0), 1);
        }
        return acc + 0.5;
      }
      return acc;
    }, 0);

    return Math.round((totalPoints / evaluable.length) * 100);
  }

  static calculateScore(params: {
    consumedSubstances: boolean;
    criticalsCompletedRatio: number;
    routinesCompletedRatio: number;
    validJobApps: number;
    meditationMinutes: number;
    exercisePercentage: number;
    socialMediaMinutes: number;
  }): number {
    let score = 0;

    if (!params.consumedSubstances) score += DEFAULT_WEIGHTS.substances;
    score += Math.min(Math.max(params.criticalsCompletedRatio, 0), 1) * DEFAULT_WEIGHTS.criticals;
    score += Math.min(Math.max(params.routinesCompletedRatio, 0), 1) * DEFAULT_WEIGHTS.routines;

    const jobRatio = Math.min(params.validJobApps / 10, 1);
    score += jobRatio * DEFAULT_WEIGHTS.employment;

    let medRatio = 0;
    if (params.meditationMinutes >= 30) medRatio = 1;
    else if (params.meditationMinutes >= 5) medRatio = 0.5 + (params.meditationMinutes - 5) / 50;
    score += medRatio * DEFAULT_WEIGHTS.meditation;

    score += (Math.min(Math.max(params.exercisePercentage, 0), 100) / 100) * DEFAULT_WEIGHTS.exercise;

    if (params.socialMediaMinutes <= 60) {
      score += DEFAULT_WEIGHTS.distractions;
    } else {
      const penalty = Math.min((params.socialMediaMinutes - 60) / 60, 1);
      score += (1 - penalty) * DEFAULT_WEIGHTS.distractions;
    }

    return Math.round(Math.min(Math.max(score, 0), 100));
  }

  static calculateAdherence(history: Array<{ score: number }>, threshold = 70): number {
    if (history.length === 0) return 0;
    const successfulDays = history.filter(h => h.score >= threshold).length;
    return Math.round((successfulDays / history.length) * 100);
  }

  static calculateStreaks(history: Array<{ date: string; score: number }>, threshold = 70): { currentStreak: number; maxStreak: number } {
    let current = 0;
    let max = 0;

    for (let i = 0; i < history.length; i++) {
      if (history[i].score >= threshold) {
        current++;
        if (current > max) max = current;
      } else {
        if (i === 0) current = 0;
        break;
      }
    }

    return { currentStreak: current, maxStreak: max };
  }

  static calculateRecoveryTime(history: Array<{ date: string; score: number }>, failureThreshold = 50, recoveryThreshold = 70): number {
    const recoveryGaps: number[] = [];
    let failureIndex = -1;
    const sorted = [...history].reverse();

    for (let i = 0; i < sorted.length; i++) {
      if (sorted[i].score < failureThreshold && failureIndex === -1) {
        failureIndex = i;
      } else if (sorted[i].score >= recoveryThreshold && failureIndex !== -1) {
        recoveryGaps.push(i - failureIndex);
        failureIndex = -1;
      }
    }

    if (recoveryGaps.length === 0) return 0;
    const avg = recoveryGaps.reduce((a, b) => a + b, 0) / recoveryGaps.length;
    return Number(avg.toFixed(1));
  }
      }
  
