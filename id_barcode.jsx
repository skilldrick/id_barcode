function log(text) {
  $.writeln(text);
}

var Barcode = function () {
  var barcode_string;
  var addon_string;
  var stripped;

  function getNorm(bars) {
    var curr = bars[0];
    var counter = 1;
    var norm = [];
    for (var i = 1; i < bars.length; i++) {
      if (curr !== bars[i]) {
        norm.push(counter);
        counter = 1;
        curr = bars[i];
      }
      else {
        counter++;
      }
    }
    norm.push(counter);
    return norm;
  }

  function strip(str) {
    return str.replace(/[^\d]+/g, '');
  }

  return {
    init: function (isbnStr, addonStr) {
      if (isbnStr) {
        barcode_string = isbnStr;
        stripped = strip(barcode_string);
        if ( !this.checkCheckDigit() ) {
          throw "Check digit incorrect";
        }
      }

      if (addonStr) {
        addon_string = strip(addonStr);
      }

      return this;
    },

    getStripped: function () {
      return stripped;
    },

    getCheckDigit: function () {
      return this.getDigit(12);
    },

    getDigit: function (digit) {
      return parseInt(stripped[digit], 10);
    },

    checkCheckDigit: function () {
      var total = 0;
      for (var i = 0; i < stripped.length - 1; i++) { //-1 because we don't include check digit
        if (i % 2 === 0) {
          total += this.getDigit(i);
        }
        else {
          total += this.getDigit(i) * 3;
        }
      }
      var checkDigit = 10 - (total % 10);
      return (checkDigit === this.getCheckDigit());
    },

    getBarWidths: function () {
      var barWidths = [];
      for (var i = 1; i < stripped.length; i++) { //don't include first number of barcode
        var encoding = pattern[i - 1];
        var thisBarWidth = bar_widths[encoding][stripped[i]];
        barWidths.push(thisBarWidth);
      }
      return barWidths;
    },

    getNormalisedWidths: function () {
      var barWidths = this.getBarWidths();
      var normalisedWidths = [];
      var current = [];
      for (var i = 0; i < barWidths.length; i++) {
        current = [];
        if (barWidths[i][0] === 0) {
          current.push([0, 1, 0, 1]);
        }
        else {
          current.push([1, 0, 1, 0]);
        }
        var norm = getNorm(barWidths[i]);
        current.push(norm);
        current.push(stripped[i+1]); //add isbn digit
        normalisedWidths.push(current);
      }
      return normalisedWidths;

    },

    getAddonWidths: function () {
      if (! addon_string) {
        return false;
      }
      else {
        var checksum = this.getAddonChecksum();
        var pattern = addon_pattern[checksum];
        var widths = [];
        for (var i = 0; i < addon_string.length; i++) {
          //separators:
          if (i === 0) {
            widths.push([0, 1, 0, 1, 1]);
          }
          else {
            widths.push([0, 1]);
          }
          var encoding = pattern[i];
          widths.push(bar_widths[encoding][addon_string[i]]);
        }
        return widths;
      }
    },

    getNormalisedAddon: function () {
      var addonWidths = this.getAddonWidths();
      if (! addonWidths) {
        return false;
      }
      var normalisedAddon = [];
      var current = [];
      for (var i = 0; i < addonWidths.length; i++) {
        current = [];
        if (addonWidths[i].length == 2) {
          current.push([0, 1])
        }
        else {
          current.push([0, 1, 0, 1]);
        }
        current.push(getNorm(addonWidths[i]));
        if (i % 2 == 1) {
          current.push(addon_string[Math.floor(i / 2)]);
        }
        normalisedAddon.push(current);
      }

      return normalisedAddon;
    },

    getAddonChecksum: function () {
      var total = 0;
      for (var i = 0; i < addon_string.length; i++) {
        if (i % 2 === 0) {
          total += addon_string[i] * 3;
        }
        else {
          total += addon_string[i] * 9;
        }
      }
      return total % 10;
    }

  }
};

/*
*
* http://en.wikipedia.org/wiki/European_Article_Number
*
*/

var pattern = ['L', 'G', 'G', 'L', 'G', 'L', 'R', 'R', 'R', 'R', 'R', 'R'];

