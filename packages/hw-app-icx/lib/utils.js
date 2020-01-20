'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

exports.defer = defer;
exports.splitPath = splitPath;
exports.eachSeries = eachSeries;
exports.foreach = foreach;
exports.doIf = doIf;
exports.asyncWhile = asyncWhile;
exports.hexToBase64 = hexToBase64;

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function defer() {
  var resolve = void 0,
    reject = void 0;
  var promise = new _promise2.default(function(success, failure) {
    resolve = success;
    reject = failure;
  });
  if (!resolve || !reject) throw 'defer() error'; // this never happens and is just to make flow happy
  return { promise: promise, resolve: resolve, reject: reject };
}

// TODO use bip32-path library
/********************************************************************************
 *   Ledger Node JS API for ICON
 *   (c) 2016-2017 Ledger
 *
 *  Modifications (c) 2018 ICON Foundation
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 ********************************************************************************/

function splitPath(path) {
  var result = [];
  var components = path.split('/');
  components.forEach(function(element) {
    var number = parseInt(element, 10);
    if (isNaN(number)) {
      return; // FIXME shouldn't it throws instead?
    }
    if (element.length > 1 && element[element.length - 1] === "'") {
      number += 0x80000000;
    }
    result.push(number);
  });
  return result;
}

// TODO use async await

function eachSeries(arr, fun) {
  return arr.reduce(function(p, e) {
    return p.then(function() {
      return fun(e);
    });
  }, _promise2.default.resolve());
}

function foreach(arr, callback) {
  function iterate(index, array, result) {
    if (index >= array.length) {
      return result;
    } else
      return callback(array[index], index).then(function(res) {
        result.push(res);
        return iterate(index + 1, array, result);
      });
  }
  return _promise2.default.resolve().then(function() {
    return iterate(0, arr, []);
  });
}

function doIf(condition, callback) {
  return _promise2.default.resolve().then(function() {
    if (condition) {
      return callback();
    }
  });
}

function asyncWhile(predicate, callback) {
  function iterate(result) {
    if (!predicate()) {
      return result;
    } else {
      return callback().then(function(res) {
        result.push(res);
        return iterate(result);
      });
    }
  }
  return _promise2.default.resolve([]).then(iterate);
}

function hexToBase64(hexString) {
  return btoa(
    hexString
      .match(/\w{2}/g)
      .map(function(a) {
        return String.fromCharCode(parseInt(a, 16));
      })
      .join('')
  );
}
//# sourceMappingURL=utils.js.map
