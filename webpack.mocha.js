/* eslint-disable import/no-extraneous-dependencies */

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    main: [
      'babel-polyfill',
      'mocha-loader!./test/index.js',
    ],
    'pdf.worker': 'pdfjs-dist/build/pdf.worker.entry',
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'testDist'),
  },
  module: {
    rules: [{
      test: /\.pdf$/,
      loader: 'uint8array-loader',
    }, {
      test: /\.js?$/,
      loader: 'babel-loader',
      exclude: '/node_modules/',
      include: [
        path.resolve(__dirname, './test/'),
        path.resolve(__dirname, './src/'),
      ],
    }],
  },
  plugins: [
    new HtmlWebpackPlugin({ title: 'TEST: Dijix Image' }),
  ],
  devServer: {
    contentBase: './testDist',
  },
  node: {
    fs: 'empty',
  },
};
