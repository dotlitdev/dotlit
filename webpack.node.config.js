const path = require('path')
const webpack = require('webpack')

const { spawn } = require('child_process')
const distDir = path.resolve(__dirname, './dist')
const stage = "development"

module.exports = {
  mode: stage,
  entry: path.resolve(__dirname, './src/cli/index.js'),
  output: {
    path: distDir,
    publicPath: '/',
    filename: 'node.bundle.js'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  target: 'node',
  externals:{
    fs: "commonjs fs",
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'awesome-typescript-loader',
          options: {
            useBabel: true,
            useCache: true,
            babelCore: "@babel/core",
            useTranspileModule: true,
            useWebpackText: true,
            doTypeCheck: true,
            forkChecker: true
          }
        }
      },
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        include: /src/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.css$/,
        use: [{ loader: 'css-loader' }],
        include: /src/
      },
      {
        test: /\.(jpe?g|png|gif)$/,
        use: [{ loader: 'file-loader?name=img/[name]__[hash:base64:5].[ext]' }],
        include: /src/
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2)$/,
        use: [{ loader: 'file-loader?name=font/[name]__[hash:base64:5].[ext]' }],
        include: /src/
      },
      // {
      //   test: /\.json$/, 
      //   loaders: ['json-loader']
      // }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(stage)
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
  ],
  devtool: 'cheap-source-map',
  devServer: {
    contentBase: distDir,
    stats: {
      colors: true,
      chunks: false,
      children: false
    },
  }
}
