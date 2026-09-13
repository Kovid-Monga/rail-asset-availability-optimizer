/**
 * TDMS (Traction Distribution Management System) Mock API
 * Simulates data exchange with the 25kV OHE electrical distribution system.
 */

export const mockTdmsAssets = [
  {
    id: 'TDMS-OHE-88',
    name: 'Catenary Wire Span Km 12/4 - 13/8',
    section: 'NDLS-NZM',
    trackLine: 'UP Line',
    healthStatus: 'Worn Wire',
    contactWireThicknessMm: 8.2, // min allowable is 8.0
    defectDescription: 'Contact wire diameter reduced to 8.2mm due to high electric locomotive pantograph cycles. Re-tensioning and contact wire splice required.',
    powerDisconnectionRequired: true,
    feedSubstation: 'Tuglakabad TSS-02',
    isOverdue: true,
    overdueDate: '2026-08-31'
  },
  {
    id: 'TDMS-INS-34',
    name: 'Section Insulator Assembly SI-34',
    section: 'NZM-PWL',
    trackLine: 'DN Line',
    healthStatus: 'Flashover Risk',
    defectDescription: 'Heavy pollution layer with micro-fractures on porcelain insulator skirt; prone to 25kV earth flashover during morning dew.',
    powerDisconnectionRequired: true,
    feedSubstation: 'Faridabad TSS-01',
    isOverdue: false
  },
  {
    id: 'TDMS-TW-01',
    name: '8-Wheeler Tower Wagon #TW-409',
    section: 'NZM-PWL',
    trackLine: 'Loco Depot Siding',
    healthStatus: 'Available',
    defectDescription: 'Fully certified and fueled for nighttime cantilever adjustments.',
    powerDisconnectionRequired: false,
    isOverdue: false
  }
];

export async function fetchTdmsAssets() {
  await new Promise((r) => setTimeout(r, 150));
  return mockTdmsAssets;
}

export async function fetchTdmsAssetById(assetId) {
  await new Promise((r) => setTimeout(r, 100));
  return mockTdmsAssets.find(a => a.id === assetId) || null;
}
