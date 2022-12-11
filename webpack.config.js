const path = require('path');
const GasPlugin = require('gas-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: 'production',
  entry: './gas/main.ts',
  output: {
    path: path.resolve(process.cwd(),'dist/gas'),
    filename: "main.js",
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: 'ts-loader',
        },
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
    modules: ['node_modules'],
  },
  optimization: {
    minimize: false,
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "gas/appsscript.json", to: "appsscript.json" },
      ],
    }),
    new GasPlugin({
      autoGlobalExportsFiles: ['**/*.ts']
    }),
  ],
};