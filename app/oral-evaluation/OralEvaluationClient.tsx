'use client';

import { useState, useEffect, CSSProperties } from 'react';

type Phase = 'question' | 'feedback';

const QUESTION = {
  topic: 'Preflight Preparation',
  text: 'You are planning a VFR cross-country flight from KFXE to KORL. How will you prepare for the trip?',
};

const FEEDBACK = {
  score: 2,
  label: 'Adequate, but incomplete',
  covered: ['Weather briefing', 'Fuel planning'],
  missed: ['NOTAMs', 'Weight & Balance'],
  strongerAnswer:
    'For this flight, I would review the latest METARs and TAFs, check NOTAMs, and calculate the weight and balance to ensure we are within limits.',
  whyMatters: 'Neglecting NOTAMs could lead to restricted airspace violations.',
};

// ─── Font tokens ──────────────────────────────────────────────────────────────
const F = {
  display: "var(--font-bebas), 'Bebas Neue', sans-serif",
  serif:   "var(--font-cormorant), 'Cormorant Garamond', serif",
  body:    "var(--font-dm), 'DM Sans', system-ui, sans-serif",
} as const;


function Filters() {
  return (
    <svg aria-hidden="true" style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}>
      <defs>
        {/* Standard panel glass */}
        <filter id="lg" x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.018" numOctaves="3" seed="8" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="16" xChannelSelector="R" yChannelSelector="G" />
        </filter>

        {/* Small cards */}
        <filter id="lgs" x="-15%" y="-15%" width="130%" height="130%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.02 0.028" numOctaves="2" seed="14" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="9" xChannelSelector="R" yChannelSelector="G" />
        </filter>

        {/* iOS 26 liquid glass — stronger, higher frequency for prismatic lens effect */}
        <filter id="ios26" x="-25%" y="-25%" width="150%" height="150%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.008 0.011" numOctaves="4" seed="22" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="28" xChannelSelector="R" yChannelSelector="G" result="displaced" />
          <feGaussianBlur in="displaced" stdDeviation="0.4" />
        </filter>
      </defs>
    </svg>
  );
}

// ─── Glass factory ────────────────────────────────────────────────────────────
function glass(id: 'lg' | 'lgs', extra: CSSProperties = {}): CSSProperties {
  return {
    position: 'relative',
    background: 'rgba(255,255,255,0.042)',
    backdropFilter: `url(#${id}) blur(24px) saturate(1.1)`,
    WebkitBackdropFilter: `url(#${id}) blur(24px) saturate(1.1)`,
    border: '1px solid rgba(255,255,255,0.09)',
    boxShadow: '0 8px 36px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
    borderRadius: 16,
    overflow: 'hidden',
    ...extra,
  };
}

// Top-edge refraction shimmer
function EdgeShimmer({ opacity = 0.15 }: { opacity?: number }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute', top: 0, left: '14%', right: '14%', height: 1,
        background: `linear-gradient(90deg, transparent, rgba(255,255,255,${opacity}), transparent)`,
        pointerEvents: 'none', zIndex: 1,
      }}
    />
  );
}

// ─── Section label ────────────────────────────────────────────────────────────
function Label({ children }: { children: string }) {
  return (
    <p style={{
      margin: '0 0 8px',
      fontFamily: F.body,
      fontSize: 10.5,
      fontWeight: 500,
      letterSpacing: '0.2em',
      textTransform: 'uppercase',
      color: 'rgba(255,255,255,0.38)',
    }}>
      {children}
    </p>
  );
}

// ─── Feedback list row ────────────────────────────────────────────────────────
function Row({ text, ok }: { text: string; ok: boolean }) {
  return (
    <li style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, listStyle: 'none' }}>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
        {ok
          ? <path d="M2 6l3 3 5-5" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          : <path d="M3 3l6 6M9 3l-6 6" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
        }
      </svg>
      <span style={{ fontFamily: F.body, fontSize: 13, color: 'rgba(255,255,255,0.65)', fontWeight: 300, lineHeight: 1.5 }}>
        {text}
      </span>
    </li>
  );
}

