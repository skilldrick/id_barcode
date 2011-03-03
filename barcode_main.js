#include 'barcode_library.js'
#include 'dropdown.js'

var defaultIsbnFont = "Helvetica Neue LT Std\t55 Roman";
var defaultCodeFont = "OCR-B 10 BT\tRegular";


function showDialog() {
  var dialog = new Window('dialog', 'New barcode');
  dialog.orientation = 'column';
  dialog.alignChildren = 'left';
  var input = dialog.add('group');
  input.add('statictext', undefined, 'ISBN:');
  var edittext = input.add('edittext');
  edittext.characters = 20;
  edittext.text = '978-1-906230-16-6';

  var isbnFontRow = dialog.add('group');
  var isbnFontSelect = FontSelect(isbnFontRow, defaultIsbnFont);
  var codeFontRow = dialog.add('group');
  var codeFontSelect = FontSelect(codeFontRow, defaultCodeFont);
  
  var buttonGroup = dialog.add('group');
  buttonGroup.orientation = 'row';
  buttonGroup.add('button', undefined, 'OK', {name: 'ok'});
  buttonGroup.add('button', undefined, 'Cancel', {name: 'cancel'});

  if (dialog.show() === 1) {
    return {
      isbn: edittext.text,
      isbnFont: isbnFontSelect.getFont(),
      codeFont: codeFontSelect.getFont()
    }
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

  function drawBox(x, y, width, height, colour) {
    x *= scale;
    y *= scale;
    width *= scale
    height *= scale;
    var rect = page.rectangles.add();
    rect.strokeWeight = 0;
    rect.fillColor = colour || "Black";
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

  function drawMain(barWidths, font) {
    var pattern = null;
    var widths = null;
    var width = null;
    var digit = null;

    drawChar(hpos - 10, '9', font); //initial '9'

    for (var i = 0; i < barWidths.length; i++) {
      pattern = barWidths[i][0];
      widths = barWidths[i][1];
      digit = barWidths[i][2];

      drawChar(hpos, digit, font);

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

  function drawText(x, y, boxWidth, boxHeight, text, font, align) {
    var fontSize = 12; //this is just a starting point
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
    var safetyCounter = 0;

    //Keep reducing fontsize until no more overset text
    while (textBox.overflows && safetyCounter < 100) {
      textStyle.pointSize -= 0.5;
      safetyCounter++;
    }
  }

  function drawChar(x, character, font) {
    var y = vOffset + height + 1;
    var boxWidth = 7;
    var boxHeight = 9;
    drawText(x, y, boxWidth, boxHeight, character, font, Justification.LEFT_ALIGN);
  }

  function drawWhiteBox() {
    drawBox(hpos - 10, vOffset - 15, 112, 100, 'Paper');
  }

  function init() {
    scale = 0.3;
    height = 70;
    guardHeight = 75;
    reduce = 0.3;
    hpos = 50;
    vOffset = 50;
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

  function drawBarcode(barWidths, spec) {
    init();
    drawWhiteBox();
    drawText(hpos, vOffset - 10, 98, 9,
      "ISBN: " + spec.isbn, spec.isbnFont, Justification.LEFT_ALIGN);
    startGuards();
    drawMain(barWidths, spec.codeFont);
    endGuards();
    page.groups.add(layer.allPageItems);
  }

  return {
    drawBarcode: drawBarcode
  }
})();


var result = showDialog();
if (result) {
  var barWidths = Barcode().init(result.isbn).getNormalisedWidths();
  BarcodeDrawer.drawBarcode(barWidths, result);
}

