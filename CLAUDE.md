# Mission Control Dashboard — Claude Project Instructions
**GO Advertising · Assurance Wireless / BGOA Partner Dashboard**
**Last updated: April 2026**

> This file is read by Claude at the start of every session. Update it whenever significant decisions are made.

---

## What This Project Is

A single-page real-time performance dashboard (`index.html`) for tracking Google Ads + Meta Ads campaigns promoting Assurance Wireless (Lifeline phone program). The dashboard auto-refreshes every 5 minutes from Google Sheets CSVs.

- **Live URL:** https://xavidalmau9.github.io/go-mission-control/
- **GitHub:** https://github.com/xavidalmau9/go-mission-control
- **All code is in one file:** `/Users/305partners/assurance/index.html`
- **Data reference:** `/Users/305partners/assurance/DATA_SOURCES.md`

---

## The #1 Rule

**Always prefer Assurance Wireless confirmed data (BGOA/BGOC) over Google Ads estimates.** We get paid on Assurance numbers, not Google's. If both sources have data for a date, use Assurance. Google data is only used as a fallback when Assurance hasn't reported yet.

---

## Business Context

- **Payout:** $25.00 per confirmed activation (fixed by Assurance Wireless)
- **Campaigns:** BGOA = Google Ads (goadvertising9@gmail.com) · BGOC = Meta Ads
- **Reporting lag:** Assurance reports activations T+1 — today's count is never available same day
- **30-day cookie window:** Sundays with $0 Google spend still generate activations (attributed from earlier clicks)
- **Activation rate lag:** Daily activation data takes ~5 days to fully settle

### CPA Tiers (HARDCODED — do not change without explicit instruction)
```
FANTASTIC : ≤ $10.00 per activation
EXCELLENT : ≤ $12.50 per activation
GOOD      : ≤ $15.00 per activation
POOR      : > $15.00 per activation
FATAL     : > $25.00 per activation (costs more than we earn)
```
App CPA thresholds are DERIVED: App CPA tier = Act CPA tier × activation_rate (never hardcoded)

### Original Projections (from projections spreadsheet — confirmed correct)
| Month | Projected Activations |
|-------|----------------------|
| Jan 2026 | 0 (testing month) |
| Feb 2026 | 500 |
| Mar 2026 | 1,000 |
| Apr 2026 | 2,000 |
| May 2026 | 3,000 |
| Jun 2026 | 4,000 |

### Confirmed Paid History
| Month | BGOA Acts | Paid |
|-------|-----------|------|
| Dec 2025 | 46 | $1,150 |
| Jan 2026 | 415 | $10,375 |
| Feb 2026 | 552 | $13,800 |
| Mar 2026 | 1,188 | $29,700 (pending) |
| Apr 2026 | in progress | — |

---

## Data Sources

### Google Ads → Google Sheets (auto-push hourly)
Spreadsheet: `1ZLzpR9oGk5y2amRr0jS4QPVIIzC44m1VfBRIxDK64Vg`

| Key | Sheet | What it contains |
|-----|-------|-----------------|
| `daily` | DailyCampaign | Date, Campaign, Cost, Conversions, Clicks, Impressions |
| `devices` | Devices | Date, Campaign, Device, Cost, Conversions |
| `geo` | Geo | Date, Campaign, Region (zip codes — dashboard converts to state names) |
| `hourly` | Hourly | Hour, Cost, Conversions |
| `keywords` | Keywords | Date, Campaign, Keyword, MatchType, Cost, Conversions, Impressions, Clicks |
| `searchTerms` | SearchTerms | Date, Campaign, SearchTerm, Cost, Conversions, Impressions, Clicks |

**Script note:** `LAST_90_DAYS` is an invalid AWQL constant. Script uses `dateRange(60)` dynamic helper instead.

### Assurance Wireless Daily Tracking (manually updated daily)
Spreadsheet: `1Yr0gtdyf5x0TOjjzrGhCYRjZFjxPehKCBJwwlXorCxw`

