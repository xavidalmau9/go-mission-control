# Mission Control Dashboard — Claude Project Instructions
**GO Advertising · Assurance Wireless / BGOA Partner Dashboard**
**Last updated: April 23, 2026 (session 10)**

> This file is read by Claude at the start of every session. Update it whenever significant decisions are made.

---

## What This Project Is

A single-page real-time performance dashboard (`index.html`) for tracking Google Ads + Meta Ads campaigns promoting Assurance Wireless (Lifeline phone program). The dashboard auto-refreshes every 5 minutes from Google Sheets CSVs.

- **Live URL:** https://xavidalmau9.github.io/go-mission-control/
- **GitHub:** https://github.com/xavidalmau9/go-mission-control
- **All dashboard code is in one file:** `/Users/305partners/assurance/index.html`
- **Google Ads Script:** `/Users/305partners/assurance/google-ads-script.js` (paste into Google Ads → Tools → Scripts)
- **Data reference:** `/Users/305partners/assurance/DATA_SOURCES.md`

---

## The #1 Rule

**Ad Spend always comes from Google Ads (DailyCampaign sheet) — never from the BGOA manual spreadsheet.**
Google is always accurate for spend and has it broken down by campaign. BGOA is manually entered and can have mistakes.

**Applications: always show whichever number is higher — Google conversions or Assurance confirmed.**
Google has fresher same-day data. Assurance catches up T+1 with confirmed numbers that are often higher.
Logic: `Math.max(confirmedApps, googleApps)` — never hardcode one source.

**Activations always come from BGOA/BGOC confirmed data.** We get paid on Assurance numbers, not Google's.

---

## Business Context

- **Payout:** $25.00 per confirmed activation (fixed by Assurance Wireless)
- **Campaigns:** BGOA = Google Ads (goadvertising9@gmail.com) · BGOC = Meta Ads
- **Reporting lag:** Assurance reports activations T+1 — today's count is never available same day
- **30-day cookie window:** Sundays with $0 Google spend still generate activations (attributed from earlier clicks)
- **Activation rate lag:** Daily activation data takes ~5 days to fully settle
- **Partial last-day BGOA data:** BGOA cuts off ~10am daily, so the most recent day always has partial applications/approvals. They fill in on the next report. This is expected — do not try to fix it.

### CPA Tiers (HARDCODED — do not change without explicit instruction)
```
FANTASTIC : ≤ $10.00 per activation
EXCELLENT : ≤ $12.50 per activation
GOOD      : ≤ $15.00 per activation
POOR      : > $15.00 per activation   (anything above $15 is POOR — there is no FATAL tier)
```
App CPA thresholds are DERIVED: App CPA tier = Act CPA tier × activation_rate (never hardcoded)

**There are exactly 4 tiers. FATAL was removed in session 9. Never add it back unless explicitly instructed.**

### Active Campaigns (as of Apr 2026)
4 enabled Google Search campaigns:
- Search - Assurance Wireless Lifeline
- Search - Assurance Wireless Lifeline v2
- Search - Prime Time | SS
- Assurance Wireless Search | SS

### Original Projections (confirmed correct)
| Month | Projected Activations |
|-------|----------------------|
| Jan 2026 | 0 (testing month) |
| Feb 2026 | 500 |
| Mar 2026 | 1,000 |
| Apr 2026 | 2,000 |
| May 2026 | 3,000 |
| Jun 2026 | 4,000 |

### Confirmed Paid History
| Month | Activations | Revenue | Status |
|-------|-------------|---------|--------|
| Dec 2025 | 46 | $1,150 | PAID ✓ |
| Jan 2026 | 415 | $10,375 | PAID ✓ |
| Feb 2026 | 552 | $13,800 | PAID ✓ |
| Mar 2026 | 1,861 | $46,525 | **PAID ✓** |
| Apr 2026 | 2,007+ (MTD) | — | **PENDING** (activation lag) |

**Settled to date = $71,850** (Dec + Jan + Feb + Mar paid).

---

## Data Sources

### Google Ads → Google Sheets (auto-push hourly)
Spreadsheet: `1ZLzpR9oGk5y2amRr0jS4QPVIIzC44m1VfBRIxDK64Vg`

| Key | Sheet | What it contains |
|-----|-------|-----------------|
| `daily` | DailyCampaign | Date, CampaignName, Impressions, Clicks, Cost, Conversions |
| `devices` | Devices | Date, CampaignName, Device, Impressions, Clicks, Cost, Conversions |
| `geo` | Geo | Date, CampaignName, Region (STATE NAME e.g. "Maryland"), Country, Impressions, Clicks, Cost, Conversions, CPA |
| `hourly` | Hourly | HourOfDay, CampaignName, Cost, Conversions, Clicks, Impressions |
| `keywords` | Keywords | Date, CampaignName, AdGroupName, Keyword, MatchType, Impressions, Clicks, Cost, Conversions |
| `searchTerms` | SearchTerms | Date, CampaignName, AdGroupName, SearchTerm, MatchType, Impressions, Clicks, Cost, Conversions |

**Script file:** `google-ads-script.js` — this is the canonical version. Always update this file when script changes are made.

**Critical script rules:**
- `pushDailyCampaign` uses `WHERE Cost > 0` (NOT `WHERE Impressions > 0`) — captures ALL spending campaigns including those with no/low impressions
- All numeric values written to sheets use `cleanNum()` to strip AWQL comma separators before writing
- `pushGeo` uses `RegionCriteriaId` + `US_STATE_CRITERIA` lookup — writes state names, not zip codes

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

