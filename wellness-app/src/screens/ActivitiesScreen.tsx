import React, { useState } from 'react';
import { 
  HobbyItem, 
  HobbyCategory, 
  HobbyStatus, 
  UserPreferences, 
  ActivityRecommendation, 
  TaskItem 
} from '../types';
import { 
  Sparkles, 
  Compass, 
  Plus, 
  Pause, 
  Play, 
  Trash2, 
  Tag, 
  TrendingUp, 
  Heart, 
  MapPin, 
  BookOpen, 
  Utensils, 
  Trees, 
  Palette, 
  Check, 
  ExternalLink, 
  SlidersHorizontal,
  Clock,
  ArrowRight
} from 'lucide-react';
import { playCompanionBoop, playTaskSuccess } from '../services/soundEffects';

interface ActivitiesScreenProps {
  userId: string;
  hobbies: HobbyItem[];
  preferences: UserPreferences;
  recommendations?: ActivityRecommendation[];
  onSaveHobby: (hobby: HobbyItem) => Promise<void>;
  onDeleteHobby: (hobbyId: string) => Promise<void>;
  onSaveAsTask: (rec: ActivityRecommendation) => Promise<void>;
  onSaveFeedback?: (recId: string, feedback: 'tried_loved' | 'dismissed') => void;
  initialTab?: 'my_hobbies' | 'explore';
}

