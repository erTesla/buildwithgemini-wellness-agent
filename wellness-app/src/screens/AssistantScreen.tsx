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
  Check 
} from 'lucide-react';

interface AssistantScreenProps {
  userId: string;
  checkins: WellnessCheckIn[];
  tasks: TaskItem[];
  hobbies: HobbyItem[];
  preferences: UserPreferences;
  onSaveTask: (task: TaskItem) => Promise<void>;
  onSaveHobby: (hobby: HobbyItem) => Promise<void>;
}

export const AssistantScreen: React.FC<AssistantScreenProps> = ({
  userId,
  checkins,
  tasks,
  hobbies,
  preferences,
  onSaveTask,
  onSaveHobby
}) => {
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'msg_welcome',
      role: 'assistant',
      content: `Hello! I am your autonomous Wellness & Activity Assistant. I can help adapt your schedule, break big goals into manageable steps, suggest mindful recipes, or propose restorative hobbies based on your current energy.\n\nHow can I support your well-being today?`,
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
        checkins,
        tasks,
        hobbies,
        preferences
      });
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
      name: hobbyPartial.name || 'New Hobby',
      category: hobbyPartial.category || 'creative',
      status: 'exploring',
      frequencyPerWeek: hobbyPartial.frequencyPerWeek || 2,
      estimatedCost: hobbyPartial.estimatedCost || 'low',
      startedAt: new Date().toISOString()
    };

    await onSaveHobby(newHobby);
    setAcceptedHobbyIds(prev => new Set(prev).add(`${msgId}_${hobbyPartial.name}`));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="material-card-flat p-6 bg-white flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-normal text-[#202124]">
            AI <span className="font-semibold text-[#1a73e8]">Wellness & Hobby Partner</span>
          </h1>
          <p className="text-sm text-[#5f6368] mt-1">
            Collaborate on your routine. Suggestions explicitly distinguish between existing, proposed, and approved items.
          </p>
        </div>
        <div className="w-10 h-10 rounded-full bg-[#e8f0fe] flex items-center justify-center text-[#1a73e8]">
          <Bot className="w-6 h-6" />
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="material-card p-6 bg-white min-h-[420px] max-h-[580px] overflow-y-auto space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
                isUser ? 'bg-[#202124] text-white' : 'bg-[#1a73e8] text-white'
              }`}>
                {isUser ? 'You' : <Bot className="w-4 h-4" />}
              </div>

              <div className={`max-w-[80%] rounded-lg p-4 space-y-3 ${
                isUser 
                  ? 'bg-[#e8f0fe] text-[#202124] border border-[#d2e3fc]' 
                  : msg.crisisAlert 
                  ? 'bg-[#fdf2f2] border border-[#fad2cf] text-[#202124]' 
                  : 'bg-[#f8f9fa] border border-[#dadce0] text-[#202124]'
              }`}>
                {msg.crisisAlert && (
                  <div className="flex items-center space-x-2 text-[#d93025] font-semibold text-xs mb-1">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Emergency Crisis Support Protocol</span>
                  </div>
                )}

                <div className="text-sm whitespace-pre-line leading-relaxed">
                  {msg.content}
                </div>

                {/* Proposed Tasks Attachment */}
                {msg.suggestedTasks && msg.suggestedTasks.length > 0 && (
                  <div className="pt-2 border-t border-[#dadce0] space-y-2">
                    <span className="text-xs font-semibold text-[#1a73e8] uppercase tracking-wider block">
                      Proposed Task (Requires Approval)
                    </span>
                    {msg.suggestedTasks.map((st, i) => {
                      const key = `${msg.id}_${st.title}`;
                      const isApproved = acceptedTaskIds.has(key);
                      return (
                        <div key={i} className="flex justify-between items-center bg-white p-2.5 rounded border border-[#dadce0] text-xs">
                          <div>
                            <strong>{st.title}</strong>
                            <div className="text-[#5f6368]">{st.estimatedDurationMinutes}m • {st.category}</div>
                          </div>
                          <button
                            onClick={() => handleAcceptTask(st, msg.id)}
                            disabled={isApproved}
                            className={`px-3 py-1 rounded font-medium flex items-center space-x-1 ${
                              isApproved 
                                ? 'bg-[#e6f4ea] text-[#1e8e3e]' 
                                : 'google-btn-primary text-xs'
                            }`}
                          >
                            {isApproved ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Approved</span>
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

                {/* Proposed Hobbies Attachment */}
                {msg.suggestedHobbies && msg.suggestedHobbies.length > 0 && (
                  <div className="pt-2 border-t border-[#dadce0] space-y-2">
                    <span className="text-xs font-semibold text-[#1e8e3e] uppercase tracking-wider block">
                      Proposed Hobby Exploration
                    </span>
                    {msg.suggestedHobbies.map((sh, i) => {
                      const key = `${msg.id}_${sh.name}`;
                      const isApproved = acceptedHobbyIds.has(key);
                      return (
                        <div key={i} className="flex justify-between items-center bg-white p-2.5 rounded border border-[#dadce0] text-xs">
                          <div>
                            <strong>{sh.name}</strong>
                            <div className="text-[#5f6368]">{sh.category} • Cost: {sh.estimatedCost}</div>
                          </div>
                          <button
                            onClick={() => handleAcceptHobby(sh, msg.id)}
                            disabled={isApproved}
                            className={`px-3 py-1 rounded font-medium flex items-center space-x-1 ${
                              isApproved 
                                ? 'bg-[#e6f4ea] text-[#1e8e3e]' 
                                : 'google-btn-primary text-xs'
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
                                <span>Save Hobby</span>
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="text-[10px] text-[#5f6368] text-right">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center space-x-2 text-xs text-[#5f6368] bg-[#f8f9fa] p-3 rounded-lg w-max border border-[#dadce0]">
            <Sparkles className="w-4 h-4 text-[#1a73e8] animate-spin" />
            <span>Consulting contextual memory and crafting response...</span>
          </div>
        )}
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex flex-wrap gap-2 text-xs">
        {[
          "Suggest a healthy 20-min dinner recipe",
          "I only have 30 minutes and low energy. What can I do?",
          "Suggest a local quiet place to read or unwind",
          "Help me explore an accessible weekend hobby"
        ].map((prompt, i) => (
          <button
            key={i}
            onClick={() => setInputPrompt(prompt)}
            className="bg-white border border-[#dadce0] rounded-full px-3 py-1 text-[#3c4043] hover:bg-[#f8f9fa] hover:border-[#1a73e8] transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSendMessage} className="flex gap-3">
        <input
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          placeholder="Ask for activity ideas, adjust tasks, or share how your day is going..."
          className="flex-1 p-3 border border-[#dadce0] rounded-lg text-sm text-[#202124] focus:border-[#1a73e8] focus:outline-none bg-white"
        />
        <button
          type="submit"
          disabled={loading || !inputPrompt.trim()}
          className="google-btn-primary flex items-center space-x-2 text-sm disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
};
