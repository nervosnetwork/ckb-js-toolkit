(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.CKBJSToolkit = {}));
}(this, (function (exports) { 'use strict';

  class ArrayBufferReader {
    constructor(buffer) {
      this.view = new DataView(buffer);
    }

    length() {
      return this.view.byteLength;
    }

    indexAt(i) {
      return this.view.getUint8(i);
    }

    serializeJson() {
      return "0x" + Array.prototype.map.call(
        new Uint8Array(this.view.buffer),
        (x) => ("00" + x.toString(16)).slice(-2)
      ).join("")
    }
  }

  class HexStringReader {
    constructor(string) {
      this.string = string;
    }

    length() {
      return this.string.length / 2 - 1;
    }

    indexAt(i) {
      return parseInt(this.string.substr(2 + i * 2, 2), 16);
    }

    serializeJson() {
      return this.string;
    }
  }

  class Reader {
    constructor(input) {
      if (typeof input === "string") {
        if ((!input.startsWith("0x")) ||
            (input.length % 2 != 0)) {
          throw new Error("Hex string must start with 0x, and has even numbered length!");
        }
        return new HexStringReader(input);
      }
      if (input instanceof ArrayBuffer) {
        return new ArrayBufferReader(input);
      }
      throw new Error("Reader can only accept hex string or ArrayBuffer!");
    }

    static fromRawString(string) {
      const buffer = new ArrayBuffer(string.length);
      const view = new DataView(buffer);

      for (let i = 0; i < string.length; i++) {
        const c = string.charCodeAt(i);
        if (c > 0xFF) {
          throw new Error("fromRawString can only accept UTF-8 raw string!");
        }
        view.setUint8(i, c);
      }
      return new ArrayBufferReader(buffer);
    }
  }

  var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  var browserPonyfill = createCommonjsModule(function (module, exports) {
  var __self__ = (function (root) {
  function F() {
  this.fetch = false;
  this.DOMException = root.DOMException;
  }
  F.prototype = root;
  return new F();
  })(typeof self !== 'undefined' ? self : commonjsGlobal);
  (function(self) {

  var irrelevant = (function (exports) {
    var support = {
      searchParams: 'URLSearchParams' in self,
      iterable: 'Symbol' in self && 'iterator' in Symbol,
      blob:
        'FileReader' in self &&
        'Blob' in self &&
        (function() {
          try {
            new Blob();
            return true
          } catch (e) {
            return false
          }
        })(),
      formData: 'FormData' in self,
      arrayBuffer: 'ArrayBuffer' in self
    };

    function isDataView(obj) {
      return obj && DataView.prototype.isPrototypeOf(obj)
    }

    if (support.arrayBuffer) {
      var viewClasses = [
        '[object Int8Array]',
        '[object Uint8Array]',
        '[object Uint8ClampedArray]',
        '[object Int16Array]',
        '[object Uint16Array]',
        '[object Int32Array]',
        '[object Uint32Array]',
        '[object Float32Array]',
        '[object Float64Array]'
      ];

      var isArrayBufferView =
        ArrayBuffer.isView ||
        function(obj) {
          return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1
        };
    }

    function normalizeName(name) {
      if (typeof name !== 'string') {
        name = String(name);
      }
      if (/[^a-z0-9\-#$%&'*+.^_`|~]/i.test(name)) {
        throw new TypeError('Invalid character in header field name')
      }
      return name.toLowerCase()
    }

    function normalizeValue(value) {
      if (typeof value !== 'string') {
        value = String(value);
      }
      return value
    }

    // Build a destructive iterator for the value list
    function iteratorFor(items) {
      var iterator = {
        next: function() {
          var value = items.shift();
          return {done: value === undefined, value: value}
        }
      };

      if (support.iterable) {
        iterator[Symbol.iterator] = function() {
          return iterator
        };
      }

      return iterator
    }

    function Headers(headers) {
      this.map = {};

      if (headers instanceof Headers) {
        headers.forEach(function(value, name) {
          this.append(name, value);
        }, this);
      } else if (Array.isArray(headers)) {
        headers.forEach(function(header) {
          this.append(header[0], header[1]);
        }, this);
      } else if (headers) {
        Object.getOwnPropertyNames(headers).forEach(function(name) {
          this.append(name, headers[name]);
        }, this);
      }
    }

    Headers.prototype.append = function(name, value) {
      name = normalizeName(name);
      value = normalizeValue(value);
      var oldValue = this.map[name];
      this.map[name] = oldValue ? oldValue + ', ' + value : value;
    };

    Headers.prototype['delete'] = function(name) {
      delete this.map[normalizeName(name)];
    };

    Headers.prototype.get = function(name) {
      name = normalizeName(name);
      return this.has(name) ? this.map[name] : null
    };

    Headers.prototype.has = function(name) {
      return this.map.hasOwnProperty(normalizeName(name))
    };

    Headers.prototype.set = function(name, value) {
      this.map[normalizeName(name)] = normalizeValue(value);
    };

    Headers.prototype.forEach = function(callback, thisArg) {
      for (var name in this.map) {
        if (this.map.hasOwnProperty(name)) {
          callback.call(thisArg, this.map[name], name, this);
        }
      }
    };

    Headers.prototype.keys = function() {
      var items = [];
      this.forEach(function(value, name) {
        items.push(name);
      });
      return iteratorFor(items)
    };

    Headers.prototype.values = function() {
      var items = [];
      this.forEach(function(value) {
        items.push(value);
      });
      return iteratorFor(items)
    };

    Headers.prototype.entries = function() {
      var items = [];
      this.forEach(function(value, name) {
        items.push([name, value]);
      });
      return iteratorFor(items)
    };

    if (support.iterable) {
      Headers.prototype[Symbol.iterator] = Headers.prototype.entries;
    }

    function consumed(body) {
      if (body.bodyUsed) {
        return Promise.reject(new TypeError('Already read'))
      }
      body.bodyUsed = true;
    }

    function fileReaderReady(reader) {
      return new Promise(function(resolve, reject) {
        reader.onload = function() {
          resolve(reader.result);
        };
        reader.onerror = function() {
          reject(reader.error);
        };
      })
    }

    function readBlobAsArrayBuffer(blob) {
      var reader = new FileReader();
      var promise = fileReaderReady(reader);
      reader.readAsArrayBuffer(blob);
      return promise
    }

    function readBlobAsText(blob) {
      var reader = new FileReader();
      var promise = fileReaderReady(reader);
      reader.readAsText(blob);
      return promise
    }

    function readArrayBufferAsText(buf) {
      var view = new Uint8Array(buf);
      var chars = new Array(view.length);

      for (var i = 0; i < view.length; i++) {
        chars[i] = String.fromCharCode(view[i]);
      }
      return chars.join('')
    }

    function bufferClone(buf) {
      if (buf.slice) {
        return buf.slice(0)
      } else {
        var view = new Uint8Array(buf.byteLength);
        view.set(new Uint8Array(buf));
        return view.buffer
      }
    }

    function Body() {
      this.bodyUsed = false;

      this._initBody = function(body) {
        this._bodyInit = body;
        if (!body) {
          this._bodyText = '';
        } else if (typeof body === 'string') {
          this._bodyText = body;
        } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
          this._bodyBlob = body;
        } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
          this._bodyFormData = body;
        } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
          this._bodyText = body.toString();
        } else if (support.arrayBuffer && support.blob && isDataView(body)) {
          this._bodyArrayBuffer = bufferClone(body.buffer);
          // IE 10-11 can't handle a DataView body.
          this._bodyInit = new Blob([this._bodyArrayBuffer]);
        } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
          this._bodyArrayBuffer = bufferClone(body);
        } else {
          this._bodyText = body = Object.prototype.toString.call(body);
        }

        if (!this.headers.get('content-type')) {
          if (typeof body === 'string') {
            this.headers.set('content-type', 'text/plain;charset=UTF-8');
          } else if (this._bodyBlob && this._bodyBlob.type) {
            this.headers.set('content-type', this._bodyBlob.type);
          } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
            this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
          }
        }
      };

      if (support.blob) {
        this.blob = function() {
          var rejected = consumed(this);
          if (rejected) {
            return rejected
          }

          if (this._bodyBlob) {
            return Promise.resolve(this._bodyBlob)
          } else if (this._bodyArrayBuffer) {
            return Promise.resolve(new Blob([this._bodyArrayBuffer]))
          } else if (this._bodyFormData) {
            throw new Error('could not read FormData body as blob')
          } else {
            return Promise.resolve(new Blob([this._bodyText]))
          }
        };

        this.arrayBuffer = function() {
          if (this._bodyArrayBuffer) {
            return consumed(this) || Promise.resolve(this._bodyArrayBuffer)
          } else {
            return this.blob().then(readBlobAsArrayBuffer)
          }
        };
      }

      this.text = function() {
        var rejected = consumed(this);
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return readBlobAsText(this._bodyBlob)
        } else if (this._bodyArrayBuffer) {
          return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer))
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as text')
        } else {
          return Promise.resolve(this._bodyText)
        }
      };

      if (support.formData) {
        this.formData = function() {
          return this.text().then(decode)
        };
      }

      this.json = function() {
        return this.text().then(JSON.parse)
      };

      return this
    }

    // HTTP methods whose capitalization should be normalized
    var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT'];

    function normalizeMethod(method) {
      var upcased = method.toUpperCase();
      return methods.indexOf(upcased) > -1 ? upcased : method
    }

    function Request(input, options) {
      options = options || {};
      var body = options.body;

      if (input instanceof Request) {
        if (input.bodyUsed) {
          throw new TypeError('Already read')
        }
        this.url = input.url;
        this.credentials = input.credentials;
        if (!options.headers) {
          this.headers = new Headers(input.headers);
        }
        this.method = input.method;
        this.mode = input.mode;
        this.signal = input.signal;
        if (!body && input._bodyInit != null) {
          body = input._bodyInit;
          input.bodyUsed = true;
        }
      } else {
        this.url = String(input);
      }

      this.credentials = options.credentials || this.credentials || 'same-origin';
      if (options.headers || !this.headers) {
        this.headers = new Headers(options.headers);
      }
      this.method = normalizeMethod(options.method || this.method || 'GET');
      this.mode = options.mode || this.mode || null;
      this.signal = options.signal || this.signal;
      this.referrer = null;

      if ((this.method === 'GET' || this.method === 'HEAD') && body) {
        throw new TypeError('Body not allowed for GET or HEAD requests')
      }
      this._initBody(body);
    }

    Request.prototype.clone = function() {
      return new Request(this, {body: this._bodyInit})
    };

    function decode(body) {
      var form = new FormData();
      body
        .trim()
        .split('&')
        .forEach(function(bytes) {
          if (bytes) {
            var split = bytes.split('=');
            var name = split.shift().replace(/\+/g, ' ');
            var value = split.join('=').replace(/\+/g, ' ');
            form.append(decodeURIComponent(name), decodeURIComponent(value));
          }
        });
      return form
    }

    function parseHeaders(rawHeaders) {
      var headers = new Headers();
      // Replace instances of \r\n and \n followed by at least one space or horizontal tab with a space
      // https://tools.ietf.org/html/rfc7230#section-3.2
      var preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, ' ');
      preProcessedHeaders.split(/\r?\n/).forEach(function(line) {
        var parts = line.split(':');
        var key = parts.shift().trim();
        if (key) {
          var value = parts.join(':').trim();
          headers.append(key, value);
        }
      });
      return headers
    }

    Body.call(Request.prototype);

    function Response(bodyInit, options) {
      if (!options) {
        options = {};
      }

      this.type = 'default';
      this.status = options.status === undefined ? 200 : options.status;
      this.ok = this.status >= 200 && this.status < 300;
      this.statusText = 'statusText' in options ? options.statusText : 'OK';
      this.headers = new Headers(options.headers);
      this.url = options.url || '';
      this._initBody(bodyInit);
    }

    Body.call(Response.prototype);

    Response.prototype.clone = function() {
      return new Response(this._bodyInit, {
        status: this.status,
        statusText: this.statusText,
        headers: new Headers(this.headers),
        url: this.url
      })
    };

    Response.error = function() {
      var response = new Response(null, {status: 0, statusText: ''});
      response.type = 'error';
      return response
    };

    var redirectStatuses = [301, 302, 303, 307, 308];

    Response.redirect = function(url, status) {
      if (redirectStatuses.indexOf(status) === -1) {
        throw new RangeError('Invalid status code')
      }

      return new Response(null, {status: status, headers: {location: url}})
    };

    exports.DOMException = self.DOMException;
    try {
      new exports.DOMException();
    } catch (err) {
      exports.DOMException = function(message, name) {
        this.message = message;
        this.name = name;
        var error = Error(message);
        this.stack = error.stack;
      };
      exports.DOMException.prototype = Object.create(Error.prototype);
      exports.DOMException.prototype.constructor = exports.DOMException;
    }

    function fetch(input, init) {
      return new Promise(function(resolve, reject) {
        var request = new Request(input, init);

        if (request.signal && request.signal.aborted) {
          return reject(new exports.DOMException('Aborted', 'AbortError'))
        }

        var xhr = new XMLHttpRequest();

        function abortXhr() {
          xhr.abort();
        }

        xhr.onload = function() {
          var options = {
            status: xhr.status,
            statusText: xhr.statusText,
            headers: parseHeaders(xhr.getAllResponseHeaders() || '')
          };
          options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL');
          var body = 'response' in xhr ? xhr.response : xhr.responseText;
          resolve(new Response(body, options));
        };

        xhr.onerror = function() {
          reject(new TypeError('Network request failed'));
        };

        xhr.ontimeout = function() {
          reject(new TypeError('Network request failed'));
        };

        xhr.onabort = function() {
          reject(new exports.DOMException('Aborted', 'AbortError'));
        };

        xhr.open(request.method, request.url, true);

        if (request.credentials === 'include') {
          xhr.withCredentials = true;
        } else if (request.credentials === 'omit') {
          xhr.withCredentials = false;
        }

        if ('responseType' in xhr && support.blob) {
          xhr.responseType = 'blob';
        }

        request.headers.forEach(function(value, name) {
          xhr.setRequestHeader(name, value);
        });

        if (request.signal) {
          request.signal.addEventListener('abort', abortXhr);

          xhr.onreadystatechange = function() {
            // DONE (success or failure)
            if (xhr.readyState === 4) {
              request.signal.removeEventListener('abort', abortXhr);
            }
          };
        }

        xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit);
      })
    }

    fetch.polyfill = true;

    if (!self.fetch) {
      self.fetch = fetch;
      self.Headers = Headers;
      self.Request = Request;
      self.Response = Response;
    }

    exports.Headers = Headers;
    exports.Request = Request;
    exports.Response = Response;
    exports.fetch = fetch;

    return exports;

  }({}));
  })(__self__);
  delete __self__.fetch.polyfill;
  exports = __self__.fetch; // To enable: import fetch from 'cross-fetch'
  exports.default = __self__.fetch; // For TypeScript consumers without esModuleInterop.
  exports.fetch = __self__.fetch; // To enable: import {fetch} from 'cross-fetch'
  exports.Headers = __self__.Headers;
  exports.Request = __self__.Request;
  exports.Response = __self__.Response;
  module.exports = exports;
  });
  var browserPonyfill_1 = browserPonyfill.fetch;
  var browserPonyfill_2 = browserPonyfill.Headers;
  var browserPonyfill_3 = browserPonyfill.Request;
  var browserPonyfill_4 = browserPonyfill.Response;

  const handler = {
    get: (target, method) => {
      return async (...params) => {
        const id = Math.round(Math.random() * 10000000);
        const response = await browserPonyfill(target.uri, {
          method: "post",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: id,
            method: method,
            params: params
          })
        });
        const data = await response.json();
        if (data.id !== id) {
          throw new Error("JSONRPCError: response ID does not match request ID!");
        }
        if (data.error) {
          throw new Error(`JSONRPCError: server error ${JSON.stringify(data.error)}`);
        }
        return data.result;
      };
    }
  };

  class RPC {
    constructor(uri) {
      this.uri = uri;
      return new Proxy(this, handler);
    }
  }

  // This package provides validator functions that check JSON objects are
  // following the correct format, so we can submit them to CKB via RPC
  // directly

  function assertObject(debugPath, object) {
    if (object === null ||
        typeof object !== "object" ||
        object.constructor !== Object) {
      throw new Error(`${debugPath} is not an object!`);
    }
  }

  function assertObjectWithKeys(debugPath, object, expectedKeys, optionalKeys = []) {
    assertObject(debugPath, object);
    const providedKeys = Object.keys(object).sort();
    const requiredLength = expectedKeys.length;
    const maximalLength = expectedKeys.length + optionalKeys.length;
    const errorMessage = `${debugPath} does not have correct keys! Required keys: [${expectedKeys.sort().join(", ")}], optional keys: [${optionalKeys.sort().join(", ")}], actual keys: [${providedKeys.join(", ")}]`;
    if (providedKeys.length < requiredLength || providedKeys.length > maximalLength) {
      throw new Error(errorMessage);
    }
    let optionalProvidedKeys = providedKeys.filter(key => !expectedKeys.includes(key));
    if (providedKeys.length - optionalProvidedKeys.length !== requiredLength) {
      throw new Error(errorMessage);
    }
    if (optionalProvidedKeys.find(key => !optionalKeys.includes(key))) {
      throw new Error(errorMessage);
    }
  }

  function assertHexString(debugPath, string) {
    if (!/^0x([0-9a-fA-F][0-9a-fA-F])*$/.test(string)) {
      throw new Error(`${debugPath} must be a hex string!`)
    }
  }

  function assertHash(debugPath, hash) {
    assertHexString(debugPath, hash);
    if (hash.length != 66) {
      throw new Error(`${debugPath} must be a hex string of 66 bytes long!`);
    }
  }

  function assertInteger(debugPath, i) {
    if (i === "0x0") {
      return;
    }
    if (!/^0x[1-9a-fA-F][0-9a-fA-F]*$/.test(i)) {
      throw new Error(`${debugPath} must be a hex integer!`)
    }
  }

  function ValidateScript(script, { nestedValidation = true, debugPath = "script" } = {}) {
    assertObjectWithKeys(debugPath, script, ["code_hash", "hash_type", "args"], []);
    assertHash(`${debugPath}.code_hash`, script.code_hash);
    assertHexString(`${debugPath}.args`, script.args);

    if (script.hash_type !== "data" && script.hash_type !== "type") {
      throw new Error(`${debugPath}.hash_type must be either data or type!`);
    }
  }

  function ValidateOutPoint(outPoint, { nestedValidation = true, debugPath = "out_point" } = {}) {
    assertObjectWithKeys(debugPath, outPoint, ["tx_hash", "index"], []);
    assertHash(`${debugPath}.tx_hash`, outPoint.tx_hash);
    assertInteger(`${debugPath}.index`, outPoint.index);
  }

  function ValidateCellInput(cellInput, { nestedValidation = true, debugPath = "cell_input"} = {}) {
    assertObjectWithKeys(debugPath, cellInput, ["since", "previous_output"], []);
    assertInteger(`${debugPath}.since`, cellInput.since);

    if (nestedValidation) {
      ValidateOutPoint(cellInput.previous_output, {
        debugPath: `${debugPath}.previous_output`
      });
    }
  }

  function ValidateCellOutput(cellOutput, { nestedValidation = true, debugPath = "cell_output"} = {}) {
    assertObjectWithKeys(debugPath, cellOutput, ["capacity", "lock"], ["type"]);
    assertInteger(`${debugPath}.capacity`, cellOutput.capacity);

    if (nestedValidation) {
      ValidateScript(cellOutput.lock, {
        debugPath: `${debugPath}.lock`
      });
      if (cellOutput.type) {
        ValidateScript(cellOutput.type, {
          debugPath: `${debugPath}.type`
        });
      }
    }
  }


  function ValidateCellDep(cellDep, { nestedValidation = true, debugPath = "cell_dep"} = {}) {
    assertObjectWithKeys(debugPath, cellDep, ["out_point", "dep_type"], []);
    if (cellDep.dep_type !== "code" && cellDep.dep_type !== "dep_group") {
      throw new Error(`${debugPath}.dep_type must be either code or dep_group!`);
    }

    if (nestedValidation) {
      ValidateOutPoint(cellDep.out_point, {
        debugPath: `${debugPath}.out_point`
      });
    }
  }

  function assertArray(debugPath, array, validateFunction, nestedValidation) {
    if (!Array.isArray(array)) {
      throw new Error(`${debugPath} is not an array!`);
    }
    if (nestedValidation) {
      for (let i = 0; i < array.length; i++) {
        validateFunction(`${debugPath}[${i}]`, array[i]);
      }
    }
  }

  function toAssert(validateFunction, nestedValidation) {
    return function(debugPath, value) {
      validateFunction(value, {
        nestedValidation: nestedValidation,
        debugPath: debugPath
      });
    };
  }

  function assertCommonTransaction(debugPath, rawTransaction, nestedValidation) {
    assertInteger(`${debugPath}.version`, rawTransaction.version);
    assertArray(`${debugPath}.cell_deps`, rawTransaction.cell_deps,
                toAssert(ValidateCellDep, nestedValidation),
                nestedValidation);
    assertArray(`${debugPath}.header_deps`, rawTransaction.header_deps,
                assertHash, nestedValidation);
    assertArray(`${debugPath}.inputs`, rawTransaction.inputs,
                toAssert(ValidateCellInput, nestedValidation), nestedValidation);
    assertArray(`${debugPath}.outputs`, rawTransaction.outputs,
                toAssert(ValidateCellOutput, nestedValidation), nestedValidation);
    assertArray(`${debugPath}.outputs_data`, rawTransaction.outputs_data,
                assertHexString, nestedValidation);
  }

  function ValidateRawTransaction(rawTransaction, { nestedValidation = true, debugPath = "raw_transaction" } = {}) {
    assertObjectWithKeys(debugPath, rawTransaction,
                         ["version", "cell_deps", "header_deps",
                          "inputs", "outputs", "outputs_data"], []);
    assertCommonTransaction(debugPath, rawTransaction, nestedValidation);
  }

  function ValidateTransaction(transaction, { nestedValidation = true, debugPath = "transaction" } = {}) {
    assertObjectWithKeys(debugPath, transaction,
                         ["version", "cell_deps", "header_deps", "inputs",
                          "outputs", "outputs_data", "witnesses"], []);
    assertCommonTransaction(debugPath, transaction, nestedValidation);
    assertArray(`${debugPath}.witnesses`, transaction.witnesses,
                assertHexString, nestedValidation);
  }

  function assertCommonHeader(debugPath, rawHeader) {
    assertInteger(`${debugPath}.version`, rawHeader.version);
    assertInteger(`${debugPath}.compact_target`, rawHeader.compact_target);
    assertInteger(`${debugPath}.timestamp`, rawHeader.timestamp);
    assertInteger(`${debugPath}.number`, rawHeader.number);
    assertInteger(`${debugPath}.epoch`, rawHeader.epoch);
    assertHash(`${debugPath}.parent_hash`, rawHeader.parent_hash);
    assertHash(`${debugPath}.transactions_root`, rawHeader.transactions_root);
    assertHash(`${debugPath}.proposals_hash`, rawHeader.proposals_hash);
    assertHash(`${debugPath}.uncles_hash`, rawHeader.uncles_hash);
    assertHash(`${debugPath}.dao`, rawHeader.dao);
  }

  function ValidateRawHeader(rawHeader, { nestedValidation = true, debugPath = "raw_header" } = {}) {
    assertObjectWithKeys(debugPath, rawHeader,
                         ["version", "compact_target", "timestamp", "number",
                          "epoch", "parent_hash", "transactions_root",
                          "proposals_hash", "uncles_hash", "dao"], []);
    assertCommonHeader(debugPath, rawHeader);
  }

  function ValidateHeader(header, { nestedValidation = true, debugPath = "header" } = {}) {
    assertObjectWithKeys(debugPath, header,
                         ["version", "compact_target", "timestamp", "number",
                          "epoch", "parent_hash", "transactions_root",
                          "proposals_hash", "uncles_hash", "dao", "nonce"], []);
    assertHexString(`${debugPath}.nonce`, header.nonce);
    if (header.nonce.length != 34) {
      throw new Error(`${debugPath}.nonce must be a hex string of 34 bytes long!`);
    }
  }

  function assertProposalShortId(debugPath, shortId) {
    assertHexString(debugPath, shortId);
    if (shortId.length != 22) {
      throw new Error(`${debugPath} must be a hex string of 22 bytes long!`);
    }
  }

  function ValidateUncleBlock(uncleBlock, { nestedValidation = true, debugPath = "uncle_block" } = {}) {
    assertObjectWithKeys(debugPath, uncleBlock, ["header", "proposals"], []);

    if (nestedValidation) {
      ValidateHeader(uncleBlock.header, {
        debugPath: `${debugPath}.header`
      });
    }
    assertArray(`${debugPath}.proposals`, uncleBlock.proposals,
                assertProposalShortId, nestedValidation);
  }

  function ValidateBlock(block, { nestedValidation = true, debugPath = "block" } = {}) {
    assertObjectWithKeys(debugPath, block, ["header", "uncles",
                                            "transactions", "proposals"], []);

    if (nestedValidation) {
      ValidateHeader(block.header, {
        debugPath: `${debugPath}.header`
      });
    }
    assertArray(`${debugPath}.uncles`, block.uncles,
                toAssert(ValidateUncleBlock, nestedValidation), nestedValidation);
    assertArray(`${debugPath}.transactions`, block.transactions,
                toAssert(ValidateTransaction, nestedValidation), nestedValidation);
    assertArray(`${debugPath}.proposals`, block.proposals,
                assertProposalShortId, nestedValidation);
  }

  function ValidateCellbaseWitness(cellbaseWitness, { nestedValidation = true, debugPath = "cellbase_witness" } = {}) {
    assertObjectWithKeys(debugPath, cellbaseWitness, ["lock", "message"], []);
    assertHexString(`${debugPath}.message`, cellbaseWitness.message);

    if (nestedValidation) {
      ValidateScript(cellbaseWitness.lock, {
        debugPath: `${debugPath}.lock`
      });
    }
  }

  function ValidateWitnessArgs(witnessArgs, { nestedValidation = true, debugPath = "witness_args" } = {}) {
    assertObjectWithKeys(debugPath, witnessArgs, [], ["lock", "input_type", "output_type"]);

    if (witnessArgs.lock) {
      assertHexString(`${debugPath}.lock`, witnessArgs.lock);
    }
    if (witnessArgs.input_type) {
      assertHexString(`${debugPath}.input_type`, witnessArgs.input_type);
    }
    if (witnessArgs.output_type) {
      assertHexString(`${debugPath}.output_type`, witnessArgs.output_type);
    }
  }

  var index = /*#__PURE__*/Object.freeze({
    __proto__: null,
    ValidateScript: ValidateScript,
    ValidateOutPoint: ValidateOutPoint,
    ValidateCellInput: ValidateCellInput,
    ValidateCellOutput: ValidateCellOutput,
    ValidateCellDep: ValidateCellDep,
    ValidateRawTransaction: ValidateRawTransaction,
    ValidateTransaction: ValidateTransaction,
    ValidateRawHeader: ValidateRawHeader,
    ValidateHeader: ValidateHeader,
    ValidateUncleBlock: ValidateUncleBlock,
    ValidateBlock: ValidateBlock,
    ValidateCellbaseWitness: ValidateCellbaseWitness,
    ValidateWitnessArgs: ValidateWitnessArgs
  });

  exports.RPC = RPC;
  exports.Reader = Reader;
  exports.validators = index;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
