/**
 * Clean Architecture - Domain Layer
 * Core Business Entities & Models
 */

export type MoodType = 'thriving' | 'good' | 'okay' | 'low' | 'overwhelmed';
export type MoodLevel = MoodType;

export interface WellnessCheckIn {
  id: string;
  userId: string;
  timestamp: string; // ISO string
  mood: MoodType;
  stressLevel?: number; // 1-5
  energyLevel?: number; // 1-5
  motivationLevel?: number; // 1-5
  sleepQuality?: number; // 1-5
  journalText: string;
  concernsOrNotes?: string;
  aiSummary?: string;
  extractedKeywords?: string[];
  source?: 'chat' | 'checkin_form' | 'dashboard_quick';
}

export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskCategory = 'wellness' | 'hobby' | 'work' | 'personal' | 'health';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'postponed';

export interface TaskItem {
  id: string;
  userId: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  category: TaskCategory;
  status: TaskStatus;
  dueDate?: string;
  estimatedDurationMinutes: number;
  minEnergyRequired?: number; // 1-5
  isAIGenerated?: boolean;
  proposedReason?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  milestones?: { title: string; completed: boolean }[];
}

export type HobbyStatus = 'active' | 'paused' | 'exploring';
export type HobbyCategory = 'creative' | 'physical' | 'social' | 'relaxing' | 'outdoor' | 'culinary' | 'intellectual';

export interface HobbyItem {
  id: string;
  userId: string;
  name: string;
  category: HobbyCategory;
  status: HobbyStatus;
  description?: string;
  frequencyPerWeek: number;
  estimatedCost: 'free' | 'low' | 'medium' | 'high';
  costEstimate?: 'free' | 'low' | 'medium' | 'high';
  personalFeedback?: string;
  startedAt: string;
  lastParticipatedAt?: string;
  isWishlist?: boolean;
  streakCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ActivityRecommendation {
  id: string;
  title: string;
  category: 'cooking' | 'reading' | 'travel' | 'outdoor' | 'creative' | 'social' | 'relaxing';
  whyItFits: string;
  estimatedDurationMinutes: number;
  approximateCost: string;
  locationOrMaterials: string;
  actionableSteps: string[];
  isVerifiedPlace?: boolean;
  placeSourceUrl?: string;
  placeAddress?: string;
  userFeedback?: 'tried_loved' | 'saved' | 'dismissed';
}

export type AppTheme = 'light' | 'ember' | 'brutalist';

export interface UserPreferences {
  userId: string;
  preferredLocation?: string;
  budgetLevel: 'budget' | 'moderate' | 'flexible';
  typicalAvailableTimeMinutes: number;
  dietaryOrCookingPreferences?: string;
  readingPreferences?: string;
  travelPreferences?: string;
  consentExternalAI: boolean;
  enableCrisisAssistance: boolean;
  theme: 'google-light' | 'google-calm' | 'light' | 'ember' | 'brutalist';
  updatedAt: string;
}

export interface TravelSpot {
  name: string;
  rating: number; // e.g. 4.8
  reviewCount: number;
  description: string;
  mapsUrl: string;
  category: string;
}

export interface RecipeCardData {
  dishName: string;
  imageUrl: string;
  moodBenefit: string;
  prepTimeMinutes: number;
  ingredients: string[];
  steps: string[];
}

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  suggestedTasks?: Partial<TaskItem>[];
  suggestedHobbies?: Partial<HobbyItem>[];
  travelSpots?: TravelSpot[];
  recipeData?: RecipeCardData;
  loggedCheckIn?: WellnessCheckIn;
  crisisAlert?: boolean;
}
