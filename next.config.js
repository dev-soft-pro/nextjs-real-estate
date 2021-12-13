const path = require('path')
const withCSS = require('@zeit/next-css')
const withPlugins = require('next-compose-plugins')
const optimizedImages = require('next-optimized-images')

module.exports = withPlugins([
  [optimizedImages, {
    handleImages: ['jpeg', 'png', 'webp']
  }], [withCSS]
], {
  target: 'serverless',
  pagesDir: './src/pages',
  // Force a trailing slash, the default value is no trailing slash (false)
  trailingSlash: true,
  webpack: (config, { defaultLoaders }) => {
    // support absolute import
    config.resolve.modules.push(path.join(__dirname, 'src'))

    // support svg
    config.module.rules.push({
      test: /\.svg$/,
      use: [
        {
          loader: '@svgr/webpack',
          options: { svgoConfig: { plugins: { removeViewBox: false } } }
        }
      ]
    })

    // support importing separate css
    config.module.rules.push({
      test: /\.scss$/,
      use: [
        defaultLoaders.babel,
        {
          loader: require('styled-jsx/webpack').loader,
          options: {
            type: (fileName, options) => options.query.type || 'scoped'
          }
        },
        'sass-loader'
      ]
    })

    config.node = {
      fs: 'empty'
    }

    return config
  }
})
