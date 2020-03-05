import fetch from "cross-fetch";

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

export class RPC {
  constructor(uri) {
    this.uri = uri;
    return new Proxy(this, handler);
  }
}