var addon_pattern = [
  ['G', 'G', 'L', 'L', 'L'],
  ['G', 'L', 'G', 'L', 'L'],
  ['G', 'L', 'L', 'G', 'L'],
  ['G', 'L', 'L', 'L', 'G'],
  ['L', 'G', 'G', 'L', 'L'],
  ['L', 'L', 'G', 'G', 'L'],
  ['L', 'L', 'L', 'G', 'G'],
  ['L', 'G', 'L', 'G', 'L'],
  ['L', 'G', 'L', 'L', 'G'],
  ['L', 'L', 'G', 'L', 'G']
];

var bar_widths = {
  L: [
    [0, 0, 0, 1, 1, 0, 1],
    [0, 0, 1, 1, 0, 0, 1],
    [0, 0, 1, 0, 0, 1, 1],
    [0, 1, 1, 1, 1, 0, 1],
    [0, 1, 0, 0, 0, 1, 1],
    [0, 1, 1, 0, 0, 0, 1],
    [0, 1, 0, 1, 1, 1, 1],
    [0, 1, 1, 1, 0, 1, 1],
    [0, 1, 1, 0, 1, 1, 1],
    [0, 0, 0, 1, 0, 1, 1]
  ],
  G: [
    [0, 1, 0, 0, 1, 1, 1],
    [0, 1, 1, 0, 0, 1, 1],
    [0, 0, 1, 1, 0, 1, 1],
    [0, 1, 0, 0, 0, 0, 1],
    [0, 0, 1, 1, 1, 0, 1],
    [0, 1, 1, 1, 0, 0, 1],
    [0, 0, 0, 0, 1, 0, 1],
    [0, 0, 1, 0, 0, 0, 1],
    [0, 0, 0, 1, 0, 0, 1],
    [0, 0, 1, 0, 1, 1, 1]
  ],
  R: [
    [1, 1, 1, 0, 0, 1, 0],
    [1, 1, 0, 0, 1, 1, 0],
    [1, 1, 0, 1, 1, 0, 0],
    [1, 0, 0, 0, 0, 1, 0],
    [1, 0, 1, 1, 1, 0, 0],
    [1, 0, 0, 1, 1, 1, 0],
    [1, 0, 1, 0, 0, 0, 0],
    [1, 0, 0, 0, 1, 0, 0],
    [1, 0, 0, 1, 0, 0, 0],
    [1, 1, 1, 0, 1, 0, 0]
  ]
};
// Many parts of this code borrowed from IndiSnip
// http://indisnip.wordpress.com/2010/08/24/findchange-missing-font-with-scripting/


//get unique Array elements
Array.prototype.unique = function () {
  var r = new Array();
  o:for (var i = 0, n = this.length; i < n; i++) {
    for (var x = 0, y = r.length; x < y; x++) {
      if (r[x]==this[i]) {
        continue o;
      }
    }
    r[r.length] = this[i];
  }
  return r;
}

//search inside array
Array.prototype.findIn = function(search){
  var r = Array();
  for (var i=0; i<this.length; i++) {
    if (this[i].indexOf(search) != -1) {
      r.push(this[i].substr(this[i].indexOf("\t") + 1, this[i].length));
    }
  }
  return r;
};

Array.prototype.findID = function (str) {
  for (var i = 0; i < this.length; i++) {
    if (this[i].indexOf(str) === 0) {
      return i;
    }
  }
  return 0;
};


//FontSelect makes a font selection gui widget, and returns an object
//with the single method getFont, which can be called to get the selected font
function FontSelect(group, font) {
  var splitFont = font.split('\t');
  var fontFamily = splitFont[0];
  var fontStyle = splitFont[1];
  var sysFonts = app.fonts.everyItem();
  var sysFontsList = sysFonts.fontFamily.unique();
  sysFontsList.unshift("- Select Font Family -");

  var fontFamilyId = sysFontsList.findID(fontFamily);

  var availableFonts = group.add('dropdownlist', undefined, sysFontsList);
  var availableStyles = group.add('dropdownlist');

  availableStyles.minimumSize = [180,25];
  availableFonts.onChange = function () {
    availableStyles.removeAll();
    var sysFontAvailableStyles = sysFonts.name.findIn(availableFonts.selection);
    for (var i = 0; i < sysFontAvailableStyles.length; i++) {
      availableStyles.add('item',sysFontAvailableStyles[i]);
    }
    fontStyleId = sysFontAvailableStyles.findID(fontStyle);
    availableStyles.selection = fontStyleId;
  }

  availableFonts.selection = fontFamilyId;

  return {
    getFont: function () {
      if (availableFonts.selection && availableStyles.selection) {
        return availableFonts.selection.text + '\t' + availableStyles.selection.text;
      }
      else {
        return font; //return the default font if no font selected
      }
    }
  };
}


