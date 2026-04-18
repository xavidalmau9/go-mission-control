/**
 * Mission Control Data Push
 * GO Advertising · Assurance Wireless / BGOA Partner Dashboard
 *
 * Pushes Google Ads performance data to Google Sheets every hour.
 * Spreadsheet ID: 1ZLzpR9oGk5y2amRr0jS4QPVIIzC44m1VfBRIxDK64Vg
 *
 * Schedule: Every hour via Google Ads Scripts
 */

var SPREADSHEET_ID = '1ZLzpR9oGk5y2amRr0jS4QPVIIzC44m1VfBRIxDK64Vg';
var DAYS_BACK = 60;

// Build a DURING clause for the last N days
function dateRange(days) {
  var end   = new Date();
  var start = new Date();
  start.setDate(start.getDate() - days);
  function fmt(d) {
    return d.getFullYear() + '' +
      ('0' + (d.getMonth()+1)).slice(-2) +
      ('0' + d.getDate()).slice(-2);
  }
  return fmt(start) + ',' + fmt(end);
}

function main() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var range = dateRange(DAYS_BACK);

  pushDailyCampaign(ss, range);
  pushDevices(ss, range);
  pushGeo(ss, range);        // ← STATE LEVEL — "Maryland", "California", etc.
  pushHourly(ss, range);
  pushKeywords(ss, range);
  pushSearchTerms(ss, range);

  Logger.log('Mission Control push complete: ' + new Date());
}

// ── DAILY CAMPAIGN ────────────────────────────────────────────────────────────
function pushDailyCampaign(ss, range) {
  var sheet = getOrCreate(ss, 'DailyCampaign');
  sheet.clearContents();
  sheet.appendRow(['Date','CampaignName','Impressions','Clicks','Cost','Conversions']);

  var report = AdsApp.report(
    'SELECT Date, CampaignName, Impressions, Clicks, Cost, Conversions ' +
    'FROM CAMPAIGN_PERFORMANCE_REPORT ' +
    'WHERE Cost > 0 ' +
    'DURING ' + range
  );

  var rows = report.rows(), data = [];
  while (rows.hasNext()) {
    var r = rows.next();
    data.push([r['Date'], r['CampaignName'],
               cleanNum(r['Impressions']), cleanNum(r['Clicks']),
               cleanNum(r['Cost']),        cleanNum(r['Conversions'])]);
  }
  if (data.length) sheet.getRange(2, 1, data.length, 6).setValues(data);
  Logger.log('DailyCampaign: ' + data.length + ' rows');
}

// ── DEVICES ───────────────────────────────────────────────────────────────────
function pushDevices(ss, range) {
  var sheet = getOrCreate(ss, 'Devices');
  sheet.clearContents();
  sheet.appendRow(['Date','CampaignName','Device','Impressions','Clicks','Cost','Conversions']);

  var report = AdsApp.report(
    'SELECT Date, CampaignName, Device, Impressions, Clicks, Cost, Conversions ' +
    'FROM CAMPAIGN_PERFORMANCE_REPORT ' +
    'WHERE Impressions > 0 ' +
    'DURING ' + range
  );

  var rows = report.rows(), data = [];
  while (rows.hasNext()) {
    var r = rows.next();
    data.push([r['Date'], r['CampaignName'], r['Device'],
               cleanNum(r['Impressions']), cleanNum(r['Clicks']),
               cleanNum(r['Cost']),        cleanNum(r['Conversions'])]);
  }
  if (data.length) sheet.getRange(2, 1, data.length, 7).setValues(data);
  Logger.log('Devices: ' + data.length + ' rows');
}

// ── GEO — STATE LEVEL ─────────────────────────────────────────────────────────
// Uses RegionCriteriaId (valid AWQL field) and looks up state name from a
// Google Ads geographic criterion ID table. This avoids the "Region" field
// which is not valid in AWQL and avoids MostSpecificCriteriaId (zip codes).

