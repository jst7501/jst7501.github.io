import { useEffect, useRef, useState, useCallback } from 'react';

export interface GForceData {
  lateralG: number;       // 횡 G (좌우)
  longitudinalG: number;  // 종 G (전후)
  totalG: number;         // 합력 G
}

interface UseDeviceMotionReturn {
  gForce: GForceData;
  isAvailable: boolean;
  hasPermission: boolean;
  requestPermission: () => Promise<boolean>;
}

/**
 * DeviceMotionEvent 기반 G-Force 측정 훅
 * - iOS Safari: DeviceMotionEvent.requestPermission() 필요
 * - Android Chrome: 자동 허용
 */
export function useDeviceMotion(): UseDeviceMotionReturn {
  const [gForce, setGForce] = useState<GForceData>({
    lateralG: 0,
    longitudinalG: 0,
    totalG: 0,
  });
  const [isAvailable] = useState(
    typeof window !== 'undefined' && 'DeviceMotionEvent' in window
  );
  const [hasPermission, setHasPermission] = useState(false);

  const smoothRef = useRef({ latG: 0, lonG: 0 });
  const SMOOTHING = 0.3; // Low-pass filter coefficient

  // iOS permission request
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isAvailable) return false;

    // iOS Safari 전용 permission flow
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      try {
        const result = await (DeviceMotionEvent as any).requestPermission();
        if (result === 'granted') {
          setHasPermission(true);
          return true;
        }
        return false;
      } catch {
        return false;
      }
    }

    // Android, 데스크톱: 자동 허용
    setHasPermission(true);
    return true;
  }, [isAvailable]);

  // 이벤트 리스너
  useEffect(() => {
    if (!isAvailable || !hasPermission) return;

    const handler = (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity;
      if (!acc) return;

      // G 단위로 변환 (9.81 m/s² = 1G)
      const rawLatG = (acc.x || 0) / 9.81;
      const rawLonG = (acc.z || 0) / 9.81;

      // Low-pass filter (스마트폰 센서 노이즈 제거)
      smoothRef.current.latG += SMOOTHING * (rawLatG - smoothRef.current.latG);
      smoothRef.current.lonG += SMOOTHING * (rawLonG - smoothRef.current.lonG);

      const latG = Math.round(smoothRef.current.latG * 100) / 100;
      const lonG = Math.round(smoothRef.current.lonG * 100) / 100;
      const totalG = Math.round(Math.sqrt(latG ** 2 + lonG ** 2) * 100) / 100;

      setGForce({ lateralG: latG, longitudinalG: lonG, totalG });
    };

    window.addEventListener('devicemotion', handler);
    return () => window.removeEventListener('devicemotion', handler);
  }, [isAvailable, hasPermission]);

  return { gForce, isAvailable, hasPermission, requestPermission };
}
