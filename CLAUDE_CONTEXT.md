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

The frontend is plain HTML/CSS/vanilla JavaScript. NOT React, NOT a build system. All tools are embedded directly in the HTML file. JSX components must be converted to vanilla JS before integration.

The backend handles all Claude API calls. The frontend POSTs to the backend and polls for results.

---

## CURRENT FRONTEND FILE

**studiochief_v21.html** is the current production frontend as of April 9, 2026.

Earlier versions (v10 through v20) are kept in the repo for reference but are not live. When working on the frontend, always use the highest-numbered HTML file in the repo unless this file says otherwise.

---

## TOOL STATUS

| Tool | Name | Status | Notes |
|---|---|---|---|
| Tool 1 | Cash Flow Generator | ✅ Working | See TOOL1_CASHFLOW_RULES.md |
| Tool 2 | Variance Report | ⚠️ In Progress | Polling arch in place, timing out on Claude parse. See TOOL2_VARIANCE_RULES.md |
| Tool 3 | Risk / Diligence Scanner | 🔴 Not Started | Intent captured. See TOOL3_RISK_RULES.md |
| Tool 4 | Tax Incentive Calculator | ✅ Built, not yet wired | JSX done, needs vanilla JS conversion + frontend tab. See TOOL4_TAX_INCENTIVE_RULES.md |

---

## FILE INVENTORY

| File | Purpose |
|---|---|
| CLAUDE_CONTEXT.md | This file. Paste first in every session. |
| TOOL1_CASHFLOW_RULES.md | Full reasoning and rules for the Cash Flow Generator |
| TOOL2_VARIANCE_RULES.md | Full reasoning and rules for the Variance Report tool |
| TOOL3_RISK_RULES.md | Intent and planned rules for the Risk/Diligence Scanner |
| TOOL4_TAX_INCENTIVE_RULES.md | Summary rules for the Tax Incentive Calculator + integration plan |
| TAX_INCENTIVE_RULES (1).md | Detailed source rules doc for Tool 4 incentive logic — authoritative on calculation rules |
| incentives_data.json | Raw incentive data, 46 locations, EP 03/08-09/2026 |
| tax-incentive-calculator.jsx | Complete React/JSX component for Tool 4 — convert to vanilla JS for frontend integration |
| studiochief_domain_rules.md | Legacy combined rules file — superseded by per-tool files above, kept for reference only |
| studiochief_v21.html | Current production frontend |
| app.py | Flask backend. All API routes live here. |
| requirements.txt | Python dependencies |
| render.yaml | Render deployment config |
| gunicorn.conf.py | Gunicorn server config |

---

## BACKEND NOTES

- Anthropic API key is set as an environment variable in Render. Never hardcode it.
- API key rotation is a pending TODO.
- Polling pattern: frontend POSTs job, backend queues it, frontend polls /api/status/{job_id} until complete.
- Tool 2 timeout issue is on the Claude API response side, not the polling architecture itself.

---

## SESSION STARTUP INSTRUCTIONS

**Working on Tool 1 (Cash Flow):**
Paste CLAUDE_CONTEXT.md + TOOL1_CASHFLOW_RULES.md

**Working on Tool 2 (Variance Report):**
Paste CLAUDE_CONTEXT.md + TOOL2_VARIANCE_RULES.md

**Working on Tool 3 (Risk Scanner):**
Paste CLAUDE_CONTEXT.md + TOOL3_RISK_RULES.md

**Working on Tool 4 (Tax Incentive Calculator):**
Paste CLAUDE_CONTEXT.md + TOOL4_TAX_INCENTIVE_RULES.md
If working on incentive logic specifically, also paste TAX_INCENTIVE_RULES (1).md and incentives_data.json.

**Working on frontend or architecture (not tool-specific):**
Paste CLAUDE_CONTEXT.md only, then paste studiochief_v21.html if Claude needs to see the frontend code.

---

## PRODUCT VISION / BACKLOG

- Tool 5 (future): AI video rights/clearance scanner
- Tool 6 (future): AI script risk scanner
- Bundle all tools as a subscription suite for production professionals
- Intelligent section-to-phase mapping rule set for Tool 1 (Marc will provide domain-specific rules like "gaming control = game show shoot cost")
- Approximately 14 additional US states pending for Tool 4 data

---

## MARC'S PREFERENCES

- No EM dashes. Use commas or other punctuation instead.
- Direct communication. No fluff, no over-explaining.
- Claude should not ask questions it can already answer from the context files.
- Always use the highest-numbered studiochief_vXX.html as the current frontend unless this file says otherwise.
- Claude builds everything. No developer is available.
- Rules files grow over time. Every session where new reasoning is established, update the relevant tool rules file and re-upload it to the repo.

---

*Update this file whenever: a tool ships, the frontend version changes, architecture changes, a new tool is added, or session startup instructions change.*
