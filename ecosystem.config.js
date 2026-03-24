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
      // Le variabili sensibili devono essere nel file .env sul server
      // NON inserire secrets direttamente qui
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
      // Le variabili sensibili vengono caricate da /var/www/studio-erp/.env
      // tramite: pm2 start ecosystem.config.js --env production
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
    
    // NOTA: env_common NON è una chiave PM2 valida — ignorata silenziosamente.
    // Tutte le variabili d'ambiente sensibili devono essere configurate
    // nel file .env in /var/www/studio-erp/.env sul server Hetzner.
    // Genera il file con: cp .env.template .env && nano .env
    // Poi avvia con: pm2 start ecosystem.config.js --env production
  }]
}