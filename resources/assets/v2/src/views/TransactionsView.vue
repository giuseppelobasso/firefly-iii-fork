<template>
    <div class="view">
        <div class="view-header">
            <div>
                <h1 class="view-title">
                    <i class="fa-solid fa-arrow-right-arrow-left"></i>
                    {{ typeLabel }} transactions
                </h1>
            </div>
            <div class="view-header-right">
                <RouterLink :to="`/transactions/${route.params.type}/create`" class="ff-btn ff-btn-primary">
                    <i class="fa-solid fa-plus"></i> New transaction
                </RouterLink>
            </div>
        </div>

        <NotificationBar :error="notif.error.value" @close="notif.clear()" />

        <div class="ff-card">
            <!-- Filters -->
            <div class="tx-filters">
                <input type="date" class="ff-input" :value="store.start" @change="store.start = $event.target.value; reload()" />
                <input type="date" class="ff-input" :value="store.end" @change="store.end = $event.target.value; reload()" />
            </div>

            <div v-if="store.loading" class="view-loading"><i class="fa-solid fa-spinner fa-spin"></i> Loading…</div>
            <div v-else-if="store.error" class="view-error">{{ store.error }}</div>
            <table v-else class="ff-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>From / To</th>
                        <th>Amount</th>
                        <th>Category</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="tx in store.list" :key="tx.id">
                        <td class="text-muted nowrap">{{ formatDate(tx.attributes?.transactions?.[0]?.date) }}</td>
                        <td>
                            <RouterLink :to="`/transactions/show/${tx.id}`" class="ff-link">
                                {{ tx.attributes?.transactions?.[0]?.description }}
                            </RouterLink>
                        </td>
                        <td class="text-muted">
                            {{ tx.attributes?.transactions?.[0]?.source_name }}
                            <i class="fa-solid fa-arrow-right" style="font-size:10px; margin: 0 4px;"></i>
                            {{ tx.attributes?.transactions?.[0]?.destination_name }}
                        </td>
                        <td :class="amountClass(tx)">
                            {{ formatMoney(tx.attributes?.transactions?.[0]?.amount, tx.attributes?.transactions?.[0]?.currency_code) }}
                        </td>
                        <td class="text-muted">{{ tx.attributes?.transactions?.[0]?.category_name ?? '—' }}</td>
                        <td class="actions-cell">
                            <button class="icon-btn" title="Delete" @click="confirmDelete(tx)">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                    <tr v-if="!store.list.length">
                        <td colspan="6" class="empty-row">No transactions found.</td>
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
import {computed, onMounted, watch} from 'vue';
import {useRoute, RouterLink} from 'vue-router';
import {useTransactionsStore} from '../stores/transactions.js';
import {usePreferencesStore} from '../stores/preferences.js';
import {useNotifications} from '../composables/useNotifications.js';
import formatMoney from '../util/format-money.js';
import PaginationBar from '../components/ui/PaginationBar.vue';
import NotificationBar from '../components/ui/NotificationBar.vue';

const route = useRoute();
const store = useTransactionsStore();
const prefs = usePreferencesStore();
const notif = useNotifications();

const TYPE_LABELS = {withdrawal: 'Withdrawal', deposit: 'Deposit', transfer: 'Transfer'};
const typeLabel = computed(() => TYPE_LABELS[route.params.type] ?? route.params.type);

function formatDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString();
}

function amountClass(tx) {
    const type = tx.attributes?.transactions?.[0]?.type;
    return type === 'withdrawal' ? 'negative' : type === 'deposit' ? 'positive' : '';
}

function reload() {
    store.load({type: route.params.type, page: 1, start: store.start, end: store.end});
}

function changePage(p) {
    store.load({type: route.params.type, page: p});
}

async function confirmDelete(tx) {
    if (!confirm('Delete this transaction?')) return;
    await notif.wrap(() => store.destroy(tx.id));
}

onMounted(() => {
    store.load({type: route.params.type, page: 1, start: prefs.start, end: prefs.end});
});
watch(() => route.params.type, reload);
</script>

<style scoped>
.view-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.view-header-right { display: flex; gap: 10px; }
.view-title { font-size: 22px; font-weight: 600; display: flex; align-items: center; gap: 10px; }
.view-loading, .view-error { padding: 32px; text-align: center; color: var(--ff-text-muted); }
.view-error { color: #ef4444; }
.ff-card { background: var(--ff-card); border-radius: 12px; padding: 20px; border: 1px solid var(--ff-border); }
.tx-filters { display: flex; gap: 10px; margin-bottom: 16px; }
.ff-input { padding: 7px 12px; border: 1px solid var(--ff-border); border-radius: 8px; background: var(--ff-card); color: var(--ff-text); font-size: 13.5px; outline: none; }
.ff-input:focus { border-color: var(--ff-sidebar-accent); }
.ff-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.ff-table th { text-align: left; padding: 10px 12px; font-weight: 600; border-bottom: 2px solid var(--ff-border); color: var(--ff-text-muted); font-size: 12px; text-transform: uppercase; letter-spacing: .05em; }
.ff-table td { padding: 10px 12px; border-bottom: 1px solid var(--ff-border); }
.ff-table tr:last-child td { border-bottom: none; }
.ff-link { color: var(--ff-sidebar-accent); text-decoration: none; }
.ff-link:hover { text-decoration: underline; }
.text-muted { color: var(--ff-text-muted); }
.nowrap { white-space: nowrap; }
.positive { color: #22c55e; font-weight: 500; }
.negative { color: #ef4444; font-weight: 500; }
.empty-row { text-align: center; color: var(--ff-text-muted); padding: 32px !important; }
.actions-cell { text-align: right; }
.icon-btn { background: none; border: none; cursor: pointer; color: var(--ff-text-muted); padding: 4px 6px; border-radius: 4px; }
.icon-btn:hover { color: #ef4444; }
.ff-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 8px; font-size: 13.5px; font-weight: 500; cursor: pointer; border: none; text-decoration: none; transition: filter .15s; }
.ff-btn:hover { filter: brightness(1.1); }
.ff-btn-primary { background: var(--ff-sidebar-accent); color: #fff; }
</style>

