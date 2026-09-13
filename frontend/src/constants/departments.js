export const DEPARTMENTS = {
  ENG: {
    id: 'ENG',
    name: 'Engineering',
    shortCode: 'ENG',
    sourceSystem: 'TMS',
    sourceSystemFullName: 'Track Management System',
    description: 'Civil engineering, permanent way, rail renewals, and track tamping operations.',
    accentColor: '#3E5C55',
    accentBg: '#E8EFEA',
    badgeColor: 'text-[#3E5C55] bg-[#E8EFEA] border-[#3E5C55]/30',
    prefix: 'ENG',
    defaultLocation: 'NDLS-NZM (UP Line)',
    maintenanceTypes: [
      'Through Rail Renewal (TRR)',
      'Through Sleeper Renewal (TSR)',
      'Turnout Replacement',
      'Track Tamping (CSM / Duomatic)',
      'Ballast Cleaning / Screening (BCM)',
      'Alumino-Thermic (AT) Rail Welding',
      'Track Deep Screening',
      'De-stressing of LWR/CWR'
    ],
    assets: [
      { id: 'TMS-TRK-492', name: 'Km 14/2 - 15/8 UP Main Track', type: 'Track Section', health: 'Degraded', lastInspection: '2026-08-28' },
      { id: 'TMS-SW-108', name: 'Turnout #108A New Delhi Yard', type: 'Point & Crossing', health: 'Critical', lastInspection: '2026-08-20' },
      { id: 'TMS-BRG-22', name: 'Yamuna Bridge Pier 4 Approach', type: 'Bridge Girder', health: 'Normal', lastInspection: '2026-08-15' },
      { id: 'TMS-CRV-71', name: 'Curve #14 Faridabad Outer (Radius 450m)', type: 'Sharp Curve', health: 'Watchlist', lastInspection: '2026-08-30' },
      { id: 'TMS-TRK-510', name: 'Km 28/4 - 31/0 Ballast Bed', type: 'Ballast Section', health: 'Fouled', lastInspection: '2026-08-10' }
    ]
  },
  TRD: {
    id: 'TRD',
    name: 'Traction Distribution (TRD)',
    shortCode: 'TRD',
    sourceSystem: 'TDMS',
    sourceSystemFullName: 'Traction Distribution Management System',
    description: '25kV AC overhead equipment (OHE), catenary systems, power feeding, and substations.',
    accentColor: '#B5762E',
    accentBg: '#F7EFE3',
    badgeColor: 'text-[#B5762E] bg-[#F7EFE3] border-[#B5762E]/30',
    prefix: 'TRD',
    defaultLocation: 'NZM-FDB (DN Line)',
    maintenanceTypes: [
      'Contact Wire & Catenary Replacement',
      'Dropper & Jumper Adjustment',
      'Bracket & Insulator Washing/Replacement',
      'OHE Neutral Section Overhaul',
      'Traction Substation Transformer Maintenance',
      'Tower Wagon Cantilever Inspection',
      'Bonding & Earthing Verification',
      'Tree Trimming & Infringement Clearance'
    ],
    assets: [
      { id: 'TDMS-OHE-88', name: 'Catenary Wire Span 12/4 - 13/8', type: 'OHE Section', health: 'Worn Wire', lastInspection: '2026-08-25' },
      { id: 'TDMS-TSS-02', name: 'Tuglakabad Traction Sub-Station #2', type: 'TSS Feeder', health: 'Normal', lastInspection: '2026-08-18' },
      { id: 'TDMS-INS-34', name: 'Section Insulator Assembly SI-34', type: 'Insulator', health: 'Flashover Risk', lastInspection: '2026-08-22' },
      { id: 'TDMS-TW-01', name: '8-Wheeler Tower Wagon #TW-409', type: 'Rolling Asset', health: 'Available', lastInspection: '2026-09-01' }
    ]
  },
  SNT: {
    id: 'SNT',
    name: 'Signal & Telecom (S&T)',
    shortCode: 'S&T',
    sourceSystem: 'SMMS',
    sourceSystemFullName: 'Signal Maintenance Management System',
    description: 'Electronic interlocking, point machines, track circuits, axle counters, and signals.',
    accentColor: '#4A6B82',
    accentBg: '#EBF1F5',
    badgeColor: 'text-[#4A6B82] bg-[#EBF1F5] border-[#4A6B82]/30',
    prefix: 'SNT',
    defaultLocation: 'FDB-PWL (Common Interlocking)',
    maintenanceTypes: [
      'Point Machine Overhaul & Friction Clutch Test',
      'Track Circuit Bonding & Audio Frequency Check',
      'Digital Axle Counter (DAC) Sensor Alignment',
      'Electronic Interlocking (EI) Card Replacement',
      'LED Signal Aspect Maintenance',
      'Block Instrument & Tokenless Line Overhaul',
      'Optical Fibre Cable (OFC) Splicing & Ring Test',
      'Level Crossing Gate Interlocking Audit'
    ],
    assets: [
      { id: 'SMMS-PM-41', name: 'Electric Point Machine #41A NZM South', type: 'Point Machine', health: 'High Friction', lastInspection: '2026-08-27' },
      { id: 'SMMS-AXL-19', name: 'Multi-Section Axle Counter MS-DAC 19', type: 'Axle Counter', health: 'Drift Detected', lastInspection: '2026-08-24' },
      { id: 'SMMS-EI-01', name: 'Faridabad Electronic Interlocking Rack B', type: 'Interlocking', health: 'Redundant Degraded', lastInspection: '2026-08-19' },
      { id: 'SMMS-SIG-09', name: 'Home Signal 09 Multi-Aspect LED', type: 'Signal Unit', health: 'Normal', lastInspection: '2026-08-29' }
    ]
  },
  ADMIN: {
    id: 'ADMIN',
    name: 'Central Operations Control (Admin)',
    shortCode: 'ADMIN',
    sourceSystem: 'OPERATIONS_HUB',
    sourceSystemFullName: 'Integrated Railway Planning & Decision Center',
    description: 'Network-level optimization, cross-department scheduling oversight, and human review adjudication.',
    accentColor: '#2B2621',
    accentBg: '#E5DFD4',
    badgeColor: 'text-[#2B2621] bg-[#E5DFD4] border-[#2B2621]/30',
    prefix: 'ADM'
  }
};