// ─── Button ───────────────────────────────────────────────────────────────────
function Btn({ label, onClick, primary = false }: { label: string; onClick: () => void; primary?: boolean }) {
  const [hover, setHover] = useState(false);
  const [pressed, setPressed] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        flex: 1,
        height: 44,
        borderRadius: 12,
        fontFamily: F.body,
        fontSize: 12.5,
        fontWeight: 500,
        letterSpacing: '0.06em',
        cursor: 'pointer',
        touchAction: 'manipulation',
        transition: 'background 0.16s ease, border-color 0.16s ease, transform 0.1s ease',
        transform: pressed ? 'scale(0.97)' : 'scale(1)',
        background: primary
          ? hover ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.10)'
          : hover ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.035)',
        border: primary
          ? `1px solid ${hover ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.15)'}`
          : `1px solid ${hover ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.06)'}`,
        color: primary
          ? 'rgba(255,255,255,0.9)'
          : hover ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.38)',
      }}
    >
      {label}
    </button>
  );
}

// ─── iOS 26 Liquid Glass Textarea ─────────────────────────────────────────────
function LiquidTextarea({
  value, onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ position: 'relative', marginBottom: 12 }}>
      {/* Outer prismatic border ring — rainbow refraction on edges */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: -1,
          borderRadius: 19,
          background: focused
            ? `conic-gradient(
                from 180deg,
                rgba(255,255,255,0.22) 0deg,
                rgba(180,200,255,0.18) 60deg,
                rgba(255,180,255,0.12) 120deg,
                rgba(180,255,255,0.16) 180deg,
                rgba(255,255,200,0.12) 240deg,
                rgba(200,180,255,0.16) 300deg,
                rgba(255,255,255,0.22) 360deg
              )`
            : 'rgba(255,255,255,0.07)',
          transition: 'background 0.3s ease',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Specular top highlight */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 1,
          left: '10%',
          right: '10%',
          height: 1,
          background: `linear-gradient(90deg, transparent, rgba(255,255,255,${focused ? 0.28 : 0.14}), transparent)`,
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 2,
          transition: 'background 0.3s ease',
        }}
      />

      {/* Specular left-edge micro-shine */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '8%',
          bottom: '8%',
          left: 1,
          width: 1,
          background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.12), transparent)',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />

      <textarea
        id="answer-field"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type your answer here…"
        rows={5}
        aria-label="Your answer"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'block',
          width: '100%',
          boxSizing: 'border-box',
          resize: 'none',
          borderRadius: 18,
          padding: '16px 20px',
          fontFamily: F.body,
          fontSize: 14,
          lineHeight: 1.65,
          fontWeight: 300,
          // iOS 26 liquid glass: strong blur + saturate + brightness lift
          background: focused
            ? 'rgba(255,255,255,0.072)'
            : 'rgba(255,255,255,0.048)',
          backdropFilter: `url(#ios26) blur(40px) saturate(1.6) brightness(${focused ? 1.18 : 1.08})`,
          WebkitBackdropFilter: `url(#ios26) blur(40px) saturate(1.6) brightness(${focused ? 1.18 : 1.08})`,
          border: 'none',
          outline: 'none',
          color: 'rgba(255,255,255,0.82)',
          boxShadow: focused
            ? '0 0 0 0.5px rgba(255,255,255,0.18), 0 12px 40px rgba(0,0,0,0.45), inset 0 2px 8px rgba(0,0,0,0.2), inset 0 -1px 0 rgba(255,255,255,0.06)'
            : '0 8px 32px rgba(0,0,0,0.4), inset 0 2px 6px rgba(0,0,0,0.22)',
          caretColor: 'rgba(255,255,255,0.6)',
          transition: 'background 0.25s ease, box-shadow 0.25s ease, backdrop-filter 0.25s ease',
        }}
      />
    </div>
  );
}

// ─── Cockpit atmosphere ───────────────────────────────────────────────────────
function Atmosphere() {
  return (
    <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {[
        { l: '8%',  t: '78%', w: 160, h: 80,  c: 'rgba(172,90,14,0.10)' },
        { l: '22%', t: '84%', w: 110, h: 60,  c: 'rgba(8,24,68,0.16)'   },
        { l: '39%', t: '79%', w: 120, h: 68,  c: 'rgba(130,68,10,0.12)' },
        { l: '50%', t: '73%', w: 90,  h: 48,  c: 'rgba(18,44,100,0.09)' },
        { l: '61%', t: '79%', w: 120, h: 68,  c: 'rgba(130,68,10,0.12)' },
        { l: '78%', t: '84%', w: 110, h: 60,  c: 'rgba(8,24,68,0.16)'   },
        { l: '92%', t: '78%', w: 160, h: 80,  c: 'rgba(172,90,14,0.10)' },
        { l: '50%', t: '68%', w: 200, h: 60,  c: 'rgba(45,28,6,0.14)'   },
        { l: '6%',  t: '60%', w: 90,  h: 60,  c: 'rgba(6,14,44,0.13)'   },
        { l: '94%', t: '60%', w: 90,  h: 60,  c: 'rgba(6,14,44,0.13)'   },
      ].map((g, i) => (
        <div key={i} style={{
          position: 'absolute', left: g.l, top: g.t, width: g.w, height: g.h,
          background: `radial-gradient(ellipse, ${g.c} 0%, transparent 75%)`,
          transform: 'translate(-50%,-50%)',
        }} />
      ))}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.03) 3px, rgba(0,0,0,0.03) 4px)',
      }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 260, background: 'linear-gradient(to bottom, rgba(0,0,3,0.94), transparent)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 340, background: 'linear-gradient(to top, rgba(0,0,2,0.97), transparent)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 85% 90% at 50% 50%, transparent 55%, rgba(0,0,2,0.55) 100%)' }} />
    </div>
  );
}

