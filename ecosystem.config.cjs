/** PM2: run Next directly (faster than `npm start`). Usage: pm2 start ecosystem.config.cjs */
module.exports = {
  apps: [
    {
      name: 'entrip',
      cwd: '/var/www/entripreneurship-app',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3002',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
      },
      max_memory_restart: '512M',
    },
  ],
};
