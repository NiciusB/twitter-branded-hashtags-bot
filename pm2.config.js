module.exports = {
  apps: [
    {
      name: 'BrandedHashtagsBot',
      script: './index.js',
      env: {
        NODE_ENV: 'production',
      },
      instances: 1,
    },
  ],
}
