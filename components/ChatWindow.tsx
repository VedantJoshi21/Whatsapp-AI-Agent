'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  MoreVertical, 
  Send, 
  User, 
  Smile, 
  Paperclip, 
  CheckCheck,
  Zap,
  HandHelping,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

interface Conversation {
  id: string;
  phone: string;
  name: string;
  mode: 'agent' | 'human';
  clients: {
    business_name: string;
  };
}

interface ChatWindowProps {
  conversation: Conversation;
  messages: Message[];
  onSendMessage: (content: string) => void;
  onToggleMode: (mode: 'agent' | 'human') => void;
  isLoading?: boolean;
}

/*{
    Function Name: ChatWindow
    Purpose: Main chat interface for viewing and sending messages
    Parameters: Props
}*/
export function ChatWindow({ conversation, messages, onSendMessage, onToggleMode, isLoading }: ChatWindowProps) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage(input);
    setInput('');
  };

  const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
  const lastMessageIsUser = lastMessage?.role === 'user';
  
  // Show analyzing if last message is user AND it's recent (less than 60 seconds old)
  // This prevents the indicator from showing indefinitely for old messages or failed AI responses
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 5000);
    return () => clearInterval(timer);
  }, []);

  const isLastMessageRecent = lastMessage && (now.getTime() - new Date(lastMessage.created_at).getTime() < 60000);
  const showAnalyzingIndicator = conversation.mode === 'agent' && lastMessageIsUser && isLastMessageRecent;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f0f2f5] relative overflow-hidden">
      {/* Background Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'url("https://w0.peakpx.com/wallpaper/580/650/HD-wallpaper-whatsapp-background-dark-pattern.jpg")', backgroundSize: '400px' }}></div>

      {/* Header */}
      <div className="h-[72px] bg-white border-b border-gray-200 px-6 flex items-center justify-between z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 bg-gray-100 rounded-xl flex items-center justify-center text-[#075e54] font-bold text-xl shadow-sm">
            {conversation.name ? conversation.name[0] : <User size={24} />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-900 leading-tight">{conversation.name || conversation.phone}</h3>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
            <p className="text-xs text-gray-500 font-medium">{conversation.clients?.business_name} • {conversation.phone}</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex bg-[#f1f5f9] p-1 rounded-xl border border-gray-100">
            <button 
              onClick={() => onToggleMode('agent')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all",
                conversation.mode === 'agent' 
                  ? "bg-[#075e54] text-white shadow-md" 
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <Zap size={14} className={conversation.mode === 'agent' ? "fill-current" : ""} />
              AGENT MODE
            </button>
            <button 
              onClick={() => onToggleMode('human')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all",
                conversation.mode === 'human' 
                  ? "bg-orange-500 text-white shadow-md" 
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <HandHelping size={14} />
              HUMAN MODE
            </button>
          </div>
          <button className="text-gray-400 hover:text-gray-600 transition-colors">
            <MoreVertical size={24} />
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-8 space-y-4 relative z-0"
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div className="w-8 h-8 border-2 border-[#075e54] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-20">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-gray-300 mb-4 shadow-sm">
              <MessageSquare size={32} />
            </div>
            <h3 className="text-gray-900 font-semibold mb-1">No messages yet</h3>
            <p className="text-gray-500 text-sm max-w-[200px]">Send a message to start the conversation.</p>
          </div>
        ) : (
          <>
            <div className="flex justify-center mb-8">
              <span className="bg-white/90 backdrop-blur-sm text-gray-500 text-[11px] font-bold px-4 py-1.5 rounded-full shadow-sm border border-gray-100 uppercase tracking-widest">
                Today
              </span>
            </div>

            {messages.map((msg) => {
              const isAssistant = msg.role === 'assistant';
              let formattedDate = '';
              try {
                formattedDate = format(new Date(msg.created_at), 'h:mm a');
              } catch (e) {
                formattedDate = 'Just now';
              }

              return (
                <div 
                  key={msg.id} 
                  className={cn(
                    "flex w-full animate-in fade-in slide-in-from-bottom-2 duration-300",
                    isAssistant ? "justify-end" : "justify-start"
                  )}
                >
                  <div className={cn(
                    "max-w-[70%] group relative",
                    isAssistant ? "items-end" : "items-start"
                  )}>
                    {isAssistant && (
                      <div className="flex items-center gap-1.5 mb-1 px-1">
                        <Zap size={10} className="text-[#075e54] fill-[#075e54]" />
                        <span className="text-[10px] font-black text-[#075e54] tracking-widest uppercase">AI Assistant</span>
                      </div>
                    )}
                    <div className={cn(
                      "px-4 py-3 rounded-2xl shadow-sm text-[15px] leading-relaxed",
                      isAssistant 
                        ? "bg-[#dcf8c6] text-gray-800 rounded-tr-none border border-[#c3e6a9]" 
                        : "bg-white text-gray-800 rounded-tl-none border border-gray-100"
                    )}>
                      {msg.content}
                      <div className="flex items-center justify-end gap-1 mt-1 -mr-1">
                        <span className="text-[10px] text-gray-400 font-medium">
                          {formattedDate}
                        </span>
                        {isAssistant && (
                          <CheckCheck size={14} className="text-blue-500" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {showAnalyzingIndicator && (
           <div className="flex justify-center py-4">
              <div className="bg-[#075e54]/5 backdrop-blur-sm border border-[#075e54]/10 rounded-xl px-6 py-3 flex items-center gap-3 animate-pulse">
                <div className="w-2 h-2 bg-[#075e54] rounded-full animate-bounce"></div>
                <span className="text-xs font-bold text-[#075e54] italic tracking-wide">AI Agent is analyzing conversation...</span>
              </div>
           </div>
        )}
      </div>

      {/* Input Area */}
      <div className="bg-white p-6 border-t border-gray-200 z-10">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <div className="flex items-center gap-2 text-gray-400">
             <button className="p-2 hover:bg-gray-100 rounded-full transition-colors"><Smile size={24} /></button>
             <button className="p-2 hover:bg-gray-100 rounded-full transition-colors"><Paperclip size={24} /></button>
          </div>
          
          <div className="flex-1 relative">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..." 
              className="w-full bg-[#f8fafc] border border-gray-200 py-4 px-6 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#075e54]/10 focus:border-[#075e54] transition-all font-medium text-gray-700"
            />
          </div>

          <button 
            onClick={handleSend}
            disabled={!input.trim()}
            className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-lg",
              input.trim() ? "bg-[#075e54] text-white hover:scale-105" : "bg-gray-100 text-gray-300"
            )}
          >
            <Send size={24} className={input.trim() ? "translate-x-0.5 -translate-y-0.5" : ""} />
          </button>
        </div>
        
        <div className="flex justify-center gap-8 mt-4">
           <button className="text-[11px] font-bold text-gray-400 hover:text-[#075e54] transition-colors flex items-center gap-1.5 uppercase tracking-wider">
             <Zap size={12} /> Rewrite with AI
           </button>
           <button className="text-[11px] font-bold text-gray-400 hover:text-orange-500 transition-colors flex items-center gap-1.5 uppercase tracking-wider">
             <HandHelping size={12} /> Handover to Human
           </button>
        </div>
      </div>
    </div>
  );
}
