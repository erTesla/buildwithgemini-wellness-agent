import React, { useState } from 'react';
import { HobbyItem, HobbyCategory, HobbyStatus, UserPreferences } from '../types';
import { 
  Sparkles, 
  Plus, 
  Pause, 
  Play, 
  Trash2, 
  Tag, 
  Compass, 
  TrendingUp, 
  Heart,
  MessageSquare
} from 'lucide-react';

interface HobbiesScreenProps {
  userId: string;
  hobbies: HobbyItem[];
  preferences: UserPreferences;
  onSaveHobby: (hobby: HobbyItem) => Promise<void>;
  onDeleteHobby: (hobbyId: string) => Promise<void>;
}

export const HobbiesScreen: React.FC<HobbiesScreenProps> = ({
  userId,
  hobbies,
  preferences,
  onSaveHobby,
  onDeleteHobby
}) => {
  const [activeTab, setActiveTab] = useState<'my_hobbies' | 'explore'>('my_hobbies');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // New hobby form
  const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<HobbyCategory>('creative');
  const [frequency, setFrequency] = useState<number>(2);
  const [cost, setCost] = useState<'free' | 'low' | 'medium' | 'high'>('low');
  const [description, setDescription] = useState<string>('');
  const [status, setStatus] = useState<HobbyStatus>('active');

  const curatedExplorationIdeas: {
    name: string;
    category: HobbyCategory;
    cost: 'free' | 'low' | 'medium' | 'high';
    frequency: number;
    description: string;
  }[] = [
    {
      name: 'Indoor Herb Gardening',
      category: 'culinary',
      cost: 'low',
      frequency: 2,
      description: 'Grow basil, mint, and thyme on your windowsill for aromatic cooking and mindful daily watering.'
    },
    {
      name: 'Urban Architecture Sketching',
      category: 'creative',
      cost: 'low',
      frequency: 1,
      description: 'A pocket sketchbook and pen to observe local buildings, façades, and street geometry.'
    },
    {
      name: 'Mindful Morning Filter Coffee Brewing',
      category: 'culinary',
      cost: 'low',
      frequency: 5,
      description: 'Master manual pour-over ratios and single-origin tastings to start your mornings deliberately.'
    },
    {
      name: 'Audiobook Trail Walking',
      category: 'outdoor',
      cost: 'free',
      frequency: 3,
      description: 'Combine low-intensity cardio in nature parks with captivating non-fiction or storytelling.'
    },
    {
      name: 'Ceramics & Hand-Building Pottery',
      category: 'creative',
      cost: 'medium',
      frequency: 1,
      description: 'Tactile, screen-free clay sculpting to create your own functional mugs and bowls.'
    },
    {
      name: 'Classical Guitar or Ukulele Basics',
      category: 'relaxing',
      cost: 'medium',
      frequency: 3,
      description: 'Learn foundational fingerpicking chords for 15 minutes each evening as a restful brain exercise.'
    }
  ];

  const handleCreateHobby = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newHobby: HobbyItem = {
      id: 'hobby_' + Date.now(),
      userId,
      name: name.trim(),
      category,
      status,
      frequencyPerWeek: frequency,
      estimatedCost: cost,
      description: description.trim() || undefined,
      startedAt: new Date().toISOString()
    };

    await onSaveHobby(newHobby);
    setName('');
    setDescription('');
    setIsModalOpen(false);
  };

  const handleTogglePause = async (hobby: HobbyItem) => {
    const nextStatus: HobbyStatus = hobby.status === 'active' ? 'paused' : 'active';
    await onSaveHobby({
      ...hobby,
      status: nextStatus
    });
  };

  const handleAddExplorationIdea = async (idea: typeof curatedExplorationIdeas[0]) => {
    const newHobby: HobbyItem = {
      id: 'hobby_' + Date.now(),
      userId,
      name: idea.name,
      category: idea.category,
      status: 'exploring',
      frequencyPerWeek: idea.frequency,
      estimatedCost: idea.cost,
      description: idea.description,
      startedAt: new Date().toISOString()
    };
    await onSaveHobby(newHobby);
    setActiveTab('my_hobbies');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-sky-50/50 border border-emerald-100/80 rounded-2xl shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Hobbies & <span className="text-emerald-700">Creative Sparks</span>
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Cultivate restorative passions, track your engagement consistency, and explore new curiosities.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="brutalist-btn-primary flex items-center space-x-2 text-xs sm:text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Hobby</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl bg-slate-100/90 p-1 border border-slate-200/80 text-xs w-fit shadow-2xs">
        <button
          onClick={() => setActiveTab('my_hobbies')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center space-x-2 ${
            activeTab === 'my_hobbies'
              ? 'bg-white text-emerald-800 shadow-2xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Heart className="w-3.5 h-3.5 text-emerald-600" />
          <span>Active & Saved Hobbies ({hobbies.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('explore')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center space-x-2 ${
            activeTab === 'explore'
              ? 'bg-white text-emerald-800 shadow-2xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-teal-600" />
          <span>Explore New Hobbies</span>
        </button>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'my_hobbies' ? (
        hobbies.length === 0 ? (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center text-slate-500 shadow-xs">
            <Sparkles className="w-12 h-12 mx-auto mb-3 text-emerald-500 opacity-80" />
            <h3 className="text-base font-semibold text-slate-900">No hobbies tracked yet</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4 max-w-md mx-auto">
              Cultivating an engaging hobby outside of work provides vital psychological replenishment.
            </p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setActiveTab('explore')} className="brutalist-btn-primary text-xs px-4 py-2">
                Browse Curated Hobbies
              </button>
              <button onClick={() => setIsModalOpen(true)} className="brutalist-btn-outlined text-xs px-4 py-2">
                Add Your Current Hobby
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {hobbies.map((hobby) => (
              <div 
                key={hobby.id} 
                className={`bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-sm transition-all ${
                  hobby.status === 'paused' ? 'opacity-75 bg-slate-50/50' : 'bg-white'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[11px] uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                      {hobby.category}
                    </span>
                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                      hobby.status === 'active' ? 'bg-emerald-50 text-emerald-800 border-emerald-200/60' :
                      hobby.status === 'paused' ? 'bg-amber-50 text-amber-800 border-amber-200/60' :
                      'bg-slate-100 text-slate-600 border-slate-200/60'
                    }`}>
                      {hobby.status}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-slate-900">{hobby.name}</h3>
                  {hobby.description && (
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{hobby.description}</p>
                  )}

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
                    <div className="flex justify-between">
                      <span>Target frequency:</span>
                      <strong className="text-slate-800">{hobby.frequencyPerWeek}x / week</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Estimated cost:</span>
                      <strong className="text-slate-800 capitalize">{hobby.estimatedCost}</strong>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex justify-between items-center">
                  <button
                    onClick={() => handleTogglePause(hobby)}
                    className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center space-x-1"
                  >
                    {hobby.status === 'active' ? (
                      <>
                        <Pause className="w-3.5 h-3.5" />
                        <span>Pause Hobby</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" />
                        <span>Resume</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => onDeleteHobby(hobby.id)}
                    className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Remove hobby"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Curated exploration ideas */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {curatedExplorationIdeas.map((idea, idx) => (
            <div key={idx} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-sm transition-all">
              <div>
                <span className="text-[11px] uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200/60">
                  {idea.category}
                </span>
                <h3 className="text-base font-semibold text-slate-900 mt-2">{idea.name}</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{idea.description}</p>
                <div className="mt-3 text-xs text-slate-500 space-y-1">
                  <div>Cost: <strong className="text-slate-800 capitalize">{idea.cost}</strong></div>
                  <div>Recommended cadence: <strong className="text-slate-800">{idea.frequency}x weekly</strong></div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100">
                <button
                  onClick={() => handleAddExplorationIdea(idea)}
                  className="w-full brutalist-btn-outlined text-xs py-2 rounded-xl flex items-center justify-center space-x-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add to My Exploration List</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-slate-200/80 space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Add New Hobby or Interest</h2>
            <form onSubmit={handleCreateHobby} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Hobby Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sourdough baking, Hiking, Acoustic Guitar"
                  className="w-full p-2.5 bg-slate-50/60 border border-slate-200/80 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as HobbyCategory)}
                    className="w-full p-2 bg-slate-50/60 border border-slate-200/80 rounded-xl text-sm text-slate-800"
                  >
                    <option value="creative">Creative</option>
                    <option value="physical">Physical</option>
                    <option value="social">Social</option>
                    <option value="relaxing">Relaxing</option>
                    <option value="outdoor">Outdoor</option>
                    <option value="culinary">Culinary</option>
                    <option value="intellectual">Intellectual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as HobbyStatus)}
                    className="w-full p-2 bg-slate-50/60 border border-slate-200/80 rounded-xl text-sm text-slate-800"
                  >
                    <option value="active">Active Regular</option>
                    <option value="exploring">Want to Explore</option>
                    <option value="paused">Paused</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Frequency (Sessions/Week)</label>
                  <input
                    type="number"
                    min="1"
                    max="7"
                    value={frequency}
                    onChange={(e) => setFrequency(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50/60 border border-slate-200/80 rounded-xl text-sm text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Estimated Cost</label>
                  <select
                    value={cost}
                    onChange={(e) => setCost(e.target.value as any)}
                    className="w-full p-2 bg-slate-50/60 border border-slate-200/80 rounded-xl text-sm text-slate-800"
                  >
                    <option value="free">Free</option>
                    <option value="low">Low ($5 - $20)</option>
                    <option value="medium">Medium ($20 - $100)</option>
                    <option value="high">High ($100+)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Personal Notes</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Why do you enjoy this? Any specific goals or supplies needed?"
                  className="w-full p-2.5 bg-slate-50/60 border border-slate-200/80 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="brutalist-btn-primary px-4 py-2 text-xs font-semibold rounded-xl"
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
