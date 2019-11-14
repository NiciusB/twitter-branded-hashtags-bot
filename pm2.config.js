module.exports = {
  apps: [
    {
      name: 'BrandedHashtagsBot',
      script: './src/index.js',
      env: {
        NODE_ENV: 'production',
      },
      instances: 1,
    },
  ],
}
