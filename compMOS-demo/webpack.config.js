const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const VueLoaderPlugin = require("vue-loader/lib/plugin");

module.exports = (env, argv) => {
  const isDevelopment = argv.mode === "development";

  return {
    entry: "./src/main.js",
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: isDevelopment ? "js/[name].js" : "js/[name].[contenthash:8].js",
      publicPath: "/"
    },
    resolve: {
      extensions: [".js", ".vue", ".json"],
      alias: {
        "@": path.resolve(__dirname, "src"),
        vue$: "vue/dist/vue.esm.js"
      }
    },
    module: {
      rules: [
        {
          test: /\.vue$/,
          loader: "vue-loader"
        },
        {
          test: /\.js$/,
          loader: "babel-loader",
          exclude: /node_modules/
        },
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"]
        },
        {
          test: /\.less$/,
          use: ["style-loader", "css-loader", "less-loader"]
        },
        {
          test: /\.(png|jpe?g|gif|svg)$/,
          loader: "url-loader",
          options: {
            limit: 10240,
            name: "images/[name].[hash:8].[ext]",
            esModule: false
          }
        },
        {
          test: /\.(woff2?|eot|ttf|otf)$/,
          loader: "url-loader",
          options: {
            limit: 10240,
            name: "fonts/[name].[hash:8].[ext]"
          }
        }
      ]
    },
    plugins: [
      new CleanWebpackPlugin(),
      new VueLoaderPlugin(),
      new HtmlWebpackPlugin({
        template: "./public/index.html",
        favicon: false,
        inject: true,
        minify: {
          removeComments: true,
          collapseWhitespace: true,
          removeAttributeQuotes: false
        }
      })
    ],
    devServer: {
      contentBase: path.join(__dirname, "public"),
      compress: true,
      port: 8080,
      hot: true,
      open: true,
      overlay: {
        warnings: true,
        errors: true
      },
      historyApiFallback: true
    },
    performance: {
      maxEntrypointSize: 512000,
      maxAssetSize: 512000
    }
  };
};

