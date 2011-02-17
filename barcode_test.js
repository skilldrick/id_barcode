#strict on
/*#target indesign*/
#include 'barcode_library.js'

var tests = {
  setup: function () {
    this.barcode_strings = [];
    this.barcode_strings.push('978-1-906230-16-6');
    this.barcode_strings.push('978-0-300-13878-8');
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
  }
}


function assert(msg, success) {
  if (! success) {
    throw msg;
  }
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
