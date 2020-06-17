const path = require('path');
const ForkTsChecker = require('fork-ts-checker-webpack-plugin')


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
            // Babel のオプションを指定する
            options: {
              presets: [
                // プリセットを指定することで、ES2020 を ES5 に変換
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

  plugins: [new ForkTsChecker({
    tsconfig: path.join(__dirname, './tsconfig.json')
  })],

  devServer: {
    contentBase: path.join(__dirname, 'public'),
    compress: true,
    port: 8080,
    watchContentBase: true
  }
};