# TOOL2_VARIANCE_RULES.md
# StudioChief — Variance Report Rules
# Last updated: April 9, 2026
# Paste this alongside CLAUDE_CONTEXT.md when working on Tool 2.

---

## WHAT THIS TOOL DOES

The Variance Report tool takes a production cost report (uploaded as a file) and compares actual spend vs. budget for every line item. It produces two outputs: a color-coded Hot Sheet for internal use, and a network-ready Variance Report with a blank explanation column that the production fills in before sending to the network.

---

## CURRENT STATUS

- Polling architecture is in place in app.py
- Routes exist at /api/variance
- Tool is timing out because Claude API parse times are running 60-90 seconds, exceeding the timeout threshold
- The polling architecture itself is correct. The problem is on the Claude API response side.
- Next debugging step: use the browser Network tab devtools to trace exactly where the timeout is occurring

---

## INPUT: COST REPORT PARSING RULES

### How to parse the cost report
- Split into two separate AI calls to avoid timeout: above-the-line (EA sections) and below-the-line (EB, ED, EE sections)
- This two-call split is intentional and by design, not a workaround
- Skip grand totals and section subtotals in the output
- Include ALL line items, including zero-balance lines
- Overages may be shown as NEGATIVE variance in some cost report formats. Handle both conventions.

### What to extract per line item
- Account number
- Account description/label
- Budget amount
- Actual amount (spent to date)
- Variance amount (budget minus actual, or actual minus budget depending on format)
- Variance percentage

---

## OUTPUT 1: HOT SHEET

### Purpose
Internal document. Fast visual read of where the production is bleeding or saving money. Color-coded by severity.

### Color tier system (default threshold: 10%)
- 🔴 Red (31%+ over): Severely over budget
- 🟠 Red-Orange (21-30% over): Significantly over budget
- 🟡 Orange (11-20% over): Moderately over budget
- 🟨 Yellow (1-10% over): Slightly over budget
- 🔵 Blue (10%+ under): Under budget
- No color: Within threshold (within +/- 10%)

### Hot Sheet display rules
- Show only lines that are outside the threshold (colored lines)
- Sort by severity: biggest overages first
- Show: account number, account name, budget, actual, variance $, variance %
- Flag any line item where actual spend has already exceeded the project cap for that account

---

## OUTPUT 2: NETWORK-READY VARIANCE REPORT

### Purpose
External document sent to the network or studio. Professional format. Includes an explanation column that the production fills in manually before sending.

### Structure
- All line items included (not just overages), matching the structure of the original cost report
- Columns: Account Number, Account Name, Budget, Actual, Variance ($), Variance (%), Explanation
- Explanation column is BLANK in the tool output. Production fills this in.
- No color coding in the network version (clean, professional appearance)
- Header includes: Production title, episode or season, reporting period, date generated

### Formatting rules
- Numbers formatted with commas and two decimal places
- Negative variances (overages) shown in parentheses: (12,500.00)
- Section subtotals included but clearly labeled
- Grand total at the bottom

---

## CALCULATION RULES

### Variance calculation
- Variance $ = Budget minus Actual (positive = under budget, negative = over budget)
- Variance % = Variance $ divided by Budget, times 100
- If budget is zero and actual is non-zero, flag as "No Budget / Unbudgeted Spend"
- If both budget and actual are zero, show as clean (no flag)

### Contingency handling
- Contingency is a real budget line and should be included as a line item
- Do NOT net contingency against overages automatically
- Show contingency balance as-is, let the production team decide how to use it

---

## BACKEND / API NOTES

- Endpoint: /api/variance (route exists)
- Two-call architecture: Call 1 parses ATL, Call 2 parses BTL
- Polling: frontend polls /api/status/{job_id} until both calls complete
- Known issue: 60-90 second Claude parse time causes timeout before polling resolves
- Possible fix approaches: increase timeout threshold on Render, chunk the input further, or use streaming response

---

## KNOWN ISSUES / TODO

- Timeout issue unresolved as of April 2026
- Network tab debugging not yet performed
- Hot Sheet threshold (10%) should eventually be user-configurable, not hardcoded
- Color tier labels may need adjustment once real cost reports are tested against the tool

---

*Update this file whenever: timeout issue is resolved, output format changes, new cost report formats are encountered, or color tier logic changes.*
