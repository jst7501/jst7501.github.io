import React, { useState } from 'react';
import { Route } from '../../types/route';
import { CourseMap } from './CourseMap';
import { CourseInfoBox } from './CourseInfoBox';
import { SurroundingInfoBox } from './SurroundingInfoBox';
import { RoadReportSection } from './RoadReportSection';
import { ReviewSection } from './ReviewSection';
import { ArrowLeft, Share2, Heart, Flag } from 'lucide-react';
import { useRouteStore } from '../../store/routeStore';

interface RouteDetailPageProps {
  route: Route;
  onBack: () => void;
  onDriveComplete: (route: Route) => void;
}

export function RouteDetailPage({ route, onBack, onDriveComplete }: RouteDetailPageProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <div className="fixed inset-0 z-50 bg-bg-base overflow-y-auto hide-scrollbar animate-press">
      
      {/* Dynamic Background Mesh */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-bg-base to-bg-base" />

      {/* Floating Header Actions (Hyper-Glass) */}
      <div className="fixed top-0 left-0 right-0 max-w-[480px] mx-auto z-[60] flex justify-between items-center p-6 bg-gradient-to-b from-bg-base via-bg-base/80 to-transparent">
        <button 
          onClick={onBack}
          className="w-10 h-10 rounded-full hyper-glass flex items-center justify-center text-white hover:bg-white/10 transition-colors shadow-lg"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex gap-3">
          <button className="w-10 h-10 rounded-full hyper-glass flex items-center justify-center text-white hover:bg-white/10 transition-colors shadow-lg">
            <Share2 size={20} />
          </button>
          <button 
            onClick={() => setIsFavorite(!isFavorite)}
            className="w-10 h-10 rounded-full hyper-glass flex items-center justify-center text-white hover:bg-white/10 transition-colors shadow-lg"
          >
            <Heart size={20} className={isFavorite ? "fill-error text-error" : ""} />
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative pt-24 px-6 pb-6 z-10">
        <div className="mb-4">
          <h1 className="text-4xl font-black text-white leading-tight mb-2 text-glow">{route.name}</h1>
          <p className="text-lg text-primary font-bold">{route.region}</p>
        </div>

        {/* Action Button: Drive */}
        <button 
          onClick={() => onDriveComplete(route)}
          className="w-full relative group overflow-hidden rounded-[24px] mb-8"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-[#FFCC00] rounded-[24px]" />
          <div className="absolute inset-0 bg-black/10 group-active:bg-black/30 transition-colors" />
          <div className="relative w-full py-4 flex items-center justify-center gap-2 font-black text-white text-lg">
            <Flag size={20} className="mt-0.5" />
            이 코스 달리기
          </div>
        </button>

        {/* Bento Content */}
        <div className="flex flex-col gap-6">
          <CourseMap nodes={route.nodes} />
          <CourseInfoBox route={route} />
          <RoadReportSection routeId={route.id} initialReports={route.reports} />
          <SurroundingInfoBox points={route.surroundings} />
          <ReviewSection route={route} />
        </div>
        
        {/* Bottom Padding */}
        <div className="h-24" />
      </div>
    </div>
  );
}
