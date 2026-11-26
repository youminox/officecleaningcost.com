import pricingData from "@/data/pricing.json";

export type FlooringKey = keyof typeof pricingData.flooringTypes;
export type FrequencyKey = keyof typeof pricingData.frequencies;

export interface CleaningEstimateInput {
  sqFt: number;
  restrooms: number;
  flooring: FlooringKey;
  frequency: FrequencyKey;
  cityMultiplier?: number;
  cityName?: string;
  includeBreakroom?: boolean;
  includeInteriorGlass?: boolean;
  includeConsumables?: boolean;
  includeDeepFloorProgram?: boolean;
}

export interface CleaningEstimateResult {
  input: Required<Omit<CleaningEstimateInput, "cityName">> & { cityName: string };
  bracketLabel: string;
  baseRatePerSqFt: [number, number];
  effectiveRatePerSqFtPerVisit: [number, number];
  perVisitBase: [number, number];
  restroomCostPerVisit: [number, number];
  addOnsPerVisit: [number, number];
  perVisitTotal: [number, number];
  minimumApplied: boolean;
  visitsPerMonth: number;
  monthlyDeepFloorAmortized: [number, number];
  monthlyTotal: [number, number];
  annualTotal: [number, number];
  estimatedLaborHoursPerVisit: [number, number];
  impliedHourlyRate: [number, number];
}

export const PRICING_DATA = pricingData;

function roundDollar(val: number): number {
  return Math.round(val);
}

function roundTwo(val: number): number {
  return Math.round(val * 100) / 100;
}

export function getSizeBracket(sqFt: number) {
  const clamped = Math.max(200, Math.min(500000, sqFt));
  return (
    pricingData.sizeBrackets.find(
      (b) => clamped >= b.minSqFt && clamped <= b.maxSqFt
    ) || pricingData.sizeBrackets[pricingData.sizeBrackets.length - 1]
  );
}

export function calculateCleaningEstimate(
  raw: CleaningEstimateInput
): CleaningEstimateResult {
  const sqFt = Math.max(200, Math.min(500000, Math.round(raw.sqFt || 2500)));
  const restrooms = Math.max(0, Math.min(100, Math.round(raw.restrooms ?? 2)));
  const flooring: FlooringKey =
    raw.flooring in pricingData.flooringTypes ? raw.flooring : "carpet";
  const frequency: FrequencyKey =
    raw.frequency in pricingData.frequencies ? raw.frequency : "3x-week";
  const cityMultiplier = Math.max(
    0.75,
    Math.min(1.6, raw.cityMultiplier ?? 1.0)
  );
  const cityName = raw.cityName || "US National Average";

  const bracket = getSizeBracket(sqFt);
  const floorMult = pricingData.flooringTypes[flooring].multiplier;
  const freqInfo = pricingData.frequencies[frequency];
  const freqMult = freqInfo.multiplier;

  const combinedFactor = floorMult * freqMult * cityMultiplier;

  const baseLow = sqFt * bracket.ratePerSqFt[0] * combinedFactor;
  const baseHigh = sqFt * bracket.ratePerSqFt[1] * combinedFactor;

  const restroomLow = restrooms * pricingData.restroomPerVisit[0] * cityMultiplier;
  const restroomHigh = restrooms * pricingData.restroomPerVisit[1] * cityMultiplier;

  let addOnLow = 0;
  let addOnHigh = 0;
  if (raw.includeBreakroom) {
    addOnLow += pricingData.addOns.breakroom.perVisit[0] * cityMultiplier;
    addOnHigh += pricingData.addOns.breakroom.perVisit[1] * cityMultiplier;
  }
  if (raw.includeInteriorGlass) {
    addOnLow += pricingData.addOns.interiorGlass.perVisit[0] * cityMultiplier;
    addOnHigh += pricingData.addOns.interiorGlass.perVisit[1] * cityMultiplier;
  }
  if (raw.includeConsumables) {
    addOnLow += sqFt * pricingData.addOns.consumablesIncluded.perSqFtPerVisit[0];
    addOnHigh += sqFt * pricingData.addOns.consumablesIncluded.perSqFtPerVisit[1];
  }

  const rawVisitLow = baseLow + restroomLow + addOnLow;
  const rawVisitHigh = baseHigh + restroomHigh + addOnHigh;

  const minLow = pricingData.minimumPerVisit[0] * cityMultiplier;
  const minHigh = pricingData.minimumPerVisit[1] * cityMultiplier;

  const minimumApplied = rawVisitLow < minLow;
  const visitLow = Math.max(rawVisitLow, minLow);
  const visitHigh = Math.max(rawVisitHigh, minHigh, visitLow + 15);

  const deepLow = raw.includeDeepFloorProgram
    ? sqFt * pricingData.addOns.deepFloorProgram.perSqFtPerMonth[0] * cityMultiplier
    : 0;
  const deepHigh = raw.includeDeepFloorProgram
    ? sqFt * pricingData.addOns.deepFloorProgram.perSqFtPerMonth[1] * cityMultiplier
    : 0;

  const monthlyLow = visitLow * freqInfo.visitsPerMonth + deepLow;
  const monthlyHigh = visitHigh * freqInfo.visitsPerMonth + deepHigh;

  const annualLow = monthlyLow * 12;
  const annualHigh = monthlyHigh * 12;

  // ISSA production benchmark ~3,000–4,000 sq ft per labor hour + restroom minutes
  const baseHoursLow = sqFt / 4000 + restrooms * 0.15;
  const baseHoursHigh = sqFt / 2800 + restrooms * 0.25;
  const laborHoursLow = Math.max(1.0, roundTwo(baseHoursLow));
  const laborHoursHigh = Math.max(laborHoursLow + 0.25, roundTwo(baseHoursHigh));

  const impliedHourlyLow = roundDollar(visitLow / laborHoursHigh);
  const impliedHourlyHigh = roundDollar(visitHigh / laborHoursLow);

  return {
    input: {
      sqFt,
      restrooms,
      flooring,
      frequency,
      cityMultiplier,
      cityName,
      includeBreakroom: Boolean(raw.includeBreakroom),
      includeInteriorGlass: Boolean(raw.includeInteriorGlass),
      includeConsumables: Boolean(raw.includeConsumables),
      includeDeepFloorProgram: Boolean(raw.includeDeepFloorProgram),
    },
    bracketLabel: bracket.label,
    baseRatePerSqFt: [bracket.ratePerSqFt[0], bracket.ratePerSqFt[1]],
    effectiveRatePerSqFtPerVisit: [
      roundTwo(visitLow / sqFt),
      roundTwo(visitHigh / sqFt),
    ],
    perVisitBase: [roundDollar(baseLow), roundDollar(baseHigh)],
    restroomCostPerVisit: [roundDollar(restroomLow), roundDollar(restroomHigh)],
    addOnsPerVisit: [roundDollar(addOnLow), roundDollar(addOnHigh)],
    perVisitTotal: [roundDollar(visitLow), roundDollar(visitHigh)],
    minimumApplied,
    visitsPerMonth: freqInfo.visitsPerMonth,
    monthlyDeepFloorAmortized: [roundDollar(deepLow), roundDollar(deepHigh)],
    monthlyTotal: [roundDollar(monthlyLow), roundDollar(monthlyHigh)],
    annualTotal: [roundDollar(annualLow), roundDollar(annualHigh)],
    estimatedLaborHoursPerVisit: [laborHoursLow, laborHoursHigh],
    impliedHourlyRate: [impliedHourlyLow, impliedHourlyHigh],
  };
}
