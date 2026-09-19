/**
 * Hostinger PM2 Configuration for Resa AI Assistant
 *
 * Use this file on Hostinger VPS, CyberPanel, or Cloud servers with PM2:
 *
 * Commands:
 *   npm run build
 *   pm2 start ecosystem.config.cjs
 *   pm2 save
 *   pm2 startup
 */

module.exports = {
  apps: [
    {
      name: "resa-ai-assistant",
      script: "./dist/server.cjs",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "production",
        PORT: process.env.PORT || 3000
      }
    }
  ]
};
