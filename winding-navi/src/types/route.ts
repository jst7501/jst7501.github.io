export type Region = 
  | '전체' | '강원' | '경남' | '전남' | '제주' 
  | '경북' | '전북' | '충북' | '경기';

export type Difficulty = '하' | '중' | '상';

export type RoadConditionType = '정상' | '낙엽' | '위험' | '공사';

export interface RoadReport {
  id: string;
  type: RoadConditionType;
  message: string;
  username: string;
  timestamp: number;
  upvotes: number;
}

export interface Route {
  id: string;
  name: string;
  subtitle: string;
  icon: string;
  region: Region;
  distanceKm: number;
  timeMinutes: number;
  hairpinCount: number;
  rating: number;
  reviewCount: number;
  difficulty: Difficulty;
  tags: string[];
  currentCondition: RoadConditionType;
  reports: RoadReport[];
}

// Dummy Data
export const MOCK_ROUTES: Route[] = [
  {
    id: 'r1',
    name: '도마령 우회 코스',
    subtitle: '충북 영동군',
    icon: '⛰️',
    region: '충북',
    distanceKm: 24.5,
    timeMinutes: 40,
    hairpinCount: 12,
    rating: 4.8,
    reviewCount: 156,
    difficulty: '중',
    tags: ['연속 헤어핀', '경치', '한적함'],
    currentCondition: '정상',
    reports: []
  },
  {
    id: 'r2',
    name: '호명산 와인딩 코스',
    subtitle: '경기 가평군',
    icon: '🌲',
    region: '경기',
    distanceKm: 15.2,
    timeMinutes: 25,
    hairpinCount: 8,
    rating: 4.5,
    reviewCount: 342,
    difficulty: '상',
    tags: ['수도권 접근성', '카페많음', 'S코너'],
    currentCondition: '낙엽',
    reports: [
      { id: 'rep1', type: '낙엽', message: '오후에 비오고 나서 코너에 젖은 낙엽 많습니다.', username: 'RWD_King', timestamp: Date.now() - 3600000, upvotes: 12 }
    ]
  },
  {
    id: 'r3',
    name: '지리산 노고단로',
    subtitle: '전남 구례군',
    icon: '☁️',
    region: '전남',
    distanceKm: 31.0,
    timeMinutes: 55,
    hairpinCount: 22,
    rating: 4.9,
    reviewCount: 512,
    difficulty: '상',
    tags: ['고저차', '블라인드코너', '절경'],
    currentCondition: '공사',
    reports: [
      { id: 'rep2', type: '공사', message: '정상 부근 1차선 통제 중입니다.', username: '산악러', timestamp: Date.now() - 86400000, upvotes: 45 }
    ]
  },
  {
    id: 'r4',
    name: '한라산 1100고지',
    subtitle: '제주 서귀포시',
    icon: '🏝️',
    region: '제주',
    distanceKm: 18.5,
    timeMinutes: 30,
    hairpinCount: 15,
    rating: 4.7,
    reviewCount: 890,
    difficulty: '중',
    tags: ['야간드라이브', '눈길주의', '넓은노폭'],
    currentCondition: '정상',
    reports: []
  }
];
