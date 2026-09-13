/**
 * REQUESTS SERVICE LAYER
 * 
 * NOTE: All calls to the AI prioritization & optimization engine pass exclusively
 * through `runScheduling(...)` imported from `./schedulingEngine.js`.
 * No component imports schedulingEngine directly. Swapping for a real backend API
 * only requires updating this file.
 */

import { runScheduling } from './schedulingEngine';
import { REQUEST_STAGES } from '../constants/departments';

const STORAGE_KEY = 'railway_block_planner_requests_v1';

// Initial realistic seed requests
const initialRequests = [
  {
    id: 'ENG-2026-00421',
    department: 'ENG',
    departmentName: 'Engineering',
    sourceSystem: 'TMS',
    corridor: 'NDLS-MTJ',
    sectionName: 'Delhi - Palwal - Mathura Corridor',
    location: 'Km 14/2 - 15/8 (Between Hazrat Nizamuddin and Tuglakabad)',
    trackLine: 'UP Line',
    assetId: 'TMS-TRK-492',
    assetName: 'Km 14/2 - 15/8 UP Main Track',
    sourceAssetHealth: 'Degraded',
    isOverdue: true,
    overdueDate: '2026-09-01',
    maintenanceType: 'Through Sleeper Renewal (TSR)',
    description: 'Replacement of 420 PSC sleepers showing cracking and rubber pad wear; track realignment and tamp pass.',
    estimatedDurationMinutes: 150,
    preferredWindow: 'Night Window (01:30 - 04:00)',
    earliestStartTime: '2026-09-08 01:00',
    latestAcceptableTime: '2026-09-08 05:00',
    deadline: '2026-09-10 18:00',
    declaredPriority: 'Critical', // Department declared input signal
    // Engineering specific constraints
    speedRestrictionRequired: true,
    speedRestrictionValue: '45 km/h for 24h post-renewal',
    machinesRequired: ['Duomatic Tamping Machine #09-32', 'Ballast Regulator'],
    crewCount: 24,
    powerDisconnectionRequired: true,
    // Lifecycle Status strictly following PRD
    status: REQUEST_STAGES.SCHEDULED,
    statusHistory: [
      { stage: REQUEST_STAGES.SUBMITTED, timestamp: '2026-09-06 09:30', note: 'Submitted by Senior Section Engineer (P-Way), Delhi Division.' },
      { stage: REQUEST_STAGES.ML_PRIORITIZATION, timestamp: '2026-09-06 09:35', note: 'TMS defect flags ingested. Priority index 94.2/100 computed based on 6-day overdue status and GMT density.' },
      { stage: REQUEST_STAGES.OPTIMIZATION, timestamp: '2026-09-06 09:40', note: 'COA timetable analyzed. Cross-department bundling identified with S&T Point Machine overhaul.' },
      { stage: REQUEST_STAGES.SCHEDULED, timestamp: '2026-09-06 09:42', note: 'Auto-scheduled in 01:30 - 04:00 night shadow window.' }
    ],
    // Scheduling engine result
    score: 94.2,
    scheduledSlot: {
      date: '2026-09-08',
      timeWindow: '01:30 - 04:00 (Night Possession)',
      section: 'NDLS-MTJ (Km 14/2 - 15/8)',
      trackLine: 'UP Line',
      durationMinutes: 150
    },
    aiExplanation: {
      priorityDrivers: [
        'TMS Track Defect: Rail corrugation & rubber pad crushing exceeding tolerance (Score contribution: +28)',
        'Inspection cycle overdue by 6 days on high-tonnage trunk route (Score contribution: +25)',
        'Department declared input priority: Critical (Score contribution: +20)'
      ],
      deadlineProximity: 'Cut-off deadline is within 48h; immediate slot required to avoid permanent speed restriction.',
      timetableGaps: 'Fits within the 160-minute clear passenger gap between Train #12952 (01:10) and #12004 (04:45).',
      goodsImpact: 'Goods train #GF-BOXN-902 held in Tuglakabad yard loop for 35 minutes; 0 mainline delay.',
      bundledDepartments: ['S&T (Signal & Telecom)', 'TRD (Traction Distribution)'],
      bundlingBenefit: 'Co-located with S&T Point Machine #41A inspection, eliminating the need for a separate 120-minute track possession.',
      assetImportance: 'Carries 78.4 GMT annual freight + 84 passenger trains/day.'
    }
  },
  {
    id: 'ENG-2026-00422',
    department: 'ENG',
    departmentName: 'Engineering',
    sourceSystem: 'TMS',
    corridor: 'NDLS-MTJ',
    sectionName: 'Delhi - Palwal - Mathura Corridor',
    location: 'Km 28/4 - 31/0 (Near Faridabad Outer)',
    trackLine: 'DN Line',
    assetId: 'TMS-TRK-510',
    assetName: 'Km 28/4 - 31/0 Ballast Bed',
    sourceAssetHealth: 'Fouled',
    isOverdue: false,
    maintenanceType: 'Ballast Cleaning / Screening (BCM)',
    description: 'BCM deployment for deep ballast screening to restore track elasticity and drainage.',
    estimatedDurationMinutes: 180,
    preferredWindow: 'Daytime Peak (08:00 - 11:00)', // Intentionally conflicts with passenger trains
    earliestStartTime: '2026-09-09 08:00',
    latestAcceptableTime: '2026-09-09 13:00',
    deadline: '2026-09-15 17:00',
    declaredPriority: 'High',
    speedRestrictionRequired: true,
    speedRestrictionValue: '30 km/h',
    machinesRequired: ['Ballast Cleaning Machine (BCM-342)'],
    crewCount: 18,
    powerDisconnectionRequired: false,
    // PRD Alternate Path: Cannot Be Accommodated -> Alternative Suggested
    status: REQUEST_STAGES.ALTERNATIVE_SUGGESTED,
    statusHistory: [
      { stage: REQUEST_STAGES.SUBMITTED, timestamp: '2026-09-06 14:15', note: 'Submitted by Section Engineer Track.' },
      { stage: REQUEST_STAGES.CANNOT_BE_ACCOMMODATED, timestamp: '2026-09-06 14:20', note: 'Preferred morning daytime window (08:00 - 11:00) rejected due to non-negotiable commuter & Vande Bharat schedules.' },
      { stage: REQUEST_STAGES.ALTERNATIVE_SUGGESTED, timestamp: '2026-09-06 14:22', note: '3 viable shadow and night slots computed with zero passenger disruption.' }
    ],
    score: 81.5,
    conflictReason: 'Direct conflict with COA passenger timetable: Vande Bharat Express #22436 and EMU Commuter #64064 occupy this block between 08:15 and 09:30. A 180-minute block would cause severe suburban cascade delays (>65 min).',
    aiExplanation: {
      priorityDrivers: [
        'Fouled ballast index at 42% (Warning threshold)',
        'Department declared input priority: High'
      ],
      deadlineProximity: 'Deadline is 6 days away; operational flexibility exists.',
      timetableGaps: 'Morning peak is saturated with 8 commuter rakes. Night shadow window 01:45 - 04:45 has zero conflicts.',
      goodsImpact: 'Goods train can be diverted to 3rd line.',
      bundledDepartments: ['TRD (Traction Distribution)'],
      bundlingBenefit: 'Can be scheduled simultaneously with TRD Section Insulator maintenance.',
      assetImportance: 'Standard main line section.'
    },
    alternatives: [
      {
        id: 'ALT-ENG-01',
        slotDate: '2026-09-08',
        timeWindow: '01:45 - 04:45 (Night Shadow Window)',
        confidence: 96,
        impactScore: 'Zero passenger train delays. 1 goods train regulated at TKD Yard.',
        recommended: true
      },
      {
        id: 'ALT-ENG-02',
        slotDate: '2026-09-09',
        timeWindow: '12:30 - 15:30 (Afternoon Slack Window)',
        confidence: 82,
        impactScore: 'Requires single-line working on UP track; 2 passenger trains held for 8 mins each.',
        recommended: false
      },
      {
        id: 'ALT-ENG-03',
        slotDate: '2026-09-10',
        timeWindow: '01:30 - 04:30 (Night Window)',
        confidence: 93,
        impactScore: 'Full corridor possession with dedicated power isolation.',
        recommended: false
      }
    ]
  },
  {
    id: 'ENG-2026-00419',
    department: 'ENG',
    departmentName: 'Engineering',
    sourceSystem: 'TMS',
    corridor: 'NDLS-MTJ',
    sectionName: 'Delhi - Palwal - Mathura Corridor',
    location: 'Km 10/4 Cross-over 3 (NDLS Yard South)',
    trackLine: 'Cross-over 3',
    assetId: 'TMS-SW-108',
    assetName: 'Turnout #108A New Delhi Yard',
    sourceAssetHealth: 'Critical',
    isOverdue: true,
    maintenanceType: 'Turnout Replacement',
    description: 'Stock rail and tongue rail replacement due to micro-fracture; urgent track renewal.',
    estimatedDurationMinutes: 210,
    preferredWindow: 'Night Window (01:00 - 04:30)',
    deadline: '2026-09-08 10:00',
    declaredPriority: 'Critical',
    speedRestrictionRequired: true,
    speedRestrictionValue: '15 km/h over turnout',
    machinesRequired: ['Track Crane T-40', 'Turnout Tamping Machine (Unimat)'],
    crewCount: 30,
    powerDisconnectionRequired: true,
    // PRD Appeal Path: Submitted -> AI Decision -> Human Review Requested -> Admin Review
    status: REQUEST_STAGES.HUMAN_REVIEW_REQUESTED,
    statusHistory: [
      { stage: REQUEST_STAGES.SUBMITTED, timestamp: '2026-09-05 11:00', note: 'Submitted by Track Engineer.' },
      { stage: REQUEST_STAGES.AI_DECISION, timestamp: '2026-09-05 11:15', note: 'AI suggested 2-day deferral to Sept 10 to combine with mega yard power block.' },
      { stage: REQUEST_STAGES.HUMAN_REVIEW_REQUESTED, timestamp: '2026-09-05 14:00', note: 'Department appeal filed by Senior DEN: Defect ultrasonic test revealed micro-crack propagating rapidly.' }
    ],
    score: 96.0,
    appealDetails: {
      reasonCategory: 'Defect worse than source data captured',
      appealText: 'Subsequent ultrasonic flaw testing (USFD) conducted this afternoon detected a transverse flaw extending 18mm into the rail head. TMS database only reflected surface chip. Deferring to Sept 10 introduces derailment risk on 130 km/h route. Request emergency override for tonight.',
      evidenceAttachment: 'USFD_Flaw_Report_Turnout_108A_Scan.pdf',
      submittedBy: 'Er. R. K. Sharma (Sr. DEN / North)',
      submittedAt: '2026-09-05 14:00'
    },
    aiExplanation: {
      priorityDrivers: [
        'TMS source health: Critical Turnout defect',
        'High derailment risk index on point assembly'
      ],
      deadlineProximity: 'Within 24 hours',
      timetableGaps: 'Requires special yard possession.',
      goodsImpact: 'Yard shunting halted.',
      bundledDepartments: ['S&T (Signal & Telecom)'],
      assetImportance: 'Critical New Delhi Yard throat switch.'
    }
  },
  {
    id: 'TRD-2026-00109',
    department: 'TRD',
    departmentName: 'Traction Distribution (TRD)',
    sourceSystem: 'TDMS',
    corridor: 'NDLS-MTJ',
    sectionName: 'Delhi - Palwal - Mathura Corridor',
    location: 'Km 12/4 - 13/8 UP Track',
    trackLine: 'UP Line',
    assetId: 'TDMS-OHE-88',
    assetName: 'Catenary Wire Span Km 12/4 - 13/8',
    sourceAssetHealth: 'Worn Wire',
    isOverdue: true,
    maintenanceType: 'Contact Wire & Catenary Replacement',
    description: 'Splice insertion and tension regulation on worn 107 sq mm copper contact wire.',
    estimatedDurationMinutes: 140,
    preferredWindow: 'Night Window (01:30 - 04:00)',
    deadline: '2026-09-09 12:00',
    declaredPriority: 'Critical',
    // TRD specific fields
    powerDisconnectionRequired: true,
    oheMaintenanceType: 'Catenary & Contact Wire Splice',
    equipmentInvolved: '8-Wheeler Tower Wagon #TW-409, Earthing Rods (4 sets)',
    electricalSafetyConstraints: 'Traction Power Controller (TPC) Permit-to-Work (PTW) required; Tuglakabad TSS feeder 2 isolation.',
    requiredDuration: '140 minutes',
    status: REQUEST_STAGES.SCHEDULED,
    statusHistory: [
      { stage: REQUEST_STAGES.SUBMITTED, timestamp: '2026-09-06 10:10', note: 'Submitted by SSE/TRD/NZM.' },
      { stage: REQUEST_STAGES.ML_PRIORITIZATION, timestamp: '2026-09-06 10:15', note: 'Priority score 92.8 calculated from contact wire caliper measurements.' },
      { stage: REQUEST_STAGES.OPTIMIZATION, timestamp: '2026-09-06 10:20', note: 'Bundled with Engineering sleeper renewal (ENG-2026-00421) under single power shutdown.' },
      { stage: REQUEST_STAGES.SCHEDULED, timestamp: '2026-09-06 10:22', note: 'Scheduled jointly for 2026-09-08 01:30 - 04:00.' }
    ],
    score: 92.8,
    scheduledSlot: {
      date: '2026-09-08',
      timeWindow: '01:30 - 04:00 (Night Joint Possession)',
      section: 'NDLS-MTJ (Km 12/4 - 13/8)',
      trackLine: 'UP Line',
      durationMinutes: 140
    },
    aiExplanation: {
      priorityDrivers: [
        'Contact wire worn to 8.2mm (critical threshold is 8.0mm)',
        'Risk of pantograph entanglement on high-speed trains'
      ],
      deadlineProximity: 'Inspection overdue by 4 days',
      timetableGaps: 'Zero passenger detention in night shadow window',
      goodsImpact: 'Diverted via 3rd line with no delay',
      bundledDepartments: ['Engineering (ENG)', 'S&T (Signal & Telecom)'],
      bundlingBenefit: 'Executed inside the track possession of ENG-2026-00421; saves an independent 140-minute corridor shutdown!',
      assetImportance: '25kV AC overhead mainline feeder'
    }
  },
  {
    id: 'SNT-2026-00305',
    department: 'SNT',
    departmentName: 'Signal & Telecom (S&T)',
    sourceSystem: 'SMMS',
    corridor: 'NDLS-MTJ',
    sectionName: 'Delhi - Palwal - Mathura Corridor',
    location: 'NZM South Yard (Km 14/10)',
    trackLine: 'Cross-over 2',
    assetId: 'SMMS-PM-41',
    assetName: 'Electric Point Machine #41A NZM South',
    sourceAssetHealth: 'High Friction',
    isOverdue: true,
    maintenanceType: 'Point Machine Overhaul & Friction Clutch Test',
    description: 'Motor overhaul, internal gear box cleaning, and contact finger replacement on 110V DC point machine.',
    estimatedDurationMinutes: 120,
    preferredWindow: 'Night Window (01:30 - 03:45)',
    deadline: '2026-09-09 18:00',
    declaredPriority: 'Critical',
    // S&T specific fields
    signalTelecomAsset: 'Point Machine 110V DC Siemens type',
    operationalSafetyConstraints: 'Disconnection memo to Station Master; signals held at Danger (Red Aspect); crank handle interlock locked.',
    requiredDuration: '120 minutes',
    powerDisconnectionRequired: false,
    status: REQUEST_STAGES.SCHEDULED,
    statusHistory: [
      { stage: REQUEST_STAGES.SUBMITTED, timestamp: '2026-09-06 10:30', note: 'Submitted by Section Engineer (Signal).' },
      { stage: REQUEST_STAGES.ML_PRIORITIZATION, timestamp: '2026-09-06 10:35', note: 'SMMS friction logs analyzed; throw time 6.8s flagged.' },
      { stage: REQUEST_STAGES.OPTIMIZATION, timestamp: '2026-09-06 10:40', note: 'Bundled with ENG-2026-00421 and TRD-2026-00109.' },
      { stage: REQUEST_STAGES.SCHEDULED, timestamp: '2026-09-06 10:42', note: 'Scheduled co-located in unified possession block.' }
    ],
    score: 91.4,
    scheduledSlot: {
      date: '2026-09-08',
      timeWindow: '01:30 - 03:45 (Joint Possession)',
      section: 'NDLS-MTJ (Km 14/10)',
      trackLine: 'Cross-over 2',
      durationMinutes: 120
    },
    aiExplanation: {
      priorityDrivers: [
        'Point machine throw time degraded to 6.8s (Safe limit < 5.0s)',
        'SMMS telemetry indicates intermittent friction clutch slip'
      ],
      deadlineProximity: 'Overdue by 5 days',
      timetableGaps: 'Zero passenger impact in night slot',
      goodsImpact: 'Held in TKD Yard',
      bundledDepartments: ['Engineering (ENG)', 'TRD (Traction Distribution)'],
      bundlingBenefit: 'Shares the track block taken for sleeper renewal at Km 14, achieving 100% co-location efficiency.',
      assetImportance: 'Primary crossover switch into Hazrat Nizamuddin platform 2'
    }
  },
  {
    id: 'ENG-2026-00415',
    department: 'ENG',
    departmentName: 'Engineering',
    sourceSystem: 'TMS',
    corridor: 'NZM-PWL',
    sectionName: 'Hazrat Nizamuddin - Palwal Section',
    location: 'Km 34/2 - 37/0',
    trackLine: 'UP Line',
    assetId: 'TMS-CRV-71',
    assetName: 'Curve #14 Faridabad Outer (Radius 450m)',
    sourceAssetHealth: 'Normal',
    isOverdue: false,
    maintenanceType: 'Track Tamping (CSM / Duomatic)',
    description: 'Post-monsoon curve realignment and tamping pass.',
    estimatedDurationMinutes: 120,
    preferredWindow: 'Night Window',
    deadline: '2026-09-04 18:00',
    declaredPriority: 'Normal',
    speedRestrictionRequired: false,
    status: REQUEST_STAGES.COMPLETED,
    statusHistory: [
      { stage: REQUEST_STAGES.SUBMITTED, timestamp: '2026-09-02 08:00', note: 'Submitted.' },
      { stage: REQUEST_STAGES.ML_PRIORITIZATION, timestamp: '2026-09-02 08:05', note: 'Scored 74.0.' },
      { stage: REQUEST_STAGES.OPTIMIZATION, timestamp: '2026-09-02 08:10', note: 'Assigned 02:00 night slot.' },
      { stage: REQUEST_STAGES.SCHEDULED, timestamp: '2026-09-02 08:15', note: 'Scheduled.' },
      { stage: REQUEST_STAGES.IN_PROGRESS, timestamp: '2026-09-04 02:00', note: 'Track possession granted by Train Controller.' },
      { stage: REQUEST_STAGES.COMPLETED, timestamp: '2026-09-04 04:00', note: 'Block surrendered on time. Track fit certified for 110 km/h.' }
    ],
    score: 74.0
  }
];

