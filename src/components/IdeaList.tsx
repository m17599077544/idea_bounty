'use client';

interface IdeaListItem {
  id: string;
  title: string;
  description: string;
  category: string | null;
  submitter_name: string;
  originality: string;
  need_breadth: number;
  pay_willingness: number;
  feasibility: number;
  basic_bounty: number;
  boss_level: number;
  bounty_amount: number;
  ai_reasoning: string;
  created_at: string;
}

interface IdeaListProps {
  ideas: IdeaListItem[];
  loading: boolean;
}

function Badge({ children, color }: { children: React.ReactNode; color: string }) {
  return <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${color}`}>{children}</span>;
}

export default function IdeaList({ ideas, loading }: IdeaListProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-5 animate-pulse border border-gray-100">
            <div className="h-5 bg-gray-100 rounded w-2/3 mb-3" />
            <div className="h-4 bg-gray-50 rounded w-full mb-2" />
            <div className="h-4 bg-gray-50 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (ideas.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
        <p className="text-5xl mb-4">💡</p>
        <p className="text-gray-400 font-medium">还没有点子</p>
        <p className="text-gray-300 text-sm mt-1">来做第一个提交者吧！</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {ideas.map((idea, idx) => {
        const dims = [idea.need_breadth, idea.pay_willingness, idea.feasibility];
        const passed = dims.filter((d) => d >= 5).length;
        const isBoss = idea.boss_level > 0;
        const isDup = idea.originality === 'duplicate';

        return (
          <div
            key={idea.id}
            className={`group bg-white rounded-2xl p-5 border transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${
              isBoss ? 'border-amber-200 bg-gradient-to-r from-white to-amber-50/30' :
              isDup ? 'border-red-100 opacity-60' :
              'border-gray-100 shadow-sm'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {/* Title row */}
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-xs text-gray-300 font-mono tabular-nums w-5">#{idx + 1}</span>
                  <h4 className="font-bold text-gray-900 truncate">{idea.title}</h4>
                  {isBoss && <Badge color="bg-amber-100 text-amber-700">👑 Boss ¥{idea.boss_level}</Badge>}
                  {idea.originality === 'duplicate' && <Badge color="bg-red-100 text-red-600">🔁 重复</Badge>}
                  {idea.originality === 'suspected_duplicate' && <Badge color="bg-yellow-100 text-yellow-600">⚠️ 疑似</Badge>}
                  {idea.originality === 'fresh' && !isBoss && <Badge color="bg-green-100 text-green-600">✨ 原创</Badge>}
                  {idea.category && <Badge color="bg-gray-100 text-gray-500">{idea.category}</Badge>}
                </div>

                {/* Description */}
                <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed mb-3">
                  {idea.description || '（无痛点描述）'}
                </p>

                {/* Meta row */}
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1">👤 {idea.submitter_name}</span>
                  <span className="flex items-center gap-1">
                    {['👥', '💰', '⚡'].map((icon, i) => (
                      <span key={i} className={dims[i] >= 5 ? 'opacity-100' : 'opacity-30'}>{icon}</span>
                    ))}
                    <span className="ml-1">{passed}/3 达标</span>
                  </span>
                  <span>{idea.created_at}</span>
                </div>

                {/* AI Reasoning preview */}
                {idea.ai_reasoning && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="space-y-1">
                      {idea.ai_reasoning.split(/[|｜]/).map(s => s.trim()).filter(Boolean).slice(0, 3).map((p, i) => (
                        <p key={i} className="text-xs text-gray-500 leading-relaxed">{p}</p>
                      ))}
                      {idea.ai_reasoning.split(/[|｜]/).length > 3 && (
                        <p className="text-[10px] text-gray-300">... 展开看更多</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Bounty */}
              <div className={`text-right flex-shrink-0 px-4 py-2 rounded-xl ${
                isBoss ? 'bg-amber-50' : idea.bounty_amount > 0 ? 'bg-red-50' : 'bg-gray-50'
              }`}>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">
                  {isBoss ? 'Boss 红包' : '红包'}
                </p>
                <p className={`text-2xl font-black tracking-tight ${
                  isBoss ? 'text-amber-600' : idea.bounty_amount > 0 ? 'text-red-500' : 'text-gray-300'
                }`}>
                  ¥{idea.bounty_amount.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
