const path = require("path");

module.exports = {
    entry: {
        index: path.resolve(__dirname, "src/index.ts")
    },
    output: {
        path: path.resolve(__dirname, "js"),
        filename: "[name].min.js"
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    "style-loader",
                    "css-loader"
                ],
                exclude: /\.module\.css$/
            },
            {
                test: /\.(ts|tsx)?$/,
                loader: "ts-loader",
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                use: [
                    "style-loader",
                    "css-loader?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]"
                ],
                include: /\.module\.css$/
            },
            {
                test: /\.(html|pug|jade|txt)$/,
                use: "raw-loader"
            }
        ]
    },
    resolve: {
        extensions: [
            ".tsx",
            ".ts",
            ".js"
        ]
    }
}