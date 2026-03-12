import { useCallback, useRef, useState } from 'react';

interface UseWakeLockReturn {
  isLocked: boolean;
  acquire: () => Promise<void>;
  release: () => Promise<void>;
  isSupported: boolean;
}

/**
 * Wake Lock API 래핑 훅
 * 주행 중 스마트폰 화면이 꺼지는 것을 방지
 */
export function useWakeLock(): UseWakeLockReturn {
  const [isLocked, setIsLocked] = useState(false);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  const isSupported = typeof navigator !== 'undefined' && 'wakeLock' in navigator;

  const acquire = useCallback(async () => {
    if (!isSupported) {
      console.warn('[WakeLock] 이 브라우저에서 Wake Lock을 지원하지 않습니다.');
      return;
    }

    try {
      wakeLockRef.current = await navigator.wakeLock.request('screen');
      setIsLocked(true);

      // 탭이 다시 보이면 자동 재획득
      wakeLockRef.current.addEventListener('release', () => {
        setIsLocked(false);
      });

      // visibilitychange 이벤트에서 재획득
      const handleVisibilityChange = async () => {
        if (document.visibilityState === 'visible' && !wakeLockRef.current) {
          try {
            wakeLockRef.current = await navigator.wakeLock.request('screen');
            setIsLocked(true);
          } catch {
            // 무시 — 유저가 포커스를 잃었다 다시 왔을 때 실패할 수 있음
          }
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
    } catch (err: any) {
      console.warn('[WakeLock] 획득 실패:', err.message);
    }
  }, [isSupported]);

  const release = useCallback(async () => {
    if (wakeLockRef.current) {
      await wakeLockRef.current.release();
      wakeLockRef.current = null;
      setIsLocked(false);
    }
  }, []);

  return { isLocked, acquire, release, isSupported };
}
