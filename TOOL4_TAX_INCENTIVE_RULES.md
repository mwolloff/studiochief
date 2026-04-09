# TOOL4_TAX_INCENTIVE_RULES.md
# StudioChief — Tax Incentive Calculator Rules
# Last updated: April 9, 2026
# Paste this alongside CLAUDE_CONTEXT.md when working on Tool 4.
# For full incentive calculation logic, also paste TAX_INCENTIVE_RULES (1).md and incentives_data.json.

---

## WHAT THIS TOOL DOES

The Tax Incentive Calculator helps production executives compare film/TV tax incentives across up to 3 locations simultaneously. It calculates net incentive value after monetization and contingency, surfaces eligibility restrictions by production type, prompts for uplifts, and flags critical issues the user needs to know before choosing a production location.

---

## CURRENT STATUS

- Full React/JSX component is complete: tax-incentive-calculator.jsx
- Raw incentive data for 46 locations is complete: incentives_data.json
- Full rules and calculation logic documented: TAX_INCENTIVE_RULES (1).md
- NOT YET wired into the StudioChief frontend
- Next step: convert JSX to vanilla JS and add as a new tab in studiochief_v21.html

---

## DATA COVERAGE

- 46 locations total: 21 US states/territories + 25 international
- Data source: Entertainment Partners (EP), 03/08-09/2026
- Every output must display the data date so users know the data age
- Approximately 14 additional US states are pending (Missouri, New Mexico, New York, North Carolina, Ohio, Oregon, Pennsylvania, Rhode Island, South Carolina, Utah, Vermont, Virginia, Wisconsin, Wyoming)

---

## FRONTEND INTEGRATION PLAN

### Conversion approach
- The JSX component must be converted to plain HTML/CSS/vanilla JavaScript
- No React, no build step, no npm. Embed directly in the HTML file.
- Style to match existing StudioChief UI: dark mode default, indigo/slate accent colors (#5c6bc0)
- Add as a new tab in the existing tab navigation in studiochief_v21.html alongside Tools 1, 2, and 3

### Tool 4 does NOT need a backend API call
- All calculation logic is client-side
- No Claude API call needed for this tool
- The incentive data is embedded directly in the JavaScript (as it is in the JSX)

### Files needed for integration
- tax-incentive-calculator.jsx (source to convert)
- incentives_data.json (data, already embedded in the JSX)
- studiochief_v21.html (target file to add the new tab into)

---

## CORE CALCULATION LOGIC (SUMMARY)

Full detail is in TAX_INCENTIVE_RULES (1).md. Summary here for quick reference.

### Production type is required first
User must select production type before location selection. Several locations restrict eligibility or change rates based on production type.

### Location comparison
Up to 3 locations side by side.

### Spend buckets
- Resident ATL (Above the Line)
- Resident BTL (Below the Line)
- Non-Resident ATL
- Non-Resident BTL
- Qualifying Spend (general)
- Post-Production Spend (South Africa only, separate rate)

### Monetization defaults
- Refundable credits: 1.00 (100 cents)
- Rebates and grants: 1.00 (100 cents)
- Transferable credits: 0.85 default (85 cents)
- Arizona: 1.00 (state buys back at 100%)
- Louisiana: 0.90 (state buy-back)
- Massachusetts: 0.90 (state buy-back)
- Indiana: no calculation (non-transferable, non-refundable)
- Maine: dual program, each component handled separately

### Contingency
Always deduct 10% contingency from gross incentive before applying monetization rate. This matches Marc's spreadsheet model.

### Output structure per location
1. Pre-incentive budget (total spend entered)
2. Qualified spend breakdown by bucket with rates applied
3. Total qualified at rates (gross incentive)
4. Less 10% contingency
5. Revised qualified spend
6. Monetization rate applied (with reason)
7. Net incentive value
8. Revised budget after incentive
9. Assumptions list
10. Flags (red/yellow/blue)

### Special calculation cases
- Tiered rates (Arizona, Connecticut, Texas, South Korea): tier determines rate for entire project, not marginal
- Spain: 30% on first EUR 1M, 25% on everything above. Must split the calculation at the EUR 1M mark.
- Hawaii: prompt user which island(s). Oahu = 22%, Neighbor Islands = 27%.
- British Columbia and Quebec: labour only, stacked provincial + federal. Use published effective rates (46.2% and 37%).
- South Africa: two separate rates. Production spend (QSAPE) at 25%, post-production spend (QSAPPE) at 20%.
- Louisiana labor uplift: applies to individuals only, not loan-outs. Loan-outs stay at base 25%.
- Maryland $500K cap: entire compensation disqualified when threshold is hit, not just the overage.
- Minnesota non-resident ATL: limited to ONE producer and ONE director per project, each capped at first $500K in wages.

---

## FLAG SYSTEM

### Red flags (critical)
- Indiana: non-transferable and non-refundable, zero value without state tax liability
- California: sunset date may have passed, verify program status
- California: competitive allocation, application does not guarantee approval
- Maryland: $500K cap disqualifies ENTIRE compensation
- Minnesota: non-resident ATL limited to one producer and one director only
- Turkey: all expenditures must be made AFTER application submission date
- Thailand: foreign workers excluded from qualifying spend
- Oklahoma: discretionary rebate, acceptance not guaranteed

### Yellow flags (warnings)
- Connecticut: theatrical feature films ineligible
- Tennessee: non-resident ATL/BTL only qualify for Scripted TV
- Washington: Reality TV and Docs are case-by-case
- Louisiana: loan-outs at base rate only
- South Korea: internal QPE percentage caps apply
- Maine: 5% spend credit has no value without Maine tax liability
- Tiered rate locations: confirm which tier applies
- Spain: July-only application window

### Blue flags (informational)
- Arizona: best buy-back rate in US dataset at 100%
- Louisiana: state buy-back at 90%
- Massachusetts: state buy-back at 90%
- Israel: 80% paid during filming, cash flow advantage
- Georgia: no project cap, no annual cap
- Ireland: up to 90% claimable mid-production
- British Columbia: highest effective rate in dataset at 46.2%
- Romania: 35% + 10% promotional uplift = 45% potential

---

## LOCATIONS REQUIRING "CONTACT FOR DETAILS" TREATMENT

These locations cannot be precisely calculated and should display a contact message instead of a dollar figure:
- United Kingdom (multiple sub-programs, different rates)
- Australia - New South Wales (rate not published)
- Australia - Northern Territory (fully discretionary)
- Australia - Western Australia (negotiated rate)
- Indiana (non-transferable, non-refundable)
- Oklahoma (discretionary)

---

## KNOWN LIMITATIONS TO DISPLAY IN UI

- UK rates require sub-program selection not yet implemented
- Indiana cannot be calculated (non-transferable, non-refundable)
- Oklahoma and Australia - Northern Territory are discretionary
- Australian Federal program rates not yet ingested
- Approximately 14 additional US states pending

---

*Update this file when: new locations are added, calculation logic changes, the frontend integration is completed, or the JSX-to-vanilla-JS conversion is done.*
