'use client';

import { useState } from 'react';
import { AIChat } from '@/components/Chat/AIChat';
import { useRouter } from 'next/navigation';

export default function ChatPage() {
  const router = useRouter();
  const [selectedContext, setSelectedContext] = useState<
    'all' | 'recent' | 'tagged'
  >('all');

  const handleNoteClick = (noteId: string) => {
    router.push(`/notes/${noteId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background/50 via-background to-background/80">
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur-xl bg-background/50 border-b border-border/50 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50">
              AI Chat
            </h1>
            <p className="text-sm text-muted-foreground">
              Ask questions about your knowledge base
            </p>
          </div>

          {/* Context Selector */}
          <div className="flex items-center bg-background/50 backdrop-blur-lg rounded-lg border border-border/50 p-1">
            <button
              onClick={() => setSelectedContext('all')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                selectedContext === 'all'
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'hover:bg-primary/10'
              }`}>
              All Notes
            </button>
            <button
              onClick={() => setSelectedContext('recent')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                selectedContext === 'recent'
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'hover:bg-primary/10'
              }`}>
              Recent
            </button>
            <button
              onClick={() => setSelectedContext('tagged')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                selectedContext === 'tagged'
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'hover:bg-primary/10'
              }`}>
              Tagged
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Chat Interface */}
        <div className="flex-1 relative">
          <AIChat onNoteClick={handleNoteClick} />
        </div>

        {/* Context Sidebar */}
        <div className="w-80 border-l border-border/50 backdrop-blur-xl bg-background/50 p-4 overflow-y-auto">
          <div className="space-y-6">
            {/* Search Context */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Search Context
              </h3>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search notes..."
                  className="w-full px-4 py-2 rounded-lg bg-background/50 border border-border/50 focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  🔍
                </span>
              </div>
            </div>

            {/* Recent Conversations */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Recent Conversations
              </h3>
              <div className="space-y-2">
                {['Research Ideas', 'Project Planning', 'Meeting Notes'].map(
                  (title) => (
                    <div
                      key={title}
                      className="p-3 rounded-lg bg-background/50 border border-border/50 hover:bg-primary/5 transition-colors cursor-pointer">
                      <p className="font-medium text-sm">{title}</p>
                      <p className="text-xs text-muted-foreground">
                        3 messages • 2h ago
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Suggested Prompts */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Suggested Prompts
              </h3>
              <div className="space-y-2">
                {[
                  'Summarize my recent notes',
                  'Find related concepts',
                  'Generate action items',
                ].map((prompt) => (
                  <button
                    key={prompt}
                    className="w-full px-4 py-2 text-left text-sm bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors">
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
