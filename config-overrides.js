const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
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

const rewiredSWC = (config) => {
  const useTypeScript = fs.existsSync(paths.appTsConfig);
  const isDevelopment = process.env.BABEL_ENV !== 'production';
  const isFastRefresh = process.env.FAST_REFRESH !== 'false';

  // replace babel-loader to swc-loader
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
          loader: require.resolve('swc-loader'),
          options: {
            jsc: {
              target: 'es2015',
              externalHelpers: true,
              transform: {
                react: {
                  runtime: 'automatic',
                  development: isDevelopment,
                  refresh: isDevelopment && isFastRefresh
                }
              },
              parser: useTypeScript
                ? {
                    syntax: 'typescript',
                    tsx: true,
                    decorators: true,
                    dynamicImport: true
                  }
                : {
                    syntax: 'ecmascript',
                    jsx: true,
                    dynamicImport: true
                  }
            }
          }
        });
      }
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

    config.optimization.minimizer[0] = new TerserPlugin({
      minify: TerserPlugin.swcMinify,
      // `terserOptions` options will be passed to `swc` (`@swc/core`)
      // Link to options - https://swc.rs/docs/config-js-minify
      terserOptions: {}
    });

    // config.experiments = {
    //   lazyCompilation: env === 'development'
    // };

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

    return rewiredSWC(config);
  }
};
