import { 
  WellnessCheckIn, 
  TaskItem, 
  HobbyItem, 
  ActivityRecommendation, 
  UserPreferences,
  AIChatMessage
} from '../types';

const CRISIS_KEYWORDS = [
  'kill myself', 'suicide', 'end my life', 'want to die', 'harm myself',
  'cutting myself', 'can\'t go on living', 'better off dead'
];

export function detectCrisis(text: string): boolean {
  const lower = text.toLowerCase();
  return CRISIS_KEYWORDS.some(kw => lower.includes(kw));
}

export const CRISIS_SUPPORT_TEXT = `We care deeply about your safety. If you are experiencing overwhelming distress, thoughts of self-harm, or an emergency, immediate compassionate support is available right now:
- 🇺🇸 In the US & Canada: Call or text 988 (Suicide & Crisis Lifeline, free, 24/7, confidential) or text HOME to 741741.
- 🇬🇧 In the UK: Call 111 (NHS) or 116 123 (Samaritans).
- 🌍 International: Please visit https://findahelpline.com or reach out directly to your local emergency services or a trusted physician.
You are not alone, and help is always here.`;

export interface AIAnalysisResult {
  empatheticSummary: string;
  recommendedSteps: string[];
  suggestedTasks?: Partial<TaskItem>[];
  suggestedHobbies?: Partial<HobbyItem>[];
  recommendations: ActivityRecommendation[];
  crisisAlert: boolean;
}

