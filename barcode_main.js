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

function DrawLineMaker() {
  var doc = getCurrentOrNewDocument();
  var page = app.activeWindow.activePage;
  return function (x1, y1, x2, y2) {
    var pathPoints = page.graphicLines.add().paths[0].pathPoints;
    pathPoints[0].anchor = [x1, y1];
    pathPoints[1].anchor = [x2, y2];
  }
}

function DrawBoxMaker() {
  var doc = getCurrentOrNewDocument();
  var page = app.activeWindow.activePage;
  return function (x, y, width, height) {
    var rect = page.rectangles.add();
    rect.strokeWeight = 0;
    rect.fillColor = "Black";
    rect.geometricBounds = [y, x, y + height, x + width];
  }
}

function getCurrentOrNewDocument() {
  var doc = app.documents[0];
  if (!doc.isValid) {
    doc = app.documents.add();
  }
  return doc;
}

function drawBarcode(barWidths) {
  var height = 70;
  var guardHeight = 75;
  var reduce = 0.3;
  var pattern = null;
  var widths = null;
  var width = 0;
  var drawLine = DrawLineMaker();
  var drawBox = DrawBoxMaker();
  var hpos = 0;

  drawBox(hpos, 0, 1-reduce, guardHeight);
  hpos += 2;
  drawBox(hpos, 0, 1-reduce, guardHeight);
  hpos += 1;

  for (var i = 0; i < barWidths.length; i++) {
    pattern = barWidths[i][0];
    widths = barWidths[i][1];
    for (var j = 0; j < 4; j++) {
      width = widths[j];
      if (pattern[j] === 1) {
        drawBox(hpos, 0, width-reduce, height-reduce);
      }
      hpos += width;
    }

    if (i == 5) {
      hpos += 1;
      drawBox(hpos, 0, 1-reduce, guardHeight);
      hpos += 2;
      drawBox(hpos, 0, 1-reduce, guardHeight);
      hpos += 2;
    }
  }

  drawBox(hpos, 0, 1-reduce, guardHeight);
  hpos += 2;
  drawBox(hpos, 0, 1-reduce, guardHeight);
  hpos += 2;
}

var isbn = showDialog();
if (isbn) {
  var barWidths = Barcode().init(isbn).getNormalisedWidths();

  drawBarcode(barWidths);
}

