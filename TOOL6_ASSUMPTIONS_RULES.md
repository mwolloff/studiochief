# TOOL6_ASSUMPTIONS_RULES.md
# StudioChief — Budget Assumptions Generator
# Rules, ingestion logic, and output standards
# Last updated: April 9, 2026

---

## WHAT THIS TOOL DOES

Reads an uploaded budget PDF and optional calendar PDF. Extracts relevant production information and generates a professional Budget Assumptions document in Word (.docx) format. The output is a curated, network-ready document — not a data dump. The user edits and fills in show-specific details before delivering to the network.

---

## CORE PHILOSOPHY

The assumptions sheet is not a line-item report. It is a professional narrative that:
- Tells the network what they need to know about how the budget was constructed
- Protects the production company by flagging what is outside budget or subject to change
- Avoids handing the network ammunition to argue about individual line items
- Uses dollar amounts only when they are meaningful, defensible, and useful to the network

**When in doubt, leave it out or use "included."**
**Never guess. Never invent a number. Never fabricate a position or rate.**
**If the budget doesn't support a statement, skip it or use a bracketed placeholder.**

---

## INPUTS

1. **Budget PDF** — Required. Can be a full budget or a top sheet. The level of detail in the output scales to the level of detail in the budget. A top sheet yields a higher-level document; a full budget yields more position and rate detail.

2. **Calendar PDF or schedule grid** — Optional. Used to extract total production weeks, shoot days, post weeks, and phase structure. If not provided, these fields get bracketed placeholders.

3. **Overall Show Specifics text box** — Optional free-text field in the UI. User types or pastes show-specific notes (talent deals, format specifics, creative decisions, anything not visible in the budget). AI bakes these into the Overall Show Specifics section verbatim.

---

## OUTPUT FORMAT

Word document (.docx). Clean, professional formatting. Show title and episode range as the document header. User edits in Word before delivering to network.

---

## DOCUMENT STRUCTURE

The output always follows this section order. Sections with no extractable data are omitted entirely unless they have a standard placeholder worth including.

### 1. DOCUMENT HEADER
Format: `Budget Assumptions`
Subheader: `[Show Title] [Episode Range] ([Format Length]) — $[Per-Episode Cost]/ep`

Example: `Budget Assumptions — The Chase 301-320 (x60) — $1,007,258/ep`

- Show title: pull from budget header
- Episode range: pull from budget header
- Format length: pull from budget (x30, x60, x90, etc.)
- Per-episode cost: calculate from total budget divided by episode count, or pull directly if visible
- If per-episode cost cannot be determined: omit it from the header, do not guess

---

### 2. OVERALL SHOW SPECIFICS

This section contains show-specific information that is NOT derivable from the budget. It is the most important section for the network.

**If the user provided text in the Overall Show Specifics text box:** Include their text verbatim as bullet points. Do not edit, reorder, or summarize it.

**If the user provided no text:** Include a single bracketed placeholder:
`[Add show-specific assumptions here — e.g., host fee outside budget, prize money structure, format notes, talent deal structure, creative decisions affecting the budget]`

**Do NOT attempt to generate Overall content from the budget.** This section requires human knowledge. The AI does not invent show-specific details.

Common things that belong in Overall (for user reference):
- Host/talent fee status (inside or outside budget)
- Prize money status (inside or outside budget, and amount if inside)
- Format assumptions (number of contestants, elimination structure, number of teams/chasers/pranks, etc.)
- Location assumptions (shooting city/country if not obvious)
- Audience included or not
- Any network-covered items (residuals, Covid, specific talent deals)
- Any items pending negotiation
- Season number assumptions if relevant (e.g., "assumes reuse of S1 graphics")

---

### 3. FEES

Pull from the budget. List only fees that appear in the budget.

**If a percentage is visible:** List it.
- `Prod Co Fee — 10%`
- `Legal Fee — 1.5%`
- `Agency Package Fee — 3%`
- `Format Fee — 5%` (if present)
- `Insurance Fee — 1%` (if listed as a percentage fee, not a line item)

**If only a dollar amount is visible, no percentage:** Say "included."
- `Prod Co Fee — included`
- `Legal Fee — included`

