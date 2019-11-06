const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

/// to do
///
/// CHECK IF PATH EXISTS FOR ENTRY
///
///

module.exports = (env, argv) => {
  const isDev = argv.mode === 'development';

  const outpath = 'dist';
  const devTool = isDev ? 'source-map' : false;
  const styleLoader = isDev ? 'style-loader' : MiniCssExtractPlugin.loader;
  const htmlMinify = isDev
    ? {}
    : {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true
      };

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
    devtool: devTool,
    stats: {
      assets: true,
      children: false,
      entrypoints: true,
      modules: false
    },
    resolve: {
      extensions: ['.js', '.jsx', '.mjs']
    },
    module: {
      rules: [
        // javascript
        {
          test: /\.(js(x)?|mjs)$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
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
        // html
        {
          test: /\.html$/,
          use: [
            {
              loader: 'html-loader'
            }
          ]
        },
        // css styles
        {
          test: /\.css$/,
          use: [
            styleLoader,
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                ident: 'postcss',
                plugins: [require('postcss-preset-env')()]
              }
            }
          ]
        },
        // fonts
        {
          test: /\.(woff(2)?|eot|ttf|otf)$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '[name].[ext]',
                publicPath: '../fonts',
                outputPath: 'assets/fonts/'
              }
            }
          ]
        },
        // normal images
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
        },
        // svg images
        {
          test: /\.svg$/,
          use: ['@svgr/webpack']
        }
      ]
    },
    plugins: [
      new CleanWebpackPlugin(),
      new MiniCssExtractPlugin({
        filename: 'assets/css/[name].css',
        chunkFilename: 'assets/css/[id].css'
      }),
      new HtmlWebpackPlugin({
        inject: true,
        chunks: ['popup'],
        minify: htmlMinify,
        template: './src/popup/index.html',
        filename: 'popup.html'
      }),
      new HtmlWebpackPlugin({
        inject: true,
        chunks: ['options'],
        minify: htmlMinify,
        template: './src/options/index.html',
        filename: 'options.html'
      }),
      // Copy all public assets to output
      new CopyWebpackPlugin(
        [
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
        ],
        { copyUnmodified: true }
      )
    ]
  };

  return config;
};