var US_STATE_CRITERIA = {
  21132:'Alabama',    21133:'Alaska',        21134:'Arizona',      21135:'Arkansas',
  21136:'California', 21137:'Colorado',      21138:'Connecticut',  21139:'Delaware',
  21140:'Florida',    21141:'Georgia',       21142:'Hawaii',       21143:'Idaho',
  21144:'Illinois',   21145:'Indiana',       21146:'Iowa',         21147:'Kansas',
  21148:'Kentucky',   21149:'Louisiana',     21150:'Maine',        21151:'Maryland',
  21152:'Massachusetts', 21153:'Michigan',   21154:'Minnesota',    21155:'Mississippi',
  21156:'Missouri',   21157:'Montana',       21158:'Nebraska',     21159:'Nevada',
  21160:'New Hampshire', 21161:'New Jersey', 21162:'New Mexico',   21163:'New York',
  21164:'North Carolina', 21165:'North Dakota', 21166:'Ohio',      21167:'Oklahoma',
  21168:'Oregon',     21169:'Pennsylvania',  21170:'Rhode Island', 21171:'South Carolina',
  21172:'South Dakota', 21173:'Tennessee',   21174:'Texas',        21175:'Utah',
  21176:'Vermont',    21177:'Virginia',      21178:'Washington',   21179:'West Virginia',
  21180:'Wisconsin',  21181:'Wyoming',       21182:'Washington DC', 21183:'Puerto Rico'
};

function pushGeo(ss, range) {
  var sheet = getOrCreate(ss, 'Geo');
  sheet.clearContents();
  sheet.appendRow(['Date','CampaignName','Region','Country','Impressions','Clicks','Cost','Conversions','CPA']);

  var report = AdsApp.report(
    'SELECT Date, CampaignName, RegionCriteriaId, Impressions, Clicks, Cost, Conversions ' +
    'FROM GEO_PERFORMANCE_REPORT ' +
    'WHERE Cost > 0 ' +
    'DURING ' + range
  );

  // IsTargetingLocation NOT selected — AWQL returns combined/aggregated rows
  // matching the Google Ads UI Location Report (no targeting vs user-location split).
  // NOTE: AWQL GEO_PERFORMANCE_REPORT uses impression-based geo attribution, so
  // conversions will be lower than the UI Location Report (which uses click-based
  // attribution across all windows). The data is directionally correct but will
  // not exactly match the UI — especially for large states like CA and TX.
  var agg = {};
  var rows = report.rows();
  while (rows.hasNext()) {
    var r = rows.next();
    var regionId = parseInt(r['RegionCriteriaId']) || 0;
    var stateName = US_STATE_CRITERIA[regionId];
    if (!stateName) continue; // skip non-US-state rows (countries, DMAs, cities)
    var key = r['Date'] + '|' + r['CampaignName'] + '|' + stateName;
    if (!agg[key]) agg[key] = { date: r['Date'], campaign: r['CampaignName'],
                                 region: stateName, impr: 0, clicks: 0, cost: 0, conv: 0 };
    agg[key].impr   += cleanNum(r['Impressions']);
    agg[key].clicks += cleanNum(r['Clicks']);
    agg[key].cost   += cleanNum(r['Cost']);
    agg[key].conv   += cleanNum(r['Conversions']);
  }

  var data = Object.values(agg).map(function(a) {
    var cpa = a.conv > 0 ? (a.cost / a.conv).toFixed(2) : '0';
    return [a.date, a.campaign, a.region, 'United States',
            a.impr, a.clicks, a.cost.toFixed(2), a.conv.toFixed(2), cpa];
  }).sort(function(a, b) { return a[0] < b[0] ? -1 : 1; });

  if (data.length) sheet.getRange(2, 1, data.length, 9).setValues(data);
  Logger.log('Geo: ' + data.length + ' rows (state level)');
}

