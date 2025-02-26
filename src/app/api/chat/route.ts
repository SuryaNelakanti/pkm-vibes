import { NextResponse } from 'next/server';
import { AIService } from '@/services/ai.service';
import { NoteService } from '@/services/note.service';

export async function POST(request: Request) {
  try {
    const { question } = await request.json();

    const noteService = new NoteService();
    const aiService = new AIService(noteService);

    const response = await aiService.answerQuestion(question);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Failed to process your request' },
      { status: 500 }
    );
  }
}
