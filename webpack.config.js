const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

// Ensure NODE_ENV has a value for DefinePlugin consistency
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
}
const isDevelopment = process.env.NODE_ENV === 'development';

module.exports = {
  mode: isDevelopment ? 'development' : 'production',
  entry: './src/renderer/index.tsx',
  // Faster initial build with cheap-module-source-map; still good line mapping
  devtool: isDevelopment ? 'cheap-module-source-map' : 'source-map',
  cache: isDevelopment ? {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename]
    }
  } : false,
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '@': path.resolve(__dirname, 'src/renderer'),
    },
    fallback: {
      "buffer": require.resolve("buffer"),
      "util": require.resolve("util"),
      "events": require.resolve("events"),
      // Remove heavy/unused polyfills for leaner bundle; add back if needed
      "fs": false
    }
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            configFile: 'tsconfig.json',
            transpileOnly: true
          }
        },
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              sourceMap: isDevelopment,
              // Prefer embedded Sass (new API) with fallback to dart-sass package
              // Force embedded implementation; we installed sass-embedded already
              implementation: require('sass-embedded'),
              sassOptions: {
                quietDeps: true
              }
            }
          }
        ],
      },
      {
        test: /\.(png|jpe?g|gif|svg|ico)$/,
        type: 'asset/resource',
      },
    ],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist/renderer'),
    clean: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/renderer/index.html',
      filename: 'index.html',
      inject: 'body',
      scriptLoading: 'defer'
    }),
    // Provide basic shims
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser'
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'global': 'globalThis'
    })
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist/renderer'),
    },
    port: 3000,
    hot: true,
    compress: true,
    historyApiFallback: true,
  },
  // Use web target so webpack doesn't expect Node-style globals automatically
  target: 'web'
  // Removed externals - bundling everything for simplicity in dev
};