import React from 'react';
import { Calendar, MapPin, Users } from 'lucide-react';
import { Tag } from '../../components/ui/Tag';

interface MeetupCardProps {
  meetup: {
    title: string;
    date: string;
    location: string;
    currentMember: number;
    maxMember: number;
    author: string;
    status: string;
    tags: string[];
  };
}

export function MeetupCard({ meetup }: MeetupCardProps) {
  const isFull = meetup.currentMember >= meetup.maxMember;

  return (
    <div className="bento-card p-6 relative group overflow-hidden">

      {/* Top Meta Info */}
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="flex gap-2 items-center">
          <span className={`px-2.5 py-1 text-[11px] font-black rounded-lg border tracking-wider ${
            isFull ? 'bg-error/10 text-error border-error/30' : 
            meetup.status === '마감임박' ? 'bg-warning/10 text-warning border-warning/30' : 
            'bg-success/10 text-success border-success/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
          }`}>
            {isFull ? '모집마감' : meetup.status}
          </span>
        </div>
        <div className="flex gap-1">
          {/* Members Dots representing slots */}
          {[...Array(meetup.maxMember)].map((_, i) => (
             <span key={i} className={`w-2 h-2 rounded-full ${i < meetup.currentMember ? 'bg-primary shadow-[0_0_5px_#FF5A00] animate-pulse' : 'bg-bg-surface-elevated border border-border-strong'}`} />
          ))}
        </div>
      </div>

      <h3 className="text-xl font-black text-white mb-4 leading-snug group-hover:text-primary transition-colors relative z-10">
        {meetup.title}
      </h3>

      <div className="flex flex-col gap-2.5 mb-5 relative z-10">
        <div className="flex items-center gap-2.5 text-sm text-text-secondary font-medium">
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/5"><Calendar size={14} className="text-warning" /></div>
          {meetup.date}
        </div>
        <div className="flex items-center gap-2.5 text-sm text-text-secondary font-medium">
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/5"><MapPin size={14} className="text-accent-teal" /></div>
          {meetup.location}
        </div>
        <div className="flex items-center gap-2.5 text-sm text-text-secondary font-medium">
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/5"><Users size={14} className="text-accent-purple" /></div>
          <span className="text-white font-bold">{meetup.currentMember}</span> / {meetup.maxMember} 명 참여 대기중
        </div>
      </div>

      <div className="flex justify-between items-end pt-4 border-t border-border-subtle relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-bg-surface-elevated to-bg-base border border-border-strong flex items-center justify-center">
            <span className="text-[10px] text-white font-black">{meetup.author[0]}</span>
          </div>
          <span className="text-xs text-text-tertiary font-bold">{meetup.author} 주최</span>
        </div>
        <div className="flex gap-1.5 hide-scrollbar">
           {meetup.tags.map(tag => (
            <span key={tag} className="text-[10px] text-text-secondary">#{tag}</span>
           ))}
        </div>
      </div>
    </div>
  );
}