**Do not calculate a percentage from a dollar amount.** If you can't see the percentage, don't list one.

---

### 4. UNIONS

List only the unions that appear in the budget fringe lines or are explicitly named. Do not list unions that are not present.

Format: simple bullet list.
- IATSE
- DGA
- SAG-AFTRA
- WGA
- Teamsters

**If no unions are present:** `Non-Union`

**Do not include a union just because it's common for this type of production.** Only list what the budget supports.

---

### 5. PRODUCTION STAFF

List staff positions visible in the budget. Group logically. Include rates only when they are prominent, clearly episodic, and meaningful to the network (e.g., EP rate, Director rate). Do not list every rate.

**Rate format:** `EP — $25,000/ep` or `EP — $60,000/ep`

**Grouping guidance:**
- List senior creative staff (EP, Co-EP, Showrunner, EIC) first, with rates if visible
- Then mid-level (Supervising Producers, Line Producer, Production Manager) — rates optional
- Then support staff as a grouped list without individual rates (Production Coordinator, APOC, PA, Production Accountant, Assistant Accountant, Payroll Clerk)

**Do not:** List every single staff position as a separate bullet with granular detail unless the budget clearly supports it and it adds value for the network.

---

### 6. TALENT

This section requires judgment. Read the budget carefully.

**If talent (host, cast, contestants) has a dollar amount in the budget:**
State it clearly: `Host — $X/ep` or `Contestants — $X/wk stipend`

**If a talent line exists but is zero or marked outside budget:**
`Host — outside budget` or `Talent — outside budget`

**Prize money:** Same treatment.
- If prize money is a line item with a dollar amount: `Prize Money — $X/ep`
- If zero or outside budget: `Prize Money — outside budget`
- If prize money is not mentioned anywhere: omit entirely

**Background checks, psych evaluations, medical:**
If present as line items, include: `Background checks included` / `Psychological evaluations included` / `Medical included`
If not present, omit.

**Contestant stipend:** If visible, include with amount.

**Do not:** Invent talent names. Do not say "Host fee — outside budget" if no host line exists at all. Only flag what the budget shows.

---

### 7. CREW

List crew positions visible in the budget. Scale to the detail level of the budget.

**Grouping approach:**
- Camera, Audio, Lighting/Electric, Grip, Art/Production Design, Hair/Makeup/Wardrobe, Transportation, Craft Service, Medic/Safety as department groups
- Within each group, list positions. Combine multiples: `Cam Ops x 8` not eight separate lines.
- Drop phase-level detail (not "Cam Ops x 3 — Field Pranks" and "Cam Ops x 2 — Stage" — just `Cam Ops x 5` or list them simply)
- Director rate is worth calling out if episodic: `Director — $20,500/ep`

**If budget is a top sheet with no crew detail:** Omit the crew section entirely or note `[Crew detail not available from top sheet — add if needed]`

---

### 8. STUDIO / SET EQUIPMENT

List major equipment packages included in the budget. Dollar amounts only for significant flat or weekly line items. Common items:

- `Control Room / Truck — included`
- `Lighting — $X/wk` (include weekly rate if visible and significant)
- `Gaming Electronics — included`
- `Grip Package — included`
- `RF/PL/PA Package — included`
- `LED Screen Rental, Trucking, Install, Strike — included`
- `Teleprompter — included`

**Omit** minor equipment that is standard and expected.

---

### 9. SET OPERATIONS

Call out significant set costs with dollar amounts. Use judgment about what the network needs to see.

**What to include with dollar amounts:**
- Set construction flat fee if it's a significant number: `Set Construction — $150,000/flat`
- LED screens if broken out separately and significant: `LED Video Screens — $X/wk`
- Location fees if notable: `Location Fees — $25,000/wk` or `Location Fees — included`
- Specific set design costs if itemized and meaningful (e.g., "Guest Room Set Design — 13 rooms")

**What to just say "included":**
- Rigging and scaffolding
- Standard lighting
- On-set compliance
- Stage fees if not broken out

**Do not:** List every single set operation line item with its dollar amount. Pick the ones that tell a story or protect the production company.

---

### 10. INSURANCE

Keep this simple. Do not over-specify.

Standard line: `Production insurance included`

