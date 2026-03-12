export interface Meetup {
  id: string;
  title: string;
  routeId: string;
  dateStr: string;
  timeStr: string;
  currentMembers: number;
  maxMembers: number;
  drivetrainReq: string;
  tags: string[];
  hostName: string;
  hostAvatar?: string;
  isParticipating: boolean;
}

export const MOCK_MEETUPS: Meetup[] = [
  {
    id: 'm1',
    title: '주말 새벽 도마령 한바퀴 돕니다',
    routeId: 'r1',
    dateStr: '2026-03-14',
    timeStr: '05:00',
    currentMembers: 3,
    maxMembers: 5,
    drivetrainReq: '차종 무관',
    tags: ['소수정예', '초보환영', '커피타임'],
    hostName: '와인딩초보',
    isParticipating: false,
  },
  {
    id: 'm2',
    title: 'AWD 랠리 감성 호명산 런',
    routeId: 'r2',
    dateStr: '2026-03-15',
    timeStr: '23:30',
    currentMembers: 8,
    maxMembers: 8,
    drivetrainReq: 'AWD 전용',
    tags: ['하드코어', 'RWD제한'],
    hostName: 'SubiLove',
    isParticipating: false,
  }
];