// Helper to get local data
function getStore() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialRequests));
    return initialRequests;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return initialRequests;
  }
}

function saveStore(requests) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
}

// -------------------------------------------------------------
// PUBLIC SERVICE API
// -------------------------------------------------------------

export async function getAllRequests() {
  await new Promise((r) => setTimeout(r, 100));
  return getStore();
}

export async function getRequestsByDepartment(departmentId) {
  await new Promise((r) => setTimeout(r, 100));
  const store = getStore();
  return store.filter(r => r.department === departmentId);
}

export async function getRequestById(id) {
  await new Promise((r) => setTimeout(r, 80));
  const store = getStore();
  return store.find(r => r.id === id) || null;
}

/**
 * Creates a new request and triggers the isolated AI/ML optimization engine
 */
export async function createRequest(requestData) {
  const store = getStore();
  const year = new Date().getFullYear();
  const dept = requestData.department || 'ENG';
  const count = store.filter(r => r.department === dept).length + 423;
  const newId = `${dept}-${year}-${String(count).padStart(5, '0')}`;

  const newRequest = {
    ...requestData,
    id: newId,
    status: REQUEST_STAGES.SUBMITTED,
    statusHistory: [
      {
        stage: REQUEST_STAGES.SUBMITTED,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        note: `Submitted by ${dept} Department. Priority declared as ${requestData.declaredPriority} (input signal).`
      }
    ]
  };

  // Run isolated mock scheduling engine
  const [engineResult] = await runScheduling([newRequest]);

  if (engineResult.decision === 'SCHEDULED') {
    newRequest.status = REQUEST_STAGES.SCHEDULED;
    newRequest.score = engineResult.score;
    newRequest.scheduledSlot = engineResult.scheduledSlot;
    newRequest.aiExplanation = engineResult.explanation;
    newRequest.statusHistory.push(
      {
        stage: REQUEST_STAGES.ML_PRIORITIZATION,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        note: `ML priority score computed: ${engineResult.score}/100.`
      },
      {
        stage: REQUEST_STAGES.OPTIMIZATION,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        note: 'COA passenger & goods paths evaluated; bundled with cross-department work.'
      },
      {
        stage: REQUEST_STAGES.SCHEDULED,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        note: `Auto-scheduled in ${engineResult.scheduledSlot.timeWindow}.`
      }
    );
  } else {
    newRequest.status = REQUEST_STAGES.ALTERNATIVE_SUGGESTED;
    newRequest.score = engineResult.score;
    newRequest.conflictReason = engineResult.conflictReason;
    newRequest.aiExplanation = engineResult.explanation;
    newRequest.alternatives = engineResult.alternatives;
    newRequest.statusHistory.push(
      {
        stage: REQUEST_STAGES.CANNOT_BE_ACCOMMODATED,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        note: engineResult.conflictReason
      },
      {
        stage: REQUEST_STAGES.ALTERNATIVE_SUGGESTED,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        note: 'Generated 3 viable conflict-free alternative slots.'
      }
    );
  }

  store.unshift(newRequest);
  saveStore(store);
  return newRequest;
}

