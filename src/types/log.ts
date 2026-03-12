export interface DriveLog {
  id: string;
  routeId: string;
  date: number;
}

export interface Badge {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

export const BADGES: Badge[] = [
  { id: 'first_drive', name: '첫 드라이브', emoji: '🚗', description: '첫 번째 드라이브 로그 기록 완료' },
  { id: '5_courses', name: '5코스 달성', emoji: '🔥', description: '총 5개의 코스 주행 완료' },
  { id: '10_courses', name: '10코스 달성', emoji: '🏆', description: '총 10개의 코스 주행 완료' },
  { id: '100km', name: '100km 돌파', emoji: '💯', description: '총 누적 주행거리 100km 돌파' },
  { id: '500km', name: '500km 돌파', emoji: '🌟', description: '총 누적 주행거리 500km 돌파' },
  { id: 'mountain', name: '산악 정복자', emoji: '⛰️', description: '난이도 상 코스 주행 완료' },
  { id: 'coast', name: '해안선 러너', emoji: '🌊', description: '해안 코스 주행 완료' },
  { id: '3_regions', name: '3지역 탐험', emoji: '🗺️', description: '3개의 다른 지역 코스 방문' },
  { id: 'all_regions', name: '전국 일주', emoji: '🇰🇷', description: '모든 지역 코스 방문 완료' }
];
