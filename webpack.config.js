'use strict';

const fs = require('fs');
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

/*******************************************************************************
 * FILE ENTRIES
 ******************************************************************************/

/**
 * Files to add to webpack config entry from 'src' folder
 * Simply add to this list if you want to specify more files from pattern
 *
 * Pattern
 * -------
 * From 'src': [name]/index.js and/or [name]/index.html
 * Output to: [name].js and/or [name].html
 *
 * Ex: background/index.js compiles to background.js
 */
const files = ['background', 'content_scripts', 'options', 'popup'];
const srcPath = 'src';
const outPath = 'dist';

/**
 * Add entry to config: [name]/index.js
 * Add HtmlWebpackPlugin to config if [name]/index.html exists
 *
 * @param {Object} config Webpack config
 * @param {String} srcPath Source path name
 * @param {String} name Entry path name
 */
function addEntryFileIfExist(config, srcPath, name, isDev) {
  // check if index.js and index.html exists
  const jsExist = fs.existsSync(path.resolve(srcPath, name, 'index.js'));
  const htmlExist = fs.existsSync(path.resolve(srcPath, name, 'index.html'));

  if (jsExist) config.entry[name] = `./${srcPath}/${name}/index.js`;
  if (htmlExist) config.plugins.push(htmlInstance(srcPath, name, isDev));
}

/*******************************************************************************
 * PLUGINS
 ******************************************************************************/

/**
 * HtmlWebpackPlugin instance for [name]/index.html
 *
 * @param {String} srcPath Source path name
 * @param {String} name Entry path name
 * @param {Boolean} isDev Is this development?
 */
const htmlInstance = (srcPath, name, isDev) => {
  // htlm minify options when development
  const htmlMinifyOptions = {
    collapseWhitespace: true,
    removeComments: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    useShortDoctype: true
  };

  // html options for plugin constructor
  let htmlOptions = {
    inject: true,
    chunks: [name],
    template: `./${srcPath}/${name}/index.html`,
    filename: `${name}.html`
  };

  // add minify options to html options when development
  if (!isDev) htmlOptions['minify'] = htmlMinifyOptions;

  return new HtmlWebpackPlugin(htmlOptions);
};

// CopyWebpackPlugin instance to copy public folder to output
const copyPublicInstance = new CopyWebpackPlugin(
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
);

// MiniCssExtractPlugin instance to distribute CSS file to output
const miniCssInstance = new MiniCssExtractPlugin({
  filename: 'assets/css/[name].css',
  chunkFilename: 'assets/css/[id].css'
});

/*******************************************************************************
 * LOADERS & RULES
 ******************************************************************************/

// Javascript loader rule
const jsRule = {
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
};

// Html loader rule
const htmlRule = {
  test: /\.html$/,
  use: [
    {
      loader: 'html-loader'
    }
  ]
};

// Fonts loader rule
const fontRule = {
  test: /\.(woff(2)?|eot|ttf|otf)$/,
  use: [
    {
      loader: 'file-loader',
      options: {
        name: '[name].[ext]',
        publicPath: '../../assets/fonts',
        outputPath: 'assets/fonts/'
      }
    }
  ]
};

// Images loader rule
const imgRule = {
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
};

// SVG loader rule
const svgRule = {
  test: /\.svg$/,
  use: ['@svgr/webpack']
};

/**
 * CSS loader rule
 *
 * @param {Boolean} isDev Is this development?
 */
const cssRule = isDev => {
  return {
    test: /\.css$/,
    use: [
      // if dev, distribute CSS file; else use inline style-loader
      isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
      'css-loader',
      {
        loader: 'postcss-loader',
        options: {
          ident: 'postcss',
          plugins: [require('postcss-preset-env')()]
        }
      }
    ]
  };
};

/*******************************************************************************
 * WEBPACK CONFIG LOGIC
 ******************************************************************************/

module.exports = (env, argv) => {
  const isDev = argv.mode === 'development';

  let config = {
    entry: {}, // entries added via addEntryFileIfExist()
    output: {
      filename: '[name].js',
      path: path.resolve(__dirname, outPath)
    },
    devtool: isDev ? 'source-map' : false,
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
      rules: [] // loaders added via addLoader()
    },
    plugins: [] // plugins added via addPlugin()
  };

  // Add loaders to module rules
  const loaderRules = [
    jsRule,
    htmlRule,
    cssRule(isDev),
    fontRule,
    imgRule,
    svgRule
  ];
  loaderRules.forEach(rule => config.module.rules.push(rule));

  // Add plugins
  const plugins = [
    new CleanWebpackPlugin(), // Clean public folder
    copyPublicInstance, // Copy all public assets to output
    miniCssInstance // Distirbute CSS if minicss loader called
  ];
  plugins.forEach(plugin => config.plugins.push(plugin));

  // Add file entries by name pattern
  files.forEach(name => addEntryFileIfExist(config, srcPath, name, isDev));

  return config;
};
