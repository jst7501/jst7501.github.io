import { create } from 'zustand';

/* ───── Telemetry Point (1초마다 적재) ───── */
export interface TelemetryPoint {
  t: number;          // timestamp (ms)
  lat: number;
  lng: number;
  speed: number;      // m/s
  heading: number;
  lateralG: number;   // 횡 G
  longitudinalG: number; // 종 G
}

/* ───── 코너링 콤보 이벤트 ───── */
export interface ComboEvent {
  type: 'perfect' | 'good';
  timestamp: number;
  cornerIndex: number;
}

/* ───── Drive Session State ───── */
interface DriveState {
  // --- Session ---
  isActive: boolean;
  isPaused: boolean;
  routeId: string | null;
  startTime: number | null;
  elapsedMs: number;

  // --- Realtime ---
  currentLat: number;
  currentLng: number;
  currentSpeed: number;       // m/s
  currentHeading: number;
  currentLateralG: number;
  currentLongitudinalG: number;

  // --- Telemetry Buffer ---
  telemetry: TelemetryPoint[];
  maxSpeed: number;
  maxLateralG: number;
  maxLongitudinalG: number;

  // --- Combo ---
  comboCount: number;
  comboEvents: ComboEvent[];

  // --- Actions ---
  startDrive: (routeId: string) => void;
  endDrive: () => DriveSessionResult | null;
  pauseDrive: () => void;
  resumeDrive: () => void;
  updatePosition: (lat: number, lng: number, speed: number, heading: number) => void;
  updateGForce: (lateralG: number, longitudinalG: number) => void;
  recordTelemetry: () => void;
  addCombo: (event: ComboEvent) => void;
  tick: () => void;
}

/* ───── 주행 결과 ───── */
export interface DriveSessionResult {
  routeId: string;
  startTime: number;
  endTime: number;
  durationMs: number;
  telemetry: TelemetryPoint[];
  maxSpeed: number;
  maxLateralG: number;
  maxLongitudinalG: number;
  avgSpeed: number;
  comboEvents: ComboEvent[];
}

/* ───── Store ───── */
export const useDriveStore = create<DriveState>()((set, get) => ({
  isActive: false,
  isPaused: false,
  routeId: null,
  startTime: null,
  elapsedMs: 0,

  currentLat: 0,
  currentLng: 0,
  currentSpeed: 0,
  currentHeading: 0,
  currentLateralG: 0,
  currentLongitudinalG: 0,

  telemetry: [],
  maxSpeed: 0,
  maxLateralG: 0,
  maxLongitudinalG: 0,

  comboCount: 0,
  comboEvents: [],

  startDrive: (routeId) => set({
    isActive: true,
    isPaused: false,
    routeId,
    startTime: Date.now(),
    elapsedMs: 0,
    telemetry: [],
    maxSpeed: 0,
    maxLateralG: 0,
    maxLongitudinalG: 0,
    comboCount: 0,
    comboEvents: [],
  }),

  endDrive: () => {
    const s = get();
    if (!s.isActive || !s.routeId || !s.startTime) return null;

    const speedValues = s.telemetry.map(p => p.speed).filter(v => v > 0);
    const result: DriveSessionResult = {
      routeId: s.routeId,
      startTime: s.startTime,
      endTime: Date.now(),
      durationMs: s.elapsedMs,
      telemetry: [...s.telemetry],
      maxSpeed: s.maxSpeed,
      maxLateralG: s.maxLateralG,
      maxLongitudinalG: s.maxLongitudinalG,
      avgSpeed: speedValues.length > 0
        ? speedValues.reduce((a, b) => a + b, 0) / speedValues.length
        : 0,
      comboEvents: [...s.comboEvents],
    };

    set({
      isActive: false,
      isPaused: false,
      routeId: null,
      startTime: null,
      elapsedMs: 0,
      telemetry: [],
    });

    return result;
  },

  pauseDrive: () => set({ isPaused: true }),
  resumeDrive: () => set({ isPaused: false }),

  updatePosition: (lat, lng, speed, heading) => set((s) => ({
    currentLat: lat,
    currentLng: lng,
    currentSpeed: speed,
    currentHeading: heading,
    maxSpeed: Math.max(s.maxSpeed, speed),
  })),

  updateGForce: (lateralG, longitudinalG) => set((s) => ({
    currentLateralG: lateralG,
    currentLongitudinalG: longitudinalG,
    maxLateralG: Math.max(s.maxLateralG, Math.abs(lateralG)),
    maxLongitudinalG: Math.max(s.maxLongitudinalG, Math.abs(longitudinalG)),
  })),

  recordTelemetry: () => set((s) => ({
    telemetry: [...s.telemetry, {
      t: Date.now(),
      lat: s.currentLat,
      lng: s.currentLng,
      speed: s.currentSpeed,
      heading: s.currentHeading,
      lateralG: s.currentLateralG,
      longitudinalG: s.currentLongitudinalG,
    }],
  })),

  addCombo: (event) => set((s) => ({
    comboCount: s.comboCount + 1,
    comboEvents: [...s.comboEvents, event],
  })),

  tick: () => set((s) => {
    if (!s.isActive || s.isPaused || !s.startTime) return {};
    return { elapsedMs: Date.now() - s.startTime };
  }),
}));
