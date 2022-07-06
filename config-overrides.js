const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
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

module.exports = {
  fallback,
  webpack: function (config, env) {
    config.resolve.fallback = fallback;

    // do not check issues
    config.plugins = config.plugins.filter(
      (plugin) => plugin.constructor.name !== 'ForkTsCheckerWebpackPlugin'
    );

    // config.experiments = {
    //   lazyCompilation: env === 'development'
    // };

    // add dll
    const vendorManifest = path.resolve(
      paths.appPublic,
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

    return config;
  }
};