export const REQUEST_STAGES = {
  SUBMITTED: 'Submitted',
  ML_PRIORITIZATION: 'ML Prioritization',
  OPTIMIZATION: 'Optimization',
  SCHEDULED: 'Scheduled',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  // Alternate paths
  CANNOT_BE_ACCOMMODATED: 'Cannot Be Accommodated',
  ALTERNATIVE_SUGGESTED: 'Alternative Suggested',
  ACCEPTED: 'Accepted',
  // Appeal path
  AI_DECISION: 'AI Decision',
  HUMAN_REVIEW_REQUESTED: 'Human Review Requested',
  ADMIN_REVIEW: 'Admin Review',
  APPROVED_OVERRIDDEN: 'Approved/Overridden',
  REJECTED: 'Rejected'
};

export const CORRIDORS = [
  { id: 'NDLS-MTJ', name: 'Delhi - Palwal - Mathura Corridor', distanceKm: 141, lineCount: 3 },
  { id: 'NZM-PWL', name: 'Hazrat Nizamuddin - Palwal Section', distanceKm: 58, lineCount: 3 },
  { id: 'PWL-MTJ', name: 'Palwal - Mathura Junction Section', distanceKm: 83, lineCount: 2 }
];

export const STATIONS = [
  { code: 'NDLS', name: 'New Delhi', km: 0 },
  { code: 'NZM', name: 'Hazrat Nizamuddin', km: 7 },
  { code: 'TKD', name: 'Tuglakabad Yard', km: 17 },
  { code: 'FDB', name: 'Faridabad', km: 28 },
  { code: 'BVH', name: 'Ballabgarh', km: 37 },
  { code: 'PWL', name: 'Palwal', km: 58 },
  { code: 'KLD', name: 'Kosi Kalan', km: 101 },
  { code: 'MTJ', name: 'Mathura Junction', km: 141 }
];
