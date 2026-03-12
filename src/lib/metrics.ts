import { TelemetryPoint, DriveSessionResult } from '../store/driveStore';

export interface AdvancedMetrics {
  maxBrakingG: number;
  avgLateralG: number;
  sustainedGSeconds: number;
  cornerCount: number;
  smoothnessScore: number; // 0-100
  intensityScore: number;  // 0-100
  sectors: number;
}

export function deriveAdvancedMetrics(result: DriveSessionResult): AdvancedMetrics {
  const { telemetry } = result;
  if (telemetry.length === 0) {
    return {
      maxBrakingG: 0,
      avgLateralG: 0,
      sustainedGSeconds: 0,
      cornerCount: 0,
      smoothnessScore: 0,
      intensityScore: 0,
      sectors: 0,
    };
  }

  // 1. Max Braking G (Longitudinal G is negative when braking)
  const maxBraking = Math.max(...telemetry.map(p => Math.abs(p.longitudinalG < 0 ? p.longitudinalG : 0)));

  // 2. Avg Lateral G (Absolute)
  const avgLatG = telemetry.reduce((s, p) => s + Math.abs(p.lateralG), 0) / telemetry.length;

  // 3. Sustained G-Force (> 0.4G)
  const sustainedGSeconds = telemetry.filter(p => Math.abs(p.lateralG) > 0.4).length;

  // 4. Corner Count (Significant shifts in lateral G)
  let cornerCount = 0;
  let inCorner = false;
  telemetry.forEach(p => {
    const latG = Math.abs(p.lateralG);
    if (latG > 0.3 && !inCorner) {
      inCorner = true;
      cornerCount++;
    } else if (latG < 0.15) {
      inCorner = false;
    }
  });

  // 5. Smoothness Score (0-100)
  // Low jerk = high smoothness.
  let totalJerk = 0;
  for (let i = 1; i < telemetry.length; i++) {
    totalJerk += Math.abs(telemetry[i].lateralG - telemetry[i - 1].lateralG);
  }
  const avgJerk = totalJerk / Math.max(telemetry.length - 1, 1);
  const smoothnessScore = Math.max(0, Math.min(100, 100 - (avgJerk * 150)));

  // 6. Intensity Score (0-100)
  // Combination of max speed and max G
  const speedIntensity = (result.maxSpeed * 3.6) / 120; // 120km/h = 100%
  const gIntensity = result.maxLateralG / 1.2; // 1.2G = 100%
  const intensityScore = Math.max(0, Math.min(100, ((speedIntensity + gIntensity) / 2) * 100));

  return {
    maxBrakingG: maxBraking,
    avgLateralG: avgLatG,
    sustainedGSeconds,
    cornerCount,
    smoothnessScore: Math.round(smoothnessScore),
    intensityScore: Math.round(intensityScore),
    sectors: Math.ceil(telemetry.length / 30), // Simple 30s sectors
  };
}
