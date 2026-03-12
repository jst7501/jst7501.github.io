import { TelemetryPoint } from '../store/driveStore';

/**
 * 네이버 정적 지도(Static Map) API URL 생성기
 * - html2canvas 캡처 시 캔버스/SDK 지도가 누락되는 문제를 해결하기 위해
 *   서버에서 생성된 정지 이미지 주소를 반환합니다.
 */
export function getStaticMapUrl(telemetry: TelemetryPoint[], width: number = 600, height: number = 400): string {
  if (telemetry.length === 0) return '';

  const clientId = import.meta.env.VITE_NAVER_MAP_CLIENT_ID;
  const baseUrl = 'https://naveropenapi.apigw.ntruss.com/map-static/v2/raster';

  // 1) 중심 및 범위 계산
  let minLat = Infinity, maxLat = -Infinity;
  let minLng = Infinity, maxLng = -Infinity;
  
  for (const p of telemetry) {
    if (p.lat < minLat) minLat = p.lat;
    if (p.lat > maxLat) maxLat = p.lat;
    if (p.lng < minLng) minLng = p.lng;
    if (p.lng > maxLng) maxLng = p.lng;
  }

  const centerLat = (minLat + maxLat) / 2;
  const centerLng = (minLng + maxLng) / 2;

  // 2) 줌 레벨 자동 계산 (단순화된 로직)
  const latDiff = maxLat - minLat;
  const lngDiff = maxLng - minLng;
  const maxDiff = Math.max(latDiff, lngDiff);
  
  let level = 12;
  if (maxDiff > 0.5) level = 9;
  else if (maxDiff > 0.2) level = 10;
  else if (maxDiff > 0.1) level = 11;
  else if (maxDiff > 0.05) level = 12;
  else if (maxDiff > 0.02) level = 13;
  else if (maxDiff > 0.01) level = 14;
  else level = 15;

  // 3) 경로 샘플링 (URL 길이 제한 방지)
  // 최대 약 50개 포인트로 제한
  const step = Math.max(1, Math.floor(telemetry.length / 50));
  const sampledPoints = [];
  for (let i = 0; i < telemetry.length; i += step) {
    sampledPoints.push(telemetry[i]);
  }
  // 마지막 포인트 보장
  if (sampledPoints[sampledPoints.length - 1] !== telemetry[telemetry.length - 1]) {
    sampledPoints.push(telemetry[telemetry.length - 1]);
  }

  const pathCoords = sampledPoints.map(p => `${p.lng},${p.lat}`).join('|');
  const pathParam = `color:0xff5a00|weight:5|coords:${pathCoords}`;

  // 4) 마커 (시작/종료)
  const start = telemetry[0];
  const end = telemetry[telemetry.length - 1];
  const markersParam = `type:n|size:small|color:red|pos:${start.lng}%20${start.lat}|pos:${end.lng}%20${end.lat}`;

  const url = `${baseUrl}?w=${width}&h=${height}&center=${centerLng},${centerLat}&level=${level}&X-NCP-APIGW-API-KEY-ID=${clientId}&path=${pathParam}&markers=${markersParam}&scale=2`;

  return url;
}
