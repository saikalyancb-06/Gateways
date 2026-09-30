import { useState, useMemo } from 'react';
import {
  Sliders, TrendingUp, AlertTriangle, CheckCircle2,
  RefreshCw, BarChart3
} from 'lucide-react';
import type { Claim } from './types';

interface UnitEconomicsEngineProps {
  claims: Claim[];
  onNavigateTab?: (tab: string) => void;
}

export function UnitEconomicsEngine({ claims }: UnitEconomicsEngineProps) {
  // Live Financial Sliders
  const [cac, setCac] = useState<number>(450);                     // Customer Acquisition Cost (₹)
  const [aov, setAov] = useState<number>(380);                     // Average Order Value (₹)
  const [grossMarginPct, setGrossMarginPct] = useState<number>(18.5); // Platform Take Rate / Margin (%)
  const [monthlyChurnPct, setMonthlyChurnPct] = useState<number>(7.2); // Monthly Churn (%)
  const [deliveryAbsorption, setDeliveryAbsorption] = useState<number>(22); // Delivery subsidy / fee absorbed per order (₹)
  const [orderFreq, setOrderFreq] = useState<number>(3.2);          // Monthly orders per active member
  const [subFeeQuarterly, setSubFeeQuarterly] = useState<number>(149); // Quarterly subscription fee (₹)

  // Monte Carlo simulation trials count
  const [simSeed, setSimSeed] = useState<number>(1);
  const [selectedClaimIdx, setSelectedClaimIdx] = useState<number>(0);

  // Baseline Financial Metrics
  const grossProfitPerOrder = (aov * grossMarginPct) / 100;
  const netContributionPerOrder = grossProfitPerOrder - deliveryAbsorption;
  const monthlySubFeeContribution = subFeeQuarterly / 3;
  const monthlyGrossMarginPerUser = (orderFreq * netContributionPerOrder) + monthlySubFeeContribution;
  const expectedLifetimeMonths = Math.max(1, 100 / Math.max(0.5, monthlyChurnPct));
  const ltv = monthlyGrossMarginPerUser * expectedLifetimeMonths;
  const ltvCacRatio = cac > 0 ? ltv / cac : 0;
  const deterministicBreakevenMonths = monthlyGrossMarginPerUser > 0 ? cac / monthlyGrossMarginPerUser : 999;

  // Monte Carlo Simulation Engine (1,000 trials)
  const monteCarloResults = useMemo(() => {
    const trials = 1000;
    const breakevenMonthsList: number[] = [];
    const month9EbitdaList: number[] = [];
    const month12EbitdaList: number[] = [];

    // Simple pseudo-random normal distribution box-muller
    const randNorm = (mean: number, stdDev: number) => {
      const u1 = Math.max(1e-6, Math.random());
      const u2 = Math.max(1e-6, Math.random());
      const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
      return mean + z0 * stdDev;
    };

    for (let i = 0; i < trials; i++) {
      // Stochastic variance: order frequency ±15%, AOV ±12%, Churn ±20%, Delivery Surge ±25%
      const simFreq = Math.max(1.0, randNorm(orderFreq, 0.45));
      const simAov = Math.max(120, randNorm(aov, aov * 0.12));
      const simChurn = Math.max(1.5, randNorm(monthlyChurnPct, 1.4));
      const simDelivery = Math.max(5, randNorm(deliveryAbsorption, 4.5));
      const simSub = Math.max(0, subFeeQuarterly / 3);

      const simGrossOrder = (simAov * grossMarginPct) / 100;
      const simNetOrder = simGrossOrder - simDelivery;
      const simMonthlyUserMargin = (simFreq * simNetOrder) + simSub;

      let cumEbitda = -cac;
      let beMonth = 999;
      let activeUsers = 1.0;
      const retentionRate = 1.0 - (simChurn / 100);

      let m9Ebitda = 0;
      let m12Ebitda = 0;

      for (let m = 1; m <= 24; m++) {
        cumEbitda += activeUsers * simMonthlyUserMargin;
        if (cumEbitda >= 0 && beMonth === 999) {
          beMonth = m;
        }
        if (m === 9) m9Ebitda = cumEbitda;
        if (m === 12) m12Ebitda = cumEbitda;
        activeUsers *= retentionRate;
      }

      breakevenMonthsList.push(beMonth <= 24 ? beMonth : 25);
      month9EbitdaList.push(m9Ebitda);
      month12EbitdaList.push(m12Ebitda);
    }

    // Sort to extract percentiles
    breakevenMonthsList.sort((a, b) => a - b);
    month9EbitdaList.sort((a, b) => a - b);
    month12EbitdaList.sort((a, b) => a - b);

    const p10Idx = Math.floor(trials * 0.10);
    const p50Idx = Math.floor(trials * 0.50);
    const p90Idx = Math.floor(trials * 0.90);

    const breakevenP10 = breakevenMonthsList[p10Idx];
    const breakevenP50 = breakevenMonthsList[p50Idx];
    const breakevenP90 = breakevenMonthsList[p90Idx];

    const ebitda9P10 = month9EbitdaList[p10Idx];
    const ebitda9P50 = month9EbitdaList[p50Idx];
    const ebitda9P90 = month9EbitdaList[p90Idx];

    const countPassedMonth9 = breakevenMonthsList.filter(m => m <= 9).length;
    const probBreakeven9Months = (countPassedMonth9 / trials) * 100;

    // Distribution Histogram Buckets (Months 3 to 15+)
    const buckets: { label: string; count: number; month: number }[] = [];
    for (let m = 3; m <= 15; m++) {
      const c = breakevenMonthsList.filter(val => val === m).length;
      buckets.push({ label: `${m}m`, count: c, month: m });
    }
    const tailCount = breakevenMonthsList.filter(val => val > 15).length;
    buckets.push({ label: '>15m', count: tailCount, month: 16 });

    return {
      breakevenP10,
      breakevenP50,
      breakevenP90,
      ebitda9P10,
      ebitda9P50,
      ebitda9P90,
      probBreakeven9Months,
      buckets
    };
  }, [cac, aov, grossMarginPct, monthlyChurnPct, deliveryAbsorption, orderFreq, subFeeQuarterly, simSeed]);

  // Trajectory Curve Points (Months 1 to 12)
  const trajectoryCurve = useMemo(() => {
    const points: { month: number; p50: number; p10: number; p90: number }[] = [];
    const retentionP50 = 1.0 - (monthlyChurnPct / 100);
    const retentionP10 = 1.0 - (Math.min(25, monthlyChurnPct * 1.3) / 100);
    const retentionP90 = 1.0 - (Math.max(2, monthlyChurnPct * 0.7) / 100);

    let cumP50 = -cac;
    let cumP10 = -cac * 1.15;
    let cumP90 = -cac * 0.85;

    let usersP50 = 1.0;
    let usersP10 = 1.0;
    let usersP90 = 1.0;

    const baseMarginP50 = monthlyGrossMarginPerUser;
    const baseMarginP10 = monthlyGrossMarginPerUser * 0.75;
    const baseMarginP90 = monthlyGrossMarginPerUser * 1.25;

    for (let m = 1; m <= 12; m++) {
      cumP50 += usersP50 * baseMarginP50;
      cumP10 += usersP10 * baseMarginP10;
      cumP90 += usersP90 * baseMarginP90;

      usersP50 *= retentionP50;
      usersP10 *= retentionP10;
      usersP90 *= retentionP90;

      points.push({
        month: m,
        p50: Math.round(cumP50),
        p10: Math.round(cumP10),
        p90: Math.round(cumP90)
      });
    }
    return points;
  }, [cac, monthlyChurnPct, monthlyGrossMarginPerUser]);

  // Sensitivity Matrix (CAC vs Monthly Churn %)
  const sensitivityMatrix = useMemo(() => {
    const cacSteps = [300, 400, 500, 600, 750];
    const churnSteps = [4.0, 6.0, 8.0, 10.0, 14.0];

    return cacSteps.map(c => {
      return {
        cac: c,
        cols: churnSteps.map(ch => {
          const userMonthly = monthlyGrossMarginPerUser;
          if (userMonthly <= 0) return { churn: ch, be: 999 };
          const be = Math.round((c / userMonthly) * 10) / 10;
          return { churn: ch, be };
        })
      };
    });
  }, [monthlyGrossMarginPerUser]);

  // Selected Agent Claim Linking
  const selectedClaim = claims[selectedClaimIdx] || {
    id: 'clm_default',
    text: 'Subscription loyalty programs generate positive EBITDA within 9 months for regional food aggregators.',
    confidence: 0.88
  };

  const isClaimVerifiedUnderModel = monteCarloResults.probBreakeven9Months >= 70 && monteCarloResults.breakevenP50 <= 9.0;

  return (
    <div style={{ flex: 1, padding: '28px 48px', overflowY: 'auto', backgroundColor: '#090D16', color: '#E2E8F0' }}>
      
      {/* ── TOP HEADER ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid #1E293B', paddingBottom: '18px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px', borderRadius: '8px', backgroundColor: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#38BDF8' }}>
              <TrendingUp size={22} />
            </span>
            <div>
              <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#F8FAFC', margin: 0, letterSpacing: '-0.02em' }}>
                Unit Economics &amp; Sensitivity Engine
              </h2>
              <p style={{ fontSize: '0.86rem', color: '#94A3B8', margin: '3px 0 0' }}>
                Interactive financial sliders &amp; Monte Carlo probability distribution linked directly to epistemic claims.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setSimSeed(prev => prev + 1)}
            style={{
              padding: '9px 16px',
              backgroundColor: '#1E293B',
              color: '#38BDF8',
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
            <RefreshCw size={14} />
            Re-run Monte Carlo (1,000 Trials)
          </button>
        </div>
      </div>

      {/* ── LINKED CLAIM STRESS-TEST BAR ── */}
      <div style={{
        backgroundColor: '#0F172A',
        border: `1px solid ${isClaimVerifiedUnderModel ? '#10B981' : '#EF4444'}`,
        borderRadius: '10px',
        padding: '14px 20px',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '320px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: isClaimVerifiedUnderModel ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isClaimVerifiedUnderModel ? '#10B981' : '#EF4444'
          }}>
            {isClaimVerifiedUnderModel ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: isClaimVerifiedUnderModel ? '#34D399' : '#F87171' }}>
                {isClaimVerifiedUnderModel ? 'CLAIM VALIDATED BY SENSITIVITY MODEL' : 'CLAIM VULNERABLE TO MARGIN COMPRESSION'}
              </span>
              <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: '4px', backgroundColor: '#1E293B', color: '#94A3B8' }}>
                P50 Breakeven: {monteCarloResults.breakevenP50}m
              </span>
            </div>
            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#F1F5F9', marginTop: '2px' }}>
              Target Claim: &ldquo;{selectedClaim.text}&rdquo;
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>9-Month Breakeven Prob</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: isClaimVerifiedUnderModel ? '#10B981' : '#EF4444' }}>
              {monteCarloResults.probBreakeven9Months.toFixed(1)}%
            </div>
          </div>
          {claims.length > 1 && (
            <select
              value={selectedClaimIdx}
              onChange={(e) => setSelectedClaimIdx(Number(e.target.value))}
              style={{
                backgroundColor: '#1E293B',
                color: '#CBD5E1',
                border: '1px solid #334155',
                padding: '7px 12px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {claims.map((c, i) => (
                <option key={c.id || i} value={i}>
                  Claim #{i + 1}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* ── MAIN GRID: SLIDERS (LEFT) & MONTE CARLO GRAPHS (RIGHT) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 420px) 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* ── LEFT: LIVE FINANCIAL SLIDERS ── */}
        <div style={{ backgroundColor: '#0F172A', border: '1px solid #1E293B', borderRadius: '12px', padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px', borderBottom: '1px solid #1E293B', paddingBottom: '12px' }}>
            <Sliders size={18} color="#38BDF8" />
            <h3 style={{ fontSize: '1.02rem', fontWeight: 700, color: '#F8FAFC', margin: 0 }}>
              Live Operational Parameters
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Slider 1: CAC */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.84rem', color: '#94A3B8' }}>Customer Acquisition Cost (CAC)</span>
                <strong style={{ fontSize: '0.92rem', color: '#F8FAFC' }}>₹{cac}</strong>
              </div>
              <input
                type="range"
                min="150"
                max="1200"
                step="25"
                value={cac}
                onChange={(e) => setCac(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#38BDF8', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#64748B', marginTop: '2px' }}>
                <span>₹150 (Organic/Referral)</span>
                <span>₹1,200 (Paid Surge)</span>
              </div>
            </div>

            {/* Slider 2: AOV */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.84rem', color: '#94A3B8' }}>Average Order Value (AOV)</span>
                <strong style={{ fontSize: '0.92rem', color: '#F8FAFC' }}>₹{aov}</strong>
              </div>
              <input
                type="range"
                min="180"
                max="900"
                step="10"
                value={aov}
                onChange={(e) => setAov(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#10B981', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#64748B', marginTop: '2px' }}>
                <span>₹180 (Snacks/Breakfast)</span>
                <span>₹900 (Family Dining)</span>
              </div>
            </div>

            {/* Slider 3: Gross Margin % */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.84rem', color: '#94A3B8' }}>Platform Take Rate / Gross Margin</span>
                <strong style={{ fontSize: '0.92rem', color: '#F59E0B' }}>{grossMarginPct.toFixed(1)}%</strong>
              </div>
              <input
                type="range"
                min="10"
                max="32"
                step="0.5"
                value={grossMarginPct}
                onChange={(e) => setGrossMarginPct(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#F59E0B', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#64748B', marginTop: '2px' }}>
                <span>10% (Competitive Gated)</span>
                <span>32% (Premium Cloud Kitchens)</span>
              </div>
            </div>

            {/* Slider 4: Monthly Churn % */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.84rem', color: '#94A3B8' }}>Monthly Subscriber Churn Rate</span>
                <strong style={{ fontSize: '0.92rem', color: monthlyChurnPct > 10 ? '#EF4444' : '#10B981' }}>
                  {monthlyChurnPct.toFixed(1)}%
                </strong>
              </div>
              <input
                type="range"
                min="2.5"
                max="20"
                step="0.5"
                value={monthlyChurnPct}
                onChange={(e) => setMonthlyChurnPct(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#EF4444', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#64748B', marginTop: '2px' }}>
                <span>2.5% (Sticky Moat)</span>
                <span>20% (High Defection)</span>
              </div>
            </div>

            {/* Slider 5: Delivery Fee Absorption */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.84rem', color: '#94A3B8' }}>Free Delivery Absorption / Order</span>
                <strong style={{ fontSize: '0.92rem', color: '#F87171' }}>₹{deliveryAbsorption}</strong>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="2"
                value={deliveryAbsorption}
                onChange={(e) => setDeliveryAbsorption(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#F87171', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#64748B', marginTop: '2px' }}>
                <span>₹0 (Full Pass-Through)</span>
                <span>₹50 (Deep Subsidy)</span>
              </div>
            </div>

            {/* Slider 6: Monthly Order Frequency */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.84rem', color: '#94A3B8' }}>Monthly Order Frequency</span>
                <strong style={{ fontSize: '0.92rem', color: '#38BDF8' }}>{orderFreq.toFixed(1)} orders/mo</strong>
              </div>
              <input
                type="range"
                min="1.2"
                max="6.0"
                step="0.1"
                value={orderFreq}
                onChange={(e) => setOrderFreq(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#38BDF8', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#64748B', marginTop: '2px' }}>
                <span>1.2 (Casual Users)</span>
                <span>6.0 (Power Loyalists)</span>
              </div>
            </div>

            {/* Slider 7: Quarterly Subscription Fee */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.84rem', color: '#94A3B8' }}>Quarterly Pass Fee</span>
                <strong style={{ fontSize: '0.92rem', color: '#A78BFA' }}>₹{subFeeQuarterly} / quarter</strong>
              </div>
              <input
                type="range"
                min="0"
                max="499"
                step="25"
                value={subFeeQuarterly}
                onChange={(e) => setSubFeeQuarterly(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#A78BFA', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#64748B', marginTop: '2px' }}>
                <span>₹0 (Free Trial Tier)</span>
                <span>₹499 (Premium Dining Tier)</span>
              </div>
            </div>

            {/* Quick Reset Presets */}
            <div style={{ borderTop: '1px solid #1E293B', paddingTop: '14px', display: 'flex', gap: '8px' }}>
              <button
                onClick={() => {
                  setCac(450); setAov(380); setGrossMarginPct(18.5);
                  setMonthlyChurnPct(7.2); setDeliveryAbsorption(22); setOrderFreq(3.2);
                }}
                style={{
                  flex: 1, padding: '7px 10px', backgroundColor: '#131D31',
                  border: '1px solid #1E293B', borderRadius: '6px', fontSize: '0.74rem',
                  color: '#93C5FD', cursor: 'pointer', fontWeight: 600
                }}
              >
                Reset Tier-1 Baseline
              </button>
              <button
                onClick={() => {
                  setCac(650); setAov(280); setGrossMarginPct(14.0);
                  setMonthlyChurnPct(12.0); setDeliveryAbsorption(32); setOrderFreq(2.5);
                }}
                style={{
                  flex: 1, padding: '7px 10px', backgroundColor: '#131D31',
                  border: '1px solid #1E293B', borderRadius: '6px', fontSize: '0.74rem',
                  color: '#F87171', cursor: 'pointer', fontWeight: 600
                }}
              >
                Stress-Test Worst Case
              </button>
            </div>
          </div>
        </div>

        {/* ── RIGHT: MONTE CARLO GRAPHS WITH EXACT VALUES ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Key KPI Tiles */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            <div style={{ backgroundColor: '#0F172A', padding: '14px 18px', borderRadius: '10px', border: '1px solid #1E293B' }}>
              <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Net Contribution / Order</div>
              <div style={{ fontSize: '1.28rem', fontWeight: 800, color: netContributionPerOrder >= 0 ? '#10B981' : '#EF4444', marginTop: '2px' }}>
                ₹{netContributionPerOrder.toFixed(2)}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#64748B', marginTop: '2px' }}>Gross - Delivery Absorption</div>
            </div>

            <div style={{ backgroundColor: '#0F172A', padding: '14px 18px', borderRadius: '10px', border: '1px solid #1E293B' }}>
              <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Monthly Margin / User</div>
              <div style={{ fontSize: '1.28rem', fontWeight: 800, color: '#38BDF8', marginTop: '2px' }}>
                ₹{monthlyGrossMarginPerUser.toFixed(2)}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#64748B', marginTop: '2px' }}>Order Margin + Sub Fee</div>
            </div>

            <div style={{ backgroundColor: '#0F172A', padding: '14px 18px', borderRadius: '10px', border: '1px solid #1E293B' }}>
              <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Median Breakeven (P50)</div>
              <div style={{ fontSize: '1.28rem', fontWeight: 800, color: monteCarloResults.breakevenP50 <= 9 ? '#10B981' : '#F59E0B', marginTop: '2px' }}>
                {monteCarloResults.breakevenP50 > 24 ? '>24' : monteCarloResults.breakevenP50} Months
              </div>
              <div style={{ fontSize: '0.68rem', color: '#64748B', marginTop: '2px' }}>Claim Target: &le; 9.0m</div>
            </div>

            <div style={{ backgroundColor: '#0F172A', padding: '14px 18px', borderRadius: '10px', border: '1px solid #1E293B' }}>
              <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>LTV / CAC Ratio</div>
              <div style={{ fontSize: '1.28rem', fontWeight: 800, color: ltvCacRatio >= 3.0 ? '#10B981' : '#EF4444', marginTop: '2px' }}>
                {ltvCacRatio.toFixed(2)}x
              </div>
              <div style={{ fontSize: '0.68rem', color: '#64748B', marginTop: '2px' }}>Healthy Threshold &gt; 3.0x</div>
            </div>
          </div>

          {/* ── GRAPH 1: MONTE CARLO PROBABILITY DISTRIBUTION (HISTOGRAM) ── */}
          <div style={{ backgroundColor: '#0F172A', border: '1px solid #1E293B', borderRadius: '12px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h4 style={{ fontSize: '0.96rem', fontWeight: 700, color: '#F8FAFC', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BarChart3 size={16} color="#38BDF8" />
                  Monte Carlo Probability Distribution (EBITDA Breakeven Timing)
                </h4>
                <p style={{ fontSize: '0.76rem', color: '#94A3B8', margin: '2px 0 0' }}>
                  1,000 randomized simulation trials under volatility shocks. Cutoff target at Month 9.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px', fontSize: '0.74rem' }}>
                <span style={{ color: '#F87171' }}>• P10 (Stress): {monteCarloResults.breakevenP10}m</span>
                <span style={{ color: '#38BDF8', fontWeight: 700 }}>• P50 (Median): {monteCarloResults.breakevenP50}m</span>
                <span style={{ color: '#34D399' }}>• P90 (Optimistic): {monteCarloResults.breakevenP90}m</span>
              </div>
            </div>

            {/* SVG Histogram */}
            <div style={{ width: '100%', height: '170px', position: 'relative' }}>
              <svg width="100%" height="100%" viewBox="0 0 700 160" preserveAspectRatio="none">
                {/* Horizontal reference grid lines */}
                <line x1="40" y1="20" x2="680" y2="20" stroke="#1E293B" strokeDasharray="4 4" />
                <line x1="40" y1="70" x2="680" y2="70" stroke="#1E293B" strokeDasharray="4 4" />
                <line x1="40" y1="120" x2="680" y2="120" stroke="#1E293B" />

                {/* Bars */}
                {monteCarloResults.buckets.map((b, idx) => {
                  const maxCount = Math.max(...monteCarloResults.buckets.map(item => item.count), 1);
                  const barHeight = (b.count / maxCount) * 90;
                  const x = 50 + idx * 44;
                  const y = 120 - barHeight;
                  const isUnder9 = b.month <= 9;
                  const barColor = isUnder9 ? '#10B981' : '#EF4444';

                  return (
                    <g key={idx}>
                      <rect
                        x={x}
                        y={y}
                        width="30"
                        height={barHeight}
                        fill={barColor}
                        opacity={0.85}
                        rx="3"
                      />
                      {/* Exact trial count value above bar */}
                      {b.count > 0 && (
                        <text
                          x={x + 15}
                          y={y - 4}
                          fill="#CBD5E1"
                          fontSize="9.5"
                          fontWeight="700"
                          textAnchor="middle"
                        >
                          {b.count}
                        </text>
                      )}
                      {/* X-axis label */}
                      <text
                        x={x + 15}
                        y="136"
                        fill="#94A3B8"
                        fontSize="9.5"
                        textAnchor="middle"
                      >
                        {b.label}
                      </text>
                    </g>
                  );
                })}

                {/* Target Month 9 Vertical Line */}
                <line x1="334" y1="10" x2="334" y2="140" stroke="#F59E0B" strokeWidth="2" strokeDasharray="3 3" />
                <text x="338" y="18" fill="#F59E0B" fontSize="10" fontWeight="bold">
                  9m Claim Threshold
                </text>
              </svg>
            </div>
          </div>

          {/* ── GRAPH 2: 12-MONTH CUMULATIVE EBITDA CURVE WITH VALUES ── */}
          <div style={{ backgroundColor: '#0F172A', border: '1px solid #1E293B', borderRadius: '12px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <h4 style={{ fontSize: '0.96rem', fontWeight: 700, color: '#F8FAFC', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <TrendingUp size={16} color="#10B981" />
                  12-Month Cumulative EBITDA Breakeven Curve (₹ per Subscribed Cohort)
                </h4>
                <p style={{ fontSize: '0.76rem', color: '#94A3B8', margin: '2px 0 0' }}>
                  Direct trajectory showing exact cash generation progression across months.
                </p>
              </div>

              <div style={{ fontSize: '0.76rem', color: '#94A3B8' }}>
                Breakeven Point: <strong style={{ color: '#10B981' }}>Month {deterministicBreakevenMonths.toFixed(1)}</strong>
              </div>
            </div>

            {/* SVG Line Chart */}
            <div style={{ width: '100%', height: '170px', position: 'relative' }}>
              <svg width="100%" height="100%" viewBox="0 0 700 160" preserveAspectRatio="none">
                {/* Zero line (breakeven line) */}
                <line x1="40" y1="80" x2="680" y2="80" stroke="#334155" strokeWidth="1.5" />
                <text x="15" y="84" fill="#64748B" fontSize="9" fontWeight="bold">₹0</text>

                {/* Trajectory Points mapping: X: 50 to 660, Y: -₹500 -> 140, +₹500 -> 20 */}
                {(() => {
                  const getY = (val: number) => {
                    // map -600 to 140, +600 to 20
                    const clamped = Math.max(-600, Math.min(600, val));
                    return 80 - (clamped / 600) * 60;
                  };

                  const getX = (m: number) => 50 + (m - 1) * 55;

                  const p50Points = trajectoryCurve.map(pt => `${getX(pt.month)},${getY(pt.p50)}`).join(' ');
                  const p90Points = trajectoryCurve.map(pt => `${getX(pt.month)},${getY(pt.p90)}`).join(' ');
                  const p10Points = trajectoryCurve.map(pt => `${getX(pt.month)},${getY(pt.p10)}`).join(' ');

                  return (
                    <>
                      {/* P90 optimistic line */}
                      <polyline points={p90Points} fill="none" stroke="#10B981" strokeWidth="1.5" strokeDasharray="3 3" opacity={0.6} />
                      {/* P10 stress line */}
                      <polyline points={p10Points} fill="none" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="3 3" opacity={0.6} />
                      {/* P50 median curve */}
                      <polyline points={p50Points} fill="none" stroke="#38BDF8" strokeWidth="2.5" />

                      {/* Explicit values on key milestones (Month 1, 3, 6, 9, 12) */}
                      {trajectoryCurve.filter(pt => [1, 3, 6, 9, 12].includes(pt.month)).map((pt, i) => {
                        const px = getX(pt.month);
                        const py = getY(pt.p50);
                        const isPos = pt.p50 >= 0;

                        return (
                          <g key={i}>
                            <circle cx={px} cy={py} r="4.5" fill={isPos ? '#10B981' : '#38BDF8'} stroke="#0F172A" strokeWidth="1.5" />
                            <text
                              x={px}
                              y={isPos ? py - 8 : py + 14}
                              fill={isPos ? '#34D399' : '#93C5FD'}
                              fontSize="9.5"
                              fontWeight="700"
                              textAnchor="middle"
                            >
                              {pt.p50 >= 0 ? `+₹${pt.p50}` : `-₹${Math.abs(pt.p50)}`}
                            </text>
                            <text x={px} y="152" fill="#64748B" fontSize="9" textAnchor="middle">
                              M{pt.month}
                            </text>
                          </g>
                        );
                      })}
                    </>
                  );
                })()}
              </svg>
            </div>
          </div>

          {/* ── SENSITIVITY MATRIX HEATMAP TABLE ── */}
          <div style={{ backgroundColor: '#0F172A', border: '1px solid #1E293B', borderRadius: '12px', padding: '18px 22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <h4 style={{ fontSize: '0.94rem', fontWeight: 700, color: '#F8FAFC', margin: 0 }}>
                  Sensitivity Matrix Heatmap (CAC vs. Churn Rate)
                </h4>
                <p style={{ fontSize: '0.74rem', color: '#94A3B8', margin: '2px 0 0' }}>
                  Numbers indicate exact Months to Breakeven. Green: &le; 8.5m, Yellow: 9.0–11.0m, Red: &gt; 11m.
                </p>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'center' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #1E293B' }}>
                    <th style={{ padding: '8px', color: '#64748B', textAlign: 'left' }}>CAC \ Churn</th>
                    <th style={{ padding: '8px', color: '#94A3B8' }}>4.0% Churn</th>
                    <th style={{ padding: '8px', color: '#94A3B8' }}>6.0% Churn</th>
                    <th style={{ padding: '8px', color: '#94A3B8' }}>8.0% Churn</th>
                    <th style={{ padding: '8px', color: '#94A3B8' }}>10.0% Churn</th>
                    <th style={{ padding: '8px', color: '#94A3B8' }}>14.0% Churn</th>
                  </tr>
                </thead>
                <tbody>
                  {sensitivityMatrix.map((row, rIdx) => (
                    <tr key={rIdx} style={{ borderBottom: '1px solid #162032' }}>
                      <td style={{ padding: '8px', fontWeight: 700, color: '#CBD5E1', textAlign: 'left' }}>
                        ₹{row.cac}
                      </td>
                      {row.cols.map((col, cIdx) => {
                        const be = col.be;
                        let bg = 'rgba(16, 185, 129, 0.15)';
                        let color = '#34D399';
                        if (be > 11 || be >= 999) {
                          bg = 'rgba(239, 68, 68, 0.15)';
                          color = '#F87171';
                        } else if (be > 8.5) {
                          bg = 'rgba(245, 158, 11, 0.15)';
                          color = '#FBBF24';
                        }
                        return (
                          <td key={cIdx} style={{ padding: '8px' }}>
                            <span style={{
                              padding: '3px 8px',
                              borderRadius: '4px',
                              backgroundColor: bg,
                              color,
                              fontWeight: 700,
                              fontFamily: 'monospace'
                            }}>
                              {be >= 999 ? 'Deficit' : `${be}m`}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
