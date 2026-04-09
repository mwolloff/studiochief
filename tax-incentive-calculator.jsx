import { useState, useMemo } from "react";

// ─── EMBEDDED LOCATION DATA ──────────────────────────────────────────────────
// Full dataset: 46 locations. Rates, buckets, uplifts, flags, monetization.
// Source: Entertainment Partners, 03/08-09/2026

const LOCATIONS = [
  // ── US STATES ──────────────────────────────────────────────────────────────
  {
    id: "us-alabama", name: "Alabama", flag: "🇺🇸", region: "US", currency: "USD",
    dataDate: "03/08/2026", incentiveType: "refundable_tax_credit", monetizationRate: 1.00,
    monetizationLabel: "Refundable — paid directly",
    headline: "25%–35%",
    eligible: ["Animation","Commercials","Documentaries","Feature Films","Pilots","Post Only","Reality Television","Scripted Television","Video Games"],
    ineligible: ["Game Shows","Talk Shows"],
    buckets: { residentATL: 0.35, residentBTL: 0.35, nonresidentATL: 0.25, nonresidentBTL: 0.25, spend: 0.25 },
    uplifts: [],
    minSpend: 500000, projectCap: null, compensationCapATL: 1000000, compensationCapBTL: 500000, annualCap: 20000000,
    sunsetDate: "Dec 31, 2028",
    flags: { red: [], yellow: ["Compensation cap: $1M ATL, $500K BTL per individual"], blue: [] },
    notes: "Marketing and distribution expenses do not qualify."
  },
  {
    id: "us-arizona", name: "Arizona", flag: "🇺🇸", region: "US", currency: "USD",
    dataDate: "03/09/2026", incentiveType: "refundable_tax_credit", monetizationRate: 1.00,
    monetizationLabel: "Refundable — 100% buy-back with state",
    headline: "15%–20% (tiered)",
    eligible: ["Commercials","Documentaries","Feature Films","Pilots","Reality Television","Scripted Television"],
    ineligible: ["Animation","Game Shows","Post Only","Talk Shows","Video Games"],
    buckets: { residentATL: "tiered", residentBTL: "tiered", nonresidentATL: "tiered", nonresidentBTL: "tiered", spend: "tiered" },
    tiers: [{ max: 9999999, rate: 0.15 }, { max: 34999999, rate: 0.175 }, { max: null, rate: 0.20 }],
    uplifts: [],
    minSpend: null, projectCap: null, annualCap: 125000000, sunsetDate: "Dec 31, 2043",
    flags: { red: [], yellow: ["Tiered rate: <$10M=15%, $10M–$35M=17.5%, $35M+=20%", "Must film >50% at qualified production facility or practical location + all preproduction/editing in AZ"], blue: ["Credits cash out at 100% with state — best buy-back in US dataset"] },
    notes: "27.5% headline in EP guide implies undocumented uplift — verify with AZ Film Office."
  },
  {
    id: "us-arkansas", name: "Arkansas", flag: "🇺🇸", region: "US", currency: "USD",
    dataDate: "03/09/2026", incentiveType: "transferable_tax_credit", monetizationRate: 0.85,
    monetizationLabel: "Transferable credit — 85¢ default",
    headline: "25%–30%",
    eligible: ["Animation","Documentaries","Feature Films","Pilots","Post Only","Scripted Television","Video Games"],
    ineligible: ["Commercials","Game Shows","Reality Television","Talk Shows"],
    buckets: { residentATL: 0.25, residentBTL: 0.30, nonresidentATL: 0.25, nonresidentBTL: 0.25, spend: 0.25 },
    uplifts: [],
    minSpend: 200000, compensationCap: 500000, annualCap: 4000000, sunsetDate: "Jun 30, 2032",
    flags: { red: [], yellow: ["Annual cap is only $4M — very low", "Resident BTL (30%) is higher than ATL (25%) — unusual"], blue: [] },
    notes: ""
  },
  {
    id: "us-california", name: "California", flag: "🇺🇸", region: "US", currency: "USD",
    dataDate: "03/08/2026", incentiveType: "transferable_tax_credit", monetizationRate: 0.85,
    monetizationLabel: "Transferable credit — 85¢ default",
    headline: "20%–30% (BTL only)",
    eligible: ["Feature Films","Pilots","Scripted Television"],
    ineligible: ["Animation","Commercials","Documentaries","Game Shows","Post Only","Reality Television","Talk Shows","Video Games"],
    buckets: { residentATL: 0, residentBTL: 0.25, nonresidentATL: 0, nonresidentBTL: 0.25, spend: 0 },
    uplifts: [],
    minSpend: 1000000, annualCap: 330000000, sunsetDate: "Jun 30, 2025",
    flags: { red: ["SUNSET ALERT: Program 3.0 sunset was June 30, 2025 — verify current status", "NO ATL COVERAGE — above the line labor does not qualify", "Competitive allocation — application does not guarantee approval"], yellow: ["Reality TV not eligible", "Must complete 75% of principal photography days in California"], blue: [] },
    notes: "Multiple sub-programs exist. Contact California Film Commission."
  },
  {
    id: "us-colorado", name: "Colorado", flag: "🇺🇸", region: "US", currency: "USD",
    dataDate: "03/08/2026", incentiveType: "refundable_tax_credit", monetizationRate: 1.00,
    monetizationLabel: "Refundable — paid directly",
    headline: "20%–22%",
    eligible: ["Animation","Commercials","Documentaries","Feature Films","Pilots","Post Only","Reality Television","Scripted Television","Video Games"],
    ineligible: ["Game Shows","Talk Shows"],
    buckets: { residentATL: 0.20, residentBTL: 0.20, nonresidentATL: 0.20, nonresidentBTL: 0.20, spend: 0.20 },
    uplifts: [{ id: "co-rural", label: "Rural/Marginalized Urban Center", amount: 0.02, maxRate: 0.22, prompt: "Is this production filming in a rural community or marginalized urban center in Colorado?" }],
    minSpend: 1000000, compensationCap: 1000000, annualCap: 5000000, sunsetDate: "Dec 31, 2034",
    flags: { red: [], yellow: ["Annual cap is only $5M — may be exhausted early", "Crew must consist of at least 50% Colorado residents", "Production must be at least 80% funded"], blue: [] },
    notes: ""
  },
  {
    id: "us-connecticut", name: "Connecticut", flag: "🇺🇸", region: "US", currency: "USD",
    dataDate: "03/08/2026", incentiveType: "transferable_tax_credit", monetizationRate: 0.85,
    monetizationLabel: "Transferable credit — 85¢ default",
    headline: "10%–30% (tiered)",
    eligible: ["Animation","Commercials","Documentaries","Game Shows","Pilots","Post Only","Reality Television","Scripted Television","Talk Shows","Video Games"],
    ineligible: [],
    buckets: { residentATL: "tiered", residentBTL: "tiered", nonresidentATL: "tiered", nonresidentBTL: "tiered", spend: "tiered" },
    tiers: [{ max: 499999, rate: 0.10 }, { max: 999999, rate: 0.15 }, { max: null, rate: 0.30 }],
    uplifts: [],
    minSpend: 100000, compensationCap: 20000000, sunsetDate: null,
    flags: { red: ["Theatrical feature films ineligible — moratorium since 2017"], yellow: ["Tiered: $100K=10%, $500K=15%, $1M+=30%"], blue: ["No project cap, no annual cap"] },
    notes: "Films made for TV and streaming still eligible."
  },
  {
    id: "us-georgia", name: "Georgia", flag: "🇺🇸", region: "US", currency: "USD",
    dataDate: "03/08/2026", incentiveType: "transferable_tax_credit", monetizationRate: 0.85,
    monetizationLabel: "Transferable credit — 85¢ default",
    headline: "20%–30%",
    eligible: ["Animation","Commercials","Documentaries","Feature Films","Game Shows","Pilots","Post Only","Reality Television","Scripted Television","Talk Shows","Video Games"],
    ineligible: [],
    buckets: { residentATL: 0.20, residentBTL: 0.20, nonresidentATL: 0.20, nonresidentBTL: 0.20, spend: 0.20 },
    uplifts: [{ id: "ga-logo", label: "Georgia Promotional Logo / End Title Credit", amount: 0.10, maxRate: 0.30, prompt: "Will this production include the Georgia promotional logo or end title credit?" }],
    minSpend: 500000, compensationCap: 500000, compensationCapNote: "No cap for loan-outs", sunsetDate: null,
    flags: { red: [], yellow: ["$500K compensation cap per individual — but NO cap for loan-outs"], blue: ["No project cap, no annual cap — very production-friendly"] },
    notes: "Developmental costs, most fees, and marketing/distribution do not qualify."
  },
  {
    id: "us-hawaii", name: "Hawaii", flag: "🇺🇸", region: "US", currency: "USD",
    dataDate: "03/08/2026", incentiveType: "refundable_tax_credit", monetizationRate: 1.00,
    monetizationLabel: "Refundable — paid directly",
    headline: "22% (Oahu) / 27% (Neighbor Islands)",
    eligible: ["Animation","Commercials","Documentaries","Feature Films","Game Shows","Pilots","Post Only","Reality Television","Scripted Television","Talk Shows","Video Games"],
    ineligible: [],
    buckets: { residentATL: 0.22, residentBTL: 0.22, nonresidentATL: 0.22, nonresidentBTL: 0.22, spend: 0.22 },
    uplifts: [{ id: "hi-neighbor", label: "Filming on Neighbor Islands (+5%)", amount: 0.05, maxRate: 0.27, prompt: "Is this production filming primarily on Neighbor Islands (not Oahu)?" }],
    minSpend: 100000, projectCap: 17000000, annualCap: 50000000, sunsetDate: "Dec 31, 2032",
    flags: { red: [], yellow: ["Rate depends on island — Oahu=22%, Neighbor Islands=27%"], blue: [] },
    notes: "Productions must make reasonable efforts to hire local talent and crew."
  },
  {
    id: "us-indiana", name: "Indiana", flag: "🇺🇸", region: "US", currency: "USD",
    dataDate: "03/09/2026", incentiveType: "non_transferable_non_refundable", monetizationRate: null,
    monetizationLabel: "NON-TRANSFERABLE & NON-REFUNDABLE",
    headline: "20%–25%",
    eligible: ["Animation","Documentaries","Feature Films","Game Shows","Pilots","Scripted Television","Video Games"],
    ineligible: ["Commercials","Post Only","Reality Television","Talk Shows"],
    buckets: { residentATL: 0.20, residentBTL: 0.25, nonresidentATL: 0.20, nonresidentBTL: 0.20, spend: 0.20 },
    uplifts: [],
    minSpend: null, compensationCap: 500000, annualCap: 5000000, sunsetDate: null,
    flags: { red: ["CRITICAL: Non-transferable AND non-refundable — zero value without Indiana tax liability. Consult tax advisor."], yellow: ["Application only during specific windows"], blue: [] },
    notes: ""
  },
  {
    id: "us-kentucky", name: "Kentucky", flag: "🇺🇸", region: "US", currency: "USD",
    dataDate: "03/08/2026", incentiveType: "refundable_tax_credit", monetizationRate: 1.00,
    monetizationLabel: "Refundable — paid directly",
    headline: "30%–35%",
    eligible: ["Animation","Documentaries","Feature Films","Game Shows","Pilots","Post Only","Reality Television","Scripted Television","Talk Shows","Video Games"],
    ineligible: ["Commercials"],
    buckets: { residentATL: 0.35, residentBTL: 0.35, nonresidentATL: 0.30, nonresidentBTL: 0.30, spend: 0.30 },
    uplifts: [{ id: "ky-rural", label: "Kentucky Rural/Incentive Zone (+5%)", amount: 0.05, maxRate: 0.35, prompt: "Is this production filming in a designated Kentucky rural or incentive zone?" }],
    minSpend: 125000, projectCap: 10000000, compensationCap: 1000000, annualCap: 75000000, sunsetDate: null,
    flags: { red: [], yellow: ["KEDFA monthly board meeting required — timing affects production schedule"], blue: [] },
    notes: ""
  },
  {
    id: "us-louisiana", name: "Louisiana", flag: "🇺🇸", region: "US", currency: "USD",
    dataDate: "03/08/2026", incentiveType: "refundable_tax_credit", monetizationRate: 0.90,
    monetizationLabel: "State buy-back at 90% (88% after 2% transfer fee)",
    headline: "25%–40%",
    eligible: ["Animation","Commercials","Documentaries","Feature Films","Game Shows","Pilots","Post Only","Reality Television","Scripted Television","Talk Shows","Video Games"],
    ineligible: [],
    buckets: { residentATL: 0.25, residentBTL: 0.25, nonresidentATL: 0.25, nonresidentBTL: 0.25, spend: 0.25 },
    uplifts: [
      { id: "la-labor", label: "Louisiana Resident Labor Uplift (up to +15%)", amount: 0.15, maxRate: 0.40, prompt: "Does this production qualify for the Louisiana resident labor uplift? (Loan-outs do NOT qualify — they stay at 25%.)" },
      { id: "la-vfx", label: "Louisiana VFX Spend Uplift (+5%)", amount: 0.05, maxRate: null, prompt: "Does this production have qualifying VFX spend in Louisiana?" }
    ],
    minSpend: 300000, projectCap: 20000000, compensationCap: 3000000, annualCap: 125000000, sunsetDate: "Jun 30, 2031",
    flags: { red: [], yellow: ["Loan-out labor stays at base 25% — labor uplift does not apply to loan-outs"], blue: ["State buy-back at 90% — better than open market default"] },
    notes: ""
  },
  {
    id: "us-maine", name: "Maine", flag: "🇺🇸", region: "US", currency: "USD",
    dataDate: "03/09/2026", incentiveType: "dual_program", monetizationRate: null,
    monetizationLabel: "Dual program: wage rebate (100¢) + spend credit (no value without ME tax liability)",
    headline: "5%–17%",
    eligible: ["Animation","Commercials","Documentaries","Feature Films","Game Shows","Pilots","Post Only","Reality Television","Scripted Television","Talk Shows","Video Games"],
    ineligible: [],
    buckets: { residentATL: 0.12, residentBTL: 0.12, nonresidentATL: 0.10, nonresidentBTL: 0.10, spend: 0.05 },
    uplifts: [],
    minSpend: 75000, compensationCap: 50000, sunsetDate: null,
    flags: { red: [], yellow: ["5% spend credit is non-refundable and non-transferable — only valuable with Maine tax liability", "Compensation cap of $50K is very low"], blue: [] },
    notes: "Wage rebate (labor rates) paid directly. Spend credit separate."
  },
  {
    id: "us-maryland", name: "Maryland", flag: "🇺🇸", region: "US", currency: "USD",
    dataDate: "03/09/2026", incentiveType: "refundable_tax_credit", monetizationRate: 1.00,
    monetizationLabel: "Refundable — paid directly",
    headline: "28%–30%",
    eligible: ["Documentaries","Feature Films","Pilots","Reality Television","Scripted Television"],
    ineligible: ["Animation","Commercials","Game Shows","Post Only","Talk Shows","Video Games"],
    buckets: { residentATL: 0.28, residentBTL: 0.28, nonresidentATL: 0.28, nonresidentBTL: 0.28, spend: 0.28 },
    uplifts: [{ id: "md-tv", label: "TV Series Uplift (+2%)", amount: 0.02, maxRate: 0.30, prompt: "Is this production a TV series?" }],
    minSpend: 250000, projectCap: 10000000, compensationCap: 500000, annualCap: 15000000, sunsetDate: null,
    flags: { red: ["CRITICAL: $500K compensation cap disqualifies ENTIRE individual compensation — not just the overage above $500K"], yellow: ["50% of principal photography must occur in Maryland"], blue: [] },
    notes: ""
  },
  {
    id: "us-massachusetts", name: "Massachusetts", flag: "🇺🇸", region: "US", currency: "USD",
    dataDate: "03/09/2026", incentiveType: "partially_refundable", monetizationRate: 0.90,
    monetizationLabel: "State buy-back at 90% of face value",
    headline: "25%",
    eligible: ["Animation","Commercials","Documentaries","Feature Films","Pilots","Post Only","Reality Television","Scripted Television"],
    ineligible: ["Game Shows","Talk Shows","Video Games"],
    buckets: { residentATL: 0.25, residentBTL: 0.25, nonresidentATL: 0.25, nonresidentBTL: 0.25, spend: 0.25 },
    uplifts: [],
    minSpend: 50000, sunsetDate: null,
    flags: { red: [], yellow: ["75% of total PP days must be in Massachusetts (for Production Credit)"], blue: ["State buy-back at 90% — better than open market default", "No project cap, no annual cap"] },
    notes: "Equipment purchased outside MA can qualify. For equipment, qualifying cost is depreciation, not purchase price."
  },
  {
    id: "us-minnesota", name: "Minnesota", flag: "🇺🇸", region: "US", currency: "USD",
    dataDate: "03/09/2026", incentiveType: "transferable_tax_credit", monetizationRate: 0.85,
    monetizationLabel: "Transferable credit — 85¢ default",
    headline: "20%–25%",
    eligible: ["Animation","Documentaries","Feature Films","Pilots","Post Only","Reality Television","Scripted Television"],
    ineligible: ["Commercials","Game Shows","Talk Shows","Video Games"],
    buckets: { residentATL: 0.25, residentBTL: 0.25, nonresidentATL: 0.25, nonresidentBTL: 0.20, spend: 0.25 },
    uplifts: [],
    minSpend: 1000000, annualCap: 25000000, sunsetDate: "Dec 31, 2030",
    flags: { red: ["CRITICAL: Non-resident ATL limited to ONE producer and ONE director per project — each capped at first $500K in wages"], yellow: ["Non-resident BTL rate is 20%, lower than resident (25%)", "MN withholding taxes must be remitted for ATL to qualify"], blue: [] },
    notes: "If one person holds two ATL roles, they only qualify once."
  },
  {
    id: "us-nevada", name: "Nevada", flag: "🇺🇸", region: "US", currency: "USD",
    dataDate: "03/08/2026", incentiveType: "transferable_tax_credit", monetizationRate: 0.85,
    monetizationLabel: "Transferable credit — 85¢ default",
    headline: "12%–15%",
    eligible: ["Animation","Commercials","Documentaries","Feature Films","Game Shows","Pilots","Reality Television","Scripted Television","Talk Shows","Video Games"],
    ineligible: ["Post Only"],
    buckets: { residentATL: 0.15, residentBTL: 0.15, nonresidentATL: 0.12, nonresidentBTL: 0.15, spend: 0.15 },
    uplifts: [],
    minSpend: 500000, projectCap: 6000000, compensationCap: 750000, annualCap: 10000000, sunsetDate: null,
    flags: { red: [], yellow: ["CRITICAL: 60% of total production budget must be incurred in Nevada", "Non-Resident ATL (12%) is lower than Resident ATL (15%)", "Project cap of $6M is relatively low"], blue: [] },
    notes: "Most granular bucket structure of any US state in dataset."
  },
  {
    id: "us-oklahoma", name: "Oklahoma", flag: "🇺🇸", region: "US", currency: "USD",
    dataDate: "03/08/2026", incentiveType: "discretionary_rebate", monetizationRate: 1.00,
    monetizationLabel: "Rebate — paid directly (IF approved)",
    headline: "20%–30% (discretionary)",
    eligible: ["Animation","Documentaries","Feature Films","Game Shows","Pilots","Post Only","Reality Television","Scripted Television","Talk Shows"],
    ineligible: ["Commercials","Video Games"],
    buckets: { residentATL: 0.30, residentBTL: 0.30, nonresidentATL: 0, nonresidentBTL: 0.20, spend: 0.20 },
    uplifts: [],
    minSpend: 50000, annualCap: 30000000, sunsetDate: "Jun 30, 2031",
    flags: { red: ["CRITICAL: Discretionary rebate — acceptance is NOT guaranteed. OF+MO evaluates based on economic benefit to Oklahoma."], yellow: ["Mandatory apprentice hiring based on QPE spend level", "Non-resident ATL rate not listed — verify with film office"], blue: [] },
    notes: ""
  },
  {
    id: "us-puerto_rico", name: "Puerto Rico", flag: "🇺🇸", region: "US",  currency: "USD",
    dataDate: "03/08/2026", incentiveType: "transferable_tax_credit", monetizationRate: 0.85,
    monetizationLabel: "Transferable credit — 85¢ default",
    headline: "20%–40%",
    eligible: ["Animation","Commercials","Documentaries","Feature Films","Game Shows","Pilots","Post Only","Reality Television","Scripted Television","Talk Shows","Video Games"],
    ineligible: [],
    buckets: { residentATL: 0.40, residentBTL: 0.40, nonresidentATL: 0.20, nonresidentBTL: 0.20, spend: 0.40 },
    uplifts: [],
    minSpend: 50000, annualCap: 38000000, sunsetDate: null,
    flags: { red: [], yellow: ["Significant gap between resident (40%) and non-resident (20%) rates — crew residency matters greatly"], blue: ["Highest resident rate in entire US dataset at 40%", "Non-residents who live in Puerto Rico for 183+ days become residents"] },
    notes: ""
  },
  {
    id: "us-tennessee", name: "Tennessee", flag: "🇺🇸", region: "US", currency: "USD",
    dataDate: "03/08/2026", incentiveType: "grant", monetizationRate: 1.00,
    monetizationLabel: "Grant — paid directly",
    headline: "25%–30%",
    eligible: ["Feature Films","Pilots","Scripted Television"],
    ineligible: ["Animation","Commercials","Documentaries","Game Shows","Post Only","Reality Television","Talk Shows","Video Games"],
    buckets: { residentATL: 0.25, residentBTL: 0.25, nonresidentATL: 0, nonresidentBTL: 0, spend: 0.25 },
    nonresidentATLNote: "Scripted TV only — zero for all other formats",
    uplifts: [{ id: "tn-logo", label: "Filmed in Tennessee Logo (+5% on resident labor, scripted TV only)", amount: 0.05, maxRate: 0.30, prompt: "Is this a scripted TV project that will include the Filmed in Tennessee logo?", appliesToResidentOnly: true }],
    minSpend: 200000, compensationCap: 250000, sunsetDate: null,
    flags: { red: ["CRITICAL: Non-resident ATL and BTL only qualify for Scripted TV — all other formats get zero on non-resident labor"], yellow: ["Annual funding determined annually — not a fixed cap", "Compensation caps are low: $250K per resident, $2M total non-resident per season"], blue: [] },
    notes: ""
  },
  {
    id: "us-texas", name: "Texas", flag: "🇺🇸", region: "US", currency: "USD",
    dataDate: "03/08/2026", incentiveType: "grant", monetizationRate: 1.00,
    monetizationLabel: "Grant — paid directly",
    headline: "5%–22.5% (tiered + uplifts)",
    eligible: ["Animation","Commercials","Documentaries","Feature Films","Game Shows","Pilots","Reality Television","Scripted Television","Talk Shows","Video Games"],
    ineligible: ["Post Only"],
    buckets: { residentATL: "tiered", residentBTL: "tiered", nonresidentATL: 0, nonresidentBTL: 0, spend: "tiered" },
    tiers: [{ max: 999999, rate: 0.05 }, { max: 3499999, rate: 0.10 }, { max: null, rate: 0.20 }],
    uplifts: [
      { id: "tx-rural", label: "Rural/Designated Area Uplift (+2.5%)", amount: 0.025, prompt: "Will at least 25% of this production occur in a Texas rural or designated area?" },
      { id: "tx-veteran", label: "Texas Resident Veteran Uplift (+2.5%)", amount: 0.025, prompt: "Will at least 5% of total paid crew and cast be Texas Resident Veterans?" },
      { id: "tx-post", label: "Post-Production Uplift (+2.5%)", amount: 0.025, prompt: "Will at least 10% of total eligible in-state spending be on qualified post-production costs?" }
    ],
    minSpend: 250000, compensationCap: 1000000, sunsetDate: null,
    flags: { red: [], yellow: ["Annual cap not published — contact Texas Film Commission for availability", "60% of total production days must be in Texas", "55% of paid crew AND 55% of paid cast must be Texas residents", "Non-resident rates not listed in EP guide — verify with TFC"], blue: [] },
    notes: ""
  },
  {
    id: "us-washington", name: "Washington", flag: "🇺🇸", region: "US", currency: "USD",
    dataDate: "03/08/2026", incentiveType: "rebate", monetizationRate: 1.00,
    monetizationLabel: "Rebate — paid directly",
    headline: "15%–45%",
    eligible: ["Animation","Feature Films","Pilots","Scripted Television"],
    ineligible: ["Commercials","Game Shows","Post Only","Talk Shows","Video Games"],
    caseByCase: ["Documentaries","Reality Television"],
    buckets: { residentATL: 0.30, residentBTL: 0.30, nonresidentATL: 0, nonresidentBTL: 0.15, spend: 0.30 },
    uplifts: [
      { id: "wa-episodic", label: "Episodic Series Uplift (+5%)", amount: 0.05, prompt: "Is this an episodic series with at least 6 episodes?" },
      { id: "wa-rural", label: "Rural/Underrepresented Community Uplift (+10%)", amount: 0.10, prompt: "Is this production filming in a Washington rural county OR telling the story of a historically underrepresented community?" }
    ],
    minSpend: 300000, compensationCapNonresident: 50000, annualCap: 15000000, sunsetDate: "Jun 30, 2030",
    flags: { red: [], yellow: ["Application window opens Q1 ONLY each year — timing critical", "Reality TV and Docs are case-by-case only", "Non-resident labor comp cap is extremely low at $50K"], blue: ["Up to 45% achievable with both uplifts stacked"] },
    notes: ""
  },

  // ── INTERNATIONAL ──────────────────────────────────────────────────────────
  {
    id: "intl-british_columbia", name: "British Columbia", flag: "🇨🇦", region: "International", currency: "CAD",
    dataDate: "03/08/2026", incentiveType: "refundable_stacked", monetizationRate: 1.00,
    monetizationLabel: "Refundable — paid directly (provincial + federal stacked)",
    headline: "46.2% effective on qualifying labour",
    eligible: ["Animation","Documentaries","Feature Films","Pilots","Post Only","Reality Television","Scripted Television"],
    ineligible: ["Commercials","Game Shows","Talk Shows","Video Games"],
    buckets: { residentATL: 0.462, residentBTL: 0.462, nonresidentATL: 0, nonresidentBTL: 0, spend: 0 },
    uplifts: [],
    minSpend: 1000000, sunsetDate: null,
    flags: { red: [], yellow: ["LABOUR ONLY — credit applies to qualifying BC labour expenditure, not general spend", "Federal 16% applies to labour NET of provincial assistance — not simply additive"], blue: ["Highest effective rate in entire dataset at 46.2%", "No caps of any kind", "Currency is CAD"] },
    notes: "36% provincial + 16% federal on net labour = 46.2% effective rate."
  },
  {
    id: "intl-france", name: "France", flag: "🇫🇷", region: "International", currency: "EUR",
    dataDate: "03/08/2026", incentiveType: "rebate", monetizationRate: 1.00,
    monetizationLabel: "Rebate (TRIP) — paid directly",
    headline: "30%–40%",
    eligible: ["Animation","Feature Films","Pilots","Scripted Television"],
    ineligible: ["Commercials","Documentaries","Game Shows","Post Only","Reality Television","Talk Shows","Video Games"],
    buckets: { residentATL: 0.30, residentBTL: 0.30, nonresidentATL: 0, nonresidentBTL: 0, spend: 0.30 },
    uplifts: [{ id: "fr-vfx", label: "VFX Uplift (+10%)", amount: 0.10, maxRate: 0.40, prompt: "Does this production have more than €2M in VFX-related eligible French expenses?" }],
    minSpend: 250000, projectCap: 30000000, sunsetDate: null,
    flags: { red: [], yellow: ["Requires French production services company (PSC) to apply", "Qualifying spend starts AFTER provisional application reception — do not spend before application", "Application window: July only of year after filming"], blue: ["Currency is EUR"] },
    notes: ""
  },
  {
    id: "intl-greece", name: "Greece", flag: "🇬🇷", region: "International", currency: "EUR",
    dataDate: "03/08/2026", incentiveType: "rebate", monetizationRate: 1.00,
    monetizationLabel: "Rebate — paid directly",
    headline: "40%",
    eligible: ["Animation","Documentaries","Feature Films","Post Only","Scripted Television","Video Games"],
    ineligible: ["Commercials","Game Shows","Reality Television","Talk Shows"],
    buckets: { residentATL: 0.40, residentBTL: 0.40, nonresidentATL: 0.40, nonresidentBTL: 0.40, spend: 0.40 },
    uplifts: [],
    minSpend: 100000, projectCap: 12000000, annualCap: 75000000, sunsetDate: null,
    flags: { red: [], yellow: ["Eligible costs may NOT exceed 80% of total costs", "Non-resident cast/crew must be subject to Greek taxation and insurance", "ATL compensation cap = 35% of eligible Greek spend (percentage-based, not fixed)"], blue: ["40% flat across all buckets", "Currency is EUR"] },
    notes: ""
  },
  {
    id: "intl-ireland", name: "Ireland", flag: "🇮🇪", region: "International", currency: "EUR",
    dataDate: "03/08/2026", incentiveType: "rebate", monetizationRate: 1.00,
    monetizationLabel: "Rebate (Section 481) — paid directly",
    headline: "32%",
    eligible: ["Animation","Documentaries","Feature Films","Pilots","Post Only","Scripted Television"],
    ineligible: ["Commercials","Game Shows","Reality Television","Talk Shows","Video Games"],
    buckets: { residentATL: 0.32, residentBTL: 0.32, nonresidentATL: 0.32, nonresidentBTL: 0.32, spend: 0.32 },
    uplifts: [],
    minSpend: 125000, projectCap: 125000000, sunsetDate: "Dec 31, 2028",
    flags: { red: [], yellow: ["Requires local Irish producer company", "Cultural test required via BFI"], blue: ["32% flat across ALL buckets including non-resident ATL/BTL — cleanest international structure", "Up to 90% claimable mid-production", "No compensation cap, no annual cap", "Currency is EUR"] },
    notes: "Includes post-production and VFX in qualifying spend."
  },
  {
    id: "intl-israel", name: "Israel", flag: "🇮🇱", region: "International", currency: "NIS",
    dataDate: "03/08/2026", incentiveType: "rebate", monetizationRate: 1.00,
    monetizationLabel: "Rebate — 80% during filming, 20% on completion",
    headline: "30%",
    eligible: ["Documentaries","Feature Films","Post Only","Scripted Television"],
    ineligible: ["Animation","Commercials","Game Shows","Pilots","Reality Television","Talk Shows","Video Games"],
    buckets: { residentATL: 0, residentBTL: 0, nonresidentATL: 0, nonresidentBTL: 0, spend: 0.30 },
    uplifts: [],
    minSpend: 500000, annualCap: 45000000, sunsetDate: null,
    flags: { red: [], yellow: ["Must apply through an Israeli producer", "Applicant must have 2+ feature films or TV series in past 5 years"], blue: ["80% of rebate paid DURING filming — cash flow advantage", "Currency is NIS"] },
    notes: "2-year window to complete production and report expenses."
  },
  {
    id: "intl-malaysia", name: "Malaysia", flag: "🇲🇾", region: "International", currency: "MYR",
    dataDate: "03/08/2026", incentiveType: "rebate", monetizationRate: 1.00,
    monetizationLabel: "Rebate — paid directly",
    headline: "30%–35%",
    eligible: ["Animation","Documentaries","Feature Films","Pilots","Post Only","Reality Television","Scripted Television"],
    ineligible: ["Commercials","Game Shows","Talk Shows","Video Games"],
    buckets: { residentATL: 0.30, residentBTL: 0.30, nonresidentATL: 0.30, nonresidentBTL: 0.30, spend: 0.30 },
    uplifts: [{ id: "my-cultural", label: "Cultural Test Uplift (+5% on production spend)", amount: 0.05, maxRate: 0.35, prompt: "Does this production expect to pass the Malaysia Cultural Test?" }],
    minSpend: 5000000, compensationCap: 7500000, sunsetDate: null,
    flags: { red: [], yellow: ["30% of production crew must be Malaysian citizens or permanent residents"], blue: ["Covers non-resident ATL and BTL at same 30% rate as residents — very accessible for US productions", "Currency is MYR"] },
    notes: ""
  },
  {
    id: "intl-morocco", name: "Morocco", flag: "🇲🇦", region: "International", currency: "MAD",
    dataDate: "03/08/2026", incentiveType: "rebate", monetizationRate: 1.00,
    monetizationLabel: "Rebate — paid directly",
    headline: "30%",
    eligible: ["Documentaries","Feature Films","Scripted Television"],
    ineligible: ["Animation","Commercials","Game Shows","Pilots","Post Only","Reality Television","Talk Shows","Video Games"],
    buckets: { residentATL: 0.30, residentBTL: 0.30, nonresidentATL: 0, nonresidentBTL: 0, spend: 0.30 },
    uplifts: [],
    minSpend: 10000000, minFilmingDays: 18, sunsetDate: null,
    flags: { red: ["Qualifying expenses cannot exceed 90% of total budget invested in Morocco"], yellow: ["Commission meets only twice a year — application timing critical", "Minimum 18 filming days"], blue: ["Currency is MAD (Moroccan Dirham)"] },
    notes: ""
  },
  {
    id: "intl-new_zealand", name: "New Zealand", flag: "🇳🇿", region: "International", currency: "NZD",
    dataDate: "03/08/2026", incentiveType: "rebate", monetizationRate: 1.00,
    monetizationLabel: "Rebate — paid directly",
    headline: "20%–25%",
    eligible: ["Animation","Documentaries","Feature Films","Pilots","Post Only","Reality Television","Scripted Television"],
    ineligible: ["Commercials","Game Shows","Talk Shows","Video Games"],
    buckets: { residentATL: 0.20, residentBTL: 0.20, nonresidentATL: 0.20, nonresidentBTL: 0.20, spend: 0.20 },
    uplifts: [{ id: "nz-econ", label: "Significant Economic Benefit Uplift (+5%)", amount: 0.05, maxRate: 0.25, prompt: "Does this production meet the criteria for significant economic benefit to New Zealand?" }],
    minSpend: 4000000, sunsetDate: null,
    flags: { red: [], yellow: ["Minimum spend NZ$15M for film, NZ$4M for TV", "Must register with NZFC before start of principal photography"], blue: ["Non-NZ crew qualify if working in NZ for at least 14 days total", "Currency is NZD"] },
    notes: ""
  },
  {
    id: "intl-norway", name: "Norway", flag: "🇳🇴", region: "International", currency: "NOK",
    dataDate: "03/08/2026", incentiveType: "grant", monetizationRate: 1.00,
    monetizationLabel: "Grant — paid directly",
    headline: "25%",
    eligible: ["Documentaries","Feature Films","Scripted Television"],
    ineligible: ["Animation","Commercials","Game Shows","Pilots","Post Only","Reality Television","Talk Shows","Video Games"],
    buckets: { residentATL: 0.25, residentBTL: 0.25, nonresidentATL: 0, nonresidentBTL: 0, spend: 0.25 },
    uplifts: [],
    minSpend: 10000000, sunsetDate: null,
    flags: { red: [], yellow: ["30% of financing must come from international sources outside Norway", "Must document international distribution agreement", "Most restrictive eligible type list in international set"], blue: ["Currency is NOK"] },
    notes: ""
  },
  {
    id: "intl-philippines", name: "Philippines", flag: "🇵🇭", region: "International", currency: "PHP",
    dataDate: "03/08/2026", incentiveType: "rebate", monetizationRate: 1.00,
    monetizationLabel: "Rebate — paid directly",
    headline: "20%–25%",
    eligible: ["Animation","Documentaries","Feature Films","Pilots","Post Only","Reality Television","Scripted Television"],
    ineligible: ["Commercials","Game Shows","Talk Shows","Video Games"],
    buckets: { residentATL: 0.20, residentBTL: 0.20, nonresidentATL: 0, nonresidentBTL: 0, spend: 0.20 },
    uplifts: [{ id: "ph-cultural", label: "Cultural Test Uplift (+5%)", amount: 0.05, maxRate: 0.25, prompt: "Does this production expect to pass the Philippines Cultural Test? (Uplift capped at PHP 30M.)" }],
    minSpend: 3000000, projectCap: 25000000, sunsetDate: null,
    flags: { red: [], yellow: ["Must submit provisional application BEFORE spending any money in Philippines", "Cultural test uplift capped at PHP 30M"], blue: ["Currency is PHP"] },
    notes: ""
  },
  {
    id: "intl-quebec", name: "Quebec", flag: "🇨🇦", region: "International", currency: "CAD",
    dataDate: "03/08/2026", incentiveType: "refundable_stacked", monetizationRate: 1.00,
    monetizationLabel: "Refundable — paid directly (provincial + federal stacked)",
    headline: "37% effective on qualifying labour",
    eligible: ["Animation","Documentaries","Feature Films","Pilots","Post Only","Scripted Television"],
    ineligible: ["Commercials","Game Shows","Reality Television","Talk Shows","Video Games"],
    buckets: { residentATL: 0.37, residentBTL: 0.37, nonresidentATL: 0, nonresidentBTL: 0, spend: 0.25 },
    uplifts: [{ id: "qc-anim", label: "Animation/Special Effects Labour Uplift (+16%)", amount: 0.16, prompt: "Does this production have qualifying animation or special effects Quebec labour?" }],
    minSpend: 250000, sunsetDate: null,
    flags: { red: [], yellow: ["Federal 16% applies to labour NET of provincial assistance — not simply additive"], blue: ["No caps of any kind", "Currency is CAD"] },
    notes: "25% provincial + 16% federal on net labour = 37% effective on qualifying labour."
  },
  {
    id: "intl-romania", name: "Romania", flag: "🇷🇴", region: "International", currency: "EUR",
    dataDate: "03/08/2026", incentiveType: "rebate", monetizationRate: 1.00,
    monetizationLabel: "Rebate — first-come, first-served",
    headline: "35%–45%",
    eligible: ["Animation","Documentaries","Feature Films","Pilots","Scripted Television"],
    ineligible: ["Commercials","Game Shows","Post Only","Reality Television","Talk Shows","Video Games"],
    buckets: { residentATL: 0.35, residentBTL: 0.35, nonresidentATL: 0, nonresidentBTL: 0, spend: 0.35 },
    uplifts: [{ id: "ro-promo", label: "Romania Promotional Uplift (+10%)", amount: 0.10, maxRate: 0.45, prompt: "Does this project explicitly promote Romania — country, region, city, or landmarks?" }],
    minSpend: 100000, projectCap: 10000000, annualCap: 50000000, sunsetDate: null,
    flags: { red: [], yellow: ["First-come, first-served — annual €50M cap can be exhausted"], blue: ["Very low minimum spend of €100K — accessible for smaller productions", "35% + 10% = 45% potential — tied for highest ceiling in dataset", "Currency is EUR"] },
    notes: ""
  },
  {
    id: "intl-south_africa", name: "South Africa", flag: "🇿🇦", region: "International", currency: "ZAR",
    dataDate: "03/08/2026", incentiveType: "rebate", monetizationRate: 1.00,
    monetizationLabel: "Rebate — paid directly",
    headline: "20%–25%",
    eligible: ["Documentaries","Feature Films","Pilots","Post Only","Scripted Television"],
    ineligible: ["Animation","Commercials","Game Shows","Reality Television","Talk Shows","Video Games"],
    buckets: { residentATL: 0.25, residentBTL: 0.25, nonresidentATL: 0, nonresidentBTL: 0, spend: 0.25, spendPost: 0.20 },
    uplifts: [],
    minSpend: 12000000, projectCap: 50000000, sunsetDate: null,
    flags: { red: [], yellow: ["TWO RATES: Production spend (QSAPE) at 25%, Post-production spend (QSAPPE) at 20%", "Minimum 21 calendar days AND 50% of principal photography"], blue: ["Currency is ZAR"] },
    notes: "Post spend entered in separate bucket at 20%."
  },
  {
    id: "intl-south_korea", name: "South Korea", flag: "🇰🇷", region: "International", currency: "KRW",
    dataDate: "03/08/2026", incentiveType: "rebate", monetizationRate: 1.00,
    monetizationLabel: "Rebate — paid directly",
    headline: "25%–30% (tiered)",
    eligible: ["Documentaries","Feature Films","Scripted Television"],
    ineligible: ["Animation","Commercials","Game Shows","Pilots","Post Only","Reality Television","Talk Shows","Video Games"],
    buckets: { residentATL: "tiered", residentBTL: "tiered", nonresidentATL: 0, nonresidentBTL: 0, spend: "tiered" },
    tiers: [{ max: 49999999, rate: 0.25 }, { max: null, rate: 0.30 }],
    uplifts: [],
    minSpend: 50000000, projectCap: 700000000, sunsetDate: null,
    flags: { red: ["CRITICAL: Post costs OR cast/crew labor cannot exceed 50% of total QPE", "CRITICAL: Main cast costs cannot exceed 30% of total labor costs"], yellow: ["Review Committee approval required — evaluates tourism promotion and industry contribution"], blue: ["Currency is KRW"] },
    notes: ""
  },
  {
    id: "intl-spain", name: "Spain", flag: "🇪🇸", region: "International", currency: "EUR",
    dataDate: "03/08/2026", incentiveType: "rebate", monetizationRate: 1.00,
    monetizationLabel: "Rebate — paid directly",
    headline: "25%–30% (tiered)",
    eligible: ["Animation","Feature Films","Pilots","Scripted Television"],
    ineligible: ["Commercials","Documentaries","Game Shows","Post Only","Reality Television","Talk Shows","Video Games"],
    buckets: { residentATL: "spain_tiered", residentBTL: "spain_tiered", nonresidentATL: 0, nonresidentBTL: 0, spend: "spain_tiered" },
    spainTier: { firstMillionRate: 0.30, subsequentRate: 0.25 },
    uplifts: [],
    minSpend: 1000000, projectCap: 20000000, sunsetDate: null,
    flags: { red: [], yellow: ["TIERED: 30% on first €1M of local spend, 25% thereafter", "Application window: July ONLY of year after filming ends", "Must apply through a Spanish company"], blue: ["Currency is EUR"] },
    notes: "Related programs: Canary Islands, Navarre, Biscay may offer different rates."
  },
  {
    id: "intl-thailand", name: "Thailand", flag: "🇹🇭", region: "International", currency: "THB",
    dataDate: "03/08/2026", incentiveType: "rebate", monetizationRate: 1.00,
    monetizationLabel: "Rebate — paid directly",
    headline: "15%–20%",
    eligible: ["Animation","Documentaries","Feature Films","Pilots","Post Only","Reality Television","Scripted Television"],
    ineligible: ["Commercials","Game Shows","Talk Shows","Video Games"],
    buckets: { residentATL: 0.15, residentBTL: 0.15, nonresidentATL: 0, nonresidentBTL: 0, spend: 0.15 },
    uplifts: [],
    minSpend: 50000000, projectCap: 75000000, sunsetDate: null,
    flags: { red: ["CRITICAL: Foreigners working in Thailand are EXCLUDED from qualifying spend — non-resident labor does not qualify"], yellow: ["Must obtain filming permit before applying", "Must engage a local coordinator company — no individual fixers"], blue: ["Currency is THB"] },
    notes: ""
  },
  {
    id: "intl-turkey", name: "Turkey", flag: "🇹🇷", region: "International", currency: "TRY",
    dataDate: "03/08/2026", incentiveType: "rebate", monetizationRate: 1.00,
    monetizationLabel: "Cash rebate — paid directly",
    headline: "30%",
    eligible: ["Documentaries","Feature Films","Scripted Television"],
    ineligible: ["Animation","Commercials","Game Shows","Pilots","Post Only","Reality Television","Talk Shows","Video Games"],
    buckets: { residentATL: 0.30, residentBTL: 0.30, nonresidentATL: 0, nonresidentBTL: 0, spend: 0.30 },
    uplifts: [],
    minSpend: 6000000, sunsetDate: null,
    flags: { red: ["CRITICAL: All expenditures must be made AFTER the date of application submission — no retroactive qualifying"], yellow: ["Commission meets quarterly — timing critical", "Non-resident rates not specified — verify with Filming in Turkey", "Currency is TRY (Turkish Lira) — highly volatile exchange rate"], blue: [] },
    notes: ""
  },
  {
    id: "intl-uae_abu_dhabi", name: "UAE – Abu Dhabi", flag: "🇦🇪", region: "International", currency: "USD",
    dataDate: "03/08/2026", incentiveType: "rebate", monetizationRate: 1.00,
    monetizationLabel: "Rebate — paid directly (USD denominated)",
    headline: "30%",
    eligible: ["Animation","Commercials","Documentaries","Feature Films","Game Shows","Pilots","Post Only","Scripted Television"],
    ineligible: ["Reality Television","Talk Shows","Video Games"],
    buckets: { residentATL: 0, residentBTL: 0.30, nonresidentATL: 0, nonresidentBTL: 0, spend: 0.30 },
    uplifts: [],
    minSpend: 50000, projectCap: 1000000, sunsetDate: null,
    flags: { red: [], yellow: ["Only Resident BTL listed for labor — ATL and non-resident not listed, verify with ADFC", "Project cap: $5M film, $1M TV", "Requires National Media Council approval — build in lead time"], blue: ["Denominated in USD — no currency conversion needed"] },
    notes: ""
  },
  {
    id: "intl-united_kingdom", name: "United Kingdom", flag: "🇬🇧", region: "International", currency: "GBP",
    dataDate: "03/08/2026", incentiveType: "refundable_tax_credit", monetizationRate: 1.00,
    monetizationLabel: "Refundable tax credit — multiple sub-programs",
    headline: "Varies by sub-program",
    eligible: ["Documentaries","Feature Films","Pilots","Scripted Television"],
    ineligible: ["Animation","Commercials","Game Shows","Post Only","Reality Television","Talk Shows","Video Games"],
    buckets: { residentATL: 0, residentBTL: 0, nonresidentATL: 0, nonresidentBTL: 0, spend: 0 },
    uplifts: [],
    minSpend: null, sunsetDate: null,
    flags: { red: ["COMPLEX PROGRAM: UK has 4 separate sub-programs — contact British Film Commission for precise rates. Calculator cannot give accurate figures without sub-program PDFs."], yellow: ["Cultural test required via BFI", "Enhanced VFX rate of 29.25% available from April 2025 for qualifying productions"], blue: ["Currency is GBP"] },
    notes: "Sub-programs: Feature Films, Independent Films, High End TV, Children's TV and Animation."
  },
];

