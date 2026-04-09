# TOOL1_CASHFLOW_RULES.md
# StudioChief — Cash Flow Generator Rules
# Last updated: April 9, 2026
# Paste this alongside CLAUDE_CONTEXT.md when working on Tool 1.

---

## WHAT THIS TOOL DOES

The Cash Flow Generator takes a production budget (uploaded as an Excel file) and a production calendar, then produces a week-by-week cash flow schedule showing when money is spent across the entire production. The output is a downloadable Excel file.

---

## BUDGET PARSING RULES

### What to extract from the top sheet
- Extract ONLY individual department/account section lines
- Each valid section has its own unique account number (e.g. 100000, 140000)
- Skip any row whose label contains: Total, Subtotal, Grand Total, Above the Line, Below the Line
- Skip section group headers (EA, EB, ED, EE, etc.)

### Contractual fees (bottom of top sheet)
- Always appear at the bottom of the budget top sheet
- Have NO line item account numbers. This is intentional, not an error.
- The big four: Production Company Fee, Format Fee, Agency Fee, Legal Fee
- Insurance (E&O) is also typically here
- These fee types vary budget to budget. Do not assume they are always present.
- Spread type for all contractual fees: FULL RUN
- Insurance/E&O specifically: WEEK 1 (paid in first week only)
- Always include these lines even without account numbers. They are real budget lines.

---

## PRODUCTION CALENDAR RULES

### Phase structure
- Phases are labeled week by week (e.g. "Casting - Week 1", "Casting - Week 2")
- Collapse all weekly bars of the same phase type into ONE phase entry
- Use the MONDAY of the first week as the phase start date
- Use the FRIDAY of the last week as the phase end date

### Phase overlapping
- Casting and Prep ALWAYS overlap. This is correct and expected.
- Prep and Production overlap slightly (Load In begins before Prep ends). This is correct.
- Post begins during Production (Edit Week 1 starts during shoot). This is correct.
- Do NOT flag overlaps as errors.

### Prep end date rule
- Prep runs until the week BEFORE the first Production activity (Load In, ESU, Rehearse, Shoot)
- Do not end Prep early just because Casting is still running
- Prep end = Friday of the week before first Load In / ESU

### Canonical phase mapping
- CASTING: Casting, Casting - Week N, Talent Search, Auditions, Callbacks
- PREP: Prep, Prep - Week N, Pre-Production, Office Open, Scout, Table Read
- PRODUCTION: Load In, ESU, Rehearse, Shoot, Shoot 101-320, Dark, Strike, Hiatus, Travel
- POST: Edit, Edit - Week N, Online, Color, Mix, Deliver, RC (Rough Cut), FC (Fine Cut), LC (Locked Cut), QC

---

## CASH FLOW SPREAD RULES

### Spread type definitions
- full: spans entire production (Week 1 through final delivery)
- week1: paid in first week only (bonds, some insurance, E&O)
- casting: spans casting period only
- prep: spans prep period only
- prep_shoot: starts in prep, runs through end of shoot
- production: spans production period only
- shoot_plus2: starts 2 weeks before shoot, runs through shoot end
- shoot_plus4: starts 4 weeks before shoot, runs through shoot end
- post: spans post production only
- post_plus2: starts 2 weeks before post, runs through post end
- graphics: split — half in production, half in post

### Section-to-spread mapping (general rules)
- Producers, showrunners, EPs: full
- Rights, clearances, research: prep
- Office staff, coordinators, accountants: prep_shoot
- Talent fees, host fees: shoot_plus2
- Talent travel: prep
- Prize money: production
- Stunts, extras: production
- Casting directors, talent bookers: casting
- Directors, field producers: shoot_plus2
- All camera crews/equipment: shoot_plus2
- Audio crews/equipment: shoot_plus2
- Grip, electric, lighting: shoot_plus2
- Art department, scenic: shoot_plus4
- Costume, wardrobe, makeup, hair: shoot_plus4
- Locations, craft service, catering: prep_shoot
- Transportation, vehicles: shoot_plus2
- Studio/field equipment rentals: shoot_plus4
- Production travel (airfare, hotel, per diem): shoot_plus4
- Set construction, studio operations: shoot_plus4
- General and Administrative: full
- Production Co Fee, Format Fee, Agency Fee, Legal Fee: full
- Insurance, E&O: week1
- Post staff, editors: post_plus2
- Graphics, main titles: graphics
- Music: post
- Post finishing, color, mix: post
- Transcriptions: post
- Edit bays, post equipment: post
- Master/digital delivery: post

### Game show specific rules
- Gaming electronics/control systems: production (game show shoot cost)
- Live audience costs: production
- Prize money: production
- Game props: production
- Audience PA systems: production

---

## STAIRCASE RULES

### Dynamic staircase (Excel output)
- The phase staircase in the Excel output reflects EXACTLY the phases the user has defined
- If user deletes Casting: no Casting bar in staircase
- If user adds a custom phase like "Run-Through Development": that phase gets its own bar
- If user has 7 custom phases: 7 bars in the staircase
- The staircase is the user's truth, not the AI's suggestion

---

## OUTPUT RULES

### Excel output structure
- Week-by-week columns across the top (one column per production week)
- Budget account rows down the left
- Each cell contains the dollar amount flowing in that week for that account
- Column B (account labels) needs to be wide enough to display full account names without truncation — this is a known TODO
- Staircase visualization at the top shows phase spans

### Spread reasoning documentation
- The reasoning for why each of the 40 budget accounts was assigned its spread type should be documented
- This is a known TODO, not yet complete as of April 2026

---

## KNOWN ISSUES / TODO

- Column B in Excel output needs to be wider to show full account names
- Spread rule reasoning for all 40 budget accounts needs to be documented
- Intelligent section-to-phase mapping rule set is planned: Marc will provide domain-specific rules (e.g. "gaming control = game show shoot cost") to improve AI spread assignments. Revisit after core rewrite is stable.

---

## BACKEND / API NOTES

- Tool 1 calls the Claude API to interpret the budget file and assign spread types
- The Claude prompt should receive the budget top sheet data + the spread rules above
- Output is generated server-side and returned as a downloadable Excel file
- Endpoint: /api/cashflow

---

*Update this file whenever new spread rules are established, new phase types are identified, output behavior changes, or known issues are resolved.*

---

## GLOBAL CURRENCY FORMATTING RULE (applies to all tools)

All currency inputs must use type="text" inputmode="numeric" with live comma formatting via the shared onCurrencyInput() utility. Never use type="number" for currency fields. Users must see commas as they type (e.g. 19,562,322 not 19562322). Parse raw values with parseCurrency() before calculations. This rule was established in v27 and applies to every tool going forward.
