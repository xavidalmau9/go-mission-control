# Mission Control Dashboard — Claude Project Instructions
**GO Advertising · Assurance Wireless / BGOA Partner Dashboard**
**Last updated: April 16, 2026 (session 2)**

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
POOR      : > $15.00 per activation
FATAL     : > $25.00 per activation (costs more than we earn)
```
App CPA thresholds are DERIVED: App CPA tier = Act CPA tier × activation_rate (never hardcoded)

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
| All states data wrong — CA showing 1 conversion | Same AWQL comma bug in `pushGeo`, `pushKeywords`, `pushSearchTerms` — `parseFloat("1,234")` = 1 | Applied `cleanNum()` to all numeric fields in all 6 script functions |
| Remaining `parseFloat` calls in dashboard | `renderBrief`, `buildDevices`, keyword CPA list still used raw `parseFloat()` | All converted to `pn()` |
| Activation Rate showing confirmed % for TODAY | TODAY has no confirmed activation data (T+1) — showing 55.8% implied it was real | TODAY and fallback views now show "PROJECTED" label in amber |

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

## Pending / Known Issues (as of Apr 16, 2026)

- **Budget/bid change history** — user wants to see daily change log. Requires Google Ads Script modification to write to a BudgetHistory tab. Not yet implemented.
- **CampaignMeta tab** — not yet published. Dashboard falls back to MTD avg for live budget display.
- **BGOC (Meta)** — early data (started Apr 2026). CPA will normalize as volume grows.
