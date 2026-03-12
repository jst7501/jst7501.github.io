import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { MeetupCard } from './MeetupCard';
import { CreateMeetupSheet } from './CreateMeetupSheet';
import { Tag } from '../../components/ui/Tag';

const FILTERS = ['전체', '모집중', '주말', '평일야간', '투어', '세차'];

export function MeetupTab() {
  const [activeFilter, setActiveFilter] = useState('전체');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Mock Data
  const meetups = [
    { id: 1, title: '이번 주말 양평 만남의 광장 집결', date: '이번 주 토요일 오전 6:00', location: '양평 만남의광장 휴게소', currentMember: 3, maxMember: 10, author: '스피드도사', status: '모집중', tags: ['투어', '주말'] },
    { id: 2, title: '평일 퇴근 후 북악 가볍게', date: '오늘 오후 9:00', location: '북악 팔각정', currentMember: 2, maxMember: 4, author: '직장인A', status: '모집중', tags: ['평일야간'] },
    { id: 3, title: '금요일 야간 세차 벙개', date: '이번 주 금요일 오후 10:00', location: '워시존 하남', currentMember: 5, maxMember: 6, author: '광택장인', status: '마감임박', tags: ['세차', '평일야간'] },
  ];

  return (
    <div className="flex flex-col h-full overflow-y-auto hide-scrollbar scroll-smooth">
      {/* Heavy Cyberpunk Header */}
      <div className="sticky top-0 z-30 pt-16 pb-4 bg-bg-base/80 backdrop-blur-2xl border-b border-border-subtle shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
        <div className="px-6 flex justify-between items-center mb-5">
          <h2 className="text-3xl font-black text-white text-glow">번개🔥</h2>
          <button 
            onClick={() => setIsCreateOpen(true)}
            className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-[#FFCC00] flex items-center justify-center text-white shadow-[0_0_20px_rgba(255,90,0,0.4)] hover:scale-110 active:scale-95 transition-transform"
          >
            <Plus size={24} />
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2.5 overflow-x-auto hide-scrollbar px-6 snap-x">
          {FILTERS.map(f => (
            <div key={f} className="snap-start shrink-0">
               <Tag 
                active={activeFilter === f} 
                onClick={() => setActiveFilter(f)}
                className="px-5 py-2.5 text-[15px]"
              >
                {f}
              </Tag>
            </div>
          ))}
          <div className="w-4 shrink-0" />
        </div>
      </div>

      <div className="p-6 pb-40 flex flex-col gap-5">
        {meetups.map(m => <MeetupCard key={m.id} meetup={m} />)}
      </div>

      <CreateMeetupSheet isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </div>
  );
}
