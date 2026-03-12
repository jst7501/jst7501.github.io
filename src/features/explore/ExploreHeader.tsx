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
    <div className={`sticky top-0 z-30 transition-all duration-500 pt-12 pb-3 flex flex-col gap-5 ${
      isScrolled ? 'bg-bg-base/80 backdrop-blur-2xl border-b border-border-subtle shadow-[0_10px_30px_rgba(0,0,0,0.8)]' : 'bg-transparent'
    }`}>
      
      {/* Top Bar: Logo & Notification */}
      <div className="flex items-center justify-between px-6">
        <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary via-[#FF9D00] to-primary tracking-tighter">
          WINDING<span className="text-white">NAVI</span>
        </h1>
        <button className="p-2.5 bg-bg-surface-elevated rounded-full border border-border-subtle text-text-secondary hover:text-white transition-all transform hover:scale-105 active:scale-95 relative shadow-lg">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-error border-2 border-bg-surface-elevated rounded-full animate-pulse" />
        </button>
      </div>

      {/* Cyberpunk Search Input */}
      <div className="px-6 relative group">
        <div className="absolute inset-0 bg-primary/20 rounded-[20px] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none mx-6" />
        <div className="relative flex items-center w-full bg-bg-surface border border-border-strong rounded-[20px] transition-all duration-300 focus-within:border-primary focus-within:bg-bg-surface-elevated shadow-inner">
          <div className="absolute left-4 text-text-tertiary group-focus-within:text-primary transition-colors">
            <Search size={20} />
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