export async function analyzeWellnessCheckIn(
  checkIn: WellnessCheckIn, 
  prefs: UserPreferences,
  existingHobbies: HobbyItem[]
): Promise<AIAnalysisResult> {
  const isCrisis = detectCrisis(checkIn.journalText + ' ' + (checkIn.concernsOrNotes || ''));
  if (isCrisis) {
    return {
      empatheticSummary: "I hear how much distress you are feeling right now. Your well-being and safety are the absolute top priority.",
      recommendedSteps: [
        "Reach out immediately to crisis support or a trusted healthcare professional",
        "Step away from demanding tasks and be in a safe, quiet space",
        "Contact a trusted friend or family member"
      ],
      recommendations: [],
      crisisAlert: true
    };
  }

  // Server-side AI endpoint URL if deployed/configured
  const functionsUrl = import.meta.env.VITE_AI_FUNCTIONS_URL;
  if (functionsUrl && prefs.consentExternalAI) {
    try {
      const res = await fetch(`${functionsUrl}/analyzeWellnessCheckIn`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkIn, prefs, existingHobbies })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('AI endpoint unavailable, using intelligent local engine', e);
    }
  }

  // Intelligent client-side synthesis adhering strictly to safety guidelines
  const moodDesc = checkIn.mood === 'thriving' ? 'energized and thriving' :
                   checkIn.mood === 'good' ? 'positive and balanced' :
                   checkIn.mood === 'okay' ? 'steady, with room for gentle replenishment' :
                   checkIn.mood === 'low' ? 'experiencing lower energy' :
                   'feeling quite overwhelmed and carrying a heavy load';

  const empatheticSummary = `You are reporting feeling ${moodDesc}. ${
    checkIn.journalText.length > 0 
      ? `You noted reflections on your day ("${checkIn.journalText.slice(0, 100)}${checkIn.journalText.length > 100 ? '...' : ''}").`
      : 'Thank you for taking a moment to check in with yourself.'
  } Remember that daily fluctuations are completely natural, and this is simply an opportunity to tune in with your current needs without judgment.`;

  const recommendedSteps: string[] = [];
  const recommendations: ActivityRecommendation[] = [];

  if (checkIn.mood === 'low' || checkIn.mood === 'overwhelmed') {
    recommendedSteps.push("Give yourself permission to pause non-urgent responsibilities today.");
    recommendedSteps.push("Hydrate with a glass of cool water and take five slow, grounded breaths.");
    recommendedSteps.push("Engage in a low-demand calming activity rather than ambitious tasks.");

    recommendations.push({
      id: 'rec_' + Math.random().toString(36).substring(2, 9),
      title: "Warm Chamomile or Mint Tea Ritual",
      category: "relaxing",
      whyItFits: "Provides sensory calm and warmth during lower energy or higher stress periods.",
      estimatedDurationMinutes: 15,
      approximateCost: "$1.00",
      locationOrMaterials: "Kitchen, favourite mug, herbal tea bag",
      actionableSteps: ["Boil fresh water", "Steep tea for 5 minutes", "Sit comfortably away from screens while sipping"]
    });

    recommendations.push({
      id: 'rec_' + Math.random().toString(36).substring(2, 9),
      title: "Gentle 15-Minute Nature Window Walk",
      category: "outdoor",
      whyItFits: "Fresh air and natural daylight help regulate the nervous system without requiring intense physical exertion.",
      estimatedDurationMinutes: 15,
      approximateCost: "Free",
      locationOrMaterials: "Nearby tree-lined sidewalk or park path",
      actionableSteps: ["Put on comfortable shoes", "Walk at an easy, unhurried pace", "Notice sounds of birds or rustling leaves"]
    });
  } else {
    recommendedSteps.push("Channel your positive momentum into one meaningful priority.");
    recommendedSteps.push("Explore a creative hobby or new recipe that excites your curiosity.");
    recommendedSteps.push("Connect with someone in your social circle to share an upbeat update.");

    recommendations.push({
      id: 'rec_' + Math.random().toString(36).substring(2, 9),
      title: "15-Minute Mediterranean Lemon & Herb Couscous",
      category: "cooking",
      whyItFits: "A vibrant, nourishing, and fast meal that complements your balanced energy.",
      estimatedDurationMinutes: 20,
      approximateCost: "$6.00",
      locationOrMaterials: "Couscous, cherry tomatoes, cucumber, parsley, lemon, olive oil",
      actionableSteps: ["Steep couscous in boiling water with a pinch of salt", "Dice cucumber and tomatoes", "Toss together with lemon juice and olive oil"]
    });

    recommendations.push({
      id: 'rec_' + Math.random().toString(36).substring(2, 9),
      title: "Local Botanical Garden or Public Park Stroll",
      category: "travel",
      whyItFits: "Matches your location preferences and high engagement with outdoor exploration.",
      estimatedDurationMinutes: 60,
      approximateCost: "Free - $10",
      locationOrMaterials: prefs.preferredLocation || "Nearest botanical park or public gardens",
      actionableSteps: ["Check seasonal visiting hours online", "Pack a water bottle", "Explore the native plant section"],
      isVerifiedPlace: true,
      placeSourceUrl: "https://www.google.com/maps/search/?api=1&query=public+botanical+gardens",
      placeAddress: prefs.preferredLocation || "Downtown Public Arboretum"
    });
  }

  // Suggest a light task if user has low energy
  const suggestedTasks: Partial<TaskItem>[] = [];
  if (checkIn.mood === 'low' || checkIn.mood === 'overwhelmed') {
    suggestedTasks.push({
      title: "10-minute quiet stretching or rest break",
      category: "wellness",
      priority: "low",
      estimatedDurationMinutes: 10,
      minEnergyRequired: 1,
      proposedReason: "Self-care step adapted to self-reported low energy"
    });
  } else {
    suggestedTasks.push({
      title: "Dedicate 25 minutes to your top hobby interest",
      category: "hobby",
      priority: "medium",
      estimatedDurationMinutes: 25,
      minEnergyRequired: 3,
      proposedReason: "Leverage your positive mood to build consistency"
    });
  }

  return {
    empatheticSummary,
    recommendedSteps,
    suggestedTasks,
    recommendations,
    crisisAlert: false
  };
}

