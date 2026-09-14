export const DEPARTMENTS = {
  ENG: {
    id: 'ENG',
    name: 'Engineering',
    shortCode: 'ENG',
    sourceSystem: 'TMS',
    sourceSystemFullName: 'Track Management System',
    description: 'Civil engineering, permanent way, rail renewals, and track tamping operations.',
    accentColor: '#38BDF8',
    accentBg: 'rgba(56, 189, 248, 0.12)',
    badgeColor: 'text-sky-400 bg-sky-950/60 border-sky-500/30',
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
      { id: 'TMS-TRK-492', name: 'Km 14/2 - 15/8 UP Main Track', type: 'Track Section', health: 'Degraded', lastInspection: '2026-08-28', corridor: 'NDLS-MTJ', gmt: 84.2 },
      { id: 'TMS-SW-108', name: 'Turnout #108A New Delhi Yard', type: 'Point & Crossing', health: 'Critical', lastInspection: '2026-08-20', corridor: 'NDLS-MTJ', gmt: 92.0 },
      { id: 'TMS-BRG-22', name: 'Yamuna Bridge Pier 4 Approach', type: 'Bridge Girder', health: 'Normal', lastInspection: '2026-08-15', corridor: 'NDLS-MTJ', gmt: 78.5 },
      { id: 'TMS-CRV-71', name: 'Curve #14 Faridabad Outer (Radius 450m)', type: 'Sharp Curve', health: 'Watchlist', lastInspection: '2026-08-30', corridor: 'NDLS-MTJ', gmt: 81.0 },
      { id: 'TMS-TRK-510', name: 'Km 28/4 - 31/0 Ballast Bed', type: 'Ballast Section', health: 'Fouled', lastInspection: '2026-08-10', corridor: 'NDLS-MTJ', gmt: 75.3 },
      { id: 'TMS-KLK-12', name: 'Barog Tunnel #33 Track Geometry (Km 42.8)', type: 'Tunnel Track', health: 'Watchlist', lastInspection: '2026-08-26', corridor: 'KLK-SML', gmt: 14.5 },
      { id: 'TMS-KLK-88', name: 'Arch Bridge #226 Arch Inspection (Km 61.4)', type: 'Viaduct', health: 'Normal', lastInspection: '2026-08-19', corridor: 'KLK-SML', gmt: 12.0 }
    ]
  },
  TRD: {
    id: 'TRD',
    name: 'Traction Distribution (TRD)',
    shortCode: 'TRD',
    sourceSystem: 'TDMS',
    sourceSystemFullName: 'Traction Distribution Management System',
    description: '25kV AC overhead equipment (OHE), catenary systems, power feeding, and substations.',
    accentColor: '#F59E0B',
    accentBg: 'rgba(245, 158, 11, 0.12)',
    badgeColor: 'text-amber-400 bg-amber-950/60 border-amber-500/30',
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
      { id: 'TDMS-OHE-88', name: 'Catenary Wire Span 12/4 - 13/8', type: 'OHE Section', health: 'Worn Wire', lastInspection: '2026-08-25', corridor: 'NDLS-MTJ' },
      { id: 'TDMS-TSS-02', name: 'Tuglakabad Traction Sub-Station #2', type: 'TSS Feeder', health: 'Normal', lastInspection: '2026-08-18', corridor: 'NDLS-MTJ' },
      { id: 'TDMS-INS-34', name: 'Section Insulator Assembly SI-34', type: 'Insulator', health: 'Flashover Risk', lastInspection: '2026-08-22', corridor: 'NDLS-MTJ' },
      { id: 'TDMS-TW-01', name: '8-Wheeler Tower Wagon #TW-409', type: 'Rolling Asset', health: 'Available', lastInspection: '2026-09-01', corridor: 'NDLS-MTJ' }
    ]
  },
  SNT: {
    id: 'SNT',
    name: 'Signal & Telecom (S&T)',
    shortCode: 'S&T',
    sourceSystem: 'SMMS',
    sourceSystemFullName: 'Signal Maintenance Management System',
    description: 'Electronic interlocking, point machines, track circuits, axle counters, and signals.',
    accentColor: '#A855F7',
    accentBg: 'rgba(168, 85, 247, 0.12)',
    badgeColor: 'text-purple-400 bg-purple-950/60 border-purple-500/30',
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
      { id: 'SMMS-PM-41', name: 'Electric Point Machine #41A NZM South', type: 'Point Machine', health: 'High Friction', lastInspection: '2026-08-27', corridor: 'NDLS-MTJ' },
      { id: 'SMMS-AXL-19', name: 'Multi-Section Axle Counter MS-DAC 19', type: 'Axle Counter', health: 'Drift Detected', lastInspection: '2026-08-24', corridor: 'NDLS-MTJ' },
      { id: 'SMMS-EI-01', name: 'Faridabad Electronic Interlocking Rack B', type: 'Interlocking', health: 'Redundant Degraded', lastInspection: '2026-08-19', corridor: 'NDLS-MTJ' },
      { id: 'SMMS-SIG-09', name: 'Home Signal 09 Multi-Aspect LED', type: 'Signal Unit', health: 'Normal', lastInspection: '2026-08-29', corridor: 'NDLS-MTJ' },
      { id: 'SMMS-KLK-03', name: 'Barog Station Tokenless Block Instrument #03', type: 'Block Instrument', health: 'Normal', lastInspection: '2026-08-25', corridor: 'KLK-SML' }
    ]
  },
  ADMIN: {
    id: 'ADMIN',
    name: 'Central Operations Control (Admin)',
    shortCode: 'ADMIN',
    sourceSystem: 'OPERATIONS_HUB',
    sourceSystemFullName: 'Integrated Railway Planning & Decision Center',
    description: 'Network-level optimization, cross-department scheduling oversight, and human review adjudication.',
    accentColor: '#F97316',
    accentBg: 'rgba(249, 115, 22, 0.12)',
    badgeColor: 'text-orange-400 bg-orange-950/60 border-orange-500/30',
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
  {
    id: 'KLK-SML',
    name: 'Kalka – Shimla Mountain Railway (Heritage Line)',
    shortName: 'Kalka – Shimla',
    distanceKm: 96,
    avgDuration: '5h 15m',
    totalTrains: 12,
    lineCount: 1,
    status: 'Route Active',
    bannerImage: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80',
    description: 'UNESCO World Heritage 96 km mountain line, 102 tunnels, 864 bridges.'
  },
  {
    id: 'NDLS-MTJ',
    name: 'Delhi – Palwal – Mathura Trunk Corridor',
    shortName: 'Delhi – Mathura',
    distanceKm: 141,
    avgDuration: '1h 50m',
    totalTrains: 148,
    lineCount: 3,
    status: 'High Density Route Active',
    bannerImage: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=1200&q=80',
    description: 'Trunk quad/triple track electrified corridor with Rajdhani, Vande Bharat & heavy freight flows.'
  }
];

