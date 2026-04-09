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

Frontend is plain HTML/CSS/vanilla JavaScript. NOT React, NOT a build system. All tools embedded in one HTML file. Tool 4 and Tool 5 (when built) are client-side only — no backend call.

---

## CURRENT FRONTEND FILE

**studiochief_v25.html** — current production frontend as of April 9, 2026.

Always use the highest-numbered studiochief_vXX.html unless this file says otherwise.

---

## FILE SIZE NOTE

v25 is ~1,634 lines / ~135KB. Watch this. At ~3,000 lines or 300KB+ we should split tools into separate HTML files. Flag this proactively when approaching that threshold.

---

## TOOL STATUS

| # | Name | Status | Notes |
|---|---|---|---|
| 1 | Cash Flow Generator | ✅ Working | See TOOL1_CASHFLOW_RULES.md |
| 2 | Cost & Variance Report | ⚠️ In Progress | Timeout issue on Claude parse. See TOOL2_VARIANCE_RULES.md |
| 3 | Risk & Diligence Scanner | ✅ Working | Icon is 🔍 (magnifying glass) |
| 4 | Tax Incentive Calculator | ✅ Working | Client-side. See TOOL4_TAX_INCENTIVE_RULES.md |
| 5 | Tax Incentive Information | 🔴 Not Started | See TOOL5_TAX_INFO_RULES.md |

---

## HOMEPAGE

- App order: Tax Incentive Calculator → Tax Incentive Information (soon) → Cash Flow Generator → Cost & Variance Report → Risk & Diligence Scanner → Coming Soon
- Tagline: "Built and trained for the way productions actually work."
- StudioChief nav logo: 26px (increased from 18px)
- Tax Incentive Information card is shown as "Coming Soon" on dashboard

---

## TOOL 2 NAME

Renamed from "Variance Report" to "Cost & Variance Report" everywhere including nav, dashboard card, tool header, download buttons, and JS labels.

---

## TOOL 3 ICON

Changed from ⚠️ to 🔍 (magnifying glass) everywhere including dashboard card, import box, and JS icon reset functions.

---

## TOOL 4 CURRENT FEATURE STATE (v25)

- Dynamic bucket modes: simple (one field), labor_spend (two fields), full (all applicable buckets), nocalc (no fields)
- Each location shows a colored explanation banner describing what to enter and why
- Total production budget field (optional) → shows Effective Budget After Incentive in green
- Contingency toggle: 10% deduction on by default, user can uncheck
- Audit/CPA fee toggle: off by default, checkbox label shows estimated default amount per state
- Monetization rate explained per state (100¢ / 90¢ / 85¢) with plain-English label
- 46 locations, 13 production types including Competition
- Attribution: "publicly available incentive data, March 2026" — no EP mention
- Data Status button in tool header opens a panel showing all 46 current locations + 14 pending US states, color-coded by data level (summary / detailed / pending)

---

## TOOL 5 PLAN — TAX INCENTIVE INFORMATION

One state at a time (not side-by-side comparison like Tool 4). Search/filter on left, full detail panel on right. Output: Excel export of state info sheet. Features: last-updated badge per state, data completeness indicator (summary vs detailed), print/export button, eventually a compare-two-states mode. Chatbot (Tool 6) eventually sits on top of this same data. See TOOL5_TAX_INFO_RULES.md when created.

---

## PENDING CONVERSATIONS (do not forget)

- Pricing and structure: free founding member period, future paid tier, pricing page build
- Login / email capture: preview-then-prompt flow (modal at Generate click), no hard login wall yet
- Visual polish pass: Tax calculator and Cost & Variance Report both feel text-heavy/cramped — v26 polish pass planned
- HTML file size: flag when approaching 3,000 lines or 300KB

---

## FILE INVENTORY

| File | Purpose |
|---|---|
| CLAUDE_CONTEXT.md | This file. Paste first in every session. |
| TOOL1_CASHFLOW_RULES.md | Cash Flow Generator rules |
| TOOL2_VARIANCE_RULES.md | Cost & Variance Report rules |
| TOOL3_RISK_RULES.md | Risk & Diligence Scanner rules |
| TOOL4_TAX_INCENTIVE_RULES.md | Tax Incentive Calculator rules |
| TOOL5_TAX_INFO_RULES.md | Tax Incentive Information rules (to be created) |
| TAX_INCENTIVE_RULES (1).md | Detailed source rules for Tool 4 incentive logic |
| incentives_data.json | Raw incentive data, 46 locations, March 2026 |
| tax-incentive-calculator.jsx | Original JSX component — reference only |
| studiochief_domain_rules.md | Legacy rules file — superseded, kept for reference |
| studiochief_v25.html | Current production frontend |
| app.py | Flask backend, all API routes |
| requirements.txt | Python dependencies |
| render.yaml | Render deployment config |
| gunicorn.conf.py | Gunicorn server config |

---

## SESSION STARTUP INSTRUCTIONS

**Tool 1:** CLAUDE_CONTEXT.md + TOOL1_CASHFLOW_RULES.md
**Tool 2:** CLAUDE_CONTEXT.md + TOOL2_VARIANCE_RULES.md
**Tool 3:** CLAUDE_CONTEXT.md + TOOL3_RISK_RULES.md
**Tool 4:** CLAUDE_CONTEXT.md + TOOL4_TAX_INCENTIVE_RULES.md (+ TAX_INCENTIVE_RULES (1).md and incentives_data.json if working on incentive logic)
**Tool 5:** CLAUDE_CONTEXT.md + TOOL5_TAX_INFO_RULES.md (once created)
**Frontend/architecture:** CLAUDE_CONTEXT.md + studiochief_v25.html

---

## RULE: CLAUDE ALWAYS SENDS AIRTIGHT PACKAGE WITH EVERY DELIVERABLE

Any session where Claude produces a new HTML version or changes tool status must include updated CLAUDE_CONTEXT.md + any affected tool rules files. All delivered together, unprompted, before the session ends.

---

## MARC'S PREFERENCES

- No EM dashes. Commas or other punctuation instead.
- Direct communication. No fluff.
- Claude does not ask questions it can answer from context files.
- Claude builds everything. No developer available.
- Claude always sends the full airtight package at session end.

---

*Update whenever: tool ships, version changes, architecture changes, new tool added, pending conversation resolved.*
