'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();

  const navigation = [
    { name: 'Notes', href: '/notes', icon: '📝' },
    { name: 'Graph', href: '/graph', icon: '🔗' },
    { name: 'Chat', href: '/chat', icon: '💬' },
    { name: 'Search', href: '/search', icon: '🔍' },
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90">
      {/* Background gradient effects */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="flex h-screen">
        {/* Sidebar */}
        <aside
          className={`${
            isSidebarOpen ? 'w-64' : 'w-16'
          } relative backdrop-blur-xl bg-background/50 border-r border-border/50 transition-all duration-300 ease-in-out`}>
          <div className="flex h-full flex-col">
            {/* Logo */}
            <div className="flex h-16 items-center justify-between px-4 border-b border-border/50">
              {isSidebarOpen ? (
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50">
                  Artemis
                </h1>
              ) : (
                <span className="text-xl">🌙</span>
              )}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg hover:bg-primary/10 transition-colors">
                {isSidebarOpen ? '◀' : '▶'}
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-2 py-4">
              {navigation.map((item) => {
                const isActive = pathname?.startsWith(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-primary/20 text-primary shadow-lg shadow-primary/10 backdrop-blur-lg'
                        : 'hover:bg-primary/10 hover:text-primary'
                    }`}>
                    <span className="text-xl mr-3">{item.icon}</span>
                    {isSidebarOpen && (
                      <span className="font-medium">{item.name}</span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* User menu */}
            <div className="border-t border-border/50 p-4 backdrop-blur-sm bg-background/20">
              {isSidebarOpen ? (
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center text-primary-foreground shadow-lg">
                    U
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium">User Name</p>
                    <p className="text-xs text-muted-foreground">
                      user@example.com
                    </p>
                  </div>
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center text-primary-foreground shadow-lg">
                  U
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto backdrop-blur-sm">
          <div className="h-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
