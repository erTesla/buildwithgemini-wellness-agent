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
      <div className="p-3 sm:p-5 bg-white border-2 border-black rounded-lg shadow-[3px_3px_0px_#000000] sm:shadow-[4px_4px_0px_#000000] flex justify-between items-center gap-2">
        <div className="flex items-center space-x-2.5 sm:space-x-3.5">
          <div className="p-1 rounded-xl bg-[#fef08a] border-2 border-black shadow-[2px_2px_0px_#000000] sm:shadow-[3px_3px_0px_#000000] flex items-center justify-center shrink-0">
            <PixelCompanion 
              type={companionType} 
              emotion={headerEmotion} 
              size={40} 
              interactive={true} 
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h2 className="text-base sm:text-lg font-black text-black">Who-Hum Buddy</h2>
              <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-500 animate-pulse border border-black"></span>
            </div>
            
            {/* Companion Status */}
            <div className="flex items-center gap-1.5 mt-0.5 text-[11px] sm:text-xs text-zinc-500 font-mono">
              <span>Companion:</span>
              <span className="font-bold text-black">
                {formatCompanionLabel(companionType)}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onSwitchToAdvanced}
          className="text-xs font-bold font-mono px-2.5 sm:px-3.5 py-1.5 sm:py-2 border-2 border-black rounded-md bg-zinc-50 hover:bg-black hover:text-white transition-all shadow-[2px_2px_0px_#000000] flex items-center space-x-1.5 shrink-0"
          title="Switch to full dashboard with charts, tasks and hobbies"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Advanced View</span>
        </button>
      </div>

      {/* Spacious Main Chat Scroll Container */}
      <div className="flex-1 min-h-0 bg-white border-2 border-black rounded-lg shadow-[3px_3px_0px_#000000] sm:shadow-[5px_5px_0px_#000000] p-3 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-3.5 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              {/* Avatar with Breathing Room & Pixel Companion */}
              {isUser ? (
                <div className="w-9 h-9 rounded-lg border-2 border-black flex items-center justify-center font-black text-xs shrink-0 shadow-[2px_2px_0px_#000000] bg-black text-white">
                  YOU
                </div>
              ) : (
                <div className="w-10 h-10 rounded-lg border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#000000] bg-[#fef08a] p-0.5">
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
              <div className={`max-w-[80%] rounded-lg border-2 border-black p-4 sm:p-5 space-y-3.5 leading-relaxed ${
                isUser 
                  ? 'bg-[#bae6fd] text-black shadow-[4px_4px_0px_#000000]' 
                  : msg.crisisAlert 
                  ? 'bg-[#fecaca] text-black shadow-[4px_4px_0px_#000000]' 
                  : 'bg-[#fafafa] text-black shadow-[4px_4px_0px_#000000]'
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

                {/* Travel Spots with Google Maps & Ratings */}
                {msg.travelSpots && msg.travelSpots.length > 0 && (
                  <div className="pt-3 border-t-2 border-black space-y-3">
                    <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-black bg-[#fef08a] px-2.5 py-1 border border-black rounded inline-block shadow-[1px_1px_0px_#000000]">
                      <MapPin className="w-3.5 h-3.5 text-black" />
                      <span>Google Maps Places & Community Ratings</span>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {msg.travelSpots.map((spot, idx) => (
                        <div key={idx} className="p-3.5 bg-white border-2 border-black rounded shadow-[2px_2px_0px_#000000] space-y-2">
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-sm text-black">{spot.name}</h4>
                            <span className="flex items-center space-x-1 bg-amber-100 text-amber-900 border border-black px-2 py-0.5 rounded text-xs font-bold">
                              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                              <span>{spot.rating}</span>
                            </span>
                          </div>
                          <p className="text-xs text-zinc-600 leading-normal">{spot.description}</p>
                          <div className="flex justify-between items-center pt-1 text-xs font-mono">
                            <span className="text-zinc-500">{spot.reviewCount.toLocaleString()} reviews</span>
                            <a 
                              href={spot.mapsUrl} 
                              target="_blank" 
                              rel="noreferrer"
                              className="font-bold text-black flex items-center space-x-1 underline hover:text-blue-700"
                            >
                              <span>View on Google Maps</span>
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
                  <div className="pt-3 border-t-2 border-black space-y-3">
                    <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-black bg-[#bbf7d0] px-2.5 py-1 border border-black rounded inline-block shadow-[1px_1px_0px_#000000]">
                      <Utensils className="w-3.5 h-3.5 text-black" />
                      <span>Cheer-Up Recipe Visualization</span>
                    </div>

                    <div className="border-2 border-black rounded-lg overflow-hidden bg-white shadow-[3px_3px_0px_#000000]">
                      <img 
                        src={msg.recipeData.imageUrl} 
                        alt={msg.recipeData.dishName}
                        className="w-full h-44 object-cover border-b-2 border-black" 
                      />
                      <div className="p-3.5 space-y-2">
                        <div className="flex justify-between items-center">
                          <h4 className="font-black text-sm text-black">{msg.recipeData.dishName}</h4>
                          <span className="text-xs font-mono font-bold bg-[#fef08a] px-2 py-0.5 border border-black rounded">
                            {msg.recipeData.prepTimeMinutes} mins
                          </span>
                        </div>
                        <p className="text-xs font-medium text-emerald-900 bg-emerald-50 p-2 border border-emerald-300 rounded leading-relaxed">
                          💡 {msg.recipeData.moodBenefit}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Suggested Tasks */}
                {msg.suggestedTasks && msg.suggestedTasks.length > 0 && (
                  <div className="pt-3 border-t-2 border-black space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 block">
                      Suggested Actions:
                    </span>
                    <div className="space-y-2">
                      {msg.suggestedTasks.map((task, idx) => {
                        const isAccepted = acceptedTaskIds.has(`${msg.id}_${task.title}`);
                        return (
                          <div 
                            key={idx} 
                            className="flex items-center justify-between p-2.5 bg-white border-2 border-black rounded shadow-[2px_2px_0px_#000000] text-xs font-bold"
                          >
                            <span className="text-black truncate mr-3">{task.title}</span>
                            {isAccepted ? (
                              <span className="flex items-center space-x-1 text-emerald-700 text-xs shrink-0 font-mono">
                                <Check className="w-4 h-4" />
                                <span>Added</span>
                              </span>
                            ) : (
                              <button
                                onClick={() => handleAcceptTask(task, msg.id)}
                                className="px-2.5 py-1 bg-[#facc15] text-black border border-black rounded text-xs hover:bg-black hover:text-white transition-all shrink-0 flex items-center space-x-1 shadow-[1px_1px_0px_#000000]"
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
                  <div className="pt-3 border-t-2 border-black space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 block">
                      Explore New Hobby:
                    </span>
                    <div className="space-y-2">
                      {msg.suggestedHobbies.map((hobby, idx) => {
                        const isAccepted = acceptedHobbyIds.has(`${msg.id}_${hobby.name}`);
                        return (
                          <div 
                            key={idx} 
                            className="flex items-center justify-between p-2.5 bg-white border-2 border-black rounded shadow-[2px_2px_0px_#000000] text-xs font-bold"
                          >
                            <span className="text-black truncate mr-3">{hobby.name}</span>
                            {isAccepted ? (
                              <span className="flex items-center space-x-1 text-emerald-700 text-xs shrink-0 font-mono">
                                <Check className="w-4 h-4" />
                                <span>Tracking</span>
                              </span>
                            ) : (
                              <button
                                onClick={() => handleAcceptHobby(hobby, msg.id)}
                                className="px-2.5 py-1 bg-[#bae6fd] text-black border border-black rounded text-xs hover:bg-black hover:text-white transition-all shrink-0 flex items-center space-x-1 shadow-[1px_1px_0px_#000000]"
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
          <div className="flex items-center space-x-3.5 p-3.5 bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_#000000] w-fit">
            <div className="bg-[#fef08a] p-1 border-2 border-black rounded-lg shadow-[2px_2px_0px_#000000] shrink-0">
              <PixelCompanion 
                type={companionType} 
                emotion="thinking" 
                size={42} 
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
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">
            {messages.length <= 1 ? 'Quick Starters:' : 'Smart Reply Suggestions:'}
          </span>
          {voiceSupported && (
            <span className="text-[10px] font-mono text-zinc-500 hidden sm:inline">
              🎙️ Voice typing available
            </span>
          )}
        </div>
        <div className="flex space-x-2.5 overflow-x-auto no-scrollbar py-1">
          {getContextualChips().map((chip, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                playCompanionBoop();
                setInputPrompt(chip);
              }}
              className="text-xs font-bold font-mono bg-white border-2 border-black px-3.5 py-1.5 rounded-lg whitespace-nowrap hover:bg-[#fef08a] transition-all shadow-[2px_2px_0px_#000000] active:translate-y-0.5"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Spacious Input Message Form with Voice & Auto-Expanding Textarea */}
      <form onSubmit={handleSendMessage} className="space-y-1 sm:space-y-1.5">
        <div className="flex items-end space-x-1.5 sm:space-x-2.5 bg-white border-2 border-black rounded-xl p-1.5 sm:p-2 shadow-[3px_3px_0px_#000000] sm:shadow-[4px_4px_0px_#000000] transition-all focus-within:shadow-[5px_5px_0px_#000000]">
          {/* Voice Dictation Button */}
          {voiceSupported && (
            <button
              type="button"
              onClick={toggleVoiceRecording}
              className={`p-2 sm:p-2.5 rounded-lg border-2 border-black transition-all flex items-center justify-center shrink-0 shadow-[1px_1px_0px_#000000] ${
                isListening 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : 'bg-zinc-100 text-zinc-700 hover:bg-[#fef08a] hover:text-black'
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
            className="flex-1 text-xs sm:text-sm font-medium p-1 sm:p-1.5 border-none outline-none resize-none max-h-32 bg-transparent text-black"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={loading || !inputPrompt.trim()}
            className="brutalist-btn-primary px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-black flex items-center space-x-1 sm:space-x-1.5 rounded-lg shadow-[2px_2px_0px_#000000] shrink-0 disabled:opacity-50"
          >
            <span className="hidden sm:inline">Send</span>
            <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Input Helper Text */}
        <div className="flex justify-between items-center px-2 text-[10px] font-mono text-zinc-500">
          <span>{isListening ? '🔴 Recording voice...' : 'Press Enter to send • Shift+Enter for new line'}</span>
          <span>Logged quietly in background</span>
        </div>
      </form>
    </div>
  );
};
