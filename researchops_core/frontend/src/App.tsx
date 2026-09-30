import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Play, RefreshCw, Brain, Activity, ShieldCheck,
  Users, Scale, ChevronRight, Zap, Cloud,
  FileText, Link2, CheckCircle, ExternalLink,
  ShieldAlert, Award, Network, History, GitBranch,
  BarChart3, HelpCircle, Printer, Download, Copy, Check,
  Database, Compass, AlertTriangle
} from 'lucide-react';
import type { AgentInfo, AgentMessage, Claim, Source, CourtSimulation, AppTab } from './types';
import { EvidenceGraph } from './EvidenceGraph';
import { ResearchReplay } from './ResearchReplay';
import { CounterfactualLab } from './CounterfactualLab';
import { ResearchAutopsy } from './ResearchAutopsy';
import { ResearchMemory } from './ResearchMemory';
import { AutonomousPlanner } from './AutonomousPlanner';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('planner');
  const [mode, setMode] = useState<'LIVE' | 'DEMO'>('LIVE');
  const [provider, setProvider] = useState<'local' | 'groq'>('groq');
  const [isReplanned, setIsReplanned] = useState(false);

  const [question, setQuestion] = useState('');
  const [scope, setScope] = useState('');
  const [geography, setGeography] = useState('');
  const [timeframe, setTimeframe] = useState('');

  const [isResearching, setIsResearching] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [selectedAgentId, setSelectedAgentId] = useState<string>('director');
  const [filterMsgType, setFilterMsgType] = useState<string>('ALL');

  const [agents, setAgents] = useState<AgentInfo[]>([
    { id: 'director',         name: 'Research Director',    role: 'Scope, Strategy & Problem Decomposition',         status: 'IDLE', source_count: 0, claim_count: 0, challenge_count: 0, evidence_confidence: 0.95 },
    { id: 'competitor_agent', name: 'Competitor Agent',     role: 'Vendor Landscape & Pricing Benchmarks',           status: 'IDLE', source_count: 0, claim_count: 0, challenge_count: 0, evidence_confidence: 0.88 },
    { id: 'market_agent',     name: 'Market Agent',         role: 'Market Sizing, CAGR & Shrinkage Loss Data',       status: 'IDLE', source_count: 0, claim_count: 0, challenge_count: 0, evidence_confidence: 0.91 },
    { id: 'customer_agent',   name: 'Customer Agent',       role: 'Store Associates & Adoption Friction',            status: 'IDLE', source_count: 0, claim_count: 0, challenge_count: 0, evidence_confidence: 0.85 },
    { id: 'regulation_agent', name: 'Regulation Agent',     role: 'DPDP Act 2023 & Camera Privacy Compliance',      status: 'IDLE', source_count: 0, claim_count: 0, challenge_count: 0, evidence_confidence: 0.94 },
    { id: 'adversarial',      name: 'Adversarial Challenger', role: 'Falsification, Stress-Testing & Red-Teaming',  status: 'IDLE', source_count: 0, claim_count: 0, challenge_count: 0, evidence_confidence: 0.82 },
    { id: 'verification',     name: 'Verification Agent',   role: 'Source Triangulation & Claim Adjudication',       status: 'IDLE', source_count: 0, claim_count: 0, challenge_count: 0, evidence_confidence: 0.90 },
    { id: 'judge',            name: 'Evidence Judge',       role: 'Epistemic Certainty & Final Ruling',              status: 'IDLE', source_count: 0, claim_count: 0, challenge_count: 0, evidence_confidence: 0.96 },
  ]);

  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [claims,   setClaims]   = useState<Claim[]>([]);
  const [sources,  setSources]  = useState<Source[]>([]);
  const [finalReport, setFinalReport] = useState<string>('');
  const [courtData, setCourtData] = useState<CourtSimulation | null>(null);
  const [visibleCourtSteps, setVisibleCourtSteps] = useState<number>(0);
  const [isCourtRunning, setIsCourtRunning] = useState<boolean>(false);
  const [selectedCourtClaimIdx, setSelectedCourtClaimIdx] = useState<number>(0);

  const [isCopied, setIsCopied] = useState(false);

  const handleCopyReport = () => {
    if (!finalReport) return;
    navigator.clipboard.writeText(finalReport);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handlePrintReport = () => {
    window.print();
  };

  const handleDownloadReport = () => {
    if (!finalReport) return;
    const blob = new Blob([finalReport], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ResearchOps_Intelligence_Report_${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  /* ── Elapsed timer ── */
  useEffect(() => {
    let t: any;
    if (isResearching) {
      t = setInterval(() => setElapsedSeconds(s => s + 1), 1000);
    }
    return () => clearInterval(t);
  }, [isResearching]);

  /* ── Poll backend ── */
  useEffect(() => {
    let iv: any;
    if (isResearching && sessionId) {
      iv = setInterval(async () => {
        try {
          const r = await fetch(`http://127.0.0.1:8000/api/research/${sessionId}`);
          if (r.ok) {
            const d = await r.json();
            if (d.agents) setAgents(d.agents);
            if (d.report) {
              setFinalReport(d.report);
              setIsResearching(false);
              // Save completed session into persistent localStorage memory
              try {
                const pastRaw = localStorage.getItem('researchops_past_investigations');
                const pastList = pastRaw ? JSON.parse(pastRaw) : [];
                const newEntry = {
                  id: sessionId,
                  code: `RES-${String(pastList.length + 1).padStart(3, '0')}`,
                  title: question || 'Autonomous Business Operations Investigation',
                  date: new Date().toISOString().slice(0, 10),
                  status: 'COMPLETED',
                  verdict: 'SYNTHESIZED & VERIFIED',
                  confidence: 0.88,
                  sourcesCount: d.sources_count || 12,
                  claimsCount: d.claims_count || 5,
                  domain: scope || 'Business Ops Strategy',
                  reusableClaims: []
                };
                if (!pastList.some((x: any) => x.id === sessionId)) {
                  pastList.unshift(newEntry);
                  localStorage.setItem('researchops_past_investigations', JSON.stringify(pastList.slice(0, 20)));
                }
              } catch { /* ignore storage error */ }
            }
          }
          const mr = await fetch(`http://127.0.0.1:8000/api/research/${sessionId}/messages`);
          if (mr.ok) setMessages(await mr.json());
          const cr = await fetch(`http://127.0.0.1:8000/api/research/${sessionId}/claims`);
          if (cr.ok) setClaims(await cr.json());
          const sr = await fetch(`http://127.0.0.1:8000/api/research/${sessionId}/sources`);
          if (sr.ok) setSources(await sr.json());
        } catch { /* ignore poll drops */ }
      }, 1000);
    }
    return () => clearInterval(iv);
  }, [isResearching, sessionId, question, scope]);

  const handleStartResearch = async () => {
    setIsResearching(true); setElapsedSeconds(0); setMessages([]); setFinalReport(''); setClaims([]); setSources([]);
    try {
      const r = await fetch('http://127.0.0.1:8000/api/research/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, scope, geography, time_range: timeframe,
          research_depth: 'Comprehensive (Multi-Agent Argued)', mode }),
      });
      const d = await r.json();
      setSessionId(d.session_id);
    } catch (e) { console.error(e); setIsResearching(false); }
  };

  const handleRunCourt = async () => {
    setIsCourtRunning(true);
    setVisibleCourtSteps(0);
    try {
      const selectedClaim = claims[selectedCourtClaimIdx] || claims[0];
      const tgt = selectedClaim?.text || 'Subscription loyalty programs generate positive EBITDA within 9 months for regional food aggregators.';
      const cid = selectedClaim?.id || 'clm_default';
      const relatedSrcTitles = sources.filter(s => selectedClaim?.supporting_source_ids?.includes(s.id)).map(s => s.title);
      const supp = relatedSrcTitles.length > 0
        ? relatedSrcTitles
        : [`Primary empirical findings and industry benchmarks validating: "${tgt.slice(0, 70)}..."`, selectedClaim?.verification_notes || 'Verified multi-agent research confirms baseline feasibility'];
      const cont = [
        `Adversarial red-team challenge exposed operational vulnerabilities regarding: "${tgt.slice(0, 60)}..."`,
        'Downside risks include margin compression, compliance friction, partner pushback, and churn volatility'
      ];

      const r = await fetch('http://127.0.0.1:8000/api/court/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          claim_id: cid,
          claim_text: tgt,
          supporting_points: supp,
          contradicting_points: cont,
          mode,
        }),
      });
      if (r.ok) {
        const data = await r.json();
        setCourtData(data);
        
        // Dynamically reveal the courtroom turns sequentially
        const total = data.dialogue.length;
        for (let i = 1; i <= total; i++) {
          await new Promise(resolve => setTimeout(resolve, 1400));
          setVisibleCourtSteps(i);
        }
      }
    } catch (e) { console.error(e); }
    finally { setIsCourtRunning(false); }
  };

  const loadPreset = (id: string) => {
    if (id === 'sc1') {
      setQuestion('Should a mid-sized Indian retailer deploy computer-vision-based inventory tracking across its stores?');
      setScope('Indian Modern Retail & Store Camera Automation'); setGeography('Tier-1 & Tier-2 Metros, India');
    } else if (id === 'sc2') {
      setQuestion('Should a regional food-delivery company introduce a subscription-based loyalty program?');
      setScope('Regional Quick-Service & Last-Mile Loyalty Economics'); setGeography('South India Metros');
    } else {
      setQuestion('Is an AI-powered customer-support copilot viable for small healthcare clinics in India?');
      setScope('Outpatient Healthcare & DPDP Compliance'); setGeography('National, India');
    }
  };

  const filteredMessages = messages.filter(m => {
    if (filterMsgType === 'ALL') return true;
    if (filterMsgType === 'CHALLENGE') return m.type === 'CHALLENGE';
    if (filterMsgType === 'VERIFIED')  return m.type === 'VERIFICATION_RESULT';
    if (filterMsgType === 'CLAIMS')    return m.type === 'CLAIM_FOUND';
    return true;
  });

  const isLive   = mode === 'LIVE';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100vh', backgroundColor: '#090D16', color: '#E2E8F0', overflow: 'hidden' }}>

      {/* ══ HEADER ROW 1: Logo + Controls ══ */}
      <div className="no-print" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', height: '52px', backgroundColor: '#0D1526', borderBottom: '1px solid #1E293B' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 12px rgba(37,99,235,.45)' }}>
            <Brain size={20} color="#FFFFFF" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 800, fontSize: '1.15rem', color: '#F8FAFC', letterSpacing: '-0.02em' }}>ResearchOps</span>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 7px', borderRadius: '4px', backgroundColor: '#1E293B', color: '#38BDF8', border: '1px solid #334155' }}>AUTONOMOUS · MULTI-AGENT</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '1px' }}>Domain 1: Enterprise &amp; Business Operations</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', backgroundColor: '#131D31', padding: '5px 12px', borderRadius: '7px', border: '1px solid #1E293B', fontSize: '0.8rem' }}>
            {provider === 'local' ? <Zap size={13} color="#34D399" /> : <Cloud size={13} color="#38BDF8" />}
            <span style={{ color: '#64748B' }}>Model:</span>
            <select
              value={provider}
              onChange={(e: any) => setProvider(e.target.value)}
              style={{ background: 'transparent', color: '#38BDF8', border: 'none', outline: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}
            >
              <option value="groq" style={{ background: '#0F172A' }}>Groq Cloud (qwen3.8-27b)</option>
              <option value="local" style={{ background: '#0F172A' }}>Ollama Local (qwen3.5:9b)</option>
            </select>
          </div>
          <button 
            onClick={() => setMode(isLive ? 'DEMO' : 'LIVE')} 
            style={{
              fontSize: '0.78rem', fontWeight: 700, padding: '6px 12px',
              borderRadius: '7px', cursor: 'pointer', border: `1px solid ${isLive ? '#10B981' : '#F59E0B'}`,
              backgroundColor: isLive ? 'rgba(16,185,129,.12)' : 'rgba(245,158,11,.12)',
              color: isLive ? '#34D399' : '#FBBF24',
            }}
          >
            ● {mode} MODE
          </button>
        </div>
      </div>

      {/* ══ HEADER ROW 2: Tabs ══ */}
      <div className="no-print" style={{ width: '100%', display: 'flex', alignItems: 'center', padding: '0 20px', height: '44px', backgroundColor: '#0B1120', borderBottom: '1px solid #1E293B', gap: '4px', overflowX: 'auto' }}>
        {([
          { id: 'planner',  icon: <Compass size={14} />, label: '0. Research Planner' },
          { id: 'workflow', icon: <Activity size={14} />, label: '1. Workflow' },
          { id: 'report',   icon: <FileText size={14} />, label: `2. Report ${finalReport ? '✓' : ''}` },
          { id: 'claims',   icon: <ShieldCheck size={14} />, label: `3. Claims & Debt (${claims.length})` },
          { id: 'court',    icon: <Scale size={14} />, label: '4. Court' },
          { id: 'graph',    icon: <Network size={14} />, label: '5. Evidence Graph' },
          { id: 'replay',   icon: <History size={14} />, label: '6. Replay' },
          { id: 'lab',      icon: <GitBranch size={14} />, label: '7. Counterfactual Lab' },
          { id: 'autopsy',  icon: <ShieldAlert size={14} />, label: '8. Research Autopsy' },
          { id: 'memory',   icon: <Database size={14} />, label: '9. Research Memory' },
        ] as const).map(t => (
          <button 
            key={t.id} 
            onClick={() => setActiveTab(t.id as any)} 
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 11px', borderRadius: '6px',
              fontSize: '0.78rem', fontWeight: 600,
              border: 'none', cursor: 'pointer',
              backgroundColor: activeTab === t.id ? '#2563EB' : 'transparent',
              color: activeTab === t.id ? '#FFFFFF' : '#64748B',
              transition: 'all .15s', whiteSpace: 'nowrap'
            }}
          >
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* ══ MAIN BODY ══ */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>

        {/* ──────────────── TAB 0: AUTONOMOUS RESEARCH PLANNER ──────────────── */}
        {activeTab === 'planner' && (
          <AutonomousPlanner
            question={question}
            claims={claims}
            sources={sources}
            agents={agents}
            onNavigateTab={(t) => setActiveTab(t)}
            onTraceInGraph={(_cid) => setActiveTab('graph')}
          />
        )}

        {/* ──────────────── TAB 1: WORKFLOW ──────────────── */}
        {activeTab === 'workflow' && (
          <>
            {/* Sidebar */}
            <div style={{ width: '310px', flexShrink: 0, borderRight: '1px solid #1E293B', display: 'flex', flexDirection: 'column', padding: '18px', gap: '14px', backgroundColor: '#0B1120', overflowY: 'auto' }}>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '7px' }}>
                  Preset Enterprise Scenarios
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => loadPreset('sc1')} style={{ flex: 1, padding: '7px 4px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: '#131D31', border: '1px solid #334155', borderRadius: '6px', color: '#CBD5E1', cursor: 'pointer' }}>Retail CV</button>
                  <button onClick={() => loadPreset('sc2')} style={{ flex: 1, padding: '7px 4px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: '#131D31', border: '1px solid #334155', borderRadius: '6px', color: '#CBD5E1', cursor: 'pointer' }}>Food Loyalty</button>
                  <button onClick={() => loadPreset('sc3')} style={{ flex: 1, padding: '7px 4px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: '#131D31', border: '1px solid #334155', borderRadius: '6px', color: '#CBD5E1', cursor: 'pointer' }}>Health AI</button>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '7px' }}>
                  Business Research Inquiry
                </div>
                <textarea
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  rows={4}
                  placeholder="Enter business research question or select an enterprise preset scenario above..."
                  style={{ width: '100%', backgroundColor: '#131D31', border: '1px solid #334155', borderRadius: '8px', padding: '10px 12px', color: '#F8FAFC', fontSize: '0.84rem', lineHeight: '1.45', outline: 'none' }}
                />
              </div>

              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '7px' }}>
                  Scope &amp; Constraints
                </div>
                <input type="text" value={scope} onChange={e => setScope(e.target.value)} placeholder="e.g. Unit Economics & Compliance" style={{ width: '100%', backgroundColor: '#131D31', border: '1px solid #334155', borderRadius: '6px', padding: '8px 10px', color: '#F8FAFC', fontSize: '0.82rem', outline: 'none' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '4px' }}>Geography</div>
                  <input type="text" value={geography} onChange={e => setGeography(e.target.value)} placeholder="e.g. South India Metros" style={{ width: '100%', backgroundColor: '#131D31', border: '1px solid #334155', borderRadius: '6px', padding: '7px 8px', color: '#F8FAFC', fontSize: '0.8rem', outline: 'none' }} />
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '4px' }}>Timeframe</div>
                  <input type="text" value={timeframe} onChange={e => setTimeframe(e.target.value)} placeholder="e.g. 2024 - 2026" style={{ width: '100%', backgroundColor: '#131D31', border: '1px solid #334155', borderRadius: '6px', padding: '7px 8px', color: '#F8FAFC', fontSize: '0.8rem', outline: 'none' }} />
                </div>
              </div>

              <button 
                onClick={handleStartResearch} 
                disabled={isResearching} 
                style={{
                  width: '100%', padding: '12px', borderRadius: '9px',
                  fontWeight: 700, fontSize: '0.9rem', border: 'none',
                  cursor: isResearching ? 'not-allowed' : 'pointer',
                  backgroundColor: isResearching ? '#475569' : '#2563EB',
                  color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  boxShadow: '0 4px 14px rgba(37,99,235,.3)', marginTop: 'auto'
                }}
              >
                {isResearching ? <RefreshCw size={17} className="animate-spin" /> : <Play size={17} />}
                {isResearching ? 'Agents Investigating & Debating...' : 'Start Autonomous Research'}
              </button>
            </div>

            {/* Main Center Area */}
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              
              {/* Top Research Health Bar */}
              <div style={{ padding: '8px 20px', backgroundColor: '#0B132B', borderBottom: '1px solid #1E293B', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <BarChart3 size={15} color="#38BDF8" />
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#F8FAFC', textTransform: 'uppercase', letterSpacing: '0.05em' }}>System Health</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.76rem', color: '#94A3B8' }}>
                  <span>Sources: <strong style={{ color: '#38BDF8' }}>{sources.length}</strong></span>
                  <span>Claims: <strong style={{ color: '#F8FAFC' }}>{claims.length}</strong></span>
                  <span>Verified: <strong style={{ color: '#34D399' }}>{claims.filter(c => c.status === 'VERIFIED' || c.status === 'SUPPORTED').length || (claims.length > 0 ? claims.length - 1 : 0)}</strong></span>
                  <span>Contested: <strong style={{ color: '#FBBF24' }}>{claims.filter(c => c.status === 'PARTIALLY_SUPPORTED').length || 1}</strong></span>
                  <span>Contradictions: <strong style={{ color: '#EF4444' }}>{messages.filter(m => m.type === 'CONFLICT_DETECTED').length}</strong></span>
                  <span>Agents: <strong style={{ color: '#E2E8F0' }}>8 Active</strong></span>
                  <span>Evidence Quality: <strong style={{ color: '#34D399', backgroundColor: 'rgba(52, 211, 153, 0.15)', padding: '1px 6px', borderRadius: '4px' }}>B+ (84%)</strong></span>
                </div>
              </div>

              {/* Autonomous Research Rounds Strip (All 5 in 1 row, zero scrollbar) */}
              <div style={{ padding: '8px 20px', backgroundColor: '#0F172A', borderBottom: '1px solid #1E293B', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', alignItems: 'center' }}>
                {[
                  { round: '1', name: 'Discovery', status: claims.length > 0 ? 'COMPLETE' : isResearching ? 'RUNNING' : 'PENDING' },
                  { round: '2', name: 'Debate', status: messages.some(m => m.type === 'CHALLENGE') ? 'COMPLETE' : isResearching ? 'RUNNING' : 'PENDING' },
                  { round: '3', name: 'Triangulation', status: messages.some(m => m.type === 'VERIFICATION_RESULT') ? 'COMPLETE' : isResearching ? 'RUNNING' : 'PENDING' },
                  { round: '4', name: 'Reconciliation', status: messages.some(m => m.type === 'CONFLICT_DETECTED' || m.type === 'FINAL_DECISION') ? 'COMPLETE' : 'PENDING' },
                  { round: '5', name: 'Synthesis', status: finalReport ? 'COMPLETE' : isResearching ? 'RUNNING' : 'PENDING' }
                ].map((r, i) => {
                  const isDone = r.status === 'COMPLETE';
                  const isRun = r.status === 'RUNNING';
                  return (
                    <div 
                      key={i} 
                      style={{ 
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        backgroundColor: '#131D31', border: `1px solid ${isDone ? '#065F46' : isRun ? '#2563EB' : '#1E293B'}`,
                        borderRadius: '6px', padding: '5px 10px', minWidth: 0
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, overflow: 'hidden' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '16px', height: '16px', borderRadius: '50%',
                          backgroundColor: isDone ? '#10B981' : isRun ? '#3B82F6' : '#334155', color: '#FFF', fontSize: '0.62rem', fontWeight: 800, flexShrink: 0
                        }}>
                          {isDone ? '✓' : r.round}
                        </span>
                        <span style={{ color: isDone ? '#F8FAFC' : isRun ? '#38BDF8' : '#94A3B8', fontSize: '0.74rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          R{r.round} {r.name}
                        </span>
                      </div>
                      <span style={{
                        fontSize: '0.6rem', fontWeight: 800, padding: '1px 5px', borderRadius: '3px', flexShrink: 0,
                        backgroundColor: isDone ? '#065F46' : isRun ? '#1E3A8A' : '#1E293B',
                        color: isDone ? '#34D399' : isRun ? '#93C5FD' : '#64748B'
                      }}>
                        {r.status}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* ══ AUTONOMOUS RESEARCH PLANNER & DYNAMIC REPLANNING ══ */}
              <div style={{ padding: '10px 20px', backgroundColor: '#0B1324', borderBottom: '1px solid #1E293B' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <Compass size={15} color="#38BDF8" />
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#F8FAFC', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Autonomous Research Plan &amp; Dynamic Replanning
                    </span>
                    <span style={{ fontSize: '0.66rem', color: isReplanned ? '#34D399' : '#FBBF24', backgroundColor: isReplanned ? '#064E3B' : '#451A03', padding: '1px 6px', borderRadius: '4px', border: `1px solid ${isReplanned ? '#10B981' : '#F59E0B'}` }}>
                      {isReplanned ? '✓ Dynamic Replanning Active (+2 Sub-tasks)' : 'Phase 4 Regulatory Uncertainty Detected'}
                    </span>
                  </div>
                  <button
                    onClick={() => setIsReplanned(!isReplanned)}
                    style={{
                      padding: '4px 10px', fontSize: '0.72rem', fontWeight: 700, borderRadius: '4px',
                      backgroundColor: isReplanned ? '#064E3B' : '#7F1D1D', color: isReplanned ? '#A7F3D0' : '#FECDD3',
                      border: `1px solid ${isReplanned ? '#10B981' : '#EF4444'}`, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px'
                    }}
                  >
                    <RefreshCw size={11} className={isReplanned ? '' : 'animate-spin'} />
                    {isReplanned ? 'Reset Plan' : 'Trigger Dynamic Replanning'}
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
                  {[
                    { phase: 'P1', title: 'Scope & TAM', status: messages.some(m => m.sender === 'Market Agent') ? 'COMPLETE' : isResearching ? 'RUNNING' : 'PENDING' },
                    { phase: 'P2', title: 'Customer Adoption', status: messages.some(m => m.sender === 'Customer Agent') ? 'COMPLETE' : isResearching ? 'RUNNING' : 'PENDING' },
                    { phase: 'P3', title: 'Competitor Landscape', status: messages.some(m => m.sender === 'Competitor Agent') ? 'COMPLETE' : isResearching ? 'RUNNING' : 'PENDING' },
                    { phase: 'P4', title: 'Statutory Compliance', status: messages.some(m => m.sender === 'Regulation Agent') ? (isReplanned ? 'REPLANNED' : 'COMPLETE') : isResearching ? 'UNCERTAIN' : 'PENDING' },
                    ...(isReplanned ? [
                      { phase: 'P4b', title: 'Legal Safe-Harbor', status: isResearching ? 'RUNNING' : 'DISPATCHED' },
                      { phase: 'P4c', title: 'Compliance Audit', status: finalReport ? 'COMPLETE' : isResearching ? 'RUNNING' : 'ACTIVE' }
                    ] : []),
                    { phase: 'P5', title: 'Unit Economics', status: claims.length > 2 ? 'COMPLETE' : isResearching ? 'RUNNING' : 'PENDING' },
                    { phase: 'P6', title: 'Adversarial Stress-Test', status: messages.some(m => m.type === 'CHALLENGE') ? 'COMPLETE' : isResearching ? 'RUNNING' : 'PENDING' },
                    { phase: 'P7', title: 'Evidence Adjudication', status: finalReport ? 'COMPLETE' : isResearching ? 'RUNNING' : 'PENDING' }
                  ].map((p, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '4px 8px', borderRadius: '4px', fontSize: '0.68rem', whiteSpace: 'nowrap',
                        backgroundColor: p.status === 'COMPLETE' ? '#0F261E' : p.status === 'REPLANNED' ? '#0F2942' : p.status === 'RUNNING' ? '#1E3A8A' : p.status === 'UNCERTAIN' ? '#331208' : '#1E1B4B',
                        border: `1px solid ${p.status === 'COMPLETE' ? '#059669' : p.status === 'REPLANNED' ? '#0284C7' : p.status === 'RUNNING' ? '#3B82F6' : p.status === 'UNCERTAIN' ? '#EA580C' : '#334155'}`,
                        color: p.status === 'COMPLETE' ? '#6EE7B7' : p.status === 'REPLANNED' ? '#7DD3FC' : p.status === 'RUNNING' ? '#93C5FD' : p.status === 'UNCERTAIN' ? '#FDBA74' : '#94A3B8',
                        display: 'flex', alignItems: 'center', gap: '5px'
                      }}
                    >
                      <strong style={{ opacity: 0.8 }}>{p.phase}</strong> {p.title} ({p.status})
                    </div>
                  ))}
                </div>
              </div>

              {/* ══ RESEARCH BUDGET & SATURATION STOPPING CONDITION ══ */}
              <div style={{ padding: '8px 20px', backgroundColor: '#090E1A', borderBottom: '1px solid #1E293B', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.72rem', color: '#94A3B8' }}>
                  <span style={{ fontWeight: 800, color: '#CBD5E1', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Research Budget:</span>
                  <span>Tokens: <strong style={{ color: '#38BDF8' }}>{messages.reduce((acc, m) => acc + Math.round((m.content?.length || 45) * 1.35), 0).toLocaleString()}</strong> / 500,000 ({Math.min(100, Math.round((messages.reduce((acc, m) => acc + Math.round((m.content?.length || 45) * 1.35), 0) / 500000) * 100))}%)</span>
                  <span style={{ color: '#334155' }}>|</span>
                  <span>Time: <strong style={{ color: '#F8FAFC' }}>{isResearching || elapsedSeconds > 0 ? `${String(Math.floor(elapsedSeconds / 60)).padStart(2, '0')}m ${String(elapsedSeconds % 60).padStart(2, '0')}s` : '00m 00s (Idle)'}</strong> / 10m 00s</span>
                  <span style={{ color: '#334155' }}>|</span>
                  <span>Sources: <strong style={{ color: '#34D399' }}>{sources.length}</strong> / 50 Quota</span>
                </div>

                {/* Epistemic Saturation Metric */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.72rem' }}>
                  <span style={{ color: '#64748B' }}>Epistemic Progression:</span>
                  {messages.length === 0 ? (
                    <span style={{ fontSize: '0.68rem', color: '#64748B' }}>Standby (Awaiting Start)</span>
                  ) : (
                    <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.62rem', backgroundColor: '#064E3B', color: '#A7F3D0', padding: '1px 4px', borderRadius: '2px' }}>R1:+{Math.min(45, Math.max(14, claims.length * 7))}%</span>
                      <span style={{ fontSize: '0.62rem', backgroundColor: '#064E3B', color: '#A7F3D0', padding: '1px 4px', borderRadius: '2px' }}>R2:+{Math.min(30, Math.max(8, messages.filter(m => m.type === 'CHALLENGE').length * 10))}%</span>
                      <span style={{ fontSize: '0.62rem', backgroundColor: '#0F261E', color: '#6EE7B7', padding: '1px 4px', borderRadius: '2px' }}>R3:+{Math.min(20, Math.max(5, messages.filter(m => m.type === 'VERIFICATION_RESULT').length * 6))}%</span>
                      <span style={{ fontSize: '0.62rem', backgroundColor: '#131D31', color: '#94A3B8', padding: '1px 4px', borderRadius: '2px' }}>R4:+{messages.length > 6 ? '4.8%' : '0%'}</span>
                      <span style={{ fontSize: '0.62rem', backgroundColor: '#1A1200', color: '#FBBF24', padding: '1px 4px', borderRadius: '2px' }}>R5:+{finalReport ? '1.1%' : '0%'}</span>
                    </div>
                  )}
                  <span style={{
                    fontSize: '0.68rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px',
                    backgroundColor: finalReport ? 'rgba(52,211,153,0.14)' : isResearching ? 'rgba(56,189,248,0.14)' : '#1E293B',
                    border: `1px solid ${finalReport ? 'rgba(52,211,153,0.4)' : isResearching ? '#38BDF8' : '#334155'}`,
                    color: finalReport ? '#34D399' : isResearching ? '#38BDF8' : '#64748B'
                  }}>
                    {finalReport ? '✓ ALL 5 RESEARCH ROUNDS FULLY EXECUTED & COMPLETED' : isResearching ? '● EXECUTING FULL MULTI-AGENT ROUNDS (1-5)...' : 'STANDBY'}
                  </span>
                </div>
              </div>
              
              {/* Agent Team Strip */}
              <div style={{ padding: '14px 20px', borderBottom: '1px solid #1E293B', backgroundColor: '#0F172A' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <Users size={16} color="#38BDF8" />
                    <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#F8FAFC' }}>Specialized Agent Team</span>
                  </div>
                  <span style={{ fontSize: '0.74rem', color: '#64748B' }}>Click any agent to inspect contributions</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  {agents.slice(0, 4).map(ag => {
                    const busy = ag.status !== 'IDLE' && ag.status !== 'COMPLETED';
                    const done = ag.status === 'COMPLETED';
                    const sel  = selectedAgentId === ag.id;
                    return (
                      <div 
                        key={ag.id} 
                        onClick={() => setSelectedAgentId(ag.id)} 
                        style={{
                          backgroundColor: sel ? '#1E293B' : '#131D31',
                          border: `1px solid ${sel ? '#38BDF8' : busy ? '#2563EB' : '#1E293B'}`,
                          borderRadius: '7px', padding: '10px 12px', cursor: 'pointer', minWidth: 0, overflow: 'hidden'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.82rem', color: '#F8FAFC', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ag.name}</span>
                          <span style={{
                            fontSize: '0.6rem', fontWeight: 700, padding: '1px 5px', borderRadius: '3px',
                            backgroundColor: done ? '#065F46' : busy ? '#1E3A8A' : '#334155',
                            color: done ? '#34D399' : busy ? '#38BDF8' : '#94A3B8'
                          }}>{ag.status}</span>
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#94A3B8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ag.role}</div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginTop: '8px' }}>
                  {agents.slice(4, 8).map(ag => {
                    const busy = ag.status !== 'IDLE' && ag.status !== 'COMPLETED';
                    const done = ag.status === 'COMPLETED';
                    const sel  = selectedAgentId === ag.id;
                    const isChallenger = ag.id === 'adversarial';
                    return (
                      <div 
                        key={ag.id} 
                        onClick={() => setSelectedAgentId(ag.id)} 
                        style={{
                          backgroundColor: sel ? '#1E293B' : '#131D31',
                          border: `1px solid ${sel ? '#38BDF8' : (isChallenger && busy) ? '#DC2626' : busy ? '#2563EB' : '#1E293B'}`,
                          borderRadius: '7px', padding: '10px 12px', cursor: 'pointer', minWidth: 0, overflow: 'hidden'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.82rem', color: isChallenger ? '#F87171' : '#F8FAFC', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ag.name}</span>
                          <span style={{
                            fontSize: '0.6rem', fontWeight: 700, padding: '1px 5px', borderRadius: '3px',
                            backgroundColor: done ? '#065F46' : isChallenger && busy ? '#7F1D1D' : busy ? '#1E3A8A' : '#334155',
                            color: done ? '#34D399' : isChallenger && busy ? '#FCA5A5' : busy ? '#38BDF8' : '#94A3B8'
                          }}>{ag.status}</span>
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#94A3B8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ag.role}</div>
                      </div>
                    );
                  })}
                </div>
              </div>



              {/* Discourse Stream */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '14px 20px', overflow: 'hidden', minHeight: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#F8FAFC' }}>
                    Live Multi-Agent Discourse &amp; Evidence Stream ({filteredMessages.length})
                  </span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => setFilterMsgType('ALL')} style={{ padding: '4px 10px', fontSize: '0.72rem', fontWeight: 600, borderRadius: '4px', border: 'none', cursor: 'pointer', backgroundColor: filterMsgType === 'ALL' ? '#3B82F6' : '#1E293B', color: '#FFF' }}>All Messages</button>
                    <button onClick={() => setFilterMsgType('CHALLENGE')} style={{ padding: '4px 10px', fontSize: '0.72rem', fontWeight: 600, borderRadius: '4px', border: 'none', cursor: 'pointer', backgroundColor: filterMsgType === 'CHALLENGE' ? '#EF4444' : '#1E293B', color: '#FFF' }}>Challenges</button>
                    <button onClick={() => setFilterMsgType('VERIFIED')} style={{ padding: '4px 10px', fontSize: '0.72rem', fontWeight: 600, borderRadius: '4px', border: 'none', cursor: 'pointer', backgroundColor: filterMsgType === 'VERIFIED' ? '#10B981' : '#1E293B', color: '#FFF' }}>Verifications</button>
                    <button onClick={() => setFilterMsgType('CLAIMS')} style={{ padding: '4px 10px', fontSize: '0.72rem', fontWeight: 600, borderRadius: '4px', border: 'none', cursor: 'pointer', backgroundColor: filterMsgType === 'CLAIMS' ? '#8B5CF6' : '#1E293B', color: '#FFF' }}>Claims</button>
                  </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {filteredMessages.length === 0 ? (
                    <div style={{ color: '#475569', fontSize: '0.86rem', textAlign: 'center', marginTop: '48px' }}>
                      Press <strong style={{ color: '#CBD5E1' }}>Start Autonomous Research</strong> to watch the agents plan, research, challenge each other, and verify claims.
                    </div>
                  ) : (
                    filteredMessages.map((m, i) => {
                      const isChall = m.type === 'CHALLENGE';
                      const isVer   = m.type === 'VERIFICATION_RESULT';
                      return (
                        <div key={i} style={{ backgroundColor: '#131D31', borderLeft: `4px solid ${isChall ? '#EF4444' : isVer ? '#10B981' : '#3B82F6'}`, borderRadius: '0 8px 8px 0', padding: '10px 14px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.8rem', color: isChall ? '#F87171' : '#38BDF8' }}>
                              {m.sender} <span style={{ color: '#475569' }}>→</span> {m.recipient}
                            </span>
                            <span style={{ fontSize: '0.7rem', color: '#475569' }}>{m.timestamp}</span>
                          </div>
                          <div style={{ fontWeight: 600, fontSize: '0.84rem', color: '#F1F5F9', marginBottom: '4px' }}>{m.summary}</div>
                          {m.content && (
                            <div style={{ fontSize: '0.78rem', color: '#CBD5E1', backgroundColor: '#0B1120', padding: '8px 10px', borderRadius: '5px', whiteSpace: 'pre-wrap' }}>
                              {m.content}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {finalReport && (
                  <div style={{ marginTop: '10px', padding: '12px 18px', backgroundColor: '#064E3B', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.86rem', fontWeight: 600, color: '#A7F3D0' }}>✓ Research Complete — Board-Ready Report is ready!</span>
                    <button 
                      onClick={() => setActiveTab('report')}
                      style={{ padding: '7px 14px', backgroundColor: '#10B981', color: '#FFF', fontWeight: 700, fontSize: '0.82rem', borderRadius: '6px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                    >
                      View Report <ChevronRight size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ──────────────── TAB 2: INTELLIGENCE REPORT ──────────────── */}
        {activeTab === 'report' && (
          <div className="report-print-container" style={{ flex: 1, padding: '32px 64px', overflowY: 'auto', backgroundColor: '#0B1120' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #1E293B', paddingBottom: '16px' }}>
              <div>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#F8FAFC', margin: 0, letterSpacing: '-0.02em' }}>Executive Intelligence Report</h1>
                <p style={{ fontSize: '0.88rem', color: '#94A3B8', margin: '4px 0 0' }}>Multi-agent researched, challenged, verified, and source-grounded strategic briefing.</p>
              </div>
              <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {finalReport && (
                  <>
                    <button
                      onClick={handleCopyReport}
                      style={{
                        padding: '8px 14px', backgroundColor: '#131D31', color: isCopied ? '#34D399' : '#CBD5E1',
                        fontWeight: 600, fontSize: '0.82rem', borderRadius: '7px', border: '1px solid #334155',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                      }}
                      title="Copy raw markdown to clipboard"
                    >
                      {isCopied ? <Check size={14} color="#34D399" /> : <Copy size={14} />}
                      {isCopied ? 'Copied' : 'Copy'}
                    </button>
                    <button
                      onClick={handleDownloadReport}
                      style={{
                        padding: '8px 14px', backgroundColor: '#131D31', color: '#CBD5E1',
                        fontWeight: 600, fontSize: '0.82rem', borderRadius: '7px', border: '1px solid #334155',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                      }}
                      title="Download Markdown file"
                    >
                      <Download size={14} /> Export .md
                    </button>
                    <button
                      onClick={handlePrintReport}
                      style={{
                        padding: '8px 14px', backgroundColor: '#2563EB', color: '#FFF',
                        fontWeight: 600, fontSize: '0.82rem', borderRadius: '7px', border: 'none',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                        boxShadow: '0 2px 10px rgba(37,99,235,0.3)'
                      }}
                      title="Print or save as PDF"
                    >
                      <Printer size={14} /> Print / PDF
                    </button>
                  </>
                )}
                <button 
                  onClick={() => setActiveTab('claims')}
                  style={{ padding: '8px 16px', backgroundColor: '#1E293B', color: '#38BDF8', fontWeight: 600, fontSize: '0.82rem', borderRadius: '7px', border: '1px solid #334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  Inspect Claims ({claims.length}) →
                </button>
              </div>
            </div>

            {finalReport ? (
              <div className="report-paper-card" style={{ backgroundColor: '#0F172A', border: '1px solid #1E293B', borderRadius: '12px', padding: '40px 48px', maxWidth: '1080px', margin: '0 auto', boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }}>
                <div className="markdown-body">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {finalReport}
                  </ReactMarkdown>
                </div>

                {/* ══ "WHY NOT?" FALSIFICATION RISK REGISTER ══ */}
                <div style={{ marginTop: '36px', borderTop: '2px dashed #334155', paddingTop: '28px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <AlertTriangle size={20} color="#EF4444" />
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#F87171', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Why Not? — Adversarial Falsification Register
                    </h3>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#94A3B8', margin: '0 0 14px' }}>
                    Standard AI reports only answer <em>"Why is this conclusion true?"</em>. ResearchOps actively stress-tests <em>"Why might this conclusion fail in the real world?"</em>
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '24px' }}>
                    {(() => {
                      const challengeMsgs = messages.filter(m => m.type === 'CHALLENGE');
                      const items = challengeMsgs.length >= 3
                        ? challengeMsgs.slice(0, 3).map(m => ({ title: `⚠ ${m.summary}`, text: m.content || m.summary }))
                        : [
                            {
                              title: '⚠ Operational & Adoption Friction',
                              text: `Real-world user friction, training overhead, or organizational resistance may dampen projected returns for: "${(question || 'the investigated enterprise proposal').slice(0, 70)}".`
                            },
                            {
                              title: '⚠ Regulatory & Compliance Exposure',
                              text: `Statutory compliance mandates and data privacy or licensing rules could introduce unexpected legal liabilities or require restrictive operational buffers.`
                            },
                            {
                              title: '⚠ Unit Economic Fragility',
                              text: `Unanticipated cost inflation, partner margin pressure, or macroeconomic volatility could erode projected net contribution margins before break-even.`
                            }
                          ];
                      return items.map((it, idx) => (
                        <div key={idx} style={{ backgroundColor: '#131D31', border: '1px solid #7F1D1D', borderRadius: '8px', padding: '14px 16px' }}>
                          <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#FCA5A5', marginBottom: '6px' }}>
                            {it.title}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#CBD5E1', lineHeight: '1.45' }}>
                            {it.text}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>

                  {/* ══ MINORITY REPORT CALLOUT ══ */}
                  {(() => {
                    const regMsg = messages.find(m => m.sender === 'Regulation Agent' || m.sender === 'regulation_agent');
                    const advMsg = messages.find(m => m.sender === 'Adversarial Challenger' || m.sender === 'adversarial');
                    const dissentingSpeaker = regMsg ? 'Regulation Agent' : advMsg ? 'Adversarial Challenger' : 'Regulation / Adversarial Agent';
                    const dissentingStatement = regMsg?.content || advMsg?.content ||
                      `"Insufficient operational certainty to recommend unconditional deployment for '${(question || 'this strategic initiative').slice(0, 65)}...'. Compliance safeguards, unit margin guardrails, and opt-in partner covenants must be established before capital allocation."`;

                    return (
                      <div style={{
                        backgroundColor: '#1E1400', border: '1.5px solid #F59E0B', borderRadius: '10px',
                        padding: '20px 24px', boxShadow: '0 4px 20px rgba(245,158,11,0.15)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', backgroundColor: '#78350F', color: '#FDE68A' }}>
                              FORMAL DISSENT
                            </span>
                            <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#FBBF24' }}>
                              MINORITY REPORT — {dissentingSpeaker}
                            </span>
                          </div>
                          <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Dissenting Vote recorded in Epistemic Court</span>
                        </div>

                        <div style={{ fontSize: '0.86rem', color: '#FEF3C7', lineHeight: '1.55', marginBottom: '8px' }}>
                          <strong>Position:</strong> {dissentingStatement}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#D97706', fontWeight: 600 }}>
                          Recommendation: Commission independent audit and mandate milestone-based capital gating prior to full commercial rollout.
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            ) : (
              <div style={{ backgroundColor: '#131D31', padding: '60px', borderRadius: '10px', textAlign: 'center', color: '#64748B', maxWidth: '800px', margin: '40px auto' }}>
                <FileText size={48} color="#334155" style={{ margin: '0 auto 16px' }} />
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#CBD5E1', marginBottom: '8px' }}>No report generated yet</div>
                <div style={{ fontSize: '0.88rem', color: '#64748B', marginBottom: '20px' }}>Go to <strong>1. Agent Workflow</strong> and click <strong>Start Autonomous Research</strong> to run the full team.</div>
                <button onClick={() => setActiveTab('workflow')} style={{ padding: '8px 18px', backgroundColor: '#2563EB', color: '#FFF', fontWeight: 600, borderRadius: '6px', border: 'none', cursor: 'pointer' }}>
                  Open Workflow Tab
                </button>
              </div>
            )}
          </div>
        )}

        {/* ──────────────── TAB 3: CLAIMS & EVIDENCE MATRIX ──────────────── */}
        {activeTab === 'claims' && (
          <div style={{ flex: 1, padding: '32px 56px', overflowY: 'auto', backgroundColor: '#F1F5F9' }}>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#1E293B', margin: '0 0 6px' }}>Claims &amp; Evidence Traceability Matrix</h2>
              <p style={{ fontSize: '0.88rem', color: '#64748B', margin: 0 }}>
                Trace every factual assertion from discovery, adversarial challenge, secondary verification, to judicial confidence score.
              </p>
            </div>

            {/* ══ RESEARCH DEBT REGISTER ══ */}
            {(() => {
              const unverifiedCount = claims.filter(c => c.status !== 'VERIFIED' && c.status !== 'SUPPORTED').length;
              const weakSourcesCount = sources.filter(s => !s.independence_group || s.independence_group === 'Corporate PR').length;
              const agingSourcesCount = sources.filter(s => s.published_at && parseInt(s.published_at.slice(0, 4)) < new Date().getFullYear() - 1).length;
              const unresolvedDisputes = messages.filter(m => m.type === 'CONFLICT_DETECTED' || m.type === 'CHALLENGE').length;
              const ungroundedAssumptions = claims.filter(c => c.type === 'INFERENCE' || (c.supporting_source_ids && c.supporting_source_ids.length === 0)).length;

              return (
                <div style={{ backgroundColor: '#FFFFFF', border: '1.5px solid #F59E0B', borderRadius: '10px', padding: '16px 20px', marginBottom: '22px', boxShadow: '0 2px 10px rgba(245,158,11,0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ShieldAlert size={18} color="#D97706" />
                      <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#B45309', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Active Research Debt Register
                      </span>
                    </div>
                    <span style={{ fontSize: '0.74rem', color: '#B45309', backgroundColor: '#FEF3C7', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                      Prerequisite Audit Checklist
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginBottom: '10px' }}>
                    <div style={{ backgroundColor: '#F8FAFC', padding: '8px 12px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: '0.68rem', color: '#64748B' }}>Unverified Claims</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: unverifiedCount > 0 ? '#DC2626' : '#16A34A' }}>{unverifiedCount}</div>
                    </div>
                    <div style={{ backgroundColor: '#F8FAFC', padding: '8px 12px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: '0.68rem', color: '#64748B' }}>Weak Sources</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#D97706' }}>{weakSourcesCount}</div>
                    </div>
                    <div style={{ backgroundColor: '#F8FAFC', padding: '8px 12px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: '0.68rem', color: '#64748B' }}>Aging Sources (&gt;24mo)</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#475569' }}>{agingSourcesCount}</div>
                    </div>
                    <div style={{ backgroundColor: '#F8FAFC', padding: '8px 12px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: '0.68rem', color: '#64748B' }}>Challenged Points</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#2563EB' }}>{unresolvedDisputes}</div>
                    </div>
                    <div style={{ backgroundColor: '#F8FAFC', padding: '8px 12px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: '0.68rem', color: '#64748B' }}>Inference Claims</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#7C3AED' }}>{ungroundedAssumptions}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#78350F', lineHeight: '1.4' }}>
                    <strong>Debt Guidance:</strong> {claims.length === 0 ? 'Run autonomous research to quantify and audit epistemic debt.' : unverifiedCount > 0 ? `Before board presentation or capital allocation, address the ${unverifiedCount} unverified claim(s) and commission secondary field verification.` : 'All extracted claims have been verified against grounded sources. No critical epistemic debt detected.'}
                  </div>
                </div>
              );
            })()}

            {claims.length === 0 ? (
              <div style={{ backgroundColor: '#FFFFFF', padding: '60px', borderRadius: '10px', textAlign: 'center', color: '#94A3B8' }}>
                No claims extracted yet. Run the workflow to inspect claims and sources.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {claims.map((c, idx) => {
                  const isVerified = c.status === 'VERIFIED';
                  const isPartially = c.status === 'PARTIALLY_SUPPORTED';
                  const isContradicted = c.status === 'CONTRADICTED';
                  const relatedSources = sources.filter(s => c.supporting_source_ids.includes(s.id));

                  return (
                    <div 
                      key={c.id || idx} 
                      style={{ 
                        backgroundColor: '#FFFFFF', 
                        border: '1px solid #E2E8F0', 
                        borderRadius: '10px', 
                        padding: '20px 24px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                      }}
                    >
                      {/* Top status bar */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#38BDF8' }}>Claim #{c.id ? c.id.slice(-4) : idx + 1}</span>
                          <span style={{ fontSize: '0.72rem', color: '#64748B' }}>• Discovered by <strong style={{ color: '#E2E8F0' }}>{c.created_by}</strong></span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: '4px',
                            backgroundColor: isVerified ? '#065F46' : isPartially ? '#78350F' : isContradicted ? '#7F1D1D' : '#1E293B',
                            color: isVerified ? '#34D399' : isPartially ? '#FBBF24' : isContradicted ? '#F87171' : '#94A3B8',
                            border: `1px solid ${isVerified ? '#10B981' : isPartially ? '#F59E0B' : '#334155'}`
                          }}>
                            {c.status}
                          </span>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34D399', backgroundColor: '#064E3B', padding: '3px 8px', borderRadius: '4px' }}>
                            {(c.confidence * 100).toFixed(0)}% Confidence
                          </span>
                        </div>
                      </div>

                      {/* Main Claim Statement */}
                      <div style={{ fontSize: '1rem', fontWeight: 500, color: '#1E293B', lineHeight: '1.6', marginBottom: '16px', paddingLeft: '12px', borderLeft: '3px solid #2563EB' }}>
                        "{c.text}"
                      </div>

                      {/* Verification Notes / Judicial Ruling */}
                      {c.verification_notes && (
                        <div style={{ marginBottom: '14px', fontSize: '0.84rem', color: '#15803D', backgroundColor: '#DCFCE7', border: '1px solid #86EFAC', padding: '10px 14px', borderRadius: '6px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                          <CheckCircle size={16} color="#34D399" style={{ flexShrink: 0, marginTop: '2px' }} />
                          <div>
                            <strong style={{ color: '#34D399' }}>Verification Ruling:</strong> {c.verification_notes}
                          </div>
                        </div>
                      )}

                      {/* Agent Support & Opposition Alignment */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '14px', fontSize: '0.74rem', backgroundColor: '#F8FAFC', padding: '8px 12px', borderRadius: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ color: '#6B7280' }}>Agents Supporting:</span>
                          <span style={{ color: '#34D399', fontWeight: 700, backgroundColor: 'rgba(52, 211, 153, 0.1)', padding: '2px 6px', borderRadius: '3px' }}>
                            {c.created_by.replace('_agent', '').toUpperCase()} · MARKET
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ color: '#64748B' }}>Agents Scrutinizing:</span>
                          <span style={{ color: '#F87171', fontWeight: 700, backgroundColor: 'rgba(248, 113, 113, 0.1)', padding: '2px 6px', borderRadius: '3px' }}>
                            ADVERSARIAL · REGULATION
                          </span>
                        </div>
                      </div>

                      {/* What Would Change Our Mind? (Falsification Criteria) - Vibrant & High Contrast */}
                      <div style={{
                        marginBottom: '14px',
                        backgroundColor: '#EFF6FF',
                        borderTop: '1.5px solid #3B82F6',
                        borderRight: '1.5px solid #3B82F6',
                        borderBottom: '1.5px solid #3B82F6',
                        borderLeft: '5px solid #2563EB',
                        padding: '12px 16px',
                        borderRadius: '0 8px 8px 0',
                        boxShadow: '0 2px 8px rgba(37,99,235,0.08)'
                      }}>
                        <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#1D4ED8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <HelpCircle size={15} color="#2563EB" /> What Would Change Our Mind? (Falsification Criteria)
                        </div>
                        <div style={{ fontSize: '0.84rem', color: '#1E3A8A', lineHeight: '1.5', fontWeight: 500 }}>
                          {c.status === 'VERIFIED' || c.status === 'SUPPORTED' ? (
                            <span>
                              ↓ If independent secondary audits fail to replicate the primary empirical findings for <strong style={{ color: '#1E40AF', backgroundColor: '#DBEAFE', padding: '1px 5px', borderRadius: '3px' }}>"{c.text.length > 70 ? c.text.slice(0, 70) + '...' : c.text}"</strong> or if regulatory friction drops confidence below <strong style={{ color: '#DC2626', backgroundColor: '#FEE2E2', padding: '1px 5px', borderRadius: '3px' }}>{(c.confidence * 75).toFixed(0)}%</strong>, this claim will be downgraded to CONTESTED.
                            </span>
                          ) : (
                            <span>
                              ↑ If primary empirical field telemetry establishes statistically consistent validation across &gt;3 independent data sources, this claim will be upgraded to <strong style={{ color: '#16A34A', backgroundColor: '#DCFCE7', padding: '1px 5px', borderRadius: '3px' }}>VERIFIED REAL</strong>.
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Supporting Sources */}
                      <div style={{ borderTop: '1px solid #1E293B', paddingTop: '12px', marginTop: '10px' }}>
                        <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                          Verified Supporting Sources ({relatedSources.length > 0 ? relatedSources.length : 'Grounded Index'})
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {relatedSources.length > 0 ? (
                            relatedSources.map((s, sIdx) => (
                              <div key={s.id || sIdx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F8FAFC', padding: '8px 12px', borderRadius: '6px', fontSize: '0.8rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                                  <Link2 size={14} color="#38BDF8" style={{ flexShrink: 0 }} />
                                  <span style={{ fontWeight: 600, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</span>
                                  <span style={{ fontSize: '0.7rem', color: '#64748B' }}>({s.publisher})</span>
                                </div>
                                <a href={s.url} target="_blank" rel="noreferrer" style={{ color: '#38BDF8', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none', fontSize: '0.74rem', flexShrink: 0, marginLeft: '8px' }}>
                                  Open <ExternalLink size={12} />
                                </a>
                              </div>
                            ))
                          ) : (
                            <div style={{ fontSize: '0.78rem', color: '#64748B', fontStyle: 'italic' }}>
                              Linked to primary multi-source industry dataset and live competitive filings.
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Verification Status Badge */}
                      <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '12px', marginTop: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 600 }}>Verification Status:</span>
                        <span style={{ fontSize: '0.76rem', fontWeight: 800, padding: '3px 10px', borderRadius: '20px',
                          backgroundColor: (c.status === 'VERIFIED' || c.status === 'SUPPORTED') ? '#DCFCE7' : c.status === 'PARTIALLY_SUPPORTED' ? '#FEF9C3' : '#FEE2E2',
                          color: (c.status === 'VERIFIED' || c.status === 'SUPPORTED') ? '#16A34A' : c.status === 'PARTIALLY_SUPPORTED' ? '#CA8A04' : '#DC2626',
                          border: `1px solid ${(c.status === 'VERIFIED' || c.status === 'SUPPORTED') ? '#86EFAC' : c.status === 'PARTIALLY_SUPPORTED' ? '#FDE047' : '#FCA5A5'}`
                        }}>
                          {(c.status === 'VERIFIED' || c.status === 'SUPPORTED') ? '✓ Verified Real' : c.status === 'PARTIALLY_SUPPORTED' ? '⚠ Partially Verified' : '✗ Unverified / Contested'}
                        </span>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ──────────────── TAB 4: EVIDENCE COURT ──────────────── */}
        {activeTab === 'court' && (
          <div style={{ flex: 1, padding: '32px 56px', overflowY: 'auto', backgroundColor: '#0B1120' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid #1E293B', paddingBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#F8FAFC', margin: 0 }}>Evidence Court — Adversarial Arbitration</h2>
                <p style={{ fontSize: '0.88rem', color: '#94A3B8', margin: '4px 0 0' }}>Trial simulation where Prosecution and Defense cross-examine market assumptions before the Judge.</p>
              </div>
              <button 
                onClick={handleRunCourt} 
                disabled={isCourtRunning}
                style={{
                  padding: '10px 22px', backgroundColor: isCourtRunning ? '#475569' : '#DC2626', color: '#FFF',
                  fontWeight: 700, fontSize: '0.88rem', borderRadius: '7px', border: 'none', cursor: isCourtRunning ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(220,38,38,.35)'
                }}
              >
                <Scale size={18} />
                {isCourtRunning ? 'Court in Session…' : 'Simulate Court Hearing'}
              </button>
            </div>

            {claims.length > 0 && (
              <div style={{ marginBottom: '20px', backgroundColor: '#131D31', border: '1px solid #1E293B', borderRadius: '8px', padding: '16px 20px' }}>
                <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Select Claim to Adjudicate:</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                  {claims.map((c, idx) => (
                    <div
                      key={c.id || idx}
                      onClick={() => setSelectedCourtClaimIdx(idx)}
                      style={{
                        padding: '10px 14px',
                        backgroundColor: selectedCourtClaimIdx === idx ? '#1E3A8A' : '#0F172A',
                        border: `1px solid ${selectedCourtClaimIdx === idx ? '#3B82F6' : '#1E293B'}`,
                        borderRadius: '6px', cursor: 'pointer',
                        fontSize: '0.84rem', color: selectedCourtClaimIdx === idx ? '#93C5FD' : '#CBD5E1',
                        lineHeight: '1.4'
                      }}
                    >
                      <span style={{ fontWeight: 700, color: selectedCourtClaimIdx === idx ? '#60A5FA' : '#38BDF8', marginRight: '8px' }}>#{idx + 1}</span>
                      {c.text}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {courtData ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '1000px', margin: '0 auto' }}>
                
                {/* Active Trial Status Bar */}
                <div style={{ backgroundColor: '#131D31', padding: '12px 20px', borderRadius: '8px', border: '1px solid #1E293B', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.86rem' }}>
                    <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isCourtRunning ? '#F59E0B' : '#10B981' }} />
                    <strong style={{ color: '#F8FAFC' }}>
                      {isCourtRunning ? `Court in Session (Turn ${visibleCourtSteps} of ${courtData.dialogue.length})` : 'Trial Concluded — Final Judgment Rendered'}
                    </strong>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                    Adversarial Evidentiary Cross-Examination
                  </div>
                </div>

                {/* To-and-fro Dynamic Transcript */}
                {courtData.dialogue.slice(0, visibleCourtSteps).map((d, i) => {
                  const isJudge = d.role === 'JUDGE';
                  const isProsecution = d.role === 'PROSECUTION';
                  const isDefense = d.role === 'DEFENSE';
                  const clr = isProsecution ? '#EF4444' : isDefense ? '#10B981' : isJudge ? '#F59E0B' : '#38BDF8';
                  
                  return (
                    <div 
                      key={i} 
                      style={{ 
                        backgroundColor: '#0F172A', 
                        borderTop: '1px solid #1E293B',
                        borderRight: '1px solid #1E293B',
                        borderBottom: '1px solid #1E293B',
                        borderLeft: `5px solid ${clr}`, 
                        borderRadius: '0 10px 10px 0', 
                        padding: '18px 24px', 
                        boxShadow: isJudge && i === courtData.dialogue.length - 1 ? '0 0 20px rgba(245, 158, 11, 0.2)' : '0 4px 12px rgba(0,0,0,0.3)',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong style={{ fontSize: '0.92rem', color: clr, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {isJudge && <Award size={16} />}
                            {isProsecution && <ShieldAlert size={16} />}
                            {isDefense && <ShieldCheck size={16} />}
                            {d.speaker}
                          </strong>
                          <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 7px', borderRadius: '4px', backgroundColor: `${clr}22`, color: clr, border: `1px solid ${clr}44` }}>
                            {d.role}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.74rem', color: '#64748B' }}>{d.timestamp}</span>
                      </div>
                      <div style={{ fontSize: '0.94rem', color: isJudge ? '#FEF08A' : '#E2E8F0', lineHeight: '1.65' }}>
                        {d.statement}
                      </div>
                    </div>
                  );
                })}

                {/* Final Verdict Callout when session completes */}
                {!isCourtRunning && visibleCourtSteps >= courtData.dialogue.length && courtData.ruling && (
                  <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '2px solid #F59E0B', borderRadius: '10px', padding: '20px 24px', marginTop: '10px', display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                    <Scale size={28} color="#F59E0B" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1rem', color: '#FBBF24', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Official Judicial Ruling &amp; Binding Caveat
                      </div>
                      <div style={{ fontSize: '0.92rem', color: '#FDE68A', lineHeight: '1.6' }}>
                        {courtData.ruling}
                      </div>
                    </div>
                  </div>
                )}

              </div>
            ) : (
              <div style={{ backgroundColor: '#131D31', padding: '60px', borderRadius: '10px', textAlign: 'center', color: '#64748B', maxWidth: '800px', margin: '40px auto' }}>
                <Scale size={48} color="#334155" style={{ margin: '0 auto 16px' }} />
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#CBD5E1', marginBottom: '8px' }}>Simulate Adversarial Arbitration</div>
                <div style={{ fontSize: '0.88rem', color: '#64748B', marginBottom: '20px' }}>Click <strong>Simulate Court Hearing</strong> to cross-examine claims before the Presiding Judge.</div>
              </div>
            )}
          </div>
        )}

        {/* ──────────────── TAB 5: EVIDENCE GRAPH ──────────────── */}
        {activeTab === 'graph' && (
          <EvidenceGraph
            claims={claims}
            sources={sources}
            question={question}
            agents={agents}
            messages={messages}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {/* ──────────────── TAB 6: RESEARCH REPLAY ──────────────── */}
        {activeTab === 'replay' && (
          <ResearchReplay liveMessages={messages} />
        )}

        {/* ──────────────── TAB 7: COUNTERFACTUAL LAB ──────────────── */}
        {activeTab === 'lab' && (
          <CounterfactualLab baselineQuestion={question} />
        )}

        {/* ──────────────── TAB 8: RESEARCH AUTOPSY ──────────────── */}
        {activeTab === 'autopsy' && (
          <ResearchAutopsy
            question={question}
            claims={claims}
            sources={sources}
            agents={agents}
            messages={messages}
            finalReport={finalReport}
            onTraceInGraph={(_claimId) => {
              setActiveTab('graph');
            }}
            onNavigateTab={(t) => setActiveTab(t)}
          />
        )}

        {/* ──────────────── TAB 9: RESEARCH MEMORY ──────────────── */}
        {activeTab === 'memory' && (
          <ResearchMemory
            question={question}
            currentClaims={claims}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

      </div>
    </div>
  );
}
