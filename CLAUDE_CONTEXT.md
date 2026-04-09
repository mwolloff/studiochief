# CLAUDE_CONTEXT.md
# StudioChief — AI Session Context File
# Last updated: April 9, 2026
# PURPOSE: Paste this file at the start of any new Claude session to restore full project context instantly.

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

The frontend is plain HTML/CSS/vanilla JavaScript — NOT React, NOT a build system. All tools are embedded directly in the HTML file. JSX components must be converted to vanilla JS before integration.

The backend handles all Claude API calls. The frontend POSTs to the backend and polls for results.

---

## CURRENT FRONTEND FILE

**Active production file: studiochief_v12.html**

Earlier versions (v10, v11) are kept in the repo for reference but are not live. When Claude asks "which version," the answer is always the highest-numbered HTML file in the repo unless this file says otherwise.

---

## TOOL STATUS

### Tool 1 — Cash Flow Generator ✅ WORKING
- Generates a production cash flow schedule from a budget
- Four canonical phases: CASTING/PREP, PRODUCTION, POST, WRAP
- Known TODO: widen column B in output; document spread rule reasoning for 40 budget accounts
- Endpoint: /api/cashflow

### Tool 2 — Variance Report ⚠️ IN PROGRESS / BROKEN
- Compares actual spend vs. budget and generates a hot sheet + network-ready variance report
- Polling architecture is in place in app.py
- Problem: Claude API parse times are running 60-90 seconds and timing out
- Planned outputs: color-coded Hot Sheet (4 tiers) + network-ready Variance Report with blank explanation column
- Needs debugging via Network tab devtools
- Endpoint: /api/variance (route exists, unreliable)

### Tool 3 — Risk / Diligence Scanner 🔴 NOT STARTED
- Will scan production documents for risk flags
- Back-burnered until Tools 1 and 2 are stable

### Tool 4 — Tax Incentive Calculator ✅ BUILT (JSX), ⚠️ NOT YET WIRED INTO FRONTEND
- Fully built React/JSX component: tax-incentive-calculator.jsx
- Data file: incentives_data.json
- Rules document: TAX_INCENTIVE_RULES.md (the "brain" of the tool)
- 46 locations: 21 US states/territories + 25 international
- Features: production type filter, up to 3-location side-by-side comparison, uplift prompts, monetization logic, flag system (red/yellow/blue), 10% contingency deduction
- NEXT STEP: Convert JSX to vanilla JS and wire into studiochief_v12.html as a new tab alongside Tools 1-3

---

## KEY DATA FILES

| File | Purpose |
|---|---|
| TAX_INCENTIVE_RULES.md | Full rules, calculation logic, and design decisions for Tool 4. Read this before touching tax incentive code. |
| incentives_data.json | Raw incentive data for all 46 locations. Source: Entertainment Partners, 03/08-09/2026. |
| tax-incentive-calculator.jsx | Complete React component for Tool 4. Must be converted to vanilla JS for frontend integration. |
| studiochief_domain_rules.md | Domain rules for production budget account mapping (used by Tool 1 AI logic) |
| app.py | Flask backend. All API routes live here. |
| requirements.txt | Python dependencies |
| render.yaml | Render deployment config |
| gunicorn.conf.py | Gunicorn server config |

---

## BACKEND NOTES

- API key for Anthropic is set as an environment variable in Render — never hardcoded
- The API key needs rotating (flagged as a TODO)
- Polling pattern: frontend POSTs job, backend queues it, frontend polls /api/status/{job_id} until complete
- Tool 2 timeout issue is on the Claude API response side, not the polling architecture itself

---

## TOOL 4 INTEGRATION PLAN (what to do next)

1. Convert tax-incentive-calculator.jsx from React/JSX to vanilla JS/HTML
2. Add a "Tax Incentives" tab to the existing tab navigation in studiochief_v12.html
3. Embed the converted calculator inline in the HTML (no separate files, no build step)
4. Tool 4 does NOT need a backend API call — all calculation logic is client-side
5. Style to match existing StudioChief UI (dark mode default, indigo/slate accent colors)

---

## PRODUCT VISION / BACKLOG

- Tool 5 (future): AI video rights/clearance scanner
- Tool 6 (future): AI script risk scanner
- Bundle as a subscription suite for production professionals
- Intelligent section-to-phase mapping rule set for Tool 1 (Marc will provide domain rules like "gaming control = game show shoot cost")
- Additional US states pending for Tool 4: Missouri, New Mexico, New York, North Carolina, Ohio, Oregon, Pennsylvania, Rhode Island, South Carolina, Utah, Vermont, Virginia, Wisconsin, Wyoming (~14 states)

---

## MARC'S PREFERENCES FOR CLAUDE SESSIONS

- No EM dashes — use commas or other punctuation instead
- Direct communication, no fluff
- Don't ask questions Claude should already know from context
- When in doubt about which HTML version is current, fetch the repo and check the highest-numbered file
- Claude builds everything — assume no developer is available

---

## HOW TO START A NEW SESSION

1. Go to github.com/mwolloff/studiochief
2. Click CLAUDE_CONTEXT.md
3. Click Raw
4. Copy all text
5. Paste into new Claude chat with a note like: "Here's my context file, let's continue working on StudioChief."

---

*This file should be updated whenever a tool ships, a major bug is fixed, or the architecture changes.*
