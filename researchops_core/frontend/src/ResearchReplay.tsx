import { useState, useEffect, useMemo } from 'react';
import {
  Play, Pause, RotateCcw, FastForward, History,
  ChevronLeft, ChevronRight, ShieldAlert,
  CheckCircle2, Compass, Award, Sparkles
} from 'lucide-react';
import type { AgentMessage } from './types';

export interface ReplayEvent {
  id: string;
  step: number;
  time: string;
  actor: string;
  action: string;
  details: string;
  category: 'PLAN' | 'DISCOVERY' | 'CHALLENGE' | 'VERIFICATION' | 'JUDICIAL';
}

interface ResearchReplayProps {
  liveMessages?: AgentMessage[];
}

export function ResearchReplay({ liveMessages = [] }: ResearchReplayProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const timeline: ReplayEvent[] = useMemo(() => {
    return liveMessages.map((m, idx) => ({
      id: m.id || `msg_${idx}`,
      step: idx + 1,
      time: m.timestamp || `18:0${Math.floor(idx / 2)}:${String((idx * 7) % 60).padStart(2, '0')}`,
      actor: m.sender,
      action: m.summary,
      details: m.content || m.summary,
      category: m.type === 'CHALLENGE'
        ? 'CHALLENGE'
        : m.type === 'VERIFICATION_RESULT'
        ? 'VERIFICATION'
        : m.type === 'TASK_COMPLETED' || m.type === 'FINAL_DECISION'
        ? 'JUDICIAL'
        : idx === 0
        ? 'PLAN'
        : 'DISCOVERY'
    }));
  }, [liveMessages]);

  const [currentStep, setCurrentStep] = useState<number>(timeline.length || 1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (timeline.length > 0) {
      setCurrentStep(timeline.length);
    }
  }, [timeline.length]);

  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= timeline.length) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1400);
    }
    return () => clearInterval(timer);
  }, [isPlaying, timeline.length]);

  if (timeline.length === 0) {
    return (
      <div style={{ flex: 1, padding: '40px', backgroundColor: '#070B14', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ backgroundColor: '#0F172A', border: '1px solid #1E293B', borderRadius: '14px', padding: '48px 56px', maxWidth: '680px', textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '12px', backgroundColor: '#0B223D', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', border: '1px solid #0284C7' }}>
            <History size={30} color="#38BDF8" />
          </div>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#F8FAFC', marginBottom: '10px' }}>
            Research Replay Awaiting Autonomous Execution
          </h3>
          <p style={{ fontSize: '0.92rem', color: '#94A3B8', lineHeight: '1.65', margin: '0 0 24px' }}>
            When you launch an inquiry in <strong>1. Workflow &amp; Planner</strong>, every turn taken by the specialized agents is recorded here chronologically. You can then play back the debate step-by-step, inspect adversary challenges, and review each verification ruling.
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#64748B', backgroundColor: '#131D31', padding: '8px 16px', borderRadius: '8px', border: '1px solid #1E293B' }}>
            <span>Awaiting live agent events</span>
          </div>
        </div>
      </div>
    );
  }

  const currentEvent = timeline[Math.min(currentStep - 1, timeline.length - 1)];

  const catMeta = (cat: string) => {
    switch (cat) {
      case 'CHALLENGE':
        return { color: '#EF4444', bg: '#450A0A', border: '#DC2626', icon: <ShieldAlert size={14} color="#EF4444" />, label: 'Adversarial Attack' };
      case 'VERIFICATION':
        return { color: '#10B981', bg: '#064E3B', border: '#059669', icon: <CheckCircle2 size={14} color="#10B981" />, label: 'Source Verification' };
      case 'JUDICIAL':
        return { color: '#F59E0B', bg: '#451A03', border: '#D97706', icon: <Award size={14} color="#F59E0B" />, label: 'Judicial Verdict' };
      case 'PLAN':
        return { color: '#8B5CF6', bg: '#2E1065', border: '#7C3AED', icon: <Compass size={14} color="#8B5CF6" />, label: 'Strategic Plan' };
      default:
        return { color: '#38BDF8', bg: '#0C2A4D', border: '#0284C7', icon: <Sparkles size={14} color="#38BDF8" />, label: 'Evidence Discovery' };
    }
  };

  const filteredTimeline = timeline.filter(ev => {
    if (selectedCategory === 'ALL') return true;
    return ev.category === selectedCategory;
  });

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const handleNext = () => {
    setCurrentStep(prev => Math.min(timeline.length, prev + 1));
  };

  const handleRestart = () => {
    setCurrentStep(1);
    setIsPlaying(true);
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#070B14', color: '#E2E8F0', overflow: 'hidden' }}>

      {/* ══ TOP CONTROL & SCRUBBER BAR ══ */}
      <div style={{ padding: '16px 32px', backgroundColor: '#0B1120', borderBottom: '1px solid #1E293B', display: 'flex', flexDirection: 'column', gap: '14px', flexShrink: 0 }}>
        
        {/* Row 1: Title + Action Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#1E3A8A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <History size={18} color="#60A5FA" />
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#F8FAFC', margin: 0, letterSpacing: '-0.02em' }}>
                Epistemic Replay Timeline
              </h2>
              <span style={{ fontSize: '0.74rem', fontWeight: 700, padding: '3px 9px', borderRadius: '4px', backgroundColor: '#131D31', color: '#93C5FD', border: '1px solid #1E293B' }}>
                Step {currentStep} of {timeline.length}
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#94A3B8', margin: '4px 0 0' }}>
              Sequential playback of how hypotheses were proposed, attacked by red-team agents, and judicially verified.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handlePrev}
              disabled={currentStep <= 1}
              style={{
                padding: '7px 12px', backgroundColor: '#131D31', color: currentStep <= 1 ? '#475569' : '#CBD5E1',
                borderRadius: '6px', border: '1px solid #334155', cursor: currentStep <= 1 ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 700
              }}
              title="Step Backward"
            >
              <ChevronLeft size={16} /> Prev
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              style={{
                padding: '7px 16px', backgroundColor: isPlaying ? '#DC2626' : '#2563EB', color: '#FFFFFF',
                borderRadius: '6px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center',
                gap: '7px', fontSize: '0.82rem', fontWeight: 700, boxShadow: isPlaying ? '0 0 14px rgba(220,38,38,0.4)' : '0 0 14px rgba(37,99,235,0.4)'
              }}
            >
              {isPlaying ? <Pause size={15} /> : <Play size={15} />}
              {isPlaying ? 'Pause' : 'Play Timeline'}
            </button>

            <button
              onClick={handleNext}
              disabled={currentStep >= timeline.length}
              style={{
                padding: '7px 12px', backgroundColor: '#131D31', color: currentStep >= timeline.length ? '#475569' : '#CBD5E1',
                borderRadius: '6px', border: '1px solid #334155', cursor: currentStep >= timeline.length ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 700
              }}
              title="Step Forward"
            >
              Next <ChevronRight size={16} />
            </button>

            <button
              onClick={handleRestart}
              style={{
                padding: '7px 12px', backgroundColor: '#131D31', color: '#94A3B8',
                borderRadius: '6px', border: '1px solid #334155', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', fontWeight: 600
              }}
              title="Restart from Step 1"
            >
              <RotateCcw size={14} /> Restart
            </button>

            <button
              onClick={() => setCurrentStep(timeline.length)}
              style={{
                padding: '7px 14px', backgroundColor: '#1E293B', color: '#38BDF8',
                borderRadius: '6px', border: '1px solid #334155', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', fontWeight: 700
              }}
              title="Jump to Final Ruling"
            >
              <FastForward size={14} /> End
            </button>
          </div>
        </div>

        {/* Row 2: Visual Scrubber Bar with Step Nodes */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '0.74rem' }}>
            <span style={{ color: '#94A3B8' }}>
              Execution Progress: <strong style={{ color: '#38BDF8' }}>{Math.round((currentStep / timeline.length) * 100)}%</strong>
            </span>
            <span style={{ color: '#64748B' }}>
              Active Timestamp: <strong style={{ color: '#F8FAFC', fontFamily: 'monospace' }}>{currentEvent?.time}</strong>
            </span>
          </div>

          <div style={{ position: 'relative', width: '100%', height: '8px', backgroundColor: '#131D31', borderRadius: '4px', overflow: 'hidden' }}>
            <div
              style={{
                position: 'absolute', left: 0, top: 0, bottom: 0,
                width: `${(currentStep / timeline.length) * 100}%`,
                backgroundColor: '#38BDF8',
                transition: 'width 0.25s ease',
                boxShadow: '0 0 12px rgba(56, 189, 248, 0.6)'
              }}
            />
          </div>
        </div>

        {/* Row 3: Category Filter Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
          <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', marginRight: '4px' }}>
            Filter:
          </span>
          {[
            { id: 'ALL', label: `All Turns (${timeline.length})` },
            { id: 'DISCOVERY', label: 'Evidence Discoveries' },
            { id: 'CHALLENGE', label: 'Adversarial Challenges' },
            { id: 'VERIFICATION', label: 'Triangulation' },
            { id: 'JUDICIAL', label: 'Judicial Rulings' },
            { id: 'PLAN', label: 'Planning' },
          ].map(btn => (
            <button
              key={btn.id}
              onClick={() => setSelectedCategory(btn.id)}
              style={{
                padding: '4px 10px', fontSize: '0.72rem', fontWeight: 700, borderRadius: '5px',
                border: selectedCategory === btn.id ? '1px solid #38BDF8' : '1px solid #1E293B',
                backgroundColor: selectedCategory === btn.id ? '#1E3A8A' : '#131D31',
                color: selectedCategory === btn.id ? '#93C5FD' : '#94A3B8',
                cursor: 'pointer', whiteSpace: 'nowrap'
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>

      </div>

      {/* ══ MAIN BODY: TWO-COLUMN INTERACTIVE TIMELINE + INSPECTOR ══ */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1.25fr 1fr', minHeight: 0, overflow: 'hidden' }}>
        
        {/* Left Column: Visual Vertical Timeline */}
        <div style={{ padding: '24px 32px', overflowY: 'auto', borderRight: '1px solid #1E293B', backgroundColor: '#070B14' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}>
            
            {filteredTimeline.map((ev) => {
              const isPassed = ev.step <= currentStep;
              const isSelected = ev.step === currentStep;
              const meta = catMeta(ev.category);
              const isExpanded = expandedId === ev.id;

              return (
                <div
                  key={ev.id}
                  onClick={() => setCurrentStep(ev.step)}
                  style={{
                    backgroundColor: isSelected ? '#131F37' : '#0B1324',
                    border: `1.5px solid ${isSelected ? '#38BDF8' : isPassed ? '#1E293B' : '#131D31'}`,
                    borderLeft: `5px solid ${meta.color}`,
                    borderRadius: '0 10px 10px 0',
                    padding: '16px 20px',
                    cursor: 'pointer',
                    opacity: isPassed ? 1 : 0.45,
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? '0 0 24px rgba(56, 189, 248, 0.18)' : 'none'
                  }}
                >
                  {/* Card Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        fontSize: '0.68rem', fontWeight: 800, padding: '2px 7px', borderRadius: '4px',
                        backgroundColor: meta.bg, color: meta.color, border: `1px solid ${meta.border}55`
                      }}>
                        {meta.icon} {meta.label}
                      </span>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B' }}>
                        #{ev.step}
                      </span>
                      <strong style={{ fontSize: '0.86rem', color: isSelected ? '#38BDF8' : '#F8FAFC' }}>
                        {ev.actor}
                      </strong>
                    </div>

                    <span style={{ fontSize: '0.72rem', color: '#64748B', fontFamily: 'monospace' }}>
                      {ev.time}
                    </span>
                  </div>

                  {/* Summary Action */}
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#E2E8F0', lineHeight: '1.4', marginBottom: '6px' }}>
                    {ev.action}
                  </div>

                  {/* Excerpt Details */}
                  <div style={{
                    fontSize: '0.8rem', color: '#94A3B8', lineHeight: '1.55',
                    backgroundColor: '#070C18', padding: '10px 12px', borderRadius: '6px',
                    border: '1px solid #131D31', marginTop: '6px'
                  }}>
                    {isExpanded ? ev.details : (ev.details.length > 180 ? ev.details.slice(0, 180) + '...' : ev.details)}
                  </div>

                  {ev.details.length > 180 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setExpandedId(isExpanded ? null : ev.id); }}
                      style={{ background: 'none', border: 'none', color: '#38BDF8', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', padding: '4px 0 0', textDecoration: 'underline' }}
                    >
                      {isExpanded ? 'Collapse' : 'Expand full content'}
                    </button>
                  )}
                </div>
              );
            })}

          </div>
        </div>

        {/* Right Column: Dedicated Epistemic Step Inspector */}
        <div style={{ padding: '28px 32px', overflowY: 'auto', backgroundColor: '#090E1A' }}>
          {currentEvent ? (
            <div style={{ backgroundColor: '#0F172A', border: '1.5px solid #1E293B', borderRadius: '12px', padding: '24px 28px', boxShadow: '0 8px 30px rgba(0,0,0,0.3)' }}>
              
              {/* Header Badge & Step Number */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid #1E293B', paddingBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#38BDF8', backgroundColor: '#0B223D', padding: '3px 10px', borderRadius: '4px', border: '1px solid #0284C7' }}>
                    STEP {currentEvent.step} OF {timeline.length}
                  </span>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '5px',
                    fontSize: '0.72rem', fontWeight: 800, padding: '3px 10px', borderRadius: '4px',
                    backgroundColor: catMeta(currentEvent.category).bg, color: catMeta(currentEvent.category).color,
                    border: `1px solid ${catMeta(currentEvent.category).border}66`
                  }}>
                    {catMeta(currentEvent.category).icon} {catMeta(currentEvent.category).label}
                  </span>
                </div>

                <span style={{ fontSize: '0.76rem', color: '#64748B', fontFamily: 'monospace' }}>
                  {currentEvent.time}
                </span>
              </div>

              {/* Active Agent Name */}
              <div style={{ marginBottom: '16px' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Active Agent
                </span>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#F8FAFC', marginTop: '2px' }}>
                  {currentEvent.actor}
                </div>
              </div>

              {/* Action Headline */}
              <div style={{ marginBottom: '18px' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Action Summary
                </span>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#38BDF8', lineHeight: '1.45', marginTop: '4px' }}>
                  {currentEvent.action}
                </div>
              </div>

              {/* Full Detailed Evidentiary Content */}
              <div style={{ marginBottom: '20px' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Full Evidentiary &amp; Epistemic Content
                </span>
                <div style={{
                  fontSize: '0.88rem', color: '#E2E8F0', lineHeight: '1.7',
                  backgroundColor: '#070C18', padding: '16px 20px', borderRadius: '8px',
                  border: '1px solid #1E293B', marginTop: '6px', whiteSpace: 'pre-wrap', wordBreak: 'break-word'
                }}>
                  {currentEvent.details}
                </div>
              </div>

              {/* Navigation Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #1E293B', paddingTop: '16px' }}>
                <button
                  onClick={handlePrev}
                  disabled={currentStep <= 1}
                  style={{
                    padding: '8px 16px', backgroundColor: '#1E293B', color: currentStep <= 1 ? '#475569' : '#CBD5E1',
                    borderRadius: '6px', border: '1px solid #334155', cursor: currentStep <= 1 ? 'not-allowed' : 'pointer',
                    fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px'
                  }}
                >
                  <ChevronLeft size={15} /> Previous Step
                </button>

                <span style={{ fontSize: '0.74rem', color: '#64748B' }}>
                  Use arrow keys or scrubber to navigate
                </span>

                <button
                  onClick={handleNext}
                  disabled={currentStep >= timeline.length}
                  style={{
                    padding: '8px 16px', backgroundColor: currentStep >= timeline.length ? '#1E293B' : '#2563EB',
                    color: currentStep >= timeline.length ? '#475569' : '#FFFFFF',
                    borderRadius: '6px', border: 'none', cursor: currentStep >= timeline.length ? 'not-allowed' : 'pointer',
                    fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px'
                  }}
                >
                  Next Step <ChevronRight size={15} />
                </button>
              </div>

            </div>
          ) : (
            <div style={{ color: '#64748B', textAlign: 'center', padding: '40px' }}>
              Select any step from the timeline to inspect its full trace.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
