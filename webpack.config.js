const path = require('path');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');

module.exports = {
  mode: process.env.NODE_ENV || 'development',
  entry: {
    app: ['./src'],
  },
  output: {
    path: path.join(__dirname, 'public', 'assets'),
    filename: 'main.js',
    publicPath: '/public/assets/',
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      {
        test: /\.css$/,
        use: [{
          loader: 'style-loader',
        }, {
          loader: 'css-loader',
        }, {
          loader: 'postcss-loader',
          options: {
            ident: 'postcss',
            plugins: () => [autoprefixer],
          },
        }],
      },
    ],
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
      Popper: ['popper.js', 'default'],
    }),
  ],
};
