const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const dist_dir = 'dist';

let config = {
  entry: {
    background: './src/background/index.js',
    content_scripts: './src/content_scripts/index.js',
    popup: './src/popup/index.js',
    options: './src/options/index.js'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, dist_dir)
  },
  devtool: process.env.NODE_ENV == 'production' ? 'source-map' : false,
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
    new CleanWebpackPlugin(),
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
    // Copy all public assets to output
    new CopyWebpackPlugin([
      {
        // Take it directly from the node_modules
        from: './**/**',
        // Where to copy the file in the destination folder
        to: './',
        // My extension relative to node_modules
        context: './public',
        // Don't keep the node_modules tree
        flatten: false
      }
    ])
  ]
};

module.exports = (env, argv) => {
  if (argv.mode === 'development') {
    config.devtool = 'source-map';
  }

  if (argv.mode === 'production') {
    config.devtool = false;
  }

  return config;
};
