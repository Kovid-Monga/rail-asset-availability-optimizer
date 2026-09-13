/**
 * COA (Control Office Application) Mock API
 * Provides live train schedules, passenger hard constraints, and goods forecast soft constraints.
 */

export const mockPassengerTimetable = [
  {
    trainNumber: '22436',
    trainName: 'Vande Bharat Express',
    category: 'Superfast Premium',
    origin: 'NDLS',
    destination: 'BSB',
    section: 'NDLS-MTJ',
    trackLine: 'DN Line',
    departure: '06:00',
    corridorEntry: '06:00',
    corridorExit: '07:18',
    isHardConstraint: true,
    constraintType: 'NON_NEGOTIABLE',
    priorityRank: 1,
    notes: 'Premium high-speed passenger path; zero tolerance for detention.'
  },
  {
    trainNumber: '12952',
    trainName: 'Mumbai Central Tejas Rajdhani',
    category: 'Rajdhani',
    origin: 'NDLS',
    destination: 'MMCT',
    section: 'NDLS-MTJ',
    trackLine: 'DN Line',
    departure: '16:55',
    corridorEntry: '16:55',
    corridorExit: '18:05',
    isHardConstraint: true,
    constraintType: 'NON_NEGOTIABLE',
    priorityRank: 1,
    notes: 'Non-negotiable trunk mail/express priority path.'
  },
  {
    trainNumber: '12004',
    trainName: 'Lucknow Swarna Shatabdi',
    category: 'Shatabdi',
    origin: 'NDLS',
    destination: 'LJN',
    section: 'NDLS-MTJ',
    trackLine: 'DN Line',
    departure: '06:10',
    corridorEntry: '06:10',
    corridorExit: '07:25',
    isHardConstraint: true,
    constraintType: 'NON_NEGOTIABLE',
    priorityRank: 1,
    notes: 'High priority morning commuter express.'
  },
  {
    trainNumber: '12424',
    trainName: 'Dibrugarh Rajdhani Express',
    category: 'Rajdhani',
    origin: 'NDLS',
    destination: 'DBRG',
    section: 'NDLS-MTJ',
    trackLine: 'UP Line',
    departure: '10:05',
    corridorEntry: '10:05',
    corridorExit: '11:15',
    isHardConstraint: true,
    constraintType: 'NON_NEGOTIABLE',
    priorityRank: 1,
    notes: 'Protected path.'
  },
  {
    trainNumber: '12626',
    trainName: 'Kerala Express',
    category: 'Superfast Mail',
    origin: 'NDLS',
    destination: 'TVC',
    section: 'NDLS-MTJ',
    trackLine: 'DN Line',
    departure: '20:10',
    corridorEntry: '20:10',
    corridorExit: '21:30',
    isHardConstraint: true,
    constraintType: 'NON_NEGOTIABLE',
    priorityRank: 2,
    notes: 'Heavy passenger occupancy trunk line train.'
  },
  {
    trainNumber: '64064',
    trainName: 'Palwal - Delhi EMU Local',
    category: 'Suburban Commuter',
    origin: 'PWL',
    destination: 'NDLS',
    section: 'NZM-PWL',
    trackLine: 'UP Line',
    departure: '08:15',
    corridorEntry: '08:15',
    corridorExit: '09:20',
    isHardConstraint: true,
    constraintType: 'NON_NEGOTIABLE',
    priorityRank: 2,
    notes: 'Suburban peak hours; no disruption permitted.'
  }
];

export const mockGoodsForecast = [
  {
    forecastId: 'GF-BOXN-902',
    rakeType: 'BOXN Rake (Thermal Coal)',
    origin: 'TKD Yard',
    destination: 'Dadri NTPC',
    section: 'NDLS-MTJ',
    trackLine: 'UP Line',
    estimatedWindow: '01:30 - 04:00',
    isHardConstraint: false,
    constraintType: 'SOFT_CONSTRAINT',
    flexibility: 'High',
    maxDetentionToleratedMinutes: 90,
    alternateRoutingAvailable: true,
    alternateRoute: 'Via Tuglakabad 3rd Goods By-pass Line',
    notes: 'Soft constraint: can be regulated in Tuglakabad yard or diverted to 3rd Line to accommodate joint maintenance possession.'
  },
  {
    forecastId: 'GF-BTPN-411',
    rakeType: 'BTPN Tanker (POL / Petroleum)',
    origin: 'Mathura Refinery',
    destination: 'Shakurbasti IOCL',
    section: 'PWL-MTJ',
    trackLine: 'DN Line',
    estimatedWindow: '02:15 - 04:30',
    isHardConstraint: false,
    constraintType: 'SOFT_CONSTRAINT',
    flexibility: 'Medium',
    maxDetentionToleratedMinutes: 60,
    alternateRoutingAvailable: true,
    alternateRoute: 'Loop Line Holding at Kosi Kalan',
    notes: 'Soft constraint: can hold at Kosi Kalan siding during track tamping window.'
  },
  {
    forecastId: 'GF-CONCOR-108',
    rakeType: 'CONCOR High-Cube Container',
    origin: 'Khatuwas ICB',
    destination: 'TKD ICD',
    section: 'NZM-PWL',
    trackLine: 'DN Line',
    estimatedWindow: '13:00 - 15:30',
    isHardConstraint: false,
    constraintType: 'SOFT_CONSTRAINT',
    flexibility: 'High',
    maxDetentionToleratedMinutes: 120,
    alternateRoutingAvailable: false,
    notes: 'Afternoon freight movement; flexible dispatch window.'
  }
];

export async function fetchPassengerTimetable() {
  await new Promise((r) => setTimeout(r, 120));
  return mockPassengerTimetable;
}

export async function fetchGoodsForecast() {
  await new Promise((r) => setTimeout(r, 120));
  return mockGoodsForecast;
}
