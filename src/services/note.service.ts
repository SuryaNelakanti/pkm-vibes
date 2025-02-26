import { PrismaClient, Note } from '@prisma/client';
import { Client } from '@elastic/elasticsearch';

const prisma = new PrismaClient();
const elastic = new Client({
  node: process.env.ELASTICSEARCH_URL,
  auth: {
    username: process.env.ELASTICSEARCH_USERNAME || '',
    password: process.env.ELASTICSEARCH_PASSWORD || '',
  },
});

export interface CreateNoteInput {
  title: string;
  content: string;
  type?: 'document' | 'outline';
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface UpdateNoteInput extends Partial<CreateNoteInput> {
  id: string;
}

export interface SearchOptions {
  type?: 'document' | 'outline';
  tags?: string[];
  sortBy?: 'relevance' | 'date' | 'title';
}

export class NoteService {
  async createNote(input: CreateNoteInput): Promise<Note> {
    const note = await prisma.note.create({
      data: {
        title: input.title,
        content: input.content,
        type: input.type || 'document',
        tags: input.tags || [],
        metadata: input.metadata || {},
      },
    });

    // Index the note in Elasticsearch
    await elastic.index({
      index: 'notes',
      id: note.id,
      document: {
        title: note.title,
        content: note.content,
        tags: note.tags,
        type: note.type,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
      },
    });

    return note;
  }

  async updateNote(input: UpdateNoteInput): Promise<Note> {
    const note = await prisma.note.update({
      where: { id: input.id },
      data: {
        title: input.title,
        content: input.content,
        type: input.type,
        tags: input.tags,
        metadata: input.metadata,
      },
    });

    // Update the note in Elasticsearch
    await elastic.update({
      index: 'notes',
      id: note.id,
      doc: {
        title: note.title,
        content: note.content,
        tags: note.tags,
        type: note.type,
        updatedAt: note.updatedAt,
      },
    });

    return note;
  }

  async deleteNote(id: string): Promise<void> {
    await prisma.note.delete({ where: { id } });
    await elastic.delete({ index: 'notes', id });
  }

  async getNoteById(id: string): Promise<Note | null> {
    return prisma.note.findUnique({
      where: { id },
      include: {
        outgoingLinks: {
          include: {
            target: true,
          },
        },
        incomingLinks: {
          include: {
            source: true,
          },
        },
      },
    });
  }

  async searchNotes(query: string, options: SearchOptions = {}) {
    const { type, tags, sortBy = 'relevance' } = options;

    // Build the search query
    const must: any[] = [
      {
        multi_match: {
          query,
          fields: ['title^2', 'content', 'tags'],
        },
      },
    ];

    // Add type filter if specified
    if (type) {
      must.push({ term: { type } });
    }

    // Add tags filter if specified
    if (tags && tags.length > 0) {
      must.push({ terms: { tags } });
    }

    // Build sort configuration
    let sort: any[] = [];
    switch (sortBy) {
      case 'date':
        sort = [{ updatedAt: 'desc' }];
        break;
      case 'title':
        sort = [{ title: 'asc' }];
        break;
      case 'relevance':
      default:
        sort = ['_score'];
        break;
    }

    const results = await elastic.search({
      index: 'notes',
      query: {
        bool: {
          must,
        },
      },
      sort,
      highlight: {
        fields: {
          content: {
            fragment_size: 150,
            number_of_fragments: 1,
          },
        },
      },
    });

    return results.hits.hits.map((hit) => ({
      id: hit._id,
      title: hit._source.title,
      excerpt: hit.highlight?.content?.[0] || hit._source.content.slice(0, 150) + '...',
      tags: hit._source.tags,
      score: hit._score,
      updatedAt: hit._source.updatedAt,
    }));
  }

  async createLink(sourceId: string, targetId: string) {
    return prisma.noteLink.create({
      data: {
        sourceId,
        targetId,
      },
    });
  }

  async deleteLink(sourceId: string, targetId: string) {
    return prisma.noteLink.delete({
      where: {
        sourceId_targetId: {
          sourceId,
          targetId,
        },
      },
    });
  }
}
