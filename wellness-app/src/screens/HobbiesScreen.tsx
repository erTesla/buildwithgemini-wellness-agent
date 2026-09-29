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
      <div className="material-card-flat p-6 bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-normal text-[#202124]">
            Hobbies & <span className="font-semibold text-[#1a73e8]">Creative Interests</span>
          </h1>
          <p className="text-sm text-[#5f6368] mt-1">
            Cultivate restorative passions, track your engagement consistency, and explore new curiosities.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="google-btn-primary flex items-center space-x-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Hobby</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#dadce0]">
        <button
          onClick={() => setActiveTab('my_hobbies')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 flex items-center space-x-2 ${
            activeTab === 'my_hobbies'
              ? 'border-[#1a73e8] text-[#1a73e8]'
              : 'border-transparent text-[#5f6368] hover:text-[#202124]'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Active & Saved Hobbies ({hobbies.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('explore')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 flex items-center space-x-2 ${
            activeTab === 'explore'
              ? 'border-[#1a73e8] text-[#1a73e8]'
              : 'border-transparent text-[#5f6368] hover:text-[#202124]'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Explore New Hobbies</span>
        </button>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'my_hobbies' ? (
        hobbies.length === 0 ? (
          <div className="material-card p-12 text-center text-[#5f6368]">
            <Sparkles className="w-12 h-12 mx-auto mb-3 text-[#1a73e8] opacity-80" />
            <h3 className="text-base font-medium text-[#202124]">No hobbies tracked yet</h3>
            <p className="text-xs text-[#5f6368] mt-1 mb-4">
              Cultivating an engaging hobby outside of work provides vital psychological replenishment.
            </p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setActiveTab('explore')} className="google-btn-primary text-xs">
                Browse Curated Hobbies
              </button>
              <button onClick={() => setIsModalOpen(true)} className="google-btn-outlined text-xs">
                Add Your Current Hobby
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hobbies.map((hobby) => (
              <div 
                key={hobby.id} 
                className={`material-card p-5 flex flex-col justify-between ${
                  hobby.status === 'paused' ? 'bg-[#f8f9fa] opacity-80' : 'bg-white'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-[#e8f0fe] text-[#1a73e8]">
                      {hobby.category}
                    </span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      hobby.status === 'active' ? 'bg-[#e6f4ea] text-[#1e8e3e]' :
                      hobby.status === 'paused' ? 'bg-[#feefc3] text-[#b06000]' :
                      'bg-[#f1f3f4] text-[#5f6368]'
                    }`}>
                      {hobby.status}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-[#202124]">{hobby.name}</h3>
                  {hobby.description && (
                    <p className="text-xs text-[#5f6368] mt-1.5">{hobby.description}</p>
                  )}

                  <div className="mt-4 pt-3 border-t border-[#dadce0] space-y-1.5 text-xs text-[#5f6368]">
                    <div className="flex justify-between">
                      <span>Target frequency:</span>
                      <strong className="text-[#202124]">{hobby.frequencyPerWeek}x / week</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Estimated cost:</span>
                      <strong className="text-[#202124] capitalize">{hobby.estimatedCost}</strong>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-[#dadce0] flex justify-between items-center">
                  <button
                    onClick={() => handleTogglePause(hobby)}
                    className="text-xs text-[#1a73e8] font-medium hover:underline flex items-center space-x-1"
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
                    className="text-[#5f6368] hover:text-[#d93025] p-1 rounded hover:bg-[#fce8e6]"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {curatedExplorationIdeas.map((idea, idx) => (
            <div key={idx} className="material-card p-5 flex flex-col justify-between bg-white">
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-[#e8f0fe] text-[#1a73e8]">
                  {idea.category}
                </span>
                <h3 className="text-base font-semibold text-[#202124] mt-2">{idea.name}</h3>
                <p className="text-xs text-[#5f6368] mt-1.5 leading-relaxed">{idea.description}</p>
                <div className="mt-3 text-xs text-[#5f6368] space-y-1">
                  <div>Cost: <strong className="text-[#202124] capitalize">{idea.cost}</strong></div>
                  <div>Recommended cadence: <strong className="text-[#202124]">{idea.frequency}x weekly</strong></div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-[#dadce0]">
                <button
                  onClick={() => handleAddExplorationIdea(idea)}
                  className="w-full google-btn-outlined text-xs py-2 flex items-center justify-center space-x-1.5"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 space-y-4">
            <h2 className="text-lg font-medium text-[#202124]">Add New Hobby or Interest</h2>
            <form onSubmit={handleCreateHobby} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#202124] mb-1">Hobby Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sourdough baking, Hiking, Acoustic Guitar"
                  className="w-full p-2.5 border border-[#dadce0] rounded-md text-sm text-[#202124] focus:border-[#1a73e8] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#202124] mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as HobbyCategory)}
                    className="w-full p-2 border border-[#dadce0] rounded-md text-sm text-[#202124]"
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
                  <label className="block text-xs font-medium text-[#202124] mb-1">Initial Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as HobbyStatus)}
                    className="w-full p-2 border border-[#dadce0] rounded-md text-sm text-[#202124]"
                  >
                    <option value="active">Active Regular</option>
                    <option value="exploring">Want to Explore</option>
                    <option value="paused">Paused</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#202124] mb-1">Frequency (Sessions/Week)</label>
                  <input
                    type="number"
                    min="1"
                    max="7"
                    value={frequency}
                    onChange={(e) => setFrequency(Number(e.target.value))}
                    className="w-full p-2 border border-[#dadce0] rounded-md text-sm text-[#202124]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#202124] mb-1">Estimated Cost</label>
                  <select
                    value={cost}
                    onChange={(e) => setCost(e.target.value as any)}
                    className="w-full p-2 border border-[#dadce0] rounded-md text-sm text-[#202124]"
                  >
                    <option value="free">Free</option>
                    <option value="low">Low ($5 - $20)</option>
                    <option value="medium">Medium ($20 - $100)</option>
                    <option value="high">High ($100+)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#202124] mb-1">Personal Notes</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Why do you enjoy this? Any specific goals or supplies needed?"
                  className="w-full p-2.5 border border-[#dadce0] rounded-md text-sm text-[#202124] focus:border-[#1a73e8] focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-[#dadce0]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-[#5f6368] hover:text-[#202124]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="google-btn-primary text-sm"
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
