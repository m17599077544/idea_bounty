'use client';

interface ResultCardProps {
  idea: {
    title: string;
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
    submitter_name: string;
  };
  onClose: () => void;
}

/** Split reasoning by | or ｜ into readable paragraphs */
function formatReasoning(text: string): string[] {
  if (!text) return [];
  return text.split(/[|｜]/).map(s => s.trim()).filter(Boolean);
}

export default function ResultCard({ idea, onClose }: ResultCardProps) {
  const isDuplicate = idea.originality === 'duplicate';
  const isSuspected = idea.originality === 'suspected_duplicate';
  const hasBoss = idea.boss_level > 0;
  const paragraphs = formatReasoning(idea.ai_reasoning);
  const bossParagraphs = formatReasoning(idea.boss_reasoning);

  const dims = [idea.need_breadth, idea.pay_willingness, idea.feasibility];
  const passedCount = dims.filter((d) => d >= 5).length;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-200">

        {/* ── Header ── */}
        <div className={`relative p-6 rounded-t-3xl overflow-hidden ${
          hasBoss ? 'bg-gradient-to-br from-amber-400 via-orange-400 to-red-400' :
          isDuplicate ? 'bg-gradient-to-br from-red-400 to-pink-500' :
          isSuspected ? 'bg-gradient-to-br from-yellow-400 to-amber-500' :
          'bg-gradient-to-br from-emerald-400 to-teal-500'
        }`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative flex justify-between items-start">
            <div className="text-white">
              <div className="flex items-center gap-2 mb-2">
                {hasBoss ? '🏆' : isDuplicate ? '🔁' : isSuspected ? '⚠️' : '💡'}
                <span className="text-white/80 text-xs font-medium uppercase tracking-wide">
                  {hasBoss ? 'Boss 红包' : isDuplicate ? '重复点子' : isSuspected ? '疑似重复' : '原创点子'}
                </span>
              </div>
              <h3 className="text-xl font-bold leading-tight">{idea.title}</h3>
              <p className="text-white/70 text-sm mt-1">👤 {idea.submitter_name}</p>
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white transition text-2xl leading-none">&times;</button>
          </div>
        </div>

        {/* ── Bounty Amount ── */}
        <div className="px-6 py-5 text-center bg-gradient-to-b from-gray-50 to-white border-b border-gray-100">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">红包金额</p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl">🧧</span>
            <span className={`text-6xl font-black tracking-tight ${idea.bounty_amount > 0 ? 'text-red-500' : 'text-gray-300'}`}>
              ¥{idea.bounty_amount.toFixed(2)}
            </span>
          </div>
          {hasBoss && (
            <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-100 to-orange-100 rounded-full">
              <span className="text-lg">👑</span>
              <span className="text-sm font-bold text-amber-700">
                {idea.boss_level === 648 ? 'Boss 封顶 ¥648' : 'Boss ¥66'}
              </span>
            </div>
          )}
          {!hasBoss && idea.basic_bounty > 0 && (
            <p className="text-xs text-gray-400 mt-2">
              基础红包 · 达标 {passedCount}/3 维 · 得分 {idea.need_breadth}+{idea.pay_willingness}+{idea.feasibility}
            </p>
          )}
          {!hasBoss && idea.basic_bounty < 0.5 && (
            <p className="text-xs text-orange-400 mt-2">🌱 鼓励金一枚，继续加油！</p>
          )}
        </div>

        {(isDuplicate || isSuspected) && (
          <div className={`mx-6 mt-5 rounded-2xl border px-4 py-3 ${
            isDuplicate ? 'border-red-200 bg-red-50' : 'border-amber-200 bg-amber-50'
          }`}>
            <p className={`text-sm font-bold ${isDuplicate ? 'text-red-700' : 'text-amber-700'}`}>
              {isDuplicate ? '🔁 已有人提过类似点子' : '⚠️ 发现疑似类似点子'}
            </p>
            <p className={`mt-1 text-xs leading-relaxed ${isDuplicate ? 'text-red-600' : 'text-amber-600'}`}>
              {isDuplicate ? '系统判断核心问题与已有提交重复，红包已大幅减少或取消。' : '系统发现可能相似的已有提交，红包已按疑似重复规则减少。'}
            </p>
            {idea.duplicate_title && <p className="mt-1 text-xs font-medium">相似历史点子：{idea.duplicate_title}</p>}
          </div>
        )}

        {/* ── 3 Dimension Scores ── */}
        <div className="px-6 py-5 border-b border-gray-100">
          <h4 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
            📊 怎么看这个分数
            <span className="text-xs text-gray-400 font-normal">（5 分就算达标，满分 10）</span>
          </h4>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: '影响多少人', score: idea.need_breadth, icon: '👥', color: 'bg-blue-50 border-blue-200' },
              { label: '愿意付钱吗', score: idea.pay_willingness, icon: '💰', color: 'bg-green-50 border-green-200' },
              { label: '能做出来吗', score: idea.feasibility, icon: '🛠️', color: 'bg-purple-50 border-purple-200' },
            ].map((dim) => (
              <div key={dim.label} className={`text-center p-3 rounded-xl border-2 ${dim.color} ${dim.score >= 5 ? '' : 'opacity-50'}`}>
                <p className="text-xl mb-1">{dim.icon}</p>
                <p className="text-2xl font-black text-gray-900 tabular-nums">{dim.score.toFixed(2)}</p>
                <p className="text-[11px] mt-1 font-medium text-gray-500">{dim.label}</p>
                <p className="text-[10px] text-gray-400">{dim.score >= 8 ? '卓越' : dim.score >= 6 ? '优秀' : dim.score >= 5 ? '达标' : '不足'}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── AI 评语（大白话） ── */}
        <div className="px-6 py-5 border-b border-gray-100">
          <h4 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
            🤖 AI 跟你聊聊这个点子
          </h4>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100">
            {paragraphs.length > 0 ? (
              <div className="space-y-3">
                {paragraphs.map((p, i) => {
                  // Detect if this paragraph starts with an emoji → highlight it
                  const hasEmoji = /^[🎯👥💰⚡💬📌🔍💡🏪🧑🏛️🌊🌾❤️🛠️⚠️✅]/.test(p);
                  return (
                    <p key={i} className={`text-sm leading-relaxed ${hasEmoji ? 'font-medium text-gray-800' : 'text-gray-600'}`}>
                      {p}
                    </p>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500">评估完成，暂无详细评语。</p>
            )}
          </div>
        </div>

        {/* ── Boss 评审意见 ── */}
        {hasBoss && bossParagraphs.length > 0 && (
          <div className="px-6 py-5 bg-gradient-to-b from-amber-50 to-orange-50 border-b border-amber-100">
            <h4 className="text-sm font-bold text-amber-700 mb-4 flex items-center gap-2">
              👑 Boss 评审怎么看
            </h4>
            <div className="bg-white/60 rounded-2xl p-5 border border-amber-200">
              <div className="space-y-3">
                {bossParagraphs.map((p, i) => (
                  <p key={i} className="text-sm text-amber-900 leading-relaxed">{p}</p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        <div className="px-6 py-4 text-center">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-all active:scale-95"
          >
            知道了
          </button>
        </div>
      </div>
    </div>
  );
}
