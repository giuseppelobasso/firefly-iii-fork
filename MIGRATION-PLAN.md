# Piano Migrazione v2 — Firefly III Fork

## Obiettivo
Completare il frontend Vue 3 con un **custom design system viola/premium** e rimuovere tutto v1.

---

## Stato attuale v2

### Già implementato (router + views + stores + API client)
- ✅ Dashboard (grafici, summary, card conti)
- ✅ Accounts (list, show, create, edit, delete)
- ✅ Transactions (list, show, create, edit, search, bulk)
- ✅ Budgets (list con progress bar, limits, period)
- ✅ Categories (list)
- ✅ Tags (list)
- ✅ Subscriptions/Bills (list)
- ✅ Piggy Banks (list)
- ✅ Reports (placeholder)
- ✅ Profile (placeholder)
- ✅ API client completo (accounts, transactions, budgets, categories, tags, bills, piggy-banks, currencies, preferences, charts, insight, autocomplete, search)

### Mancante / da completare
- ❌ **Design system custom** (attualmente: design generico con CSS variables blu)
- ❌ **CRUD completo** per: Bills, Categories, Tags, Piggy Banks, Reports
- ❌ **Rules** (nessuna view, nessuno store, nessun API nel client)
- ❌ **Recurring Transactions** (nessuna view, nessuno store)
- ❌ **Settings/Preferences** (view placeholder)
- ❌ **Profile** (view placeholder)
- ❌ **Admin** (users, currencies management)
- ❌ **Grafici/Report dettagliati** (solo overview nel dashboard)

---

## Design System: "Amethyst"

