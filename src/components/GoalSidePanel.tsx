import React, { useState } from 'react';
import { X, Save, Zap, Sparkles, Loader2 } from 'lucide-react';
import { useCanvasStore } from '@/store/useCanvasStore';

export default function GoalSidePanel({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uom, setUom] = useState('Min (Higher is better)');
  const [target, setTarget] = useState('');
  const [weightage, setWeightage] = useState(15);
  const [category, setCategory] = useState('Product Innovation');
  const [error, setError] = useState('');
  
  // New state for the AI loading effect
  const [isGenerating, setIsGenerating] = useState(false);

  const addNodeToDB = useCanvasStore((state) => state.addNodeToDB);
  const nodeCount = useCanvasStore((state) => state.nodes.filter((node) => !node.data?.isHub).length);

  const handleInjectNode = async () => {
    setError('');
    if (!title || !target || !description) return setError('Goal title, description, and target are required.');
    if (nodeCount >= 8) return setError('Maximum 8 goals allowed per cycle.');
    if (weightage < 10) return setError('Minimum weightage per individual goal is 10%.');
    
    await addNodeToDB({
      id: `goal-${Math.random().toString(36).substring(2, 9)}`,
      type: 'goalNode',
      position: { x: Math.random() * 200 + 100, y: Math.random() * 200 + 100 },
      data: { title, description, category, weightage, status: 'onTrack', rawStatus: 'draft', targetValue: target, uom, progress: 0 },
    });

    setTitle('');
    setDescription('');
    setTarget('');
    setWeightage(15);
    onClose();
  };

  // The Simulated AI Pathfinder Function
  const handleAIGenerate = async () => {
    setIsGenerating(true);
    setError('');

    try {
      const response = await fetch('/api/ai/generate-goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category }),
      });
      if (!response.ok) throw new Error('AI generation failed.');
      const { goal } = await response.json();
      setTitle(goal.title);
      setDescription(goal.description ?? 'SMART goal generated for the selected thrust area, with clear quarterly tracking and manager review.');
      setUom(goal.uom);
      setTarget(goal.target);
    } catch {
      setError('AI is unavailable, but you can still enter the goal manually.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-slate-900/20 dark:bg-[#020617]/60 backdrop-blur-sm z-30 transition-opacity" onClick={onClose} />}
      
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-[#0f172a] border-l border-slate-200 dark:border-slate-800 shadow-2xl z-40 transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Zap className="text-emerald-600 dark:text-emerald-400" size={20} />
              Configure Node
            </h2>
          </div>
          <button aria-label="Close panel" onClick={onClose} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="space-y-2">
            <label htmlFor="category" className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Thrust Area / Category</label>
            <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} disabled={isGenerating} className="w-full bg-white dark:bg-[#020617] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-200 p-3 rounded-lg focus:outline-none focus:border-emerald-500 disabled:opacity-50">
              <option>Product Innovation</option>
              <option>Operational Excellence</option>
              <option>Revenue Growth</option>
            </select>
          </div>

          {/* The AI Pathfinder Button */}
          <button 
            onClick={handleAIGenerate} 
            disabled={isGenerating}
            className="w-full flex items-center justify-center gap-2 bg-purple-600/10 hover:bg-purple-600/20 text-purple-700 dark:text-purple-400 border border-purple-500/30 p-3 rounded-lg font-bold tracking-wide transition-all disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Synthesizing KPIs...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Auto-Generate SMART Goal
              </>
            )}
          </button>

          <div className="space-y-2">
            <label htmlFor="title" className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Node Title</label>
            <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} disabled={isGenerating} placeholder="e.g., Optimize Frontend Load Time" className="w-full bg-white dark:bg-[#020617] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-200 p-3 rounded-lg focus:outline-none focus:border-emerald-500 disabled:opacity-50 transition-all" />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Goal Description</label>
            <textarea id="description" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} disabled={isGenerating} placeholder="Describe the outcome, scope, and success signal." className="w-full bg-white dark:bg-[#020617] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-200 p-3 rounded-lg focus:outline-none focus:border-emerald-500 disabled:opacity-50 transition-all resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="uom" className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">UoM Type</label>
              <select id="uom" value={uom} onChange={(e) => setUom(e.target.value)} disabled={isGenerating} className="w-full bg-white dark:bg-[#020617] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-200 p-3 rounded-lg focus:outline-none focus:border-emerald-500 disabled:opacity-50 transition-all">
                <option>Min (Higher is better)</option>
                <option>Max (Lower is better)</option>
                <option>Timeline</option>
                <option>Zero-based</option>
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="target" className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Target</label>
              <input id="target" type="text" value={target} onChange={(e) => setTarget(e.target.value)} disabled={isGenerating} placeholder="e.g., 200ms" className="w-full bg-white dark:bg-[#020617] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-200 p-3 rounded-lg focus:outline-none focus:border-emerald-500 disabled:opacity-50 transition-all" />
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center">
              <label htmlFor="weightage" className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Power Weightage</label>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">{weightage}%</span>
            </div>
            <input id="weightage" type="range" min="10" max="100" value={weightage} onChange={(e) => setWeightage(Number(e.target.value))} disabled={isGenerating} className="w-full accent-emerald-600 dark:accent-emerald-500 disabled:opacity-50 transition-all" />
            {weightage < 10 && <p className="text-rose-500 dark:text-rose-400 text-xs mt-1">Minimum weightage per individual goal is 10%.</p>}
            {nodeCount >= 8 && <p className="text-rose-500 dark:text-rose-400 text-xs mt-1">Maximum 8 goals allowed in one cycle.</p>}
            {error && <p className="text-rose-500 dark:text-rose-400 text-xs mt-3">{error}</p>}
          </div>
        </div>

        <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <button aria-label="Inject node to canvas" onClick={handleInjectNode} disabled={isGenerating || nodeCount >= 8 || weightage < 10} className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white p-3 rounded-lg font-bold tracking-wide transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
            <Save size={18} />
            Inject Node to Canvas
          </button>
        </div>
      </div>
    </>
  );
}
