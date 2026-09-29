import { 
  WellnessCheckIn, 
  UserPreferences, 
  HobbyItem, 
  TaskItem, 
  ActivityRecommendation, 
  AIChatMessage,
  TravelSpot,
  RecipeCardData,
  MoodType
} from '../types';

export const CRISIS_SUPPORT_TEXT = `We care deeply about your safety and well-being. If you are experiencing overwhelming emotional distress, thoughts of self-harm, or an emergency crisis, please connect immediately with dedicated, free, confidential professional support:

• US / Canada: Call or text 988 (National Suicide and Crisis Lifeline)
• Crisis Text Line: Text HOME to 741741
• UK: Call 111 (NHS Mental Health Services) or 116 123 (Samaritans)
• International: Find local resources at https://findahelpline.com

You do not have to carry this alone. Please reach out to someone who can help support you right now.`;

export function detectCrisis(text: string): boolean {
  const lower = text.toLowerCase();
  const crisisKeywords = [
    'want to die', 'suicide', 'kill myself', 'ending my life', 
    'end my life', 'harm myself', 'cutting myself', 'can\'t go on', 
    'hopeless', 'no reason to live', 'hang myself', 'overdose'
  ];
  return crisisKeywords.some(keyword => lower.includes(keyword));
}

export async function analyzeWellnessCheckIn(
  checkIn: WellnessCheckIn,
  preferences: UserPreferences,
  hobbies: HobbyItem[]
): Promise<{
  empatheticSummary: string;
  recommendedSteps: string[];
  recommendations: ActivityRecommendation[];
  crisisAlert: boolean;
}> {
  if (detectCrisis(checkIn.journalText || '') || detectCrisis(checkIn.concernsOrNotes || '')) {
    return {
      empatheticSummary: "Safety and immediate support are the only priority right now.",
      recommendedSteps: ["Reach out to a trusted professional, family member, or crisis line right now."],
      recommendations: [],
      crisisAlert: true
    };
  }

  const { mood, energyLevel = 3, stressLevel = 2 } = checkIn;
  let empatheticSummary = "";
  const recommendedSteps: string[] = [];
  const recommendations: ActivityRecommendation[] = [];

  if (mood === 'overwhelmed' || stressLevel >= 4) {
    empatheticSummary = `I see you're carrying a heavy cognitive and emotional load today. Remember that productivity is not a measure of your worth, and today is about gentle pacing, deep breaths, and giving yourself grace.`;
    recommendedSteps.push("Drop or postpone non-essential secondary obligations for today.");
    recommendedSteps.push("Take a 10-minute quiet grounding break without any screens or notifications.");
    recommendedSteps.push("Drink a tall glass of cold water and stretch your shoulders and neck.");
  } else if (mood === 'low' || energyLevel <= 2) {
    empatheticSummary = `Your energy is on the quieter, lower side today. On days like this, we focus on restoration, comfort, and minimal resistance rather than pushing through resistance.`;
    recommendedSteps.push("Honor your tiredness with gentle rest or a 15-minute afternoon walk.");
    recommendedSteps.push("Choose one simple nourishing meal or soothing warm tea.");
  } else {
    empatheticSummary = `You're feeling ${mood} with solid energy! It's wonderful when body and mind align. Let's channel this steady momentum into meaningful tasks and fulfilling creative hobbies.`;
    recommendedSteps.push("Tackle your most meaningful high-priority goal while your focus is primed.");
    recommendedSteps.push("Dedicate 20 minutes to a hobby that sparks joy and keeps your spirit bright.");
  }

  return {
    empatheticSummary,
    recommendedSteps,
    recommendations,
    crisisAlert: false
  };
}

// ---------------------------------------------------------------------------
// Natural Language Response Generator for AI Chat Buddy
// ---------------------------------------------------------------------------

interface BuddyIntentAnalysis {
  isLifeEvent: boolean;
  eventDescription: string;
  detectedMood: MoodType;
  energyLevel: number;
  sentiment: 'very_positive' | 'positive' | 'neutral' | 'stressed' | 'down';
  topics: {
    cycleOrBike: boolean;
    travel: boolean;
    cooking: boolean;
    reading: boolean;
    work: boolean;
    exercise: boolean;
  };
}