| Key | Sheet | What it contains |
|-----|-------|-----------------|
| `bgoa` | ad spend BGOA | Daily Google Ads spend + Assurance confirmed activations |
| `bgoc` | ad spend BGOC | Daily Meta Ads spend + Assurance confirmed activations |
| `monthly` | monthly | Monthly summary |
| `gva` | google vs assurance | Comparison of Google conv vs Assurance activations |

**Column names (bgoa/bgoc):** `Day`, `Ad Spend`, `Applications`, `Approvals`, `Approval Percentage %`, `Activations`, `Activation Percentage % / Applications`, `REVENUE $`, `ACTUAL RECEIVED`, `Application Cost`, `Approved Application Cost`, `7 Day Average Avg CPA (Activations)`, `Monthly Activations CPA (Activations)`

**BGOA CSV quirk:** Has blank `,,,,` separator rows before the header. `parseCSV()` strips these with `.filter(l => l.replace(/[,\s"]/g, '') !== '')`.

### Projections vs Reality Tracker
Spreadsheet: `1JQWn6RHVuOVZWPnVgxFRXBFGka6ae7qYQ6Jik74t60Q`
Key: `projVsReal` (GID 849051862)

---

## Key Functions — What They Do and Why

### `parseBGOARow(r)` 
Parses a single row from BGOA or BGOC CSV. Returns `{ date, spend, applications, approvals, activations, revenue, ... }` or `null` if the row isn't a date row (skips totals/blank rows by checking `day.match(/^\d{4}-\d{2}-\d{2}$/)`).

### `getLiveActRate()`
Returns the activation rate (acts/apps) from the last **settled** month. After the 15th of each month, the prior month is settled. Falls back to March 2026, then 55.12% baseline. Updates the global `ACT_RATE` variable.

### `getPeriodActRate(from, to)`
**NEW (Apr 2026)** — Returns actual activation rate for a specific date range from BGOA daily data, excluding the last 5 days (not yet settled). Returns `{ rate, days, acts, apps }` or `null` if insufficient data. Used by the Activation Rate KPI tile so it shows real data, not always the static monthly rate.

### `getSettledRateLabel()`
Returns a human-readable label for the current settled rate source, e.g. "Mar 26 settled".

### `getAppTiers(actRate)`
Derives App CPA thresholds from ACT_TIERS × activation rate. Never hardcode app CPA values — always call this.

### `buildKPIs(daily)`
Builds KPI summary for date range. Uses BGOA+BGOC confirmed activations when available. Falls back to `conversions × ACT_RATE` estimate only if no Assurance data exists for the range. Returns `{ spend, conversions, activations, revenue, profit, activationCPA, googleCPA, isConfirmed, confirmedSources }`.

### `buildChartDaily(daily)`
Merges Google Ads rows (spend/apps) with BGOA confirmed activations. Step 1: Google Ads rows → spend + apps per day. Step 2: BGOA overlay → confirmed activations (including Sundays with $0 spend). Step 3: estimate for any remaining days with no BGOA data.

### `getPeriodMeta(daily)`
Computes date range label and day counts using **calendar math** (not data rows), so Sundays and no-ad days count correctly.

### `filterData()`
Applies active date range + campaign filter to ALL data sources including keywords and search terms (ALL panels are date-filtered).

### `applyFilters()`
Main re-render function. Called when date range or campaign changes, and after Phase 2 data loads. ALL render calls go through here.

### `buildDevices(devices)`
Uses partial string matching (`k.includes('mobile')`, `k.includes('computer')`, `k.includes('tablet')`) because Google Ads reports full strings like "Mobile devices with full browsers".

### `buildStates(geo)`
Auto-detects numeric geo codes (zip codes OR Google criterion IDs). Takes first 5 digits as zip prefix → `zipToStateName()` → aggregates by state name. Handles the fact that Google Ads Geo tab writes zip codes, not state names.

### `zipToStateName(zip)`
Maps 3-digit zip prefix to US state name. Handles all 50 states + DC + PR.