/**
 * User accepts a suggested alternative slot
 */
export async function acceptAlternativeSlot(requestId, alternativeId) {
  const store = getStore();
  const index = store.findIndex(r => r.id === requestId);
  if (index === -1) throw new Error('Request not found');

  const req = store[index];
  const selectedAlt = req.alternatives?.find(a => a.id === alternativeId) || req.alternatives?.[0];

  req.status = REQUEST_STAGES.SCHEDULED;
  req.scheduledSlot = {
    date: selectedAlt.slotDate,
    timeWindow: selectedAlt.timeWindow,
    section: req.corridor,
    trackLine: req.trackLine,
    durationMinutes: req.estimatedDurationMinutes
  };

  req.statusHistory.push(
    {
      stage: REQUEST_STAGES.ACCEPTED,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      note: `Department accepted suggested alternative: ${selectedAlt.timeWindow} on ${selectedAlt.slotDate}.`
    },
    {
      stage: REQUEST_STAGES.SCHEDULED,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      note: 'Alternative slot confirmed and locked into corridor master schedule.'
    }
  );

  saveStore(store);
  return req;
}

/**
 * Department submits human review appeal
 */
export async function submitHumanReviewAppeal(requestId, appealData) {
  const store = getStore();
  const index = store.findIndex(r => r.id === requestId);
  if (index === -1) throw new Error('Request not found');

  const req = store[index];
  req.status = REQUEST_STAGES.HUMAN_REVIEW_REQUESTED;
  req.appealDetails = {
    reasonCategory: appealData.reasonCategory,
    appealText: appealData.appealText,
    evidenceAttachment: appealData.evidenceAttachment || 'Field_Inspection_Report.pdf',
    submittedBy: appealData.submittedBy || 'Department Officer',
    submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
  };

  req.statusHistory.push({
    stage: REQUEST_STAGES.HUMAN_REVIEW_REQUESTED,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
    note: `Appeal submitted to Central Operations Control: ${appealData.reasonCategory}.`
  });

  saveStore(store);
  return req;
}

