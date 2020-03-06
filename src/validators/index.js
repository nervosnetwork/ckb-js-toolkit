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
  if (providedKeys.length < requiredLength || providedKeys.length > maximalLength) {
    throw new Error(`${debugPath} does not have correct keys!`);
  }
  let optionalProvidedKeys = providedKeys.filter(key => !expectedKeys.includes(key));
  if (providedKeys.length - optionalProvidedKeys.length !== requiredLength) {
    throw new Error(`${debugPath} does not have correct keys!`);
  }
  if (optionalProvidedKeys.find(key => !optionalKeys.includes(key))) {
    throw new Error(`${debugPath} does not have correct keys!`);
  }
}

function assertHexString(debugPath, string) {
  if (!/^0x([0-9a-fA-F][0-9a-fA-F])*$/.test(string)) {
    throw new Error(`${debugPath} must be a hex string!`)
  }
}

function assertHash(debugPath, hash) {
  debugPath = debugPath || "Provided value";
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

export function ValidateScript(script, { nestedValidation = true, debugPath = "script" } = {}) {
  assertObjectWithKeys(debugPath, script, ["code_hash", "hash_type", "args"], []);
  assertHash(`${debugPath}.code_hash`, script.code_hash);
  assertHexString(`${debugPath}.args`, script.args);

  if (script.hash_type !== "data" && script.hash_type !== "type") {
    throw new Error(`${debugPath}.hash_type must be either data or type!`);
  }
}

export function ValidateOutPoint(outPoint, { nestedValidation = true, debugPath = "out_point" } = {}) {
  assertObjectWithKeys(debugPath, outPoint, ["tx_hash", "index"], []);
  assertHash(`${debugPath}.tx_hash`, outPoint.tx_hash);
  assertInteger(`${debugPath}.index`, outPoint.index);
}

export function ValidateCellInput(cellInput, { nestedValidation = true, debugPath = "cell_input"} = {}) {
  assertObjectWithKeys(debugPath, cellInput, ["since", "previous_output"], []);
  assertInteger(`${debugPath}.since`, cellInput.since);

  if (nestedValidation) {
    ValidateOutPoint(cellInput.previous_output, {
      debugPath: `${debugPath}.previous_output`
    });
  }
}

export function ValidateCellOutput(cellOutput, { nestedValidation = true, debugPath = "cell_output"} = {}) {
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


export function ValidateCellDep(cellDep, { nestedValidation = true, debugPath = "cell_dep"} = {}) {
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

export function ValidateRawTransaction(rawTransaction, { nestedValidation = true, debugPath = "raw_transaction" } = {}) {
  assertObjectWithKeys(debugPath, rawTransaction,
                       ["version", "cell_deps", "header_deps",
                        "inputs", "outputs", "outputs_data"], []);
  assertCommonTransaction(debugPath, rawTransaction, nestedValidation);
}

export function ValidateTransaction(transaction, { nestedValidation = true, debugPath = "transaction" } = {}) {
  assertObjectWithKeys(debugPath, transaction,
                       ["version", "cell_deps", "header_deps", "inputs",
                        "outputs", "outputs_data", "witnesses"], []);
  assertCommonTransaction(debugPath, transaction, nestedValidation);
  assertArray(`${debugPath}.witnesses`, transaction.witnesses,
              assertHexString, nestedValidation);
}
