import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

module.exports = [
  {
    input: "src/index.js",
    output: {
      file: "dist/ckb-js-toolkit.node.js",
      format: "cjs"
    },
    plugins: [
      resolve({preferBuiltins: true}),
      commonjs()
    ]
  },
  {
    input: "src/index.js",
    output: {
      file: "dist/ckb-js-toolkit.umd.js",
      format: "umd",
      name: "CKBJSToolkit"
    },
    plugins: [
      resolve({browser: true, preferBuiltins: false}),
      commonjs()
    ]
  },
  {
    input: "src/index.js",
    output: {
      file: "dist/ckb-js-toolkit.esm.js",
      format: "esm"
    },
    plugins: [
      resolve({browser: true, preferBuiltins: false}),
      commonjs()
    ]
  }
];
