import React, { useState, useEffect } from 'react';
import { Bell, Search, X } from 'lucide-react';
import { useRouteStore } from '../../store/routeStore';
import { Tag } from '../../components/ui/Tag';
import { Region } from '../../types/route';

const REGIONS: Region[] = ['전체', '강원', '경남', '전남', '제주', '경북', '전북', '충북', '경기'];

export function ExploreHeader() {
  const { setSearchQuery, selectedRegion, setSelectedRegion } = useRouteStore();
  const [localQuery, setLocalQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [localQuery, setSearchQuery]);

  useEffect(() => {
    const handleScroll = () => {
      // Find the scroll container containing the header
      const container = document.getElementById('explore-scroll');
      if (container) setIsScrolled(container.scrollTop > 10);
    };
    const container = document.getElementById('explore-scroll');
    if (container) container.addEventListener('scroll', handleScroll);
    return () => container?.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`sticky top-0 z-[100] transition-all duration-700 pt-14 pb-5 flex flex-col gap-6 ${
      isScrolled ? 'bg-[#050505]/60 backdrop-blur-3xl border-b border-white/5 shadow-[0_12px_40px_rgba(0,0,0,0.6)]' : 'bg-transparent'
    }`}>
      
      {/* Top Bar: Logo & Notification */}
      <div className="flex items-center justify-between px-6">
        <div className="flex flex-col">
          <h1 className="text-2xl font-black tracking-tighter text-white">
            WINDING<span className="text-primary">.</span>
          </h1>
          <span className="text-[10px] font-bold text-white/30 tracking-[0.2em] -mt-1 ml-0.5">EXPLORE HUB</span>
        </div>
        <button className="w-11 h-11 hyper-glass rounded-2xl flex items-center justify-center text-white/60 hover:text-white transition-all transform hover:scale-105 active:scale-95 relative shadow-lg inner-glow">
          <Bell size={18} strokeWidth={2.5} />
          <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-primary border-2 border-[#050505] rounded-full shadow-[0_0_10px_rgba(255,90,0,0.6)]" />
        </button>
      </div>

      {/* Premium Search Field */}
      <div className="px-6 relative group">
        <div className="absolute inset-x-6 inset-y-0 bg-primary/10 rounded-[22px] blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-700 pointer-events-none" />
        <div className="relative flex items-center w-full bg-white/[0.03] border border-white/10 rounded-[22px] transition-all duration-500 focus-within:border-primary/50 focus-within:bg-white/[0.06] shadow-2xl backdrop-blur-md overflow-hidden inner-glow">
          <div className="absolute left-4.5 text-white/30 group-focus-within:text-primary transition-colors duration-500">
            <Search size={18} strokeWidth={3} />
          </div>
          <input
            type="text"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            placeholder="코스명, 지역, #태그 검색..."
            className="w-full bg-transparent text-white placeholder-text-tertiary rounded-[20px] py-4 pl-12 pr-12 focus:outline-none font-medium truncate"
          />
          {localQuery && (
            <button 
              onClick={() => setLocalQuery('')}
              className="absolute right-4 p-1 rounded-full bg-border-strong text-text-secondary hover:text-white hover:bg-border-subtle transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Sleek Region Filter Chips */}
      <div className="flex gap-2.5 overflow-x-auto hide-scrollbar px-6 pb-2 snap-x">
        {REGIONS.map(region => (
          <div key={region} className="snap-start shrink-0">
            <Tag 
              active={selectedRegion === region}
              onClick={() => setSelectedRegion(region)}
              className="px-5 py-2.5 text-[15px]"
            >
              {region}
            </Tag>
          </div>
        ))}
        {/* Spacer for scroll padding */}
        <div className="w-4 shrink-0" />
      </div>
      
    </div>
  );
}
