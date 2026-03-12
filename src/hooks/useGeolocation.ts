import { useEffect, useRef, useState, useCallback } from 'react';

export interface GeoPosition {
  lat: number;
  lng: number;
  speed: number | null;       // m/s
  heading: number | null;     // degrees
  accuracy: number;           // meters
  timestamp: number;
}

interface UseGeolocationReturn {
  position: GeoPosition | null;
  error: string | null;
  isTracking: boolean;
  startTracking: () => void;
  stopTracking: () => void;
}

/**
 * GPS 실시간 추적 훅
 * - 데스크톱/모바일 모두 대응
 * - 타임아웃 시 자동 재시도 (최대 3회)
 * - enableHighAccuracy 폴백 전략
 */
export function useGeolocation(): UseGeolocationReturn {
  const [position, setPosition] = useState<GeoPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const retryCountRef = useRef(0);
  const highAccuracyRef = useRef(true);

  const startWatch = useCallback((highAccuracy: boolean) => {
    // 이전 watch 정리
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        retryCountRef.current = 0; // 성공 시 카운터 리셋
        setError(null);
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          speed: pos.coords.speed,
          heading: pos.coords.heading,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp,
        });
      },
      (err) => {
        if (err.code === err.TIMEOUT) {
          retryCountRef.current++;
          
          if (retryCountRef.current <= 3) {
            // 재시도: 정확도 낮추기 (데스크톱에서 highAccuracy가 GPS만 찾다 타임아웃)
            if (highAccuracyRef.current) {
              highAccuracyRef.current = false;
              startWatch(false);
              return;
            }
            // 일반 정확도로도 실패하면 다시 시도
            setTimeout(() => startWatch(false), 2000);
            return;
          }
          setError('위치를 가져올 수 없습니다. 브라우저 위치 권한을 확인해주세요.');
        } else if (err.code === err.PERMISSION_DENIED) {
          setError('위치 권한이 거부되었습니다. 브라우저 설정에서 위치 접근을 허용해주세요.');
        } else {
          setError('위치 정보를 가져올 수 없습니다.');
        }
      },
      {
        enableHighAccuracy: highAccuracy,
        maximumAge: 5000,   // 5초 이내 캐시 허용
        timeout: 30000,     // 30초 (기존 10초에서 대폭 증가)
      }
    );
  }, []);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError('이 브라우저에서 GPS를 지원하지 않습니다.');
      return;
    }

    setIsTracking(true);
    setError(null);
    retryCountRef.current = 0;
    highAccuracyRef.current = true;

    // 먼저 getCurrentPosition으로 빠르게 한번 잡기
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          speed: pos.coords.speed,
          heading: pos.coords.heading,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp,
        });
      },
      () => {}, // 실패해도 무시 (watchPosition이 잡아줌)
      { enableHighAccuracy: false, maximumAge: 60000, timeout: 5000 }
    );

    // watchPosition 시작
    startWatch(true);
  }, [startWatch]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
  }, []);

  // 컴포넌트 언마운트 시 자동 정리
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return { position, error, isTracking, startTracking, stopTracking };
}
