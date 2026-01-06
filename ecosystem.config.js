module.exports = {
  apps: [{
    name: 'studio-erp',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/studio-erp',
    instances: process.env.NODE_ENV === 'production' ? 'max' : 1,
    exec_mode: process.env.NODE_ENV === 'production' ? 'cluster' : 'fork',
    env: {
      NODE_ENV: 'development',
      PORT: 3000,
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    // Logs configuration
    error_file: '/var/log/pm2/studio-erp-error.log',
    out_file: '/var/log/pm2/studio-erp-out.log',
    log_file: '/var/log/pm2/studio-erp.log',
    time: true,
    
    // Restart configuration
    max_restarts: 10,
    min_uptime: '10s',
    max_memory_restart: '1G',
    
    // Health monitoring
    health_check_http: {
      url: 'http://localhost:3000/api/health',
      interval: 30000,
      timeout: 10000,
      max_fails: 3,
    },
    
    // Auto restart on file changes (solo development)
    watch: process.env.NODE_ENV !== 'production',
    watch_delay: 1000,
    ignore_watch: [
      'node_modules',
      '.next',
      'uploads',
      'logs',
      '.git'
    ],
    
    // Advanced PM2 features
    instance_var: 'INSTANCE_ID',
    
    // Kill timeout
    kill_timeout: 5000,
    
    // Listen timeout  
    listen_timeout: 8000,
    
    // Graceful reload
    wait_ready: true,
    
    // Source map support
    source_map_support: true,
    
    // Merge logs from all instances
    merge_logs: true,
    
    // Log rotation
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // Environment variables that should be available in all environments
    env_common: {
      // Database
      DATABASE_URL: process.env.DATABASE_URL,
      
      // NextAuth
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
      
      // External APIs
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
      SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
      
      // Storage
      MINIO_ENDPOINT: process.env.MINIO_ENDPOINT,
      MINIO_ACCESS_KEY: process.env.MINIO_ACCESS_KEY,
      MINIO_SECRET_KEY: process.env.MINIO_SECRET_KEY,
      
      // Security
      RATE_LIMIT_REDIS_URL: process.env.RATE_LIMIT_REDIS_URL,
    }
  }]
}