If E&O is broken out as a separate significant line item with a note worth flagging: `Production insurance and E&O included`

Do not include AD&D or other specialty items unless they are explicitly listed with a significant dollar amount and the production company wants the network to see it. When in doubt, omit.

---

### 11. POST STAFF

List post staff positions visible in the budget. Same grouping logic as production staff.

Common positions to list:
- Post EP / Post Co-EP (with rate if visible and episodic)
- Post Supervising Producer
- Post Producer
- Story Producers / Story APs (note if they carry through from field)
- Post Production Supervisor
- Post Coordinator / Post Manager
- Post PA
- AEs (note day/night split if visible)

---

### 12. POST SCHEDULE

**Offline edit weeks per episode:** Try to extract from budget (look for editor weeks divided by episode count, or explicit offline week notation). If found: `Offline Edit — X weeks/episode`

**If not determinable from budget or calendar:** Use placeholder: `[Offline edit weeks — please verify]`

**Note turnaround:** If explicitly listed in budget, include:
- `RC — 48 hours`
- `FC — 24 hours`
- `LC — No new notes (technical pass only)`

If not listed: omit entirely. Do not guess note turnaround structure.

---

### 13. GRAPHICS AND MUSIC

**Graphics:** If a flat fee is visible: `Graphics Package — $X/flat` or `Graphics — $X/flat (refresh)`
If graphics are described as a reuse from prior season: `Graphics — assumes reuse of Season X package, $X budgeted for updates`
If no graphics line: omit.

**Original Theme Music:** If a flat fee is visible: `Original Theme — $X/flat`
If reuse assumed: `Original Theme — assumes reuse of existing theme`

**Music Library:** Always just say: `Music Library — included`
Do not include the per-episode dollar amount. Ever. No reason to give the network that number.

---

### 14. FORCE MAJEURE

Always include this section as the final line of the document. One line only:

`Any production delays or additional costs resulting from a force majeure event, including government-mandated shutdowns or other unforeseen circumstances beyond the production's control, will be addressed in good faith with the network at the time of occurrence.`

Do not use Covid-specific language. Do not include the old multi-bullet pandemic boilerplate.

---

## TOP SHEET VS FULL BUDGET

The AI should detect which type of document was uploaded and respond accordingly.

**How to tell the difference:**
- A full budget has individual position lines, weekly rates, fringe calculations, and department-level detail
- A top sheet has summary section totals only — Above the Line total, Below the Line total, Post total, etc. — with little or no line-item detail

**If a full budget is uploaded:** Generate the full assumptions sheet as described in this document.

**If a top sheet is uploaded:** Generate a simplified assumptions sheet and surface a note to the user before or after generating:

"This looks like a top sheet rather than a full budget. I've generated a high-level assumptions sheet, but sections including crew positions, post schedule detail, and specific rates could not be populated. You'll want to fill those in manually."

**What a top sheet CAN support:**
- Header (show title, episode count, format length, per-episode cost)
- Overall Show Specifics (user-provided text)
- Fees (if listed as percentages in the top sheet header)
- Insurance (standard line)
- Force majeure (standard line)
- High-level production scale inferences (useful for the AI to calibrate tone, not to be listed as assumptions)

**What a top sheet CANNOT support:**
- Individual crew or staff positions
- Specific rates beyond the header
- Union identification (unless fringe categories are clearly labeled)
- Post schedule detail
- Equipment package detail
- Set operations detail

**In top sheet mode:** Use bracketed placeholders for sections that can't be populated, rather than omitting them entirely, so the user knows exactly what to fill in:
- `[Production Staff — add key positions and rates here]`
- `[Crew — add key crew positions here]`
- `[Unions — add applicable unions here]`
- `[Post Schedule — add offline weeks and note turnaround here]`
- `[Set Operations — add major set costs here]`

---

## WHAT THE AI SHOULD NEVER DO

- Invent talent names, rates, or deal structures not visible in the budget
- Calculate a fee percentage from a dollar amount
- List a union not present in the fringe lines
- Include the music library dollar amount
- Include lighting costs as a dollar amount unless it's a very significant and prominent weekly number
- List AD&D or specialty insurance items unless explicitly prominent
- Generate Overall Show Specifics content from the budget
- Include Covid boilerplate language
- Over-itemize crew with phase-level detail
- Guess at offline edit weeks or note turnaround structure if not clearly stated

