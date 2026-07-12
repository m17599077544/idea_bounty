/**
 * Cosine similarity between two vectors.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) throw new Error('Vectors must have same length');
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;
  return dotProduct / denominator;
}

/**
 * Calculate bounty from dimension scores.
 * Formula: weighted average × 10 → ¥0–¥100 range
 */
export function calculateBounty(needBreadth: number, payWillingness: number, feasibility: number): number {
  const totalScore = needBreadth * 0.4 + payWillingness * 0.35 + feasibility * 0.25;
  const bounty = totalScore * 10;
  return Math.round(bounty * 100) / 100; // Round to 2 decimal places
}

/**
 * Calculate total weighted score.
 */
export function calculateTotalScore(needBreadth: number, payWillingness: number, feasibility: number): number {
  const score = needBreadth * 0.4 + payWillingness * 0.35 + feasibility * 0.25;
  return Math.round(score * 100) / 100;
}

const CHINESE_NAMES = [
  '创想家', '点子王', '灵感捕手', '商业侦探', '痛点猎手',
  '创意达人', '脑洞星人', '改变者', '梦想家', '先行者',
];

export function randomSubmitterName(): string {
  return CHINESE_NAMES[Math.floor(Math.random() * CHINESE_NAMES.length)];
}
