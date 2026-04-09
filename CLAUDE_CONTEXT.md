# CLAUDE_CONTEXT.md
# StudioChief — Master Session Context
# Last updated: April 9, 2026
# PASTE THIS FIRST in every new session. Then paste DATA_REGISTRY.md and TOOL4_TOOL5_URL_REGISTRY.md if working on tax incentive data.

---

## WHAT IS STUDIOCHIEF

StudioChief is a web-based subscription tool suite for professional TV and film production executives. Marc Walloff (former SVP of Production, ITV America) is the sole owner and product lead. No developer on staff — Claude builds everything.

---

## ARCHITECTURE

| Layer | Platform | URL |
|---|---|---|
| Backend (Python/Flask) | Render Pro | studiochief.onrender.com |
| Frontend (HTML) | GitHub Pages | mwolloff.github.io/studiochief |
| Repo | GitHub | github.com/mwolloff/studiochief |
| AI Engine | Anthropic Claude API | Called from backend via /api/* routes |

Frontend is plain HTML/CSS/vanilla JavaScript. NOT React, NOT a build system. All tools embedded in one HTML file. Tool 4 and Tool 5 are client-side only — no backend call.

---

## CURRENT FRONTEND FILE

**studiochief_v30.html** — current production frontend as of April 9, 2026.

Always use the highest-numbered studiochief_vXX.html unless this file says otherwise.

---

## FILE SIZE NOTE

v30 is ~2,390 lines. Flag proactively when approaching 3,000 lines or 300KB.

---

## FONTS (v29+)

DM Mono removed entirely. Two fonts only:
- **Playfair Display** — big headings, card names, tool titles
- **Outfit** — everything else

Do not reintroduce DM Mono or any monospace font.

---

## GLOBAL CURRENCY FORMATTING RULE

All currency inputs use type="text" inputmode="numeric" with live comma formatting via formatWithCommas(), parseCurrency(), onCurrencyInput(). Never use type="number" for currency fields.

---

## TOOL STATUS

| # | Name | Status | Notes |
|---|---|---|---|
| 1 | Cash Flow Generator | ✅ Working | See TOOL1_CASHFLOW_RULES.md |
| 2 | Cost & Variance Report | ⚠️ In Progress | Timeout issue. See TOOL2_VARIANCE_RULES.md |
| 3 | Risk & Diligence Scanner | ✅ Working | Icon is 🔍 |
| 4 | Tax Incentive Calculator | ✅ Working | Client-side. 47 locations. See TOOL4_TAX_INCENTIVE_RULES.md |
| 5 | Tax Incentive Information | ✅ Working | 47 locations. Georgia + Nevada + Cyprus detailed. All others summary. See TOOL5_TAX_INFO_RULES.md |

---

## HOMEPAGE

- App order: Tax Incentive Calculator → Tax Incentive Information → Cash Flow Generator → Cost & Variance Report → Risk & Diligence Scanner → Coming Soon
- Tagline: "Built and trained for the way productions actually work."
- StudioChief nav logo: 26px

---

## TOOL 4 — TAX INCENTIVE CALCULATOR

- 47 locations, 13 production types including Competition
- Rate transparency in result card
- Unified Options & Uplifts section
- Optional show title field
- Excel/CSV export with 2 decimal places and commas
- Data Status button in tool header

**Fixed in v30:**
- New Zealand min spend updated: NZ$4M for live action (was NZ$15M, effective Jan 1 2026)
- UK program renamed to AVEC (Audio-Visual Expenditure Credit), IFTC note added
- Cyprus added as new location

**Pending v-next items:**
- In Excel export, replace static "Headline Rate" with calculated "Effective Rate Applied"
- Add Cyprus official PDF URL to URL registry (film.investcyprus.org.cy)
- Update New Zealand min spend flag text — note live action vs TV distinction more clearly

---

## TOOL 5 — TAX INCENTIVE INFORMATION

- One location at a time. Search left, detail right.
- Indigo dot = detailed. Green dot = summary.
- Georgia: full detail including expandable GDOR expenditure YES/NO chart
- Nevada: full detail including Kim Spurgeon contact
- Cyprus: full detail including application process, audit rules, local hiring requirements, scheme sunset date
- All others: summary panel
- Excel export per location

**Fixed in v30:**
- Cyprus added as new detailed location
- New Zealand summary updated with new min spend note
- UK summary updated to AVEC with IFTC note

**Pending v-next items:**
- Add New York at summary level (30% base, $700M/year through 2036)
- Upgrade Ireland to detailed (32% + new 8% Scéal Uplift = 40%, eff. March 2025)
- Upgrade Greece to detailed (40% cash rebate, new law 5105/2024)
- Update New Zealand and UK to detailed when PDFs available

---

## TAX INCENTIVE DATA SYSTEM

Three files work together:
- **DATA_REGISTRY.md** — what data we have, at what level, what's missing
- **TOOL4_TOOL5_URL_REGISTRY.md** — official source URLs, fetch status, dead links, pending queue
- **TOOL5_TAX_INFO_RULES.md** — ingestion workflow and field list

When Marc asks "how are the tax incentive files going?":
- If DATA_REGISTRY.md is in context: answer immediately and in full
- If not: say "paste DATA_REGISTRY.md and TOOL4_TOOL5_URL_REGISTRY.md from GitHub and I'll give you the full picture"

**Current data levels:**
- Detailed: Georgia, Nevada, Cyprus
- Ready to upgrade to detailed: Ireland, Greece
- Ready to add at summary: New York
- Summary only: all other 44 current locations
- Pending/not in system: ~13 remaining US states
- Inactive/limited programs: Vermont, Wisconsin, Wyoming, Missouri (verify), South Carolina (verify)

**Dead URLs still needing corrected addresses:**
- Australia NSW, British Columbia, France, South Africa, UAE Abu Dhabi

**US state URLs logged but not yet fetched:**
New Mexico, Missouri, Oregon, Pennsylvania, Rhode Island, South Carolina, Utah, Virginia, Wisconsin, Wyoming, North Carolina, Ohio, Vermont

---

## DATA GAP TRACKER

Use this section to answer "what are we missing?" in any new chat without needing DATA_REGISTRY.md.

### Locations NOT yet in the system (pending ingestion)
Missouri, New Mexico, New York, North Carolina, Ohio, Oregon, Pennsylvania, Rhode Island, South Carolina, Utah, Vermont, Virginia, Wisconsin, Wyoming

### Locations in system at SUMMARY level only (priority to upgrade)
**Tier 1:** Louisiana, Texas, United Kingdom (AVEC), British Columbia, Ireland, California
**Tier 2:** Arizona, Quebec, Massachusetts, Greece
**Tier 3:** All remaining US states and international locations

### Known data discrepancies (in system but needs update)
- New Zealand: min spend updated Jan 1 2026 to NZ$4M live action — FIXED in v30
- UK: renamed to AVEC, IFTC added — FIXED in v30

### Dead URLs (need manual search to find current page)
- Australia NSW — screen.nsw.gov.au returns 404
- British Columbia — creativebc.com returns 404
- France CNC — cnc.fr returns 404
- South Africa DTIC — thedtic.gov.za returns 404
- UAE Abu Dhabi — twofour54 restructured, incentives page gone

### Blocked URLs (try PDF directly or manual download)
- Ireland — screenireland.ie blocked (corrected URL found: screenireland.ie/filming/section-481-1)
- Greece — ekome.media blocked (corrected URL found: filmcommission.gr/cash-rebate/)

---

## PENDING CONVERSATIONS (do not forget)

- Pricing and structure: free founding member period, future paid tier, pricing page
- Login / email capture: preview-then-prompt modal at Generate click
- Visual polish pass: Tax calculator and Cost & Variance Report feel text-heavy
- HTML file size: flag at 3,000 lines / 300KB
- Excel export effective rate fix (v-next)
- New York, Ireland, Greece still need to be built into the HTML (data fetched, not yet coded)

---

## FILE INVENTORY (repo root)

| File | Purpose |
|---|---|
| CLAUDE_CONTEXT.md | This file. Paste first every session. |
| DATA_REGISTRY.md | Master log of all incentive source documents and data levels |
| TOOL4_TOOL5_URL_REGISTRY.md | Official source URLs, fetch status, dead links, pending queue |
| TOOL1_CASHFLOW_RULES.md | Cash Flow Generator rules |
| TOOL2_VARIANCE_RULES.md | Cost & Variance Report rules |
| TOOL3_RISK_RULES.md | Risk & Diligence Scanner rules |
| TOOL4_TAX_INCENTIVE_RULES.md | Tax Incentive Calculator rules |
| TOOL5_TAX_INFO_RULES.md | Tax Incentive Information rules and ingestion workflow |
| TAX_INCENTIVE_RULES (1).md | Detailed source rules for Tool 4 incentive logic |
| incentives_data.json | Raw incentive data, 46 locations, March 2026 |
| studiochief_v30.html | Current production frontend |
| app.py | Flask backend |
| requirements.txt | Python dependencies |
| render.yaml | Render config |
| gunicorn.conf.py | Gunicorn config |

---

## SESSION STARTUP INSTRUCTIONS

**Any tax incentive work:** CLAUDE_CONTEXT.md + DATA_REGISTRY.md + TOOL4_TOOL5_URL_REGISTRY.md
**Tool 1:** CLAUDE_CONTEXT.md + TOOL1_CASHFLOW_RULES.md
**Tool 2:** CLAUDE_CONTEXT.md + TOOL2_VARIANCE_RULES.md
**Tool 3:** CLAUDE_CONTEXT.md + TOOL3_RISK_RULES.md
**Tool 4:** CLAUDE_CONTEXT.md + TOOL4_TAX_INCENTIVE_RULES.md + DATA_REGISTRY.md + URL_REGISTRY
**Tool 5:** CLAUDE_CONTEXT.md + TOOL5_TAX_INFO_RULES.md + DATA_REGISTRY.md + URL_REGISTRY
**Frontend/architecture:** CLAUDE_CONTEXT.md + studiochief_vXX.html

---

## AIRTIGHT PACKAGE RULE

Every session ending with a new HTML version, tool status change, or new data ingested must include: CLAUDE_CONTEXT.md + any affected rules files + DATA_REGISTRY.md + TOOL4_TOOL5_URL_REGISTRY.md if URLs were touched. All delivered together, unprompted.

---

## MARC'S PREFERENCES

- No EM dashes. Commas or other punctuation instead.
- Direct communication. No fluff.
- Claude does not ask questions it can answer from context files.
- Claude builds everything. No developer available.
- Claude always sends the full airtight package at session end.
- When Marc pastes large amounts of HTML or code, always ask first: "Hey Marc, do you have the actual file? That would be easier."
- When something will take a long time or risk breaking things, flag it and ask Marc if there's a simpler path (like uploading a file instead of pasting).

---

*Update whenever: tool ships, version changes, new data ingested, pending items resolved.*
