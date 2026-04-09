# TOOL4_TAX_INCENTIVE_RULES.md
# StudioChief — Tax Incentive Calculator Rules
# Last updated: April 9, 2026
# Paste this alongside CLAUDE_CONTEXT.md when working on Tool 4.
# For full incentive calculation logic, also paste TAX_INCENTIVE_RULES (1).md and incentives_data.json.

---

## WHAT THIS TOOL DOES

The Tax Incentive Calculator helps production executives compare film/TV tax incentives across up to 3 locations simultaneously. It calculates net incentive value after monetization, contingency, and audit fees, surfaces eligibility restrictions by production type, prompts for uplifts, and flags critical issues. Entirely client-side — no backend API call.

---

## CURRENT STATUS

Live in studiochief_v24.html. All calculation logic is vanilla JavaScript embedded in the HTML file. No React, no build step, no backend.

---

## DATA COVERAGE

- 46 locations: 21 US states/territories + 25 international
- Data source: publicly available incentive data, March 2026
- Do NOT reference Entertainment Partners by name in the UI
- Every output displays: "Data: publicly available incentive data, March 2026"
- Approximately 14 additional US states pending

---

## PRODUCTION TYPES

Feature Film, Scripted Television, Reality Television, Unscripted / Non-Scripted, Documentary, Competition, Game Show, Animation, Commercial, Pilot, Post Only, Talk Show, Video Game.

Competition maps to Reality Television eligibility rules in the PT_MAP.

---

## BUCKET MODE SYSTEM

This is the core UX logic. Each location is assigned one of four modes by the getBucketMode() function. The mode determines how many spend input fields appear and what they're called. A colored explanation banner always tells the user why they're seeing what they're seeing.

### simple (green banner)
One field: "Total Qualifying Spend." Used when the incentive applies a flat rate to all qualifying expenditures with no distinction between labor and non-labor, and no residency differential.

Examples: Georgia, Ireland, Romania, Morocco, most pure rebate locations.

Georgia example: 20% (or 30% with logo) applies to everything. User enters one number.

### labor_spend (indigo banner)
Two fields: "Qualifying Labor" and "Non-Labor Qualifying Spend." Used when resident and non-resident rates are the same, but the user's records benefit from separating labor from everything else. Rate is identical on both fields.

Examples: Alabama (35% resident labor, 25% non-resident labor — actually this goes full), most states where rates differ between resident and non-resident.

Note: If ANY rate differs between buckets, the location goes to full mode, not labor_spend.

### full (amber banner)
All applicable non-zero buckets shown individually with their own rate badges and descriptions. Used when rates genuinely differ by category — residency, ATL vs BTL, labor vs spend, or post vs production.

Examples: Nevada (different ATL vs BTL rates), Minnesota (non-resident BTL is 20% not 25%), Louisiana (labor uplift changes resident labor rate), South Africa (production 25%, post 20%), Tennessee (non-resident ATL/BTL zero for non-scripted TV).

### nocalc (red banner)
No spend fields. Contact-for-details message only. Used for: Indiana (non-transferable non-refundable), Oklahoma (discretionary), UK (multiple sub-programs), Australia NSW/NT/WA (contact-for-details or discretionary).

### getBucketMode() logic
1. If incentiveType is non-calculable: nocalc
2. If all bucket values are 0: nocalc
3. If spendPost exists at a different rate than spend (South Africa): full
4. If all non-zero buckets have identical rates: simple
5. If labor buckets all match each other but differ from spend: labor_spend
6. Otherwise: full

---

## CALCULATION OPTIONS (USER-CONTROLLED PER LOCATION)

### Contingency toggle
Checkbox: "Apply 10% contingency deduction" — ON by default.
When checked: deducts 10% from gross incentive before applying monetization rate.
When unchecked: gross incentive goes straight to monetization.
This lets the user show the network the maximum possible credit without the conservative buffer.

### Audit / CPA fee toggle
Checkbox: "Deduct audit/CPA fee" — OFF by default.
When checked: shows an editable dollar field pre-filled with a state-appropriate default.
Deduction happens after net incentive is calculated (post-monetization).
Default amounts by state are defined in the AUDIT_FEE_DEFAULTS object in the code.
Typical range: $8,000–$20,000 depending on budget size and state.
Georgia default: $15,000. Most states: $10,000–$12,000.

---

## CALCULATION FLOW (in order)

1. User enters Total Production Budget (optional)
2. User enters qualifying spend in applicable buckets
3. Gross Incentive = spend × rate(s), with uplifts applied where checked
4. Less 10% Contingency (if toggle is on)
5. After Contingency amount
6. × Monetization Rate (state-specific)
7. = Net Incentive Value
8. Less Audit Fee (if toggle is on and amount entered)
9. = Net After Audit Fee
10. Effective Budget After Incentive = Total Budget minus Net After Audit Fee (only shows if budget was entered)

