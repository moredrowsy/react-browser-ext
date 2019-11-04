const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const dist_dir = 'dist';

const config = {
  entry: {
    background: './src/background/index.js',
    content_scripts: './src/content_scripts/index.js',
    popup: './src/popup/index.js',
    options: './src/options/index.js'
  },
  output: {
    path: path.resolve(__dirname, dist_dir),
    filename: '[name].js'
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: 'html-loader'
          }
        ]
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: true,
      chunks: ['popup'],
      template: './src/popup/index.html',
      filename: 'popup.html'
    }),
    new HtmlWebpackPlugin({
      inject: true,
      chunks: ['options'],
      template: './src/options/index.html',
      filename: 'options.html'
    }),
    // Copy manifest.json to output
    new CopyWebpackPlugin([
      {
        // Take it directly from the node_modules
        from: './src/manifest.json',
        // Where to copy the file in the destination folder
        to: './',
        // My extension relative to node_modules
        context: './',
        // Don't keep the node_modules tree
        flatten: false
      }
    ]),
    // Copy all src/assets to output
    new CopyWebpackPlugin([
      {
        // Take it directly from the node_modules
        from: './assets/**/**',
        // Where to copy the file in the destination folder
        to: './',
        // My extension relative to node_modules
        context: './src',
        // Don't keep the node_modules tree
        flatten: false
      }
    ]),
    // Copy webextension-polyfill to output
    new CopyWebpackPlugin([
      {
        // Take it directly from the node_modules
        from:
          './node_modules/webextension-polyfill/dist/browser-polyfill.min.js',
        // Where to copy the file in the destination folder
        to: 'lib/browser-polyfill.js',
        // My extension relative to node_modules
        context: './',
        // Don't keep the node_modules tree
        flatten: true
      }
    ])
  ]
};

module.exports = config;
