import React, { useState } from 'react';
import { 
  AIChatMessage, 
  WellnessCheckIn, 
  TaskItem, 
  HobbyItem, 
  UserPreferences 
} from '../types';
import { askAgentAssistant, CRISIS_SUPPORT_TEXT } from '../services/aiService';
import { 
  Bot, 
  Send, 
  Sparkles, 
  PlusCircle, 
  AlertTriangle, 
  HeartHandshake, 
  Check,
  MapPin,
  Star,
  ExternalLink,
  Utensils,
  Clock,
  BookMarked
} from 'lucide-react';
import { PixelCompanion, CompanionType, CompanionEmotion } from '../components/PixelCompanion';
import { formatCompanionLabel } from '../domain/companions';

interface AssistantScreenProps {
  userId: string;
  checkins: WellnessCheckIn[];
  tasks: TaskItem[];
  hobbies: HobbyItem[];
  preferences: UserPreferences;
  onSaveTask: (task: TaskItem) => Promise<void>;
  onSaveHobby: (hobby: HobbyItem) => Promise<void>;
  onSaveCheckIn?: (checkin: WellnessCheckIn) => Promise<void>;
  companionType?: CompanionType;
  onChangeCompanionType?: (type: CompanionType) => void;
}

export const AssistantScreen: React.FC<AssistantScreenProps> = ({
  userId,
  checkins,
  tasks,
  hobbies,
  preferences,
  onSaveTask,
  onSaveHobby,
  onSaveCheckIn,
  companionType = 'puppy',
  onChangeCompanionType
}) => {
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'msg_welcome',
      role: 'assistant',
      content: `Hey there, buddy! 👋 I'm your Who-Hum lifestyle companion. Talk to me like a close friend—tell me about your day, any exciting things that happened, your mood, or what you're dreaming of doing. I'm here for you!`,
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [acceptedTaskIds, setAcceptedTaskIds] = useState<Set<string>>(new Set());
  const [acceptedHobbyIds, setAcceptedHobbyIds] = useState<Set<string>>(new Set());

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPrompt.trim() || loading) return;

    const userMsg: AIChatMessage = {
      id: 'user_' + Date.now(),
      role: 'user',
      content: inputPrompt.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputPrompt('');
    setLoading(true);

    try {
      const response = await askAgentAssistant(userMsg.content, {
        userId,
        checkins,
        tasks,
        hobbies,
        preferences
      });

      // If the buddy detected a daily event / mood log, auto-save to check-in store!
      if (response.loggedCheckIn && onSaveCheckIn) {
        await onSaveCheckIn(response.loggedCheckIn);
      }

      setMessages(prev => [...prev, response]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptTask = async (taskPartial: Partial<TaskItem>, msgId: string) => {
    const newTask: TaskItem = {
      id: 'task_' + Date.now(),
      userId,
      title: taskPartial.title || 'Wellness Task',
      priority: taskPartial.priority || 'medium',
      category: taskPartial.category || 'wellness',
      status: 'pending',
      estimatedDurationMinutes: taskPartial.estimatedDurationMinutes || 20,
      minEnergyRequired: taskPartial.minEnergyRequired || 2,
      isAIGenerated: true,
      proposedReason: taskPartial.proposedReason || 'Suggested by AI assistant',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await onSaveTask(newTask);
    setAcceptedTaskIds(prev => new Set(prev).add(`${msgId}_${taskPartial.title}`));
  };

  const handleAcceptHobby = async (hobbyPartial: Partial<HobbyItem>, msgId: string) => {
    const newHobby: HobbyItem = {
      id: 'hobby_' + Date.now(),
      userId,
      name: hobbyPartial.name || 'Creative Hobby',
      category: hobbyPartial.category || 'creative',
      status: 'exploring',
      frequencyPerWeek: hobbyPartial.frequencyPerWeek || 1,
      estimatedCost: hobbyPartial.estimatedCost || 'low',
      startedAt: new Date().toISOString()
    };

    await onSaveHobby(newHobby);
    setAcceptedHobbyIds(prev => new Set(prev).add(`${msgId}_${hobbyPartial.name}`));
  };

  const getMessageEmotion = (msg: AIChatMessage): CompanionEmotion => {
    if (msg.crisisAlert) return 'sad';
    const c = msg.content.toLowerCase();
    if (c.includes('congrats') || c.includes('awesome') || c.includes('happy') || c.includes('😄') || c.includes('🎉') || c.includes('great')) {
      return 'smile';
    }
    if (c.includes('deep breath') || c.includes('difficult') || c.includes('vent') || c.includes('gentle') || c.includes('care')) {
      return 'sad';
    }
    return 'idle';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header with Pixel Companion */}
      <div className="material-card-flat p-6 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="p-1 rounded-xl bg-[#fef08a] border-2 border-black shadow-[3px_3px_0px_#000000] flex items-center justify-center shrink-0">
              <PixelCompanion 
                type={companionType} 
                emotion={loading ? 'thinking' : 'idle'} 
                size={48} 
                interactive={true} 
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-black flex items-center gap-2">
                Who-Hum <span className="bg-[#facc15] px-1.5 py-0.5 border-2 border-black rounded text-xl">Chat Buddy</span>
              </h1>
              <p className="text-sm font-medium text-zinc-600 mt-1">
                Your supportive companion. Talk freely—everything is captured quietly in the background.
              </p>
            </div>
          </div>

          {/* Companion Status Badge */}
          <div className="flex items-center space-x-2 bg-[#fef08a] px-3 py-1.5 border-2 border-black rounded-lg self-start sm:self-auto shadow-[2px_2px_0px_#000000] text-xs font-mono font-bold text-black">
            <span>Active Companion:</span>
            <span>{formatCompanionLabel(companionType)}</span>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="material-card bg-white p-3 sm:p-6 flex flex-col h-[calc(100dvh-200px)] md:h-[650px] min-h-[420px]">
        {/* Messages List */}
        <div className="flex-1 min-h-0 overflow-y-auto space-y-4 pr-1">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div 
                key={msg.id} 
                className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
              >
                {!isUser && (
                  <div className="w-9 h-9 rounded bg-[#fef08a] border-2 border-black shadow-[2px_2px_0px_#000000] flex items-center justify-center text-black flex-shrink-0 mt-1 p-0.5">
                    <PixelCompanion 
                      type={companionType} 
                      emotion={getMessageEmotion(msg)} 
                      size={32} 
                      interactive={true} 
                      showThoughtBubble={false}
                    />
                  </div>
                )}
                {isUser && (
                  <div className="w-8 h-8 rounded bg-black text-white border-2 border-black shadow-[1px_1px_0px_#000000] flex items-center justify-center font-bold text-xs flex-shrink-0 mt-1">
                    YOU
                  </div>
                )}

                <div className={`max-w-[85%] rounded border-2 border-black p-4 space-y-3 ${
                  isUser 
                    ? 'bg-[#bae6fd] text-black shadow-[3px_3px_0px_#000000]' 
                    : msg.crisisAlert 
                    ? 'bg-[#fecaca] text-black shadow-[3px_3px_0px_#000000]' 
                    : 'bg-white text-black shadow-[3px_3px_0px_#000000]'
                }`}>
                  {msg.crisisAlert && (
                    <div className="flex items-center space-x-2 text-red-600 font-bold text-xs mb-1">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Emergency Crisis Support Protocol</span>
                    </div>
                  )}

                  <div className="text-sm font-medium whitespace-pre-line leading-relaxed">
                    {msg.content}
                  </div>

                  {/* Travel Spots & Google Maps Rendering */}
                  {msg.travelSpots && msg.travelSpots.length > 0 && (
                    <div className="pt-2 border-t-2 border-black space-y-3">
                      <div className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-black bg-[#fef08a] px-2 py-0.5 border border-black inline-block">
                        <MapPin className="w-3.5 h-3.5 text-black" />
                        <span>Google Maps Verified Places & Ratings</span>
                      </div>
                      <div className="grid grid-cols-1 gap-2.5">
                        {msg.travelSpots.map((spot, idx) => (
                          <div key={idx} className="p-3 bg-zinc-50 border-2 border-black rounded shadow-[2px_2px_0px_#000000] space-y-1.5">
                            <div className="flex justify-between items-start">
                              <h4 className="font-bold text-sm text-black">{spot.name}</h4>
                              <span className="flex items-center space-x-1 bg-amber-100 text-amber-900 border border-black px-1.5 py-0.5 rounded text-xs font-bold">
                                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                <span>{spot.rating}</span>
                              </span>
                            </div>
                            <p className="text-xs text-zinc-600 leading-normal">{spot.description}</p>
                            <div className="flex justify-between items-center pt-1 text-[11px] font-mono">
                              <span className="text-zinc-500">{spot.reviewCount.toLocaleString()} reviews</span>
                              <a 
                                href={spot.mapsUrl} 
                                target="_blank" 
                                rel="noreferrer"
                                className="font-bold text-black flex items-center space-x-1 underline hover:text-blue-700"
                              >
                                <span>View on Google Maps</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mood-Based Cheer-Up Cooking & Image Generation Card */}
                  {msg.recipeData && (
                    <div className="pt-2 border-t-2 border-black space-y-3">
                      <div className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-black bg-[#bbf7d0] px-2 py-0.5 border border-black inline-block">
                        <Utensils className="w-3.5 h-3.5 text-black" />
                        <span>Cheer-Up Culinary Visualization</span>
                      </div>
                      <div className="border-2 border-black rounded bg-white overflow-hidden shadow-[3px_3px_0px_#000000]">
                        <img 
                          src={msg.recipeData.imageUrl} 
                          alt={msg.recipeData.dishName} 
                          className="w-full h-44 object-cover border-b-2 border-black"
                        />
                        <div className="p-3.5 space-y-2">
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-base text-black">{msg.recipeData.dishName}</h4>
                            <span className="flex items-center space-x-1 text-xs font-mono bg-zinc-100 border border-black px-2 py-0.5 rounded">
                              <Clock className="w-3 h-3" />
                              <span>{msg.recipeData.prepTimeMinutes} mins</span>
                            </span>
                          </div>
                          <p className="text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-300 p-2 rounded">
                            ✨ <strong>Mood Benefit:</strong> {msg.recipeData.moodBenefit}
                          </p>
                          <div className="text-xs space-y-1">
                            <strong className="block font-bold text-black">Ingredients:</strong>
                            <ul className="list-disc list-inside text-zinc-700 pl-1 space-y-0.5 font-mono text-[11px]">
                              {msg.recipeData.ingredients.map((ing, i) => (
                                <li key={i}>{ing}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Proposed Tasks Attachment */}
                  {msg.suggestedTasks && msg.suggestedTasks.length > 0 && (
                    <div className="pt-2 border-t-2 border-black space-y-2">
                      <span className="text-xs font-bold text-black uppercase tracking-wider block">
                        Proposed Wellness & Lifestyle Tasks
                      </span>
                      {msg.suggestedTasks.map((st, i) => {
                        const key = `${msg.id}_${st.title}`;
                        const isApproved = acceptedTaskIds.has(key);
                        return (
                          <div key={i} className="flex justify-between items-center bg-zinc-50 p-2.5 rounded border-2 border-black shadow-[2px_2px_0px_#000000] text-xs">
                            <div>
                              <strong>{st.title}</strong>
                              <div className="text-zinc-600 font-mono text-[11px]">{st.estimatedDurationMinutes}m • {st.category}</div>
                            </div>
                            <button
                              onClick={() => handleAcceptTask(st, msg.id)}
                              disabled={isApproved}
                              className={`px-3 py-1 font-bold rounded flex items-center space-x-1 border-2 border-black text-xs transition-all ${
                                isApproved 
                                  ? 'bg-[#bbf7d0] text-black shadow-none' 
                                  : 'brutalist-btn-primary text-xs'
                              }`}
                            >
                              {isApproved ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Added</span>
                                </>
                              ) : (
                                <>
                                  <PlusCircle className="w-3.5 h-3.5" />
                                  <span>Add to Tasks</span>
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="text-[10px] font-mono text-zinc-500 text-right pt-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center space-x-3.5 p-3.5 bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_#000000] w-fit">
              <div className="bg-[#fef08a] p-1 border-2 border-black rounded-lg shrink-0">
                <PixelCompanion 
                  type={companionType} 
                  emotion="thinking" 
                  size={38} 
                  showThoughtBubble={true} 
                  interactive={false} 
                />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-black">
                  <span>Who-Hum is thinking</span>
                  <span className="flex space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-black animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-black animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-black animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                </div>
                <p className="text-[11px] font-mono text-zinc-600">
                  Listening and capturing your day quietly in the background...
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="pt-4 border-t-2 border-black flex items-center space-x-3">
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Tell your buddy about your day (e.g. 'I am so happy today I bought a cycle!')..."
            className="flex-1 text-sm font-medium"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !inputPrompt.trim()}
            className="brutalist-btn-primary px-5 py-2.5 flex items-center space-x-2 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
