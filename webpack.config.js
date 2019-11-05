const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const outpath = 'dist';

let config = {
  entry: {
    background: './src/background/index.js',
    content_scripts: './src/content_scripts/index.js',
    popup: './src/popup/index.js',
    options: './src/options/index.js'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, outpath)
  },
  devtool: process.env.NODE_ENV == 'production' ? 'source-map' : false,
  resolve: {
    extensions: ['.js', '.jsx', '.mjs']
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|mjs)$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: [
            [
              '@babel/preset-env',
              {
                targets: {
                  browsers: ['defaults']
                }
              }
            ],
            '@babel/react',
            {
              plugins: [
                '@babel/plugin-transform-runtime',
                '@babel/plugin-proposal-class-properties'
              ]
            }
          ]
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
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.svg$/,
        use: ['@svgr/webpack']
      },
      {
        test: /\.(png|jp(e*)g|gif)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192, // Convert images < 8kb to base64 strings
              name: './assets/img/[name].[ext]'
            }
          }
        ]
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
