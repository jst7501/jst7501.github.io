import React from 'react';
import { Route } from '../../types/route';
import { Star, MessageCircle } from 'lucide-react';

interface ReviewSectionProps {
  route: Route;
}

export function ReviewSection({ route }: ReviewSectionProps) {
  // Mock review data for MVP
  const reviews = [
    { id: 1, user: '와인딩초보', rating: 4, text: '경치가 정말 좋고 길이 넓어서 편했습니다.', date: '2주 전' },
    { id: 2, user: '드리프트장인', rating: 5, text: '야간 주행시 가로등이 없으니 주의하세요. 코너는 최고입니다.', date: '1달 전' },
  ];

  return (
    <div className="bento-card p-6 border-accent-purple/20">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-black text-white flex items-center gap-2">
          <span className="w-1.5 h-6 bg-accent-purple rounded-full shadow-[0_0_10px_rgba(139,92,246,0.8)]" />
          러너 리뷰
        </h3>
        <div className="flex items-center gap-1.5 bg-bg-base/60 px-3 py-1.5 rounded-full border border-white/5">
          <span className="text-warning text-[15px]">⭐️</span>
          <span className="text-white font-bold text-sm tracking-widest">{route.rating.toFixed(1)}</span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {reviews.map(review => (
          <div key={review.id} className="bg-bg-base/60 rounded-[20px] p-5 border border-white/5 hover:bg-white/5 transition-colors group relative overflow-hidden">
             {/* Subdued Glow effect */}
             <div className="absolute top-0 right-0 w-24 h-24 bg-accent-purple rounded-full blur-[40px] opacity-[0.03] group-hover:opacity-[0.08] transition-opacity -translate-y-1/2 translate-x-1/2" />
             
             <div className="flex items-start justify-between mb-3 relative z-10">
               <div className="flex items-center gap-2">
                 <div className="w-8 h-8 rounded-full bg-gradient-to-br from-bg-surface-elevated to-bg-base flex items-center justify-center border border-border-subtle shadow-inner">
                   <span className="text-xs font-black text-accent-purple">{review.user[0]}</span>
                 </div>
                 <span className="text-sm font-bold text-white">{review.user}</span>
               </div>
               <div className="flex">
                 {[...Array(5)].map((_, i) => (
                   <Star key={i} size={12} className={i < review.rating ? "fill-warning text-warning" : "text-border-strong"} />
                 ))}
               </div>
             </div>
             
             <p className="text-sm text-text-secondary leading-relaxed relative z-10">{review.text}</p>
             <p className="text-[10px] text-text-tertiary mt-3 font-medium relative z-10">{review.date}</p>
          </div>
        ))}
        
        <button className="w-full mt-2 py-4 rounded-[20px] border border-dashed border-border-strong text-text-secondary hover:text-white hover:border-border-subtle hover:bg-white/5 transition-all font-bold flex items-center justify-center gap-2 text-sm">
          <MessageCircle size={16} /> 새 리뷰 작성
        </button>
      </div>
    </div>
  );
}
