// This package provides transformer functions that transform JavaScript objects
// into JSON ready objects that can be passed to RPC. It following the following
// rules:
//
// 1. If the specified object has a serializeJson method, it would invoke this
// method and use the result to replace current object.
// 2. It then restricts the keys of the object to keys required by the specified
// entity(i.e., a Script would only have code_hash, hash_type, args keys),for each
// sub-field, it then recursively perform the steps here from step 1.
// 3. It then optionally run validator functions to ensure the resulting object
// follows specified rules.
//
// Note rule 1 here provides the flexibility in defining your own structures: you
// could define a class containing custom data structures, then provide a
// serializeJson that transforms the custom one into the rigid data structure
// required by CKB. You can also leverage the Reader class we provide as much as
// possible. Since Reader class does provide serializeJson methods, transformers
// here will transform them to valid hex strings required by CKB.
import * as validators from "./validators";

function invokeSerializeJson(value) {
  if (value instanceof Object && value.serializeJson instanceof Function) {
    return value.serializeJson();
  }
  return value;
}

function transformObject(debugPath, object, keys) {
  object = invokeSerializeJson(object);
  if (!(object instanceof Object)) {
    throw new Error(`${debugPath} is not an object!`);
  }
  const result = {};

  for (const [key, f] of Object.entries(keys)) {
    result[key] = f(object[key]);
  }
  return result;
}

export function TransformScript(
  script,
  { validation = true, debugPath = "script" } = {}
) {
  script = transformObject(debugPath, script, {
    code_hash: invokeSerializeJson,
    hash_type: invokeSerializeJson,
    args: invokeSerializeJson
  });

  if (validation) {
    validators.ValidateScript(script, {
      debugPath: `(transformed) ${debugPath}`
    });
  }
  return script;
}
