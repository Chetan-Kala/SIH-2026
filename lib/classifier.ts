/**
 * Keyword-based problem classifier.
 * Matches words in the problem title/description to a civic domain
 * and returns the department the problem should be routed to.
 *
 * Edit RULES below to add/remove keywords or change department names.
 */

export interface Classification {
  domain: string
  routedTo: string
}

interface Rule {
  domain: string
  routedTo: string
  keywords: string[]
}

const RULES: Rule[] = [
  {
    domain: 'Roads & Infrastructure',
    routedTo: 'Public Works Department',
    keywords: [
      // English
      'road', 'pothole', 'highway', 'footpath', 'pavement', 'bridge',
      'flyover', 'street', 'divider', 'accident', 'traffic signal',
      'construction', 'broken road', 'speed breaker',
      // Hindi (Devanagari)
      'सड़क', 'रोड', 'गड्ढा', 'पुल', 'फुटपाथ', 'राजमार्ग', 'निर्माण',
      'यातायात', 'दुर्घटना', 'स्पीड ब्रेकर', 'डिवाइडर',
    ],
  },
  {
    domain: 'Water Supply & Sanitation',
    routedTo: 'Water & Sewerage Department',
    keywords: [
      // English
      'water', 'pipe', 'leak', 'supply', 'sewage', 'drainage', 'flood',
      'waterlogging', 'gutter', 'drain', 'borewell', 'tap', 'sewer',
      'overflow', 'contamination', 'dirty water',
      // Hindi (Devanagari)
      'पानी', 'जल', 'नल', 'पाइप', 'सप्लाई', 'सीवर', 'नाली', 'जलभराव',
      'बाढ़', 'बोरवेल', 'गंदा पानी', 'रिसाव', 'लीक', 'सूखा नल',
      'पीने का पानी', 'जल आपूर्ति', 'सूखे', 'नहीं आ रहा',
    ],
  },
  {
    domain: 'Electricity',
    routedTo: 'Electricity Distribution Department',
    keywords: [
      // English
      'electricity', 'power', 'outage', 'blackout', 'light', 'streetlight',
      'transformer', 'wire', 'electric pole', 'sparking', 'shock', 'meter',
      'voltage', 'load shedding', 'no power',
      // Hindi (Devanagari)
      'बिजली', 'विद्युत', 'करंट', 'ट्रांसफार्मर', 'तार', 'खंभा',
      'लाइट', 'स्ट्रीट लाइट', 'मीटर', 'वोल्टेज', 'कटौती', 'अंधेरा',
      'बिजली नहीं', 'लोड शेडिंग',
    ],
  },
  {
    domain: 'Waste Management',
    routedTo: 'Municipal Solid Waste Management',
    keywords: [
      // English
      'garbage', 'waste', 'trash', 'dustbin', 'dump', 'litter', 'sweeping',
      'rubbish', 'smell', 'stench', 'plastic', 'landfill', 'collection',
      'sanitation worker',
      // Hindi (Devanagari)
      'कचरा', 'गंदगी', 'कूड़ा', 'डस्टबिन', 'सफाई', 'बदबू', 'दुर्गंध',
      'झाड़ू', 'कूड़ेदान', 'प्लास्टिक', 'नाली',
    ],
  },
  {
    domain: 'Public Health',
    routedTo: 'Health Department',
    keywords: [
      // English
      'hospital', 'clinic', 'health', 'disease', 'mosquito', 'dengue',
      'malaria', 'cholera', 'epidemic', 'medicine', 'doctor', 'ambulance',
      'vaccination', 'fumigation', 'stagnant water',
      // Hindi (Devanagari)
      'अस्पताल', 'स्वास्थ्य', 'बीमारी', 'मच्छर', 'डेंगू', 'मलेरिया',
      'दवाई', 'डॉक्टर', 'एम्बुलेंस', 'टीकाकरण', 'महामारी', 'रुका पानी',
    ],
  },
  {
    domain: 'Law & Order',
    routedTo: 'Police Department',
    keywords: [
      // English
      'police', 'crime', 'theft', 'robbery', 'assault', 'harassment',
      'eve teasing', 'illegal', 'encroachment', 'noise', 'fight', 'violence',
      'drunk', 'drug', 'security',
      // Hindi (Devanagari)
      'पुलिस', 'चोरी', 'डकैती', 'मारपीट', 'छेड़छाड़', 'अवैध', 'अतिक्रमण',
      'शोर', 'झगड़ा', 'हिंसा', 'नशा', 'सुरक्षा', 'अपराध',
    ],
  },
  {
    domain: 'Education',
    routedTo: 'Education Department',
    keywords: [
      // English
      'school', 'college', 'teacher', 'student', 'education', 'classroom',
      'textbook', 'mid day meal', 'library', 'university', 'syllabus',
      'exam', 'scholarship',
      // Hindi (Devanagari)
      'स्कूल', 'विद्यालय', 'कॉलेज', 'शिक्षक', 'छात्र', 'शिक्षा',
      'किताब', 'मध्याह्न भोजन', 'पुस्तकालय', 'परीक्षा', 'छात्रवृत्ति',
    ],
  },
  {
    domain: 'Transport',
    routedTo: 'Transport Department',
    keywords: [
      // English
      'bus', 'transport', 'auto', 'rickshaw', 'taxi', 'parking', 'overloading',
      'route', 'rto', 'license', 'permit', 'vehicle', 'station',
      // Hindi (Devanagari)
      'बस', 'परिवहन', 'ऑटो', 'रिक्शा', 'टैक्सी', 'पार्किंग',
      'वाहन', 'लाइसेंस', 'स्टेशन', 'रूट',
    ],
  },
]

const FALLBACK: Classification = {
  domain: 'General',
  routedTo: 'District Collector Office',
}

/**
 * Classify a problem by its title and description.
 * Returns the best-matching domain and department, or a fallback.
 */
export function classify(title: string, description: string): Classification {
  const text = `${title} ${description}`.toLowerCase()

  let bestRule: Rule | null = null
  let bestScore = 0

  for (const rule of RULES) {
    let score = 0
    for (const kw of rule.keywords) {
      if (text.includes(kw.toLowerCase())) {
        score++
      }
    }
    if (score > bestScore) {
      bestScore = score
      bestRule = rule
    }
  }

  if (!bestRule) return FALLBACK

  return {
    domain: bestRule.domain,
    routedTo: bestRule.routedTo,
  }
}
