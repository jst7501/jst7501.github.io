import React, { useRef, useCallback, useMemo } from 'react';
import { DriveSessionResult } from '../../store/driveStore';
import { analyzePersona } from '../../lib/personaEngine';
import { TrajectoryCanvas } from './TrajectoryCanvas';
import { TelemetryChart } from './TelemetryChart';
import { Download, MapPin, Gauge, Zap, Activity } from 'lucide-react';
import { getStaticMapUrl } from '../../lib/staticMap';

interface ShareCardProps {
  result: DriveSessionResult;
  routeName?: string;
}

/**
 * 하이퍼-글래스모피즘 기반 프리미엄 공유 카드
 * - Naver Static Map 정적 이미지 배경 (캡처 안정성 확보)
 * - 3D 궤적 캔버스 오버레이
 * - 투명도와 블러가 강조된 스탯 그리드
 */
export function ShareCard({ result, routeName }: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const persona = analyzePersona(result);

  const staticMapUrl = useMemo(() => getStaticMapUrl(result.telemetry, 600, 400), [result]);

  const maxSpeedKmh = Math.round(result.maxSpeed * 3.6);
  const avgSpeedKmh = Math.round(result.avgSpeed * 3.6);
  const durationMin = Math.floor(result.durationMs / 60000);
  const durationSec = Math.floor((result.durationMs % 60000) / 1000);
  const durationStr = `${durationMin > 0 ? `${durationMin}m ` : ''}${durationSec.toString().padStart(2, '0')}s`;
  
  const date = new Date(result.startTime);
  const dateStr = `${date.getFullYear()}. ${(date.getMonth() + 1).toString().padStart(2, '0')}. ${date.getDate().toString().padStart(2, '0')}`;

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
        backgroundColor: '#050505',
        scale: 3,
        logging: false,
        useCORS: true,
        allowTaint: true,
      });
      const link = document.createElement('a');
      link.download = `winding_share_${date.getTime()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error('캡처 실패:', e);
    }
  }, [date]);

  return (
    <div className="flex flex-col gap-6">
      {/* ── 캡처 카드 본체 ── */}
      <div
        ref={cardRef}
        style={{
          background: '#050505',
          borderRadius: 32,
          overflow: 'hidden',
          padding: '40px 28px 32px',
          position: 'relative',
        }}
      >
        {/* 장식용 그라데이션 광원 (글래스 효과 극대화) */}
        <div style={{ position: 'absolute', top: -100, left: -60, width: 240, height: 240, background: persona.color, opacity: 0.1, filter: 'blur(80px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -50, right: -40, width: 180, height: 180, background: '#8B5CF6', opacity: 0.08, filter: 'blur(60px)', pointerEvents: 'none' }} />

        {/* ── 헤더 ── */}
        <div style={{ textAlign: 'center', marginBottom: 28, position: 'relative', zIndex: 10 }}>
          <h1 style={{
            fontSize: 32, fontWeight: 900, color: '#ffffff', margin: 0,
            letterSpacing: '-0.03em', lineHeight: 1.1,
          }}>
            {dateStr}
          </h1>
          <p style={{
            fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.4)',
            margin: '8px 0 0',
          }}>
            {routeName || 'FREE DRIVE SESSION'}
          </p>
        </div>

        {/* ── 메인 시각화: 정적 지도 + 캔버스 트레일 ── */}
        <div style={{
          borderRadius: 28,
          overflow: 'hidden',
          marginBottom: 20,
          position: 'relative',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
          aspectRatio: '1.5/1',
          background: '#111318',
        }}>
          {/* 네이버 정적 지도 (배경) */}
          {staticMapUrl && (
             <img 
               src={staticMapUrl} 
               alt="Drive Course Map"
               crossOrigin="anonymous"
               style={{ 
                 position: 'absolute', inset: 0, width: '100%', height: '100%', 
                 objectFit: 'cover', opacity: 0.7, filter: 'grayscale(1) contrast(1.2) brightness(0.6)' 
               }} 
             />
          )}
          
          {/* 캔버스 오버레이 (실제 트레일의 선명함 유지) */}
          <div style={{ position: 'relative', zIndex: 2, pointerEvents: 'none' }}>
            <TrajectoryCanvas
              telemetry={result.telemetry}
              width={800}
              height={533}
            />
          </div>

          {/* WINDING MODE 라벨 */}
          <div style={{
            position: 'absolute', top: 16, right: 16,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            padding: '6px 12px',
            borderRadius: 10,
            border: '1px solid rgba(255,90,0,0.4)',
            zIndex: 10,
          }}>
            <span style={{ fontSize: 10, fontWeight: 900, color: '#FF5A00', letterSpacing: '0.15em' }}>
              WINDING MODE
            </span>
          </div>
        </div>

        {/* ── 2x2 프리미엄 글래스 스탯 ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <PremiumStat icon={<MapPin size={12} />} label="DISTANCE" value={`${totalDistKm}`} unit="km" />
          <PremiumStat icon={<Zap size={12} />} label="AVG SPEED" value={`${avgSpeedKmh}`} unit="km/h" />
          <PremiumStat icon={<Gauge size={12} />} label="TOP SPEED" value={`${maxSpeedKmh}`} unit="km/h" />
          <PremiumStat icon={<Activity size={12} />} label="MAX G" value={result.maxLateralG.toFixed(2)} unit="G" />
        </div>

        {/* ── 페르소나 텍스트 ── */}
        <div style={{
          textAlign: 'center',
          padding: '24px 0 16px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          marginTop: 8,
        }}>
           <div style={{ fontSize: 56, marginBottom: 8, filter: `drop-shadow(0 0 20px ${persona.color}40)` }}>{persona.emoji}</div>
           <h2 style={{
             fontSize: 24, fontWeight: 900, color: '#fff', margin: 0,
             textShadow: `0 0 24px ${persona.color}30`,
           }}>
             {persona.title}
           </h2>
           <p style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.3)', marginTop: 4, letterSpacing: '0.05em' }}>
             {persona.description.toUpperCase()}
           </p>
        </div>

        {/* ── 브랜딩 ── */}
        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <p style={{ fontSize: 16, fontWeight: 950, margin: 0, letterSpacing: '-0.02em' }}>
            <span style={{ color: '#FF5A00' }}>🏁 WINDING</span>
            <span style={{ color: 'rgba(255,255,255,0.8)' }}> NAVI</span>
          </p>
          <p style={{
            fontSize: 8, fontWeight: 800,
            color: 'rgba(255,255,255,0.15)',
            letterSpacing: '0.3em', marginTop: 4,
          }}>
            PREMIUM DRIVING ENGINE
          </p>
        </div>
      </div>

      {/* ── 카드 외부 버튼 ── */}
      <button
        onClick={handleDownload}
        className="w-full py-5 rounded-[24px] bg-gradient-to-r from-[#FF5A00] to-[#FFCC00] text-white font-black text-lg flex items-center justify-center gap-3 shadow-[0_12px_40px_rgba(255,90,0,0.4)] animate-press active:scale-95 transition-all"
      >
        <Download size={22} strokeWidth={3} /> 카드 저장하기
      </button>
    </div>
  );
}

/** 프리미엄 스탯 */
function PremiumStat({ icon, label, value, unit }: { icon: any; label: string; value: string; unit: string }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderRadius: 20,
      padding: '18px 20px',
      border: '1px solid rgba(255,255,255,0.08)',
      boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.05)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <span style={{ color: '#FF5A00', opacity: 0.8 }}>{icon}</span>
        <span style={{ fontSize: 10, fontWeight: 850, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.12em' }}>
          {label}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span style={{
          fontSize: 34, fontWeight: 900, color: '#ffffff', lineHeight: 1,
          fontVariantNumeric: 'tabular-nums',
        }}>
          {value}
        </span>
        {unit && (
          <span style={{ fontSize: 14, fontWeight: 800, color: 'rgba(255,255,255,0.2)' }}>
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}
