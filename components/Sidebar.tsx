'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Users, 
  Contact, 
  BarChart3, 
  HelpCircle, 
  LogOut,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { name: 'Conversations', icon: MessageSquare, href: '/dashboard' },
  { name: 'Clients', icon: Users, href: '/clients' },
  { name: 'Contacts', icon: Contact, href: '/contacts' },
  { name: 'Analytics', icon: BarChart3, href: '/analytics' },
];

/*{
    Function Name: Sidebar
    Purpose: Navigation sidebar for the application
    Parameters: None
}*/
export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] border-r border-gray-200 w-64 shrink-0">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-[#075e54] rounded-lg flex items-center justify-center text-white">
            <MessageSquare size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 leading-tight">WhatsApp AI</h1>
            <p className="text-xs text-gray-500 font-medium tracking-wide uppercase">Enterprise Suite</p>
          </div>
        </div>

        <button className="w-full bg-[#075e54] hover:bg-[#064e46] text-white py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-semibold transition-all mb-8 shadow-md">
          <Plus size={20} />
          <span>New Broadcast</span>
        </button>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.name === 'Conversations' && pathname.startsWith('/dashboard'));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium",
                  isActive 
                    ? "bg-white text-[#075e54] shadow-sm border border-gray-100" 
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <item.icon size={20} className={isActive ? "text-[#075e54]" : "text-gray-400"} />
                <span>{item.name}</span>
                {isActive && <div className="ml-auto w-1.5 h-6 bg-[#075e54] rounded-full" />}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-6 space-y-1">
        <Link
          href="/support"
          className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-gray-100 hover:text-gray-900 rounded-xl transition-all font-medium"
        >
          <HelpCircle size={20} className="text-gray-400" />
          <span>Support</span>
        </Link>
        <Link
          href="/logout"
          className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-gray-100 hover:text-gray-900 rounded-xl transition-all font-medium"
        >
          <LogOut size={20} className="text-gray-400" />
          <span>Logout</span>
        </Link>
      </div>
    </div>
  );
}
