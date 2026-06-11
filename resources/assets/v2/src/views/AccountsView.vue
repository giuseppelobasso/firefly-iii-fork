<template>
    <div class="view">
        <!-- Header -->
        <div class="view-header">
            <div class="view-header-left">
                <h1 class="view-title">
                    <i :class="typeIcon"></i>
                    {{ typeLabel }} accounts
                </h1>
            </div>
            <div class="view-header-right">
                <button class="ff-btn ff-btn-primary" @click="showCreate = true">
                    <i class="fa-solid fa-plus"></i> New account
                </button>
            </div>
        </div>

        <!-- Notifications -->
        <NotificationBar :error="notif.error.value" :success="notif.success.value" @close="notif.clear()" />

        <!-- Create account modal -->
        <div v-if="showCreate" class="ff-modal-backdrop" @click.self="showCreate = false">
            <div class="ff-modal">
                <h2 class="ff-modal-title">New {{ typeLabel }} account</h2>
                <form @submit.prevent="createAccount">
                    <div class="form-row">
                        <label class="form-label">Name *</label>
                        <input v-model="newAccount.name" class="ff-input" placeholder="Account name" required />
                    </div>
                    <div class="form-row">
                        <label class="form-label">IBAN</label>
                        <input v-model="newAccount.iban" class="ff-input" placeholder="IBAN (optional)" />
                    </div>
                    <div class="form-row">
                        <label class="form-label">Opening balance</label>
                        <input v-model="newAccount.opening_balance" type="number" step="0.01" class="ff-input" placeholder="0.00" />
                    </div>
                    <div class="ff-modal-actions">
                        <button type="button" class="ff-btn ff-btn-secondary" @click="showCreate = false">Cancel</button>
                        <button type="submit" class="ff-btn ff-btn-primary" :disabled="creating">
                            <i v-if="creating" class="fa-solid fa-spinner fa-spin"></i>
                            Create
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Table -->
        <div class="ff-card">
            <div v-if="store.loading" class="view-loading">
                <i class="fa-solid fa-spinner fa-spin"></i> Loading…
            </div>
            <div v-else-if="store.error" class="view-error">{{ store.error }}</div>
            <table v-else class="ff-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>IBAN</th>
                        <th>Balance</th>
                        <th>Currency</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="acc in store.list" :key="acc.id">
                        <td>
                            <span class="ff-link">
                                {{ acc.attributes?.name }}
                            </span>
                        </td>
                        <td class="text-muted">{{ acc.attributes?.iban ?? '—' }}</td>
                        <td :class="balanceClass(acc)">
                            {{ formatMoney(acc.attributes?.current_balance, acc.attributes?.currency_code) }}
                        </td>
                        <td>{{ acc.attributes?.currency_code }}</td>
                        <td class="actions-cell">
                            <button class="icon-btn" title="Delete" @click="confirmDelete(acc)">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                    <tr v-if="!store.list.length">
                        <td colspan="5" class="empty-row">No accounts found.</td>
                    </tr>
                </tbody>
            </table>

            <PaginationBar
                :page="store.page"
                :total-pages="store.totalPages"
                :total="store.total"
                @prev="changePage(store.page - 1)"
                @next="changePage(store.page + 1)"
                @goto="changePage"
            />
        </div>
    </div>
</template>

<script setup>
import {computed, ref, onMounted, watch} from 'vue';
import {useRoute, RouterLink} from 'vue-router';
import {useAccountsStore} from '../stores/accounts.js';
import {useNotifications} from '../composables/useNotifications.js';
import formatMoney from '../util/format-money.js';
import PaginationBar from '../components/ui/PaginationBar.vue';
import NotificationBar from '../components/ui/NotificationBar.vue';

const route = useRoute();
const store = useAccountsStore();
const notif = useNotifications();
const showCreate = ref(false);
const creating = ref(false);
const newAccount = ref({name: '', iban: '', opening_balance: ''});

