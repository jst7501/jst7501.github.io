export type Region = 
  | '전체' | '강원' | '경남' | '전남' | '제주' 
  | '경북' | '전북' | '충북' | '경기';

export type Difficulty = '하' | '중' | '상';

export type RoadConditionType = '정상' | '포트홀' | '블랙아이스' | '낙엽' | '공사' | '젖은노면' | '모래/자갈';

export interface RoadReport {
  id: string;
  type: RoadConditionType;
  message: string;
  description: string;
  locationDesc: string;
  username: string;
  timestamp: number;
  upvotes: number;
  /** 제보 위치 좌표 (코 드라이버 TTS에서 사용) */
  lat?: number;
  lng?: number;
}

export interface RouteSurrounding {
  type: string;
  name: string;
  description: string;
  distanceKm: number;
}

export interface RouteNode {
  lat: number;
  lng: number;
  type: 'start' | 'waypoint' | 'end';
  label?: string;
}

export interface Route {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  icon: string;
  region: Region;
  distanceKm: number;
  timeMinutes: number;
  altitudeDiff: number;
  hairpinCount: number;
  rating: number;
  reviewCount: number;
  difficulty: Difficulty;
  tags: string[];
  currentCondition: RoadConditionType;
  reports: RoadReport[];
  nodes: RouteNode[];
  surroundings: RouteSurrounding[];
}

