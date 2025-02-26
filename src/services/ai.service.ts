import { openai } from '@/lib/openai';
import { NoteService } from './note.service';

export class AIService {
  constructor(private noteService: NoteService) {}

  async generateTags(content: string): Promise<string[]> {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful assistant that generates relevant tags for notes. Return only a JSON array of tags, no other text.',
        },
        {
          role: 'user',
          content: `Generate relevant tags for this note content: ${content}`,
        },
      ],
      response_format: { type: 'json_object' },
    });

    try {
      const tags = JSON.parse(response.choices[0].message.content || '{}').tags;
      return Array.isArray(tags) ? tags : [];
    } catch (error) {
      console.error('Error parsing tags:', error);
      return [];
    }
  }

  async suggestLinks(
    noteId: string
  ): Promise<Array<{ id: string; title: string; reason: string }>> {
    const note = await this.noteService.getNoteById(noteId);
    if (!note) return [];

    const searchResults = await this.noteService.searchNotes(note.content);
    const suggestions = searchResults
      .filter((result) => result.id !== noteId)
      .slice(0, 5)
      .map((result) => ({
        id: result.id,
        title: result.title,
        reason: 'Similar content',
      }));

    return suggestions;
  }

  async improveWriting(content: string): Promise<string> {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful assistant that improves writing while maintaining the original meaning and style.',
        },
        {
          role: 'user',
          content: `Improve this text while keeping its meaning and style: ${content}`,
        },
      ],
    });

    return response.choices[0].message.content || content;
  }

  async generateSummary(content: string): Promise<string> {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful assistant that generates concise summaries. Keep summaries to 2-3 sentences.',
        },
        {
          role: 'user',
          content: `Generate a concise summary of this text: ${content}`,
        },
      ],
    });

    return response.choices[0].message.content || '';
  }

  async answerQuestion(question: string): Promise<{
    answer: string;
    sourceNotes: Array<{ id: string; title: string }>;
  }> {
    // Search for relevant notes
    const searchResults = await this.noteService.searchNotes(question);
    const relevantNotes = await Promise.all(
      searchResults.slice(0, 3).map(async (result) => {
        const note = await this.noteService.getNoteById(result.id);
        return note;
      })
    );

    const context = relevantNotes
      .filter((note): note is NonNullable<typeof note> => note !== null)
      .map((note) => `Note "${note.title}": ${note.content}`)
      .join('\n\n');

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content:
            "You are a helpful assistant that answers questions based on the user's notes. Use the provided note context to answer questions accurately.",
        },
        {
          role: 'user',
          content: `Context:\n${context}\n\nQuestion: ${question}`,
        },
      ],
    });

    return {
      answer:
        response.choices[0].message.content ||
        'I could not find a relevant answer in your notes.',
      sourceNotes: relevantNotes
        .filter((note): note is NonNullable<typeof note> => note !== null)
        .map((note) => ({
          id: note.id,
          title: note.title,
        })),
    };
  }
}
