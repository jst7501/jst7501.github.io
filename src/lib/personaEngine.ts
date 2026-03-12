import { TelemetryPoint, DriveSessionResult } from '../store/driveStore';

/**
 * 페르소나 엔진 — 텔레메트리 데이터 기반 재미있는 칭호 자동 부여
 */

export interface Persona {
  id: string;
  title: string;
  emoji: string;
  description: string;
  color: string; // tailwind-compatible hex
}

const PERSONAS: Persona[] = [
  { id: 'tire_killer',    title: '타이어 학살자',    emoji: '🔥', description: '횡 G값이 평균 0.6G를 초과했습니다', color: '#EF4444' },
  { id: 'tofu_driver',    title: '두부 배달부',      emoji: '🥋', description: '종 G값 변화가 극도로 일정합니다', color: '#10B981' },
  { id: 'night_cruiser',  title: '밤안개 크루저',    emoji: '🌙', description: '야간에 낮은 G로 부드럽게 주행했습니다', color: '#8B5CF6' },
  { id: 'knife_braker',   title: '칼잡이',          emoji: '🔪', description: '브레이킹 포인트가 항상 일정합니다', color: '#FF5A00' },
  { id: 'smooth_operator',title: '스무스 오퍼레이터', emoji: '🎵', description: 'G값 그래프가 레이싱라인처럼 부드럽습니다', color: '#14B8A6' },
  { id: 'adrenaline',     title: '아드레날린 중독자', emoji: '⚡', description: '평균 속도가 매우 높았습니다', color: '#F59E0B' },
  { id: 'sunday_driver',  title: '선데이 드라이버',   emoji: '☕', description: '전 구간 안전 속도 유지', color: '#6B7280' },
  { id: 'g_master',       title: 'G 마스터',         emoji: '🎯', description: '마찰원 80% 이상을 골고루 사용', color: '#EC4899' },
];

export function analyzePersona(result: DriveSessionResult): Persona {
  const { telemetry, maxLateralG, maxLongitudinalG, avgSpeed } = result;
  if (telemetry.length === 0) return PERSONAS[6]; // sunday_driver fallback

  // 평균 횡/종 G
  const avgLatG = telemetry.reduce((s, p) => s + Math.abs(p.lateralG), 0) / telemetry.length;
  const avgLonG = telemetry.reduce((s, p) => s + Math.abs(p.longitudinalG), 0) / telemetry.length;

  // 종 G 일관성 (표준편차)
  const lonGValues = telemetry.map(p => Math.abs(p.longitudinalG));
  const lonGMean = lonGValues.reduce((a, b) => a + b, 0) / lonGValues.length;
  const lonGStdDev = Math.sqrt(lonGValues.reduce((s, v) => s + (v - lonGMean) ** 2, 0) / lonGValues.length);

  // G값 부드러움 (횡G 변화율)
  let totalJerk = 0;
  for (let i = 1; i < telemetry.length; i++) {
    totalJerk += Math.abs(telemetry[i].lateralG - telemetry[i - 1].lateralG);
  }
  const avgJerk = totalJerk / Math.max(telemetry.length - 1, 1);

  // 야간 판정 (주행 시작시간 기준)
  const startHour = new Date(result.startTime).getHours();
  const isNight = startHour >= 20 || startHour < 6;

  // 마찰원 사용률 (각 사분면에 점이 얼마나 분포)
  const quadrants = [0, 0, 0, 0]; // NE, NW, SW, SE
  telemetry.forEach(p => {
    if (p.lateralG >= 0 && p.longitudinalG >= 0) quadrants[0]++;
    else if (p.lateralG < 0 && p.longitudinalG >= 0) quadrants[1]++;
    else if (p.lateralG < 0 && p.longitudinalG < 0) quadrants[2]++;
    else quadrants[3]++;
  });
  const minQuadrant = Math.min(...quadrants);
  const quadrantBalance = minQuadrant / (telemetry.length / 4);

  // ── 판정 ──
  if (avgLatG > 0.6) return PERSONAS[0]; // 타이어 학살자
  if (lonGStdDev < 0.05 && avgSpeed > 10) return PERSONAS[1]; // 두부 배달부
  if (isNight && avgLatG < 0.3 && avgSpeed < 15) return PERSONAS[2]; // 밤안개 크루저
  if (lonGStdDev < 0.08 && maxLongitudinalG > 0.4) return PERSONAS[3]; // 칼잡이
  if (avgJerk < 0.05) return PERSONAS[4]; // 스무스 오퍼레이터
  if (avgSpeed > 20) return PERSONAS[5]; // 아드레날린 중독자 (72km/h+)
  if (quadrantBalance > 0.2) return PERSONAS[7]; // G 마스터

  return PERSONAS[6]; // 선데이 드라이버
}

/**
 * 시그니처 코너 분석 — 가장 격렬한 코너 구간 추출
 */
export interface SignatureCorner {
  entryIndex: number;
  exitIndex: number;
  peakLateralG: number;
  minSpeed: number;        // m/s
  brakeDistance: number;    // 에이펙스 전 브레이킹 시작 인덱스와의 거리
  apexIndex: number;
  points: TelemetryPoint[];
}

export function findSignatureCorner(telemetry: TelemetryPoint[]): SignatureCorner | null {
  if (telemetry.length < 10) return null;

  // 횡 G가 가장 높은 지점(에이펙스) 탐색
  let apexIdx = 0;
  let maxLatG = 0;
  telemetry.forEach((p, i) => {
    if (Math.abs(p.lateralG) > maxLatG) {
      maxLatG = Math.abs(p.lateralG);
      apexIdx = i;
    }
  });

  // 에이펙스 기준 ±5초(5포인트) 구간을 시그니처 코너 범위로 설정
  const entryIdx = Math.max(0, apexIdx - 5);
  const exitIdx = Math.min(telemetry.length - 1, apexIdx + 5);
  const cornerPoints = telemetry.slice(entryIdx, exitIdx + 1);

  // 최저 속도 (에이펙스 부근)
  const minSpeed = Math.min(...cornerPoints.map(p => p.speed));

  // 브레이킹 시작 거리 (종G가 급격히 마이너스로 내려가는 첫 지점)
  let brakeStartIdx = entryIdx;
  for (let i = apexIdx; i >= entryIdx; i--) {
    if (telemetry[i].longitudinalG < -0.1) {
      brakeStartIdx = i;
    } else break;
  }

  return {
    entryIndex: entryIdx,
    exitIndex: exitIdx,
    peakLateralG: maxLatG,
    minSpeed,
    brakeDistance: apexIdx - brakeStartIdx,
    apexIndex: apexIdx,
    points: cornerPoints,
  };
}
