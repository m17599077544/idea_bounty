'use client';

import { useState, useCallback, useEffect } from 'react';
import IdeaForm, { SubmitData } from '@/components/IdeaForm';
import ResultCard from '@/components/ResultCard';
import IdeaList from '@/components/IdeaList';

interface IdeaResult {
  id: string;
  title: string;
  description: string;
  implementation: string;
  category: string | null;
  submitter_name: string;
  originality: string;
  duplicate_of_id: string | null;
  duplicate_title: string | null;
  similarity_score: number | null;
  need_breadth: number;
  pay_willingness: number;
  feasibility: number;
  basic_bounty: number;
  boss_level: number;
  boss_reasoning: string;
  bounty_amount: number;
  ai_reasoning: string;
  created_at: string;
}

/** Inline evaluation summary — shown directly on page after submit */
function InlineResult({ idea, onViewDetail }: { idea: IdeaResult; onViewDetail: () => void }) {
  const hasBoss = idea.boss_level > 0;
  const isDuplicate = idea.originality === 'duplicate';
  const isSuspectedDuplicate = idea.originality === 'suspected_duplicate';
  const dims = [idea.need_breadth, idea.pay_willingness, idea.feasibility];
  const passedCount = dims.filter((d) => d >= 5).length;

  // Parse reasoning paragraphs
  const paragraphs = idea.ai_reasoning?.split(/[|｜]/).map(s => s.trim()).filter(Boolean) || [];

  return (
    <div className={`rounded-2xl border-2 overflow-hidden ${
      hasBoss ? 'border-amber-300 bg-gradient-to-b from-amber-50 to-white' :
      'border-emerald-200 bg-gradient-to-b from-emerald-50 to-white'
    }`}>
      {/* Score header */}
      <div className="px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{hasBoss ? '👑' : '🧧'}</span>
          <div>
            <p className="text-2xl font-black text-red-500">¥{idea.bounty_amount.toFixed(2)}</p>
            <p className="text-xs text-gray-400">
              {hasBoss ? `Boss ${idea.boss_level === 648 ? '封顶' : '红包'}` : '基础红包'} · 达标 {passedCount}/3 维
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {[
            { label: '影响多少人', score: idea.need_breadth, icon: '👥' },
            { label: '愿意付钱吗', score: idea.pay_willingness, icon: '💰' },
            { label: '能做出来吗', score: idea.feasibility, icon: '🛠️' },
          ].map(d => (
            <div key={d.label} className="text-center">
              <p className="text-lg">{d.icon}</p>
              <p className={`text-lg font-bold ${d.score >= 5 ? 'text-gray-900' : 'text-gray-400'}`}>
                {d.score.toFixed(2)}
              </p>
              <p className="text-[10px] text-gray-400">{d.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* AI reasoning inline */}
      <div className="px-5 pb-4">
        {(isDuplicate || isSuspectedDuplicate) && (
          <div className={`mb-3 rounded-xl border px-4 py-3 text-sm ${
            isDuplicate ? 'border-red-200 bg-red-50 text-red-700' : 'border-amber-200 bg-amber-50 text-amber-700'
          }`}>
            <p className="font-bold">{isDuplicate ? '🔁 已有人提过类似点子' : '⚠️ 发现疑似类似点子'}</p>
            <p className="mt-1 text-xs opacity-90">
              {isDuplicate ? '这个点子的核心问题与已有提交重复，因此红包已大幅减少或取消。' : '它可能与已有提交相似，红包会按疑似重复规则减少。'}
            </p>
            {idea.duplicate_title && <p className="mt-1 text-xs font-medium">相似历史点子：{idea.duplicate_title}</p>}
          </div>
        )}
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-xs font-bold text-gray-500 mb-3">🤖 AI 评语</p>
          <div className="space-y-2">
            {paragraphs.map((p, i) => {
              const hasEmoji = /^[🎯👥💰⚡💬📌🔍💡🏪🧑🏛️🌊🌾❤️🛠️⚠️✅📊]/.test(p);
              return (
                <p key={i} className={`text-sm leading-relaxed ${hasEmoji ? 'font-medium text-gray-800' : 'text-gray-600'}`}>
                  {p}
                </p>
              );
            })}
            {paragraphs.length === 0 && <p className="text-sm text-gray-400">评估完成</p>}
          </div>
        </div>
      </div>

      <div className="px-5 pb-4 flex gap-2">
        <button
          onClick={onViewDetail}
          className="flex-1 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition"
        >
          查看完整评估报告 →
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<IdeaResult | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [ideas, setIdeas] = useState<IdeaResult[]>([]);
  const [loadingIdeas, setLoadingIdeas] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIdeas = useCallback(async () => {
    try {
      const res = await fetch('/api/ideas');
      const data = await res.json();
      setIdeas(data.ideas || []);
    } catch { /* silent */ } finally {
      setLoadingIdeas(false);
    }
  }, []);

  useEffect(() => { fetchIdeas(); }, [fetchIdeas]);

  const handleSubmit = async (data: SubmitData) => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error || '提交失败'); return; }
      setResult(json.idea);
      setShowModal(false);
      fetchIdeas();
    } catch {
      setError('网络错误，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* ── Hero ── */}
      <header className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative max-w-4xl mx-auto px-4 py-16 md:py-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur rounded-full text-sm text-blue-200 mb-6 border border-white/10">
            💡 AI 驱动 · 商业价值评估 · 红包悬赏
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Idea Bounty</h1>
          <p className="text-xl text-blue-200 mb-2 font-medium">商业点子收集器</p>
          <p className="text-blue-300/80 text-sm max-w-md mx-auto leading-relaxed">
            提出你的社会痛点与商业创意，AI 为你评估商业价值，优秀点子赢取 Boss 红包
          </p>
          <div className="flex items-center justify-center gap-6 mt-8 text-sm text-blue-300/60">
            <span className="flex items-center gap-1">🧧 最高 ¥648</span>
            <span className="flex items-center gap-1">🤖 deepseek-v4-pro</span>
            <span className="flex items-center gap-1">📊 0-10 精度评分</span>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left: Form + Inline Result */}
          <section className="lg:col-span-2">
            <div className="sticky top-8 space-y-4">
              <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">✍️ 提交新点子</h2>
                <p className="text-xs text-gray-400 mb-5">描述社会痛点，AI 为你评估商业价值</p>
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-2">
                    ⚠️ {error}
                  </div>
                )}
                <IdeaForm onSubmit={handleSubmit} loading={submitting} />
              </div>

              {/* Inline evaluation result */}
              {result && <InlineResult idea={result} onViewDetail={() => setShowModal(true)} />}
            </div>
          </section>

          {/* Right: Ideas Gallery */}
          <section className="lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">📋 点子广场</h2>
              <span className="text-xs text-gray-400">{ideas.length} 个点子</span>
            </div>
            <IdeaList ideas={ideas} loading={loadingIdeas} />
          </section>
        </div>
      </main>

      {/* Full detail modal */}
      {result && showModal && <ResultCard idea={result} onClose={() => setShowModal(false)} />}

      <footer className="text-center py-8 text-sm text-gray-400 border-t border-gray-100">
        <p>Idea Bounty · AI 驱动的商业点子悬赏平台</p>
        <p className="text-xs mt-1 text-gray-300">红包金额仅供展示，不涉及真实支付</p>
      </footer>
    </div>
  );
}
