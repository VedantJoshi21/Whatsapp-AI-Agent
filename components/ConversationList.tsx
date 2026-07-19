'use client';

import React from 'react';
import { Search, ChevronDown, MessageSquare, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface Conversation {
  id: string;
  phone: string;
  name: string;
  mode: 'agent' | 'human';
  updated_at: string;
  last_message?: string;
  clients?: {
    business_name: string;
  };
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedId?: string | null;
  onSelect: (id: string) => void;
  clients: { id: string; business_name: string }[];
  onFilterChange: (clientId: string) => void;
  selectedClientId: string;
}

/*{
    Function Name: ConversationList
    Purpose: Displays a list of conversations with filtering capabilities
    Parameters: Props
}*/
export function ConversationList({ 
  conversations, 
  selectedId, 
  onSelect,
  clients,
  onFilterChange,
  selectedClientId
}: ConversationListProps) {
  return (
    <div className="w-96 flex flex-col h-full border-r border-gray-200 bg-white">
      <div className="p-6 border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Inbox</h2>
          {conversations.length > 0 && (
            <span className="bg-[#e7f3f2] text-[#075e54] px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              {conversations.length} Active
            </span>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Filter by Client</label>
            <div className="relative group">
              <select 
                className="w-full bg-[#f8fafc] border border-gray-100 text-gray-700 py-3 px-4 pr-10 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-[#075e54]/20 focus:border-[#075e54] transition-all cursor-pointer font-medium"
                value={selectedClientId}
                onChange={(e) => onFilterChange(e.target.value)}
              >
                <option value="">All Clients</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.business_name}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-400 group-hover:text-gray-600">
                <ChevronDown size={18} />
              </div>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              className="w-full bg-[#f8fafc] border border-gray-100 py-3 pl-12 pr-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#075e54]/20 focus:border-[#075e54] transition-all font-medium text-gray-700"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
              <MessageSquare size={32} />
            </div>
            <h3 className="text-gray-900 font-semibold mb-1">No conversations found</h3>
            <p className="text-gray-500 text-sm">Messages from your WhatsApp numbers will appear here.</p>
          </div>
        ) : (
          conversations.map((conv) => (
            <div 
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={cn(
                "p-4 border-b border-gray-50 cursor-pointer transition-all hover:bg-gray-50 flex gap-4",
                selectedId === conv.id ? "bg-[#f0f7f6] border-l-4 border-l-[#075e54]" : "border-l-4 border-l-transparent"
              )}
            >
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden">
                  {conv.name ? (
                     <span className="text-[#075e54] font-bold text-lg">{conv.name[0]}</span>
                  ) : (
                    <Users className="text-gray-400" size={24} />
                  )}
                </div>
                {conv.mode === 'agent' && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#075e54] rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                     <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <h3 className={cn("font-bold truncate", selectedId === conv.id ? "text-[#075e54]" : "text-gray-900")}>
                    {conv.name || conv.phone}
                  </h3>
                  <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap ml-2">
                    {(() => {
                      try {
                        return conv.updated_at ? format(new Date(conv.updated_at), 'h:mm a') : 'N/A';
                      } catch (e) {
                        return 'N/A';
                      }
                    })()}
                  </span>
                </div>
                
                <p className="text-sm text-gray-500 truncate mb-2 leading-snug">
                  {conv.last_message || "No messages yet"}
                </p>

                <div className="flex items-center gap-2">
                   <span className="inline-flex items-center bg-[#075e54]/10 text-[#075e54] text-[9px] font-extrabold px-1.5 py-0.5 rounded tracking-widest uppercase">
                  {conv.clients?.business_name || 'Unknown Client'}
                  </span>
                  {conv.mode === 'agent' && (
                    <span className="inline-flex items-center text-[#075e54]">
                       <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                         <path d="M13 10V3L4 14H11V21L20 10H13Z" />
                       </svg>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
