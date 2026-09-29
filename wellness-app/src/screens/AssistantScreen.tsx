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
  userName?: string;
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
  userName,
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
      content: `Hey there, ${userName || 'buddy'}! 👋 I'm your Who-Hum lifestyle companion. Talk to me like a close friend—tell me about your day, any exciting things that happened, your mood, or what you're dreaming of doing. I'm here for you!`,
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
      <div className="p-6 bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-sky-50/50 border border-emerald-100/80 rounded-2xl shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-1.5 rounded-2xl bg-white border border-emerald-200/80 shadow-xs flex items-center justify-center shrink-0">
              <PixelCompanion 
                type={companionType} 
                emotion={loading ? 'thinking' : 'idle'} 
                size={48} 
                interactive={true} 
              />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
                Who-Hum <span className="text-emerald-700">Chat Companion</span>
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Your supportive wellness companion. Talk freely—everything is captured quietly in the background.
              </p>
            </div>
          </div>

          {/* Companion Status Badge */}
          <div className="flex items-center space-x-2 bg-white px-3.5 py-1.5 border border-slate-200/80 rounded-xl self-start sm:self-auto shadow-2xs text-xs font-semibold text-slate-700">
            <span className="text-slate-500">Companion:</span>
            <span className="text-emerald-800">{formatCompanionLabel(companionType)}</span>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-6 flex flex-col h-[calc(100dvh-200px)] md:h-[650px] min-h-[420px] shadow-xs">
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
                  <div className="w-9 h-9 rounded-2xl bg-emerald-50 border border-emerald-200/70 flex items-center justify-center flex-shrink-0 mt-1 p-0.5 shadow-2xs">
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
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white shadow-2xs flex items-center justify-center font-bold text-xs flex-shrink-0 mt-1">
                    YOU
                  </div>
                )}

                <div className={`max-w-[85%] rounded-2xl p-4 space-y-3 shadow-2xs ${
                  isUser 
                    ? 'bg-emerald-600 text-white rounded-tr-xs' 
                    : msg.crisisAlert 
                    ? 'bg-rose-50 border border-rose-200 text-rose-950 rounded-tl-xs' 
                    : 'bg-slate-50/70 border border-slate-200/80 text-slate-800 rounded-tl-xs'
                }`}>
                  {msg.crisisAlert && (
                    <div className="flex items-center space-x-2 text-rose-700 font-bold text-xs mb-1">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Emergency Crisis Support Protocol</span>
                    </div>
                  )}

                  <div className={`text-sm whitespace-pre-line leading-relaxed ${isUser ? 'text-white' : 'text-slate-800'}`}>
                    {msg.content}
                  </div>

                  {/* Travel Spots & Google Maps Rendering */}
                  {msg.travelSpots && msg.travelSpots.length > 0 && (
                    <div className="pt-3 border-t border-slate-200/60 space-y-3">
                      <div className="flex items-center space-x-1.5 text-[11px] font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60 inline-flex">
                        <MapPin className="w-3.5 h-3.5 text-rose-500" />
                        <span>Google Maps Verified Places & Ratings</span>
                      </div>
                      <div className="grid grid-cols-1 gap-2.5">
                        {msg.travelSpots.map((spot, idx) => (
                          <div key={idx} className="p-3.5 bg-white border border-slate-200/80 rounded-xl shadow-2xs space-y-1.5">
                            <div className="flex justify-between items-start">
                              <h4 className="font-semibold text-sm text-slate-900">{spot.name}</h4>
                              <span className="flex items-center space-x-1 bg-amber-50 text-amber-800 border border-amber-200/60 px-2 py-0.5 rounded-full text-xs font-semibold">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                                <span>{spot.rating}</span>
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">{spot.description}</p>
                            <div className="flex justify-between items-center pt-1 text-[11px]">
                              <span className="text-slate-500">{spot.reviewCount.toLocaleString()} reviews</span>
                              <a 
                                href={spot.mapsUrl} 
                                target="_blank" 
                                rel="noreferrer"
                                className="font-semibold text-emerald-700 flex items-center space-x-1 hover:underline"
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
                    <div className="pt-3 border-t border-slate-200/60 space-y-3">
                      <div className="flex items-center space-x-1.5 text-[11px] font-semibold uppercase tracking-wider text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200/60 inline-flex">
                        <Utensils className="w-3.5 h-3.5 text-teal-600" />
                        <span>Cheer-Up Culinary Visualization</span>
                      </div>
                      <div className="border border-slate-200/80 rounded-2xl bg-white overflow-hidden shadow-2xs">
                        <img 
                          src={msg.recipeData.imageUrl} 
                          alt={msg.recipeData.dishName} 
                          className="w-full h-44 object-cover border-b border-slate-100"
                        />
                        <div className="p-4 space-y-2.5">
                          <div className="flex justify-between items-start">
                            <h4 className="font-semibold text-base text-slate-900">{msg.recipeData.dishName}</h4>
                            <span className="flex items-center space-x-1 text-xs text-slate-600 bg-slate-100 border border-slate-200/60 px-2.5 py-0.5 rounded-full">
                              <Clock className="w-3 h-3 text-slate-500" />
                              <span>{msg.recipeData.prepTimeMinutes} mins</span>
                            </span>
                          </div>
                          <p className="text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200/60 p-2.5 rounded-xl">
                            ✨ <strong className="font-semibold">Mood Benefit:</strong> {msg.recipeData.moodBenefit}
                          </p>
                          <div className="text-xs space-y-1">
                            <strong className="block font-semibold text-slate-800">Ingredients:</strong>
                            <ul className="list-disc list-inside text-slate-600 pl-1 space-y-0.5 text-xs">
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
                    <div className="pt-3 border-t border-slate-200/60 space-y-2">
                      <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider block">
                        Proposed Wellness & Lifestyle Tasks
                      </span>
                      {msg.suggestedTasks.map((st, i) => {
                        const key = `${msg.id}_${st.title}`;
                        const isApproved = acceptedTaskIds.has(key);
                        return (
                          <div key={i} className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs text-xs">
                            <div>
                              <strong className="text-slate-900 font-semibold">{st.title}</strong>
                              <div className="text-slate-500 text-[11px]">{st.estimatedDurationMinutes}m • {st.category}</div>
                            </div>
                            <button
                              onClick={() => handleAcceptTask(st, msg.id)}
                              disabled={isApproved}
                              className={`px-3 py-1.5 font-semibold rounded-xl flex items-center space-x-1 text-xs transition-all ${
                                isApproved 
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80' 
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

                  {msg.loggedCheckIn && (
                    <div className="flex items-center space-x-1.5 text-[11px] font-medium text-emerald-700 bg-emerald-50/70 border border-emerald-200/60 rounded-lg px-2 py-1 mt-2 w-fit">
                      <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>Saved quietly to Insights & Journal (Mood: {msg.loggedCheckIn.mood})</span>
                    </div>
                  )}

                  <div className={`text-[10px] text-right pt-1 ${isUser ? 'text-emerald-100' : 'text-slate-400'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center space-x-3.5 p-3.5 bg-white border border-slate-200/80 rounded-2xl shadow-2xs w-fit">
              <div className="bg-emerald-50 p-1.5 border border-emerald-200/60 rounded-xl shrink-0">
                <PixelCompanion 
                  type={companionType} 
                  emotion="thinking" 
                  size={38} 
                  showThoughtBubble={true} 
                  interactive={false} 
                />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-slate-800">
                  <span>Who-Hum is thinking</span>
                  <span className="flex space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Listening and capturing your day quietly in the background...
                </p>
              </div>
            </div>
          )}

          {/* Quick Conversation Starter Chips */}
          {messages.length <= 2 && (
            <div className="pt-2">
              <p className="text-[11px] font-semibold text-slate-500 mb-1.5">Try asking or sharing:</p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "🚲 I bought a cycle today!",
                  "🎯 Today was really productive at work",
                  "🌲 Suggest a quiet 15-minute walk",
                  "🍲 Quick healthy dinner idea",
                  "🧘 Feeling a bit overwhelmed today"
                ].map((promptText, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setInputPrompt(promptText);
                    }}
                    className="text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 rounded-xl px-2.5 py-1 transition-all"
                  >
                    {promptText}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="pt-4 border-t border-slate-100 flex items-center space-x-3">
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Tell your buddy about your day (e.g. 'I am so happy today I bought a cycle!')..."
            className="flex-1 text-sm bg-slate-50/60 border border-slate-200/80 rounded-xl px-4 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !inputPrompt.trim()}
            className="brutalist-btn-primary px-5 py-2.5 flex items-center space-x-2 rounded-xl disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
