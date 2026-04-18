#!/usr/bin/env bash
# AuraJonad — n8n self-host one-shot bootstrap
set -euo pipefail

cd "$(dirname "$0")"

if [ ! -f .env ]; then
  echo "[bootstrap] creating .env from template"
  cp .env.example .env
  # Fill the 3 random secrets automatically
  ENC=$(openssl rand -hex 32)
  JWT=$(openssl rand -hex 32)
  DBP=$(openssl rand -hex 20)
  sed -i.bak "s|CHANGE_ME_openssl_rand_hex_32|$ENC|" .env
  sed -i.bak "s|CHANGE_ME_openssl_rand_hex_32|$JWT|" .env
  sed -i.bak "s|CHANGE_ME_strong_random_32|$DBP|" .env
  rm -f .env.bak
  echo "[bootstrap] secrets generated in .env"
  echo "[bootstrap] NEXT: edit .env → set N8N_BASIC_AUTH_PASSWORD and CF_TUNNEL_TOKEN, then re-run"
  exit 0
fi

if grep -q "paste_here" .env; then
  echo "[bootstrap] CF_TUNNEL_TOKEN still placeholder — paste it into .env first"
  exit 1
fi

mkdir -p workflows
# Symlink canonical workflows into mounted folder
for f in ../../n8n/*.json; do
  [ -f "$f" ] && cp -u "$f" workflows/
done

echo "[bootstrap] starting stack"
docker compose pull
docker compose up -d

echo "[bootstrap] waiting for n8n to boot"
sleep 15
docker compose ps
echo "[bootstrap] open: https://$(grep ^N8N_HOST .env | cut -d= -f2)"