async function createAccount() {
    creating.value = true;
    try {
        await store.store({
            name: newAccount.value.name,
            type: route.params.type === 'liabilities' ? 'liability' : route.params.type,
            iban: newAccount.value.iban || null,
            opening_balance: newAccount.value.opening_balance || '0',
            opening_balance_date: new Date().toISOString().slice(0, 10),
            currency_code: 'EUR',
        });
        notif.showSuccess(`Account "${newAccount.value.name}" created.`);
        showCreate.value = false;
        newAccount.value = {name: '', iban: '', opening_balance: ''};
    } catch (e) {
        notif.showError(e.response?.data?.message ?? e.message);
    } finally {
        creating.value = false;
    }
}

const TYPES = {
    asset: {label: 'Asset', icon: 'fa-solid fa-wallet'},
    expense: {label: 'Expense', icon: 'fa-solid fa-receipt'},
    revenue: {label: 'Revenue', icon: 'fa-solid fa-arrow-trend-up'},
    liabilities: {label: 'Liabilities', icon: 'fa-solid fa-hand-holding-dollar'},
};

const typeLabel = computed(() => TYPES[route.params.type]?.label ?? route.params.type);
const typeIcon = computed(() => TYPES[route.params.type]?.icon ?? 'fa-solid fa-building-columns');

function balanceClass(acc) {
    const b = acc.attributes?.current_balance ?? 0;
    return b >= 0 ? 'positive' : 'negative';
}

function load() {
    store.load(route.params.type, 1);
}

function changePage(p) {
    store.load(route.params.type, p);
}

async function confirmDelete(acc) {
    if (!confirm(`Delete account "${acc.attributes?.name}"?`)) return;
    await notif.wrap(() => store.destroy(acc.id));
}

onMounted(load);
watch(() => route.params.type, load);
</script>

<style scoped>
.view-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
}
.view-title { font-size: 22px; font-weight: 600; display: flex; align-items: center; gap: 10px; }
.view-loading, .view-error { padding: 32px; text-align: center; color: var(--ff-text-muted); }
.view-error { color: #ef4444; }
.ff-card { background: var(--ff-card); border-radius: 12px; padding: 20px; border: 1px solid var(--ff-border); }
.ff-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.ff-table th { text-align: left; padding: 10px 12px; font-weight: 600; border-bottom: 2px solid var(--ff-border); color: var(--ff-text-muted); font-size: 12px; text-transform: uppercase; letter-spacing: .05em; }
.ff-table td { padding: 10px 12px; border-bottom: 1px solid var(--ff-border); }
.ff-table tr:last-child td { border-bottom: none; }
.ff-link { color: var(--ff-sidebar-accent); text-decoration: none; }
.ff-link:hover { text-decoration: underline; }
.text-muted { color: var(--ff-text-muted); }
.positive { color: #22c55e; font-weight: 500; }
.negative { color: #ef4444; font-weight: 500; }
.empty-row { text-align: center; color: var(--ff-text-muted); padding: 32px !important; }
.actions-cell { text-align: right; white-space: nowrap; }
.icon-btn { background: none; border: none; cursor: pointer; color: var(--ff-text-muted); padding: 4px 6px; border-radius: 4px; transition: color .15s; }
.icon-btn:hover { color: #ef4444; }
.ff-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 8px; font-size: 13.5px; font-weight: 500; cursor: pointer; border: none; text-decoration: none; transition: filter .15s; }
.ff-btn:hover { filter: brightness(1.1); }
.ff-btn-primary { background: var(--ff-sidebar-accent); color: #fff; }
.ff-btn-secondary { background: var(--ff-border); color: var(--ff-text); }

.ff-modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.ff-modal { background: var(--ff-card-bg, #fff); border-radius: 12px; padding: 24px; width: 100%; max-width: 420px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
.ff-modal-title { font-size: 18px; font-weight: 600; margin-bottom: 16px; }
.form-row { margin-bottom: 14px; }
.form-label { display: block; font-size: 13px; font-weight: 500; margin-bottom: 4px; color: var(--ff-text-muted); }
.ff-input { width: 100%; padding: 8px 12px; border: 1px solid var(--ff-border); border-radius: 6px; font-size: 14px; background: var(--ff-bg); color: var(--ff-text); }
.ff-modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
</style>

