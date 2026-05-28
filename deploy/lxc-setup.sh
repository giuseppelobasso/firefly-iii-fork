#!/bin/bash
# deploy/lxc-setup.sh
# Setup script per LXC Debian 12 — Firefly III fork (test environment)
# Target: firefly-dev.homelab.local (192.168.0.X)
#
# Ispirato a: https://github.com/community-scripts/ProxmoxVE/blob/main/install/firefly-install.sh
#
# Uso:
#   1. Crea LXC Debian 12 su Proxmox (1GB RAM min, 10GB storage)
#   2. Copia questo script nel container:
#        pct push <CTID> deploy/lxc-setup.sh /root/lxc-setup.sh
#   3. Sul container: bash /root/lxc-setup.sh

set -euo pipefail

REPO_URL="https://github.com/giuseppelobasso/firefly-iii-fork.git"  # <-- cambia con il tuo fork
APP_DIR="/opt/firefly"
APP_URL="https://firefly-dev.homelab.local"
PHP_VERSION="8.5"
MARIADB_DB="firefly"
MARIADB_USER="firefly"
MARIADB_PASS="$(openssl rand -base64 20 | tr -d '/+=')"

log() { echo -e "\n\033[1;34m>>> $1\033[0m"; }
ok()  { echo -e "\033[1;32m✓ $1\033[0m"; }
err() { echo -e "\033[1;31m✗ $1\033[0m" >&2; exit 1; }

# ─── 1. Sistema base ───────────────────────────────────────────────────────────
log "Aggiornamento sistema..."
apt-get update -qq && apt-get upgrade -y -qq
apt-get install -y -qq \
    curl wget git unzip gnupg2 lsb-release ca-certificates \
    software-properties-common apt-transport-https openssl
ok "Sistema aggiornato"

# ─── 2. PHP 8.5 (Sury repo) ────────────────────────────────────────────────────
log "Installazione PHP ${PHP_VERSION}..."
curl -sSL https://packages.sury.org/php/apt.gpg | gpg --dearmor -o /usr/share/keyrings/sury-php.gpg
echo "deb [signed-by=/usr/share/keyrings/sury-php.gpg] https://packages.sury.org/php/ $(lsb_release -sc) main" \
    > /etc/apt/sources.list.d/sury-php.list
apt-get update -qq
apt-get install -y -qq \
    "php${PHP_VERSION}" "php${PHP_VERSION}-cli" \
    "php${PHP_VERSION}-mbstring" "php${PHP_VERSION}-xml" "php${PHP_VERSION}-curl" \
    "php${PHP_VERSION}-zip" "php${PHP_VERSION}-mysql" "php${PHP_VERSION}-intl" \
    "php${PHP_VERSION}-bcmath" "php${PHP_VERSION}-gd" "php${PHP_VERSION}-opcache"
ok "PHP $(php -r 'echo PHP_VERSION;')"

# ─── 3. Composer ──────────────────────────────────────────────────────────────
log "Installazione Composer..."
curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer --quiet
ok "Composer $(composer --version --no-ansi 2>&1 | head -1)"

# ─── 4. Node.js 22 ────────────────────────────────────────────────────────────
log "Installazione Node.js 22..."
curl -fsSL https://deb.nodesource.com/setup_22.x | bash - > /dev/null 2>&1
apt-get install -y -qq nodejs
ok "Node $(node --version) / npm $(npm --version)"

# ─── 5. MariaDB ───────────────────────────────────────────────────────────────
log "Installazione MariaDB..."
apt-get install -y -qq mariadb-server
systemctl enable mariadb
systemctl start mariadb

