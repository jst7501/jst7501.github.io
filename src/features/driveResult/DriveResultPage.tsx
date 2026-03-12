import React, { useRef, useMemo, useCallback } from 'react';
import { DriveSessionResult } from '../../store/driveStore';
import { MOCK_ROUTES } from '../../types/route';
import { TrajectoryCanvas } from './TrajectoryCanvas';
import { TelemetryChart } from './TelemetryChart';
import { TractionCircleReplay } from './TractionCircleReplay';
import { SignatureCornerCard } from './SignatureCornerCard';
import { analyzePersona, findSignatureCorner } from '../../lib/personaEngine';
import { ArrowLeft, Download, Clock, Gauge, Zap, TrendingUp, Route } from 'lucide-react';

interface DriveResultPageProps {
  result: DriveSessionResult;
  onClose: () => void;
}

export function DriveResultPage({ result, onClose }: DriveResultPageProps) {
  const route = MOCK_ROUTES.find(r => r.id === result.routeId);
  const cardRef = useRef<HTMLDivElement>(null);

  // 분석
  const persona = useMemo(() => analyzePersona(result), [result]);
  const signatureCorner = useMemo(() => findSignatureCorner(result.telemetry), [result]);

  // 통계
  const durationMin = Math.floor(result.durationMs / 60000);
  const durationSec = Math.floor((result.durationMs % 60000) / 1000);
  const maxSpeedKmh = Math.round(result.maxSpeed * 3.6);
  const avgSpeedKmh = Math.round(result.avgSpeed * 3.6);

  let totalDistKm = 0;
  for (let i = 1; i < result.telemetry.length; i++) {
    totalDistKm += result.telemetry[i].speed;
  }
  totalDistKm = Math.round(totalDistKm / 1000 * 10) / 10;

  const date = new Date(result.startTime);
  const dateStr = `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')}`;
  const timeStr = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

  // ── 이미지 저장 ──
  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;
    try {
      const mod = await import('html2canvas');
      const html2canvas = mod.default;
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#050505',
        scale: 3,
        logging: false,
        allowTaint: true,
        useCORS: true,
      });
      const link = document.createElement('a');
      link.download = `winding_${dateStr.replace(/\./g, '-')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error('캡처 실패:', e);
      alert('스크린샷으로 저장해주세요.');
    }
  }, [dateStr]);

  return (
    <div className="fixed inset-0 z-[150] bg-bg-base overflow-y-auto hide-scrollbar">

      {/* ── 배경 메시 그라데이션 ── */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at 30% 10%, ${persona.color}18 0%, transparent 50%),
            radial-gradient(ellipse at 70% 80%, rgba(139,92,246,0.08) 0%, transparent 50%),
            linear-gradient(180deg, #050505 0%, #0a0a0e 100%)
          `,
        }}
      />

      {/* ── 상단 네비 ── */}
      <div className="sticky top-0 z-50 flex justify-between items-center px-5 pt-14 pb-4">
        <button
          onClick={onClose}
          className="w-11 h-11 rounded-2xl hyper-glass flex items-center justify-center text-white/80 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </button>

        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all active:scale-95"
          style={{
            background: 'rgba(255,255,255,0.06)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
            color: '#fff',
          }}
        >
          <Download size={16} /> 이미지 저장
        </button>
      </div>

      {/* ══════════════════════════════════════════════
          캡처 대상 영역 — html2canvas 로 캡처
         ══════════════════════════════════════════════ */}
      <div
        ref={cardRef}
        style={{
          background: '#050505',
          paddingBottom: 32,
        }}
      >
        <div className="relative z-10 px-5 pb-8">

          {/* ── 페르소나 히어로 ── */}
          <div className="text-center mb-6">
            <p
              style={{
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: '0.2em',
                color: 'rgba(255,255,255,0.3)',
                textTransform: 'uppercase',
                marginBottom: 16,
              }}
            >
              DRIVE COMPLETE
            </p>

            <div style={{ position: 'relative', width: 'fit-content', margin: '0 auto' }}>
              {/* Glow */}
              <div
                style={{
                  position: 'absolute',
                  inset: -16,
                  borderRadius: '50%',
                  background: persona.color,
                  opacity: 0.2,
                  filter: 'blur(30px)',
                }}
              />
              <div
                style={{
                  position: 'relative',
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 52,
                  background: 'rgba(255,255,255,0.04)',
                  border: `3px solid ${persona.color}60`,
                  boxShadow: `0 0 30px ${persona.color}30, inset 0 1px 0 rgba(255,255,255,0.05)`,
                }}
              >
                {persona.emoji}
              </div>
            </div>

            <h1
              style={{
                fontSize: 26,
                fontWeight: 900,
                color: '#fff',
                marginTop: 14,
                marginBottom: 4,
                textShadow: `0 0 24px ${persona.color}30`,
              }}
            >
              {persona.title}
            </h1>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
              {persona.description}
            </p>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.2)', marginTop: 4 }}>
              {route?.name || '프리 드라이브'} • {dateStr} {timeStr}
            </p>
          </div>

          {/* ── 경로 지도 (히어로 섹션) ── */}
          <div
            style={{
              borderRadius: 24,
              overflow: 'hidden',
              marginBottom: 16,
              position: 'relative',
              border: '1px solid rgba(255,255,255,0.06)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
            }}
          >
            <TrajectoryCanvas
              telemetry={result.telemetry}
              width={800}
              height={460}
            />
            {/* Glass overlay — WINDING MODE 라벨 */}
            <div
              style={{
                position: 'absolute',
                bottom: 14,
                right: 14,
                background: 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                padding: '5px 12px',
                borderRadius: 10,
                border: '1px solid rgba(255,90,0,0.25)',
              }}
            >
              <span style={{ fontSize: 9, fontWeight: 800, color: '#FF5A00', letterSpacing: '0.15em' }}>
                WINDING MODE
              </span>
            </div>
            {/* Speed Legend */}
            <div
              style={{
                position: 'absolute',
                bottom: 14,
                left: 14,
                display: 'flex',
                gap: 10,
                alignItems: 'center',
                background: 'rgba(0,0,0,0.4)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                padding: '4px 10px',
                borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              {[
                { c: '#10B981', l: 'LOW' },
                { c: '#F59E0B', l: 'MID' },
                { c: '#FF5A00', l: 'HIGH' },
                { c: '#EF4444', l: 'MAX' },
              ].map(({ c, l }) => (
                <span
                  key={l}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                    fontSize: 7,
                    fontWeight: 700,
                    color: 'rgba(255,255,255,0.4)',
                  }}
                >
                  <span
                    style={{
                      width: 10,
                      height: 3,
                      borderRadius: 2,
                      background: c,
                      display: 'inline-block',
                    }}
                  />
                  {l}
                </span>
              ))}
            </div>
          </div>

          {/* ── 2x2 스탯 그리드 (글래스 카드) ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
            <GlassStatCard icon="📍" label="DISTANCE" value={`${totalDistKm}`} unit="km" />
            <GlassStatCard icon="⏱️" label="DURATION" value={`${durationMin > 0 ? `${durationMin}m ` : ''}${durationSec.toString().padStart(2, '0')}s`} unit="" />
            <GlassStatCard icon="⚡" label="TOP SPEED" value={`${maxSpeedKmh}`} unit="km/h" />
            <GlassStatCard icon="🎯" label="MAX G" value={result.maxLateralG.toFixed(2)} unit="G" />
          </div>

          {/* ── 텔레메트리 차트 ── */}
          {result.telemetry.length > 10 && (
            <div style={{ marginBottom: 16 }}>
              <TelemetryChart telemetry={result.telemetry} height={120} />
            </div>
          )}

          {/* ── 브랜드 워터마크 ── */}
          <div style={{ textAlign: 'center', marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.04)' }}>
            <p style={{ fontSize: 14, fontWeight: 900, margin: 0, letterSpacing: '-0.01em' }}>
              <span style={{ color: '#FF5A00' }}>🏁 WINDING</span>
              <span style={{ color: 'rgba(255,255,255,0.7)' }}> NAVI</span>
            </p>
            <p
              style={{
                fontSize: 7,
                fontWeight: 600,
                color: 'rgba(255,255,255,0.12)',
                letterSpacing: '0.25em',
                marginTop: 4,
              }}
            >
              PREMIUM DRIVING TELEMETRY
            </p>
          </div>
        </div>
      </div>
      {/* ══ 캡처 영역 끝 ══ */}

      {/* ── 캡처 영역 바깥: 상세 분석 섹션들 ── */}
      <div className="relative z-10 px-5 pb-40">

        {/* ── 마찰원 리플레이 ── */}
        {result.telemetry.length > 10 && (
          <div className="mb-5">
            <TractionCircleReplay telemetry={result.telemetry} />
          </div>
        )}

        {/* ── 시그니처 코너 ── */}
        {signatureCorner && (
          <div className="mb-5">
            <SignatureCornerCard corner={signatureCorner} routeName={route?.name || '프리 드라이브'} />
          </div>
        )}

        {/* ── 콤보 요약 ── */}
        {result.comboEvents.length > 0 && (
          <div
            style={{
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 24,
              padding: 24,
              marginBottom: 20,
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
            }}
          >
            <h3 style={{ fontSize: 18, fontWeight: 900, color: '#fff', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 6, height: 24, background: '#10B981', borderRadius: 3, display: 'inline-block', boxShadow: '0 0 12px rgba(16,185,129,0.7)' }} />
              스무스 콤보
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <span style={{ fontSize: 48, fontWeight: 900, color: '#10B981' }}>{result.comboEvents.length}</span>
              <span style={{ fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.4)' }}>Perfect Lines</span>
            </div>
          </div>
        )}

        {/* ── 하단 CTA ── */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={handleDownload}
            style={{
              flex: 1,
              padding: '16px 0',
              borderRadius: 20,
              background: 'rgba(139,92,246,0.12)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(139,92,246,0.25)',
              color: '#A78BFA',
              fontWeight: 900,
              fontSize: 15,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              cursor: 'pointer',
            }}
          >
            <Download size={18} /> 이미지 저장
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '16px 0',
              borderRadius: 20,
              background: 'linear-gradient(135deg, #FF5A00 0%, #FFCC00 100%)',
              border: 'none',
              color: '#fff',
              fontWeight: 900,
              fontSize: 15,
              cursor: 'pointer',
              boxShadow: '0 10px 30px rgba(255,90,0,0.3)',
            }}
          >
            완료
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Glass Stat Card — inline styles for html2canvas
   ═══════════════════════════════════════════ */
function GlassStatCard({
  icon,
  label,
  value,
  unit,
}: {
  icon: string;
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: 20,
        padding: '16px 18px',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 4px 16px rgba(0,0,0,0.2)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <span style={{ fontSize: 14 }}>{icon}</span>
        <span
          style={{
            fontSize: 9,
            fontWeight: 800,
            color: 'rgba(255,255,255,0.3)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase' as const,
          }}
        >
          {label}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span
          style={{
            fontSize: 32,
            fontWeight: 900,
            color: '#ffffff',
            lineHeight: 1,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {value}
        </span>
        {unit && (
          <span style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.25)' }}>
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}