---

## BRACKETED PLACEHOLDERS — STANDARD SET

Use these exactly when information cannot be determined:

- `[Add show-specific assumptions here]` — Overall section when user provides nothing
- `[Offline edit weeks — please verify with post producer]` — when post schedule unclear
- `[Note turnaround structure — please verify]` — when notes tiers not listed
- `[X weeks total production — verify against calendar]` — when week count uncertain
- `[X weeks post — verify]` — when post weeks uncertain

---

## UI DESIGN NOTES (for when tool is built)

**Inputs:**
- Budget PDF upload (required)
- Calendar PDF or schedule grid upload (optional)
- Overall Show Specifics text box — label: "Overall Show Specifics (optional)" with helper text: "Add show-specific notes here — talent deal structure, format details, anything not in the budget. These will appear at the top of your assumptions sheet."

**Pre-generation flags (light version):**
After reading the budget, surface 1-3 quick flags before generating. Examples:
- "I don't see a talent/host line item in this budget — should I note 'Host — outside budget' in the assumptions?"
- "I see prize money listed at $X/ep — should I include this amount or note it as outside budget?"
- "I couldn't determine offline edit weeks from this budget — do you want to add them before I generate?"

These are simple yes/no or fill-in prompts, not a full questionnaire.

**Output:**
Word (.docx) file download. Filename format: `[ShowTitle]_[EpisodeRange]_BudgetAssumptions.docx`

---

## SAMPLE SECTION OUTPUT (for AI reference)

```
Budget Assumptions
The Chase 301-320 (x60) — $1,007,258/ep

Overall Show Specifics:
[Add show-specific assumptions here — e.g., host fee outside budget, prize money structure, 
format notes, number of contestants per episode, any items covered by network]

Fees:
- Prod Co Fee — 10%
- Legal Fee — 1.5%
- Agency Package Fee — 3%
- Format Fee — 5%

Unions:
- IATSE
- DGA
- SAG-AFTRA
- WGA

Production Staff:
- EP — $60,000/ep
- Co-Executive Producer
- Supervising Producers x 3
- Head Content Producer
- Content Producers x 12
- Line Producer
- Production Manager, Assistant Production Manager x 2
- APOC, Travel Coordinator, Travel Assistant
- Production Accountant, Assistant Accountant, Payroll Clerk

Talent:
- Host — outside budget
- Announcer — included
- Contestants — background checks included

Crew:
- Director — $20,500/ep
- Tech Supervisor, Tech Director, Associate Director
- Stage Managers x 3
- Cam Ops x 8, Jib, Robo, Steadicam
- Audio Supervisor, Production Mixer, A2 x 3
- Lighting Designer, Gaffer, Electricians x 15
- Key Grip, Grips x 20
- Production Designer, Art Director, Set Dresser
- Makeup x 3, Hair x 3, Costume Designer

Studio / Set Equipment:
- Control Room included
- Lighting — $90,000/wk
- Gaming Electronics included
- Grip, RF/PL/PA Package included
- LED Screen Rental, Trucking, Install, Strike included

Set Operations:
- Set Construction — $150,000/flat (refurbish)
- Rigging and Scaffolding included
- Location Fees included
- On-Set Compliance included

Insurance:
- Production insurance included

Post Staff:
- Post Producers x 3
- Post AP, Post Supervisor, Post Coordinator, Post PA

Post Schedule:
- Offline Edit — [X weeks/episode — please verify]
- RC — 48-hour turnaround
- FC — 24-hour turnaround
- LC — No new notes (technical pass only)

Graphics and Music:
- Graphics Package — $5,000/flat (refresh)
- In-Show Graphics — $5,000/flat (refresh)
- Custom Theme — $5,000/flat
- Music Library — included

Any production delays or additional costs resulting from a force majeure event, including 
government-mandated shutdowns or other unforeseen circumstances beyond the production's 
control, will be addressed in good faith with the network at the time of occurrence.
```

---

*Update this file when new assumption sheet examples are reviewed or when output standards change.*
