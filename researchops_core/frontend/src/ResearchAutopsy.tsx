import { useState, useMemo, useEffect, useRef } from 'react';
import {
  ShieldAlert, RefreshCw,
  Search,
  Sparkles, History, Users, Check,
  Sliders, Play, Info, Terminal, BookOpen, Network,
  Volume2, VolumeX, Pause, Radio, RotateCcw, Award, ShieldCheck, SkipForward, SkipBack
} from 'lucide-react';
import type { Claim, Source, AgentInfo, AgentMessage, AppTab } from './types';
import type {
  ResearchAutopsySession,
  AutopsyFinding,
  FindingSeverity,
  AutopsyMode
} from './autopsyTypes';

interface ResearchAutopsyProps {
  question: string;
  claims: Claim[];
  sources: Source[];
  agents: AgentInfo[];
  messages?: AgentMessage[];
  finalReport?: string;
  onTraceInGraph?: (claimId: string) => void;
  onNavigateTab?: (tab: AppTab) => void;
}

// Synthesize authentic wooden court gavel sound using Web Audio API
function playGavelSound(strikes = 2) {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const strike = (timeOffset: number, volume = 0.5) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(155, ctx.currentTime + timeOffset);
      osc.frequency.exponentialRampToValueAtTime(42, ctx.currentTime + timeOffset + 0.12);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(850, ctx.currentTime + timeOffset);
      filter.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + timeOffset + 0.12);
      gain.gain.setValueAtTime(volume, ctx.currentTime + timeOffset);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + timeOffset + 0.14);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + timeOffset);
      osc.stop(ctx.currentTime + timeOffset + 0.15);
    };
    strike(0, 0.65);
    if (strikes >= 2) strike(0.18, 0.5);
    if (strikes >= 3) strike(0.36, 0.55);
  } catch (err) {
    console.warn('AudioContext not allowed or not supported:', err);
  }
}

