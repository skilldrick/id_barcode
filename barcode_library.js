function log(text) {
  $.writeln(text);
}

var Barcode = (function () {
  var barcode_string;
  var stripped;

  return {
    init: function (str) {
      barcode_string = str;
      stripped = this.strip();
      return this;
    },
    strip: function () {
      return barcode_string.replace(/-/g, '');
    },
    getCheckDigit: function () {
      return parseInt(stripped[12], 10);
    },
    checkCheckDigit: function () {
      var total = 0;
      for (var i = 0; i < stripped.length - 1; i++) { //-1 because we don't include check digit
        if (i % 2 === 0) {
          total += parseInt(stripped[i], 10);
        }
        else {
          total += parseInt(stripped[i], 10) * 3;
        }
      }
      var checkDigit = 10 - (total % 10);
      return (checkDigit === this.getCheckDigit());
    }
  }
})();
