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

function drawBarcode(barWidths) {
  var height = 20;
  var pattern = null;
  var widths = null;
  for (var i = 0; i < barWidths.length; i++) {
    pattern = barWidths[i][0];
    widths = barWidths[i][1];

    //pattern is e.g. [0, 1, 0, 1] - i.e. white, black, white, black
    //widths is e.g. [1, 2, 1, 3] - i.e. 1 white, 2 black, 1 white, 3 black
  }

}

var isbn = showDialog();
if (isbn) {
  var barWidths = Barcode().init(isbn).getNormalisedWidths();

  drawBarcode(barWidths);
}

