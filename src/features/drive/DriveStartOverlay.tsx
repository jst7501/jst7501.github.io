import React, { useState, useEffect, useRef } from 'react';

interface DriveStartOverlayProps {
  onComplete: () => void;
}

/**
 * 시네마틱 카운트다운 오버레이
 * 3 → 2 → 1 → GO! 
 * 
 * 각 숫자: scale(2)→scale(1) 으로 줌인하면서 opacity 0→1,
 * 그 후 1→0.3으로 서서히 빠지면서 다음 숫자 전환.
 * GO!: 화면 전체 flash + 수평 스윕 + scale bounce
 */
export function DriveStartOverlay({ onComplete }: DriveStartOverlayProps) {
  const [count, setCount] = useState(3);
  const [phase, setPhase] = useState<'count' | 'go' | 'done'>('count');
  const [animState, setAnimState] = useState<'enter' | 'hold' | 'exit'>('enter');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (phase === 'done') return;

    let t1: ReturnType<typeof setTimeout>;
    let t2: ReturnType<typeof setTimeout>;

    if (phase === 'count') {
      // enter → hold (250ms) → exit (200ms) → next
      setAnimState('enter');
      t1 = setTimeout(() => setAnimState('exit'), 550);
      t2 = setTimeout(() => {
        if (count > 1) {
          setCount(c => c - 1);
          setAnimState('enter');
        } else {
          setPhase('go');
          setAnimState('enter');
        }
      }, 800);
    } else if (phase === 'go') {
      setAnimState('enter');
      t2 = setTimeout(() => {
        setPhase('done');
        onComplete();
      }, 900);
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [count, phase, onComplete]);

  if (phase === 'done') return null;

  // 원형 프로그레스 계산 (카운트다운 전체 진행도)
  const totalSteps = 4; // 3,2,1,GO
  const currentStep = phase === 'go' ? 4 : 4 - count;
  const progress = currentStep / totalSteps;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[250] flex items-center justify-center overflow-hidden"
      style={{
        background: phase === 'go' && animState === 'enter'
          ? 'rgba(0,0,0,0.6)'
          : 'rgba(0,0,0,0.85)',
        transition: 'background 0.3s ease',
      }}
    >
      {/* 배경: 생동감 있는 동심원 웨이브 */}
      <div
        className="absolute rounded-full"
        style={{
          width: 300,
          height: 300,
          border: '2px solid rgba(255,90,0,0.08)',
          animation: 'ripple 2s ease-out infinite',
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: 220,
          height: 220,
          border: '1.5px solid rgba(255,90,0,0.12)',
          animation: 'ripple 2s ease-out 0.4s infinite',
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: 140,
          height: 140,
          border: '1px solid rgba(255,90,0,0.18)',
          animation: 'ripple 2s ease-out 0.8s infinite',
        }}
      />

      {/* 프로그레스 링 */}
      <svg
        className="absolute"
        width="200"
        height="200"
        viewBox="0 0 200 200"
        style={{ transform: 'rotate(-90deg)' }}
      >
        {/* 배경 트랙 */}
        <circle
          cx="100" cy="100" r="90"
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="3"
        />
        {/* 진행 */}
        <circle
          cx="100" cy="100" r="90"
          fill="none"
          stroke="url(#progressGrad)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={`${2 * Math.PI * 90}`}
          strokeDashoffset={`${2 * Math.PI * 90 * (1 - progress)}`}
          style={{ transition: 'stroke-dashoffset 0.7s cubic-bezier(0.4,0,0.2,1)' }}
        />
        <defs>
          <linearGradient id="progressGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FF5A00" />
            <stop offset="100%" stopColor="#FFCC00" />
          </linearGradient>
        </defs>
      </svg>

      {/* 숫자 / GO */}
      {phase === 'count' ? (
        <div
          key={count}
          style={{
            transform: animState === 'enter' ? 'scale(1)' : 'scale(0.6)',
            opacity: animState === 'enter' ? 1 : 0,
            transition: animState === 'enter'
              ? 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease-out'
              : 'transform 0.25s ease-in, opacity 0.2s ease-in',
          }}
        >
          <span
            style={{
              fontSize: 130,
              fontWeight: 900,
              color: '#ffffff',
              fontVariantNumeric: 'tabular-nums',
              textShadow: '0 0 80px rgba(255,90,0,0.4), 0 0 160px rgba(255,90,0,0.15)',
              display: 'block',
              lineHeight: 1,
              fontFamily: 'Pretendard, system-ui, sans-serif',
            }}
          >
            {count}
          </span>
        </div>
      ) : (
        <div
          style={{
            transform: animState === 'enter' ? 'scale(1)' : 'scale(1.5)',
            opacity: animState === 'enter' ? 1 : 0,
            transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s ease-out',
          }}
        >
          <span
            style={{
              fontSize: 90,
              fontWeight: 900,
              background: 'linear-gradient(135deg, #FF5A00 0%, #FFCC00 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: 'none',
              filter: 'drop-shadow(0 0 40px rgba(255,90,0,0.5))',
              display: 'block',
              lineHeight: 1,
              letterSpacing: '-0.02em',
            }}
          >
            GO!
          </span>
        </div>
      )}

      {/* GO! 시 화면 가장자리 플래시 */}
      {phase === 'go' && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            boxShadow: 'inset 0 0 120px rgba(255,90,0,0.25)',
            animation: 'flashFade 0.8s ease-out forwards',
          }}
        />
      )}

      {/* 안내 텍스트 (3일 때만) */}
      <div
        className="absolute bottom-32 text-center px-8"
        style={{
          opacity: phase === 'count' && count === 3 ? 1 : 0,
          transform: phase === 'count' && count === 3 ? 'translateY(0)' : 'translateY(10px)',
          transition: 'opacity 0.3s, transform 0.3s',
        }}
      >
        <p style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 700, fontSize: 14, marginBottom: 6 }}>
          🏎️ 주행을 시작합니다
        </p>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, lineHeight: 1.7 }}>
          GPS 추적이 활성화되며 속도·G-Force가 기록됩니다.
          <br />안전 운전하세요!
        </p>
      </div>

      {/* 인라인 애니메이션 keyframes */}
      <style>{`
        @keyframes ripple {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes flashFade {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
