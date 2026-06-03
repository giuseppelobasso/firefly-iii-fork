#!/bin/bash
# deploy/lxc-setup.sh
# Setup / reinstallazione pulita — Firefly III fork (LXC Debian 12)
# Target: firefly-dev.homelab.local
#
# Uso — prima installazione:
#   pct push <CTID> deploy/lxc-setup.sh /root/lxc-setup.sh
#   ssh root@<LXC-IP> bash /root/lxc-setup.sh
#
# Uso — reinstallazione pulita (azzera DB e app, riparte da zero):
#   ssh root@<LXC-IP> bash /root/lxc-setup.sh --reinstall
#
# Flag disponibili:
#   --reinstall   Cancella APP_DIR e DB, poi reinstalla tutto da capo
#   --no-build    Salta npm install + vite build (utile se vuoi buildare a mano)
#   --pull-only   Solo git pull + composer + artisan migrations, niente reinstall infrastruttura

set -euo pipefail

# Auto-fix CRLF (file creato su Windows): re-esegue se stesso dopo la pulizia
[[ "$(cat "$0")" == *$'\r'* ]] && { sed -i 's/\r//' "$0"; exec bash "$0" "$@"; }

# ─── Configurazione ──────────────────────────────────────────────────────────
REPO_URL="https://github.com/giuseppelobasso/firefly-iii-fork.git"  # <-- cambia con il tuo fork
APP_DIR="/opt/firefly"
APP_URL="https://firefly-dev.homelab.local"
PHP_VERSION="8.5"
MARIADB_DB="firefly"
MARIADB_USER="firefly"
# In reinstall la password viene letta da /root/.firefly_db_credentials se esiste
MARIADB_PASS="$(openssl rand -base64 20 | tr -d '/+=')"

log() { echo -e "\n\033[1;34m>>> $1\033[0m"; }
ok()  { echo -e "\033[1;32m✓ $1\033[0m"; }
warn(){ echo -e "\033[1;33m! $1\033[0m"; }
err() { echo -e "\033[1;31m✗ $1\033[0m" >&2; exit 1; }

# ─── Parsing flag ────────────────────────────────────────────────────────────
DO_REINSTALL=false
DO_BUILD=true
PULL_ONLY=false

for arg in "$@"; do
    case "$arg" in
        --reinstall)  DO_REINSTALL=true  ;;
        --no-build)   DO_BUILD=false     ;;
        --pull-only)  PULL_ONLY=true     ;;
        *) warn "Flag non riconosciuto: $arg" ;;
    esac
done

# ─── Modalità pull-only: aggiornamento rapido senza reinstall infrastruttura ─
if [ "$PULL_ONLY" = true ]; then
    log "[pull-only] git pull + composer + migrations"
    cd "$APP_DIR"
    git pull --quiet
    composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader --quiet
    php artisan firefly:upgrade-database
    php artisan config:cache --quiet
    php artisan route:cache  --quiet
    php artisan view:cache   --quiet
    chown -R www-data:www-data "$APP_DIR/storage" "$APP_DIR/bootstrap/cache"
    ok "[pull-only] completato"
    exit 0
fi

# ─── Modalità reinstall: azzera DB e directory app ───────────────────────────
if [ "$DO_REINSTALL" = true ]; then
    log "[reinstall] Pulizia installazione precedente..."

    # Riutilizza la stessa password se disponibile (evita di cambiare credenziali)
    if [ -f /root/.firefly_db_credentials ]; then
        SAVED_PASS="$(grep '^DB_PASSWORD=' /root/.firefly_db_credentials | cut -d= -f2)"
        if [ -n "$SAVED_PASS" ]; then
            MARIADB_PASS="$SAVED_PASS"
            warn "Riutilizzo password DB esistente da /root/.firefly_db_credentials"
        fi
    fi

    # Drop + ricrea DB
    mysql -u root << SQL
DROP DATABASE IF EXISTS \`${MARIADB_DB}\`;
CREATE DATABASE \`${MARIADB_DB}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${MARIADB_USER}'@'localhost' IDENTIFIED BY '${MARIADB_PASS}';
GRANT ALL PRIVILEGES ON \`${MARIADB_DB}\`.* TO '${MARIADB_USER}'@'localhost';
FLUSH PRIVILEGES;
SQL
    ok "Database ${MARIADB_DB} ricreato"

    # Rimuovi directory app (preserva backup se esiste)
    if [ -d "$APP_DIR" ]; then
        rm -rf "$APP_DIR"
        ok "$APP_DIR eliminato"
    fi

    # Rimuovi vhost Apache
    a2dissite firefly-dev.conf 2>/dev/null || true
    rm -f /etc/apache2/sites-available/firefly-dev.conf
    ok "VirtualHost Apache rimosso (verrà ricreato)"
fi

# ─── 1. Sistema base ───────────────────────────────────────────────────────────
log "Aggiornamento sistema..."
apt-get update -qq && apt-get upgrade -y -qq
apt-get install -y -qq \
    curl wget git unzip gnupg2 lsb-release ca-certificates \
    apt-transport-https openssl
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
    "php${PHP_VERSION}-bcmath" "php${PHP_VERSION}-gd"
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

# In --reinstall il DB è già stato ricreato sopra; qui gestiamo solo first-install
if [ "$DO_REINSTALL" = false ]; then
    mysql -u root << SQL
CREATE DATABASE IF NOT EXISTS \`${MARIADB_DB}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${MARIADB_USER}'@'localhost' IDENTIFIED BY '${MARIADB_PASS}';
GRANT ALL PRIVILEGES ON \`${MARIADB_DB}\`.* TO '${MARIADB_USER}'@'localhost';
FLUSH PRIVILEGES;
SQL
fi

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
    ok "Repository aggiornato (git pull)"
else
    git clone --quiet "$REPO_URL" "$APP_DIR"
    ok "Repository clonato in $APP_DIR"
fi

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
composer update --no-dev --no-interaction --prefer-dist --optimize-autoloader --quiet
ok "Composer install completato"

# ─── 10. Dipendenze JS + build frontend ───────────────────────────────────────
if [ "$DO_BUILD" = true ]; then
    log "Build frontend Vue 3..."
    cd "$APP_DIR"
    npm install
    node_modules/.bin/vite build --config resources/assets/v2/vite.config.js --emptyOutDir
    ok "Frontend build completato"
else
    warn "--no-build: skip npm install e vite build. Assicurati che public/build/v2/ esista."
fi

# ─── 11. Setup Laravel + Firefly ──────────────────────────────────────────────
log "Setup Laravel e Firefly III..."
cd "$APP_DIR"

# Permessi storage prima degli artisan (evita log owned da root)
chown -R www-data:www-data "$APP_DIR/storage" "$APP_DIR/bootstrap/cache"
chmod -R 775 "$APP_DIR/storage" "$APP_DIR/bootstrap/cache"

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

# Genera i18n JSON per il frontend v2 (i18next li carica da public/v2/i18n/)
mkdir -p "$APP_DIR/public/v2/i18n"
php -r "
\$out = [];
foreach (glob('resources/locales/en_US/*.json') as \$f) {
    \$data = json_decode(file_get_contents(\$f), true);
    if (is_array(\$data)) \$out = array_merge(\$out, \$data);
}
file_put_contents('public/v2/i18n/en.json', json_encode(\$out, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
"

# Ripristina permessi (artisan può creare file come root durante le run)
chown -R www-data:www-data "$APP_DIR/storage" "$APP_DIR/bootstrap/cache"
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