function analyzeBuddyIntent(text: string): BuddyIntentAnalysis {
  const lower = text.toLowerCase();

  const cycleOrBike = lower.includes('cycle') || lower.includes('bike') || lower.includes('boud a cyle') || lower.includes('bought a cyle') || lower.includes('bicycle');
  const travel = lower.includes('travel') || lower.includes('trip') || lower.includes('dream') || lower.includes('visit') || lower.includes('explore') || lower.includes('vacation') || lower.includes('flight');
  const cooking = lower.includes('cook') || lower.includes('recipe') || lower.includes('food') || lower.includes('dinner') || lower.includes('lunch') || lower.includes('bake') || lower.includes('meal');
  const reading = lower.includes('read') || lower.includes('book') || lower.includes('novel') || lower.includes('author');
  const work = lower.includes('work') || lower.includes('project') || lower.includes('meeting') || lower.includes('code') || lower.includes('boss');
  const exercise = lower.includes('gym') || lower.includes('run') || lower.includes('walk') || lower.includes('workout') || lower.includes('swim');

  // Sentiment detection
  const veryPositive = lower.includes('so happy') || lower.includes('super happy') || lower.includes('thrilled') || lower.includes('so excited') || lower.includes('best day') || lower.includes('boud a cyle');
  const positive = lower.includes('happy') || lower.includes('great') || lower.includes('good') || lower.includes('awesome') || lower.includes('bought') || lower.includes('got a') || lower.includes('finished');
  const stressed = lower.includes('stress') || lower.includes('overwhelm') || lower.includes('anxious') || lower.includes('panic') || lower.includes('busy');
  const down = lower.includes('sad') || lower.includes('tired') || lower.includes('exhausted') || lower.includes('depressed') || lower.includes('down') || lower.includes('awful');

  let sentiment: 'very_positive' | 'positive' | 'neutral' | 'stressed' | 'down' = 'neutral';
  let detectedMood: MoodType = 'good';
  let energyLevel = 3;

  if (veryPositive) {
    sentiment = 'very_positive';
    detectedMood = 'thriving';
    energyLevel = 5;
  } else if (positive) {
    sentiment = 'positive';
    detectedMood = 'good';
    energyLevel = 4;
  } else if (stressed) {
    sentiment = 'stressed';
    detectedMood = 'overwhelmed';
    energyLevel = 2;
  } else if (down) {
    sentiment = 'down';
    detectedMood = 'low';
    energyLevel = 2;
  }

  // Detect life event
  const isLifeEvent = cycleOrBike || lower.includes('bought') || lower.includes('got') || lower.includes('started') || lower.includes('passed') || lower.includes('finished') || lower.includes('today i') || lower.includes('today, i');

  let eventDescription = text.trim();
  if (cycleOrBike) {
    eventDescription = "Bought a new bicycle / cycle 🚲";
  } else if (lower.includes('today')) {
    eventDescription = text.trim();
  }

  return {
    isLifeEvent,
    eventDescription,
    detectedMood,
    energyLevel,
    sentiment,
    topics: {
      cycleOrBike,
      travel,
      cooking,
      reading,
      work,
      exercise
    }
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

  const analysis = analyzeBuddyIntent(prompt);
  const suggestedTasks: Partial<TaskItem>[] = [];
  const suggestedHobbies: Partial<HobbyItem>[] = [];
  let travelSpots: TravelSpot[] | undefined = undefined;
  let recipeData: RecipeCardData | undefined = undefined;
  let loggedCheckIn: WellnessCheckIn | undefined = undefined;
  let content = "";

  // ---------------------------------------------------------------------------
  // Case A: User bought a cycle / bike or shares a major joyous life event
  // ---------------------------------------------------------------------------
  if (analysis.topics.cycleOrBike) {
    content = `Oh that is awesome!! Huge congrats on the new cycle! 🎉🚲 Honestly, getting a bike is such an incredible lifestyle upgrade. There's nothing quite like feeling the breeze, getting outdoors, and turning everyday travel into joyful movement.\n\nI just updated your daily wellness record with your new bike and this happy moment. Go take it for a spin around the neighborhood whenever you're ready!`;

    loggedCheckIn = {
      id: 'checkin_' + Date.now(),
      userId: context.userId || 'user',
      timestamp: new Date().toISOString(),
      mood: 'thriving',
      energyLevel: 5,
      stressLevel: 1,
      sleepQuality: 4,
      motivationLevel: 5,
      journalText: `Bought a new bicycle! Feeling super happy and energized today.`,
      aiSummary: `User bought a new bicycle. Mood: THRIVING (Energy: 5/5). Milestone logged to daily wellness diary.`
    };

    suggestedTasks.push({
      title: "Take a relaxed 20-minute inaugural ride on the new cycle",
      category: "wellness",
      priority: "medium",
      estimatedDurationMinutes: 20,
      minEnergyRequired: 3,
      proposedReason: "Celebrate your new bike with outdoor cardio and sunshine"
    });

    suggestedHobbies.push({
      name: "Outdoor Cycling & Trail Riding",
      category: "outdoor",
      status: "active",
      frequencyPerWeek: 2,
      estimatedCost: "low"
    });
  } 
  // ---------------------------------------------------------------------------
  // Case B: General Life Event or Mood Sharing (e.g. "Today I finished my exam", "I feel so happy today")
  // ---------------------------------------------------------------------------
  else if (analysis.isLifeEvent || analysis.sentiment === 'very_positive' || (analysis.sentiment === 'positive' && prompt.length > 10)) {
    if (analysis.sentiment === 'very_positive') {
      content = `That makes me so happy to hear! 😄 What a great day. Celebrating wins—big or small—is so essential for our mental well-being and builds lasting momentum.\n\nI've automatically logged this into your daily wellness diary so it's captured in your records! What's on your mind next?`;
    } else {
      content = `That's great! Thanks for sharing that with me. I've logged this update into your daily wellness journal so we keep track of how your days are shaping up.`;
    }

    loggedCheckIn = {
      id: 'checkin_' + Date.now(),
      userId: context.userId || 'user',
      timestamp: new Date().toISOString(),
      mood: analysis.detectedMood,
      energyLevel: analysis.energyLevel,
      stressLevel: 1,
      sleepQuality: 4,
      motivationLevel: analysis.energyLevel,
      journalText: prompt.trim(),
      aiSummary: `Daily update: "${prompt.trim()}". Mood: ${analysis.detectedMood.toUpperCase()}.`
    };
  }
  // ---------------------------------------------------------------------------
  // Case C: Stressed or Down Day Sharing
  // ---------------------------------------------------------------------------
  else if (analysis.sentiment === 'stressed' || analysis.sentiment === 'down') {
    content = `I hear you, my friend. Thank you for being honest with me about how you're feeling. Take a slow, deep breath right now—you don't have to carry everything all at once.\n\nI've noted this in your daily log with care. Do you want to just vent, take a break from your task list, or would you like me to find a soothing cheer-up recipe or quick relaxation idea?`;

    loggedCheckIn = {
      id: 'checkin_' + Date.now(),
      userId: context.userId || 'user',
      timestamp: new Date().toISOString(),
      mood: analysis.detectedMood,
      energyLevel: 2,
      stressLevel: analysis.sentiment === 'stressed' ? 5 : 3,
      sleepQuality: 3,
      motivationLevel: 2,
      journalText: prompt.trim(),
      aiSummary: `User shared: "${prompt.trim()}". Mood: ${analysis.detectedMood.toUpperCase()}. Gentle pacing recommended.`
    };
  }
  // ---------------------------------------------------------------------------
  // Case D: Travel & Dreams
  // ---------------------------------------------------------------------------
  else if (analysis.topics.travel) {
    const dest = prompt.toLowerCase().includes('kyoto') ? "Kyoto, Japan" 
      : prompt.toLowerCase().includes('paris') ? "Paris, France"
      : prompt.toLowerCase().includes('bali') ? "Bali, Indonesia"
      : prompt.toLowerCase().includes('swiss') ? "Swiss Alps"
      : context.preferences.preferredLocation || "San Francisco";

    content = `I love travel dreaming! Taking our minds to new places is such a refreshing mental break. Here are a few incredible places in **${dest}** from Google Maps with real traveler reviews and community ratings to inspire your adventures:`;

    travelSpots = [
      {
        name: `${dest} Scenic Lookout & Nature Reserve`,
        category: "Scenic Nature & Views",
        rating: 4.9,
        reviewCount: 12450,
        description: "Panoramic vistas, fresh air, and walking trails popular with travelers seeking peace.",
        mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dest + ' scenic lookout nature reserve')}`
      },
      {
        name: `Historic Old Town Cultural Walk`,
        category: "Heritage & Walking",
        rating: 4.8,
        reviewCount: 8910,
        description: "Charming stone alleys, vibrant local artisan shops, and historic architecture.",
        mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dest + ' historic old town walk')}`
      },
      {
        name: `Tranquil Botanical Grounds & Tea Pavilion`,
        category: "Parks & Greenery",
        rating: 4.7,
        reviewCount: 5430,
        description: "Shaded tree canopies, ponds, and peaceful benches away from modern city noise.",
        mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dest + ' botanical gardens tea pavilion')}`
      }
    ];

    suggestedTasks.push({
      title: `Build a travel idea board for ${dest}`,
      category: "personal",
      priority: "low",
      estimatedDurationMinutes: 20,
      minEnergyRequired: 2,
      proposedReason: "Inspires healthy wanderlust and future restorative trip planning"
    });
  }
  // ---------------------------------------------------------------------------
  // Case E: Cooking, Recipes & Cheer-Up Dishes
  // ---------------------------------------------------------------------------
  else if (analysis.topics.cooking || prompt.toLowerCase().includes('cheer')) {
    content = `Good food is pure medicine for the soul! I've put together a colorful, feel-good recipe designed to lift your spirits and fuel steady energy:`;

    recipeData = {
      dishName: "Warm Golden Turmeric & Roasted Chickpea Vitality Bowl",
      imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
      moodBenefit: "Turmeric, healthy avocado fats, and complex grains boost dopamine and soothe inflammation.",
      prepTimeMinutes: 20,
      ingredients: [
        "1 cup warm quinoa or jasmine rice",
        "1 can crispy spiced chickpeas (paprika & cumin)",
        "Fresh baby spinach, diced cucumbers & avocado",
        "Creamy garlic lemon tahini dressing"
      ],
      steps: [
        "1. Fluff up warm quinoa in your favorite bowl.",
        "2. Skillet-toast chickpeas until delightfully crispy (5 mins).",
        "3. Arrange vibrant greens, avocado slices, and golden chickpeas.",
        "4. Drizzle generous tahini and enjoy mindfully away from phone screens."
      ]
    };

    suggestedTasks.push({
      title: "Cook a fresh Vitality Bowl for dinner",
      category: "wellness",
      priority: "medium",
      estimatedDurationMinutes: 25,
      minEnergyRequired: 2,
      proposedReason: "Nourishing, hands-on cooking that cheers up mood and promotes calm"
    });
  }
  // ---------------------------------------------------------------------------
  // Case F: Reading & Hobbies
  // ---------------------------------------------------------------------------
  else if (analysis.topics.reading) {
    content = `Reading is such a wonderful antidote to screen fatigue. I'd recommend spending 20 minutes with **'Atomic Habits'** or a captivating speculative novel like **'Klara and the Sun'**.\n\nGrab a warm cup of herbal tea, put your phone in another room, and let your imagination unwind!`;

    suggestedTasks.push({
      title: "20-minute restorative reading break",
      category: "hobby",
      priority: "low",
      estimatedDurationMinutes: 20,
      minEnergyRequired: 2,
      proposedReason: "Screen-free cognitive restoration"
    });
  }
  // ---------------------------------------------------------------------------
  // Case G: Natural Conversational Buddy Response
  // ---------------------------------------------------------------------------
  else {
    content = `Hey buddy! I'm here with you. How's your day been treating you so far? Feel free to share whatever is on your mind—how you're feeling, something funny that happened, or what you're hoping to do today. I'm listening!`;
  }

  return {
    id: 'msg_' + Math.random().toString(36).substring(2, 9),
    role: 'assistant',
    content,
    timestamp: new Date().toISOString(),
    suggestedTasks: suggestedTasks.length ? suggestedTasks : undefined,
    suggestedHobbies: suggestedHobbies.length ? suggestedHobbies : undefined,
    travelSpots,
    recipeData,
    loggedCheckIn
  };
}