export const ActivitiesScreen: React.FC<ActivitiesScreenProps> = ({
  userId,
  hobbies,
  preferences,
  recommendations: initialRecommendations = [],
  onSaveHobby,
  onDeleteHobby,
  onSaveAsTask,
  onSaveFeedback,
  initialTab = 'my_hobbies'
}) => {
  const [activeTab, setActiveTab] = useState<'my_hobbies' | 'explore'>(initialTab);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // New hobby form states
  const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<HobbyCategory>('creative');
  const [frequency, setFrequency] = useState<number>(2);
  const [cost, setCost] = useState<'free' | 'low' | 'medium' | 'high'>('low');
  const [description, setDescription] = useState<string>('');
  const [status, setStatus] = useState<HobbyStatus>('active');

  // Discover / Explore filter states
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [maxDuration, setMaxDuration] = useState<number>(120);
  const [savedTaskIds, setSavedTaskIds] = useState<Set<string>>(new Set());

  // Default recommendations catalog if none passed
  const defaultCatalog: ActivityRecommendation[] = [
    {
      id: 'rec_cooking_1',
      title: 'Pan-Seared Salmon with Crispy Asparagus & Lemon Herb Glaze',
      category: 'cooking',
      whyItFits: 'Healthy omega-3 rich dinner, quick 20-minute prep, highly rewarding for culinary unwinding.',
      estimatedDurationMinutes: 25,
      approximateCost: '$12 - $15',
      locationOrMaterials: 'Fresh salmon fillets, asparagus spears, garlic, lemon, butter or olive oil',
      actionableSteps: [
        'Pat salmon fillets dry and season with sea salt and cracked pepper',
        'Sear in hot pan skin-side down for 4 minutes until golden and crisp',
        'Add trimmed asparagus to the pan with crushed garlic and lemon zest for 3 minutes'
      ]
    },
    {
      id: 'rec_reading_1',
      title: "Mindfulness Chapter Reading: 'Wherever You Go, There You Are'",
      category: 'reading',
      whyItFits: 'Grounded reflections on non-striving, calming the mind after an intense workday.',
      estimatedDurationMinutes: 20,
      approximateCost: 'Free / Library Book',
      locationOrMaterials: 'Paperback book or quiet reading app with dim warm lighting',
      actionableSteps: [
        'Silence notifications and brew a cup of chamomile or green tea',
        'Read chapter 14 on cultivating beginner’s mind for 15 minutes',
        'Jot down 1 memorable reflection in your wellness journal'
      ]
    },
    {
      id: 'rec_nature_1',
      title: 'Golden Gate Park Conservatory Flowers & Dahlia Garden Walk',
      category: 'nature',
      whyItFits: 'Gentle biophilic immersion with vibrant flowers to reduce mental fatigue and screen strain.',
      estimatedDurationMinutes: 45,
      approximateCost: 'Free Outdoor Access',
      locationOrMaterials: '100 John F Kennedy Dr, San Francisco, CA 94118',
      actionableSteps: [
        'Park near Conservatory Drive East or take transit to 6th Ave entrance',
        'Stroll the winding exterior dahlia garden paths at a relaxed unhurried pace',
        'Spend 5 minutes quietly observing the seasonal blooms without checking your phone'
      ]
    },
    {
      id: 'rec_arts_1',
      title: 'De Young Fine Arts Museum Sculpture Garden & Panoramic Tower',
      category: 'arts',
      whyItFits: 'Inspiring architecture, contemplative outdoor sculptures, and free public panoramic city views.',
      estimatedDurationMinutes: 60,
      approximateCost: 'Free Access to Public Sculpture Grounds',
      locationOrMaterials: '50 Hagiwara Tea Garden Dr, San Francisco, CA 94118',
      actionableSteps: [
        'Explore the outdoor Barbro Osher Sculpture Garden and Andy Goldsworthy installation',
        'Ride the elevator to the 9th-floor Hamon Observation Tower for 360-degree views',
        'Sit on the garden benches to let your imagination wander'
      ]
    },
    {
      id: 'rec_coffee_1',
      title: 'Sightglass Coffee Quiet Porch Roastery & Chemex Brew',
      category: 'nature',
      whyItFits: 'Spacious industrial aesthetic with artisan roasts, ideal for quiet midday reflection.',
      estimatedDurationMinutes: 30,
      approximateCost: '$5 - $8',
      locationOrMaterials: '270 7th St, San Francisco, CA 94103',
      actionableSteps: [
        'Order an Ethiopian single-origin pour-over or matcha latte',
        'Take a seat on the second-story mezzanine looking down at the vintage roaster',
        'Unplug for 20 minutes to savor each sip'
      ]
    }
  ];

  const recommendations = initialRecommendations && initialRecommendations.length > 0 
    ? initialRecommendations 
    : defaultCatalog;

  const filteredRecommendations = recommendations.filter((rec) => {
    const matchesCategory = selectedCategory === 'all' || rec.category === selectedCategory;
    const matchesDuration = rec.estimatedDurationMinutes <= maxDuration;
    return matchesCategory && matchesDuration;
  });

  const handleCreateHobby = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newHobby: HobbyItem = {
      id: 'hobby_' + Date.now(),
      userId,
      name: name.trim(),
      category,
      frequencyPerWeek: frequency,
      costEstimate: cost,
      description: description.trim(),
      status,
      streakCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    playTaskSuccess();
    await onSaveHobby(newHobby);
    setIsModalOpen(false);
    setName('');
    setDescription('');
  };

  const handleToggleHobbyStatus = async (hobby: HobbyItem) => {
    playCompanionBoop();
    const nextStatus: HobbyStatus = hobby.status === 'active' ? 'paused' : 'active';
    await onSaveHobby({
      ...hobby,
      status: nextStatus,
      updatedAt: new Date().toISOString()
    });
  };

  const handleAddRecAsTask = async (rec: ActivityRecommendation) => {
    playTaskSuccess();
    setSavedTaskIds(prev => new Set(prev).add(rec.id));
    await onSaveAsTask(rec);
  };

  const handleAdoptAsHobby = async (rec: ActivityRecommendation) => {
    playTaskSuccess();
    const hobbyCategory: HobbyCategory = 
      rec.category === 'cooking' ? 'culinary' :
      rec.category === 'reading' ? 'intellectual' :
      rec.category === 'arts' ? 'creative' : 'outdoor';

    const newHobby: HobbyItem = {
      id: 'hobby_' + Date.now(),
      userId,
      name: rec.title,
      category: hobbyCategory,
      frequencyPerWeek: 2,
      costEstimate: 'low',
      description: rec.whyItFits,
      status: 'active',
      streakCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await onSaveHobby(newHobby);
    setActiveTab('my_hobbies');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-sky-50/50 border border-emerald-100/80 rounded-2xl shadow-xs">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
          Activities & <span className="text-emerald-700">Restorative Care</span>
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Nurture mindful habits, explore restorative outings, and give yourself space to recharge.
        </p>

        {/* Unified Sub-Tabs Navigation */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-emerald-100/80">
          <button
            onClick={() => {
              playCompanionBoop();
              setActiveTab('my_hobbies');
            }}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center space-x-1.5 ${
              activeTab === 'my_hobbies'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white/80 text-slate-700 hover:bg-white border border-slate-200/80'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>My Hobbies & Habits ({hobbies.length})</span>
          </button>

          <button
            onClick={() => {
              playCompanionBoop();
              setActiveTab('explore');
            }}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center space-x-1.5 ${
              activeTab === 'explore'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white/80 text-slate-700 hover:bg-white border border-slate-200/80'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Explore Ideas & Outings</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: MY HOBBIES & HABITS                                               */}
      {/* ========================================================================= */}
      {activeTab === 'my_hobbies' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Tracked Hobbies & Rest</h2>
              <p className="text-xs text-slate-500">Non-work activities that restore your energy.</p>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="brutalist-btn-primary flex items-center space-x-1.5 text-xs py-2 px-4 rounded-xl"
            >
              <Plus className="w-4 h-4" />
              <span>Add Custom Hobby</span>
            </button>
          </div>

          {hobbies.length === 0 ? (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-8 text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">No Hobbies Tracked Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Add an activity you love, or browse our curated ideas to find a low-pressure way to recharge.
              </p>
              <div className="flex justify-center gap-2 pt-2">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="brutalist-btn-primary text-xs py-2 px-4 rounded-xl"
                >
                  Create Custom Hobby
                </button>
                <button
                  onClick={() => setActiveTab('explore')}
                  className="brutalist-btn-outlined text-xs py-2 px-4 rounded-xl"
                >
                  Explore Ideas →
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {hobbies.map((hobby) => {
                const isActive = hobby.status === 'active';
                return (
                  <div
                    key={hobby.id}
                    className={`bg-white border rounded-2xl p-5 shadow-xs transition-all space-y-3 ${
                      isActive ? 'border-slate-200/80 hover:shadow-sm' : 'border-slate-200/50 opacity-75'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                          {hobby.category}
                        </span>
                        <h3 className="text-base font-bold text-slate-900 mt-1">{hobby.name}</h3>
                      </div>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {isActive ? 'Active' : 'Paused'}
                      </span>
                    </div>

                    {hobby.description && (
                      <p className="text-xs text-slate-600 leading-relaxed">{hobby.description}</p>
                    )}

                    <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                      <span>Target: {hobby.frequencyPerWeek}x / week</span>
                      <span className="capitalize">Cost: {hobby.costEstimate}</span>
                    </div>

                    <div className="flex items-center justify-end space-x-2 pt-1">
                      <button
                        onClick={() => handleToggleHobbyStatus(hobby)}
                        className="p-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-200/80 rounded-lg hover:bg-slate-50 flex items-center space-x-1"
                        title={isActive ? 'Pause hobby' : 'Resume hobby'}
                      >
                        {isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-600" />}
                        <span>{isActive ? 'Pause' : 'Resume'}</span>
                      </button>

                      <button
                        onClick={() => onDeleteHobby(hobby.id)}
                        className="p-1.5 text-xs text-rose-500 hover:text-rose-700 border border-slate-200/80 rounded-lg hover:bg-rose-50"
                        title="Delete hobby"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: EXPLORE RESTORATIVE ACTIVITIES & OUTINGS                           */}
      {/* ========================================================================= */}
      {activeTab === 'explore' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
                <span>Filter by Category & Time</span>
              </span>

              {/* Category Pills */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'all', label: 'All Activities' },
                  { id: 'nature', label: 'Nature & Walks' },
                  { id: 'cooking', label: 'Mindful Cooking' },
                  { id: 'reading', label: 'Quiet Reading' },
                  { id: 'arts', label: 'Creative Arts' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-emerald-100/90 text-emerald-800 border border-emerald-300/80 shadow-2xs'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration Slider */}
            <div className="flex items-center gap-3 pt-2 border-t border-slate-100 text-xs text-slate-600">
              <Clock className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Max Time: <strong>{maxDuration} mins</strong></span>
              <input
                type="range"
                min="15"
                max="180"
                step="15"
                value={maxDuration}
                onChange={(e) => setMaxDuration(Number(e.target.value))}
                className="w-48 accent-emerald-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Activities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredRecommendations.map((rec) => {
              const isSaved = savedTaskIds.has(rec.id);
              const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(rec.locationOrMaterials || rec.title)}`;

              return (
                <div
                  key={rec.id}
                  className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:shadow-sm transition-all space-y-3.5 flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                        {rec.category}
                      </span>
                      <span className="text-xs font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/60">
                        ⏱ {rec.estimatedDurationMinutes}m • {rec.approximateCost}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 leading-snug">{rec.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{rec.whyItFits}</p>

                    {/* Step Highlights */}
                    {rec.actionableSteps && rec.actionableSteps.length > 0 && (
                      <div className="bg-slate-50/70 border border-slate-200/60 rounded-xl p-3 space-y-1.5">
                        <span className="text-[11px] font-semibold text-slate-700">Gentle Steps:</span>
                        <ul className="text-xs text-slate-600 space-y-1 pl-4 list-disc">
                          {rec.actionableSteps.map((step, idx) => (
                            <li key={idx} className="leading-relaxed">{step}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Verify Location</span>
                      <ExternalLink className="w-3 h-3 ml-0.5" />
                    </a>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleAdoptAsHobby(rec)}
                        className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs transition-all"
                      >
                        + As Hobby
                      </button>

                      <button
                        onClick={() => handleAddRecAsTask(rec)}
                        disabled={isSaved}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center space-x-1 transition-all ${
                          isSaved
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 cursor-default'
                            : 'brutalist-btn-primary'
                        }`}
                      >
                        {isSaved ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        <span>{isSaved ? 'Added to Tasks' : 'Add to Tasks'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* NEW HOBBY MODAL                                                           */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200/90 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Add Restorative Hobby</h2>
            <form onSubmit={handleCreateHobby} className="space-y-4 text-xs font-semibold text-slate-700">
              <div>
                <label className="block mb-1">Hobby Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Indoor Herb Gardening, Watercoloring"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as HobbyCategory)}
                    className="w-full p-2 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-900 focus:bg-white"
                  >
                    <option value="creative">Creative Arts</option>
                    <option value="intellectual">Reading & Learning</option>
                    <option value="culinary">Culinary & Cooking</option>
                    <option value="outdoor">Nature & Outdoors</option>
                    <option value="mindful">Mindfulness & Rest</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1">Target Times / Week</label>
                  <input
                    type="number"
                    min="1"
                    max="7"
                    value={frequency}
                    onChange={(e) => setFrequency(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-900 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1">Gentle Description / Goal</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Why does this activity make you feel relaxed or fulfilled?"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="brutalist-btn-outlined px-4 py-2 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="brutalist-btn-primary px-4 py-2 rounded-xl text-xs"
                >
                  Save Hobby
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