// ─── Phase progress dots ──────────────────────────────────────────────────────
function PhaseDots({ phase }: { phase: Phase }) {
  return (
    <div
      role="progressbar"
      aria-label={phase === 'question' ? 'Step 1 of 2: Question' : 'Step 2 of 2: Feedback'}
      style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 24 }}
    >
      {(['question', 'feedback'] as Phase[]).map((p) => (
        <div
          key={p}
          style={{
            width: phase === p ? 24 : 6,
            height: 6,
            borderRadius: 3,
            background: phase === p
              ? 'linear-gradient(90deg, #aaa, #e8e8e8, #fff)'
              : 'rgba(255,255,255,0.13)',
            transition: 'width 0.35s cubic-bezier(0.22,1,0.36,1), background 0.35s ease',
          }}
        />
      ))}
    </div>
  );
}

// ─── Question phase ───────────────────────────────────────────────────────────
function QuestionPhase({
  answer, setAnswer, onSubmit, onSkip, onMark,
}: {
  answer: string; setAnswer: (v: string) => void;
  onSubmit: () => void; onSkip: () => void; onMark: () => void;
}) {
  return (
    <div>
      <PhaseDots phase="question" />

      {/* ORAL EVALUATION — big Bebas Neue silver gradient */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <h1 style={{
          margin: 0,
          fontFamily: F.display,
          fontSize: 'clamp(52px, 9vw, 82px)',
          fontWeight: 400,
          letterSpacing: '0.12em',
          lineHeight: 1,
          background: `linear-gradient(
            160deg,
            #7a7a7a   0%,
            #b8b8b8  18%,
            #e8e8e8  32%,
            #ffffff  46%,
            #f0f0f0  58%,
            #c8c8c8  72%,
            #8a8a8a  85%,
            #d4d4d4 100%
          )`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          Oral Evaluation
        </h1>

        {/* Topic subtitle — Cormorant, lighter */}
        <p style={{
          margin: '10px 0 0',
          fontFamily: F.serif,
          fontSize: 'clamp(17px, 2.8vw, 22px)',
          fontWeight: 300,
          letterSpacing: '0.06em',
          color: 'rgba(255,255,255,0.45)',
        }}>
          {QUESTION.topic}
        </p>
      </div>

      {/* Question card */}
      <div style={glass('lg', { marginBottom: 12 })}>
        <EdgeShimmer opacity={0.14} />
        <div style={{ padding: '20px 28px' }}>
          <label
            htmlFor="answer-field"
            style={{
              display: 'block',
              fontFamily: F.body,
              fontSize: 14,
              lineHeight: 1.72,
              color: 'rgba(255,255,255,0.72)',
              textAlign: 'center',
              fontWeight: 300,
            }}
          >
            {QUESTION.text}
          </label>
        </div>
      </div>

      {/* iOS 26 liquid glass textarea */}
      <LiquidTextarea value={answer} onChange={setAnswer} />

      <div style={{ display: 'flex', gap: 8 }}>
        <Btn label="Submit" onClick={onSubmit} primary />
        <Btn label="Skip" onClick={onSkip} />
        <Btn label="Mark for Review" onClick={onMark} />
      </div>
    </div>
  );
}

// ─── Feedback phase ───────────────────────────────────────────────────────────
function FeedbackPhase({ onContinue, onReviewLater }: { onContinue: () => void; onReviewLater: () => void }) {
  return (
    <div>
      <PhaseDots phase="feedback" />

      {/* Score heading */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <p style={{
          margin: '0 0 8px',
          fontFamily: F.body,
          fontSize: 10,
          fontWeight: 500,
          letterSpacing: '0.28em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.32)',
        }}>
          Your Score
        </p>
        <h1 style={{
          margin: 0,
          fontFamily: F.display,
          fontSize: 'clamp(36px, 6vw, 56px)',
          fontWeight: 400,
          letterSpacing: '0.06em',
          lineHeight: 1.1,
          background: 'linear-gradient(135deg, #c8781a 0%, #f0aa3c 28%, #f5c060 55%, #e09a2a 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          {FEEDBACK.score} — {FEEDBACK.label}
        </h1>
      </div>

      {/* Covered / Missed */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
        <div style={glass('lgs', { padding: '16px 18px' })}>
          <EdgeShimmer opacity={0.11} />
          <Label>What You Covered</Label>
          <ul style={{ margin: 0, padding: 0 }}>
            {FEEDBACK.covered.map((t) => <Row key={t} text={t} ok={true} />)}
          </ul>
        </div>
        <div style={glass('lgs', { padding: '16px 18px' })}>
          <EdgeShimmer opacity={0.11} />
          <Label>What You Missed</Label>
          <ul style={{ margin: 0, padding: 0 }}>
            {FEEDBACK.missed.map((t) => <Row key={t} text={t} ok={false} />)}
          </ul>
        </div>
      </div>

      <div style={glass('lgs', { padding: '16px 20px', marginBottom: 8 })}>
        <EdgeShimmer opacity={0.11} />
        <Label>Stronger Answer</Label>
        <p style={{ margin: 0, fontFamily: F.body, fontSize: 13.5, lineHeight: 1.7, color: 'rgba(255,255,255,0.62)', fontWeight: 300 }}>
          {FEEDBACK.strongerAnswer}
        </p>
      </div>

      <div style={glass('lgs', { padding: '16px 20px', marginBottom: 14 })}>
        <EdgeShimmer opacity={0.11} />
        <Label>Why This Matters</Label>
        <p style={{ margin: 0, fontFamily: F.body, fontSize: 13.5, lineHeight: 1.7, color: 'rgba(255,255,255,0.62)', fontWeight: 300 }}>
          {FEEDBACK.whyMatters}
        </p>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <Btn label="Continue" onClick={onContinue} primary />
        <Btn label="Review Later" onClick={onReviewLater} />
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function OralEvaluationClient() {
  const [phase, setPhase] = useState<Phase>('question');
  const [answer, setAnswer] = useState('');
  const [mounted, setMounted] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  const go = (fn: () => void) => {
    setFading(true);
    setTimeout(() => { fn(); setFading(false); }, 300);
  };

  return (
    <>
      <style>{`
        ::placeholder { color: rgba(255,255,255,0.2); font-family: var(--font-dm), 'DM Sans', sans-serif; }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>

      <Filters />

      <div style={{
        minHeight: '100dvh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        position: 'relative',
        backgroundImage: `
          radial-gradient(ellipse 90% 60% at 50% 96%, rgba(24,14,4,0.95) 0%, transparent 70%),
          radial-gradient(ellipse 50% 35% at 15% 78%, rgba(5,12,38,0.68) 0%, transparent 60%),
          radial-gradient(ellipse 50% 35% at 85% 78%, rgba(5,12,38,0.68) 0%, transparent 60%),
          radial-gradient(ellipse 30% 22% at 50% 70%, rgba(48,28,6,0.44) 0%, transparent 68%),
          linear-gradient(180deg, rgba(1,1,4,0.55) 0%, rgba(2,4,7,0.55) 35%, rgba(3,4,9,0.55) 65%, rgba(2,2,3,0.55) 100%),
          url('/wmremove-transformed.png')
        `,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}>
        <Atmosphere />

        <div style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: 640,
          padding: '0 28px',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0px)' : 'translateY(22px)',
          transition: 'opacity 0.7s cubic-bezier(0.22,1,0.36,1), transform 0.7s cubic-bezier(0.22,1,0.36,1)',
        }}>
          <div style={{
            opacity: fading ? 0 : 1,
            transform: fading ? 'translateY(5px)' : 'translateY(0px)',
            transition: 'opacity 0.3s ease, transform 0.3s ease',
          }}>
            {phase === 'question' ? (
              <QuestionPhase
                answer={answer}
                setAnswer={setAnswer}
                onSubmit={() => go(() => setPhase('feedback'))}
                onSkip={() => go(() => setAnswer(''))}
                onMark={() => go(() => {})}
              />
            ) : (
              <FeedbackPhase
                onContinue={() => go(() => { setPhase('question'); setAnswer(''); })}
                onReviewLater={() => go(() => { setPhase('question'); setAnswer(''); })}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