// ─────────────────────────────────────────────────────────
// Mock Data — 실제 한국 와인딩 로드 좌표
// ─────────────────────────────────────────────────────────
export const MOCK_ROUTES: Route[] = [
  {
    id: 'r1',
    name: '도마령 우회 코스',
    subtitle: '충북 영동군',
    description: '칼산재를 넘어 도마령으로 향하는 아름답고 리드미컬한 중속 코너의 연속입니다.',
    icon: '⛰️',
    region: '충북',
    distanceKm: 24.5,
    timeMinutes: 40,
    altitudeDiff: 320,
    hairpinCount: 12,
    rating: 4.8,
    reviewCount: 156,
    difficulty: '중',
    tags: ['연속 헤어핀', '경치', '한적함'],
    currentCondition: '정상',
    reports: [],
    nodes: [
      { lat: 36.0312, lng: 127.8134, type: 'start', label: '영동IC 진입' },
      { lat: 36.0145, lng: 127.8356, type: 'waypoint', label: '칼산재 입구' },
      { lat: 35.9987, lng: 127.8512, type: 'waypoint', label: '1차 헤어핀 존' },
      { lat: 35.9823, lng: 127.8678, type: 'waypoint', label: '정상부 뷰포인트' },
      { lat: 35.9654, lng: 127.8813, type: 'waypoint', label: '도마령 하강 구간' },
      { lat: 35.9512, lng: 127.8945, type: 'end', label: '도마령 종점' },
    ],
    surroundings: [
      { type: '카페', name: '칼산재 뷰 카페', description: '전망대 카페', distanceKm: 0.3 },
      { type: '주유소', name: '영동 주유소', description: 'SK에너지', distanceKm: 2.1 },
    ],
  },
  {
    id: 'r2',
    name: '호명산 와인딩 코스',
    subtitle: '경기 가평군',
    description: '수도권 최고의 야간 드라이브 명소. 청평댐을 끼고 도는 경치가 일품입니다.',
    icon: '🌲',
    region: '경기',
    distanceKm: 15.2,
    timeMinutes: 25,
    altitudeDiff: 410,
    hairpinCount: 8,
    rating: 4.5,
    reviewCount: 342,
    difficulty: '상',
    tags: ['수도권 접근성', '카페많음', 'S코너'],
    currentCondition: '낙엽',
    reports: [
      { id: 'rep1', type: '낙엽', message: '오후에 비오고 나서 코너에 젖은 낙엽 많습니다.', description: '코너 진입 시 주의', locationDesc: '2번째 헤어핀', username: 'RWD_King', timestamp: Date.now() - 3600000, upvotes: 12, lat: 37.7312, lng: 127.4523 }
    ],
    nodes: [
      { lat: 37.7198, lng: 127.4345, type: 'start', label: '청평댐 주차장' },
      { lat: 37.7256, lng: 127.4412, type: 'waypoint', label: '댐 뷰 S커브' },
      { lat: 37.7312, lng: 127.4523, type: 'waypoint', label: '호명산 진입' },
      { lat: 37.7405, lng: 127.4601, type: 'waypoint', label: '연속 헤어핀' },
      { lat: 37.7489, lng: 127.4678, type: 'end', label: '호명산 정상 주차장' },
    ],
    surroundings: [
      { type: '카페', name: '청평호 카페거리', description: '카페 밀집 지역', distanceKm: 0.5 },
    ],
  },
  {
    id: 'r3',
    name: '지리산 노고단로',
    subtitle: '전남 구례군',
    description: '차로 오를 수 있는 가장 높은 고개 중 하나. 급격한 고저차와 블라인드 코너가 짜릿합니다.',
    icon: '☁️',
    region: '전남',
    distanceKm: 31.0,
    timeMinutes: 55,
    altitudeDiff: 850,
    hairpinCount: 22,
    rating: 4.9,
    reviewCount: 512,
    difficulty: '상',
    tags: ['고저차', '블라인드코너', '절경'],
    currentCondition: '공사',
    reports: [
      { id: 'rep2', type: '공사', message: '정상 부근 1차선 통제 중입니다.', description: '우회도로 이용 권장', locationDesc: '정상 부근 1km', username: '산악러', timestamp: Date.now() - 86400000, upvotes: 45, lat: 35.3312, lng: 127.5678 }
    ],
    nodes: [
      { lat: 35.2834, lng: 127.5912, type: 'start', label: '성삼재 주차장' },
      { lat: 35.2956, lng: 127.5823, type: 'waypoint', label: '1구간 급경사' },
      { lat: 35.3078, lng: 127.5745, type: 'waypoint', label: '블라인드 코너존' },
      { lat: 35.3189, lng: 127.5678, type: 'waypoint', label: '연속 22 헤어핀' },
      { lat: 35.3312, lng: 127.5612, type: 'waypoint', label: '노고단 고개' },
      { lat: 35.3445, lng: 127.5534, type: 'end', label: '노고단 종점' },
    ],
    surroundings: [
      { type: '편의점', name: '성삼재 매점', description: '간단한 음료/간식', distanceKm: 0.1 },
      { type: '화장실', name: '노고단 공중화장실', description: '24시간 개방', distanceKm: 15.0 },
    ],
  },
  {
    id: 'r4',
    name: '한라산 1100고지',
    subtitle: '제주 서귀포시',
    description: '제주의 허리를 가로지르는 환상적인 드라이브 길. 노폭이 넓어 쾌적합니다.',
    icon: '🏝️',
    region: '제주',
    distanceKm: 18.5,
    timeMinutes: 30,
    altitudeDiff: 650,
    hairpinCount: 15,
    rating: 4.7,
    reviewCount: 890,
    difficulty: '중',
    tags: ['야간드라이브', '눈길주의', '넓은노폭'],
    currentCondition: '정상',
    reports: [],
    nodes: [
      { lat: 33.3612, lng: 126.5345, type: 'start', label: '1100도로 진입' },
      { lat: 33.3534, lng: 126.5412, type: 'waypoint', label: '초반 완만 커브' },
      { lat: 33.3456, lng: 126.5523, type: 'waypoint', label: '중간 고도 구간' },
      { lat: 33.3378, lng: 126.5601, type: 'waypoint', label: '1100고지 습지대' },
      { lat: 33.3289, lng: 126.5678, type: 'end', label: '1100고지 휴게소' },
    ],
    surroundings: [
      { type: '휴게소', name: '1100고지 휴게소', description: '뷰 맛집', distanceKm: 0 },
      { type: '주유소', name: '중문 주유소', description: 'GS칼텍스', distanceKm: 8.5 },
    ],
  }
];
