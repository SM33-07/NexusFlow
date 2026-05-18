'use client';
import React from 'react';
import ReactFlow, { Background, Controls } from 'reactflow';
import 'reactflow/dist/style.css';
import GoalNode from './GoalNode';
import { useCanvasStore } from '@/store/useCanvasStore';
import { GitPullRequestArrow, MousePointerClick, Radar } from 'lucide-react';

const nodeTypes = { goalNode: GoalNode };

export default function NexusCanvas({ onOpenNodeEditor }: { onOpenNodeEditor?: () => void }) {
  const nodes = useCanvasStore((state) => state.nodes);
  const edges = useCanvasStore((state) => state.edges);
  const onNodesChange = useCanvasStore((state) => state.onNodesChange);
  const onEdgesChange = useCanvasStore((state) => state.onEdgesChange);
  const totalWeightage = useCanvasStore((state) => state.totalWeightage);

  return (
    <div className="w-full h-[75vh] min-h-[600px] bg-slate-50 dark:bg-[#0f172a] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 relative shadow-2xl">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-scan" />
      
      {/* CSS Override for React Flow Controls to fix the white block bug */}
      <style>{`
        .react-flow__controls {
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1) !important;
          border-radius: 0.5rem !important;
          overflow: hidden !important;
          border: 1px solid var(--control-border, #e2e8f0);
        }
        .react-flow__controls-button {
          background-color: var(--control-bg, #ffffff) !important;
          border-bottom: 1px solid var(--control-border, #e2e8f0) !important;
          fill: var(--control-icon, #1e293b) !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        .react-flow__controls-button:hover {
          background-color: var(--control-hover, #f1f5f9) !important;
        }
        .dark .react-flow__controls-button {
          --control-bg: #1e293b;
          --control-border: #334155;
          --control-icon: #f8fafc;
          --control-hover: #334155;
        }
        .dark .react-flow__controls {
          --control-border: #334155;
        }
        .react-flow__controls-button:last-child {
          border-bottom: none !important;
        }
      `}</style>

      <div className="absolute top-4 left-4 z-10 bg-white/90 dark:bg-slate-900/80 p-4 rounded-lg border border-slate-200 dark:border-slate-700 backdrop-blur-sm shadow-lg">
        <h2 className="text-slate-800 dark:text-slate-200 font-bold mb-1">Canvas Weightage</h2>
        <div className={`text-3xl font-mono ${totalWeightage === 100 ? 'text-emerald-600 dark:text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)] dark:drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'text-rose-500 dark:text-rose-400'}`}>
          {totalWeightage}%
        </div>
      </div>

      <div className="absolute bottom-4 right-4 z-10 hidden max-w-sm rounded-lg border border-slate-200 bg-white/90 p-3 shadow-lg backdrop-blur dark:border-slate-700 dark:bg-slate-900/80 md:block">
        <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
          <Radar size={14} className="text-emerald-500 animate-pulse" />
          Interactive surface
        </div>
        <div className="grid gap-2 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-2"><MousePointerClick size={14} /> Click canvas to create goals</div>
          <div className="flex items-center gap-2"><GitPullRequestArrow size={14} /> Drag nodes to reframe priority</div>
        </div>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        className="bg-slate-50 dark:bg-[#0f172a]"
        onPaneClick={onOpenNodeEditor} 
        onNodeClick={onOpenNodeEditor} 
      >
        <Background color="#64748b" gap={20} size={2} />
        <Controls />
      </ReactFlow>
    </div>
  );
}
