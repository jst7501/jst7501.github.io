import { haversineDistance } from './haversine';

/**
 * 코 드라이버 — 체크포인트/위험 제보 접근 시 음성 알림
 * ─────────────────────────────────────────────────────
 * 1초마다 현재 GPS ↔ 체크포인트 거리를 계산
 * 300m 이내 진입 시 Web Speech TTS로 브리핑
 */

export interface Checkpoint {
  id: string;
  lat: number;
  lng: number;
  type: 'hairpin' | 'blind' | 'report' | 'waypoint';
  message: string;
}

// 이미 안내한 체크포인트 쿨다운 (재안내 방지)
const _announcedSet = new Set<string>();
const ALERT_RADIUS_M = 300;
const COOLDOWN_MS = 60_000; // 같은 체크포인트 1분 쿨다운

/**
 * 현재 위치와 체크포인트 목록을 비교하여 접근 시 TTS 발화
 */
export function checkCoDriverAlerts(
  lat: number,
  lng: number,
  checkpoints: Checkpoint[]
): void {
  for (const cp of checkpoints) {
    const dist = haversineDistance(lat, lng, cp.lat, cp.lng);

    if (dist <= ALERT_RADIUS_M && !_announcedSet.has(cp.id)) {
      // TTS 발화
      speak(cp.message);
      
      // 쿨다운 등록
      _announcedSet.add(cp.id);
      setTimeout(() => _announcedSet.delete(cp.id), COOLDOWN_MS);
    }
  }
}

/**
 * Web Speech API TTS 발화
 */
export function speak(text: string, lang = 'ko-KR'): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    console.warn('[CoDriver] SpeechSynthesis API를 지원하지 않는 브라우저입니다.');
    return;
  }

  // 이전 발화 중이면 취소
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 1.1;   // 약간 빠르게 (긴급감)
  utterance.pitch = 0.9;  // 약간 낮게 (프로 느낌)
  utterance.volume = 1.0;

  window.speechSynthesis.speak(utterance);
}

/**
 * Route 데이터에서 Checkpoint 배열을 생성
 */
export function buildCheckpointsFromRoute(
  nodes: { lat: number; lng: number; type: string; label?: string }[],
  reports?: { id: string; lat?: number; lng?: number; type: string; message: string }[]
): Checkpoint[] {
  const checkpoints: Checkpoint[] = [];

  // 경유지 → 체크포인트
  nodes.forEach((node, idx) => {
    if (node.type === 'waypoint' && node.label) {
      checkpoints.push({
        id: `node_${idx}`,
        lat: node.lat,
        lng: node.lng,
        type: 'waypoint',
        message: `전방 ${node.label} 구간입니다.`,
      });
    }
  });

  // 제보 마커 → 체크포인트
  reports?.forEach(report => {
    if (report.lat && report.lng) {
      checkpoints.push({
        id: `report_${report.id}`,
        lat: report.lat,
        lng: report.lng,
        type: 'report',
        message: `전방 노면 ${report.type} 제보가 있습니다. ${report.message}`,
      });
    }
  });

  return checkpoints;
}

/**
 * 안내 기록 초기화 (주행 시작 시 호출)
 */
export function resetCoDriver(): void {
  _announcedSet.clear();
}
