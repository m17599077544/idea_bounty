import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { processIdea } from '@/lib/ai';
import { createIdea, getAllIdeas } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, painPoint, implementation, category, submitterName } = body;

    // Validation
    const titleText = typeof title === 'string' ? title.trim() : '';
    const pp = typeof painPoint === 'string' ? painPoint.trim() : '';
    const impl = typeof implementation === 'string' ? implementation.trim() : '';
    if (!pp) {
      return NextResponse.json({ error: '请至少描述一段痛点或点子' }, { status: 400 });
    }
    if (titleText.length > 100 || pp.length > 5000 || impl.length > 5000) {
      return NextResponse.json({ error: '标题不能超过100字，描述和方案不能超过5000字' }, { status: 400 });
    }

    const finalTitle = titleText || pp.split(/\r?\n/)[0].slice(0, 60) || '未命名点子';

    // Run AI pipeline
    const result = await processIdea(finalTitle, pp, impl);

    // Save to database
    const idea = createIdea({
      id: uuidv4(),
      title: finalTitle,
      description: pp,
      implementation: impl,
      category: category || null,
      submitter_name: submitterName || '匿名用户',
      originality: result.originality,
      duplicate_of_id: result.duplicateOfId,
      similarity_score: result.similarityScore,
      need_breadth: result.needBreadth,
      pay_willingness: result.payWillingness,
      feasibility: result.feasibility,
      basic_bounty: result.basicBounty,
      boss_level: result.bossLevel,
      boss_reasoning: result.bossReasoning,
      bounty_amount: result.bountyAmount,
      ai_reasoning: result.reasoning,
      embedding: '[]',
    });

    return NextResponse.json({
      success: true,
      idea: {
        id: idea.id,
        title: idea.title,
        description: idea.description,
        implementation: idea.implementation,
        category: idea.category,
        submitter_name: idea.submitter_name,
        originality: idea.originality,
         duplicate_of_id: idea.duplicate_of_id,
         duplicate_title: result.duplicateTitle,
         similarity_score: idea.similarity_score,
        need_breadth: idea.need_breadth,
        pay_willingness: idea.pay_willingness,
        feasibility: idea.feasibility,
        basic_bounty: idea.basic_bounty,
        boss_level: idea.boss_level,
        boss_reasoning: idea.boss_reasoning,
        bounty_amount: idea.bounty_amount,
        ai_reasoning: idea.ai_reasoning,
        created_at: idea.created_at,
      },
    });
  } catch (error: unknown) {
    const err = error as Error & { code?: string; status?: number };
    console.error('POST /api/ideas error:', err);

    if (err.code === 'insufficient_quota' || err.message?.includes('quota')) {
      return NextResponse.json({ error: 'AI 服务配额不足，请稍后再试' }, { status: 503 });
    }
    if (err.status === 402 || err.message?.toLowerCase().includes('insufficient balance')) {
      return NextResponse.json({ error: 'AI 服务余额不足，请为 DeepSeek 账户充值或更换 API Key' }, { status: 503 });
    }
    if (err.code === 'rate_limit_exceeded' || err.message?.includes('rate')) {
      return NextResponse.json({ error: 'AI 服务繁忙，请稍后再试' }, { status: 503 });
    }

    return NextResponse.json({ error: '评估失败，请稍后重试' }, { status: 500 });
  }
}

export async function GET() {
  const ideas = getAllIdeas();
  const publicIdeas = ideas.map(({ embedding, ...rest }) => rest);
  return NextResponse.json({ ideas: publicIdeas });
}
