module.exports = {
  apps: [
    {
      name: 'nutbaba-backend',
      script: 'dist/index.js',
      cwd: '/home/nutbaba-api/htdocs/api.nutbaba.in',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 3000,
      env: {
        NODE_ENV: 'production',
      },
      error_file: '/home/nutbaba-api/.pm2/logs/nutbaba-backend-error.log',
      out_file: '/home/nutbaba-api/.pm2/logs/nutbaba-backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
}
