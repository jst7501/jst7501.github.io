import React from 'react';
import { useUserStore } from '../../store/userStore';
import { Settings, ChevronRight, CarFront, Edit2, ShieldAlert } from 'lucide-react';

export function MyTab() {
  const { nickname, carModel, experienceYears } = useUserStore();

  return (
    <div className="flex flex-col h-full bg-[#050505] overflow-y-auto hide-scrollbar scroll-smooth">
      {/* Premium Glass Header */}
      <div className="sticky top-0 z-[100] pt-14 pb-5 bg-[#050505]/60 backdrop-blur-3xl border-b border-white/5 shadow-[0_12px_40px_rgba(0,0,0,0.6)] px-6 flex justify-between items-center">
        <div className="flex flex-col">
          <h2 className="text-2xl font-black tracking-tighter text-white">
            PROFILE<span className="text-primary">.</span>
          </h2>
          <span className="text-[10px] font-bold text-white/30 tracking-[0.2em] -mt-1 ml-0.5">마이페이지</span>
        </div>
        <button className="w-11 h-11 hyper-glass rounded-2xl flex items-center justify-center text-white/60 hover:text-white transition-all transform active:scale-95 shadow-lg inner-glow">
          <Settings size={20} />
        </button>
      </div>

      <div className="p-6 pb-40 flex flex-col gap-6">
        
        {/* Profile Identity Card */}
        <div className="relative w-full rounded-[32px] p-[1px] group cursor-pointer overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-[#FFCC00] to-accent-purple animate-[spin_6s_linear_infinite]" />
          <div className="relative w-full h-full bg-bg-surface-elevated rounded-[31px] p-6 flex flex-col border border-black backdrop-blur-3xl overflow-hidden">
             
             {/* Dynamic background glow */}
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-[40px]" />
             
             <div className="flex items-center gap-5 relative z-10">
               <div className="w-20 h-20 rounded-full bg-gradient-to-br from-bg-base to-bg-surface border-4 border-bg-base shadow-[0_0_20px_rgba(0,0,0,0.8)] flex items-center justify-center text-4xl shrink-0">
                 👨🏻‍🚀
               </div>
               <div className="flex-1">
                 <div className="flex items-center gap-2 mb-1">
                   <h2 className="text-2xl font-black text-white group-hover:text-glow transition-all">{nickname}</h2>
                   <button className="text-text-tertiary hover:text-white"><Edit2 size={14} /></button>
                 </div>
                 <p className="text-sm font-bold text-primary mb-2">무사고 {experienceYears}년차 와인딩 러너</p>
                 <div className="flex items-center gap-1.5 bg-black/50 w-fit px-3 py-1.5 rounded-full border border-white/5">
                   <CarFront size={14} className="text-text-secondary" />
                   <span className="text-xs text-white font-bold">{carModel || '차량 미등록'}</span>
                 </div>
               </div>
             </div>
          </div>
        </div>




        {/* Settings Menu List */}
        <div className="bento-card p-2 flex flex-col gap-1">
          <MenuRow icon="❤️" label="관심 코스 목록" />
          <MenuRow icon="📑" label="내가 쓴 도로 제보" />
          <MenuRow icon="🚙" label="자동차 프로필 설정" />
          <div className="h-[1px] bg-border-subtle my-2 mx-4" />
          <MenuRow icon="🛡️" label="이용약관 및 개인정보 처리방침" />
          <MenuRow icon="📞" label="고객센터" />
        </div>
        
        {/* Sign out */}
        <button className="mt-4 flex items-center justify-center gap-2 text-sm font-bold text-text-tertiary hover:text-error transition-colors p-4">
          <ShieldAlert size={16} /> 로그아웃
        </button>

      </div>
    </div>
  );
}

function MenuRow({ icon, label }: { icon: string, label: string }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-[20px] hover:bg-white/5 cursor-pointer transition-colors group">
      <div className="flex items-center gap-3">
        <span className="text-xl opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all">{icon}</span>
        <span className="text-sm font-bold text-white group-hover:text-primary transition-colors">{label}</span>
      </div>
      <ChevronRight size={18} className="text-text-tertiary group-hover:text-white transition-colors" />
    </div>
  );
}
