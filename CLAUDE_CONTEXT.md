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

**studiochief_v29.html** — current production frontend as of April 9, 2026.

Always use the highest-numbered studiochief_vXX.html unless this file says otherwise.

---

## FILE SIZE NOTE

v29 is ~2,327 lines. Flag proactively when approaching 3,000 lines or 300KB — at that point recommend splitting tools into separate HTML files.

---

## FONTS

As of v29, DM Mono has been removed entirely. The site now uses two fonts only:
- **Playfair Display** — big headings, card names, tool titles
- **Outfit** — everything else (labels, data, tags, nav, body copy)

Letter-spacing reduced throughout to suit Outfit (was tuned for monospace). Do not reintroduce DM Mono or any monospace font.

---

## GLOBAL CURRENCY FORMATTING RULE

ALL currency inputs across ALL tools use type="text" inputmode="numeric" with live comma formatting via shared utilities: formatWithCommas(), parseCurrency(), onCurrencyInput(). Never use type="number" for currency fields.

---

## TOOL STATUS

| # | Name | Status | Notes |
|---|---|---|---|
| 1 | Cash Flow Generator | ✅ Working | See TOOL1_CASHFLOW_RULES.md |
| 2 | Cost & Variance Report | ⚠️ In Progress | Timeout issue on Claude parse. See TOOL2_VARIANCE_RULES.md |
| 3 | Risk & Diligence Scanner | ✅ Working | Icon is 🔍 |
| 4 | Tax Incentive Calculator | ✅ Working | Client-side. See TOOL4_TAX_INCENTIVE_RULES.md |
| 5 | Tax Incentive Information | ✅ Working | Georgia + Nevada at detailed level. All others summary. See TOOL5_TAX_INFO_RULES.md |

---

## HOMEPAGE

- App order: Tax Incentive Calculator → Tax Incentive Information → Cash Flow Generator → Cost & Variance Report → Risk & Diligence Scanner → Coming Soon
- Tagline: "Built and trained for the way productions actually work."
- StudioChief nav logo: 26px
- All tools live — no more Coming Soon cards in active positions

---

## TOOL 4 — TAX INCENTIVE CALCULATOR (v29 feature state)

- Dynamic bucket modes: simple / labor_spend / full / nocalc
- Rate transparency: "Rates applied: X% base + Y% uplift = Z% effective" shown inline in result card
- Unified "Options & Uplifts" section: one block, all checkboxes
- Optional show title field at top of Step 3
- Excel export (CSV): filename "Tax_Incentive_Comparison.csv" or "[ShowTitle]_TaxIncentiveComparison.csv", 2 decimal places with commas
- All spend inputs: type="text" inputmode="numeric" with live comma formatting
- Data Status button in tool header: panel showing all 46 current + 14 pending locations
- 46 locations, 13 production types including Competition
- Attribution: "publicly available incentive data, March 2026"

**Known data discrepancies (EP summary data is stale for these):**
- New Zealand: min spend dropped from NZ$15M to NZ$4M for live action, eff. Jan 1 2026
- United Kingdom: program renamed to AVEC; new IFTC for films under £15M, eff. April 2025

---

## TOOL 5 — TAX INCENTIVE INFORMATION (v29 feature state)

- One location at a time. Search/filter left, full detail panel right.
- Indigo dot = detailed data. Green dot = summary data.
- Georgia: full detailed panel including 9-step process, film office contacts, audit rules, and expandable GDOR qualifying expenditures YES/NO chart (every budget account)
- Nevada: full detailed panel including 5-step process, Kim Spurgeon contact, all bonus and cap rules
- All other locations: summary panel with headline rate, incentive type, and flags from EP data
- Excel export button on every location
- See TOOL5_TAX_INFO_RULES.md for data ingestion workflow

---

## TAX INCENTIVE DATA SYSTEM

Three files work together:
- **DATA_REGISTRY.md**: what data we have, at what level, and what's missing
- **TOOL4_TOOL5_URL_REGISTRY.md**: official source URLs, fetch status, dead links, pending queue
- **TOOL5_TAX_INFO_RULES.md**: how to ingest new PDFs and what fields to extract

When Marc asks "how are the tax incentive files going?" or "are we missing any states?":
- If DATA_REGISTRY.md is in context: answer immediately and in full
- If not: say "paste DATA_REGISTRY.md and TOOL4_TOOL5_URL_REGISTRY.md from GitHub and I'll give you the full picture"

When new PDFs arrive: read them, extract detail, update DATA_REGISTRY.md, update DATA_STATUS object in HTML, return updated DATA_REGISTRY.md in airtight package.

**Currently detailed:** Georgia, Nevada
**Currently summary:** All other 44 locations
**Pending (not in system):** ~14 US states including New York
**Dead URLs needing new addresses:** Australia NSW, British Columbia, France, South Africa, UAE Abu Dhabi
**Blocked:** Ireland, Greece

---

## PENDING CONVERSATIONS (do not forget)

- Pricing and structure: free founding member period, future paid tier, pricing page
- Login / email capture: preview-then-prompt modal at Generate click
- Visual polish pass: Tax calculator and Cost & Variance Report feel text-heavy
- HTML file size: flag at 3,000 lines / 300KB
- Tool 4 v28 list item: in Excel export, replace static "Headline Rate" with calculated "Effective Rate Applied" showing actual rate used

---

## FILE INVENTORY (repo root)

| File | Purpose |
|---|---|
| CLAUDE_CONTEXT.md | This file. Paste first in every session. |
| DATA_REGISTRY.md | Master log of all incentive source documents and data levels |
| TOOL4_TOOL5_URL_REGISTRY.md | Official source URLs, fetch status, dead links, pending queue |
| TOOL1_CASHFLOW_RULES.md | Cash Flow Generator rules |
| TOOL2_VARIANCE_RULES.md | Cost & Variance Report rules |
| TOOL3_RISK_RULES.md | Risk & Diligence Scanner rules |
| TOOL4_TAX_INCENTIVE_RULES.md | Tax Incentive Calculator rules |
| TOOL5_TAX_INFO_RULES.md | Tax Incentive Information rules and data ingestion workflow |
| TAX_INCENTIVE_RULES (1).md | Detailed source rules for Tool 4 incentive logic |
| incentives_data.json | Raw incentive data, 46 locations, March 2026 |
| studiochief_v29.html | Current production frontend |
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
**Frontend/architecture:** CLAUDE_CONTEXT.md + studiochief_v29.html

---

## AIRTIGHT PACKAGE RULE

Every session ending with a new HTML version, tool status change, or new data ingested must include: CLAUDE_CONTEXT.md + any affected rules files + DATA_REGISTRY.md (always if tax data touched) + TOOL4_TOOL5_URL_REGISTRY.md (if URLs were fetched or updated). All delivered together, unprompted, before the session ends.

---

## MARC'S PREFERENCES

- No EM dashes. Commas or other punctuation instead.
- Direct communication. No fluff.
- Claude does not ask questions it can answer from context files.
- Claude builds everything. No developer available.
- Claude always sends the full airtight package at session end.

---

*Update whenever: tool ships, version changes, architecture changes, new tool added, pending conversation resolved, data registry changes.*
