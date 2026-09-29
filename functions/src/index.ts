import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { VertexAI } from '@google-cloud/vertexai';

admin.initializeApp();

const PROJECT_ID = process.env.GCLOUD_PROJECT || 'qwiklabs-gcp-03-478f309b432f';
const LOCATION = 'global';

// Initialize Vertex AI with Vertex Gemini 3.6 Flash
const vertexAI = new VertexAI({ project: PROJECT_ID, location: LOCATION });
const generativeModel = vertexAI.getGenerativeModel({
  model: 'gemini-3.6-flash',
  generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 1024,
  }
});

const CRISIS_KEYWORDS = [
  'kill myself', 'suicide', 'end my life', 'want to die', 'harm myself',
  'cutting myself', 'can\'t go on living', 'better off dead'
];

export const analyzeWellnessCheckIn = functions.https.onRequest(async (req, res) => {
  // CORS configuration
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { checkIn, prefs, existingHobbies } = req.body;
    if (!checkIn) {
      res.status(400).json({ error: 'Missing checkIn payload' });
      return;
    }

    const journalContent = (checkIn.journalText || '') + ' ' + (checkIn.concernsOrNotes || '');
    const isCrisis = CRISIS_KEYWORDS.some(kw => journalContent.toLowerCase().includes(kw));

    if (isCrisis) {
      res.json({
        crisisAlert: true,
        empatheticSummary: "I hear how much distress you are feeling right now. Your well-being and safety are the absolute top priority.",
        recommendedSteps: [
          "Reach out immediately to crisis support or a trusted healthcare professional",
          "Step away from demanding tasks and be in a safe, quiet space",
          "Contact a trusted friend or family member"
        ],
        recommendations: []
      });
      return;
    }

    const prompt = `
You are an empathetic, calm, and objective AI personal wellness and lifestyle support assistant.
User reported:
- Mood: ${checkIn.mood}
- Energy Level: ${checkIn.energyLevel || 3}/5
- Perceived Stress: ${checkIn.stressLevel || 2}/5
- Sleep Quality: ${checkIn.sleepQuality || 4}/5
- Journal Entry: "${checkIn.journalText || 'None'}"
- Location: ${prefs?.preferredLocation || 'Local community'}
- Budget Level: ${prefs?.budgetLevel || 'moderate'}

Requirements:
1. Provide a neutral, empathetic 2-3 sentence summary acknowledging their state without making any psychological diagnoses or clinical judgments.
2. Suggest 2-3 realistic, gentle next steps appropriate for their current self-reported energy.
3. Suggest 2 tailored activity recommendations (e.g. cooking, quiet reading, outdoor stroll, or relaxing hobby).
Return strictly valid JSON with keys:
"empatheticSummary": string,
"recommendedSteps": string[],
"recommendations": [
  {
    "id": string,
    "title": string,
    "category": "cooking" | "reading" | "travel" | "outdoor" | "creative" | "relaxing",
    "whyItFits": string,
    "estimatedDurationMinutes": number,
    "approximateCost": string,
    "locationOrMaterials": string,
    "actionableSteps": string[]
  }
]
`;

    const response = await generativeModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });

    const responseText = response.response.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    try {
      const parsed = JSON.parse(cleanJson);
      res.json({ ...parsed, crisisAlert: false });
    } catch {
      // Fallback response if model formatting differs
      res.json({
        empatheticSummary: `You reported feeling ${checkIn.mood} today. Taking time to note your state is an important step in personal balance.`,
        recommendedSteps: [
          "Focus on gentle hydration and restorative pacing",
          "Prioritize 15 minutes of quiet rest before undertaking high-energy tasks"
        ],
        recommendations: [],
        crisisAlert: false
      });
    }
  } catch (err: any) {
    console.error('Vertex AI invocation failed:', err);
    res.status(500).json({ error: 'Internal server error', details: err?.message });
  }
});
