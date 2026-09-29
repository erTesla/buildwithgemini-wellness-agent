import React, { useState, useRef, useEffect } from 'react';
import { 
  AIChatMessage, 
  WellnessCheckIn, 
  TaskItem, 
  HobbyItem, 
  UserPreferences 
} from '../types';
import { askAgentAssistant, CRISIS_SUPPORT_TEXT } from '../services/aiService';
import { formatCompanionLabel } from '../domain/companions';
import { 
  Bot, 
  Send, 
  Sparkles, 
  PlusCircle, 
  AlertTriangle, 
  Check, 
  MapPin, 
  Star, 
  ExternalLink,
  Utensils, 
  BookMarked,
  Sliders,
  Mic,
  MicOff,
  Volume2
} from 'lucide-react';
import { PixelCompanion, CompanionType, CompanionEmotion } from '../components/PixelCompanion';
import { useVoiceInput } from '../hooks/useVoiceInput';
import { playMessageChime, playTaskSuccess, playCompanionBoop } from '../services/soundEffects';

interface SimpleChatScreenProps {
  userId: string;
  checkins: WellnessCheckIn[];
  tasks: TaskItem[];
  hobbies: HobbyItem[];
  preferences: UserPreferences;
  onSaveTask: (task: TaskItem) => Promise<void>;
  onSaveHobby: (hobby: HobbyItem) => Promise<void>;
  onSaveCheckIn?: (checkin: WellnessCheckIn) => Promise<void>;
  onSwitchToAdvanced: () => void;
  companionType?: CompanionType;
  onChangeCompanionType?: (type: CompanionType) => void;
}

