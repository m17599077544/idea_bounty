'use client';

import { useState } from 'react';

interface AdminIdea {
  id: string;
  title: string;
  description: string;
  implementation: string;
  category: string | null;
  submitter_name: string;
  originality: string;
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
  status: string;
  bounty_status: string;
  created_at: string;
}

interface Stats {
  totalSubmissions: number;
  totalBounty: number;
  freshCount: number;
  duplicateCount: number;
  pendingReview: number;
  bossCount: number;
  averageScore: number;
}

interface AdminTableProps {
  ideas: AdminIdea[];
  stats: Stats;
  loading: boolean;
  onRefresh: () => void;
}

export default function AdminTable({ ideas, stats, loading, onRefresh }: AdminTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState<string>('');
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const sendAction = async (id: string, body: object, successMessage: string) => {
    const response = await fetch(`/api/admin/ideas/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw new Error(data?.error || '操作失败');
    }
    setMessage(successMessage);
    onRefresh();
  };

  const handleAdjust = async (id: string) => {
    const amount = parseFloat(editAmount);
    if (isNaN(amount) || amount < 0 || amount > 500) {
      setMessage('请输入有效金额 (¥0–¥500)');
      return;
    }
    setActionLoading(true);
    setMessage(null);
    try {
      await sendAction(id, { action: 'adjust', bountyAmount: amount }, '✅ 金额已调整');
      setEditingId(null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '操作失败');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id: string) => {
    setActionLoading(true);
    setMessage(null);
    try {
      await sendAction(id, { action: 'reject' }, '✅ 已驳回');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '操作失败');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setActionLoading(true);
    setMessage(null);
    try {
      await sendAction(id, { action: 'approve' }, '✅ 已通过');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '操作失败');
    } finally {
      setActionLoading(false);
    }
  };

  const bgClass = (type: string) => {
    if (type === 'duplicate') return 'bg-red-100 text-red-700';
    if (type === 'suspected_duplicate') return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-700';
  };

  const statusLabel = (type: string) => {
    if (type === 'duplicate') return '重复';
    if (type === 'suspected_duplicate') return '疑似';
    return '原创';
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-400">加载中...</div>;
  }

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="总提交" value={stats.totalSubmissions} />
        <StatCard label="红包总额" value={`¥${stats.totalBounty.toFixed(2)}`} />
        <StatCard label="原创点子" value={stats.freshCount} />
        <StatCard label="重复点子" value={stats.duplicateCount} />
        <StatCard label="待审核" value={stats.pendingReview} />
        <StatCard label="Boss 红包" value={stats.bossCount} />
        <StatCard label="平均分" value={stats.averageScore.toFixed(1)} />
      </div>

      {message && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
          {message}
        </div>
      )}

      {/* Ideas Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">标题</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">分类</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">提交者</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">查重</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">需求</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">付费</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">可行</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Boss</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">红包</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">状态</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {ideas.map((idea) => (
                <tr key={idea.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="max-w-[200px]">
                      <p className="font-medium text-gray-900 truncate">{idea.title}</p>
                      <p className="text-xs text-gray-400 truncate mt-0.5">{idea.ai_reasoning?.slice(0, 50)}...</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                      {idea.category || '未分类'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{idea.submitter_name}</td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${bgClass(idea.originality)}`}>
                        {statusLabel(idea.originality)}
                      </span>
                      {idea.similarity_score !== null && idea.originality !== 'fresh' && (
                        <p className="text-[10px] text-gray-500">语义相似度 {(idea.similarity_score * 100).toFixed(0)}%</p>
                      )}
                      {idea.duplicate_title && (
                        <p className="max-w-[160px] truncate text-[10px] text-gray-400" title={idea.duplicate_title}>
                          相似：{idea.duplicate_title}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center font-mono text-gray-700">{idea.need_breadth}</td>
                  <td className="px-4 py-3 text-center font-mono text-gray-700">{idea.pay_willingness}</td>
                  <td className="px-4 py-3 text-center font-mono text-gray-700">{idea.feasibility}</td>
                  <td className="px-4 py-3 text-center">
                    {idea.boss_level > 0 ? (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${idea.boss_level >= 648 ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        ¥{idea.boss_level}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-300">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-red-500">¥{idea.bounty_amount.toFixed(2)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      idea.status === 'adjusted' ? 'bg-blue-100 text-blue-700' :
                      idea.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      idea.status === 'approved' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {idea.bounty_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {editingId === idea.id ? (
                      <div className="flex items-center gap-1 justify-end">
                        <input
                          type="number"
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                          placeholder="金额"
                          step="0.01"
                          min="0"
                          max="2000"
                          disabled={actionLoading}
                        />
                        <button
                          onClick={() => handleAdjust(idea.id)}
                          disabled={actionLoading}
                          className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50"
                        >
                          确认
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-2 py-1 text-gray-400 hover:text-gray-600 text-xs"
                        >
                          取消
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => { setEditingId(idea.id); setEditAmount(String(idea.bounty_amount)); }}
                          className="px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded transition"
                          disabled={actionLoading}
                        >
                          调整
                        </button>
                        {idea.status !== 'approved' && (
                          <button
                            onClick={() => handleApprove(idea.id)}
                            disabled={actionLoading}
                            className="px-2 py-1 text-xs text-green-600 hover:bg-green-50 rounded transition"
                          >
                            通过
                          </button>
                        )}
                        {idea.status !== 'rejected' && (
                          <button
                            onClick={() => handleReject(idea.id)}
                            disabled={actionLoading}
                            className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded transition"
                          >
                            驳回
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {ideas.length === 0 && (
                <tr>
                  <td colSpan={11} className="text-center py-12 text-gray-400">
                    暂无数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
