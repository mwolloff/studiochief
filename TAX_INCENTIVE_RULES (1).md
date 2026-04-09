# StudioChief Tax Incentive Calculator — Rules, Reasoning & Design Decisions

**Version:** 1.0.0  
**Created:** April 9, 2026  
**Data Source:** Entertainment Partners (EP) incentive guides  
**Data Date:** 03/08/2026 – 03/09/2026  
**Total Locations:** 46 (as of this version)

---

## PURPOSE OF THIS DOCUMENT

This document captures every assumption, calculation rule, design decision, and nuance embedded in the StudioChief Tax Incentive Calculator. It is the "brain" of the tool. Any developer, any future AI assistant, or any new collaborator should read this document before touching the code or data.

---

## PART 1: CORE DESIGN DECISIONS

### 1.1 Production Type Is Required Upfront

The user must select their production type before picking locations or entering spend. This is non-negotiable.

**Why:** Several locations restrict eligibility or change rates based on production type:
- Tennessee: Non-resident ATL and BTL only qualify for Scripted TV
- Washington: Reality TV and Documentaries are case-by-case only
- California: Reality TV is ineligible
- Connecticut: Theatrical feature films are ineligible (moratorium since 2017)
- Norway: Only Docs, Feature Films, and Scripted TV are eligible
- Turkey/Thailand: Narrow eligible type lists

Without knowing production type upfront, the tool cannot accurately calculate or even know which locations are valid options.

**Production types in the selector:**
- Feature Film
- Scripted Television
- Reality Television
- Unscripted / Non-Scripted Television
- Documentary
- Game Show
- Animation
- Commercial
- Pilot
- Post Only
- Talk Show
- Video Game

### 1.2 Location Comparison: Up to 3 Locations at Once

The user selects up to 3 locations to compare side by side, matching the model from Marc's original spreadsheet (LA vs. Atlanta vs. Las Vegas).

### 1.3 Spend Buckets Are Dynamic Based on Location Selection

The spend input form dynamically generates buckets based on the union of all buckets required across the selected locations. The location requiring the most granular breakdown drives the bucket list.

**Example:** If a user picks Nevada (6 buckets), Georgia (simplified), and Ireland (all-in), the form shows Nevada's 6 buckets. Georgia applies its flat rate across all of them. Ireland applies its rate to the total.

**Flat-rate states:** If a location applies one rate across all spend categories (e.g., Georgia at 20% + 10% logo across everything), the tool should display the buckets but note clearly: "Georgia applies a flat rate across all qualifying spend categories."

**If user enters only one number:** If the user picks a location requiring multiple buckets but only enters a single lump sum, the tool flags this: "This location requires spend broken into [X] categories to calculate accurately. Here are the buckets — can you break this down?"

### 1.4 The 85-Cent Default

For transferable tax credits where no specific state buy-back or market rate is known, the tool applies a default monetization rate of **85 cents on the dollar (0.85)**.

**Exceptions — use these specific rates instead:**
- Arizona: 1.00 (state buys back at 100% of face value after tax liability)
- Louisiana: 0.90 (state buy-back at 90%, 0.88 after 2% transfer fee)
- Massachusetts: 0.90 (state buy-back at 90% after satisfying tax liabilities)
- Rebates (any location): 1.00 (paid directly, no sale needed)
- Grants (any location): 1.00 (paid directly, no sale needed)
- Refundable credits (any location): 1.00 (paid directly)

**Indiana exception:** Non-transferable AND non-refundable — the tool should NOT apply any monetization calculation. Instead flag: "This credit has no value unless your production company has Indiana state tax liability. Consult your tax advisor."

**Maine exception:** Dual program. Wage rebate component uses 1.00. The 5% spend credit uses 0.00 unless company has Maine tax liability — flag accordingly.

### 1.5 The Output Always Shows Its Work