### `renderAssuranceIntelligence()`
Renders the full Assurance Intelligence section: monthly table, CPA trend chart, BGOC panel, Projections vs Reality. Projections come from `ORIG_PROJ` constant (correct values, not shifted). Actuals pulled live from BGOA+BGOC monthly aggregation. April shows live projected full-month total.

### `fetchAllSheets()`
Two-phase loading:
- **Phase 1** (awaited): bgoa, daily, devices, hourly, geo → render immediately
- **Phase 2** (background): bgoc, keywords, searchTerms, monthly, gva, projVsReal → calls `applyFilters()` when done (NOT `renderKeywords(RAW.keywords)` directly — that bypasses date filtering)

---

## Things That Were Fixed and Why (Don't Re-Break)

| Issue | What Was Wrong | Fix |
|-------|---------------|-----|
| Google Ads Script error | `LAST_90_DAYS` is invalid AWQL | Use `dateRange(60)` dynamic helper |
| BGOA CSV blank rows | Blank separator rows before header were treated as header | `parseCSV` filters blank rows |
| Devices showing 1 device | Exact string match `'mobile'` failed vs `'Mobile devices with full browsers'` | Partial `.includes()` matching |
| Day counts wrong | Counted data rows, missed Sundays | Calendar math in `getPeriodMeta` |
| Today shows activations | T+1 lag — impossible to have same-day data | TODAY view shows "—" for activations |
| Approval Rate tile wrong | Dividing BGOA activations by Google conversions (different things) | Replaced with real period activation rate |
| Activation Rate static | Always showed Mar 2026 rate regardless of date filter | `getPeriodActRate()` computes real rate from BGOA daily data, 5-day lag |
| Geo shows zip codes | Google Ads reports zip codes not state names | `zipToStateName()` lookup + aggregate by state |
| Keywords not date-filtering | Phase 2 overwrote with `RAW.keywords` (unfiltered) | Phase 2 calls `applyFilters()` |
| Projections wrong | Values were shifted +1 month in hardcoded array | `ORIG_PROJ` constant with correct values, actuals pulled live |
| `maxCpa` in devices wrong | Included spend/apps values, dwarfed CPA scale | Only compare the 3 device CPA values |

---

## What "TODAY" Means in This Dashboard

- **Today**: Can only show applications (Google Ads conversions). Never activations (T+1 lag).
- **Yesterday**: Shows confirmed activations from BGOA (pulled `bgoaYest.activations`)
- **Last 7/14/30 days**: Calendar days, not data rows. Sundays count even with $0 spend.
- **"LAST X DAYS"**: Excludes today. Today's data is partial and unreliable for CPA calculations.

---

## What NOT to Do

- **Never hardcode App CPA thresholds** — always derive from `getAppTiers(ACT_RATE)`
- **Never hardcode activation rate** — use `getPeriodActRate()` for ranges, `getLiveActRate()` for defaults
- **Never use Google conversions as a proxy for activations** when BGOA data is available
- **Never add a daily spend target** — budget changes daily (use MTD average instead)
- **Never cap date range to 30 days** — the Google Ads script goes back 60 days
- **Never call `renderKeywords(RAW.keywords)` directly** — always go through `applyFilters()`
- **Never show today's activations** — always "—" with a note about T+1
- **Do not use `LAST_90_DAYS` or `LAST_60_DAYS` in AWQL** — these are invalid; use `dateRange(N)` helper

---

## Pending / Known Issues (as of Apr 16, 2026)

- **Device panel** sometimes shows "AWAITING LIVE DATA" — root cause still unclear (likely a rendering timing issue or Google Ads Devices tab temporarily empty). Error is caught silently. If it happens: reload the page.
- **Budget/bid change history** — user wants to see daily change log. Requires Google Ads Script modification to write to a BudgetHistory tab. Not yet implemented.
- **CampaignMeta tab** — not yet published by user. Dashboard falls back to MTD avg for live budget display.
- **BGOC (Meta)** — very early data (started Apr 2026). CPA will normalize as volume grows.
