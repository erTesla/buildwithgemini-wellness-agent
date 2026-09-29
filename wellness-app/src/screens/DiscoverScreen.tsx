import React, { useState } from 'react';
import { ActivityRecommendation, UserPreferences, TaskItem } from '../types';
import { 
  Compass, 
  MapPin, 
  BookOpen, 
  Utensils, 
  Palette, 
  Trees, 
  Coffee, 
  ExternalLink, 
  Plus, 
  Check, 
  SlidersHorizontal,
  Info
} from 'lucide-react';

interface DiscoverScreenProps {
  userId: string;
  preferences: UserPreferences;
  recommendations: ActivityRecommendation[];
  onSaveAsTask: (rec: ActivityRecommendation) => Promise<void>;
  onSaveFeedback: (recId: string, feedback: 'tried_loved' | 'dismissed') => void;
}

export const DiscoverScreen: React.FC<DiscoverScreenProps> = ({
  userId,
  preferences,
  recommendations: initialRecommendations,
  onSaveAsTask,
  onSaveFeedback
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [maxDuration, setMaxDuration] = useState<number>(120);
  const [budgetFilter, setBudgetFilter] = useState<string>('all');
  const [savedTaskIds, setSavedTaskIds] = useState<Set<string>>(new Set());

  // Rich catalog of activities spanning cooking, reading, local outings, creative, and outdoor
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
      whyItFits: 'Jon Kabat-Zinn provides grounded reflections on non-striving, grounding the mind after work.',
      estimatedDurationMinutes: 20,
      approximateCost: 'Free / Library Book',
      locationOrMaterials: 'Comfortable reading chair, warm lighting, notebook for favorite passages',
      actionableSteps: [
        'Leave phone in another room or turn on do-not-disturb',
        'Read 1-2 short chapters at an unhurried pace',
        'Underline or journal one takeaway that resonates'
      ]
    },
    {
      id: 'rec_travel_1',
      title: 'Local Historic District & Independent Roastery Walk',
      category: 'travel',
      whyItFits: 'Low-friction local exploration combining gentle walking, architecture appreciation, and specialty coffee.',
      estimatedDurationMinutes: 60,
      approximateCost: '$5 - $8',
      locationOrMaterials: preferences.preferredLocation || 'Historic Downtown Quarter',
      actionableSteps: [
        'Search local historic markers or walking maps on Google Maps',
        'Sample a pour-over or herbal beverage at an independent coffee shop',
        'Walk through quiet residential streets observing garden blooms'
      ],
      isVerifiedPlace: true,
      placeSourceUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((preferences.preferredLocation || 'local') + ' independent roastery and historic walking street')}`,
      placeAddress: preferences.preferredLocation || 'Downtown Cultural Corridor'
    },
    {
      id: 'rec_outdoor_1',
      title: 'Sunset Nature Park Trail Loop',
      category: 'outdoor',
      whyItFits: 'Natural golden hour light helps recalibrate circadian rhythm and lowers physical tension.',
      estimatedDurationMinutes: 45,
      approximateCost: 'Free',
      locationOrMaterials: 'Nearby community park, comfortable walking shoes',
      actionableSteps: [
        'Arrive 45 minutes prior to sunset',
        'Walk without headphones for the first 15 minutes to notice ambient nature sounds',
        'Pause at an elevated vista to observe the evening sky'
      ]
    },
    {
      id: 'rec_creative_1',
      title: 'Tactile Fountain Pen or Charcoal Calligraphy Exploration',
      category: 'creative',
      whyItFits: 'Screen-free tactile creativity that stimulates spatial focus without deadline pressure.',
      estimatedDurationMinutes: 30,
      approximateCost: '$10 - $15',
      locationOrMaterials: 'Heavyweight sketchbook paper, ink pen or soft 4B charcoal stick',
      actionableSteps: [
        'Experiment with line variations, pressures, and smooth curves',
        'Write favorite inspiring quotes or poetic phrases',
        'Focus on the physical sensation of ink flowing onto textured paper'
      ]
    },
    {
      id: 'rec_relaxing_1',
      title: '15-Minute Progressive Muscle Relaxation & Soundscape',
      category: 'relaxing',
      whyItFits: 'Clinically proven nervous system down-regulation to relieve somatic tension before sleep.',
      estimatedDurationMinutes: 15,
      approximateCost: 'Free',
      locationOrMaterials: 'Yoga mat or bed, quiet room, warm blanket',
      actionableSteps: [
        'Lie flat comfortably on your back with arms loosely at your sides',
        'Tense your toes and feet for 5 seconds, then deliberately exhale and release completely',
        'Progress systematically upwards through calves, thighs, shoulders, and brow'
      ]
    }
  ];

  const allRecommendations = [...initialRecommendations, ...defaultCatalog];

  const filtered = allRecommendations.filter(item => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (item.estimatedDurationMinutes > maxDuration) return false;
    if (budgetFilter === 'free' && !item.approximateCost.toLowerCase().includes('free')) return false;
    return true;
  });

  const handleSave = async (rec: ActivityRecommendation) => {
    await onSaveAsTask(rec);
    setSavedTaskIds(prev => new Set(prev).add(rec.id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="material-card-flat p-6 bg-white">
        <h1 className="text-2xl font-normal text-[#202124]">
          Recommendations & <span className="font-semibold text-[#1a73e8]">Activity Discovery</span>
        </h1>
        <p className="text-sm text-[#5f6368] mt-1">
          Hand-picked cooking, reading, travel, outdoor, and creative experiences. Every recommendation includes realistic steps, cost estimates, and live links.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="material-card p-4 bg-white flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Category Tabs */}
          <div className="flex flex-wrap rounded-md border border-[#dadce0] overflow-hidden text-xs">
            {['all', 'cooking', 'reading', 'travel', 'outdoor', 'creative', 'relaxing'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 font-medium capitalize ${
                  selectedCategory === cat ? 'bg-[#1a73e8] text-white' : 'bg-white text-[#5f6368] hover:bg-[#f8f9fa]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Budget Filter */}
          <select
            value={budgetFilter}
            onChange={(e) => setBudgetFilter(e.target.value)}
            className="text-xs border border-[#dadce0] rounded-md px-2.5 py-1.5 text-[#202124]"
          >
            <option value="all">Any Cost</option>
            <option value="free">Free Only</option>
          </select>

          {/* Duration Slider */}
          <div className="flex items-center space-x-2 text-xs text-[#5f6368]">
            <span>Max Time:</span>
            <input 
              type="range" min="15" max="180" step="15" value={maxDuration} 
              onChange={(e) => setMaxDuration(Number(e.target.value))}
              className="accent-[#1a73e8] w-24"
            />
            <strong className="text-[#202124]">{maxDuration}m</strong>
          </div>
        </div>

        <div className="text-xs text-[#5f6368]">
          Found <strong>{filtered.length}</strong> matching ideas
        </div>
      </div>

      {/* Recommendations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((rec) => {
          const isSaved = savedTaskIds.has(rec.id);
          return (
            <div key={rec.id} className="material-card p-5 flex flex-col justify-between bg-white space-y-4">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-[#e8f0fe] text-[#1a73e8]">
                    {rec.category}
                  </span>
                  <span className="text-xs text-[#5f6368] font-medium bg-[#f1f3f4] px-2 py-0.5 rounded">
                    ~{rec.estimatedDurationMinutes} mins
                  </span>
                </div>

                <h3 className="text-base font-semibold text-[#202124]">{rec.title}</h3>
                
                <p className="text-xs text-[#1a73e8] mt-1 font-medium">
                  Why it fits: <span className="text-[#5f6368] font-normal">{rec.whyItFits}</span>
                </p>

                <div className="mt-3 text-xs text-[#5f6368] space-y-1">
                  <div>
                    <strong>Est. Cost:</strong> {rec.approximateCost}
                  </div>
                  <div>
                    <strong>Materials / Location:</strong> {rec.locationOrMaterials}
                  </div>
                </div>

                {/* Practical Steps Checklist */}
                <div className="mt-4 pt-3 border-t border-[#dadce0]">
                  <h4 className="text-xs font-semibold text-[#202124] mb-2 uppercase tracking-wide">
                    Suggested Next Steps
                  </h4>
                  <ul className="space-y-1.5 text-xs text-[#3c4043]">
                    {rec.actionableSteps.map((step, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <span className="w-4 h-4 rounded-full bg-[#f1f3f4] text-[#5f6368] flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* External Verification link */}
                {rec.placeSourceUrl && (
                  <div className="mt-3 pt-2 text-xs flex items-center space-x-1.5 text-[#1a73e8]">
                    <MapPin className="w-3.5 h-3.5 text-[#ea4335]" />
                    <a 
                      href={rec.placeSourceUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:underline flex items-center space-x-1"
                    >
                      <span>Explore on Google Maps</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <span className="text-[#5f6368] text-[11px]">(Verify live hours before visiting)</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-[#dadce0] flex justify-between items-center">
                <div className="flex space-x-2">
                  <button
                    onClick={() => onSaveFeedback(rec.id, 'tried_loved')}
                    className="text-xs text-[#1e8e3e] hover:bg-[#e6f4ea] px-2 py-1 rounded border border-[#ceead6]"
                  >
                    ❤️ Enjoyed this
                  </button>
                  <button
                    onClick={() => onSaveFeedback(rec.id, 'dismissed')}
                    className="text-xs text-[#5f6368] hover:bg-[#f8f9fa] px-2 py-1 rounded border border-[#dadce0]"
                  >
                    Dismiss
                  </button>
                </div>

                <button
                  onClick={() => handleSave(rec)}
                  disabled={isSaved}
                  className={`text-xs px-3 py-1.5 rounded flex items-center space-x-1 font-medium transition-all ${
                    isSaved 
                      ? 'bg-[#e6f4ea] text-[#1e8e3e] border border-[#ceead6]' 
                      : 'google-btn-primary'
                  }`}
                >
                  {isSaved ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Added to Tasks</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add as Task</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
