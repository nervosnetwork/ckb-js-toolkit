(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('cross-fetch')) :
  typeof define === 'function' && define.amd ? define(['exports', 'cross-fetch'], factory) :
  (global = global || self, factory(global['ckb-js-toolkit'] = {}, global.fetch));
}(this, (function (exports, fetch) { 'use strict';

  fetch = fetch && fetch.hasOwnProperty('default') ? fetch['default'] : fetch;

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
  }

  class HexStringReader {
    constructor(string) {
      this.string = string;
    }

    length() {
      return this.string.length / 2;
    }

    indexAt(i) {
      return parseInt(this.string.substr(i * 2, 2), 16);
    }
  }

  class Reader {
    constructor(input) {
      if (typeof input === "string") {
        if ((!input.startsWith("0x")) ||
            (input.length % 2 != 0)) {
          throw new Error("Hex string must start with 0x, and has even numbered length!");
        }
        return new HexStringReader(input.substr(2));
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

  const handler = {
    get: (target, method) => {
      return async (...params) => {
        const id = Math.round(Math.random() * 10000000);
        const response = await fetch(target.uri, {
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

  exports.RPC = RPC;
  exports.Reader = Reader;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
