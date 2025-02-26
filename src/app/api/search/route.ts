import { NextResponse } from 'next/server';
import { NoteService } from '@/services/note.service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const type = searchParams.get('type') || undefined;
    const tags = searchParams.getAll('tags[]');
    const sortBy = searchParams.get('sortBy') || 'relevance';

    const noteService = new NoteService();
    const results = await noteService.searchNotes(query, {
      type: type as 'document' | 'outline' | undefined,
      tags,
      sortBy: sortBy as 'relevance' | 'date' | 'title',
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error in search API:', error);
    return NextResponse.json(
      { error: 'Failed to process search request' },
      { status: 500 }
    );
  }
}
