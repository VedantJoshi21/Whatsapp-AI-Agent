'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ConversationList } from '@/components/ConversationList';
import { ChatWindow } from '@/components/ChatWindow';
import { logger } from '@/lib/logger';
import { MessageSquare, AlertCircle } from 'lucide-react';

interface Client {
  id: string;
  business_name: string;
}

interface Conversation {
  id: string;
  phone: string;
  name: string;
  mode: 'agent' | 'human';
  updated_at: string;
  last_message?: string;
  clients: { business_name: string };
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export default function DashboardPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize selectedClientId from URL on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const clientId = params.get('clientId');
      if (clientId) {
        setSelectedClientId(clientId);
      }
    }
  }, []);

  const isFetching = React.useRef(false);

  const fetchData = useCallback(async (isInitial = false) => {
    if (isFetching.current) return;
    isFetching.current = true;
    
    if (isInitial) {
      setLoading(true);
    }

    // Set an overall timeout controller for the entire fetch process
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.warn('[Dashboard] Fetch operations timed out after 15s');
      controller.abort();
    }, 15000); 

    try {
      const convsUrl = `/api/conversations${selectedClientId ? `?clientId=${selectedClientId}` : ''}`;
      console.log('[Dashboard] Fetching conversations...', convsUrl);
      logger.info('Dashboard', 'Fetching data...');
      
      const convsRes = await fetch(convsUrl, { 
        cache: 'no-store',
        signal: controller.signal
      });
      
      console.log('[Dashboard] Conversations response status:', convsRes.status);
      
      if (!convsRes.ok) {
        throw new Error(`Conversations API Error: ${convsRes.status} ${convsRes.statusText}`);
      }
      
      const convsData = await convsRes.json();
      
      if (Array.isArray(convsData)) {
        const processed = convsData.map((conv: any) => {
          let lastMessageContent = undefined;
          if (conv.messages && Array.isArray(conv.messages) && conv.messages.length > 0) {
            const sorted = [...conv.messages].sort((a, b) => 
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
            lastMessageContent = sorted[0].content;
          }
          
          return {
            ...conv,
            last_message: lastMessageContent
          };
        });
        setConversations(processed);
      } else {
        console.warn('[Dashboard] Conversations API did not return an array:', convsData);
        setConversations([]);
      }

      // SET LOADING FALSE HERE so UI appears even if clients list is slow
      setLoading(false);

      // Fetch clients for the filter dropdown
      console.log('[Dashboard] Fetching clients...');
      const clientsRes = await fetch('/api/clients', { 
        cache: 'no-store',
        signal: controller.signal 
      });
      
      if (clientsRes.ok) {
        const clientsData = await clientsRes.json();
        console.log('[Dashboard] Clients received:', clientsData?.length);
        if (Array.isArray(clientsData)) {
          setClients(clientsData);
        }
      }

      setError(null);
      console.log('[Dashboard] Fetch completed successfully');
    } catch (err) {
      console.error('[Dashboard] Fetch failure:', err);
      if (err instanceof Error && err.name === 'AbortError') {
        setError('Request timed out. Please check your internet connection and Supabase connectivity.');
      } else {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred while loading data.');
      }
    } finally {
      clearTimeout(timeoutId);
      console.log('[Dashboard] Finally: setting loading to false and resetting isFetching');
      setLoading(false);
      isFetching.current = false;
    }
  }, [selectedClientId]);

  const fetchMessages = useCallback(async (convId: string, showLoading = false) => {
    try {
      if (showLoading) setLoadingMessages(true);
      const res = await fetch(`/api/conversations/${convId}/messages`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setMessages(data);
        }
      }
    } catch (err) {
      console.error('Messages Fetch Failure:', err);
    } finally {
      if (showLoading) setLoadingMessages(false);
    }
  }, []);

  // Initial and reactive data fetch
  useEffect(() => {
    fetchData(true);
    return () => {
      isFetching.current = false;
    };
  }, [fetchData]);

  // Polling for new messages in selected conversation
  useEffect(() => {
    if (selectedConvId) {
      setMessages([]);
      fetchMessages(selectedConvId, true);
      const interval = setInterval(() => fetchMessages(selectedConvId), 5000);
      return () => clearInterval(interval);
    }
  }, [selectedConvId, fetchMessages]);

  // Polling for conversation list updates
  useEffect(() => {
    const interval = setInterval(() => fetchData(false), 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleSendMessage = async (content: string) => {
    if (!selectedConvId) return;
    
    // Optimistic UI update
    const tempId = `temp-${Date.now()}`;
    const newMessage: Message = { 
      id: tempId, 
      role: 'assistant', 
      content, 
      created_at: new Date().toISOString() 
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    try {
      const res = await fetch(`/api/conversations/${selectedConvId}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      
      if (!res.ok) throw new Error('Failed to send message via WhatsApp API');
      
      // Refresh messages to get the real ID and status
      fetchMessages(selectedConvId);
    } catch (err) {
      console.error('Send Message Error:', err);
      // Remove optimistic message on failure
      setMessages(prev => prev.filter(m => m.id !== tempId));
      alert('Failed to send message. Please try again.');
    }
  };

  const handleToggleMode = async (mode: 'agent' | 'human') => {
    if (!selectedConvId) return;
    
    // Optimistic update
    setConversations(prev => prev.map(c => c.id === selectedConvId ? { ...c, mode } : c));
    
    try {
      const res = await fetch(`/api/conversations/${selectedConvId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode })
      });
      
      if (!res.ok) throw new Error('Failed to update mode');
    } catch (err) {
      console.error('Mode Toggle Error:', err);
      // Revert on failure
      fetchData();
    }
  };

  const selectedConversation = conversations.find(c => c.id === selectedConvId);

  // Loading state
  if (loading && conversations.length === 0 && !error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#075e54] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Syncing Chats...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && conversations.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#fff5f5] px-6 text-center">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Connection Problem</h2>
        <p className="text-gray-600 max-w-md mb-8">{error}</p>
        <button 
          onClick={() => { fetchData(true); }}
          className="bg-[#075e54] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#054c44] transition-all shadow-lg"
        >
          RETRY CONNECTION
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 h-full overflow-hidden">
      <ConversationList 
        conversations={conversations}
        selectedId={selectedConvId}
        onSelect={setSelectedConvId}
        clients={clients}
        onFilterChange={setSelectedClientId}
        selectedClientId={selectedClientId}
      />

      {selectedConversation ? (
        <ChatWindow 
          conversation={selectedConversation}
          messages={messages}
          onSendMessage={handleSendMessage}
          onToggleMode={handleToggleMode}
          isLoading={loadingMessages}
        />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-[#f0f2f5] relative">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("https://w0.peakpx.com/wallpaper/580/650/HD-wallpaper-whatsapp-background-dark-pattern.jpg")', backgroundSize: '400px' }}></div>
          <div className="flex flex-col items-center max-w-sm text-center px-8 z-10">
            <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center text-[#075e54] mb-8 shadow-xl border border-gray-100">
               <MessageSquare size={48} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">WhatsApp AI Dashboard</h2>
            <p className="text-gray-500 font-medium leading-relaxed">
              Select a conversation from the sidebar to manage AI automation or respond to customers directly.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
