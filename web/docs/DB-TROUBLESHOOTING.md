DB connectivity quick checks (Windows)

1) Ensure MongoDB service is running
- Open PowerShell as Administrator
- Run: Get-Service -Name MongoDB* | Start-Service

2) Test connection using mongosh
- If installed: mongosh "mongodb://127.0.0.1:27017/5wh-news" --eval "db.runCommand({ ping: 1 })"

3) App endpoints
- GET /health/db -> shows Mongoose readyState
- GET /healthz -> app readiness

4) Common fixes
- Firewall/AV blocking localhost: allow 127.0.0.1:27017
- Change MONGODB_URI in .env to match your instance
- If using Docker or Atlas, update MONGODB_URI and whitelist IP
