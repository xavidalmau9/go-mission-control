# Mission Control · Data Sources Reference
**GO Advertising · Assurance Wireless / BGOA Partner Dashboard**
Last updated: April 2026

---

## 1. Google Ads Script → Google Sheets (Auto-push hourly)

**Spreadsheet ID:** `1ZLzpR9oGk5y2amRr0jS4QPVIIzC44m1VfBRIxDK64Vg`
**Script location:** Google Ads → Tools → Scripts → "Mission Control Data Push"
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

## 7. Dashboard Engineering Notes (Built Sessions)

### Architecture decisions
- **Data priority**: Assurance confirmed data (BGOA/BGOC) ALWAYS beats Google estimates — we get paid on Assurance numbers
- **T+1 reporting**: Today's activations are always unknown (Assurance reports next day) — dashboard never shows today's activations
- **30-day cookie window**: Sundays with $0 Google spend still get BGOA activations — these are merged into chart
- **ACT_TIERS (hardcoded)**: FANTASTIC≤$10 · EXCELLENT≤$12.50 · GOOD≤$15 · POOR>$15 · FATAL>$25 — only hardcoded business constants
- **App CPA thresholds**: Derived mathematically from ACT_TIERS × settled activation rate (never hardcoded)
- **Settled activation rate**: Uses last closed month after the 15th (currently Mar 2026 = ~55%) via `getLiveActRate()`
- **BGOC (Meta) activations**: Merged into confirmed total alongside BGOA — same $25/activation payout
- **Date filtering**: ALL panels (including keywords, search terms, geo, devices) filter by selected date range

### Correct original projections (from projections spreadsheet)
| Month | Projected Activations |
|-------|----------------------|
| Jan 2026 | 0 (testing) |
| Feb 2026 | 500 |
| Mar 2026 | 1,000 |
| Apr 2026 | 2,000 |
| May 2026 | 3,000 |
| Jun 2026 | 4,000 |

**Note**: Dashboard had these shifted +1 month (Jan=500, Feb=1000...) — fixed Apr 2026.

### Reality vs Projections (confirmed paid)
| Month | Projected | Actual BGOA | Beat? |
|-------|-----------|-------------|-------|
| Dec 2025 | 0 | 46 | — (no target) |
| Jan 2026 | 0 | 415 | — (no target, crushed it) |
| Feb 2026 | 500 | 552 | ✅ +10% |
| Mar 2026 | 1,000 | 1,188+ | ✅ +19%+ |
| Apr 2026 | 2,000 | in progress | on track |

### Key Google Ads Script notes
- Script runs hourly via Google Ads → Tools → Scripts → "Mission Control Data Push"
- `LAST_90_DAYS` is invalid AWQL constant — script uses dynamic `dateRange(60)` function instead
- Geo tab reports zip codes (not state names) — dashboard auto-converts to state names via zip lookup
- Script writes to spreadsheet: `1ZLzpR9oGk5y2amRr0jS4QPVIIzC44m1VfBRIxDK64Vg`

### Phased data loading
- **Phase 1 (blocks render)**: bgoa, daily, devices, hourly, geo
- **Phase 2 (background)**: bgoc, keywords, searchTerms, monthly, gva, projVsReal
- After Phase 2 completes, `applyFilters()` is called to re-render with full data respecting current date range

---

## 8. If the Dashboard Shows "NO DATA"

1. Open browser console (F12 → Console tab) — check for specific error messages
2. Click the **↻ RETRY** button on the red banner
3. Verify Google Ads Script is still running: Google Ads → Tools → Scripts → check last run time
4. If script stopped: click the play button to run manually, then retry dashboard
5. Check the published URLs above are still valid (re-publish if needed)
