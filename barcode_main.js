#include 'barcode_library.js'


function showDialog() {
  var dialog = app.dialogs.add({name: "New barcode", canCancel: true});
  var leftCol = dialog.dialogColumns.add();
  var rightCol = dialog.dialogColumns.add();
  var label = leftCol.staticTexts.add({staticLabel: "ISBN:"});
  var editbox = rightCol.textEditboxes.add();
  editbox.minWidth = 200;
  editbox.editContents = '978-1-906230-16-6';

  if (dialog.show()) {
    return editbox.editContents;
  }
  else {
    return false;
  }
}

var BarcodeDrawer = (function () {
  var doc;
  var page;
  var scale;
  var height;
  var guardHeight;
  var reduce;
  var hpos;
  var vOffset;

  function drawLine(x1, y1, x2, y2) {
    x1 *= scale;
    y1 *= scale;
    x2 *= scale;
    y2 *= scale;
    var pathPoints = page.graphicLines.add().paths[0].pathPoints;
    pathPoints[0].anchor = [x1, y1];
    pathPoints[1].anchor = [x2, y2];
  }

  function drawBox(x, y, width, height) {
    x *= scale;
    y *= scale;
    width *= scale
    height *= scale;
    var rect = page.rectangles.add();
    rect.strokeWeight = 0;
    rect.fillColor = "Black";
    rect.geometricBounds = [y, x, y + height, x + width];
  }

  function getCurrentOrNewDocument() {
    var doc = app.documents[0];
    if (!doc.isValid) {
      doc = app.documents.add();
    }
    return doc;
  }

  function drawBar(width) {
    drawBox(hpos, vOffset, width - reduce, height);
  }

  function drawGuard() {
    drawBox(hpos, vOffset, 1 - reduce, guardHeight);
  }

  function startGuards() {
    drawGuard();
    hpos += 2;
    drawGuard();
    hpos += 1;
  }

  function midGuards() {
    hpos += 1;
    drawGuard();
    hpos += 2;
    drawGuard();
    hpos += 2;
  }

  function endGuards() {
    drawGuard();
    hpos += 2;
    drawGuard();
    hpos += 2;
  }

  function drawMain(barWidths) {
    var pattern = null;
    var widths = null;
    var width = null;

    for (var i = 0; i < barWidths.length; i++) {
      pattern = barWidths[i][0];
      widths = barWidths[i][1];
      for (var j = 0; j < 4; j++) {
        width = widths[j];
        if (pattern[j] === 1) {
          drawBar(width);
        }
        hpos += width;
      }
      if (i == 5) {
        midGuards();
      }
    }
  }

  function init() {
    scale = 0.3;
    height = 70;
    guardHeight = 75;
    reduce = 0.3;
    hpos = 0;
    vOffset = 0;
    doc = getCurrentOrNewDocument();
    page = app.activeWindow.activePage;
    var viewPrefs = doc.viewPreferences;
    viewPrefs.horizontalMeasurementUnits = MeasurementUnits.millimeters;
    viewPrefs.verticalMeasurementUnits = MeasurementUnits.millimeters;
  }

  function drawBarcode(barWidths) {
    init();
    startGuards();
    drawMain(barWidths);
    endGuards();
  }

  return {
    drawBarcode: drawBarcode
  }
})();


var isbn = showDialog();
if (isbn) {
  var barWidths = Barcode().init(isbn).getNormalisedWidths();
  BarcodeDrawer.drawBarcode(barWidths);
}

