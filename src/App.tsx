import React, { useState } from 'react';
import { BottomTabNavigator, TabType } from './components/layout/BottomTabNavigator';
import { ToastContainer, useToastStore } from './components/ui/Toast';
import { BadgeModal } from './components/ui/BadgeModal';

import { ExploreTab } from './features/explore/ExploreTab';
import { MapTab } from './features/map/MapTab';
import { MeetupTab } from './features/meetup/MeetupTab';
import { LogTab } from './features/log/LogTab';
import { MyTab } from './features/my/MyTab';
import { RouteDetailPage } from './features/routeDetail/RouteDetailPage';
import { DriveView } from './features/drive/DriveView';
import { DriveResultPage } from './features/driveResult/DriveResultPage';
import { DriveSessionResult } from './store/driveStore';

import { useRouteStore } from './store/routeStore';
import { useLogStore } from './store/logStore';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('explore');
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  
  const { routes } = useRouteStore();
  const { addLog } = useLogStore();
  const { addToast } = useToastStore();
  
  const [unlockedBadge, setUnlockedBadge] = useState<string | null>(null);
  const [isDriving, setIsDriving] = useState(false);
  const [drivingRoute, setDrivingRoute] = useState<typeof selectedRoute>(null);
  const [driveResult, setDriveResult] = useState<DriveSessionResult | null>(null);

  const selectedRoute = selectedRouteId ? routes.find(r => r.id === selectedRouteId) : null;

  // "이 코스 달리기" 버튼 → 라이브 드라이브 모드 진입
  const handleStartDrive = (route: typeof selectedRoute) => {
    if (!route) return;
    setDrivingRoute(route);
    setIsDriving(true);
    setSelectedRouteId(null);
  };

  // 지도 탭에서 "바로 주행 시작" (프리 드라이브, route 없이)
  const handleFreeDrive = () => {
    setDrivingRoute(null);
    setIsDriving(true);
  };

  // 주행 종료 → 결과 화면 표시
  const handleDriveEnd = (result: DriveSessionResult | null) => {
    setIsDriving(false);
    setDrivingRoute(null);

    if (result) {
      setDriveResult(result);
    }
  };

  // 결과 화면 닫기 → 로그 탭으로 이동 + 배지 체크
  const handleResultClose = () => {
    const result = driveResult;
    setDriveResult(null);

    if (result) {
      const route = MOCK_ROUTES_REF.find(r => r.id === result.routeId);
      if (route) {
        const { isNewBadgeUnlocked, unlockedBadgeIds } = addLog(route);
        setActiveTab('log');
        addToast('새 드라이브 기록이 추가되었습니다', `${route.name} 주행 완료!`, 'success');

        if (isNewBadgeUnlocked && unlockedBadgeIds.length > 0) {
          setTimeout(() => {
            setUnlockedBadge(unlockedBadgeIds[unlockedBadgeIds.length - 1]);
          }, 500);
        }
      }
    }
  };

  const MOCK_ROUTES_REF = routes;

  return (
    <div className="relative min-h-screen bg-bg-base text-text-primary font-sans mesh-gradient overflow-hidden">
      
      {/* Drive Result Full-Screen */}
      {driveResult && (
        <DriveResultPage result={driveResult} onClose={handleResultClose} />
      )}

      {/* Live Drive Full-Screen Overlay */}
      {isDriving && (
        <DriveView route={drivingRoute || undefined} onEnd={handleDriveEnd} />
      )}

      {/* Route Detail Modal Overlay */}
      {selectedRoute && (
        <RouteDetailPage 
          route={selectedRoute} 
          onBack={() => setSelectedRouteId(null)} 
          onDriveComplete={handleStartDrive}
        />
      )}

      {/* Main Tab Contents - display: none to keep them mounted */}
      <div style={{ display: !selectedRoute && activeTab === 'explore' ? 'block' : 'none' }} className="h-screen overflow-y-auto hide-scrollbar pb-32">
        <ExploreTab onRouteSelect={setSelectedRouteId} />
      </div>
      <div style={{ display: !selectedRoute && activeTab === 'map' ? 'block' : 'none' }} className="h-screen">
        <MapTab onRouteSelect={setSelectedRouteId} onStartFreeDrive={handleFreeDrive} />
      </div>
      <div style={{ display: !selectedRoute && activeTab === 'meetup' ? 'block' : 'none' }} className="h-screen overflow-y-auto hide-scrollbar pb-32">
        <MeetupTab />
      </div>
      <div style={{ display: !selectedRoute && activeTab === 'log' ? 'block' : 'none' }} className="h-screen overflow-y-auto hide-scrollbar pb-32">
        <LogTab />
      </div>
      <div style={{ display: !selectedRoute && activeTab === 'my' ? 'block' : 'none' }} className="h-screen overflow-y-auto hide-scrollbar pb-32">
        <MyTab />
      </div>

      {/* Bottom Nav matches visibility of main tabs */}
      <div className={`transition-transform duration-500 ${selectedRoute ? 'translate-y-32' : 'translate-y-0'}`}>
        <BottomTabNavigator activeTab={activeTab} onChangeTab={setActiveTab} />
      </div>
      
      {/* Global Overlays */}
      <ToastContainer />
      <BadgeModal badgeId={unlockedBadge} onClose={() => setUnlockedBadge(null)} />
    </div>
  );
}

export default App;
