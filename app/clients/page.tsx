'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Settings, 
  ExternalLink, 
  Phone, 
  ShieldCheck,
  TrendingUp,
  Search,
  SlidersHorizontal,
  RefreshCcw,
  Zap
} from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { logger } from '@/lib/logger';
import { cn } from '@/lib/utils';

interface Client {
  id: string;
  business_name: string;
  whatsapp_phone_number_id: string;
  created_at: string;
  // Mock stats for UI
  stats?: {
    conversations: number;
    resolution_rate: string;
    active: boolean;
  };
}

/*{
    Function Name: ClientsPage
    Purpose: Displays and manages the list of business clients
    Parameters: None
}*/
export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchClients = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const res = await fetch('/api/clients', { signal: controller.signal });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          
          if (Array.isArray(data) && isMounted) {
            const enrichedData = data.map((client: Client) => ({
              ...client,
              stats: {
                conversations: Math.floor(Math.random() * 2000) + 500,
                resolution_rate: (Math.random() * 20 + 80).toFixed(1) + '%',
                active: Math.random() > 0.1
              }
            }));
            
            setClients(enrichedData);
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          console.error('Clients fetch timed out');
        } else {
          logger.error('Fetch Clients Page Error', error);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchClients();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {/* Header Section */}
        <div className="bg-white border-b border-gray-200 px-10 py-8 sticky top-0 z-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">OmniChannel Manager</h1>
              <div className="flex gap-6 mt-1">
                 <span className="text-sm font-bold text-[#075e54] uppercase tracking-widest border-b-2 border-[#075e54] pb-1 cursor-pointer">Client Management</span>
                 <span className="text-sm font-bold text-gray-400 uppercase tracking-widest hover:text-gray-600 cursor-pointer transition-colors pb-1">Handover Queue</span>
                 <span className="text-sm font-bold text-gray-400 uppercase tracking-widest hover:text-gray-600 cursor-pointer transition-colors pb-1">AI Training</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-[#e7f3f2] px-4 py-2 rounded-xl text-[#075e54] font-bold text-xs uppercase tracking-widest border border-[#075e54]/10 shadow-sm animate-pulse">
                <Zap size={14} className="fill-current" />
                Agent Mode
              </div>
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-md">
                 <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100" alt="User" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
             <div className="max-w-xl">
               <h2 className="text-lg font-bold text-gray-800">Client Management</h2>
               <p className="text-sm text-gray-500 font-medium">Oversee and manage active WhatsApp business integrations across your tenant portfolio.</p>
             </div>
             
             <div className="flex items-center gap-3">
                <div className="relative">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search clients..." 
                    className="bg-[#f1f5f9] border border-transparent py-2.5 pl-12 pr-6 rounded-xl focus:bg-white focus:border-[#075e54]/20 focus:ring-4 focus:ring-[#075e54]/5 outline-none transition-all w-80 font-medium text-sm"
                  />
                </div>
                <button className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm text-gray-500">
                  <SlidersHorizontal size={18} />
                </button>
             </div>
          </div>
        </div>

        <div className="px-10 py-10">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm animate-pulse h-80"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {clients.map((client) => (
                <div key={client.id} className="bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 group">
                  <div className="p-8">
                    <div className="flex items-start justify-between mb-8">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner",
                          client.stats?.active ? "bg-[#e7f3f2] text-[#075e54]" : "bg-gray-50 text-gray-400"
                        )}>
                          <Users size={32} />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 leading-tight">{client.business_name}</h3>
                          <p className="text-sm font-medium text-gray-400">{client.whatsapp_phone_number_id}</p>
                        </div>
                      </div>
                      
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                        client.stats?.active ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"
                      )}>
                        {client.stats?.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mb-8">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Conversations</p>
                        <p className="text-2xl font-black text-gray-900">{client.stats?.conversations.toLocaleString()}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">AI Res. Rate</p>
                        <p className="text-2xl font-black text-[#075e54]">{client.stats?.resolution_rate}</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                       <button 
                         onClick={() => window.location.href = `/dashboard?clientId=${client.id}`}
                         className="w-full py-4 bg-[#075e54] hover:bg-[#064e46] text-white rounded-2xl font-bold transition-all shadow-md active:scale-[0.98]"
                       >
                         View Conversations
                       </button>
                       <button className="w-full py-3 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-2xl font-bold transition-all shadow-sm active:scale-[0.98]">
                         Manage Settings
                       </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Add New Tenant Card */}
              <div className="bg-[#f8fafc] rounded-[32px] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-10 hover:border-[#075e54]/30 hover:bg-[#f0f7f6]/50 transition-all cursor-pointer group">
                 <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md mb-6 group-hover:scale-110 transition-transform">
                   <Plus size={32} className="text-gray-400 group-hover:text-[#075e54]" />
                 </div>
                 <h3 className="text-xl font-bold text-gray-700 mb-2">Add New Tenant</h3>
                 <p className="text-center text-sm text-gray-500 font-medium max-w-[200px]">
                   Onboard a new WhatsApp Business account
                 </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Stats Area */}
        <div className="px-10 pb-12 mt-4">
           <div className="bg-white rounded-[32px] p-10 border border-gray-100 shadow-sm flex items-center justify-between relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-[0.05]">
                <TrendingUp size={120} className="text-[#075e54]" />
             </div>
             
             <div className="flex gap-16 z-10">
                <div className="space-y-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Active Tenants</p>
                  <p className="text-4xl font-black text-gray-900">{clients.length} Clients</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Avg. AI Resolution</p>
                  <p className="text-4xl font-black text-[#075e54]">88.4%</p>
                </div>
             </div>

             <div className="flex items-center gap-3 text-gray-400 z-10">
               <p className="text-sm font-bold uppercase tracking-widest">Data last synced 2 minutes ago</p>
               <RefreshCcw size={18} className="animate-spin-slow" />
             </div>
           </div>
        </div>
      </main>
    </div>
  );
}