### `pn(v)` — CRITICAL numeric parser
**Always use `pn()` instead of `parseFloat()` for any Google Ads CSV field.**
AWQL returns numbers with comma separators for values ≥ 1000 (e.g. `"1,083.67"`).
`parseFloat("1,083.67")` = **1** — stops at the comma. This caused a campaign spending $1,083/day to appear as $1.
```javascript
function pn(v) { return parseFloat(String(v||'').replace(/,/g,'')) || 0; }
```
Applied to: `r.Cost`, `r.Conversions`, `r.Clicks`, `r.Impressions` everywhere in the dashboard.

### `cleanNum(v)` — script-side numeric cleaner
Same as `pn()` but lives in `google-ads-script.js`. Applied to all numeric fields before writing to Google Sheets so the data is clean at the source.
```javascript
function cleanNum(v) {
  return parseFloat(String(v || '').replace(/,/g, '')) || 0;
}
```

### `normDateStr(s)`
**CRITICAL** — Normalizes any date string to `YYYY-MM-DD` before comparisons. Handles both `YYYY-MM-DD` and `M/D/YYYY` formats (Google Ads CSV dates vary by sheet). Returns `''` if format unrecognized (row treated as undated, passes date filter).
```javascript
function normDateStr(s) {
  if (!s) return '';
  const t = String(s).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(t)) return t.substring(0, 10);
  const m = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (m) return `${m[3]}-${m[1].padStart(2,'0')}-${m[2].padStart(2,'0')}`;
  return '';
}
```
**Always use `normDateStr` in `filterRow` and `filterKW`** — raw string comparison of dates breaks when formats differ between sheets.

### `filterRow(r)` inside `filterData()`
Uses `normDateStr` for date comparison. Filters by date AND campaign. Applied to daily, devices, geo, hourly, keywords, searchTerms.

### `getMostRecentWeek(rawArr)` inside `applyFilters()`
When geo or devices have no data for the selected period (T+1 lag — geo/device data never exists for TODAY), falls back to the 7 most recent available days. NOT all-history — just the last week.

### `parseBGOARow(r)`
Parses a single row from BGOA or BGOC CSV. Returns `{ date, spend, applications, approvals, activations, revenue, ... }` or `null` if not a date row.

### `getLiveActRate()`
Returns activation rate from last settled month. After the 15th, prior month is settled. Falls back to March 2026, then 55.12% baseline.

### `getPeriodActRate(from, to)`
Returns actual activation rate for a date range from BGOA daily data, excluding the last 5 days (unsettled). Returns `{ rate, days, acts, apps }` or `null` if insufficient data.

### `getAppTiers(actRate)`
Derives App CPA thresholds from ACT_TIERS × activation rate. NEVER hardcode app CPA values.

### `buildKPIs(daily)`
- **Spend:** Always `googleSpend` from DailyCampaign — never BGOA manual entry
- **Applications:** `Math.max(confirmedApps, googleApps)` — whichever is higher
- **Activations:** BGOA+BGOC confirmed only. Falls back to `conversions × ACT_RATE` if no Assurance data
- Returns `{ ..., googleApps, confirmedApps }` so `renderKPIs` can show which source won in subtitle

### `renderKPIs(kpis)`
- **App CPA tile** (`kv-gcpa`) uses `appCPA` = `spend / applications`. NOT `googleCPA`. Never swap these — `googleCPA` = spend/conversions which is a different (wrong) number.
- **Applications tile** subtitle shows: `✓ [source] (higher/fresher) · Assurance: N · Google: N`
- **Activation Rate tile** (`kv-approval`):
  - TODAY view → always shows `PROJECTED` in amber (T+1 lag means no confirmed rate)
  - Has confirmed period data → shows `✓ REAL` in green
  - Fallback (not enough data) → shows `PROJECTED` in muted — never implies it's a confirmed number

### `buildChartDaily(daily)`
Merges Google Ads rows with BGOA confirmed activations. Includes Sundays with $0 spend that still have BGOA activations (30-day cookie window).

### `buildDevices(devices)`
Uses partial string matching (`k.includes('mobile')`, `k.includes('computer')`, `k.includes('tablet')`).
Activation CPA = `appCpa / ACT_RATE` — **do NOT use a `MULT` variable** (it was never defined and caused a silent ReferenceError that froze the panel).

### `buildStates(geo)`
Aggregates geo rows by STATE. Handles three input formats:
1. **State name**: `"Maryland"` → `STATE_ABBRS["Maryland"]` → `"MD"`
2. **State name with country**: `"Maryland, United States"` → strips suffix → `"MD"`
3. **Numeric criterion ID**: See geo bug history — these should no longer appear after script fix

Does NOT show individual zip codes — all rows for the same state are summed into one row.

### `zipToStateName(zip)` / `STATE_ABBRS`
Still present for legacy fallback but the script no longer writes zip codes. Primary path is state names directly.

### `renderAssuranceIntelligence()`
Renders monthly table, CPA trend, BGOC panel, Projections vs Reality. `ORIG_PROJ` constant has correct projection values.

### `fetchAllSheets()`
- **Phase 1** (awaited): bgoa, daily, devices, hourly, geo
- **Phase 2** (background): bgoc, keywords, searchTerms, monthly, gva, projVsReal → calls `applyFilters()` when done

---

## Things That Were Fixed and Why (Don't Re-Break)

