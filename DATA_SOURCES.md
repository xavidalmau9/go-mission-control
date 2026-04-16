# Mission Control · Data Sources Reference
**GO Advertising · Assurance Wireless / BGOA Partner Dashboard**
Last updated: April 2026

---

## 1. Google Ads Script → Google Sheets (Auto-push hourly)

**Spreadsheet ID:** `1ZLzpR9oGk5y2amRr0jS4QPVIIzC44m1VfBRIxDK64Vg`
**Script location:** Google Ads → Tools → Scripts → "Mission Control Data Push"
**Canonical script file:** `/Users/305partners/assurance/google-ads-script.js`
**Schedule:** Every hour
**Access email:** `goadvertising9@gmail.com` (must be editor on sheet)

| Sheet Tab | GID | Published CSV URL |
|-----------|-----|-------------------|
| DailyCampaign | 1318122650 | `https://docs.google.com/spreadsheets/d/e/2PACX-1vQSGFATGsiH9UxFDJPkIrDpdHoDTivZRDEm2zYxydUSZhyTRK91KnNFmYX7qRvjkMwRcP6eYypCF9z2/pub?gid=1318122650&single=true&output=csv` |
| Devices | 728314626 | `https://docs.google.com/spreadsheets/d/e/2PACX-1vQSGFATGsiH9UxFDJPkIrDpdHoDTivZRDEm2zYxydUSZhyTRK91KnNFmYX7qRvjkMwRcP6eYypCF9z2/pub?gid=728314626&single=true&output=csv` |
| Geo | 1821022449 | `https://docs.google.com/spreadsheets/d/e/2PACX-1vQSGFATGsiH9UxFDJPkIrDpdHoDTivZRDEm2zYxydUSZhyTRK91KnNFmYX7qRvjkMwRcP6eYypCF9z2/pub?gid=1821022449&single=true&output=csv` |
| Hourly | 1038380061 | `https://docs.google.com/spreadsheets/d/e/2PACX-1vQSGFATGsiH9UxFDJPkIrDpdHoDTivZRDEm2zYxydUSZhyTRK91KnNFmYX7qRvjkMwRcP6eYypCF9z2/pub?gid=1038380061&single=true&output=csv` |
| Keywords | 373579478 | `https://docs.google.com/spreadsheets/d/e/2PACX-1vQSGFATGsiH9UxFDJPkIrDpdHoDTivZRDEm2zYxydUSZhyTRK91KnNFmYX7qRvjkMwRcP6eYypCF9z2/pub?gid=373579478&single=true&output=csv` |
| SearchTerms | 1994073909 | `https://docs.google.com/spreadsheets/d/e/2PACX-1vQSGFATGsiH9UxFDJPkIrDpdHoDTivZRDEm2zYxydUSZhyTRK91KnNFmYX7qRvjkMwRcP6eYypCF9z2/pub?gid=1994073909&single=true&output=csv` |

**To publish new sheets:** Open spreadsheet → File → Share → Publish to web → select tab → CSV → Publish

---

## 2. Assurance Wireless Daily Tracking (Manually updated)

**Spreadsheet ID:** `1Yr0gtdyf5x0TOjjzrGhCYRjZFjxPehKCBJwwlXorCxw`
**Spreadsheet URL:** https://docs.google.com/spreadsheets/d/1Yr0gtdyf5x0TOjjzrGhCYRjZFjxPehKCBJwwlXorCxw/edit
**Contains:** Real Assurance-confirmed activations (not Google estimates), daily since Dec 19, 2025
**Updated:** Daily by hand

| Sheet Tab | GID | Published CSV URL |
|-----------|-----|-------------------|
| ad spend BGOA (Google Ads) | 1141776879 | `https://docs.google.com/spreadsheets/d/e/2PACX-1vRjprUFe1FCLx6TolRC-Ruioin9FGWQW32nT7m90EqM6r_R95O67Cx4gJe9hWxXIRvc9cfFmca3RwV1/pub?gid=1141776879&single=true&output=csv` |
| ad spend BGOC (Meta Ads) | 1214117353 | `https://docs.google.com/spreadsheets/d/e/2PACX-1vRjprUFe1FCLx6TolRC-Ruioin9FGWQW32nT7m90EqM6r_R95O67Cx4gJe9hWxXIRvc9cfFmca3RwV1/pub?gid=1214117353&single=true&output=csv` |
| monthly | 1008697328 | `https://docs.google.com/spreadsheets/d/e/2PACX-1vRjprUFe1FCLx6TolRC-Ruioin9FGWQW32nT7m90EqM6r_R95O67Cx4gJe9hWxXIRvc9cfFmca3RwV1/pub?gid=1008697328&single=true&output=csv` |
| google vs assurance | 946614110 | `https://docs.google.com/spreadsheets/d/e/2PACX-1vRjprUFe1FCLx6TolRC-Ruioin9FGWQW32nT7m90EqM6r_R95O67Cx4gJe9hWxXIRvc9cfFmca3RwV1/pub?gid=946614110&single=true&output=csv` |

