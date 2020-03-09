const test = require("ava");
const { transformers, Reader } = require("../build/ckb-js-toolkit.node.js");

test("transform script", t => {
  const s = transformers.TransformScript({
    code_hash: "0xa98c57135830e1b91345948df6c4b8870828199a786b26f09f7dec4bc27a73da",
    args: Reader.fromRawString("args1234"),
    hash_type: {
      serializeJson: () => "data"
    }
  });

  t.deepEqual(s, {
    code_hash: "0xa98c57135830e1b91345948df6c4b8870828199a786b26f09f7dec4bc27a73da",
    args: "0x6172677331323334",
    hash_type: "data"
  });
});

test("transform plain script", t => {
  const s = transformers.TransformScript({
    code_hash: "0xa98c57135830e1b91345948df6c4b8870828199a786b26f09f7dec4bc27a73da",
    args: "0x1234",
    hash_type: "data"
  });

  t.deepEqual(s, {
    code_hash: "0xa98c57135830e1b91345948df6c4b8870828199a786b26f09f7dec4bc27a73da",
    args: "0x1234",
    hash_type: "data"
  });
})

test("transform invalid script", t => {
  t.throws(() => {
    transformers.TransformScript({
      code_hash: "0xa98c57135830e1b91345948df6c4b8870828199a786b26f09f7dec4bc27a73da",
      args: "0xgghh",
      hash_type: "data"
    });
  });
})

test("transform invalid script but do not validate", t => {
  const s = transformers.TransformScript({
    code_hash: "0xa98c57135830e1b91345948df6c4b8870828199a786b26f09f7dec4bc27a73da",
    args: "0xgghh",
    hash_type: "data"
  }, { validation: false });

  t.deepEqual(s, {
    code_hash: "0xa98c57135830e1b91345948df6c4b8870828199a786b26f09f7dec4bc27a73da",
    args: "0xgghh",
    hash_type: "data"
  });
})
