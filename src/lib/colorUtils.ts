export function speedToColor(speedMs: number): string {
  const kmh = speedMs * 3.6;
  
  if (kmh <= 20) return '#00FFFF'; // 사이안 — 극저속
  if (kmh <= 50) {
    const t = (kmh - 20) / 30;
    return lerpColor('#00FFFF', '#10B981', t); // 사이안 → 초록
  }
  if (kmh <= 80) {
    const t = (kmh - 50) / 30;
    return lerpColor('#10B981', '#F59E0B', t); // 초록 → 노랑/주황
  }
  if (kmh <= 120) {
    const t = (kmh - 80) / 40;
    return lerpColor('#F59E0B', '#EF4444', t); // 주황 → 빨강
  }
  return '#FF00FF'; // 마젠타 — 초고속
}

/**
 * G값 → 테두리 글로우 색상
 */
export function gForceToGlowColor(totalG: number): string {
  if (totalG < 0.3) return 'transparent';
  if (totalG < 0.6) return 'rgba(255, 90, 0, 0.15)';
  if (totalG < 0.9) return 'rgba(245, 158, 11, 0.25)';
  return 'rgba(239, 68, 68, 0.35)';
}

/**
 * 속도 → 테두리 글로우 색상
 */
export function speedToGlowColor(speedMs: number): string {
  const kmh = speedMs * 3.6;
  if (kmh < 40) return 'transparent';
  if (kmh < 80) return 'rgba(16, 185, 129, 0.1)';
  if (kmh < 120) return 'rgba(255, 90, 0, 0.2)';
  return 'rgba(239, 68, 68, 0.3)';
}

/** 두 hex 색상 사이 선형 보간 */
function lerpColor(a: string, b: string, t: number): string {
  const ar = parseInt(a.slice(1, 3), 16);
  const ag = parseInt(a.slice(3, 5), 16);
  const ab = parseInt(a.slice(5, 7), 16);
  const br = parseInt(b.slice(1, 3), 16);
  const bg = parseInt(b.slice(3, 5), 16);
  const bb = parseInt(b.slice(5, 7), 16);

  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${bl.toString(16).padStart(2, '0')}`;
}
