import { NextResponse } from 'next/server';
import { getAllIdeas, getIdeaById } from '@/lib/db';

export async function GET() {
  const ideas = getAllIdeas();
  // Admin can see all fields except embeddings (too large for JSON, not needed)
  const adminIdeas = ideas.map(({ embedding, ...rest }) => ({
    ...rest,
    duplicate_title: rest.duplicate_of_id ? getIdeaById(rest.duplicate_of_id)?.title || null : null,
    // Add computed display fields
    bounty_status: rest.status === 'adjusted' ? '已调整' : rest.status === 'rejected' ? '已驳回' : rest.status === 'approved' ? '已通过' : '待审核',
  }));
  return NextResponse.json({ ideas: adminIdeas });
}
