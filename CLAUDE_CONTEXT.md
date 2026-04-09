# CLAUDE_CONTEXT.md
# StudioChief — Master Session Context
# Last updated: April 9, 2026
# PASTE THIS FIRST in every new session. Then paste only the tool rules file(s) relevant to that session's work.

---

## WHAT IS STUDIOCHIEF

StudioChief is a web-based subscription tool suite for professional TV and film production executives. It automates calculations that production execs currently do manually in Excel. Marc Walloff (former SVP of Production, ITV America) is the sole owner and product lead. There is no developer on staff — Claude builds everything.

---

## ARCHITECTURE

| Layer | Platform | URL / Location |
|---|---|---|
| Backend (Python/Flask) | Render Pro | studiochief.onrender.com |
| Frontend (HTML) | GitHub Pages | mwolloff.github.io/studiochief |
| Repo | GitHub | github.com/mwolloff/studiochief |
| AI Engine | Anthropic Claude API | Called from backend via /api/* routes |

The frontend is plain HTML/CSS/vanilla JavaScript. NOT React, NOT a build system. All tools are embedded directly in the HTML file. JSX components must be converted to vanilla JS before integration. The backend handles all Claude API calls. Tool 4 is entirely client-side and does not touch the backend.

---

## CURRENT FRONTEND FILE

**studiochief_v24.html** is the current production frontend as of April 9, 2026.

Always use the highest-numbered HTML file in the repo unless this file says otherwise.

---

## TOOL STATUS

| Tool | Name | Status | Notes |
|---|---|---|---|
| Tool 1 | Cash Flow Generator | ✅ Working | See TOOL1_CASHFLOW_RULES.md |
| Tool 2 | Variance Report | ⚠️ In Progress | Polling arch in place, timing out on Claude parse. See TOOL2_VARIANCE_RULES.md |
| Tool 3 | Risk / Diligence Scanner | ✅ Working | Live in frontend |
| Tool 4 | Tax Incentive Calculator | ✅ Working | Live in v24. Client-side only. See TOOL4_TAX_INCENTIVE_RULES.md |

---

## TOOL 4 CURRENT FEATURE STATE (v24)

**Bucket modes (dynamic per location):**
- simple: one field "Total Qualifying Spend" — flat rate applies to everything (Georgia, Ireland, most rebates)
- labor_spend: two fields "Qualifying Labor" + "Non-Labor Qualifying Spend" — same rate, different categories
- full: all applicable buckets shown with individual rates (Nevada, Minnesota, Louisiana, etc.)
- nocalc: no fields — contact-for-details or non-calculable (Indiana, Oklahoma, UK, Australia NT)

Each location shows a colored explanation banner telling the user exactly what to enter and why.

**Other features:**
- Total production budget field (optional) — produces "Effective Budget After Incentive" in green
- Contingency toggle: 10% deduction on by default, user can uncheck to remove
- Audit/CPA fee toggle: off by default, user checks to add deduction with editable dollar amount (defaults to state-appropriate estimate)
- Monetization rate explained per state (100¢, 90¢, 85¢) with plain-English label
- 46 locations (21 US + 25 international)
- Production types include: Feature Film, Scripted TV, Reality TV, Unscripted, Documentary, Competition, Game Show, Animation, Commercial, Pilot, Post Only, Talk Show, Video Game
- Attribution: "publicly available incentive data, March 2026" (no EP mention)
- 3-location limit clearly called out with indigo banner

---

## FILE INVENTORY

| File | Purpose |
|---|---|
| CLAUDE_CONTEXT.md | This file. Paste first in every session. |
| TOOL1_CASHFLOW_RULES.md | Full reasoning and rules for the Cash Flow Generator |
| TOOL2_VARIANCE_RULES.md | Full reasoning and rules for the Variance Report tool |
| TOOL3_RISK_RULES.md | Intent and planned rules for the Risk/Diligence Scanner |
| TOOL4_TAX_INCENTIVE_RULES.md | Summary rules for the Tax Incentive Calculator |
| TAX_INCENTIVE_RULES (1).md | Detailed source rules doc for Tool 4 — authoritative on incentive logic |
| incentives_data.json | Raw incentive data, 46 locations, March 2026 |
| tax-incentive-calculator.jsx | Original React/JSX component — kept for reference |
| studiochief_domain_rules.md | Legacy combined rules file — superseded by per-tool files |
| studiochief_v24.html | Current production frontend |
| app.py | Flask backend. All API routes live here. |
| requirements.txt | Python dependencies |
| render.yaml | Render deployment config |
| gunicorn.conf.py | Gunicorn server config |

---

## BACKEND NOTES

- Anthropic API key is an environment variable in Render. Never hardcode it.
- API key rotation is a pending TODO.
- Tool 2 timeout issue is on the Claude API response side, not the polling architecture.
- Tool 4 is 100% client-side — no backend call needed.

---

## SESSION STARTUP INSTRUCTIONS

**Working on Tool 1:** Paste CLAUDE_CONTEXT.md + TOOL1_CASHFLOW_RULES.md
**Working on Tool 2:** Paste CLAUDE_CONTEXT.md + TOOL2_VARIANCE_RULES.md
**Working on Tool 3:** Paste CLAUDE_CONTEXT.md + TOOL3_RISK_RULES.md
**Working on Tool 4:** Paste CLAUDE_CONTEXT.md + TOOL4_TAX_INCENTIVE_RULES.md (add TAX_INCENTIVE_RULES (1).md and incentives_data.json if working on incentive logic)
**Working on frontend/architecture:** Paste CLAUDE_CONTEXT.md + studiochief_v24.html

---

## RULE: CLAUDE ALWAYS SENDS CLAUDE_CONTEXT.MD WITH EVERY DELIVERABLE

Any session where Claude produces a new HTML version, fixes a bug, or changes tool status must include an updated CLAUDE_CONTEXT.md in the same delivery. No exceptions.

---

## PRODUCT VISION / BACKLOG

- Tool 5 (planned): Tax Incentive Chatbot — natural language Q&A from incentive data, gets smarter as more state PDFs are fed in
- Tool 6 (planned): Tax Incentive Information lookup — pick a state, get the full detail including application windows, audit requirements, etc.
- Tool 7 (future): AI video rights/clearance scanner
- Tool 8 (future): AI script risk scanner
- Approximately 14 additional US states pending for Tool 4
- Intelligent section-to-phase mapping rule set for Tool 1

---

## MARC'S PREFERENCES

- No EM dashes. Use commas or other punctuation instead.
- Direct communication. No fluff.
- Claude should not ask questions it can answer from context files.
- Always use the highest-numbered studiochief_vXX.html as current frontend.
- Claude builds everything. No developer available.
- Claude always sends updated CLAUDE_CONTEXT.md with every file deliverable.

---

*Update this file whenever: a tool ships, frontend version changes, architecture changes, or new tools are added.*