var defaultIsbnFont = "Helvetica Neue LT Std\t55 Roman";
var defaultCodeFont = "OCR B Std\tRegular";


function showDialog() {
  var dialog = new Window('dialog', 'New barcode');
  dialog.orientation = 'column';
  dialog.alignChildren = 'left';
  var input = dialog.add('group');
  input.add('statictext', undefined, 'ISBN:');
  var edittext = input.add('edittext');
  edittext.characters = 20;
  edittext.active = true;
  //edittext.text = '978-1-907360-21-3'; //just for testing

  input.add('statictext', undefined, 'Addon (optional):');
  var addonText = input.add('edittext');
  addonText.characters = 10;
  //addonText.text = '50995'; //just for testing

  dialog.add('statictext', undefined, 'ISBN font:');
  var isbnFontRow = dialog.add('group');
  var isbnFontSelect = FontSelect(isbnFontRow, defaultIsbnFont);
  dialog.add('statictext', undefined, 'Barcode font:');
  var codeFontRow = dialog.add('group');
  var codeFontSelect = FontSelect(codeFontRow, defaultCodeFont);
  
  var buttonGroup = dialog.add('group');
  buttonGroup.orientation = 'row';
  buttonGroup.add('button', undefined, 'OK', {name: 'ok'});
  buttonGroup.add('button', undefined, 'Cancel', {name: 'cancel'});

  if (dialog.show() === 1) {
    return {
      isbn: edittext.text,
      addon: addonText.text,
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
  var normalHeight;
  var guardHeight;
  var addonHeight;
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

  function drawBar(width, height, y) {
    if (! height) {
      height = normalHeight;
    }
    if (! y) {
      y = vOffset;
    }
    drawBox(hpos, y, width - reduce, height);
  }

  function drawAddonBar(width) {
    drawBar(width, addonHeight, vOffset + (normalHeight - addonHeight));
  }

  function drawGuard() {
    drawBar(1, guardHeight);
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

  function drawAddon(addonWidths, font) {
    var pattern = null;
    var widths = null;
    var width = null;
    var digit = null;

    hpos += 10; //gap between barcode and addon
    for (var i = 0; i < addonWidths.length; i++) {
      pattern = addonWidths[i][0];
      widths = addonWidths[i][1];
      digit = addonWidths[i][2]; //may be undefined

      if (digit) {
        drawChar(hpos, digit, font);
      }

      for (var j = 0; j < widths.length; j++) {
        width = widths[j];
        if (pattern[j] === 1) {
          drawAddonBar(width);
        }
        hpos += width;
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
    var y = vOffset + normalHeight + 2;
    var boxWidth = 7;
    var boxHeight = 9;
    drawText(x, y, boxWidth, boxHeight, character, font, Justification.LEFT_ALIGN);
  }

  function drawWhiteBox(wide) {
    var width = 112;
    if (wide) {
      width = 180;
    }
    drawBox(hpos - 10, vOffset - 15, width, 100, 'Paper');
  }

  function init() {
    scale = 0.3;
    normalHeight = 70;
    guardHeight = 75;
    addonHeight = 60;
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

  function drawBarcode(barWidths, addonWidths, spec) {
    init();
    drawWhiteBox(!!addonWidths);
    drawText(hpos, vOffset - 10, 98, 9,
      "ISBN: " + spec.isbn, spec.isbnFont, Justification.LEFT_ALIGN);
    startGuards();
    drawMain(barWidths, spec.codeFont);
    endGuards();
    if (addonWidths) {
      drawAddon(addonWidths, spec.codeFont);
    }
    page.groups.add(layer.allPageItems);
  }

  return {
    drawBarcode: drawBarcode
  }
})();


var result = showDialog();
if (result) {
  var barcode = Barcode().init(result.isbn, result.addon);
  var barWidths = barcode.getNormalisedWidths();
  var addonWidths = barcode.getNormalisedAddon();
  BarcodeDrawer.drawBarcode(barWidths, addonWidths, result);
}