mysql -u root << SQL
CREATE DATABASE IF NOT EXISTS \`${MARIADB_DB}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${MARIADB_USER}'@'localhost' IDENTIFIED BY '${MARIADB_PASS}';
GRANT ALL PRIVILEGES ON \`${MARIADB_DB}\`.* TO '${MARIADB_USER}'@'localhost';
FLUSH PRIVILEGES;
SQL

# Salva credenziali per riferimento post-install
cat > /root/.firefly_db_credentials << CREDS
DB_HOST=localhost
DB_DATABASE=${MARIADB_DB}
DB_USERNAME=${MARIADB_USER}
DB_PASSWORD=${MARIADB_PASS}
CREDS
chmod 600 /root/.firefly_db_credentials
ok "MariaDB configurato (credenziali in /root/.firefly_db_credentials)"

# ─── 6. Apache2 con mod_php ───────────────────────────────────────────────────
log "Installazione Apache2..."
apt-get install -y -qq apache2
a2enmod "php${PHP_VERSION}" rewrite headers
a2dissite 000-default.conf 2>/dev/null || true
ok "Apache $(apache2 -v 2>&1 | head -1)"

# ─── 7. Clone repo ────────────────────────────────────────────────────────────
log "Clone repository..."
if [ -d "$APP_DIR/.git" ]; then
    cd "$APP_DIR" && git pull --quiet
else
    git clone --quiet "$REPO_URL" "$APP_DIR"
fi
ok "Repository in $APP_DIR"

# ─── 8. .env ──────────────────────────────────────────────────────────────────
log "Configurazione .env..."
cd "$APP_DIR"
[ ! -f .env ] && cp .env.example .env

set_env() {
    local key="$1" val="$2"
    if grep -q "^${key}=" .env; then
        sed -i "s|^${key}=.*|${key}=${val}|" .env
    else
        echo "${key}=${val}" >> .env
    fi
}

set_env APP_ENV              "local"
set_env APP_DEBUG            "true"
set_env APP_URL              "$APP_URL"
set_env FIREFLY_III_LAYOUT   "v2"
set_env DB_CONNECTION        "mysql"
set_env DB_HOST              "localhost"
set_env DB_PORT              "3306"
set_env DB_DATABASE          "$MARIADB_DB"
set_env DB_USERNAME          "$MARIADB_USER"
set_env DB_PASSWORD          "$MARIADB_PASS"
set_env TRUSTED_PROXIES      "**"
set_env SESSION_DRIVER       "file"
set_env CACHE_DRIVER         "file"
set_env QUEUE_CONNECTION     "sync"
ok ".env configurato"

# ─── 9. Dipendenze PHP ────────────────────────────────────────────────────────
log "Installazione dipendenze PHP (Composer)..."
composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader --quiet
ok "Composer install completato"

# ─── 10. Dipendenze JS + build frontend ───────────────────────────────────────
log "Build frontend Vue 3..."
cd "$APP_DIR/resources/assets/v2"
npm ci --silent
npm run build
ok "Frontend build completato"

# ─── 11. Setup Laravel + Firefly ──────────────────────────────────────────────
log "Setup Laravel e Firefly III..."
cd "$APP_DIR"

php artisan key:generate --no-interaction --quiet

# Comandi Firefly-specifici (come da script community ufficiale)
php artisan firefly:upgrade-database      # migrations + upgrade schema Firefly
php artisan firefly:correct-database      # correzioni dati post-migrazione
php artisan firefly:report-integrity      # check integrità database
php artisan firefly:laravel-passport-keys # genera chiavi OAuth (necessario per API/token)

php artisan storage:link --no-interaction --quiet || true
php artisan config:cache  --quiet
php artisan route:cache   --quiet
php artisan view:cache    --quiet

# Permessi
chown -R www-data:www-data "$APP_DIR/storage" "$APP_DIR/bootstrap/cache"
chmod -R 775 "$APP_DIR/storage" "$APP_DIR/bootstrap/cache"
chown www-data:www-data "$APP_DIR/storage/oauth-"*.key 2>/dev/null || true
ok "Laravel + Firefly III configurato"

# ─── 12. VirtualHost Apache ───────────────────────────────────────────────────
log "Configurazione VirtualHost Apache..."
cat > /etc/apache2/sites-available/firefly-dev.conf << VHOST
<VirtualHost *:80>
    ServerName firefly-dev.homelab.local
    DocumentRoot /opt/firefly/public

    <Directory /opt/firefly/public>
        Options FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    <FilesMatch \\.php\$>
        SetHandler application/x-httpd-php
    </FilesMatch>

    RequestHeader set X-Forwarded-Proto "https"
    RequestHeader set X-Forwarded-Host  "firefly-dev.homelab.local"
    RequestHeader set X-Forwarded-Port  "443"

    ErrorLog  /var/log/apache2/firefly-dev-error.log
    CustomLog /var/log/apache2/firefly-dev-access.log combined
</VirtualHost>
VHOST

a2ensite firefly-dev.conf
systemctl enable apache2
systemctl restart apache2
ok "Apache configurato"

# ─── Fine ──────────────────────────────────────────────────────────────────────
IP=$(hostname -I | awk '{print $1}')
echo ""
echo "┌──────────────────────────────────────────────────────────────────────┐"
echo "│  ✓  Firefly III fork installato con successo                         │"
echo "│                                                                      │"
echo "│  App URL  : $APP_URL                                                 │"
echo "│  IP LXC   : $IP                                                      │"
echo "│  Layout   : v2 (Vue 3 + Tailwind)                                    │"
echo "│  Database : MariaDB — credenziali in /root/.firefly_db_credentials   │"
echo "│                                                                      │"
echo "│  Prossimi step:                                                      │"
echo "│  1. Sul client Fedora:                                               │"
echo "│       echo \"$IP firefly-dev.homelab.local\" >> /etc/hosts           │"
echo "│  2. Copia deploy/traefik-firefly-dev.yml su Traefik:                 │"
echo "│       scp traefik-firefly-dev.yml root@192.168.0.98:/tmp/            │"
echo "│       ssh root@192.168.0.98 'mv /tmp/traefik-firefly-dev.yml         │"
echo "│         /etc/traefik/conf.d/ && rc-service traefik restart'          │"
echo "│  3. Aggiorna l'IP in traefik-firefly-dev.yml con: $IP                │"
echo "│  4. Apri https://firefly-dev.homelab.local e registra il primo utente│"
echo "└──────────────────────────────────────────────────────────────────────┘"