---

## MONETIZATION RATES

- 1.00 (100¢): Refundable credits, rebates, grants — paid directly, no sale needed
- 0.90 (90¢): Louisiana and Massachusetts — known state buy-back rates
- 0.85 (85¢): Transferable credits — open market default
- null: Indiana (non-calculable), Maine dual program (handled separately)

The UI displays a plain-English label for each rate, e.g. "90¢ — known state buy-back rate" so users understand why they're seeing that number.

---

## SPECIAL CALCULATION CASES

Full detail in TAX_INCENTIVE_RULES (1).md. Key cases:

- **Tiered rates** (Arizona, Connecticut, Texas, South Korea): tier determines rate for the ENTIRE project, not marginal. The tier is based on total qualifying spend entered.
- **Spain**: 30% on first €1M of local spend, 25% on everything above. tiCalcSpainSplit() handles the split.
- **Hawaii**: prompt user which island. Oahu = 22% (base), Neighbor Islands = +5% uplift to 27%.
- **British Columbia and Quebec**: labour only, stacked provincial + federal. Use published effective rates (46.2% and 37%).
- **South Africa**: full mode with two spend buckets — production spend (QSAPE) at 25%, post-production spend (QSAPPE) at 20%.
- **Louisiana labor uplift**: applies to individuals only, not loan-outs. User prompted via uplift checkbox.
- **Maryland $500K cap**: entire compensation disqualified when threshold hit, not just the overage. Flagged in red.
- **Minnesota non-resident ATL**: one producer and one director only, each capped at first $500K. Flagged in red.

---

## FLAG SYSTEM

### Red (critical — show prominently)
Indiana, California sunset, California competitive allocation, Maryland $500K cap, Minnesota one-producer-one-director limit, Turkey retroactivity rule, Thailand foreign workers excluded, Oklahoma discretionary.

### Yellow (warnings)
Connecticut theatrical moratorium, Tennessee non-resident restriction, Washington case-by-case formats, Louisiana loan-out rate, South Korea QPE caps, Maine spend credit limitation, tiered rate locations, Spain July window.

### Blue (informational advantages)
Arizona 100% buy-back, Louisiana 90% buy-back, Massachusetts 90% buy-back, Israel 80% mid-production, Georgia no caps, Ireland 90% mid-production, British Columbia 46.2%, Romania 45% potential.

---

## LOCATIONS REQUIRING "CONTACT FOR DETAILS" (nocalc mode)

UK, Australia NSW, Australia NT, Australia WA, Indiana, Oklahoma.

---

## FRONTEND INTEGRATION NOTES

- All 46 locations are embedded as a JavaScript array (TI_LOCATIONS) directly in the HTML
- getBucketMode() is called at render time — no pre-computed mode lookup table
- refreshTiResult() re-renders only the result card, not the spend card, to preserve user inputs
- tiSpendInputs, tiUpliftState, tiTotalBudget, tiContingency, tiAuditFee are all session-level JS objects keyed by location ID
- The "laborCombined" key is used for labor_spend mode's combined labor field
- The "spend" key is used for both simple mode's single field and labor_spend mode's non-labor field

---

## KNOWN LIMITATIONS (displayed in UI disclaimer)

- UK rates require sub-program selection not yet implemented
- Indiana cannot be calculated
- Oklahoma and Australia NT are discretionary
- Australian Federal program not yet ingested
- Approximately 14 additional US states pending

---

## PLANNED NEXT TOOLS (related)

- Tool 5: Tax Incentive Chatbot — natural language Q&A from incentive data, answer gets smarter as more state PDFs are fed in. Nobody has built this well for production industry.
- Tool 6: Tax Incentive Information lookup — pick a state, get full detail including application windows, audit requirements, deadlines.

---

*Update this file whenever: bucket mode logic changes, new locations are added, calculation flow changes, new options are added, or frontend integration details change.*

---

## UPDATES IN V25

- Audit/CPA fee checkbox label now shows the default estimated amount per state: "Deduct audit/CPA fee (est. $15,000)". The amount shown is pulled from AUDIT_FEE_DEFAULTS and formatted using tiFmtCurrency.
- Data Status button added to Tax Incentive tool header. Opens/closes a panel showing all 46 current locations + 14 pending US states, color-coded: green = summary data, indigo = detailed data, grey = pending.
- DATA_STATUS object in the JS contains every location with name, region, data level, and data date. Update this object as new PDFs are ingested and locations upgrade from summary to detailed.
- When Marc asks "what states are we missing?" or "what's the data status?", fetch the DATA_STATUS object from the current HTML or ask Marc to open the Data Status panel in the tool.
