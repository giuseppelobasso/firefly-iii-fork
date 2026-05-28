# Copilot Instructions for Firefly III

## Build & Run Commands

### PHP (Backend)

```bash
# Install dependencies
composer install

# Run full unit test suite
composer unit-test

# Run full integration test suite
composer integration-test

# Run a single test file
php vendor/bin/phpunit tests/unit/Support/NavigationStartOfPeriodTest.php --no-coverage

# Run a single test method
php vendor/bin/phpunit --filter testMethodName tests/unit/Support/SomeTest.php --no-coverage

# Static analysis (PHPStan level 6)
php vendor/bin/phpstan analyse -c .ci/phpstan.neon

# Linting and formatting (Mago)
php vendor/bin/mago lint
php vendor/bin/mago format

# Laravel artisan shortcuts
php artisan config:cache
php artisan route:clear
php artisan migrate
```

### JavaScript (Frontend v2)

```bash
cd resources/assets/v2
npm install
npm run dev    # Vite dev server
npm run build  # Production build
```

## Architecture

### Repository Pattern

All data access goes through repository interfaces bound via dedicated service providers. Each domain entity has:

- `app/Repositories/{Entity}/{Entity}RepositoryInterface.php` — contract
- `app/Repositories/{Entity}/{Entity}Repository.php` — implementation
- `app/Providers/{Entity}ServiceProvider.php` — IoC binding

Controllers never access Eloquent models directly; they type-hint the interface instead.

### API Layer (V1)

REST API lives in `app/Api/V1/Controllers/` with sub-namespaces (Autocomplete, Chart, Data, Insight, Models, Search, Summary, System, User, Webhook). Routes are defined in `routes/api.php` under the `v1` prefix. API authentication uses Laravel Passport (OAuth2).

### Transformers (Fractal)

API responses are shaped by `app/Transformers/*Transformer.php` classes using `league/fractal`. Each Eloquent model exposed via API has a corresponding transformer.

### Transaction Rules Engine

`app/TransactionRules/` contains a rule engine that auto-processes transactions:
- `Actions/` — concrete actions (SetCategory, AddTag, ConvertToTransfer, etc.)
- `Expressions/` — expression language support (Symfony ExpressionLanguage)
- `Engine/` — rule execution engine
- `Factory/` — factory for building rule/trigger objects

### Frontend (Dual Versions)

- **v1** (`resources/assets/v1/`) — legacy, uses Webpack Mix
- **v2** (`resources/assets/v2/`) — current, uses Vite + Alpine.js + Bootstrap 5 + AdminLTE 4 + Chart.js

Views use Twig (via `rcrowe/twigbridge`) in `resources/views/`.

### Factory Pattern

`app/Factory/` classes handle complex object creation logic (accounts, transactions, journals, etc.) — separate from both controllers and repositories.

## Key Conventions

### PHP Version & Strict Types

Targets **PHP 8.5**. All PHP files must declare `declare(strict_types=1);`.

### Safe Functions

Uses `thecodingmachine/safe` — prefer `\Safe\*` functions (e.g., `Safe\preg_match`, `Safe\json_decode`) over native PHP functions that return `false` on error.

### Enums

Domain enums live in `app/Enums/` (e.g., `AccountTypeEnum`, `TransactionTypeEnum`). Use these instead of string constants.

### Model Binding

Custom route-model binding is handled by `app/Http/Middleware/Binder.php`, configured in `config/bindables.php`.

### Testing

- **Unit tests** (`tests/unit/`) — no database, no HTTP
- **Integration tests** (`tests/integration/`) — uses `RefreshDatabase` trait with SQLite in-memory, seeded automatically
- **Feature tests** (`tests/feature/`) — mostly disabled/WIP
- Tests use PHPUnit 13, Mockery for mocking
- Test files must end with `Test.php`

### Mago Linter Configuration

Configured in `mago.toml`:
- Print width: 160
- Tabs: 4 spaces
- Trailing comma: disabled
- Null type hint style: `Type|null` (null_pipe)
- Class methods: sorted
- Laravel/Symfony/PHPUnit integrations enabled