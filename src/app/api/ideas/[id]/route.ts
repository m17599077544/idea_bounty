import { NextRequest, NextResponse } from 'next/server';
import { getIdeaById } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const idea = getIdeaById(id);

  if (!idea) {
    return NextResponse.json({ error: '点子不存在' }, { status: 404 });
  }

  // Strip embedding
  const { embedding, ...publicIdea } = idea;
  return NextResponse.json({ idea: publicIdea });
}