| Issue | What Was Wrong | Fix |
|-------|---------------|-----|
| Google Ads Script error | `LAST_90_DAYS` is invalid AWQL | Use `dateRange(60)` dynamic helper |
| BGOA CSV blank rows | Blank separator rows before header treated as header | `parseCSV` filters blank rows |
| Devices showing 1 device | Exact string match failed | Partial `.includes()` matching |
| Day counts wrong | Counted data rows, missed Sundays | Calendar math in `getPeriodMeta` |
| Today shows activations | T+1 lag | TODAY view shows "—" for activations |
| Activation Rate tile wrong | `activations / Google_conversions` (different things) | `getPeriodActRate()` from BGOA daily |
| Geo shows only 2 states | See full geo bug history below | `RegionCriteriaId` + state lookup |
| Keywords not date-filtering | Phase 2 called `renderKeywords(RAW.keywords)` directly | Phase 2 calls `applyFilters()` |
| Keywords wrong dates | Raw string comparison broke M/D/YYYY format | `normDateStr()` in filterRow |
| Devices frozen "AWAITING LIVE DATA" | `MULT` variable used but never defined → silent ReferenceError | Use `appCpa / ACT_RATE` directly |
| Date filter broken for all panels | `filterRow` used raw string comparison, M/D/YYYY > YYYY-MM-DD | `normDateStr()` in filterRow |
| Device badge unreadable | Transparent colored bg + colored text on top of colored bar | Solid dark background + colored border |
| States panel layout gaps | `justify-content:space-evenly` with 2-3 rows = giant gaps | `flex-start` + `min-height:0` |
| Projections wrong | Values shifted +1 month | `ORIG_PROJ` constant, actuals pulled live |
| Wrong timezone in date range | `toISOString()` converts midnight local to UTC, returning wrong date | Use local date parts: `d.getFullYear()`, `d.getMonth()+1`, `d.getDate()` |
| MTD avg missing campaigns | Raw `r.Date` without `normDateStr` — M/D/YYYY dates not grouped | `normDateStr(r.Date||'')` in spend tile, renderBrief, renderFeed |
| Ad spend showing only $1,161 instead of $2,244 | Two bugs: (1) `WHERE Impressions > 0` missed campaigns with low impressions; (2) AWQL comma bug: `parseFloat("1,083.67")` = 1 | (1) Changed to `WHERE Cost > 0`; (2) Added `cleanNum()` in script + `pn()` in dashboard |
| Spend source wrong | Was using BGOA manual entry for spend — can have mistakes, no per-campaign breakdown | Always use Google DailyCampaign for spend |
| Applications showing lower number | Was always using BGOA confirmed, but Google has fresher same-day data | `Math.max(confirmedApps, googleApps)` — always use whichever is higher |
| App CPA tile showing wrong number | `kv-gcpa` was rendering `googleCPA` (spend/conversions=$12.47) instead of `appCPA` (spend/applications=$9.23) | Fixed to use `appCPA` — the tile is labeled "App CPA" so it must use applications not conversions |
| KPI tiles showing "loading..." on TODAY | Removed kv-approval HTML element but left JS code referencing it → null TypeError halted renderKPIs | Removed dead kv-approval/ks-approval block from renderKPIs |
| T+1 subtitles verbose and confusing | "REPORTS T+1 · YESTERDAY: 0 confirmed" etc | Simplified to "N/A" for activations, revenue, act CPA on TODAY view |
| Yesterday at a Glance ugly mini-cards | Used tiny .bkpi inline style cards instead of proper .kpi tiles | Replaced with same .kpi grid style as top KPI row (6 columns) |
| GvA panel hardcoded monthly data | Would go stale; required manual update each month | Fully dynamic from RAW.bgoa + RAW.daily; auto-updates on every refresh |
| GvA panel showing "Pre-script" / "Script not active" text | Raw message shown instead of clean N/A | All unavailable fields now show N/A |
| KPI top row had 7-column grid after removing Activation Rate tile | 6 cards stretched unevenly across 7 columns | Changed to repeat(6,1fr) |
| GvA/projVsReal showing wrong status | Current month labeled PENDING, March labeled PAID | Fixed: current = CURRENT MONTH, prev = PENDING, older = PAID ✓ |
| Projections vs Reality using low BGOA daily counts | BGOA daily has activation lag — shows lower numbers | Now uses Math.max(BGOA, Lifeline) — always higher confirmed number |
| projVsReal table cramped/bunched | Dense HTML table with 5 columns in tiny font | Replaced with spacious card rows matching GvA panel style |
| Dec projection shown as 0 | Dec was a Soft-Launch with no target | Now shows "Soft-Launch" / "No target" |
| Jan projection shown as 0 with "—" for vs proj | Correct — Jan projection was 0, it was a ramp month | Shows "Ramp month" label |
| Trajectory panel had hardcoded 1483 for Mar | Wrong and stale | Now pulls from getLifelineActuals() with Math.max fallback |
| projVsReal Dec/Jan showed 'Soft-Launch'/'Ramp month' | User wanted 0 shown with BEAT ✓ | Now shows '0' projected, '+47'/'+415' BEAT ✓ in vs proj card |
| GvA panel Google Activations showed N/A for pre-script months | N/A replaced with '0' and 'Not tracked' | Dec/Jan Google column shows 0 / Not tracked |
| 'App'/'Act'/'Apps'/'Acts' abbreviations used throughout | User wants full words wherever space allows | Expanded: Application CPA, Activation CPA, Applications, Activations everywhere with room |
| Device panel title 'App & Activation CPA' | Incomplete label | Now 'Application & Activation CPA' |
| $15 CPA target missing from Dec/Jan projected cards | Was showing 'No target set' | $15 CPA target is universal — shown on all months including 0-projection months |
| All states data wrong — CA showing 1 conversion | Same AWQL comma bug in `pushGeo`, `pushKeywords`, `pushSearchTerms` — `parseFloat("1,234")` = 1 | Applied `cleanNum()` to all numeric fields in all 6 script functions |
| Remaining `parseFloat` calls in dashboard | `renderBrief`, `buildDevices`, keyword CPA list still used raw `parseFloat()` | All converted to `pn()` |
| Activation Rate showing confirmed % for TODAY | TODAY has no confirmed activation data (T+1) — showing 55.8% implied it was real | TODAY and fallback views now show "PROJECTED" label in amber |
| Date range stuck on error after no-data | `kpiRow.innerHTML` replaced by error HTML, destroying `kv-*` elements — `renderKPIs()` silently failed | `resetKPIRow()` called at top of `applyFilters()` restores elements before rendering |
| Top 20 states showing NO DATA | Filter checked `d.conv` (undefined after map) instead of `d.count` | Fixed to `d.count > 0` |
| $∞ waste states missing from Worst 20 | `cpa === 0` evaluated as `0 > tiers.GOOD` = false, dropping zero-conversion states | Filter now catches `cpa === 0 \|\| cpa > tiers.GOOD` |
| Geo sheet conversions far lower than UI Location Report | `WHERE Impressions > 0` dropped rows with cost/convs but no geo impression; plus AWQL uses impression-based attribution vs UI click-based | Changed to `WHERE Cost > 0`; residual gap is API limitation not fixable in scripts |
| Middle column empty space at bottom of Assurance Intelligence | Fixed gap between BGOC and Top 10 States panels left dead space | `justify-content: space-between; height: 100%` auto-fills full column height |
| Middle column misaligned at top vs left/right columns | BGOC panel started at very top of grid row | `padding-top: 28px` on middle column container nudges content down to match |
| FATAL tier confusing / unnecessary | 5-tier system had FATAL (>$25) but that's just "very POOR" — redundant and confusing | Removed FATAL entirely; 4 tiers now: FANTASTIC/EXCELLENT/GOOD/POOR |
| ∞ shown for zero-conversion states | States with $0 conversions showed `∞` CPA — meaningless | Now shows `$XX.XX / 0 conv` with POOR label so actual waste is visible |

