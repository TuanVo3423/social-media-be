module.exports = {
  app: [
    {
      name: 'twitter',
      script: 'node dist/index.js',
      env: {
        NODE_ENV: 'development'
      },
      env_production: {
        NODE_ENV: 'production'
      },
      env_staging: {
        NODE_ENV: 'staging'
      }
    }
  ]
}
