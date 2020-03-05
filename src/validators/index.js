// This package provides validator functions that check JSON objects are
// following the correct format, so we can submit them to CKB via RPC
// directly

function assertObjectWithKeys(object, ...expectedKeys) {
  if (object === null ||
      typeof object !== "object" ||
      object.constructor !== Object) {
    throw new Error("Provide value is not an object!");
  }
  const sortedProvidedKeys = Object.keys(object).sort();
  const sortedExpectedKeys = expectedKeys.sort();
  if (sortedProvidedKeys.length !== sortedExpectedKeys.length) {
    throw new Error("Specified object does not have correct keys!");
  }
  for (let i = 0; i < sortedProvidedKeys.length; i++) {
    if (sortedProvidedKeys[i] !== sortedExpectedKeys[i]) {
      throw new Error("Specified object does not have correct keys!");
    }
  }
}

function assertHexString(string, fieldName) {
  if (!/^0x([0-9a-fA-F][0-9a-fA-F])*$/.test(string)) {
    throw new Error(`${fieldName} must be a hex string!`)
  }
}

function assertHash(hash, fieldName) {
  assertHexString(hash, fieldName);
  if (hash.length != 66) {
    throw new Error(`${fieldName} must be a hex string of 66 bytes long!`);
  }
}

function assertInteger(i, fieldName) {
  if (i === "0x0") {
    return;
  }
  if (!/^0x[1-9a-fA-F][0-9a-fA-F]*$/.test(i)) {
    throw new Error(`${fieldName} must be a hex integer!`)
  }
}

export function ValidateScript(script) {
  assertObjectWithKeys(script, "code_hash", "hash_type", "args");
  assertHash(script.code_hash, "code_hash");
  assertHexString(script.args, "args");

  if (script.hash_type !== "data" && script.hash_type !== "type") {
    throw new Error("hash_type must be either data or type!");
  }
}

export function ValidateOutPoint(outPoint) {
  assertObjectWithKeys(outPoint, "tx_hash", "index");
  assertHash(outPoint.tx_hash, "tx_hash");
  assertInteger(outPoint.index, "index");
}
