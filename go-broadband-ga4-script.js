/**
 * Go Broadband — GA4 Analytics Data Push
 * GO Advertising · gobroadband.io
 *
 * Pushes Google Analytics 4 data into the Go Broadband spreadsheet every hour.
 * Property ID: 490139635 (gobroadband.io)
 *
 * SETUP (one time):
 * 1. Go to script.google.com → New project → name it "Go Broadband GA4 Push"
 * 2. Click "+" next to Services → search "Google Analytics Data API" → Add
 * 3. Paste this script → Save
 * 4. Click Run → main() → authorize when prompted
 *    (Google account must have at least Viewer access to GA4 property 490139635)
 * 5. Set hourly trigger:
 *    Triggers (clock icon, left sidebar) → Add trigger
 *    Function: main | Time-driven | Hour timer | Every hour → Save
 */

var SPREADSHEET_ID = '10_X-G597viMypxssx9hoGr1k9RYVAooKoJngg5xZ878';
var PROPERTY = 'properties/490139635';
var DAYS_BACK = 30;

function main() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  pushGA4Daily(ss);
  pushGA4Sources(ss);
  pushGA4Pages(ss);
  pushGA4Realtime(ss);
  Logger.log('GA4 push complete: ' + new Date());
}

// ── HELPERS ───────────────────────────────────────────────────────────────────
function fmtDate(d) {
  // Convert YYYYMMDD (GA4 format) to YYYY-MM-DD
  return d.slice(0,4) + '-' + d.slice(4,6) + '-' + d.slice(6,8);
}

function startDate() {
  var d = new Date();
  d.setDate(d.getDate() - DAYS_BACK);
  return d.getFullYear() + '-'
    + ('0'+(d.getMonth()+1)).slice(-2) + '-'
    + ('0'+d.getDate()).slice(-2);
}

function getOrCreate(ss, name) {
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

// ── DAILY SUMMARY ─────────────────────────────────────────────────────────────
// One row per day: sessions, engaged sessions, engagement rate, users, new users, avg duration
function pushGA4Daily(ss) {
  var sheet = getOrCreate(ss, 'GA4Daily');
  sheet.clearContents();
  sheet.appendRow(['Date','Sessions','EngagedSessions','EngagementRate','Users','NewUsers','AvgSessionDuration']);

  var response = AnalyticsData.Properties.runReport({
    dateRanges: [{ startDate: startDate(), endDate: 'today' }],
    dimensions: [{ name: 'date' }],
    metrics: [
      { name: 'sessions' },
      { name: 'engagedSessions' },
      { name: 'engagementRate' },
      { name: 'totalUsers' },
      { name: 'newUsers' },
      { name: 'averageSessionDuration' }
    ],
    orderBys: [{ dimension: { dimensionName: 'date' }, desc: false }]
  }, PROPERTY);

  var data = [];
  if (response.rows) {
    response.rows.forEach(function(row) {
      data.push([
        fmtDate(row.dimensionValues[0].value),
        +(row.metricValues[0].value) || 0,
        +(row.metricValues[1].value) || 0,
        +((+(row.metricValues[2].value) * 100).toFixed(1)) || 0, // store as 0-100 percent
        +(row.metricValues[3].value) || 0,
        +(row.metricValues[4].value) || 0,
        +(+(row.metricValues[5].value)).toFixed(1) || 0           // seconds
      ]);
    });
  }
  if (data.length) sheet.getRange(2, 1, data.length, 7).setValues(data);
  Logger.log('GA4Daily: ' + data.length + ' rows');
}

// ── TRAFFIC SOURCES ────────────────────────────────────────────────────────────
// Sessions broken down by default channel group (Paid Search, Organic, Direct, Referral, etc.)
function pushGA4Sources(ss) {
  var sheet = getOrCreate(ss, 'GA4Sources');
  sheet.clearContents();
  sheet.appendRow(['Date','Channel','Sessions','EngagedSessions','Users']);

  var response = AnalyticsData.Properties.runReport({
    dateRanges: [{ startDate: startDate(), endDate: 'today' }],
    dimensions: [
      { name: 'date' },
      { name: 'sessionDefaultChannelGroup' }
    ],
    metrics: [
      { name: 'sessions' },
      { name: 'engagedSessions' },
      { name: 'totalUsers' }
    ],
    orderBys: [{ dimension: { dimensionName: 'date' }, desc: false }]
  }, PROPERTY);

  var data = [];
  if (response.rows) {
    response.rows.forEach(function(row) {
      data.push([
        fmtDate(row.dimensionValues[0].value),
        row.dimensionValues[1].value,
        +(row.metricValues[0].value) || 0,
        +(row.metricValues[1].value) || 0,
        +(row.metricValues[2].value) || 0
      ]);
    });
  }
  if (data.length) sheet.getRange(2, 1, data.length, 5).setValues(data);
  Logger.log('GA4Sources: ' + data.length + ' rows');
}

// ── TOP PAGES ─────────────────────────────────────────────────────────────────
// Top pages by sessions — date + path + title + engagement
function pushGA4Pages(ss) {
  var sheet = getOrCreate(ss, 'GA4Pages');
  sheet.clearContents();
  sheet.appendRow(['Date','PagePath','PageTitle','Sessions','EngagedSessions','AvgDuration']);

  var response = AnalyticsData.Properties.runReport({
    dateRanges: [{ startDate: startDate(), endDate: 'today' }],
    dimensions: [
      { name: 'date' },
      { name: 'pagePath' },
      { name: 'pageTitle' }
    ],
    metrics: [
      { name: 'sessions' },
      { name: 'engagedSessions' },
      { name: 'averageSessionDuration' }
    ],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    limit: 500
  }, PROPERTY);

  var data = [];
  if (response.rows) {
    response.rows.forEach(function(row) {
      data.push([
        fmtDate(row.dimensionValues[0].value),
        row.dimensionValues[1].value,
        row.dimensionValues[2].value,
        +(row.metricValues[0].value) || 0,
        +(row.metricValues[1].value) || 0,
        +(+(row.metricValues[2].value)).toFixed(1) || 0
      ]);
    });
  }
  if (data.length) sheet.getRange(2, 1, data.length, 6).setValues(data);
  Logger.log('GA4Pages: ' + data.length + ' rows');
}

// ── REALTIME ──────────────────────────────────────────────────────────────────
// Active users right now, broken down by page
// Row 2 = TOTAL (dashboard reads this for "Active Now" tile)
// Rows 3+ = per-page breakdown
function pushGA4Realtime(ss) {
  var sheet = getOrCreate(ss, 'GA4Realtime');
  sheet.clearContents();
  sheet.appendRow(['UpdatedAt','ActiveUsers','Screen']);

  var response = AnalyticsData.Properties.runRealtimeReport({
    dimensions: [{ name: 'unifiedScreenName' }],
    metrics: [{ name: 'activeUsers' }],
    orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
    limit: 10
  }, PROPERTY);

  var totalActive = 0;
  var data = [];
  if (response.rows) {
    response.rows.forEach(function(row) {
      var cnt = +(row.metricValues[0].value) || 0;
      totalActive += cnt;
      data.push([new Date().toISOString(), cnt, row.dimensionValues[0].value]);
    });
  }

  // Row 2: TOTAL — dashboard reads this row for the "Active Now" tile
  sheet.getRange(2, 1, 1, 3).setValues([[new Date().toISOString(), totalActive, 'TOTAL']]);
  // Rows 3+: per-page breakdown
  if (data.length) sheet.getRange(3, 1, data.length, 3).setValues(data);
  Logger.log('GA4Realtime: ' + totalActive + ' active users');
}
