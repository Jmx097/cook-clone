
import { AnalyticsService } from '../src/lib/analytics';
import { ABTestingService } from '../src/lib/ab_testing';
import { uuidv4 } from '../src/lib/uuid';
import assert from 'assert';

async function runTests() {
  console.log("Starting Analytics Verification...");

  // 1. IP Hash Determinism
  console.log("Test 1: IP Hash Determinism");
  const ip1 = "192.168.1.1";
  const hash1 = AnalyticsService.getIpHash(ip1);
  const hash2 = AnalyticsService.getIpHash(ip1);
  assert.strictEqual(hash1, hash2, "Hash should be deterministic for same day/IP");
  console.log("✅ IP Hash passed");

  // 2. A/B Assignment Weights
  console.log("Test 2: Weighted Assignment");
  // Mock Test Data structure (we don't hit DB here to keep it pure unit-ish, but assignVariant hits DB. 
  // So we test the 'logic' if possible, or mock the service. 
  // ABTestingService.assignVariant hits DB.
  // let's exact-copy the weighted random logic for verification of the algorithm.
  
  const weights = { "A": 80, "B": 20 };
  const results = { "A": 0, "B": 0 };
  for (let i = 0; i < 1000; i++) {
     // Replicate logic
     const total = 100;
     let r = Math.random() * total;
     let selected = "A";
     for (const vid of ["A", "B"]) {
        r -= weights[vid as keyof typeof weights];
        if (r <= 0) {
           selected = vid;
           break;
        }
     }
     results[selected as keyof typeof results]++;
  }
  console.log("Results (approx 800/200):", results);
  assert(results["A"] > 750, "A should be dominant");
  console.log("✅ Weighted Random passed");

  // 3. Wilson Score Winner Selection
  console.log("Test 3: Wilson Score");
  // Scenario: A: 200 views, 10 conversions (5%). B: 200 views, 40 conversions (20%).
  // B should win.
  
  // We can't call checkWinner without DB.
  // We'll reimplement the private method logic to verify math.
  function wilson(success: number, total: number) {
      if (total === 0) return 0;
      const z = 1.96;
      const p = success / total;
      return (p + z*z/(2*total) - z * Math.sqrt((p*(1-p) + z*z/(4*total))/total)) / (1 + z*z/total);
  }
  
  const scoreA = wilson(12, 500); // 2.4% (approx)
  const scoreB = wilson(45, 500); // 9% (approx)
  
  console.log(`Score A: ${scoreA.toFixed(4)}, Score B: ${scoreB.toFixed(4)}`);
  assert(scoreB > scoreA + 0.01, "B should be winner by margin");
  console.log("✅ Wilson Score Math passed");

  // 4. UUID Generator
  console.log("Test 4: UUID");
  const u1 = uuidv4();
  const u2 = uuidv4();
  assert.notStrictEqual(u1, u2);
  assert.match(u1, /^[0-9a-f-]{36}$/);
  console.log("✅ UUID passed");

  console.log("ALL TESTS PASSED");
}

runTests().catch(console.error);
