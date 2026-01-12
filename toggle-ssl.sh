#!/bin/bash
# Toggle between HTTP and HTTPS for Job Applicant backend

if [ "$1" == "on" ]; then
    echo "🔒 Enabling HTTPS..."
    sed -i '' 's/SSL_ENABLED=false/SSL_ENABLED=true/' backend/.env
    sed -i '' 's/SERVER_PORT=8080/SERVER_PORT=8443/' backend/.env
    echo "✅ HTTPS enabled. Restart backend: docker-compose restart backend"
elif [ "$1" == "off" ]; then
    echo "🔓 Disabling HTTPS..."
    sed -i '' 's/SSL_ENABLED=true/SSL_ENABLED=false/' backend/.env
    sed -i '' 's/SERVER_PORT=8443/SERVER_PORT=8080/' backend/.env
    echo "✅ HTTPS disabled. Restart backend: docker-compose restart backend"
else
    echo "Usage: ./toggle-ssl.sh [on|off]"
    echo "Current settings:"
    grep "SSL_ENABLED" backend/.env
    grep "SERVER_PORT" backend/.env
fi
