import React, { useState } from 'react';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { useToastStore } from '../../components/ui/Toast';

interface CreateMeetupSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateMeetupSheet({ isOpen, onClose }: CreateMeetupSheetProps) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const { addToast } = useToastStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !location) return;

    addToast('번개가 등록되었습니다.', '멤버 모집이 시작됩니다.', 'success');
    setTitle(''); setDate(''); setLocation('');
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="새로운 번개 주최">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
        
        <div>
          <label className="block text-sm font-bold text-white mb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" /> 번개 제목
          </label>
          <input 
            type="text" required
            value={title} onChange={e => setTitle(e.target.value)}
            placeholder="어디로 떠날까요?"
            className="w-full bg-bg-surface-elevated text-white placeholder-text-tertiary rounded-2xl py-4 px-5 border border-border-strong focus:outline-none focus:border-primary transition-colors focus:shadow-[0_0_15px_rgba(255,90,0,0.15)]"
          />
        </div>

        <div>
           <label className="block text-sm font-bold text-white mb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-teal" /> 모임 일시
          </label>
          <input 
            type="text" required
            value={date} onChange={e => setDate(e.target.value)}
            placeholder="예: 이번주 금요일 저녁 8시"
            className="w-full bg-bg-surface-elevated text-white placeholder-text-tertiary rounded-2xl py-4 px-5 border border-border-strong focus:outline-none focus:border-accent-teal transition-colors focus:shadow-[0_0_15px_rgba(20,184,166,0.15)]"
          />
        </div>

        <div>
           <label className="block text-sm font-bold text-white mb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-purple" /> 집결 장소
          </label>
          <input 
            type="text" required
            value={location} onChange={e => setLocation(e.target.value)}
            placeholder="검색하여 지정"
            className="w-full bg-bg-surface-elevated text-white placeholder-text-tertiary rounded-2xl py-4 px-5 border border-border-strong focus:outline-none focus:border-accent-purple transition-colors focus:shadow-[0_0_15px_rgba(139,92,246,0.15)]"
          />
        </div>

        <button 
          type="submit"
          className="w-full mt-4 py-4 rounded-[24px] bg-gradient-to-r from-primary to-[#FF9D00] text-white font-black text-lg shadow-[0_10px_30px_rgba(255,90,0,0.3)] hover:shadow-[0_15px_40px_rgba(255,90,0,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          번개 열기
        </button>
      </form>
    </BottomSheet>
  );
}
