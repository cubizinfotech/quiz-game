module.exports = {
  apps: [
    {
      name: 'quiz-game-api',
      script: './backend/server.js',
      cwd: '/var/www/quiz-game',
      instances: 'max',
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      error_file: '/var/log/pm2/quiz-game-api-error.log',
      out_file: '/var/log/pm2/quiz-game-api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      restart_delay: 3000,
      max_restarts: 10,
      autorestart: true,
    },
  ],
};
