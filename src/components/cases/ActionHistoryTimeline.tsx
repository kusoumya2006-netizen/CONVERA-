import React, { useState, useMemo } from 'react';
import { CaseAction, HistoryActivityType } from '../../types';
import { BureauBadge } from '../common/StatusBadge';
import { parseActionMetadata } from '../../engine/actionHistoryHelper';
import {
  FileText,
  Activity,
  ShieldAlert,
  ArrowRightLeft,
  CheckCircle,
  MessageSquare,
  Clock,
  ArrowRight,
  GitMerge,
  Paperclip,
  Calendar,
  Search,
  Filter,
  Layers,
  FileCheck2,
  Send,
  AlertCircle
} from 'lucide-react';

interface ActionHistoryTimelineProps {
  actions: CaseAction[];
  showFilters?: boolean;
}

export const ActionHistoryTimeline: React.FC<ActionHistoryTimelineProps> = ({
  actions,
  showFilters = true
}) => {
  const [selectedCategory, setSelectedCategory] = useState<HistoryActivityType | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Parse all actions into rich display metadata
  const parsedActions = useMemo(() => {
    return actions.map(action => ({
      original: action,
      meta: parseActionMetadata(action)
    }));
  }, [actions]);

  // Sort newest first
  const sortedActions = useMemo(() => {
    return [...parsedActions].sort(
      (a, b) => new Date(b.original.timestamp).getTime() - new Date(a.original.timestamp).getTime()
    );
  }, [parsedActions]);

  // Apply filters
  const filteredActions = useMemo(() => {
    return sortedActions.filter(({ original, meta }) => {
      // 1. Category filter
      if (selectedCategory !== 'ALL' && meta.activityCategory !== selectedCategory) {
        return false;
      }

      // 2. Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesRemarks = meta.cleanRemarks.toLowerCase().includes(query);
        const matchesOfficer = (meta.officerName || '').toLowerCase().includes(query) || (meta.officerRole || '').toLowerCase().includes(query);
        const matchesEvidence = (meta.evidenceRef || '').toLowerCase().includes(query);
        const matchesNext = (meta.nextAction || '').toLowerCase().includes(query);
        const matchesId = original.actionId.toLowerCase().includes(query);
        const matchesType = meta.activityCategory.toLowerCase().includes(query);

        if (!matchesRemarks && !matchesOfficer && !matchesEvidence && !matchesNext && !matchesId && !matchesType) {
          return false;
        }
      }

      return true;
    });
  }, [sortedActions, selectedCategory, searchQuery]);

  // Activity type icon and styling config
  const getActivityBadge = (category: HistoryActivityType) => {
    switch (category) {
      case 'Investigation Note':
        return {
          icon: <Activity className="w-3.5 h-3.5 text-[#E8B75C]" />,
          label: 'Investigation Note',
          bg: 'bg-[#E8B75C]/10 text-[#E8B75C] border-[#E8B75C]/30'
        };
      case 'Evidence Added':
        return {
          icon: <FileCheck2 className="w-3.5 h-3.5 text-[#69C9A0]" />,
          label: 'Evidence Added',
          bg: 'bg-[#69C9A0]/10 text-[#69C9A0] border-[#69C9A0]/30'
        };
      case 'Communication':
        return {
          icon: <Send className="w-3.5 h-3.5 text-[#B58BFF]" />,
          label: 'Communication',
          bg: 'bg-[#B58BFF]/10 text-[#B58BFF] border-[#B58BFF]/30'
        };
      case 'Status Change':
        return {
          icon: <ArrowRightLeft className="w-3.5 h-3.5 text-[#A3B86C]" />,
          label: 'Status Change',
          bg: 'bg-[#A3B86C]/10 text-[#A3B86C] border-[#A3B86C]/30'
        };
      case 'Progress Update':
        return {
          icon: <FileText className="w-3.5 h-3.5 text-[#86A9FF]" />,
          label: 'Progress Update',
          bg: 'bg-[#86A9FF]/10 text-[#86A9FF] border-[#86A9FF]/30'
        };
      case 'Other':
      default:
        return {
          icon: <MessageSquare className="w-3.5 h-3.5 text-[#A0A7B2]" />,
          label: 'Administrative Note',
          bg: 'bg-[#272D35] text-[#A0A7B2] border-[#38414D]'
        };
    }
  };

  const categories: { id: HistoryActivityType | 'ALL'; label: string }[] = [
    { id: 'ALL', label: `All (${actions.length})` },
    { id: 'Progress Update', label: 'Progress Updates' },
    { id: 'Investigation Note', label: 'Investigation Notes' },
    { id: 'Evidence Added', label: 'Evidence Records' },
    { id: 'Communication', label: 'Communications' },
    { id: 'Status Change', label: 'Status Changes' },
    { id: 'Other', label: 'Other' }
  ];

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      {showFilters && actions.length > 0 && (
        <div className="bg-[#111419] p-3 rounded-lg border border-[#272D35] space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-[#737D8B] absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search case activity, remarks, evidence ref, or officer..."
                className="w-full pl-8 pr-3 py-1.5 bg-[#0B0D10] border border-[#272D35] rounded-md text-xs text-[#E8EAED] placeholder-[#737D8B] focus:outline-none focus:border-[#A3B86C]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-[10px] text-[#737D8B] hover:text-[#E8EAED] font-mono px-1 rounded bg-[#161A20]"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick summary indicator */}
            <div className="text-[11px] text-[#737D8B] font-mono shrink-0 flex items-center gap-1.5">
              <Filter className="w-3 h-3 text-[#737D8B]" />
              <span>Showing <strong>{filteredActions.length}</strong> of {actions.length} activities</span>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {categories.map(cat => {
              const count = cat.id === 'ALL'
                ? actions.length
                : parsedActions.filter(p => p.meta.activityCategory === cat.id).length;

              if (cat.id !== 'ALL' && count === 0) return null;

              const isSelected = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium shrink-0 transition-colors border ${
                    isSelected
                      ? 'bg-[#161A20] text-[#E8EAED] border-[#A3B86C] shadow-sm'
                      : 'bg-[#0B0D10] text-[#737D8B] border-[#272D35] hover:bg-[#161A20] hover:text-[#A0A7B2]'
                  }`}
                >
                  {cat.label} {cat.id !== 'ALL' && `(${count})`}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredActions.length === 0 ? (
        <div className="p-8 text-center text-xs text-[#737D8B] bg-[#0B0D10] rounded-lg border border-[#272D35] space-y-2">
          <AlertCircle className="w-6 h-6 text-[#737D8B] mx-auto opacity-60" />
          <p className="font-semibold text-[#A0A7B2]">No case activity matching current criteria.</p>
          {(searchQuery || selectedCategory !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('ALL');
              }}
              className="text-[11px] text-[#A3B86C] hover:underline"
            >
              Reset activity filters
            </button>
          )}
        </div>
      ) : (
        /* Chronological Timeline Container */
        <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#272D35]">
          {filteredActions.map(({ original, meta }) => {
            const badge = getActivityBadge(meta.activityCategory);

            return (
              <div key={original.actionId} className="relative group">
                {/* Timeline Node Dot */}
                <div className="absolute -left-6 top-1.5 p-1 rounded-full bg-[#0B0D10] border border-[#272D35] shadow-sm group-hover:border-[#A3B86C] transition-colors">
                  {badge.icon}
                </div>

                {/* Activity Card */}
                <div className="bg-[#161A20] p-4 rounded-lg border border-[#272D35] hover:border-[#38414D] transition-colors space-y-2.5 shadow-sm">
                  {/* Card Header: Category Badge + Bureau + Timestamp */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[11px] font-semibold ${badge.bg}`}>
                        {badge.icon}
                        <span>{meta.activityCategory}</span>
                      </span>

                      <BureauBadge bureau={meta.bureau} size="sm" />

                      {original.actionType && original.actionType !== 'REMARKS_ADDED' && (
                        <span className="text-[10px] text-[#737D8B] font-mono uppercase bg-[#0B0D10] px-1.5 py-0.5 rounded border border-[#272D35]">
                          {original.actionType.replace(/_/g, ' ')}
                        </span>
                      )}
                    </div>

                    {/* Timestamp */}
                    <div className="flex items-center gap-1 text-[11px] text-[#737D8B] font-mono">
                      <Clock className="w-3 h-3 text-[#737D8B]" />
                      <span>
                        {new Date(meta.timestamp).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Main Activity Description */}
                  <p className="text-xs text-[#E8EAED] leading-relaxed whitespace-pre-wrap">
                    {meta.cleanRemarks}
                  </p>

                  {/* Status Transition Chip (Previous Status -> New Status) */}
                  {meta.previousValue && meta.newValue && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0B0D10] border border-[#A3B86C]/40 text-[11px] font-mono">
                      <span className="text-[#737D8B] uppercase font-semibold">Status Transition:</span>
                      <span className="text-[#A0A7B2] line-through">{meta.previousValue}</span>
                      <ArrowRight className="w-3 h-3 text-[#A3B86C]" />
                      <span className="text-[#A3B86C] font-bold">{meta.newValue}</span>
                    </div>
                  )}

                  {/* Evidence Reference Pill if attached */}
                  {meta.evidenceRef && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#69C9A0]/10 border border-[#69C9A0]/30 text-[#69C9A0] text-xs">
                      <Paperclip className="w-3 h-3 shrink-0" />
                      <span className="font-semibold text-[11px]">Evidence Ref:</span>
                      <span className="font-mono text-[11px] text-[#E8EAED]">{meta.evidenceRef}</span>
                    </div>
                  )}

                  {/* Next Action / Follow-up Note */}
                  {meta.nextAction && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0B0D10] border border-[#272D35] text-xs">
                      <Calendar className="w-3 h-3 text-[#E8B75C] shrink-0" />
                      <span className="font-semibold text-[#737D8B] text-[11px] uppercase font-mono">Next Action:</span>
                      <span className="text-[#E8EAED] text-[11px]">{meta.nextAction}</span>
                    </div>
                  )}

                  {/* Card Footer: Officer Identity & Action ID */}
                  <div className="pt-2.5 border-t border-[#272D35] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#737D8B]">
                    <div className="flex items-center gap-1.5">
                      <span>Recorded By:</span>
                      <strong className="text-[#E8EAED] font-medium">{meta.officerName}</strong>
                      {meta.officerRole && (
                        <span className="text-[#A0A7B2] font-mono text-[10px]">({meta.officerRole})</span>
                      )}
                    </div>
                    <span className="font-mono text-[10px] text-[#737D8B]">
                      Audit Ref: {original.actionId}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
