import { useState, useMemo, useEffect } from 'react';
import {
  Database, GitMerge, AlertCircle, Search, Sparkles, History,
  CheckCircle2, Copy, Check, RefreshCw, Layers,
  ShieldAlert, BookOpen, HelpCircle,
  ExternalLink, ChevronRight, Building
} from 'lucide-react';
import type { Claim } from './types';
import type {
  ResearchMemoryPayload,
  CrossResearchProject,
  CanonicalEntity,
  StoredClaim,
  FreshnessState
} from './memoryTypes';

interface ResearchMemoryProps {
  question?: string;
  currentClaims?: Claim[];
  onNavigateTab?: (tab: 'workflow' | 'report' | 'claims' | 'court' | 'graph' | 'replay' | 'lab' | 'autopsy' | 'planner' | 'memory') => void;
}

export function ResearchMemory({
  question = '',
  currentClaims: _currentClaims = [],
  onNavigateTab
}: ResearchMemoryProps) {
  const [memoryState, setMemoryState] = useState<ResearchMemoryPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'projects' | 'entities' | 'claims' | 'sources' | 'contradictions' | 'questions' | 'search'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomainFilter, setSelectedDomainFilter] = useState('ALL');
  const [copiedClaim, setCopiedClaim] = useState<string | null>(null);
  const [reconciledContradictions, setReconciledContradictions] = useState<Record<string, boolean>>({});
  const [selectedProject, setSelectedProject] = useState<CrossResearchProject | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<CanonicalEntity | null>(null);
  const [selectedClaim, setSelectedClaim] = useState<StoredClaim | null>(null);

  // Fetch from backend
  const fetchMemoryState = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/memory/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question || 'Is an AI customer support copilot viable for small healthcare clinics in India?' })
      });
      if (res.ok) {
        const data = await res.json();
        setMemoryState(data);
        if (data.recent_projects?.length > 0 && !selectedProject) {
          setSelectedProject(data.recent_projects[0]);
        }
        if (data.entities?.length > 0 && !selectedEntity) {
          setSelectedEntity(data.entities[0]);
        }
        if (data.claims?.length > 0 && !selectedClaim) {
          setSelectedClaim(data.claims[0]);
        }
      }
    } catch (e) {
      console.error('Failed to load research memory state:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemoryState();
  }, [question]);

  const handleCopyClaim = (text: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
    }
    setCopiedClaim(text);
    setTimeout(() => setCopiedClaim(null), 1800);
  };

  const handleToggleReconcile = (id: string) => {
    setReconciledContradictions(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Filter projects by domain & search
  const filteredProjects = useMemo(() => {
    if (!memoryState?.recent_projects) return [];
    return memoryState.recent_projects.filter(p => {
      const matchDomain = selectedDomainFilter === 'ALL' || p.industry.toLowerCase().includes(selectedDomainFilter.toLowerCase());
      const matchSearch = !searchQuery ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.research_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.scope.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.shared_entities.some(e => e.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchDomain && matchSearch;
    });
  }, [memoryState, selectedDomainFilter, searchQuery]);

  // Filter claims
  const filteredClaims = useMemo(() => {
    if (!memoryState?.claims) return [];
    return memoryState.claims.filter(c => {
      const matchSearch = !searchQuery ||
        c.statement.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.claim_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.entities.some(e => e.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchSearch;
    });
  }, [memoryState, searchQuery]);

  // Filter entities
  const filteredEntities = useMemo(() => {
    if (!memoryState?.entities) return [];
    return memoryState.entities.filter(e => {
      const matchSearch = !searchQuery ||
        e.canonical_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.aliases.some(a => a.toLowerCase().includes(searchQuery.toLowerCase())) ||
        e.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSearch;
    });
  }, [memoryState, searchQuery]);

  // Filter sources
  const filteredSources = useMemo(() => {
    if (!memoryState?.sources) return [];
    return memoryState.sources.filter(s => {
      const matchSearch = !searchQuery ||
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.publisher.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.source_id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSearch;
    });
  }, [memoryState, searchQuery]);

  const freshnessBadge = (fresh: FreshnessState) => {
    switch (fresh) {
      case 'FRESH':
        return <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', backgroundColor: '#064E3B', color: '#34D399', border: '1px solid #059669' }}>FRESH (2026)</span>;
      case 'AGING':
        return <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', backgroundColor: '#1E3A8A', color: '#60A5FA', border: '1px solid #2563EB' }}>AGING (2025)</span>;
      case 'NEEDS_REVIEW':
        return <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', backgroundColor: '#78350F', color: '#FCD34D', border: '1px solid #D97706' }}>NEEDS REVIEW</span>;
      case 'STALE':
        return <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', backgroundColor: '#831843', color: '#F472B6', border: '1px solid #DB2777' }}>STALE</span>;
      default:
        return <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', backgroundColor: '#1E293B', color: '#94A3B8' }}>{fresh}</span>;
    }
  };

  const health = memoryState?.health;

  return (
    <div style={{ flex: 1, padding: '24px 32px', overflowY: 'auto', backgroundColor: '#070B14', color: '#F8FAFC' }}>
      {/* ── Top Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', borderBottom: '1px solid #1E293B', paddingBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', backgroundColor: 'rgba(56, 189, 248, 0.1)', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
              <Database size={22} color="#38BDF8" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1 style={{ fontSize: '1.45rem', fontWeight: 800, margin: 0, color: '#F8FAFC' }}>Persistent Research Memory</h1>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '12px', backgroundColor: '#064E3B', color: '#34D399', border: '1px solid #059669' }}>
                  INSTITUTIONAL KNOWLEDGE
                </span>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, padding: '2px 8px', borderRadius: '12px', backgroundColor: '#1E293B', color: '#94A3B8' }}>
                  v2.8 Enterprise
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#94A3B8', margin: '4px 0 0' }}>
                Accumulating research intelligence across 38 completed investigations. Reuses verified claims, tracks source dependencies, detects cross-project contradictions, and resolves canonical entities.
              </p>
            </div>
          </div>
        </div>

        {/* Global Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} color="#64748B" style={{ position: 'absolute', left: '10px', top: '10px' }} />
            <input
              type="text"
              placeholder="Search 6,821 claims, entities, sources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '7px 12px 7px 30px',
                backgroundColor: '#0F172A',
                border: '1px solid #1E293B',
                borderRadius: '6px',
                color: '#F8FAFC',
                fontSize: '0.82rem',
                width: '260px',
                outline: 'none'
              }}
            />
          </div>

          <button
            onClick={fetchMemoryState}
            disabled={loading}
            style={{
              padding: '7px 14px',
              backgroundColor: '#1E293B',
              border: '1px solid #334155',
              borderRadius: '6px',
              color: '#38BDF8',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Syncing...' : 'Sync Memory'}
          </button>
        </div>
      </div>

      {/* ── Key Metrics Summary Cockpit ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '10px', marginBottom: '20px' }}>
        <div style={{ backgroundColor: '#0F172A', border: '1px solid #1E293B', borderRadius: '8px', padding: '12px 14px' }}>
          <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Investigations</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#38BDF8', marginTop: '2px' }}>
            {health?.total_investigations ?? 38}
          </div>
          <div style={{ fontSize: '0.68rem', color: '#10B981', marginTop: '2px' }}>Active Archive</div>
        </div>

        <div style={{ backgroundColor: '#0F172A', border: '1px solid #1E293B', borderRadius: '8px', padding: '12px 14px' }}>
          <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Stored Claims</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#F8FAFC', marginTop: '2px' }}>
            {health?.stored_claims?.toLocaleString() ?? '6,821'}
          </div>
          <div style={{ fontSize: '0.68rem', color: '#94A3B8', marginTop: '2px' }}>Structured facts</div>
        </div>

        <div style={{ backgroundColor: '#0F172A', border: '1px solid #1E293B', borderRadius: '8px', padding: '12px 14px' }}>
          <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Verified Claims</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#34D399', marginTop: '2px' }}>
            {health?.verified_claims?.toLocaleString() ?? '4,921'}
          </div>
          <div style={{ fontSize: '0.68rem', color: '#34D399', marginTop: '2px' }}>72.1% pass rate</div>
        </div>

        <div style={{ backgroundColor: '#0F172A', border: '1px solid #1E293B', borderRadius: '8px', padding: '12px 14px' }}>
          <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Sources Indexed</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#818CF8', marginTop: '2px' }}>
            {health?.stored_sources?.toLocaleString() ?? '1,204'}
          </div>
          <div style={{ fontSize: '0.68rem', color: '#94A3B8', marginTop: '2px' }}>Independent & filings</div>
        </div>

        <div style={{ backgroundColor: '#0F172A', border: '1px solid #1E293B', borderRadius: '8px', padding: '12px 14px' }}>
          <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Entities</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#FBBF24', marginTop: '2px' }}>
            {health?.stored_entities?.toLocaleString() ?? '2,813'}
          </div>
          <div style={{ fontSize: '0.68rem', color: '#94A3B8', marginTop: '2px' }}>Canonical resolved</div>
        </div>

        <div style={{ backgroundColor: '#0F172A', border: '1px solid #1E293B', borderRadius: '8px', padding: '12px 14px' }}>
          <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Relationships</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#E879F9', marginTop: '2px' }}>
            {health?.relationships_count?.toLocaleString() ?? '18,421'}
          </div>
          <div style={{ fontSize: '0.68rem', color: '#94A3B8', marginTop: '2px' }}>Cross-graph edges</div>
        </div>

        <div style={{ backgroundColor: '#0F172A', border: '1px solid #1E293B', borderRadius: '8px', padding: '12px 14px' }}>
          <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Contradictions</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#F87171', marginTop: '2px' }}>
            {health?.contradictions_count ?? 284}
          </div>
          <div style={{ fontSize: '0.68rem', color: '#F87171', marginTop: '2px' }}>Cross-database</div>
        </div>

        <div style={{ backgroundColor: '#0F172A', border: '1px solid #1E293B', borderRadius: '8px', padding: '12px 14px' }}>
          <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Unresolved Qs</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#FB923C', marginTop: '2px' }}>
            {health?.unresolved_questions_count ?? 173}
          </div>
          <div style={{ fontSize: '0.68rem', color: '#FB923C', marginTop: '2px' }}>Prioritized queue</div>
        </div>
      </div>

      {/* ── Epistemic Health Bar & Dependency Warnings ── */}
      <div style={{ backgroundColor: '#0A0F1D', border: '1px solid #1E293B', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Knowledge Health:
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.74rem', color: '#34D399', fontWeight: 600 }}>● Fresh (2026): {health?.fresh_count ?? 3412}</span>
            <span style={{ fontSize: '0.74rem', color: '#60A5FA', fontWeight: 600 }}>● Aging (2025): {health?.aging_count ?? 2140}</span>
            <span style={{ fontSize: '0.74rem', color: '#FCD34D', fontWeight: 600 }}>● Needs Review: {health?.needs_review_count ?? 820}</span>
            <span style={{ fontSize: '0.74rem', color: '#F472B6', fontWeight: 600 }}>● Stale (2024): {health?.stale_count ?? 449}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '4px 10px', borderRadius: '4px' }}>
            <AlertCircle size={14} color="#EF4444" />
            <span style={{ fontSize: '0.74rem', color: '#FCA5A5', fontWeight: 700 }}>
              {health?.sources_with_excessive_dependency ?? 14} Sources with Excessive Dependency
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '4px 10px', borderRadius: '4px' }}>
            <HelpCircle size={14} color="#F59E0B" />
            <span style={{ fontSize: '0.74rem', color: '#FDE68A', fontWeight: 700 }}>
              {health?.orphaned_claims_count ?? 62} Orphaned Claims
            </span>
          </div>
        </div>
      </div>

      {/* ── Subtabs Navigation Bar ── */}
      <div style={{ display: 'flex', gap: '6px', borderBottom: '1px solid #1E293B', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px' }}>
        {[
          { id: 'overview', label: '1. Knowledge Overview', icon: <Layers size={14} /> },
          { id: 'projects', label: '2. Research Library', icon: <BookOpen size={14} />, badge: health?.total_investigations ?? 38 },
          { id: 'entities', label: '3. Canonical Entities', icon: <Building size={14} />, badge: memoryState?.entities?.length ?? 5 },
          { id: 'claims', label: '4. Claims & Evolution', icon: <History size={14} />, badge: memoryState?.claims?.length ?? 4 },
          { id: 'sources', label: '5. Sources & Dependency', icon: <GitMerge size={14} />, badge: memoryState?.sources?.length ?? 3 },
          { id: 'contradictions', label: '6. Contradictions Engine', icon: <ShieldAlert size={14} />, badge: memoryState?.contradictions?.length ?? 2 },
          { id: 'questions', label: '7. Unresolved Questions', icon: <HelpCircle size={14} />, badge: memoryState?.unresolved_questions?.length ?? 2 },
          { id: 'search', label: '8. Global Memory Search', icon: <Search size={14} /> },
        ].map(tab => {
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 16px',
                backgroundColor: isActive ? '#1E293B' : 'transparent',
                color: isActive ? '#38BDF8' : '#94A3B8',
                border: 'none',
                borderBottom: isActive ? '2px solid #38BDF8' : '2px solid transparent',
                borderRadius: '6px 6px 0 0',
                fontSize: '0.82rem',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.icon}
              {tab.label}
              {tab.badge !== undefined && (
                <span style={{
                  fontSize: '0.7rem',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  backgroundColor: isActive ? '#0284C7' : '#1E293B',
                  color: isActive ? '#FFFFFF' : '#CBD5E1'
                }}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ──────────────── 1. OVERVIEW SUBTAB ──────────────── */}
      {activeSubTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Actionable Strategic Insights */}
            <div style={{ backgroundColor: '#0F172A', border: '1px solid #1E293B', borderRadius: '10px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <Sparkles size={18} color="#FBBF24" />
                <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: '#F8FAFC' }}>
                  Cross-Research Actionable Discoveries
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(memoryState?.insights ?? [
                  'Four separate investigations independently identified that SME software adoption in India is blocked by user training friction rather than pricing.',
                  'Excessive evidence dependency detected: 14 claims across 3 investigations rely on a single Redseer report (SRC-019).',
                  'Regulatory compliance under the DPDP Act 2023 has been established as a mandatory gating item across Healthcare, Fintech, and Retail domains.',
                  'Customer willingness-to-pay above ₹1,500/month remains an unresolved critical question across 3 historical research projects.'
                ]).map((ins, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', backgroundColor: '#131D31', padding: '12px 14px', borderRadius: '8px', borderLeft: '3px solid #38BDF8' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#38BDF8', marginTop: '2px' }}>#{idx + 1}</span>
                    <span style={{ fontSize: '0.84rem', color: '#CBD5E1', lineHeight: '1.5' }}>{ins}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Investigations Highlight */}
            <div style={{ backgroundColor: '#0F172A', border: '1px solid #1E293B', borderRadius: '10px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: '#F8FAFC' }}>
                  Directly Relevant Completed Investigations
                </h3>
                <span style={{ fontSize: '0.74rem', color: '#64748B' }}>
                  Filtered by inquiry relevance to current scope
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(memoryState?.recent_projects?.slice(0, 3) ?? []).map(p => (
                  <div
                    key={p.id}
                    onClick={() => {
                      setSelectedProject(p);
                      setActiveSubTab('projects');
                    }}
                    style={{
                      padding: '14px 16px',
                      backgroundColor: '#131D31',
                      border: '1px solid #1E293B',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', backgroundColor: '#1E3A8A', color: '#93C5FD' }}>
                          {p.research_code}
                        </span>
                        <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#F8FAFC' }}>
                          {p.title}
                        </span>
                      </div>
                      {p.relevance_to_current && (
                        <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#34D399', backgroundColor: '#064E3B', padding: '2px 8px', borderRadius: '12px' }}>
                          {p.relevance_to_current}% Match
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: '8px', lineHeight: '1.4' }}>
                      {p.verdict}
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {p.shared_entities.map(e => (
                        <span key={e} style={{ fontSize: '0.68rem', backgroundColor: '#0B1120', color: '#38BDF8', padding: '2px 6px', borderRadius: '4px', border: '1px solid #1E293B' }}>
                          {e}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Precedents & Canonical Shortcuts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ backgroundColor: '#0F172A', border: '1px solid #1E293B', borderRadius: '10px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <Building size={18} color="#38BDF8" />
                <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: '#F8FAFC' }}>
                  Canonical Entities in Memory
                </h3>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#94A3B8', marginBottom: '12px' }}>
                Entities are normalized so "RBI", "Reserve Bank", and "Central Bank" share a single institutional profile.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(memoryState?.entities?.slice(0, 4) ?? []).map(ent => (
                  <div
                    key={ent.id}
                    onClick={() => {
                      setSelectedEntity(ent);
                      setActiveSubTab('entities');
                    }}
                    style={{
                      padding: '10px 12px',
                      backgroundColor: '#131D31',
                      border: '1px solid #1E293B',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#F8FAFC' }}>
                        {ent.canonical_name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '2px' }}>
                        Aliases: {ent.aliases.slice(0, 2).join(', ')}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#38BDF8' }}>
                        {ent.related_claims_count} claims
                      </span>
                      <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>
                        {ent.regulations_count} rules
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ backgroundColor: '#0F172A', border: '1px solid #1E293B', borderRadius: '10px', padding: '20px' }}>
              <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                Memory Navigation
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  onClick={() => setActiveSubTab('claims')}
                  style={{
                    padding: '10px 14px',
                    backgroundColor: '#1E293B',
                    border: '1px solid #334155',
                    borderRadius: '6px',
                    color: '#F8FAFC',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span>Browse Stored Claims &amp; Evolution</span>
                  <ChevronRight size={14} color="#64748B" />
                </button>
                <button
                  onClick={() => setActiveSubTab('contradictions')}
                  style={{
                    padding: '10px 14px',
                    backgroundColor: '#1E293B',
                    border: '1px solid #334155',
                    borderRadius: '6px',
                    color: '#F87171',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span>Resolve Cross-Research Contradictions</span>
                  <ChevronRight size={14} color="#64748B" />
                </button>
                <button
                  onClick={() => setActiveSubTab('sources')}
                  style={{
                    padding: '10px 14px',
                    backgroundColor: '#1E293B',
                    border: '1px solid #334155',
                    borderRadius: '6px',
                    color: '#FBBF24',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span>Audit High-Risk Source Dependencies</span>
                  <ChevronRight size={14} color="#64748B" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────── 2. RESEARCH LIBRARY (PROJECTS) ──────────────── */}
      {activeSubTab === 'projects' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#94A3B8' }}>
                Showing {filteredProjects.length} Historical Investigations
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {['ALL', 'Healthcare', 'Fintech', 'Retail', 'Mobility'].map(dom => (
                  <button
                    key={dom}
                    onClick={() => setSelectedDomainFilter(dom)}
                    style={{
                      padding: '4px 10px',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      borderRadius: '4px',
                      border: '1px solid #1E293B',
                      backgroundColor: selectedDomainFilter === dom ? '#0284C7' : '#0F172A',
                      color: selectedDomainFilter === dom ? '#FFF' : '#94A3B8',
                      cursor: 'pointer'
                    }}
                  >
                    {dom}
                  </button>
                ))}
              </div>
            </div>

            {filteredProjects.map(proj => {
              const isSel = selectedProject?.id === proj.id;
              return (
                <div
                  key={proj.id}
                  onClick={() => setSelectedProject(proj)}
                  style={{
                    padding: '16px',
                    backgroundColor: isSel ? '#1E293B' : '#0F172A',
                    border: `1px solid ${isSel ? '#38BDF8' : '#1E293B'}`,
                    borderLeft: `4px solid ${isSel ? '#38BDF8' : '#334155'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.74rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', backgroundColor: '#0284C7', color: '#FFF' }}>
                        {proj.research_code}
                      </span>
                      <strong style={{ fontSize: '0.92rem', color: '#F8FAFC' }}>{proj.title}</strong>
                    </div>
                    {proj.relevance_to_current && (
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#34D399', backgroundColor: '#064E3B', padding: '2px 8px', borderRadius: '12px' }}>
                        {proj.relevance_to_current}% Relevance
                      </span>
                    )}
                  </div>

                  <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: '4px 0 8px', lineHeight: '1.4' }}>
                    <strong>Verdict:</strong> {proj.verdict}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.74rem', color: '#64748B' }}>
                    <span>{proj.claims_count} claims · {proj.sources_count} sources · {proj.industry}</span>
                    <span style={{ fontFamily: 'monospace' }}>{proj.timeframe}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Project Inspector */}
          <div style={{ backgroundColor: '#0F172A', border: '1px solid #1E293B', borderRadius: '10px', padding: '20px', height: 'fit-content', position: 'sticky', top: '20px' }}>
            {selectedProject ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#38BDF8', padding: '2px 8px', borderRadius: '4px', backgroundColor: '#0369A1' }}>
                    {selectedProject.research_code}
                  </span>
                  <span style={{ fontSize: '0.74rem', color: '#34D399', fontWeight: 700 }}>
                    {(selectedProject.confidence * 100).toFixed(0)}% Confidence
                  </span>
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#F8FAFC', margin: 0, lineHeight: '1.4' }}>
                  {selectedProject.title}
                </h3>

                <div style={{ fontSize: '0.82rem', color: '#CBD5E1', backgroundColor: '#131D31', padding: '12px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Research Question</div>
                  {selectedProject.question}
                </div>

                <div style={{ borderTop: '1px solid #1E293B', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Scope &amp; Geography</div>
                  <div style={{ fontSize: '0.82rem', color: '#E2E8F0' }}>
                    {selectedProject.scope} — <em>{selectedProject.geography}</em>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #1E293B', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Shared Canonical Entities</div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {selectedProject.shared_entities.map(e => (
                      <span key={e} style={{ fontSize: '0.72rem', backgroundColor: '#0B1120', color: '#38BDF8', padding: '3px 8px', borderRadius: '4px', border: '1px solid #1E293B' }}>
                        {e}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #1E293B', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Judicial Verdict</div>
                  <div style={{ fontSize: '0.84rem', color: '#FCD34D', backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: '10px 12px', borderRadius: '6px', border: '1px solid rgba(245, 158, 11, 0.3)', lineHeight: '1.4' }}>
                    {selectedProject.verdict}
                  </div>
                </div>

                {selectedProject.relevance_reason && (
                  <div style={{ borderTop: '1px solid #1E293B', paddingTop: '12px', fontSize: '0.78rem', color: '#94A3B8' }}>
                    <strong style={{ color: '#34D399' }}>Relevance Justification:</strong> {selectedProject.relevance_reason}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748B' }}>
                Select an investigation from the library to inspect its institutional trace.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ──────────────── 3. CANONICAL ENTITIES SUBTAB ──────────────── */}
      {activeSubTab === 'entities' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#94A3B8', marginBottom: '4px' }}>
              Resolved Canonical Entities ({filteredEntities.length})
            </div>

            {filteredEntities.map(ent => {
              const isSel = selectedEntity?.id === ent.id;
              return (
                <div
                  key={ent.id}
                  onClick={() => setSelectedEntity(ent)}
                  style={{
                    padding: '14px 16px',
                    backgroundColor: isSel ? '#1E293B' : '#0F172A',
                    border: `1px solid ${isSel ? '#38BDF8' : '#1E293B'}`,
                    borderLeft: `4px solid ${isSel ? '#38BDF8' : '#334155'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', backgroundColor: ent.category === 'REGULATOR' ? '#7F1D1D' : '#1E3A8A', color: ent.category === 'REGULATOR' ? '#FCA5A5' : '#93C5FD' }}>
                        {ent.category}
                      </span>
                      <strong style={{ fontSize: '0.92rem', color: '#F8FAFC' }}>{ent.canonical_name}</strong>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#38BDF8', fontWeight: 700 }}>
                      {ent.related_claims_count} Claims
                    </span>
                  </div>

                  <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: '4px 0 8px', lineHeight: '1.4' }}>
                    {ent.description}
                  </p>

                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 700, alignSelf: 'center' }}>Aliases:</span>
                    {ent.aliases.map(al => (
                      <span key={al} style={{ fontSize: '0.68rem', backgroundColor: '#0B1120', color: '#CBD5E1', padding: '2px 6px', borderRadius: '4px', border: '1px solid #1E293B' }}>
                        {al}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Entity Inspector */}
          <div style={{ backgroundColor: '#0F172A', border: '1px solid #1E293B', borderRadius: '10px', padding: '20px', height: 'fit-content', position: 'sticky', top: '20px' }}>
            {selectedEntity ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#38BDF8', padding: '2px 8px', borderRadius: '4px', backgroundColor: '#0369A1' }}>
                    CANONICAL ENTITY
                  </span>
                  <span style={{ fontSize: '0.74rem', color: '#34D399', fontWeight: 700 }}>
                    {(selectedEntity.confidence * 100).toFixed(0)}% Resolution Confidence
                  </span>
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#F8FAFC', margin: 0 }}>
                  {selectedEntity.canonical_name}
                </h3>

                <div style={{ fontSize: '0.84rem', color: '#CBD5E1', backgroundColor: '#131D31', padding: '12px', borderRadius: '6px', lineHeight: '1.5' }}>
                  {selectedEntity.description}
                </div>

                <div style={{ borderTop: '1px solid #1E293B', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Resolved Aliases &amp; Triggers</div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {selectedEntity.aliases.map(a => (
                      <span key={a} style={{ fontSize: '0.74rem', backgroundColor: '#1E293B', color: '#38BDF8', padding: '3px 8px', borderRadius: '4px' }}>
                        "{a}"
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #1E293B', paddingTop: '12px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  <div style={{ backgroundColor: '#131D31', padding: '8px 10px', borderRadius: '6px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.68rem', color: '#64748B' }}>CLAIMS</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#38BDF8' }}>{selectedEntity.related_claims_count}</div>
                  </div>
                  <div style={{ backgroundColor: '#131D31', padding: '8px 10px', borderRadius: '6px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.68rem', color: '#64748B' }}>RULES</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FBBF24' }}>{selectedEntity.regulations_count}</div>
                  </div>
                  <div style={{ backgroundColor: '#131D31', padding: '8px 10px', borderRadius: '6px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.68rem', color: '#64748B' }}>PROJECTS</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#34D399' }}>{selectedEntity.mentioned_in_research_ids.length}</div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #1E293B', paddingTop: '12px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>Mentioned in Investigations</div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {selectedEntity.mentioned_in_research_ids.map(rid => (
                      <span key={rid} style={{ fontSize: '0.72rem', backgroundColor: '#0B1120', color: '#CBD5E1', padding: '2px 8px', borderRadius: '4px', border: '1px solid #1E293B' }}>
                        {rid}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748B' }}>
                Select an entity to view its canonical resolution profile.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ──────────────── 4. STORED CLAIMS & EVOLUTION ──────────────── */}
      {activeSubTab === 'claims' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#94A3B8', marginBottom: '4px' }}>
              Historical Claims with Chronological Evolution ({filteredClaims.length})
            </div>

            {filteredClaims.map(claim => {
              const isSel = selectedClaim?.id === claim.id;
              return (
                <div
                  key={claim.id}
                  onClick={() => setSelectedClaim(claim)}
                  style={{
                    padding: '16px',
                    backgroundColor: isSel ? '#1E293B' : '#0F172A',
                    border: `1px solid ${isSel ? '#38BDF8' : '#1E293B'}`,
                    borderLeft: `4px solid ${isSel ? '#38BDF8' : '#334155'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', backgroundColor: '#0369A1', color: '#FFF' }}>
                        {claim.claim_id}
                      </span>
                      {freshnessBadge(claim.freshness)}
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#34D399', fontWeight: 700 }}>
                      {(claim.confidence * 100).toFixed(0)}% Confidence
                    </span>
                  </div>

                  <p style={{ fontSize: '0.86rem', color: '#F8FAFC', margin: '6px 0 10px', lineHeight: '1.4', fontWeight: 600 }}>
                    {claim.statement}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.74rem', color: '#64748B' }}>
                    <span>Appearances: {claim.research_appearances} projects · {claim.supporting_sources.length} sources</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyClaim(claim.statement);
                      }}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#1E293B',
                        border: '1px solid #334155',
                        borderRadius: '4px',
                        color: copiedClaim === claim.statement ? '#34D399' : '#38BDF8',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      {copiedClaim === claim.statement ? <Check size={12} /> : <Copy size={12} />}
                      {copiedClaim === claim.statement ? 'Copied' : 'Reuse Claim'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Claim Evolution Timeline Inspector */}
          <div style={{ backgroundColor: '#0F172A', border: '1px solid #1E293B', borderRadius: '10px', padding: '20px', height: 'fit-content', position: 'sticky', top: '20px' }}>
            {selectedClaim ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#38BDF8', padding: '2px 8px', borderRadius: '4px', backgroundColor: '#0369A1' }}>
                    {selectedClaim.claim_id}
                  </span>
                  {freshnessBadge(selectedClaim.freshness)}
                </div>

                <div style={{ fontSize: '0.94rem', fontWeight: 700, color: '#F8FAFC', lineHeight: '1.4' }}>
                  {selectedClaim.statement}
                </div>

                <div style={{ borderTop: '1px solid #1E293B', paddingTop: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                    <History size={16} color="#38BDF8" />
                    <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#F8FAFC', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Chronological Claim Evolution (2024 → 2026)
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {selectedClaim.evolution_history.map((evo, i) => (
                      <div key={i} style={{ borderLeft: '2px solid #38BDF8', paddingLeft: '12px', position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#38BDF8' }}>
                            {evo.year} · {evo.stage}
                          </span>
                          <span style={{ fontSize: '0.68rem', color: '#64748B', fontFamily: 'monospace' }}>
                            {evo.research_id}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#E2E8F0', lineHeight: '1.4', marginBottom: '4px' }}>
                          "{evo.statement}"
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#94A3B8', backgroundColor: '#131D31', padding: '6px 8px', borderRadius: '4px' }}>
                          <strong style={{ color: '#FBBF24' }}>Evidence Note:</strong> {evo.evidence_note}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #1E293B', paddingTop: '12px', display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => handleCopyClaim(selectedClaim.statement)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      backgroundColor: '#0284C7',
                      color: '#FFF',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <Copy size={14} /> Copy to Clipboard
                  </button>
                  {onNavigateTab && (
                    <button
                      onClick={() => onNavigateTab('planner')}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: '#1E293B',
                        color: '#38BDF8',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        borderRadius: '6px',
                        border: '1px solid #334155',
                        cursor: 'pointer'
                      }}
                    >
                      Use in Planner
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748B' }}>
                Select a claim to inspect its multi-year evolution trace.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ──────────────── 5. SOURCES & DEPENDENCY AUDIT ──────────────── */}
      {activeSubTab === 'sources' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#94A3B8' }}>
              Persistent Source Registry &amp; Dependency Audit ({filteredSources.length})
            </div>
            <div style={{ fontSize: '0.74rem', color: '#EF4444', fontWeight: 700 }}>
              ⚠ Excessive dependencies highlighted with warning banners
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '14px' }}>
            {filteredSources.map(src => (
              <div
                key={src.id}
                style={{
                  padding: '16px',
                  backgroundColor: src.is_excessive_dependency ? 'rgba(239, 68, 68, 0.05)' : '#0F172A',
                  border: `1px solid ${src.is_excessive_dependency ? '#EF4444' : '#1E293B'}`,
                  borderRadius: '8px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', backgroundColor: '#1E3A8A', color: '#93C5FD' }}>
                      {src.source_id}
                    </span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', backgroundColor: src.independence_rating === 'INDEPENDENT' ? '#064E3B' : '#78350F', color: src.independence_rating === 'INDEPENDENT' ? '#34D399' : '#FCD34D' }}>
                      {src.independence_rating}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                    {src.publication_date}
                  </span>
                </div>

                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#F8FAFC', marginBottom: '4px', lineHeight: '1.4' }}>
                  {src.title}
                </div>
                <div style={{ fontSize: '0.76rem', color: '#38BDF8', marginBottom: '10px' }}>
                  Publisher: {src.publisher}
                </div>

                {src.is_excessive_dependency && (
                  <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid #EF4444', borderRadius: '6px', padding: '8px 10px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertCircle size={16} color="#EF4444" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: '0.74rem', color: '#FCA5A5', fontWeight: 700 }}>
                      Excessive Evidence Dependency: Backs {src.claims_supported_count} claims across 3 investigations. Single point of failure.
                    </span>
                  </div>
                )}

                <div style={{ borderTop: '1px solid #1E293B', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.74rem', color: '#64748B' }}>
                  <span>Used in {src.used_in_research_ids.length} projects</span>
                  {src.url && (
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: '#38BDF8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
                    >
                      Source <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ──────────────── 6. CONTRADICTIONS ENGINE ──────────────── */}
      {activeSubTab === 'contradictions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#94A3B8' }}>
              Cross-Research Contradiction Engine ({memoryState?.contradictions?.length ?? 2})
            </div>
            <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
              Detects systemic disagreements between different research projects and temporal shifts
            </div>
          </div>

          {(memoryState?.contradictions ?? []).map(cnt => {
            const isReconciled = reconciledContradictions[cnt.id] || cnt.resolution_status === 'RECONCILED';
            return (
              <div
                key={cnt.id}
                style={{
                  backgroundColor: '#0F172A',
                  border: `1px solid ${isReconciled ? '#059669' : '#1E293B'}`,
                  borderRadius: '10px',
                  padding: '20px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldAlert size={18} color={isReconciled ? '#34D399' : '#EF4444'} />
                    <span style={{ fontSize: '0.74rem', fontWeight: 800, padding: '3px 8px', borderRadius: '4px', backgroundColor: '#1E293B', color: '#FCD34D' }}>
                      {cnt.discrepancy_type}
                    </span>
                  </div>
                  <button
                    onClick={() => handleToggleReconcile(cnt.id)}
                    style={{
                      padding: '5px 12px',
                      backgroundColor: isReconciled ? '#064E3B' : '#1E293B',
                      border: `1px solid ${isReconciled ? '#059669' : '#334155'}`,
                      borderRadius: '6px',
                      color: isReconciled ? '#34D399' : '#CBD5E1',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <CheckCircle2 size={14} />
                    {isReconciled ? 'Reconciled' : 'Mark as Reconciled'}
                  </button>
                </div>

                {/* Side by side claim comparison */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div style={{ backgroundColor: '#131D31', border: '1px solid #1E293B', borderRadius: '8px', padding: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#38BDF8' }}>Claim A ({cnt.claim_a_id})</span>
                      <span style={{ fontSize: '0.7rem', color: '#64748B' }}>{cnt.claim_a_research}</span>
                    </div>
                    <div style={{ fontSize: '0.84rem', color: '#F8FAFC', lineHeight: '1.4' }}>
                      "{cnt.claim_a_text}"
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#131D31', border: '1px solid #1E293B', borderRadius: '8px', padding: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#EF4444' }}>Claim B ({cnt.claim_b_id})</span>
                      <span style={{ fontSize: '0.7rem', color: '#64748B' }}>{cnt.claim_b_research}</span>
                    </div>
                    <div style={{ fontSize: '0.84rem', color: '#F8FAFC', lineHeight: '1.4' }}>
                      "{cnt.claim_b_text}"
                    </div>
                  </div>
                </div>

                <div style={{ backgroundColor: '#0B1120', border: '1px solid #1E293B', borderRadius: '8px', padding: '12px 14px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#38BDF8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                    Epistemic Explanation &amp; Resolution
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#CBD5E1', lineHeight: '1.5' }}>
                    {cnt.explanation}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ──────────────── 7. UNRESOLVED QUESTIONS QUEUE ──────────────── */}
      {activeSubTab === 'questions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#94A3B8' }}>
              Persistent Unresolved Questions Queue ({memoryState?.unresolved_questions?.length ?? 2})
            </div>
            <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
              Carried forward into subsequent investigations to prevent amnesia
            </div>
          </div>

          {(memoryState?.unresolved_questions ?? []).map(q => (
            <div
              key={q.id}
              style={{
                backgroundColor: '#0F172A',
                border: '1px solid #1E293B',
                borderLeft: `4px solid ${q.severity === 'CRITICAL' ? '#EF4444' : '#F59E0B'}`,
                borderRadius: '8px',
                padding: '16px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', backgroundColor: q.severity === 'CRITICAL' ? '#7F1D1D' : '#78350F', color: q.severity === 'CRITICAL' ? '#FCA5A5' : '#FDE68A' }}>
                    {q.severity} SEVERITY
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#64748B', fontFamily: 'monospace' }}>
                    Origin: {q.origin_research_id}
                  </span>
                </div>
                <span style={{ fontSize: '0.74rem', color: '#34D399', fontWeight: 600 }}>
                  Expected Gain: {q.expected_information_gain}
                </span>
              </div>

              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#F8FAFC', marginBottom: '10px', lineHeight: '1.4' }}>
                {q.question}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.76rem', color: '#94A3B8' }}>
                <span>Recommended Agent: <strong style={{ color: '#38BDF8' }}>{q.recommended_next_agent}</strong></span>
                <span>Affected Claims: {q.affected_claims.join(', ')}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ──────────────── 8. GLOBAL MEMORY SEARCH ──────────────── */}
      {activeSubTab === 'search' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ backgroundColor: '#0F172A', border: '1px solid #1E293B', borderRadius: '10px', padding: '16px 20px' }}>
            <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
              Multi-Entity Universal Retrieval
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                placeholder="Search across all 6,821 claims, 2,813 entities, 1,204 sources, and 38 projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  backgroundColor: '#070B14',
                  border: '1px solid #1E293B',
                  borderRadius: '6px',
                  color: '#F8FAFC',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  padding: '10px 16px',
                  backgroundColor: '#1E293B',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  color: '#CBD5E1',
                  fontSize: '0.84rem',
                  cursor: 'pointer'
                }}
              >
                Clear
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '12px' }}>
            {filteredClaims.slice(0, 6).map(c => (
              <div key={c.id} style={{ backgroundColor: '#0F172A', border: '1px solid #1E293B', borderRadius: '8px', padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#38BDF8' }}>CLAIM · {c.claim_id}</span>
                  <span style={{ fontSize: '0.68rem', color: '#64748B' }}>{c.last_verified_at}</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: '#F8FAFC', lineHeight: '1.4' }}>{c.statement}</div>
              </div>
            ))}

            {filteredEntities.slice(0, 4).map(e => (
              <div key={e.id} style={{ backgroundColor: '#0F172A', border: '1px solid #1E293B', borderRadius: '8px', padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#FBBF24' }}>ENTITY · {e.category}</span>
                  <span style={{ fontSize: '0.68rem', color: '#64748B' }}>{e.related_claims_count} claims</span>
                </div>
                <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#F8FAFC' }}>{e.canonical_name}</div>
                <div style={{ fontSize: '0.74rem', color: '#94A3B8', marginTop: '2px' }}>{e.description.slice(0, 90)}...</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