---

## Geo Bug History (CRITICAL — read before touching geo code)

This took multiple sessions to fully resolve. Do not re-introduce any of these bugs.

### What the Geo CSV used to contain (WRONG)
The old script used `MostSpecificCriteriaId` which returned the most granular geographic level. For this campaign, that meant:
- Maryland zip codes: `21133`, `21135`, `21136`... (5-digit US postal zip codes)
- California metro IDs: `9073451`, `9073452`... (7-digit Google criterion IDs)

### Why only MD and CA showed on the dashboard
`buildStates` fed those numbers into `zipToStateName()` which treats the first 3 digits as a zip prefix:
- `211xx` → prefix 211 → falls in Maryland range (206-219) → **"Maryland"** ✗
- `907xxxx` → prefix 907 → California → **"California"** ✓ (lucky match)

So ALL state criterion IDs (21132=Alabama through 21183=Puerto Rico) were being collapsed to "Maryland" because they all start with 211.

### The actual fix
Script now uses `RegionCriteriaId` from `GEO_PERFORMANCE_REPORT`. This returns Google's geographic criterion IDs for US states:
```
21132=Alabama, 21133=Alaska, 21134=Arizona, 21135=Arkansas,
21136=California, 21137=Colorado ... 21151=Maryland ... 21183=Puerto Rico
```
A `US_STATE_CRITERIA` lookup table in the script converts these to state names ("Maryland", "California", etc.) before writing to the sheet. The dashboard receives plain state names and maps them to abbreviations via `STATE_ABBRS`.

### What NOT to do with geo
- **Never use `Region` as an AWQL field** — it is not valid in `GEO_PERFORMANCE_REPORT` (throws InputError)
- **Never use `MostSpecificCriteriaId`** — returns zip codes, all map to wrong states
- **Never feed criterion IDs (21132-21183) into `zipToStateName()`** — they all map to Maryland
- **Never show individual zip codes** — always aggregate to state level

---

## T+1 Data Lag Rules

| Panel | Has TODAY data? | Fallback when empty |
|-------|----------------|---------------------|
| KPIs / Chart | Partial (no activations) | Show "—" for acts |
| Geo | Never (T+1) | Last 7 available days |
| Devices | Never (T+1) | Last 7 available days |
| Hourly heatmap | Yes (current day) | None needed |
| Keywords | Yes (date-filtered) | Show count + hint |
| Search Terms | Yes (date-filtered) | Show count + hint |

---

## What NOT to Do

- **Never use `parseFloat()` on any Google Ads CSV field** — always use `pn(r.Cost)`, `pn(r.Conversions)`, `pn(r.Clicks)`, `pn(r.Impressions)`. AWQL adds comma separators to numbers ≥ 1000 and `parseFloat("1,234")` = 1. This affected DailyCampaign, Devices, Hourly, Geo, Keywords, SearchTerms — every sheet. The `pn()` helper strips commas before parsing.
- **Never use `parseFloat()` in the Google Ads script either** — always use `cleanNum()` for the same reason
- **Never render `googleCPA` in the App CPA tile** — `googleCPA` = spend/conversions; App CPA tile must use `appCPA` = spend/applications
- **Never show Activation Rate without a PROJECTED label for TODAY or fallback views** — only show `✓ REAL` when confirmed period data from BGOA exists
- **Never use BGOA Ad Spend as the spend source** — always use Google DailyCampaign for spend
- **Never use only one source for applications** — always `Math.max(confirmedApps, googleApps)`
- **Never hardcode App CPA thresholds** — always derive from `getAppTiers(ACT_RATE)`
- **Never hardcode activation rate** — use `getPeriodActRate()` for ranges, `getLiveActRate()` for defaults
- **Never add a daily spend target** — budget changes daily
- **Never cap date range to 30 days** — script goes back 60 days
- **Never call `renderKeywords(RAW.keywords)` directly** — always go through `applyFilters()`
- **Never show today's activations** — always "—" with T+1 note
- **Never use `LAST_90_DAYS` or `LAST_60_DAYS` in AWQL** — invalid; use `dateRange(N)` helper
- **Never use raw string date comparison** — always use `normDateStr()` first
- **Never use a `MULT` variable** — it was never defined; use `appCpa / ACT_RATE` directly
- **Never use `Region` as AWQL field in `GEO_PERFORMANCE_REPORT`** — not valid
- **Never use `MostSpecificCriteriaId` for geo** — returns zip codes that map to wrong states
- **Never show all-history data as a fallback** — wrong data is worse than no data
- **Never use `WHERE Impressions > 0` in `pushDailyCampaign`** — use `WHERE Cost > 0` to capture all spending campaigns
- **Never use `toISOString()` for date ranges** — converts midnight local to UTC, returns wrong date for Eastern timezone

