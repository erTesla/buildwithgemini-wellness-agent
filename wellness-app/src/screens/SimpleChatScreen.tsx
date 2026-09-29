import React, { useState, useRef, useEffect } from 'react';
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
  Check, 
  MapPin, 
  Star, 
  ExternalLink, 
  Utensils, 
  BookMarked,
  Sliders,
  Compass
} from 'lucide-react';

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
  onSwitchToAdvanced
}) => {
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'msg_welcome',
      role: 'assistant',
      content: `Hey buddy! 👋 Tell me about your day—how are you feeling? Did anything fun or exciting happen? (Like buying something cool, finishing a project, or feeling tired?)\n\nJust type whatever is on your mind. I'll listen, chat with you, and automatically log your mood and daily updates for you!`,
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [acceptedTaskIds, setAcceptedTaskIds] = useState<Set<string>>(new Set());
  const [acceptedHobbyIds, setAcceptedHobbyIds] = useState<Set<string>>(new Set());

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

      // Automatically log daily updates if detected!
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
      proposedReason: taskPartial.proposedReason || 'Suggested by AI companion',
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

  const quickStarters = [
    "I am so happy today i boud a cyle.",
    "Feeling a little tired and stressed today.",
    "Dreaming of traveling to Kyoto or the Swiss Alps!",
    "Can you give me a comforting cheer-up recipe?"
  ];

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-140px)] min-h-[550px] space-y-3">
      {/* Friendly Chat Header with Switcher */}
      <div className="p-3.5 bg-white border-2 border-black rounded shadow-[3px_3px_0px_#000000] flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded bg-[#facc15] border-2 border-black flex items-center justify-center text-black font-black">
            <Bot className="w-5 h-5 text-black" />
          </div>
          <div>
            <h2 className="text-base font-black text-black flex items-center gap-2">
              <span>Your AI Buddy</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </h2>
            <p className="text-xs font-mono font-medium text-zinc-600">
              Simple Chat Mode • Type your day, we log the rest.
            </p>
          </div>
        </div>

        <button
          onClick={onSwitchToAdvanced}
          className="text-xs font-bold font-mono px-3 py-1.5 border-2 border-black rounded bg-zinc-100 hover:bg-black hover:text-white transition-all shadow-[2px_2px_0px_#000000] flex items-center space-x-1"
          title="Switch to full dashboard with charts, tasks and hobbies"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Advanced Mode</span>
        </button>
      </div>

      {/* Main Chat Scroll Container */}
      <div className="flex-1 bg-zinc-50 border-2 border-black rounded shadow-[4px_4px_0px_#000000] p-4 overflow-y-auto space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-2.5 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded border-2 border-black flex items-center justify-center font-bold text-xs shrink-0 ${
                isUser ? 'bg-black text-white' : 'bg-[#facc15] text-black'
              }`}>
                {isUser ? 'YOU' : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div className={`max-w-[85%] rounded border-2 border-black p-3.5 space-y-2.5 ${
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

                {/* Auto Logged Daily Check-in Notification Badge */}
                {msg.loggedCheckIn && (
                  <div className="bg-[#fef08a] border-2 border-black p-2.5 rounded shadow-[2px_2px_0px_#000000] space-y-1">
                    <div className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-black">
                      <BookMarked className="w-3.5 h-3.5 text-black" />
                      <span>Daily Wellness Entry Automatically Logged!</span>
                    </div>
                    <p className="text-xs font-mono text-zinc-800">
                      <strong>Mood:</strong> {msg.loggedCheckIn.mood.toUpperCase()} (Energy: {msg.loggedCheckIn.energyLevel}/5)
                    </p>
                    <p className="text-xs text-zinc-700 italic">
                      "{msg.loggedCheckIn.journalText}"
                    </p>
                  </div>
                )}

                {/* Travel Spots with Google Maps & Ratings */}
                {msg.travelSpots && msg.travelSpots.length > 0 && (
                  <div className="pt-2 border-t-2 border-black space-y-2">
                    <div className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-black bg-[#fef08a] px-2 py-0.5 border border-black inline-block">
                      <MapPin className="w-3 h-3 text-black" />
                      <span>Google Maps Places & Ratings</span>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {msg.travelSpots.map((spot, idx) => (
                        <div key={idx} className="p-2.5 bg-zinc-50 border-2 border-black rounded shadow-[2px_2px_0px_#000000] space-y-1">
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-xs text-black">{spot.name}</h4>
                            <span className="flex items-center space-x-1 bg-amber-100 text-amber-900 border border-black px-1.5 py-0.5 rounded text-[10px] font-bold">
                              <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                              <span>{spot.rating}</span>
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-600 leading-normal">{spot.description}</p>
                          <div className="flex justify-between items-center pt-1 text-[10px] font-mono">
                            <span className="text-zinc-500">{spot.reviewCount.toLocaleString()} reviews</span>
                            <a 
                              href={spot.mapsUrl} 
                              target="_blank" 
                              rel="noreferrer"
                              className="font-bold text-black flex items-center space-x-1 underline hover:text-blue-700"
                            >
                              <span>View on Google Maps</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cheer-Up Recipe Card with Image */}
                {msg.recipeData && (
                  <div className="pt-2 border-t-2 border-black space-y-2">
                    <div className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-black bg-[#bbf7d0] px-2 py-0.5 border border-black inline-block">
                      <Utensils className="w-3 h-3 text-black" />
                      <span>Cheer-Up Recipe Visualization</span>
                    </div>

                    <div className="border-2 border-black rounded overflow-hidden bg-white shadow-[2px_2px_0px_#000000]">
                      <img 
                        src={msg.recipeData.imageUrl} 
                        alt={msg.recipeData.dishName}
                        className="w-full h-36 object-cover border-b-2 border-black" 
                      />
                      <div className="p-2.5 space-y-1.5">
                        <div className="flex justify-between items-center">
                          <h4 className="font-black text-xs text-black">{msg.recipeData.dishName}</h4>
                          <span className="text-[10px] font-mono font-bold bg-[#fef08a] px-1.5 py-0.5 border border-black rounded">
                            {msg.recipeData.prepTimeMinutes} mins
                          </span>
                        </div>
                        <p className="text-[11px] font-medium text-emerald-800 bg-emerald-50 p-1.5 border border-emerald-300 rounded">
                          💡 {msg.recipeData.moodBenefit}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Suggested Tasks */}
                {msg.suggestedTasks && msg.suggestedTasks.length > 0 && (
                  <div className="pt-2 border-t-2 border-black space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">
                      Suggested Actions:
                    </span>
                    <div className="space-y-1.5">
                      {msg.suggestedTasks.map((task, idx) => {
                        const isAccepted = acceptedTaskIds.has(`${msg.id}_${task.title}`);
                        return (
                          <div 
                            key={idx} 
                            className="flex items-center justify-between p-2 bg-zinc-50 border-2 border-black rounded shadow-[2px_2px_0px_#000000] text-xs font-bold"
                          >
                            <span className="text-black truncate mr-2">{task.title}</span>
                            {isAccepted ? (
                              <span className="flex items-center space-x-1 text-emerald-700 text-xs shrink-0">
                                <Check className="w-3.5 h-3.5" />
                                <span>Added</span>
                              </span>
                            ) : (
                              <button
                                onClick={() => handleAcceptTask(task, msg.id)}
                                className="px-2 py-1 bg-[#facc15] text-black border border-black rounded text-[11px] hover:bg-black hover:text-white transition-all shrink-0 flex items-center space-x-1 shadow-[1px_1px_0px_#000000]"
                              >
                                <PlusCircle className="w-3 h-3" />
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
                  <div className="pt-2 border-t-2 border-black space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">
                      Explore New Hobby:
                    </span>
                    <div className="space-y-1.5">
                      {msg.suggestedHobbies.map((hobby, idx) => {
                        const isAccepted = acceptedHobbyIds.has(`${msg.id}_${hobby.name}`);
                        return (
                          <div 
                            key={idx} 
                            className="flex items-center justify-between p-2 bg-zinc-50 border-2 border-black rounded shadow-[2px_2px_0px_#000000] text-xs font-bold"
                          >
                            <span className="text-black truncate mr-2">{hobby.name}</span>
                            {isAccepted ? (
                              <span className="flex items-center space-x-1 text-emerald-700 text-xs shrink-0">
                                <Check className="w-3.5 h-3.5" />
                                <span>Tracking</span>
                              </span>
                            ) : (
                              <button
                                onClick={() => handleAcceptHobby(hobby, msg.id)}
                                className="px-2 py-1 bg-[#bae6fd] text-black border border-black rounded text-[11px] hover:bg-black hover:text-white transition-all shrink-0 flex items-center space-x-1 shadow-[1px_1px_0px_#000000]"
                              >
                                <Sparkles className="w-3 h-3" />
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
          <div className="flex items-center space-x-2 p-3 bg-white border-2 border-black rounded shadow-[2px_2px_0px_#000000] w-fit">
            <span className="w-2 h-2 rounded-full bg-black animate-ping"></span>
            <span className="text-xs font-bold font-mono">Your buddy is listening and writing back...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Strip */}
      <div className="flex space-x-2 overflow-x-auto no-scrollbar py-1">
        {quickStarters.map((qs, i) => (
          <button
            key={i}
            onClick={() => setInputPrompt(qs)}
            className="text-[11px] font-bold font-mono bg-white border border-black px-2.5 py-1 rounded whitespace-nowrap hover:bg-[#fef08a] transition-all shadow-[1px_1px_0px_#000000]"
          >
            "{qs}"
          </button>
        ))}
      </div>

      {/* Input Message Form */}
      <form onSubmit={handleSendMessage} className="flex space-x-2">
        <input
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          placeholder="Tell your buddy about your day (e.g. 'I am so happy today i bought a cycle')..."
          disabled={loading}
          className="flex-1 text-sm font-medium py-3 px-4"
        />
        <button
          type="submit"
          disabled={loading || !inputPrompt.trim()}
          className="brutalist-btn-primary px-5 py-3 text-sm font-black flex items-center space-x-1.5"
        >
          <span>Send</span>
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
