import React, { useRef, useCallback } from 'react';
import { DriveSessionResult } from '../../store/driveStore';
import { analyzePersona } from '../../lib/personaEngine';
import { TrajectoryCanvas } from './TrajectoryCanvas';
import { TelemetryChart } from './TelemetryChart';
import { Download, Route, Clock, Gauge, Zap } from 'lucide-react';

interface ShareCardProps {
  result: DriveSessionResult;
  routeName?: string;
}

/**
 * 레퍼런스 이미지 기반 공유 카드
 * - 날짜 + 코스명
 * - 3D 궤적 맵 + WINDING MODE 라벨
 * - 2x2 스탯 그리드
 * - 텔레메트리 차트
 */
export function ShareCard({ result, routeName }: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const persona = analyzePersona(result);

  const maxSpeedKmh = Math.round(result.maxSpeed * 3.6);
  const avgSpeedKmh = Math.round(result.avgSpeed * 3.6);
  const durationMin = Math.floor(result.durationMs / 60000);
  const durationSec = Math.floor((result.durationMs % 60000) / 1000);
  const durationStr = `${durationMin > 0 ? `${durationMin}h ` : ''}${durationSec.toString().padStart(2, '0')}m`;
  const date = new Date(result.startTime);
  const dateStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;

  let totalDistKm = 0;
  for (let i = 1; i < result.telemetry.length; i++) {
    totalDistKm += result.telemetry[i].speed;
  }
  totalDistKm = Math.round(totalDistKm / 1000 * 10) / 10;

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;
    try {
      const mod = await import('html2canvas');
      const html2canvas = mod.default;
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#0c0e13',
        scale: 2,
        logging: false,
        allowTaint: true,
        useCORS: true,
      });
      const link = document.createElement('a');
      link.download = `winding_${dateStr}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error('캡처 실패:', e);
      alert('스크린샷으로 저장해주세요.');
    }
  }, [dateStr]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* ── 캡처 카드 ── */}
      <div
        ref={cardRef}
        style={{
          background: '#0c0e13',
          borderRadius: 24,
          overflow: 'hidden',
          padding: '32px 24px 28px',
        }}
      >
        {/* ── 헤더: 날짜 + 코스명 ── */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <h1 style={{
            fontSize: 28, fontWeight: 900, color: '#ffffff', margin: 0,
            letterSpacing: '-0.02em', lineHeight: 1.2,
          }}>
            {dateStr}
          </h1>
          <p style={{
            fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,0.4)',
            margin: '4px 0 0',
          }}>
            ({routeName || '프리 드라이브'})
          </p>
        </div>

        {/* ── 지도 카드 ── */}
        <div style={{
          borderRadius: 20,
          overflow: 'hidden',
          marginBottom: 16,
          position: 'relative',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <TrajectoryCanvas
            telemetry={result.telemetry}
            width={600}
            height={340}
          />
          {/* WINDING MODE 라벨 */}
          <div style={{
            position: 'absolute', bottom: 12, right: 14,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(10px)',
            padding: '4px 10px',
            borderRadius: 8,
            border: '1px solid rgba(255,90,0,0.3)',
          }}>
            <span style={{ fontSize: 9, fontWeight: 800, color: '#FF5A00', letterSpacing: '0.1em' }}>
              WINDING MODE
            </span>
          </div>
          {/* 속도 범례 (좌하단) */}
          <div style={{
            position: 'absolute', bottom: 12, left: 14,
            display: 'flex', gap: 8, alignItems: 'center',
          }}>
            {[
              { c: '#10B981', l: 'LOW' },
              { c: '#F59E0B', l: 'MID' },
              { c: '#FF5A00', l: 'HIGH' },
              { c: '#EF4444', l: 'MAX' },
            ].map(({ c, l }) => (
              <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 7, fontWeight: 700, color: 'rgba(255,255,255,0.3)' }}>
                <span style={{ width: 8, height: 3, borderRadius: 2, background: c, display: 'inline-block' }} />
                {l}
              </span>
            ))}
          </div>
        </div>

        {/* ── 2x2 스탯 그리드 ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
          <StatCard icon="📍" label="DISTANCE" value={`${totalDistKm}`} unit="km" />
          <StatCard icon="⏱️" label="DURATION" value={durationStr} unit="" />
          <StatCard icon="⚡" label="TOP SPEED" value={`${maxSpeedKmh}`} unit="km/h" />
          <StatCard icon="🎯" label="MAX G-FORCE" value={result.maxLateralG.toFixed(2)} unit="G" />
        </div>

        {/* ── 텔레메트리 차트 ── */}
        {result.telemetry.length > 10 && (
          <div style={{ marginBottom: 14 }}>
            <TelemetryChart telemetry={result.telemetry} height={100} />
          </div>
        )}

        {/* ── 페르소나 뱃지 ── */}
        <div style={{
          textAlign: 'center',
          padding: '12px 0 4px',
          borderTop: '1px solid rgba(255,255,255,0.04)',
        }}>
          <span style={{ fontSize: 28 }}>{persona.emoji}</span>
          <p style={{
            fontSize: 14, fontWeight: 900, color: '#ffffff', margin: '4px 0 0',
            textShadow: `0 0 15px ${persona.color}40`,
          }}>
            {persona.title}
          </p>
        </div>

        {/* ── 하단 브랜드 ── */}
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <p style={{ fontSize: 12, fontWeight: 900, margin: 0 }}>
            <span style={{ color: '#FF5A00' }}>🏁 WINDING</span>
            <span style={{ color: 'rgba(255,255,255,0.8)' }}> NAVI</span>
          </p>
          <p style={{
            fontSize: 7, fontWeight: 600,
            color: 'rgba(255,255,255,0.15)',
            letterSpacing: '0.2em', marginTop: 4,
          }}>
            PREMIUM DRIVING TELEMETRY
          </p>
        </div>
      </div>

      {/* ── 다운로드 버튼 ── */}
      <button
        onClick={handleDownload}
        className="w-full py-4 rounded-[20px] bg-gradient-to-r from-primary to-[#FFCC00] text-white font-black text-base flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(255,90,0,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all"
      >
        <Download size={20} /> 이미지 저장
      </button>
    </div>
  );
}

/** 스탯 카드 (인라인 스타일 — html2canvas 호환) */
function StatCard({ icon, label, value, unit }: { icon: string; label: string; value: string; unit: string }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      borderRadius: 16,
      padding: '14px 16px',
      border: '1px solid rgba(255,255,255,0.05)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
        <span style={{ fontSize: 12 }}>{icon}</span>
        <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em' }}>
          {label}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span style={{
          fontSize: 30, fontWeight: 900, color: '#ffffff', lineHeight: 1,
          fontVariantNumeric: 'tabular-nums',
        }}>
          {value}
        </span>
        {unit && (
          <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.3)' }}>
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}
