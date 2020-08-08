const path = require('path');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');


module.exports = {
  mode: 'development',
  entry: path.join(__dirname, './src', 'app.tsx'),

  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, './public')
  },

  resolve: {
    extensions: ['.ts', '.js', '.tsx']
  },

  module: {
    rules: [
      // css
      { test: /\.(css|scss)$/, loader: ['style-loader', 'css-loader', 'sass-loader'] },

      // js, ts, tsx
      {
        test: /\.(js|ts|tsx)$/,
        exclude: /(node_modules|tests)/,

        use: [
          {
            loader: 'babel-loader',

            // Babel のオプション
            options: {
              presets: [
                ["@babel/preset-env", {
                  'useBuiltIns': 'usage',
                  'corejs': 3
                }
                ],

                "@babel/preset-react"
              ]
            }
          },
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true
            }
          },
        ]
      }
    ]
  },

  plugins: [
    new ForkTsCheckerWebpackPlugin({
      typescript: {
        configFile: path.join(__dirname, './tsconfig.json')
      }
    }),
  ],

  devServer: {
    contentBase: path.join(__dirname, 'public'),
    compress: true,
    port: 8080,
    watchContentBase: true
  }
};