import { create } from 'zustand';
import { 
  Node, 
  Edge, 
  applyNodeChanges, 
  applyEdgeChanges, 
  NodeChange, 
  EdgeChange,
  Connection,
  addEdge 
} from 'reactflow';
import { goalToNode, goalsToEdges } from '@/lib/types';

interface CanvasState {
  nodes: Node[];
  edges: Edge[];
  totalWeightage: number;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  addNode: (node: Node) => void;
  addNodeToDB: (node: Node) => Promise<void>;
  fetchGoalsFromDB: () => Promise<void>;
  submitGoalsToManager: () => Promise<void>;
  updateGoalProgress: (id: string, progress: number, status?: string) => void;
  onConnect: (connection: Connection) => void;
  deleteNode: (id: string) => void | Promise<void>;
}

const initialNodes: Node[] = [
  { id: 'hub-1', type: 'goalNode', position: { x: 400, y: 50 }, data: { title: 'Increase Q3 Software Revenue', weightage: 40, isHub: true, targetValue: '$5M', uom: 'USD', progress: 65 } },
  { id: 'goal-1', type: 'goalNode', position: { x: 200, y: 250 }, data: { title: 'Launch Enterprise Portal', weightage: 20, status: 'completed', targetValue: '100', uom: '%', progress: 100 } },
  { id: 'goal-2', type: 'goalNode', position: { x: 600, y: 250 }, data: { title: 'Reduce Cloud Hosting Costs', weightage: 20, status: 'atRisk', targetValue: '15', uom: '%', progress: 30 } },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: 'hub-1', target: 'goal-1', animated: true, style: { stroke: '#a855f7', strokeWidth: 3, opacity: 0.8 } },
  { id: 'e1-3', source: 'hub-1', target: 'goal-2', animated: true, style: { stroke: '#a855f7', strokeWidth: 3, opacity: 0.8 } },
];

export const useCanvasStore = create<CanvasState>((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,
  
  get totalWeightage() {
    return get().nodes.reduce((acc, node) => acc + (node.data?.weightage || 0), 0);
  },

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  
  onNodesChange: (changes) => set({ nodes: applyNodeChanges(changes, get().nodes) }),
  onEdgesChange: (changes) => set({ edges: applyEdgeChanges(changes, get().edges) }),
  
  addNode: (node) => set({ nodes: [...get().nodes, node] }),

  addNodeToDB: async (node) => {
    const hub = get().nodes.find((item) => item.data?.isHub);
    const response = await fetch('/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        parent_goal_id: hub?.id ?? null,
        title: node.data?.title,
        description: node.data?.description ?? '',
        category: node.data?.category,
        uom_type: node.data?.uom,
        target_value: String(node.data?.targetValue ?? ''),
        baseline_value: node.data?.baselineValue ?? null,
        weightage: node.data?.weightage,
        progress: node.data?.progress ?? 0,
        position_x: node.position.x,
        position_y: node.position.y,
      }),
    });

    if (!response.ok) throw new Error(await response.text());
    const { goal } = await response.json();
    const savedNode = goal?.id ? goalToNode(goal) : node;
    set({
      nodes: [...get().nodes, savedNode],
      edges: goal?.parent_goal_id
        ? [...get().edges, { id: `edge-${goal.parent_goal_id}-${goal.id}`, source: goal.parent_goal_id, target: goal.id, animated: true, style: { stroke: '#a855f7', strokeWidth: 3, opacity: 0.8 } }]
        : get().edges,
    });
  },

  fetchGoalsFromDB: async () => {
    const response = await fetch('/api/goals?scope=mine', { cache: 'no-store' });
    if (!response.ok) return;
    const { goals } = await response.json();
    if (!Array.isArray(goals) || goals.length === 0) return;
    set({ nodes: goals.map(goalToNode), edges: goalsToEdges(goals) });
  },

  submitGoalsToManager: async () => {
    const ids = get().nodes.filter((node) => !node.data?.isHub).map((node) => node.id);
    const response = await fetch('/api/goals/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    });
    if (!response.ok) throw new Error(await response.text());
    set({
      nodes: get().nodes.map((node) => node.data?.isHub ? node : {
        ...node,
        data: { ...node.data, rawStatus: 'submitted', status: 'onTrack' },
      }),
    });
  },

  updateGoalProgress: (id, progress, status) => {
    set({
      nodes: get().nodes.map((node) => node.id === id
        ? { ...node, data: { ...node.data, progress, ...(status ? { rawStatus: status, status: status === 'at_risk' ? 'atRisk' : status === 'completed' ? 'completed' : node.data?.status } : {}) } }
        : node),
    });
  },

  // NEW: Handles dragging a connection line between two nodes
  onConnect: (connection) => {
    const newEdge = { 
      ...connection, 
      animated: true, 
      style: { stroke: '#10b981', strokeWidth: 3, opacity: 0.8 } 
    };
    set({ edges: addEdge(newEdge, get().edges) });
  },

  // NEW: Removes a node and any edges connected to it
  deleteNode: async (id) => {
    fetch(`/api/goals?id=${id}`, { method: 'DELETE' }).catch(() => undefined);
    set({
      nodes: get().nodes.filter((node) => node.id !== id),
      edges: get().edges.filter((edge) => edge.source !== id && edge.target !== id)
    });
  }
}));