export const SimpleChatScreen: React.FC<SimpleChatScreenProps> = ({
  userId,
  checkins,
  tasks,
  hobbies,
  preferences,
  onSaveTask,
  onSaveHobby,
  onSaveCheckIn,
  onSwitchToAdvanced,
  companionType = 'puppy',
  onChangeCompanionType
}) => {
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'msg_welcome',
      role: 'assistant',
      content: `Hey buddy! 👋 How's your day going? Feel free to tell me what you're up to, how you're feeling, or anything fun that happened today. I'm here to listen and keep you company.`,
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [acceptedTaskIds, setAcceptedTaskIds] = useState<Set<string>>(new Set());
  const [acceptedHobbyIds, setAcceptedHobbyIds] = useState<Set<string>>(new Set());

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Browser-native speech recognition
  const { isListening, isSupported: voiceSupported, startListening, stopListening, error: voiceError } = useVoiceInput((spokenText) => {
    setInputPrompt(prev => prev ? `${prev} ${spokenText}` : spokenText);
  });

  const toggleVoiceRecording = () => {
    playCompanionBoop();
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Adjust textarea height dynamically
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputPrompt]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputPrompt.trim() || loading) return;

    if (isListening) {
      stopListening();
    }

    const userMsg: AIChatMessage = {
      id: 'user_' + Date.now(),
      role: 'user',
      content: inputPrompt.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputPrompt('');
    setLoading(true);
    playMessageChime(); // Gentle chime when sending

    try {
      const response = await askAgentAssistant(userMsg.content, {
        userId,
        checkins,
        tasks,
        hobbies,
        preferences
      });

      // Automatically log daily updates if detected!
      if (response.loggedCheckIn && onSaveCheckIn) {
        await onSaveCheckIn(response.loggedCheckIn);
      }

      setMessages(prev => [...prev, response]);
      playMessageChime(); // Gentle chime when reply arrives
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
      proposedReason: taskPartial.proposedReason || 'Suggested by AI companion',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await onSaveTask(newTask);
    playTaskSuccess(); // Upbeat arpeggio
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
    playTaskSuccess(); // Upbeat arpeggio
    setAcceptedHobbyIds(prev => new Set(prev).add(`${msgId}_${hobbyPartial.name}`));
  };

  const quickStarters = [
    "I am so happy today i bought a cycle!",
    "Feeling a little tired and stressed today.",
    "Dreaming of traveling to Kyoto or the Swiss Alps!",
    "Can you give me a comforting cheer-up recipe?"
  ];

  // Dynamic Contextual Smart Reply Chips
  const getContextualChips = (): string[] => {
    const lastBot = [...messages].reverse().find(m => m.role === 'assistant');
    if (!lastBot) return quickStarters;

    const text = lastBot.content.toLowerCase();
    if (text.includes('cycle') || text.includes('bike') || text.includes('ride') || text.includes('cycling')) {
      return [
        "What are great scenic cycling routes nearby? 🚴",
        "Help me pick a safe, stylish helmet!",
        "Felt so wonderful feeling the cool breeze!"
      ];
    }
    if (text.includes('soup') || text.includes('recipe') || text.includes('cook') || text.includes('dinner') || text.includes('meal')) {
      return [
        "Can you give me the full ingredient list? 🍲",
        "How long does this take to prepare?",
        "Sounds so cozy, saving this for tonight!"
      ];
    }
    if (text.includes('kyoto') || text.includes('travel') || text.includes('trip') || text.includes('alps') || text.includes('hotel') || text.includes('spots')) {
      return [
        "What's the best time of year to visit? 🌸",
        "Any hidden quiet cafes or temples?",
        "Add this to my bucket list!"
      ];
    }
    if (text.includes('stress') || text.includes('breath') || text.includes('overwhelm') || text.includes('vent') || text.includes('gentle') || text.includes('tired')) {
      return [
        "Taking a quiet 10-minute break now 🌿",
        "Making a warm mug of chamomile tea ☕",
        "Thanks for listening, feeling lighter already 🤍"
      ];
    }
    return [
      "Tell me more about this!",
      "How can I build this into a gentle habit?",
      "Let's celebrate this as a small win 🎉"
    ];
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

  const lastAssistantMsg = [...messages].reverse().find(m => m.role === 'assistant');
  const headerEmotion: CompanionEmotion = loading 
    ? 'thinking' 
    : lastAssistantMsg 
    ? getMessageEmotion(lastAssistantMsg) 
    : 'idle';

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100dvh-130px)] md:h-[calc(100vh-160px)] space-y-3 sm:space-y-4 px-1 sm:px-4">
      {/* Friendly Airy Chat Header with Pixel Companion */}
      <div className="p-3.5 sm:p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs flex justify-between items-center gap-2">
        <div className="flex items-center space-x-3">
          <div className="p-1 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/60 shadow-2xs flex items-center justify-center shrink-0">
            <PixelCompanion 
              type={companionType} 
              emotion={headerEmotion} 
              size={42} 
              interactive={true} 
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Who-Hum Buddy</h2>
              <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            
            {/* Companion Status */}
            <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-500">
              <span>Companion:</span>
              <span className="font-semibold text-slate-800">
                {formatCompanionLabel(companionType)}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onSwitchToAdvanced}
          className="text-xs font-semibold px-3 py-1.5 sm:py-2 border border-slate-200/80 rounded-xl bg-white hover:bg-slate-50 text-slate-700 transition-all shadow-2xs flex items-center space-x-1.5 shrink-0"
          title="Switch to full dashboard with charts, tasks and hobbies"
        >
          <Sliders className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden sm:inline">Advanced View</span>
        </button>
      </div>

      {/* Spacious Main Chat Scroll Container */}
      <div className="flex-1 min-h-0 bg-white border border-slate-200/80 rounded-2xl shadow-xs p-3.5 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              {/* Avatar with Breathing Room & Pixel Companion */}
              {isUser ? (
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                  YOU
                </div>
              ) : (
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/60 flex items-center justify-center shrink-0 shadow-2xs p-0.5">
                  <PixelCompanion 
                    type={companionType} 
                    emotion={getMessageEmotion(msg)} 
                    size={36} 
                    interactive={true}
                    showThoughtBubble={false}
                  />
                </div>
              )}

              {/* Generous Message Bubble */}
              <div className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-4 sm:p-5 space-y-3 leading-relaxed shadow-xs ${
                isUser 
                  ? 'bg-emerald-600 text-white rounded-tr-xs' 
                  : msg.crisisAlert 
                  ? 'bg-rose-50 border border-rose-200 text-rose-900 rounded-tl-xs' 
                  : 'bg-white border border-slate-200/80 text-slate-800 rounded-tl-xs'
              }`}>
                {msg.crisisAlert && (
                  <div className="flex items-center space-x-2 text-rose-600 font-bold text-xs mb-1">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Emergency Crisis Support Protocol</span>
                  </div>
                )}

                <div className={`text-sm leading-relaxed whitespace-pre-line ${isUser ? 'text-white font-normal' : 'text-slate-800 font-normal'}`}>
                  {msg.content}
                </div>

                {/* Travel Spots with Google Maps & Ratings */}
                {msg.travelSpots && msg.travelSpots.length > 0 && (
                  <div className="pt-3 border-t border-slate-200/70 space-y-3">
                    <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 border border-emerald-200/60 rounded-lg inline-block">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Google Maps Places & Community Ratings</span>
                    </div>
                    <div className="grid grid-cols-1 gap-2.5">
                      {msg.travelSpots.map((spot, idx) => (
                        <div key={idx} className="p-3.5 bg-slate-50/70 border border-slate-200/70 rounded-xl space-y-1.5">
                          <div className="flex justify-between items-start">
                            <h4 className="font-semibold text-sm text-slate-900">{spot.name}</h4>
                            <span className="flex items-center space-x-1 bg-amber-50 text-amber-800 border border-amber-200/60 px-2 py-0.5 rounded-full text-xs font-semibold">
                              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                              <span>{spot.rating}</span>
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 leading-normal">{spot.description}</p>
                          <div className="flex justify-between items-center pt-1 text-xs text-slate-500">
                            <span>{spot.reviewCount.toLocaleString()} reviews</span>
                            <a 
                              href={spot.mapsUrl} 
                              target="_blank" 
                              rel="noreferrer"
                              className="font-medium text-emerald-700 hover:text-emerald-800 flex items-center space-x-1 hover:underline"
                            >
                              <span>View on Maps</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cheer-Up Recipe Card with Image */}
                {msg.recipeData && (
                  <div className="pt-3 border-t border-slate-200/70 space-y-3">
                    <div className="flex items-center space-x-2 text-xs font-semibold text-teal-800 bg-teal-50 px-2.5 py-1 border border-teal-200/60 rounded-lg inline-block">
                      <Utensils className="w-3.5 h-3.5 text-teal-600" />
                      <span>Cheer-Up Recipe Visualization</span>
                    </div>

                    <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-white shadow-2xs">
                      <img 
                        src={msg.recipeData.imageUrl} 
                        alt={msg.recipeData.dishName}
                        className="w-full h-44 object-cover border-b border-slate-200/70" 
                      />
                      <div className="p-3.5 space-y-2">
                        <div className="flex justify-between items-center">
                          <h4 className="font-semibold text-sm text-slate-900">{msg.recipeData.dishName}</h4>
                          <span className="text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/60 px-2 py-0.5 rounded-full">
                            {msg.recipeData.prepTimeMinutes} mins
                          </span>
                        </div>
                        <p className="text-xs font-medium text-emerald-800 bg-emerald-50/80 p-2.5 border border-emerald-200/60 rounded-lg leading-relaxed">
                          💡 {msg.recipeData.moodBenefit}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Suggested Tasks */}
                {msg.suggestedTasks && msg.suggestedTasks.length > 0 && (
                  <div className="pt-3 border-t border-slate-200/70 space-y-2">
                    <span className="text-xs font-semibold text-slate-600 block">
                      Suggested Actions:
                    </span>
                    <div className="space-y-1.5">
                      {msg.suggestedTasks.map((task, idx) => {
                        const isAccepted = acceptedTaskIds.has(`${msg.id}_${task.title}`);
                        return (
                          <div 
                            key={idx} 
                            className="flex items-center justify-between p-2.5 bg-slate-50/70 border border-slate-200/70 rounded-xl text-xs font-medium"
                          >
                            <span className="text-slate-800 truncate mr-3">{task.title}</span>
                            {isAccepted ? (
                              <span className="flex items-center space-x-1 text-emerald-700 text-xs shrink-0 font-medium">
                                <Check className="w-3.5 h-3.5" />
                                <span>Added</span>
                              </span>
                            ) : (
                              <button
                                onClick={() => handleAcceptTask(task, msg.id)}
                                className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-lg text-xs hover:bg-emerald-100 transition-all shrink-0 flex items-center space-x-1 font-semibold"
                              >
                                <PlusCircle className="w-3.5 h-3.5" />
                                <span>Add</span>
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Suggested Hobbies */}
                {msg.suggestedHobbies && msg.suggestedHobbies.length > 0 && (
                  <div className="pt-3 border-t border-slate-200/70 space-y-2">
                    <span className="text-xs font-semibold text-slate-600 block">
                      Explore New Hobby:
                    </span>
                    <div className="space-y-1.5">
                      {msg.suggestedHobbies.map((hobby, idx) => {
                        const isAccepted = acceptedHobbyIds.has(`${msg.id}_${hobby.name}`);
                        return (
                          <div 
                            key={idx} 
                            className="flex items-center justify-between p-2.5 bg-slate-50/70 border border-slate-200/70 rounded-xl text-xs font-medium"
                          >
                            <span className="text-slate-800 truncate mr-3">{hobby.name}</span>
                            {isAccepted ? (
                              <span className="flex items-center space-x-1 text-emerald-700 text-xs shrink-0 font-medium">
                                <Check className="w-3.5 h-3.5" />
                                <span>Tracking</span>
                              </span>
                            ) : (
                              <button
                                onClick={() => handleAcceptHobby(hobby, msg.id)}
                                className="px-2.5 py-1 bg-teal-50 text-teal-700 border border-teal-200/60 rounded-lg text-xs hover:bg-teal-100 transition-all shrink-0 flex items-center space-x-1 font-semibold"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Track</span>
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center space-x-3.5 p-3.5 bg-white border border-slate-200/80 rounded-2xl shadow-xs w-fit">
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-1 border border-emerald-200/60 rounded-xl shrink-0">
              <PixelCompanion 
                type={companionType} 
                emotion="thinking" 
                size={40} 
                showThoughtBubble={true} 
                interactive={false} 
              />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center space-x-2 text-xs font-semibold text-slate-800">
                <span>Who-Hum is thinking</span>
                <span className="flex space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Pondering with care & updating your diary in the background...
              </p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Contextual Smart Reply Chips */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-semibold text-slate-500">
            {messages.length <= 1 ? 'Quick Starters:' : 'Smart Reply Suggestions:'}
          </span>
          {voiceSupported && (
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              🎙️ Voice typing available
            </span>
          )}
        </div>
        <div className="flex space-x-2 overflow-x-auto no-scrollbar py-1">
          {getContextualChips().map((chip, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                playCompanionBoop();
                setInputPrompt(chip);
              }}
              className="text-xs font-medium bg-white hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 border border-slate-200/80 px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all shadow-2xs active:scale-95"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Spacious Input Message Form with Voice & Auto-Expanding Textarea */}
      <form onSubmit={handleSendMessage} className="space-y-1 sm:space-y-1.5">
        <div className="flex items-end space-x-2 bg-white border border-slate-200/90 rounded-2xl p-1.5 sm:p-2 shadow-xs focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all">
          {/* Voice Dictation Button */}
          {voiceSupported && (
            <button
              type="button"
              onClick={toggleVoiceRecording}
              className={`p-2 sm:p-2.5 rounded-xl border transition-all flex items-center justify-center shrink-0 ${
                isListening 
                  ? 'bg-rose-500 text-white border-rose-600 animate-pulse' 
                  : 'bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100 hover:text-slate-900'
              }`}
              title={isListening ? 'Stop listening' : 'Dictate with your voice (Web Speech API)'}
            >
              {isListening ? <MicOff className="w-4 h-4 animate-bounce" /> : <Mic className="w-4 h-4" />}
            </button>
          )}

          {/* Auto-Expanding Multiline Textarea */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={
              isListening 
                ? 'Listening to you speak...' 
                : "Tell your buddy about your day..."
            }
            disabled={loading}
            className="flex-1 text-xs sm:text-sm font-medium p-1.5 border-none outline-none resize-none max-h-32 bg-transparent text-slate-900 placeholder:text-slate-400"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={loading || !inputPrompt.trim()}
            className="brutalist-btn-primary px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold flex items-center space-x-1.5 rounded-xl shrink-0 disabled:opacity-50"
          >
            <span className="hidden sm:inline">Send</span>
            <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Input Helper Text */}
        <div className="flex justify-between items-center px-2 text-[10px] text-slate-400">
          <span>{isListening ? '🔴 Recording voice...' : 'Press Enter to send • Shift+Enter for new line'}</span>
          <span>Logged quietly in background</span>
        </div>
      </form>
    </div>
  );
};
