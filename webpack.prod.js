const common = require("./webpack.common");

module.exports = {
    ...common,
    mode: "production",
    devtool: "source-map"
};