// ── HOURLY ────────────────────────────────────────────────────────────────────
function pushHourly(ss, range) {
  var sheet = getOrCreate(ss, 'Hourly');
  sheet.clearContents();
  sheet.appendRow(['HourOfDay','CampaignName','Cost','Conversions','Clicks','Impressions']);

  var report = AdsApp.report(
    'SELECT HourOfDay, CampaignName, Cost, Conversions, Clicks, Impressions ' +
    'FROM CAMPAIGN_PERFORMANCE_REPORT ' +
    'WHERE Impressions > 0 ' +
    'DURING ' + range
  );

  var rows = report.rows(), data = [];
  while (rows.hasNext()) {
    var r = rows.next();
    data.push([r['HourOfDay'], r['CampaignName'],
               cleanNum(r['Cost']),        cleanNum(r['Conversions']),
               cleanNum(r['Clicks']),      cleanNum(r['Impressions'])]);
  }
  if (data.length) sheet.getRange(2, 1, data.length, 6).setValues(data);
  Logger.log('Hourly: ' + data.length + ' rows');
}

// ── KEYWORDS ──────────────────────────────────────────────────────────────────
function pushKeywords(ss, range) {
  var sheet = getOrCreate(ss, 'Keywords');
  sheet.clearContents();
  sheet.appendRow(['Date','CampaignName','AdGroupName','Keyword','MatchType','Impressions','Clicks','Cost','Conversions']);

  var report = AdsApp.report(
    'SELECT Date, CampaignName, AdGroupName, Criteria, KeywordMatchType, ' +
    'Impressions, Clicks, Cost, Conversions ' +
    'FROM KEYWORDS_PERFORMANCE_REPORT ' +
    'WHERE Impressions > 0 ' +
    'DURING ' + range
  );

  var rows = report.rows(), data = [];
  while (rows.hasNext()) {
    var r = rows.next();
    data.push([r['Date'], r['CampaignName'], r['AdGroupName'], r['Criteria'],
               r['KeywordMatchType'], cleanNum(r['Impressions']), cleanNum(r['Clicks']),
               cleanNum(r['Cost']), cleanNum(r['Conversions'])]);
  }
  if (data.length) sheet.getRange(2, 1, data.length, 9).setValues(data);
  Logger.log('Keywords: ' + data.length + ' rows');
}

// ── SEARCH TERMS ──────────────────────────────────────────────────────────────
function pushSearchTerms(ss, range) {
  var sheet = getOrCreate(ss, 'SearchTerms');
  sheet.clearContents();
  sheet.appendRow(['Date','CampaignName','AdGroupName','SearchTerm','MatchType','Impressions','Clicks','Cost','Conversions']);

  var report = AdsApp.report(
    'SELECT Date, CampaignName, AdGroupName, Query, QueryMatchTypeWithVariant, ' +
    'Impressions, Clicks, Cost, Conversions ' +
    'FROM SEARCH_QUERY_PERFORMANCE_REPORT ' +
    'WHERE Impressions > 0 ' +
    'DURING ' + range
  );

  var rows = report.rows(), data = [];
  while (rows.hasNext()) {
    var r = rows.next();
    data.push([r['Date'], r['CampaignName'], r['AdGroupName'], r['Query'],
               r['QueryMatchTypeWithVariant'], cleanNum(r['Impressions']), cleanNum(r['Clicks']),
               cleanNum(r['Cost']), cleanNum(r['Conversions'])]);
  }
  if (data.length) sheet.getRange(2, 1, data.length, 9).setValues(data);
  Logger.log('SearchTerms: ' + data.length + ' rows');
}

// ── HELPER ────────────────────────────────────────────────────────────────────
function getOrCreate(ss, name) {
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

// Strip commas from AWQL numeric strings (e.g. "1,083.67" → 1083.67)
// AWQL returns numbers with comma separators for values >= 1000.
// parseFloat("1,083.67") = 1 — so we must strip commas before writing to sheet.
function cleanNum(v) {
  return parseFloat(String(v || '').replace(/,/g, '')) || 0;
}