**Column reference (BGOA/BGOC tabs):**
- `Day` — date YYYY-MM-DD
- `Ad Spend` — daily Google/Meta spend
- `Applications` — total applications submitted
- `Approvals` — approved applications
- `Approval Percentage %` — approval rate
- `Activations` — confirmed Assurance activations (REAL, not estimated)
- `Activation Percentage % / Applications` — activation rate
- `REVENUE $` — revenue at $25/activation
- `ACTUAL RECEIVED` — cash actually received (used for settled months)
- `Application Cost` — spend ÷ applications
- `Approved Application Cost` — spend ÷ approvals
- `7 Day Average Avg CPA (Activations)` — rolling 7-day activation CPA
- `Monthly Activations CPA (Activations)` — month-to-date activation CPA

**Important notes:**
- BGOA activation numbers may differ from Google Ads conversions due to 30-day cookie window
- Activations backfill 7–10 days after month close — final numbers come later
- "ACTUALLY PAID" rows show confirmed Assurance payment amounts

**Confirmed paid history:**
| Month | Activations (BGOA) | Revenue Paid |
|-------|--------------------|--------------|
| DEC 2025 | 46 | $1,150 |
| JAN 2026 | 415 | $10,375 |
| FEB 2026 | 552 | $13,800 |
| MAR 2026 | 1,188 | $29,700 (PENDING) |
| APR 2026 | in progress | — |

---

## 3. Reality vs Projections Tracker (Manually updated)

**Spreadsheet ID:** `1JQWn6RHVuOVZWPnVgxFRXBFGka6ae7qYQ6Jik74t60Q`
**Spreadsheet URL:** https://docs.google.com/spreadsheets/d/1JQWn6RHVuOVZWPnVgxFRXBFGka6ae7qYQ6Jik74t60Q/edit
**Contains:** Original projections vs actual monthly performance, ROI tracking

| Sheet Tab | GID | Published CSV URL |
|-----------|-----|-------------------|
| sheet 1 (actuals vs projections) | 849051862 | `https://docs.google.com/spreadsheets/d/e/2PACX-1vQ02ZfKSDaRCTuBhGkzwR_OMFObJiaG0-t7BNUOvKGFaSyG_pVygMw9EbhWozB-_gNQDjW6-Zm4xLc4/pub?gid=849051862&single=true&output=csv` |
| original plan/projections | 0 | (reference only, not loaded in dashboard) |

**All-time summary (as of Apr 2026):**
- Total gross revenue: ~$83,075
- Total net profit: ~$35,110
- Overall ROI: ~73%
- Total activations: ~3,076

---

## 4. Key Business Constants

| Constant | Value | Notes |
|----------|-------|-------|
| Payout per activation | $25.00 | Assurance Wireless BGOA rate |
| Activation rate (Google) | 55.12% | Google conversions → actual activations (Mar 2026 ratio) |
| Activation CPA multiplier | 1.814× | Applied to App CPA to get Activation CPA |
| App CPA target | $6.41 | Break-even / target |
| Activation CPA target | <$10 | Primary optimization goal |
| Daily budget target | $1,800/day | Current scale target |

---

## 5. Google Ads Account Info

- **Account:** GO Advertising (goadvertising9@gmail.com)
- **Campaigns:** AW LIFELINE, AW SEARCH · SS, PRIME TIME · SS
- **Landing page:** BGOA (assurancewireless.com affiliate)

---

## 6. Dashboard Repository

- **GitHub:** https://github.com/xavidalmau9/go-mission-control
- **Live URL:** https://xavidalmau9.github.io/go-mission-control/
- **Main file:** `index.html`
- **Auto-refresh:** Every 5 minutes client-side

---

## 7. Dashboard Engineering Notes

> Full engineering reference is in `CLAUDE.md` (read by Claude at session start).
> This section summarizes key decisions and session history.

### Core Architecture
- **Data priority**: BGOA/BGOC confirmed data ALWAYS beats Google estimates
- **T+1 reporting**: Today's activations are always unknown — dashboard shows "—" for today
- **30-day cookie window**: Sundays ($0 spend) still have BGOA activations — merged into chart
- **ACT_TIERS (hardcoded only)**: FANTASTIC≤$10 · EXCELLENT≤$12.50 · GOOD≤$15 · POOR>$15 · FATAL>$25
- **App CPA thresholds**: Always derived: App CPA = Act CPA × activation_rate (never hardcoded)
- **Date filtering**: ALL panels (KPIs, chart, geo, devices, keywords, search terms) respect date filter
- **Phased loading**: Phase 1 blocks render (bgoa, daily, devices, hourly, geo). Phase 2 background (bgoc, keywords, searchTerms, monthly, gva, projVsReal) → calls `applyFilters()` when done

