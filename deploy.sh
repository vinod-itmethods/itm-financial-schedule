#!/bin/bash
# ITM Financial Schedule — Production Deploy Script
# Usage: ./deploy.sh yourdomain.com your@email.com
set -e

DOMAIN=${1:?"Usage: ./deploy.sh <domain> <email>"}
EMAIL=${2:?"Usage: ./deploy.sh <domain> <email>"}

echo "==> Replacing domain placeholder in nginx config..."
sed -i "s/YOUR_DOMAIN.com/$DOMAIN/g" nginx.prod.conf

echo "==> Building and starting services (HTTP only first)..."
# Start nginx in HTTP-only mode for certbot challenge
docker compose -f docker-compose.prod.yml up -d nginx app

echo "==> Requesting SSL certificate from Let's Encrypt..."
docker compose -f docker-compose.prod.yml run --rm certbot certonly \
  --webroot \
  --webroot-path /var/www/certbot \
  --email "$EMAIL" \
  --agree-tos \
  --no-eff-email \
  -d "$DOMAIN"

echo "==> Reloading nginx with SSL config..."
docker compose -f docker-compose.prod.yml restart nginx

echo "==> Starting certbot auto-renewal..."
docker compose -f docker-compose.prod.yml up -d certbot

echo ""
echo "✅ Deployed at https://$DOMAIN"
echo "   Schedule data persisted in Docker volume: schedules_data"
echo "   To redeploy after code changes: docker compose -f docker-compose.prod.yml up -d --build app"
