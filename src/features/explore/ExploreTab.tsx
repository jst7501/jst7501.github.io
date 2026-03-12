import React from 'react';
import { useRouteStore } from '../../store/routeStore';
import { ExploreHeader } from './ExploreHeader';
import { RouteCard } from './RouteCard';
import { EmptyState } from '../../components/ui/EmptyState';

interface ExploreTabProps {
  onRouteSelect: (routeId: string) => void;
}

export function ExploreTab({ onRouteSelect }: ExploreTabProps) {
  const { routes, searchQuery, selectedRegion } = useRouteStore();

  const filteredRoutes = routes.filter(route => {
    if (selectedRegion !== '전체' && route.region !== selectedRegion) {
      return false;
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchName = route.name.toLowerCase().includes(query);
      const matchRegion = route.region.toLowerCase().includes(query);
      const matchTags = route.tags.some(tag => tag.toLowerCase().includes(query));
      
      if (!matchName && !matchRegion && !matchTags) {
        return false;
      }
    }
    
    return true;
  });

  return (
    <div id="explore-scroll" className="flex flex-col h-full overflow-y-auto hide-scrollbar scroll-smooth">
      <ExploreHeader />
      
      <div className="p-6 pb-40">
        {filteredRoutes.length === 0 ? (
          <EmptyState 
            icon="💨"
            title="검색 결과가 없어요"
            description="다른 지역이나 키워드로 검색해보세요"
          />
        ) : (
          filteredRoutes.map(route => (
              <RouteCard 
                key={route.id}
                route={route} 
                onClick={() => onRouteSelect(route.id)} 
              />
          ))
        )}
      </div>
    </div>
  );
}
