module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Remove fork-ts-checker-webpack-plugin to avoid AJV compatibility issues
      webpackConfig.plugins = webpackConfig.plugins.filter(
        plugin => plugin.constructor.name !== 'ForkTsCheckerWebpackPlugin'
      );

      // Disable ESLint plugin to avoid compatibility issues
      webpackConfig.plugins = webpackConfig.plugins.filter(
        plugin => plugin.constructor.name !== 'ESLintWebpackPlugin'
      );

      return webpackConfig;
    },
  },
};
