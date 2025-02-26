'use client';

import { useState } from 'react';
import { NoteEditor } from '@/components/Editor/NoteEditor';

export default function NotesPage() {
  const [selectedView, setSelectedView] = useState<'grid' | 'list'>('grid');

  // Temporary mock data - replace with actual data from your service
  const mockNotes = [
    {
      id: '1',
      title: 'Getting Started with Artemis',
      excerpt: 'Welcome to your new knowledge management system...',
      tags: ['tutorial', 'guide'],
      updatedAt: '2024-02-26',
    },
    {
      id: '2',
      title: 'Project Ideas',
      excerpt: 'List of potential projects to work on...',
      tags: ['projects', 'ideas'],
      updatedAt: '2024-02-25',
    },
    // Add more mock notes as needed
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background/50 via-background to-background/80">
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur-xl bg-background/50 border-b border-border/50 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50">
              Notes
            </h1>
            <p className="text-sm text-muted-foreground">
              Organize your thoughts and ideas
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* View Toggle */}
            <div className="flex items-center bg-background/50 backdrop-blur-lg rounded-lg border border-border/50 p-1">
              <button
                onClick={() => setSelectedView('grid')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  selectedView === 'grid'
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'hover:bg-primary/10'
                }`}>
                Grid
              </button>
              <button
                onClick={() => setSelectedView('list')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  selectedView === 'list'
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'hover:bg-primary/10'
                }`}>
                List
              </button>
            </div>

            {/* New Note Button */}
            <button className="px-4 py-2 bg-primary/80 hover:bg-primary text-primary-foreground rounded-lg backdrop-blur-lg shadow-lg transition-all hover:shadow-primary/25">
              New Note
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4 pt-8">
        {/* Notes Grid/List */}
        <div
          className={`grid gap-6 ${
            selectedView === 'grid'
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              : 'grid-cols-1'
          }`}>
          {mockNotes.map((note) => (
            <div
              key={note.id}
              className="group relative overflow-hidden rounded-xl backdrop-blur-xl bg-background/50 border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative p-6">
                <h3 className="text-lg font-semibold mb-2">{note.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {note.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {note.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary backdrop-blur-lg">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <time className="text-xs text-muted-foreground">
                    {note.updatedAt}
                  </time>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