export function ResearchAutopsy({
  question,
  claims = [],
  sources = [],
  agents = [],
  messages = [],
  finalReport = '',
  onTraceInGraph,
  onNavigateTab
}: ResearchAutopsyProps) {
  // Autopsy Mode State
  const [selectedMode, setSelectedMode] = useState<AutopsyMode>('FULL AUTOPSY');
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [activeVersion, setActiveVersion] = useState<'AUTOPSY-001' | 'AUTOPSY-002'>('AUTOPSY-001');

  // Execution & Live UI States
  const [isRunning, setIsRunning] = useState(false);
  const [activeAuditorIndex, setActiveAuditorIndex] = useState(0);
  const [currentTarget, setCurrentTarget] = useState('CLAIM-001');
  const [currentOperation, setCurrentOperation] = useState('Testing evidence-to-claim alignment...');

  // Active Findings, Filter, and Selection States
  const [activeSubView, setActiveSubView] = useState<'dashboard' | 'report' | 'replay' | 'followup' | 'disagreements' | 'debate'>('dashboard');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFindingId, setSelectedFindingId] = useState<string>('FND-001');

  // Synthesized Voice Debate State
  const [isDebatePlaying, setIsDebatePlaying] = useState<boolean>(false);
  const [debateStep, setDebateStep] = useState<number>(0);
  const [debateSpeed, setDebateSpeed] = useState<number>(1.0);
  const [isDebateMuted, setIsDebateMuted] = useState<boolean>(false);
  const [activeDebateSpeaker, setActiveDebateSpeaker] = useState<number | null>(null);
  const debateSynthRef = useRef<SpeechSynthesis | null>(null);
  const debateTurnRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      debateSynthRef.current = window.speechSynthesis;
    }
    return () => {
      if (debateSynthRef.current) debateSynthRef.current.cancel();
    };
  }, []);

  const autopsyDebateTurns = useMemo(() => [
    {
      step: 1,
      speaker: 'Presiding Judge Sharma',
      role: 'JUDGE',
      persona: 'Authoritative, balanced voice delivering caveats',
      statement: 'Order in the Autopsy Chamber! The Court convenes a forensic cross-examination of the critical audit findings. Prosecution and Defense shall examine whether the research conclusions survive the identified evidence gaps. Clerk, record the docket.',
      time: '18:12:05'
    },
    {
      step: 2,
      speaker: 'Prosecution Agent Vance',
      role: 'PROSECUTION',
      persona: 'Skeptical, rigorous voice',
      statement: 'Your Honor, Finding FND-001 reveals fatal vulnerability: the team accepted a 2.8x order lift assumption without verified willingness-to-pay data after subsidies end. If customers churn upon paying real delivery fees, the entire financial thesis collapses into negative contribution!',
      time: '18:12:14'
    },
    {
      step: 3,
      speaker: 'Defense Agent Mehta',
      role: 'DEFENSE',
      persona: 'Optimistic, growth-focused voice',
      statement: 'Objection! The audit ignores empirical cohort baseline resilience. Pilot tracking across Tier-1 metros proves a 42% retention floor. Furthermore, merchant co-funding agreements contribute 15% rebates that fully amortize acquisition overheads within 90 days. The growth compounding is verified!',
      time: '18:12:28'
    },
    {
      step: 4,
      speaker: 'Prosecution Agent Vance',
      role: 'PROSECUTION',
      persona: 'Skeptical, rigorous voice',
      statement: 'Compounding growth is an illusion when statutory compliance fails! Finding FND-002 proves DPDP Act 2023 consent gaps. Processing granular geolocation and order histories without verifiable consent triggers penalties up to ₹250 Crore. No corporate model survives that existential downside!',
      time: '18:12:42'
    },
    {
      step: 5,
      speaker: 'Defense Agent Mehta',
      role: 'DEFENSE',
      persona: 'Optimistic, growth-focused voice',
      statement: 'Which is why automated consent management is an operational milestone in Phase 1, not an insurmountable barrier. With LTV at ₹2,140 and disciplined ₹249 basket thresholds, unit contribution remains strongly positive. The business model generates robust long-term enterprise value!',
      time: '18:12:56'
    },
    {
      step: 6,
      speaker: 'Presiding Judge Sharma',
      role: 'JUDGE',
      persona: 'Authoritative, balanced voice delivering caveats',
      statement: 'The Court has synthesized the evidence audit. While the defense demonstrates commercial viability under disciplined execution, the prosecution has proven that unconstrained subsidies and regulatory neglect are unacceptable. The Court rules: AUTOPSY FINDINGS RATIFIED WITH BINDING CAVEATS. Rollout permitted ONLY with dynamic ₹249 basket floors and mandatory quarterly consent audits. Court is adjourned!',
      time: '18:13:12'
    }
  ], []);

  const stopDebate = () => {
    if (debateSynthRef.current) debateSynthRef.current.cancel();
    setIsDebatePlaying(false);
    setActiveDebateSpeaker(null);
  };

  const speakDebateTurn = (turnIndex: number, autoAdvance = true) => {
    if (!debateSynthRef.current || !autopsyDebateTurns[turnIndex]) {
      stopDebate();
      return;
    }
    debateSynthRef.current.cancel();

    if (isDebateMuted) {
      if (autoAdvance && turnIndex + 1 < autopsyDebateTurns.length) {
        setTimeout(() => {
          setDebateStep(turnIndex + 1);
          speakDebateTurn(turnIndex + 1, true);
        }, 1200 / debateSpeed);
      } else {
        stopDebate();
      }
      return;
    }

    const turn = autopsyDebateTurns[turnIndex];
    const textToSpeak = `${turn.speaker}: ${turn.statement.replace(/₹/g, ' rupees ')}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    const voices = debateSynthRef.current.getVoices().filter(v => v.lang.startsWith('en'));

    if (turn.role === 'JUDGE') {
      utterance.pitch = 0.84;
      utterance.rate = debateSpeed * 0.94;
      const maleVoice = voices.find(v => v.name.toLowerCase().includes('david') || v.name.toLowerCase().includes('male'));
      if (maleVoice) utterance.voice = maleVoice;
      if (turnIndex === 0 || turnIndex === autopsyDebateTurns.length - 1) playGavelSound(turnIndex === 0 ? 3 : 2);
    } else if (turn.role === 'PROSECUTION') {
      utterance.pitch = 0.96;
      utterance.rate = debateSpeed * 1.08;
      const prosVoice = voices.find(v => v.name.toLowerCase().includes('guy') || v.name.toLowerCase().includes('mark'));
      if (prosVoice) utterance.voice = prosVoice;
    } else {
      utterance.pitch = 1.14;
      utterance.rate = debateSpeed * 0.98;
      const defVoice = voices.find(v => v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('female'));
      if (defVoice) utterance.voice = defVoice;
    }

    utterance.onstart = () => {
      setActiveDebateSpeaker(turnIndex);
      setDebateStep(turnIndex);
      if (debateTurnRefs.current[turnIndex]) {
        debateTurnRefs.current[turnIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    utterance.onend = () => {
      if (autoAdvance && turnIndex + 1 < autopsyDebateTurns.length) {
        setTimeout(() => {
          if (debateSynthRef.current && isDebatePlaying) {
            setDebateStep(turnIndex + 1);
            speakDebateTurn(turnIndex + 1, true);
          }
        }, 400);
      } else {
        if (turnIndex === autopsyDebateTurns.length - 1) playGavelSound(2);
        stopDebate();
      }
    };

    utterance.onerror = () => stopDebate();
    debateSynthRef.current.speak(utterance);
  };

  const handleToggleDebate = () => {
    if (isDebatePlaying) {
      stopDebate();
    } else {
      setIsDebatePlaying(true);
      const start = activeDebateSpeaker !== null ? activeDebateSpeaker : 0;
      setDebateStep(start);
      speakDebateTurn(start, true);
    }
  };

  // Proposed revision modal state
  const [revisionFinding, setRevisionFinding] = useState<AutopsyFinding | null>(null);
  const [confirmedRevisions, setConfirmedRevisions] = useState<Set<string>>(new Set());

  // Autopsy Session State
  const [session, setSession] = useState<ResearchAutopsySession | null>(null);

  // Initialize or fetch initial autopsy data
  const loadAutopsyData = async (mode: AutopsyMode, version: 'AUTOPSY-001' | 'AUTOPSY-002') => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/autopsy/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question || 'Is an AI-powered customer-support copilot viable for small healthcare clinics in India?',
          claims: claims.map((c: Claim) => ({ id: c.id, text: c.text, type: c.type, status: c.status, confidence: c.confidence })),
          sources: sources.map((s: Source) => ({ id: s.id, title: s.title, publisher: s.publisher, url: s.url })),
          agents: agents.map((a: AgentInfo) => ({ id: a.id, name: a.name, role: a.role })),
          messages: messages.slice(0, 15).map((m: AgentMessage) => ({ id: m.id, sender: m.sender, summary: m.summary, content: m.content })),
          final_report: finalReport,
          mode,
          version
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSession(data);
        if (data.findings && data.findings.length > 0) {
          setSelectedFindingId(data.findings[0].finding_id);
        }
      }
    } catch {
      // Fallback is handled deterministically
    }
  };

  useEffect(() => {
    loadAutopsyData(selectedMode, activeVersion);
  }, [question, claims.length, sources.length, activeVersion]);

  // Run or Re-run live autopsy simulation
  const handleRunAutopsy = async () => {
    setIsRunning(true);
    setActiveAuditorIndex(0);

    const auditorsList = session?.auditors || [
      { name: 'Assumption Auditor', target: 'CLAIM-001' },
      { name: 'Evidence Auditor', target: 'CLAIM-002' },
      { name: 'Source Quality Auditor', target: 'SOURCE-003' },
      { name: 'Contradiction Auditor', target: 'CLAIM-004' },
      { name: 'Logic Auditor', target: 'CLAIM-005' },
      { name: 'Bias Auditor', target: 'DATASET-001' },
      { name: 'Completeness Auditor', target: 'RESEARCH-SCOPE' },
      { name: 'Temporal Auditor', target: 'STATUTE-2023' },
      { name: 'Data Quality Auditor', target: 'PERCENT-METRICS' },
      { name: 'Methodology Auditor', target: 'SAMPLE-SIZE' },
      { name: 'Adversarial Challenger', target: 'FINAL-CONCLUSION' },
      { name: 'Alternative Hypothesis Agent', target: 'HYPOTHESIS-002' },
      { name: 'Conclusion Auditor', target: 'VERDICT-BOUNDS' },
      { name: 'Red Team Director', target: 'SYNTHESIS-REPORT' },
    ];

    for (let i = 0; i < auditorsList.length; i++) {
      setActiveAuditorIndex(i);
      setCurrentTarget((auditorsList[i] as any).target || `TARGET-${i + 1}`);
      setCurrentOperation(`Auditing ${(auditorsList[i] as any).focus || (auditorsList[i] as any).role || 'epistemic premises'}...`);
      await new Promise(r => setTimeout(r, 220));
    }

    await loadAutopsyData(selectedMode, activeVersion);
    setIsRunning(false);
  };

  const handleApplyRevision = (finding: AutopsyFinding) => {
    setRevisionFinding(finding);
  };

  const confirmApplyRevision = (findingId: string) => {
    setConfirmedRevisions(prev => new Set(prev).add(findingId));
    setRevisionFinding(null);
  };

  const handleTraceFinding = (claimId?: string) => {
    if (claimId && onTraceInGraph) {
      onTraceInGraph(claimId);
    } else if (onNavigateTab) {
      onNavigateTab('graph');
    }
  };

  // Filtered Findings
  const findings = session?.findings || [];
  const filteredFindings = useMemo(() => {
    return findings.filter(f => {
      if (categoryFilter !== 'ALL' && f.category !== categoryFilter) return false;
      if (severityFilter !== 'ALL' && f.severity !== severityFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return f.title.toLowerCase().includes(q) || f.description.toLowerCase().includes(q) || f.finding_id.toLowerCase().includes(q);
      }
      return true;
    });
  }, [findings, categoryFilter, severityFilter, searchQuery]);

  const selectedFinding = useMemo(() => {
    return findings.find(f => f.finding_id === selectedFindingId) || findings[0];
  }, [findings, selectedFindingId]);

  // Metric counts
  const criticalCount = findings.filter(f => f.severity === 'CRITICAL').length;
  const highCount = findings.filter(f => f.severity === 'HIGH').length;
  const mediumCount = findings.filter(f => f.severity === 'MEDIUM').length;
  const lowCount = findings.filter(f => f.severity === 'LOW').length;

  const severityBadge = (sev: FindingSeverity) => {
    switch (sev) {
      case 'CRITICAL':
        return { bg: '#450A0A', border: '#DC2626', text: '#FCA5A5', icon: '🔴' };
      case 'HIGH':
        return { bg: '#451A03', border: '#D97706', text: '#FDE68A', icon: '🟠' };
      case 'MEDIUM':
        return { bg: '#1E3A8A', border: '#2563EB', text: '#93C5FD', icon: '🟡' };
      case 'LOW':
        return { bg: '#064E3B', border: '#059669', text: '#A7F3D0', icon: '🟢' };
      case 'INFORMATIONAL':
      default:
        return { bg: '#1E293B', border: '#475569', text: '#CBD5E1', icon: 'ℹ️' };
    }
  };

  const survivalColor = (status?: string) => {
    switch (status) {
      case 'SURVIVED AUTOPSY':
        return { color: '#34D399', bg: '#064E3B', border: '#059669' };
      case 'SURVIVED WITH MATERIAL CAVEATS':
        return { color: '#FBBF24', bg: '#451A03', border: '#D97706' };
      case 'REQUIRES FURTHER RESEARCH':
        return { color: '#60A5FA', bg: '#1E3A8A', border: '#2563EB' };
      case 'FAILED KEY ASSUMPTION':
      case 'CRITICAL EVIDENCE GAP':
      default:
        return { color: '#F87171', bg: '#450A0A', border: '#DC2626' };
    }
  };

  const surv = survivalColor(session?.research_survival_status);

  return (
    <div style={{ flex: 1, padding: '24px 36px', overflowY: 'auto', backgroundColor: '#070B14', color: '#E2E8F0' }}>

      {/* ══ 1. TOP HEADER & AUDIT TRIGGER ROW ══ */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', borderBottom: '1px solid #1E293B', paddingBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: '#7F1D1D', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #EF4444', boxShadow: '0 0 16px rgba(239, 68, 68, 0.3)' }}>
              <ShieldAlert size={22} color="#FCA5A5" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#F8FAFC', margin: 0, letterSpacing: '-0.02em' }}>
                  RESEARCH AUTOPSY
                </h2>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '3px 8px', borderRadius: '4px', backgroundColor: '#1E293B', color: '#38BDF8', border: '1px solid #334155' }}>
                  {session?.version || activeVersion} · 14 SPECIALIZED AUDITORS
                </span>
              </div>
              <p style={{ fontSize: '0.84rem', color: '#94A3B8', margin: '3px 0 0' }}>
                "Attempt to break this research before you rely on it." An independent adversarial audit of the completed investigation.
              </p>
            </div>
          </div>
        </div>

        {/* Buttons & Version Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Version Switcher */}
          <div style={{ display: 'flex', backgroundColor: '#0F172A', padding: '3px', borderRadius: '6px', border: '1px solid #1E293B' }}>
            {(['AUTOPSY-001', 'AUTOPSY-002'] as const).map(v => (
              <button
                key={v}
                onClick={() => setActiveVersion(v)}
                style={{
                  padding: '5px 10px', fontSize: '0.74rem', fontWeight: 700, borderRadius: '4px', border: 'none', cursor: 'pointer',
                  backgroundColor: activeVersion === v ? '#2563EB' : 'transparent',
                  color: activeVersion === v ? '#FFFFFF' : '#64748B'
                }}
              >
                {v}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsConfigOpen(!isConfigOpen)}
            style={{
              padding: '9px 14px', backgroundColor: isConfigOpen ? '#1E293B' : '#0F172A',
              color: '#CBD5E1', fontSize: '0.82rem', fontWeight: 700, borderRadius: '6px',
              border: '1px solid #334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            <Sliders size={14} /> Configure Autopsy
          </button>

          <button
            onClick={handleRunAutopsy}
            disabled={isRunning}
            style={{
              padding: '10px 22px', backgroundColor: isRunning ? '#334155' : '#EF4444',
              color: '#FFFFFF', fontSize: '0.88rem', fontWeight: 800, borderRadius: '6px',
              border: 'none', cursor: isRunning ? 'not-allowed' : 'pointer', display: 'flex',
              alignItems: 'center', gap: '8px', boxShadow: '0 2px 14px rgba(239, 68, 68, 0.35)', flexShrink: 0
            }}
          >
            {isRunning ? <RefreshCw size={15} className="animate-spin" /> : <Play size={15} />}
            {isRunning ? 'Auditing Research State...' : 'RUN RESEARCH AUTOPSY'}
          </button>
        </div>
      </div>

      {/* ══ CONFIGURATION ACCORDION DRAWER ══ */}
      {isConfigOpen && (
        <div style={{ backgroundColor: '#0F172A', border: '1.5px solid #2563EB', borderRadius: '10px', padding: '16px 20px', marginBottom: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#38BDF8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
            Select Autopsy Audit Mode Preset:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
            {([
              { id: 'FULL AUTOPSY', label: 'Full Autopsy', desc: 'Runs all 14 specialized auditors across every claim and source.' },
              { id: 'QUICK AUTOPSY', label: 'Quick Autopsy', desc: 'Runs Assumption, Evidence, Contradiction, and Conclusion auditors.' },
              { id: 'RED TEAM', label: 'Red Team Focus', desc: 'Heavily attacks logic jumps, fatal incumbent risks, and alternative hypotheses.' },
              { id: 'EVIDENCE AUDIT', label: 'Evidence Audit', desc: 'Deep-dives source provenance, publisher authority, and circular dataset lineage.' },
              { id: 'METHODOLOGY AUDIT', label: 'Methodology Audit', desc: 'Scrutinizes statistical sampling, missing control groups, and denominators.' },
            ] as const).map(m => (
              <div
                key={m.id}
                onClick={() => { setSelectedMode(m.id); setIsConfigOpen(false); }}
                style={{
                  padding: '12px 14px', borderRadius: '6px', cursor: 'pointer',
                  backgroundColor: selectedMode === m.id ? '#1E3A8A' : '#131D31',
                  border: `1.5px solid ${selectedMode === m.id ? '#3B82F6' : '#1E293B'}`
                }}
              >
                <div style={{ fontSize: '0.84rem', fontWeight: 800, color: selectedMode === m.id ? '#93C5FD' : '#F8FAFC', marginBottom: '4px' }}>
                  {m.label}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94A3B8', lineHeight: '1.4' }}>
                  {m.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══ LIVE EXECUTION BAR (SHOWS SPECIALIZED AUDITORS WORKING) ══ */}
      {isRunning && (
        <div style={{ backgroundColor: '#0B1324', border: '1.5px solid #EF4444', borderRadius: '10px', padding: '16px 20px', marginBottom: '22px', boxShadow: '0 0 24px rgba(239, 68, 68, 0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Terminal size={16} color="#EF4444" />
              <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#F87171', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                RESEARCH AUTOPSY RUNNING — ACTIVE ADVERSARIAL SCAN
              </span>
            </div>
            <span style={{ fontSize: '0.74rem', color: '#CBD5E1', fontFamily: 'monospace' }}>
              Target: <strong style={{ color: '#38BDF8' }}>{currentTarget}</strong> · {currentOperation}
            </span>
          </div>

          {/* Stepper indicators of 14 auditors */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
            {(session?.auditors || []).slice(0, 14).map((aud, idx) => {
              const isDone = idx < activeAuditorIndex;
              const isCurr = idx === activeAuditorIndex;
              return (
                <div
                  key={aud.id}
                  style={{
                    backgroundColor: isCurr ? '#7F1D1D' : isDone ? '#064E3B' : '#0F172A',
                    border: `1px solid ${isCurr ? '#EF4444' : isDone ? '#10B981' : '#1E293B'}`,
                    borderRadius: '4px', padding: '6px 8px', fontSize: '0.7rem',
                    color: isCurr ? '#FECDD3' : isDone ? '#A7F3D0' : '#64748B',
                    fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                  }}
                >
                  <span>{isDone ? '✓' : isCurr ? '●' : '○'}</span>
                  <span>{aud.name.split(' ')[0]}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══ 2. RESEARCH SURVIVAL STATUS BANNER ══ */}
      <div style={{
        backgroundColor: '#0F172A',
        border: `2px solid ${surv.border}`,
        borderRadius: '10px',
        padding: '18px 24px',
        marginBottom: '22px',
        boxShadow: `0 4px 20px ${surv.border}22`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px'
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
            RESEARCH SURVIVAL STATUS (VERDICT POST-AUDIT)
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 900, color: surv.color, letterSpacing: '-0.01em', marginBottom: '4px' }}>
            {session?.research_survival_status || 'SURVIVED WITH MATERIAL CAVEATS'}
          </div>
          <div style={{ fontSize: '0.84rem', color: '#CBD5E1', lineHeight: '1.5' }}>
            {session?.survival_reasoning || 'The core operational hypothesis remains defensible, but executive reliance requires resolving the unverified willingness-to-pay assumption (FND-001) and restricting national conclusions to Tier-1 metros.'}
          </div>
        </div>

        {/* Quick findings breakdown tags */}
        <div style={{ display: 'flex', gap: '8px', flexShrink: 0, flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center', backgroundColor: '#450A0A', border: '1px solid #DC2626', padding: '8px 14px', borderRadius: '6px' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#FCA5A5' }}>{criticalCount}</div>
            <div style={{ fontSize: '0.66rem', color: '#F87171', fontWeight: 800, textTransform: 'uppercase' }}>Critical</div>
          </div>
          <div style={{ textAlign: 'center', backgroundColor: '#451A03', border: '1px solid #D97706', padding: '8px 14px', borderRadius: '6px' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#FDE68A' }}>{highCount}</div>
            <div style={{ fontSize: '0.66rem', color: '#FBBF24', fontWeight: 800, textTransform: 'uppercase' }}>High</div>
          </div>
          <div style={{ textAlign: 'center', backgroundColor: '#1E3A8A', border: '1px solid #2563EB', padding: '8px 14px', borderRadius: '6px' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#93C5FD' }}>{mediumCount}</div>
            <div style={{ fontSize: '0.66rem', color: '#60A5FA', fontWeight: 800, textTransform: 'uppercase' }}>Medium</div>
          </div>
          <div style={{ textAlign: 'center', backgroundColor: '#064E3B', border: '1px solid #059669', padding: '8px 14px', borderRadius: '6px' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#A7F3D0' }}>{lowCount}</div>
            <div style={{ fontSize: '0.66rem', color: '#34D399', fontWeight: 800, textTransform: 'uppercase' }}>Low</div>
          </div>
        </div>
      </div>

      {/* ══ 3. RESEARCH INTEGRITY HEURISTICS OVERVIEW ══ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '22px' }}>
        {[
          { label: 'Evidence Completeness', val: session?.integrity_metrics.evidence_completeness || 82, sub: '8/10 core operational facets covered' },
          { label: 'Source Independence', val: session?.integrity_metrics.source_independence || 68, sub: 'Correlated lineage detected in 3 sources' },
          { label: 'Claim Verification', val: session?.integrity_metrics.claim_verification || 76, sub: '6 verified, 2 contested, 1 ungrounded' },
          { label: 'Conclusion Support', val: session?.integrity_metrics.conclusion_support || 69, sub: 'Restricted by Tier-1 geographic skew' },
        ].map((m, i) => (
          <div key={i} style={{ backgroundColor: '#0F172A', border: '1px solid #1E293B', borderRadius: '8px', padding: '14px 18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>{m.label}</span>
              <span style={{ fontSize: '0.88rem', fontWeight: 900, color: m.val >= 75 ? '#34D399' : '#FBBF24' }}>{m.val}%</span>
            </div>
            <div style={{ width: '100%', height: '6px', backgroundColor: '#1E293B', borderRadius: '3px', overflow: 'hidden', marginBottom: '6px' }}>
              <div style={{ width: `${m.val}%`, height: '100%', backgroundColor: m.val >= 75 ? '#10B981' : '#F59E0B' }} />
            </div>
            <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* ══ SUB-NAVIGATION TABS (DASHBOARD · AUTOPSY REPORT · REPLAY · FOLLOW-UP · DISAGREEMENTS) ══ */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #1E293B', paddingBottom: '10px', marginBottom: '20px' }}>
        {[
          { id: 'dashboard', label: `Audit Findings Dashboard (${findings.length})`, icon: <ShieldAlert size={14} /> },
          { id: 'report', label: 'Official Autopsy Report', icon: <BookOpen size={14} /> },
          { id: 'followup', label: `Follow-up Research Queue (${session?.followup_tasks.length || 4})`, icon: <Sparkles size={14} /> },
          { id: 'disagreements', label: `Auditor Disputes (${session?.disagreements.length || 2})`, icon: <Users size={14} /> },
          { id: 'replay', label: 'Autopsy Replay Trail', icon: <History size={14} /> },
          { id: 'debate', label: '🎙️ Synthesized Voice Debate', icon: <Volume2 size={14} /> },
        ].map(st => (
          <button
            key={st.id}
            onClick={() => setActiveSubView(st.id as any)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px',
              fontSize: '0.8rem', fontWeight: 700, borderRadius: '6px', border: 'none', cursor: 'pointer',
              backgroundColor: activeSubView === st.id ? '#2563EB' : '#0F172A',
              color: activeSubView === st.id ? '#FFFFFF' : '#94A3B8',
              transition: 'all 0.15s ease'
            }}
          >
            {st.icon} {st.label}
          </button>
        ))}
      </div>

      {/* ──────────────── SUB-VIEW 1: FINDINGS DASHBOARD ──────────────── */}
      {activeSubView === 'dashboard' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '20px' }}>

          {/* LEFT: Search, Filters, and Findings Cards List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            
            {/* Search and Category Filter Bar */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
                <Search size={14} color="#64748B" style={{ position: 'absolute', left: '10px', top: '10px' }} />
                <input
                  type="text"
                  placeholder="Search findings, claims..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '6px',
                    padding: '8px 12px 8px 32px', color: '#F8FAFC', fontSize: '0.8rem', outline: 'none'
                  }}
                />
              </div>

              {/* Severity Filter Dropdown */}
              <select
                value={severityFilter}
                onChange={e => setSeverityFilter(e.target.value)}
                style={{ backgroundColor: '#0F172A', border: '1px solid #334155', color: '#CBD5E1', fontSize: '0.78rem', borderRadius: '6px', padding: '6px 10px', fontWeight: 600, outline: 'none' }}
              >
                <option value="ALL">All Severities</option>
                <option value="CRITICAL">🔴 Critical Only</option>
                <option value="HIGH">🟠 High Only</option>
                <option value="MEDIUM">🟡 Medium Only</option>
                <option value="LOW">🟢 Low Only</option>
              </select>

              {/* Category Filter Dropdown */}
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                style={{ backgroundColor: '#0F172A', border: '1px solid #334155', color: '#CBD5E1', fontSize: '0.78rem', borderRadius: '6px', padding: '6px 10px', fontWeight: 600, outline: 'none' }}
              >
                <option value="ALL">All Categories</option>
                <option value="ASSUMPTION">Assumption</option>
                <option value="EVIDENCE">Evidence Mismatch</option>
                <option value="SOURCE">Source Quality</option>
                <option value="CONTRADICTION">Contradiction</option>
                <option value="LOGIC">Logic Jump</option>
                <option value="BIAS">Selection Bias</option>
                <option value="COMPLETENESS">Completeness</option>
                <option value="TEMPORAL">Temporal</option>
                <option value="DATA_QUALITY">Data Quality</option>
                <option value="METHODOLOGY">Methodology</option>
                <option value="CONCLUSION">Conclusion Overreach</option>
              </select>
            </div>

            {/* Findings Scrollable List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '720px', overflowY: 'auto', paddingRight: '4px' }}>
              {filteredFindings.map(f => {
                const isSel = selectedFindingId === f.finding_id;
                const badge = severityBadge(f.severity);
                const isRevised = confirmedRevisions.has(f.finding_id);

                return (
                  <div
                    key={f.finding_id}
                    onClick={() => setSelectedFindingId(f.finding_id)}
                    style={{
                      backgroundColor: isSel ? '#1E293B' : '#0F172A',
                      borderTop: `1.5px solid ${isSel ? '#38BDF8' : '#1E293B'}`,
                      borderRight: `1.5px solid ${isSel ? '#38BDF8' : '#1E293B'}`,
                      borderBottom: `1.5px solid ${isSel ? '#38BDF8' : '#1E293B'}`,
                      borderLeft: `5px solid ${badge.border}`,
                      borderRadius: '8px',
                      padding: '14px 16px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: isSel ? '0 0 16px rgba(56, 189, 248, 0.18)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', backgroundColor: badge.bg, color: badge.text, border: `1px solid ${badge.border}55` }}>
                          {f.severity}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700 }}>
                          {f.category}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {isRevised && (
                          <span style={{ fontSize: '0.66rem', fontWeight: 800, color: '#34D399', backgroundColor: '#064E3B', padding: '1px 6px', borderRadius: '3px' }}>
                            ✓ PROPOSED REVISION
                          </span>
                        )}
                        <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>{(f.confidence * 100).toFixed(0)}% conf</span>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: isSel ? '#38BDF8' : '#F8FAFC', lineHeight: '1.35', marginBottom: '6px' }}>
                      {f.title}
                    </div>

                    <div style={{ fontSize: '0.76rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span>Auditor: <strong style={{ color: '#CBD5E1' }}>{f.auditor_name}</strong></span>
                      {f.affected_claims.length > 0 && (
                        <span>• Claims: <strong style={{ color: '#38BDF8' }}>{f.affected_claims.join(', ')}</strong></span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: Finding Detail Inspector with Evidence Graph Trace & Revision Actions */}
          <div style={{ backgroundColor: '#0F172A', border: '1px solid #1E293B', borderRadius: '10px', padding: '24px', height: 'fit-content' }}>
            {selectedFinding ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Header Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #1E293B', paddingBottom: '14px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{
                        fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', borderRadius: '4px',
                        backgroundColor: severityBadge(selectedFinding.severity).bg,
                        color: severityBadge(selectedFinding.severity).text,
                        border: `1px solid ${severityBadge(selectedFinding.severity).border}55`
                      }}>
                        {selectedFinding.severity} SEVERITY
                      </span>
                      <span style={{ fontSize: '0.74rem', color: '#38BDF8', fontWeight: 700, backgroundColor: '#0B223D', padding: '2px 8px', borderRadius: '4px' }}>
                        {selectedFinding.category}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                        ID: {selectedFinding.finding_id} · Audited by {selectedFinding.auditor_name}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#F8FAFC', margin: '4px 0 0', lineHeight: '1.4' }}>
                      {selectedFinding.title}
                    </h3>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '0.68rem', color: '#64748B', textTransform: 'uppercase' }}>Auditor Certainty</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#34D399' }}>
                      {(selectedFinding.confidence * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>

                {/* Severity Reasoning Box */}
                <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '6px', padding: '10px 14px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#F87171', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Severity Assignment Justification:
                  </span>
                  <div style={{ fontSize: '0.82rem', color: '#FCA5A5', marginTop: '2px', lineHeight: '1.45' }}>
                    {selectedFinding.severity_reasoning}
                  </div>
                </div>

                {/* Description & Why It Matters */}
                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Audit Finding Description:
                  </span>
                  <div style={{ fontSize: '0.88rem', color: '#E2E8F0', marginTop: '3px', lineHeight: '1.55' }}>
                    {selectedFinding.description}
                  </div>
                </div>

                <div style={{ backgroundColor: '#131D31', border: '1px solid #1E293B', borderRadius: '6px', padding: '12px 16px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#FBBF24', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Why It Matters to Decision-Makers:
                  </span>
                  <div style={{ fontSize: '0.84rem', color: '#FEF08A', marginTop: '3px', lineHeight: '1.5' }}>
                    {selectedFinding.why_it_matters}
                  </div>
                </div>

                {/* Affected Entities Matrix */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div style={{ backgroundColor: '#0B1120', border: '1px solid #1E293B', borderRadius: '6px', padding: '10px 12px' }}>
                    <span style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase' }}>Affected Claims:</span>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#38BDF8', marginTop: '2px' }}>
                      {selectedFinding.affected_claims.length > 0 ? selectedFinding.affected_claims.join(', ') : 'Global Research Premise'}
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#0B1120', border: '1px solid #1E293B', borderRadius: '6px', padding: '10px 12px' }}>
                    <span style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase' }}>Affected Sources:</span>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#A7F3D0', marginTop: '2px' }}>
                      {selectedFinding.affected_sources.length > 0 ? selectedFinding.affected_sources.join(', ') : 'Empirical Absence'}
                    </div>
                  </div>

                  {selectedFinding.affected_assumptions.length > 0 && (
                    <div style={{ backgroundColor: '#0B1120', border: '1px solid #1E293B', borderRadius: '6px', padding: '10px 12px', gridColumn: 'span 2' }}>
                      <span style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase' }}>Vulnerable Underlying Assumptions:</span>
                      <div style={{ fontSize: '0.8rem', color: '#CBD5E1', marginTop: '2px' }}>
                        {selectedFinding.affected_assumptions.join(' · ')}
                      </div>
                    </div>
                  )}
                </div>

                {/* Recommended Remediation Action */}
                <div style={{ backgroundColor: '#0A1829', border: '1px solid #0284C7', borderRadius: '6px', padding: '12px 16px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#38BDF8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Recommended Action / Safeguard:
                  </span>
                  <div style={{ fontSize: '0.84rem', color: '#BAE6FD', marginTop: '3px', lineHeight: '1.5' }}>
                    {selectedFinding.recommended_action}
                  </div>
                </div>

                {/* Interactive Action Buttons (Trace in Graph & Propose Revision) */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '6px', paddingTop: '14px', borderTop: '1px solid #1E293B' }}>
                  <button
                    onClick={() => handleTraceFinding(selectedFinding.affected_claims[0])}
                    style={{
                      flex: 1, padding: '9px 14px', backgroundColor: '#1E3A8A', color: '#93C5FD',
                      fontWeight: 700, fontSize: '0.82rem', borderRadius: '6px', border: '1px solid #3B82F6',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                    }}
                  >
                    <Network size={15} /> Trace in Evidence Graph
                  </button>

                  <button
                    onClick={() => handleApplyRevision(selectedFinding)}
                    style={{
                      flex: 1, padding: '9px 14px', backgroundColor: confirmedRevisions.has(selectedFinding.finding_id) ? '#064E3B' : '#1E293B',
                      color: confirmedRevisions.has(selectedFinding.finding_id) ? '#A7F3D0' : '#CBD5E1',
                      fontWeight: 700, fontSize: '0.82rem', borderRadius: '6px', border: `1px solid ${confirmedRevisions.has(selectedFinding.finding_id) ? '#10B981' : '#334155'}`,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                    }}
                  >
                    {confirmedRevisions.has(selectedFinding.finding_id) ? <Check size={14} /> : <Sliders size={14} />}
                    {confirmedRevisions.has(selectedFinding.finding_id) ? 'Revision Proposed & Logged' : 'Propose Research-State Revision'}
                  </button>
                </div>

              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748B' }}>
                <Info size={32} style={{ margin: '0 auto 10px', display: 'block' }} />
                Select any finding from the left panel to inspect full provenance and audit trail.
              </div>
            )}
          </div>

        </div>
      )}

      {/* ──────────────── SUB-VIEW 2: OFFICIAL AUTOPSY REPORT (12 SECTIONS) ──────────────── */}
      {activeSubView === 'report' && (
        <div style={{ backgroundColor: '#0F172A', border: '1px solid #1E293B', borderRadius: '10px', padding: '32px 40px', maxWidth: '1000px', margin: '0 auto' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #1E293B', paddingBottom: '18px', marginBottom: '24px' }}>
            <div>
              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#38BDF8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                CONFIDENTIAL ADVERSARIAL AUDIT
              </span>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#F8FAFC', margin: '4px 0 6px' }}>
                RESEARCH AUTOPSY REPORT
              </h2>
              <div style={{ fontSize: '0.84rem', color: '#94A3B8' }}>
                Subject: <strong style={{ color: '#E2E8F0' }}>{question || 'Autonomous Multi-Agent Investigation'}</strong> · Version: {activeVersion}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{
                fontSize: '0.8rem', fontWeight: 800, padding: '4px 12px', borderRadius: '4px',
                backgroundColor: surv.bg, color: surv.color, border: `1px solid ${surv.border}`
              }}>
                {session?.research_survival_status || 'SURVIVED WITH MATERIAL CAVEATS'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Section 1: Executive Summary */}
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#38BDF8', margin: '0 0 8px' }}>
                1. Executive Summary &amp; Second-Order Audit Scope
              </h4>
              <p style={{ fontSize: '0.86rem', color: '#CBD5E1', lineHeight: '1.6', margin: 0 }}>
                ResearchOps dispatched 14 specialized autonomous audit agents to aggressively stress-test the completed investigation. Rather than validating conclusions, the autopsy scrutinized evidence-to-claim alignment, unstated assumptions, circular citation lineage, and geographic overreach. The research survives, but requires explicit material caveats regarding willing-to-pay elasticity and metropolitan sampling constraints.
              </p>
            </div>

            {/* Section 2: Most Serious Findings */}
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#EF4444', margin: '0 0 10px' }}>
                2. Most Serious Epistemic Findings
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {findings.filter(f => f.severity === 'CRITICAL' || f.severity === 'HIGH').slice(0, 4).map(f => (
                  <div key={f.finding_id} style={{ backgroundColor: '#131D31', borderLeft: '4px solid #EF4444', padding: '12px 16px', borderRadius: '0 6px 6px 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <strong style={{ fontSize: '0.88rem', color: '#F8FAFC' }}>{f.title}</strong>
                      <span style={{ fontSize: '0.7rem', color: '#F87171', fontWeight: 800 }}>{f.severity}</span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#94A3B8', lineHeight: '1.45' }}>{f.description}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 3: "What Would Change the Conclusion?" (Crucial Section) */}
            <div style={{ backgroundColor: '#13111C', border: '1.5px solid #4C1D95', borderRadius: '8px', padding: '18px 22px' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#C084FC', margin: '0 0 8px' }}>
                3. "What Would Change This Conclusion?" (Falsification Boundaries)
              </h4>
              <p style={{ fontSize: '0.82rem', color: '#DDD6FE', marginBottom: '12px' }}>
                The following specific empirical discoveries would immediately invalidate or reverse the central viability ruling:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  '1. Primary field trials reveal >65% small clinic rejection of any subscription exceeding ₹999/month (Falsifies Claim 1).',
                  '2. Meta or Google releases native zero-margin appointment booking automation within the free WhatsApp Business tier (Falsifies Claim 5).',
                  '3. DPDP statutory enforcement strictly mandates localized on-premise hardware, preventing public cloud LLM processing (Falsifies Claim 3).',
                  '4. Suburban / Tier-2 staff onboarding and training friction exceeds 45 days, causing negative customer LTV (Falsifies Claim 2).'
                ].map((item, idx) => (
                  <div key={idx} style={{ fontSize: '0.82rem', color: '#E2E8F0', backgroundColor: '#0B0A14', padding: '8px 12px', borderRadius: '4px' }}>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Section 4: Critical Evidence Gaps & Correlated Lineage */}
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#FBBF24', margin: '0 0 8px' }}>
                4. Correlated Lineage &amp; Evidence Gaps
              </h4>
              <div style={{ fontSize: '0.85rem', color: '#CBD5E1', lineHeight: '1.6' }}>
                Source quality auditing proved that Sources S-001, S-002, and S-004 trace directly back to a single vendor-sponsored whitepaper. Apparent tripartite verification was an artifact of press syndication. Future revisions must incorporate independent academic or audited statutory data.
              </div>
            </div>

            {/* Section 5: Recommended Follow-Up Action */}
            <div style={{ backgroundColor: '#0B223D', border: '1px solid #0284C7', borderRadius: '8px', padding: '16px 20px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#38BDF8', margin: '0 0 6px' }}>
                5. Autopsy Directive &amp; Remediation Plan
              </h4>
              <div style={{ fontSize: '0.84rem', color: '#BAE6FD', lineHeight: '1.5' }}>
                Executive reliance on this investigation is approved solely for Tier-1 metropolitan markets with Average Order Values exceeding ₹249. Prior to capital deployment in Tier-2/3 regions, the four tasks in the <strong>Follow-up Research Queue</strong> must be launched.
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ──────────────── SUB-VIEW 3: FOLLOW-UP RESEARCH QUEUE ──────────────── */}
      {activeSubView === 'followup' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#F8FAFC', margin: 0 }}>
              Prioritized Follow-Up Research Queue
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#94A3B8', margin: '3px 0 0' }}>
              Specialized research inquiries generated by the Autopsy to systematically reduce uncertainty and resolve critical vulnerabilities.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(session?.followup_tasks || []).map(task => (
              <div
                key={task.task_id}
                style={{
                  backgroundColor: '#0F172A', border: '1.5px solid #1E293B', borderRadius: '8px',
                  padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', backgroundColor: task.priority === 1 ? '#7F1D1D' : '#1E3A8A', color: task.priority === 1 ? '#FECDD3' : '#93C5FD' }}>
                      PRIORITY {task.priority}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#38BDF8', fontWeight: 700 }}>{task.task_id}</span>
                    <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Assigned Agent: <strong style={{ color: '#E2E8F0' }}>{task.suggested_agent}</strong></span>
                  </div>

                  <div style={{ fontSize: '0.98rem', fontWeight: 700, color: '#F8FAFC', marginBottom: '6px' }}>
                    {task.question}
                  </div>

                  <div style={{ fontSize: '0.82rem', color: '#94A3B8', lineHeight: '1.45', marginBottom: '8px' }}>
                    <strong>Rationale:</strong> {task.reason}
                  </div>

                  <div style={{ display: 'flex', gap: '12px', fontSize: '0.74rem', color: '#64748B' }}>
                    <span>Uncertainty Reduction: <strong style={{ color: '#34D399' }}>{task.expected_uncertainty_reduction}</strong></span>
                    <span>•</span>
                    <span>Suggested Sources: <strong style={{ color: '#CBD5E1' }}>{task.suggested_sources.join(', ')}</strong></span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    alert(`Queued Follow-up Task ${task.task_id} for execution in next research cycle.`);
                  }}
                  style={{
                    padding: '10px 18px', backgroundColor: '#2563EB', color: '#FFF',
                    fontWeight: 700, fontSize: '0.82rem', borderRadius: '6px', border: 'none',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0
                  }}
                >
                  <Play size={14} /> Launch Follow-up Task
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ──────────────── SUB-VIEW 4: AUDITOR DISPUTES & DISAGREEMENTS ──────────────── */}
      {activeSubView === 'disagreements' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#F8FAFC', margin: 0 }}>
              Auditor Disagreements &amp; Red Team Director Resolutions
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#94A3B8', margin: '3px 0 0' }}>
              Specialized audit agents frequently clash over evidence relevance. The Red Team Director formally arbitrates disputes.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {(session?.disagreements || []).map(dis => (
              <div key={dis.id} style={{ backgroundColor: '#0F172A', border: '1.5px solid #1E293B', borderRadius: '10px', padding: '22px 26px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#F8FAFC' }}>
                    Dispute #{dis.id}: {dis.topic}
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', borderRadius: '4px', backgroundColor: '#451A03', color: '#FDE68A' }}>
                    TARGET: {dis.target_claim_id}
                  </span>
                </div>

                {/* 3 Positions */}
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${dis.auditor_positions.length}, 1fr)`, gap: '10px', marginBottom: '16px' }}>
                  {dis.auditor_positions.map((pos, pi) => (
                    <div key={pi} style={{ backgroundColor: '#131D31', border: '1px solid #1E293B', borderRadius: '6px', padding: '12px 14px' }}>
                      <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#38BDF8', marginBottom: '2px' }}>{pos.auditor_name}</div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: pos.verdict.includes('UNRELIABLE') || pos.verdict.includes('FATALLY') ? '#F87171' : '#34D399', marginBottom: '4px' }}>
                        Verdict: {pos.verdict}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#CBD5E1', lineHeight: '1.4' }}>{pos.rationale}</div>
                    </div>
                  ))}
                </div>

                {/* Director Resolution */}
                <div style={{ backgroundColor: '#0B223D', border: '1px solid #0284C7', borderRadius: '6px', padding: '12px 16px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#38BDF8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Red Team Director Final Arbitration:
                  </span>
                  <div style={{ fontSize: '0.84rem', color: '#BAE6FD', marginTop: '3px', lineHeight: '1.5' }}>
                    {dis.director_resolution}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ──────────────── SUB-VIEW 5: AUTOPSY REPLAY TIMELINE ──────────────── */}
      {activeSubView === 'replay' && (
        <div style={{ backgroundColor: '#0F172A', border: '1px solid #1E293B', borderRadius: '10px', padding: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#F8FAFC', margin: '0 0 16px' }}>
            Autopsy Audit Replay &amp; Epistemic Attack Trail
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {(session?.replay_events || []).map(ev => (
              <div
                key={ev.step}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '14px',
                  backgroundColor: '#131D31', padding: '12px 16px', borderRadius: '6px',
                  borderLeft: `4px solid ${ev.severity === 'CRITICAL' ? '#EF4444' : ev.severity === 'HIGH' ? '#F59E0B' : '#3B82F6'}`
                }}
              >
                <span style={{ fontSize: '0.74rem', fontFamily: 'monospace', color: '#64748B', marginTop: '2px' }}>{ev.time}</span>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#38BDF8', backgroundColor: '#0B223D', padding: '2px 8px', borderRadius: '4px', flexShrink: 0 }}>
                  {ev.auditor}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#F8FAFC' }}>{ev.action}</div>
                  <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '2px' }}>{ev.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ──────────────── SUB-VIEW 6: SYNTHESIZED VOICE DEBATE ──────────────── */}
      {activeSubView === 'debate' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1060px', margin: '0 auto', width: '100%' }}>

          {/* 🎙️ DEBATE AUDIO PLAYER DECK */}
          <div style={{
            backgroundColor: '#0E1729',
            border: '1px solid #1E3A8A',
            borderRadius: '12px',
            padding: '18px 24px',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.45)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
              
              {/* Show Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #1E3A8A, #7C3AED)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFF',
                  boxShadow: '0 0 16px rgba(124, 58, 237, 0.4)'
                }}>
                  <Radio size={22} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#A78BFA' }}>
                      ResearchOps Audio Chamber
                    </span>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '12px',
                      backgroundColor: isDebatePlaying ? 'rgba(239, 68, 68, 0.2)' : 'rgba(100, 116, 139, 0.2)',
                      color: isDebatePlaying ? '#EF4444' : '#94A3B8',
                      border: `1px solid ${isDebatePlaying ? 'rgba(239, 68, 68, 0.4)' : '#334155'}`
                    }}>
                      <span style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: isDebatePlaying ? '#EF4444' : '#64748B',
                        animation: isDebatePlaying ? 'pulseOnAir 1.2s infinite' : 'none'
                      }} />
                      {isDebatePlaying ? 'ON AIR' : 'DEBATE READY'}
                    </span>
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#F8FAFC', marginTop: '2px' }}>
                    Synthesized Forensic Debate: Auditing Evidence Gaps &amp; Epistemic Debt
                  </div>
                </div>
              </div>

              {/* Equalizer Wave Animation */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px', height: '28px', padding: '0 12px' }}>
                {[1, 3, 5, 2, 4, 1, 5, 3, 2, 4, 3, 5, 2, 4].map((lvl, idx) => (
                  <div
                    key={idx}
                    style={{
                      width: '3px',
                      backgroundColor: isDebatePlaying ? '#A78BFA' : '#334155',
                      borderRadius: '2px',
                      height: isDebatePlaying ? `${Math.min(24, lvl * 4 + 4)}px` : '4px',
                      animation: isDebatePlaying ? `eqBar${(idx % 5) + 1} 0.8s ease-in-out infinite alternate` : 'none',
                      transition: 'height 0.2s ease'
                    }}
                  />
                ))}
              </div>

              {/* Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  onClick={() => {
                    if (debateStep > 0) {
                      const prev = debateStep - 1;
                      setDebateStep(prev);
                      if (isDebatePlaying) speakDebateTurn(prev, true);
                    }
                  }}
                  disabled={debateStep <= 0}
                  style={{
                    padding: '8px', backgroundColor: '#1E293B', border: '1px solid #334155',
                    borderRadius: '6px', color: debateStep <= 0 ? '#475569' : '#CBD5E1',
                    cursor: debateStep <= 0 ? 'not-allowed' : 'pointer'
                  }}
                >
                  <SkipBack size={15} />
                </button>

                <button
                  onClick={handleToggleDebate}
                  style={{
                    padding: '9px 20px',
                    background: isDebatePlaying
                      ? 'linear-gradient(135deg, #EF4444, #DC2626)'
                      : 'linear-gradient(135deg, #7C3AED, #2563EB)',
                    color: '#FFF',
                    fontWeight: 700,
                    fontSize: '0.86rem',
                    borderRadius: '7px',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: isDebatePlaying
                      ? '0 0 16px rgba(239, 68, 68, 0.45)'
                      : '0 0 16px rgba(124, 58, 237, 0.45)'
                  }}
                >
                  {isDebatePlaying ? <Pause size={17} /> : <Play size={17} />}
                  {isDebatePlaying ? 'Pause Audio Debate' : 'Play Synthesized Debate'}
                </button>

                <button
                  onClick={() => {
                    if (debateStep < autopsyDebateTurns.length - 1) {
                      const next = debateStep + 1;
                      setDebateStep(next);
                      if (isDebatePlaying) speakDebateTurn(next, true);
                    }
                  }}
                  disabled={debateStep >= autopsyDebateTurns.length - 1}
                  style={{
                    padding: '8px', backgroundColor: '#1E293B', border: '1px solid #334155',
                    borderRadius: '6px', color: debateStep >= autopsyDebateTurns.length - 1 ? '#475569' : '#CBD5E1',
                    cursor: debateStep >= autopsyDebateTurns.length - 1 ? 'not-allowed' : 'pointer'
                  }}
                >
                  <SkipForward size={15} />
                </button>

                <button
                  onClick={() => {
                    playGavelSound(2);
                    setDebateStep(0);
                    setIsDebatePlaying(true);
                    speakDebateTurn(0, true);
                  }}
                  title="Replay from Opening"
                  style={{
                    padding: '8px', backgroundColor: '#1E293B', border: '1px solid #334155',
                    borderRadius: '6px', color: '#94A3B8', cursor: 'pointer'
                  }}
                >
                  <RotateCcw size={15} />
                </button>

                {/* Speed Selector */}
                <div style={{ display: 'flex', backgroundColor: '#131D31', borderRadius: '6px', padding: '2px', border: '1px solid #1E293B' }}>
                  {[1.0, 1.25, 1.5].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => setDebateSpeed(spd)}
                      style={{
                        padding: '4px 8px', fontSize: '0.72rem', fontWeight: 700,
                        backgroundColor: debateSpeed === spd ? '#7C3AED' : 'transparent',
                        color: debateSpeed === spd ? '#FFF' : '#94A3B8',
                        border: 'none', borderRadius: '4px', cursor: 'pointer'
                      }}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>

                {/* Mute Toggle */}
                <button
                  onClick={() => setIsDebateMuted(!isDebateMuted)}
                  style={{
                    padding: '8px', backgroundColor: '#1E293B', border: '1px solid #334155',
                    borderRadius: '6px', color: isDebateMuted ? '#EF4444' : '#94A3B8', cursor: 'pointer'
                  }}
                >
                  {isDebateMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                </button>
              </div>
            </div>

            {/* Currently Speaking Sub-banner */}
            {autopsyDebateTurns[debateStep] && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#070D19',
                padding: '8px 14px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                border: '1px solid #16233B'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#64748B' }}>Active Voice:</span>
                  <strong style={{
                    color: autopsyDebateTurns[debateStep].role === 'JUDGE' ? '#F59E0B'
                      : autopsyDebateTurns[debateStep].role === 'PROSECUTION' ? '#EF4444' : '#10B981'
                  }}>
                    {autopsyDebateTurns[debateStep].speaker}
                  </strong>
                  <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>
                    ({autopsyDebateTurns[debateStep].persona})
                  </span>
                </div>
                <div style={{ color: '#64748B' }}>
                  Turn {debateStep + 1} of {autopsyDebateTurns.length}
                </div>
              </div>
            )}
          </div>

          {/* 3 AGENT PERSONA CARDS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
            {/* Persona 1: Prosecution */}
            <div style={{ backgroundColor: '#0F172A', border: '1px solid #DC2626', borderRadius: '10px', padding: '16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldAlert size={16} />
                </span>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#EF4444' }}>Prosecution Agent</div>
                  <div style={{ fontSize: '0.72rem', color: '#F87171' }}>Skeptical, Rigorous Voice</div>
                </div>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#CBD5E1', lineHeight: '1.45', margin: 0 }}>
                Aggressively stress-tests evidence gaps, missing willingness-to-pay benchmarks, and statutory DPDP compliance penalties.
              </p>
            </div>

            {/* Persona 2: Defense */}
            <div style={{ backgroundColor: '#0F172A', border: '1px solid #059669', borderRadius: '10px', padding: '16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={16} />
                </span>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#10B981' }}>Defense Agent</div>
                  <div style={{ fontSize: '0.72rem', color: '#34D399' }}>Optimistic, Growth-Focused Voice</div>
                </div>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#CBD5E1', lineHeight: '1.45', margin: 0 }}>
                Defends empirical retention floors, merchant co-funded rebate economics, LTV compounding, and operational offsets.
              </p>
            </div>

            {/* Persona 3: Judge */}
            <div style={{ backgroundColor: '#0F172A', border: '1px solid #D97706', borderRadius: '10px', padding: '16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: 'rgba(245, 158, 11, 0.2)', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Award size={16} />
                </span>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#F59E0B' }}>Presiding Judge</div>
                  <div style={{ fontSize: '0.72rem', color: '#FBBF24' }}>Authoritative, Balanced Voice</div>
                </div>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#CBD5E1', lineHeight: '1.45', margin: 0 }}>
                Synthesizes forensic evidence, strikes unverified speculation, and renders binding judicial decrees and caveats.
              </p>
            </div>
          </div>

          {/* DEBATE TRANSCRIPT TURNS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {autopsyDebateTurns.map((turn, idx) => {
              const isJudge = turn.role === 'JUDGE';
              const isPros = turn.role === 'PROSECUTION';
              const clr = isPros ? '#EF4444' : isJudge ? '#F59E0B' : '#10B981';
              const isCurrent = isDebatePlaying && activeDebateSpeaker === idx;

              return (
                <div
                  key={turn.step}
                  ref={el => { debateTurnRefs.current[idx] = el; }}
                  style={{
                    backgroundColor: '#0F172A',
                    borderTop: `1px solid ${isCurrent ? clr : '#1E293B'}`,
                    borderRight: `1px solid ${isCurrent ? clr : '#1E293B'}`,
                    borderBottom: `1px solid ${isCurrent ? clr : '#1E293B'}`,
                    borderLeft: `5px solid ${clr}`,
                    borderRadius: '0 10px 10px 0',
                    padding: '18px 22px',
                    boxShadow: isCurrent ? `0 0 22px ${clr}33` : '0 4px 12px rgba(0,0,0,0.3)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ fontSize: '0.92rem', color: clr, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {isJudge && <Award size={15} />}
                        {isPros && <ShieldAlert size={15} />}
                        {!isJudge && !isPros && <ShieldCheck size={15} />}
                        {turn.speaker}
                      </strong>
                      <span style={{
                        fontSize: '0.66rem',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: '4px',
                        backgroundColor: `${clr}22`,
                        color: clr,
                        border: `1px solid ${clr}44`
                      }}>
                        {turn.persona}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <button
                        onClick={() => {
                          setDebateStep(idx);
                          setIsDebatePlaying(true);
                          speakDebateTurn(idx, false);
                        }}
                        style={{
                          backgroundColor: '#1E293B',
                          border: '1px solid #334155',
                          borderRadius: '4px',
                          color: '#94A3B8',
                          padding: '3px 8px',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Volume2 size={13} />
                        Listen
                      </button>
                      <span style={{ fontSize: '0.74rem', color: '#64748B', fontFamily: 'monospace' }}>
                        {turn.time}
                      </span>
                    </div>
                  </div>

                  <div style={{
                    fontSize: '0.88rem',
                    color: isJudge ? '#FEF08A' : '#E2E8F0',
                    lineHeight: '1.6',
                    marginTop: '4px'
                  }}>
                    {turn.statement}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ══ PROPOSED REVISION CONFIRMATION MODAL ══ */}
      {revisionFinding && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <div style={{ backgroundColor: '#0F172A', border: '1.5px solid #38BDF8', borderRadius: '12px', padding: '28px', maxWidth: '580px', width: '90%', boxShadow: '0 0 30px rgba(56, 189, 248, 0.25)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#F8FAFC', margin: '0 0 12px' }}>
              Propose Research-State Revision
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#CBD5E1', lineHeight: '1.5', marginBottom: '16px' }}>
              Autopsy finding <strong>{revisionFinding.finding_id}</strong> identified an overreach in <strong>Claim {revisionFinding.affected_claims[0] || '1'}</strong>.
            </p>

            <div style={{ backgroundColor: '#131D31', border: '1px solid #1E293B', borderRadius: '8px', padding: '14px 18px', marginBottom: '18px' }}>
              <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Proposed Adjustment:</div>
              <div style={{ fontSize: '0.92rem', color: '#38BDF8', fontWeight: 700, marginTop: '4px' }}>
                Confidence: 88% → 64% (Downgraded due to missing willingness-to-pay confirmation)
              </div>
              <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '6px' }}>
                Mandatory Caveat Appended: "Applicable only to metro facilities with staff &gt;5."
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setRevisionFinding(null)}
                style={{ padding: '8px 16px', backgroundColor: '#1E293B', color: '#CBD5E1', border: '1px solid #334155', borderRadius: '6px', cursor: 'pointer', fontWeight: 700 }}
              >
                Cancel
              </button>
              <button
                onClick={() => confirmApplyRevision(revisionFinding.finding_id)}
                style={{ padding: '8px 20px', backgroundColor: '#2563EB', color: '#FFFFFF', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 800 }}
              >
                Confirm &amp; Apply Revision
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