---

## Favicon

Inline SVG data URI in `<head>` — black rounded square with bold white "GO". No external file needed.
```html
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,...">
```

---

## The AWQL Comma Bug — Full History

**This is the most destructive bug in this project. It affected every single sheet.**

AWQL (Google Ads Query Language, used by Google Ads Scripts) returns numeric values with comma separators for numbers ≥ 1,000. Examples:
- `"1,083.67"` for a $1,083.67 cost
- `"1,234"` for 1,234 impressions
- `"2,702"` for 2,702 clicks

`parseFloat("1,083.67")` = **1** in JavaScript — it stops at the first non-numeric character.

**Impact per sheet:**
- `DailyCampaign`: "Assurance Wireless Search | SS" showed $1/day instead of $1,083/day → total spend $1,161 instead of $2,244
- `Geo`: California showed 1 conversion instead of actual count → appeared last instead of #1
- `Devices`: Any device with clicks/cost > 999 had wrong CPA
- `Keywords`, `SearchTerms`: Any high-traffic keyword had wrong cost/conv numbers
- `Hourly`: Any hour with cost > $999 had wrong values

**The fix:** `cleanNum()` in the script, `pn()` in the dashboard — both strip commas before `parseFloat`. Applied to ALL numeric fields in ALL 6 sheet functions. Do not ever use raw `parseFloat()` on AWQL data.

---

## Session 8 Changes (Apr 17, 2026)

### Fixed
- **Date range refresh bug** — after a "no data" error (e.g. bad custom date), switching to another date range left the error screen stuck. Root cause: the no-data block replaced `kpiRow.innerHTML` with error HTML, destroying all `kv-*`/`ks-*` elements inside it. `renderKPIs()` then silently threw null errors and never rendered. Fix: added `resetKPIRow()` — called at the top of every `applyFilters()` run, it detects when the KPI tile elements are missing and restores the original HTML structure before rendering. Zero impact on normal renders.
- **State panel "Top 20" showing NO DATA** — `buildStates()` mapped rows to `{count}` but the filter still checked `d.conv` (undefined). Fixed: `d.conv > 0` → `d.count > 0`.
- **$∞ waste states missing from Worst 20** — states with spend but 0 conversions had `cpa = 0`, so `cpa > tiers.GOOD` was false and they were silently dropped. Fixed: filter now catches `cpa === 0 || cpa > tiers.GOOD`. Sort pushes infinite-CPA states to the top.
- **Geo script `WHERE Impressions > 0`** — changed to `WHERE Cost > 0` in `pushGeo()`, same fix as DailyCampaign. Rows with cost/conversions but no tracked impression were being dropped, causing states like TX and NJ to show 0 conversions in the sheet. **Requires manual paste into Google Ads Scripts and one manual Run to take effect.**

### Added
- **State Performance panel — Top 20 & Worst 20 side by side** — replaced single "Problem States · FATAL & POOR Only" panel with a two-column layout:
  - **Left: 🏆 TOP 20 · LOWEST CPA** — all states with conversions, sorted best CPA first (no tier filter — top 20 regardless of tier)
  - **Right: ⚠️ WORST 20 · HIGHEST CPA** — POOR states + $∞ waste states (0-conversion states), sorted worst first
  - Progress bars removed — replaced with larger state code (13px bold, color-coded by tier), conversion count, CPA, and status pill
  - `buildStates()` now returns `{ best: [], worst: [] }` — `renderStates()` writes to `stateListBest` and `stateListWorst`

- **Top 10 States by Applications Volume panel** — fills the empty space below the BGOC Meta panel in the middle column of Assurance Intelligence section:
  - Shows rank (1–10), state abbreviation, volume bar, application count, CPA color-coded by tier
  - Fully date-filter aware — updates with every date range change via `applyFilters()`
  - Built from geo data via `buildTopStates(geo)` / `renderTopStates()` functions
  - Called in `applyFilters()` right after `renderStates()`
  - Container ID: `topStatesPanel` — included in no-data block list

### Layout / Spacing
- **Assurance Intelligence 3-column bottom row** — middle column uses `justify-content: space-between; height: 100%` so BGOC panel stays top and Top 10 States locks to bottom, auto-filling the full column height regardless of content in other columns
- **Middle column top padding** — `padding-top: 28px` added so the BGOC heading and rectangle align with where content starts in the left and right columns
- **Projections vs Reality cards** — padding increased from `8px 0` → `14px 0` per card for better vertical spacing and alignment with column 1

### Known Limitation — Geo Data vs Google Ads UI
The Geo sheet will **never exactly match** the Google Ads UI Location Report. The AWQL `GEO_PERFORMANCE_REPORT` uses impression-based geographic attribution; the UI report uses click-based attribution across all conversion windows. Small states (NC, NE) are close; large states with national search intent (CA, TX) will always show lower conversions in the sheet. The `WHERE Cost > 0` fix closes some of the gap but not all. This is a fundamental Google Ads API limitation — not a bug to fix.

### Google Ads Script — Current State
The only change from the previous version is line 118: `WHERE Impressions > 0` → `WHERE Cost > 0` in `pushGeo`.
All other functions unchanged. Full current script is in `/Users/305partners/assurance/google-ads-script.js`.

---

## Session 7 Changes (Apr 17, 2026)

