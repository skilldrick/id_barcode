#include 'barcode_library.js'
#include 'dropdown.js'


function showDialog() {
  var dialog = new Window('dialog', 'New barcode');
  dialog.orientation = 'column';
  var input = dialog.add('group');
  input.add('statictext', undefined, 'ISBN:');
  var edittext = input.add('edittext');
  edittext.characters = 20;
  edittext.text = '978-1-906230-16-6';

  /*
  var fontRow = dialog.add('group');
  var fontSelect = FontSelect(fontRow);
  */
  
  var buttonGroup = dialog.add('group');
  buttonGroup.orientation = 'row';
  buttonGroup.add('button', undefined, 'OK', {name: 'ok'});
  buttonGroup.add('button', undefined, 'Cancel', {name: 'cancel'});

  if (dialog.show() === 1) {
    return edittext.text;
  }
  else {
    return false;
  }
}

var BarcodeDrawer = (function () {
  var doc;
  var page;
  var layer;
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
    var digit = null;

    drawChar(hpos - 10, '9'); //initial '9'

    for (var i = 0; i < barWidths.length; i++) {
      pattern = barWidths[i][0];
      widths = barWidths[i][1];
      digit = barWidths[i][2];

      drawChar(hpos, digit);

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

  function drawText(x, y, boxWidth, boxHeight, text, font, align, fontSize) {
    x *= scale;
    y *= scale;
    boxWidth *= scale;
    boxHeight *= scale;
    var textBox = page.textFrames.add();
    textBox.contents = text;
    var textStyle = textBox.textStyleRanges[0];
    textStyle.appliedFont = font;
    textStyle.pointSize = fontSize;
    textStyle.justification = align;
    textBox.geometricBounds = [y, x, y + boxHeight, x + boxWidth];
  }

  function drawChar(x, character) {
    var y = vOffset + height + 1;
    var boxWidth = 7;
    var boxHeight = 9;
    drawText(x, y, boxWidth, boxHeight, character, 'OCR-B 10 BT', Justification.CENTER_ALIGN, 9);
  }

  function init() {
    scale = 0.3;
    height = 70;
    guardHeight = 75;
    reduce = 0.3;
    hpos = 15;
    vOffset = 15;
    doc = getCurrentOrNewDocument();
    page = app.activeWindow.activePage;
    var viewPrefs = doc.viewPreferences;
    viewPrefs.horizontalMeasurementUnits = MeasurementUnits.millimeters;
    viewPrefs.verticalMeasurementUnits = MeasurementUnits.millimeters;
    layer = doc.layers.item('barcode');
    if (layer.isValid) {
      layer.remove();
    }
    doc.layers.add({name: 'barcode'});
    layer = doc.layers.item('barcode');
  }

  function drawBarcode(barWidths, isbn) {
    init();
    drawText(hpos, vOffset - 10, 100, 9,
      "ISBN: " + isbn, 'Helvetica Neue LT Std\t55 Roman', Justification.LEFT_ALIGN, 7);
    startGuards();
    drawMain(barWidths);
    endGuards();
    page.groups.add(layer.allPageItems);
  }

  return {
    drawBarcode: drawBarcode
  }
})();


var isbn = showDialog();
if (isbn) {
  var barWidths = Barcode().init(isbn).getNormalisedWidths();
  BarcodeDrawer.drawBarcode(barWidths, isbn);
}

