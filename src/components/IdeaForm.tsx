'use client';

import { useState, FormEvent } from 'react';
import { randomSubmitterName } from '@/lib/utils';

interface IdeaFormProps {
  onSubmit: (data: SubmitData) => Promise<void>;
  loading: boolean;
}

export interface SubmitData {
  title: string;
  painPoint: string;
  implementation: string;
  category: string;
  submitterName: string;
}

const CATEGORIES = ['', '生活服务', '健康医疗', '教育学习', '金融理财', '社交娱乐', '出行交通', '工作效率', '乡村振兴', '环保低碳', '其他'];

export default function IdeaForm({ onSubmit, loading }: IdeaFormProps) {
  const [title, setTitle] = useState('');
  const [painPoint, setPainPoint] = useState('');
  const [implementation, setImplementation] = useState('');
  const [category, setCategory] = useState('');
  const [submitterName, setSubmitterName] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!painPoint.trim()) {
      setValidationError('请至少描述一段你发现的痛点或问题');
      return;
    }
    setValidationError('');
    await onSubmit({
      title: title.trim(),
      painPoint: painPoint.trim(),
      implementation: implementation.trim(),
      category,
      submitterName: submitterName.trim() || randomSubmitterName(),
    });
    setTitle('');
    setPainPoint('');
    setImplementation('');
    setCategory('');
    setSubmitterName('');
  };

  const inputClass = 'w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 hover:bg-white focus:bg-white text-gray-900 placeholder:text-gray-400';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-1.5">
          点子标题 <span className="text-gray-400 font-normal text-xs ml-1">（可选，不填会自动生成）</span>
        </label>
        <input
          id="title" type="text" value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="给你的点子起个名字，如：共享社区冰箱"
          className={inputClass}
          maxLength={100} disabled={loading}
        />
      </div>

      {/* Pain Point */}
      <div>
        <label htmlFor="painPoint" className="block text-sm font-semibold text-gray-700 mb-1.5">
          🎯 痛点 / 点子描述 <span className="text-red-400">*</span>
        </label>
        <textarea
          id="painPoint" value={painPoint}
          onChange={(e) => setPainPoint(e.target.value)}
          placeholder="你发现了什么社会痛点？影响了谁？有多严重？"
          className={inputClass + ' resize-none'}
          rows={4} maxLength={5000} disabled={loading}
        />
          <p className="text-[10px] text-gray-400 mt-1 text-right">{painPoint.length}/5000</p>
          {validationError && <p className="text-xs text-red-500 mt-1">{validationError}</p>}
      </div>

      {/* Implementation */}
      <div>
        <label htmlFor="implementation" className="block text-sm font-semibold text-gray-700 mb-1.5">
          🛠️ 具体实施方案
          <span className="text-gray-400 font-normal text-xs ml-1">（可选）</span>
        </label>
        <textarea
          id="implementation" value={implementation}
          onChange={(e) => setImplementation(e.target.value)}
          placeholder="你的解决方案是什么？技术路线？商业模式？"
          className={inputClass + ' resize-none'}
          rows={4} maxLength={5000} disabled={loading}
        />
        <p className="text-[10px] text-gray-400 mt-1 text-right">{implementation.length}/5000</p>
      </div>

      {/* Category + Name */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-1.5">
            📂 分类
          </label>
          <select id="category" value={category} onChange={(e) => setCategory(e.target.value)}
            className={inputClass + ' appearance-none cursor-pointer'} disabled={loading}>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat || '选择分类'}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1.5">
            👤 昵称
          </label>
          <input id="name" type="text" value={submitterName}
            onChange={(e) => setSubmitterName(e.target.value)}
            placeholder="留空随机生成"
            className={inputClass} maxLength={20} disabled={loading}
          />
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || !painPoint.trim()}
        className="w-full py-3.5 px-6 bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 text-white font-bold rounded-xl
          hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5
          focus:ring-4 focus:ring-blue-300
          disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none
          transition-all duration-200"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            AI 深度评估中...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            🚀 提交点子 · 获取红包评估
          </span>
        )}
      </button>
    </form>
  );
}
