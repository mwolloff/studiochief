# TOOL3_RISK_RULES.md
# StudioChief — Risk / Diligence Scanner Rules
# Last updated: April 9, 2026
# Paste this alongside CLAUDE_CONTEXT.md when working on Tool 3.

---

## CURRENT STATUS

Tool 3 has NOT been built yet. This file captures intent and early reasoning so that when development begins, the context is not lost.

---

## WHAT THIS TOOL WILL DO

The Risk/Diligence Scanner will analyze production documents and flag potential financial, legal, and operational risks before they become problems. The target users are production executives and physical producers who review budgets, contracts, and schedules and need a fast second opinion before signing off.

---

## INTENDED INPUT TYPES

- Production budgets (Excel)
- Deal memos and talent contracts (PDF)
- Production schedules (PDF or Excel)
- Cost reports (Excel or PDF)
- Vendor agreements (PDF)

---

## INTENDED OUTPUT

A risk report organized by severity, with each flag including:
- What the risk is
- Where it was found (document, section, line item)
- Why it is flagged
- Recommended action or question to ask

---

## EARLY RISK CATEGORIES (to be expanded)

### Budget risks
- Line items with no contingency buffer
- Accounts where the budget is lower than industry norms for the production type and scale
- Missing standard budget lines (e.g. no E&O insurance line, no legal fee)
- Contractual fees that appear unusually high or low as a percentage of total budget
- Prize money or talent fees that are not capped

### Schedule risks
- Shoot days that exceed standard guild or network limits
- Turnaround violations between shoot days
- Post schedule that does not allow enough time for network review cycles
- Delivery date that conflicts with shoot end date given standard post timelines

### Contract / deal memo risks
- Missing standard protections (e.g. no force majeure clause)
- Talent deals without exclusivity provisions where exclusivity would be expected
- Fee structures that could create overages (e.g. escalating weekly rates with no cap)
- Missing credit language

### Operational risks
- Locations without confirmed permits
- International shoots without confirmed visa/work permit language
- Crew deals that reference rates below current guild minimums

---

## DESIGN PRINCIPLES

- Flags should be actionable, not just observations. Every flag should include a "so what" and a recommended next step.
- The tool should not make legal conclusions. It flags for review, not for verdict.
- False positives are acceptable. A missed risk is worse than an unnecessary flag.
- Output should be scannable in under 5 minutes. Executives do not read walls of text.

---

## KNOWN UNKNOWNS

- Input format handling: different studios and production companies format documents very differently. The parser will need to be flexible.
- Guild rate tables: to flag below-minimum rates, the tool needs current guild rate data. This is a data maintenance challenge.
- Scope: not yet decided whether Tool 3 covers all document types from day one or starts with budgets only.

---

## DEPENDENCY ON OTHER TOOLS

- Tool 3 may share budget parsing logic with Tool 1 (Cash Flow Generator). Reuse that parsing code where possible.
- Tool 3 may eventually feed into Tool 2 (Variance Report) by flagging budget lines that are structurally at risk before production begins.

---

*Update this file as design decisions are made, use cases are clarified, or development begins.*