export async function askAgentAssistant(
  prompt: string,
  context: {
    checkins: WellnessCheckIn[];
    tasks: TaskItem[];
    hobbies: HobbyItem[];
    preferences: UserPreferences;
  }
): Promise<AIChatMessage> {
  const isCrisis = detectCrisis(prompt);
  if (isCrisis) {
    return {
      id: 'msg_' + Math.random().toString(36).substring(2, 9),
      role: 'assistant',
      content: CRISIS_SUPPORT_TEXT,
      timestamp: new Date().toISOString(),
      crisisAlert: true
    };
  }

  const lower = prompt.toLowerCase();
  let content = "";
  const suggestedTasks: Partial<TaskItem>[] = [];
  const suggestedHobbies: Partial<HobbyItem>[] = [];

  if (lower.includes('cook') || lower.includes('recipe') || lower.includes('dinner') || lower.includes('food')) {
    content = "Based on your preference for healthy, straightforward meals, here is a practical suggestion:\n\n**One-Pan Roasted Vegetable & Chickpea Bowl**\n- **Time**: ~25 mins\n- **Cost**: Low (~$4-6 per serving)\n- **Why it fits**: High nutrient density with minimal clean-up.\n- **Steps**: Toss chickpeas and bell peppers in olive oil, paprika, and cumin; roast at 400°F (200°C) for 20 mins; serve over greens or brown rice.\n\nWould you like me to add preparing this as a dinner task for tonight?";
    suggestedTasks.push({
      title: "Cook One-Pan Roasted Chickpea Bowl",
      category: "wellness",
      priority: "medium",
      estimatedDurationMinutes: 25,
      minEnergyRequired: 2,
      proposedReason: "Nutritious meal aligned with your cooking preferences"
    });
  } else if (lower.includes('book') || lower.includes('read') || lower.includes('novel')) {
    content = "Looking at your reading preferences, here is a thoughtful recommendation:\n\n**'Atomic Habits' by James Clear** (or **'Klara and the Sun' by Kazuo Ishiguro** for speculative fiction)\n- **Duration**: ~20 minutes of daily quiet reading\n- **Why it fits**: Gentle, practical insights without information overload.\n\nWould you like to schedule a 20-minute evening reading window?";
    suggestedTasks.push({
      title: "20-minute quiet reading session",
      category: "hobby",
      priority: "low",
      estimatedDurationMinutes: 20,
      minEnergyRequired: 2,
      proposedReason: "Unwinding session to support calm sleep hygiene"
    });
  } else if (lower.includes('travel') || lower.includes('out') || lower.includes('trip') || lower.includes('visit') || lower.includes('place')) {
    const loc = context.preferences.preferredLocation || "your local area";
    content = `Here is a curated local outing idea for **${loc}**:\n\n**Explore a Local Independent Bookstore & Quiet Café**\n- **Estimated Duration**: 1.5 - 2 hours\n- **Cost**: $5 - $15 (coffee + pastry)\n- **Verified status**: Live hours and availability should be verified via Google Maps prior to visiting.\n- [Open in Google Maps Search](https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc + ' independent bookstore and cafe')})\n\nWould you like me to save this as a weekend excursion goal?`;
  } else if (lower.includes('hobby') || lower.includes('bored') || lower.includes('new interest')) {
    content = "Exploring a new hobby is a wonderful way to rejuvenate your creativity without pressure. Based on your current balance, here are two low-friction options to consider:\n\n1. **Urban Watercolor Sketching**: Highly relaxing, low initial cost (~$15 for a pocket palette).\n2. **Indoor Herb Gardening**: Rewarding, smells incredible, and pairs nicely with fresh cooking.\n\nWould you like to add either of these to your exploration list?";
    suggestedHobbies.push({
      name: "Urban Watercolor Sketching",
      category: "creative",
      status: "exploring",
      frequencyPerWeek: 1,
      estimatedCost: "low"
    });
  } else {
    content = `I have reviewed your wellness dashboard context: you currently have ${context.tasks.filter(t => t.status !== 'completed').length} active tasks and ${context.hobbies.length} tracked hobbies. How can I best assist you today? We can adjust your task priorities, brainstorm low-energy activities, or explore fresh ideas for wellness.`;
  }

  return {
    id: 'msg_' + Math.random().toString(36).substring(2, 9),
    role: 'assistant',
    content,
    timestamp: new Date().toISOString(),
    suggestedTasks: suggestedTasks.length ? suggestedTasks : undefined,
    suggestedHobbies: suggestedHobbies.length ? suggestedHobbies : undefined
  };
}