### Fixed
- **Monthly Actuals table still showed March as PAID** — `confirmedPaid` dictionary hardcoded `'2026-03': 29700`, and the status branch showed `IN PROGRESS` / `AWAITING PAYMENT` instead of the standardized labels. Removed March from `confirmedPaid`, simplified status to only use **CURRENT MONTH** / **PENDING** / **PAID ✓** (matching the Month Status Logic).
- **Closed Month Actuals block label "AWAITING PAYMENT"** — replaced with standardized `PENDING`.
- **`totalRevConfirm` included $29,700 for March** — removed, since March is not yet paid. Settled to date is now correctly $25,325.
- **`confirmedActs['2026-03']`** updated from 1,188 → 1,404 to match Lifeline confirmed count (per Math.max rule).

### Added
- **"This Month" date range filter** — new button between "Last 30" and "Last Month". Returns MTD: 1st of current month → today.

### Changed
- **Business Trajectory panel redesigned** — removed the progress-bar column. Each row now uses clean pills: `[MONTH] [status pill] metric · value [BEAT pill]`. Status pills use the canonical terms (PROJECTED / PENDING / PAID ✓ / CURRENT MONTH) — no more "CLOSED" label. "Revenue Settled" rendered as a separate summary row at the bottom (divider + label + value). Data shape changed from `{label}` to `{month, status, metric}` for cleaner rendering. CSS uses `.traj-*` classes (old `.proj-*` removed).
- **Projections vs Reality footer removed** — the blue "Original plan: $15 CPA · 1,000 acts/mo by Month 3 / Reality: beat projections every month / To-date: gross / net / ROI" summary block below the month cards was deleted. The settled totals calc (`totRev`, `totNet`, `totROI`) is kept in case it's needed elsewhere, but the footer itself is gone. Do not re-add it.

### CLAUDE.md updates
- **Status labels** — now explicitly documented as the ONLY allowed terms. No more variants like "AWAITING PAYMENT", "IN PROGRESS", "CLOSED".
- **Confirmed Paid History table** (top of file) — updated to match single source of truth: Mar 2026 = 1,404 acts / $35,100 / PENDING.

---

## Session 3 Changes (Apr 16, 2026)

### Fixed
- **KPI tiles (AD SPEND, APP CPA, ACT CPA) showing "loading..."** — removed dead `kv-approval`/`ks-approval` JS block from `renderKPIs`. The Activation Rate tile was removed from HTML but JS still referenced it, causing a null TypeError that halted the entire render function.
- **Activations / Revenue / Act CPA subtitles on TODAY view** — now show `N/A` instead of verbose T+1 messages.
- **Yesterday at a Glance** — replaced tiny `.bkpi` mini-cards with full `.kpi` grid cards, identical visual style to the top KPI row. 6-column grid: App CPA · Act CPA · Spend · Applications · Activations · Profit.
- **Google vs Assurance panel** — fully dynamic, no hardcoded monthly data. Built from `RAW.bgoa` (BGOA monthly acts/spend) + `RAW.daily` (Google monthly convs/spend). Refreshes live with every data load. Pre-script months (Dec 2025, Jan 2026) show "—" / "Pre-script" for Google column. Status auto-derives per Month Status Logic: current = CURRENT MONTH, previous = PENDING, older = PAID ✓.

## Month Status Logic (CRITICAL — do not change)
These are the ONLY allowed status labels. Every panel must use these exact terms — no variants like "AWAITING PAYMENT", "IN PROGRESS", "CLOSED", etc.
- **Current calendar month** → always labeled **CURRENT MONTH** (blue / `var(--accent)`)
- **Previous calendar month** → always labeled **PENDING** (amber / `var(--amber)`) — stays PENDING until payment is actually received
- **All months before that** → **PAID ✓** (green / `var(--green)`)
- Labels roll over on the 1st of each month: when May 1 hits, April becomes PENDING and May becomes CURRENT MONTH automatically. March stays PENDING until Assurance actually pays — then becomes PAID ✓.
- Never call a prior month PAID unless it has actually been paid. March is PENDING until payment is received.

## Confirmed Activation Counts (from Lifeline spreadsheet)
These are the official numbers. Always use `Math.max(BGOA daily, Lifeline)` — the higher wins:

| Month | Activations | Revenue | Status |
|-------|-------------|---------|--------|
| Dec 2025 | 44 | $1,100 | PAID |
| Jan 2026 | 415 | $10,375 | PAID |
| Feb 2026 | 552 | $13,800 | PAID |
| Mar 2026 | 1,861 | $46,525 | PAID ✓ |
| Apr 2026 | 2,007+ (MTD) | — | PENDING (activation lag) |

## Original Projections (correct values — do not change)
| Month | Projection |
|-------|-----------|
| Dec 2025 | Soft-Launch (no target) |
| Jan 2026 | 0 (ramp month) |
| Feb 2026 | 500 |
| Mar 2026 | 1,000 |
| Apr 2026 | 2,000 |
| May 2026 | 3,000 |
| Jun 2026 | 4,000 |

We have **beaten every month with a real target**.

## Lifeline Spreadsheet (Projections vs Reality)
- **ID:** `1JQWn6RHVuOVZWPnVgxFRXBFGka6ae7qYQ6Jik74t60Q` GID `849051862`
- **Already fetched** as `RAW.projVsReal` and `RAW.projVsRealRows`
- Sheet is transposed (months = columns, metrics = rows) — standard parseCSV breaks on it
- `parseCSVRaw(text)` → stores as `RAW.projVsRealRows` (array of arrays, column-indexed)
- `getLifelineActuals()` → finds REALITY section, extracts Activations/Gross/Ad Spend per month
- Called in `renderAssuranceIntelligence()` and `buildTrajectory()`
- Updates daily — dashboard reads it on every refresh cycle