const PRODUCTION_TYPES = [
  "Feature Film", "Scripted Television", "Reality Television",
  "Unscripted / Non-Scripted", "Documentary", "Game Show",
  "Animation", "Commercial", "Pilot", "Post Only", "Talk Show", "Video Game"
];

const BUCKET_LABELS = {
  residentATL: "Resident ATL",
  residentBTL: "Resident BTL",
  nonresidentATL: "Non-Resident ATL",
  nonresidentBTL: "Non-Resident BTL",
  spend: "Qualifying Spend",
  spendPost: "Post-Production Spend (separate rate)"
};

const CONTINGENCY = 0.10;

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function getRate(loc, bucket, totalSpend) {
  const raw = loc.buckets[bucket];
  if (raw === undefined || raw === null) return 0;
  if (typeof raw === "number") return raw;
  if (raw === 0) return 0;

  // Arizona / Connecticut / Texas / South Korea tiered
  if (raw === "tiered" && loc.tiers) {
    for (const tier of loc.tiers) {
      if (tier.max === null || totalSpend <= tier.max) return tier.rate;
    }
    return loc.tiers[loc.tiers.length - 1].rate;
  }

  // Spain split-tier: 30% on first €1M, 25% after
  if (raw === "spain_tiered") return "spain";

  return 0;
}

