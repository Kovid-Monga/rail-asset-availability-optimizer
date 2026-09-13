/**
 * TMS (Track Management System) Mock API
 * Simulates data exchange with the Indian Railways civil track management system.
 */

export const mockTmsAssets = [
  {
    id: 'TMS-TRK-492',
    name: 'Km 14/2 - 15/8 UP Main Track',
    section: 'NDLS-NZM',
    trackLine: 'UP Line',
    healthStatus: 'Degraded',
    lastUltrasonicTest: '2026-08-28',
    cumulativeGmt: 78.4,
    defectDescription: 'Severe corrugation and gauge wear detected on rail head; speed restriction (SR) 30 km/h imminent if not tamped and de-stressed.',
    isOverdue: true,
    overdueDate: '2026-09-01'
  },
  {
    id: 'TMS-SW-108',
    name: 'Turnout #108A New Delhi Yard',
    section: 'NDLS-NZM',
    trackLine: 'Cross-over 3',
    healthStatus: 'Critical',
    lastUltrasonicTest: '2026-08-20',
    cumulativeGmt: 92.1,
    defectDescription: 'Tongue rail chip and stock rail wear exceeding 6mm safety tolerance.',
    isOverdue: true,
    overdueDate: '2026-08-29'
  },
  {
    id: 'TMS-BRG-22',
    name: 'Yamuna Bridge Pier 4 Approach Track',
    section: 'NZM-PWL',
    trackLine: 'DN Line',
    healthStatus: 'Normal',
    lastUltrasonicTest: '2026-08-15',
    cumulativeGmt: 54.2,
    defectDescription: 'Routine sleeper pad inspection and fastening tightening required.',
    isOverdue: false
  },
  {
    id: 'TMS-CRV-71',
    name: 'Curve #14 Faridabad Outer (Radius 450m)',
    section: 'NZM-PWL',
    trackLine: 'UP Line',
    healthStatus: 'Watchlist',
    lastUltrasonicTest: '2026-08-30',
    cumulativeGmt: 81.0,
    defectDescription: 'Transverse fatigue fissure flagged at weld joint Km 31/8.',
    isOverdue: false
  }
];

export async function fetchTmsAssets() {
  await new Promise((r) => setTimeout(r, 150));
  return mockTmsAssets;
}

export async function fetchTmsAssetById(assetId) {
  await new Promise((r) => setTimeout(r, 100));
  return mockTmsAssets.find(a => a.id === assetId) || null;
}
