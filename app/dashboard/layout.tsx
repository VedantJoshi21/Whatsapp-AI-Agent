import React from 'react';
import { Sidebar } from '@/components/Sidebar';

/*{
    Function Name: DashboardLayout
    Purpose: Layout wrapper for all dashboard-related pages
    Parameters: children (React.ReactNode)
}*/
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-hidden relative flex flex-col">
        {children}
      </main>
    </div>
  );
}
