import { useState, useEffect, useRef } from 'react';
import {
  Scale, Play, Pause, RotateCcw, Volume2, VolumeX,
  SkipForward, SkipBack, Award, ShieldAlert, ShieldCheck,
  Radio, Sparkles, Gavel
} from 'lucide-react';
import type { Claim, CourtSimulation } from './types';

interface EvidenceCourtProps {
  claims: Claim[];
  selectedClaimIdx: number;
  onSelectClaimIdx: (idx: number) => void;
  courtData: CourtSimulation | null;
  visibleSteps: number;
  isCourtRunning: boolean;
  onRunCourt: () => void;
}

interface ParsedArgument {
  id: string;
  tag?: string;
  tagType: 'criticism' | 'evidence' | 'mandate' | 'metric' | 'neutral';
  body: string;
}

interface ParsedStatement {
  intro: string;
  arguments: ParsedArgument[];
  conclusion?: string;
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

      // Deep resonant wood knock
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

// Parse complex dialogue statements into cleanly structured arguments with tags
function parseCourtStatement(raw: string): ParsedStatement {
  if (!raw) return { intro: '', arguments: [] };

  const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const bulletRegex = /^([•\-*]|\d+\.|\(\w\)|\[\d+\])\s*/;

  const introLines: string[] = [];
  const argumentItems: ParsedArgument[] = [];
  let conclusion = '';

  let bulletStarted = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isBullet = bulletRegex.test(line);

    if (isBullet) {
      bulletStarted = true;
      const cleanLine = line.replace(bulletRegex, '').trim();

      // Check if line represents a final court order / conclusion
      if (cleanLine.toLowerCase().startsWith('final ruling:') ||
          cleanLine.toLowerCase().startsWith('mandatory requirement:') ||
          cleanLine.toLowerCase().includes('court is adjourned')) {
        conclusion = cleanLine;
        continue;
      }

      // Check for tag prefix (e.g., "Core Flaw: details...")
      const colonIdx = cleanLine.indexOf(':');
      const dashIdx = cleanLine.indexOf('—');
      const sepIdx = colonIdx !== -1 ? colonIdx : dashIdx;

      let tag = '';
      let body = cleanLine;

      if (sepIdx > 0 && sepIdx < 40) {
        tag = cleanLine.slice(0, sepIdx).trim();
        body = cleanLine.slice(sepIdx + 1).trim();
      }

      // Categorize tag
      let tagType: ParsedArgument['tagType'] = 'neutral';
      const tLower = tag.toLowerCase();
      if (tLower.includes('flaw') || tLower.includes('risk') || tLower.includes('compression') ||
          tLower.includes('loss') || tLower.includes('vulnerability') || tLower.includes('challenge') ||
          tLower.includes('objection') || tLower.includes('downside') || tLower.includes('unproven')) {
        tagType = 'criticism';
      } else if (tLower.includes('exhibit') || tLower.includes('baseline') || tLower.includes('benchmark') ||
                 tLower.includes('empirical') || tLower.includes('evidence') || tLower.includes('triangulated') ||
                 tLower.includes('frequency') || tLower.includes('data') || tLower.includes('verified') ||
                 tLower.includes('amortized')) {
        tagType = 'evidence';
      } else if (tLower.includes('finding') || tLower.includes('mandatory') || tLower.includes('statutory') ||
                 tLower.includes('gating') || tLower.includes('threshold') || tLower.includes('compliance') ||
                 tLower.includes('audit') || tLower.includes('ruling')) {
        tagType = 'mandate';
      } else if (tLower.includes('ebitda') || tLower.includes('mov') || tLower.includes('cagr') ||
                 tLower.includes('capex') || tLower.includes('unit') || tLower.includes('margin')) {
        tagType = 'metric';
      }

      argumentItems.push({
        id: `arg_${i}`,
        tag: tag || `Point ${argumentItems.length + 1}`,
        tagType,
        body: body || cleanLine
      });
    } else {
      if (!bulletStarted) {
        introLines.push(line);
      } else {
        // Trailing non-bullet text is often a concluding assertion
        conclusion = conclusion ? `${conclusion} ${line}` : line;
      }
    }
  }

