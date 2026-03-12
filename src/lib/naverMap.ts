/**
 * Naver Maps SDK 동적 로더
 * ──────────────────────────
 * index.html에 <script>를 하드코딩하지 않고,
 * 런타임에 필요한 시점에만 SDK를 불러옵니다.
 *
 * 사용법:
 *   await loadNaverMapSDK();
 *   const map = new naver.maps.Map(el, options);
 */

const NAVER_SDK_URL = 'https://oapi.map.naver.com/openapi/v3/maps.js';

let _loadPromise: Promise<void> | null = null;

/**
 * 네이버 지도 SDK를 <script>로 삽입하고 로딩 완료를 Promise로 반환.
 * 여러 곳에서 호출해도 한 번만 로딩.
 */
export function loadNaverMapSDK(): Promise<void> {
  if (_loadPromise) return _loadPromise;

  // 이미 로딩된 경우 (HMR 등)
  if (typeof window !== 'undefined' && (window as any).naver?.maps) {
    return Promise.resolve();
  }

  _loadPromise = new Promise((resolve, reject) => {
    const clientId = import.meta.env.VITE_NAVER_MAP_CLIENT_ID;
    if (!clientId) {
      console.warn(
        '[NaverMap] VITE_NAVER_MAP_CLIENT_ID 환경변수가 없습니다.\n' +
        '.env 파일에 VITE_NAVER_MAP_CLIENT_ID=YOUR_ID 를 추가하세요.'
      );
      // Client ID 없이도 앱이 멈추지 않도록 reject 대신 resolve
      reject(new Error('VITE_NAVER_MAP_CLIENT_ID missing'));
      return;
    }

    const script = document.createElement('script');
    script.src = `${NAVER_SDK_URL}?ncpKeyId=${clientId}&submodules=geocoder`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Naver Maps SDK 로딩 실패'));
    document.head.appendChild(script);
  });

  return _loadPromise;
}

/**
 * naver.maps 글로벌 타입 선언
 * (실제 프로덕션에서는 @types/navermaps 패키지를 사용)
 */
declare global {
  interface Window {
    naver: typeof naver;
  }
  namespace naver {
    namespace maps {
      class Map {
        constructor(el: HTMLElement, options?: MapOptions);
        setCenter(latlng: LatLng): void;
        setZoom(level: number): void;
        panTo(latlng: LatLng | LatLngLiteral, options?: any): void;
        getCenter(): LatLng;
        fitBounds(bounds: LatLngBounds, margin?: number): void;
        setOptions(key: string | Record<string, any>, value?: any): void;
        setMapTypeId(typeId: string): void;
        setSize(size: { width: number; height: number }): void;
        autoResize(): void;
      }
      class LatLng {
        constructor(lat: number, lng: number);
        lat(): number;
        lng(): number;
      }
      class LatLngBounds {
        constructor(sw: LatLng, ne: LatLng);
        extend(latlng: LatLng): LatLngBounds;
        static bounds(latlng: LatLng, latlng2: LatLng): LatLngBounds;
      }
      class Marker {
        constructor(options?: MarkerOptions);
        setMap(map: Map | null): void;
        setPosition(latlng: LatLng): void;
        setIcon(icon: any): void;
      }
      class Polyline {
        constructor(options?: PolylineOptions);
        setMap(map: Map | null): void;
        setPath(path: LatLng[]): void;
      }
      class Circle {
        constructor(options?: any);
        setMap(map: Map | null): void;
      }
      class Point {
        constructor(x: number, y: number);
      }
      interface MapOptions {
        center?: LatLng;
        zoom?: number;
        mapTypeId?: string;
        background?: string;
        baseTileOpacity?: number;
        disableKineticPan?: boolean;
        scrollWheel?: boolean;
        draggable?: boolean;
        pinchZoom?: boolean;
        tileTransition?: boolean;
        zoomControl?: boolean;
        mapDataControl?: boolean;
        scaleControl?: boolean;
        logoControl?: boolean;
        logoControlOptions?: any;
      }
      interface MarkerOptions {
        position?: LatLng;
        map?: Map;
        icon?: any;
        zIndex?: number;
        title?: string;
      }
      interface PolylineOptions {
        map?: Map;
        path?: LatLng[];
        strokeColor?: string;
        strokeWeight?: number;
        strokeOpacity?: number;
        strokeStyle?: string;
        strokeLineCap?: string;
        strokeLineJoin?: string;
      }
      interface LatLngLiteral {
        lat: number;
        lng: number;
      }
      const Event: {
        addListener(instance: any, eventName: string, handler: Function): any;
      };
    }
  }
}