### Filosofia
Finance app moderna tipo **Mercury Bank** / **Copilot Money**: clean, premium, data-dense.
Viola come accent (#7c3aed primary), sfondo scuro di default, tipografia system-ui con pesi netti.

### Palette

```css
/* Amethyst Design Tokens */
:root {
    /* Primary (viola) */
    --ff-primary-50: #faf5ff;
    --ff-primary-100: #f3e8ff;
    --ff-primary-200: #e9d5ff;
    --ff-primary-300: #d8b4fe;
    --ff-primary-400: #c084fc;
    --ff-primary-500: #a855f7;
    --ff-primary-600: #9333ea;
    --ff-primary-700: #7c3aed;
    --ff-primary-800: #6b21a8;
    --ff-primary-900: #581c87;

    /* Semantic */
    --ff-positive: #10b981;    /* verde emerald — income/guadagno */
    --ff-negative: #ef4444;    /* rosso — spese/over-budget */
    --ff-warning: #f59e0b;     /* amber — warning/vicino al limite */
    --ff-info: #6366f1;        /* indigo — info/neutrale */

    /* Superfici (dark-first) */
    --ff-bg: #09090b;          /* zinc-950 */
    --ff-surface-1: #18181b;   /* zinc-900 — card base */
    --ff-surface-2: #27272a;   /* zinc-800 — card elevated */
    --ff-surface-3: #3f3f46;   /* zinc-700 — hover */
    --ff-border: #3f3f46;      /* zinc-700 */
    --ff-border-subtle: #27272a;

    /* Testo */
    --ff-text: #fafafa;        /* zinc-50 */
    --ff-text-muted: #a1a1aa;  /* zinc-400 */
    --ff-text-subtle: #71717a; /* zinc-500 */

    /* Sidebar */
    --ff-sidebar-bg: #09090b;
    --ff-sidebar-width: 260px;
    --ff-topbar-height: 56px;
}

/* Light mode (toggle via .light class o preferenza utente) */
.light {
    --ff-bg: #fafafa;
    --ff-surface-1: #ffffff;
    --ff-surface-2: #f4f4f5;
    --ff-surface-3: #e4e4e7;
    --ff-border: #e4e4e7;
    --ff-border-subtle: #f4f4f5;
    --ff-text: #09090b;
    --ff-text-muted: #52525b;
    --ff-text-subtle: #a1a1aa;
    --ff-sidebar-bg: #ffffff;
}
```

### Tipografia
- Font: `Inter` (già presente) con weight 400/500/600/700
- Mono: `JetBrains Mono` per importi e numeri
- Sizing: 13px body, 11px label, 24px h1, 18px h2

### Componenti UI base da creare
| Componente | File | Descrizione |
|---|---|---|
| `FfCard.vue` | `components/ui/FfCard.vue` | Card con header/body/footer, variante elevated |
| `FfButton.vue` | `components/ui/FfButton.vue` | Primary/secondary/danger/ghost, icon slot |
| `FfInput.vue` | `components/ui/FfInput.vue` | Text input con label, error, icon |
| `FfSelect.vue` | `components/ui/FfSelect.vue` | Dropdown con search (per autocomplete) |
| `FfModal.vue` | `components/ui/FfModal.vue` | Modal dialog (create/edit/confirm delete) |
| `FfTable.vue` | `components/ui/FfTable.vue` | Data table sortable con pagination |
| `FfBadge.vue` | `components/ui/FfBadge.vue` | Badge per status, tipo, colore |
| `FfProgress.vue` | `components/ui/FfProgress.vue` | Progress bar (budget usage) |
| `FfEmptyState.vue` | `components/ui/FfEmptyState.vue` | Empty state con icon + CTA |
| `FfDatePicker.vue` | `components/ui/FfDatePicker.vue` | Date range picker |
| `FfMoneyInput.vue` | `components/ui/FfMoneyInput.vue` | Input importo con currency symbol |
| `FfToast.vue` | `components/ui/FfToast.vue` | Notifiche toast (success/error) |

---

## Fasi di esecuzione

---

### FASE 0: Pulizia (prerequisito)

**Obiettivo:** Rimuovere sorgenti v1, file inutili, pulire workspace.

**Azioni:**
1. Eliminare `resources/assets/v1/` (96 file sorgente — i compilati in `public/v1/` restano)
2. Eliminare file root inutili: `Procfile`, `nginx_app.conf`, `crowdin.yml`, `sonar-project.properties`
3. Verificare che il build v2 funzioni ancora (`npm install && npm run build` dal root)

**Verifica:** `node_modules/.bin/vite build --config resources/assets/v2/vite.config.js --emptyOutDir` → exit 0

---

### FASE 1: Design System "Amethyst"

**Obiettivo:** Riscrivere `app.css` con i nuovi token + creare i 12 componenti UI base.

**File da modificare:**
- `resources/assets/v2/src/css/app.css` — Sostituire TUTTO con nuovi design tokens (vedi palette sopra) + utility classes + base styling

**File da creare (12 componenti):**
- `resources/assets/v2/src/components/ui/FfCard.vue`
- `resources/assets/v2/src/components/ui/FfButton.vue`
- `resources/assets/v2/src/components/ui/FfInput.vue`
- `resources/assets/v2/src/components/ui/FfSelect.vue`
- `resources/assets/v2/src/components/ui/FfModal.vue`
- `resources/assets/v2/src/components/ui/FfTable.vue`
- `resources/assets/v2/src/components/ui/FfBadge.vue`
- `resources/assets/v2/src/components/ui/FfProgress.vue`
- `resources/assets/v2/src/components/ui/FfEmptyState.vue`
- `resources/assets/v2/src/components/ui/FfDatePicker.vue`
- `resources/assets/v2/src/components/ui/FfMoneyInput.vue`
- `resources/assets/v2/src/components/ui/FfToast.vue`

**File da modificare (layout):**
- `resources/assets/v2/src/components/layout/AppSidebar.vue` — Nuovo look: sfondo zinc-950, accent viola, icone FontAwesome, nav items con hover viola
- `resources/assets/v2/src/components/layout/AppTopbar.vue` — Minimal: search bar, dark/light toggle, user menu
- `resources/assets/v2/src/App.vue` — Wrapper layout con sidebar + topbar + `<router-view>`

**Specifiche per ogni componente:**

#### FfCard.vue
```vue
<script setup lang="ts">
defineProps<{
  title?: string
  subtitle?: string
  elevated?: boolean
  noPadding?: boolean
}>()
</script>
```
- Sfondo `--ff-surface-1`, bordo `--ff-border`, border-radius 12px
- Variante `elevated`: surface-2 + box-shadow subtle
- Slot: `header`, `default`, `footer`

#### FfButton.vue
```vue
<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  icon?: string  // FontAwesome class
}>()
defineEmits<{ click: [e: MouseEvent] }>()
```
- Primary: bg viola-700, hover viola-600, testo bianco
- Secondary: bg surface-2, border, testo text-muted
- Danger: bg red-600, hover red-500
- Ghost: solo testo viola, hover surface-2

#### FfTable.vue
```vue
<script setup lang="ts">
defineProps<{
  columns: Array<{ key: string; label: string; sortable?: boolean; align?: 'left'|'right'; format?: 'money'|'date' }>
  rows: Array<Record<string, unknown>>
  loading?: boolean
  emptyMessage?: string
}>()
defineEmits<{ 'row-click': [row: Record<string, unknown>] }>()
```
- Header: testo muted, font-weight 500, uppercase 11px
- Righe: hover surface-2, border-bottom border-subtle
- Colonne money: JetBrains Mono, allineate a destra
- Sorting: click su header, freccia su/giù

#### FfModal.vue
```vue
<script setup lang="ts">
defineProps<{
  open: boolean
  title: string
  size?: 'sm' | 'md' | 'lg'
}>()
defineEmits<{ close: [] }>()
```
- Overlay backdrop-blur-sm + bg nero/60%
- Card centrata, max-width basata su size
- Slot: `default` (body), `footer` (actions)
- Chiudi con Escape e click overlay

#### FfProgress.vue
```vue
<script setup lang="ts">
defineProps<{
  value: number     // 0-100
  max?: number      // label "di X"
  color?: 'primary' | 'positive' | 'warning' | 'negative' | 'auto'
  showLabel?: boolean
}>()
```
- `auto`: verde <80%, amber 80-99%, rosso >=100%
- Barra: bg surface-3, fill con border-radius, animazione width

---

### FASE 2: Modulo Bills/Subscriptions (CRUD completo)

**Obiettivo:** View completa con list, show, create, edit, delete per le sottoscrizioni.

**Store da creare:**
- `resources/assets/v2/src/stores/bills.js`

**Azioni store:**
- `load()` — fetch lista bills con parametri date
- `show(id)` — fetch singolo bill
- `store(data)` — crea
- `update(id, data)` — modifica
- `destroy(id)` — elimina

**Views da riscrivere:**
- `resources/assets/v2/src/views/SubscriptionsView.vue` — Lista con FfTable: nome, importo min/max, frequenza, prossima scadenza, status (paid/unpaid). Badge per "due soon", "overdue". Azione: create, edit inline, delete con conferma.

**Route da aggiungere al router:**
```js
{ path: '/subscriptions/create', name: 'subscriptions.create', component: () => import('../views/SubscriptionCreateView.vue') },
{ path: '/subscriptions/:id', name: 'subscriptions.show', component: () => import('../views/SubscriptionShowView.vue') },
{ path: '/subscriptions/:id/edit', name: 'subscriptions.edit', component: () => import('../views/SubscriptionEditView.vue') },
```

**Views da creare:**
- `SubscriptionCreateView.vue` — Form: name, amount_min, amount_max, date, repeat_freq, skip, group, notes. Usa FfInput, FfMoneyInput, FfSelect, FfDatePicker.
- `SubscriptionShowView.vue` — Dettaglio: info bill + lista transazioni associate (usa API `bills.transactions(id)`)
- `SubscriptionEditView.vue` — Come create ma precompilato

**Campi API bill (da `GET /api/v1/bills/{id}`):**
```json
{
  "name": "Netflix",
  "amount_min": "13.99",
  "amount_max": "17.99",
  "date": "2024-01-15",
  "repeat_freq": "monthly",
  "skip": 0,
  "active": true,
  "notes": "...",
  "next_expected_match": "2026-07-15",
  "pay_dates": [...],
  "paid_dates": [...]
}
```

---

### FASE 3: Modulo Categories (CRUD + insight)

**Store da creare:**
- `resources/assets/v2/src/stores/categories.js` (esiste ma verificare che sia completo)

**Views da riscrivere:**
- `CategoriesView.vue` — Griglia/lista: nome, spending mensile (da insight API), numero transazioni. Click → show.

**Views da creare:**
- `CategoryCreateView.vue` — Form: name, notes
- `CategoryShowView.vue` — Dettaglio: chart spending nel tempo (LineChart) + tabella transazioni della categoria

**Route da aggiungere:**
```js
{ path: '/categories/create', name: 'categories.create', ... },
{ path: '/categories/:id', name: 'categories.show', ... },
{ path: '/categories/:id/edit', name: 'categories.edit', ... },
```

**Dati insight:** `GET /api/v1/insight/expense/category?start=X&end=Y` → array con amount per categoria

---

### FASE 4: Modulo Tags (CRUD + cloud)

**Store da creare:**
- `resources/assets/v2/src/stores/tags.js`

**Views da riscrivere:**
- `TagsView.vue` — Cloud di tag (dimensione proporzionale all'uso) + lista ordinabile. Click → show.

**Views da creare:**
- `TagCreateView.vue` — Form: tag name, date (opzionale), location (opzionale)
- `TagShowView.vue` — Transazioni con questo tag + chart

**Route da aggiungere:**
```js
{ path: '/tags/create', name: 'tags.create', ... },
{ path: '/tags/:id', name: 'tags.show', ... },
{ path: '/tags/:id/edit', name: 'tags.edit', ... },
```

---

### FASE 5: Modulo Rules (NUOVO — da zero)

**API client da aggiungere a `client.js`:**
```js
// Endpoint verificati da routes/api.php (v1/rules, v1/rule-groups)
export const rules = {
    list: (params = {}) => http.get('/rules', {params}),
    show: (id) => http.get(`/rules/${id}`),
    store: (data) => http.post('/rules', data),
    update: (id, data) => http.put(`/rules/${id}`, data),
    destroy: (id) => http.delete(`/rules/${id}`),
    test: (id, params = {}) => http.get(`/rules/${id}/test`, {params}),
    trigger: (id) => http.post(`/rules/${id}/trigger`),
    validateExpression: (params = {}) => http.get('/rules/validate-expression', {params}),
    // NOTA: /rule-triggers e /rule-actions NON esistono come endpoint.
    // I tipi trigger/action disponibili vanno hardcodati nel frontend
    // (elenco da app/Enums/ o dalla documentazione API Firefly III).
};

export const ruleGroups = {
    list: (params = {}) => http.get('/rule-groups', {params}),
    show: (id) => http.get(`/rule-groups/${id}`),
    store: (data) => http.post('/rule-groups', data),
    update: (id, data) => http.put(`/rule-groups/${id}`, data),
    destroy: (id) => http.delete(`/rule-groups/${id}`),
    rules: (id, params = {}) => http.get(`/rule-groups/${id}/rules`, {params}),
    test: (id, params = {}) => http.get(`/rule-groups/${id}/test`, {params}),
    trigger: (id) => http.post(`/rule-groups/${id}/trigger`),
    // NOTA: moveUp/moveDown non esistono come endpoint API.
    // L'ordine va gestito via update() con campo 'order'.
};
```

**Store da creare:**
- `resources/assets/v2/src/stores/rules.js`

**Views da creare:**
- `RulesView.vue` — Gruppi di regole (accordion), drag-and-drop per riordino, toggle attivo/inattivo
- `RuleCreateView.vue` — Form con:
  - Triggers (condizioni): tipo trigger (dropdown da API), valore, stop_processing
  - Actions: tipo azione (dropdown da API), valore
  - Drag-and-drop per riordino trigger/actions
- `RuleShowView.vue` — Dettaglio regola + bottone "Test" che mostra transazioni che matchano
- `RuleEditView.vue` — Come create ma precompilato

**Route da aggiungere:**
```js
{ path: '/rules', name: 'rules', ... },
{ path: '/rules/create', name: 'rules.create', ... },
{ path: '/rules/:id', name: 'rules.show', ... },
{ path: '/rules/:id/edit', name: 'rules.edit', ... },
```

**Complessità:** ALTA — il form trigger/action è il più complesso dell'app (tipo e valore dinamici, array variabile).

---

### FASE 6: Modulo Recurring Transactions (NUOVO — da zero)

**API client da aggiungere a `client.js`:**
```js
export const recurring = {
    list: (params = {}) => http.get('/recurrences', {params}),
    show: (id) => http.get(`/recurrences/${id}`),
    store: (data) => http.post('/recurrences', data),
    update: (id, data) => http.put(`/recurrences/${id}`, data),
    destroy: (id) => http.delete(`/recurrences/${id}`),
    transactions: (id, params = {}) => http.get(`/recurrences/${id}/transactions`, {params}),
};
```

**Store da creare:**
- `resources/assets/v2/src/stores/recurring.js`

**Views da creare:**
- `RecurringView.vue` — Lista: nome, importo, frequenza, prossima occorrenza, ultima creazione, stato attivo
- `RecurringCreateView.vue` — Form: tipo (withdrawal/deposit/transfer), account source/dest, amount, description, repeat_freq (daily/weekly/monthly/yearly), first_date, end_date, repetitions, skip, tags, budget, category, piggy_bank
- `RecurringShowView.vue` — Dettaglio + transazioni generate
- `RecurringEditView.vue`

**Route da aggiungere:**
```js
{ path: '/recurring', name: 'recurring', ... },
{ path: '/recurring/create', name: 'recurring.create', ... },
{ path: '/recurring/:id', name: 'recurring.show', ... },
{ path: '/recurring/:id/edit', name: 'recurring.edit', ... },
```

---

### FASE 7: Modulo Reports (grafici avanzati)

**Obiettivo:** Pagina reports con grafici interattivi (già c'è Chart.js).

**Views da riscrivere:**
- `ReportsView.vue` — Selector: tipo report, date range, account/budget/category filter

**Componenti chart da creare:**
- `components/charts/ExpenseChart.vue` — Spese per categoria (doughnut)
- `components/charts/IncomeExpenseChart.vue` — Income vs Expense per mese (bar stacked)
- `components/charts/BudgetChart.vue` — Budget usage heatmap / progress multiplo
- `components/charts/NetWorthChart.vue` — Line chart patrimonio netto nel tempo

**Dati API:**
- `GET /api/v1/insight/expense/category?start=X&end=Y`
- `GET /api/v1/insight/income/category?start=X&end=Y`
- `GET /api/v1/chart/account/overview?start=X&end=Y`
- `GET /api/v1/chart/budget/overview?start=X&end=Y`
- `GET /api/v1/summary/basic?start=X&end=Y`

---

### FASE 8: Profile & Settings

**Views da riscrivere:**
- `ProfileView.vue` — Sezioni: info personali, cambia password, 2FA, API tokens (Personal Access Tokens), preferenze UI

**Preferenze UI da gestire:**
- Dark/Light mode (già c'è lo store)
- Lingua
- Currency default
- Date range default (period)

---

### FASE 9: Rimozione v1

**Prerequisito:** TUTTE le fasi 1-8 completate e testate con dati reali.

**⚠️ Route server-side da NON rimuovere MAI** (non sostituibili da SPA):
- Login/Register/Password reset (`/login`, `/register`, `/password/*`) — Blade server-rendered
- OAuth management (`/oauth/*`) — Laravel Passport, richiede server-side
- 2FA (`/two-factor/*`) — flow pre-autenticazione
- Installer (`/install/*`) — setup iniziale
- Health check (`/health`) — probe infrastruttura
- Logout (`/logout`) — POST server-side
- Catch-all SPA (`/{any}`) — resta, è il mount point Vue 3

**Azioni:**
1. Rimuovere `public/v1/` (256 file compilati)
2. Rimuovere `resources/views/**/*.twig` (265 file) — **ma conservare** le Blade in `resources/views/layout/v2/`, `resources/views/auth/`, `resources/views/errors/`, `resources/views/install/`, `resources/views/v2/`
3. Rimuovere `config/twigbridge.php`
4. Rimuovere `app/Support/Twig/` (5 file di estensioni Twig custom)
5. Rimuovere `rcrowe/twigbridge` da composer.json + `composer update`
6. In `routes/web.php`:
   - **Tenere**: route pre-auth (login, register, password, 2FA, OAuth, health, logout, installer)
   - **Tenere**: catch-all SPA (riga 1473)
   - **Rimuovere**: route Twig-only dentro `user-full-auth` group (accounts, bills, budgets, categories, tags, rules, recurring, webhooks, reports, preferences, profile, admin, chart, json, popup, export, attachments, piggy-banks, currencies, exchange-rates, object-groups, search)
   - **Verificare**: ogni route rimossa ha un equivalente nel router Vue 3 (`src/router/index.js`)
7. Rimuovere controller Twig-only — **solo dopo** aver verificato che il controller non è usato anche dall'API o da route Blade rimaste. Verificare con `grep -r 'ClassName' routes/ app/Providers/`
8. Rimuovere `config/view.php` path Twig
9. Rimuovere AdminLTE + Bootstrap da `resources/assets/v2/package.json` (ora safe)
10. Riscrivere `resources/assets/v2/src/sass/app.scss` — rimuovere `@use "admin-lte"`, tenere solo FontAwesome
11. Smoke test obbligatorio:
    - `npm install && npm run build` → exit 0
    - Login page funziona (server-rendered Blade)
    - Register page funziona
    - Dashboard v2 carica dopo login
    - Ogni route del router Vue 3 è raggiungibile
    - API `/api/v1/about/user` risponde 200 (autenticati)

---

## Convenzioni per Sonnet

### Pattern Vue 3 (dalla skill)
- **Usare `<script setup>`** — il progetto è JS-first (main.js, router/index.js, tutti gli store). NON migrare a TypeScript durante questa fase.
- `defineProps({...})` con oggetti (stile JS), oppure `defineProps<{}>()` solo se il file è già .ts/.vue con lang="ts"
- `defineEmits([...])` con array di stringhe (stile JS)
- `shallowRef` dove deep reactivity non serve
- Composables in `src/composables/` per logica riutilizzabile
- **Nota**: migrazione a TypeScript è un progetto separato futuro — non mescolare JS e TS nello stesso modulo

### Pattern Pinia Store
```js
import { defineStore } from 'pinia';
import { entity as api } from '../api/client.js';

export const useEntityStore = defineStore('entity', {
    state: () => ({ list: [], current: null, loading: false, error: null }),
    actions: {
        async load(params = {}) { /* ... */ },
        async show(id) { /* ... */ },
        async store(data) { /* ... */ },
        async update(id, data) { /* ... */ },
        async destroy(id) { /* ... */ },
    },
});
```

### Pattern View CRUD
Ogni modulo segue lo schema:
1. `XxxView.vue` — Lista (FfTable o card grid) + bottone "+ Nuovo"
2. `XxxCreateView.vue` — Form in FfCard, submit → store → redirect a lista
3. `XxxShowView.vue` — Dettaglio entity + dati correlati (transazioni, chart)
4. `XxxEditView.vue` — Come create, precompilato da API

### Stile CSS
- Usare design tokens `var(--ff-xxx)` per tutto
- Classi utility Tailwind per spacing/flex/grid
- Classi personalizzate `ff-*` (ff-card, ff-btn, etc.) come fallback
- Importi sempre in `font-family: 'JetBrains Mono', monospace`
- Responsive: mobile-first, breakpoint `md:` a 768px

### Gerarchia import
```js
// 1. Vue/librerie
import { ref, computed, onMounted } from 'vue';
// 2. Stores
import { useXxxStore } from '../stores/xxx.js';
// 3. Componenti UI
import FfCard from '../components/ui/FfCard.vue';
// 4. Composables/utilities
import formatMoney from '../util/format-money.js';
```

---

## Ordine di esecuzione consigliato

```
FASE 0 (30 min)  → Pulizia
FASE 1 (2-3 ore) → Design System + 12 componenti UI
FASE 2 (1-2 ore) → Bills/Subscriptions CRUD
FASE 3 (1 ora)   → Categories CRUD + insight
FASE 4 (1 ora)   → Tags CRUD + cloud
FASE 5 (3-4 ore) → Rules (complesso: form dinamico)
FASE 6 (2 ore)   → Recurring Transactions
FASE 7 (2-3 ore) → Reports con grafici
FASE 8 (1 ora)   → Profile & Settings
FASE 9 (1 ora)   → Rimozione v1
```

**Totale stimato per Sonnet: ~15-18 ore di esecuzione in sessioni.**

---

## Note per Sonnet

1. **Non toccare** `app/`, `routes/`, `config/`, `database/` — il backend Laravel resta invariato
2. **L'API esiste già** — tutti gli endpoint sono attivi, basta consumarli dal frontend
3. **Testare con `npm run build`** dopo ogni fase — il build deve passare
4. **Font JetBrains Mono** — aggiungere in `index.html` o importare da Google Fonts nel CSS
5. **AdminLTE e Bootstrap** — restano nel package.json fino alla FASE 9. Il file `app.scss` (usato dalla login page Blade) importa AdminLTE: rimuoverlo prima causerebbe build rotto o login senza stile. Il design system Amethyst si applica SOLO dentro la SPA Vue 3 (via `app.css`), NON sovrascrive `app.scss`.
6. **SCSS (`app.scss`)** — NON modificare fino alla FASE 9. Serve per le pagine Blade server-rendered (login, register, error, install). Il nuovo design system vive in `app.css` (Tailwind + design tokens).
7. **Lockfile** — Il `package-lock.json` è stato eliminato (era incoerente col workspace aggiornato). Al prossimo `npm install` sul container LXC verrà rigenerato automaticamente. Non committare il vecchio.
8. **JS-first** — Non usare TypeScript. Il codebase è interamente JavaScript. Nuovi file `.vue` usano `<script setup>` senza `lang="ts"`.
