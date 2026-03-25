/**
 * PM2 Ecosystem Configuration
 *
 * Start in production:
 *   pm2 start ecosystem.config.js
 *   pm2 start ecosystem.config.js --env production
 *
 * Useful commands:
 *   pm2 list           - Show running processes
 *   pm2 logs klever-api - Tail logs
 *   pm2 monit          - Real-time monitoring
 *   pm2 reload klever-api --update-env  - Zero-downtime reload
 *   pm2 stop klever-api
 */

export default {
  apps: [
    {
      name: 'klever-api',
      script: './src/server.js',

      // Cluster mode for multi-core utilization
      instances: 'max',
      exec_mode: 'cluster',

      // Environment variables
      env: {
        NODE_ENV: 'development',
        NETWORK: 'testnet',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        NETWORK: 'mainnet',
        PORT: 3000,
        // Set PRIVATE_KEY via PM2 secrets or system env
      },

      // Memory management
      max_memory_restart: '512M',

      // Logging
      log_file: './logs/klever-api.log',
      error_file: './logs/klever-api-error.log',
      out_file: './logs/klever-api-out.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

      // Restart behavior
      autorestart: true,
      restart_delay: 3000,
      max_restarts: 10,

      // Watch (disable in production)
      watch: false,

      // Graceful shutdown
      kill_timeout: 10000,
      listen_timeout: 5000,

      // Node.js flags
      node_args: '--max-old-space-size=512',
    },
  ],
}
