/**
 * SMMS (Signal Maintenance Management System) Mock API
 * Simulates data exchange with the railway signalling and interlocking diagnostics.
 */

export const mockSmmsAssets = [
  {
    id: 'SMMS-PM-41',
    name: 'Electric Point Machine #41A NZM South',
    section: 'NDLS-NZM',
    trackLine: 'Cross-over 2',
    healthStatus: 'High Friction',
    defectDescription: 'Throw time increased from normal 4.2s to 6.8s. Friction clutch slippage detected; risk of point detection failure.',
    disconnectionNoticeRequired: true,
    signalRedAspectHolding: true,
    isOverdue: true,
    overdueDate: '2026-09-02'
  },
  {
    id: 'SMMS-AXL-19',
    name: 'Multi-Section Digital Axle Counter MS-DAC 19',
    section: 'NZM-PWL',
    trackLine: 'UP Line',
    healthStatus: 'Drift Detected',
    defectDescription: 'Phase drift on wheel sensor transducer B. Needs electronic calibrator hookup and sensor clamp replacement.',
    disconnectionNoticeRequired: true,
    signalRedAspectHolding: false,
    isOverdue: false
  },
  {
    id: 'SMMS-EI-01',
    name: 'Faridabad Electronic Interlocking Rack B',
    section: 'NZM-PWL',
    trackLine: 'Relay Room Cabin',
    healthStatus: 'Redundant Degraded',
    defectDescription: 'System B processor reporting intermittent memory parity check warning. Scheduled offline diagnostic run required.',
    disconnectionNoticeRequired: false,
    isOverdue: false
  }
];

export async function fetchSmmsAssets() {
  await new Promise((r) => setTimeout(r, 150));
  return mockSmmsAssets;
}

export async function fetchSmmsAssetById(assetId) {
  await new Promise((r) => setTimeout(r, 100));
  return mockSmmsAssets.find(a => a.id === assetId) || null;
}