function calcSpainSplit(amount) {
  if (amount <= 1000000) return amount * 0.30;
  return 1000000 * 0.30 + (amount - 1000000) * 0.25;
}

function totalQualifiedSpend(loc, inputs, uplifts, totalAllSpend) {
  let total = 0;
  const bucketKeys = Object.keys(loc.buckets);

  for (const bucket of bucketKeys) {
    const amount = parseFloat(inputs[bucket] || 0);
    if (!amount) continue;

    let rate = getRate(loc, bucket, totalAllSpend);

    if (rate === "spain") {
      total += calcSpainSplit(amount);
      continue;
    }

    if (typeof rate !== "number") continue;

    // Apply uplifts to base rate
    let effectiveRate = rate;
    for (const u of uplifts) {
      if (u.active) {
        // Some uplifts only apply to resident labor
        if (u.appliesToResidentOnly && !["residentATL","residentBTL"].includes(bucket)) continue;
        effectiveRate = Math.min(effectiveRate + u.amount, u.maxRate || 1);
      }
    }

    total += amount * effectiveRate;
  }
  return total;
}

function formatCurrency(n, currency = "USD") {
  if (!n && n !== 0) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency, maximumFractionDigits: 0
  }).format(n);
}

function isEligible(loc, productionType) {
  const map = {
    "Feature Film": "Feature Films",
    "Scripted Television": "Scripted Television",
    "Reality Television": "Reality Television",
    "Unscripted / Non-Scripted": "Reality Television",
    "Documentary": "Documentaries",
    "Game Show": "Game Shows",
    "Animation": "Animation",
    "Commercial": "Commercials",
    "Pilot": "Pilots",
    "Post Only": "Post Only",
    "Talk Show": "Talk Shows",
    "Video Game": "Video Games"
  };
  const mapped = map[productionType] || productionType;
  if (loc.ineligible?.includes(mapped)) return false;
  return true;
}

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

