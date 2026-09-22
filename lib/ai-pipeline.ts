/**
 * ============================================================
 *  AI PIPELINE ORCHESTRATOR — lib/ai-pipeline.ts
 * ============================================================
 *
 *  Runs all AI stages in sequence on a problem submission:
 *    1. Translation  (Bhashini ULCA — stub fallback)
 *    2. Classification (keyword-based domain classifier)
 *    3. Urgency Scoring (keyword heuristic 0-100)
 *    4. Deduplication  (TF-IDF cosine similarity)
 *    5. Summarisation  (truncation stub — TODO: LLM)
 *
 *  Called after initial DB insert so the raw submission is
 *  always saved first, then enriched asynchronously.
 * ============================================================
 */

import { translateToEnglish, isBhashiniConfigured, type BhashiniLang } from './bhashini'
import { classify } from './classifier'
import { computeUrgencyScore } from './urgency'
import { checkDuplicate } from './deduplication'

export interface AIPipelineInput {
  problemId: string
  title: string
  description: string
  sourceLang: string
  districtId: string
}

export interface AIPipelineResult {
  titleEn: string
  descEn: string
  titleHi?: string
  descHi?: string
  domain: string
  routedTo: string
  urgencyScore: number
  aiSummary: string
  dedupGroupId?: string
  isDuplicate: boolean
  bhashiniUsed: boolean
}

/**
 * Run the full AI pipeline on a newly submitted problem.
 * Returns enriched fields to be saved back to the DB.
 */
export async function runAIPipeline(input: AIPipelineInput): Promise<AIPipelineResult> {
  const { problemId, title, description, sourceLang } = input

  // ── Stage 1: Translation ─────────────────────────────────
  let titleEn   = title
  let descEn    = description
  let titleHi: string | undefined
  let descHi: string | undefined
  let bhashiniUsed = false

  const lang = (sourceLang || 'en') as BhashiniLang

  if (lang !== 'en') {
    const [tTitle, tDesc] = await Promise.all([
      translateToEnglish(title, lang),
      translateToEnglish(description, lang),
    ])

    if (!tTitle.isStub) { titleEn = tTitle.translatedText; bhashiniUsed = true }
    if (!tDesc.isStub)  { descEn  = tDesc.translatedText;  bhashiniUsed = true }

    // Store originals if Hindi
    if (lang === 'hi') {
      titleHi = title
      descHi  = description
    }
  }

  // ── Stage 2: Classification ──────────────────────────────
  const { domain, routedTo } = classify(titleEn, descEn)

  // ── Stage 3: Urgency Scoring ─────────────────────────────
  const urgencyScore = computeUrgencyScore(titleEn, descEn)

  // ── Stage 4: Deduplication ───────────────────────────────
  const { isDuplicate, groupId: dedupGroupId } = await checkDuplicate(
    problemId,
    titleEn,
    descEn,
  )

  // ── Stage 5: Summarisation (stub — TODO: replace with LLM) ──
  const aiSummary = generateSummary(titleEn, descEn)

  return {
    titleEn,
    descEn,
    titleHi,
    descHi,
    domain,
    routedTo,
    urgencyScore,
    aiSummary,
    dedupGroupId,
    isDuplicate,
    bhashiniUsed,
  }
}

/**
 * Stub summariser — truncates description to 120 chars.
 * TODO: Replace with Gemini / OpenAI summarisation call.
 */
function generateSummary(title: string, description: string): string {
  const combined = `${title}: ${description}`
  if (combined.length <= 150) return combined
  return combined.slice(0, 147).trim() + '...'
}

export { isBhashiniConfigured }
