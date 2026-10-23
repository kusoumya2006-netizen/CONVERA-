import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useCaseWatch } from '../../context/CaseWatchContext';
import { Institution, CaseRecord, OverlapAlert, Bureau, CaseStatus, GraphNode, GraphEdge } from '../../types';
import { calculateExplainablePriority } from '../../engine/priorityEngine';
import {
  Building2,
  FolderKanban,
  GitCompare,
  GitMerge,
  Search,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ExternalLink,
  ShieldAlert,
  Flame,
  CheckCircle2,
  Table,
  Share2,
  SlidersHorizontal,
  ChevronRight,
  Info,
  X
} from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

export const CrossBureauIntelligenceGraph: React.FC = () => {
  const {
    cases,
    institutions,
    alerts,
    setSelectedCaseId,
    setSelectedInstitutionId,
    setActiveTab,
    focusedGraphEntity,
    setFocusedGraphEntity
  } = useCaseWatch();

  // Filters & View State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBureau, setSelectedBureau] = useState<Bureau | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<CaseStatus | 'ALL' | 'OVERDUE'>('ALL');
  const [relationshipFilter, setRelationshipFilter] = useState<'ALL' | 'OVERLAPS_ONLY' | 'CONFIRMED_ONLY' | 'MERGED_ONLY'>('ALL');
  const [selectedInstitutionFilter, setSelectedInstitutionFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'GRAPH' | 'TABLE'>('GRAPH');

  // Interactive Selection State
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Pan & Zoom State
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<Point>({ x: 0, y: 0 });

  // Node position overrides for dragging
  const [nodePositions, setNodePositions] = useState<Record<string, Point>>({});
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-focus incoming entity if passed from context
  useEffect(() => {
    if (focusedGraphEntity) {
      if (focusedGraphEntity.type === 'institution') {
        setSelectedInstitutionFilter(focusedGraphEntity.id);
        setSelectedNodeId(`inst-${focusedGraphEntity.id}`);
      } else if (focusedGraphEntity.type === 'case') {
        const targetCase = cases.find(c => c.caseId === focusedGraphEntity.id);
        if (targetCase) {
          setSelectedInstitutionFilter(targetCase.institutionId);
        }
        setSelectedNodeId(`case-${focusedGraphEntity.id}`);
      } else if (focusedGraphEntity.type === 'alert') {
        const targetAlert = alerts.find(a => a.alertId === focusedGraphEntity.id);
        if (targetAlert) {
          setSelectedInstitutionFilter(targetAlert.institutionId);
          setSelectedEdgeId(`edge-ovl-${targetAlert.alertId}`);
        }
      }
      setFocusedGraphEntity(null);
    }
  }, [focusedGraphEntity, cases, alerts, setFocusedGraphEntity]);

  // Bureau color palette
  const bureauColors: Record<Bureau, string> = {
    RB: '#4E88FF',
    PGRC: '#E066FF',
    AB: '#FFB347',
    Finance: '#69C9A0',
    Vigilance: '#F16D75'
  };

  // 1. Filter Cases
  const filteredCases = useMemo(() => {
    const nowMs = Date.now();
    return cases.filter(c => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = c.caseId.toLowerCase().includes(q);
        const matchesInst = (c.institutionName || '').toLowerCase().includes(q) || c.institutionId.toLowerCase().includes(q);
        const matchesDesc = c.description.toLowerCase().includes(q);
        if (!matchesId && !matchesInst && !matchesDesc) return false;
      }
      // Bureau
      if (selectedBureau !== 'ALL' && c.bureau !== selectedBureau) return false;
      // Status
      if (selectedStatus === 'OVERDUE') {
        if (c.status === 'Disposed' || new Date(c.expectedDisposalDate).getTime() >= nowMs) return false;
      } else if (selectedStatus !== 'ALL' && c.status !== selectedStatus) {
        return false;
      }
      // Institution
      if (selectedInstitutionFilter !== 'ALL' && c.institutionId !== selectedInstitutionFilter) return false;

      return true;
    });
  }, [cases, searchQuery, selectedBureau, selectedStatus, selectedInstitutionFilter]);

  // Set of included case IDs
  const includedCaseIds = useMemo(() => new Set(filteredCases.map(c => c.caseId)), [filteredCases]);

  // 2. Filter Institutions that have at least one case or match filter
  const relevantInstitutions = useMemo(() => {
    const instIdsWithCases = new Set(filteredCases.map(c => c.institutionId));
    return institutions.filter(inst => {
      if (selectedInstitutionFilter !== 'ALL' && inst.institutionId !== selectedInstitutionFilter) return false;
      return instIdsWithCases.has(inst.institutionId);
    });
  }, [institutions, filteredCases, selectedInstitutionFilter]);

  // 3. Construct Graph Entities (Nodes & Edges)
  const { nodes, edges } = useMemo(() => {
    const nodesList: GraphNode[] = [];
    const edgesList: GraphEdge[] = [];
    const nodeMap = new Map<string, GraphNode>();

    // Center coordinates for canvas
    const centerX = 500;
    const centerY = 360;

    // A. Add Institution Nodes (Central Hubs)
    const instCount = relevantInstitutions.length;
    relevantInstitutions.forEach((inst, idx) => {
      const angle = instCount > 1 ? (idx / instCount) * 2 * Math.PI : 0;
      const radius = instCount > 1 ? Math.min(220, 70 + instCount * 30) : 0;
      const x = instCount > 1 ? centerX + radius * Math.cos(angle) : centerX;
      const y = instCount > 1 ? centerY + radius * Math.sin(angle) : centerY;

      const instNode: GraphNode = {
        id: `inst-${inst.institutionId}`,
        type: 'institution',
        label: inst.name,
        sublabel: `PID: ${inst.institutionId}`,
        data: inst,
        x,
        y
      };
      nodesList.push(instNode);
      nodeMap.set(instNode.id, instNode);
    });

    // B. Add Case Nodes (Orbital Branches around their respective Institution)
    relevantInstitutions.forEach(inst => {
      const instNode = nodeMap.get(`inst-${inst.institutionId}`);
      if (!instNode) return;

      const instCases = filteredCases.filter(c => c.institutionId === inst.institutionId);
      const caseCount = instCases.length;

      instCases.forEach((c, cIdx) => {
        const caseAngle = (cIdx / Math.max(1, caseCount)) * 2 * Math.PI + (cIdx * 0.4);
        const orbitRadius = Math.min(180, 100 + caseCount * 12);
        const cx = (instNode.x || centerX) + orbitRadius * Math.cos(caseAngle);
        const cy = (instNode.y || centerY) + orbitRadius * Math.sin(caseAngle);

        const caseNode: GraphNode = {
          id: `case-${c.caseId}`,
          type: 'case',
          label: c.caseId,
          sublabel: c.category,
          bureau: c.bureau,
          status: c.status,
          priority: c.priority,
          data: c,
          x: cx,
          y: cy
        };
        nodesList.push(caseNode);
        nodeMap.set(caseNode.id, caseNode);

        // Affiliation Edge: Case -> Institution
        if (relationshipFilter === 'ALL') {
          edgesList.push({
            id: `edge-aff-${c.caseId}-${inst.institutionId}`,
            source: caseNode.id,
            target: instNode.id,
            type: 'AFFILIATION',
            label: 'Affiliated',
            isConfirmed: true,
            isPotential: false,
            isMerged: false,
            evidence: `Affiliated complaint under ${c.bureau}`
          });
        }
      });
    });

    // C. Add Overlap Edges between Cases
    alerts.forEach(alert => {
      // Find participating cases that are included in filtered view
      const activeCaseIds = alert.caseIds.filter(id => includedCaseIds.has(id));
      if (activeCaseIds.length < 2) return;

      for (let i = 0; i < activeCaseIds.length; i++) {
        for (let j = i + 1; j < activeCaseIds.length; j++) {
          const c1 = activeCaseIds[i];
          const c2 = activeCaseIds[j];
          const edgeId = `edge-ovl-${alert.alertId}-${c1}-${c2}`;

          const isDismissed = alert.reviewStatus === 'DISMISSED';
          const isCoordinated = alert.reviewStatus === 'COORDINATED';
          const isPending = alert.reviewStatus === 'PENDING_REVIEW';

          if (relationshipFilter === 'CONFIRMED_ONLY' && !isCoordinated) return;
          if (relationshipFilter === 'OVERLAPS_ONLY' && !isPending && !isCoordinated) return;

          edgesList.push({
            id: edgeId,
            source: `case-${c1}`,
            target: `case-${c2}`,
            type: 'POTENTIAL_OVERLAP',
            label: isCoordinated ? 'Coordinated' : isDismissed ? 'Dismissed' : 'Potential Overlap',
            isConfirmed: isCoordinated,
            isPotential: isPending,
            isMerged: false,
            evidence: alert.matchingEvidence || alert.reason,
            alertId: alert.alertId
          });
        }
      }
    });

    // D. Add Merged Case Edges
    filteredCases.forEach(c => {
      if (c.isMerged && c.mergedIntoCaseId && includedCaseIds.has(c.mergedIntoCaseId)) {
        if (relationshipFilter === 'OVERLAPS_ONLY') return;

        edgesList.push({
          id: `edge-merge-${c.caseId}-${c.mergedIntoCaseId}`,
          source: `case-${c.caseId}`,
          target: `case-${c.mergedIntoCaseId}`,
          type: 'MERGED',
          label: 'Consolidated into Primary',
          isConfirmed: true,
          isPotential: false,
          isMerged: true,
          evidence: c.mergeReason || 'Formal merger under primary master dossier'
        });
      }
    });

    // Apply manual dragged positions if any
    const finalNodes = nodesList.map(n => {
      if (nodePositions[n.id]) {
        return { ...n, x: nodePositions[n.id].x, y: nodePositions[n.id].y };
      }
      return n;
    });

    return { nodes: finalNodes, edges: edgesList };
  }, [relevantInstitutions, filteredCases, includedCaseIds, alerts, relationshipFilter, nodePositions]);

  // Selected Entity details resolution
  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    return nodes.find(n => n.id === selectedNodeId) || null;
  }, [selectedNodeId, nodes]);

  const selectedEdge = useMemo(() => {
    if (!selectedEdgeId) return null;
    return edges.find(e => e.id === selectedEdgeId) || null;
  }, [selectedEdgeId, edges]);

  // Connected nodes map for hover/focus highlighting
  const connectedNodeIds = useMemo(() => {
    const activeId = hoveredNodeId || selectedNodeId;
    if (!activeId) return null;
    const connected = new Set<string>([activeId]);
    edges.forEach(e => {
      if (e.source === activeId) connected.add(e.target);
      if (e.target === activeId) connected.add(e.source);
    });
    return connected;
  }, [hoveredNodeId, selectedNodeId, edges]);

  // Mouse handlers for canvas dragging & node dragging
  const handleMouseDownCanvas = (e: React.MouseEvent) => {
    if (draggingNodeId) return;
    setIsPanning(true);
    setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMoveCanvas = (e: React.MouseEvent) => {
    if (draggingNodeId && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const rawX = (e.clientX - rect.left - pan.x) / zoom;
      const rawY = (e.clientY - rect.top - pan.y) / zoom;
      setNodePositions(prev => ({
        ...prev,
        [draggingNodeId]: { x: rawX - dragOffset.x, y: rawY - dragOffset.y }
      }));
    } else if (isPanning) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    }
  };

  const handleMouseUpCanvas = () => {
    setIsPanning(false);
    setDraggingNodeId(null);
  };

  const handleNodeMouseDown = (e: React.MouseEvent, node: GraphNode) => {
    e.stopPropagation();
    setSelectedNodeId(node.id);
    setSelectedEdgeId(null);
    setDraggingNodeId(node.id);
    setDragOffset({ x: 0, y: 0 });
  };

  const handleResetZoomPan = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setNodePositions({});
  };

  return (
    <div className="space-y-4">
      {/* Title & Capability Explanation Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#111419] p-4 rounded-lg border border-[#272D35] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-[#A3B86C]/10 border border-[#A3B86C]/30 text-[#A3B86C]">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#E8EAED]">
                Cross-Bureau Relational Intelligence Graph
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#161A20] text-[#A3B86C] border border-[#272D35]">
                {nodes.length} Nodes • {edges.length} Connections
              </span>
            </div>
            <p className="text-xs text-[#A0A7B2] mt-0.5">
              Interactive topological visualization connecting technical institutions, grievances, responsible bureaus, and cross-cell overlap evidence.
            </p>
          </div>
        </div>

        {/* View Switch: Graph vs Table */}
        <div className="flex items-center gap-2 self-start md:self-center">
          <button
            onClick={() => setViewMode('GRAPH')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              viewMode === 'GRAPH'
                ? 'bg-[#1C2129] text-[#E8EAED] border border-[#A3B86C]'
                : 'text-[#737D8B] hover:text-[#E8EAED] border border-[#272D35]'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Interactive Graph</span>
          </button>
          <button
            onClick={() => setViewMode('TABLE')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              viewMode === 'TABLE'
                ? 'bg-[#1C2129] text-[#E8EAED] border border-[#A3B86C]'
                : 'text-[#737D8B] hover:text-[#E8EAED] border border-[#272D35]'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Relational Matrix</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#111419] p-3.5 rounded-lg border border-[#272D35] shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#737D8B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Filter by Case, College, or PID..."
              className="w-full pl-8 pr-3 py-1.5 bg-[#0B0D10] border border-[#272D35] rounded-md text-xs text-[#E8EAED] placeholder-[#737D8B] focus:outline-none focus:border-[#A3B86C]"
            />
          </div>

          {/* Bureau Filter */}
          <div>
            <select
              value={selectedBureau}
              onChange={e => setSelectedBureau(e.target.value as any)}
              className="w-full px-2.5 py-1.5 bg-[#0B0D10] border border-[#272D35] rounded-md text-xs text-[#E8EAED] focus:outline-none focus:border-[#A3B86C]"
            >
              <option value="ALL">All Bureaus</option>
              <option value="RB">Regulation Bureau (RB)</option>
              <option value="PGRC">Public Grievance Cell (PGRC)</option>
              <option value="AB">Approval Bureau (AB)</option>
              <option value="Finance">Finance Bureau</option>
              <option value="Vigilance">Vigilance Cell</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value as any)}
              className="w-full px-2.5 py-1.5 bg-[#0B0D10] border border-[#272D35] rounded-md text-xs text-[#E8EAED] focus:outline-none focus:border-[#A3B86C]"
            >
              <option value="ALL">All Statuses</option>
              <option value="Pending">Pending Scrutiny</option>
              <option value="Under Process">Under Process</option>
              <option value="OVERDUE">Statutory Overdue</option>
              <option value="Escalated">Escalated</option>
              <option value="Disposed">Disposed / Closed</option>
            </select>
          </div>

          {/* Connection Type Filter */}
          <div>
            <select
              value={relationshipFilter}
              onChange={e => setRelationshipFilter(e.target.value as any)}
              className="w-full px-2.5 py-1.5 bg-[#0B0D10] border border-[#272D35] rounded-md text-xs text-[#E8EAED] focus:outline-none focus:border-[#A3B86C]"
            >
              <option value="ALL">All Connections</option>
              <option value="OVERLAPS_ONLY">Potential Overlaps Only</option>
              <option value="CONFIRMED_ONLY">Confirmed & Coordinated</option>
              <option value="MERGED_ONLY">Merged Complaints Only</option>
            </select>
          </div>

          {/* Focus Institution Quick Selector */}
          <div>
            <select
              value={selectedInstitutionFilter}
              onChange={e => setSelectedInstitutionFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-[#0B0D10] border border-[#272D35] rounded-md text-xs text-[#E8EAED] focus:outline-none focus:border-[#A3B86C] truncate"
            >
              <option value="ALL">All Institutions ({institutions.length})</option>
              {institutions.map(inst => (
                <option key={inst.institutionId} value={inst.institutionId}>
                  {inst.name} ({inst.institutionId})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Legend Ribbon */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#272D35] text-[11px] text-[#A0A7B2]">
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-mono text-[10px] uppercase font-bold text-[#737D8B]">Legend:</span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#E8B75C] border border-[#E8B75C]/60" />
              <span>Technical Institution</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4E88FF]" />
              <span>RB Complaint</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E066FF]" />
              <span>PGRC Complaint</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-5 h-0.5 border-t border-dashed border-[#FFC759]" />
              <span>Potential Overlap</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-5 h-0.5 bg-[#69C9A0]" />
              <span>Coordinated Link</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-5 h-0.5 bg-[#86A9FF]" />
              <span>Consolidated (Merged)</span>
            </span>
          </div>

          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedBureau('ALL');
              setSelectedStatus('ALL');
              setRelationshipFilter('ALL');
              setSelectedInstitutionFilter('ALL');
              setSelectedNodeId(null);
              setSelectedEdgeId(null);
              handleResetZoomPan();
            }}
            className="text-xs text-[#737D8B] hover:text-[#E8EAED] inline-flex items-center gap-1 font-medium"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset All Filters</span>
          </button>
        </div>
      </div>

      {/* Main Content Pane: Graph Canvas or Relational Table */}
      {viewMode === 'GRAPH' ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Interactive SVG Canvas Area */}
          <div
            ref={containerRef}
            onMouseDown={handleMouseDownCanvas}
            onMouseMove={handleMouseMoveCanvas}
            onMouseUp={handleMouseUpCanvas}
            className="lg:col-span-3 bg-[#08090B] border border-[#272D35] rounded-lg h-[620px] relative overflow-hidden select-none cursor-grab active:cursor-grabbing shadow-inner"
          >
            {/* Canvas Floating Controls */}
            <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-[#111419]/90 backdrop-blur p-1 rounded-md border border-[#272D35] shadow">
              <button
                onClick={() => setZoom(prev => Math.min(2.2, prev + 0.15))}
                className="p-1.5 hover:bg-[#1C2129] text-[#A0A7B2] hover:text-[#E8EAED] rounded transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoom(prev => Math.max(0.4, prev - 0.15))}
                className="p-1.5 hover:bg-[#1C2129] text-[#A0A7B2] hover:text-[#E8EAED] rounded transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleResetZoomPan}
                className="p-1.5 hover:bg-[#1C2129] text-[#A0A7B2] hover:text-[#E8EAED] rounded transition-colors"
                title="Center / Reset View"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-mono text-[#737D8B] px-1.5">
                {Math.round(zoom * 100)}%
              </span>
            </div>

            {/* Instruction Badge */}
            <div className="absolute bottom-3 left-3 z-10 text-[10px] text-[#737D8B] bg-[#111419]/80 backdrop-blur px-2.5 py-1 rounded border border-[#272D35] pointer-events-none">
              Click node or edge for evidence • Drag to reposition • Scroll to pan
            </div>

            {/* Empty State if 0 nodes */}
            {nodes.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                <Share2 className="w-10 h-10 text-[#737D8B] mb-2 opacity-50" />
                <h4 className="text-sm font-bold text-[#E8EAED]">No Relational Entities Match Criteria</h4>
                <p className="text-xs text-[#737D8B] max-w-sm mt-1">
                  Adjust your search query, bureau, status, or institution filter above to explore the graph topology.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedBureau('ALL');
                    setSelectedStatus('ALL');
                    setSelectedInstitutionFilter('ALL');
                    setRelationshipFilter('ALL');
                  }}
                  className="mt-3 px-3 py-1.5 rounded-md bg-[#161A20] border border-[#272D35] text-xs text-[#E8EAED] font-semibold"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 1000 720"
                className="w-full h-full"
              >
                <defs>
                  {/* Glowing Filters */}
                  <filter id="glow-gold" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  <filter id="glow-amber" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2.5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
                  {/* EDGES LAYER */}
                  {edges.map(edge => {
                    const src = nodes.find(n => n.id === edge.source);
                    const tgt = nodes.find(n => n.id === edge.target);
                    if (!src || !tgt) return null;

                    const isSelected = selectedEdgeId === edge.id;
                    const isConnected = connectedNodeIds
                      ? connectedNodeIds.has(edge.source) && connectedNodeIds.has(edge.target)
                      : false;
                    const isDimmed = connectedNodeIds && !isConnected;

                    // Edge styling by connection type
                    let strokeColor = '#272D35';
                    let strokeWidth = 1.5;
                    let strokeDasharray = 'none';

                    if (edge.type === 'POTENTIAL_OVERLAP') {
                      strokeColor = edge.isConfirmed ? '#69C9A0' : '#FFC759';
                      strokeWidth = isSelected ? 3 : 2;
                      strokeDasharray = edge.isConfirmed ? 'none' : '4,4';
                    } else if (edge.type === 'MERGED') {
                      strokeColor = '#86A9FF';
                      strokeWidth = isSelected ? 3 : 2;
                    } else if (edge.type === 'AFFILIATION') {
                      strokeColor = isConnected ? '#4E88FF' : '#1C2129';
                      strokeWidth = isConnected ? 1.5 : 1;
                    }

                    const midX = ((src.x || 0) + (tgt.x || 0)) / 2;
                    const midY = ((src.y || 0) + (tgt.y || 0)) / 2;

                    return (
                      <g
                        key={edge.id}
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedEdgeId(edge.id);
                          setSelectedNodeId(null);
                        }}
                        className="cursor-pointer"
                        opacity={isDimmed ? 0.15 : 1}
                      >
                        <line
                          x1={src.x}
                          y1={src.y}
                          x2={tgt.x}
                          y2={tgt.y}
                          stroke={strokeColor}
                          strokeWidth={strokeWidth}
                          strokeDasharray={strokeDasharray}
                          strokeLinecap="round"
                        />
                        {/* Overlap Badge Indicator on Midpoint */}
                        {edge.type === 'POTENTIAL_OVERLAP' && (
                          <g transform={`translate(${midX}, ${midY})`}>
                            <rect
                              x="-28"
                              y="-8"
                              width="56"
                              height="16"
                              rx="8"
                              fill="#111419"
                              stroke={strokeColor}
                              strokeWidth="1"
                            />
                            <text
                              textAnchor="middle"
                              y="3"
                              fill={strokeColor}
                              fontSize="8"
                              fontWeight="bold"
                              fontFamily="monospace"
                            >
                              {edge.isConfirmed ? 'LINKED' : 'OVERLAP'}
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}

                  {/* NODES LAYER */}
                  {nodes.map(node => {
                    const isSelected = selectedNodeId === node.id;
                    const isConnected = connectedNodeIds ? connectedNodeIds.has(node.id) : false;
                    const isDimmed = connectedNodeIds && !isConnected;

                    const isInst = node.type === 'institution';
                    const caseRec = !isInst ? (node.data as CaseRecord) : null;
                    const bureauCol = caseRec ? bureauColors[caseRec.bureau] || '#A0A7B2' : '#E8B75C';
                    const isOverdue = caseRec?.status !== 'Disposed' && caseRec?.expectedDisposalDate && new Date(caseRec.expectedDisposalDate).getTime() < Date.now();

                    return (
                      <g
                        key={node.id}
                        transform={`translate(${node.x}, ${node.y})`}
                        onMouseDown={e => handleNodeMouseDown(e, node)}
                        onMouseEnter={() => setHoveredNodeId(node.id)}
                        onMouseLeave={() => setHoveredNodeId(null)}
                        className="cursor-pointer"
                        opacity={isDimmed ? 0.2 : 1}
                      >
                        {/* Outer Glow Ring if selected */}
                        {isSelected && (
                          <circle
                            r={isInst ? 36 : 24}
                            fill="none"
                            stroke="#A3B86C"
                            strokeWidth="2"
                            strokeDasharray="3,3"
                            className="animate-spin origin-center"
                          />
                        )}

                        {/* Overdue Warning Ring */}
                        {isOverdue && (
                          <circle
                            r={isInst ? 34 : 22}
                            fill="none"
                            stroke="#F16D75"
                            strokeWidth="2"
                          />
                        )}

                        {/* Node Shape */}
                        {isInst ? (
                          // Institution Hexagon / Prominent Circle
                          <g filter="url(#glow-gold)">
                            <circle
                              r="28"
                              fill="#161A20"
                              stroke="#E8B75C"
                              strokeWidth={isSelected ? 3 : 2}
                            />
                            {/* Building Icon outline */}
                            <path
                              d="M-8 8 L-8 -8 L8 -8 L8 8 Z M-3 -4 L3 -4 M-3 0 L3 0"
                              stroke="#E8B75C"
                              strokeWidth="1.5"
                              fill="none"
                            />
                          </g>
                        ) : (
                          // Case Node Circle
                          <g>
                            <circle
                              r="16"
                              fill="#111419"
                              stroke={bureauCol}
                              strokeWidth={isSelected ? 2.5 : 1.5}
                            />
                            <text
                              textAnchor="middle"
                              y="3"
                              fill={bureauCol}
                              fontSize="8"
                              fontWeight="bold"
                              fontFamily="monospace"
                            >
                              {caseRec?.bureau}
                            </text>
                          </g>
                        )}

                        {/* Node Text Label */}
                        <text
                          textAnchor="middle"
                          y={isInst ? 42 : 28}
                          fill={isSelected ? '#E8EAED' : '#A0A7B2'}
                          fontSize={isInst ? '10' : '9'}
                          fontWeight={isSelected ? 'bold' : 'normal'}
                          className="pointer-events-none"
                        >
                          {node.label.length > 20 ? node.label.substring(0, 18) + '...' : node.label}
                        </text>

                        {/* Sublabel / Permanent Institution ID */}
                        {node.sublabel && (
                          <text
                            textAnchor="middle"
                            y={isInst ? 52 : 37}
                            fill="#737D8B"
                            fontSize="8"
                            fontFamily="monospace"
                            className="pointer-events-none"
                          >
                            {node.sublabel.length > 24 ? node.sublabel.substring(0, 22) + '...' : node.sublabel}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </g>
              </svg>
            )}
          </div>

          {/* Right Inspection & Evidence Details Side Panel */}
          <div className="bg-[#111419] border border-[#272D35] rounded-lg p-4 flex flex-col justify-between shadow-sm min-h-[620px]">
            {selectedNode ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between pb-3 border-b border-[#272D35]">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#737D8B] block">
                      {selectedNode.type === 'institution' ? 'Technical Institution' : 'Grievance Docket'}
                    </span>
                    <h3 className="text-sm font-bold text-[#E8EAED] mt-0.5 leading-snug">
                      {selectedNode.label}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedNodeId(null)}
                    className="text-[#737D8B] hover:text-[#E8EAED] p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {selectedNode.type === 'institution' ? (
                  // Institution Details
                  (() => {
                    const inst = selectedNode.data as Institution;
                    const instCases = cases.filter(c => c.institutionId === inst.institutionId);
                    const instAlerts = alerts.filter(a => a.institutionId === inst.institutionId && a.reviewStatus !== 'DISMISSED');

                    return (
                      <div className="space-y-3.5 text-xs">
                        <div className="p-3 bg-[#0B0D10] rounded border border-[#272D35] space-y-1.5 font-mono text-[11px]">
                          <div className="flex justify-between">
                            <span className="text-[#737D8B]">Permanent ID:</span>
                            <span className="text-[#E8EAED] font-bold">{inst.institutionId}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#737D8B]">Region:</span>
                            <span className="text-[#E8EAED]">{inst.region}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#737D8B]">Location:</span>
                            <span className="text-[#E8EAED] truncate max-w-[150px]">{inst.address}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#737D8B]">Total Grievances:</span>
                            <span className="text-[#A3B86C] font-bold">{instCases.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#737D8B]">Active Overlaps:</span>
                            <span className={`font-bold ${instAlerts.length > 0 ? 'text-[#F16D75]' : 'text-[#69C9A0]'}`}>
                              {instAlerts.length}
                            </span>
                          </div>
                        </div>

                        {/* Connected Cases Summary */}
                        <div className="space-y-1.5">
                          <span className="text-[10px] uppercase font-bold text-[#737D8B] font-mono block">
                            Cross-Bureau Complaints ({instCases.length})
                          </span>
                          <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                            {instCases.map(c => (
                              <div
                                key={c.caseId}
                                onClick={() => setSelectedNodeId(`case-${c.caseId}`)}
                                className="p-2 rounded bg-[#161A20] hover:bg-[#1C2129] border border-[#272D35] cursor-pointer flex items-center justify-between text-[11px] transition-colors"
                              >
                                <span className="font-mono text-[#E8EAED]">{c.caseId}</span>
                                <span className="text-[#737D8B]">{c.bureau} • {c.status}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedInstitutionId(inst.institutionId);
                            setActiveTab('institutions');
                          }}
                          className="w-full py-2 px-3 rounded-md bg-[#A3B86C] hover:bg-[#B7CA82] text-[#08090B] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                        >
                          <span>Open Full Institution Dossier</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })()
                ) : (
                  // Case Details with Explainable Priority
                  (() => {
                    const c = selectedNode.data as CaseRecord;
                    const priorityAnalysis = calculateExplainablePriority(c, alerts);

                    return (
                      <div className="space-y-3.5 text-xs">
                        <div className="p-3 bg-[#0B0D10] rounded border border-[#272D35] space-y-1.5 text-[11px]">
                          <div className="flex justify-between font-mono">
                            <span className="text-[#737D8B]">Responsible Bureau:</span>
                            <span className="text-[#E8EAED] font-bold">{c.bureau}</span>
                          </div>
                          <div className="flex justify-between font-mono">
                            <span className="text-[#737D8B]">Status:</span>
                            <span className="text-[#E8EAED] font-semibold">{c.status}</span>
                          </div>
                          <div className="flex justify-between font-mono">
                            <span className="text-[#737D8B]">Priority Level:</span>
                            <span className={`font-bold ${priorityAnalysis.badgeText}`}>
                              {priorityAnalysis.level} ({priorityAnalysis.score}/100)
                            </span>
                          </div>
                          <div className="flex justify-between font-mono">
                            <span className="text-[#737D8B]">Assigned Officer:</span>
                            <span className="text-[#E8EAED] truncate max-w-[140px]">{c.assignedOfficer}</span>
                          </div>
                          <div className="flex justify-between font-mono">
                            <span className="text-[#737D8B]">Disposal Target:</span>
                            <span className={priorityAnalysis.isOverdue ? 'text-[#F16D75] font-bold' : 'text-[#E8EAED]'}>
                              {c.expectedDisposalDate ? c.expectedDisposalDate.split('T')[0] : 'Standard 30d'}
                            </span>
                          </div>
                        </div>

                        {/* Contributing Factors */}
                        <div className="space-y-1.5">
                          <span className="text-[10px] uppercase font-bold text-[#737D8B] font-mono block">
                            Priority Contributing Factors
                          </span>
                          <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                            {priorityAnalysis.factors.map((f, i) => (
                              <div key={i} className="p-1.5 rounded bg-[#161A20] border border-[#272D35] text-[10px]">
                                <div className="flex justify-between font-semibold text-[#E8EAED]">
                                  <span>{f.label}</span>
                                  <span className="font-mono text-[#A3B86C]">+{f.scoreContribution}</span>
                                </div>
                                <p className="text-[#737D8B] mt-0.5">{f.detail}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Recommended Next Action */}
                        <div className="p-2.5 rounded bg-[#161A20] border border-[#272D35] text-xs">
                          <span className="text-[10px] uppercase font-bold text-[#A3B86C] font-mono block">
                            Recommended Next Action:
                          </span>
                          <p className="text-[#E8EAED] text-[11px] mt-0.5 font-medium leading-relaxed">
                            {priorityAnalysis.recommendedNextAction}
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedCaseId(c.caseId);
                            setActiveTab('registry');
                          }}
                          className="w-full py-2 px-3 rounded-md bg-[#A3B86C] hover:bg-[#B7CA82] text-[#08090B] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                        >
                          <span>Open Case Detail View</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })()
                )}
              </div>
            ) : selectedEdge ? (
              // Edge Details (Overlap Evidence & Rationale)
              <div className="space-y-4">
                <div className="flex items-start justify-between pb-3 border-b border-[#272D35]">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#FFC759] block">
                      Relational Connection Evidence
                    </span>
                    <h3 className="text-sm font-bold text-[#E8EAED] mt-0.5">
                      {selectedEdge.label}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedEdgeId(null)}
                    className="text-[#737D8B] hover:text-[#E8EAED] p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-[#0B0D10] rounded border border-[#272D35] space-y-1.5 font-mono text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-[#737D8B]">Source Docket:</span>
                      <span className="text-[#E8EAED]">{selectedEdge.source.replace('case-', '')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#737D8B]">Target Docket:</span>
                      <span className="text-[#E8EAED]">{selectedEdge.target.replace('case-', '').replace('inst-', '')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#737D8B]">Status:</span>
                      <span className={`font-bold ${selectedEdge.isConfirmed ? 'text-[#69C9A0]' : 'text-[#FFC759]'}`}>
                        {selectedEdge.isConfirmed ? 'Coordinated / Linked' : 'Awaiting Review'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#737D8B] font-mono block mb-1">
                      Matching Evidence & Intelligence Rationale
                    </span>
                    <div className="p-3 bg-[#161A20] rounded border border-[#272D35] text-xs text-[#E8EAED] leading-relaxed">
                      {selectedEdge.evidence || 'Concurrent proceedings detected on shared technical institution.'}
                    </div>
                  </div>

                  {selectedEdge.alertId && (
                    <button
                      onClick={() => setActiveTab('overlaps')}
                      className="w-full py-2 px-3 rounded-md bg-[#FFC759] hover:bg-[#E8B75C] text-[#08090B] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                    >
                      <GitCompare className="w-3.5 h-3.5" />
                      <span>Review in Overlap Coordination Console</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              // Empty selection prompt
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <Info className="w-8 h-8 text-[#737D8B] mb-2 opacity-50" />
                <h4 className="text-xs font-bold text-[#E8EAED]">No Entity Selected</h4>
                <p className="text-[11px] text-[#737D8B] mt-1 leading-relaxed max-w-[200px]">
                  Click any institution, case node, or connection edge on the canvas to inspect evidence, SLA factors, and inter-bureau links.
                </p>
              </div>
            )}

            <div className="pt-3 border-t border-[#272D35] text-[10px] text-[#737D8B] text-center">
              CONVERA Graph Intelligence v1.0 • AICTE SIH26264
            </div>
          </div>
        </div>
      ) : (
        // Accessible Relational Matrix Table View
        <div className="bg-[#111419] rounded-lg border border-[#272D35] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0B0D10] text-[#737D8B] font-semibold border-b border-[#272D35] font-mono text-[10px]">
                <tr>
                  <th className="px-4 py-3">Technical Institution</th>
                  <th className="px-3 py-3">Permanent ID</th>
                  <th className="px-3 py-3">Case ID</th>
                  <th className="px-3 py-3">Bureau</th>
                  <th className="px-3 py-3">Priority Score</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-4 py-3">Relational Links & Evidence</th>
                  <th className="px-3 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#272D35]/70">
                {filteredCases.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-[#737D8B]">
                      No relational records match your current filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredCases.map(c => {
                    const inst = institutions.find(i => i.institutionId === c.institutionId);
                    const priorityAnalysis = calculateExplainablePriority(c, alerts);
                    const caseAlerts = alerts.filter(a => a.caseIds.includes(c.caseId));

                    return (
                      <tr key={c.caseId} className="hover:bg-[#161A20] transition-colors">
                        <td className="px-4 py-3 font-medium text-[#E8EAED] max-w-[200px] truncate">
                          {c.institutionName}
                        </td>
                        <td className="px-3 py-3 font-mono text-[11px] text-[#737D8B]">
                          {c.institutionId}
                        </td>
                        <td className="px-3 py-3 font-mono font-bold text-[#E8EAED]">
                          {c.caseId}
                        </td>
                        <td className="px-3 py-3 font-semibold text-[#A0A7B2]">
                          {c.bureau}
                        </td>
                        <td className="px-3 py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${priorityAnalysis.badgeClass}`}>
                            {priorityAnalysis.score} ({priorityAnalysis.level})
                          </span>
                        </td>
                        <td className="px-3 py-3 text-[#A0A7B2]">
                          {c.status}
                        </td>
                        <td className="px-4 py-3 text-[#A0A7B2] text-[11px] max-w-[280px]">
                          {caseAlerts.length > 0 ? (
                            <span className="text-[#FFC759] font-medium block truncate">
                              {caseAlerts[0].reason}
                            </span>
                          ) : c.relatedCaseIds?.length ? (
                            <span className="text-[#69C9A0] font-medium block truncate">
                              Cross-referenced with: {c.relatedCaseIds.join(', ')}
                            </span>
                          ) : (
                            <span className="text-[#737D8B]">Single bureau scrutiny</span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-right">
                          <button
                            onClick={() => {
                              setSelectedCaseId(c.caseId);
                              setActiveTab('registry');
                            }}
                            className="inline-flex items-center gap-1 text-[11px] text-[#A3B86C] hover:underline font-semibold"
                          >
                            <span>Open Dossier</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
