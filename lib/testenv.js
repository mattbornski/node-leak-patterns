var patterns = require('./index');

/**
 * This module is designed to be included in a Mocha BDD test suite.  It
 * should transparently set up "before" and "after" clauses for the test case,
 * and ensure that it runs serially (otherwise the memory sizes reported are
 * not very reliable indicators of consumption.
**/

var setup = function () {
  snapshot();
};

var teardown = function () {
  console.log('LEAKED ' + compare() + ' bytes');
};

GLOBAL.test = {
  'allocate': function (what) {
    
  },
  'describe': function (what, test) {
    return describe(what, function () {
      before(setup);
      after(teardown);
      test();
    });
  },
};