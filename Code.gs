/**
 * LAB SAMPLE TRACKER — Google Apps Script backend
 *
 * SETUP:
 * 1. Create a Google Sheet. Rename the first tab to exactly: Samples
 * 2. In row 1, add these headers (exact spelling, in this order):
 *    ID | Name | HospitalNumber | Age | Sex | TestOrdered | DateOrdered | Status | DateResultReceived | Remarks | LastUpdated
 * 3. Extensions > Apps Script. Delete any starter code, paste this whole file in.
 * 4. Click Deploy > New deployment > type: Web app.
 *    - Execute as: Me
 *    - Who has access: Anyone (this makes the API reachable from your GitHub Pages site;
 *      it does NOT make your sheet itself public, only these two functions)
 * 5. Copy the Web app URL — you'll paste it into the dashboard's Settings.
 * 6. Re-deploy (Deploy > Manage deployments > edit > new version) any time you edit this file.
 */

var SHEET_NAME = 'Samples';

function getSheet_() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) {
    throw new Error('No sheet tab named "' + SHEET_NAME + '" found.');
  }
  return sheet;
}

function jsonOut_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  try {
    var sheet = getSheet_();
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var rows = data.slice(1)
      .filter(function (row) { return row.join('') !== ''; })
      .map(function (row) {
        var obj = {};
        headers.forEach(function (h, i) {
          var v = row[i];
          obj[h] = (v instanceof Date) ? v.toISOString() : v;
        });
        return obj;
      });
    return jsonOut_({ ok: true, samples: rows });
  } catch (err) {
    return jsonOut_({ ok: false, error: String(err) });
  }
}

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    var sheet = getSheet_();
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var idCol = headers.indexOf('ID');
    var updatedCol = headers.indexOf('LastUpdated');

    if (payload.action === 'add') {
      var s = payload.sample || {};
      if (!s.ID) s.ID = 'T-' + Utilities.getUuid().slice(0, 8).toUpperCase();
      var newRow = headers.map(function (h) {
        if (h === 'LastUpdated') return new Date().toISOString();
        return s[h] !== undefined ? s[h] : '';
      });
      sheet.appendRow(newRow);
      return jsonOut_({ ok: true, id: s.ID });
    }

    if (payload.action === 'update') {
      var s2 = payload.sample || {};
      for (var i = 1; i < data.length; i++) {
        if (String(data[i][idCol]) === String(s2.ID)) {
          headers.forEach(function (h, colIdx) {
            if (h === 'LastUpdated') {
              sheet.getRange(i + 1, colIdx + 1).setValue(new Date().toISOString());
            } else if (s2[h] !== undefined) {
              sheet.getRange(i + 1, colIdx + 1).setValue(s2[h]);
            }
          });
          return jsonOut_({ ok: true });
        }
      }
      return jsonOut_({ ok: false, error: 'ID not found: ' + s2.ID });
    }

    if (payload.action === 'delete') {
      var targetId = payload.id;
      for (var j = 1; j < data.length; j++) {
        if (String(data[j][idCol]) === String(targetId)) {
          sheet.deleteRow(j + 1);
          return jsonOut_({ ok: true });
        }
      }
      return jsonOut_({ ok: false, error: 'ID not found: ' + targetId });
    }

    return jsonOut_({ ok: false, error: 'Unknown action: ' + payload.action });
  } catch (err) {
    return jsonOut_({ ok: false, error: String(err) });
  }
}
