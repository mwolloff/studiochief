# StudioChief Domain Rules
## Production Finance Knowledge Base
*Built from Marc Walloff's domain expertise. Use these rules to train/prompt the AI.*

---

## BUDGET TOP SHEET RULES

### What to extract
- Extract ONLY individual department/account section lines from the top sheet
- Each valid section has its own unique account number (e.g. 100000, 140000)
- Skip any row whose label contains: Total, Subtotal, Grand Total, Above the Line, Below the Line
- Skip section group headers (EA, EB, ED, EE, etc.)

### Contractual Fees (bottom of top sheet)
- Always appear at the bottom of the budget top sheet
- Have NO line item account numbers — this is intentional, not an error
- The big four are: Production Company Fee, Format Fee, Agency Fee, Legal Fee
- Insurance (E&O) is also typically here
- These fee types can change budget to budget — do not assume they are always present
- Spread type for all contractual fees: FULL RUN (spread across entire production)
- Insurance/E&O: WEEK 1 (paid in first week only)
- Always include these even without account numbers — they are real budget lines

---

## PRODUCTION CALENDAR RULES

### Phase structure
- Phases are labeled week by week (e.g. "Casting - Week 1", "Casting - Week 2")
- Collapse all weekly bars of the same type into ONE phase entry
- Use the MONDAY of the first week as start date
- Use the FRIDAY of the last week as end date

### Phase overlapping
- Casting and Prep ALWAYS overlap — this is correct and expected
- Prep and Production overlap slightly (Load In begins before Prep ends) — correct
- Post begins during Production (Edit Week 1 starts during shoot) — correct
- Do NOT flag overlaps as errors

### Prep end date rule
- Prep runs until the week BEFORE the first Production activity (Load In, ESU, Rehearse, Shoot)
- Do not end Prep early just because Casting is still running
- Prep end ≈ Friday of the week before first Load In / ESU

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

### Section-to-spread mapping rules (general)
- Producers, showrunners, EPs → full
- Rights, clearances, research → prep
- Office staff, coordinators, accountants → prep_shoot
- Talent fees, host fees → shoot_plus2
- Talent travel → prep
- Prize money → production
- Stunts, extras → production
- Casting directors, talent bookers → casting
- Directors, field producers → shoot_plus2
- All camera crews/equipment → shoot_plus2
- Audio crews/equipment → shoot_plus2
- Grip, electric, lighting → shoot_plus2
- Art department, scenic → shoot_plus4
- Costume, wardrobe, makeup, hair → shoot_plus4
- Locations, craft service, catering → prep_shoot
- Transportation, vehicles → shoot_plus2
- Studio/field equipment rentals → shoot_plus4
- Production travel (airfare, hotel, per diem) → shoot_plus4
- Set construction, studio operations → shoot_plus4
- General & Administrative → full
- Production Co Fee, Format Fee, Agency Fee, Legal Fee → full
- Insurance, E&O → week1
- Post staff, editors → post_plus2
- Graphics, main titles → graphics
- Music → post
- Post finishing, color, mix → post
- Transcriptions → post
- Edit bays, post equipment → post
- Master/digital delivery → post

### Game show specific rules (to be expanded)
- Gaming electronics/control systems → production (game show shoot cost)
- Live audience costs → production
- Prize money → production
- Game props → production
- Audience PA systems → production

---

## STAIRCASE RULES

### Dynamic staircase
- The phase staircase in the Excel output reflects EXACTLY the phases the user has at generate time
- If user deletes Casting → no Casting bar in staircase
- If user adds "Run-Through Development" → that phase gets its own bar
- If user has 7 custom phases → 7 bars in the staircase
- The staircase is the user's truth, not the AI's suggestion

---

## VARIANCE REPORT RULES

### Hot Sheet color tiers (default threshold 10%)
- Red (31%+): Severely over budget
- Red-Orange (21-30%): Significantly over budget
- Orange (11-20%): Moderately over budget
- Yellow (1-10%): Slightly over budget
- Blue (10%+ under): Under budget
- No color: Within threshold

### Cost report parsing
- Split into two AI calls: above-the-line (EA) and below-the-line (EB/ED/EE)
- Skip grand totals and section subtotals in output
- Overages may be shown as NEGATIVE variance in some cost report formats
- Include ALL line items including zero-balance lines

