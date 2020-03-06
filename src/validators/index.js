// This package provides validator functions that check JSON objects are
// following the correct format, so we can submit them to CKB via RPC
// directly

function assertObject(object, debugPath = null) {
  debugPath = debugPath || "Provided value"
  if (object === null ||
      typeof object !== "object" ||
      object.constructor !== Object) {
    throw new Error(`${debugPath} is not an object!`);
  }
}

function assertObjectWithKeys(object, expectedKeys, optionalKeys = []) {
  assertObject(object);
  const providedKeys = Object.keys(object).sort();
  const requiredLength = expectedKeys.length;
  const maximalLength = expectedKeys.length + optionalKeys.length;
  if (providedKeys.length < requiredLength || providedKeys.length > maximalLength) {
    throw new Error("Specified object does not have correct keys!");
  }
  let optionalProvidedKeys = providedKeys.filter(key => !expectedKeys.includes(key));
  if (providedKeys.length - optionalProvidedKeys.length !== requiredLength) {
    throw new Error("Specified object does not have correct keys!");
  }
  if (optionalProvidedKeys.find(key => !optionalKeys.includes(key))) {
    throw new Error("Specified object does not have correct keys!");
  }
}

function assertHexString(string, debugPath = null) {
  debugPath = debugPath || "Provided value";
  if (!/^0x([0-9a-fA-F][0-9a-fA-F])*$/.test(string)) {
    throw new Error(`${debugPath} must be a hex string!`)
  }
}

function assertHash(hash, debugPath = null) {
  debugPath = debugPath || "Provided value";
  assertHexString(hash, debugPath);
  if (hash.length != 66) {
    throw new Error(`${debugPath} must be a hex string of 66 bytes long!`);
  }
}

function assertInteger(i, debugPath = null) {
  debugPath = debugPath || "Provided value";
  if (i === "0x0") {
    return;
  }
  if (!/^0x[1-9a-fA-F][0-9a-fA-F]*$/.test(i)) {
    throw new Error(`${debugPath} must be a hex integer!`)
  }
}

export function ValidateScript(script) {
  assertObjectWithKeys(script, ["code_hash", "hash_type", "args"], []);
  assertHash(script.code_hash, "code_hash");
  assertHexString(script.args, "args");

  if (script.hash_type !== "data" && script.hash_type !== "type") {
    throw new Error("hash_type must be either data or type!");
  }
}

export function ValidateOutPoint(outPoint) {
  assertObjectWithKeys(outPoint, ["tx_hash", "index"], []);
  assertHash(outPoint.tx_hash, "tx_hash");
  assertInteger(outPoint.index, "index");
}

export function ValidateCellInput(cellInput, nestedValidation = true) {
  assertObjectWithKeys(cellInput, ["since", "previous_output"], []);
  assertInteger(cellInput.since, "since");

  if (nestedValidation) {
    ValidateOutPoint(cellInput.previous_output);
  }
}

export function ValidateCellOutput(cellOutput, nestedValidation = true) {
  assertObjectWithKeys(cellOutput, ["capacity", "lock"], ["type"]);
  assertInteger(cellOutput.capacity, "capacity");

  if (nestedValidation) {
    ValidateScript(cellOutput.lock);
    if (cellOutput.type) {
      ValidateScript(cellOutput.type);
    }
  }
}

export function ValidateCellDep(cellDep, nestedValidation = true) {
  assertObjectWithKeys(cellDep, ["out_point", "dep_type"], []);
  if (cellDep.dep_type !== "code" && cellDep.dep_type !== "dep_group") {
    throw new Error("dep_type must be either code or dep_group!");
  }

  if (nestedValidation) {
    ValidateOutPoint(cellDep.out_point);
  }
}

function assertArray(array, validateFunction, nestedValidation) {
  if (!Array.isArray(array)) {
    throw new Error("Provided value is not an array!");
  }
  if (nestedValidation) {
    for (const item of array) {
      validateFunction(item);
    }
  }
}

function validateTransactionStructure(rawTransaction, nestedValidation) {
  assertInteger(rawTransaction.version, "version");
  assertArray(rawTransaction.cell_deps, ValidateCellDep, nestedValidation);
  assertArray(rawTransaction.header_deps, assertHash, nestedValidation);
  assertArray(rawTransaction.inputs, ValidateCellInput, nestedValidation);
  assertArray(rawTransaction.outputs, ValidateCellOutput, nestedValidation);
  assertArray(rawTransaction.outputs_data, assertHexString, nestedValidation);
}

export function ValidateRawTransaction(rawTransaction, nestedValidation = true) {
  assertObjectWithKeys(rawTransaction, ["version", "cell_deps", "header_deps",
                                        "inputs", "outputs", "outputs_data"], []);
  validateTransactionStructure(rawTransaction, nestedValidation);
}

export function ValidateTransaction(transaction, nestedValidation = true) {
  assertObjectWithKeys(transaction, ["version", "cell_deps", "header_deps",
                                     "inputs", "outputs", "outputs_data",
                                     "witnesses"], []);
  validateTransactionStructure(transaction, nestedValidation);
  assertArray(transaction.witnesses, assertHexString, nestedValidation);
}
