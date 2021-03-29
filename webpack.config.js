const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = (env) => {
    const dev = env.development;
    const prod = env.production;
    return {
        mode: dev ? 'development' : 'production',
        entry: {
            index: './src/index.ts',
            frame: './src/frame.ts',
        },
        devtool: dev ? 'source-map' : false,
        devServer: {contentBase: './dist'},
        plugins: [
            new CleanWebpackPlugin(),
            new CopyPlugin({patterns: ['public']}),
            new HtmlWebpackPlugin({filename: 'index.html', chunks: ['index'], template: 'src/index.html'}),
            new HtmlWebpackPlugin({filename: 'frame.html', chunks: ['frame'], template: 'src/frame.html'}),
            new MiniCssExtractPlugin(),
        ],
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: 'ts-loader',
                    exclude: /node_modules/,
                },
                {
                    test: /\.css$/i,
                    use: [MiniCssExtractPlugin.loader, 'css-loader'],
                },
            ],
        },
        resolve: {
            extensions: ['.ts', '.js'],
        },
        output: {
            filename: '[name].[contenthash:8].js',
            path: path.resolve(__dirname, 'dist'),
        },
        optimization: {
            minimize: prod,
            minimizer: [
                `...`,
                new CssMinimizerPlugin(),
            ],
        },
    }
}
