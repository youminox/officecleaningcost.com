import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";

const pricing = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "src/data/pricing.json"), "utf8")
);

function getSizeBracket(sqFt) {
  const clamped = Math.max(200, Math.min(500000, sqFt));
  return (
    pricing.sizeBrackets.find(
      (b) => clamped >= b.minSqFt && clamped <= b.maxSqFt
    ) || pricing.sizeBrackets[pricing.sizeBrackets.length - 1]
  );
}

function calc(input) {
  const sqFt = Math.max(200, Math.min(500000, Math.round(input.sqFt)));
  const restrooms = input.restrooms ?? 2;
  const flooring = input.flooring || "carpet";
  const frequency = input.frequency || "3x-week";
  const cityMultiplier = input.cityMultiplier ?? 1.0;

  const bracket = getSizeBracket(sqFt);
  const floorMult = pricing.flooringTypes[flooring].multiplier;
  const freqInfo = pricing.frequencies[frequency];
  const factor = floorMult * freqInfo.multiplier * cityMultiplier;

  const baseLow = sqFt * bracket.ratePerSqFt[0] * factor;
  const baseHigh = sqFt * bracket.ratePerSqFt[1] * factor;
  const restLow = restrooms * pricing.restroomPerVisit[0] * cityMultiplier;
  const restHigh = restrooms * pricing.restroomPerVisit[1] * cityMultiplier;

  const minLow = pricing.minimumPerVisit[0] * cityMultiplier;
  const minHigh = pricing.minimumPerVisit[1] * cityMultiplier;
  const visitLow = Math.max(baseLow + restLow, minLow);
  const visitHigh = Math.max(baseHigh + restHigh, minHigh, visitLow + 15);
  return {
    bracket: bracket.id,
    visitLow: Math.round(visitLow),
    visitHigh: Math.round(visitHigh),
    monthlyLow: Math.round(visitLow * freqInfo.visitsPerMonth),
    monthlyHigh: Math.round(visitHigh * freqInfo.visitsPerMonth),
    minimumApplied: baseLow + restLow < minLow,
  };
}

const c1 = calc({ sqFt: 1200, restrooms: 1, flooring: "carpet", frequency: "1x-week" });
assert.equal(c1.bracket, "under-2500");
assert.ok(c1.visitLow >= 90);
assert.ok(c1.monthlyLow > c1.visitLow * 4);

const c2 = calc({ sqFt: 5000, restrooms: 4, flooring: "mixed", frequency: "3x-week" });
assert.equal(c2.bracket, "2500-9999");
assert.ok(c2.visitLow >= 450 && c2.visitHigh <= 1050);

const c3 = calc({ sqFt: 15000, restrooms: 6, flooring: "tile-grout", frequency: "5x-week" });
assert.equal(c3.bracket, "10000-24999");
assert.ok(c3.monthlyLow > 20000);

const c4 = calc({ sqFt: 40000, restrooms: 14, flooring: "polished-concrete", frequency: "5x-week" });
assert.equal(c4.bracket, "25000-plus");
assert.ok(c4.visitLow < 3000 && c4.visitHigh > 3000);

const nyc = calc({ sqFt: 5000, restrooms: 2, flooring: "carpet", frequency: "2x-week", cityMultiplier: 1.32 });
const dsm = calc({ sqFt: 5000, restrooms: 2, flooring: "carpet", frequency: "2x-week", cityMultiplier: 0.88 });
assert.ok(nyc.visitLow > dsm.visitLow * 1.4);

const tiny = calc({ sqFt: 350, restrooms: 1, flooring: "carpet", frequency: "monthly" });
assert.equal(tiny.minimumApplied, true);
assert.equal(tiny.visitLow, 90);

console.log("Pricing unit tests PASSED:", { c1, c2, c3, c4, nyc, dsm, tiny });
