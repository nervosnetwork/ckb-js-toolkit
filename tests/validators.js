const test = require("ava");
const { validators } = require("../dist/ckb-js-toolkit.node.js");

test("correct script should pass validation", t => {
  validators.ValidateScript({
    code_hash: "0xa98c57135830e1b91345948df6c4b8870828199a786b26f09f7dec4bc27a73da",
    args: "0x1234",
    hash_type: "data"
  });
  t.pass();
});

test("correct script with empty args", t => {
  validators.ValidateScript({
    code_hash: "0xa98c57135830e1b91345948df6c4b8870828199a786b26f09f7dec4bc27a73da",
    args: "0x",
    hash_type: "type"
  });
  t.pass();
});

test("script with invalid code hash", t => {
  t.throws(() => {
    validators.ValidateScript({
      code_hash: "0xa98c57135830e1b913",
      args: "0x",
      hash_type: "type"
    });
  });
});

test("script with invalid args", t => {
  t.throws(() => {
    validators.ValidateScript({
      code_hash: "0xa98c57135830e1b91345948df6c4b8870828199a786b26f09f7dec4bc27a73da",
      args: "0xthisisnothex",
      hash_type: "type"
    });
  });
});

test("script with invalid hash type", t => {
  t.throws(() => {
    validators.ValidateScript({
      code_hash: "0xa98c57135830e1b91345948df6c4b8870828199a786b26f09f7dec4bc27a73da",
      args: "0x",
      hash_type: "code"
    });
  });
});
