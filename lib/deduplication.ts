/**
 * ============================================================
 *  DEDUPLICATION ENGINE — lib/deduplication.ts
 * ============================================================
 *
 *  Uses TF-IDF cosine similarity to detect near-duplicate
 *  problem submissions. Fully offline — no external API needed.
 *
 *  Algorithm:
 *    1. Fetch recent problems from DB (last 90 days, same domain)
 *    2. Build TF-IDF vectors for each existing problem + new one
 *    3. Compute cosine similarity between new and each existing
 *    4. If similarity > THRESHOLD, mark as duplicate and assign
 *       the same dedupGroupId as the matching problem
 *    5. Otherwise, assign a fresh dedupGroupId (UUID)
 * ============================================================
 */

import { prisma } from './prisma'

const SIMILARITY_THRESHOLD = 0.65 // 65% similarity = duplicate
const LOOKBACK_DAYS = 90

export interface DeduplicationResult {
  isDuplicate: boolean
  groupId: string      // UUID — shared with match or fresh UUID
  matchedProblemId?: string
  similarity?: number
}

/**
 * Check if a new problem is a near-duplicate of existing ones.
 */
export async function checkDuplicate(
  newProblemId: string,
  title: string,
  description: string,
): Promise<DeduplicationResult> {
  const freshGroupId = crypto.randomUUID()

  try {
    const since = new Date()
    since.setDate(since.getDate() - LOOKBACK_DAYS)

    // Fetch recent problems excluding the new one itself
    const existing = await prisma.problem.findMany({
      where: {
        id: { not: newProblemId },
        createdAt: { gte: since },
        status: { not: 'REJECTED' },
      },
      select: { id: true, title: true, description: true, dedupGroupId: true },
      take: 200, // cap to prevent excessive processing
    })

    if (existing.length === 0) {
      return { isDuplicate: false, groupId: freshGroupId }
    }

    const newText = `${title} ${description}`
    const newVec  = buildTfIdfVector(newText, existing.map(p => `${p.title} ${p.description}`))

    let bestSimilarity = 0
    let bestMatch: typeof existing[0] | null = null

    for (const problem of existing) {
      const existingText = `${problem.title} ${problem.description}`
      const corpus = [newText, ...existing.filter(p => p.id !== problem.id).map(p => `${p.title} ${p.description}`)]
      const existingVec = buildTfIdfVector(existingText, corpus)
      const sim = cosineSimilarity(newVec, existingVec)

      if (sim > bestSimilarity) {
        bestSimilarity = sim
        bestMatch = problem
      }
    }

    if (bestSimilarity >= SIMILARITY_THRESHOLD && bestMatch) {
      return {
        isDuplicate: true,
        groupId: bestMatch.dedupGroupId ?? freshGroupId,
        matchedProblemId: bestMatch.id,
        similarity: bestSimilarity,
      }
    }

    return { isDuplicate: false, groupId: freshGroupId }
  } catch (err) {
    console.error('[Deduplication] Error:', err)
    // On error, don't block submission — just assign fresh group
    return { isDuplicate: false, groupId: freshGroupId }
  }
}

// ── TF-IDF Helpers ────────────────────────────────────────────

type TfIdfVector = Map<string, number>

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\u0900-\u097f\s]/g, '') // keep ASCII + Devanagari
    .split(/\s+/)
    .filter(w => w.length > 2)                  // remove very short tokens
}

function termFrequency(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>()
  for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1)
  Array.from(tf.entries()).forEach(([k, v]) => tf.set(k, v / tokens.length))
  return tf
}

function buildTfIdfVector(doc: string, corpus: string[]): TfIdfVector {
  const tokens = tokenize(doc)
  const tf = termFrequency(tokens)
  const vector: TfIdfVector = new Map()
  const N = corpus.length + 1

  Array.from(tf.entries()).forEach(([term, tfScore]) => {
    const docsWithTerm = corpus.filter(d => tokenize(d).includes(term)).length + 1
    const idf = Math.log(N / docsWithTerm)
    vector.set(term, tfScore * idf)
  })

  return vector
}

function cosineSimilarity(a: TfIdfVector, b: TfIdfVector): number {
  let dotProduct = 0
  let normA = 0
  let normB = 0

  Array.from(a.entries()).forEach(([term, valA]) => {
    const valB = b.get(term) ?? 0
    dotProduct += valA * valB
    normA += valA * valA
  })
  Array.from(b.values()).forEach(valB => { normB += valB * valB })

  if (normA === 0 || normB === 0) return 0
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}
