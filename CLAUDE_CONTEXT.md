# CLAUDE_CONTEXT.md
# StudioChief — Master Session Context
# Last updated: April 9, 2026
# PASTE THIS FIRST in every new session. Then paste only the tool rules file(s) relevant to that session's work.

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

Frontend is plain HTML/CSS/vanilla JavaScript. NOT React, NOT a build system. All tools embedded in one HTML file. Tool 4 is client-side only — no backend call.

---

## CURRENT FRONTEND FILE

**studiochief_v26.html** — current production frontend as of April 9, 2026.

Always use the highest-numbered studiochief_vXX.html unless this file says otherwise.

---

## FILE SIZE NOTE

v26 is ~1,791 lines. Watch this. Flag proactively when approaching 3,000 lines or 300KB — at that point recommend splitting tools into separate HTML files.

---

## TOOL STATUS

| # | Name | Status | Notes |
|---|---|---|---|
| 1 | Cash Flow Generator | ✅ Working | See TOOL1_CASHFLOW_RULES.md |
| 2 | Cost & Variance Report | ⚠️ In Progress | Timeout issue on Claude parse. See TOOL2_VARIANCE_RULES.md |
| 3 | Risk & Diligence Scanner | ✅ Working | Icon is 🔍 |
| 4 | Tax Incentive Calculator | ✅ Working | Client-side. See TOOL4_TAX_INCENTIVE_RULES.md |
| 5 | Tax Incentive Information | 🔴 Not Started | See TOOL5_TAX_INFO_RULES.md |

---

## HOMEPAGE

- App order: Tax Incentive Calculator → Tax Incentive Information (soon) → Cash Flow Generator → Cost & Variance Report → Risk & Diligence Scanner → Coming Soon
- Tagline: "Built and trained for the way productions actually work."
- StudioChief nav logo: 26px
- Tax Incentive Information shown as Coming Soon on dashboard

---

## TOOL 4 CURRENT FEATURE STATE (v26)

- Dynamic bucket modes: simple / labor_spend / full / nocalc (see TOOL4_TAX_INCENTIVE_RULES.md)
- Rate transparency: result card shows "Rates applied: X% base + Y% uplift = Z% effective" inline above gross incentive line
- Unified "Options & Uplifts" section: uplifts + contingency toggle + audit fee toggle all in one block, checkbox after checkbox
- Optional show title field at top of Step 3 (single field, appears on Excel export)
- Excel export button (green, below columns): downloads CSV with all locations, spend inputs, rates, and calculations
- Total production budget → Effective Budget After Incentive in green
- Contingency toggle (10%, on by default), audit/CPA fee toggle (off by default, shows est. amount)
- Data Status button in tool header: panel showing 46 current + 14 pending locations
- 46 locations, 13 production types including Competition
- Attribution: "publicly available incentive data, March 2026"

---

## TOOL 5 PLAN — TAX INCENTIVE INFORMATION

One location at a time. Search/filter left, full detail right. Excel export per location. See TOOL5_TAX_INFO_RULES.md.

---

## PENDING CONVERSATIONS (do not forget)

- Pricing and structure: free founding member period, future paid tier, pricing page
- Login / email capture: preview-then-prompt modal at Generate click
- Visual polish pass: Tax calculator and Cost & Variance Report feel text-heavy — planned
- HTML file size: flag at 3,000 lines / 300KB

---

## FILE INVENTORY

| File | Purpose |
|---|---|
| CLAUDE_CONTEXT.md | This file. Paste first in every session. |
| TOOL1_CASHFLOW_RULES.md | Cash Flow Generator rules |
| TOOL2_VARIANCE_RULES.md | Cost & Variance Report rules |
| TOOL3_RISK_RULES.md | Risk & Diligence Scanner rules |
| TOOL4_TAX_INCENTIVE_RULES.md | Tax Incentive Calculator rules |
| TOOL5_TAX_INFO_RULES.md | Tax Incentive Information rules |
| TAX_INCENTIVE_RULES (1).md | Detailed source rules for Tool 4 incentive logic |
| incentives_data.json | Raw incentive data, 46 locations, March 2026 |
| tax-incentive-calculator.jsx | Original JSX — reference only |
| studiochief_domain_rules.md | Legacy rules — superseded, kept for reference |
| studiochief_v26.html | Current production frontend |
| app.py | Flask backend |
| requirements.txt | Python dependencies |
| render.yaml | Render config |
| gunicorn.conf.py | Gunicorn config |

---

## SESSION STARTUP INSTRUCTIONS

**Tool 1:** CLAUDE_CONTEXT.md + TOOL1_CASHFLOW_RULES.md
**Tool 2:** CLAUDE_CONTEXT.md + TOOL2_VARIANCE_RULES.md
**Tool 3:** CLAUDE_CONTEXT.md + TOOL3_RISK_RULES.md
**Tool 4:** CLAUDE_CONTEXT.md + TOOL4_TAX_INCENTIVE_RULES.md (+ TAX_INCENTIVE_RULES (1).md + incentives_data.json if working on incentive logic)
**Tool 5:** CLAUDE_CONTEXT.md + TOOL5_TAX_INFO_RULES.md
**Frontend/architecture:** CLAUDE_CONTEXT.md + studiochief_v26.html

---

## RULE: CLAUDE ALWAYS SENDS AIRTIGHT PACKAGE WITH EVERY DELIVERABLE

Every session ending with a new HTML version or tool status change must include updated CLAUDE_CONTEXT.md + any affected tool rules files. All together, unprompted.

---

## MARC'S PREFERENCES

- No EM dashes. Commas or other punctuation instead.
- Direct communication. No fluff.
- Claude does not ask questions it can answer from context files.
- Claude builds everything. No developer available.
- Claude always sends the full airtight package at session end.

---

*Update whenever: tool ships, version changes, architecture changes, new tool added, pending conversation resolved.*
