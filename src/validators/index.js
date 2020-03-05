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

function assertHexString(string, field_name) {
  if (!/^0x([0-9a-fA-F][0-9a-fA-F])*$/.test(string)) {
    throw new Error(`${field_name} must be a hex string!`)
  }
}

function assertHash(hash, field_name) {
  assertHexString(hash, field_name);
  if (hash.length != 66) {
    throw new Error(`${field_name} must be a hex string of 66 bytes long!`);
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
