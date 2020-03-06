import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { terser } from "rollup-plugin-terser";

const isProduction = process.env.BUILD === 'production';
const outputFolder = isProduction ? "dist" : "build";
const sourcemap = !isProduction;

module.exports = [
  {
    input: "src/index.js",
    output: {
      file: outputFolder + "/ckb-js-toolkit.node.js",
      format: "cjs",
      sourcemap: true
    },
    plugins: [
      resolve({preferBuiltins: true}),
      commonjs(),
      isProduction && terser()
    ]
  },
  // TODO: do we need sourcemap for UMD and ESM versions?
  {
    input: "src/index.js",
    output: {
      file: outputFolder + "/ckb-js-toolkit.umd.js",
      format: "umd",
      name: "CKBJSToolkit",
      sourcemap: sourcemap
    },
    plugins: [
      resolve({browser: true, preferBuiltins: false}),
      commonjs(),
      isProduction && terser()
    ]
  },
  {
    input: "src/index.js",
    output: {
      file: outputFolder + "/ckb-js-toolkit.esm.js",
      format: "esm",
      sourcemap: sourcemap
    },
    plugins: [
      resolve({browser: true, preferBuiltins: false}),
      commonjs(),
      isProduction && terser()
    ]
  }
];
