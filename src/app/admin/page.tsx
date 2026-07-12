'use client';

import { useState, useEffect, useCallback } from 'react';
import AdminTable from '@/components/AdminTable';

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

export default function AdminPage() {
  const [ideas, setIdeas] = useState<AdminIdea[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalSubmissions: 0,
    totalBounty: 0,
    freshCount: 0,
    duplicateCount: 0,
    pendingReview: 0,
    bossCount: 0,
    averageScore: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [ideasRes, statsRes] = await Promise.all([
        fetch('/api/admin/ideas'),
        fetch('/api/admin/stats'),
      ]);
      const ideasData = await ideasRes.json();
      const statsData = await statsRes.json();
      setIdeas(ideasData.ideas || []);
      setStats(statsData.stats || stats);
    } catch {
      // handle silently
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="flex-1">
      <header className="bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">⚙️ 管理后台</h1>
            <p className="text-gray-400 text-sm mt-1">Idea Bounty Admin</p>
          </div>
          <div className="flex items-center gap-4">
            <a href="/" className="text-sm text-gray-300 hover:text-white transition">
              ← 返回前台
            </a>
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition"
            >
              🔄 刷新数据
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <AdminTable
          ideas={ideas}
          stats={stats}
          loading={loading}
          onRefresh={fetchData}
        />
      </main>
    </div>
  );
}