### Activation Rate Logic (updated Apr 2026)
1. `getPeriodActRate(from, to)` — computes real rate from BGOA daily data for the selected range, excluding last 5 unsettled days. Shows "✓ REAL · Xd · Y/Z apps" when sufficient data
2. `getLiveActRate()` — settled monthly rate (last closed month). Fallback when period data insufficient
3. `ACT_RATE_BASELINE = 0.5512` — last resort fallback only

### Correct Original Projections
| Month | Projected | Actual | Beat? |
|-------|-----------|--------|-------|
| Jan 2026 | 0 (testing) | 415 | — (no target) |
| Feb 2026 | 500 | 552 | ✅ +10% |
| Mar 2026 | 1,000 | 1,188+ | ✅ +19%+ |
| Apr 2026 | 2,000 | in progress | on track |
| May 2026 | 3,000 | — | — |

### Session History — What Was Fixed and When

**Session 1 (Apr 2026 — prev context):**
- Google Ads Script: fixed `LAST_90_DAYS` invalid AWQL → `dateRange(60)`
- BGOA CSV blank separator rows crashing parseCSV
- Device panel partial matching for "Mobile devices with full browsers"
- Heatmap square sizing
- T+1 enforcement: TODAY never shows activations
- CPA tiers centralized in `ACT_TIERS` constant
- Sunday activations merged into chart from BGOA (30-day cookie window)
- Day counts fixed: calendar math not data rows
- BGOC (Meta) activations merged into confirmed totals

**Session 2 (Apr 15-16, 2026):**
- Activation Rate tile: was showing `activations/google_conversions` (garbage) → now shows real period rate from BGOA via `getPeriodActRate()`
- Geo panel v1: zip codes → state names via `zipToStateName()` + handles 7-digit Google criterion IDs
- Projections vs Reality: numbers were shifted +1 month — fixed to correct values, actuals now pulled live from BGOA+BGOC
- Keywords/Search Terms not date-filtering: Phase 2 background callback was calling `renderKeywords(RAW.keywords)` directly (bypasses date filter) → fixed to call `applyFilters()`
- `maxCpa` in device panel was comparing CPA against spend values — fixed to only compare 3 CPA values
- All build functions in `applyFilters()` wrapped in try/catch so errors don't kill downstream panels
- `CLAUDE.md` created as permanent project memory file

**Session 3 (Apr 16, 2026):**
- **`MULT` undefined → devices frozen**: `renderDevices` used `appCpa * MULT` but `MULT` was never defined. JavaScript threw silent `ReferenceError` caught by try/catch → panel stuck at "AWAITING LIVE DATA". Fixed: `const actCpa = ACT_RATE > 0 ? appCpa / ACT_RATE : 0`
- **Geo showing only MD and CA (root cause found)**: All Google state criterion IDs 21132–21183 start with "211x". `zipToStateName("211xx")` mapped them all to Maryland (zip prefix 211 = Maryland range). The 9070xx California metro IDs happened to map to CA. Only 2 states ever showed regardless of date range.
- **Google Ads Script geo field fix**: `Region` is NOT a valid AWQL field in `GEO_PERFORMANCE_REPORT` (throws InputError). Rewrote `pushGeo()` to use `RegionCriteriaId` + `US_STATE_CRITERIA` lookup table. Script now writes full state names ("Maryland", "California") directly. Ran successfully: 5,738 state-level rows across 50 states.
- **`normDateStr()` added**: Google Sheets tabs write dates in different formats (M/D/YYYY vs YYYY-MM-DD). Raw string comparison silently filtered out all rows. `normDateStr()` normalizes before any date comparison — fixes devices, geo, keywords, and search terms date filtering.
- **`getMostRecentWeek()` fallback**: When filtered date range has no geo/device data (e.g. TODAY view), falls back to last 7 available days rather than all history or nothing.
- **Device badge readable**: Badge on colored bar was red-on-red. Fixed to use `var(--surface)` background with colored border/text.
- **State list layout**: `justify-content:space-evenly` spread 2–3 rows to top/bottom of tall panel. Fixed to `flex-start` with `min-height:0` for compact scrollable list.
- **`google-ads-script.js`** created as canonical script file (copy into Google Ads → Tools → Scripts to update)

---

## 8. If the Dashboard Shows "NO DATA"

1. Open browser console (F12 → Console tab) — check for specific error messages
2. Click the **↻ RETRY** button on the red banner
3. Verify Google Ads Script is still running: Google Ads → Tools → Scripts → check last run time
4. If script stopped: click the play button to run manually, then retry dashboard
5. Check the published URLs above are still valid (re-publish if needed)
