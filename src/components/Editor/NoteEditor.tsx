import React, { useState, useCallback, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { marked } from 'marked';
import {
  NoteService,
  CreateNoteInput,
  UpdateNoteInput,
} from '@/services/note.service';
import { AIService } from '@/services/ai.service';

interface NoteEditorProps {
  noteId?: string;
  initialContent?: string;
  initialTitle?: string;
  onSave?: (note: { id: string; title: string; content: string }) => void;
}

export function NoteEditor({
  noteId,
  initialContent = '',
  initialTitle = '',
  onSave,
}: NoteEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [isPreview, setIsPreview] = useState(false);
  const [suggestedLinks, setSuggestedLinks] = useState<
    Array<{ id: string; title: string; reason: string }>
  >([]);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const noteService = new NoteService();
  const aiService = new AIService(noteService);

  // Parse wiki-style links [[Note Title]]
  const parseWikiLinks = useCallback((text: string) => {
    const wikiLinkRegex = /\[\[(.*?)\]\]/g;
    return text.replace(
      wikiLinkRegex,
      (_, title) => `[${title}](#/note/${encodeURIComponent(title)})`
    );
  }, []);

  // Handle content changes and trigger AI suggestions
  const handleContentChange = useCallback(
    async (newContent: string) => {
      setContent(newContent);

      // Debounce AI suggestions
      const timeoutId = setTimeout(async () => {
        if (noteId) {
          const [linkSuggestions, tagSuggestions] = await Promise.all([
            aiService.suggestLinks(noteId),
            aiService.generateTags(newContent),
          ]);
          setSuggestedLinks(linkSuggestions);
          setSuggestedTags(tagSuggestions);
        }
      }, 1000);

      return () => clearTimeout(timeoutId);
    },
    [noteId, aiService]
  );

  // Save note
  const handleSave = async () => {
    try {
      setIsSaving(true);
      const noteData: CreateNoteInput | UpdateNoteInput = {
        title,
        content,
        tags: suggestedTags,
      };

      let savedNote;
      if (noteId) {
        savedNote = await noteService.updateNote({ ...noteData, id: noteId });
      } else {
        savedNote = await noteService.createNote(noteData);
      }

      // Create links for any wiki-style links found in content
      const wikiLinks = content.match(/\[\[(.*?)\]\]/g) || [];
      const linkTitles = wikiLinks.map((link) => link.slice(2, -2));

      // TODO: Create or find notes for each link and establish connections

      onSave?.(savedNote);
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // AI assistance features
  const improveWriting = async () => {
    const improvedContent = await aiService.improveWriting(content);
    setContent(improvedContent);
  };

  const generateSummary = async () => {
    const summary = await aiService.generateSummary(content);
    setContent((prev) => `${prev}\n\n## Summary\n${summary}`);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Title input */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Note title..."
        className="text-2xl font-bold mb-4 p-2 bg-transparent border-b border-gray-200 dark:border-gray-700 focus:outline-none focus:border-primary"
      />

      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setIsPreview(!isPreview)}
          className="px-3 py-1 rounded bg-secondary text-secondary-foreground hover:bg-secondary/80">
          {isPreview ? 'Edit' : 'Preview'}
        </button>
        <button
          onClick={improveWriting}
          className="px-3 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/80">
          Improve Writing
        </button>
        <button
          onClick={generateSummary}
          className="px-3 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/80">
          Generate Summary
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-3 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/80 disabled:opacity-50">
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </div>

      {/* Editor/Preview */}
      <div className="flex-1 flex gap-4">
        <div className="flex-1">
          {isPreview ? (
            <div className="prose dark:prose-invert max-w-none">
              <ReactMarkdown>{parseWikiLinks(content)}</ReactMarkdown>
            </div>
          ) : (
            <textarea
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="Start writing..."
              className="w-full h-full p-4 bg-transparent border rounded resize-none focus:outline-none focus:ring-1 focus:ring-primary"
            />
          )}
        </div>

        {/* Sidebar */}
        <div className="w-64 border-l border-border p-4">
          {/* Suggested Links */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Suggested Links</h3>
            <ul className="space-y-2">
              {suggestedLinks.map((link) => (
                <li key={link.id} className="text-sm">
                  <button
                    onClick={() =>
                      setContent((prev) => `${prev}\n[[${link.title}]]`)
                    }
                    className="text-left hover:text-primary">
                    {link.title}
                    <span className="block text-xs text-muted-foreground">
                      {link.reason}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Suggested Tags */}
          <div>
            <h3 className="font-semibold mb-2">Suggested Tags</h3>
            <div className="flex flex-wrap gap-2">
              {suggestedTags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 text-xs rounded-full bg-secondary text-secondary-foreground">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
