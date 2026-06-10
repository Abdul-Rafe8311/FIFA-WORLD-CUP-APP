/**
 * Pure scoring functions — used by cron/results and admin lineup scoring.
 * Kept side-effect free so they're trivially testable.
 */

/** Score a single match prediction. Exact = 3, correct result = 1, else 0. */
export function scorePrediction(
  homePred: number,
  awayPred: number,
  homeFinal: number,
  awayFinal: number,
): number {
  if (homePred === homeFinal && awayPred === awayFinal) return 3;
  const predResult = Math.sign(homePred - awayPred);
  const finalResult = Math.sign(homeFinal - awayFinal);
  return predResult === finalResult ? 1 : 0;
}

/**
 * Score a lineup prediction against the actual XI. Order/formation irrelevant.
 * 11/11 = 5, 9-10 = 3, 7-8 = 1, else 0.
 */
export function scoreLineup(predictedIds: string[], actualIds: string[]): number {
  const actual = new Set(actualIds);
  let correct = 0;
  for (const id of new Set(predictedIds)) {
    if (actual.has(id)) correct += 1;
  }
  if (correct === 11) return 5;
  if (correct >= 9) return 3;
  if (correct >= 7) return 1;
  return 0;
}

/** Count how many predicted players are in the actual XI (for UI breakdown). */
export function countLineupHits(predictedIds: string[], actualIds: string[]): number {
  const actual = new Set(actualIds);
  let correct = 0;
  for (const id of new Set(predictedIds)) {
    if (actual.has(id)) correct += 1;
  }
  return correct;
}