export const STATIONS = [
  // NDLS-MTJ Stations
  { corridor: 'NDLS-MTJ', code: 'NDLS', name: 'New Delhi', km: 0 },
  { corridor: 'NDLS-MTJ', code: 'NZM', name: 'Hazrat Nizamuddin', km: 7 },
  { corridor: 'NDLS-MTJ', code: 'TKD', name: 'Tuglakabad Yard', km: 17 },
  { corridor: 'NDLS-MTJ', code: 'FDB', name: 'Faridabad', km: 28 },
  { corridor: 'NDLS-MTJ', code: 'BVH', name: 'Ballabgarh', km: 37 },
  { corridor: 'NDLS-MTJ', code: 'PWL', name: 'Palwal', km: 58 },
  { corridor: 'NDLS-MTJ', code: 'KLD', name: 'Kosi Kalan', km: 101 },
  { corridor: 'NDLS-MTJ', code: 'MTJ', name: 'Mathura Junction', km: 141 },
  // KLK-SML Stations
  { corridor: 'KLK-SML', code: 'KLK', name: 'Kalka', km: 0 },
  { corridor: 'KLK-SML', code: 'DMP', name: 'Dharampur Himachal', km: 33 },
  { corridor: 'KLK-SML', code: 'BRG', name: 'Barog', km: 43 },
  { corridor: 'KLK-SML', code: 'SOL', name: 'Solan', km: 47 },
  { corridor: 'KLK-SML', code: 'KDGH', name: 'Kandaghat', km: 59 },
  { corridor: 'KLK-SML', code: 'TVI', name: 'Taradevi', km: 85 },
  { corridor: 'KLK-SML', code: 'SML', name: 'Shimla', km: 96 }
];
