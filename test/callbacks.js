/* Mocha test
   to use:
     npm install mocha
     mocha <filename>
   or
     npm test
*/

describe('callback', function () {
  it('should not leak memory', function (done) {
    gc();
    return done();
  });
});