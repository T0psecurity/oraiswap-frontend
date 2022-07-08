const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const { ESBuildMinifyPlugin } = require('esbuild-loader');
const { execSync } = require('child_process');
const paths = require('react-scripts/config/paths');

const fallback = {
  fs: false,
  tls: false,
  net: false,
  https: false,
  os: false,
  http: false,
  url: false,
  path: false,
  assert: false,
  crypto: require.resolve('crypto-browserify'),
  stream: require.resolve('stream-browserify')
};

const rewiredEsbuild = (config) => {
  const useTypeScript = fs.existsSync(paths.appTsConfig);

  // replace babel-loader to esbuild-loader
  for (const { oneOf } of config.module.rules) {
    if (oneOf) {
      let babelLoaderIndex = -1;
      const rules = Object.entries(oneOf);
      for (const [index, rule] of rules.slice().reverse()) {
        if (
          rule.loader &&
          rule.loader.includes(path.sep + 'babel-loader' + path.sep)
        ) {
          oneOf.splice(index, 1);
          babelLoaderIndex = index;
        }
      }
      if (~babelLoaderIndex) {
        oneOf.splice(babelLoaderIndex, 0, {
          test: /\.(js|mjs|jsx|ts|tsx)$/,
          include: [paths.appSrc],
          loader: require.resolve('esbuild-loader'),
          options: {
            loader: useTypeScript ? 'tsx' : 'jsx',
            target: 'es2015'
          }
        });
      }
    }
  }

  // replace minimizer
  for (const [index, minimizer] of Object.entries(config.optimization.minimizer)
    .slice()
    .reverse()) {
    const options = {
      target: 'es2015',
      css: true
    };
    // replace TerserPlugin to ESBuildMinifyPlugin
    if (minimizer.constructor.name === 'TerserPlugin') {
      config.optimization.minimizer.splice(
        index,
        1,
        new ESBuildMinifyPlugin(options)
      );
    }
    // remove OptimizeCssAssetsWebpackPlugin
    if (
      options.css &&
      minimizer.constructor.name === 'OptimizeCssAssetsWebpackPlugin'
    ) {
      config.optimization.minimizer.splice(index, 1);
    }
  }

  return config;
};

module.exports = {
  fallback,
  devServer: function (configFunction) {
    return function (proxy, allowedHost) {
      // Create the default config by calling configFunction with the proxy/allowedHost parameters
      const config = configFunction(proxy, allowedHost);
      config.static = [path.resolve('vendor'), paths.appPublic];
      return config;
    };
  },
  webpack: function (config, env) {
    config.resolve.fallback = fallback;

    const isDevelopment = env === 'development';

    // do not check issues
    config.plugins = config.plugins.filter(
      (plugin) => plugin.constructor.name !== 'ForkTsCheckerWebpackPlugin'
    );

    // add dll
    const vendorManifest = path.resolve(
      isDevelopment ? 'vendor' : paths.appPublic,
      'vendor',
      'manifest.json'
    );

    if (!fs.existsSync(vendorManifest)) {
      execSync('yarn vendor', {
        stdio: 'inherit',
        env: process.env,
        cwd: process.cwd()
      });
    }

    config.plugins.push(
      new webpack.DllReferencePlugin({
        context: __dirname,
        manifest: vendorManifest
      })
    );

    return rewiredEsbuild(config);
  }
};
