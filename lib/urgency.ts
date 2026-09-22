/**
 * ============================================================
 *  URGENCY SCORING — lib/urgency.ts
 * ============================================================
 *
 *  Computes a 0-100 urgency score for a problem based on
 *  keyword heuristics in both English and Hindi.
 *
 *  Scoring tiers:
 *    CRITICAL (80-100): Life-threatening, immediate danger
 *    HIGH     (50-79):  Significant disruption, many people affected
 *    MEDIUM   (20-49):  Moderate local issue
 *    LOW      (0-19):   Minor inconvenience
 * ============================================================
 */

interface UrgencyRule {
  keywords: string[]
  boost: number
}

const URGENCY_RULES: UrgencyRule[] = [
  // CRITICAL — +40 each
  {
    boost: 40,
    keywords: [
      'death', 'died', 'fatality', 'casualty', 'killing', 'murder',
      'fire', 'flood', 'collapse', 'explosion', 'electrocution',
      'मौत', 'मृत्यु', 'आग', 'बाढ़', 'विस्फोट', 'हत्या',
    ],
  },
  // HIGH — +25 each
  {
    boost: 25,
    keywords: [
      'emergency', 'urgent', 'critical', 'hospital', 'ambulance',
      'accident', 'injury', 'injured', 'epidemic', 'outbreak',
      'आपातकाल', 'जरूरी', 'अस्पताल', 'दुर्घटना', 'चोट', 'महामारी',
    ],
  },
  // MEDIUM — +15 each
  {
    boost: 15,
    keywords: [
      'danger', 'unsafe', 'hazard', 'broken', 'severe',
      'multiple families', 'entire village', 'no water', 'no electricity',
      'खतरा', 'असुरक्षित', 'खराब', 'कई परिवार', 'पूरा गाँव',
      'पानी नहीं', 'बिजली नहीं',
    ],
  },
  // MINOR BOOST — +5 each
  {
    boost: 5,
    keywords: [
      'problem', 'issue', 'complaint', 'damaged', 'blocked', 'broken',
      'समस्या', 'शिकायत', 'खराब', 'बंद', 'अवरुद्ध',
    ],
  },
]

/**
 * Compute urgency score from problem text.
 * Score is capped at 100 and cannot go below 0.
 */
export function computeUrgencyScore(title: string, description: string): number {
  const text = `${title} ${description}`.toLowerCase()
  let score = 5 // base score — every valid submission starts at 5

  for (const rule of URGENCY_RULES) {
    for (const kw of rule.keywords) {
      if (text.includes(kw.toLowerCase())) {
        score += rule.boost
        break // only count each tier once per keyword match
      }
    }
  }

  return Math.min(100, Math.max(0, score))
}

/** Human-readable urgency label */
export function urgencyLabel(score: number): 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' {
  if (score >= 80) return 'CRITICAL'
  if (score >= 50) return 'HIGH'
  if (score >= 20) return 'MEDIUM'
  return 'LOW'
}

/** Urgency colour for UI badges */
export function urgencyColor(score: number): string {
  if (score >= 80) return '#FF4757' // red
  if (score >= 50) return '#F5A623' // amber/gold
  if (score >= 20) return '#1E90FF' // blue
  return '#B0BEC5'                  // grey
}
