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
    'WHERE Impressions > 0 ' +
    'DURING ' + range
  );

  var rows = report.rows(), data = [];
  while (rows.hasNext()) {
    var r = rows.next();
    data.push([r['Date'], r['CampaignName'], r['Impressions'], r['Clicks'],
               r['Cost'], r['Conversions']]);
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
    data.push([r['Date'], r['CampaignName'], r['Device'], r['Impressions'],
               r['Clicks'], r['Cost'], r['Conversions']]);
  }
  if (data.length) sheet.getRange(2, 1, data.length, 7).setValues(data);
  Logger.log('Devices: ' + data.length + ' rows');
}

// ── GEO — STATE LEVEL ─────────────────────────────────────────────────────────
// Uses GEO_PERFORMANCE_REPORT with Region field = state name ("Maryland", "California", etc.)
// NOT MostSpecificCriteriaId (which returns zip codes).
// Matches what you see in the Google Ads UI Location report.
function pushGeo(ss, range) {
  var sheet = getOrCreate(ss, 'Geo');
  sheet.clearContents();
  sheet.appendRow(['Date','CampaignName','Region','Country','Impressions','Clicks','Cost','Conversions','CPA']);

  var report = AdsApp.report(
    'SELECT Date, CampaignName, Region, CountryCriteriaId, Impressions, Clicks, Cost, Conversions ' +
    'FROM GEO_PERFORMANCE_REPORT ' +
    'WHERE Impressions > 0 ' +
    'AND IsTargetingLocation = FALSE ' +  // actual user locations, not just targeted locations
    'DURING ' + range
  );

  // Aggregate by Date + Campaign + Region (state) to avoid duplicate rows
  var agg = {};
  var rows = report.rows();
  while (rows.hasNext()) {
    var r = rows.next();
    var region = r['Region'];
    // Skip rows where Region is a zip code or numeric criterion
    if (!region || /^\d+$/.test(region)) continue;
    var key = r['Date'] + '|' + r['CampaignName'] + '|' + region;
    if (!agg[key]) agg[key] = { date: r['Date'], campaign: r['CampaignName'], region: region,
                                 country: 'United States', impr: 0, clicks: 0, cost: 0, conv: 0 };
    agg[key].impr   += parseInt(r['Impressions'])  || 0;
    agg[key].clicks += parseInt(r['Clicks'])       || 0;
    agg[key].cost   += parseFloat(r['Cost'])       || 0;
    agg[key].conv   += parseFloat(r['Conversions']) || 0;
  }

  var data = Object.values(agg).map(function(a) {
    var cpa = a.conv > 0 ? (a.cost / a.conv).toFixed(2) : '0';
    return [a.date, a.campaign, a.region, a.country,
            a.impr, a.clicks, a.cost.toFixed(2), a.conv.toFixed(2), cpa];
  }).sort(function(a, b) { return a[0] < b[0] ? -1 : 1; }); // sort by date

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
    data.push([r['HourOfDay'], r['CampaignName'], r['Cost'], r['Conversions'],
               r['Clicks'], r['Impressions']]);
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
               r['KeywordMatchType'], r['Impressions'], r['Clicks'], r['Cost'], r['Conversions']]);
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
               r['QueryMatchTypeWithVariant'], r['Impressions'], r['Clicks'],
               r['Cost'], r['Conversions']]);
  }
  if (data.length) sheet.getRange(2, 1, data.length, 9).setValues(data);
  Logger.log('SearchTerms: ' + data.length + ' rows');
}

// ── HELPER ────────────────────────────────────────────────────────────────────
function getOrCreate(ss, name) {
  return ss.getSheetByName(name) || ss.insertSheet(name);
}