  // Fallback: If no bullets were found (raw paragraph from LLM), split into distinct argument blocks
  if (argumentItems.length === 0) {
    if (introLines.length > 1) {
      const [first, ...rest] = introLines;
      return {
        intro: first,
        arguments: rest.map((txt, idx) => ({
          id: `arg_p_${idx}`,
          tag: `Argument ${idx + 1}`,
          tagType: 'neutral',
          body: txt
        }))
      };
    } else if (introLines.length === 1) {
      // Split sentences
      const sentences = introLines[0].split(/(?<=[.?!])\s+/).filter(Boolean);
      if (sentences.length > 2) {
        return {
          intro: sentences[0],
          arguments: sentences.slice(1, -1).map((s, idx) => ({
            id: `arg_s_${idx}`,
            tag: `Argument ${idx + 1}`,
            tagType: 'neutral',
            body: s
          })),
          conclusion: sentences[sentences.length - 1]
        };
      }
    }
  }

  return {
    intro: introLines.join(' '),
    arguments: argumentItems,
    conclusion
  };
}

export function EvidenceCourt({
  claims,
  selectedClaimIdx,
  onSelectClaimIdx,
  courtData,
  visibleSteps,
  isCourtRunning,
  onRunCourt
}: EvidenceCourtProps) {
  // Podcast Audio State
  const [isPodcastPlaying, setIsPodcastPlaying] = useState<boolean>(false);
  const [podcastStep, setPodcastStep] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [activeSpeakingTurn, setActiveSpeakingTurn] = useState<number | null>(null);

  // References
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const turnRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  const dialogueList = courtData?.dialogue || [];
  const maxVisible = Math.min(visibleSteps, dialogueList.length);

  // Initialize SpeechSynthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // Handle Stop Podcast on unmount or tab switch
  const stopPodcast = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsPodcastPlaying(false);
    setActiveSpeakingTurn(null);
  };

  // Convert raw statement to sanitized natural speech text
  const cleanForSpeech = (text: string): string => {
    return text
      .replace(/•/g, ', ')
      .replace(/[*#_~`]/g, '')
      .replace(/₹/g, ' rupees ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Play a specific turn's voice
  const speakTurn = (turnIndex: number, autoAdvance = true) => {
    if (!synthRef.current || !dialogueList[turnIndex]) {
      stopPodcast();
      return;
    }

    synthRef.current.cancel();

    if (isMuted) {
      if (autoAdvance && turnIndex + 1 < dialogueList.length) {
        setTimeout(() => {
          setPodcastStep(turnIndex + 1);
          speakTurn(turnIndex + 1, true);
        }, 1200 / playbackSpeed);
      } else {
        stopPodcast();
      }
      return;
    }

    const turn = dialogueList[turnIndex];
    const textToSpeak = `${turn.speaker}: ${cleanForSpeech(turn.statement)}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    // Dynamic Voice & Character Modulation
    const voices = synthRef.current.getVoices();
    const enVoices = voices.filter(v => v.lang.startsWith('en'));

    // Custom modulation per courtroom persona
    if (turn.role === 'JUDGE') {
      utterance.pitch = 0.84; // Authoritative deeper baritone
      utterance.rate = playbackSpeed * 0.94;
      const maleVoice = enVoices.find(v => v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('david') || v.name.toLowerCase().includes('george'));
      if (maleVoice) utterance.voice = maleVoice;

      // Play gavel sound when Judge begins opening or concluding
      if (turnIndex === 0 || turnIndex === dialogueList.length - 1) {
        playGavelSound(turnIndex === 0 ? 3 : 2);
      }
    } else if (turn.role === 'PROSECUTION') {
      utterance.pitch = 0.98; // Intense, sharp, aggressive
      utterance.rate = playbackSpeed * 1.08;
      const prosVoice = enVoices.find(v => v.name.toLowerCase().includes('guy') || v.name.toLowerCase().includes('mark') || v.name.toLowerCase().includes('daniel'));
      if (prosVoice) utterance.voice = prosVoice;
    } else if (turn.role === 'DEFENSE') {
      utterance.pitch = 1.12; // Persuasive, composed, clear
      utterance.rate = playbackSpeed * 0.98;
      const defVoice = enVoices.find(v => v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('susan') || v.name.toLowerCase().includes('catherine') || v.name.toLowerCase().includes('female'));
      if (defVoice) utterance.voice = defVoice;
    } else {
      // CLERK
      utterance.pitch = 1.05; // Formal, procedural, brisk
      utterance.rate = playbackSpeed * 1.02;
    }

    utterance.onstart = () => {
      setActiveSpeakingTurn(turnIndex);
      setPodcastStep(turnIndex);

      // Auto-scroll active card into view
      if (turnRefs.current[turnIndex]) {
        turnRefs.current[turnIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    utterance.onend = () => {
      if (autoAdvance) {
        if (turnIndex + 1 < dialogueList.length) {
          setTimeout(() => {
            if (synthRef.current && isPodcastPlaying) {
              setPodcastStep(turnIndex + 1);
              speakTurn(turnIndex + 1, true);
            }
          }, 450);
        } else {
          // Hearing finished
          playGavelSound(2);
          stopPodcast();
        }
      } else {
        stopPodcast();
      }
    };

    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis error:', e);
      stopPodcast();
    };

    activeUtteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  };

  // Toggle Podcast Play / Pause
  const handleTogglePodcast = () => {
    if (isPodcastPlaying) {
      stopPodcast();
    } else {
      if (dialogueList.length === 0) return;
      setIsPodcastPlaying(true);
      const startIdx = activeSpeakingTurn !== null ? activeSpeakingTurn : 0;
      setPodcastStep(startIdx);
      speakTurn(startIdx, true);
    }
  };

  const handleNextTurn = () => {
    if (podcastStep + 1 < dialogueList.length) {
      const next = podcastStep + 1;
      setPodcastStep(next);
      if (isPodcastPlaying) {
        speakTurn(next, true);
      }
    }
  };

  const handlePrevTurn = () => {
    if (podcastStep > 0) {
      const prev = podcastStep - 1;
      setPodcastStep(prev);
      if (isPodcastPlaying) {
        speakTurn(prev, true);
      }
    }
  };

  const handleReplayEpisode = () => {
    playGavelSound(2);
    setPodcastStep(0);
    setIsPodcastPlaying(true);
    speakTurn(0, true);
  };

  const currentTurn = dialogueList[podcastStep];
  const selectedClaim = claims[selectedClaimIdx] || claims[0];
  const cid = selectedClaim?.id || 'clm_1';
  const shortClaimText = selectedClaim?.text
    ? selectedClaim.text.slice(0, 95) + (selectedClaim.text.length > 95 ? '…' : '')
    : 'Arbitration of Research Assertion';

  // Role Color Helper
  const getRoleStyle = (role: string) => {
    switch (role) {
      case 'JUDGE':
        return { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.12)', border: '#F59E0B', label: 'Presiding Judge' };
      case 'PROSECUTION':
        return { color: '#EF4444', bg: 'rgba(239, 68, 68, 0.12)', border: '#EF4444', label: 'Lead Prosecutor' };
      case 'DEFENSE':
        return { color: '#10B981', bg: 'rgba(16, 185, 129, 0.12)', border: '#10B981', label: 'Defense Counsel' };
      default:
        return { color: '#38BDF8', bg: 'rgba(56, 189, 248, 0.12)', border: '#38BDF8', label: 'Clerk of Court' };
    }
  };

  const getTagColor = (tagType: ParsedArgument['tagType']) => {
    switch (tagType) {
      case 'criticism': return { color: '#F87171', bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.3)' };
      case 'evidence': return { color: '#34D399', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.3)' };
      case 'mandate': return { color: '#FBBF24', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)' };
      case 'metric': return { color: '#38BDF8', bg: 'rgba(56, 189, 248, 0.15)', border: 'rgba(56, 189, 248, 0.3)' };
      default: return { color: '#94A3B8', bg: 'rgba(148, 163, 184, 0.12)', border: 'rgba(148, 163, 184, 0.25)' };
    }
  };

  return (
    <div style={{ flex: 1, padding: '28px 48px', overflowY: 'auto', backgroundColor: '#090D16', color: '#E2E8F0' }}>
      
      {/* ──────────────── TOP COURT HEADER ──────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid #1E293B', paddingBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(220, 38, 38, 0.15)', border: '1px solid rgba(220, 38, 38, 0.35)', color: '#EF4444' }}>
              <Scale size={20} />
            </span>
            <div>
              <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#F8FAFC', margin: 0, letterSpacing: '-0.02em' }}>
                Evidence Court — Adversarial Arbitration
              </h2>
              <p style={{ fontSize: '0.86rem', color: '#94A3B8', margin: '3px 0 0' }}>
                Forensic cross-examination chamber where contested claims are tried with structured arguments and judicial verdicts.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => playGavelSound(2)}
            title="Bang Judge's Gavel"
            style={{
              padding: '10px 14px',
              backgroundColor: '#1E293B',
              color: '#F59E0B',
              border: '1px solid #334155',
              borderRadius: '7px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.82rem',
              fontWeight: 600
            }}
          >
            <Gavel size={16} />
            Bang Gavel
          </button>

          <button
            onClick={onRunCourt}
            disabled={isCourtRunning}
            style={{
              padding: '10px 22px',
              backgroundColor: isCourtRunning ? '#475569' : '#DC2626',
              color: '#FFF',
              fontWeight: 700,
              fontSize: '0.88rem',
              borderRadius: '7px',
              border: 'none',
              cursor: isCourtRunning ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 16px rgba(220, 38, 38, 0.4)'
            }}
          >
            <Scale size={18} />
            {isCourtRunning ? 'Court in Session…' : 'Simulate Court Hearing'}
          </button>
        </div>
      </div>

      {/* ──────────────── CLAIM SELECTION DECK ──────────────── */}
      {claims.length > 0 && (
        <div style={{ marginBottom: '22px', backgroundColor: '#0F172A', border: '1px solid #1E293B', borderRadius: '10px', padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Select Contested Claim to Adjudicate:
            </span>
            <span style={{ fontSize: '0.74rem', color: '#94A3B8' }}>
              {claims.length} claims available from research store
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '8px', maxHeight: '160px', overflowY: 'auto' }}>
            {claims.map((c, idx) => {
              const isSelected = selectedClaimIdx === idx;
              return (
                <div
                  key={c.id || idx}
                  onClick={() => onSelectClaimIdx(idx)}
                  style={{
                    padding: '9px 13px',
                    backgroundColor: isSelected ? 'rgba(37, 99, 235, 0.16)' : '#131D31',
                    border: `1px solid ${isSelected ? '#3B82F6' : '#1E293B'}`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.82rem',
                    color: isSelected ? '#93C5FD' : '#CBD5E1',
                    lineHeight: '1.4',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{ fontWeight: 800, color: isSelected ? '#60A5FA' : '#38BDF8', fontSize: '0.78rem', marginTop: '1px' }}>
                    #{idx + 1}
                  </span>
                  <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {c.text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ──────────────── COURT DATA & PODCAST DECK ──────────────── */}
      {courtData ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1080px', margin: '0 auto' }}>

          {/* 🎙️ COURT PODCAST STUDIO PLAYER BAR 🎙️ */}
          <div style={{
            backgroundColor: '#0E1729',
            border: '1px solid #1E3A8A',
            borderRadius: '12px',
            padding: '16px 22px',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.45)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            position: 'sticky',
            top: '0',
            zIndex: 10,
            backdropFilter: 'blur(12px)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              
              {/* Show & Episode Details */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #1E3A8A, #0284C7)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFF',
                  boxShadow: '0 0 15px rgba(2, 132, 199, 0.4)'
                }}>
                  <Radio size={22} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#38BDF8' }}>
                      ResearchOps Judicial Podcast
                    </span>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '12px',
                      backgroundColor: isPodcastPlaying ? 'rgba(239, 68, 68, 0.2)' : 'rgba(100, 116, 139, 0.2)',
                      color: isPodcastPlaying ? '#EF4444' : '#94A3B8',
                      border: `1px solid ${isPodcastPlaying ? 'rgba(239, 68, 68, 0.4)' : '#334155'}`
                    }}>
                      <span style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: isPodcastPlaying ? '#EF4444' : '#64748B',
                        animation: isPodcastPlaying ? 'pulseOnAir 1.2s infinite' : 'none'
                      }} />
                      {isPodcastPlaying ? 'ON AIR' : 'PODCAST READY'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.94rem', fontWeight: 700, color: '#F8FAFC', marginTop: '2px' }}>
                    Episode: The Arbitration of Claim #{cid}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '2px', maxWidth: '440px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {shortClaimText}
                  </div>
                </div>
              </div>

              {/* Player Audio Visualizer */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px', height: '28px', padding: '0 12px' }}>
                {[1, 2, 3, 4, 5, 4, 3, 2, 1, 3, 5, 2, 4, 2].map((lvl, idx) => (
                  <div
                    key={idx}
                    style={{
                      width: '3px',
                      backgroundColor: isPodcastPlaying ? '#38BDF8' : '#334155',
                      borderRadius: '2px',
                      height: isPodcastPlaying ? `${Math.min(24, lvl * 4 + 4)}px` : '4px',
                      animation: isPodcastPlaying ? `eqBar${(idx % 5) + 1} 0.8s ease-in-out infinite alternate` : 'none',
                      transition: 'height 0.2s ease, background-color 0.3s ease'
                    }}
                  />
                ))}
              </div>

              {/* Master Audio Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  onClick={handlePrevTurn}
                  disabled={podcastStep <= 0}
                  title="Previous Argument"
                  style={{
                    padding: '8px',
                    backgroundColor: '#1E293B',
                    border: '1px solid #334155',
                    borderRadius: '6px',
                    color: podcastStep <= 0 ? '#475569' : '#CBD5E1',
                    cursor: podcastStep <= 0 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <SkipBack size={15} />
                </button>

                <button
                  onClick={handleTogglePodcast}
                  style={{
                    padding: '9px 18px',
                    background: isPodcastPlaying
                      ? 'linear-gradient(135deg, #EF4444, #DC2626)'
                      : 'linear-gradient(135deg, #2563EB, #0284C7)',
                    color: '#FFF',
                    fontWeight: 700,
                    fontSize: '0.86rem',
                    borderRadius: '7px',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: isPodcastPlaying
                      ? '0 0 16px rgba(239, 68, 68, 0.45)'
                      : '0 0 16px rgba(37, 99, 235, 0.45)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {isPodcastPlaying ? <Pause size={17} /> : <Play size={17} />}
                  {isPodcastPlaying ? 'Pause Podcast' : 'Play Judicial Podcast'}
                </button>

                <button
                  onClick={handleNextTurn}
                  disabled={podcastStep >= dialogueList.length - 1}
                  title="Next Argument"
                  style={{
                    padding: '8px',
                    backgroundColor: '#1E293B',
                    border: '1px solid #334155',
                    borderRadius: '6px',
                    color: podcastStep >= dialogueList.length - 1 ? '#475569' : '#CBD5E1',
                    cursor: podcastStep >= dialogueList.length - 1 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <SkipForward size={15} />
                </button>

                <button
                  onClick={handleReplayEpisode}
                  title="Replay from Opening Gavel"
                  style={{
                    padding: '8px',
                    backgroundColor: '#1E293B',
                    border: '1px solid #334155',
                    borderRadius: '6px',
                    color: '#94A3B8',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <RotateCcw size={15} />
                </button>

                {/* Speed Toggle */}
                <div style={{ display: 'flex', backgroundColor: '#131D31', borderRadius: '6px', padding: '2px', border: '1px solid #1E293B' }}>
                  {[1.0, 1.25, 1.5].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => setPlaybackSpeed(spd)}
                      style={{
                        padding: '4px 8px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        backgroundColor: playbackSpeed === spd ? '#2563EB' : 'transparent',
                        color: playbackSpeed === spd ? '#FFF' : '#94A3B8',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>

                {/* Mute Toggle */}
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
                  style={{
                    padding: '8px',
                    backgroundColor: '#1E293B',
                    border: '1px solid #334155',
                    borderRadius: '6px',
                    color: isMuted ? '#EF4444' : '#94A3B8',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                </button>
              </div>
            </div>

            {/* Currently Speaking Sub-banner */}
            {currentTurn && (
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
                  <span style={{ color: '#64748B' }}>Speaking:</span>
                  <strong style={{ color: getRoleStyle(currentTurn.role).color }}>
                    {currentTurn.speaker}
                  </strong>
                  <span style={{
                    fontSize: '0.66rem',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    backgroundColor: getRoleStyle(currentTurn.role).bg,
                    color: getRoleStyle(currentTurn.role).color,
                    border: `1px solid ${getRoleStyle(currentTurn.role).border}44`,
                    fontWeight: 700
                  }}>
                    {getRoleStyle(currentTurn.role).label}
                  </span>
                </div>

                <div style={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>Turn {podcastStep + 1} of {dialogueList.length}</span>
                  <div style={{ width: '80px', height: '4px', backgroundColor: '#1E293B', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${((podcastStep + 1) / dialogueList.length) * 100}%`,
                      height: '100%',
                      backgroundColor: '#38BDF8',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Active Trial Session Status Header */}
          <div style={{
            backgroundColor: '#131D31',
            padding: '12px 20px',
            borderRadius: '8px',
            border: '1px solid #1E293B',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.86rem' }}>
              <span style={{
                display: 'inline-block',
                width: '9px',
                height: '9px',
                borderRadius: '50%',
                backgroundColor: isCourtRunning ? '#F59E0B' : '#10B981',
                boxShadow: isCourtRunning ? '0 0 8px #F59E0B' : '0 0 8px #10B981'
              }} />
              <strong style={{ color: '#F8FAFC' }}>
                {isCourtRunning
                  ? `Court in Session (Argument ${maxVisible} of ${dialogueList.length})`
                  : 'Trial Record Complete — Judicial Decrees Admitted'}
              </strong>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={14} color="#38BDF8" />
              Structured Evidentiary Arguments
            </div>
          </div>

          {/* ──────────────── TO-AND-FRO ADJUDICATION TRANSCRIPT ──────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {dialogueList.slice(0, maxVisible).map((d, i) => {
              const isJudge = d.role === 'JUDGE';
              const isProsecution = d.role === 'PROSECUTION';
              const isDefense = d.role === 'DEFENSE';
              const isCurrentPodcast = isPodcastPlaying && activeSpeakingTurn === i;
              const roleStyle = getRoleStyle(d.role);
              const parsed = parseCourtStatement(d.statement);

              return (
                <div
                  key={i}
                  ref={el => { turnRefs.current[i] = el; }}
                  style={{
                    backgroundColor: '#0F172A',
                    borderTop: `1px solid ${isCurrentPodcast ? roleStyle.border : '#1E293B'}`,
                    borderRight: `1px solid ${isCurrentPodcast ? roleStyle.border : '#1E293B'}`,
                    borderBottom: `1px solid ${isCurrentPodcast ? roleStyle.border : '#1E293B'}`,
                    borderLeft: `5px solid ${roleStyle.color}`,
                    borderRadius: '0 10px 10px 0',
                    padding: '20px 24px',
                    boxShadow: isCurrentPodcast
                      ? `0 0 24px ${roleStyle.color}33, 0 4px 16px rgba(0,0,0,0.5)`
                      : isJudge && i === dialogueList.length - 1
                      ? '0 0 20px rgba(245, 158, 11, 0.25)'
                      : '0 4px 12px rgba(0,0,0,0.3)',
                    transition: 'all 0.3s ease',
                    position: 'relative'
                  }}
                >
                  {/* ON-AIR BADGE WHEN PLAYING IN PODCAST */}
                  {isCurrentPodcast && (
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      right: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      color: roleStyle.color,
                      backgroundColor: roleStyle.bg,
                      border: `1px solid ${roleStyle.border}66`,
                      padding: '2px 8px',
                      borderRadius: '12px',
                      letterSpacing: '0.06em'
                    }}>
                      <Radio size={12} />
                      ON AIR • NARRATING
                    </div>
                  )}

                  {/* Speaker Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <strong style={{ fontSize: '0.94rem', color: roleStyle.color, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {isJudge && <Award size={16} />}
                        {isProsecution && <ShieldAlert size={16} />}
                        {isDefense && <ShieldCheck size={16} />}
                        {d.speaker}
                      </strong>
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        backgroundColor: roleStyle.bg,
                        color: roleStyle.color,
                        border: `1px solid ${roleStyle.border}44`,
                        letterSpacing: '0.04em'
                      }}>
                        {roleStyle.label}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {/* Individual Audio Button */}
                      <button
                        onClick={() => {
                          setPodcastStep(i);
                          setIsPodcastPlaying(true);
                          speakTurn(i, false);
                        }}
                        title="Listen to this argument"
                        style={{
                          backgroundColor: '#1E293B',
                          border: '1px solid #334155',
                          borderRadius: '5px',
                          color: '#94A3B8',
                          padding: '4px 9px',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        <Volume2 size={13} />
                        Listen
                      </button>
                      <span style={{ fontSize: '0.74rem', color: '#64748B', fontFamily: 'monospace' }}>
                        {d.timestamp}
                      </span>
                    </div>
                  </div>

                  {/* ─── STRUCTURED ARGUMENT FORMATTING ─── */}
                  <div style={{ display: 'flex', flexDirection: 'column' }}>

                    {/* Opening Stance / Premise */}
                    {parsed.intro && (
                      <div style={{
                        fontSize: '0.94rem',
                        fontWeight: 600,
                        color: isJudge ? '#FEF08A' : '#F1F5F9',
                        lineHeight: '1.5',
                        marginBottom: parsed.arguments.length > 0 ? '12px' : '0'
                      }}>
                        {parsed.intro}
                      </div>
                    )}

                    {/* Distinct Argument Points with Balanced Spacing */}
                    {parsed.arguments.length > 0 && (
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        margin: '2px 0 10px 0'
                      }}>
                        {parsed.arguments.map((arg, argIdx) => {
                          const tagClr = getTagColor(arg.tagType);
                          return (
                            <div
                              key={arg.id || argIdx}
                              style={{
                                backgroundColor: '#0B1324',
                                border: '1px solid #1E293B',
                                borderLeft: `3px solid ${tagClr.color}`,
                                borderRadius: '6px',
                                padding: '9px 13px',
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '10px',
                                transition: 'background-color 0.2s ease'
                              }}
                            >
                              {/* Tag Badge */}
                              {arg.tag && (
                                <span style={{
                                  fontSize: '0.71rem',
                                  fontWeight: 700,
                                  color: tagClr.color,
                                  backgroundColor: tagClr.bg,
                                  border: `1px solid ${tagClr.border}`,
                                  borderRadius: '4px',
                                  padding: '2px 7px',
                                  whiteSpace: 'nowrap',
                                  flexShrink: 0,
                                  marginTop: '1px'
                                }}>
                                  {arg.tag}
                                </span>
                              )}

                              {/* Argument Body Text */}
                              <div style={{
                                fontSize: '0.86rem',
                                color: '#CBD5E1',
                                lineHeight: '1.55',
                                flex: 1
                              }}>
                                {arg.body}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Trailing Ruling / Concluding Assertion */}
                    {parsed.conclusion && (
                      <div style={{
                        marginTop: '4px',
                        padding: '8px 12px',
                        backgroundColor: isJudge ? 'rgba(245, 158, 11, 0.08)' : 'rgba(30, 41, 59, 0.5)',
                        borderLeft: `3px solid ${isJudge ? '#F59E0B' : '#64748B'}`,
                        borderRadius: '0 6px 6px 0',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: isJudge ? '#FDE68A' : '#E2E8F0',
                        lineHeight: '1.5'
                      }}>
                        {parsed.conclusion}
                      </div>
                    )}

                  </div>
                </div>
              );
            })}
          </div>

          {/* ──────────────── FINAL JUDICIAL RULING DECREE ──────────────── */}
          {!isCourtRunning && maxVisible >= dialogueList.length && courtData.ruling && (
            <div style={{
              backgroundColor: 'rgba(245, 158, 11, 0.09)',
              border: '2px solid #F59E0B',
              borderRadius: '12px',
              padding: '22px 26px',
              marginTop: '12px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px',
              boxShadow: '0 8px 30px rgba(245, 158, 11, 0.15)'
            }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '10px',
                backgroundColor: 'rgba(245, 158, 11, 0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#F59E0B',
                flexShrink: 0
              }}>
                <Scale size={26} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ fontWeight: 800, fontSize: '1.02rem', color: '#FBBF24', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Official Judicial Ruling &amp; Binding Caveat
                  </div>
                  <button
                    onClick={() => {
                      if (!synthRef.current) return;
                      synthRef.current.cancel();
                      playGavelSound(2);
                      const u = new SpeechSynthesisUtterance(`Chief Justice Sharma presiding. Final judicial verdict: ${cleanForSpeech(courtData.ruling || '')}`);
                      u.pitch = 0.84;
                      u.rate = playbackSpeed * 0.94;
                      synthRef.current.speak(u);
                    }}
                    style={{
                      padding: '5px 11px',
                      backgroundColor: '#1E293B',
                      border: '1px solid #F59E0B',
                      borderRadius: '5px',
                      color: '#FDE68A',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <Volume2 size={13} />
                    Listen to Ruling
                  </button>
                </div>
                <div style={{ fontSize: '0.94rem', color: '#FEF08A', lineHeight: '1.65' }}>
                  {courtData.ruling}
                </div>
              </div>
            </div>
          )}

        </div>
      ) : (
        /* Empty State */
        <div style={{
          backgroundColor: '#0F172A',
          padding: '60px 40px',
          borderRadius: '12px',
          textAlign: 'center',
          color: '#64748B',
          maxWidth: '780px',
          margin: '36px auto',
          border: '1px dashed #334155'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#1E293B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            color: '#EF4444'
          }}>
            <Scale size={32} />
          </div>
          <div style={{ fontSize: '1.18rem', fontWeight: 800, color: '#F8FAFC', marginBottom: '8px' }}>
            Simulate Adversarial Arbitration &amp; Podcast
          </div>
          <div style={{ fontSize: '0.88rem', color: '#94A3B8', marginBottom: '24px', maxWidth: '520px', margin: '0 auto 24px', lineHeight: '1.6' }}>
            Click <strong>Simulate Court Hearing</strong> to cross-examine claims before Chief Justice Sharma, break arguments into structured evidentiary points, and listen via the built-in courtroom podcast studio.
          </div>
          <button
            onClick={onRunCourt}
            disabled={isCourtRunning}
            style={{
              padding: '11px 24px',
              backgroundColor: '#DC2626',
              color: '#FFF',
              fontWeight: 700,
              fontSize: '0.9rem',
              borderRadius: '7px',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 18px rgba(220, 38, 38, 0.4)'
            }}
          >
            <Scale size={18} />
            Simulate Court Hearing
          </button>
        </div>
      )}

    </div>
  );
}
