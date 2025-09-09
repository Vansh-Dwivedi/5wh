module.exports = {
  apps: [{
    name: '5wh-media',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '500M',
    node_args: '--max_old_space_size=400'
  }],

  deploy: {
    production: {
      user: 'ubuntu',
      host: 'YOUR_AWS_IP_ADDRESS',
      ref: 'origin/main',
      repo: 'https://github.com/Vansh-Dwivedi/5wh.git',
      path: '/var/www/5wh-media',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
