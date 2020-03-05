(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('cross-fetch')) :
  typeof define === 'function' && define.amd ? define(['exports', 'cross-fetch'], factory) :
  (global = global || self, factory(global['ckb-js-toolkit'] = {}, global.fetch));
}(this, (function (exports, fetch) { 'use strict';

  fetch = fetch && fetch.hasOwnProperty('default') ? fetch['default'] : fetch;

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

  Object.defineProperty(exports, '__esModule', { value: true });

})));
