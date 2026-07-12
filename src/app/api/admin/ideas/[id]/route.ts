import { NextRequest, NextResponse } from 'next/server';
import { getIdeaById, updateIdeaBounty } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const idea = getIdeaById(id);

  if (!idea) {
    return NextResponse.json({ error: '点子不存在' }, { status: 404 });
  }

  const body = await request.json();
  const { action, bountyAmount } = body;

  if (action === 'adjust' && typeof bountyAmount === 'number') {
    if (bountyAmount < 0 || bountyAmount > 500) {
      return NextResponse.json({ error: '金额需在 ¥0–¥500 之间' }, { status: 400 });
    }
    updateIdeaBounty(id, bountyAmount, 'adjusted');
    const updated = getIdeaById(id);
    const { embedding, ...rest } = updated!;
    return NextResponse.json({ success: true, idea: rest });
  }

  if (action === 'reject') {
    updateIdeaBounty(id, 0, 'rejected');
    const updated = getIdeaById(id);
    const { embedding, ...rest } = updated!;
    return NextResponse.json({ success: true, idea: rest });
  }

  if (action === 'approve') {
    updateIdeaBounty(id, idea.bounty_amount, 'approved');
    const updated = getIdeaById(id);
    const { embedding, ...rest } = updated!;
    return NextResponse.json({ success: true, idea: rest });
  }

  return NextResponse.json({ error: '无效操作。action 应为 adjust/reject/approve' }, { status: 400 });
}