function LocationSelector({ selected, onToggle, productionType }) {
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState("All");

  const filtered = LOCATIONS.filter(loc => {
    const matchSearch = loc.name.toLowerCase().includes(search.toLowerCase());
    const matchRegion = regionFilter === "All" || loc.region === regionFilter;
    return matchSearch && matchRegion;
  });

  const regions = ["All", "US", "International"];

  return (
    <div style={{ background: "var(--surface)", borderRadius: 12, padding: "1.5rem", border: "1px solid var(--border)" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search locations..."
          style={{
            flex: 1, minWidth: 160, padding: "8px 12px", borderRadius: 8,
            border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)",
            fontSize: 13, outline: "none"
          }}
        />
        {regions.map(r => (
          <button key={r} onClick={() => setRegionFilter(r)} style={{
            padding: "8px 14px", borderRadius: 8, border: "1px solid var(--border)",
            background: regionFilter === r ? "var(--accent)" : "var(--bg)",
            color: regionFilter === r ? "#fff" : "var(--text)", cursor: "pointer", fontSize: 12, fontWeight: 600
          }}>{r}</button>
        ))}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, maxHeight: 220, overflowY: "auto" }}>
        {filtered.map(loc => {
          const sel = selected.includes(loc.id);
          const elig = !productionType || isEligible(loc, productionType);
          const disabled = !sel && selected.length >= 3;
          return (
            <button
              key={loc.id}
              onClick={() => !disabled && onToggle(loc.id)}
              disabled={disabled && !sel}
              style={{
                padding: "6px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                cursor: disabled && !sel ? "not-allowed" : "pointer",
                border: sel ? "2px solid var(--accent)" : "1px solid var(--border)",
                background: sel ? "var(--accent)" : elig ? "var(--bg)" : "var(--muted)",
                color: sel ? "#fff" : elig ? "var(--text)" : "var(--text-muted)",
                opacity: disabled && !sel ? 0.4 : 1,
                transition: "all 0.15s"
              }}
            >
              {loc.flag} {loc.name}
              {!elig && productionType && <span style={{ marginLeft: 4, color: "#e53e3e" }}>✕</span>}
            </button>
          );
        })}
      </div>
      <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 8 }}>
        Select up to 3 locations. {productionType && "✕ = ineligible for selected production type."}
      </p>
    </div>
  );
}