/**
 * Admin adjudicates human review appeal
 */
export async function adminReviewAppeal(requestId, decision, remarks, modifiedSlot = null) {
  const store = getStore();
  const index = store.findIndex(r => r.id === requestId);
  if (index === -1) throw new Error('Request not found');

  const req = store[index];
  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

  req.statusHistory.push({
    stage: REQUEST_STAGES.ADMIN_REVIEW,
    timestamp: now,
    note: `Reviewed by Chief Operations Controller. Action: ${decision}. Remarks: ${remarks}`
  });

  if (decision === 'APPROVE_OVERRIDE') {
    req.status = REQUEST_STAGES.APPROVED_OVERRIDDEN;
    req.scheduledSlot = modifiedSlot || req.scheduledSlot || {
      date: '2026-09-08',
      timeWindow: req.preferredWindow || '01:30 - 04:00 (Emergency Override Block)',
      section: req.corridor,
      trackLine: req.trackLine,
      durationMinutes: req.estimatedDurationMinutes
    };
    req.adminOverrideRemarks = remarks;
  } else if (decision === 'REJECT') {
    req.status = REQUEST_STAGES.REJECTED;
    req.adminRejectionReason = remarks;
  }

  saveStore(store);
  return req;
}

/**
 * Admin manual override (exception path)
 */
export async function manualOverrideBlock(requestId, overrideData) {
  const store = getStore();
  const index = store.findIndex(r => r.id === requestId);
  if (index === -1) throw new Error('Request not found');

  const req = store[index];
  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

  req.status = REQUEST_STAGES.APPROVED_OVERRIDDEN;
  req.scheduledSlot = {
    date: overrideData.slotDate,
    timeWindow: overrideData.timeWindow,
    section: req.corridor,
    trackLine: req.trackLine,
    durationMinutes: overrideData.durationMinutes || req.estimatedDurationMinutes
  };
  req.manualOverrideAudit = {
    authorizedBy: overrideData.authorizedBy || 'Chief Operations Controller (Admin)',
    authorizationCode: overrideData.authorizationCode,
    justification: overrideData.justification,
    timestamp: now
  };

  req.statusHistory.push({
    stage: REQUEST_STAGES.APPROVED_OVERRIDDEN,
    timestamp: now,
    note: `MANUAL OVERRIDE EXECUTED: ${overrideData.justification} (Auth: ${overrideData.authorizationCode})`
  });

  saveStore(store);
  return req;
}
