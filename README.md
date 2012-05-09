# Hunting node leak patterns

A test framework which I used to try to find patterns of code which might be causing memory leaks in NodeJS applications.

## Example Usage

```bash
npm install git://github.com/mattbornski/node-leak-patterns.git
cd node-leak-patterns
npm test
```

## Results

Sadly I was unable to identify any specific patterns of code using these tests, probably because the contrived test cases are much less complex than real applications.  However, through other channels, I identified a few things which I think would be advantageous to many NodeJS programmers:

### Closures are powerful but expensive, and when possible should be replaced by other constructs

By using Camilo Aguilar's [update to the NodeJS debugger](https://github.com/c4milo/node-webkit-agent) (which actually works with 0.6, unlike the mainline version), I determined that at least part of my leak contained variables accessible through closures.  Although I was not able to identify the actual cause of leaking closures, by reducing the number of closures defined and the number of variables in scope, I dramatically reduced my rate of memory leakage.  My particular application looked something like this:

```javascript
function handler() {
  var bunchOfData = otherFunction();
  var obj = {
    'foo': 'bar',
  };
  obj.method = function () {
    obj['fee'] = 'fie';
  };
  if (bunchOfData['boo'] === 'yah') {
    obj['boo'] = 'yah';
  }
  bunchOfData.listen(function unavoidableClosure () {
    obj['done'] = true;
  });
  return obj;
}
```

Basically, we made an object (much bigger and more complex in real life) and added a bunch of member functions as closures.  This was really quick and easy to write, and in theory everything should have been garbage collected, but wasn't.  The bandaid (which did not fix the leak, but reduced the magnitude) is as follows:

```javascript
var objInstance = function () {
  // This clever construct forces the use of "new".
  if (!(this instanceof objInstance)) return new objInstance();
  
  this['foo'] = 'bar';
};
objInstance.prototype.method = function () {
  this['fee'] = 'fie';
};

function handler() {
  var bunchOfData = otherFunction();
  var obj = new objInstance();
  if (bunchOfData['boo'] === 'yah') {
    obj['boo'] = 'yah';
  }
  bunchOfData.listen(function unavoidableClosure () {
    obj['done'] = true;
  });
  return obj;
}
```

By using prototypal methods instead of closures, we managed to reduce the number of closures (obviously) as well as the number and size of things in scope when other closures were inevitably created.  I would recommend, wherever possible, to use constructs other than closures, because while each might be equally correct, non-closures are probably more efficient in operation, and when something goes wrong, closures can be dangerous and expensive.

### NodeJS is cutting edge, also known as bleeding edge

The actual cause of this memory leak?  Node's HTTP client library leaking event handlers.  Upgrading to 0.6.17 [flatlined my memory consumption](https://twitter.com/#!/mattbornski/status/199983567080665088).