# TOOL2_VARIANCE_RULES.md
# StudioChief — Cost & Variance Report Rules
# Last updated: April 9, 2026
# Paste this alongside CLAUDE_CONTEXT.md when working on Tool 2.

---

## TOOL NAME

"Cost & Variance Report" — this is the official name as of v25. Previously called "Variance Report." Update everywhere: dashboard card, tool header, nav crumb, download button labels, JS labels.

---

## WHAT THIS TOOL DOES

Takes a production cost report (uploaded as PDF) and compares actual spend vs. budget for every line item. Produces two outputs in one Excel file: a color-coded Hot Sheet for internal use, and a network-ready Variance Report with a blank explanation column that the production fills in before sending to the network.

---

## CURRENT STATUS

- Polling architecture is in place in app.py
- Routes exist at /api/variance
- Tool is timing out — Claude API parse times running 60-90 seconds, exceeding timeout threshold
- Polling architecture itself is correct. Problem is on the Claude API response side.
- Next debugging step: use browser Network tab devtools to trace exactly where timeout occurs

---

## INPUT: COST REPORT PARSING RULES

- Split into two separate AI calls: above-the-line (EA sections) and below-the-line (EB, ED, EE sections)
- This two-call split is intentional and by design
- Skip grand totals and section subtotals in output
- Include ALL line items including zero-balance lines
- Overages may be shown as NEGATIVE variance in some cost report formats — handle both conventions

Per line item extract: account number, account description, budget amount, actual amount, variance amount, variance percentage.

---

## OUTPUT 1: HOT SHEET

Internal document. Color-coded by severity (default threshold 10%).

| Color | Threshold |
|---|---|
| 🔴 Red | 31%+ over budget |
| 🟠 Red-Orange | 21-30% over budget |
| 🟡 Orange | 11-20% over budget |
| 🟨 Yellow | 1-10% over budget |
| 🔵 Blue | 10%+ under budget |
| No color | Within threshold |

Show only lines outside threshold, sorted by severity. Show: account number, name, budget, actual, variance $, variance %.

---

## OUTPUT 2: NETWORK-READY VARIANCE REPORT

External document. All line items included. Columns: Account Number, Account Name, Budget, Actual, Variance ($), Variance (%), Explanation. Explanation column is BLANK — production fills in. No color coding. Header includes: production title, episode/season, reporting period, date generated. Numbers formatted with commas and two decimal places. Negative variances in parentheses. Section subtotals included.

---

## CALCULATION RULES

- Variance $ = Budget minus Actual (positive = under, negative = over)
- Variance % = Variance $ divided by Budget times 100
- Budget zero, actual non-zero: flag as "No Budget / Unbudgeted Spend"
- Both zero: clean, no flag
- Contingency: include as real budget line, do NOT net against overages automatically

---

## KNOWN ISSUES / TODO

- Timeout issue unresolved as of April 2026
- Network tab debugging not yet performed
- Hot Sheet threshold (10%) should eventually be user-configurable
- Visual density: tool feels text-heavy/cramped — polish pass planned for v26

---

*Update when: timeout is resolved, output format changes, new cost report formats encountered, name changes anywhere.*
