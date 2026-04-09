# TOOL5_TAX_INFO_RULES.md
# StudioChief — Tax Incentive Information Rules
# Last updated: April 9, 2026
# Paste this alongside CLAUDE_CONTEXT.md when working on Tool 5.

---

## CURRENT STATUS

Not yet built. This file captures the design intent so development can begin cleanly.

---

## WHAT THIS TOOL DOES

A reference tool where users pick one state or country at a time and get the complete incentive information for that location — not a calculator, but a deep reference. The goal is to replace visits to film commission websites, EP guides, and Cast & Crew summaries with one clean, always-current source.

---

## CORE DESIGN DECISIONS

### One location at a time (not side-by-side)
Tool 4 (calculator) is built for comparison. Tool 5 is built for depth. One location gets the full screen. This makes room for the full detail without cramping.

### Two data levels
- **Summary level**: what we already have from EP guides — rates, eligibility, caps, uplifts, flags. All 46 current locations have this.
- **Detailed level**: full state/country PDF ingested — application windows, exact deadlines, film office contacts, full rule text, sample timelines. As Marc feeds PDFs, locations upgrade from summary to detailed.

### Data completeness is always visible
Every location shows a "Last Updated" badge and a data level indicator (Summary / Detailed). Users know exactly how fresh and complete the information is.

---

## LAYOUT

- Search/filter bar at the top
- Location list on the left (filterable by region: US / International)
- Full detail panel on the right
- Clean, reference-grade typography — this is a document people will read carefully, not scan

---

## DETAIL PANEL CONTENT (per location)

**Always shown (summary level):**
- Headline rate and rate structure (flat / tiered / split)
- Incentive type (refundable credit / transferable credit / rebate / grant)
- Eligible and ineligible production types
- Spend buckets and rates
- Available uplifts with conditions
- Minimums (spend, filming days)
- Caps (project cap, compensation cap, annual cap)
- Sunset date (if applicable)
- Monetization rate and explanation
- Flags (red / yellow / blue) — same system as Tool 4
- Data source and last updated date

**Added when detailed PDF is ingested:**
- Application window and deadlines
- Application process step by step
- Required documentation list
- Film office contact (name, email, phone, website)
- CPA audit requirement and typical cost
- Loan-out registration requirement
- Screen credit requirement
- Sample production timeline showing when to apply relative to shoot start
- Links to official film office resources

---

## OUTPUT: EXCEL EXPORT

Each location's info sheet can be exported as Excel. The user can then relabel fields, add notes, and share internally. Format mirrors the detail panel: one section per category, clean tabular layout.

---

## FEATURES PLANNED

- Last updated badge per location
- Data level indicator (Summary vs Detailed) — same color coding as Data Status tracker in Tool 4
- Export to Excel button per location
- Eventually: compare two states side by side (lower priority)
- Eventually: chatbot (Tool 6) sits on top of this same data and answers natural language questions

---

## RELATIONSHIP TO OTHER TOOLS

- **Tool 4 (Calculator)**: shares the same underlying location data. Tool 5 is the reference companion to Tool 4's calculator.
- **Tool 6 (Chatbot, planned)**: will answer natural language questions ("Does Georgia cover non-resident ATL for a reality show?") by querying the same data that Tool 5 displays. The more detailed PDFs Marc feeds in, the better Tool 6 answers.
- **Data Status Tracker (in Tool 4)**: already shows which locations are summary vs detailed vs pending. Tool 5 will have its own version of this view.

---

## DATA INGESTION WORKFLOW

When Marc provides a new state/country PDF:
1. Claude reads the full PDF
2. Claude extracts all fields listed in the detail panel above
3. Claude updates incentives_data.json with the new fields
4. Claude updates DATA_STATUS in the HTML to change that location from 'summary' to 'detailed'
5. Tool 5 automatically shows the richer content for that location
6. CLAUDE_CONTEXT.md and TOOL5_TAX_INFO_RULES.md are updated to reflect the new data

---

## HOMEPAGE CARD

"Pick any state or country and get the full picture — rates, eligibility, minimums, caps, application windows, audit requirements, film office contacts, and more."

Currently shown as "Coming Soon" on the dashboard.

---

*Update this file when: development begins, layout decisions are finalized, first PDF is ingested, or output format changes.*

---

## DATA REGISTRY

All source documents are tracked in DATA_REGISTRY.md in the repo root.

When Marc asks "did we ever get detailed data for X?" — fetch DATA_REGISTRY.md and answer from Section 3.

When new PDFs arrive:
1. Read all documents
2. Extract detailed fields per the detail panel content list above
3. Update DATA_REGISTRY.md (add to Section 2, update Section 3 status)
4. Update DATA_STATUS object in the current HTML file
5. Return updated DATA_REGISTRY.md for upload

### Currently at detailed level (as of April 9, 2026)
- Georgia (4 documents ingested)
- Nevada (5 documents ingested)

### All other locations: summary level only (EP guides, March 2026)

### Pending (not yet in system): Missouri, New Mexico, New York, North Carolina, Ohio, Oregon, Pennsylvania, Rhode Island, South Carolina, Utah, Vermont, Virginia, Wisconsin, Wyoming
