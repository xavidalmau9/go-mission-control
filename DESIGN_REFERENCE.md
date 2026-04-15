# GO Advertising · Mission Control — Design Reference
**Locked at commit `45e3761` · Tag: `v1.0-design-locked`**

This file exists to protect the dashboard layout. When updating data, only touch the `FALLBACK` object inside `index.html`. Never modify CSS, layout structure, or chart configuration.

---

## What to Update (Data Only)

Inside `index.html`, find the `const FALLBACK = { ... }` block and update:

| Field | Location | What it is |
|---|---|---|
| `totals.activations` | FALLBACK.totals | MTD activations |
| `totals.spend` | FALLBACK.totals | MTD ad spend |
| `totals.googleCPA` | FALLBACK.totals | Google CPA |
| `totals.activationCPA` | FALLBACK.totals | Activation CPA |
| `totals.estProfit` | FALLBACK.totals | Estimated profit |
| `daily[]` | FALLBACK.daily | Per-day rows (last 30 days) |
| `devices{}` | FALLBACK.devices | Desktop/tablet/mobile CPA |
| `monthly[]` | FALLBACK.monthly | Monthly trajectory bars (see rules below) |
| `MAR_1_14` | renderKPIs() | Prior month 1–14 activations for MTD comparison |

### monthly[] entry rules — MUST follow these exactly

Each entry has: `label`, `val`, `target`, `color`, and optionally `isDollar` and `proj`.

- **Activation rows** (DEC, JAN, FEB, MAR, APR): NO `isDollar` field. `val` = activation count. Will display as plain number e.g. `1,483` — never with `$`.
- **Revenue rows** (REVENUE SETTLED, INCL. MAR PENDING): MUST have `isDollar: true`. `val` = dollar amount. Will display with `$`.
- **`proj` field**: Set on completed months where a projection existed. Drives the green `▲ BEAT +X` badge. Only set when actual surpassed the projection.

```javascript
// CORRECT example
{label:'FEB 2026',         val:552,   target:3000,   color:'var(--amber)',  proj:500},   // activation, beats proj
{label:'REVENUE SETTLED',  val:25325, target:100000, color:'var(--green)',  isDollar:true}, // dollar row
```

Current projection baselines (update when targets change):
- JAN 2026: proj 300 → actual 415 → ▲ BEAT +115
- FEB 2026: proj 500 → actual 552 → ▲ BEAT +52
- MAR 2026: proj 1,000 → actual 1,483 → ▲ BEAT +483

---

## What to NEVER Touch

- All `<style>` CSS (design tokens, spacing, fonts, colors)
- HTML structure (panel layout, grid, KPI row, chart wrapper)
- `renderChart()`, `renderKPIs()`, `renderDevices()`, `renderTrajectory()` — logic only, not structure
- Chart height: **410px** (`.chart-wrap`)
- KPI font size: **21px** (`.kpi-val`)

---

## Key Design Values (locked)

```css
--bg: #050810
--surface: #0c1120
--accent: #38bdf8   /* cyan */
--green: #34d399
--amber: #fbbf24
--red: #f87171

.chart-wrap     { height: 410px }
.kpi            { padding: 13px 14px 11px }
.kpi-val        { font-size: 21px }
.kpi-row        { margin-bottom: 14px; gap: 10px }
.panel          { padding: 15px }
.panel-hdr      { margin-bottom: 12px }
.header         { padding-bottom: 16px; margin-bottom: 18px }
```

---

## KPI Business Rules (locked)

| Metric | Value |
|---|---|
| Activation rate | 55.12% of applications |
| Multiplier | 1.814 (= 1 / 0.5512) |
| Google CPA EXCELLENT | ≤ $5.51 |
| Google CPA GOOD | ≤ $6.89 |
| Google CPA AVERAGE | ≤ $8.27 |
| Google CPA POOR | > $8.27 |
| Activation CPA FANTASTIC | ≤ $10.00 |
| Activation CPA EXCELLENT | ≤ $12.50 |
| Activation CPA GOOD | ≤ $15.00 |
| Activation CPA POOR | > $15.00 |

---

## Layout Structure

```
HEADER
KPI ROW (7 columns)
MAIN GRID (2/3 left · 1/3 right)
  Left column (flex column, fills full height):
    ├── Daily Performance Chart (410px, last 30 days from FALLBACK)
    └── Device Performance (stretches to fill remaining height)
  Right column:
    ├── Campaign Scorecard
    └── Daily Intel Feed
SUMMARY + PROJECTION BANNER (3 columns)
STATE HEATMAP · HOURLY HEATMAP
MONTHLY TRAJECTORY
```

---

## Data Flow

- **FALLBACK** renders immediately on load (always the source of truth for the chart)
- **Live Google Sheets** overrides KPIs, devices, and summary — but NOT the chart
- **Chart always uses FALLBACK.daily** (so partial sheet data never truncates it)
- Auto-refreshes every 5 minutes from Google Sheets

---

## GitHub Pages

Live URL: https://xavidalmau9.github.io/go-mission-control/
Repo: https://github.com/xavidalmau9/go-mission-control
Deploy: push to `main` → auto-deploys in ~1 min (hard refresh with ⌘+Shift+R)

---

## To Update Data Only (safe workflow)

1. Open `index.html`
2. Find `const FALLBACK = {` (around line 372)
3. Update numbers inside `totals`, `daily`, `devices`, `monthly`
4. Save → `git add index.html && git commit -m "Data update [date]" && git push origin main`
5. Hard refresh the live URL after ~1 minute
