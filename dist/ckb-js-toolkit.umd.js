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

  var jsbiUmd = createCommonjsModule(function (module, exports) {
  (function(e,t){module.exports=t();})(commonjsGlobal,function(){function e(t){return e="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},e(t)}function t(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function i(e,t){for(var _,n=0;n<t.length;n++)_=t[n],_.enumerable=_.enumerable||!1,_.configurable=!0,"value"in _&&(_.writable=!0),Object.defineProperty(e,_.key,_);}function _(e,t,_){return t&&i(e.prototype,t),_&&i(e,_),e}function n(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&l(e,t);}function g(e){return g=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)},g(e)}function l(e,t){return l=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e},l(e,t)}function o(){if("undefined"==typeof Reflect||!Reflect.construct)return !1;if(Reflect.construct.sham)return !1;if("function"==typeof Proxy)return !0;try{return Date.prototype.toString.call(Reflect.construct(Date,[],function(){})),!0}catch(t){return !1}}function a(){return a=o()?Reflect.construct:function(e,t,i){var _=[null];_.push.apply(_,t);var n=Function.bind.apply(e,_),g=new n;return i&&l(g,i.prototype),g},a.apply(null,arguments)}function s(e){return -1!==Function.toString.call(e).indexOf("[native code]")}function u(e){var t="function"==typeof Map?new Map:void 0;return u=function(e){function i(){return a(e,arguments,g(this).constructor)}if(null===e||!s(e))return e;if("function"!=typeof e)throw new TypeError("Super expression must either be null or a function");if("undefined"!=typeof t){if(t.has(e))return t.get(e);t.set(e,i);}return i.prototype=Object.create(e.prototype,{constructor:{value:i,enumerable:!1,writable:!0,configurable:!0}}),l(i,e)},u(e)}function r(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function d(e,t){return t&&("object"==typeof t||"function"==typeof t)?t:r(e)}var h=function(i){var o=Math.abs,a=Math.max,s=Math.imul,u=Math.clz32;function l(e,i){var _;if(t(this,l),e>l.__kMaxLength)throw new RangeError("Maximum BigInt size exceeded");return _=d(this,g(l).call(this,e)),_.sign=i,_}return n(l,i),_(l,[{key:"toDebugString",value:function(){var e=["BigInt["],t=!0,i=!1,_=void 0;try{for(var n,g,l=this[Symbol.iterator]();!(t=(n=l.next()).done);t=!0)g=n.value,e.push((g?(g>>>0).toString(16):g)+", ");}catch(e){i=!0,_=e;}finally{try{t||null==l.return||l.return();}finally{if(i)throw _}}return e.push("]"),e.join("")}},{key:"toString",value:function(){var e=0<arguments.length&&void 0!==arguments[0]?arguments[0]:10;if(2>e||36<e)throw new RangeError("toString() radix argument must be between 2 and 36");return 0===this.length?"0":0==(e&e-1)?l.__toStringBasePowerOfTwo(this,e):l.__toStringGeneric(this,e,!1)}},{key:"__copy",value:function(){for(var e=new l(this.length,this.sign),t=0;t<this.length;t++)e[t]=this[t];return e}},{key:"__trim",value:function(){for(var e=this.length,t=this[e-1];0===t;)e--,t=this[e-1],this.pop();return 0===e&&(this.sign=!1),this}},{key:"__initializeDigits",value:function(){for(var e=0;e<this.length;e++)this[e]=0;}},{key:"__clzmsd",value:function(){return u(this[this.length-1])}},{key:"__inplaceMultiplyAdd",value:function(e,t,_){_>this.length&&(_=this.length);for(var n=65535&e,g=e>>>16,l=0,o=65535&t,a=t>>>16,u=0;u<_;u++){var r=this.__digit(u),d=65535&r,h=r>>>16,b=s(d,n),m=s(d,g),c=s(h,n),v=s(h,g),y=o+(65535&b),f=a+l+(y>>>16)+(b>>>16)+(65535&m)+(65535&c);o=(m>>>16)+(c>>>16)+(65535&v)+(f>>>16),l=o>>>16,o&=65535,a=v>>>16;this.__setDigit(u,65535&y|f<<16);}if(0!==l||0!==o||0!==a)throw new Error("implementation bug")}},{key:"__inplaceAdd",value:function(e,t,_){for(var n,g=0,l=0;l<_;l++)n=this.__halfDigit(t+l)+e.__halfDigit(l)+g,g=n>>>16,this.__setHalfDigit(t+l,n);return g}},{key:"__inplaceSub",value:function(e,t,_){var n=0;if(1&t){t>>=1;for(var g=this.__digit(t),l=65535&g,o=0;o<_-1>>>1;o++){var a=e.__digit(o),s=(g>>>16)-(65535&a)-n;n=1&s>>>16,this.__setDigit(t+o,s<<16|65535&l),g=this.__digit(t+o+1),l=(65535&g)-(a>>>16)-n,n=1&l>>>16;}var u=e.__digit(o),r=(g>>>16)-(65535&u)-n;n=1&r>>>16,this.__setDigit(t+o,r<<16|65535&l);if(t+o+1>=this.length)throw new RangeError("out of bounds");0==(1&_)&&(g=this.__digit(t+o+1),l=(65535&g)-(u>>>16)-n,n=1&l>>>16,this.__setDigit(t+e.length,4294901760&g|65535&l));}else{t>>=1;for(var d=0;d<e.length-1;d++){var h=this.__digit(t+d),b=e.__digit(d),m=(65535&h)-(65535&b)-n;n=1&m>>>16;var c=(h>>>16)-(b>>>16)-n;n=1&c>>>16,this.__setDigit(t+d,c<<16|65535&m);}var v=this.__digit(t+d),y=e.__digit(d),f=(65535&v)-(65535&y)-n;n=1&f>>>16;var k=0;0==(1&_)&&(k=(v>>>16)-(y>>>16)-n,n=1&k>>>16),this.__setDigit(t+d,k<<16|65535&f);}return n}},{key:"__inplaceRightShift",value:function(e){if(0!==e){for(var t,_=this.__digit(0)>>>e,n=this.length-1,g=0;g<n;g++)t=this.__digit(g+1),this.__setDigit(g,t<<32-e|_),_=t>>>e;this.__setDigit(n,_);}}},{key:"__digit",value:function(e){return this[e]}},{key:"__unsignedDigit",value:function(e){return this[e]>>>0}},{key:"__setDigit",value:function(e,t){this[e]=0|t;}},{key:"__setDigitGrow",value:function(e,t){this[e]=0|t;}},{key:"__halfDigitLength",value:function(){var e=this.length;return 65535>=this.__unsignedDigit(e-1)?2*e-1:2*e}},{key:"__halfDigit",value:function(e){return 65535&this[e>>>1]>>>((1&e)<<4)}},{key:"__setHalfDigit",value:function(e,t){var i=e>>>1,_=this.__digit(i),n=1&e?65535&_|t<<16:4294901760&_|65535&t;this.__setDigit(i,n);}}],[{key:"BigInt",value:function(t){var i=Math.floor,_=Number.isFinite;if("number"==typeof t){if(0===t)return l.__zero();if((0|t)===t)return 0>t?l.__oneDigit(-t,!0):l.__oneDigit(t,!1);if(!_(t)||i(t)!==t)throw new RangeError("The number "+t+" cannot be converted to BigInt because it is not an integer");return l.__fromDouble(t)}if("string"==typeof t){var n=l.__fromString(t);if(null===n)throw new SyntaxError("Cannot convert "+t+" to a BigInt");return n}if("boolean"==typeof t)return !0===t?l.__oneDigit(1,!1):l.__zero();if("object"===e(t)){if(t.constructor===l)return t;var g=l.__toPrimitive(t);return l.BigInt(g)}throw new TypeError("Cannot convert "+t+" to a BigInt")}},{key:"toNumber",value:function(e){var t=e.length;if(0===t)return 0;if(1===t){var i=e.__unsignedDigit(0);return e.sign?-i:i}var _=e.__digit(t-1),n=u(_),g=32*t-n;if(1024<g)return e.sign?-Infinity:1/0;var o=g-1,a=_,s=t-1,r=n+1,d=32===r?0:a<<r;d>>>=12;var h=r-12,b=12<=r?0:a<<20+r,m=20+r;0<h&&0<s&&(s--,a=e.__digit(s),d|=a>>>32-h,b=a<<h,m=h),0<m&&0<s&&(s--,a=e.__digit(s),b|=a>>>32-m,m-=32);var c=l.__decideRounding(e,m,s,a);if((1===c||0===c&&1==(1&b))&&(b=b+1>>>0,0===b&&(d++,0!=d>>>20&&(d=0,o++,1023<o))))return e.sign?-Infinity:1/0;var v=e.sign?-2147483648:0;return o=o+1023<<20,l.__kBitConversionInts[1]=v|o|d,l.__kBitConversionInts[0]=b,l.__kBitConversionDouble[0]}},{key:"unaryMinus",value:function(e){if(0===e.length)return e;var t=e.__copy();return t.sign=!e.sign,t}},{key:"bitwiseNot",value:function(e){return e.sign?l.__absoluteSubOne(e).__trim():l.__absoluteAddOne(e,!0)}},{key:"exponentiate",value:function(e,t){if(t.sign)throw new RangeError("Exponent must be positive");if(0===t.length)return l.__oneDigit(1,!1);if(0===e.length)return e;if(1===e.length&&1===e.__digit(0))return e.sign&&0==(1&t.__digit(0))?l.unaryMinus(e):e;if(1<t.length)throw new RangeError("BigInt too big");var i=t.__unsignedDigit(0);if(1===i)return e;if(i>=l.__kMaxLengthBits)throw new RangeError("BigInt too big");if(1===e.length&&2===e.__digit(0)){var _=1+(i>>>5),n=e.sign&&0!=(1&i),g=new l(_,n);g.__initializeDigits();var o=1<<(31&i);return g.__setDigit(_-1,o),g}var a=null,s=e;for(0!=(1&i)&&(a=e),i>>=1;0!==i;i>>=1)s=l.multiply(s,s),0!=(1&i)&&(null===a?a=s:a=l.multiply(a,s));return a}},{key:"multiply",value:function(e,t){if(0===e.length)return e;if(0===t.length)return t;var _=e.length+t.length;32<=e.__clzmsd()+t.__clzmsd()&&_--;var n=new l(_,e.sign!==t.sign);n.__initializeDigits();for(var g=0;g<e.length;g++)l.__multiplyAccumulate(t,e.__digit(g),n,g);return n.__trim()}},{key:"divide",value:function(e,t){if(0===t.length)throw new RangeError("Division by zero");if(0>l.__absoluteCompare(e,t))return l.__zero();var i,_=e.sign!==t.sign,n=t.__unsignedDigit(0);if(1===t.length&&65535>=n){if(1===n)return _===e.sign?e:l.unaryMinus(e);i=l.__absoluteDivSmall(e,n,null);}else i=l.__absoluteDivLarge(e,t,!0,!1);return i.sign=_,i.__trim()}},{key:"remainder",value:function e(t,i){if(0===i.length)throw new RangeError("Division by zero");if(0>l.__absoluteCompare(t,i))return t;var _=i.__unsignedDigit(0);if(1===i.length&&65535>=_){if(1===_)return l.__zero();var n=l.__absoluteModSmall(t,_);return 0===n?l.__zero():l.__oneDigit(n,t.sign)}var e=l.__absoluteDivLarge(t,i,!1,!0);return e.sign=t.sign,e.__trim()}},{key:"add",value:function(e,t){var i=e.sign;return i===t.sign?l.__absoluteAdd(e,t,i):0<=l.__absoluteCompare(e,t)?l.__absoluteSub(e,t,i):l.__absoluteSub(t,e,!i)}},{key:"subtract",value:function(e,t){var i=e.sign;return i===t.sign?0<=l.__absoluteCompare(e,t)?l.__absoluteSub(e,t,i):l.__absoluteSub(t,e,!i):l.__absoluteAdd(e,t,i)}},{key:"leftShift",value:function(e,t){return 0===t.length||0===e.length?e:t.sign?l.__rightShiftByAbsolute(e,t):l.__leftShiftByAbsolute(e,t)}},{key:"signedRightShift",value:function(e,t){return 0===t.length||0===e.length?e:t.sign?l.__leftShiftByAbsolute(e,t):l.__rightShiftByAbsolute(e,t)}},{key:"unsignedRightShift",value:function(){throw new TypeError("BigInts have no unsigned right shift; use >> instead")}},{key:"lessThan",value:function(e,t){return 0>l.__compareToBigInt(e,t)}},{key:"lessThanOrEqual",value:function(e,t){return 0>=l.__compareToBigInt(e,t)}},{key:"greaterThan",value:function(e,t){return 0<l.__compareToBigInt(e,t)}},{key:"greaterThanOrEqual",value:function(e,t){return 0<=l.__compareToBigInt(e,t)}},{key:"equal",value:function(e,t){if(e.sign!==t.sign)return !1;if(e.length!==t.length)return !1;for(var _=0;_<e.length;_++)if(e.__digit(_)!==t.__digit(_))return !1;return !0}},{key:"notEqual",value:function(e,t){return !l.equal(e,t)}},{key:"bitwiseAnd",value:function(e,t){if(!e.sign&&!t.sign)return l.__absoluteAnd(e,t).__trim();if(e.sign&&t.sign){var i=a(e.length,t.length)+1,_=l.__absoluteSubOne(e,i),n=l.__absoluteSubOne(t);return _=l.__absoluteOr(_,n,_),l.__absoluteAddOne(_,!0,_).__trim()}if(e.sign){var g=[t,e];e=g[0],t=g[1];}return l.__absoluteAndNot(e,l.__absoluteSubOne(t)).__trim()}},{key:"bitwiseXor",value:function(e,t){if(!e.sign&&!t.sign)return l.__absoluteXor(e,t).__trim();if(e.sign&&t.sign){var i=a(e.length,t.length),_=l.__absoluteSubOne(e,i),n=l.__absoluteSubOne(t);return l.__absoluteXor(_,n,_).__trim()}var g=a(e.length,t.length)+1;if(e.sign){var o=[t,e];e=o[0],t=o[1];}var s=l.__absoluteSubOne(t,g);return s=l.__absoluteXor(s,e,s),l.__absoluteAddOne(s,!0,s).__trim()}},{key:"bitwiseOr",value:function(e,t){var i=a(e.length,t.length);if(!e.sign&&!t.sign)return l.__absoluteOr(e,t).__trim();if(e.sign&&t.sign){var _=l.__absoluteSubOne(e,i),n=l.__absoluteSubOne(t);return _=l.__absoluteAnd(_,n,_),l.__absoluteAddOne(_,!0,_).__trim()}if(e.sign){var g=[t,e];e=g[0],t=g[1];}var o=l.__absoluteSubOne(t,i);return o=l.__absoluteAndNot(o,e,o),l.__absoluteAddOne(o,!0,o).__trim()}},{key:"asIntN",value:function(e,t){if(0===t.length)return t;if(0===e)return l.__zero();if(e>=l.__kMaxLengthBits)return t;var _=e+31>>>5;if(t.length<_)return t;var n=t.__unsignedDigit(_-1),g=1<<(31&e-1);if(t.length===_&&n<g)return t;if(!((n&g)===g))return l.__truncateToNBits(e,t);if(!t.sign)return l.__truncateAndSubFromPowerOfTwo(e,t,!0);if(0==(n&g-1)){for(var o=_-2;0<=o;o--)if(0!==t.__digit(o))return l.__truncateAndSubFromPowerOfTwo(e,t,!1);return t.length===_&&n===g?t:l.__truncateToNBits(e,t)}return l.__truncateAndSubFromPowerOfTwo(e,t,!1)}},{key:"asUintN",value:function(e,t){if(0===t.length)return t;if(0===e)return l.__zero();if(t.sign){if(e>l.__kMaxLengthBits)throw new RangeError("BigInt too big");return l.__truncateAndSubFromPowerOfTwo(e,t,!1)}if(e>=l.__kMaxLengthBits)return t;var i=e+31>>>5;if(t.length<i)return t;var _=31&e;if(t.length==i){if(0==_)return t;var n=t.__digit(i-1);if(0==n>>>_)return t}return l.__truncateToNBits(e,t)}},{key:"ADD",value:function(e,t){if(e=l.__toPrimitive(e),t=l.__toPrimitive(t),"string"==typeof e)return "string"!=typeof t&&(t=t.toString()),e+t;if("string"==typeof t)return e.toString()+t;if(e=l.__toNumeric(e),t=l.__toNumeric(t),l.__isBigInt(e)&&l.__isBigInt(t))return l.add(e,t);if("number"==typeof e&&"number"==typeof t)return e+t;throw new TypeError("Cannot mix BigInt and other types, use explicit conversions")}},{key:"LT",value:function(e,t){return l.__compare(e,t,0)}},{key:"LE",value:function(e,t){return l.__compare(e,t,1)}},{key:"GT",value:function(e,t){return l.__compare(e,t,2)}},{key:"GE",value:function(e,t){return l.__compare(e,t,3)}},{key:"EQ",value:function(t,i){for(;;){if(l.__isBigInt(t))return l.__isBigInt(i)?l.equal(t,i):l.EQ(i,t);if("number"==typeof t){if(l.__isBigInt(i))return l.__equalToNumber(i,t);if("object"!==e(i))return t==i;i=l.__toPrimitive(i);}else if("string"==typeof t){if(l.__isBigInt(i))return t=l.__fromString(t),null!==t&&l.equal(t,i);if("object"!==e(i))return t==i;i=l.__toPrimitive(i);}else if("boolean"==typeof t){if(l.__isBigInt(i))return l.__equalToNumber(i,+t);if("object"!==e(i))return t==i;i=l.__toPrimitive(i);}else if("symbol"===e(t)){if(l.__isBigInt(i))return !1;if("object"!==e(i))return t==i;i=l.__toPrimitive(i);}else if("object"===e(t)){if("object"===e(i)&&i.constructor!==l)return t==i;t=l.__toPrimitive(t);}else return t==i}}},{key:"NE",value:function(e,t){return !l.EQ(e,t)}},{key:"__zero",value:function(){return new l(0,!1)}},{key:"__oneDigit",value:function(e,t){var i=new l(1,t);return i.__setDigit(0,e),i}},{key:"__decideRounding",value:function(e,t,i,_){if(0<t)return -1;var n;if(0>t)n=-t-1;else{if(0===i)return -1;i--,_=e.__digit(i),n=31;}var g=1<<n;if(0==(_&g))return -1;if(g-=1,0!=(_&g))return 1;for(;0<i;)if(i--,0!==e.__digit(i))return 1;return 0}},{key:"__fromDouble",value:function(e){l.__kBitConversionDouble[0]=e;var t,i=2047&l.__kBitConversionInts[1]>>>20,_=i-1023,n=(_>>>5)+1,g=new l(n,0>e),o=1048575&l.__kBitConversionInts[1]|1048576,a=l.__kBitConversionInts[0],s=20,u=31&_,r=0;if(u<s){var d=s-u;r=d+32,t=o>>>d,o=o<<32-d|a>>>d,a<<=32-d;}else if(u===s)r=32,t=o,o=a;else{var h=u-s;r=32-h,t=o<<h|a>>>32-h,o=a<<h;}g.__setDigit(n-1,t);for(var b=n-2;0<=b;b--)0<r?(r-=32,t=o,o=a):t=0,g.__setDigit(b,t);return g.__trim()}},{key:"__isWhitespace",value:function(e){return !!(13>=e&&9<=e)||(159>=e?32==e:131071>=e?160==e||5760==e:196607>=e?(e&=131071,10>=e||40==e||41==e||47==e||95==e||4096==e):65279==e)}},{key:"__fromString",value:function(e){var t=1<arguments.length&&void 0!==arguments[1]?arguments[1]:0,i=0,_=e.length,n=0;if(n===_)return l.__zero();for(var g=e.charCodeAt(n);l.__isWhitespace(g);){if(++n===_)return l.__zero();g=e.charCodeAt(n);}if(43===g){if(++n===_)return null;g=e.charCodeAt(n),i=1;}else if(45===g){if(++n===_)return null;g=e.charCodeAt(n),i=-1;}if(0===t){if(t=10,48===g){if(++n===_)return l.__zero();if(g=e.charCodeAt(n),88===g||120===g){if(t=16,++n===_)return null;g=e.charCodeAt(n);}else if(79===g||111===g){if(t=8,++n===_)return null;g=e.charCodeAt(n);}else if(66===g||98===g){if(t=2,++n===_)return null;g=e.charCodeAt(n);}}}else if(16===t&&48===g){if(++n===_)return l.__zero();if(g=e.charCodeAt(n),88===g||120===g){if(++n===_)return null;g=e.charCodeAt(n);}}for(;48===g;){if(++n===_)return l.__zero();g=e.charCodeAt(n);}var o=_-n,a=l.__kMaxBitsPerChar[t],s=l.__kBitsPerCharTableMultiplier-1;if(o>1073741824/a)return null;var u=a*o+s>>>l.__kBitsPerCharTableShift,r=new l(u+31>>>5,!1),h=10>t?t:10,b=10<t?t-10:0;if(0==(t&t-1)){a>>=l.__kBitsPerCharTableShift;var c=[],v=[],y=!1;do{for(var f,k=0,D=0;;){if(f=void 0,g-48>>>0<h)f=g-48;else if((32|g)-97>>>0<b)f=(32|g)-87;else{y=!0;break}if(D+=a,k=k<<a|f,++n===_){y=!0;break}if(g=e.charCodeAt(n),32<D+a)break}c.push(k),v.push(D);}while(!y);l.__fillFromParts(r,c,v);}else{r.__initializeDigits();var p=!1,B=0;do{for(var S,C=0,A=1;;){if(S=void 0,g-48>>>0<h)S=g-48;else if((32|g)-97>>>0<b)S=(32|g)-87;else{p=!0;break}var T=A*t;if(4294967295<T)break;if(A=T,C=C*t+S,B++,++n===_){p=!0;break}g=e.charCodeAt(n);}s=32*l.__kBitsPerCharTableMultiplier-1;var m=a*B+s>>>l.__kBitsPerCharTableShift+5;r.__inplaceMultiplyAdd(A,C,m);}while(!p)}if(n!==_){if(!l.__isWhitespace(g))return null;for(n++;n<_;n++)if(g=e.charCodeAt(n),!l.__isWhitespace(g))return null}return 0!==i&&10!==t?null:(r.sign=-1===i,r.__trim())}},{key:"__fillFromParts",value:function(e,t,_){for(var n=0,g=0,l=0,o=t.length-1;0<=o;o--){var a=t[o],s=_[o];g|=a<<l,l+=s,32===l?(e.__setDigit(n++,g),l=0,g=0):32<l&&(e.__setDigit(n++,g),l-=32,g=a>>>s-l);}if(0!==g){if(n>=e.length)throw new Error("implementation bug");e.__setDigit(n++,g);}for(;n<e.length;n++)e.__setDigit(n,0);}},{key:"__toStringBasePowerOfTwo",value:function(e,t){var _=e.length,n=t-1;n=(85&n>>>1)+(85&n),n=(51&n>>>2)+(51&n),n=(15&n>>>4)+(15&n);var g=n,o=t-1,a=e.__digit(_-1),s=u(a),r=0|(32*_-s+g-1)/g;if(e.sign&&r++,268435456<r)throw new Error("string too long");for(var d=Array(r),h=r-1,b=0,m=0,c=0;c<_-1;c++){var v=e.__digit(c),y=(b|v<<m)&o;d[h--]=l.__kConversionChars[y];var f=g-m;for(b=v>>>f,m=32-f;m>=g;)d[h--]=l.__kConversionChars[b&o],b>>>=g,m-=g;}var k=(b|a<<m)&o;for(d[h--]=l.__kConversionChars[k],b=a>>>g-m;0!==b;)d[h--]=l.__kConversionChars[b&o],b>>>=g;if(e.sign&&(d[h--]="-"),-1!==h)throw new Error("implementation bug");return d.join("")}},{key:"__toStringGeneric",value:function(e,t,_){var n=e.length;if(0===n)return "";if(1===n){var g=e.__unsignedDigit(0).toString(t);return !1===_&&e.sign&&(g="-"+g),g}var o=32*n-u(e.__digit(n-1)),a=l.__kMaxBitsPerChar[t],s=a-1,r=o*l.__kBitsPerCharTableMultiplier;r+=s-1,r=0|r/s;var d,h,b=r+1>>1,m=l.exponentiate(l.__oneDigit(t,!1),l.__oneDigit(b,!1)),c=m.__unsignedDigit(0);if(1===m.length&&65535>=c){d=new l(e.length,!1),d.__initializeDigits();for(var v,y=0,f=2*e.length-1;0<=f;f--)v=y<<16|e.__halfDigit(f),d.__setHalfDigit(f,0|v/c),y=0|v%c;h=y.toString(t);}else{var k=l.__absoluteDivLarge(e,m,!0,!0);d=k.quotient;var D=k.remainder.__trim();h=l.__toStringGeneric(D,t,!0);}d.__trim();for(var p=l.__toStringGeneric(d,t,!0);h.length<b;)h="0"+h;return !1===_&&e.sign&&(p="-"+p),p+h}},{key:"__unequalSign",value:function(e){return e?-1:1}},{key:"__absoluteGreater",value:function(e){return e?-1:1}},{key:"__absoluteLess",value:function(e){return e?1:-1}},{key:"__compareToBigInt",value:function(e,t){var i=e.sign;if(i!==t.sign)return l.__unequalSign(i);var _=l.__absoluteCompare(e,t);return 0<_?l.__absoluteGreater(i):0>_?l.__absoluteLess(i):0}},{key:"__compareToNumber",value:function(e,t){if(!0|t){var i=e.sign,_=0>t;if(i!==_)return l.__unequalSign(i);if(0===e.length){if(_)throw new Error("implementation bug");return 0===t?0:-1}if(1<e.length)return l.__absoluteGreater(i);var n=o(t),g=e.__unsignedDigit(0);return g>n?l.__absoluteGreater(i):g<n?l.__absoluteLess(i):0}return l.__compareToDouble(e,t)}},{key:"__compareToDouble",value:function(e,t){if(t!==t)return t;if(t===1/0)return -1;if(t===-Infinity)return 1;var i=e.sign;if(i!==0>t)return l.__unequalSign(i);if(0===t)throw new Error("implementation bug: should be handled elsewhere");if(0===e.length)return -1;l.__kBitConversionDouble[0]=t;var _=2047&l.__kBitConversionInts[1]>>>20;if(2047==_)throw new Error("implementation bug: handled elsewhere");var n=_-1023;if(0>n)return l.__absoluteGreater(i);var g=e.length,o=e.__digit(g-1),a=u(o),s=32*g-a,r=n+1;if(s<r)return l.__absoluteLess(i);if(s>r)return l.__absoluteGreater(i);var d=1048576|1048575&l.__kBitConversionInts[1],h=l.__kBitConversionInts[0],b=20,m=31-a;if(m!==(s-1)%31)throw new Error("implementation bug");var c,v=0;if(m<b){var y=b-m;v=y+32,c=d>>>y,d=d<<32-y|h>>>y,h<<=32-y;}else if(m===b)v=32,c=d,d=h;else{var f=m-b;v=32-f,c=d<<f|h>>>32-f,d=h<<f;}if(o>>>=0,c>>>=0,o>c)return l.__absoluteGreater(i);if(o<c)return l.__absoluteLess(i);for(var k=g-2;0<=k;k--){0<v?(v-=32,c=d>>>0,d=h,h=0):c=0;var D=e.__unsignedDigit(k);if(D>c)return l.__absoluteGreater(i);if(D<c)return l.__absoluteLess(i)}if(0!==d||0!==h){if(0===v)throw new Error("implementation bug");return l.__absoluteLess(i)}return 0}},{key:"__equalToNumber",value:function(e,t){return t|0===t?0===t?0===e.length:1===e.length&&e.sign===0>t&&e.__unsignedDigit(0)===o(t):0===l.__compareToDouble(e,t)}},{key:"__comparisonResultToBool",value:function(e,t){switch(t){case 0:return 0>e;case 1:return 0>=e;case 2:return 0<e;case 3:return 0<=e;}throw new Error("unreachable")}},{key:"__compare",value:function(e,t,i){if(e=l.__toPrimitive(e),t=l.__toPrimitive(t),"string"==typeof e&&"string"==typeof t)switch(i){case 0:return e<t;case 1:return e<=t;case 2:return e>t;case 3:return e>=t;}if(l.__isBigInt(e)&&"string"==typeof t)return t=l.__fromString(t),null!==t&&l.__comparisonResultToBool(l.__compareToBigInt(e,t),i);if("string"==typeof e&&l.__isBigInt(t))return e=l.__fromString(e),null!==e&&l.__comparisonResultToBool(l.__compareToBigInt(e,t),i);if(e=l.__toNumeric(e),t=l.__toNumeric(t),l.__isBigInt(e)){if(l.__isBigInt(t))return l.__comparisonResultToBool(l.__compareToBigInt(e,t),i);if("number"!=typeof t)throw new Error("implementation bug");return l.__comparisonResultToBool(l.__compareToNumber(e,t),i)}if("number"!=typeof e)throw new Error("implementation bug");if(l.__isBigInt(t))return l.__comparisonResultToBool(l.__compareToNumber(t,e),2^i);if("number"!=typeof t)throw new Error("implementation bug");return 0===i?e<t:1===i?e<=t:2===i?e>t:3===i?e>=t:void 0}},{key:"__absoluteAdd",value:function(e,t,_){if(e.length<t.length)return l.__absoluteAdd(t,e,_);if(0===e.length)return e;if(0===t.length)return e.sign===_?e:l.unaryMinus(e);var n=e.length;(0===e.__clzmsd()||t.length===e.length&&0===t.__clzmsd())&&n++;for(var g=new l(n,_),o=0,a=0;a<t.length;a++){var s=t.__digit(a),u=e.__digit(a),r=(65535&u)+(65535&s)+o,d=(u>>>16)+(s>>>16)+(r>>>16);o=d>>>16,g.__setDigit(a,65535&r|d<<16);}for(;a<e.length;a++){var h=e.__digit(a),b=(65535&h)+o,m=(h>>>16)+(b>>>16);o=m>>>16,g.__setDigit(a,65535&b|m<<16);}return a<g.length&&g.__setDigit(a,o),g.__trim()}},{key:"__absoluteSub",value:function(e,t,_){if(0===e.length)return e;if(0===t.length)return e.sign===_?e:l.unaryMinus(e);for(var n=new l(e.length,_),g=0,o=0;o<t.length;o++){var a=e.__digit(o),s=t.__digit(o),u=(65535&a)-(65535&s)-g;g=1&u>>>16;var r=(a>>>16)-(s>>>16)-g;g=1&r>>>16,n.__setDigit(o,65535&u|r<<16);}for(;o<e.length;o++){var d=e.__digit(o),h=(65535&d)-g;g=1&h>>>16;var b=(d>>>16)-g;g=1&b>>>16,n.__setDigit(o,65535&h|b<<16);}return n.__trim()}},{key:"__absoluteAddOne",value:function(e,t){var _=2<arguments.length&&void 0!==arguments[2]?arguments[2]:null,n=e.length;null===_?_=new l(n,t):_.sign=t;for(var g=!0,o=0;o<n;o++){var a=e.__digit(o),s=-1===a;g&&(a=0|a+1),g=s,_.__setDigit(o,a);}return g&&_.__setDigitGrow(n,1),_}},{key:"__absoluteSubOne",value:function(e,t){var _=e.length;t=t||_;for(var n=new l(t,!1),g=!0,o=0;o<_;o++){var a=e.__digit(o),s=0===a;g&&(a=0|a-1),g=s,n.__setDigit(o,a);}for(var u=_;u<t;u++)n.__setDigit(u,0);return n}},{key:"__absoluteAnd",value:function(e,t){var _=2<arguments.length&&void 0!==arguments[2]?arguments[2]:null,n=e.length,g=t.length,o=g;if(n<g){o=n;var a=e,s=n;e=t,n=g,t=a,g=s;}var u=o;null===_?_=new l(u,!1):u=_.length;for(var r=0;r<o;r++)_.__setDigit(r,e.__digit(r)&t.__digit(r));for(;r<u;r++)_.__setDigit(r,0);return _}},{key:"__absoluteAndNot",value:function(e,t){var _=2<arguments.length&&void 0!==arguments[2]?arguments[2]:null,n=e.length,g=t.length,o=g;n<g&&(o=n);var a=n;null===_?_=new l(a,!1):a=_.length;for(var s=0;s<o;s++)_.__setDigit(s,e.__digit(s)&~t.__digit(s));for(;s<n;s++)_.__setDigit(s,e.__digit(s));for(;s<a;s++)_.__setDigit(s,0);return _}},{key:"__absoluteOr",value:function(e,t){var _=2<arguments.length&&void 0!==arguments[2]?arguments[2]:null,n=e.length,g=t.length,o=g;if(n<g){o=n;var a=e,s=n;e=t,n=g,t=a,g=s;}var u=n;null===_?_=new l(u,!1):u=_.length;for(var r=0;r<o;r++)_.__setDigit(r,e.__digit(r)|t.__digit(r));for(;r<n;r++)_.__setDigit(r,e.__digit(r));for(;r<u;r++)_.__setDigit(r,0);return _}},{key:"__absoluteXor",value:function(e,t){var _=2<arguments.length&&void 0!==arguments[2]?arguments[2]:null,n=e.length,g=t.length,o=g;if(n<g){o=n;var a=e,s=n;e=t,n=g,t=a,g=s;}var u=n;null===_?_=new l(u,!1):u=_.length;for(var r=0;r<o;r++)_.__setDigit(r,e.__digit(r)^t.__digit(r));for(;r<n;r++)_.__setDigit(r,e.__digit(r));for(;r<u;r++)_.__setDigit(r,0);return _}},{key:"__absoluteCompare",value:function(e,t){var _=e.length-t.length;if(0!=_)return _;for(var n=e.length-1;0<=n&&e.__digit(n)===t.__digit(n);)n--;return 0>n?0:e.__unsignedDigit(n)>t.__unsignedDigit(n)?1:-1}},{key:"__multiplyAccumulate",value:function(e,t,_,n){if(0!==t){for(var g=65535&t,l=t>>>16,o=0,a=0,u=0,r=0;r<e.length;r++,n++){var d=_.__digit(n),h=65535&d,b=d>>>16,m=e.__digit(r),c=65535&m,v=m>>>16,y=s(c,g),f=s(c,l),k=s(v,g),D=s(v,l);h+=a+(65535&y),b+=u+o+(h>>>16)+(y>>>16)+(65535&f)+(65535&k),o=b>>>16,a=(f>>>16)+(k>>>16)+(65535&D)+o,o=a>>>16,a&=65535,u=D>>>16,d=65535&h|b<<16,_.__setDigit(n,d);}for(;0!==o||0!==a||0!==u;n++){var p=_.__digit(n),B=(65535&p)+a,S=(p>>>16)+(B>>>16)+u+o;a=0,u=0,o=S>>>16,p=65535&B|S<<16,_.__setDigit(n,p);}}}},{key:"__internalMultiplyAdd",value:function(e,t,_,g,l){for(var o=_,a=0,u=0;u<g;u++){var r=e.__digit(u),d=s(65535&r,t),h=(65535&d)+a+o;o=h>>>16;var b=s(r>>>16,t),m=(65535&b)+(d>>>16)+o;o=m>>>16,a=b>>>16,l.__setDigit(u,m<<16|65535&h);}if(l.length>g)for(l.__setDigit(g++,o+a);g<l.length;)l.__setDigit(g++,0);else if(0!==o+a)throw new Error("implementation bug")}},{key:"__absoluteDivSmall",value:function(e,t,_){null===_&&(_=new l(e.length,!1));for(var n=0,g=2*e.length-1;0<=g;g-=2){var o=(n<<16|e.__halfDigit(g))>>>0,a=0|o/t;n=0|o%t,o=(n<<16|e.__halfDigit(g-1))>>>0;var s=0|o/t;n=0|o%t,_.__setDigit(g>>>1,a<<16|s);}return _}},{key:"__absoluteModSmall",value:function(e,t){for(var _,n=0,g=2*e.length-1;0<=g;g--)_=(n<<16|e.__halfDigit(g))>>>0,n=0|_%t;return n}},{key:"__absoluteDivLarge",value:function(e,t,i,_){var g=t.__halfDigitLength(),n=t.length,o=e.__halfDigitLength()-g,a=null;i&&(a=new l(o+2>>>1,!1),a.__initializeDigits());var r=new l(g+2>>>1,!1);r.__initializeDigits();var d=l.__clz16(t.__halfDigit(g-1));0<d&&(t=l.__specialLeftShift(t,d,0));for(var h=l.__specialLeftShift(e,d,1),u=t.__halfDigit(g-1),b=0,m=o;0<=m;m--){var v=65535,y=h.__halfDigit(m+g);if(y!==u){var f=(y<<16|h.__halfDigit(m+g-1))>>>0;v=0|f/u;for(var k=0|f%u,D=t.__halfDigit(g-2),p=h.__halfDigit(m+g-2);s(v,D)>>>0>(k<<16|p)>>>0&&(v--,k+=u,!(65535<k)););}l.__internalMultiplyAdd(t,v,0,n,r);var B=h.__inplaceSub(r,m,g+1);0!==B&&(B=h.__inplaceAdd(t,m,g),h.__setHalfDigit(m+g,h.__halfDigit(m+g)+B),v--),i&&(1&m?b=v<<16:a.__setDigit(m>>>1,b|v));}return _?(h.__inplaceRightShift(d),i?{quotient:a,remainder:h}:h):i?a:void 0}},{key:"__clz16",value:function(e){return u(e)-16}},{key:"__specialLeftShift",value:function(e,t,_){var g=e.length,n=new l(g+_,!1);if(0===t){for(var o=0;o<g;o++)n.__setDigit(o,e.__digit(o));return 0<_&&n.__setDigit(g,0),n}for(var a,s=0,u=0;u<g;u++)a=e.__digit(u),n.__setDigit(u,a<<t|s),s=a>>>32-t;return 0<_&&n.__setDigit(g,s),n}},{key:"__leftShiftByAbsolute",value:function(e,t){var _=l.__toShiftAmount(t);if(0>_)throw new RangeError("BigInt too big");var n=_>>>5,g=31&_,o=e.length,a=0!==g&&0!=e.__digit(o-1)>>>32-g,s=o+n+(a?1:0),u=new l(s,e.sign);if(0===g){for(var r=0;r<n;r++)u.__setDigit(r,0);for(;r<s;r++)u.__setDigit(r,e.__digit(r-n));}else{for(var h=0,b=0;b<n;b++)u.__setDigit(b,0);for(var m,c=0;c<o;c++)m=e.__digit(c),u.__setDigit(c+n,m<<g|h),h=m>>>32-g;if(a)u.__setDigit(o+n,h);else if(0!==h)throw new Error("implementation bug")}return u.__trim()}},{key:"__rightShiftByAbsolute",value:function(e,t){var _=e.length,n=e.sign,g=l.__toShiftAmount(t);if(0>g)return l.__rightShiftByMaximum(n);var o=g>>>5,a=31&g,s=_-o;if(0>=s)return l.__rightShiftByMaximum(n);var u=!1;if(n){if(0!=(e.__digit(o)&(1<<a)-1))u=!0;else for(var r=0;r<o;r++)if(0!==e.__digit(r)){u=!0;break}}if(u&&0===a){var h=e.__digit(_-1);0==~h&&s++;}var b=new l(s,n);if(0===a)for(var m=o;m<_;m++)b.__setDigit(m-o,e.__digit(m));else{for(var c,v=e.__digit(o)>>>a,y=_-o-1,f=0;f<y;f++)c=e.__digit(f+o+1),b.__setDigit(f,c<<32-a|v),v=c>>>a;b.__setDigit(y,v);}return u&&(b=l.__absoluteAddOne(b,!0,b)),b.__trim()}},{key:"__rightShiftByMaximum",value:function(e){return e?l.__oneDigit(1,!0):l.__zero()}},{key:"__toShiftAmount",value:function(e){if(1<e.length)return -1;var t=e.__unsignedDigit(0);return t>l.__kMaxLengthBits?-1:t}},{key:"__toPrimitive",value:function(t){var i=1<arguments.length&&void 0!==arguments[1]?arguments[1]:"default";if("object"!==e(t))return t;if(t.constructor===l)return t;var _=t[Symbol.toPrimitive];if(_){var n=_(i);if("object"!==e(n))return n;throw new TypeError("Cannot convert object to primitive value")}var g=t.valueOf;if(g){var o=g.call(t);if("object"!==e(o))return o}var a=t.toString;if(a){var s=a.call(t);if("object"!==e(s))return s}throw new TypeError("Cannot convert object to primitive value")}},{key:"__toNumeric",value:function(e){return l.__isBigInt(e)?e:+e}},{key:"__isBigInt",value:function(t){return "object"===e(t)&&t.constructor===l}},{key:"__truncateToNBits",value:function(e,t){for(var _=e+31>>>5,n=new l(_,t.sign),g=_-1,o=0;o<g;o++)n.__setDigit(o,t.__digit(o));var a=t.__digit(g);if(0!=(31&e)){var s=32-(31&e);a=a<<s>>>s;}return n.__setDigit(g,a),n.__trim()}},{key:"__truncateAndSubFromPowerOfTwo",value:function(e,t,_){for(var n=Math.min,g=e+31>>>5,o=new l(g,_),a=0,s=g-1,u=0,r=n(s,t.length);a<r;a++){var d=t.__digit(a),h=0-(65535&d)-u;u=1&h>>>16;var b=0-(d>>>16)-u;u=1&b>>>16,o.__setDigit(a,65535&h|b<<16);}for(;a<s;a++)o.__setDigit(a,0|-u);var m,c=s<t.length?t.__digit(s):0,v=31&e;if(0===v){var y=0-(65535&c)-u;u=1&y>>>16;var f=0-(c>>>16)-u;m=65535&y|f<<16;}else{var k=32-v;c=c<<k>>>k;var D=1<<32-k,p=(65535&D)-(65535&c)-u;u=1&p>>>16;var B=(D>>>16)-(c>>>16)-u;m=65535&p|B<<16,m&=D-1;}return o.__setDigit(s,m),o.__trim()}},{key:"__digitPow",value:function(e,t){for(var i=1;0<t;)1&t&&(i*=e),t>>>=1,e*=e;return i}}]),l}(u(Array));return h.__kMaxLength=33554432,h.__kMaxLengthBits=h.__kMaxLength<<5,h.__kMaxBitsPerChar=[0,0,32,51,64,75,83,90,96,102,107,111,115,119,122,126,128,131,134,136,139,141,143,145,147,149,151,153,154,156,158,159,160,162,163,165,166],h.__kBitsPerCharTableShift=5,h.__kBitsPerCharTableMultiplier=1<<h.__kBitsPerCharTableShift,h.__kConversionChars=["0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"],h.__kBitConversionBuffer=new ArrayBuffer(8),h.__kBitConversionDouble=new Float64Array(h.__kBitConversionBuffer),h.__kBitConversionInts=new Int32Array(h.__kBitConversionBuffer),h});
  });

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

  function HexStringToBigInt(hexString) {
    return jsbiUmd.BigInt(hexString);
  }

  function BigIntToHexString(bigInt) {
    return "0x" + bigInt.toString(16);
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

  class RPCCollector {
    constructor(rpc, lockHash, skipCellWithContent = true) {
      this.rpc = rpc;
      this.lockHash = new Reader(lockHash).serializeJson();
      this.skipCellWithContent = skipCellWithContent;
    }

    async *collect() {
      const to = HexStringToBigInt(await this.rpc.get_tip_block_number());
      let currentFrom = jsbiUmd.BigInt(0);
      while (jsbiUmd.lessThanOrEqual(currentFrom, to)) {
        let currentTo = jsbiUmd.add(currentFrom, jsbiUmd.BigInt(100));
        if (jsbiUmd.greaterThan(currentTo, to)) {
          currentTo = to;
        }
        const cells = await this.rpc.get_cells_by_lock_hash(
          this.lockHash, BigIntToHexString(currentFrom), BigIntToHexString(currentTo));
        for (const cell of cells) {
          if (this.skipCellWithContent) {
            if (cell.type || jsbiUmd.greaterThan(HexStringToBigInt(cell.output_data_len),
                                              jsbiUmd.BigInt(100))) {
              continue;
            }
            yield cell;
          }
        }
        currentFrom = jsbiUmd.add(currentTo, jsbiUmd.BigInt(1));
      }
    }
  }



  var index$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    RPCCollector: RPCCollector
  });

  exports.BigIntToHexString = BigIntToHexString;
  exports.HexStringToBigInt = HexStringToBigInt;
  exports.RPC = RPC;
  exports.Reader = Reader;
  exports.cell_collectors = index$1;
  exports.validators = index;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