The output panel for each location must display:
1. Gross incentive value (before monetization)
2. Monetization rate applied and why
3. Net incentive value after monetization
4. Any contingency deduction (default 10% per Marc's spreadsheet model)
5. Audit fees line (if applicable)
6. All assumptions listed explicitly so the output is auditable

### 1.6 Data Timestamp Is Always Displayed

Every output must show: "Data sourced from Entertainment Partners, [date]." This is not optional. Incentive rates change. Users must know the data age.

---

## PART 2: INCENTIVE TYPE TAXONOMY

Not all incentives work the same way. The tool must handle each type correctly.

| Type | Monetization | Examples |
|------|-------------|---------|
| Refundable Tax Credit | 1.00 | Alabama, Colorado, Hawaii, Kentucky |
| Transferable Tax Credit | 0.85 default | Georgia, Connecticut, Minnesota, Puerto Rico |
| Refundable + State Buy-Back Known | Specific rate | Arizona (1.00), Louisiana (0.90), Massachusetts (0.90) |
| Rebate | 1.00 | Louisiana rebate track, Washington, Oklahoma, Ireland, France, Greece, Romania |
| Grant | 1.00 | Tennessee, Texas, Norway, Australia states |
| Non-Transferable / Non-Refundable | Flag only — no calculation | Indiana |
| Dual Program (stacked) | Varies per component | Maine |
| Stacked Provincial + Federal | 1.00 refundable | Quebec (37% effective), British Columbia (46.2% effective) |
| Discretionary | Flag only — no precise calculation | Oklahoma, Australia - Northern Territory |

---

## PART 3: CALCULATION RULES BY LOCATION QUIRK

### 3.1 Tiered Rate Locations

These locations apply different rates based on total qualified spend level. The tier determines the rate for the ENTIRE project — it is not a marginal rate system.

**Arizona:**
- Under $10M total qualified spend → 15%
- $10M–$35M → 17.5%
- $35M+ → 20%
- Note: Headline of 27.5% implies an undocumented uplift — verify with AZ Film Office.

**Connecticut:**
- $100K–$499K → 10%
- $500K–$999K → 15%
- $1M+ → 30%

**Texas:**
- $250K–$999K → 5%
- $1M–$3.49M → 10%
- $3.5M+ → 20%
- Note: Three additional 2.5% stackable uplifts (see Section 3.5)

**South Korea:**
- 50M KRW min + 3 filming days → 25%
- 2B KRW min + 10 filming days → 30%

### 3.2 Island/Region-Dependent Rates

**Hawaii:** 22% Oahu, 27% Neighbor Islands. Prompt user: "Where in Hawaii is production filming?"

**Spain:** 30% on first €1M of local spend by a foreign shoot, 25% thereafter. Split calculation at the €1M mark.

### 3.3 The Stacked Canadian Federal + Provincial Calculation

Both Quebec and British Columbia stack their provincial incentive with Canada's Federal Tax Incentive (16% on qualifying Canadian labour net of assistance).

**Important:** The federal 16% applies to qualifying Canadian labour **net of** the provincial assistance. "Assistance" includes any provincial incentives directly attributable to qualifying labour spend. So the stacking is not simply additive.

- Quebec: 25% provincial on qualifying labour. Federal 16% on net qualifying labour (after reducing by provincial labour assistance). Effective combined rate ≈ 37%.
- BC: 36% provincial on qualifying BC labour. Federal 16% on net qualifying labour. Effective combined rate ≈ 46.2%.

For calculation purposes, use the published effective rates (37% and 46.2%) and flag that these are labour-only credits, not general spend credits.

### 3.4 South Africa's Two-Rate Spend Structure

South Africa has two distinct spend buckets at different rates:
- Production spend (QSAPE): 25%
- Post-production spend (QSAPPE): 20%

The tool must collect these as two separate spend inputs for South Africa and apply the correct rate to each.

### 3.5 Louisiana's Loan-Out Labor Uplift Nuance

Louisiana's 15% labor uplift (bringing base 25% to max 40%) applies to **individuals only**. Loan-outs stay at the base 25% rate and do not qualify for the uplift.

If user indicates they pay talent through loan-outs, the tool should apply 25% (not 40%) to that labor and flag: "Loan-outs in Louisiana qualify at the base 25% rate only. The 15% labor uplift does not apply to loan-outs."

### 3.6 Maryland's Hard Compensation Disqualification

Maryland's $500K compensation cap works differently from most states. When an individual's total compensation reaches $500K, their **entire compensation** is disqualified — not just the portion above $500K.

This must be flagged prominently: "If any individual's compensation reaches $500K, their entire compensation is removed from qualifying spend — not just the overage."

### 3.7 Minnesota's Non-Resident ATL Restriction

Minnesota restricts non-resident ATL to:
- ONE non-resident producer per project (or per episode if episodic)
- ONE non-resident director per project (or per episode if episodic)
- Each capped at first $500K in wages
- Total non-resident ATL cap: $1M
- If a person holds more than one ATL role, they only qualify once

This is the most granular ATL rule in the dataset. The tool must surface it clearly.

### 3.8 Greece's Percentage-Based ATL Cap

Greece caps ATL compensation at 35% of eligible Greek spend — not a fixed dollar amount. This means the ATL cap scales with production size. Calculate: ATL cap = total eligible Greek spend × 0.35.

### 3.9 Spain's Tiered Calculation

For Spain, the tool must:
1. Take first €1M of qualifying local spend → apply 30%
2. Take remaining qualifying local spend above €1M → apply 25%
3. Sum both figures for gross incentive value

### 3.10 Maine's Dual Program

Maine has two separate incentives that stack:
1. **5% non-refundable, non-transferable tax credit** on production expenses — only valuable if production company has Maine tax liability
2. **Wage Rebate**: 12% for residents, 10% for non-residents — paid directly as a rebate

The tool should calculate both and display them separately, with a clear note on the spend credit limitation.

### 3.11 Turkey's Retroactivity Rule

In Turkey, all expenditures must be made **after** the date of application submission. Costs incurred before submission are not eligible. The tool must flag: "Qualifying expenditures in Turkey START from the date your application is received. Do not incur production costs in Turkey before submitting your application."

### 3.12 South Korea's Internal QPE Caps

South Korea imposes internal caps within the qualifying spend definition:
- Post-production costs OR labor costs for cast/crew may not exceed **50% of total QPE**
- Total costs for main cast may not exceed **30% of total labor costs**

If user's entered numbers violate these thresholds, the tool must flag: "Your entered spend exceeds South Korea's internal QPE limits. The qualifying amount has been adjusted."

---

## PART 4: UPLIFT/CONDITION PROMPTS

These are the interactive questions the tool asks to determine whether uplifts apply. Each should feel conversational, not bureaucratic.

| Location | Uplift | Prompt |
|----------|--------|--------|
| Georgia | 10% logo | "Will this production include the Georgia promotional logo or end title credit?" |
| Tennessee | 5% logo (scripted TV only) | "Is this a scripted TV project that will include the Filmed in Tennessee logo?" |
| Louisiana | 15% labor uplift | "Does this production qualify for the Louisiana resident labor uplift? (Note: loan-outs do not qualify.)" |
| Louisiana | 5% VFX | "Does this production have qualifying VFX spend in Louisiana?" |
| Colorado | 2% rural | "Is this production filming in a rural community or marginalized urban center in Colorado?" |
| Kentucky | 5% rural zone | "Is this production filming in a designated Kentucky rural or incentive zone?" |
| Hawaii | Island uplift | "Where in Hawaii is this production filming? (Oahu = 22%, Neighbor Islands = 27%)" |
| Washington | 5% episodic | "Is this an episodic series with at least 6 episodes?" |
| Washington | 10% rural/underrepresented | "Is this production filming in a Washington rural county OR telling the story of a historically underrepresented community?" |
| Texas | 2.5% rural | "Will at least 25% of this production occur in a designated Texas rural or incentive area?" |
| Texas | 2.5% veterans | "Will at least 5% of total paid crew and cast (including extras) be Texas Resident Veterans?" |
| Texas | 2.5% post | "Will at least 10% of total eligible in-state spending be on qualified post-production costs?" |
| Maryland | 2% TV series | "Is this production a TV series?" (Applied automatically if yes) |
| France | 10% VFX | "Does this production have more than €2M in VFX-related eligible French expenses?" |
| Malaysia | 5% cultural | "Does this production expect to pass the Malaysia Cultural Test?" |
| Philippines | 5% cultural | "Does this production expect to pass the Philippines Cultural Test?" |
| Romania | 10% promotional | "Does this project explicitly promote Romania — its country, regions, cities, or landmarks?" |
| New Zealand | 5% economic benefit | "Does this production meet the criteria for significant economic benefit to New Zealand?" |
| Quebec | 16% animation/VFX labour | "Does this production have qualifying animation or special effects Quebec labour?" |

---

## PART 5: MANDATORY FLAGS PER LOCATION

These are alerts the tool must surface in the output panel regardless of what the user enters. They are not optional.

### Critical Flags (show in red)
- **Indiana:** Non-transferable and non-refundable — zero value without Indiana tax liability
- **California:** Sunset date may have passed (June 30, 2025) — verify program status
- **California:** Competitive allocation — application does not guarantee approval
- **Maryland:** $500K compensation cap disqualifies ENTIRE compensation — not just overage
- **Minnesota:** Non-resident ATL limited to one producer and one director only
- **Turkey:** All expenditures must be made AFTER application submission date
- **Thailand:** Foreign workers are EXCLUDED from qualifying spend
- **Oklahoma:** Discretionary rebate — acceptance not guaranteed

### Warning Flags (show in yellow)
- **Connecticut:** Theatrical feature films ineligible
- **Tennessee:** Non-resident ATL/BTL only qualify for Scripted TV
- **Washington:** Reality TV and Docs are case-by-case
- **Louisiana:** Loan-outs qualify at base rate only — uplift does not apply
- **South Korea:** Post and cast labor subject to internal QPE percentage caps
- **Greece:** Eligible costs may not exceed 80% of total costs
- **Morocco:** Eligible expenses may not exceed 90% of total budget invested in Morocco
- **Norway:** Must have 30% international financing and documented distribution agreement
- **Spain:** July-only application window, year after filming
- **Maine:** 5% spend credit has no value without Maine tax liability
- **Colorado/Texas/Arizona/South Korea/Connecticut:** Tiered rate — confirm which tier applies
- **Arizona:** Reported 27.5% headline — verify undocumented uplift with AZ Film Office
- **UK:** Complex multi-program structure — sub-program PDFs needed for precise calculation

### Informational Flags (show in blue)
- **Arizona:** Credits cash out at 100% with state — best buy-back rate in US dataset
- **Louisiana:** State buy-back at 90% — better than open market default
- **Massachusetts:** State buy-back at 90% — better than open market default
- **Israel:** 80% of rebate paid during filming — cash flow advantage
- **Georgia:** No project cap, no annual cap — very production-friendly
- **Ireland:** Up to 90% of credit claimable mid-production
- **British Columbia:** Highest effective rate in dataset at 46.2%
- **Romania:** 35% base + 10% promotional uplift = 45% potential
- **Puerto Rico:** Non-residents become residents after 183 days

---

## PART 6: CURRENCY HANDLING

International locations use non-USD currencies. The tool must:

1. Display minimums and caps in their native currency
2. Show a USD equivalent using current exchange rate (fetched or user-entered)
3. Note clearly: "Exchange rate as of [date] — rates fluctuate and may affect incentive value"
4. Never hard-code exchange rates — they must be updateable

**Currencies in dataset:**
- USD: Alabama, Arizona, Arkansas, California, Colorado, Connecticut, Georgia, Hawaii, Indiana, Kentucky, Louisiana, Maine, Maryland, Massachusetts, Minnesota, Nevada, Oklahoma, Puerto Rico, Tennessee, Texas, Washington, UAE - Abu Dhabi
- CAD: British Columbia, Quebec
- AUD: Australia states
- EUR: France, Greece, Ireland, Romania, Spain
- GBP: United Kingdom
- KRW: South Korea
- MYR: Malaysia
- NOK: Norway
- NZD: New Zealand
- PHP: Philippines
- THB: Thailand
- TRY: Turkey
- NIS: Israel
- ZAR: South Africa
- MAD: Morocco

---

## PART 7: LOCATION COMPLEXITY TIERS

For tool-building purposes, locations fall into three tiers of calculation complexity.

### Tier 1 — Simple (flat rate, standard buckets)
Georgia, Puerto Rico, Ireland, Morocco, Norway, South Africa (two-bucket but defined)

### Tier 2 — Moderate (uplifts, conditional rates, or special caps)
Alabama, Colorado, Hawaii, Kentucky, Louisiana, Maryland, Massachusetts, New Zealand, Philippines, Quebec, Romania, Tennessee, Washington, Malaysia, France, Greece, Turkey

### Tier 3 — Complex (tiered rates, internal caps, stacked programs, or discretionary)
Arizona, British Columbia, California, Connecticut, Indiana (no-calc), Maine (dual), Minnesota, Nevada, Oklahoma (discretionary), South Korea, Spain, Texas, UK (multi-program), Australia states (contact-for-details), Israel

---

## PART 8: LOCATIONS REQUIRING "CONTACT FOR DETAILS" TREATMENT

These locations cannot be precisely calculated from available data and should display a contact-for-details message rather than a dollar figure:

- **United Kingdom:** Multiple sub-programs with different rates — direct user to British Film Commission
- **Australia - New South Wales:** Rate not published in EP PDF
- **Australia - Northern Territory:** Fully discretionary rate
- **Australia - Western Australia:** Negotiated rate (minimum 10%)
- **Indiana:** Non-transferable, non-refundable — no calculable value without tax liability data
- **Oklahoma:** Discretionary — no guaranteed calculation

---

## PART 9: LOCATIONS PENDING (NOT YET IN DATASET)

The following locations were referenced but not yet ingested as of this version. Add them to `incentives_data.json` when PDFs are available:

**US States pending:**
- Missouri, New Mexico, New York, North Carolina, Ohio, Oregon, Pennsylvania, Rhode Island, South Carolina, Utah, Vermont, Virginia, Wisconsin, Wyoming
(approximately 14-16 additional US states)

**Sub-programs pending (related programs referenced in EP data):**
- Georgia - Savannah
- Louisiana - Jefferson Parish
- Spain - Canary Islands, Navarre, Biscay
- UK - Feature Films, Independent Films, High End TV, Children's TV and Animation
- Israel - Jerusalem
- Oklahoma City, Cherokee Nation
- Minnesota - St Louis County
- California - Feature Films, Independent Films, TV Projects, Relocating TV, San Francisco, Santa Clarita, Shasta County
- Australia - Federal (referenced by all Australian state entries)

---

## PART 10: THE OUTPUT STRUCTURE

Every calculation output must follow this structure (mirroring Marc's spreadsheet model):

```
LOCATION NAME
─────────────────────────────
Pre-Incentive Budget:         $X,XXX,XXX

QUALIFIED SPEND BREAKDOWN
  Resident ATL:               $XXX,XXX  ×  XX%  =  $XX,XXX
  Resident BTL:               $XXX,XXX  ×  XX%  =  $XX,XXX
  Non-Resident ATL:           $XXX,XXX  ×  XX%  =  $XX,XXX
  Non-Resident BTL:           $XXX,XXX  ×  XX%  =  $XX,XXX
  Qualifying Spend:           $XXX,XXX  ×  XX%  =  $XX,XXX

Total Qualified at Rates:     $X,XXX,XXX

Less 10% Contingency:        ($XXX,XXX)
Revised Qualified Spend:      $X,XXX,XXX

Incentive Type:               [Refundable Credit / Rebate / Grant / Transferable Credit]
Monetization Rate:            XX cents on dollar  (reason)
Gross Incentive Value:        $X,XXX,XXX
[Less Audit Fees if applicable: ($XX,XXX)]
Net Incentive Value:          $X,XXX,XXX

Revised Budget After Incentive: $X,XXX,XXX

ASSUMPTIONS
  ✓ [List all uplifts applied or not applied]
  ✓ [Monetization rate and reason]
  ✓ [Any caps applied]
  ✓ Data date: [date]

FLAGS
  🔴 [Any critical flags]
  🟡 [Any warning flags]
  🔵 [Any informational flags]
```

---

## PART 11: ADDING NEW LOCATIONS

To add a new location to the tool:

1. Open `incentives_data.json`
2. Add a new entry to the `locations` array following the existing schema
3. Required fields: `id`, `name`, `country`, `region`, `currency`, `data_date`, `incentive_type`, `monetization_rate`, `monetization_note`, `headline_rate`, `eligible_production_types`, `buckets`, `minimums`, `caps`, `flags`
4. Update the `meta.version` field
5. If the location has uplifts, add them to the `uplifts` array with a `prompt` field for the UI to display
6. Add any mandatory flags to the `flags` array
7. Rebuild the app — the location will appear automatically in the selector dropdown

---

## PART 12: UPDATING EXISTING LOCATIONS

When a state or country changes its rates or rules:

1. Update the relevant entry in `incentives_data.json`
2. Update the `data_date` field for that location
3. Update the `meta.version` field
4. Note the change in a changelog (maintain `CHANGELOG.md` separately)
5. If the change affects the calculation logic (not just rates), update this rules document too

---

## PART 13: KNOWN DATA GAPS AND ITEMS TO VERIFY

The following items were not fully resolved from the EP PDFs and should be verified with the relevant film offices:

| Location | Gap |
|----------|-----|
| Arizona | What is the undocumented uplift that produces the 27.5% headline? |
| Nevada | Non-Resident BTL rate not listed in PDF |
| Oklahoma | Non-Resident ATL rate not listed in PDF |
| Texas | Non-resident ATL and BTL rates not listed |
| Washington | Non-Resident ATL rate not listed |
| Indiana | Specific application window dates |
| Tennessee | Annual funding amount — determined annually |
| Turkey | Non-resident labor rates not specified |
| Australia Federal | Full rates and rules not yet ingested |
| UK sub-programs | Full rates and rules not yet ingested |

---

*End of Rules Document — Version 1.0.0*
*This document should live in the StudioChief GitHub repository alongside `incentives_data.json`*
