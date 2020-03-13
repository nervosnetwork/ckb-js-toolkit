const test = require("ava");
const { normalizers, Reader } = require("../build/ckb-js-toolkit.node.js");
const CKB = require("../testfiles/blockchain.umd.js");

test("normalize and serialize script", t => {
  const value = {
    code_hash:
      "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
    args: "0xaabbccdd44332211",
    hash_type: "type"
  };
  const normalizedValue = normalizers.NormalizeScript(value);
  const serializedValue = CKB.SerializeScript(normalizedValue);
  const serializedHex = new Reader(serializedValue).serializeJson();
  t.deepEqual(
    serializedHex,
    "0x3d0000001000000030000000310000009bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce80108000000aabbccdd44332211"
  );
});

test("normalize invalid script", t => {
  const value = {
    code_hash:
      "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
    args: "0xaabbccdd4433221",
    hash_type: "type"
  };
  t.throws(() => {
    normalizers.NormalizeScript(value);
  });
});

test("normalize invalid script type", t => {
  const value = {
    code_hash:
      "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
    args: "0xaabbccdd44332211",
    hash_type: "invalidtype"
  };
  t.throws(() => {
    normalizers.NormalizeScript(value);
  });
});