### Google vs Assurance Panel — How It Now Works
- Groups `RAW.bgoa` by month → Assurance confirmed activations + BGOA spend
- Groups `RAW.daily` by month → Google-reported conversions + actual spend
- Uses Google Ads spend when available (per #1 rule); falls back to BGOA manual entry for pre-script months
- Renders all months where BGOA has data, sorted most recent first
- For months before Google script was active: Google column shows "—" / "Pre-script"
- `paidOut` = assuranceActs × $25 (PAYOUT constant)
- `status`: current month = CURRENT MONTH, previous month = PENDING, older = PAID ✓ (per Month Status Logic)

---

## Universal N/A Rule
**Whenever a value is unavailable for any reason, always show `N/A` — never show raw technical messages like "Pre-script", "Script not active", "SEE BGOA", or similar.** This applies to all panels across the dashboard.

## Label Rules (permanent)
- Always write **Activations** in full. Only use "Acts" if space genuinely cannot fit the full word.
- Always write **Applications** in full. Only use "Apps" if space genuinely cannot fit the full word.
- Always write **Application CPA** and **Activation CPA** in full wherever space allows.
- **$15 CPA target is universal** — it applies to every single month, including months with 0 volume projection. Always show "$15 CPA target" in the projected card subtitle.

## CPA Target (permanent, hardcoded business rule)
- **Target Activation CPA: $15.00** — this never changes unless explicitly instructed
- This applies to ALL months including Soft-Launch and ramp months
- The CPA tiers (FANTASTIC ≤$10, EXCELLENT ≤$12.50, GOOD ≤$15, POOR >$15) are derived from this — 4 tiers only, no FATAL

---

## Session 9 Changes (Apr 20, 2026)

### Changed

- **FATAL tier removed — 4 tiers only** — User explicitly requested removing FATAL. The system now uses exactly 4 tiers: FANTASTIC / EXCELLENT / GOOD / POOR. Anything > $15 activation CPA is POOR. There is no fifth tier.
  - `ACT_TIERS` — removed `POOR: 25.00` threshold and FATAL comment. Now only 3 threshold values in the object; anything exceeding GOOD is implicitly POOR.
  - `getAppTiers()` — removed FATAL property from returned object
  - `cpaColor()` / `cpaLabel()` — removed FATAL branches; final `else` returns red / `'POOR'`
  - `actCpaColor()` / `actCpaLabel()` — same
  - Keywords `getAction()` — `t2.FATAL` → `t2.GOOD * 2`
  - Search terms `getAction()` — `t3.FATAL` → `t3.GOOD * 2`
  - `briefMeta` static HTML legend — `>$25 FATAL` → `>$15 POOR`
  - Grade function — removed F grade; D is now worst: `cpa<=t.FANTASTIC?'A':cpa<=t.EXCELLENT?'B':cpa<=t.GOOD?'C':'D'`
  - Console.log — removed FATAL reference
  - Comment — "POOR/FATAL CPA" → "POOR CPA"

- **∞ (infinity) replaced with actual spend numbers in Worst 20 States panel** — States with spend > 0 but 0 conversions previously showed `∞` as the CPA and `∞ WASTE` as the label. Both were meaningless and confusing. Now shows `$XX.XX / 0 conv` (actual spend to two decimal places, e.g. `$47.23 / 0 conv`) with `POOR` as the tier label. Tier color is red (`var(--red)`) matching POOR. The states still sort to the top of the Worst 20 list since their effective CPA is treated as Infinity for sort purposes.

### What NOT to Do (additions)
- **Never add a FATAL tier back** — it was explicitly removed. 4 tiers only.
- **Never show ∞ for any CPA** — always show the actual spend with `/ 0 conv` suffix for zero-conversion states.

---

## Session 10 Changes (Apr 23, 2026)

### Added

- **Application CPA by Device · Daily Trend chart** — new Chart.js multi-line chart between the main KPI grid and the bottom panels. Shows Mobile, Desktop, and Tablet Application CPA over time as separate color-coded lines. Includes two reference lines: `FANTASTIC` threshold (green dashed) and `GOOD` threshold (red dashed). Has its own independent date toggle (see below). Still responds to the campaign dropdown. Built by `buildDeviceTrend(devices, campaign)`, rendered by `renderDeviceCPAChart(trend)`. Container panel sits between the main performance grid and the Assurance Intelligence section.

- **`buildDeviceTrend(devices, campaign)`** — aggregates Devices sheet rows by date and device type. Applies campaign filter when one is selected. Returns `{ dates, mobile, desktop, tablet }` where each array contains daily Application CPA values (null when no data for that day). `spanGaps: true` on the chart connects across missing days. Device key detection uses `.includes()` matching (mobile / computer|desktop / tablet).

- **`renderDeviceCPAChart(trend)`** — creates/updates Chart.js instance (`deviceCPAChartInst`). Destroys previous instance on re-render. Colors: Mobile = `rgba(56,189,248,0.9)` (blue), Desktop = `rgba(52,211,153,0.9)` (green), Tablet = `rgba(129,140,248,0.9)` (purple). Reference line datasets use `pointRadius:0`, `borderDash:[5,5]`, `borderWidth:1`. Tooltip shows `${name}: $${val.toFixed(2)}` — always 2 decimal places.

- **Device CPA chart independent date toggle** — the chart has its own **Last 7 | Last 30 | MTD | All Time** buttons in the panel header, completely independent of the main dashboard date filter. Defaults to **Last 30** on every load. Rationale: single-day views (Today/Yesterday) make the trend chart meaningless; the chart should always show a multi-day window regardless of what the main filter is set to.
  - `devTrendPeriod` (module-level var, default `'30'`) — holds the active toggle selection
  - `setDevTrend(period)` — updates `devTrendPeriod`, flips `.dtt-active` class on buttons, calls `refreshDevTrendChart()`
  - `refreshDevTrendChart()` — computes `fromDate` from `devTrendPeriod`, filters `RAW.devices` directly, calls `buildDeviceTrend` + `renderDeviceCPAChart`. Called from `applyFilters()` instead of the old inline build — so campaign changes still re-render the chart.
  - Button CSS: `.dtt-btn` / `.dtt-btn.dtt-active` — purple accent (`#a050ff`) to visually distinguish from the main date filter buttons (which use blue `#38bdf8`)

### Changed

- **Campaign Scorecard card label** — `G.CPA` relabeled to `App CPA` (`.cs-l` element inside each campaign card). Consistent with the KPI tile label and more descriptive than the old abbreviation.

- **KPI layout redesigned — Primary + Secondary grids** — replaced single 6-column KPI grid with two stacked grids:
  - `.kpi-primary` — 4 tiles, `38px` font: Activations · Ad Spend · Applications · Activation CPA
  - `.kpi-secondary` — 2 tiles, `21px` font: Revenue · Application CPA
  - `resetKPIRow()` updated to restore both `.kpi-primary` and `.kpi-secondary` divs inside `kpiRow`

- **"Yesterday at a Glance" section removed** — `renderBrief()` no longer renders the 6-card Yesterday grid. The brief section now only shows Action Items. Eliminates redundant/confusing duplicate data near the top of the dashboard.

- **Keyword action badge logic overhauled — high-converter protection** — keywords that are driving significant conversions can never receive PAUSE or NEGATIVE badges:
  - **Protection rule:** any keyword with `conv >= 5` OR `convShare >= 10%` of total conversions in the period is permanently protected
  - Protected keywords get: `✓ SCALE UP` (FANTASTIC CPA), `✓ KEEP` (≤ GOOD CPA), `⚠ WATCH BID` (POOR CPA — warns without suggesting kill)
  - Only zero-conversion keywords can receive `⛔ PAUSE` (cost > $50) or `⚠ LOW CONV` (cost > $20)
  - `totalConv` calculated at render time from all keyword rows in view
  - Same protection logic applied to Search Terms panel (`totalConvST`)

- **Worst 20 States panel — cost-first display, sorted by highest spend** — replaced `$XX.XX / 0 conv` CPA format with spend-only display:
  - Shows actual spend in amber (e.g. `$1.2k` or `$47.23`) + conversion count separately
  - Sort changed from highest CPA → highest spend (`b.spend - a.spend`)
  - States with 0 conversions show `0 CONV` label in red; states with conversions show count in muted
  - Implemented via separate `makeWorstRows()` function (previously shared `makeRows()` with best panel)
  - All zero-conversion states always show `POOR` label regardless of spend amount

- **Business Trajectory projected spend fix** — `buildTrajectory()` was reading `kpis.spend` which reflects the active date filter (e.g. TODAY = ~$140 partial day). Now reads directly from `RAW.daily` filtered to the current calendar month prefix (`YYYY-MM`), then projects: `mtdSpend / dayOfMonth * daysInMonth`. Accurate regardless of which date range filter is active.

- **Campaign dropdown — active campaigns only** — `populateCampaignDropdown()` now filters to campaigns with spend > 0 in the last 30 days. Paused, removed, or inactive campaigns are excluded. Cutoff date calculated with local date parts (not `toISOString()`) to avoid UTC timezone shift.

- **Intel Feed — switched data source from Google Ads to BGOA spreadsheet** — `renderFeed()` now reads from `RAW.bgoa` instead of `RAW.daily`. Shows the confirmed Assurance funnel data (Date · Ad Spend · Applications · Approvals · Activations). Header row shows 7-day settled averages. Rows sorted most-recent-first, last 30 days shown. This gives a more meaningful view of the confirmed funnel rather than raw Google Ads conversions.

- **Device Performance panel simplified — Applications only** — removed Activation CPA and Activations columns from device cards. Activations were projected (not confirmed) and potentially misleading. Each device card now shows 3 stats only: Application CPA · Applications · Spend. `dev-stats` grid changed from `repeat(4,1fr)` to `repeat(3,1fr)`. Panel title updated to "Application CPA by Device".

- **Tooltip decimal formatting** — all dollar amounts in Chart.js tooltips capped at 2 decimal places. Reference line tooltip callbacks return the label text only (no value). Device trend chart uses `.toFixed(2)` throughout.

### What NOT to Do (additions)
- **Never suggest PAUSE or NEGATIVE for any keyword with ≥5 conversions or ≥10% conversion share** — these are business-critical keywords. Use `⚠ WATCH BID` for high-CPA protected keywords.
- **Never read `kpis.spend` for trajectory/projection calculations** — always read from `RAW.daily` filtered to the calendar month. `kpis.spend` reflects the active date filter and will be wrong for any view other than "This Month".
- **Never show Activation CPA or projected Activations in the Device Performance panel** — activations are estimated (not confirmed by Assurance); the panel only shows Application CPA, Applications, and Spend.
- **Never show paused/inactive campaigns in the campaign dropdown** — filter to last-30-day spend > 0 only.
- **Intel Feed must read from `RAW.bgoa`** — not `RAW.daily`. BGOA has the confirmed funnel (Applications → Approvals → Activations) which is what this panel is for.
- **Never wire the Device CPA trend chart to the main date filter** — it has its own independent toggle (`devTrendPeriod`) and is refreshed via `refreshDevTrendChart()`. The main date filter (Today/Yesterday/Last 7/etc.) should never affect this chart. Always call `refreshDevTrendChart()` from `applyFilters()` — do not call `buildDeviceTrend(f.devices, ...)` directly there.

---

## Pending / Known Issues

- **Budget/bid change history** — user wants to see daily change log. Requires Google Ads Script modification to write to a BudgetHistory tab. Not yet implemented.
- **CampaignMeta tab** — not yet published. Dashboard falls back to MTD avg for live budget display.
- **BGOC (Meta)** — early data (started Apr 2026). CPA will normalize as volume grows.