function UpliftPrompts({ loc, uplifts, onToggle }) {
  if (!loc.uplifts?.length) return null;
  return (
    <div style={{ marginTop: 12 }}>
      <p style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>
        Available Uplifts
      </p>
      {loc.uplifts.map(u => (
        <div key={u.id} style={{
          display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 12px",
          background: "var(--bg)", borderRadius: 8, marginBottom: 6, border: "1px solid var(--border)"
        }}>
          <input
            type="checkbox"
            checked={uplifts[u.id] || false}
            onChange={() => onToggle(u.id)}
            style={{ marginTop: 2, accentColor: "var(--accent)", cursor: "pointer" }}
          />
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", margin: 0 }}>{u.label}</p>
            <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "2px 0 0" }}>{u.prompt}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function SpendInputs({ loc, inputs, onChange, uplifts, onUpliftToggle }) {
  const buckets = Object.keys(loc.buckets);

  return (
    <div>
      <p style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>
        Qualifying Spend ({loc.currency})
      </p>
      {buckets.map(bucket => {
        const rate = loc.buckets[bucket];
        const rateDisplay = rate === "tiered" ? "Tiered" : rate === "spain_tiered" ? "30%/25%" :
          typeof rate === "number" ? `${(rate * 100).toFixed(0)}%` : "—";
        const isZero = rate === 0;
        return (
          <div key={bucket} style={{ marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
              <label style={{ fontSize: 12, color: isZero ? "var(--text-muted)" : "var(--text)", fontWeight: 500 }}>
                {BUCKET_LABELS[bucket] || bucket}
              </label>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: "1px 8px", borderRadius: 10,
                background: isZero ? "var(--muted)" : "var(--accent-muted)",
                color: isZero ? "var(--text-muted)" : "var(--accent)"
              }}>
                {rateDisplay}
              </span>
            </div>
            <input
              type="number"
              value={inputs[bucket] || ""}
              onChange={e => onChange(bucket, e.target.value)}
              placeholder={isZero ? "Not qualifying" : "Enter amount"}
              disabled={isZero}
              style={{
                width: "100%", padding: "8px 10px", borderRadius: 8, fontSize: 13,
                border: "1px solid var(--border)", background: isZero ? "var(--muted)" : "var(--bg)",
                color: isZero ? "var(--text-muted)" : "var(--text)", outline: "none",
                boxSizing: "border-box"
              }}
            />
          </div>
        );
      })}
      <UpliftPrompts loc={loc} uplifts={uplifts} onToggle={onUpliftToggle} />
    </div>
  );
}

function ResultCard({ loc, inputs, upliftState }) {
  const eligible = isEligible(loc, null);

  const totalAllSpend = Object.values(inputs).reduce((s, v) => s + (parseFloat(v) || 0), 0);

  const activeUplifts = (loc.uplifts || []).filter(u => upliftState[u.id]);
  const grossIncentive = loc.incentiveType === "non_transferable_non_refundable"
    ? null
    : totalQualifiedSpend(loc, inputs, activeUplifts, totalAllSpend);

  const contingencyDeduction = grossIncentive ? grossIncentive * CONTINGENCY : 0;
  const revisedQualifiedSpend = grossIncentive ? grossIncentive - contingencyDeduction : 0;
  const netIncentive = revisedQualifiedSpend && loc.monetizationRate
    ? revisedQualifiedSpend * loc.monetizationRate : null;
  const revisedBudget = totalAllSpend && netIncentive ? totalAllSpend - netIncentive : null;

  const noCalc = loc.incentiveType === "non_transferable_non_refundable" ||
    loc.incentiveType === "discretionary_rebate" ||
    (loc.buckets && Object.values(loc.buckets).every(v => v === 0));

  const currency = loc.currency || "USD";

  return (
    <div style={{
      background: "var(--surface)", borderRadius: 12, border: "1px solid var(--border)",
      overflow: "hidden", flex: 1, minWidth: 280
    }}>
      {/* Header */}
      <div style={{ background: "var(--accent)", padding: "14px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: 1 }}>
              {loc.flag} {loc.region}
            </p>
            <p style={{ margin: "2px 0 0", fontSize: 18, fontWeight: 800, color: "#fff" }}>{loc.name}</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.7)" }}>Headline Rate</p>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#fff" }}>{loc.headline}</p>
          </div>
        </div>
        <p style={{ margin: "6px 0 0", fontSize: 11, color: "rgba(255,255,255,0.8)" }}>
          {loc.monetizationLabel}
        </p>
      </div>

      <div style={{ padding: "14px 16px" }}>
        {/* Data date */}
        <p style={{ fontSize: 10, color: "var(--text-muted)", margin: "0 0 12px", textTransform: "uppercase", letterSpacing: 0.5 }}>
          Data: EP {loc.dataDate} · Currency: {currency}
        </p>

        {noCalc ? (
          <div style={{ background: "#fff3cd", border: "1px solid #ffc107", borderRadius: 8, padding: 12, marginBottom: 12 }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#856404" }}>⚠️ Cannot Calculate Automatically</p>
            <p style={{ margin: "4px 0 0", fontSize: 11, color: "#856404" }}>
              {loc.incentiveType === "non_transferable_non_refundable"
                ? "This credit is non-transferable and non-refundable. Value depends entirely on your company's tax liability in this jurisdiction. Consult your tax advisor."
                : "This is a discretionary or contact-for-details program. Contact the film office for an estimate."}
            </p>
          </div>
        ) : totalAllSpend > 0 ? (
          <div style={{ marginBottom: 12 }}>
            {/* Calculation breakdown */}
            <div style={{ background: "var(--bg)", borderRadius: 8, padding: 12, marginBottom: 8 }}>
              <Row label="Pre-Incentive Budget" value={formatCurrency(totalAllSpend, currency)} bold />
              <div style={{ borderTop: "1px solid var(--border)", margin: "8px 0" }} />
              <Row label="Total Qualified at Rates" value={formatCurrency(grossIncentive, currency)} />
              <Row label={`Less 10% Contingency`} value={`(${formatCurrency(contingencyDeduction, currency)})`} muted />
              <Row label="Revised Qualified Spend" value={formatCurrency(revisedQualifiedSpend, currency)} />
              <div style={{ borderTop: "1px solid var(--border)", margin: "8px 0" }} />
              <Row label={`× Monetization Rate (${loc.monetizationRate ? `${(loc.monetizationRate * 100).toFixed(0)}¢` : "N/A"})`} value="" />
              <Row label="Net Incentive Value" value={formatCurrency(netIncentive, currency)} bold accent />
              <div style={{ borderTop: "1px solid var(--border)", margin: "8px 0" }} />
              <Row label="Revised Budget After Incentive" value={formatCurrency(revisedBudget, currency)} bold />
            </div>

            {/* Uplift summary */}
            {activeUplifts.length > 0 && (
              <div style={{ fontSize: 11, color: "var(--accent)", marginBottom: 8 }}>
                ✓ Uplifts applied: {activeUplifts.map(u => u.label).join(", ")}
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "24px 0", color: "var(--text-muted)", fontSize: 13 }}>
            Enter spend amounts to see calculation
          </div>
        )}

        {/* Flags */}
        {loc.flags?.red?.length > 0 && (
          <div style={{ marginBottom: 8 }}>
            {loc.flags.red.map((f, i) => (
              <FlagBadge key={i} color="#fed7d7" text={f} icon="🔴" textColor="#c53030" />
            ))}
          </div>
        )}
        {loc.flags?.yellow?.length > 0 && (
          <div style={{ marginBottom: 8 }}>
            {loc.flags.yellow.map((f, i) => (
              <FlagBadge key={i} color="#fefcbf" text={f} icon="🟡" textColor="#744210" />
            ))}
          </div>
        )}
        {loc.flags?.blue?.length > 0 && (
          <div style={{ marginBottom: 8 }}>
            {loc.flags.blue.map((f, i) => (
              <FlagBadge key={i} color="#bee3f8" text={f} icon="🔵" textColor="#2a4365" />
            ))}
          </div>
        )}

        {loc.notes && (
          <p style={{ fontSize: 11, color: "var(--text-muted)", fontStyle: "italic", margin: "8px 0 0" }}>
            {loc.notes}
          </p>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, bold, muted, accent }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
      <span style={{ fontSize: 12, color: muted ? "var(--text-muted)" : "var(--text)", flex: 1 }}>{label}</span>
      <span style={{
        fontSize: 12, fontWeight: bold ? 700 : 400,
        color: accent ? "var(--accent)" : muted ? "var(--text-muted)" : "var(--text)"
      }}>{value}</span>
    </div>
  );
}

function FlagBadge({ color, text, icon, textColor }) {
  return (
    <div style={{
      background: color, borderRadius: 6, padding: "6px 8px", marginBottom: 4,
      display: "flex", gap: 6, alignItems: "flex-start"
    }}>
      <span style={{ fontSize: 10, marginTop: 1 }}>{icon}</span>
      <span style={{ fontSize: 11, color: textColor, lineHeight: 1.4 }}>{text}</span>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

export default function TaxIncentiveCalculator() {
  const [productionType, setProductionType] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [spendInputs, setSpendInputs] = useState({});   // { locId: { bucket: value } }
  const [upliftState, setUpliftState] = useState({});   // { locId: { upliftId: bool } }
  const [darkMode, setDarkMode] = useState(true);

  const theme = {
    "--bg": darkMode ? "#0f1117" : "#f8f9fa",
    "--surface": darkMode ? "#1a1d2e" : "#ffffff",
    "--border": darkMode ? "#2d3148" : "#e2e8f0",
    "--text": darkMode ? "#e8eaf6" : "#1a202c",
    "--text-muted": darkMode ? "#6b7280" : "#718096",
    "--accent": "#5c6bc0",
    "--accent-muted": darkMode ? "rgba(92,107,192,0.15)" : "rgba(92,107,192,0.1)",
    "--muted": darkMode ? "#1f2233" : "#f0f2f5",
    fontFamily: "'DM Sans', 'Trebuchet MS', sans-serif",
  };

  const selectedLocs = useMemo(() =>
    selectedIds.map(id => LOCATIONS.find(l => l.id === id)).filter(Boolean),
    [selectedIds]
  );

  function toggleLocation(id) {
    setSelectedIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  }

  function handleSpendChange(locId, bucket, value) {
    setSpendInputs(prev => ({
      ...prev,
      [locId]: { ...(prev[locId] || {}), [bucket]: value }
    }));
  }

  function handleUpliftToggle(locId, upliftId) {
    setUpliftState(prev => ({
      ...prev,
      [locId]: { ...(prev[locId] || {}), [upliftId]: !(prev[locId]?.[upliftId]) }
    }));
  }

  return (
    <div style={{ ...theme, minHeight: "100vh", background: "var(--bg)", color: "var(--text)", padding: "0" }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #1a1d2e 0%, #2d3148 100%)",
        padding: "24px 32px", borderBottom: "1px solid var(--border)"
      }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, background: "var(--accent)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, fontWeight: 800, color: "#fff"
              }}>S</div>
              <div>
                <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: -0.5 }}>StudioChief</p>
                <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.6)" }}>Tax Incentive Calculator</p>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
              46 locations · Data: EP 03/08–09/2026
            </p>
            <button onClick={() => setDarkMode(!darkMode)} style={{
              background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
              color: "#fff", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 12
            }}>
              {darkMode ? "☀️ Light" : "🌙 Dark"}
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "24px 32px" }}>
        {/* Step 1: Production Type */}
        <Section title="Step 1 — Production Type" subtitle="Required before location selection">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {PRODUCTION_TYPES.map(pt => (
              <button key={pt} onClick={() => setProductionType(pt)} style={{
                padding: "8px 16px", borderRadius: 20, fontSize: 13, fontWeight: 600,
                cursor: "pointer", transition: "all 0.15s",
                border: productionType === pt ? "2px solid var(--accent)" : "1px solid var(--border)",
                background: productionType === pt ? "var(--accent)" : "var(--surface)",
                color: productionType === pt ? "#fff" : "var(--text)"
              }}>{pt}</button>
            ))}
          </div>
          {productionType && (
            <p style={{ marginTop: 8, fontSize: 12, color: "var(--accent)", fontWeight: 600 }}>
              ✓ Production type: {productionType}
            </p>
          )}
        </Section>

        {/* Step 2: Location Selection */}
        <Section title="Step 2 — Select Up to 3 Locations" subtitle="Compare side by side">
          <LocationSelector
            selected={selectedIds}
            onToggle={toggleLocation}
            productionType={productionType}
          />
          {selectedIds.length > 0 && (
            <p style={{ marginTop: 8, fontSize: 12, color: "var(--accent)", fontWeight: 600 }}>
              ✓ Selected: {selectedLocs.map(l => l.name).join(" · ")}
            </p>
          )}
        </Section>

        {/* Step 3: Spend Inputs + Results */}
        {selectedLocs.length > 0 && (
          <Section title="Step 3 — Enter Qualifying Spend & View Results" subtitle="Enter amounts in the location's native currency">
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
              {selectedLocs.map(loc => (
                <div key={loc.id} style={{ flex: 1, minWidth: 280 }}>
                  {/* Spend inputs */}
                  <div style={{
                    background: "var(--surface)", borderRadius: 12, padding: "1.5rem",
                    border: "1px solid var(--border)", marginBottom: 12
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <p style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>
                        {loc.flag} {loc.name}
                      </p>
                      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{loc.currency}</span>
                    </div>
                    <SpendInputs
                      loc={loc}
                      inputs={spendInputs[loc.id] || {}}
                      onChange={(bucket, val) => handleSpendChange(loc.id, bucket, val)}
                      uplifts={upliftState[loc.id] || {}}
                      onUpliftToggle={(uid) => handleUpliftToggle(loc.id, uid)}
                    />
                  </div>

                  {/* Result card */}
                  <ResultCard
                    loc={loc}
                    inputs={spendInputs[loc.id] || {}}
                    upliftState={upliftState[loc.id] || {}}
                  />
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Disclaimer */}
        <div style={{
          marginTop: 32, padding: "16px 20px", background: "var(--surface)",
          borderRadius: 10, border: "1px solid var(--border)", fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6
        }}>
          <strong style={{ color: "var(--text)" }}>Disclaimer:</strong> This tool provides estimates based on Entertainment Partners incentive data (03/08–09/2026). Incentive rates and program rules change frequently. All calculations apply a 10% contingency deduction by default. Transferable tax credits default to 85¢ on the dollar monetization unless a state buy-back rate is known. This tool does not constitute legal, tax, or financial advice. Verify all figures with the relevant film office and your tax advisor before making production decisions.
          <br /><br />
          <strong style={{ color: "var(--text)" }}>Known limitations:</strong> UK rates require sub-program selection not yet implemented. Indiana cannot be calculated (non-transferable, non-refundable). Oklahoma and Australia - Northern Territory are discretionary. Australian Federal program rates not yet ingested. ~14 additional US states pending.
        </div>
      </div>
    </div>
  );
}

function Section({ title, subtitle, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ marginBottom: 12 }}>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "var(--text)" }}>{title}</h2>
        {subtitle && <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--text-muted)" }}>{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
