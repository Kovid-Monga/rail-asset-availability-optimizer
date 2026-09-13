/**
 * MOCK SCHEDULING ENGINE STUB
 * 
 * NOTE: This is an isolated, temporary frontend stub standing in for the real 
 * AI/ML Prioritization layer and combinatorial optimization engine (backend scope).
 * 
 * CONTRACT:
 * - Exports a single entrypoint: `runScheduling(requests, corridorContext)`
 * - Only called by `/services/requests.js`
 * - No UI component should import this file directly
 */

export async function runScheduling(requests, corridorContext = {}) {
  // Simulate asynchronous optimization cycle
  await new Promise((resolve) => setTimeout(resolve, 300));

  const scheduledResults = [];
  const processedCorridors = {};

  for (const req of requests) {
    // 1. Calculate algorithmic priority score (0 - 100)
    // Formula incorporates: source system asset health, inspection overdue margin,
    // department declared priority (as input signal), corridor throughput, and passenger safety risk.
    let baseScore = 65;

    // Signal weight from department
    if (req.declaredPriority === 'Critical') baseScore += 18;
    else if (req.declaredPriority === 'High') baseScore += 12;
    else if (req.declaredPriority === 'Normal') baseScore += 5;

    // Asset health from source system
    if (req.sourceAssetHealth === 'Critical' || req.sourceAssetHealth === 'Degraded') baseScore += 12;
    if (req.isOverdue) baseScore += 10;

    // Proximity to deadline
    const deadlineHours = req.deadline ? Math.max(4, Math.floor((new Date(req.deadline) - new Date()) / (1000 * 60 * 60))) : 48;
    if (deadlineHours <= 24) baseScore += 8;

    const finalScore = Math.min(98.5, Number(baseScore.toFixed(1)));

    // 2. Identify Cross-Department Bundling Opportunities
    // If another department has work in the same corridor section within the same 48-hour window, combine them!
    const key = `${req.corridor || 'NDLS-MTJ'}_${req.trackLine || 'UP'}`;
    let bundledDepts = [];
    if (!processedCorridors[key]) {
      processedCorridors[key] = [req.department];
    } else {
      if (!processedCorridors[key].includes(req.department)) {
        processedCorridors[key].push(req.department);
      }
      bundledDepts = processedCorridors[key].filter(d => d !== req.department);
    }

    // 3. Evaluate Corridor & Timetable Feasibility
    // Check for non-negotiable passenger conflicts
    const hasUnresolvablePassengerConflict = req.preferredWindow === 'Daytime Peak (08:00 - 11:00)';

    if (hasUnresolvablePassengerConflict) {
      // Cannot be accommodated in preferred window -> generate alternatives
      scheduledResults.push({
        id: req.id,
        decision: 'CANNOT_BE_ACCOMMODATED',
        score: finalScore,
        conflictReason: 'Direct conflict with COA high-speed passenger paths (Vande Bharat #22436 and Rajdhani #12424) during morning peak. Maintenance block would cause >45m cascade detention.',
        explanation: {
          priorityDrivers: [
            `Department declared priority (${req.declaredPriority}) weighted as 25% input signal`,
            `Source system asset diagnostic: ${req.sourceAssetHealth || 'Standard inspection interval'}`,
            `Inspection overdue margin: ${req.isOverdue ? 'Exceeded by 6 days (High Urgency)' : 'Within compliance threshold'}`
          ],
          deadlineProximity: `Deadline is within ${deadlineHours}h; immediate scheduling in alternate night slot required.`,
          timetableGaps: 'Daytime corridor slot has zero margin. Night corridor has a 160-minute clear window between 01:45 and 04:25.',
          goodsImpact: 'Freight path #BTPN-Coal can be held at Tuglakabad loop for 40 mins without main-line penalty.',
          bundledDepartments: bundledDepts.length > 0 ? bundledDepts : ['Cross-department opportunity detected for joint track & OHE inspection'],
          assetImportance: 'Main trunk route asset carrying 84 GMT annually; high operational sensitivity.'
        },
        alternatives: [
          {
            id: 'ALT-1',
            slotDate: '2026-09-08',
            timeWindow: '01:45 - 04:15 (Night Shadow)',
            confidence: 94,
            impactScore: 'Zero passenger delays; 1 goods rake regulated at TKD Yard loop.',
            benefits: 'Can be bundled with TRD insulator replacement'
          },
          {
            id: 'ALT-2',
            slotDate: '2026-09-08',
            timeWindow: '12:30 - 14:45 (Afternoon Slack)',
            confidence: 78,
            impactScore: 'Requires single-line working on DN track for 35 minutes; 2 MEMU trains delayed by 10m.',
            benefits: 'Permits full daylight track inspection'
          },
          {
            id: 'ALT-3',
            slotDate: '2026-09-09',
            timeWindow: '02:00 - 04:30 (Night Window)',
            confidence: 91,
            impactScore: 'Complete corridor possession with dedicated power isolation.',
            benefits: 'Joint S&T point machine check integration possible'
          }
        ]
      });
    } else {
      // Successfully auto-scheduled
      scheduledResults.push({
        id: req.id,
        decision: 'SCHEDULED',
        score: finalScore,
        scheduledSlot: {
          date: req.date || '2026-09-08',
          timeWindow: req.preferredWindow || '01:30 - 04:00 (Night Possession)',
          section: req.corridor || 'NDLS-MTJ',
          trackLine: req.trackLine || 'UP Line',
          durationMinutes: req.durationMinutes || 150
        },
        explanation: {
          priorityDrivers: [
            `Overall priority score of ${finalScore}/100 computed by ML engine`,
            `Source system defect index: ${req.sourceAssetHealth || 'Standard'} condition flagged`,
            `Department priority signal (${req.declaredPriority}) factored with 0.28 coefficient`
          ],
          deadlineProximity: `Scheduled ${deadlineHours - 12}h ahead of compliance cutoff date.`,
          timetableGaps: 'Fits perfectly in COA passenger gap between Train #12952 (Departed 01:10) and #12004 (Arriving 04:45).',
          goodsImpact: 'Freight path scheduled via 3rd line with zero main-line delay.',
          bundledDepartments: bundledDepts.length > 0 ? bundledDepts : ['Unified multi-department possession active'],
          assetImportance: 'Rated Class A track/corridor element with high density traffic.'
        }
      });
    }
  }

  return scheduledResults;
}
