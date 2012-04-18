var weak = require('weak');

// Quick-and-dirty heap size
var size = function () {
  return process.memoryUsage()['rss'];
};

var lastSnapshot = null;
var snapshot = function () {
  var lastSnapshotHeapSize = (((lastSnapshot || {})['bytes'] || {})['allocated'] || 0);
  var preCollectionHeapSize = size();
  var ret = {
    'bytes': {
      'allocated': preCollectionHeapSize - lastSnapshotHeapSize,
    },
  };
  collect();
  // TODO make use of real heap snapshotting.
  var postCollectionHeapSize = size();
  ret['bytes']['freed'] = lastSnapshotHeapSize - postCollectionHeapSize;
  return lastSnapshot;
};

var lastCollectionHeapSize = null;
var allocations = {};
var collect = function () {
  // Don't garbage collect if nothing has been allocated.
  if (!lastCollectionHeapSize || (lastCollectionHeapSize !== size())) {
    gc();
    lastCollectionHeapSize = size();
  }
};

// Compare two snapshots.
// If one snapshot is given, it is implicit that you would like to compare it
// to the current state.
// If no snapshot is given, it is implicit that you would like to compare the
// last snapshot taken to the current state.
var compare = function (snapshot1, snapshot2) {
  if (!snapshot1) {
    snapshot1 = lastSnapshot;
  }
  if (!snapshot2) {
    snapshot2 = snapshot();
  }
  var leaks = {};
  for (var index in allocations) {

  }
  allocations = {};
  // TODO Use more complex comparison once we make use of real heap snapshotting.
  return {
    'bytes': {
      'allocated': snapshot2['bytes'] - snapshot1['bytes'],
    },
    'objects': {
      'allocated': [],
      'leaked': [],
      'freed': [],
    }
  }
  return ;
};

module.exports = {
  'snapshot': snapshot,
  'collect': collect,
  'compare': compare,
};