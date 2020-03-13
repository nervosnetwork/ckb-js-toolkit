// This package provides normalizer functions. Even though CKB uses molecule
// as the serialization layer. There is still CKB specific knowledge that does
// not belong in molecule. For example, all numbers in CKB protocols are
// serialized using little endian format. This package tries to encode such
// knowledge. The goal here, is that you are free to use whatever types that
// makes most sense to represent the values. As long as you pass your object
// through the normalizers here, molecule should be able to serialize the values
// into correct formats required by CKB.
//
// Note this is only used when you need to deal with CKB structures in molecule
// format. If you are using RPCs or GraphQL to interact with CKB, chances are you
// will not need this package.
import JSBI from "jsbi";
import { Reader } from "./reader";
import { BigIntToHexString } from "./rpc";

function normalizeHexNumber(length) {
  return function(debugPath, value) {
    if (!(value instanceof ArrayBuffer)) {
      let intValue = BigIntToHexString(JSBI.BigInt(value)).substr(2);
      if (intValue.length % 2 !== 0) {
        intValue = "0" + i;
      }
      if (intValue.length / 2 > length) {
        throw new Error(
          `${debugPath} is ${intValue.length /
            2} bytes long, expected length is ${length}!`
        );
      }
      const view = new DataView(new ArrayBuffer(length));
      for (let i = 0; i < intValue.length / 2; i++) {
        const start = intValue.length - (i + 1) * 2;
        view.setUint8(i, parseInt(intValue.substr(start, 2), 16));
      }
      value = view.buffer;
    }
    if (value.byteLength < length) {
      const array = new Uint8Array(length);
      array.set(new Uint8Array(value), 0);
      value = array.buffer;
    }
    return value;
  };
}

function normalizeRawData(length) {
  return function(debugPath, value) {
    value = new Reader(value).toArrayBuffer();
    if (length > 0 && value.byteLength !== length) {
      throw new Error(
        `${debugPath} has invalid length ${value.byteLength}, required: ${length}`
      );
    }
    return value;
  };
}

function normalizeObject(debugPath, object, keys) {
  const result = {};

  for (const [key, f] of Object.entries(keys)) {
    const value = object[key];
    if (!value) {
      throw new Error(`${debugPath} is missing ${key}!`);
    }
    result[key] = f(`${debugPath}.${key}`, value);
  }
  return result;
}

export function NormalizeScript(script, { debugPath = "script" } = {}) {
  return normalizeObject(debugPath, script, {
    code_hash: normalizeRawData(32),
    hash_type: function(debugPath, value) {
      switch (value) {
        case "data":
          return 0;
        case "type":
          return 1;
        case 0:
          return value;
        case 1:
          return value;
        default:
          throw new Error(`${debugPath}.hash_type has invalid value: ${value}`);
      }
    },
    args: normalizeRawData(-1)
  });
}
