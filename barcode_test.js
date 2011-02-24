#strict on
/*#target indesign*/
#include 'barcode_library.js'

var tests = {
  setup: function () {
    this.barcode_strings = [];
    this.barcode_strings.push('978-1-906230-16-6\n');
    this.barcode_strings.push('978-0-7858-2744-3');
  },

  'test logger': function () {
    log('Testing logger...');
  },

  'test strip barcode': function () {
    var stripped = Barcode().init(this.barcode_strings[0]).strip();
    assert('Barcode should match', stripped === '9781906230166');
  },

  'test checkCheckDigit': function () {
    for (var i = 0; i < this.barcode_strings.length; i++) {
      var checkDigitCorrect = Barcode().init(this.barcode_strings[i]).checkCheckDigit();
      assert('Check digit should be correct', checkDigitCorrect);
    }
  },

  'test incorrect check digit': function () {
    assert_throws('init should throw', function () {
      Barcode().init('978-1-906230-16-3');
    });
  },

  'test bar widths': function () {
    var correctBarWidths = [
      [0, 1, 1, 1, 0, 1, 1], //L: 7
      [0, 0, 0, 1, 0, 0, 1], //G: 8
      [0, 1, 1, 0, 0, 1, 1], //G: 1
      [0, 0, 0, 1, 0, 1, 1], //L: 9
      [0, 1, 0, 0, 1, 1, 1], //G: 0
      [0, 1, 0, 1, 1, 1, 1], //L: 6
      [1, 1, 0, 1, 1, 0, 0], //R: 2
      [1, 0, 0, 0, 0, 1, 0], //R: 3
      [1, 1, 1, 0, 0, 1, 0], //R: 0
      [1, 1, 0, 0, 1, 1, 0], //R: 1
      [1, 0, 1, 0, 0, 0, 0], //R: 6
      [1, 0, 1, 0, 0, 0, 0]  //R: 6
    ];

    var actualBarWidths = Barcode().init(this.barcode_strings[0]).getBarWidths();
    assert_equal(correctBarWidths, actualBarWidths);
  },

  'test normalised widths': function () {
    var correctNormalisedWidths = [
      [[0, 1, 0, 1], [1, 3, 1, 2]],
      [[0, 1, 0, 1], [3, 1, 2, 1]],
      [[0, 1, 0, 1], [1, 2, 2, 2]],
      [[0, 1, 0, 1], [3, 1, 1, 2]],
      [[0, 1, 0, 1], [1, 1, 2, 3]],
      [[0, 1, 0, 1], [1, 1, 1, 4]],
      [[1, 0, 1, 0], [2, 1, 2, 2]],
      [[1, 0, 1, 0], [1, 4, 1, 1]],
      [[1, 0, 1, 0], [3, 2, 1, 1]],
      [[1, 0, 1, 0], [2, 2, 2, 1]],
      [[1, 0, 1, 0], [1, 1, 1, 4]],
      [[1, 0, 1, 0], [1, 1, 1, 4]]
    ];
      
    var actualNormalisedWidths = Barcode().init(this.barcode_strings[0]).getNormalisedWidths();
    assert_equal(correctNormalisedWidths, actualNormalisedWidths);
  }

}


function assert(msg, success) {
  if (! success) {
    throw msg;
  }
}

function assert_equal(expected, actual) {
  if (expected.constructor.toString().indexOf('Array') !== -1) {
    //ugly hack for comparing arrays - would be better to recursively search
    expected = expected.toString();
    actual = actual.toString();
  }
  var errorMessage = expected.toString() + " expected, but was " + actual.toString();
  assert(errorMessage, expected === actual);
}

function compare_arrays(first, second) {

}

function assert_throws(msg, func) {
  var success = true;
  try {
    func();
    success = false;
  }
  catch (e) {
  }

  assert(msg, success);
}

for (var test in tests) {
  if (/test/.test(test)) {
    try {
      if(tests.setup) {
        tests.setup();
      }
      tests[test]();
      log('.');
    }
    catch (e) {
      log(test + " failed: " + e);
    }
  }
}
