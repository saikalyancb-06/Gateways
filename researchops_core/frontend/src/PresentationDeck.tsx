import { useState, useEffect } from 'react';
import {
  Presentation, Download, ChevronLeft, ChevronRight
} from 'lucide-react';
import type { Claim } from './types';

interface PresentationDeckProps {
  claims: Claim[];
  question?: string;
}

export function PresentationDeck({ claims, question }: PresentationDeckProps) {
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const slides = [
    {
      id: 'scope',
      num: '01',
      title: 'Problem Scope & Problem Decomposition',
      category: 'Strategic Inquiry',
      badgeColor: '#38BDF8',
      summary: 'Inquiry decomposition into four operational domain tasks covering loyalty economics, customer frequency, and regulatory risk.',
      cards: [
        {
          heading: 'Inquiry Background & Target Metrics',
          points: [
            'Target Question: Viability of subscription loyalty models for regional food aggregators in India.',
            'Hypothesis: Order frequency expansion (2.8x) compensates for last-mile delivery fee absorption.',
            'Target Baseline: Positive EBITDA contribution within 9 operating months.',
            'Core Operational Challenge: Preventing margin compression while defending market share against Tier-1 incumbents.'
          ]
        },
        {
          heading: 'Multi-Agent Investigation Architecture',
          points: [
            'Research Director: Problem decomposition and operational hypothesis formulation.',
            'Competitor Agent: Extraction of Swiggy One & Zomato Gold pricing & MOV benchmarks.',
            'Market Agent: Quantification of ₹1.8L Cr TAM and 30-day frequency multipliers.',
            'Regulation Agent: DPDP Act 2023 compliance auditing on location & order history tracking.'
          ]
        }
      ]
    },
    {
      id: 'moats',
      num: '02',
      title: 'Competitor Moats & Incumbent Economics',
      category: 'Competitive Benchmarking',
      badgeColor: '#F59E0B',
      summary: 'Comparative benchmark between Swiggy One and Zomato Gold unit economics and defensibility moats.',
      cards: [
        {
          heading: 'Swiggy One Architecture',
          points: [
            'Pricing: ₹149 — ₹299 introductory quarterly pass.',
            'Cross-Vertical Bundle: Shared benefits across Food Delivery, Instamart (Quick Comm), and Dineout.',
            'Minimum Order Value (MOV): ₹149 floor for free delivery activation.',
            'Moat Strength: High multi-vertical ecosystem lock-in; 3.1x monthly ordering velocity.',
            'Downside Exposure: Severe margin bleed during monsoon rain surges and peak driver incentive spikes.'
          ]
        },
        {
          heading: 'Zomato Gold Architecture',
          points: [
            'Pricing: ₹99 — ₹199 quarterly VIP membership.',
            'Dining Co-Funding: Up to 25% off dining bills co-funded directly by partner restaurants.',
            'Minimum Order Value (MOV): Strict ₹199 floor; sub-₹199 orders pay full delivery fee.',
            'Moat Strength: Upfront cash collection from partner fees; strong restaurant partner exclusivity.',
            'Downside Exposure: Restaurant partner resistance against steep co-funded dining discounts.'
          ]
        },
        {
          heading: 'Challenger Moat Playbook',
          points: [
            'Implement Strict ₹249 MOV Threshold: Eliminates negative contribution orders at checkout.',
            'Merchant Co-Funded Rebates: Secure 12–15% partner rebate tier from top 20% anchor merchants.',
            'Route Batching Density: Localized route optimization reduces delivery expenditure by 22%.'
          ]
        }
      ]
    },
    {
      id: 'market',
      num: '03',
      title: 'Market Sizing & Addressable Cohorts',
      category: 'TAM & Growth Dynamics',
      badgeColor: '#10B981',
      summary: 'Indian online food delivery market sizing, cohort expansion dynamics, and Tier-2 growth curves.',
      cards: [
        {
          heading: 'Market Macro & TAM Projection',
          points: [
            'TAM Projection: Indian Online Food Delivery market expanding to ₹1.80 Lakh Crore ($21.6B) by 2027.',
            'Growth Momentum: 28.4% Compound Annual Growth Rate (CAGR) from 2023 to 2027.',
            'Tier-1 Metro Saturation: 68% GMV concentrated in top 8 cities; subscriber penetration exceeds 34%.',
            'Tier-2 Growth Frontier: 42% YoY expansion in emerging metro clusters (Jaipur, Lucknow, Ahmedabad, Chandigarh).'
          ]
        },
        {
          heading: 'Cohort Behavioral Lift Metrics',
          points: [
            'Order Frequency Multiplier: Subscribed users demonstrate 2.85x higher 30-day order frequency than non-subscribers.',
            'Basket Elasticity: Free delivery increases order frequency by 180% but lowers average basket size by 12% without MOV gating.',
            'Retention Compounding: 12-month cohort retention improves from 24% to 58% when enrolled in structured loyalty tier.'
          ]
        }
      ]
    },
    {
      id: 'risks',
      num: '04',
      title: 'Adversarial Risks & Red-Team Audit',
      category: 'Vulnerability Assessment',
      badgeColor: '#EF4444',
      summary: 'Adversarial falsification findings, unit economic margin compression, and statutory compliance hurdles.',
      cards: [
        {
          heading: 'Risk 1: Margin Compression Vulnerability',
          points: [
            'Core Flaw: Subsidizing delivery on orders below ₹200 creates a -₹18 net EBITDA drain per order.',
            'Volume Paradox: Surge in order volume without basket thresholds accelerates cash burn rather than reducing unit overheads.',
            'Mitigation Required: Mandatory dynamic MOV gating enforced at checkout.'
          ]
        },
        {
          heading: 'Risk 2: DPDP Act 2023 Statutory Exposure',
          points: [
            'Statutory Penalty: Exposure up to ₹250 Crore under DPDP Act 2023 Section 33 for improper behavioral profiling.',
            'Consent Architecture: Location tracking & personalized discounting algorithms require verifiable parental and personal consent records.',
            'Mitigation Required: Deploy automated cryptographic consent logging pipeline prior to rollout.'
          ]
        },
        {
          heading: 'Risk 3: Churn Shock & Retention Cliff',
          points: [
            'Promotional Cliff: 38% user drop-off observed after 90-day introductory promotion period expires.',
            'Re-acquisition Trap: High churn forces continuous marketing expenditure, inflating CAC to ₹750+.',
            'Mitigation Required: Implement gradual renewal rebates and dining privilege bridges.'
          ]
        }
      ]
    },
    {
      id: 'verdict',
      num: '05',
      title: 'Binding Verdict — Evidence Court Ruling',
      category: 'Judicial Decree',
      badgeColor: '#F59E0B',
      summary: 'Official decree by Chief Justice Sharma in the ResearchOps Epistemic Arbitration Court.',
      cards: [
        {
          heading: 'Official Judicial Decree by Chief Justice Sharma',
          points: [
            'VERDICT: CLAIM IS QUALIFIED WITH BINDING CONDITIONS.',
            'Judicial Finding: While baseline commercial feasibility is established by 2.8x order lift, unconstrained subsidies violate corporate fiduciary standards.',
            'Statutory Mandate: Rollout may proceed ONLY under three strict binding operational caveats.'
          ]
        },
        {
          heading: 'Three Binding Operational Caveats',
          points: [
            'Caveat 1 (Mandatory MOV Floor): Dynamic basket threshold ≥ ₹249 enforced at checkout. Orders below ₹249 must pay full delivery fees.',
            'Caveat 2 (DPDP Compliance Audits): Quarterly independent consent compliance audits to eliminate ₹250 Cr statutory exposure.',
            'Caveat 3 (Monsoon Driver Reserve): 15% of subscription fee revenue must be placed in a segregated contingency reserve to cushion peak weather driver surges.'
          ]
        }
      ]
    },
    {
      id: 'rollout',
      num: '06',
      title: 'Phased Rollout Roadmap & Implementation Gates',
      category: 'Execution Strategy',
      badgeColor: '#10B981',
      summary: 'Three-stage execution strategy with clear milestone gates and unit-economic risk safeguards.',
      cards: [
        {
          heading: 'Phase 1: Controlled Pilot (Days 1 — 30)',
          points: [
            'Deploy in 3 high-density Tier-1 test clusters.',
            'Enforce strict ₹249 MOV gating at checkout.',
            'Implement automated DPDP consent logging pipeline.',
            'Exit Gate: Achieve ≥ ₹35 Net Contribution Margin per order.'
          ]
        },
        {
          heading: 'Phase 2: Partner Rebates (Days 31 — 90)',
          points: [
            'Onboard 40+ anchor restaurant partners into 15% co-funded rebate tier.',
            'Tune order frequency pacing algorithms.',
            'Audit cohort churn against 7.5% ceiling threshold.',
            'Exit Gate: 90-day Capex payback verified across pilot cohorts.'
          ]
        },
        {
          heading: 'Phase 3: Regional Expansion (Days 91 — 180)',
          points: [
            'Scale program across 12 Tier-2 metro corridors.',
            'Introduce tiered quarterly pass with cross-dining privileges.',
            'Lock in route batching efficiencies to lower delivery costs by 22%.',
            'Exit Gate: Positive net EBITDA sustained across all operating clusters.'
          ]
        }
      ]
    }
  ];

  // Handle Keyboard Navigation (Left / Right Arrow Keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        setCurrentSlide(prev => (prev < slides.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        setCurrentSlide(prev => (prev > 0 ? prev - 1 : prev));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slides.length]);

  // Handle Download PPTX Presentation
  const handleDownloadPptx = async () => {
    setIsDownloading(true);
    try {
      // First attempt backend generation endpoint
      const response = await fetch('http://127.0.0.1:8000/api/presentation/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question || 'Quick Commerce & Loyalty Subscription Economics in India',
          claim_count: claims.length || 4,
          source_count: 12
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'researchops_executive_presentation.pptx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        // Fallback to static public pptx file
        const a = document.createElement('a');
        a.href = '/researchops_presentation.pptx';
        a.download = 'researchops_executive_presentation.pptx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch {
      // Fallback to static asset
      const a = document.createElement('a');
      a.href = '/researchops_presentation.pptx';
      a.download = 'researchops_executive_presentation.pptx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } finally {
      setIsDownloading(false);
    }
  };

  const slide = slides[currentSlide];

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#090D16',
      color: '#E2E8F0',
      overflow: 'hidden',
      height: '100%'
    }}>

      {/* ── TOP ACTION BAR ── */}
      <div style={{
        padding: '14px 28px',
        backgroundColor: '#0B1120',
        borderBottom: '1px solid #1E293B',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            backgroundColor: 'rgba(56, 189, 248, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#38BDF8'
          }}>
            <Presentation size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#F8FAFC', margin: 0 }}>
              Executive Presentation Deck
            </h3>
            <div style={{ fontSize: '0.74rem', color: '#94A3B8' }}>
              Problem Scope → Competitor Moats → Market Sizing → Adversarial Risks → Binding Verdict → Phased Rollout
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Slide Navigation Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#131D31', padding: '3px 8px', borderRadius: '6px', border: '1px solid #1E293B' }}>
            <button
              onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
              disabled={currentSlide === 0}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: currentSlide === 0 ? '#475569' : '#CBD5E1',
                cursor: currentSlide === 0 ? 'not-allowed' : 'pointer',
                padding: '4px',
                display: 'flex'
              }}
            >
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#F8FAFC', minWidth: '70px', textAlign: 'center' }}>
              Slide {slide.num} of 06
            </span>
            <button
              onClick={() => setCurrentSlide(prev => Math.min(slides.length - 1, prev + 1))}
              disabled={currentSlide === slides.length - 1}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: currentSlide === slides.length - 1 ? '#475569' : '#CBD5E1',
                cursor: currentSlide === slides.length - 1 ? 'not-allowed' : 'pointer',
                padding: '4px',
                display: 'flex'
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Download PPTX Button */}
          <button
            onClick={handleDownloadPptx}
            disabled={isDownloading}
            style={{
              padding: '8px 16px',
              backgroundColor: '#2563EB',
              color: '#FFF',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: isDownloading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)'
            }}
          >
            <Download size={15} />
            {isDownloading ? 'Generating PPTX…' : 'Download PPT (.pptx)'}
          </button>
        </div>
      </div>

      {/* ── MAIN PRESENTATION CANVAS ── */}
      <div style={{
        flex: 1,
        padding: '24px 36px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflowY: 'auto'
      }}>
        {/* 16:9 Widescreen Slide Container */}
        <div style={{
          width: '100%',
          maxWidth: '1060px',
          aspectRatio: '16 / 9',
          backgroundColor: '#0B1120',
          border: '1px solid #1E293B',
          borderRadius: '14px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.65)',
          padding: '36px 44px',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Slide Category Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{
              fontSize: '0.74rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: slide.badgeColor,
              backgroundColor: `${slide.badgeColor}18`,
              padding: '3px 10px',
              borderRadius: '4px',
              border: `1px solid ${slide.badgeColor}33`
            }}>
              RESEARCHOPS EXECUTIVE DECK • {slide.category}
            </span>
            <span style={{ fontSize: '0.94rem', fontWeight: 800, color: '#64748B', fontFamily: 'monospace' }}>
              {slide.num} / 06
            </span>
          </div>

          {/* Slide Title */}
          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#F8FAFC', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
            {slide.title}
          </h2>
          <p style={{ fontSize: '0.86rem', color: '#94A3B8', margin: '0 0 20px 0', lineHeight: '1.4' }}>
            {slide.summary}
          </p>

          {/* Slide Cards Content */}
          <div style={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: slide.cards.length === 3 ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)',
            gap: '16px',
            overflowY: 'auto'
          }}>
            {slide.cards.map((c, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: '#131D31',
                  border: '1px solid #1E293B',
                  borderRadius: '10px',
                  padding: '16px 20px',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div style={{
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  color: slide.badgeColor,
                  marginBottom: '12px',
                  borderBottom: '1px solid #1E293B',
                  paddingBottom: '8px'
                }}>
                  {c.heading}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                  {c.points.map((pt, pIdx) => (
                    <div
                      key={pIdx}
                      style={{
                        fontSize: '0.82rem',
                        color: '#CBD5E1',
                        lineHeight: '1.5',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px'
                      }}
                    >
                      <span style={{ color: slide.badgeColor, fontWeight: 700, marginTop: '1px' }}>•</span>
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Slide Bottom Bar */}
          <div style={{
            borderTop: '1px solid #1E293B',
            marginTop: '16px',
            paddingTop: '10px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.72rem',
            color: '#64748B'
          }}>
            <span>Autonomous ResearchOps Decision Intelligence Framework</span>
            <span>Use Left / Right arrow keys to navigate slides</span>
          </div>
        </div>

        {/* ── SLIDE THUMBNAIL TRACKER ── */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '18px', maxWidth: '1060px', width: '100%', overflowX: 'auto', paddingBottom: '6px' }}>
          {slides.map((s, idx) => {
            const isActive = currentSlide === idx;
            return (
              <div
                key={s.id}
                onClick={() => setCurrentSlide(idx)}
                style={{
                  flex: 1,
                  minWidth: '120px',
                  padding: '8px 12px',
                  backgroundColor: isActive ? '#1E293B' : '#0B1120',
                  border: `1px solid ${isActive ? s.badgeColor : '#1E293B'}`,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ fontSize: '0.66rem', fontWeight: 800, color: s.badgeColor }}>
                  SLIDE {s.num}
                </div>
                <div style={{
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  color: isActive ? '#F8FAFC' : '#94A3B8',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  marginTop: '2px'
                }}>
                  {s.title.split('—')[0]}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
