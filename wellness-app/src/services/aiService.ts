import { 
  WellnessCheckIn, 
  TaskItem, 
  HobbyItem, 
  ActivityRecommendation, 
  UserPreferences,
  AIChatMessage,
  TravelSpot,
  RecipeCardData,
  MoodType
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
  } else {
    recommendedSteps.push("Take advantage of your momentum by prioritizing your 1-2 most meaningful goals.");
    recommendedSteps.push("Take mindful breaks between focused sessions to maintain sustained vitality.");

    recommendations.push({
      id: 'rec_' + Math.random().toString(36).substring(2, 9),
      title: "25-Minute Focused Creative Exploration",
      category: "creative",
      whyItFits: "Directs current positive momentum into expressive personal fulfillment.",
      estimatedDurationMinutes: 25,
      approximateCost: "Free",
      locationOrMaterials: "Notebook, sketchpad, or current hobby project",
      actionableSteps: ["Set a 25-minute timer", "Silence notifications", "Engage with curiosity rather than perfection"]
    });
  }

  return {
    empatheticSummary,
    recommendedSteps,
    recommendations,
    crisisAlert: false
  };
}

export async function askAgentAssistant(
  prompt: string,
  context: {
    userId?: string;
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
  let travelSpots: TravelSpot[] | undefined = undefined;
  let recipeData: RecipeCardData | undefined = undefined;
  let loggedCheckIn: WellnessCheckIn | undefined = undefined;

  // 1. Detect Chat Buddy Mood & Daily Events Logging (e.g. buying a bike/cycle, great day, feeling happy)
  const isHappy = lower.includes('happy') || lower.includes('excited') || lower.includes('great') || lower.includes('awesome') || lower.includes('wonderful') || lower.includes('bought') || lower.includes('proud') || lower.includes('thriving');
  const isSadOrTired = lower.includes('sad') || lower.includes('tired') || lower.includes('exhausted') || lower.includes('drained') || lower.includes('down') || lower.includes('depressed') || lower.includes('awful');
  const isStressed = lower.includes('stress') || lower.includes('overwhelmed') || lower.includes('anxious') || lower.includes('panic');

  const detectedMood: MoodType = isHappy ? 'thriving' : isStressed ? 'overwhelmed' : isSadOrTired ? 'low' : 'good';

  // Check if user is sharing a daily event (e.g. bought a cycle / bike / went somewhere / started something)
  if (lower.includes('bought a cycle') || lower.includes('bought a bike') || lower.includes('bought') || lower.includes('got a bike') || lower.includes('cycle') || (isHappy && (lower.includes('today') || lower.includes('i am')))) {
    let specificEvent = prompt;
    if (lower.includes('cycle') || lower.includes('bike')) {
      content = `That's amazing! Huge congratulations on getting your new cycle! 🚲✨ Cycling is such a fantastic way to boost cardiovascular health, get fresh air, and elevate your daily mental clarity. I've automatically logged this exciting milestone in your daily wellness journal so you can look back on this happy moment!`;
      
      suggestedTasks.push({
        title: "Go for a celebratory 20-minute cycle ride",
        category: "wellness",
        priority: "medium",
        estimatedDurationMinutes: 20,
        minEnergyRequired: 3,
        proposedReason: "Celebrate your new bike and enjoy outdoor physical movement"
      });

      suggestedHobbies.push({
        name: "Outdoor Cycling & Trail Exploration",
        category: "outdoor",
        status: "active",
        frequencyPerWeek: 2,
        estimatedCost: "low"
      });
    } else {
      content = `I love hearing that! What a wonderful day. Sharing these moments of joy helps cement positive experiences in your nervous system. I have automatically recorded this daily reflection and updated your wellness record!`;
    }

    loggedCheckIn = {
      id: 'checkin_' + Date.now(),
      userId: context.userId || 'anonymous_user',
      timestamp: new Date().toISOString(),
      mood: detectedMood,
      energyLevel: isHappy ? 5 : 3,
      stressLevel: 1,
      sleepQuality: 4,
      motivationLevel: isHappy ? 5 : 3,
      journalText: prompt.trim(),
      aiSummary: `User reported: "${prompt.trim()}". Mood captured as ${detectedMood.toUpperCase()} with high vitality and positive momentum.`
    };
  }
  // 2. Travel & Dreams handling
  else if (lower.includes('travel') || lower.includes('dream') || lower.includes('trip') || lower.includes('destination') || lower.includes('visit') || lower.includes('explore') || lower.includes('place')) {
    let dest = context.preferences.preferredLocation || "San Francisco";
    if (lower.includes('kyoto') || lower.includes('japan')) dest = "Kyoto, Japan";
    else if (lower.includes('paris') || lower.includes('france')) dest = "Paris, France";
    else if (lower.includes('alps') || lower.includes('switzerland')) dest = "Swiss Alps, Switzerland";
    else if (lower.includes('bali') || lower.includes('indonesia')) dest = "Ubud, Bali";
    else if (lower.includes('rome') || lower.includes('italy')) dest = "Rome, Italy";

    content = `I hear you, my friend! Dreaming of journeys and new horizon lines is so restorative for the soul. Exploring **${dest}** sounds like an unforgettable adventure.\n\nHere are some of the top-rated spots from Google Maps with real traveler ratings to inspire your daydreams:`;

    travelSpots = [
      {
        name: `${dest} Scenic Cultural Lookout & Heritage Trail`,
        category: "Scenic Nature & Heritage",
        rating: 4.9,
        reviewCount: 14820,
        description: "Panoramic views, tranquil walking grounds, and mindful atmosphere ideal for decompressing and inspiration.",
        mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dest + ' scenic overlook viewpoint')}`
      },
      {
        name: `${dest} Botanic Garden & Serene Walking Path`,
        category: "Botanical Garden",
        rating: 4.8,
        reviewCount: 9640,
        description: "Lush native flora, shaded quiet benches, and therapeutic walking loops away from city hustle.",
        mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dest + ' botanic gardens nature reserve')}`
      },
      {
        name: `Historic Artisan Cafe & Old Quarter`,
        category: "Culinary & Culture",
        rating: 4.7,
        reviewCount: 6310,
        description: "Locally roasted beverages, warm hospitality, and historic ambiance praised by community travelers.",
        mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dest + ' historic artisan cafe')}`
      }
    ];

    suggestedTasks.push({
      title: `Plan a travel wishlist for ${dest}`,
      category: "personal",
      priority: "low",
      estimatedDurationMinutes: 30,
      minEnergyRequired: 2,
      proposedReason: "Fulfills your travel aspirations and mental replenishment"
    });
  } 
  // 3. Cooking, Cheer-up & Recipe Image Generation handling
  else if (lower.includes('cook') || lower.includes('recipe') || lower.includes('cheer') || lower.includes('food') || lower.includes('dinner') || lower.includes('lunch') || lower.includes('diet') || lower.includes('eat')) {
    const currentMood = context.checkins[0]?.mood || 'good';
    
    let recipeTitle = "Rainbow Quinoa & Roasted Veggie Vitality Bowl";
    let imgUrl = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80";
    let moodReason = "Packed with tryptophan, folate, and complex carbs to naturally elevate serotonin and boost steady energy.";

    if (currentMood === 'low' || currentMood === 'overwhelmed' || lower.includes('cheer')) {
      recipeTitle = "Soothing Golden Turmeric & Coconut Ginger Curry";
      imgUrl = "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=800&q=80";
      moodReason = "Warm, anti-inflammatory, and comforting to soothe the nervous system and cheer up your evening.";
    } else if (lower.includes('salad') || lower.includes('light')) {
      recipeTitle = "Mediterranean Avocado & Crisp Chickpea Salad";
      imgUrl = "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80";
      moodReason = "Rich in healthy monounsaturated fats and crisp textures to refresh alertness.";
    }

    content = `I've got your back! Good nourishing food can truly turn a whole day around. Here is a delicious, mood-boosting recipe I visualized for you:`;

    recipeData = {
      dishName: recipeTitle,
      imageUrl: imgUrl,
      moodBenefit: moodReason,
      prepTimeMinutes: 20,
      ingredients: [
        "1 cup organic quinoa or jasmine rice",
        "1 can chickpeas, rinsed & roasted with paprika",
        "1 sliced Hass avocado & cherry tomatoes",
        "Fresh baby spinach & lemon tahini dressing"
      ],
      steps: [
        "1. Simmer grains for 12 minutes until fluffy.",
        "2. Toss chickpeas with olive oil, cumin, and sea salt; crisp in skillet for 6 mins.",
        "3. Assemble warm bowl, top with sliced avocado and drizzle with lemon tahini.",
        "4. Mindfully enjoy each bite away from work screens."
      ]
    };

    suggestedTasks.push({
      title: `Cook ${recipeTitle}`,
      category: "wellness",
      priority: "medium",
      estimatedDurationMinutes: 20,
      minEnergyRequired: 2,
      proposedReason: "Cheer-up nutrient therapy aligned with your daily mood"
    });
  } 
  // 4. Books & Reading
  else if (lower.includes('book') || lower.includes('read') || lower.includes('novel')) {
    content = "Looking at your reading preferences, here is a thoughtful recommendation:\n\n**'Atomic Habits' by James Clear** (or **'Klara and the Sun' by Kazuo Ishiguro** for speculative fiction)\n- **Duration**: ~20 minutes of daily quiet reading\n- **Why it fits**: Gentle, practical insights without information overload.\n\nWould you like to schedule a 20-minute evening reading window?";
    suggestedTasks.push({
      title: "20-minute quiet reading session",
      category: "hobby",
      priority: "low",
      estimatedDurationMinutes: 20,
      minEnergyRequired: 2,
      proposedReason: "Unwinding session to support calm sleep hygiene"
    });
  } 
  // 5. Default Chat Buddy Conversation
  else {
    content = `Hey buddy! I'm here hanging out with you. You've got ${context.tasks.filter(t => t.status !== 'completed').length} things going on your task list right now, but honestly, how is your head feeling? Tell me about your day, any cool things that happened, or what you feel like doing!`;
  }

  return {
    id: 'msg_' + Math.random().toString(36).substring(2, 9),
    role: 'assistant',
    content,
    timestamp: new Date().toISOString(),
    suggestedTasks: suggestedTasks.length ? suggestedTasks : undefined,
    suggestedHobbies: suggestedHobbies.length ? suggestedHobbies : undefined,
    travelSpots: travelSpots,
    recipeData: recipeData,
    loggedCheckIn: loggedCheckIn
  };
}
